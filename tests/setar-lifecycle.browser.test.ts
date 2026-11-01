import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — the real producer, untyped .mjs.
import { buildIndex, scanToIndex } from '../scripts/scan-setar-classes.mjs';
import SOURCE from './fixtures/setar-lifecycle-source.json' with { type: 'json' };
import EXPECTED from './fixtures/setar-lifecycle-expected.json' with { type: 'json' };
import OWNER from './fixtures/setar-lifecycle-owner.json' with { type: 'json' };
import {
  connectSync,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  openSettings,
  persistedDb,
  persistedUntil,
  publishRemote,
  publishSourceIndex,
  readPersistedState,
  reload,
  remoteStateText,
  syncMessage,
  syncNow,
  writePersistedState,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';
import { applyArchiveImport, decodeSourceIndex, emptyDB, planArchiveImport, SCHEMA_VERSION, type Lesson, type LessonAgendaEntry, type PracticeDB, type PracticeItem, type SourceIndex } from '../src/domain';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// The Setar lesson lifecycle, rendered (docs/setar-lesson-lifecycle.md). Both
// engines; every control by role and name; GitHub faked at fetch; the index
// is the real scanner's output over a scratch tree. No NAS, no debug hook.
// ---------------------------------------------------------------------------

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };
const ENGINES: Engine[] = ['chromium', 'webkit'];
const SETAR = 'inst-setar';
const C41 = EXPECTED.class41;
const TWIN = C41.boundId;
const S42 = 'session-42-24-11-2026';

type Db = PracticeDB;
const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const lessonsNumbered = (d: Db, n: number) => d.lessons.filter((l) => l.number === n);
const wrap = (data: unknown, files?: unknown) =>
  JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: '2026-10-30T09:00:00.000Z', data, ...(files === undefined ? {} : { files }) });

function seed(): PracticeDB {
  return { ...emptyDB(), instruments: [{ ...OWNER.instrument }], items: OWNER.items.map((i) => ({ ...i }) as PracticeItem) } as PracticeDB;
}

