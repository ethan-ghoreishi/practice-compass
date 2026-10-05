import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  blobProjection,
  connectSync,
  exportBackup,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  openSettings,
  persistedDb,
  publishRemote,
  publishSourceIndex,
  readPersistedState,
  reload,
  remoteStateText,
  stampSourceIndex,
  syncMessage,
  writePersistedState,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';
import OWNER_V15_TEXT from './fixtures/setar-practice-owner-v15.json?raw';
import OWNER_V16_TEXT from './fixtures/setar-practice-owner-v16.json?raw';
import { hashState } from '../src/domain/canonical';
import { parseSourceIndex } from '../src/domain/sourceArchive';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';

// ---------------------------------------------------------------------------
// ac-2 — `studySource` (schema 16) through every door a database or an index
// enters by, in both engines: Settings import (full and state-only), a sync
// pull, "Take the GitHub copy", the pre-sync archive restore, both hydration
// branches, cold-start recovery, a fetched index and an export. Absent stays
// absent (unknown legacy evidence), '' stays an explicit none, any other text
// stays verbatim; a wrong type is refused before anything — bytes included —
// is replaced. The pre-lane app reads the additive index with every old
// meaning intact, refuses a v16 database, and restores its own backup.
// Chromium carries attachment bytes; WebKit cannot store a Blob in IndexedDB
// under automation, so its journey is state-only.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-05T09:00:00.000Z');
const T = CLOCK.toISOString();
const OWNER_V16: { data: PracticeDB; files: { id: string }[] } = JSON.parse(OWNER_V16_TEXT);
const OWNER_V15: { data: PracticeDB } = JSON.parse(OWNER_V15_TEXT);
type Db = PracticeDB;

/** One piece in each provenance state the matrix names. */
const ABSENT = 'ABSENT';
function provenanceDb(): Db {
  const d = structuredClone(OWNER_V16.data);
  const pieces = d.archiveSources[0]!.pieces as (Db['archiveSources'][number]['pieces'][number] & { studySource?: string })[];
  delete pieces[0]!.studySource; // missing: unknown legacy evidence
  pieces[1]!.studySource = ''; // empty: explicitly none declared
  pieces[2]!.studySource = 'ردیف-میرزاعبدالله'; // known
  pieces[3]!.studySource = 'منبعی-که-برنامه-نمی‌شناسد'; // unknown text, kept verbatim
  return d;
}
const V16 = provenanceDb();
const provenance = (d: { archiveSources: { pieces: { key: string; studySource?: unknown }[] }[] }) =>
  d.archiveSources[0]!.pieces.map((p) => [p.key, 'studySource' in p ? p.studySource : ABSENT] as const);
const EXPECTED = provenance(V16);

const wrap = (data: unknown, files?: unknown) =>
  JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data, ...(files === undefined ? {} : { files }) });
/** The same database with ONE piece's provenance of the wrong type. */
const malformed = (d: Db, bad: unknown): Db => {
  const out = structuredClone(d);
  (out.archiveSources[0]!.pieces[0] as unknown as Record<string, unknown>).studySource = bad;
  return out;
};
const BAD_VALUES: unknown[] = [null, 5, { title: 'ردیف' }];
const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const stateBytes = async (app: PracticeApp) => JSON.stringify(await readPersistedState(app));

/** The published index for the persisted graph, re-stamped as the scanner would. */
async function indexOf(graph: Db['archiveSources'][number], change: (pieces: Record<string, unknown>[]) => void) {
  const pieces = graph.pieces.map(({ unavailable: _u, ...p }) => (void _u, { ...p })) as Record<string, unknown>[];
  change(pieces);
  return stampSourceIndex({
    format: 'setar-archive-index',
    version: 1,
    archiveId: graph.id,
    pieces,
    sessions: graph.sessions.map(({ unavailable: _u, ...s }) => (void _u, { ...s, resources: s.resources.map(({ unavailable: _r, ...r }) => (void _r, r)) })),
    renames: graph.renames,
    diagnostics: graph.diagnostics,
  });
}

