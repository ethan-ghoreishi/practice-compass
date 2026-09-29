import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  persistedDb,
  persistedUntil,
  readPersistedState,
  reload,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';
import LEGACY_TEXT from './fixtures/repertoire-legacy-v14.json?raw';
import CURRENT_TEXT from './fixtures/repertoire-current-v15.json?raw';
import type { PracticeDB } from '../src/domain/types';

// ---------------------------------------------------------------------------
// ac-4 / ac-6 / ac-19 — the repertoire experience, rendered: real controls,
// real IndexedDB, saved state asserted after every step. Synthetic fixtures
// only, seeded state-only (WebKit cannot store a Blob under the automation
// driver; attachment bytes are the inbound journey's subject, not these).
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-09-28T09:00:00');
type Db = PracticeDB;

function stateOnly(text: string): string {
  const raw = JSON.parse(text);
  delete raw.files;
  raw.data.attachments = [];
  return JSON.stringify(raw);
}

const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const until = <T,>(app: PracticeApp, read: (d: Db) => T, ok: (v: T) => boolean) =>
  persistedUntil(app, (s) => read((s.state as { db: Db }).db), ok, 20_000);

/** Make the real IndexedDB `put` throw, exactly as a full device would. */
async function breakStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
    proto.__realPut = proto.put;
    proto.put = function failing() {
      throw new DOMException('storage is full', 'QuotaExceededError');
    };
  });
}
async function repairStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
    if (proto.__realPut) proto.put = proto.__realPut;
  });
}

/**
 * Hold every write to the app's state IN FLIGHT: a second connection keeps a
 * readwrite transaction on the same store alive, so the app's own write queues
 * behind it — pending, neither failed nor done — until `releaseStorage`.
 */
async function holdStorage(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const w = window as unknown as { __holdStorage?: boolean };
        w.__holdStorage = true;
        const open = indexedDB.open('practice-compass');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const conn = open.result;
          const tx = conn.transaction('kv', 'readwrite');
          const store = tx.objectStore('kv');
          const spin = () => {
            if (w.__holdStorage) store.get('__hold__').onsuccess = spin;
          };
          spin();
          tx.oncomplete = () => conn.close();
          resolve();
        };
      }),
  );
}
async function releaseStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __holdStorage?: boolean }).__holdStorage = false;
  });
}

