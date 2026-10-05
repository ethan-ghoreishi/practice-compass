import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import OWNER_V16_TEXT from './fixtures/setar-practice-owner-v16.json?raw';
import { validateDB } from '../src/domain/io';
import { catalogForStage, planDefaultPathways } from '../src/domain/pathwaySeed';
import { stagesOfPathway } from '../src/domain/pathways';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  persistedDb,
  readPersistedState,
  reload,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// The Setar practice reliability journeys, through the real controls, in both
// engines. Fixtures are synthetic and owner-SHAPED (tests/fixtures/
// setar-practice-owner-v16.json): never an owner's private data, never a
// debug hook, never a source regex standing in for behaviour.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-05T09:00:00.000Z');
const T = CLOCK.toISOString();
const OWNER_V16: { data: PracticeDB; files: unknown[] } = JSON.parse(OWNER_V16_TEXT);

type Db = PracticeDB;
const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const until = async <V,>(app: PracticeApp, read: (d: Db) => V, ok: (v: V) => boolean, timeout = 15_000): Promise<V> => {
  const deadline = Date.now() + timeout;
  for (;;) {
    const v = read(await db(app));
    if (ok(v)) return v;
    if (Date.now() > deadline) throw new Error(`never satisfied: ${JSON.stringify(v)}`);
    await app.page.waitForTimeout(100);
  }
};
const wrap = (data: unknown, files?: unknown[]) =>
  JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data, ...(files ? { files } : {}) });

/**
 * Seed through the real Settings importer. Chromium gets the full backup with
 * its attachment bytes; WebKit cannot store a Blob in IndexedDB under
 * automation, so its journeys seed state-only, without the attachment row.
 */
async function seeded(engine: Engine, data: Db, viewport?: { width: number; height: number }, files?: unknown[]) {
  const app = await openPracticeApp({ now: CLOCK, engine, ...(viewport ? { viewport } : {}) });
  const forEngine = engine === 'webkit' ? { ...data, attachments: [] } : data;
  await importBackup(app, 'owner.json', wrap(forEngine, engine === 'webkit' ? undefined : files));
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}

/** The stage header's own neutral count, e.g. "0/3 solid". */
const solid = async (page: Page) => (/(\d+\/\d+) solid/.exec(await page.locator('main').innerText()) ?? [])[1];

// ---------------------------------------------------------------------------
// ac-16 — Add → visible Remove → hidden Restore → Play, never a deletion.
// ---------------------------------------------------------------------------

