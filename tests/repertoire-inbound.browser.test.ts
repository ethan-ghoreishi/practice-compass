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
  persistedDb,
  persistedUntil,
  publishRemote,
  readPersistedState,
  reload,
  remoteStateText,
  syncMessage,
  writePersistedState,
  type PracticeApp,
} from './practiceBrowser';
import LEGACY_TEXT from './fixtures/repertoire-legacy-v14.json?raw';
import CURRENT_TEXT from './fixtures/repertoire-current-v15.json?raw';
import EXPECT_TEXT from './fixtures/repertoire-family-expectations.json?raw';
import V13_SETAR_TEXT from './fixtures/setar-legacy-v13.json?raw';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';
import { validateDB } from '../src/domain/io';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-16 / ac-17 — the v15 repertoire model through every REAL inbound door:
// Settings import (full and state-only), an automatic sync pull, "Take the
// GitHub copy", the archive restore, both hydration branches and the
// cold-start recovery control. Synthetic fixtures only; GitHub is the harness's
// fake at the fetch boundary; no network, no owner data.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-09-28T09:00:00');
const EXPECT = JSON.parse(EXPECT_TEXT);
const LEGACY = JSON.parse(LEGACY_TEXT);
const CURRENT = JSON.parse(CURRENT_TEXT);
const LEGACY_FILES = LEGACY.files;
/**
 * The v15 fixture plus the legacy fixture's never-practised item and its one
 * attachment row — a state-only file this device can install once the legacy
 * full backup has put that attachment's bytes here, so the v15 EXPORT carries
 * real bytes too.
 */
const CURRENT_WITH_FILE = {
  ...CURRENT.data,
  items: [...CURRENT.data.items, { ...LEGACY.data.items.find((i: { id: string }) => i.id === 'it-forms-chahar'), catalogRefs: ['stage:setar-radif-forms:chahar-mezrab'] }],
  pathwayStages: [...CURRENT.data.pathwayStages],
  attachments: LEGACY.data.attachments,
};
/** The legacy file as this build installs it — the base every malformed case mutates. */
const MIGRATED: PracticeDB = validateDB(LEGACY);

const wrap = (data: unknown, files?: unknown) =>
  JSON.stringify({
    app: 'practice-compass',
    schemaVersion: (data as { schemaVersion?: number }).schemaVersion ?? SCHEMA_VERSION,
    exportedAt: CLOCK.toISOString(),
    data,
    ...(files === undefined ? {} : { files }),
  });

type Db = PracticeDB;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const withItem = (db: Db, id: string, patch: Record<string, unknown>): Db => ({
  ...db,
  items: db.items.map((i) => (i.id === id ? ({ ...i, ...patch } as Db['items'][number]) : i)),
});

/** The malformed family, each refused at EVERY door that is given it. */
const MALFORMED: { name: string; db: (base: Db) => Db; says: RegExp }[] = [
  // Every case mutates a record present in BOTH fixtures, so the same bytes
  // reach the import, sync and hydration doors alike.
  { name: 'a dangling term reference', db: (b) => withItem(b, 'it-iraq', { persian: { form: { termId: 'term-gone' } } }), says: /does not exist/ },
  { name: 'a wrong-kind term reference', db: (b) => withItem(b, 'it-iraq', { persian: { dastgahAvaz: { termId: 'form:reng' } } }), says: /form term/ },
  { name: 'an object where text belongs', db: (b) => withItem(b, 'it-iraq', { persian: { form: { name: 'x' } } }), says: /unreadable form/ },
  {
    name: 'two terms sharing an id',
    db: (b) => ({
      ...b,
      musicTerms: [0, 1].map(() => ({ id: 'term-x', kind: 'form' as const, name: 'x', aliases: [], createdAt: 'a', updatedAt: 'a' })),
    }),
    says: /share the id/,
  },
  { name: 'two items bound to one suggestion on one instrument', db: (b) => withItem(b, 'it-daramad-a', { catalogRefs: ['radif:mirza-abdollah:afshari:iraq'] }), says: /Two items/ },
  { name: 'a binding to a suggestion this app does not ship', db: (b) => withItem(b, 'it-iraq', { catalogRefs: ['stage:nowhere:x'] }), says: /does not ship/ },
  {
    name: 'a hidden suggestion outside its pathway',
    db: (b) => ({ ...b, pathways: b.pathways.map((p) => (p.id === 'cgs' ? { ...p, hiddenRefs: ['radif:mirza-abdollah:afshari:iraq'] } : p)) }),
    says: /does not present/,
  },
  { name: 'a newer schema', db: (b) => ({ ...b, schemaVersion: SCHEMA_VERSION + 1 }), says: /newer version/i },
];

