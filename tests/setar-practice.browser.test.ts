import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import OWNER_V16_TEXT from './fixtures/setar-practice-owner-v16.json?raw';
import { validateDB } from '../src/domain/io';
import { catalogForStage, planDefaultPathways } from '../src/domain/pathwaySeed';
import { stagesOfPathway } from '../src/domain/pathways';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';
import {
  connectSync,
  exportBackup,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  openSettings,
  publishSourceIndex,
  stampSourceIndex,
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

// ---------------------------------------------------------------------------
// ac-3 — what the owner deleted, skipped, unlinked or hid comes back ONE exact
// decision at a time, through the Settings controls, and nothing else does.
// ---------------------------------------------------------------------------

const S7 = 'session-7-08-01-2025';
const KERESHMEH = 'کرشمه-ماهور-ردیف-میرزاعبدالله';
const DARAMAD_MAHUR = 'درامد-ماهور-ردیف-میرزاعبدالله';
const DELETED_PIECE = 'درامد-افشاری-ردیف-میرزاعبدالله';

/** A refused IndexedDB write, as a full device would refuse it. */
async function breakStorage(page: Page) {
  await page.evaluate(() => {
    const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
    proto.__realPut = proto.put;
    proto.put = function failing() {
      throw new DOMException('storage is full', 'QuotaExceededError');
    };
  });
}
async function repairStorage(page: Page) {
  await page.evaluate(() => {
    const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
    if (proto.__realPut) proto.put = proto.__realPut;
  });
}

/** The published index for a graph — re-stamped as the scanner would. */
async function indexFor(graph: PracticeDB['archiveSources'][number], change: (i: Record<string, unknown>) => void = () => {}) {
  const index: Record<string, unknown> = {
    format: 'setar-archive-index',
    version: 1,
    archiveId: graph.id,
    pieces: graph.pieces.map(({ unavailable: _u, ...p }) => (void _u, p)),
    sessions: graph.sessions.map(({ unavailable: _u, ...s }) => (void _u, { ...s, resources: s.resources.map(({ unavailable: _r, ...r }) => (void _r, r)) })),
    renames: graph.renames,
    diagnostics: graph.diagnostics,
  };
  change(index);
  return stampSourceIndex(index);
}

async function refreshArchive(app: PracticeApp) {
  await openSettings(app);
  await app.page.getByRole('button', { name: 'Refresh Setar archive' }).click();
  await app.page.getByRole('button', { name: /^(Apply|Already current)$/ }).waitFor({ timeout: 30_000 });
}

const suppressionsOf = (d: Db) =>
  d.archiveSources[0]!.suppressions.map((x) => `${x.kind}|${x.ref}|${x.itemId ?? ''}`).sort();

describe('archive recovery, one decision at a time', () => {
  it('setar recovery restores only the selected suppression through owner controls', async () => {
    const base = validateDB(OWNER_V16);
    const graph = base.archiveSources[0]!;
    const item = (key: string) => base.items.find((i) => i.source?.pieceKey === key)!;
    const lesson25 = base.lessons.find((l) => l.source?.sessionN === 25)!;
    // The owner's earlier decisions, as another device or an earlier session
    // made them: a deleted class (with its notes), a deleted piece, the
    // fixture's own unlink, a file hidden everywhere (no longer described),
    // and ONE shared demonstration hidden on TWO different items.
    const owner: Db = {
      ...base,
      lessons: [
        ...base.lessons.filter((l) => l.id !== lesson25.id),
        { ...base.lessons[0]!, id: 'L-manual', source: undefined, origin: undefined, number: 99, date: '2025-02-02', notes: 'my own class', itemIds: [] },
      ],
      items: base.items.filter((i) => i.source?.pieceKey !== DELETED_PIECE),
      lessonAgenda: [],
      archiveSources: [
        {
          ...graph,
          suppressions: [
            ...graph.suppressions,
            { kind: 'session', ref: '25', at: T },
            { kind: 'piece', ref: DELETED_PIECE, at: T },
            { kind: 'resource', ref: 'session-24-25-01-2025/نت-قدیمی.pdf', at: T },
            { kind: 'resource', ref: `${S7}/نمونه-1.mp4`, itemId: item(KERESHMEH).id, at: T },
            { kind: 'resource', ref: `${S7}/نمونه-1.mp4`, itemId: item(DARAMAD_MAHUR).id, at: T },
          ],
        },
      ],
    };
    const seededSuppressions = owner.archiveSources[0]!.suppressions.map((x) => `${x.kind}|${x.ref}|${x.itemId ?? ''}`).sort();

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
        const where = `${engine}/${viewport.width}`;
        const app = await seeded(engine, owner, viewport, OWNER_V16.files);
        const { page } = app;
        try {
          const remote = newFakeRemote();
          await installFakeGitHub(page, remote);
          await connectSync(app);
          publishSourceIndex(remote, await indexFor(graph), 'idx-1');

          // --- NORMAL REFRESH never resurrects a suppressed decision --------
          await refreshArchive(app);
          await page.getByRole('button', { name: /^(Apply|Already current)$/ }).click();
          await refreshArchive(app);
          // A no-op still shows what needs attention and what is hidden.
          const noop = await page.locator('main').innerText();
          expect(noop, where).toMatch(/Already current\./);
          expect(noop, where).toMatch(/6 hidden or removed by you/);
          let d = await db(app);
          expect(suppressionsOf(d), where).toEqual(seededSuppressions);
          expect(d.lessons.some((l) => l.source?.sessionN === 25), where).toBe(false);
          expect(d.items.some((i) => i.source?.pieceKey === DELETED_PIECE), where).toBe(false);

          // Deleting a MANUAL class records nothing to restore; deleting an
          // archive class would (seeded above).
          await goTo(app, '/lessons');
          const manual = page.getByRole('article').filter({ hasText: 'Class 99' }).first();
          if (await manual.count()) {
            await manual.getByRole('button', { name: /Class 99/ }).first().click();
          } else {
            await page.getByRole('button', { name: /Class 99/ }).first().click();
          }
          await page.getByRole('button', { name: 'Delete lesson' }).first().click();
          await until(app, (x) => x.lessons.some((l) => l.id === 'L-manual'), (v) => v === false);
          expect(suppressionsOf(await db(app)), where).toEqual(seededSuppressions);

          // --- THE LIST: every decision, its scope, current or not described -
          await openSettings(app);
          await page.getByText(/Hidden and removed from the archive \(6\)/).click();
          const list = await page.locator('details', { hasText: 'Hidden and removed from the archive' }).innerText();
          expect(list, where).toContain(`hidden on ${KERESHMEH}`);
          expect(list, where).toContain(`hidden on ${DARAMAD_MAHUR}`);
          expect(list, where).toMatch(/نت-قدیمی\.pdf — hidden everywhere · not described by the latest index/);
          expect(list, where).toMatch(/cannot come back from it/);

          // --- ONE of two hides of ONE shared path: only that tuple clears ---
          await page.getByRole('button', { name: `Restore File ${S7}/نمونه-1.mp4 — hidden on ${KERESHMEH}` }).click();
          await page.getByText(/Restore of .*: ?Saved\./).first().waitFor({ timeout: 10_000 });
          d = await until(app, (x) => x, (x) => suppressionsOf(x).length === 5);
          expect(d.archiveSources[0]!.suppressions.filter((x) => x.ref === `${S7}/نمونه-1.mp4`).map((x) => x.itemId), where).toEqual([
            item(DARAMAD_MAHUR).id,
          ]);
          // The demonstration is back on that item, and still hidden on the other.
          const demoOn = async (id: string) => {
            await goTo(app, `/items/${id}`);
            return (await page.locator('main').innerText()).includes('نمونه 1');
          };
          expect(await demoOn(item(KERESHMEH).id), where).toBe(true);
          expect(await demoOn(item(DARAMAD_MAHUR).id), where).toBe(false);

          // --- A REFUSED WRITE says so; Try again really writes ---------------
          await openSettings(app);
          await page.getByText(/Hidden and removed from the archive \(5\)/).click();
          await breakStorage(page);
          await page.getByRole('button', { name: `Restore Piece ${DELETED_PIECE} — deleted or skipped` }).click();
          await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
          // The row has left the list, and its outcome is still on screen.
          expect(await page.getByRole('button', { name: `Restore Piece ${DELETED_PIECE} — deleted or skipped` }).count(), where).toBe(0);
          await repairStorage(page);
          await page.getByRole('button', { name: 'Try again' }).click();
          await page.getByText(/Restore of .*: ?Saved\./).first().waitFor({ timeout: 10_000 });
          await reload(app);
          expect(suppressionsOf(await db(app)), where).not.toContain(`piece|${DELETED_PIECE}|`);

          // --- A STALE PREVIEW is looked at again after a restore ------------
          await refreshArchive(app);
          expect(await page.locator('main').innerText(), where).toMatch(/Will add 1 pieces and 0 classes/);
          await page.getByText(/Hidden and removed from the archive \(4\)/).click();
          await page.getByRole('button', { name: 'Restore Class 25 — deleted or skipped' }).click();
          await expect.poll(() => page.locator('main').innerText(), { timeout: 10_000 }).toMatch(/Will add 1 pieces and 1 classes/);
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          d = await until(app, (x) => x, (x) => x.lessons.some((l) => l.source?.sessionN === 25));
          // The class's SOURCE facts return, once — and only them.
          const back = d.lessons.find((l) => l.source?.sessionN === 25)!;
          expect(back.id, where).toBe(lesson25.id);
          expect(back.notes, where).toBeUndefined();
          expect(d.lessons.filter((l) => l.source?.sessionN === 25), where).toHaveLength(1);
          expect(d.items.filter((i) => i.source?.pieceKey === DELETED_PIECE).map((i) => [i.status, i.timesPractised]), where).toEqual([['dormant', 0]]);

          // --- SIMULTANEOUS source changes and a FUTURE class -----------------
          // Session 41 arrives while the class-9 unlink and the remaining hides
          // stand; nothing about restoring is special to any session number.
          publishSourceIndex(
            remote,
            await indexFor(graph, (i) => {
              (i.sessions as unknown[]).push({
                n: 41,
                date: '2026-10-06',
                folder: 'session-41-06-10-2026',
                roster: [],
                rosterTrusted: true,
                hasClassRecording: true,
                resources: [{ path: 'session-41-06-10-2026/ضبط-کلاس.mp4', role: 'ضبط-کلاس', kind: 'video', title: 'ضبط کلاس', part: null, pieces: [], group: null }],
                members: [],
              });
            }),
            'idx-2',
          );
          await refreshArchive(app);
          expect(await page.locator('main').innerText(), where).toMatch(/Will add 0 pieces and 1 classes/);
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          d = await until(app, (x) => x, (x) => x.lessons.some((l) => l.source?.sessionN === 41));
          expect(suppressionsOf(d), where).toEqual(
            [`link|9:چهارمضراب-ماهور-صبا|`, 'resource|session-24-25-01-2025/نت-قدیمی.pdf|', `resource|${S7}/نمونه-1.mp4|${item(DARAMAD_MAHUR).id}`].sort(),
          );
          // Imported classes stay history, even dated after this device's clock.
          expect(d.lessons.find((l) => l.source?.sessionN === 41)!.origin, where).toBe('archive');

          // --- RELOAD and REINSTALL carry exactly these decisions ---------------
          await reload(app);
          const exported = await exportBackup(app);
          await importBackup(app, 'reinstall.json', engine === 'webkit' ? JSON.stringify({ ...JSON.parse(exported), files: undefined }) : exported);
          expect(await importOutcome(app), where).toContain('Imported');
          expect(suppressionsOf(await db(app)), where).toEqual(suppressionsOf(d));
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
  }, 900_000);
});