describe('pathway membership, reversibly', () => {
  it('pathway removal and restoration visibly retain the existing owned item', async () => {
    // The owner's data, plus a Guitar with its shipped course (a COURSE
    // reference) and two items whose legacy placement both claim one radif
    // suggestion (AMBIGUOUS legacy evidence).
    const base = validateDB(OWNER_V16);
    const guitarDb: Db = {
      ...base,
      instruments: [...base.instruments, { id: 'inst-guitar', name: 'Classical Guitar', active: true, createdAt: T, updatedAt: T }],
    };
    Object.assign(guitarDb, planDefaultPathways(guitarDb, ['cgs'], CLOCK));
    const legacy = (id: string) => ({
      ...base.items.find((i) => i.id === 'it-riz')!,
      id,
      title: `legacy ${id}`,
      itemType: 'gusheh' as const,
      status: 'usable' as const,
      stageId: 'setar-radif-shur',
      catalogKey: 'rohab',
      catalogRefs: undefined,
    });
    const data: Db = { ...guitarDb, items: [...guitarDb.items, legacy('it-legacy-1'), legacy('it-legacy-2')] };
    // Which course entry to tap — chosen from the shipped catalogue, not an expectation.
    const courseStage = stagesOfPathway(data.pathwayStages, 'cgs').find((s) => catalogForStage(s.id).length > 0)!;
    const courseEntry = catalogForStage(courseStage.id)[0]!;

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await seeded(engine, data, undefined, OWNER_V16.files);
      const { page } = app;
      try {
        const before = await db(app);
        const itemCount = before.items.length;

        // --- ORDINARY: Add, then the visible Remove right where Add was ----
        await goTo(app, '/pathway/setar-radif/setar-radif-setup');
        const sitting = 'نشستن و در دست گرفتن سه‌تار';
        const countBefore = await solid(page);
        await page.getByRole('button', { name: `Add ${sitting} to your items` }).click();
        const added = await until(app, (d) => d.items.find((i) => i.title === sitting), (i) => !!i);
        expect(added!.stageId).toBe('setar-radif-setup');
        // The Add button became Play — and the safe inverse is VISIBLE now.
        await page.getByRole('button', { name: `Practise ${sitting}` }).waitFor();
        const countAdded = await solid(page);
        const remove = page.getByRole('button', { name: `Remove ${sitting} from this pathway — the item is kept` });
        await remove.click();
        const removed = await until(app, (d) => d.items.find((i) => i.id === added!.id), (i) => !!i && !i.stageId);
        // Kept, bound, and only THIS pathway hides its suggestion.
        expect(removed!.catalogRefs).toEqual(added!.catalogRefs);
        expect((await db(app)).pathways.find((p) => p.id === 'setar-radif')!.hiddenRefs).toEqual(added!.catalogRefs);
        expect((await db(app)).items).toHaveLength(itemCount + 1);
        expect(await page.locator('main').innerText()).toContain('still in My repertoire');
        // Not on the stage any more; under Hidden suggestions, by its own title.
        expect(await page.getByRole('button', { name: `Practise ${sitting}` }).count()).toBe(0);
        // A hidden suggestion counts for nothing in the stage's progress.
        expect(await solid(page)).toBe(countBefore === undefined ? undefined : `0/${Number(countBefore.split('/')[1]) - 1}`);
        await page.getByText(/Hidden suggestions \(1\)/).click();
        await page.getByRole('button', { name: `Restore ${sitting}` }).click();
        // RESTORE resolves the SAME item — nothing is created again.
        await page.getByRole('button', { name: `Practise ${sitting}` }).waitFor();
        expect(await page.locator('main').innerText()).toContain('the same item, nothing new was made');
        expect((await db(app)).items).toHaveLength(itemCount + 1);
        expect((await db(app)).pathways.find((p) => p.id === 'setar-radif')!.hiddenRefs).toEqual([]);
        expect(await solid(page)).toBe(countAdded);
        // PLAY starts that very item.
        await page.getByRole('button', { name: `Practise ${sitting}` }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        expect(((await readPersistedState(app)).state as { active: { itemId: string } }).active.itemId).toBe(added!.id);
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- A SHARED RADIF reference, in a SECOND pathway -----------------
        await goTo(app, '/pathway/setar-radif/setar-radif-shur');
        const daramad = 'درآمد شور';
        await page.getByRole('button', { name: `Add ${daramad} to your items` }).click();
        const shared = await until(app, (d) => d.items.find((i) => i.title === daramad), (i) => !!i);
        await goTo(app, '/pathway/setar-radif-mirza/setar-radif-mirza-shur');
        // The SAME item answers it here: no second Add.
        await page.getByRole('button', { name: `Practise ${daramad}` }).waitFor();
        expect(await page.getByRole('button', { name: `Add ${daramad} to your items` }).count()).toBe(0);
        await page.getByLabel(`More actions for ${daramad}`).click();
        // Remove comes first; Unlink is its own, separate action.
        const items = await page.locator('.stage-unit-menu-list').first().getByRole('button').allInnerTexts();
        expect(items[0]).toBe('Remove from pathway (keeps the item)');
        expect(items).toContain('Unlink reference (keeps the item)');
        await page.getByRole('button', { name: 'Remove from pathway (keeps the item)' }).click();
        await until(app, (d) => d.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs ?? [], (r) => r.length === 1);
        // Only the selected pathway changed: the mixed pathway still shows it.
        await goTo(app, '/pathway/setar-radif/setar-radif-shur');
        await page.getByRole('button', { name: `Practise ${daramad}` }).waitFor();
        expect((await db(app)).items.find((i) => i.id === shared!.id)!.catalogRefs).toEqual(shared!.catalogRefs);
        await goTo(app, '/pathway/setar-radif-mirza/setar-radif-mirza-shur');
        await page.getByText(/Hidden suggestions \(1\)/).click();
        await page.getByRole('button', { name: `Restore ${daramad}` }).click();
        await page.getByRole('button', { name: `Practise ${daramad}` }).waitFor();
        expect((await db(app)).items.filter((i) => i.title === daramad)).toHaveLength(1);

        // --- A PRACTISED, ENRICHED item placed without a reference ----------
        const kereshmeh = before.items.find((i) => i.source?.pieceKey === 'کرشمه-ماهور-ردیف-میرزاعبدالله')!;
        await goTo(app, '/pathway/setar-radif/setar-radif-mahur');
        await page.getByLabel(`More actions for ${kereshmeh.title}`).click();
        await page.getByRole('button', { name: 'Remove from pathway (keeps the item)' }).click();
        const left = await until(app, (d) => d.items.find((i) => i.id === kereshmeh.id)!, (i) => !i.stageId);
        // EVERYTHING it had is still its own.
        const after = await db(app);
        for (const key of ['notes', 'source', 'materialId', 'timesPractised', 'totalMinutes', 'lastPractisedAt', 'status', 'catalogRefs'] as const) {
          expect(left[key], key).toEqual(kereshmeh[key]);
        }
        expect(after.blocks.filter((b) => b.practiceItemId === kereshmeh.id)).toEqual(before.blocks.filter((b) => b.practiceItemId === kereshmeh.id));
        expect(after.reviews).toEqual(before.reviews);
        expect(after.attachments).toEqual(before.attachments);
        expect(after.lessons).toEqual(before.lessons);
        // Placing it back is the Connections control — the same record.
        await goTo(app, `/items/${kereshmeh.id}`);
        await page.getByLabel('Pathway stage this item belongs to').selectOption('setar-radif-mahur');
        await until(app, (d) => d.items.find((i) => i.id === kereshmeh.id)!.stageId, (s) => s === 'setar-radif-mahur');

        // --- A COURSE reference ------------------------------------------------
        await goTo(app, `/pathway/cgs/${courseStage.id}`);
        await page.getByRole('button', { name: `Add ${courseEntry.title} to your items` }).click();
        const course = await until(app, (d) => d.items.find((i) => i.title === courseEntry.title), (i) => !!i);
        await page.getByRole('button', { name: `Remove ${courseEntry.title} from this pathway — the item is kept` }).click();
        await until(app, (d) => d.pathways.find((p) => p.id === 'cgs')!.hiddenRefs ?? [], (r) => r.length === 1);
        await page.getByText(/Hidden suggestions \(1\)/).click();
        await page.getByRole('button', { name: `Restore ${courseEntry.title}` }).click();
        await page.getByRole('button', { name: `Practise ${courseEntry.title}` }).waitFor();
        expect((await db(app)).items.filter((i) => i.title === courseEntry.title).map((i) => i.id)).toEqual([course!.id]);

        // --- AMBIGUOUS legacy evidence is refused, visibly, changing nothing --
        await goTo(app, '/pathway/setar-radif/setar-radif-shur');
        const beforeAmbiguous = JSON.stringify((await db(app)).items);
        await page.getByLabel('More actions for legacy it-legacy-1').click();
        await page.getByRole('button', { name: 'Remove from pathway (keeps the item)' }).click();
        await page.getByRole('alert').first().waitFor();
        expect(JSON.stringify((await db(app)).items)).toBe(beforeAmbiguous);

        // --- Nothing was ever deleted ---------------------------------------
        const final = await db(app);
        for (const i of before.items) expect(final.items.some((x) => x.id === i.id), i.id).toBe(true);
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});