async function state(app: PracticeApp) {
  return JSON.stringify(await readPersistedState(app));
}

describe('the repertoire model at every inbound door', () => {
  it('every inbound door enforces the repertoire v15 boundary', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- A LEGACY v14 FULL BACKUP, bytes included -----------------------
      await importBackup(app, 'repertoire-legacy-v14.json', LEGACY_TEXT);
      expect(await importOutcome(app)).toContain('Imported (1 file)');
      await reload(app);
      let db = (await persistedDb(app)) as unknown as Db;
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      for (const [id, refs] of Object.entries(EXPECT.legacy.bindings)) {
        expect(db.items.find((i) => i.id === id)!.catalogRefs, id).toEqual(refs);
      }
      expect(db.materials.find((m) => m.id === 'mat-cgs')!.sourceKey).toBe('course:cgs');
      expect(await blobProjection(app)).toEqual({ 'att-chahar': 'it-forms-chahar:29' });
      const goodBytes = await state(app);
      const goodBlobs = await blobProjection(app);

      // --- MALFORMED IDENTITY, refused at the FULL import door ------------
      //     With attachment bytes in the file, so a refusal that came after
      //     the blob replacement would show here.
      for (const c of MALFORMED) {
        await importBackup(app, 'bad.json', wrap(c.db(clone(MIGRATED)), LEGACY_FILES));
        expect(await importOutcome(app), c.name).toMatch(/Import failed/);
        expect(await importOutcome(app), c.name).toMatch(c.says);
        expect(await state(app), c.name).toBe(goodBytes);
        expect(await blobProjection(app), c.name).toEqual(goodBlobs);
      }
      // …and at the STATE-ONLY door, which has no bytes of its own.
      for (const c of MALFORMED.slice(0, 3)) {
        await importBackup(app, 'bad-state-only.json', wrap(c.db(clone(MIGRATED))));
        expect(await importOutcome(app), c.name).toMatch(c.says);
        expect(await state(app), c.name).toBe(goodBytes);
      }

      // --- A VALID v15 STATE-ONLY IMPORT carries every new field ----------
      await importBackup(app, 'repertoire-current-v15.json', wrap(CURRENT.data));
      expect(await importOutcome(app)).toContain('Imported');
      db = (await persistedUntil(app, (s) => (s.state as { db: Db }).db, (d) => d.musicTerms?.length === 3)) as Db;
      expect(db.musicTerms).toEqual(CURRENT.data.musicTerms);
      expect(db.items.find((i) => i.id === 'it-khatai')!.persian).toEqual(CURRENT.data.items.find((i: { id: string }) => i.id === 'it-khatai').persian);
      expect(db.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs).toEqual(['radif:mirza-abdollah:shur:rohab']);
      for (const [id, refs] of Object.entries(EXPECT.current.bindings)) expect(db.items.find((i) => i.id === id)!.catalogRefs, id).toEqual(refs);
      // A state-only import keeps this device's bytes, as it always has.
      expect(await blobProjection(app)).toEqual(goodBlobs);
      // …and still refuses a file naming an attachment this device has no bytes for.
      const current = clone(db);
      const orphanRow = { id: 'att-missing', ownerType: 'item', ownerId: 'it-iraq', name: 'x.txt', mime: 'text/plain', size: 3, kind: 'other', createdAt: CLOCK.toISOString() };
      const before = await state(app);
      await importBackup(app, 'no-bytes.json', wrap({ ...current, attachments: [orphanRow] }));
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await state(app)).toBe(before);

      // --- UNFINISHED PRACTICE still refuses a deliberate replacement -----
      await goTo(app, '/items/it-iraq');
      await page.getByRole('button', { name: 'Start a block' }).click();
      await app.page.getByRole('button', { name: 'Finish' }).waitFor();
      await page.getByRole('button', { name: 'Pause' }).click();
      const guarded = await state(app);
      await importBackup(app, 'while-practising.json', LEGACY_TEXT);
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/unfinished|in progress|practice/i);
      expect(await state(app)).toBe(guarded);
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Discard block' }).click();

      // --- A SYNC PULL installs the same validated model ------------------
      const remote = newFakeRemote();
      await installFakeGitHub(page, remote);
      await connectSync(app);
      const local = (await persistedDb(app)) as unknown as Db;
      const pulled: Db = {
        ...local,
        musicTerms: local.musicTerms.map((t) => (t.id === 'term-mahjoubi' ? { ...t, name: 'محجوبی (from the other device)' } : t)),
      };
      publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 9001);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page), { timeout: 60_000 }).toMatch(/Brought the GitHub copy/i);
      await persistedUntil(
        app,
        (s) => (s.state as { db: Db }).db.musicTerms.find((t) => t.id === 'term-mahjoubi')?.name,
        (n) => n === 'محجوبی (from the other device)',
      );
      // …and refuses a malformed snapshot, installing nothing.
      for (const [i, c] of [MALFORMED[0], MALFORMED[6]].entries()) {
        const beforePull = await state(app);
        const bad = c.db(clone(pulled));
        publishRemote(remote, remoteStateText(bad), await hashState(bad), 9100 + i);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await expect.poll(async () => c.says.test(await syncMessage(page)), { timeout: 60_000 }).toBe(true);
        expect(await state(app), c.name).toBe(beforePull);
      }

      // --- BOTH CHANGED: "Take the GitHub copy", then the ARCHIVE RESTORE --
      const localEdit: Db = { ...pulled, pathways: pulled.pathways.map((p) => (p.id === 'setar-radif-mirza' ? { ...p, hiddenRefs: [] } : p)) };
      await importBackup(app, 'local-edit.json', wrap(localEdit, []));
      expect(await importOutcome(app)).toContain('Imported');
      const otherEdit: Db = {
        ...pulled,
        pathways: pulled.pathways.map((p) =>
          p.id === 'setar-radif-mirza' ? { ...p, hiddenRefs: ['radif:mirza-abdollah:shur:rohab', 'radif:mirza-abdollah:shur:golriz'] } : p,
        ),
      };
      publishRemote(remote, remoteStateText(otherEdit), await hashState(otherEdit), 9200);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await page.getByRole('button', { name: 'Take the GitHub copy' }).waitFor({ timeout: 60_000 });
      await page.getByRole('button', { name: 'Take the GitHub copy' }).click();
      await persistedUntil(
        app,
        (s) => (s.state as { db: Db }).db.pathways.find((p) => p.id === 'setar-radif-mirza')?.hiddenRefs?.length,
        (n) => n === 2,
      );
      expect(remote.refs.some((r) => r.startsWith('archive/'))).toBe(true);
      await page.getByRole('button', { name: 'Restore it' }).click();
      await persistedUntil(
        app,
        (s) => (s.state as { db: Db }).db.pathways.find((p) => p.id === 'setar-radif-mirza')?.hiddenRefs?.length,
        (n) => n === 0,
      );

      // --- BOTH HYDRATION BRANCHES ---------------------------------------
      // `migrate`: persisted bytes declaring v14.
      const settled = await readPersistedState(app);
      await writePersistedState(app, { ...(settled.state as object), db: LEGACY.data, active: null }, 14);
      await reload(app);
      db = (await persistedDb(app)) as unknown as Db;
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(db.items.find((i) => i.id === 'it-iraq')!.catalogRefs).toEqual(EXPECT.legacy.bindings['it-iraq']);
      // `merge`: persisted bytes declaring the CURRENT version, malformed.
      const valid = await readPersistedState(app);
      for (const c of [MALFORMED[0], MALFORMED[4]]) {
        await writePersistedState(app, { ...(valid.state as object), db: c.db(clone((valid.state as { db: Db }).db)) }, SCHEMA_VERSION);
        const refusedBytes = await state(app);
        await page.reload();
        await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
        expect(c.says.test(await page.locator('body').innerText()), c.name).toBe(true);
        // Showing the refusal writes nothing.
        expect(await state(app), c.name).toBe(refusedBytes);
      }

      // --- COLD-START RECOVERY gets the owner back in with a valid file ----
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'recover.json',
        mimeType: 'application/json',
        buffer: Buffer.from(wrap(CURRENT.data), 'utf8'),
      });
      await page.locator('main').waitFor({ timeout: 20_000 });
      await goTo(app, '/');
      await reload(app);
      db = (await persistedDb(app)) as unknown as Db;
      expect(db.musicTerms).toEqual(CURRENT.data.musicTerms);
      expect(db.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs).toEqual(['radif:mirza-abdollah:shur:rohab']);
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 360_000);
});