/** The commit this lane started from — the app a rollback goes back to. */
const BASELINE_COMMIT = '93dadcb10cbda2650a53829b76538bcd6b25e133';
function checkoutBaselineApp(): { root: string; dispose: () => void } {
  const root = join(mkdtempSync(join(tmpdir(), 'pc-setar-v15-baseline-')), 'app');
  execFileSync('git', ['worktree', 'add', '--detach', root, BASELINE_COMMIT], { stdio: 'pipe' });
  // package.json and package-lock.json are outside this lane's scope and so
  // byte-identical: the baseline's dependency tree IS this checkout's.
  symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
  return {
    root,
    dispose: () => {
      try {
        execFileSync('git', ['worktree', 'remove', '--force', root], { stdio: 'pipe' });
      } catch {
        rmSync(root, { recursive: true, force: true });
      }
    },
  };
}

describe('study provenance at every saved-data boundary', () => {
  it('setar study provenance survives compatible indexes and every saved data boundary', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const where = engine;
      const withBytes = engine === 'chromium';
      // WebKit: the same database without its one attachment row.
      const data = withBytes ? V16 : { ...V16, attachments: [] };
      const full = withBytes ? wrap(data, OWNER_V16.files) : wrap(data);
      const app = await openPracticeApp({ now: CLOCK, engine });
      const { page } = app;
      try {
        // --- FULL IMPORT: provenance and bytes, as given ------------------------
        await importBackup(app, 'v16.json', full);
        expect(await importOutcome(app), where).toContain('Imported');
        await reload(app);
        expect(provenance(await db(app)), where).toEqual(EXPECTED);
        const bytes = withBytes ? await blobProjection(app) : {};
        if (withBytes) expect(Object.keys(bytes), where).toHaveLength(1);
        let good = await stateBytes(app);

        // --- REFUSED BEFORE ANY REPLACEMENT: wrong types and a newer schema ----
        const otherBytes = withBytes ? OWNER_V16.files.map((f) => ({ ...f, data: Buffer.from('different bytes').toString('base64') })) : undefined;
        for (const bad of BAD_VALUES) {
          await importBackup(app, 'bad.json', wrap(malformed(data, bad), otherBytes));
          expect(await importOutcome(app), `${where} ${JSON.stringify(bad)}`).toMatch(/Import failed.*study source/s);
          expect(await stateBytes(app), where).toBe(good);
          if (withBytes) expect(await blobProjection(app), `${where}: bytes untouched`).toEqual(bytes);
        }
        await importBackup(app, 'newer.json', JSON.stringify({ ...JSON.parse(full), schemaVersion: SCHEMA_VERSION + 1, data: { ...data, schemaVersion: SCHEMA_VERSION + 1 } }));
        expect(await importOutcome(app), where).toMatch(/newer version/i);
        expect(await stateBytes(app), where).toBe(good);

        // --- STATE-ONLY IMPORT --------------------------------------------------
        await importBackup(app, 'state-only.json', wrap({ ...data, items: data.items.map((i, n) => (n === 0 ? { ...i, notes: 'state-only' } : i)) }));
        expect(await importOutcome(app), where).toContain('Imported');
        await expect.poll(async () => (await db(app)).items[0]!.notes, { timeout: 30_000 }).toBe('state-only');
        expect(provenance(await db(app)), where).toEqual(EXPECTED);

        // --- A SYNC PULL, a refused one, Take the GitHub copy, archive restore --
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        const pushed = await db(app);
        // The fake remote's manifest carries no attachment bytes, and sync
        // rightly refuses a snapshot naming a file it does not carry — so the
        // sync doors are state-only in both engines (bytes are compared at the
        // import, export and recovery doors).
        const pulled = { ...pushed, attachments: [], items: pushed.items.map((i, n) => (n === 0 ? { ...i, notes: 'from the other device' } : i)) };
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 900);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await expect.poll(() => syncMessage(page), { timeout: 60_000 }).toMatch(/Brought the GitHub copy/i);
        await expect.poll(async () => (await db(app)).items[0]!.notes, { timeout: 30_000 }).toBe('from the other device');
        expect(provenance(await db(app)), where).toEqual(EXPECTED);

        const beforeBadPull = await stateBytes(app);
        const badRemote = malformed(pulled, 5);
        publishRemote(remote, remoteStateText(badRemote), await hashState(badRemote), 901);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await expect.poll(async () => (await syncMessage(page)).includes('study source'), { timeout: 60_000 }).toBe(true);
        expect(await stateBytes(app), where).toBe(beforeBadPull);

        // Both changed: the owner edits here, another device there.
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 902);
        await goTo(app, `/items/${pulled.items[1]!.id}`);
        await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
        await page.getByRole('textbox', { name: 'Title' }).fill('edited on this device');
        await page.getByRole('button', { name: 'Save changes' }).click();
        await goTo(app, '/settings');
        const keepRemote = { ...pulled, items: pulled.items.map((i, n) => (n === 0 ? { ...i, notes: 'the GitHub copy' } : i)) };
        publishRemote(remote, remoteStateText(keepRemote), await hashState(keepRemote), 903);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await page.getByRole('button', { name: /Take the GitHub copy|Keep the GitHub copy/ }).first().click();
        await expect.poll(async () => (await db(app)).items[0]!.notes, { timeout: 30_000 }).toBe('the GitHub copy');
        expect(provenance(await db(app)), where).toEqual(EXPECTED);
        // The copy kept before that replacement comes back whole.
        await page.getByRole('button', { name: 'Restore it' }).click();
        await expect.poll(async () => (await db(app)).items[1]!.title, { timeout: 30_000 }).toBe('edited on this device');
        expect(provenance(await db(app)), where).toEqual(EXPECTED);

        // --- A FETCHED INDEX: new declarations land; an old scanner's lands too --
        const graph = (await db(app)).archiveSources[0]!;
        publishSourceIndex(
          remote,
          await indexOf(graph, (pieces) => {
            pieces[1]!.studySource = 'ردیف-میرزاعبدالله';
          }),
          'idx-declared',
        );
        await openSettings(app);
        await page.getByRole('button', { name: 'Refresh Setar archive' }).click();
        await page.getByRole('button', { name: /^(Apply|Already current)$/ }).click();
        await expect.poll(async () => provenance(await db(app))[1]![1], { timeout: 30_000 }).toBe('ردیف-میرزاعبدالله');
        // Provenance is evidence about the source, never a write to an item.
        const itemsAfterDeclared = JSON.stringify((await db(app)).items);
        publishSourceIndex(
          remote,
          await indexOf((await db(app)).archiveSources[0]!, (pieces) => {
            for (const p of pieces) delete p.studySource;
          }),
          'idx-legacy-scanner',
        );
        await page.getByRole('button', { name: 'Refresh Setar archive' }).click();
        await page.getByRole('button', { name: /^(Apply|Already current)$/ }).click();
        await expect.poll(async () => provenance(await db(app)).every(([, s]) => s === ABSENT), { timeout: 30_000 }).toBe(true);
        expect(JSON.stringify((await db(app)).items), where).toBe(itemsAfterDeclared);
        // Every later door is tested on its own: no automatic sync between them.
        await page.getByRole('button', { name: 'Disconnect' }).click();
        await page.getByRole('button', { name: 'Connect & sync' }).waitFor({ timeout: 10_000 });

        // --- AN UNFINISHED BLOCK refuses every replacement -----------------------
        await importBackup(app, 'v16.json', full);
        expect(await importOutcome(app), where).toContain('Imported');
        await reload(app);
        good = await stateBytes(app);
        await goTo(app, `/items/${V16.items[1]!.id}`);
        await page.getByRole('button', { name: 'Start a block' }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 20_000 });
        const duringPractice = await stateBytes(app);
        await importBackup(app, 'v16.json', full);
        expect(await importOutcome(app), where).toMatch(/Import failed.*(unfinished|practice)/is);
        expect(await stateBytes(app), where).toBe(duringPractice);
        await goTo(app, '/active');
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- EXPORT: canonical, provenance and bytes round-trip ----------------
        await importBackup(app, 'v16.json', full);
        expect(await importOutcome(app), where).toContain('Imported');
        await reload(app);
        const exported = JSON.parse(await exportBackup(app)) as { data: Db; files?: { id: string; data: string }[] };
        expect(provenance(exported.data), where).toEqual(EXPECTED);
        expect(await hashState(exported.data), where).toBe(await hashState(await db(app)));
        if (withBytes) expect(exported.files?.map((f) => f.id), where).toEqual(OWNER_V16.files.map((f) => f.id));
        await importBackup(app, 'round-trip.json', JSON.stringify(exported));
        expect(await importOutcome(app), where).toContain('Imported');
        await reload(app);
        expect(await hashState(await db(app)), where).toBe(await hashState(exported.data));
        if (withBytes) expect(await blobProjection(app), where).toEqual(bytes);

        // --- HYDRATION, `migrate`: a v15 store becomes v16, nothing guessed ------
        const current = await readPersistedState(app);
        await writePersistedState(app, { ...(current.state as object), db: OWNER_V15.data }, 15);
        await reload(app);
        const migrated = await db(app);
        expect(migrated.schemaVersion, where).toBe(SCHEMA_VERSION);
        expect(provenance(migrated).every(([, s]) => s === ABSENT), `${where}: missing stays missing`).toBe(true);
        expect({ ...migrated, schemaVersion: 15 }, `${where}: version only`).toEqual(OWNER_V15.data);
        const once = await stateBytes(app);
        await reload(app);
        expect(await stateBytes(app), `${where}: idempotent`).toBe(once);

        // --- HYDRATION, `merge`: a current-version store of the wrong type ------
        await importBackup(app, 'v16.json', full);
        await reload(app);
        const valid = await readPersistedState(app);
        await writePersistedState(app, { ...(valid.state as object), db: malformed((valid.state as { db: Db }).db, { title: 'x' }) }, SCHEMA_VERSION);
        const refused = await stateBytes(app);
        await page.reload();
        await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
        expect(await page.locator('body').innerText(), where).toMatch(/study source/);
        expect(await stateBytes(app), `${where}: rendering a refusal writes nothing`).toBe(refused);

        // --- COLD-START RECOVERY -------------------------------------------------
        await page.getByLabel('Restore backup file').setInputFiles({ name: 'recover.json', mimeType: 'application/json', buffer: Buffer.from(full, 'utf8') });
        await page.locator('main').waitFor({ timeout: 20_000 });
        await goTo(app, '/');
        await reload(app);
        expect(provenance(await db(app)), where).toEqual(EXPECTED);
        if (withBytes) expect(await blobProjection(app), where).toEqual(bytes);
        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }

    // --- THE PRE-LANE APP: reads the additive index; refuses v16; rolls back ---
    const baseline = checkoutBaselineApp();
    try {
      // Its own decoder, from its own checkout, given an index WITH provenance.
      const declaredIndex = await indexOf(V16.archiveSources[0]!, () => {});
      const oldReader = (await import(join(baseline.root, 'src/domain/sourceArchive.ts'))) as { parseSourceIndex(text: string): Promise<{ pieces: Record<string, unknown>[] }> };
      const theirs = await oldReader.parseSourceIndex(declaredIndex);
      const ours = await parseSourceIndex(declaredIndex);
      // Every old meaning unchanged; the new field simply unread.
      expect(theirs.pieces.every((p) => !('studySource' in p))).toBe(true);
      expect(theirs).toEqual({ ...ours, pieces: ours.pieces.map(({ studySource: _s, ...p }) => (void _s, p)) });

      const old = await openPracticeApp({ now: CLOCK, root: baseline.root });
      try {
        await importBackup(old, 'v15.json', JSON.stringify({ app: 'practice-compass', schemaVersion: 15, exportedAt: T, data: { ...OWNER_V15.data, attachments: [] } }));
        expect(await importOutcome(old)).toContain('Imported');
        await reload(old);
        const retained = await exportBackup(old);
        expect(JSON.parse(retained).schemaVersion).toBe(15);
        const before = await stateBytes(old);
        await importBackup(old, 'v16.json', wrap({ ...V16, attachments: [] }));
        expect(await importOutcome(old)).toMatch(/newer version/i);
        expect(await stateBytes(old)).toBe(before);
        // A rollback is the old app restoring its own backup — no down-migration.
        await importBackup(old, 'retained.json', retained);
        expect(await importOutcome(old)).toContain('Imported');
        await reload(old);
        expect((await persistedDb(old)).schemaVersion).toBe(15);
        expect(old.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await old.close();
      }
    } finally {
      baseline.dispose();
    }
  }, 900_000);
});
