import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import { buildSessionPlan, createItem, isWork, SCHEMA_VERSION, type PracticeBlock, type PracticeItem } from '../src/domain';
import { RESULT_LABELS } from '../src/domain/labels';
import { hashState } from '../src/domain/canonical';
import {
  connectSync,
  goTo,
  importBackup,
  installFakeGitHub,
  newFakeRemote,
  publishRemote,
  remoteStateText,
  importOutcome,
  openPracticeApp,
  persistedDb,
  persistedUntil,
  readPersistedState,
  reload,
  show,
  writePersistedState,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// The practice-session families, through the REAL mounted screens, in both
// engines, read back from what the app PERSISTED (docs/practice-session-model.md).
// The pure tables are in tests/practice-session-families.test.ts; these prove
// the doors, the controls and the durability the owner actually touches.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-23T09:00:00');
const T = '2026-10-01T09:00:00.000Z';
const ENGINES: Engine[] = ['chromium', 'webkit'];
const SETAR = 'inst-setar';

const WARM = 'it-warm';
const WARM_TITLE = 'سیم‌های دست باز';
const CHAHAR = 'it-chahar';
const CHAHAR_TITLE = 'چهارمضراب ماهور';
const PIECE = 'it-piece';
const PIECE_TITLE = 'Pish-darāmad Shur';
const CLASS_ITEM = 'it-class';
const CLASS_TITLE = 'Reng-e Esfahān';
const FRESH = 'it-fresh';
const FRESH_TITLE = 'Masnavi';
const TWIN = 'twin';
const DUE = 'it-due';

type Db = { items: (PracticeItem & Record<string, unknown>)[]; blocks: (PracticeBlock & Record<string, unknown>)[]; reviews: { id: string; practiceItemId: string; dueDate: string; completedAt?: string }[]; pathwayRoutines: { id: string; name: string; segments: { label: string; minutes: number; itemId?: string }[] }[]; lessons: { id: string; notes?: string }[] };

function fixture(): string {
  const item = (id: string, title: string, over: Record<string, unknown>) => ({
    ...createItem({ instrumentId: SETAR, title, itemType: 'gusheh', status: 'usable' }, new Date(T)),
    id,
    ...over,
  });
  const data = {
    schemaVersion: SCHEMA_VERSION,
    instruments: [
      { id: SETAR, name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T },
      { id: 'inst-tar', name: 'Tar', family: 'Persian', active: true, createdAt: T, updatedAt: T },
    ],
    materials: [],
    items: [
      item(WARM, WARM_TITLE, { itemType: 'technique', difficulty: 2, timesPractised: 6, nextReviewDate: '2026-10-25', nextReviewSource: 'auto', lastPractisedAt: '2026-10-20T09:00:00.000Z' }),
      item(CHAHAR, CHAHAR_TITLE, { itemType: 'full_piece', status: 'fragile', persian: { dastgahAvaz: 'ماهور' } }),
      item(PIECE, PIECE_TITLE, { itemType: 'full_piece', status: 'integrated', srReps: 8, srEase: 2.5, srIntervalDays: 90, nextReviewDate: '2026-12-22', nextReviewSource: 'auto', lastPractisedAt: '2026-10-18T09:00:00.000Z', timesPractised: 30, totalMinutes: 400 }),
      item(CLASS_ITEM, CLASS_TITLE, { itemType: 'full_piece', status: 'integrated', nextReviewDate: '2027-01-21', nextReviewSource: 'user', lastPractisedAt: '2026-10-21T09:00:00.000Z', timesPractised: 12 }),
      item(FRESH, FRESH_TITLE, { status: 'maintenance', srReps: 3, srEase: 2.5, srIntervalDays: 15, nextReviewDate: '2026-11-20', nextReviewSource: 'auto', lastPractisedAt: '2026-10-05T09:00:00.000Z', timesPractised: 9 }),
      item(TWIN, 'Same id as a class', { itemType: 'technique' }),
      item(DUE, 'Bayāt-e Tork', { status: 'maintenance', srReps: 3, srEase: 2.5, srIntervalDays: 15, nextReviewDate: '2026-10-23', nextReviewSource: 'auto', lastPractisedAt: '2026-10-08T09:00:00.000Z', timesPractised: 11 }),
    ],
    blocks: [],
    reviews: [
      { id: 'rev-warm', practiceItemId: WARM, dueDate: '2026-10-25', reviewType: 'retention', createdAt: T, updatedAt: T },
      { id: 'rev-piece', practiceItemId: PIECE, dueDate: '2026-12-22', reviewType: 'integration', createdAt: T, updatedAt: T },
    ],
    pathways: [{ id: 'pw', instrumentId: SETAR, name: 'Radif', order: 0, createdAt: T, updatedAt: T }],
    pathwayStages: [{ id: 'st', pathwayId: 'pw', code: '1A', title: 'Shur', order: 0, createdAt: T, updatedAt: T }],
    pathwayRoutines: [
      {
        id: 'rt-day',
        instrumentId: SETAR,
        name: 'Day warm-up',
        segments: [
          { label: 'Open strings', minutes: 2, itemId: WARM, essential: true },
          { label: 'Mahur phrases', minutes: 4, itemId: CHAHAR },
          { label: 'Breathe', minutes: 1 },
        ],
        order: 0,
        createdAt: T,
        updatedAt: T,
      },
      { id: 'rt-stage', instrumentId: SETAR, pathwayId: 'pw', stageId: 'st', name: 'Stage warm-up', segments: [{ label: 'Tremolo', minutes: 2, itemId: WARM }], order: 1, createdAt: T, updatedAt: T },
      { id: 'rt-path', instrumentId: SETAR, pathwayId: 'pw', name: 'Path warm-up', segments: [{ label: 'Scales', minutes: 3 }], order: 2, createdAt: T, updatedAt: T },
    ],
    attachments: [],
    lessons: [
      { id: 'L-39', instrumentId: SETAR, date: '2026-10-27', number: 39, notes: 'گوشه‌های اصفهان', itemIds: [], recordings: [], createdAt: T, updatedAt: T },
      { id: TWIN, instrumentId: SETAR, date: '2026-10-10', number: 37, notes: 'The class sharing an id with an item', itemIds: [], recordings: [], createdAt: T, updatedAt: T },
    ],
    lessonAgenda: [{ id: 'prep-class', kind: 'preparation', itemId: CLASS_ITEM, instrumentId: SETAR, lessonId: 'L-39', createdAt: T, updatedAt: T }],
    archiveSources: [],
    musicTerms: [],
  };
  return JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data });
}

async function seeded(engine: Engine, viewport = { width: 390, height: 844 }): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine, viewport });
  await importBackup(app, 'practice-session.json', fixture());
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  await goTo(app, '/');
  await app.page.getByRole('navigation', { name: 'Which instrument are you practising?' }).getByRole('button', { name: 'Setar', exact: true }).click();
  return app;
}

