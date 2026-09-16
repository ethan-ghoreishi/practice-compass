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
  writePersistedState,
} from './practiceBrowser';
import v12Text from './fixtures/practice-information-v12.json?raw';
import { SCHEMA_VERSION } from '../src/domain/types';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-3 / ac-4 / ac-5 — every door an inbound database can come through.
//
// Hydration, the Settings importer, a sync pull, "Take the GitHub copy", the
// archive restore and the cold-start recovery control all have to reach the
// SAME validated model — and all have to leave the previous copy alone when
// they refuse. These journeys drive the real controls and then read the app's
// OWN persisted bytes back out of IndexedDB, so "nothing was changed" is
// checked against storage rather than against a return value.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const v12Db = () => (JSON.parse(v12Text) as { data: Record<string, unknown> }).data;

/** The one item the fixture's Farsi notebook belongs to. */
const FARSI_ITEM = 'i-farsi';
const FARSI_NOTES = 'یادداشتِ کاری: فرود را آهسته بگیر.';

describe('every inbound door reaches the same validated practice model', () => {
  it('practice information hydration and rendered recovery enforce the same schema boundary', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- 1. A v12 database migrating AT HYDRATION -----------------------
      // Written straight into the app's own IndexedDB at version 12, the way a
      // device that last ran the old build actually holds it — no import door,
      // so `migrate` is what has to do the work.
      await importBackup(app, 'v12.json', v12Text);
      expect(await importOutcome(app)).toContain('Imported');
      const current = await readPersistedState(app);
      expect(current.version).toBe(SCHEMA_VERSION);
      await writePersistedState(app, { ...(current.state as object), db: v12Db() }, 12);
      await reload(app);
      let db = await persistedDb(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      const farsi = () => db.items.find((i) => i.id === FARSI_ITEM)!;
      expect('currentProblem' in farsi()).toBe(false);
      expect('tags' in farsi()).toBe(false);
      expect(farsi().notes).toBe(FARSI_NOTES);
      expect(db.blocks.every((b) => !('bodyNote' in b))).toBe(true);

      // --- 2. An ALREADY-CURRENT database with partial leftovers ----------
      // Zustand skips `migrate` entirely when the persisted version matches, so
      // this is the path a stray retired key actually survives on.
      const stateNow = await readPersistedState(app);
      const leftover = stateNow.state as { db: { items: Record<string, unknown>[] } };
      await writePersistedState(
        app,
        {
          ...(stateNow.state as object),
          db: {
            ...leftover.db,
            items: leftover.db.items.map((i) =>
              i.id === FARSI_ITEM ? { ...i, currentProblem: 'a stray leftover', tags: ['x'] } : i,
            ),
          },
          // …and an unfinished block carrying a real scratch observation.
          active: {
            itemId: FARSI_ITEM,
            instrumentId: 'setar',
            mode: 'repair',
            focus: 'tone',
            targetMinutes: 10,
            startedAt: '2027-01-15T08:40:00.000Z',
            accumulatedSeconds: 120,
            running: false,
            note: 'فرود هنوز نامطمئن',
          },
        },
        SCHEMA_VERSION,
      );
      await reload(app);
      db = await persistedDb(app);
      expect('currentProblem' in farsi()).toBe(false);
      expect('tags' in farsi()).toBe(false);
      expect(farsi().notes).toBe(FARSI_NOTES);
      // The unfinished session survived, PAUSED, with its observation intact —
      // the existing reload timing is unchanged by any of this.
      await goTo(app, '/active');
      await expect.poll(() => page.getByRole('button', { name: 'Resume' }).isVisible()).toBe(true);
      expect(await page.locator('main').innerText()).toContain('2:00');
      const unfinished = (await readPersistedState(app)).state as { active: { note?: string; running: boolean } };
      expect(unfinished.active.note).toBe('فرود هنوز نامطمئن');
      expect(unfinished.active.running).toBe(false);

      // --- 3. INVALID canonical text is refused, bytes untouched ----------
      const before = await readPersistedState(app);
      const beforeBytes = JSON.stringify(before);
      const broken = before.state as { db: { items: Record<string, unknown>[] } };
      await writePersistedState(
        app,
        {
          ...(before.state as object),
          db: {
            ...broken.db,
            items: broken.db.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: { was: 'an object' } } : i)),
          },
        },
        SCHEMA_VERSION,
      );
      const written = JSON.stringify(await readPersistedState(app));
      await app.page.reload();
      await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
      const refusalText = await page.locator('body').innerText();
      expect(refusalText).toMatch(/notes/i);
      // The refusal screen offers a real way back in, and NO downgrade.
      expect(await page.getByLabel('Restore backup file').count()).toBe(1);
      // Raw stored bytes are byte-identical to what was written: rendering the
      // refusal, by itself, writes nothing.
      expect(JSON.stringify(await readPersistedState(app))).toBe(written);
      expect(written).not.toBe(beforeBytes); // the test really did change them

      // --- 4. An INVALID recovery file changes nothing --------------------
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'broken.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{ not json', 'utf8'),
      });
      await page.waitForTimeout(300);
      expect(JSON.stringify(await readPersistedState(app))).toBe(written);

      // --- 5. A VALID recovery file gets the owner back in ---------------
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'good.json',
        mimeType: 'application/json',
        buffer: Buffer.from(v12Text, 'utf8'),
      });
      // The refusal screen unmounts the instant recovery succeeds — the app
      // shell (`<main>`) only exists once hydration has actually been let
      // through. The URL is still the practice route this journey was last on,
      // which the restored database has no unfinished block for, so the tab bar
      // is legitimately absent until we leave it.
      await page.locator('main').waitFor({ timeout: 20_000 });
      await goTo(app, '/');
      await reload(app);
      db = await persistedDb(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(farsi().notes).toBe(FARSI_NOTES);

      // --- 6. A NEWER schema is refused, with update guidance only -------
      const good = await readPersistedState(app);
      const goodDb = (good.state as { db: Record<string, unknown> }).db;
      await writePersistedState(
        app,
        { ...(good.state as object), db: { ...goodDb, schemaVersion: SCHEMA_VERSION + 1 } },
        SCHEMA_VERSION + 1,
      );
      const newerBytes = JSON.stringify(await readPersistedState(app));
      await app.page.reload();
      await page.getByText(/newer version/i).first().waitFor({ timeout: 20_000 });
      const tooNewText = await page.locator('body').innerText();
      expect(tooNewText).toMatch(/Update the app/i);
      // No downgrade route is offered for data this build cannot read.
      expect(await page.getByLabel('Restore backup file').count()).toBe(0);
      expect(JSON.stringify(await readPersistedState(app))).toBe(newerBytes);
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 180_000);
});

