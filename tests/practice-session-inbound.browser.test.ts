import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  connectSync,
  exportBackup,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  persistedDb,
  persistedUntil,
  publishRemote,
  readPersistedState,
  reload,
  remoteStateText,
  syncMessage,
  syncNow,
  writePersistedState,
  type Engine,
} from './practiceBrowser';
import v16Text from './fixtures/practice-session-v16.json?raw';
import { SCHEMA_VERSION } from '../src/domain/types';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-14 — every door a database can arrive through reaches the SAME v17 model,
// and none of them replaces live practice or installs what it has not checked.
// Hydration (`migrate` AND `merge`), the Settings importer (state and full),
// a sync pull, "Take the GitHub copy", the archive restore and the cold-start
// recovery control are all driven for real, then read back from IndexedDB.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-23T09:00:00');
type Db = Record<string, unknown> & {
  schemaVersion: number;
  items: Record<string, unknown>[];
  blocks: Record<string, unknown>[];
};
const v16Db = () => (JSON.parse(v16Text) as { data: Db }).data;
const wrap = (data: unknown, files?: unknown) =>
  JSON.stringify({ app: 'practice-compass', schemaVersion: (data as Db).schemaVersion, exportedAt: CLOCK.toISOString(), data, ...(files === undefined ? {} : { files }) });
const ATTACHMENT = { id: 'att-1', ownerId: 'i-unfinished', mime: 'image/png', name: 'score.png', data: Buffer.from('practice-session attachment bytes').toString('base64') };

/** A legacy routine run in progress, as a v16 device persisted it: no skip flags, one old Skip that kept 50 s. */
const LEGACY_RUN = {
  routineId: 'rt-warm',
  shortOnTime: false,
  authoredSegments: [
    { label: 'Open strings', minutes: 3, itemId: 'i-interval', essential: true },
    { label: 'Bars 1–8 slowly', minutes: 4, itemId: 'i-part' },
    { label: 'Breathe', minutes: 1 },
  ],
  segs: [
    { itemId: 'i-interval', seconds: 50 },
    { itemId: 'i-part', seconds: 240 },
    { seconds: 60 },
  ],
  accumulatedSeconds: 170,
  running: false,
  startedAt: '2026-10-23T08:40:00.000Z',
};

const attachmentText = (page: import('playwright').Page) =>
  page.evaluate(
    () =>
      new Promise<string | null>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const dbh = req.result;
          const get = dbh.transaction('attachments', 'readonly').objectStore('attachments').get('att-1');
          get.onsuccess = () => {
            const row = get.result as { blob?: Blob } | undefined;
            if (!row?.blob) {
              dbh.close();
              resolve(null);
              return;
            }
            void row.blob.text().then((t) => {
              dbh.close();
              resolve(t);
            });
          };
          get.onerror = () => reject(get.error);
        };
      }),
  );

