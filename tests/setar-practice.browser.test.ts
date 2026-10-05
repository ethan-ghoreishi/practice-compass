import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import OWNER_V16_TEXT from './fixtures/setar-practice-owner-v16.json?raw';
import { hashState } from '../src/domain/canonical';
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
  publishRemote,
  publishSourceIndex,
  remoteStateText,
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

// ---------------------------------------------------------------------------
// ac-4 — scanner → publisher → SHA-pinned fetch → refresh → Lessons and items,
// for Session 40, Session 1 and FUTURE classes alike. The corpus is a
// temporary copy of tests/fixtures/setar-practice-source-v1.json; the only
// edits to it are the OWNER's confirmed rows from the expectations fixture;
// the publisher is the real `publishIndex` over an in-memory transport onto
// the harness's fake GitHub; media opens from a local, read-only fake NAS.
// ---------------------------------------------------------------------------

import { createServer as createHttpServer, type Server } from 'node:http';
import { mkdirSync as mkdirSyncFs, mkdtempSync as mkdtempSyncFs, readFileSync as readFileSyncFs, rmSync as rmSyncFs, writeFileSync as writeFileSyncFs } from 'node:fs';
import { tmpdir as tmpdirFs } from 'node:os';
import { join as joinPath } from 'node:path';
import SOURCE_CORPUS from './fixtures/setar-practice-source-v1.json';
import SOURCE_EXPECT from './fixtures/setar-practice-source-expectations.json';
// @ts-expect-error — no type declarations for the .mjs operator tools.
import * as scannerTool from '../scripts/scan-setar-classes.mjs';
// @ts-expect-error — no type declarations for the .mjs operator tools.
import * as publisherTool from '../scripts/publish-setar-index.mjs';

const scanTool = scannerTool as {
  scanToIndex(root: string): { contentHash: string } & Record<string, unknown>;
  attentionReport(source: unknown): { newIdentities: { key: string; draft: string }[] };
  readStableSource(root: string): unknown;
};
const publishTool = publisherTool as {
  publishIndex(input: { transport: unknown; indexText: string }): Promise<{ status: string; commit?: string }>;
};

/** The real publisher's transport, writing the harness's fake remote. */
function fakeTransport(remote: ReturnType<typeof newFakeRemote>, opts: { race?: () => void; interrupt?: boolean } = {}) {
  let n = 0;
  const blobs = new Map<string, string>();
  const trees = new Map<string, string>();
  const commits = new Map<string, string>();
  return {
    async getRef() {
      return remote.sourceIndex ? { sha: remote.sourceIndex.commit } : null;
    },
    async getFile(sha: string) {
      return remote.sourceIndex && remote.sourceIndex.commit === sha ? { text: remote.sourceIndex.text } : null;
    },
    async getCommit() {
      return { treeSha: 'base-tree' };
    },
    async createBlob(text: string) {
      const sha = `blob-${(n += 1)}`;
      blobs.set(sha, text);
      return sha;
    },
    async createTree({ blobSha }: { blobSha: string }) {
      const sha = `tree-${(n += 1)}`;
      trees.set(sha, blobs.get(blobSha)!);
      return sha;
    },
    async createCommit({ treeSha }: { treeSha: string }) {
      const sha = `commit-${Date.now().toString(36)}-${(n += 1)}`;
      commits.set(sha, trees.get(treeSha)!);
      return sha;
    },
    async updateRef(_branch: string, sha: string, expected: string) {
      if (opts.race) {
        const race = opts.race;
        opts.race = undefined;
        race();
      }
      if (opts.interrupt) throw new Error('network dropped');
      if (remote.sourceIndex?.commit !== expected) return 'HTTP 422';
      publishSourceIndex(remote, commits.get(sha)!, sha);
      return 'ok';
    },
    async createRef(_branch: string, sha: string) {
      if (opts.interrupt) throw new Error('network dropped');
      if (remote.sourceIndex) return 'HTTP 422';
      publishSourceIndex(remote, commits.get(sha)!, sha);
      return 'ok';
    },
  };
}

/** Scan the temporary archive exactly as the NAS job does: the CLI's own bytes. */
const scanText = (root: string) => `${JSON.stringify(scanTool.scanToIndex(root), null, 2)}\n`;

function corpusRoot(): string {
  const root = mkdtempSyncFs(joinPath(tmpdirFs(), 'setar-publish-'));
  writeFileSyncFs(joinPath(root, 'PIECES.csv'), `${[SOURCE_CORPUS.registry.header, ...SOURCE_CORPUS.registry.rows].join('\n')}\n`);
  writeFileSyncFs(joinPath(root, 'RENAME-LOG.csv'), `${[SOURCE_CORPUS.renameLog.header, ...SOURCE_CORPUS.renameLog.rows].join('\n')}\n`);
  for (const [folder, files] of Object.entries(SOURCE_CORPUS.sessions)) addFolder(root, folder, files);
  return root;
}
function addFolder(root: string, folder: string, files: string[]) {
  mkdirSyncFs(joinPath(root, folder), { recursive: true });
  for (const f of files) writeFileSyncFs(joinPath(root, folder, f), `media:${folder}/${f}:0`);
}