// ---------------------------------------------------------------------------
// ac-17 — backups carry the new state, and the app this lane was cut from
// refuses a v15 file without touching its own state or bytes.
// ---------------------------------------------------------------------------

/** The contract's baseline commit — the last v14 build. */
const BASELINE_COMMIT = 'b6bef3418572340c22e93deed79204878d45dc6d';

function checkoutBaselineApp(): { root: string; dispose: () => void } {
  const root = join(mkdtempSync(join(tmpdir(), 'pc-repertoire-baseline-')), 'app');
  execFileSync('git', ['worktree', 'add', '--detach', root, BASELINE_COMMIT], { stdio: 'pipe' });
  // package.json and package-lock.json are forbidden paths for this lane, so
  // the baseline's dependency tree IS this checkout's; linking it is exact.
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

describe('backups across the schema boundary', () => {
  it('repertoire backups round trip and older readers refuse v15 safely', async () => {
    // --- THIS build: export → import is lossless, and the hash agrees ------
    const app = await openPracticeApp({ now: CLOCK });
    let v15Full: string | undefined;
    try {
      await importBackup(app, 'repertoire-legacy-v14.json', LEGACY_TEXT);
      await importBackup(app, 'repertoire-current-v15.json', wrap(CURRENT_WITH_FILE));
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      const installed = (await persistedDb(app)) as unknown as Db;
      v15Full = await exportBackup(app);
      const exported = JSON.parse(v15Full) as { schemaVersion: number; data: Db; files?: { id: string }[] };
      expect(exported.schemaVersion).toBe(SCHEMA_VERSION);
      expect(exported.data.musicTerms).toEqual(CURRENT.data.musicTerms);
      expect(exported.data.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs).toEqual(['radif:mirza-abdollah:shur:rohab']);
      expect(exported.data.items.find((i) => i.id === 'it-unlinked')!.catalogRefs).toEqual([]);
      expect(exported.data.materials.find((m) => m.id === 'mat-cgs')!.sourceKey).toBe('course:cgs');
      expect(exported.data.items.find((i) => i.id === 'it-khatai')!.persian).toEqual({
        dastgahAvaz: { termId: 'dastgah:shur' },
        form: { termId: 'term-khatai' },
        composer: { termId: 'term-mahjoubi' },
      });
      // The legacy bytes are still on the device and still in the export.
      expect(exported.files?.map((f) => f.id)).toEqual(['att-chahar']);
      // Content hashing sees the same database the device holds.
      expect(await hashState(exported.data)).toBe(await hashState(installed));
      // Re-importing its own export changes nothing.
      const beforeRoundTrip = JSON.stringify(await persistedDb(app));
      await importBackup(app, 'own-export.json', v15Full);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      expect(JSON.stringify(await persistedDb(app))).toBe(beforeRoundTrip);
      // …and the current reader still accepts the backups before it.
      await importBackup(app, 'setar-legacy-v13.json', V13_SETAR_TEXT);
      expect(await importOutcome(app)).toContain('Imported');
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }

    // --- The BASELINE v14 app: refuses the v15 file, changes nothing -------
    const baseline = checkoutBaselineApp();
    const old = await openPracticeApp({ now: CLOCK, root: baseline.root });
    try {
      await importBackup(old, 'repertoire-legacy-v14.json', LEGACY_TEXT);
      expect(await importOutcome(old)).toContain('Imported (1 file)');
      await reload(old);
      expect((await persistedDb(old)).schemaVersion).toBe(14);
      const beforeBytes = JSON.stringify(await readPersistedState(old));
      const beforeBlobs = await blobProjection(old);
      expect(beforeBlobs).toEqual({ 'att-chahar': 'it-forms-chahar:29' });

      await importBackup(old, 'from-the-new-app.json', v15Full!);
      expect(await importOutcome(old)).toMatch(/Import failed/);
      expect(await importOutcome(old)).toMatch(/newer version/i);
      expect(JSON.stringify(await readPersistedState(old))).toBe(beforeBytes);
      expect(await blobProjection(old)).toEqual(beforeBlobs);
      expect(old.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await old.close();
      baseline.dispose();
    }
  }, 360_000);
});