describe('every inbound door reaches the same v17 model', () => {
  it('session model inbound doors preserve live practice and fail before replacing data', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await openPracticeApp({ now: CLOCK, engine });
      const { page } = app;
      try {
        // --- 1. FULL IMPORT of a v16 backup (bytes where Blobs can be seeded)
        const files = engine === 'chromium' ? [ATTACHMENT] : undefined;
        const v16 = v16Db();
        await importBackup(app, 'v16.json', wrap(engine === 'chromium' ? v16 : { ...v16, attachments: [] }, files));
        expect(await importOutcome(app), engine).toContain('Imported');
        await reload(app);
        let db = (await persistedDb(app)) as unknown as Db;
        expect(db.schemaVersion, engine).toBe(SCHEMA_VERSION);
        // Legacy meaning stays unresolved: no scope, no intention invented.
        expect(db.blocks.map((b) => 'scope' in b), engine).toEqual([false, false, false, false, false]);
        expect(db.items.map((i) => 'returnIntent' in i), engine).toEqual(v16.items.map(() => false));
        expect(db.items.find((i) => i.id === 'i-unfinished')!.nextReviewDate, engine).toBe('2027-01-21');
        if (engine === 'chromium') expect(await attachmentText(page), engine).toBe('practice-session attachment bytes');

        // --- 2. HYDRATION `migrate`: a v16 device, a legacy run mid-way --------
        const current = await readPersistedState(app);
        await writePersistedState(app, { ...(current.state as object), db: { ...v16, attachments: [] }, activeRoutine: LEGACY_RUN, active: null }, 16);
        await reload(app);
        db = (await persistedDb(app)) as unknown as Db;
        expect(db.schemaVersion, engine).toBe(SCHEMA_VERSION);
        let state = (await readPersistedState(app)).state as { activeRoutine: typeof LEGACY_RUN | null };
        // The run survives exactly, paused, its old Skip still crediting 50 s.
        expect(state.activeRoutine, engine).toEqual(LEGACY_RUN);
        await goTo(app, '/routine/rt-warm');
        await page.getByRole('button', { name: 'Resume' }).waitFor();
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
        db = (await persistedDb(app)) as unknown as Db;
        // 50 s on the first item (its legacy skip), 120 s into the second.
        expect(db.blocks.slice(-2).map((b) => [b.practiceItemId, b.durationMinutes, b.result]).sort(), engine).toEqual([
          ['i-interval', 1, 'not_logged'],
          ['i-part', 2, 'not_logged'],
        ]);

        // --- 3. HYDRATION `merge` (version already current): refusals change nothing
        const good = await readPersistedState(app);
        const goodDb = (good.state as { db: Db }).db;
        for (const [name, broken, says] of [
          ['an unknown evidence scope', { db: { ...goodDb, blocks: goodDb.blocks.map((b, i) => (i === 0 ? { ...b, scope: 'chunk' } : b)) } }, /evidence scope/],
          ['an unknown return intention', { db: { ...goodDb, items: goodDb.items.map((it, i) => (i === 0 ? { ...it, returnIntent: 'someday' } : it)) } }, /return intention/],
          ['an unreadable run', { activeRoutine: { ...LEGACY_RUN, segs: [{ seconds: 'lots' }, ...LEGACY_RUN.segs.slice(1)] } }, /routine run/],
        ] as const) {
          await writePersistedState(app, { ...(good.state as object), ...broken }, SCHEMA_VERSION);
          const written = JSON.stringify(await readPersistedState(app));
          await page.reload();
          await page.getByText('Your saved data couldn’t be loaded safely').waitFor({ timeout: 20_000 });
          expect(await page.locator('body').innerText(), `${engine} ${name}`).toMatch(says);
          // Rendering the refusal wrote nothing.
          expect(JSON.stringify(await readPersistedState(app)), `${engine} ${name}`).toBe(written);
        }
        // COLD-START RECOVERY is the same validated door: a v16 backup gets the owner back in.
        await page.getByLabel('Restore backup file').setInputFiles({ name: 'v16.json', mimeType: 'application/json', buffer: Buffer.from(wrap({ ...v16, attachments: [] }), 'utf8') });
        await page.locator('main').waitFor({ timeout: 20_000 });
        await goTo(app, '/repertoire');
        await reload(app);
        expect(((await persistedDb(app)) as unknown as Db).schemaVersion, engine).toBe(SCHEMA_VERSION);
        // A NEWER schema is refused with update guidance, bytes untouched.
        const restored = await readPersistedState(app);
        await writePersistedState(app, { ...(restored.state as object), db: { ...(restored.state as { db: Db }).db, schemaVersion: SCHEMA_VERSION + 1 } }, SCHEMA_VERSION + 1);
        const newer = JSON.stringify(await readPersistedState(app));
        await page.reload();
        await page.getByText(/newer version/i).first().waitFor({ timeout: 20_000 });
        expect(await page.locator('body').innerText(), engine).toMatch(/Update the app/i);
        expect(JSON.stringify(await readPersistedState(app)), engine).toBe(newer);
        await writePersistedState(app, restored.state, SCHEMA_VERSION);
        await page.reload();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });

        // --- 4. STATE IMPORT: invalid v17 semantics refused, nothing replaced --
        const before = JSON.stringify(await readPersistedState(app));
        const live = ((await persistedDb(app)) as unknown as Db);
        for (const [name, text, says] of [
          ['bad scope', wrap({ ...live, attachments: [], blocks: live.blocks.map((b, i) => (i === 0 ? { ...b, scope: 7 } : b)) }), /evidence scope/],
          ['bad intention', wrap({ ...live, attachments: [], items: live.items.map((it, i) => (i === 0 ? { ...it, returnIntent: 'later' } : it)) }), /return intention/],
          ['too new', wrap({ ...live, attachments: [], schemaVersion: SCHEMA_VERSION + 1 }), /newer version/],
        ] as const) {
          await importBackup(app, `${name}.json`, text);
          expect(await importOutcome(app), `${engine} ${name}`).toMatch(/Import failed/);
          expect(await importOutcome(app), `${engine} ${name}`).toMatch(says);
          expect(JSON.stringify(await readPersistedState(app)), `${engine} ${name}`).toBe(before);
        }

        // --- 5. LIVE PRACTICE blocks a deliberate replacement and defers sync --
        await goTo(app, '/items/i-auto');
        await page.getByRole('button', { name: 'Start a block' }).click();
        await page.getByRole('button', { name: 'Pause' }).click();
        const guarded = JSON.stringify(await readPersistedState(app));
        await importBackup(app, 'while-practising.json', wrap({ ...v16, attachments: [] }));
        expect(await importOutcome(app), engine).toMatch(/unfinished practice block/);
        expect(JSON.stringify(await readPersistedState(app)), engine).toBe(guarded);
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        await expect.poll(() => syncMessage(page)).toMatch(/Waiting on an unfinished practice block/);
        expect(remote.calls, engine).toEqual([]);
        await goTo(app, '/active');
        await page.getByRole('button', { name: 'Discard block' }).click();

        // --- 6. SYNC PULL of a valid v17 snapshot, then an invalid one ---------
        await goTo(app, '/settings');
        await syncNow(app);
        const local = (await persistedDb(app)) as unknown as Db;
        const pulled = { ...local, attachments: [], items: local.items.map((it) => (it.id === 'i-unfinished' ? { ...it, returnIntent: 'keep_fresh' } : it)) };
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 50);
        await syncNow(app);
        expect(await syncMessage(page), engine).toMatch(/Brought the GitHub copy/i);
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.items.find((it) => it.id === 'i-unfinished')?.returnIntent, (v) => v === 'keep_fresh');
        const afterPull = JSON.stringify(await persistedDb(app));
        const badPull = { ...pulled, blocks: pulled.blocks.map((b, i) => (i === 0 ? { ...b, scope: 'part' } : b)) };
        publishRemote(remote, remoteStateText(badPull), await hashState(badPull), 51);
        await syncNow(app);
        expect(await syncMessage(page), engine).toMatch(/evidence scope/i);
        expect(JSON.stringify(await persistedDb(app)), engine).toBe(afterPull);

        // --- 7. KEEP REMOTE on a both-changed conflict, then RESTORE the archive
        const mine = { ...pulled, items: pulled.items.map((it) => (it.id === 'i-user' ? { ...it, returnIntent: 'keep_fresh' } : it)) };
        await importBackup(app, 'local-change.json', wrap(mine, []));
        expect(await importOutcome(app), engine).toContain('Imported');
        const theirs = { ...pulled, blocks: pulled.blocks.map((b, i) => (i === 0 ? { ...b, scope: 'whole' } : b)) };
        publishRemote(remote, remoteStateText(theirs), await hashState(theirs), 52);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await page.getByRole('button', { name: 'Take the GitHub copy' }).click();
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.blocks[0]?.scope, (v) => v === 'whole');
        await page.getByRole('button', { name: 'Restore it' }).click();
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.items.find((it) => it.id === 'i-user')?.returnIntent, (v) => v === 'keep_fresh');
        expect(((await persistedDb(app)) as unknown as Db).blocks[0].scope, engine).toBeUndefined();

        // --- 8. TWO CLOCKS from an old build: both frozen, nothing lost --------
        const now = await readPersistedState(app);
        const ago = (minutes: number) => new Date(CLOCK.getTime() - minutes * 60_000).toISOString();
        const dual = {
          ...(now.state as object),
          active: { itemId: 'i-auto', instrumentId: 'inst-setar', mode: 'repair', focus: 'tone', targetMinutes: 10, startedAt: ago(10), accumulatedSeconds: 120, running: true, segmentStartedAt: ago(1) },
          activeRoutine: { ...LEGACY_RUN, running: true, runningSince: ago(1) },
        };
        await writePersistedState(app, dual, SCHEMA_VERSION);
        await reload(app);
        state = (await readPersistedState(app)).state as never;
        const frozen = state as unknown as { active: { running: boolean; accumulatedSeconds: number }; activeRoutine: { running: boolean; accumulatedSeconds: number } };
        expect([frozen.active.running, frozen.activeRoutine.running], engine).toEqual([false, false]);
        // Each kept what had genuinely elapsed: 120 s + at least the minute since its segment began, 170 s + a minute.
        expect(frozen.active.accumulatedSeconds, engine).toBeGreaterThanOrEqual(180);
        expect(frozen.activeRoutine.accumulatedSeconds, engine).toBeGreaterThanOrEqual(230);
        // An ordinary SINGLE running routine is not frozen by the same door.
        const single = { ...(now.state as object), active: null, activeRoutine: { ...LEGACY_RUN, running: true, runningSince: ago(1) } };
        await writePersistedState(app, single, SCHEMA_VERSION);
        await reload(app);
        expect(((await readPersistedState(app)).state as { activeRoutine: { running: boolean } }).activeRoutine.running, engine).toBe(true);
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }

    // --- 9. THE OTHER DEVICE, NOT YET UPDATED: it refuses a v17 file whole ----
    // The app as it was before this change (v16), from a disposable worktree.
    const root = join(mkdtempSync(join(tmpdir(), 'pc-v16-')), 'app');
    execFileSync('git', ['worktree', 'add', '--detach', root, 'dc964b3b'], { stdio: 'pipe' });
    symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
    const fresh = await openPracticeApp({ now: CLOCK });
    const old = await openPracticeApp({ now: CLOCK, root });
    try {
      await importBackup(fresh, 'v16.json', wrap({ ...v16Db(), attachments: [] }));
      expect(await importOutcome(fresh)).toContain('Imported');
      await reload(fresh);
      const v17Export = await exportBackup(fresh);
      expect(JSON.parse(v17Export).schemaVersion).toBe(SCHEMA_VERSION);
      await importBackup(old, 'v16.json', wrap({ ...v16Db(), attachments: [] }));
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const oldBytes = JSON.stringify(await readPersistedState(old));
      await importBackup(old, 'v17.json', v17Export);
      expect(await importOutcome(old)).toMatch(/newer version/i);
      // Refused whole — never stamped down with the new fields quietly dropped.
      expect(JSON.stringify(await readPersistedState(old))).toBe(oldBytes);
      expect(old.pageErrors.map((e) => e.message)).toEqual([]);
      expect(fresh.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await fresh.close();
      await old.close();
      try {
        execFileSync('git', ['worktree', 'remove', '--force', root], { stdio: 'pipe' });
      } catch {
        rmSync(root, { recursive: true, force: true });
      }
    }
  }, 900_000);
});