/** The OWNER's confirmed edits, applied to the temporary copy only. */
function ownerConfirms(root: string, keys: string[], logRows: string[]) {
  const keyCol = SOURCE_EXPECT.variants.real.header.split(',').indexOf('canonical_fa');
  const file = joinPath(root, 'PIECES.csv');
  const lines = readFileSyncFs(file, 'utf8').replace(/\n$/, '').split('\n');
  const rows = SOURCE_EXPECT.variants.real.ownerRows as Record<string, string>;
  for (const key of keys) {
    const at = lines.findIndex((l, i) => i > 0 && l.split(',')[keyCol] === key);
    if (at >= 0) lines[at] = rows[key]!;
    else lines.push(rows[key]!);
  }
  writeFileSyncFs(file, `${lines.join('\n')}\n`);
  if (logRows.length) writeFileSyncFs(joinPath(root, 'RENAME-LOG.csv'), `${readFileSyncFs(joinPath(root, 'RENAME-LOG.csv'), 'utf8')}${logRows.join('\n')}\n`);
}

/** A local, read-only stand-in for the NAS media route — resolver mechanics only. */
async function fakeNas(root: string): Promise<{ base: string; server: Server }> {
  const server = createHttpServer((req, res) => {
    const rel = decodeURIComponent((req.url ?? '').replace(/^\/setar-classes\//, '').split('?')[0]!);
    try {
      const bytes = readFileSyncFs(joinPath(root, rel));
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'access-control-allow-origin': '*' });
      res.end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as { port: number }).port;
  return { base: `http://127.0.0.1:${port}/setar-classes`, server };
}

const FRUTON = 'پیش-درامد-چهارگاه-فروتن';
const EBADI = 'چهارمضراب-چهارگاه-عبادی';
const ZARBI = 'ضربی-اصفهان-نوری';
const RENG = 'رنگ-ماهور-درویش-خان';
const DARAMAD_SHUR = 'درآمد-شور-ردیف-میرزاعبدالله';

describe('the archive, from the NAS folder to the practice item', () => {
  it('setar publish fetch and refresh carry source corrections to lessons and item material', async () => {
    const T0 = '2026-09-01T10:00:00.000Z';
    const template = validateDB(OWNER_V16).items.find((i) => i.id === 'it-riz')!;
    const owner: Db = validateDB({
      schemaVersion: SCHEMA_VERSION,
      instruments: [{ id: 'inst-setar', name: 'Setar', active: true, createdAt: T0, updatedAt: T0 }],
      items: [
        // UNRELATED practice that no refresh may touch.
        { ...template, id: 'it-unrelated', title: 'Unrelated practice', notes: 'mine', timesPractised: 3, totalMinutes: 30 },
        // Unbound items with the exact titles of a registered piece (Skipped)
        // and of a piece a FUTURE class will register (Linked).
        { ...template, id: 'it-skip-title', title: RENG, itemType: 'full_piece', status: 'usable' },
        { ...template, id: 'it-same-title', title: ZARBI, itemType: 'full_piece', status: 'usable' },
      ],
      blocks: [{ ...validateDB(OWNER_V16).blocks[0]!, id: 'blk-unrelated', practiceItemId: 'it-unrelated' }],
      reviews: [{ id: 'rev-unrelated', practiceItemId: 'it-unrelated', dueDate: '2026-10-20', reviewType: 'retention', createdAt: T0, updatedAt: T0 }],
      // The owner's own class 1, carrying a reference from before the renames.
      lessons: [
        {
          id: 'L-1',
          instrumentId: 'inst-setar',
          date: '2023-09-26',
          number: 1,
          notes: 'class one, mine',
          itemIds: [],
          recordings: [{ id: 'rec-legacy', title: 'My class 1, part 1', notes: 'watch 12:30', path: 'setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4', kind: 'video', createdAt: T0 }],
          createdAt: T0,
          updatedAt: T0,
        },
      ],
    });
    const unrelated = (d: Db) => JSON.stringify([d.items.find((i) => i.id === 'it-unrelated'), d.blocks, d.reviews]);
    const resource = (d: Db, n: number, file: string) =>
      d.archiveSources[0]!.sessions.find((s) => s.n === n)!.resources.find((r) => r.path.endsWith(`/${file}`));
    const itemOf = (d: Db, key: string) => d.items.find((i) => i.source?.pieceKey === key);

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const root = corpusRoot();
      const nas = await fakeNas(root);
      const app = await seeded(engine, owner, { width: 1280, height: 900 });
      const { page } = app;
      const requests: string[] = [];
      page.on('request', (r) => requests.push(r.url()));
      const pageText = () => page.locator('main').innerText();
      try {
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        await openSettings(app);
        const base = page.getByRole('group', { name: 'Setar archive base URL' }).locator('input');
        await base.fill(nas.base);
        await base.blur();
        const before = unrelated(await db(app));

        // === ROUND 1: the archive as delivered ===============================
        const v0 = scanText(root);
        expect((await publishTool.publishIndex({ transport: fakeTransport(remote), indexText: v0 })).status).toBe('created');
        await refreshArchive(app);
        let text = await pageText();
        // What was fetched is named by its own hash and the commit it was pinned to.
        expect(text).toContain(`Index ${JSON.parse(v0).contentHash.slice(0, 12)}`);
        expect(text).toContain(`published commit ${remote.sourceIndex!.commit.slice(0, 7)}`);
        // Unresolved keys and rosters say so, with the way to the safe step.
        await page.getByRole('button', { name: /^Show \d+ needing attention$/ }).click();
        text = await pageText();
        expect(text).toContain(`Piece "${FRUTON}" is not in the registry`);
        expect(text).toContain('Unnamed demonstration not attributed');
        expect(text).toContain('How to fix each one');
        // An exact title is a question; Skip answers it without importing.
        await page.getByRole('button', { name: 'Skip' }).click();
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        let d = await until(app, (x) => x, (x) => x.archiveSources.length === 1);
        // Only the independently supported facts: class 40 and its recording;
        // the unnamed demo stays with the lesson; no piece from a filename.
        expect(d.lessons.find((l) => l.source?.sessionN === 40)!.origin).toBe('archive');
        expect(itemOf(d, FRUTON)).toBeUndefined();
        expect(resource(d, 40, 'نمونه.mp4')!.pieces).toEqual([]);
        expect(d.items.find((i) => i.id === 'it-skip-title')!.source).toBeUndefined();
        expect(itemOf(d, RENG)).toBeUndefined();
        // An unlogged rename is never guessed from a part number.
        expect(d.lessons.flatMap((l) => l.recordings ?? []).some((r) => r.path.endsWith('نمونه-1.mp4'))).toBe(false);
        await goTo(app, '/lessons');
        await page.getByRole('button', { name: /Class 40/ }).first().click();
        expect(await pageText()).toContain('نمونه');

        // The generic report, then the OWNER's explicit confirmation.
        let report = scanTool.attentionReport(scanTool.readStableSource(root));
        expect(report.newIdentities.map((n) => n.key).sort()).toEqual([FRUTON, EBADI].sort());
        ownerConfirms(root, [FRUTON, EBADI, 'چهارپاره-مرادخانی'], SOURCE_EXPECT.ownerLogRows);
        const v1 = scanText(root);
        expect((await publishTool.publishIndex({ transport: fakeTransport(remote), indexText: v1 })).status).toBe('published');
        await refreshArchive(app);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        d = await until(app, (x) => x, (x) => !!itemOf(x, FRUTON));
        // New pieces arrive resting, with no practice, review or deadline.
        for (const key of [FRUTON, EBADI]) {
          const it = itemOf(d, key)!;
          expect([it.status, it.timesPractised, it.totalMinutes, it.nextReviewDate, it.lastResult], key).toEqual(['dormant', 0, 0, undefined, undefined]);
        }
        expect(resource(d, 40, 'نمونه.mp4')!.pieces.sort()).toEqual([FRUTON, EBADI].sort());
        // Session 1: the owner's reference followed the WHOLE logged chain, its
        // own title and notes intact, and the class is the owner's, adopted.
        const class1 = d.lessons.filter((l) => l.source?.sessionN === 1 || l.id === 'L-1');
        expect(class1.map((l) => l.id)).toEqual(['L-1']);
        expect(class1[0]!.recordings).toEqual([{ ...owner.lessons[0]!.recordings![0]!, path: 'session-1-26-09-2023/نمونه-1.mp4' }]);
        expect(class1[0]!.notes).toBe('class one, mine');

        // Lessons and items: every file where the source puts it.
        await goTo(app, '/lessons');
        await page.getByRole('button', { name: /Class 40/ }).first().click();
        text = await pageText();
        expect(text).toContain(FRUTON);
        expect(text).toContain(EBADI);
        expect(text).toContain('in this class’s archive');
        const fruton = itemOf(d, FRUTON)!;
        await goTo(app, `/items/${fruton.id}`);
        text = await pageText();
        expect(text).toContain('نت پیش درامد چهارگاه فروتن');
        expect(text).not.toContain('نت چهارمضراب چهارگاه عبادی');
        expect(text).toContain('نمونه');
        expect(text).not.toContain('ضبط کلاس');
        await goTo(app, `/items/${itemOf(d, EBADI)!.id}`);
        text = await pageText();
        expect(text).toContain('نت چهارمضراب چهارگاه عبادی');
        expect(text).not.toContain('نت پیش درامد چهارگاه فروتن');
        // Hide the demonstration on ONE item.
        await goTo(app, `/items/${fruton.id}`);
        await page.getByRole('button', { name: /^Hide نمونه/ }).first().click();
        await until(app, (x) => x.archiveSources[0]!.suppressions.filter((s) => s.kind === 'resource').length, (n) => n === 1);

        // An UNCHANGED publication makes no commit; Refresh says current.
        const commitBefore = remote.sourceIndex!.commit;
        expect((await publishTool.publishIndex({ transport: fakeTransport(remote), indexText: scanText(root) })).status).toBe('unchanged');
        expect(remote.sourceIndex!.commit).toBe(commitBefore);
        await refreshArchive(app);
        expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);

        // SAME-PATH BYTE REPLACEMENT: the semantic hash is unchanged by design,
        // and the reference opens the NAS's current bytes.
        const scoreRel = `session-40-29-09-2026/نت-${FRUTON}.pdf`;
        const original = readFileSyncFs(joinPath(root, scoreRel), 'utf8');
        const replaced = original.replace(/:0$/, ':1');
        expect(replaced.length).toBe(original.length);
        writeFileSyncFs(joinPath(root, scoreRel), replaced);
        expect(JSON.parse(scanText(root)).contentHash).toBe(JSON.parse(v1).contentHash);
        await goTo(app, `/items/${fruton.id}`);
        const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Open' }).first().click()]);
        await expect.poll(() => popup.content(), { timeout: 10_000 }).toContain(':1');
        await popup.close();

        // === ROUND 2: future classes, independently constructed ==============
        for (const f of SOURCE_CORPUS.future) addFolder(root, f.folder, f.files);
        report = scanTool.attentionReport(scanTool.readStableSource(root));
        expect(report.newIdentities.map((n) => n.key)).toEqual([ZARBI]);
        ownerConfirms(root, [ZARBI, DARAMAD_SHUR], []);
        const v2 = scanText(root);
        // Another publisher lands first; ours re-reads and lands after it.
        const raced = await publishTool.publishIndex({
          transport: fakeTransport(remote, { race: () => publishSourceIndex(remote, v1, 'commit-raced') }),
          indexText: v2,
        });
        expect(raced.status).toBe('published');
        expect(remote.sourceIndex!.text).toBe(v2);
        await refreshArchive(app);
        await page.getByRole('button', { name: `Link to “${ZARBI}”` }).click();
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        d = await until(app, (x) => x, (x) => x.lessons.some((l) => l.source?.sessionN === 45));
        expect(d.items.find((i) => i.id === 'it-same-title')!.source).toEqual({ archiveId: 'setar-classes', pieceKey: ZARBI });
        expect(d.items.filter((i) => i.title === ZARBI)).toHaveLength(1);
        for (const n of [41, 42, 45]) expect(d.lessons.find((l) => l.source?.sessionN === n)!.origin, `class ${n}`).toBe('archive');
        expect(resource(d, 42, 'نمونه-1.mp4')!.pieces).toEqual([ZARBI]);
        expect(resource(d, 45, 'نمونه.mp4')!.pieces).toEqual([DARAMAD_SHUR]);
        // The owner's own takes are never a resource; nothing became a review,
        // a preparation or a deadline.
        expect(d.archiveSources[0]!.sessions.flatMap((s) => s.resources).some((r) => r.path.includes('تمرین-من'))).toBe(false);
        expect(d.reviews.map((r) => r.id)).toEqual(['rev-unrelated']);
        expect(d.lessonAgenda).toEqual([]);
        await goTo(app, '/lessons');
        expect(await pageText()).not.toMatch(/upcoming/i);
        await goTo(app, '/items/it-same-title');
        text = await pageText();
        expect(text).toContain('نت ضربی اصفهان نوری');
        expect(text).toContain('نمونه');
        expect(text).not.toContain('تمرین من');

        // === ROUND 3: a role change, an omission, failures, staleness =========
        const s41 = 'session-41-06-10-2026';
        writeFileSyncFs(joinPath(root, s41, `تصحیح-${RENG}.pdf`), readFileSyncFs(joinPath(root, s41, `نت-${RENG}.pdf`)));
        rmSyncFs(joinPath(root, s41, `نت-${RENG}.pdf`));
        writeFileSyncFs(
          joinPath(root, 'RENAME-LOG.csv'),
          `${readFileSyncFs(joinPath(root, 'RENAME-LOG.csv'), 'utf8')}${s41}/نت-${RENG}.pdf,${s41}/تصحیح-${RENG}.pdf,2026-10-06T10:00:00\n`,
        );
        rmSyncFs(joinPath(root, 'session-2-24-10-2023', 'نت-کرشمه-شور-ردیف-میرزاعبدالله.pdf'));
        const v3 = scanText(root);
        expect((await publishTool.publishIndex({ transport: fakeTransport(remote), indexText: v3 })).status).toBe('published');
        await refreshArchive(app);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        d = await until(app, (x) => x, (x) => x.archiveSources[0]!.indexHash === JSON.parse(v3).contentHash);
        expect(resource(d, 41, `تصحیح-${RENG}.pdf`)).toMatchObject({ role: 'تصحیح', pieces: [RENG] });
        // OMITTED, not deleted: retained, and said so where it is listed.
        expect(resource(d, 2, 'نت-کرشمه-شور-ردیف-میرزاعبدالله.pdf')!.unavailable).toBe(true);
        await goTo(app, `/items/${itemOf(d, 'کرشمه-شور-ردیف-میرزاعبدالله')!.id}`);
        expect(await pageText()).toContain('not described by the latest index');

        // An INTERRUPTED publication leaves the last index in place.
        writeFileSyncFs(joinPath(root, s41, 'نمونه-9.mp4'), 'x');
        await expect(publishTool.publishIndex({ transport: fakeTransport(remote, { interrupt: true }), indexText: scanText(root) })).rejects.toThrow();
        expect(remote.sourceIndex!.text).toBe(v3);
        await refreshArchive(app);
        expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);

        // A REFUSED DIGEST changes nothing.
        const tampered = JSON.parse(v3);
        tampered.pieces[0].form = 'tampered';
        publishSourceIndex(remote, JSON.stringify(tampered), 'commit-tampered');
        const beforeTamper = JSON.stringify((await readPersistedState(app)).state);
        await openSettings(app);
        await page.getByRole('button', { name: 'Refresh Setar archive' }).click();
        await page.getByRole('alert').first().waitFor({ timeout: 30_000 });
        expect(await page.getByRole('alert').first().innerText()).toMatch(/does not match its own content hash/);
        expect(JSON.stringify((await readPersistedState(app)).state)).toBe(beforeTamper);

        // An intentionally STALE publication: named by its hash, loses nothing.
        publishSourceIndex(remote, v0, 'commit-stale');
        await refreshArchive(app);
        expect(await pageText()).toContain(`Index ${JSON.parse(v0).contentHash.slice(0, 12)}`);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        d = await db(app);
        expect(itemOf(d, FRUTON)!.id).toBe(fruton.id);
        expect(d.archiveSources[0]!.pieces.find((p) => p.key === FRUTON)!.unavailable).toBe(true);
        expect(d.lessons.find((l) => l.source?.sessionN === 45)).toBeDefined();
        publishSourceIndex(remote, v3, 'commit-current');
        await refreshArchive(app);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        d = await until(app, (x) => x, (x) => !x.archiveSources[0]!.pieces.find((p) => p.key === FRUTON)!.unavailable);
        // The owner's Skip and Hide are exactly where they were put.
        expect(d.archiveSources[0]!.suppressions.map((x) => [x.kind, x.ref, x.itemId ?? null]).sort()).toEqual(
          [
            ['piece', RENG, null],
            ['resource', 'session-40-29-09-2026/نمونه.mp4', fruton.id],
          ].sort(),
        );

        // Nothing unrelated moved; no request reached anything but this
        // machine (the dev server, the local stand-in NAS) or the faked API.
        expect(unrelated(d)).toBe(before);
        const strays = requests.filter((u) => {
          const { protocol, hostname } = new URL(u);
          return !['data:', 'blob:'].includes(protocol) && !['localhost', '127.0.0.1'].includes(hostname) && hostname !== 'api.github.com';
        });
        expect(strays).toEqual([]);
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
        nas.server.close();
        rmSyncFs(root, { recursive: true, force: true });
      }
    }
  }, 900_000);
});