describe('musical terms, managed', () => {
  it('musical term management preserves identities and reports durable saves honestly', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    const term = async (id: string) => (await db(app)).musicTerms.find((t) => t.id === id);
    try {
      await importBackup(app, 'repertoire-current-v15.json', stateOnly(CURRENT_TEXT));
      expect(await importOutcome(app)).toContain('Imported');
      await goTo(app, '/terms');

      // RENAME A BUILT-IN: same id, former name kept as a spelling.
      await page.getByRole('button', { name: 'Edit دستگاه شور' }).click();
      await page.getByRole('textbox', { name: 'Name of دستگاه شور' }).fill('شورِ من');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
      const renamed = await until(app, (d) => d.musicTerms.find((t) => t.id === 'dastgah:shur'), (t) => t?.name === 'شورِ من');
      expect(renamed!.aliases).toContain('دستگاه شور');
      // The editor now shows the spellings the store holds, so saving again
      // is a plain save — never a refused "removal" of the former name.
      expect(await page.getByRole('textbox', { name: 'Spellings of شورِ من' }).inputValue()).toContain('دستگاه شور');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
      expect(await page.getByText(/Not saved/).count()).toBe(0);
      // The piece pointing at it follows the rename — its reference never moved.
      expect((await db(app)).items.find((i) => i.id === 'it-khatai')!.persian!.dastgahAvaz).toEqual({ termId: 'dastgah:shur' });
      await goTo(app, '/items/it-khatai');
      expect(await page.locator('main').innerText()).toContain('شورِ من');

      // A SPELLING ANOTHER TERM CLAIMS is refused and explained; nothing moves.
      await goTo(app, '/terms');
      await page.getByRole('button', { name: 'Composer / maestro' }).click();
      const before = JSON.stringify(await term('term-mahjoubi'));
      await page.getByRole('button', { name: 'Edit مرتضی محجوبی' }).click();
      await page.getByRole('textbox', { name: 'Spellings of مرتضی محجوبی' }).fill('محجوبی\nصبا');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.getByText(/already means/).first().waitFor({ timeout: 10_000 });
      expect(JSON.stringify(await term('term-mahjoubi'))).toBe(before);

      // ADD a custom form, ARCHIVE it, RESTORE it, DELETE it (unused).
      await page.getByRole('button', { name: 'Form', exact: true }).click();
      await page.getByRole('button', { name: /Add a term/ }).click();
      await page.getByRole('textbox', { name: 'Term name' }).fill('چهارپاره');
      await page.getByRole('textbox', { name: 'Other spellings' }).fill('Chaharpareh');
      await page.getByRole('button', { name: 'Add term' }).click();
      await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
      const added = await until(app, (d) => d.musicTerms.find((t) => t.name === 'چهارپاره'), (t) => !!t);
      expect([added!.kind, added!.aliases]).toEqual(['form', ['Chaharpareh']]);
      await page.getByRole('button', { name: 'Done' }).click();
      // Done starts a FRESH session next time: empty, editable, with its Add
      // button — nothing from the finished save carries over.
      await page.getByRole('button', { name: /Add a term/ }).click();
      const freshName = page.getByRole('textbox', { name: 'Term name' });
      expect([await freshName.inputValue(), await freshName.isEnabled()]).toEqual(['', true]);
      expect(await page.getByRole('textbox', { name: 'Other spellings' }).isEnabled()).toBe(true);
      expect(await page.getByText('Saved.').count()).toBe(0);
      await freshName.fill('سه‌ضربی');
      await page.getByRole('button', { name: 'Add term' }).click();
      await until(app, (d) => d.musicTerms.find((t) => t.name === 'سه‌ضربی')?.kind, (k) => k === 'form');
      await page.getByRole('button', { name: 'Done' }).click();

      // ARCHIVE whose write FAILS: the row moves to the archived part of the
      // list and its failure — with Try again — moves with it.
      await breakStorage(page);
      await page.getByRole('button', { name: 'Archive چهارپاره' }).click();
      await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
      expect(await page.getByText('Saved.').count()).toBe(0);
      await repairStorage(page);
      await page.getByRole('button', { name: 'Try again' }).click();
      await until(app, (d) => d.musicTerms.find((t) => t.id === added!.id)?.archived, (a) => a === true);
      await expect.poll(() => page.getByText(/Not saved/).count()).toBe(0);
      await page.getByRole('button', { name: 'Restore چهارپاره' }).click();
      await until(app, (d) => d.musicTerms.find((t) => t.id === added!.id)?.archived, (a) => a === undefined);
      // DELETE whose write FAILS: the row is gone, the outcome is not — it
      // says so under the term's name, and Try again writes the deletion.
      await breakStorage(page);
      await page.getByRole('button', { name: 'Delete چهارپاره' }).click();
      await page.getByText(/deleted — Not saved/).waitFor({ timeout: 10_000 });
      expect((await db(app)).musicTerms.some((t) => t.id === added!.id)).toBe(true);
      await repairStorage(page);
      await page.getByRole('button', { name: 'Try again' }).click();
      await until(app, (d) => d.musicTerms.some((t) => t.id === added!.id), (present) => !present);
      await page.getByText(/deleted — Saved\./).waitFor({ timeout: 10_000 });
      // A REFERENCED custom term cannot be deleted (the archived ختایی is on a
      // piece); a BUILT-IN offers no Delete at all.
      expect(await page.getByRole('button', { name: 'Delete ختایی' }).isDisabled()).toBe(true);
      expect(await page.getByRole('button', { name: 'Delete رنگ' }).count()).toBe(0);

      // THROUGH A RELOAD everything above holds, identities included.
      await reload(app);
      const after = await db(app);
      expect(after.musicTerms.find((t) => t.id === 'dastgah:shur')!.name).toBe('شورِ من');
      expect(after.musicTerms.find((t) => t.id === 'term-khatai')!.archived).toBe(true);
      expect(after.items.find((i) => i.id === 'it-khatai')!.persian!.form).toEqual({ termId: 'term-khatai' });

      // A FAILED WRITE never says Saved: the draft stays, and Try again writes
      // what is on screen NOW.
      await goTo(app, '/terms');
      await page.getByRole('button', { name: 'Composer / maestro' }).click();
      await page.getByRole('button', { name: 'Edit مرتضی محجوبی' }).click();
      const nameBox = page.getByRole('textbox', { name: 'Name of مرتضی محجوبی' });
      await breakStorage(page);
      await nameBox.fill('مرتضی محجوبی — edited');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
      expect(await page.getByText('Saved.').count()).toBe(0);
      expect(await nameBox.inputValue()).toBe('مرتضی محجوبی — edited');
      await repairStorage(page);
      await nameBox.fill('مرتضی محجوبی — edited twice');
      await page.getByRole('button', { name: 'Try again' }).click();
      await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
      await until(app, (d) => d.musicTerms.find((t) => t.id === 'term-mahjoubi')?.name, (n) => n === 'مرتضی محجوبی — edited twice');
      await reload(app);
      expect((await term('term-mahjoubi'))!.name).toBe('مرتضی محجوبی — edited twice');

      // TYPING WHILE A WRITE IS IN FLIGHT: the older write never says "Saved."
      // over newer words; they are written, and only then is it Saved.
      await page.getByRole('button', { name: 'Composer / maestro' }).click();
      await page.getByRole('button', { name: 'Edit مرتضی محجوبی — edited twice' }).click();
      const liveName = page.locator('input[aria-label^="Name of"]');
      await holdStorage(page);
      await liveName.fill('محجوبی — first');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.getByText('Saving…').waitFor({ timeout: 10_000 });
      await liveName.fill('محجوبی — second');
      expect(await page.getByText('Saved.').count()).toBe(0);
      await releaseStorage(page);
      await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
      expect(await liveName.inputValue()).toBe('محجوبی — second');
      await until(app, (d) => d.musicTerms.find((t) => t.id === 'term-mahjoubi')?.name, (n) => n === 'محجوبی — second');

      // THE SAME LIFECYCLE FOR STUDY SOURCES — the full editor, the item
      // form's inline "new source", and choosing which source a course is.
      // Each keeps what is on screen until IndexedDB acknowledged THAT, and a
      // Try again after a failure writes once, never a second copy.
      await goTo(app, '/materials');
      await page.getByRole('button', { name: /New/ }).click();
      const srcName = page.getByRole('textbox', { name: 'Source name' });
      await srcName.fill('کتاب اول');
      await breakStorage(page);
      await page.getByRole('button', { name: 'Create source' }).click();
      await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
      expect(await srcName.inputValue()).toBe('کتاب اول');
      await repairStorage(page);
      await srcName.fill('کتاب اول — ویرایش');
      await page.getByRole('button', { name: 'Try again' }).click();
      await page.getByText(/— Saved\./).waitFor({ timeout: 10_000 });
      expect(await srcName.count()).toBe(0);
      await until(
        app,
        (d) => d.materials.filter((m) => m.title.startsWith('کتاب اول')).map((m) => m.title),
        (t) => t.length === 1 && t[0] === 'کتاب اول — ویرایش',
      );

      await goTo(app, '/items/new');
      await page.getByRole('combobox', { name: 'Study source' }).selectOption('__new__');
      const inlineName = page.getByRole('textbox', { name: 'New study source name' });
      await inlineName.fill('جزوهٔ کلاس');
      await breakStorage(page);
      await page.getByRole('button', { name: 'Create', exact: true }).click();
      await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
      expect(await inlineName.inputValue()).toBe('جزوهٔ کلاس');
      await repairStorage(page);
      await page.getByRole('button', { name: 'Try again' }).click();
      await expect.poll(() => inlineName.count()).toBe(0);
      const inline = await until(app, (d) => d.materials.filter((m) => m.title === 'جزوهٔ کلاس'), (m) => m.length === 1);
      expect(await page.getByRole('combobox', { name: 'Study source' }).inputValue()).toBe(inline[0].id);

      // Two sources both proven to be the Khonyagar course: the owner chooses,
      // and the choice stays on screen until it is saved.
      await goTo(app, '/materials?instrument=inst-tar');
      for (let n = 0; n < 2; n++) {
        await page.getByRole('button', { name: /New/ }).click();
        await page.getByRole('combobox', { name: 'Kind' }).selectOption('course');
        await page.getByRole('textbox', { name: 'Source name' }).fill('خنیاگر');
        await page.getByRole('button', { name: 'Create source' }).click();
        await page.getByText(/— Saved\./).waitFor({ timeout: 10_000 });
      }
      const khon = await until(
        app,
        (d) => d.materials.filter((m) => m.instrumentId === 'inst-tar' && m.title === 'خنیاگر').map((m) => m.id),
        (ids) => ids.length === 2,
      );
      await goTo(app, '/repertoire?view=paths&inst=inst-tar');
      await page.getByRole('button', { name: /Add default pathway: .*خنیاگر/ }).click();
      await page.getByRole('button', { name: /آزاد میرزاپور/ }).first().click();
      await page.getByRole('link', { name: 'Continue this stage' }).click();
      await page.locator('button[title="Add to your items"]').first().click();
      const choice = page.getByRole('region', { name: 'Choose the study source' });
      await choice.waitFor({ timeout: 10_000 });
      await breakStorage(page);
      await choice.getByRole('button', { name: 'خنیاگر' }).first().click();
      await choice.getByText(/Not saved/).waitFor({ timeout: 10_000 });
      await repairStorage(page);
      await choice.getByRole('button', { name: 'Try again' }).click();
      await expect.poll(() => choice.count()).toBe(0);
      await page.getByText(/Study source chosen — Saved\./).waitFor({ timeout: 10_000 });
      await until(
        app,
        (d) => d.materials.filter((m) => m.instrumentId === 'inst-tar' && m.sourceKey).map((m) => m.id),
        (ids) => ids.length === 1 && khon.includes(ids[0]),
      );
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

describe('browsing, and coming back to it', () => {
  it('repertoire navigation restores browse context without changing session scope', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    const session = async () => ((await readPersistedState(app)).state as { sessionInstrumentId: string | null }).sessionInstrumentId;
    const worksShown = () => page.locator('main section .list-row .row-title').allInnerTexts();
    const search = () => page.getByRole('searchbox', { name: 'Search my repertoire' });
    const composer = () => page.getByRole('combobox', { name: 'Composer / maestro' });
    try {
      await importBackup(app, 'repertoire-legacy-v14.json', stateOnly(LEGACY_TEXT));
      expect(await importOutcome(app)).toContain('Imported');
      // Practising Setar today.
      await goTo(app, '/');
      await page.getByRole('button', { name: 'Setar' }).first().click();
      await expect.poll(session).toBe('inst-setar');

      // My repertoire is the DEFAULT view, opened on the session instrument.
      await goTo(app, '/repertoire');
      expect(await page.getByRole('button', { name: 'My repertoire' }).getAttribute('aria-pressed')).toBe('true');
      const instruments = page.getByRole('group', { name: 'Instrument' });
      expect(await instruments.getByRole('button', { name: 'Setar', exact: true }).getAttribute('aria-pressed')).toBe('true');

      // Query + facet, held in the URL.
      await search().fill('shur');
      await composer().selectOption('term:composer:darvish-khan');
      await expect.poll(() => page.url()).toMatch(/q=shur/);
      await expect.poll(() => page.url()).toMatch(/composer=term%3Acomposer%3Adarvish-khan/);
      await expect.poll(async () => (await worksShown()).sort()).toEqual(['Pish-daramad in Shur', 'پیش‌درآمد شور'].sort());

      // Open a work and come BACK: the same query, facet and results.
      await page.getByRole('link', { name: /Pish-daramad in Shur/ }).click();
      await page.getByRole('button', { name: 'Start a block' }).waitFor();
      await page.locator('main').getByRole('link', { name: 'Repertoire', exact: true }).click();
      await search().waitFor();
      expect(await search().inputValue()).toBe('shur');
      expect(await composer().inputValue()).toBe('term:composer:darvish-khan');
      expect((await worksShown()).length).toBe(2);
      // Browser BACK and FORWARD walk the same context.
      await page.goBack();
      await page.getByRole('button', { name: 'Start a block' }).waitFor();
      await page.goForward();
      await search().waitFor();
      expect(await search().inputValue()).toBe('shur');
      expect(await composer().inputValue()).toBe('term:composer:darvish-khan');

      // Practice list: the SAME text matching with its OWN eligibility — a
      // matching part is listed itself there, while My repertoire shows its parent.
      await search().fill('fast run');
      await composer().selectOption('');
      await expect.poll(worksShown).toEqual(['پیش‌درآمد شور']);
      await page.getByRole('button', { name: 'Practice list' }).click();
      expect(await page.getByRole('searchbox', { name: 'Search practice items' }).inputValue()).toBe('fast run');
      await page.getByRole('link', { name: /بخش دوم — the fast run/ }).first().waitFor();
      // Start shares the matching and keeps its own list (this instrument's items).
      await goTo(app, '/start');
      const startSearch = page.getByPlaceholder('Search items…').first();
      await startSearch.fill('darvish');
      await page.getByRole('button', { name: /Pish-daramad in Shur/ }).first().waitFor();
      await startSearch.fill('fast run');
      await page.getByRole('button', { name: /بخش دوم — the fast run/ }).first().waitFor();

      // Browsing ANOTHER instrument never changes what Today is practising.
      await goTo(app, '/repertoire');
      await instruments.getByRole('button', { name: 'Tar', exact: true }).click();
      await expect.poll(() => page.url()).toMatch(/inst=inst-tar/);
      expect(await session()).toBe('inst-setar');
      await reload(app);
      expect(await session()).toBe('inst-setar');

      // …and through a PATHWAY and its STAGE: whichever door the owner leaves
      // by, the browsed view and instrument come back — never My repertoire on
      // the session instrument.
      const pathsOnTar = async () => {
        await expect.poll(() => page.url()).toMatch(/view=paths&inst=inst-tar/);
        expect(await page.getByRole('button', { name: 'Pathways', exact: true }).getAttribute('aria-pressed')).toBe('true');
        expect(await instruments.getByRole('button', { name: 'Tar', exact: true }).getAttribute('aria-pressed')).toBe('true');
      };
      await page.getByRole('button', { name: 'Pathways', exact: true }).click();
      await page.getByRole('button', { name: /روش هنرستان/ }).click();
      await page.locator('main').getByRole('link', { name: 'Repertoire', exact: true }).click();
      await pathsOnTar();
      await page.getByRole('button', { name: /روش هنرستان/ }).click();
      await page.getByRole('button', { name: /مبانی دست راست/ }).first().click();
      await page.locator('main').getByRole('link', { name: 'Pathway', exact: true }).click();
      await page.locator('main').getByRole('link', { name: 'Repertoire', exact: true }).click();
      await pathsOnTar();
      // Opened with no browse context at all (a bookmark), a pathway returns
      // to ITS OWN instrument's pathways.
      await goTo(app, '/pathway/tar-honarestan');
      await page.locator('main').getByRole('link', { name: 'Repertoire', exact: true }).click();
      await pathsOnTar();
      // Study sources opened while browsing Tar starts a new source ON Tar.
      await page.getByRole('link', { name: 'Study sources' }).click();
      await page.getByRole('button', { name: /New/ }).click();
      expect(await page.locator('main').getByRole('combobox', { name: 'Instrument' }).inputValue()).toBe('inst-tar');
      await page.getByRole('link', { name: /Back/ }).click();
      await pathsOnTar();
      expect(await session()).toBe('inst-setar');

      // STALE or UNKNOWN parameters open the nearest honest view.
      await goTo(app, '/repertoire?view=bogus&inst=gone&composer=term%3Agone&quick=zzz&group=nope');
      expect(await page.getByRole('button', { name: 'My repertoire' }).getAttribute('aria-pressed')).toBe('true');
      expect(await instruments.getByRole('button', { name: 'Setar', exact: true }).getAttribute('aria-pressed')).toBe('true');
      expect(await composer().inputValue()).toBe('');
      expect((await worksShown()).length).toBe(9);
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await expect.poll(() => page.url()).not.toMatch(/composer=/);
      expect(await session()).toBe('inst-setar');
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

describe('the whole repertoire experience, in both engines', () => {
  it('the unified repertoire journey works in Chromium and WebKit', async () => {
    const engines: Engine[] = ['chromium', 'webkit'];
    for (const engine of engines) {
      for (const [layout, viewport] of [
        ['phone', { width: 390, height: 844 }],
        ['desktop', { width: 1280, height: 900 }],
      ] as const) {
        const where = `${engine} ${layout}`;
        const app = await openPracticeApp({ now: CLOCK, engine, viewport });
        const { page } = app;
        try {
          await importBackup(app, 'repertoire-legacy-v14.json', stateOnly(LEGACY_TEXT));
          expect(await importOutcome(app), where).toContain('Imported');
          await goTo(app, '/');
          await page.getByRole('button', { name: 'Setar' }).first().click();

          // BROWSE by a maestro typed in Latin, then EDIT: a term chosen by
          // name becomes a reference; the legacy literals beside it are untouched.
          await goTo(app, '/repertoire?inst=inst-setar');
          await page.getByRole('searchbox', { name: 'Search my repertoire' }).fill('darvish');
          await page.getByRole('link', { name: /Pish-daramad in Shur/ }).click();
          await page.getByRole('button', { name: 'Edit', exact: true }).click();
          const form = page.getByRole('combobox', { name: 'Form' }).or(page.getByRole('textbox', { name: 'Form' })).first();
          expect(await form.inputValue(), where).toBe('Pish-darāmad');
          await form.fill('چهارمضراب');
          await page.getByRole('button', { name: 'Save changes' }).click();
          const edited = await until(app, (d) => d.items.find((i) => i.id === 'it-shur-latin')!.persian, (p) => typeof p?.form === 'object');
          expect(edited, where).toEqual({ dastgahAvaz: 'Shur', form: { termId: 'form:chahar-mezrab' }, composer: 'Darvish Khan' });

          // The named radif view, added EXPLICITLY, reuses the owned gusheh…
          await goTo(app, '/repertoire?view=paths&inst=inst-setar');
          await page.getByRole('button', { name: /Add default pathway: سه‌تار · ردیف میرزا عبدالله/ }).click();
          await until(app, (d) => d.pathways.some((p) => p.id === 'setar-radif-mirza'), (x) => x);
          await goTo(app, '/pathway/setar-radif-mirza/setar-radif-mirza-afshari');
          await page.getByRole('button', { name: 'Practise عراق' }).waitFor();
          expect(await page.getByRole('button', { name: 'Add عراق to your items' }).count(), where).toBe(0);
          // …and ADDING a new suggestion creates one classified, bound gusheh.
          await page.getByRole('button', { name: 'Add جامه‌دران to your items' }).click();
          await page.getByRole('status').filter({ hasText: 'Added' }).first().waitFor();
          const jam = await until(app, (d) => d.items.find((i) => i.catalogRefs?.includes('radif:mirza-abdollah:afshari:jamedaran')), (i) => !!i);
          expect([jam!.instrumentId, jam!.persian], where).toEqual(['inst-setar', { dastgahAvaz: { termId: 'dastgah:afshari' }, gusheh: 'جامه‌دران' }]);

          // LINK the right one of two legacy copies — an explicit choice.
          await goTo(app, '/pathway/setar-radif-mirza/setar-radif-mirza-shur');
          await page.getByRole('button', { name: 'Choose which item is درآمد شور' }).click();
          await page.getByRole('region', { name: 'Which item is “درآمد شور”?' }).getByRole('button', { name: /درآمد شور \(copy\)/ }).click();
          await until(app, (d) => d.items.find((i) => i.id === 'it-daramad-b')!.catalogRefs, (r) => !!r?.includes('radif:mirza-abdollah:shur:daramad-e-shur'));
          expect((await db(app)).items.find((i) => i.id === 'it-daramad-a')!.catalogRefs, where).toBeUndefined();

          // HIDE and RESTORE a suggestion — visibility only, nothing created or lost.
          const itemsBefore = (await db(app)).items.length;
          await page.getByLabel('More actions for رهاب').click();
          await page.getByRole('button', { name: 'Hide this suggestion' }).click();
          await until(app, (d) => d.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs ?? [], (h) => h.length === 1);
          await page.getByText(/Hidden suggestions \(1\)/).click();
          await page.getByRole('button', { name: 'Restore رهاب' }).click();
          await until(app, (d) => d.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs ?? [], (h) => h.length === 0);
          expect((await db(app)).items.length, where).toBe(itemsBefore);

          // TAR shares the definition, never the practice.
          await goTo(app, '/repertoire?view=paths&inst=inst-tar');
          await page.getByRole('button', { name: /Add default pathway: تار · ردیف میرزا عبدالله/ }).click();
          await until(app, (d) => d.pathways.some((p) => p.id === 'tar-radif-mirza'), (x) => x);
          await goTo(app, '/pathway/tar-radif-mirza/tar-radif-mirza-afshari');
          await page.getByRole('button', { name: 'Add عراق to your items' }).click();
          const tarIraq = await until(
            app,
            (d) => d.items.find((i) => i.instrumentId === 'inst-tar' && i.catalogRefs?.includes('radif:mirza-abdollah:afshari:iraq')),
            (i) => !!i,
          );
          expect(tarIraq!.id, where).not.toBe('it-iraq');

          // A STUDY SOURCE: five clear kinds, on the instrument being browsed.
          await goTo(app, '/materials?instrument=inst-tar');
          await page.getByRole('button', { name: 'New' }).click();
          const kinds = await page.getByRole('combobox', { name: 'Kind' }).locator('option').allInnerTexts();
          expect(kinds, where).toEqual(['Radif', 'Method book', 'Collection', 'Course', 'Other']);
          await page.getByRole('group', { name: 'Name' }).locator('input').fill('دفتر تصنیف');
          await page.getByRole('combobox', { name: 'Kind' }).selectOption('repertoire');
          await page.getByRole('button', { name: 'Create source' }).click();
          const src = await until(app, (d) => d.materials.find((m) => m.title === 'دفتر تصنیف'), (m) => !!m);
          expect([src!.instrumentId, src!.sourceType], where).toEqual(['inst-tar', 'repertoire']);

          // TERMS: the maestro counts the pieces that mean him, in any spelling.
          await goTo(app, '/terms');
          await page.getByRole('button', { name: 'Composer / maestro' }).click();
          expect(await page.locator('.list-row').filter({ hasText: 'درویش‌خان' }).first().innerText(), where).toMatch(/2 pieces/);

          // TODAY → START → ACTIVE → CLOSE, recorded as a real block.
          await goTo(app, '/');
          await page.getByText(/Practise now/i).first().waitFor();
          const blocksBefore = (await db(app)).blocks.length;
          await goTo(app, '/start');
          await page.getByPlaceholder('Search items…').first().fill('عراق');
          await page.getByRole('button', { name: /^عراق/ }).first().click();
          await page.getByRole('button', { name: /Begin practice/ }).click();
          await page.getByRole('button', { name: 'Finish' }).click();
          await page.getByRole('button', { name: 'Stable alone' }).click();
          await page.getByRole('button', { name: 'Save block' }).click();
          await until(app, (d) => d.blocks.length, (n) => n === blocksBefore + 1);
          expect((await db(app)).blocks.at(-1)!.practiceItemId, where).toBe('it-iraq');

          // OFFLINE: the screens already opened keep working with no network.
          await goTo(app, '/repertoire');
          await page.context().setOffline(true);
          const nav = page.getByRole('navigation', { name: 'Primary' });
          await nav.getByRole('link', { name: 'Today' }).click();
          await nav.getByRole('link', { name: 'Repertoire' }).click();
          await page.getByRole('searchbox', { name: 'Search my repertoire' }).fill('عراق');
          await page.getByRole('link', { name: /عراق/ }).first().waitFor();
          await page.context().setOffline(false);

          // FAILURE: a refused write says so, keeps the draft, and retries.
          await goTo(app, '/terms');
          await page.getByRole('button', { name: 'Edit افشاری' }).click();
          await breakStorage(page);
          await page.getByRole('textbox', { name: 'Name of افشاری' }).fill('افشاریِ من');
          await page.getByRole('button', { name: 'Save', exact: true }).click();
          await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
          await repairStorage(page);
          await page.getByRole('button', { name: 'Try again' }).click();
          await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });

          // RELOAD: every saved decision is in IndexedDB, not React state.
          await reload(app);
          const final = await db(app);
          expect(final.musicTerms.find((t) => t.id === 'dastgah:afshari')!.name, where).toBe('افشاریِ من');
          expect(final.items.find((i) => i.id === 'it-shur-latin')!.persian!.form, where).toEqual({ termId: 'form:chahar-mezrab' });
          expect(final.pathways.map((p) => p.id), where).toEqual(expect.arrayContaining(['setar-radif-mirza', 'tar-radif-mirza']));
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
  }, 900_000);
});
