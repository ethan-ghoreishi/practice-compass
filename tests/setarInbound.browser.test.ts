import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FAILURE_EVIDENCE_MS,
  connectSync,
  exportBackup,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  requestFailureEvidence,
  openPracticeApp,
  persistedDb,
  publishRemote,
  readPersistedState,
  reload,
  remoteStateText,
  syncMessage,
  type TrackedRequestFailure,
  writePersistedState,
} from './practiceBrowser';
import INDEX_TEXT from './fixtures/setar-archive.json?raw';
import V13_SETAR_TEXT from './fixtures/setar-legacy-v13.json?raw';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';
import { validateDB, serializeExport } from '../src/domain/io';
import { decodeSourceIndex } from '../src/domain/sourceArchive';
import { applyArchiveImport, planArchiveImport } from '../src/domain/sourceReconcile';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-16 — the archive graph through every door an inbound database uses.
//
// Settings import (full and state-only), an automatic sync pull, "Take the
// GitHub copy", the archive restore, BOTH hydration branches and the cold-start
// recovery control all run the same `validateDB`. A malformed source relation
// has to be refused at every one of them with the previous database AND the
// previous attachment bytes exactly as they were; a valid one has to survive
// all of them with the owner's own bindings, suppressions and fields intact.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-09-17T09:00:00');
const SETAR = 'inst-setar';

/** The owner's v13 data with a real, accepted graph in it — built by the real planner. */
function v14Database(): PracticeDB {
  const base = validateDB(JSON.parse(V13_SETAR_TEXT));
  const index = decodeSourceIndex(JSON.parse(INDEX_TEXT));
  const plan = planArchiveImport({ db: base, index, instrumentId: SETAR, now: CLOCK });
  const db = applyArchiveImport(base, plan);
  // An owner decision that every door must carry through untouched.
  return {
    ...db,
    archiveSources: db.archiveSources.map((s) => ({
      ...s,
      suppressions: [{ kind: 'piece' as const, ref: 'عراق', at: '2026-09-17T09:05:00.000Z' }],
    })),
    items: db.items.filter((i) => i.source?.pieceKey !== 'عراق'),
  };
}

const V14_DB = v14Database();
const V14_TEXT = serializeExport(V14_DB, CLOCK);

/**
 * The same database with ONE nested value inside the graph made malformed.
 *
 * `members[].roles` is what `repeatChains` calls `.includes` on to render an
 * item's material, so a door that accepts this persists a database whose first
 * reader throws. It is the sharpest member of the family — the nested fields a
 * production reader dereferences — and every door below is given the identical
 * bytes rather than a door-specific approximation of them.
 */
function withMalformedRoles<T extends PracticeDB>(db: T): T {
  return {
    ...db,
    archiveSources: db.archiveSources.map((src, i) =>
      i === 0
        ? {
            ...src,
            sessions: src.sessions.map((sess, j) =>
              j === 0
                ? { ...sess, members: sess.members.map((m, k) => (k === 0 ? { ...m, roles: null } : m)) }
                : sess,
            ),
          }
        : src,
    ),
  } as unknown as T;
}

const wrap = (data: unknown, files?: unknown) =>
  JSON.stringify({
    app: 'practice-compass',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: CLOCK.toISOString(),
    data,
    ...(files === undefined ? {} : { files }),
  });

/**
 * A path the REFRESH repaired on an adopted legacy class: the owner's v13 file
 * stores `setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4`,
 * and the rename log moves it here. Repair produces PERSISTED archive state, so
 * it has to cross these doors like everything else.
 */
const REPAIRED_PATH = 'session-1-26-09-2023/ضبط-کلاس-1.mp4';

interface Shape {
  items: { id: string; title: string; source?: { pieceKey: string }; references?: unknown[] }[];
  lessons: { id: string; source?: { sessionN: number }; origin?: string; recordings?: { path: string }[] }[];
  blocks: unknown[];
  archiveSources: { id: string; suppressions: { ref: string }[]; sessions: unknown[] }[];
  schemaVersion: number;
}

const shape = async (app: Parameters<typeof persistedDb>[0]) => (await persistedDb(app)) as unknown as Shape;