// ---------------------------------------------------------------------------
// ac-11 — Review Setar setup, through its own controls, survives what really
// happens while the owner is reading it: a sync that changes other things and
// brings a row nobody saw, a refused write, a reload, and running it again.
// ---------------------------------------------------------------------------

describe('Review Setar setup, interrupted', () => {
  it('setar setup review is usable through controls and survives interruption', async () => {
    const base = validateDB(OWNER_V16);
    const by = (key: string) => base.items.find((i) => i.source?.pieceKey === key)!;
    const MAHUR = by('درامد-ماهور-ردیف-میرزاعبدالله');
    const TORK2 = by('درامد-دوم-بیات-ترک-ردیف-میرزاعبدالله');
    const ABU_ATA = by('درامد-ابوعطا-ردیف-میرزاعبدالله');
    const RENG_HARBI = by('رنگ-حربی-ماهور-ردیف-میرزاعبدالله');
    const JANG = by('جنگ-شهنازی');
    const SABA = by('چهارمضراب-ماهور-صبا');
    const KERESHMEH_MAHUR = by('کرشمه-ماهور-ردیف-میرزاعبدالله');
    const RIZ = base.items.find((i) => i.id === 'it-riz')!;
    const LATE_TITLE = 'آواز ماهور (از دستگاه دیگر)';
    const untouched = (d: Db) =>
      JSON.stringify([d.blocks, d.reviews, d.lessonAgenda, d.lessons, d.items.map((i) => [i.id, i.notes, i.timesPractised, i.nextReviewDate, i.lastResult])]);

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const where = engine;
      // State-only in both engines: this journey is about the review, and a
      // pulled snapshot must carry every attachment's bytes (sync refuses one
      // that does not), which the fake remote's state-only snapshot cannot.
      const app = await seeded(engine, { ...base, attachments: [] }, { width: 390, height: 844 });
      const { page } = app;
      try {
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        const before = await db(app);

        // --- OPEN: nothing is chosen until the owner chooses ------------------
        await page.getByText('Review Setar setup').click();
        await expect.poll(() => page.getByRole('combobox', { name: 'Instrument to review' }).inputValue()).toBe('inst-setar');
        await page.getByRole('combobox', { name: 'Pathway to place items in' }).selectOption('setar-radif');
        // A source with a near-duplicate on this instrument, and one with the
        // same title on ANOTHER instrument that is never offered.
        const source = page.getByRole('combobox', { name: 'Study source for ردیف-میرزاعبدالله' });
        const offered = await source.locator('option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
        expect(offered, where).toEqual(expect.arrayContaining(['mat-radif', 'mat-radif-borumand', 'create']));
        expect(offered, where).not.toContain('mat-radif-tar');
        await source.selectOption('mat-radif');
        expect(await page.getByText(/Keeping fresh — choose which items \(0 chosen\)/).count(), where).toBe(1);

        // --- EVIDENCE, BEFORE and AFTER are on the row ------------------------
        const mahur = page.getByRole('group', { name: `Setup of ${MAHUR.title}` });
        const shown = await mahur.innerText();
        expect(shown, where).toContain('Kind: composed piece → gusheh (radif) · درامد');
        expect(shown, where).toMatch(/Place: not placed → ماهور/);
        expect(shown, where).toMatch(/Study source: none → ردیف میرزا عبدالله/);
        // A proposed row the owner saw is selected; one they clear stays out.
        expect(await mahur.getByRole('checkbox', { name: /^Kind of / }).isChecked(), where).toBe(true);
        await page.getByRole('group', { name: `Setup of ${TORK2.title}` }).getByRole('checkbox', { name: /^Place of / }).uncheck();
        // An exception asks; a choice is explicit.
        await page.getByRole('combobox', { name: `Place of ${ABU_ATA.title}` }).selectOption('0');
        await page.getByRole('combobox', { name: `Kind of ${RENG_HARBI.title}` }).selectOption('0');

        // --- KEEPING FRESH: a batch, an exclusion, an inclusion ----------------
        // The batch takes only rows without a note; a resting archive piece or
        // a technique item carries one, so it stays out unless chosen by hand.
        await page.getByText(/Keeping fresh — choose which items/).click();
        await page.getByRole('button', { name: 'Choose every item without a note' }).click();
        const fresh = (title: string) => page.getByRole('checkbox', { name: `Keeping fresh: ${title}` });
        expect([await fresh(SABA.title).isChecked(), await fresh(KERESHMEH_MAHUR.title).isChecked()], where).toEqual([true, true]);
        expect([await fresh(RIZ.title).isChecked(), await fresh(JANG.title).isChecked(), await fresh(MAHUR.title).isChecked()], where).toEqual([false, false, false]);
        await fresh(SABA.title).uncheck();
        await fresh(RIZ.title).check();

        // --- ANOTHER DEVICE changes other things, and adds an item --------------
        const pulled = structuredClone(before) as Db;
        const tar = pulled.items.find((i) => i.id === 'it-tar-kereshmeh')!;
        tar.notes = 'edited on the other device';
        pulled.items.push({ ...pulled.items.find((i) => i.id === 'it-own-gusheh')!, id: 'it-late', title: LATE_TITLE, status: 'dormant', persian: { dastgahAvaz: 'ماهور', gusheh: 'آواز' } });
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 99);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await until(app, (x) => x.items.some((i) => i.id === 'it-late'), (v) => v);
        // The late row is SHOWN, and joins nothing; every earlier choice stands.
        const late = page.getByRole('group', { name: `Setup of ${LATE_TITLE}` });
        await late.waitFor({ timeout: 10_000 });
        expect(await late.getByRole('checkbox', { name: /^Place of / }).isChecked(), where).toBe(false);
        expect(await page.getByRole('checkbox', { name: `Keeping fresh: ${LATE_TITLE}` }).isChecked(), where).toBe(false);
        expect(await page.getByRole('group', { name: `Setup of ${TORK2.title}` }).getByRole('checkbox', { name: /^Place of / }).isChecked(), where).toBe(false);
        expect(await page.getByRole('combobox', { name: `Kind of ${RENG_HARBI.title}` }).inputValue(), where).toBe('0');
        const preApply = await db(app);

        // --- A REFUSED WRITE is not "Saved."; Try again writes ----------------
        await breakStorage(page);
        await page.getByRole('button', { name: /^Apply \d+ selected$/ }).click();
        await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
        expect(await page.getByText('Saved.').count(), where).toBe(0);
        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(preApply));
        await repairStorage(page);
        await page.getByRole('button', { name: 'Try again' }).click();
        await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });

        const after = await until(app, (x) => x, (x) => x.items.find((i) => i.id === MAHUR.id)!.itemType === 'gusheh');
        const item = (id: string) => after.items.find((i) => i.id === id)!;
        // Exactly the selected rows, and their fields only.
        expect([item(MAHUR.id).itemType, item(MAHUR.id).persian?.gusheh, item(MAHUR.id).stageId, item(MAHUR.id).materialId], where).toEqual([
          'gusheh',
          'درامد',
          'setar-radif-mahur',
          'mat-radif',
        ]);
        expect(item(TORK2.id).stageId, where).toBe(TORK2.stageId);
        expect(item(TORK2.id).itemType, where).toBe('gusheh');
        expect(item(ABU_ATA.id).stageId, where).toBe('setar-radif-abu-ata');
        expect(item(RENG_HARBI.id).itemType, where).toBe('gusheh');
        expect([item(RIZ.id).status, item(KERESHMEH_MAHUR.id).status], where).toEqual(['maintenance', 'maintenance']);
        expect([item(SABA.id).status, item(JANG.id).status, item(MAHUR.id).status], where).toEqual([SABA.status, JANG.status, MAHUR.status]);
        // The late item and the other device's edit are exactly as pulled.
        expect(item('it-late'), where).toEqual(pulled.items.find((i) => i.id === 'it-late'));
        expect(item('it-tar-kereshmeh').notes, where).toBe('edited on the other device');
        // An existing source was used: none was made.
        expect(after.materials.map((m) => m.id).sort(), where).toEqual(before.materials.map((m) => m.id).sort());
        // Notes, history, reviews, dates, ratings and classes never move.
        expect(untouched(after), where).toBe(untouched({ ...preApply, items: preApply.items }));

        // --- RELOAD and REPEAT: what is done stays done; nothing doubles ---------
        await reload(app);
        await openSettings(app);
        await page.getByText('Review Setar setup').click();
        await page.getByRole('combobox', { name: 'Pathway to place items in' }).selectOption('setar-radif');
        await page.getByRole('combobox', { name: 'Study source for ردیف-میرزاعبدالله' }).selectOption('mat-radif');
        // Applied rows are done; placing it in a catalogue stage now ASKS which
        // suggestion it answers (the radif list is partial), choosing none.
        const again = page.getByRole('group', { name: `Setup of ${MAHUR.title}` });
        expect(await again.getByRole('checkbox').count(), where).toBe(0);
        expect(await again.getByRole('combobox', { name: `Suggestion of ${MAHUR.title}` }).inputValue(), where).toBe('-1');
        expect(await page.getByRole('combobox', { name: `Kind of ${RENG_HARBI.title}` }).count(), where).toBe(0);
        // The row the owner cleared is offered again, as a proposal, not applied.
        expect(await page.getByRole('group', { name: `Setup of ${TORK2.title}` }).getByRole('checkbox', { name: /^Place of / }).count(), where).toBe(1);
        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(after));
        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-6 companion — the five association readers (a class's "Worked on" list
// and its link picker; an item's Connected to summary, Connections list and
// link picker) agree through Unlink, Relink and a reload, and a derived
// association never becomes owner history.
// ---------------------------------------------------------------------------

describe('archive associations, through every reader', () => {
  it('archive associations unlink and relink through every reader and survive a reload', async () => {
    const base = validateDB(OWNER_V16);
    const by = (key: string) => base.items.find((i) => i.source?.pieceKey === key)!;
    const KERESHMEH_M = by('کرشمه-ماهور-ردیف-میرزاعبدالله');
    const SABA = by('چهارمضراب-ماهور-صبا');
    const RIZ = base.items.find((i) => i.id === 'it-riz')!;
    const L7 = base.lessons.find((l) => l.source?.sessionN === 7)!;
    const L9 = base.lessons.find((l) => l.source?.sessionN === 9)!;

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const where = engine;
      const app = await seeded(engine, base, { width: 390, height: 844 }, OWNER_V16.files);
      const { page } = app;
      const text = () => page.locator('main').innerText();
      // Every reader starts from a cold mount: a same-hash navigation would
      // keep the class card the last step opened (the harness never goTo's
      // the current route).
      const fresh = async (path: string) => {
        if (page.url().endsWith(`#${path}`)) await goTo(app, '/settings');
        await goTo(app, path);
      };
      /** What every reader says about one (item, class) pair. */
      const readers = async (itemId: string, lesson: typeof L7) => {
        await fresh(`/items/${itemId}`);
        const itemText = await text();
        const pickerItem = await page
          .getByRole('combobox', { name: 'Link this item to a lesson' })
          .locator('option')
          .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value))
          .catch(() => [] as string[]);
        await fresh('/lessons');
        await page.getByRole('button', { name: new RegExp(`Class ${lesson.number}\\b`) }).first().click();
        const title = base.items.find((i) => i.id === itemId)!.title;
        const inList = await page.getByRole('button', { name: `Unlink ${title} from this lesson — the item is kept` }).count();
        await page.getByRole('button', { name: 'Link existing…' }).click();
        const pickerLesson = await page
          .getByRole('combobox', { name: 'Link an existing item to this lesson' })
          .locator('option')
          .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
        return {
          summary: new RegExp(`Lessons:[^\\n]*${lesson.date}`).test(itemText),
          connections: itemText.includes(`Class on ${lesson.date}`),
          inList: inList === 1,
          offeredOnItem: pickerItem.includes(lesson.id),
          offeredOnLesson: pickerLesson.includes(itemId),
        };
      };
      const LINKED = { summary: true, connections: true, inList: true, offeredOnItem: false, offeredOnLesson: false };
      const UNLINKED = { summary: false, connections: false, inList: false, offeredOnItem: true, offeredOnLesson: true };
      const owned = (d: Db) => JSON.stringify([d.lessons.map((l) => [l.id, l.itemIds ?? []]), d.lessonAgenda]);
      try {
        const start = await db(app);
        expect(await readers(KERESHMEH_M.id, L7), where).toEqual(LINKED);
        // Its archive material is the archive's, not the association's.
        await fresh(`/items/${KERESHMEH_M.id}`);
        expect(await text(), where).toContain('نمونه');

        // --- DERIVED: Unlink from the item, Relink from the class ---------------
        await page.getByText(`Class on ${L7.date}`).locator('xpath=..').getByRole('button', { name: 'Unlink' }).click();
        let d = await until(app, (x) => x, (x) => x.archiveSources[0]!.suppressions.length === 2);
        expect(d.archiveSources[0]!.suppressions.map((x) => [x.kind, x.ref]), where).toContainEqual(['link', `7:${KERESHMEH_M.source!.pieceKey}`]);
        expect(owned(d), where).toBe(owned(start));
        expect(await readers(KERESHMEH_M.id, L7), where).toEqual(UNLINKED);
        await fresh(`/items/${KERESHMEH_M.id}`);
        expect(await text(), where).toContain('نمونه');

        await fresh('/lessons');
        await page.getByRole('button', { name: /Class 7\b/ }).first().click();
        await page.getByRole('button', { name: 'Link existing…' }).click();
        await page.getByRole('combobox', { name: 'Link an existing item to this lesson' }).selectOption(KERESHMEH_M.id);
        d = await until(app, (x) => x, (x) => x.archiveSources[0]!.suppressions.length === 1);
        // Only ITS suppression was lifted, and nothing was copied into itemIds.
        expect(d.archiveSources[0]!.suppressions, where).toEqual(start.archiveSources[0]!.suppressions);
        expect(owned(d), where).toBe(owned(start));
        expect(await readers(KERESHMEH_M.id, L7), where).toEqual(LINKED);
        expect(await page.getByText('in this class’s archive').count(), where).toBeGreaterThan(0);

        // The class-9 unlink the owner made earlier: Relink from the ITEM.
        expect(await readers(SABA.id, L9), where).toEqual(UNLINKED);
        await fresh(`/items/${SABA.id}`);
        await page.getByRole('combobox', { name: 'Link this item to a lesson' }).selectOption(L9.id);
        d = await until(app, (x) => x, (x) => x.archiveSources[0]!.suppressions.length === 0);
        expect(owned(d), where).toBe(owned(start));

        // --- MANUAL: the owner's own link is history in itemIds ---------------
        await fresh(`/items/${RIZ.id}`);
        await page.getByRole('combobox', { name: 'Link this item to a lesson' }).selectOption(L7.id);
        d = await until(app, (x) => x, (x) => (x.lessons.find((l) => l.id === L7.id)!.itemIds ?? []).includes(RIZ.id));
        expect(await readers(RIZ.id, L7), where).toEqual(LINKED);
        await fresh('/lessons');
        await page.getByRole('button', { name: /Class 7\b/ }).first().click();
        await page.getByRole('button', { name: `Unlink ${RIZ.title} from this lesson — the item is kept` }).click();
        d = await until(app, (x) => x, (x) => !(x.lessons.find((l) => l.id === L7.id)!.itemIds ?? []).includes(RIZ.id));
        // A manual unlink writes no archive suppression.
        expect(d.archiveSources[0]!.suppressions, where).toEqual([]);
        await fresh(`/items/${RIZ.id}`);
        await page.getByRole('combobox', { name: 'Link this item to a lesson' }).selectOption(L7.id);
        await until(app, (x) => (x.lessons.find((l) => l.id === L7.id)!.itemIds ?? []).includes(RIZ.id), (v) => v);

        // --- RELOAD: every reader says the same -------------------------------
        await reload(app);
        expect(await readers(KERESHMEH_M.id, L7), where).toEqual(LINKED);
        expect(await readers(SABA.id, L9), where).toEqual(LINKED);
        expect(await readers(RIZ.id, L7), where).toEqual(LINKED);
        d = await db(app);
        expect(d.lessons.find((l) => l.id === L7.id)!.itemIds, where).toEqual([RIZ.id]);
        expect(d.lessons.find((l) => l.id === L9.id)!.itemIds ?? [], where).toEqual([]);
        expect(d.lessonAgenda, where).toEqual([]);
        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-8 companion — the difference row sends the TYPED value it was decided
// against. Another device swaps the owner's literal for the term of the same
// spelling while the preview is open: a label premise would accept the stale
// choice; this one is refused, said, re-previewed, and nothing is written.
// ---------------------------------------------------------------------------

describe('archive metadata choices, from the screen', () => {
  it('archive metadata controls send the typed premise and re-preview a stale choice', async () => {
    const seed = validateDB(OWNER_V16);
    const KEY = 'اتود-وزیری';
    const itemId = seed.items.find((i) => i.source?.pieceKey === KEY)!.id;
    // The owner typed the maestro's full name as text — the label of a term.
    const base: Db = {
      ...seed,
      attachments: [],
      items: seed.items.map((i) => (i.id === itemId ? { ...i, persian: { ...i.persian, composer: 'علی‌نقی وزیری' } } : i)),
    };
    const graph = base.archiveSources[0]!;
    const corrected = await indexFor(graph, (i) => {
      for (const p of i.pieces as { key: string; composer?: string }[]) if (p.key === KEY) p.composer = 'ابوالحسن صبا';
    });

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const where = engine;
      const app = await seeded(engine, base, { width: 390, height: 844 });
      const { page } = app;
      const row = () => page.getByRole('group', { name: `composer of ${KEY}` });
      try {
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        publishSourceIndex(remote, corrected, 'idx-corrected');
        await refreshArchive(app);
        await row().getByRole('button', { name: 'Use archive value' }).click();
        expect(await row().getByRole('button', { name: 'Use archive value' }).getAttribute('aria-pressed'), where).toBe('true');

        // Another device makes the SAME-LOOKING value a term reference.
        const pulled = structuredClone(await db(app)) as Db;
        pulled.items = pulled.items.map((i) => (i.id === itemId ? { ...i, persian: { ...i.persian, composer: { termId: 'composer:vaziri' } } } : i));
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 99);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await until(app, (x) => JSON.stringify(x.items.find((i) => i.id === itemId)!.persian?.composer), (v) => v === '{"termId":"composer:vaziri"}');
        const beforeApply = await db(app);

        await page.getByRole('button', { name: 'Apply' }).click();
        // Refused and SAID; the fresh preview is back with the owner's value kept.
        await page.getByRole('status').filter({ hasText: 'has changed since' }).waitFor({ timeout: 15_000 });
        expect(await row().getByRole('button', { name: 'Keep my value' }).getAttribute('aria-pressed'), where).toBe('true');
        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(beforeApply));

        // Chosen again against what is there NOW: written once, nothing else moves.
        await row().getByRole('button', { name: 'Use archive value' }).click();
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        const after = await until(app, (x) => x, (x) => JSON.stringify(x.items.find((i) => i.id === itemId)!.persian?.composer) !== '{"termId":"composer:vaziri"}');
        const was = beforeApply.items.find((i) => i.id === itemId)!;
        const now = after.items.find((i) => i.id === itemId)!;
        // The registry's own text, as adoption always writes it — never a guessed id.
        expect(now.persian?.composer, where).toBe('ابوالحسن صبا');
        expect({ ...now.persian, composer: null }, where).toEqual({ ...was.persian, composer: null });
        expect([now.notes, now.status, now.itemType, now.timesPractised], where).toEqual([was.notes, was.status, was.itemType, was.timesPractised]);
        expect(after.items.filter((i) => i.id !== itemId), where).toEqual(beforeApply.items.filter((i) => i.id !== itemId));

        // Settled: a reload and another refresh offer nothing about it.
        await reload(app);
        await refreshArchive(app);
        expect(await row().count(), where).toBe(0);
        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});