describe('a replacement door never installs what it has not checked', () => {
  it('practice information replacement doors reject invalid data before database or blob replacement', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      await importBackup(app, 'v12.json', v12Text);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      // The attachment BYTES the fixture carried, as actually stored.
      const attachmentText = () =>
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
                  if (!row?.blob) return resolve(null);
                  void row.blob.text().then((t) => {
                    dbh.close();
                    resolve(t);
                  });
                };
                get.onerror = () => reject(get.error);
              };
            }),
        );
      expect(await attachmentText()).toBe('practice-compass fixture attachment');

      const goodBytes = JSON.stringify(await readPersistedState(app));
      const goodAttachment = await attachmentText();

      // --- The malformed-`files` matrix, through the REAL Settings import ---
      // Every one must be refused with the previous database AND the previous
      // attachment bytes still exactly as they were.
      const wrap = (data: unknown, files: unknown) =>
        JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: CLOCK.toISOString(), data, ...(files === undefined ? {} : { files }) });
      const db = v12Db();
      const validFile = { id: 'att-1', ownerId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', data: 'cmVwbGFjZWQ=' };

      const refused: { name: string; text: string; says: RegExp }[] = [
        { name: 'files is not a list', text: wrap(db, { id: 'att-1' }), says: /not a list of files/ },
        { name: 'an entry is not an object', text: wrap(db, ['nope']), says: /not readable/ },
        { name: 'an entry has no id', text: wrap(db, [{ ...validFile, id: undefined }]), says: /no id/ },
        { name: 'an entry has an empty id', text: wrap(db, [{ ...validFile, id: '' }]), says: /no id/ },
        { name: 'two entries share an id', text: wrap(db, [validFile, validFile]), says: /share the id/ },
        { name: 'data is not a string', text: wrap(db, [{ ...validFile, data: 42 }]), says: /no readable data/ },
        { name: 'data is not valid base64', text: wrap(db, [{ ...validFile, data: 'not base64!!' }]), says: /corrupt/ },
        { name: 'bytes with no matching metadata', text: wrap(db, [{ ...validFile, id: 'orphan' }]), says: /belongs to nothing/ },
        { name: 'an entry names no owner', text: wrap(db, [{ ...validFile, ownerId: undefined }]), says: /names no owner/ },
        { name: 'an entry claims the wrong owner', text: wrap(db, [{ ...validFile, ownerId: 'someone-else' }]), says: /different owner/ },
        {
          name: 'metadata whose bytes were omitted',
          text: wrap(db, []),
          says: /whose contents are not in it/,
        },
        {
          name: 'duplicate attachment METADATA ids',
          text: wrap(
            { ...db, attachments: [...(db.attachments as unknown[]), (db.attachments as unknown[])[0]] },
            [validFile],
          ),
          says: /attachments share the id/,
        },
        {
          // THE SAME REFUSAL WITH NO `files` KEY AT ALL. This check used to
          // live inside the full-backup decoder, which returns on its first
          // line for a state-only file — so this door installed two
          // attachments claiming one id, and the device's own next export
          // then carried two files sharing an id and was refused by its own
          // importer, here and on every device a sync published it to. It is
          // refused BEFORE the state-only door's held-bytes check, because
          // both now sit behind the one validated model.
          name: 'duplicate attachment METADATA ids in a STATE-ONLY file',
          text: wrap(
            { ...db, attachments: [...(db.attachments as unknown[]), (db.attachments as unknown[])[0]] },
            undefined,
          ),
          says: /attachments share the id/,
        },
        {
          name: 'invalid canonical text in the data',
          text: wrap(
            { ...db, items: (db.items as Record<string, unknown>[]).map((i) => (i.id === FARSI_ITEM ? { ...i, notes: { was: 'an object' } } : i)) },
            [validFile],
          ),
          says: /notes should be text/,
        },
      ];

      for (const c of refused) {
        await importBackup(app, 'bad.json', c.text);
        expect(await importOutcome(app), c.name).toMatch(/Import failed/);
        expect(await importOutcome(app), c.name).toMatch(c.says);
        expect(JSON.stringify(await readPersistedState(app)), c.name).toBe(goodBytes);
        expect(await attachmentText(), c.name).toBe(goodAttachment);
      }

      // --- The three HONEST file states -----------------------------------
      // `files` ABSENT is a state-only import: existing blobs are untouched.
      await importBackup(app, 'state-only.json', wrap({ ...db, items: (db.items as Record<string, unknown>[]).map((i) => (i.id === FARSI_ITEM ? { ...i, title: 'state-only import' } : i)) }, undefined));
      expect(await importOutcome(app)).toContain('Imported');
      await persistedUntil(app, (s) => ((s.state as { db: { items: { id: string; title: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.title), (t) => t === 'state-only import');
      expect(await attachmentText()).toBe(goodAttachment);

      // …and what that door installed is a database this app can still back
      // up: export it and restore the export. This is the round trip the
      // state-only door used to be able to poison — one metadata row per
      // attachment means one file per attachment, with ids that are unique
      // because the model that describes them is.
      await reload(app);
      const afterStateOnly = await exportBackup(app);
      const stateOnlyFiles = (JSON.parse(afterStateOnly) as { files: { id: string }[] }).files;
      expect(stateOnlyFiles.map((f) => f.id)).toEqual(['att-1']);
      await importBackup(app, 'state-only-roundtrip.json', afterStateOnly);
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe(goodAttachment);

      // `files: []` on data that describes NO attachments IS a real full
      // backup with nothing in it, and does replace.
      await importBackup(app, 'empty-full.json', wrap({ ...db, attachments: [] }, []));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe(null);
      const emptied = JSON.stringify(
        await persistedUntil(
          app,
          (s) => (s.state as { db: { attachments: unknown[] } }).db,
          (d) => d.attachments.length === 0,
        ),
      );

      // …and with no blob on this device, a STATE-ONLY file that DESCRIBES one
      // is refused at the one door that could install it. That state is a
      // one-way trap, not a cosmetic flaw: the device's own next full export
      // carries bytes for exactly the attachments `data` describes and can only
      // OMIT one whose blob it cannot find, so it would describe a file it does
      // not contain — refused by its own import above ("metadata whose bytes
      // were omitted") and by every device a sync published it to, permanently.
      // (The OPPOSITE mismatch — bytes nothing describes — is closed at the
      // export itself; see the orphan round trip further down.) Local bytes and the local
      // database are both left exactly as they were.
      await importBackup(app, 'state-only-dangling.json', wrap(db, undefined));
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/not in it and not on this device/);
      expect(await attachmentText()).toBe(null);
      expect(JSON.stringify((await readPersistedState(app) as { state: { db: unknown } }).state.db)).toBe(emptied);

      // A complete, non-empty set replaces honestly.
      await importBackup(app, 'full.json', wrap(db, [validFile]));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe('replaced');

      // A LEGACY (schema ≤ 5) file entry names its owner as `itemId`; the same
      // v6 rule that migrates the metadata accepts it here.
      await importBackup(app, 'legacy.json', wrap(db, [{ id: 'att-1', itemId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', data: 'bGVnYWN5' }]));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe('legacy');

      // --- BYTES THE DATABASE NO LONGER DESCRIBES ------------------------
      // A state-only file must PRESERVE local blobs — that is its contract —
      // even when the database it installs describes none of them. So this
      // device is deliberately left holding bytes nothing names, and the whole
      // round trip has to survive it: the app's own full export used to derive
      // `files` from the blobs actually stored, so it emitted those orphans and
      // produced a backup its OWN importer then refused ("belongs to nothing
      // this file describes") — unrestorable here and on every device a sync
      // published it to.
      await importBackup(
        app,
        'state-only-no-attachments.json',
        wrap({ ...db, attachments: [], items: (db.items as Record<string, unknown>[]).map((i) => (i.id === FARSI_ITEM ? { ...i, title: 'orphan bytes left behind' } : i)) }, undefined),
      );
      expect(await importOutcome(app)).toContain('Imported');
      await persistedUntil(
        app,
        (s) => (s.state as { db: { attachments: unknown[] } }).db.attachments.length,
        (n) => n === 0,
      );
      // The contract held: the bytes are still here, undeleted.
      expect(await attachmentText()).toBe('legacy');

      await reload(app);
      const orphanExport = await exportBackup(app);
      // The export describes exactly what the database describes — nothing.
      expect((JSON.parse(orphanExport) as { files: unknown[] }).files).toEqual([]);
      await importBackup(app, 'orphan-roundtrip.json', orphanExport);
      expect(await importOutcome(app)).toContain('Imported');
      // …and restoring it leaves the device consistent: no metadata, and no
      // bytes for a file nothing names still sitting there pretending.
      await expect.poll(() => attachmentText()).toBe(null);
      expect((await persistedDb(app)).items.find((i) => i.id === FARSI_ITEM)!.title).toBe('orphan bytes left behind');

      // Put the fixture's attachment back for what follows.
      await importBackup(app, 'restore-attachment.json', wrap(db, [validFile]));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe('replaced');

      // --- A valid round trip keeps the canonical model -------------------
      await reload(app);
      const exported = await exportBackup(app);
      await importBackup(app, 'roundtrip.json', exported);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      const after = await persistedDb(app);
      expect(after.schemaVersion).toBe(SCHEMA_VERSION);
      expect(after.items.find((i) => i.id === FARSI_ITEM)!.notes).toBe(FARSI_NOTES);
      expect(after.items.every((i) => !('currentProblem' in i) && !('tags' in i))).toBe(true);

      // --- Unfinished practice REFUSES a deliberate replacement -----------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Pause' }).click();
      const guardedBytes = JSON.stringify(await readPersistedState(app));
      await importBackup(app, 'while-practising.json', wrap(db, [validFile]));
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/unfinished|in progress|practice/i);
      expect(JSON.stringify(await readPersistedState(app))).toBe(guardedBytes);

      // ...and AUTOMATIC sync DEFERS rather than failing, saying what it waits
      // on. This drives `syncNow` itself, through the real GitHub transport.
      const remote = newFakeRemote();
      await installFakeGitHub(page, remote);
      await connectSync(app);
      await expect.poll(() => syncMessage(page)).toMatch(/waiting|unfinished|finish/i);
      // Nothing left the device while practice was unfinished.
      expect(remote.calls).toEqual([]);

      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Discard block' }).click();

      // --- A SYNC PULL goes through the same validated install -------------
      await goTo(app, '/settings');
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/pushed|in sync/i);
      expect(remote.calls.some((c) => c.startsWith('POST git/commits'))).toBe(true);

      // Another device publishes a DIFFERENT, valid snapshot. Its attachment
      // set is empty and its metadata says so — a snapshot whose manifest and
      // metadata disagree is exactly what the checks above refuse, and the
      // remote is not allowed to be the one place that gets away with it.
      const local = await persistedDb(app);
      const pulledDb = {
        ...local,
        attachments: [],
        items: local.items.map((i) => (i.id === FARSI_ITEM ? { ...i, title: 'pulled from the other device' } : i)),
      };
      publishRemote(remote, remoteStateText(pulledDb), await hashState(pulledDb), 99);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/Brought the GitHub copy/i);
      await persistedUntil(
        app,
        (st) => (st.state as { db: { items: { id: string; title: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.title,
        (t) => t === 'pulled from the other device',
      );
      // The previous copy was archived first, not destroyed.
      await page.getByRole('button', { name: 'Restore it' }).waitFor({ timeout: 20_000 });

      // --- An INVALID remote snapshot is refused before it replaces --------
      const beforeBadPull = JSON.stringify(await persistedDb(app));
      const badDb = {
        ...pulledDb,
        items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: { was: 'an object' } } : i)),
      };
      publishRemote(remote, remoteStateText(badDb), await hashState(badDb), 100);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/notes should be text/i);
      expect(JSON.stringify(await persistedDb(app))).toBe(beforeBadPull);

      // …and a remote snapshot is a bare database with no `files` of its own —
      // the same shape as the state-only file above, arriving through a
      // different door. Duplicate attachment metadata is refused here too,
      // rather than being installed by the one door nobody was watching.
      const attachmentRow = { id: 'att-1', ownerType: 'item', ownerId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', createdAt: CLOCK.toISOString(), size: 12 };
      const dupDb = { ...pulledDb, attachments: [attachmentRow, { ...attachmentRow }] };
      publishRemote(remote, remoteStateText(dupDb), await hashState(dupDb), 102);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/attachments share the id/i);
      expect(JSON.stringify(await persistedDb(app))).toBe(beforeBadPull);

      // --- BOTH sides changed: an explicit choice, and both copies kept ----
      const localEdit = {
        ...pulledDb,
        items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: 'edited on this device' } : i)),
      };
      await importBackup(app, 'local-edit.json', wrap(localEdit, []));
      expect(await importOutcome(app)).toContain('Imported');
      const otherEdit = {
        ...pulledDb,
        items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: 'edited on the other device' } : i)),
      };
      publishRemote(remote, remoteStateText(otherEdit), await hashState(otherEdit), 103);
      await goTo(app, '/settings');
      await page.getByRole('button', { name: 'Sync now' }).click();
      await page.getByRole('button', { name: 'Take the GitHub copy' }).waitFor({ timeout: 20_000 });
      await page.getByRole('button', { name: 'Take the GitHub copy' }).click();
      await persistedUntil(
        app,
        (st) => (st.state as { db: { items: { id: string; notes?: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.notes,
        (n) => n === 'edited on the other device',
      );
      // The local copy was pushed to an archive branch AND kept on the device.
      expect(remote.refs.some((r) => r.startsWith('archive/'))).toBe(true);

      // --- The archive restore is the same validated door ------------------
      await page.getByRole('button', { name: 'Restore it' }).click();
      await persistedUntil(
        app,
        (st) => (st.state as { db: { items: { id: string; notes?: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.notes,
        (n) => n === 'edited on this device',
      );

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 240_000);
});

// ---------------------------------------------------------------------------
// ac-5 — C5. Rollback is an explicit export/restore, never an invented
// down-migration.
// ---------------------------------------------------------------------------

/**
 * The commit this change was cut from — the app as it was BEFORE the schema
 * moved. A disposable git worktree of it is the only honest way to test a
 * rollback: the point is what the OLD app does with a NEW file, and no
 * description of that can stand in for the old app itself. Nothing is checked
 * in: the worktree is created here and removed again.
 */
const BASELINE_COMMIT = 'd014293c205958f45e4393ebf6ae56901db83a1c';

function checkoutBaselineApp(): { root: string; dispose: () => void } {
  const root = join(mkdtempSync(join(tmpdir(), 'pc-baseline-')), 'app');
  execFileSync('git', ['worktree', 'add', '--detach', root, BASELINE_COMMIT], { stdio: 'pipe' });
  // `package.json` and `package-lock.json` are untouched by this change (they
  // are forbidden paths), so the baseline's dependencies are byte-identical to
  // this checkout's — linking them is exact, and far cheaper than a second
  // install. If that ever stops being true this link is the wrong shortcut.
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

describe('rolling back to the schema this change replaced', () => {
  it('practice information rollback restores the original backup without pretending to downgrade new history', async () => {
    const baseline = checkoutBaselineApp();
    const old = await openPracticeApp({ now: CLOCK, root: baseline.root });
    const fresh = await openPracticeApp({ now: CLOCK });
    try {
      // --- 1. The OLD app holds real v12 data, attachment and all ---------
      await importBackup(old, 'v12.json', v12Text);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const oldDb = await persistedDb(old);
      expect(oldDb.schemaVersion).toBe(12);
      // Its practice text is still the v12 model — this is genuinely the old app.
      expect('currentProblem' in oldDb.items.find((i) => i.id === FARSI_ITEM)!).toBe(true);

      // The retained pre-upgrade backup, exported through the old app's own
      // Export button. THIS is the artefact a rollback depends on.
      const retainedV12 = await exportBackup(old);
      expect(JSON.parse(retainedV12).schemaVersion).toBe(12);

      // --- 2. Upgrade: the same file, into the new app --------------------
      await importBackup(fresh, 'retained-v12.json', retainedV12);
      expect(await importOutcome(fresh)).toContain('Imported');
      await reload(fresh);
      const upgraded = await persistedDb(fresh);
      expect(upgraded.schemaVersion).toBe(SCHEMA_VERSION);
      expect(upgraded.items.find((i) => i.id === FARSI_ITEM)!.notes).toBe(FARSI_NOTES);

      // --- 3. Practice recorded AFTER the upgrade -------------------------
      await goTo(fresh, `/items/${FARSI_ITEM}`);
      await fresh.page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(fresh, '/active');
      await fresh.page.getByRole('button', { name: 'Finish' }).click();
      await fresh.page.getByRole('button', { name: 'Stable alone' }).click();
      await fresh.page.getByRole('button', { name: 'Save block' }).click();
      await reload(fresh);
      const withNewBlock = await persistedDb(fresh);
      const postUpgradeBlocks = withNewBlock.blocks.filter((b) => !oldDb.blocks.some((o) => o.id === b.id));
      expect(postUpgradeBlocks).toHaveLength(1);
      const postUpgradeBlockId = String(postUpgradeBlocks[0].id);

      const v13Export = await exportBackup(fresh);
      expect(JSON.parse(v13Export).schemaVersion).toBe(SCHEMA_VERSION);
      // The new block exists ONLY in the v13 export. A rollback to the retained
      // v12 backup therefore LOSES it — stated here rather than glossed over.
      expect(v13Export).toContain(postUpgradeBlockId);
      expect(retainedV12).not.toContain(postUpgradeBlockId);

      // --- 4. The OLD app REFUSES the v13 file, and changes nothing -------
      const oldBytesBefore = JSON.stringify(await readPersistedState(old));
      await importBackup(old, 'v13.json', v13Export);
      expect(await importOutcome(old)).toMatch(/Import failed/);
      expect(await importOutcome(old)).toMatch(/newer version/i);
      expect(JSON.stringify(await readPersistedState(old))).toBe(oldBytesBefore);
      // It is refused, never stamped down: nothing claims to have converted it.
      expect(await importOutcome(old)).not.toMatch(/converted|downgrad/i);

      // --- 5. Restoring the retained v12 backup works, attachment and all --
      await importBackup(old, 'retained-v12.json', retainedV12);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const restored = await persistedDb(old);
      expect(restored.schemaVersion).toBe(12);
      expect(restored.blocks.some((b) => b.id === postUpgradeBlockId)).toBe(false);
      // The attachment came back with it, and opens: its bytes are readable.
      const bytes = await old.page.evaluate(
        () =>
          new Promise<string | null>((resolve, reject) => {
            const req = indexedDB.open('practice-compass');
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
              const dbh = req.result;
              const get = dbh.transaction('attachments', 'readonly').objectStore('attachments').get('att-1');
              get.onsuccess = () => {
                const row = get.result as { blob?: Blob } | undefined;
                if (!row?.blob) return resolve(null);
                void row.blob.text().then((t) => {
                  dbh.close();
                  resolve(t);
                });
              };
              get.onerror = () => reject(get.error);
            };
          }),
      );
      expect(bytes).toBe('practice-compass fixture attachment');
      await goTo(old, `/items/${FARSI_ITEM}`);
      expect(await old.page.locator('main').innerText()).toContain('score.txt');

      expect(old.pageErrors.map((e) => e.message)).toEqual([]);
      expect(fresh.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await fresh.close();
      await old.close();
      baseline.dispose();
    }
  }, 300_000);
});