/** The corpus, scanned by the real producer over a scratch tree (plus any extra files). */
function publishedText(extra: Record<string, number> = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'setar-browser-'));
  try {
    writeFileSync(join(root, 'PIECES.csv'), SOURCE.registryBefore);
    writeFileSync(join(root, 'RENAME-LOG.csv'), SOURCE.renameLogBefore);
    for (const [path, size] of Object.entries({ ...SOURCE.filesBefore, ...extra })) {
      mkdirSync(join(root, dirname(path)), { recursive: true });
      writeFileSync(join(root, path), Buffer.alloc(size, 7));
    }
    for (const f of SOURCE.emptyFolders) mkdirSync(join(root, f), { recursive: true });
    return `${JSON.stringify(scanToIndex(root), null, 2)}\n`;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const corpusIndex = (): SourceIndex =>
  decodeSourceIndex(
    buildIndex({
      registryText: SOURCE.registryBefore,
      inventory: Object.entries(SOURCE.filesBefore).map(([path, size]) => ({ path, size })),
      renameLog: { present: true, text: SOURCE.renameLogBefore },
    }),
  );

/** The reported pair: an earlier Refresh created the archive twin; the owner's Class 41 sits beside it. */
function class41Pair(): PracticeDB {
  const base = seed();
  const imported = applyArchiveImport(base, planArchiveImport({ db: base, index: corpusIndex(), instrumentId: SETAR, now: new Date('2026-10-28T09:00:00Z') }));
  return { ...imported, lessons: [...imported.lessons, { ...(OWNER.manualLesson as Lesson) }], lessonAgenda: OWNER.agenda.map((e) => ({ ...e }) as LessonAgendaEntry) };
}

/** Refresh through the real control, waiting for the preview to be on screen. */
async function refresh(app: PracticeApp) {
  await openSettings(app);
  await app.page.getByRole('button', { name: 'Refresh Setar archive' }).click();
  await app.page.getByRole('button', { name: /^(Apply|Already current)$/ }).waitFor({ timeout: 30_000 });
}
async function applyRefresh(app: PracticeApp) {
  await app.page.getByRole('button', { name: 'Apply', exact: true }).click();
  await app.page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
}

describe('the Setar lesson lifecycle, rendered', () => {
  it('setar duplicate lesson repair exposes the same reconciliation decision in both browsers', async () => {
    const indexText = publishedText();
    for (const engine of ENGINES) {
      const app = await openPracticeApp({ now: new Date('2026-10-30T10:00:00'), engine });
      const { page } = app;
      try {
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await importBackup(app, 'pair.json', wrap(class41Pair()));
        expect(await importOutcome(app), engine).toContain('Imported');
        await connectSync(app);
        publishSourceIndex(remote, indexText);

        // The class itself says it has a twin, and where the one decision is.
        await goTo(app, '/lessons');
        await page.getByRole('button', { name: 'Review in Refresh Setar archive' }).click();
        await page.getByRole('heading', { level: 1, name: 'Settings & backup' }).waitFor();
        await page.getByRole('button', { name: 'Refresh Setar archive' }).click();
        const question = page.getByText('Class 41 · 2026-10-27 appears twice');
        await question.waitFor({ timeout: 30_000 });

        // KEEP SEPARATE reaches the decision, durably, and is lifted by Restore.
        await page.getByRole('button', { name: 'Keep separate' }).click();
        await page.getByRole('button', { name: 'Keep separate', pressed: true }).waitFor();
        await applyRefresh(app);
        await persistedUntil(
          app,
          (s) => (s.state as { db: Db }).db.archiveSources[0]!.suppressions.filter((x) => x.itemId === C41.manualId).map((x) => `${x.kind}:${x.ref}`),
          (v) => v.join() === 'session:41',
        );
        await page.getByText(/Hidden and removed from the archive/).click();
        await page.getByRole('button', { name: 'Restore Class 41 — kept separate from your class of 2026-10-27' }).click();
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.archiveSources[0]!.suppressions.length, (n) => n === 0);

        // COMBINE: the owner's class survives with its id, the twin is folded in.
        await refresh(app);
        await question.waitFor();
        await page.getByRole('button', { name: 'Combine into my class' }).click();
        await page.getByRole('button', { name: 'Combine into my class', pressed: true }).waitFor();
        await applyRefresh(app);
        await persistedUntil(app, (s) => lessonsNumbered((s.state as { db: Db }).db, 41).map((l) => `${l.id}:${l.source?.sessionN}`).join(), (v) => v === `${C41.manualId}:41`);
        const after = await db(app);
        expect(after.lessonAgenda.filter((e) => e.lessonId === C41.manualId).map((e) => e.id).sort(), engine).toEqual([...C41.preparations, ...C41.questions].sort());

        // …and shows the surviving class with the archive's composed recording.
        await goTo(app, '/lessons');
        await page.getByRole('article').filter({ hasText: 'Class 41 · 2026-10-27' }).getByRole('button', { name: /Class 41/ }).click();
        await page.getByText('ضبط کلاس').first().waitFor();
        await page.getByText(OWNER.agenda[2]!.text!).first().waitFor();
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 900_000);

  it('setar future class preparation and later media use one lesson across every visible consumer', async () => {
    const QUESTION = 'Which finger for the grace note?';
    const CLASS = 'Class 42 · 2026-11-24';
    // Session 42's real material arrives in the ordinary folder after the class,
    // beside one unregistered and one unsupported file (the minimal diagnostics).
    const withSession42 = publishedText({
      [`${S42}/ضبط-کلاس.mp4`]: 2100,
      [`${S42}/نت-چهارمضراب-چهارگاه-عبادی.pdf`]: 95,
      [`${S42}/نمونه-قطعه-ناشناخته.mp4`]: 50,
      [`${S42}/نت-چهارمضراب-چهارگاه-عبادی.docx`]: 40,
    });

    for (const engine of ENGINES) {
      for (const viewport of [PHONE, DESKTOP]) {
        const label = `${engine} ${viewport.width}`;
        const app = await openPracticeApp({ now: new Date('2026-11-01T10:00:00'), engine, viewport });
        const { page } = app;
        try {
          const remote = newFakeRemote();
          await installFakeGitHub(page, remote);
          await importBackup(app, 'seed.json', wrap(seed()));
          expect(await importOutcome(app), label).toContain('Imported');
          await connectSync(app);

          // --- 1. The date is known: Add a class, offline, no folder, no media -
          await goTo(app, '/lessons');
          await page.getByRole('button', { name: 'Add a class' }).first().click();
          if (viewport === PHONE) {
            await page.getByRole('group', { name: 'Class no.' }).locator('input').fill('42');
            await page.getByRole('group', { name: 'Class date' }).locator('input').fill('2026-11-24');
          } else {
            await page.getByLabel('Class number (optional)').fill('42');
            await page.getByLabel('Class date').fill('2026-11-24');
          }
          await page.getByRole('button', { name: 'Add', exact: true }).click();
          const planned = await persistedUntil(app, (s) => lessonsNumbered((s.state as { db: Db }).db, 42), (l) => l.length === 1);
          const id = planned[0]!.id;
          expect([planned[0]!.date, planned[0]!.origin, planned[0]!.source], label).toEqual(['2026-11-24', undefined, undefined]);

          // --- 2. Commit work to it, from the item ---------------------------
          await goTo(app, '/items/it-abouata');
          await page.getByRole('button', { name: `Prepare for ${CLASS}` }).click();
          await persistedUntil(app, (s) => (s.state as { db: Db }).db.lessonAgenda.filter((e) => e.kind === 'preparation' && e.lessonId === id).length, (n) => n === 1);

          // --- 3. Capture a question WHILE PRACTISING: the capture names it too -
          await page.getByRole('button', { name: 'Start a block' }).click();
          await page.getByRole('button', { name: '+ Ask teacher' }).click();
          await page.getByLabel('Ask at').waitFor();
          expect(await page.getByLabel('Ask at').inputValue(), label).toBe(id);
          await page.getByLabel('Question for your teacher').fill(QUESTION);
          await page.getByRole('button', { name: 'Done' }).click();
          await persistedUntil(app, (s) => (s.state as { db: Db }).db.lessonAgenda.filter((e) => e.kind === 'question' && e.lessonId === id && e.text === QUESTION).length, (n) => n === 1);
          await page.getByRole('button', { name: 'Discard block' }).click();
          await page.getByRole('navigation', { name: 'Primary' }).waitFor();

          // --- 4. Every visible consumer names the SAME class ----------------
          await goTo(app, '/report');
          await page.getByRole('combobox', { name: 'Class this report is for' }).waitFor();
          expect(await page.getByRole('combobox', { name: 'Class this report is for' }).inputValue(), label).toBe(id);
          await page.getByText(QUESTION).first().waitFor();
          await goTo(app, '/lessons');
          await page.getByText('upcoming').first().waitFor();
          await page.getByText(QUESTION).first().waitFor();

          // --- 5. The class happens; local midnight is crossed with the report OPEN
          await page.clock.setSystemTime(new Date('2026-11-24T23:58:00'));
          await reload(app);
          await goTo(app, '/report');
          await page.getByText('Questions for this class').waitFor(); // still Class 42's day
          await page.clock.runFor(4 * 60_000);
          // The mounted report rolls at midnight: no class is upcoming now, and
          // the question stays on Class 42's own history — never carried forward.
          await page.getByText('Open questions on this instrument').waitFor();
          const past = await db(app);
          expect(past.lessonAgenda.filter((e) => e.lessonId === id).map((e) => e.kind).sort(), label).toEqual(['preparation', 'question']);
          expect(lessonsNumbered(past, 42).map((l) => l.id), label).toEqual([id]);

          // --- 6. The material goes into the ordinary folder; the scanner publishes
          publishSourceIndex(remote, withSession42, 'source-index-commit-42');
          await refresh(app);
          // Refresh says what needs the owner, grouped by the one thing to do.
          await page.getByText(/A piece the archive does not know yet \(3 · class 40, 41, 42\)/).waitFor();
          await page.getByText(/A file type the archive does not index \(2 · class 39, 42\)/).waitFor();
          await page.getByText(/A class roster to confirm \(2 · class 40, 42\)/).waitFor();
          await page.getByRole('button', { name: 'Show 8 needing attention' }).click();
          await page.getByText(`${S42}/نمونه-قطعه-ناشناخته.mp4`).waitFor();
          // The match proposal: link to the class planned in Compass.
          await page.getByText('Is this the class you planned in Compass?').first().waitFor();
          await page.getByRole('button', { name: 'Link to “2026-11-24 · class 42”' }).click();
          await applyRefresh(app);
          const bound = await persistedUntil(app, (s) => lessonsNumbered((s.state as { db: Db }).db, 42), (l) => l.length === 1 && !!l[0]!.source);
          expect(bound.map((l) => [l.id, l.source, l.origin]), label).toEqual([[id, { archiveId: 'setar-classes', sessionN: 42 }, undefined]]);
          const linked = await db(app);
          expect(linked.lessonAgenda.filter((e) => e.lessonId === id).map((e) => e.kind).sort(), label).toEqual(['preparation', 'question']);
          // History it brought is history; the empty folder never was a lesson.
          expect(linked.lessons.filter((l) => l.source && l.id !== id).every((l) => l.origin === 'archive'), label).toBe(true);

          // --- 7. The composed files are on the original class ---------------
          await goTo(app, '/lessons');
          // A bound class that has happened starts compact on the phone list.
          if (viewport === PHONE) await page.getByRole('article').filter({ hasText: CLASS }).getByRole('button', { name: /Class 42/ }).click();
          await page.getByText(QUESTION).first().waitFor();
          await page.getByText('ضبط کلاس').first().waitFor();

          // --- 8. Repeated Refresh keeps the one binding, and says what it read
          await refresh(app);
          await page.getByText(/This is the index the NAS job last published/).waitFor();
          await page.getByRole('button', { name: 'Already current' }).click();
          await page.getByText('Already current.', { exact: true }).waitFor();
          const again = await db(app);
          expect(lessonsNumbered(again, 42).map((l) => [l.id, l.source?.sessionN]), label).toEqual([[id, 42]]);
          expect(app.pageErrors.map((e) => e.message), label).toEqual([]);
        } finally {
          await app.close();
        }
      }

      // --- FOCUSED: material arrives while the planned date is still ahead ---
      const app = await openPracticeApp({ now: new Date('2026-11-01T10:00:00'), engine });
      const { page } = app;
      try {
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        const planned42: Lesson = { id: 'L42-planned', instrumentId: SETAR, date: '2026-11-24', number: 42, createdAt: '2026-10-30T09:00:00.000Z', updatedAt: '2026-10-30T09:00:00.000Z' };
        await importBackup(app, 'planned.json', wrap({ ...seed(), lessons: [planned42] }));
        await connectSync(app);
        // Session 42's files came early (a misleading folder date is not the
        // point here — the owner's plan is), and an ARCHIVE-ONLY session dated
        // ahead of this device's clock arrives with them.
        publishSourceIndex(
          remote,
          publishedText({ [`${S42}/ضبط-کلاس.mp4`]: 2100, 'session-43-10-11-2026/ضبط-کلاس.mp4': 1800 }),
        );
        await refresh(app);
        await page.getByRole('button', { name: 'Link to “2026-11-24 · class 42”' }).click();
        await applyRefresh(app);
        const early = await persistedUntil(app, (s) => lessonsNumbered((s.state as { db: Db }).db, 42), (l) => !!l[0]?.source);
        expect(early.map((l) => [l.id, l.origin]), engine).toEqual([['L42-planned', undefined]]);
        expect(lessonsNumbered(await db(app), 43).map((l) => l.origin), engine).toEqual(['archive']);
        // Still the next class — not the archive-only Nov 10 session, which is history.
        await goTo(app, '/report');
        await page.getByRole('combobox', { name: 'Class this report is for' }).waitFor();
          expect(await page.getByRole('combobox', { name: 'Class this report is for' }).inputValue(), engine).toBe('L42-planned');
        await goTo(app, '/lessons');
        await page.getByText('upcoming').first().waitFor();
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 1_800_000);

  it('setar reconciled lessons survive reload backup and compatible sync without resurrecting removed material', async () => {
    // INDEPENDENTLY DECLARED: the already-reconciled state, written out by hand —
    // never produced by running the combine again.
    const HIDDEN = 'session-40-29-09-2026/نمونه.mp4';
    const reconciled = (): PracticeDB => {
      const pair = class41Pair();
      const source = pair.archiveSources[0]!;
      return {
        ...pair,
        lessons: [
          ...pair.lessons.filter((l) => l.id !== TWIN && l.id !== C41.manualId),
          { ...(OWNER.manualLesson as Lesson), source: { archiveId: 'setar-classes', sessionN: 41 } },
          { id: 'L40-mine', instrumentId: SETAR, date: '2026-09-29', number: 40, notes: 'A different class that day.', createdAt: '2026-10-01T09:00:00.000Z', updatedAt: '2026-10-01T09:00:00.000Z' },
        ],
        attachments: [{ id: 'att-mine', ownerType: 'lesson', ownerId: C41.manualId, name: 'mine.txt', mime: 'text/plain', size: 9, kind: 'other', createdAt: '2026-10-20T18:00:00.000Z' }],
        archiveSources: [
          {
            ...source,
            suppressions: [
              { kind: 'resource', ref: HIDDEN, at: '2026-10-29T09:00:00.000Z' },
              { kind: 'session', ref: '40', itemId: 'L40-mine', at: '2026-10-29T09:00:00.000Z' },
            ],
          },
        ],
      };
    };
    const ATT = { id: 'att-mine', ownerId: C41.manualId, mime: 'text/plain', name: 'mine.txt', data: Buffer.from('mine 41\n!').toString('base64') };
    const indexText = publishedText();
    /** The minimal handover check at each door: the binding, the authored agenda, the decisions. */
    const holds = (d: Db, where: string) => {
      expect(lessonsNumbered(d, 41).map((l) => [l.id, l.source?.sessionN]), where).toEqual([[C41.manualId, 41]]);
      expect(d.lessons.some((l) => l.id === TWIN), where).toBe(false);
      expect(d.lessonAgenda.filter((e) => e.lessonId === C41.manualId).map((e) => e.id).sort(), where).toEqual([...C41.preparations, ...C41.questions].sort());
      expect(d.archiveSources[0]!.suppressions.map((s) => `${s.kind}:${s.ref}:${s.itemId ?? ''}`).sort(), where).toEqual([`resource:${HIDDEN}:`, 'session:40:L40-mine']);
      expect(d.attachments.map((a) => `${a.id}:${a.ownerType}:${a.ownerId}`), where).toEqual(d.attachments.length ? [`att-mine:lesson:${C41.manualId}`] : []);
    };

    for (const engine of ENGINES) {
      const app = await openPracticeApp({ now: new Date('2026-10-30T10:00:00'), engine });
      const { page } = app;
      const blobText = () =>
        page.evaluate(
          () =>
            new Promise<string | null>((resolve, reject) => {
              const req = indexedDB.open('practice-compass');
              req.onerror = () => reject(req.error);
              req.onsuccess = () => {
                const h = req.result;
                const get = h.transaction('attachments', 'readonly').objectStore('attachments').get('att-mine');
                get.onsuccess = () => {
                  const row = get.result as { blob?: Blob } | undefined;
                  if (!row?.blob) return (h.close(), resolve(null));
                  void row.blob.text().then((t) => (h.close(), resolve(t)));
                };
                get.onerror = () => reject(get.error);
              };
            }),
        );
      try {
        // --- FULL BACKUP (bytes in Chromium; WebKit seeds state only) -------
        const start = engine === 'chromium' ? reconciled() : { ...reconciled(), attachments: [] };
        await importBackup(app, 'reconciled.json', wrap(start, engine === 'chromium' ? [ATT] : undefined));
        expect(await importOutcome(app), engine).toContain('Imported');
        holds(await db(app), `${engine} import`);
        if (engine === 'chromium') expect(await blobText(), engine).toBe('mine 41\n!');

        // --- COLD RELOAD: persist `merge` (current version) and `migrate` ----
        await reload(app);
        holds(await db(app), `${engine} reload`);
        const current = await readPersistedState(app);
        await writePersistedState(app, { ...(current.state as object), db: { ...(current.state as { db: Db }).db, schemaVersion: 16 } }, 16);
        await reload(app);
        const migrated = await db(app);
        expect(migrated.schemaVersion, engine).toBe(SCHEMA_VERSION);
        holds(migrated, `${engine} migrate`);

        // --- AN IN-FLIGHT NOTE on the reconciled class survives a cold reload
        await goTo(app, '/lessons');
        const card41 = page.getByRole('article').filter({ hasText: 'Class 41 · 2026-10-27' });
        await card41.getByRole('button', { name: /Class 41/ }).click();
        await card41.getByRole('button', { name: 'Edit Class notes' }).click();
        await card41.getByRole('textbox', { name: 'Class notes' }).fill('نیمه‌تمام — after class');
        await reload(app);
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === C41.manualId)?.notes, (n) => n === 'نیمه‌تمام — after class');
        holds(await db(app), `${engine} held note`);

        // --- REFRESH: no removed duplicate, no hidden material comes back ----
        const remote = newFakeRemote();
        await installFakeGitHub(page, remote);
        await connectSync(app);
        publishSourceIndex(remote, indexText);
        await refresh(app);
        await page.getByRole('button', { name: 'Already current' }).click();
        await page.getByText('Already current.', { exact: true }).waitFor();
        holds(await db(app), `${engine} refresh`);

        // --- SYNC PULL: the other device answered a question ---------------
        // (attachment BYTES travel as separate git blobs this fake repo does not
        // hold, so the remote copy describes none; local bytes are never deleted)
        const local = await db(app);
        const pulled = { ...local, attachments: [], lessonAgenda: local.lessonAgenda.map((e) => (e.id === 'q-41-a' ? { ...e, askedAt: '2026-10-29T18:00:00.000Z', answer: 'On the beat.' } : e)) } as Db;
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 70);
        await syncNow(app);
        expect(await syncMessage(page), engine).toMatch(/Brought the GitHub copy/i);
        await persistedUntil(app, (s) => ((s.state as { db: Db }).db.lessonAgenda.find((e) => e.id === 'q-41-a') as { answer?: string } | undefined)?.answer, (a) => a === 'On the beat.');
        holds(await db(app), `${engine} pull`);

        // --- ARCHIVE RESTORE: the copy the pull replaced comes back whole ----
        await page.getByRole('button', { name: 'Restore it' }).click();
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.attachments.length, (n) => n === local.attachments.length);
        holds(await db(app), `${engine} archive restore`);
        if (engine === 'chromium') expect(await blobText(), engine).toBe('mine 41\n!');

        // --- KEEP REMOTE on a both-changed conflict ---------------------------
        const mine = { ...local, lessons: local.lessons.map((l) => (l.id === C41.manualId ? { ...l, notes: 'Mine, after class.' } : l)) } as Db;
        await importBackup(app, 'local-change.json', wrap(mine, engine === 'chromium' ? [ATT] : undefined));
        expect(await importOutcome(app), engine).toContain('Imported');
        const theirs = { ...pulled, lessons: pulled.lessons.map((l) => (l.id === C41.manualId ? { ...l, notes: 'Theirs, after class.' } : l)) } as Db;
        publishRemote(remote, remoteStateText(theirs), await hashState(theirs), 71);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await page.getByRole('button', { name: 'Take the GitHub copy' }).click();
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === C41.manualId)?.notes, (n) => n === 'Theirs, after class.');
        holds(await db(app), `${engine} keep remote`);
        // …and a Refresh after all of it still recreates nothing.
        await refresh(app);
        await page.getByRole('button', { name: 'Already current' }).click();
        await page.getByText('Already current.', { exact: true }).waitFor();
        holds(await db(app), `${engine} refresh after sync`);

        // --- REFUSED AT THE DOOR, nothing installed ---------------------------
        const before = JSON.stringify(await readPersistedState(app));
        const good = await db(app);
        const refusals: [string, unknown, unknown, RegExp][] = [
          ['duplicate binding', { ...good, lessons: [...good.lessons, { ...good.lessons.find((l) => l.id === C41.manualId)!, id: 'L41-again' }] }, undefined, /Two lessons are bound to session 41/],
          ['malformed graph', { ...good, archiveSources: [{ ...good.archiveSources[0]!, diagnostics: [{ path: 'x', reason: 'y', code: 7 }] }] }, undefined, /unreadable code/],
        ];
        if (engine === 'chromium') refusals.push(['described bytes missing', { ...good, attachments: reconciled().attachments }, [], /att-mine/]);
        for (const [name, data, files, says] of refusals) {
          await importBackup(app, `${name}.json`, wrap(data, files));
          expect(await importOutcome(app), `${engine} ${name}`).toMatch(says);
          expect(JSON.stringify(await readPersistedState(app)), `${engine} ${name}`).toBe(before);
        }

        // --- UNFINISHED PRACTICE still blocks a replacement -------------------
        await goTo(app, '/items/it-abouata');
        await page.getByRole('button', { name: 'Start a block' }).click();
        await page.getByRole('button', { name: 'Discard block' }).waitFor();
        const during = JSON.stringify((await readPersistedState(app)).state as object);
        await importBackup(app, 'replace.json', wrap(reconciled()));
        expect(await importOutcome(app), engine).toMatch(/unfinished|practice/i);
        expect(JSON.stringify((await readPersistedState(app)).state as object), engine).toBe(during);
        await goTo(app, '/active');
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 1_200_000);
});