const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const itemOf = async (app: PracticeApp, id: string) => (await db(app)).items.find((i) => i.id === id)!;
const blocksOf = (d: Db, ids: string[]) => d.blocks.filter((b) => ids.includes(b.practiceItemId));
const runBlocks = (blocks: PracticeBlock[]) => blocks.map((b) => [b.practiceItemId, b.durationMinutes, b.result, b.scope]).sort();
const notesOf = (app: PracticeApp, id: string, want: string | undefined) =>
  persistedUntil(
    app,
    (s) => (s.state as { db: Db }).db.items.find((i) => i.id === id)?.notes,
    (n) => n === want,
  );
const preview = (page: Page) => page.getByRole('region', { name: 'What this run will contain' });
const covered = (page: Page, scope: 'Whole-item check' | 'Focused work — a part or one aspect') =>
  page.getByRole('group', { name: 'What this block covered' }).getByRole('button', { name: scope, exact: true }).click();

// ---------------------------------------------------------------------------
// ac-1 — a routine records every practised item, with or without feedback
// ---------------------------------------------------------------------------

describe('honest routine runs', () => {
  it('routine completion and history preserve all practised items without feedback', async () => {
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        // --- The owner's two-item Warm up, built through the REAL editor. The
        // second item is bound WITHOUT a label of its own — the shape that
        // used to be dropped on save, so only the first item was ever logged.
        await goTo(app, `/routine/new?instrument=${SETAR}`, { arrival: 'New routine' });
        await page.getByRole('group', { name: 'Name' }).locator('input').fill('Warm up');
        const rows = [
          { label: 'Loosen the right hand', bind: WARM_TITLE },
          { label: '', bind: CHAHAR_TITLE },
          { label: 'Open strings again', bind: WARM_TITLE },
          { label: 'Breathe' },
        ];
        for (const [i, row] of rows.entries()) {
          await page.getByRole('button', { name: 'Add segment' }).click();
          const card = page.locator('.card').filter({ has: page.getByPlaceholder('Segment label') }).nth(i);
          if (row.label) await card.getByPlaceholder('Segment label').fill(row.label);
          await card.getByLabel('Minutes').fill('1');
          if (row.bind) await card.getByLabel('Bind to a practice item (optional)').selectOption({ label: row.bind });
        }
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        const saved = await persistedUntil(
          app,
          (s) => (s.state as { db: Db }).db.pathwayRoutines.find((r) => r.name === 'Warm up'),
          (r) => !!r,
        );
        expect(saved!.segments.map((s) => [s.label, s.itemId, s.minutes]), engine).toEqual([
          ['Loosen the right hand', WARM, 1],
          ['', CHAHAR, 1],
          ['Open strings again', WARM, 1],
          ['Breathe', undefined, 1],
        ]);
        const routineId = saved!.id;
        const before = await db(app);
        const warmBefore = before.items.find((i) => i.id === WARM)!;
        const chaharBefore = before.items.find((i) => i.id === CHAHAR)!;

        // --- NATURAL COMPLETION from Today, feedback omitted, then a reload --
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Start Warm up…' }).click();
        // The bound segment with no label shows its item, not a blank.
        await preview(page).getByText(CHAHAR_TITLE).waitFor();
        await preview(page).getByText('unbound — not logged', { exact: false }).waitFor();
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await page.clock.fastForward(4 * 60_000 + 2_000);
        await page.getByText('Routine complete').waitFor();
        await page.getByText('Saved on this device — no feedback needed.').waitFor();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await reload(app);
        let after = await db(app);
        // BOTH items, one block each, the repeat aggregated, the unbound none.
        expect(runBlocks(blocksOf(after, [WARM, CHAHAR])), engine).toEqual([
          [CHAHAR, 1, 'not_logged', 'focused'],
          [WARM, 2, 'not_logged', 'focused'],
        ]);
        const warm = after.items.find((i) => i.id === WARM)!;
        const chahar = after.items.find((i) => i.id === CHAHAR)!;
        expect([warm.timesPractised, warm.totalMinutes, chahar.timesPractised, chahar.totalMinutes], engine).toEqual([
          warmBefore.timesPractised + 1,
          warmBefore.totalMinutes + 2,
          chaharBefore.timesPractised + 1,
          chaharBefore.totalMinutes + 1,
        ]);
        // No retention judgement: dates, rows, spacing and status stand.
        expect([warm.nextReviewDate, warm.srReps, warm.status, chahar.status], engine).toEqual([warmBefore.nextReviewDate, warmBefore.srReps, 'usable', 'fragile']);
        expect(after.reviews.map((r) => [r.id, r.dueDate, r.completedAt]), engine).toEqual(before.reviews.map((r) => [r.id, r.dueDate, r.completedAt]));
        // Both histories show the practice, honestly unassessed.
        for (const id of [CHAHAR, WARM]) {
          await goTo(app, `/items/${id}`);
          await page.getByText('Practice history').waitFor();
          await page.getByText(RESULT_LABELS.not_logged, { exact: true }).first().waitFor();
          await page.getByText(/focused work/).first().waitFor();
        }

        // --- EARLY FINISH from the bare link, a PARTIAL capture -------------
        await goTo(app, `/routine/${routineId}`);
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await page.clock.fastForward(90_000);
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
        await page.getByRole('group', { name: `Result for ${CHAHAR_TITLE}` }).getByRole('button', { name: RESULT_LABELS.stable_alone, exact: true }).click();
        await page.getByRole('button', { name: 'Save what they showed' }).click();
        await page.getByText('Saved.').waitFor();
        await reload(app);
        after = await db(app);
        // 60 s on the first item, 30 s on the second: one minute each, both kept.
        expect(runBlocks(blocksOf(after, [WARM, CHAHAR]).slice(2)), engine).toEqual([
          [CHAHAR, 1, 'stable_alone', 'focused'],
          [WARM, 1, 'not_logged', 'focused'],
        ]);
        // A capture is evidence, never a retention decision.
        expect([(await itemOf(app, CHAHAR)).status, (await itemOf(app, CHAHAR)).nextReviewDate], engine).toEqual(['fragile', undefined]);

        // --- A FULL capture, with words (the reload left this run's page open) -
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await page.clock.fastForward(4 * 60_000 + 2_000);
        await page.getByText('Routine complete').waitFor();
        await page.getByRole('group', { name: `Result for ${WARM_TITLE}` }).getByRole('button', { name: RESULT_LABELS.same, exact: true }).click();
        await page.getByRole('group', { name: `Result for ${CHAHAR_TITLE}` }).getByRole('button', { name: RESULT_LABELS.slightly_better, exact: true }).click();
        await page.getByRole('textbox', { name: `Observation for ${WARM_TITLE}` }).fill('The left hand relaxed after a minute');
        await page.getByRole('button', { name: 'Save what they showed' }).click();
        await page.getByText('Saved.').waitFor();
        await reload(app);
        after = await db(app);
        expect(runBlocks(blocksOf(after, [WARM, CHAHAR]).slice(4)), engine).toEqual([
          [CHAHAR, 1, 'slightly_better', 'focused'],
          [WARM, 2, 'same', 'focused'],
        ]);
        expect(blocksOf(after, [WARM]).at(-1)!.observation, engine).toBe('The left hand relaxed after a minute');
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);

  // ---------------------------------------------------------------------------
  // ac-3 — what a run will contain, from every door, is the run that starts
  // ---------------------------------------------------------------------------

  it('routine contents and controls describe the exact run started from every doorway', async () => {
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      const activeRoutine = async () =>
        ((await readPersistedState(app)).state as { activeRoutine: { authoredSegments: { label: string; minutes: number }[] } | null }).activeRoutine;
      try {
        // --- TODAY: the card shows the contents; nothing starts on arrival ---
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Start Day warm-up…' }).click();
        await preview(page).getByText('Mahur phrases').waitFor();
        const shown = await preview(page).innerText();
        for (const text of ['Open strings', 'essential', 'Breathe', 'unbound — not logged', WARM_TITLE, CHAHAR_TITLE]) expect(shown, `${engine}: ${text}`).toContain(text);
        expect(await page.locator('main').innerText(), engine).toContain('3 segments · 7 min');
        expect(await activeRoutine(), engine).toBeNull();
        await page.getByRole('link', { name: 'Not now' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- STAGE, PATHWAY and a BARE LINK reach the same preview -----------
        await goTo(app, '/pathway/pw/st');
        await page.locator('article').filter({ hasText: 'Stage warm-up' }).getByRole('button', { name: 'Start…', exact: true }).click();
        await preview(page).getByText('Tremolo').waitFor();
        expect(await activeRoutine(), engine).toBeNull();
        await goTo(app, '/pathway/pw');
        await page.locator('.card').filter({ hasText: 'Path warm-up' }).first().getByRole('button', { name: 'Start…', exact: true }).click();
        await preview(page).getByText('Scales').waitFor();
        // An all-unbound run says so, row by row; removing every row leaves nothing to start.
        await page.getByRole('button', { name: 'Remove from this session: Scales' }).click();
        await page.getByText('Every segment is removed — nothing to run.').waitFor();
        await expect.poll(() => page.getByRole('button', { name: 'Start', exact: true }).isDisabled()).toBe(true);
        await goTo(app, '/routine/rt-day');
        await preview(page).getByText('Mahur phrases').waitFor();
        expect(await activeRoutine(), engine).toBeNull();

        // --- A CHOSEN LENGTH: the fitted contents are shown, and are what runs
        await goTo(app, '/');
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Run it for a different length' }).first().click();
        await page.getByLabel('Minutes to run Day warm-up').fill('14');
        await page.getByRole('button', { name: 'Start…', exact: true }).click();
        await preview(page).getByText('Mahur phrases').waitFor();
        expect(await page.locator('main').innerText(), engine).toContain('fitted to 14 min');
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        expect((await activeRoutine())!.authoredSegments.map((s) => [s.label, s.minutes]), engine).toEqual([
          ['Open strings', 4],
          ['Mahur phrases', 8],
          ['Breathe', 2],
        ]);
        const skip = page.getByRole('button', { name: 'Skip — log nothing for this segment' });
        await skip.click();
        await skip.click();
        await skip.click();
        await page.getByText('Nothing was recorded').waitFor();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- ESSENTIALS ONLY drops the rest and its time, never refits it -----
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Short on time — essentials only' }).click();
        await preview(page).getByText('Open strings').waitFor();
        expect(await page.locator('main').innerText(), engine).toContain('1 segments · 2 min · short on time');
        await page.getByRole('link', { name: 'Not now' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- REMOVE before start: the shorter run is the one started ----------
        await goTo(app, '/routine/rt-day');
        const remove = page.getByRole('button', { name: 'Remove from this session: Mahur phrases' });
        // A phone-sized control.
        expect((await remove.boundingBox())!.height, engine).toBeGreaterThanOrEqual(44);
        await remove.click();
        await page.getByText('4 min removed, left unused', { exact: false }).waitFor();
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        expect((await activeRoutine())!.authoredSegments.map((s) => [s.label, s.minutes]), engine).toEqual([
          ['Open strings', 2],
          ['Breathe', 1],
        ]);

        // --- WHILE RUNNING: the full frozen list, with states -----------------
        await page.locator('summary', { hasText: 'Run contents' }).click();
        const contents = page.getByRole('region', { name: 'Run contents' });
        await contents.getByText('· now', { exact: false }).waitFor();
        await page.getByRole('button', { name: 'Remove from this run: Breathe' }).click();
        await contents.getByText('· skipped', { exact: false }).waitFor();
        // Editing the SAVED routine mid-run never shifts the run's identities.
        await goTo(app, '/routine/rt-day/edit', { arrival: 'Edit routine' });
        await page.getByPlaceholder('Segment label').first().fill('Renamed in the editor');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await page.getByRole('button', { name: /Resume your routine/ }).click();
        await page.locator('summary', { hasText: 'Run contents' }).click();
        await page.getByRole('region', { name: 'Run contents' }).getByText('Open strings').waitFor();
        expect((await activeRoutine())!.authoredSegments[0].label, engine).toBe('Open strings');
        const saved = (await db(app)).pathwayRoutines.find((r) => r.id === 'rt-day')!;
        // The run's controls never edited the saved routine, nor deleted an item.
        expect(saved.segments.map((s) => s.label), engine).toEqual(['Renamed in the editor', 'Mahur phrases', 'Breathe']);
        expect((await db(app)).items.map((i) => i.id).sort(), engine).toEqual([CHAHAR, CLASS_ITEM, FRESH, PIECE, WARM, TWIN, DUE].sort());
        // Skip the current segment after 40 s: nothing is recorded for it.
        await page.clock.fastForward(40_000);
        await page.getByRole('button', { name: 'Skip — log nothing for this segment' }).click();
        await page.getByText('Routine complete').waitFor();
        await page.getByText('Nothing was recorded').waitFor();
        expect(blocksOf(await db(app), [WARM, CHAHAR]), engine).toEqual([]);
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-5 — reorder the Session Plan, and one control policy across Plan and Routine
// ---------------------------------------------------------------------------

/** The preview's segment rows, top to bottom: each row's title line. */
const planRows = (page: Page) => page.locator('.list-row').filter({ has: page.getByRole('button', { name: /^Swap / }) });
const titlesOf = async (page: Page) => (await planRows(page).allInnerTexts()).map((t) => t.split('\n').find((line) => [WARM_TITLE, CHAHAR_TITLE, PIECE_TITLE, CLASS_TITLE, FRESH_TITLE, 'Same id as a class', 'Bayāt-e Tork'].includes(line.trim()))!.trim());
const minutesOf = async (page: Page) => (await planRows(page).allInnerTexts()).map((t) => Number(/(\d+) min/.exec(t)![1]));

describe('plan and routine controls', () => {
  it('session plan move controls work by keyboard and touch without losing the draft', async () => {
    for (const engine of ENGINES) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
        const where = `${engine} ${viewport.width}px`;
        const app = await seeded(engine, viewport);
        const { page } = app;
        try {
          await goTo(app, '/plan?minutes=45');
          await page.getByRole('button', { name: 'Start plan' }).waitFor();
          const order = await titlesOf(page);
          const minutes = await minutesOf(page);
          expect(order.length, where).toBeGreaterThanOrEqual(4);

          // KEYBOARD: focus the second row's "earlier" and press Enter; the
          // whole segment moves, and focus stays on a move control for it.
          const second = page.getByRole('button', { name: `Move ${order[1]} earlier` });
          expect((await second.boundingBox())!.height, where).toBeGreaterThanOrEqual(44);
          await second.focus();
          await page.keyboard.press('Enter');
          await planRows(page).first().getByText(order[1], { exact: true }).waitFor();
          expect(await titlesOf(page), where).toEqual([order[1], order[0], ...order.slice(2)]);
          expect(await minutesOf(page), where).toEqual([minutes[1], minutes[0], ...minutes.slice(2)]);
          // At the top its own "earlier" disables, so focus moves to its "later".
          await page.getByRole('button', { name: `Move ${order[1]} later` }).and(page.locator(':focus')).waitFor();
          // POINTER: the last row moves up one.
          const afterKeys = [order[1], order[0], ...order.slice(2)];
          await page.getByRole('button', { name: `Move ${afterKeys.at(-1)} earlier` }).click();
          const moved = [...afterKeys.slice(0, -2), afterKeys.at(-1)!, afterKeys.at(-2)!];
          await planRows(page).last().getByText(afterKeys.at(-2)!, { exact: true }).waitFor();
          expect(await titlesOf(page), where).toEqual(moved);

          // REMOVE leaves the rest exactly as they were; the time is unused.
          const removedTitle = moved.at(-1)!;
          const keptMinutes = (await minutesOf(page)).slice(0, -1);
          await page.getByRole('button', { name: `Remove ${removedTitle} from the plan` }).click();
          await page.getByText(/^Unused of your 45 min/).waitFor();
          expect(await minutesOf(page), where).toEqual(keptMinutes);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), where).toBe(true);

          // START runs the owner's order.
          await page.getByRole('button', { name: 'Start plan' }).click();
          await page.getByRole('button', { name: `Start ${moved[0]}` }).click();
          await page.getByRole('heading', { level: 1, name: moved[0] }).waitFor();
          // Move on, keeping what was practised: Finish → Close → Save.
          await page.clock.fastForward(60_000);
          await page.getByRole('button', { name: 'Finish' }).click();
          await page.getByRole('button', { name: 'Save without a result' }).click();
          await page.getByRole('button', { name: `Start ${moved[1]}` }).waitFor();
          // Finishing early frees the rest of that target as UNUSED: 1′ of
          // keptMinutes[0] taken, the others still ask for theirs.
          const left = keptMinutes.slice(1).reduce((n, m) => n + m, 0);
          expect(await page.locator('main').innerText(), where).toContain(
            `${left} min left of ${left + 1} planned · ${45 - left - 1} of 45 unused · 1 min recorded`,
          );
          // Skip a LATER pending entry: it records nothing; the rest keep their minutes.
          const running = moved.slice(0, -1);
          await page.getByRole('button', { name: `Skip ${running.at(-1)}` }).click();
          await page.getByText('skipped', { exact: true }).waitFor();
          // The current one, started then skipped WITHOUT saving after real time.
          await page.getByRole('button', { name: `Start ${moved[1]}` }).click();
          await page.clock.fastForward(120_000);
          await page.getByRole('button', { name: 'Skip this one — save nothing' }).click();
          await page.getByRole('button', { name: 'End the plan' }).waitFor();
          expect((await db(app)).blocks.map((b) => [b.practiceItemId, b.durationMinutes]), where).toEqual([[await idOf(app, moved[0]), 1]]);
          await page.getByRole('button', { name: 'End the plan' }).click();
          await page.getByRole('navigation', { name: 'Primary' }).waitFor();

          // --- THE SAME WORDS IN A ROUTINE ---------------------------------
          await goTo(app, '/routine/rt-day');
          await page.getByRole('button', { name: 'Remove from this session: Breathe' }).click();
          await page.getByRole('button', { name: 'Start', exact: true }).click();
          await page.getByRole('button', { name: 'Pause' }).waitFor();
          // Move on after 30 s keeps those 30 s; the piece's target is unchanged.
          await page.clock.fastForward(30_000);
          await page.getByRole('button', { name: 'Move on — keep the time practised' }).click();
          await page.locator('summary', { hasText: 'Run contents' }).click();
          await page.getByRole('region', { name: 'Run contents' }).getByText('· moved on', { exact: false }).waitFor();
          expect(await page.locator('summary', { hasText: 'Run contents' }).innerText(), where).toContain('4 of 6 min left');
          await page.getByRole('button', { name: 'Finish & save' }).click();
          await page.getByText('Routine complete').waitFor();
          await page.getByRole('button', { name: 'Back', exact: true }).click();
          expect(runBlocks(blocksOf(await db(app), [WARM])), where).toEqual([[WARM, 1, 'not_logged', 'focused']]);

          // --- REGENERATE is the deliberate reallocation; a passed day is said
          await goTo(app, '/plan?minutes=30');
          const fresh = await titlesOf(page);
          await page.getByRole('button', { name: `Move ${fresh[1]} earlier` }).click();
          await page.clock.setFixedTime(new Date('2026-10-24T09:00:00'));
          await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
          await page.getByText(/plan was built for a day that has passed/).waitFor();
          await expect.poll(() => page.getByRole('button', { name: 'Start plan' }).isDisabled()).toBe(true);
          // The owner's order is still the one shown — never silently re-sorted.
          expect(await titlesOf(page), where).toEqual([fresh[1], fresh[0], ...fresh.slice(2)]);
          await page.getByRole('button', { name: 'Regenerate' }).click();
          await expect.poll(() => page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
  }, 900_000);
});

async function idOf(app: PracticeApp, title: string): Promise<string> {
  return (await db(app)).items.find((i) => i.title === title)!.id;
}

// ---------------------------------------------------------------------------
// ac-6 / ac-7 — notes never depend on Done
// ---------------------------------------------------------------------------

const notesBox = (page: Page, label = 'Working notes') => page.getByRole('textbox', { name: label, exact: true });

/** Open the editor where the notes are already shown (an item's own page). */
const editShownNotes = (page: Page) => page.getByRole('button', { name: 'Edit Working notes' }).click();

/** Open the editor where the notes start collapsed (while practising). */
async function editCollapsedNotes(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Show Working notes' }).click();
  await page.getByRole('button', { name: 'Edit Working notes' }).click();
}

/** Make the real IndexedDB `put` throw, as a full device would. */
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

/** Hold a real readwrite transaction on `kv`, so the app's next write genuinely waits. */
async function holdStorage(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const dbh = req.result;
          const store = dbh.transaction('kv', 'readwrite').objectStore('kv');
          const w = window as unknown as { __releaseStorage?: boolean };
          w.__releaseStorage = false;
          const spin = () => {
            if (w.__releaseStorage) {
              dbh.close();
              return;
            }
            store.get('practice-compass').onsuccess = spin;
          };
          spin();
          resolve();
        };
      }),
  );
}

async function releaseStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __releaseStorage?: boolean }).__releaseStorage = true;
  });
}

describe('notes without a Done dependency', () => {
  it('working note drafts survive exits boundaries and reload without Done', async () => {
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        const factsBefore = await db(app);
        // --- ITEM DETAIL: type, then leave at once — no Done, no quiet interval
        await goTo(app, `/items/${PIECE}`);
        await editShownNotes(page);
        await notesBox(page).fill('typed, then straight to another tab');
        await goTo(app, '/repertoire');
        await notesOf(app, PIECE, 'typed, then straight to another tab');

        // --- COLLAPSING writes what was typed --------------------------------
        await goTo(app, `/items/${PIECE}`);
        await editShownNotes(page);
        await notesBox(page).fill('typed, then the notes were collapsed');
        await page.getByRole('button', { name: 'Hide Working notes' }).click();
        await notesOf(app, PIECE, 'typed, then the notes were collapsed');

        // --- AUTOSAVE after a quiet moment, with Farsi composed text ---------
        await page.getByRole('button', { name: 'Show Working notes' }).click();
        await page.getByRole('button', { name: 'Edit Working notes' }).click();
        await notesBox(page).fill('');
        await notesBox(page).focus();
        await page.keyboard.insertText('فرود را آهسته بگیر');
        await page.clock.runFor(1_000);
        await page.getByText('Saved.').waitFor();
        // The caret stayed where the owner was typing while the save landed.
        await page.keyboard.type(' — ok');
        expect(await notesBox(page).inputValue(), engine).toBe('فرود را آهسته بگیر — ok');
        await page.clock.runFor(1_000);
        await notesOf(app, PIECE, 'فرود را آهسته بگیر — ok');

        // --- CHANGING ITEM by route: A's words go to A; B opens clean --------
        await notesBox(page).fill('for the piece, typed as I switched');
        await goTo(app, `/items/${CHAHAR}`);
        await notesOf(app, PIECE, 'for the piece, typed as I switched');
        await editShownNotes(page);
        expect(await notesBox(page).inputValue(), engine).toBe('');
        await page.getByRole('button', { name: 'Done editing Working notes' }).click();

        // --- ACTIVE BLOCK: type, then Finish ---------------------------------
        await page.getByRole('button', { name: 'Start a block' }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await editCollapsedNotes(page);
        await notesBox(page).fill('noticed mid-block, never pressed Done');
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Save without a result' }).waitFor();
        await notesOf(app, CHAHAR, 'noticed mid-block, never pressed Done');
        await page.getByRole('button', { name: 'Save without a result' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- A ROUTINE BOUNDARY: the warm segment's words stay the warm item's
        await goTo(app, '/routine/rt-day');
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await editCollapsedNotes(page);
        await notesBox(page).fill('typed during open strings');
        await page.clock.fastForward(125_000);
        await page.getByText('Mahur phrases').first().waitFor();
        await notesOf(app, WARM, 'typed during open strings');
        await editCollapsedNotes(page);
        expect(await notesBox(page).inputValue(), engine).toBe('noticed mid-block, never pressed Done');
        await page.getByRole('button', { name: 'Done editing Working notes' }).click();
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- A LESSON's notes use the same editor and the same rule -----------
        await goTo(app, '/lessons');
        // The upcoming class opens by itself.
        const card = page.getByRole('article').filter({ hasText: 'Class 39' });
        await card.getByRole('button', { name: 'Edit Class notes' }).click();
        await card.getByRole('textbox', { name: 'Class notes' }).fill('بپرس: شاهد اصفهان کجاست؟');
        await goTo(app, '/');
        await persistedUntil(
          app,
          (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === 'L-39')?.notes,
          (n) => n === 'بپرس: شاهد اصفهان کجاست؟',
        );

        // --- AN ORDINARY RELOAD before anything was written ------------------
        await goTo(app, `/items/${FRESH}`);
        await editShownNotes(page);
        await notesBox(page).fill('typed, then the page reloaded');
        await reload(app);
        await notesOf(app, FRESH, 'typed, then the page reloaded');
        // …and clearing to empty is a real write, by the same rules.
        await editShownNotes(page);
        await notesBox(page).fill('');
        await goTo(app, '/repertoire');
        await notesOf(app, FRESH, undefined);

        // Notes changed no practice fact and no clock.
        const after = await db(app);
        for (const id of [PIECE, WARM, FRESH]) {
          const was = factsBefore.items.find((i) => i.id === id)!;
          const now = after.items.find((i) => i.id === id)!;
          expect([now.nextReviewDate, now.srReps, now.status, now.lastResult], `${engine} ${id}`).toEqual([was.nextReviewDate, was.srReps, was.status, was.lastResult]);
        }
        expect(((await readPersistedState(app)).state as { active: unknown; activeRoutine: unknown }).active, engine).toBeNull();
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);

  it('working note saves preserve newest text and refuse stale ownership across failures and replacement', async () => {
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        // --- A REFUSED write is never called saved; newer words win the retry
        await goTo(app, `/items/${PIECE}`);
        await editShownNotes(page);
        await breakStorage(page);
        await notesBox(page).fill('the words the device refused');
        await page.clock.runFor(1_000);
        await page.getByText(/Not saved/).waitFor();
        await expect.poll(() => page.getByRole('button', { name: 'Copy the text' }).isVisible()).toBe(true);
        await notesBox(page).fill('the words typed after the refusal');
        await repairStorage(page);
        await page.getByRole('button', { name: 'Try again' }).click();
        await page.getByText('Saved.').waitFor();
        await notesOf(app, PIECE, 'the words typed after the refusal');

        // --- A DELAYED write: typing on while it is held, newest wins ---------
        await holdStorage(page);
        await notesBox(page).fill('first, while storage is slow');
        await page.clock.runFor(1_000);
        await page.getByText('Saving…').waitFor();
        await notesBox(page).fill('first, while storage is slow — and more while it waited');
        await releaseStorage(page);
        await page.clock.runFor(1_000);
        await page.getByText('Saved.').waitFor();
        await notesOf(app, PIECE, 'first, while storage is slow — and more while it waited');

        // --- RAPID EXIT before the quiet interval, while a write is refused ----
        // The canonical write fails, so only the device copy holds the words;
        // a later reload replays them through the same decision.
        await breakStorage(page);
        await notesBox(page).fill('typed and left before anything saved');
        await goTo(app, '/repertoire');
        await repairStorage(page);
        await reload(app);
        await notesOf(app, PIECE, 'typed and left before anything saved');

        // --- AN ITEM AND A CLASS SHARING ONE ID are two notebooks -------------
        await goTo(app, `/items/${TWIN}`);
        await editShownNotes(page);
        await notesBox(page).fill('the technique item’s notebook');
        await goTo(app, '/lessons');
        // A past class with notes opens on a tap of its header.
        const twinCard = page.getByRole('article').filter({ hasText: 'Class 37' });
        await twinCard.getByRole('button', { name: /Class 37/ }).first().click();
        await twinCard.getByRole('button', { name: 'Edit Class notes' }).click();
        expect(await twinCard.getByRole('textbox', { name: 'Class notes' }).inputValue(), engine).toBe('The class sharing an id with an item');
        await twinCard.getByRole('textbox', { name: 'Class notes' }).fill('the class’s own notes');
        await goTo(app, '/repertoire');
        await notesOf(app, TWIN, 'the technique item’s notebook');
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes, (n) => n === 'the class’s own notes');

        // --- REPLACED UNDERNEATH (a sync or import while words were unwritten):
        // both texts are kept, the stored one first — never one over the other.
        await goTo(app, `/items/${CHAHAR}`);
        await editShownNotes(page);
        await breakStorage(page);
        await notesBox(page).fill('my words, typed before the other device synced');
        await goTo(app, '/repertoire');
        await repairStorage(page);
        const replaced = (await readPersistedState(app)).state as { db: Db };
        await writePersistedState(
          app,
          { ...replaced, db: { ...replaced.db, items: replaced.db.items.map((i) => (i.id === CHAHAR ? { ...i, notes: 'their words, from the other device' } : i)) } },
          SCHEMA_VERSION,
        );
        await reload(app);
        await notesOf(app, CHAHAR, 'their words, from the other device\n\n— Also typed on this device (kept, not merged) —\nmy words, typed before the other device synced');

        // --- A DELETED record is never brought back by an old draft -----------
        await goTo(app, `/items/${FRESH}`);
        await editShownNotes(page);
        await breakStorage(page);
        await notesBox(page).fill('typed for an item that is about to be deleted');
        await goTo(app, '/repertoire');
        await repairStorage(page);
        const beforeDelete = (await readPersistedState(app)).state as { db: Db };
        await writePersistedState(app, { ...beforeDelete, db: { ...beforeDelete.db, items: beforeDelete.db.items.filter((i) => i.id !== FRESH) } }, SCHEMA_VERSION);
        await reload(app);
        expect((await db(app)).items.map((i) => i.id).sort(), engine).toEqual([CHAHAR, CLASS_ITEM, PIECE, WARM, TWIN, DUE].sort());

        // --- PULLED UNDERNEATH A LIVE EDITOR, the kept-both write refused ------
        // A sync (the device coming back online) replaces the record while the
        // words are still unwritten; the kept-both write is then refused. Both
        // texts survive exactly ONCE — after Try again (item) and after a
        // reload with more typed and no retry (class) — never the old draft
        // replayed a second time on top of them.
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        const pullUnderneath = async (change: (d: Db) => Db, landed: () => Promise<unknown>) => {
          const theirs = change((await persistedDb(app)) as unknown as Db);
          publishRemote(remote, remoteStateText(theirs), await hashState(theirs), 60 + remote.calls.length);
          await page.evaluate(() => window.dispatchEvent(new Event('online')));
          await landed();
        };
        const kept = (theirs: string, mine: string) => `${theirs}\n\n— Also typed on this device (kept, not merged) —\n${mine}`;
        const heldDrafts = () => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('pc-note-draft:')));

        await goTo(app, `/items/${WARM}`);
        await editShownNotes(page);
        await notesBox(page).fill('my words, while the other device synced');
        await pullUnderneath(
          (d) => ({ ...d, items: d.items.map((i) => (i.id === WARM ? { ...i, notes: 'their words, pulled while I typed' } : i)) }),
          () => notesOf(app, WARM, 'their words, pulled while I typed'),
        );
        await breakStorage(page);
        await page.clock.runFor(1_000);
        await page.getByText(/Not saved/).waitFor();
        await repairStorage(page);
        await page.getByRole('button', { name: 'Try again' }).click();
        await page.getByText('Saved.').waitFor();
        // (The deleted record's draft above stays on the device, recreating nothing.)
        expect(await heldDrafts(), engine).toEqual([`pc-note-draft:item:${FRESH}`]);
        await reload(app);
        await notesOf(app, WARM, kept('their words, pulled while I typed', 'my words, while the other device synced'));

        await goTo(app, '/lessons');
        const classCard = page.getByRole('article').filter({ hasText: 'Class 37' });
        await classCard.getByRole('button', { name: /Class 37/ }).first().click();
        await classCard.getByRole('button', { name: 'Edit Class notes' }).click();
        const classBox = classCard.getByRole('textbox', { name: 'Class notes' });
        await classBox.fill('my class words');
        await pullUnderneath(
          (d) => ({ ...d, lessons: d.lessons.map((l) => (l.id === TWIN ? { ...l, notes: 'their class words' } : l)) }),
          () => persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes, (n) => n === 'their class words'),
        );
        await breakStorage(page);
        await page.clock.runFor(1_000);
        await classCard.getByText(/Not saved/).waitFor();
        expect(await classBox.inputValue(), engine).toBe(kept('their class words', 'my class words'));
        await classBox.fill(`${kept('their class words', 'my class words')} — and more`);
        await repairStorage(page);
        await reload(app);
        await persistedUntil(
          app,
          (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes,
          (n) => n === kept('their class words', 'my class words — and more'),
        );
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-11 — the close screen separates scope, readiness and next practice
// ---------------------------------------------------------------------------

async function practiseToClose(app: PracticeApp, itemId: string): Promise<void> {
  await show(app, `/items/${itemId}`);
  await app.page.getByRole('button', { name: 'Start a block' }).click();
  await app.page.getByRole('button', { name: 'Finish' }).click();
  await app.page.getByRole('button', { name: 'Save without a result' }).waitFor();
}

describe('the close and review screens', () => {
  it('close and review screens explain scope readiness and next practice with the date actually saved', async () => {
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      const line = () => page.locator('.card').filter({ has: page.getByRole('button', { name: 'Change', exact: true }) }).first().innerText();
      try {
        // --- FOCUSED chunk success on a long-history unfinished piece --------
        await practiseToClose(app, PIECE);
        await page.getByRole('button', { name: RESULT_LABELS.stable_in_context, exact: true }).click();
        await expect.poll(line).toContain('Working on this: back in 3 days.');
        // Focused is the default, and offers no readiness promotion.
        expect(await page.getByRole('group', { name: 'What this block covered' }).getByRole('button', { name: 'Focused work — a part or one aspect' }).getAttribute('aria-pressed'), engine).toBe('true');
        await page.getByRole('button', { name: 'Change', exact: true }).click();
        const shown = await page.getByLabel('Next review date').inputValue();
        expect(shown, engine).toBe('2026-10-26');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        let piece = await itemOf(app, PIECE);
        expect([piece.nextReviewDate, piece.srReps, piece.status, piece.returnIntent], engine).toEqual([shown, 8, 'integrated', undefined]);
        expect((await db(app)).blocks.at(-1)!.scope, engine).toBe('focused');

        // --- `Same` holds the short return, never a 90-day gap ----------------
        await practiseToClose(app, PIECE);
        await page.getByRole('button', { name: RESULT_LABELS.same, exact: true }).click();
        await expect.poll(line).toContain('Working on this: back in 1 day.');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect((await itemOf(app, PIECE)).nextReviewDate, engine).toBe('2026-10-24');

        // --- An explicit WHOLE check and a deliberate readiness decision ------
        await practiseToClose(app, PIECE);
        await covered(page, 'Whole-item check');
        await page.getByRole('button', { name: RESULT_LABELS.stable_in_context, exact: true }).click();
        // Offered, never pre-selected …
        await page.getByRole('button', { name: 'Keep it fresh' }).click();
        // … and the same decision now speaks for a kept-fresh item: practice
        // before its check keeps the date, and spacing does not move.
        await expect.poll(line).toContain('Not due yet — today counts as extra practice and the date stands.');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        piece = await itemOf(app, PIECE);
        expect([piece.returnIntent, piece.nextReviewDate, piece.srReps], engine).toEqual(['keep_fresh', '2026-10-24', 8]);
        expect((await db(app)).blocks.at(-1)!.scope, engine).toBe('whole');
        // History keeps what each block covered.
        await goTo(app, `/items/${PIECE}`);
        await page.getByText(/whole-item check/).first().waitFor();
        await page.getByText(/focused work/).first().waitFor();
        await page.getByRole('region', { name: 'Next practice' }).getByText('Keep fresh — whole-item check on 2026-10-24.', { exact: false }).waitFor();

        // --- A DUE whole-item check keeps honest spaced progression -----------
        await practiseToClose(app, DUE);
        await covered(page, 'Whole-item check');
        await page.getByRole('button', { name: RESULT_LABELS.stable_in_context, exact: true }).click();
        // round(15 × 2.5) = 38 days.
        await expect.poll(line).toContain('Spaced repetition: 4 good reviews → 38 days.');
        // The explanation in place is the one this decision follows.
        await page.getByRole('button', { name: 'Change', exact: true }).click();
        await page.locator('summary', { hasText: 'Why this date?' }).click();
        await page.locator('details[open]', { hasText: 'When it comes back' }).getByText('Keep fresh', { exact: false }).first().waitFor();
        expect(await page.getByLabel('Next review date').inputValue(), engine).toBe('2026-11-30');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        const due = await itemOf(app, DUE);
        expect([due.nextReviewDate, due.srReps, due.srLastProgressDay], engine).toEqual(['2026-11-30', 4, '2026-10-23']);
        // Focused work on a kept-fresh item never moves its check.
        await practiseToClose(app, FRESH);
        await page.getByRole('button', { name: RESULT_LABELS.performable, exact: true }).click();
        await expect.poll(line).toContain('Focused practice — the whole-item check stays as scheduled.');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect([(await itemOf(app, FRESH)).nextReviewDate, (await itemOf(app, FRESH)).srReps, (await itemOf(app, FRESH)).status], engine).toEqual(['2026-11-20', 3, 'maintenance']);

        // --- CLASS PREPARATION beside a protected, months-away date ----------
        await practiseToClose(app, CLASS_ITEM);
        await page.getByRole('button', { name: RESULT_LABELS.slightly_better, exact: true }).click();
        await expect.poll(line).toContain('Class preparation — for your class on 2026-10-27 (4 days away); back tomorrow.');
        expect(await line(), engine).toContain('Review date 2027-01-21 stays as it is (your date).');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect([(await itemOf(app, CLASS_ITEM)).nextReviewDate, (await itemOf(app, CLASS_ITEM)).nextReviewSource], engine).toEqual(['2027-01-21', 'user']);
        await goTo(app, `/items/${CLASS_ITEM}`);
        await page.getByRole('region', { name: 'Next practice' }).getByText('Class preparation', { exact: false }).waitFor();

        // --- A typed correction is the owner's; no result changes nothing -----
        await practiseToClose(app, CHAHAR);
        await page.getByRole('button', { name: RESULT_LABELS.worse, exact: true }).click();
        await page.getByRole('button', { name: 'Change', exact: true }).click();
        await page.getByLabel('Next review date').fill('2026-11-02');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect([(await itemOf(app, CHAHAR)).nextReviewDate, (await itemOf(app, CHAHAR)).nextReviewSource], engine).toEqual(['2026-11-02', 'user']);
        await practiseToClose(app, CHAHAR);
        await page.getByRole('button', { name: 'Save without a result' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect((await itemOf(app, CHAHAR)).nextReviewDate, engine).toBe('2026-11-02');
        expect([(await db(app)).blocks.at(-1)!.result, (await db(app)).blocks.at(-1)!.scope], engine).toEqual(['not_logged', 'focused']);

        // --- BACK keeps scope and result; local midnight re-decides visibly ---
        await practiseToClose(app, WARM);
        await covered(page, 'Whole-item check');
        await page.getByRole('button', { name: RESULT_LABELS.stable_alone, exact: true }).click();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await page.getByRole('button', { name: 'Finish' }).click();
        expect(await page.getByRole('group', { name: 'What this block covered' }).getByRole('button', { name: 'Whole-item check' }).getAttribute('aria-pressed'), engine).toBe('true');
        expect(await page.getByRole('button', { name: RESULT_LABELS.stable_alone, exact: true }).getAttribute('aria-pressed'), engine).toBe('true');
        await page.getByRole('button', { name: 'Change', exact: true }).click();
        const beforeMidnight = await page.getByLabel('Next review date').inputValue();
        // Working, stable alone: back in 2 days — from the day it actually is.
        expect(beforeMidnight, engine).toBe('2026-10-25');
        await page.clock.setFixedTime(new Date('2026-10-24T00:20:00'));
        await page.getByRole('button', { name: 'Save block' }).click();
        await expect.poll(() => page.getByLabel('Next review date').inputValue()).toBe('2026-10-26');
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect((await itemOf(app, WARM)).nextReviewDate, engine).toBe('2026-10-26');
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-12 — theory and listening study is ordinary practice
// ---------------------------------------------------------------------------

describe('theory study', () => {
  it('theory study uses ordinary practice items and earns bounded non urgent opportunities', async () => {
    // --- The bounded opportunity, over a fixed multi-session library ------------
    const NOW = new Date('2026-10-23T12:00:00.000Z');
    const base = (id: string, title: string, over: Partial<PracticeItem>): PracticeItem => ({
      ...createItem({ instrumentId: SETAR, title, itemType: 'gusheh', status: 'usable', importance: 3, difficulty: 3 }, new Date('2026-09-01T12:00:00.000Z')),
      id,
      lastPractisedAt: '2026-10-20T12:00:00.000Z',
      ...over,
    });
    const theory = base('theory', 'نقش نت‌ها در شور', { itemType: 'other', strand: 'reading_theory', importance: 2, persian: { dastgahAvaz: 'شور' }, lastPractisedAt: undefined });
    const library = [
      base('a', 'Darāmad', { importance: 4 }),
      base('b', 'Kereshme', { itemType: 'technique', difficulty: 2, timesPractised: 6 }),
      base('c', 'Chahār-mezrāb', { itemType: 'full_piece', importance: 4 }),
      base('d', 'Shahnāz', {}),
      theory,
    ];
    const plan = (items: PracticeItem[], blocks: PracticeBlock[] = [], minutes = 45, now = NOW, prep = new Map<string, string>()) =>
      buildSessionPlan({ instrumentId: SETAR, budgetMinutes: minutes, now, items, blocks, reviews: [], preparationDates: prep });
    // Never studied, urgent work seated, room left: it gets a turn — as a study task, not a work.
    const day1 = plan(library);
    const study = day1.segments.find((s) => s.itemId === 'theory');
    expect(study?.reason).toBe('Study time — it has not had a turn for a few days, and the urgent work is already in.');
    expect(study!.floorMinutes).toBe(2);
    expect(isWork(theory)).toBe(false);
    // Practised: it steps back for the next few days …
    const studied: PracticeBlock = { id: 'tb', practiceItemId: 'theory', instrumentId: SETAR, startedAt: '2026-10-23T08:00:00.000Z', durationMinutes: 8, mode: 'explore', focus: 'other', result: 'not_logged', scope: 'focused', createdReview: false, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() };
    const practisedTheory = { ...theory, lastPractisedAt: studied.startedAt };
    const day3 = new Date('2026-10-25T12:00:00.000Z');
    expect(plan(library.map((i) => (i.id === 'theory' ? practisedTheory : i)), [studied], 45, day3).segments.find((s) => s.itemId === 'theory')?.reason).not.toBe(study!.reason);
    // … and earns a turn again once the gap has passed.
    const day7 = new Date('2026-10-27T12:00:00.000Z');
    expect(plan(library.map((i) => (i.id === 'theory' ? practisedTheory : i)), [studied], 45, day7).segments.find((s) => s.itemId === 'theory')?.reason).toBe(study!.reason);
    // Never the anchor of a short session, and never ahead of an imminent class.
    expect(plan(library, [], 10).segments.map((s) => s.itemId)).not.toContain('theory');
    const classDay = plan(library, [], 20, NOW, new Map([['d', '2026-10-24']]));
    expect(classDay.segments.find((s) => s.bucket === 'lesson')?.itemId).toBe('d');
    expect(classDay.segments.map((s) => s.itemId)).not.toContain('theory');
    // Absent, resting or on another instrument: no filler in its place.
    expect(plan(library.filter((i) => i.id !== 'theory')).segments.some((s) => s.reason.startsWith('Study time'))).toBe(false);
    expect(plan(library.map((i) => (i.id === 'theory' ? { ...i, status: 'dormant' as const } : i))).segments.map((s) => s.itemId)).not.toContain('theory');
    expect(plan(library.map((i) => (i.id === 'theory' ? { ...i, instrumentId: 'inst-tar' } : i))).segments.map((s) => s.itemId)).not.toContain('theory');

    // --- Created and practised through the ordinary doors ------------------------
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        const itemsBefore = (await db(app)).items.length;
        // A prompt about the item's own dastgāh pre-fills Add practice item;
        // nothing exists until it is saved.
        await goTo(app, `/items/${CHAHAR}`);
        await page.locator('summary', { hasText: 'Study ideas (optional)' }).click();
        await page.getByRole('link', { name: 'مقایسهٔ جمله‌های ماهور' }).click();
        await page.getByRole('heading', { level: 1, name: 'Add practice item' }).waitFor();
        expect((await db(app)).items.length, engine).toBe(itemsBefore);
        expect(await page.getByRole('group', { name: 'Kind of practice item' }).getByRole('button', { name: 'Theory / listening study' }).getAttribute('aria-pressed'), engine).toBe('true');
        expect(await page.getByRole('textbox', { name: 'Title' }).inputValue(), engine).toBe('مقایسهٔ جمله‌های ماهور');
        await page.getByRole('button', { name: 'Add practice item' }).click();
        const created = await persistedUntil(
          app,
          (s) => (s.state as { db: Db }).db.items.find((i) => i.title === 'مقایسهٔ جمله‌های ماهور'),
          (i) => !!i,
        );
        expect([created!.strand, created!.itemType, created!.instrumentId], engine).toEqual(['reading_theory', 'other', SETAR]);
        // Title only, through the same full Add path.
        await goTo(app, '/items/new');
        await page.getByRole('group', { name: 'Kind of practice item' }).getByRole('button', { name: 'Theory / listening study' }).click();
        await page.getByRole('textbox', { name: 'Title' }).fill('Listen to the teacher’s Radif recording');
        await page.getByRole('button', { name: 'Add practice item' }).click();
        const listening = await persistedUntil(
          app,
          (s) => (s.state as { db: Db }).db.items.find((i) => i.title === 'Listen to the teacher’s Radif recording'),
          (i) => !!i,
        );
        expect(listening!.strand, engine).toBe('reading_theory');
        // Editing keeps it a study item.
        await page.getByRole('button', { name: 'Edit', exact: true }).click();
        expect(await page.getByRole('group', { name: 'Kind of practice item' }).getByRole('button', { name: 'Theory / listening study' }).getAttribute('aria-pressed'), engine).toBe('true');
        await page.getByRole('button', { name: 'Save changes' }).click();
        expect((await itemOf(app, listening!.id)).strand, engine).toBe('reading_theory');
        // It sits in the Practice list, not My repertoire.
        await goTo(app, '/repertoire');
        await page.getByRole('button', { name: 'Practice list', exact: true }).click();
        await page.getByText('Listen to the teacher’s Radif recording').first().waitFor();
        // Direct practice records an ordinary, scoped block.
        await practiseToClose(app, listening!.id);
        await page.getByRole('button', { name: RESULT_LABELS.slightly_better, exact: true }).click();
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        const block = (await db(app)).blocks.at(-1)!;
        expect([block.practiceItemId, block.result, block.scope], engine).toEqual([listening!.id, 'slightly_better', 'focused']);
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});