describe('the archive graph at every inbound door', () => {
  it('archive state crosses all real inbound doors without partial installation', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- a real v14 database, through the real Settings importer --------
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      let db = await shape(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(db.archiveSources).toHaveLength(1);
      expect(db.items.filter((i) => i.source)).toHaveLength(93);
      expect(db.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
      // The owner's suppression came through, and the piece it names is absent.
      expect(db.archiveSources[0]!.suppressions.map((s) => s.ref)).toEqual(['عراق']);
      expect(db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
      // …as did their own untouched records.
      expect(db.items.find((i) => i.id === 'own-dashti')!.title).toBe('چهارمضراب اول دشتی');
      expect(db.blocks).toHaveLength(1);
      // The REPAIRED reference survived the door, with the row the owner wrote.
      const repaired = () => db.lessons.find((l) => l.id === 'L-1')!.recordings!;
      expect(repaired().map((r) => r.path)).toContain(REPAIRED_PATH);

      const goodBytes = JSON.stringify(await readPersistedState(app));

      // --- MALFORMED SOURCE RELATIONS, refused at the import door ---------
      const bad = V14_DB;
      const cases: { name: string; text: string; says: RegExp }[] = [
        {
          name: 'two sources share an id',
          text: wrap({ ...bad, archiveSources: [bad.archiveSources[0], bad.archiveSources[0]] }),
          says: /share the id/,
        },
        {
          name: 'a source bound to no instrument',
          text: wrap({
            ...bad,
            archiveSources: [{ ...bad.archiveSources[0]!, instrumentId: 'nobody' }],
          }),
          says: /instrument that does not exist/,
        },
        {
          name: 'a dangling item binding',
          text: wrap({
            ...bad,
            items: bad.items.map((i) =>
              i.id === 'own-dashti' ? { ...i, source: { archiveId: 'setar-classes', pieceKey: 'nope' } } : i,
            ),
          }),
          says: /does not describe/,
        },
        {
          name: 'two items bound to one piece',
          text: wrap({
            ...bad,
            items: bad.items.map((i) =>
              i.id === 'own-iraq' ? { ...i, source: bad.items.find((x) => x.source)!.source } : i,
            ),
          }),
          says: /Two items are bound/,
        },
        {
          name: 'a lesson bound to a session the source does not describe',
          text: wrap({
            ...bad,
            lessons: bad.lessons.map((l) =>
              l.id === 'L-38-upcoming' ? { ...l, source: { archiveId: 'setar-classes', sessionN: 4242 } } : l,
            ),
          }),
          says: /does not describe/,
        },
        {
          name: 'an unsafe resource path',
          text: wrap({
            ...bad,
            archiveSources: [
              {
                ...bad.archiveSources[0]!,
                sessions: bad.archiveSources[0]!.sessions.map((s, i) =>
                  i === 0 ? { ...s, resources: [{ ...s.resources[0], path: '../../etc/passwd' }] } : s,
                ),
              },
            ],
          }),
          says: /unsafe resource path/,
        },
        {
          name: 'an unsafe direct item reference',
          text: wrap({
            ...bad,
            items: bad.items.map((i) =>
              i.id === 'own-iraq'
                ? {
                    ...i,
                    references: [
                      { id: 'r', title: 'x', path: '../secret.mp4', kind: 'video', createdAt: CLOCK.toISOString() },
                    ],
                  }
                : i,
            ),
          }),
          says: /unsafe reference path/,
        },
        {
          // The sealed counterexample: a nested value no door used to check.
          name: 'a membership with an unreadable role list',
          text: wrap(withMalformedRoles(bad)),
          says: /unreadable role list/,
        },
        {
          name: 'a newer schema',
          text: wrap({ ...bad, schemaVersion: SCHEMA_VERSION + 1 }),
          says: /newer version/i,
        },
      ];

      for (const c of cases) {
        await importBackup(app, 'bad.json', c.text);
        expect(await importOutcome(app), c.name).toMatch(/Import failed/);
        expect(await importOutcome(app), c.name).toMatch(c.says);
        // NOTHING was written — not a partial graph, not a partial database.
        expect(JSON.stringify(await readPersistedState(app)), c.name).toBe(goodBytes);
      }

      // --- a STATE-ONLY import carries the graph too ----------------------
      const renamed = {
        ...V14_DB,
        items: V14_DB.items.map((i) => (i.id === 'own-dashti' ? { ...i, title: 'state-only import' } : i)),
      };
      await importBackup(app, 'state-only.json', wrap(renamed));
      expect(await importOutcome(app)).toContain('Imported');
      // A v14 database is 94 pieces, 39 sessions and the whole graph, and the
      // importer validates and migrates all of it before it writes. Polled at
      // half a second rather than the shared helper's 50ms: a continuous stream
      // of read transactions on the same object store delays the very write
      // this is waiting for.
      await expect
        .poll(async () => (await shape(app)).items.find((i) => i.id === 'own-dashti')?.title, {
          timeout: 60_000,
          interval: 500,
        })
        .toBe('state-only import');
      expect((await shape(app)).archiveSources).toHaveLength(1);

      // --- A SYNC PULL installs the same validated model -------------------
      const remote = newFakeRemote();
      await installFakeGitHub(page, remote);
      // The first sync PUSHES what this device holds, so the pull below is a
      // clean one-sided change rather than a conflict.
      await connectSync(app);
      const local = await persistedDb(app);
      const pulled = {
        ...local,
        items: local.items.map((i) => (i.id === 'own-dashti' ? { ...i, title: 'from the other device' } : i)),
      };
      publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 9999);
      await goTo(app, '/settings');
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page), { timeout: 60_000 }).toMatch(/Brought the GitHub copy/i);
      await expect
        .poll(async () => (await shape(app)).items.find((i) => i.id === 'own-dashti')?.title, {
          timeout: 60_000,
          interval: 500,
        })
        .toBe('from the other device');
      db = await shape(app);
      expect(db.archiveSources).toHaveLength(1);
      expect(db.archiveSources[0]!.suppressions.map((s) => s.ref)).toEqual(['عراق']);
      expect(repaired().map((r) => r.path)).toContain(REPAIRED_PATH);

      // --- A MALFORMED remote snapshot is refused, and installs nothing ----
      const beforePull = JSON.stringify(await readPersistedState(app));
      const brokenRemote = { ...pulled, archiveSources: [{ ...V14_DB.archiveSources[0]!, instrumentId: 'nobody' }] };
      publishRemote(remote, remoteStateText(brokenRemote), await hashState(brokenRemote), 10_000);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect
        .poll(async () => (await syncMessage(page)).includes('instrument that does not exist'), {
          timeout: 60_000,
          interval: 500,
        })
        .toBe(true);
      expect(JSON.stringify(await readPersistedState(app))).toBe(beforePull);

      // …and the NESTED malformation is refused by this door too, not only by
      // the import one. A pull that installed it would leave a database whose
      // own material reader throws, with nothing to undo it.
      const brokenNested = withMalformedRoles(pulled as unknown as PracticeDB);
      publishRemote(remote, remoteStateText(brokenNested), await hashState(brokenNested), 10_001);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect
        .poll(async () => (await syncMessage(page)).includes('unreadable role list'), {
          timeout: 60_000,
          interval: 500,
        })
        .toBe(true);
      expect(JSON.stringify(await readPersistedState(app))).toBe(beforePull);

      // --- BOTH CHANGED: "Take the GitHub copy" is the same door -----------
      await goTo(app, '/items/own-dashti');
      await page.getByRole('button', { name: 'Edit' }).first().click();
      await goTo(app, '/settings');
      const keepRemote = {
        ...pulled,
        items: pulled.items.map((i) => (i.id === 'own-dashti' ? { ...i, title: 'the GitHub copy' } : i)),
      };
      publishRemote(remote, remoteStateText(keepRemote), await hashState(keepRemote), 11_000);
      await page.getByRole('button', { name: 'Sync now' }).click();
      const takeRemote = page.getByRole('button', { name: /Take the GitHub copy|Keep the GitHub copy/ });
      if ((await takeRemote.count()) > 0) {
        await takeRemote.first().click();
        await expect
          .poll(async () => (await shape(app)).items.find((i) => i.id === 'own-dashti')?.title, {
            timeout: 60_000,
            interval: 500,
          })
          .toBe('the GitHub copy');
        expect((await shape(app)).archiveSources).toHaveLength(1);
      }

      // --- THE ACTIVE/REVISION GUARD IS UNCHANGED -------------------------
      await goTo(app, '/items/own-dashti');
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 20_000 });
      const duringPractice = JSON.stringify(await readPersistedState(app));
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/unfinished|practice/i);
      expect(JSON.stringify(await readPersistedState(app))).toBe(duringPractice);
      await goTo(app, '/active');
      // The harness accepts the confirm() for the whole journey.
      await page.getByRole('button', { name: 'Discard block' }).click();

      // --- A FULL EXPORT: metadata for NAS refs, no bytes ------------------
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      await reload(app);
      const exported = await exportBackup(app);
      const parsed = JSON.parse(exported) as { data: Shape; files?: unknown[] };
      expect(parsed.data.archiveSources).toHaveLength(1);
      expect(parsed.data.items.filter((i) => i.source)).toHaveLength(93);
      // The archive is DESCRIBED, never carried: no NAS bytes, and only real
      // local attachments appear in `files` (there are none here).
      expect(parsed.files ?? []).toEqual([]);
      expect(exported).toContain('session-13-03-09-2024');
      // A repaired path is exported as the archive-relative text it now is —
      // no device base, no legacy folder prefix, and no bytes.
      expect(exported).toContain(REPAIRED_PATH);
      expect(exported).not.toContain('setar-classes/session-1-26-09-2023/video-2023-09-27');
      expect(parsed.data.lessons.find((l) => l.id === 'L-1')!.recordings!.map((r) => r.path)).toContain(REPAIRED_PATH);

      // --- BOTH HYDRATION BRANCHES ----------------------------------------
      // `migrate`: a persisted database declaring the OLD version.
      const current = await readPersistedState(app);
      await writePersistedState(app, { ...(current.state as object), db: JSON.parse(V13_SETAR_TEXT).data }, 13);
      await reload(app);
      db = await shape(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(db.archiveSources).toEqual([]);

      // `merge`: a persisted database declaring the CURRENT version, carrying
      // an invalid relation. Zustand skips `migrate` entirely here, which is
      // exactly why the check cannot live only there.
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      await reload(app);
      const valid = await readPersistedState(app);
      const validDb = (valid.state as { db: Shape }).db;
      await writePersistedState(
        app,
        {
          ...(valid.state as object),
          db: {
            ...validDb,
            archiveSources: [{ ...validDb.archiveSources[0]!, instrumentId: 'nobody' }],
          },
        },
        SCHEMA_VERSION,
      );
      const refusedBytes = JSON.stringify(await readPersistedState(app));
      await page.reload();
      await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
      expect(await page.locator('body').innerText()).toMatch(/instrument that does not exist/);
      // Rendering the refusal writes nothing at all.
      expect(JSON.stringify(await readPersistedState(app))).toBe(refusedBytes);

      // The same hydration branch, given the NESTED malformation instead: this
      // is the door the sealed counterexample actually walked through, and a
      // database it accepted would crash the first material render.
      await writePersistedState(
        app,
        { ...(valid.state as object), db: withMalformedRoles(validDb as unknown as PracticeDB) },
        SCHEMA_VERSION,
      );
      const refusedNestedBytes = JSON.stringify(await readPersistedState(app));
      await page.reload();
      await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
      expect(await page.locator('body').innerText()).toMatch(/unreadable role list/);
      expect(JSON.stringify(await readPersistedState(app))).toBe(refusedNestedBytes);

      // --- COLD-START RECOVERY gets the owner back in ----------------------
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'recover.json',
        mimeType: 'application/json',
        buffer: Buffer.from(V14_TEXT, 'utf8'),
      });
      await page.locator('main').waitFor({ timeout: 20_000 });
      await goTo(app, '/');
      await reload(app);
      db = await shape(app);
      expect(db.archiveSources).toHaveLength(1);
      expect(db.items.filter((i) => i.source)).toHaveLength(93);
      expect(repaired().map((r) => r.path)).toContain(REPAIRED_PATH);
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 240_000);
});

