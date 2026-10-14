import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import { createItem, SCHEMA_VERSION } from '../src/domain';
import { FOCUS_LABELS, ITEM_STATUS_LABELS, RATING_LABELS, RESULT_LABELS } from '../src/domain/labels';
import { goTo, importBackup, importOutcome, openPracticeApp, persistedDb, persistedUntil, reload, type Engine, type PracticeApp } from './practiceBrowser';

// ---------------------------------------------------------------------------
// After practice: the close screen revises the item as the practice left it
// (Status, Primary focus, Current effort), and Routine complete captures what
// each recorded item showed — both through the REAL mounted screens, both
// engines, at the owner's phone size, read back from what the app PERSISTED.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-14T08:00:00.000Z');
const T = CLOCK.toISOString();
const GUSHEH = 'pp-gusheh';
const PIECE = 'pp-piece';
const GUSHEH_TITLE = 'Darāmad of Shur';
const PIECE_TITLE = 'Chahārmezrāb';

function fixture(): string {
  const item = (id: string, title: string, over: Record<string, unknown>) => ({
    ...createItem({ instrumentId: 'inst-setar', title, itemType: 'gusheh', status: 'usable' }, CLOCK),
    id,
    ...over,
  });
  const data = {
    schemaVersion: SCHEMA_VERSION,
    instruments: [{ id: 'inst-setar', name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T }],
    materials: [],
    items: [
      item(GUSHEH, GUSHEH_TITLE, { primaryFocus: 'tone', difficulty: 3, importance: 4, timesPractised: 4, nextReviewDate: '2026-10-14' }),
      item(PIECE, PIECE_TITLE, { itemType: 'full_piece', primaryFocus: 'rhythm', difficulty: 4, importance: 3, timesPractised: 2, nextReviewDate: '2026-10-13' }),
    ],
    blocks: [],
    reviews: [
      { id: 'rev-gusheh', practiceItemId: GUSHEH, dueDate: '2026-10-14', reviewType: 'retention', createdAt: T, updatedAt: T },
      { id: 'rev-piece', practiceItemId: PIECE, dueDate: '2026-10-13', reviewType: 'retention', createdAt: T, updatedAt: T },
    ],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [
      {
        id: 'rt-cap',
        instrumentId: 'inst-setar',
        name: 'Capture routine',
        segments: [
          { label: 'Gusheh', minutes: 1, itemId: GUSHEH },
          { label: 'Piece', minutes: 1, itemId: PIECE },
          { label: 'Open strings', minutes: 1 },
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

type SavedItem = { id: string; status: string; primaryFocus?: string; difficulty: number; importance: number; nextReviewDate?: string; lastResult?: string };
type SavedBlock = { id: string; practiceItemId: string; result: string; observation?: string; durationMinutes: number; mode: string; focus: string };
type SavedReview = { id: string; practiceItemId: string; dueDate: string; completedAt?: string };

const saved = async (app: PracticeApp) =>
  (await persistedDb(app)) as unknown as { items: SavedItem[]; blocks: SavedBlock[]; reviews: SavedReview[] };
const itemOf = async (app: PracticeApp, id: string) => (await saved(app)).items.find((i) => i.id === id)!;
const pick = ({ status, primaryFocus, difficulty }: SavedItem) => ({ status, primaryFocus, difficulty });

async function seeded(engine: Engine): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine, viewport: { width: 390, height: 844 } });
  await importBackup(app, 'post-practice.json', fixture());
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}

/** Start a block on the item's own page, then Finish to the close screen. */
async function practiseAndFinish(app: PracticeApp, itemId: string): Promise<void> {
  await goTo(app, `/items/${itemId}`);
  await app.page.getByRole('button', { name: 'Start a block' }).click();
  await app.page.getByRole('button', { name: 'Finish' }).click();
  await app.page.getByRole('button', { name: 'Save without a result' }).waitFor();
}

const itemLine = (page: Page, text: string) => page.getByText(text, { exact: true });
const changeItem = (page: Page) => page.getByRole('button', { name: 'Change status, focus and effort' });

describe('after practice', () => {
  it('close screen revises status focus and effort in one tap and saves them with the block', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        // --- SAVE: the collapsed line, Change, three picks, Save --------------
        await practiseAndFinish(app, GUSHEH);
        // The item as it stands, before any result: one collapsed line.
        await itemLine(page, `Status ${ITEM_STATUS_LABELS.usable} · Focus ${FOCUS_LABELS.tone} · Effort 3 of 5`).waitFor();
        await page.getByRole('button', { name: RESULT_LABELS.stable_in_context, exact: true }).click();
        // The engine's suggestion is the pending change, shown on that line.
        await itemLine(page, `Status ${ITEM_STATUS_LABELS.usable} → ${ITEM_STATUS_LABELS.integrated} (suggested) · Focus ${FOCUS_LABELS.tone} · Effort 3 of 5`).waitFor();
        await changeItem(page).click();
        const statusPills = page.getByRole('group', { name: 'Status after this block' });
        // Pre-selected, and SEEN as selected — not only announced.
        const suggested = statusPills.getByRole('button', { name: ITEM_STATUS_LABELS.integrated, exact: true });
        expect(await suggested.getAttribute('aria-pressed')).toBe('true');
        expect(await suggested.getAttribute('class')).toContain('selected');
        await statusPills.getByRole('button', { name: ITEM_STATUS_LABELS.maintenance, exact: true }).click();
        await page.getByRole('combobox', { name: 'Primary focus' }).selectOption('memory');
        await page.getByRole('button', { name: `${RATING_LABELS.difficulty} 5`, exact: true }).click();
        const kept = statusPills.getByRole('button', { name: ITEM_STATUS_LABELS.maintenance, exact: true });
        expect(await kept.getAttribute('aria-pressed')).toBe('true');
        expect(await kept.getAttribute('class')).toContain('selected');
        await itemLine(page, `Status ${ITEM_STATUS_LABELS.usable} → ${ITEM_STATUS_LABELS.maintenance} · Focus ${FOCUS_LABELS.memory} · Effort 5 of 5`).waitFor();
        // The date this screen shows before saving.
        await page.getByRole('button', { name: 'Change', exact: true }).click();
        const shownDate = await page.getByLabel('Next review date').inputValue();
        expect(shownDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await persistedUntil(app, (s) => (s.state as { db: { blocks: unknown[] } }).db.blocks.length, (n) => n === 1);
        const afterSave = await itemOf(app, GUSHEH);
        expect(pick(afterSave)).toEqual({ status: 'maintenance', primaryFocus: 'memory', difficulty: 5 });
        // The date saved is the date shown: decided from the item as practised.
        expect(afterSave.nextReviewDate).toBe(shownDate);
        expect(afterSave.importance).toBe(4);
        const block = (await saved(app)).blocks.at(-1)!;
        expect([block.practiceItemId, block.result, block.focus]).toEqual([GUSHEH, 'stable_in_context', 'tone']);
        // …and they survive a reload, on the item's own page.
        await reload(app);
        await goTo(app, `/items/${GUSHEH}`);
        const itemStatus = page.getByRole('group', { name: 'Set status' }).getByRole('button', { name: ITEM_STATUS_LABELS.maintenance, exact: true });
        expect(await itemStatus.getAttribute('aria-pressed')).toBe('true');
        expect(pick(await itemOf(app, GUSHEH))).toEqual({ status: 'maintenance', primaryFocus: 'memory', difficulty: 5 });

        // --- UNTOUCHED: the item's three fields stay exactly as they were -----
        const pieceBefore = await itemOf(app, PIECE);
        await practiseAndFinish(app, PIECE);
        await itemLine(page, `Status ${ITEM_STATUS_LABELS.usable} · Focus ${FOCUS_LABELS.rhythm} · Effort 4 of 5`).waitFor();
        await page.getByRole('button', { name: RESULT_LABELS.same, exact: true }).click();
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        const untouched = await persistedUntil(app, (s) => (s.state as { db: { blocks: unknown[] } }).db.blocks.length, (n) => n === 2);
        expect(untouched).toBe(2);
        expect(pick(await itemOf(app, PIECE))).toEqual(pick(pieceBefore));

        // --- SAVE WITHOUT A RESULT: explicit edits kept, suggestion dropped ----
        const gushehBefore = await itemOf(app, GUSHEH);
        const pieceScheduled = await itemOf(app, PIECE);
        await practiseAndFinish(app, PIECE);
        await page.getByRole('button', { name: RESULT_LABELS.performable, exact: true }).click();
        await itemLine(page, `Status ${ITEM_STATUS_LABELS.usable} → ${ITEM_STATUS_LABELS.performable} (suggested) · Focus ${FOCUS_LABELS.rhythm} · Effort 4 of 5`).waitFor();
        await changeItem(page).click();
        await page.getByRole('combobox', { name: 'Primary focus' }).selectOption('');
        await page.getByRole('button', { name: 'Save without a result' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await persistedUntil(app, (s) => (s.state as { db: { blocks: unknown[] } }).db.blocks.length, (n) => n === 3);
        const withoutResult = await itemOf(app, PIECE);
        // The focus was cleared to None; the suggested status did not apply; the schedule did not move.
        expect(pick(withoutResult)).toEqual({ status: 'usable', primaryFocus: undefined, difficulty: 4 });
        expect(withoutResult.nextReviewDate).toBe(pieceScheduled.nextReviewDate);
        expect((await saved(app)).blocks.at(-1)!.result).toBe('not_logged');

        // --- DISCARD writes nothing -------------------------------------------
        const dbBefore = JSON.stringify(await saved(app));
        await practiseAndFinish(app, GUSHEH);
        await changeItem(page).click();
        await page.getByRole('group', { name: 'Status after this block' }).getByRole('button', { name: ITEM_STATUS_LABELS.fragile, exact: true }).click();
        await page.getByRole('button', { name: 'Discard without saving' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await reload(app);
        expect(JSON.stringify(await saved(app))).toBe(dbBefore);
        expect(pick(await itemOf(app, GUSHEH))).toEqual(pick(gushehBefore));
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);

  it('routine complete captures what each item showed without delaying the save', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await seeded(engine);
      const { page } = app;
      const runRoutine = async () => {
        await goTo(app, '/routine/rt-cap');
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        // A minute on each bound segment, and some of the unbound third.
        await page.clock.fastForward(150_000);
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
      };
      const runBlocks = (blocks: SavedBlock[], from: number) => blocks.slice(from).map((b) => [b.practiceItemId, b.result]).sort();
      try {
        // --- FINISH saves the minutes first, as not_logged --------------------
        await runRoutine();
        const blocks = await persistedUntil(app, (s) => (s.state as { db: { blocks: SavedBlock[] } }).db.blocks, (b) => b.length === 2);
        expect(runBlocks(blocks, 0)).toEqual([
          [GUSHEH, 'not_logged'],
          [PIECE, 'not_logged'],
        ]);
        expect(blocks.every((b) => b.durationMinutes >= 1)).toBe(true);

        // --- CAPTURE: a result for one item, a note for the other -------------
        await page.getByRole('group', { name: `Result for ${GUSHEH_TITLE}` }).getByRole('button', { name: RESULT_LABELS.stable_alone, exact: true }).click();
        await page.getByRole('textbox', { name: `Observation for ${PIECE_TITLE}` }).fill('Right hand steadier at the turn');
        await page.getByRole('button', { name: 'Save what they showed' }).click();
        await page.getByText('Saved.').waitFor({ timeout: 10_000 });
        await reload(app);
        const after = await saved(app);
        const gushehBlock = after.blocks.find((b) => b.practiceItemId === GUSHEH)!;
        const pieceBlock = after.blocks.find((b) => b.practiceItemId === PIECE)!;
        expect([gushehBlock.result, gushehBlock.observation]).toEqual(['stable_alone', undefined]);
        expect([pieceBlock.result, pieceBlock.observation]).toEqual(['not_logged', 'Right hand steadier at the turn']);
        expect(after.items.find((i) => i.id === GUSHEH)!.lastResult).toBe('stable_alone');
        // Due reviews are still due: nothing completed, no date moved.
        expect(after.reviews.map((r) => [r.id, r.dueDate, r.completedAt])).toEqual([
          ['rev-gusheh', '2026-10-14', undefined],
          ['rev-piece', '2026-10-13', undefined],
        ]);
        expect(after.items.map((i) => [i.id, i.nextReviewDate])).toEqual([
          [GUSHEH, '2026-10-14'],
          [PIECE, '2026-10-13'],
        ]);
        // The item history shows them.
        await goTo(app, `/items/${GUSHEH}`);
        await page.getByText('Practice history').waitFor();
        await page.getByText(RESULT_LABELS.stable_alone, { exact: true }).first().waitFor();
        await goTo(app, `/items/${PIECE}`);
        await page.getByText('Right hand steadier at the turn').waitFor();

        // --- SKIPPING the capture leaves not_logged ----------------------------
        await runRoutine();
        await persistedUntil(app, (s) => (s.state as { db: { blocks: SavedBlock[] } }).db.blocks.length, (n) => n === 4);
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect(runBlocks((await saved(app)).blocks, 2)).toEqual([
          [GUSHEH, 'not_logged'],
          [PIECE, 'not_logged'],
        ]);

        // --- RELOADING on Routine complete keeps the minutes -------------------
        await runRoutine();
        await persistedUntil(app, (s) => (s.state as { db: { blocks: SavedBlock[] } }).db.blocks.length, (n) => n === 6);
        await reload(app);
        expect(runBlocks((await saved(app)).blocks, 4)).toEqual([
          [GUSHEH, 'not_logged'],
          [PIECE, 'not_logged'],
        ]);
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});