// ---------------------------------------------------------------------------
// The rollback route: the baseline app, not a description of it.
// ---------------------------------------------------------------------------

const BASELINE_COMMIT = 'b649bd09d0ffbd8bbc5955c3c891cfe01a7fa417';

function checkoutBaselineApp(): { root: string; dispose: () => void } {
  const root = join(mkdtempSync(join(tmpdir(), 'pc-setar-baseline-')), 'app');
  execFileSync('git', ['worktree', 'add', '--detach', root, BASELINE_COMMIT], { stdio: 'pipe' });
  // `package.json` here gained two scripts and nothing else; `package-lock.json`
  // is a forbidden path and is byte-identical, so the baseline's dependency
  // tree is this checkout's. Linking is exact and far cheaper than installing.
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

describe('rolling back past the archive schema', () => {
  it('the baseline app refuses a v14 file and restores its own retained backup', async () => {
    const baseline = checkoutBaselineApp();
    const old = await openPracticeApp({ now: CLOCK, root: baseline.root });
    try {
      // The v13 app holds the owner's real v13 data, and exports it itself.
      await importBackup(old, 'setar-legacy-v13.json', V13_SETAR_TEXT);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const oldDb = await persistedDb(old);
      expect(oldDb.schemaVersion).toBe(13);
      const retainedV13 = await exportBackup(old);
      expect(JSON.parse(retainedV13).schemaVersion).toBe(13);

      // IT REFUSES A v14 FILE, and writes nothing.
      const before = JSON.stringify(await readPersistedState(old));
      await importBackup(old, 'setar-v14.json', V14_TEXT);
      expect(await importOutcome(old)).toMatch(/Import failed/);
      expect(await importOutcome(old)).toMatch(/newer version/i);
      expect(JSON.stringify(await readPersistedState(old))).toBe(before);

      // …and the retained v13 backup restores INTO the baseline app, which is
      // what a rollback actually is. There is no down-migration and none is
      // pretended: the v14 file still says 14 and still carries its graph.
      await importBackup(old, 'retained-v13.json', retainedV13);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const restored = await persistedDb(old);
      expect(restored.schemaVersion).toBe(13);
      expect(restored.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
        'Teacher: keep the mezrab light on the return.',
      );
      expect(JSON.parse(V14_TEXT).schemaVersion).toBe(SCHEMA_VERSION);
      expect(JSON.parse(V14_TEXT).data.archiveSources).toHaveLength(1);
      expect(old.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await old.close();
      baseline.dispose();
    }
  }, 240_000);
});

describe('the journey harness itself', () => {
  // The harness must not be able to hide the very failure a journey exists to
  // catch, and it must not manufacture one either. A request the browser
  // CANCELLED (because the test drove on mid-flight) was the standing
  // explanation for a WebKit page error that reads exactly like a CORS
  // failure, and excusing it failed six different ways:
  //  - a PERMANENT set of cancelled URLs discarded every later page error
  //    whose message merely contained that pathname;
  //  - made CONSUMING and bounded by a time window, an unconsumed cancellation
  //    stayed a live "credit" any genuine later failure to that URL could
  //    spend;
  //  - the excuse read the page error's `message` ALONE, which never contains
  //    the diagnosis: Playwright splits a page error at its first colon — the
  //    URL's own scheme colon — so the wording lives in `name`;
  //  - the correlation looked only BACKWARDS in time, while WebKit delivers
  //    the page error FIRST;
  //  - "whichever tracked failure sits NEAREST wins", on host+path, threw away
  //    the QUERY and rested the safety claim on proximity, which a 74–359µs
  //    real gap at `Date.now()` granularity cannot carry;
  //  - and finally, full-URL identity plus a veto on genuine evidence STILL
  //    withheld a genuine diagnosis that emitted no `requestfailed` of its own
  //    — precisely the CI failure's own shape — because an earlier unconsumed
  //    cancellation to that exact URL was then the only thing in the log.
  //
  // That last one is the sealed finding that ended this line of work. The
  // premise was never observed in the first place: five cancellation shapes
  // driven through a real WebKit each produce a `requestfailed` and NO page
  // error at all, and a `pageerror` carries no request identity, so no rule
  // built on this log can prove a specific error belongs to a cancellation.
  // The harness therefore KEEPS every page error and only ANNOTATES it. The
  // tests below hold that: the shape is still parsed (so the annotation is
  // readable), and nothing suppresses.
  const url = 'https://api.github.com/repos/owner/data/contents/state.json';

  /**
   * The diagnosis AS A TEST ACTUALLY RECEIVES IT — the two halves Playwright
   * splits it into. Measured against Playwright's own WebKit, and identical
   * to the representation the failing CI run reported.
   */
  const diagnosed = (target = url) => {
    const u = new URL(target);
    return {
      name: `Fetch API cannot load ${u.protocol.replace(':', '')}`,
      message: `/${u.host}${u.pathname}${u.search}${u.hash} due to access control checks.`,
    };
  };
  const spurious = diagnosed();
  const at = 1_000_000;
  const cancelled = (offset = 0, target = url): TrackedRequestFailure => ({
    url: target,
    at: at + offset,
    errorText: 'cancelled',
  });
  const genuine = (offset = 0, target = url): TrackedRequestFailure => ({
    url: target,
    at: at + offset,
    errorText: 'Origin http://localhost:5173 is not allowed by Access-Control-Allow-Origin. Status code: 200',
  });

  /**
   * Raise the diagnosis as a REAL uncaught page error, through the app's own
   * page. A top-level `throw` in an injected script, NOT a timer callback:
   * every journey installs `page.clock`, so a `setTimeout` here never fires at
   * all and the error would never be delivered.
   */
  const raiseDiagnosis = async (app: { page: import('playwright').Page }, target: string): Promise<void> => {
    await app.page.addScriptTag({
      content: `throw new Error(${JSON.stringify(`Fetch API cannot load ${target} due to access control checks.`)});`,
    });
  };

  it('reads the diagnosis as Playwright actually splits it, in both WebKit spellings', () => {
    // THE EXACT PAIR THE FAILING CI RUN REPORTED, verbatim. The annotation has
    // to recognise this representation or a kept error says nothing useful.
    const fromCI = {
      name: 'Fetch API cannot load https',
      message: '/api.github.com/repos/owner/practice-data/contents/README.md due to access control checks.',
    };
    const readme = 'https://api.github.com/repos/owner/practice-data/contents/README.md';
    expect(requestFailureEvidence([{ url: readme, at, errorText: 'cancelled' }], fromCI, at + 5)).toContain(
      'cancelled',
    );

    // The message half ALONE is not the diagnosis and never matches: this is
    // the shape the old excuse used to be handed, and why it never fired.
    expect(requestFailureEvidence([{ url: readme, at, errorText: 'cancelled' }], { message: fromCI.message }, at + 5)).toBe(
      '',
    );

    // An UNSPLIT representation is understood too, so this does not depend on
    // Playwright continuing to split it.
    expect(
      requestFailureEvidence(
        [cancelled()],
        { name: 'Error', message: `Fetch API cannot load ${url} due to access control checks.` },
        at + 5,
      ),
    ).toContain(url);

    // WebKit spells the same diagnosis for an XHR as well as for a fetch.
    expect(
      requestFailureEvidence([cancelled()], { ...spurious, name: spurious.name.replace('Fetch API', 'XMLHttpRequest') }, at + 5),
    ).toContain(url);

    // A message that is not the diagnosis at all gets no annotation — and is
    // still kept, like every other page error.
    expect(
      requestFailureEvidence([cancelled()], { name: 'TypeError', message: `undefined is not an object — ${url}` }, at + 5),
    ).toBe('');
  });

  it('keeps a diagnosed page error that has no request failure of its own, whatever cancellations are logged', () => {
    // THE SEALED COUNTEREXAMPLE, as a unit. The CI failure arrives with no
    // `request`, no route hit and no `requestfailed`; the last excuse still
    // dropped it whenever an earlier unconsumed cancellation to that exact URL
    // sat in the log. Nothing may drop it now, so the only thing the harness
    // can do with that log is PRINT it — and it must, or the kept error is the
    // same unreadable CORS-shaped message the whole rework came from.
    const log = [cancelled(-5)];
    const evidence = requestFailureEvidence(log, spurious, at);
    expect(evidence).toContain('cancelled');
    expect(evidence).toContain(url);
    // Nothing is consumed: evidence stays complete for every later error too.
    expect(log).toEqual([cancelled(-5)]);
    expect(requestFailureEvidence(log, spurious, at)).toBe(evidence);
  });

  it('tells two requests to one path apart by their query, and ignores the fragment', () => {
    // THE IDENTITY A PREVIOUS REWORK THREW AWAY, kept because the annotation
    // has to say whether a tracked failure is the resource the error NAMED:
    // `…/index.json?ref=commit-a` and `?ref=commit-b` are two requests the app
    // really does make, one after the other.
    const refA = 'https://api.github.com/repos/owner/data/contents/setar/index.json?ref=commit-a';
    const refB = 'https://api.github.com/repos/owner/data/contents/setar/index.json?ref=commit-b';
    expect(requestFailureEvidence([cancelled(0, refA)], diagnosed(refB), at + 1)).toContain('different query');
    expect(requestFailureEvidence([cancelled(0, refA)], diagnosed(refA), at + 1)).not.toContain('different query');

    // MEASURED, macOS WebKit: the page error names `…/state.json#frag` while
    // `request.url()` for the same request reports `…/state.json` — a fragment
    // is never sent, so comparing `href` would call every fragment-bearing URL
    // a different resource.
    expect(requestFailureEvidence([cancelled(0, url)], diagnosed(`${url}#frag`), at + 1)).not.toContain('different query');
    expect(requestFailureEvidence([cancelled(0, url)], diagnosed(`${url}?ref=a#frag`), at + 1)).toContain('different query');
  });

  it('never matches a host or path that merely shares characters with a tracked one', () => {
    // A substring test cannot tell these apart from the genuine host/path;
    // only structural URL equality can. Each contains the real host or path as
    // a substring while naming a DIFFERENT resource, so none of them may be
    // reported as evidence about this error.
    for (const trap of [
      'https://evil-api.github.com/repos/owner/data/contents/state.json',
      'https://api.github.com.evil.test/repos/owner/data/contents/state.json',
      'https://api.github.com/repos/owner/data/contents/state.json.bak',
      'https://api.example.com/repos/owner/data/contents/state.json',
      'https://api.github.com/repos/owner/data/contents/files/x.bin',
    ]) {
      expect(requestFailureEvidence([cancelled()], diagnosed(trap), at + 5)).toMatch(/no tracked request failure/);
    }
  });

  it('reports what the browser said in both directions of the measured ordering', () => {
    // WebKit delivers the page error 74–359µs BEFORE the request's own
    // failure, so evidence arriving AFTER the error is the normal case, not
    // the exception; one measurement is not proof the reverse cannot happen,
    // so both are searched.
    expect(requestFailureEvidence([genuine(1)], spurious, at)).toContain('Access-Control-Allow-Origin');
    expect(requestFailureEvidence([genuine(-7)], spurious, at)).toContain('-7ms');
    // Outside the reporting window there is nothing useful to print.
    expect(requestFailureEvidence([genuine(FAILURE_EVIDENCE_MS + 1)], spurious, at)).toMatch(
      /no tracked request failure/,
    );
    expect(requestFailureEvidence([genuine(FAILURE_EVIDENCE_MS)], spurious, at)).toContain('Access-Control-Allow-Origin');
  });

  it('measures what a REAL WebKit reports, and holds the rule to it', async () => {
    // Every string and every ORDER in the tests above was once a hand-written
    // reconstruction, and the CI run that finally produced the real thing is
    // what exposed two of them. This drives an actual WebKit and reads actual
    // event objects, so the shape, the query, the fragment and the ordering
    // can never drift back to a reconstruction.
    //
    // A reply from a REAL server with no CORS headers is what makes WebKit emit
    // this diagnosis; a Playwright-fulfilled response does not go through the
    // same check, which is why the fake GitHub repo above never produces one.
    const blocked = createServer((req, res) => {
      // `?slow` never answers in time, so a reload CANCELS it — the other
      // half of this test needs a REAL cancellation, with the browser's own
      // url, errorText and arrival time.
      const reply = () => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{}');
      };
      if (req.url?.includes('slow')) setTimeout(reply, 30_000).unref();
      else reply();
    });
    await new Promise<void>((done) => blocked.listen(0, '127.0.0.1', done));
    const port = (blocked.address() as AddressInfo).port;
    const target = `http://127.0.0.1:${port}/repos/owner/practice-data/contents/README.md`;
    const app = await openPracticeApp({ now: new Date('2026-09-17T09:00:00.000Z'), engine: 'webkit' });
    try {
      // BOTH streams, in arrival order, with arrival times — so the ordering
      // this rule was corrected for is measured here rather than asserted
      // from memory.
      const seen: ({ kind: 'error'; error: Error; at: number } | ({ kind: 'failed'; at: number } & TrackedRequestFailure))[] = [];
      app.page.on('pageerror', (e) => seen.push({ kind: 'error', error: e, at: Date.now() }));
      app.page.on('requestfailed', (r) =>
        seen.push({ kind: 'failed', at: Date.now(), url: r.url(), errorText: r.failure()?.errorText ?? '' }),
      );

      // A genuine access-control failure, with a QUERY and a FRAGMENT, so the
      // message's treatment of both is measured rather than assumed.
      await app.page.evaluate((u) => void fetch(u).catch(() => {}), `${target}?ref=main#frag`);
      await expect.poll(() => seen.filter((e) => e.kind === 'failed').length, { timeout: 20_000 }).toBeGreaterThan(0);

      const real = seen.find((e) => e.kind === 'error');
      const realFailure = seen.find((e) => e.kind === 'failed');
      if (real?.kind !== 'error' || realFailure?.kind !== 'failed') throw new Error('WebKit reported no pair to measure.');

      // THE REPRESENTATION, as the browser and Playwright actually deliver it:
      // the wording is in `name`, only the tail is in `message`. This is the
      // identical split the failing CI run reported.
      expect(real.error.name).toBe('Fetch API cannot load http');
      // The QUERY is in the message — which is the identity the excuse used to
      // throw away — and so is the FRAGMENT, which the request itself drops.
      expect(real.error.message).toBe(
        `/127.0.0.1:${port}/repos/owner/practice-data/contents/README.md?ref=main#frag due to access control checks.`,
      );
      expect(realFailure.url).toBe(`${target}?ref=main`);
      expect(realFailure.errorText).toContain('Access-Control-Allow-Origin');

      // THE OBSERVED ORDERING, measured rather than stated: the page error is
      // delivered first, and its own request failure lands beside it, well
      // inside the defensive ceiling. (Sub-millisecond, hence a gap of 0 or 1
      // at this clock's granularity — which is exactly why proximity cannot
      // be what separates a genuine failure from a cancellation.)
      expect(seen.indexOf(real)).toBeLessThan(seen.indexOf(realFailure));
      expect(realFailure.at - real.at).toBeLessThanOrEqual(FAILURE_EVIDENCE_MS);

      // THE ANNOTATION, ON REAL EVENTS: a cancellation to the very same
      // resource sitting in the error's own millisecond is REPORTED beside the
      // genuine refusal, and takes nothing away from it. The rule that once
      // ranked these two against each other is gone; what is left says what
      // the browser reported about both.
      const log: TrackedRequestFailure[] = [
        { url: realFailure.url, at: realFailure.at, errorText: realFailure.errorText },
        { url: realFailure.url, at: real.at, errorText: 'cancelled' },
      ];
      const evidence = requestFailureEvidence(log, real.error, real.at);
      expect(evidence).toContain('Access-Control-Allow-Origin');
      expect(evidence).toContain('cancelled');
      expect(log).toHaveLength(2);

      // And the harness KEEPS it — saying what the browser reported instead of
      // leaving a bare CORS-shaped message.
      const kept = app.pageErrors;
      expect(kept).toHaveLength(1);
      expect(kept[0].message).toContain('due to access control checks');
      expect(kept[0].message).toContain('Access-Control-Allow-Origin');
      // Reading twice reports the same list, not a growing one.
      expect(app.pageErrors).toHaveLength(1);

      // A REAL CANCELLATION, from a request genuinely in flight across a
      // reload — the browser's own url, errorText and arrival time.
      await app.page.evaluate((u) => void fetch(u).catch(() => {}), `${target}?slow=1`);
      await reload(app);
      await expect
        .poll(() => seen.some((e) => e.kind === 'failed' && e.errorText === 'cancelled'), { timeout: 20_000 })
        .toBe(true);
      const realCancel = seen.find((e) => e.kind === 'failed' && e.errorText === 'cancelled');
      if (realCancel?.kind !== 'failed') throw new Error('WebKit reported no cancellation to measure.');
      expect(realCancel.url).toBe(`${target}?slow=1`);

      // AND THE CANCELLATION ITSELF RAISES NO PAGE ERROR — the measurement the
      // whole excuse was built on the absence of. A genuinely cancelled
      // request produces a `requestfailed` and nothing else, so there is
      // nothing for a cancellation rule to be safe about: `pageErrors` still
      // holds exactly the one genuine refusal from earlier in this journey,
      // and no rule had to withhold anything to keep it that way.
      const cancelLog = () => [{ url: realCancel.url, at: realCancel.at, errorText: realCancel.errorText }];
      expect(seen.filter((e) => e.kind === 'error')).toHaveLength(1);
      expect(app.pageErrors).toHaveLength(1);
      // The same path WITHOUT that query is a different request instance, and
      // this real cancellation is reported as saying nothing about it.
      expect(requestFailureEvidence(cancelLog(), diagnosed(realCancel.url), realCancel.at)).not.toContain(
        'different query',
      );
      expect(requestFailureEvidence(cancelLog(), diagnosed(target), realCancel.at)).toContain('different query');
    } finally {
      await app.close();
      await new Promise<void>((done) => blocked.close(() => done()));
    }
  }, 120_000);

  it('the wiring keeps a diagnosed page error with no request failure of its own', async () => {
    // THE SEALED COUNTEREXAMPLE, END TO END, through the real listeners and
    // the real resolve path — the one thing that could never be proved by
    // reasoning about the rule alone, because the excuse had been dead code
    // twice and both times only CI could tell.
    //
    // A request the browser really cancels lands in the log first; then the
    // diagnosis for that EXACT url arrives as a genuine uncaught `pageerror`
    // with no `requestfailed` of its own — precisely the shape the CI failure
    // has (no request, no route hit, no tracked failure). Every earlier
    // version of this harness dropped it. It must be KEPT, and it must carry
    // the cancellation it did NOT get to hide as evidence.
    //
    // The error TEXT is raised in the page rather than waited for, because no
    // cancellation shape driven through a real WebKit has ever produced one
    // (see `TrackedRequestFailure`'s comment). Everything else here is real:
    // the cancellation, the event objects, the listeners and the resolve path.
    const stalled = createServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{}');
      }, 30_000).unref();
    });
    await new Promise<void>((done) => stalled.listen(0, '127.0.0.1', done));
    const port = (stalled.address() as AddressInfo).port;
    const app = await openPracticeApp({ now: new Date('2026-09-17T09:00:00.000Z'), engine: 'webkit' });
    try {
      const cancellations: string[] = [];
      app.page.on('requestfailed', (r) => {
        if (r.failure()?.errorText === 'cancelled') cancellations.push(r.url());
      });
      const inFlight = `http://127.0.0.1:${port}/repos/owner/practice-data/contents/state.json?ref=main`;
      await app.page.evaluate((u) => void fetch(u).catch(() => {}), inFlight);
      await reload(app);
      await expect.poll(() => cancellations.includes(inFlight), { timeout: 20_000 }).toBe(true);
      // A REAL cancellation on its own raises no page error at all — measured,
      // five shapes, every time. Nothing had to be suppressed for this to hold.
      expect(app.pageErrors).toEqual([]);

      // THE COUNTEREXAMPLE: the diagnosis for the very url that was cancelled,
      // with no request failure of its own. It is KEPT.
      await raiseDiagnosis(app, inFlight);
      await expect.poll(() => app.pageErrors.length, { timeout: 20_000 }).toBe(1);
      expect(app.pageErrors[0].message).toContain('due to access control checks');
      // ...and it says what the harness saw, the cancellation included, rather
      // than being a bare CORS-shaped message.
      expect(app.pageErrors[0].message).toContain('cancelled');

      // A neighbouring request to the same path is kept too, and named as the
      // different request it is.
      const neighbour = `${inFlight.split('?')[0]}?ref=other`;
      await raiseDiagnosis(app, neighbour);
      await expect.poll(() => app.pageErrors.length, { timeout: 20_000 }).toBe(2);
      expect(app.pageErrors[1].message).toContain('?ref=other');
      expect(app.pageErrors[1].message).toContain('different query');

      // Reading twice reports the same list, not a growing one.
      expect(app.pageErrors).toHaveLength(2);
    } finally {
      await app.close();
      await new Promise<void>((done) => stalled.close(() => done()));
    }
  }, 120_000);

  it('a kept page error says what the browser actually reported', () => {
    // The CI failure this whole rework came from was one bare CORS-shaped
    // message with nothing to distinguish a cancellation from a real refusal.
    // A kept diagnosis carries the browser's own words for every request to
    // that resource, and how far each sat from the error.
    const withGenuine = requestFailureEvidence([genuine(1)], spurious, at);
    expect(withGenuine).toContain('api.github.com/repos/owner/data/contents/state.json');
    expect(withGenuine).toContain('Access-Control-Allow-Origin');
    expect(withGenuine).toContain('+1ms');

    // DELIBERATELY BROADER THAN THE ERROR'S OWN IDENTITY: a failure to the
    // same path under a different query is exactly what the reader of a
    // CI-only failure needs to see. It is named as the different request it is.
    const nearMiss = requestFailureEvidence([cancelled(0, `${url}?ref=main`)], spurious, at);
    expect(nearMiss).toContain('?ref=main');
    expect(nearMiss).toContain('different query');
    // The resource the error actually names is not labelled that way.
    expect(requestFailureEvidence([cancelled()], spurious, at)).not.toContain('different query');

    // NOTHING tracked at all is itself the evidence — it says so rather than
    // saying nothing.
    expect(requestFailureEvidence([], spurious, at)).toMatch(/no tracked request failure/);
    // A request that failed BEFORE the error is reported with its sign.
    expect(requestFailureEvidence([genuine(-7)], spurious, at)).toContain('-7ms');
    // It only ever describes: nothing is consumed and nothing is withheld.
    const events = [cancelled()];
    expect(requestFailureEvidence(events, spurious, at + 5)).toContain('cancelled');
    expect(events).toEqual([cancelled()]);
    // A page error that is not this diagnosis at all has nothing to say.
    expect(requestFailureEvidence([cancelled()], { name: 'TypeError', message: 'boom' }, at)).toBe('');
  });
});
