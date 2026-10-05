import { describe, expect, it } from 'vitest';
import type { Locator, Page } from 'playwright';
import { createItem, SCHEMA_VERSION } from '../src/domain';
import { goTo, importBackup, importOutcome, openPracticeApp, persistedDb, reload, type Engine, type PracticeApp } from './practiceBrowser';

// ---------------------------------------------------------------------------
// ac-12 — the three classifying fields offer their terms WHILE TYPING, as the
// app's own visible buttons, in both engines, by mouse, by keyboard and by
// touch. Nothing here fills a finished name and calls it found: every term is
// reached from a partial query and chosen from what is on screen.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-05T08:00:00.000Z');
const T = CLOCK.toISOString();
const DESKTOP = { width: 1280, height: 900 };
const PHONE = { width: 390, height: 844 };

function fixture(): string {
  const term = (id: string, kind: string, name: string, aliases: string[], archived = false) => ({
    id,
    kind,
    name,
    aliases,
    ...(archived ? { archived: true } : {}),
    createdAt: T,
    updatedAt: T,
  });
  const data = {
    schemaVersion: SCHEMA_VERSION,
    instruments: [{ id: 'inst-setar', name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T }],
    materials: [],
    items: [
      {
        ...createItem({ instrumentId: 'inst-setar', title: 'Literal piece', itemType: 'full_piece', status: 'usable' }, CLOCK),
        id: 'it-literal',
        persian: { dastgahAvaz: 'دشتی/شور', form: 'یک فرم', composer: 'یک آهنگساز' },
      },
    ],
    blocks: [],
    reviews: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [],
    attachments: [],
    lessons: [],
    lessonAgenda: [],
    archiveSources: [],
    musicTerms: [
      // A custom form with a Latin spelling.
      term('term-chaharpareh', 'form', 'چهارپاره', ['Chaharpareh']),
      // A RENAMED built-in: same id, its former name kept as a spelling.
      term('dastgah:shur', 'dastgah', 'شورِ من', ['شور', 'دستگاه شور', 'Shur', 'Shour']),
      // ARCHIVED: still readable, never offered for new entry.
      term('term-archived', 'composer', 'آهنگساز بایگانی', []),
      // AMBIGUOUS: two composers both claim «Ambig».
      term('term-ambig-a', 'composer', 'Composer Alpha', ['Ambig']),
      term('term-ambig-b', 'composer', 'Composer Beta', ['Ambig']),
    ].map((t) => (t.id === 'term-archived' ? { ...t, archived: true } : t)),
  };
  return JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data });
}

/** The same server, a TOUCH phone context in the same browser: its own origin storage. */
async function touchApp(desktop: PracticeApp): Promise<PracticeApp & { context: () => Promise<void> }> {
  const browser = desktop.page.context().browser()!;
  const context = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 2, hasTouch: true, isMobile: desktop.engine === 'chromium' });
  const page = await context.newPage();
  const errors: Error[] = [];
  page.on('pageerror', (e) => errors.push(e));
  page.on('dialog', (d) => void d.accept().catch(() => {}));
  await page.clock.install({ time: CLOCK });
  await page.goto(desktop.origin);
  await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 60_000 });
  return {
    page,
    origin: desktop.origin,
    engine: desktop.engine,
    get pageErrors() {
      return errors;
    },
    close: () => context.close(),
    context: () => context.close(),
  };
}

type How = 'click' | 'tap' | 'keyboard';
const suggestions = (page: Page, label: string) => page.getByRole('group', { name: `${label} suggestions` });
async function pick(page: Page, option: Locator, how: How) {
  await option.waitFor();
  if (how === 'tap') await option.tap();
  else if (how === 'click') await option.click();
  else {
    await option.focus();
    await page.keyboard.press('Enter');
  }
}
const field = (page: Page, label: string) => page.getByRole('textbox', { name: label, exact: true });

describe('musical term suggestions', () => {
  it('musical term suggestions can be found and selected while typing in both engines', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const desktop = await openPracticeApp({ now: CLOCK, engine, viewport: DESKTOP });
      const phone = await touchApp(desktop);
      try {
        for (const [where, app, how] of [
          ['desktop', desktop, 'click'],
          ['phone', phone, 'tap'],
        ] as [string, PracticeApp, How][]) {
          const { page } = app;
          const label = `${engine}/${where}`;
          await importBackup(app, 'terms.json', fixture());
          expect(await importOutcome(app), label).toContain('Imported');
          await reload(app);

          // --- NEW ITEM: three fields, each found from a partial query -------
          await goTo(app, '/items/new');
          await page.getByRole('group', { name: 'Kind of practice item' }).getByRole('button', { name: 'Composed piece' }).click();
          await page.getByRole('textbox', { name: 'Title' }).fill(`Found while typing ${where}`);
          // Partial FARSI → the visible match, chosen by mouse or touch.
          await field(page, 'Dastgāh / Āvāz').fill('ماه');
          const dastgah = suggestions(page, 'Dastgāh / Āvāz');
          expect(await dastgah.getByRole('button').allInnerTexts(), label).toContain('ماهور');
          // A partial match is never accepted on its own: still literal text.
          expect(await page.locator('main').innerText(), label).not.toContain('Shared term');
          await pick(page, dastgah.getByRole('button', { name: 'ماهور' }), how);
          expect(await field(page, 'Dastgāh / Āvāz').inputValue(), label).toBe('ماهور');
          expect(await suggestions(page, 'Dastgāh / Āvāz').count(), label).toBe(0);
          // Partial LATIN → a custom term through its own spelling, by KEYBOARD.
          await field(page, 'Form').fill('chahar');
          const forms = suggestions(page, 'Form');
          expect(await forms.getByRole('button').allInnerTexts(), label).toEqual(expect.arrayContaining(['چهارپاره', 'چهارمضراب']));
          await pick(page, forms.getByRole('button', { name: 'چهارپاره' }), 'keyboard');
          expect(await field(page, 'Form').inputValue(), label).toBe('چهارپاره');
          // A NAME's fragment, typed the way an IME commits it (no keystrokes).
          await field(page, 'Composer / maestro').focus();
          await page.keyboard.insertText('صب');
          await pick(page, suggestions(page, 'Composer / maestro').getByRole('button', { name: 'ابوالحسن صبا' }), how);
          // Choosing never saved anything on its own.
          expect((await persistedDb(app)).items.some((i) => i.title === `Found while typing ${where}`), label).toBe(false);
          await page.getByRole('button', { name: 'Add practice item' }).click();
          const saved = await expect
            .poll(async () => (await persistedDb(app)).items.find((i) => i.title === `Found while typing ${where}`)?.persian, { timeout: 10_000 })
            .toEqual({ dastgahAvaz: { termId: 'dastgah:mahur' }, form: { termId: 'term-chaharpareh' }, composer: { termId: 'composer:saba' } });
          void saved;

          // --- EDIT: the renamed, archived, ambiguous, unknown and composite --
          await goTo(app, '/items/it-literal');
          await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
          // The other literals are untouched by opening the form.
          expect(await field(page, 'Dastgāh / Āvāz').inputValue(), label).toBe('دشتی/شور');
          expect(await field(page, 'Composer / maestro').inputValue(), label).toBe('یک آهنگساز');
          // A RENAMED term is offered by its current name, found by its former one.
          await field(page, 'Dastgāh / Āvāz').fill('شو');
          await pick(page, suggestions(page, 'Dastgāh / Āvāz').getByRole('button', { name: 'شورِ من' }), how);
          expect(await field(page, 'Dastgāh / Āvāz').inputValue(), label).toBe('شورِ من');
          // BROWSE ALL is an explicit choice, not a side effect of focus.
          await page.getByRole('button', { name: 'All Form terms' }).click();
          const all = await suggestions(page, 'Form').getByRole('button').allInnerTexts();
          expect(all, label).toEqual(expect.arrayContaining(['پیش‌درآمد', 'چهارمضراب', 'تصنیف', 'چهارپاره']));
          await page.getByRole('button', { name: 'All Form terms' }).click();
          expect(await suggestions(page, 'Form').count(), label).toBe(0);
          // The ARCHIVED term is never offered, even typed in full.
          await field(page, 'Composer / maestro').fill('آهنگساز');
          expect(await suggestions(page, 'Composer / maestro').getByRole('button', { name: 'آهنگساز بایگانی' }).count(), label).toBe(0);
          // AMBIGUOUS text stays the owner's own and says so.
          await field(page, 'Composer / maestro').fill('Ambig');
          await expect.poll(() => page.locator('main').innerText()).toContain('Matches more than one term');
          // CLEAR, then an UNKNOWN name: kept as typed, nothing chosen for it.
          await page.getByRole('button', { name: 'Clear Composer / maestro' }).click();
          expect(await field(page, 'Composer / maestro').inputValue(), label).toBe('');
          await field(page, 'Composer / maestro').fill('استادِ ناشناخته');
          expect(await suggestions(page, 'Composer / maestro').count(), label).toBe(0);
          // Leaving the field closes its suggestions and changes nothing.
          await field(page, 'Form').fill('چهار');
          await page.getByRole('textbox', { name: 'Title' }).click();
          expect(await suggestions(page, 'Form').count(), label).toBe(0);
          expect(await field(page, 'Form').inputValue(), label).toBe('چهار');
          await field(page, 'Form').fill('یک فرم');
          // OFFLINE: the vocabulary is local; nothing needs the network.
          await page.context().setOffline(true);
          await field(page, 'Form').fill('tasn');
          await pick(page, suggestions(page, 'Form').getByRole('button', { name: 'تصنیف' }), how);
          await page.context().setOffline(false);
          await page.getByRole('button', { name: 'Save changes' }).click();
          await expect
            .poll(async () => (await persistedDb(app)).items.find((i) => i.id === 'it-literal')?.persian, { timeout: 10_000 })
            .toEqual({ dastgahAvaz: { termId: 'dastgah:shur' }, form: { termId: 'form:tasnif' }, composer: 'استادِ ناشناخته' });

          // --- RELOAD: what was chosen is what the fields read ---------------
          await reload(app);
          await goTo(app, '/items/it-literal');
          await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
          expect(await field(page, 'Form').inputValue(), label).toBe('تصنیف');
          expect(await page.locator('main').innerText(), label).toContain('Shared term');
          expect(app.pageErrors.map((e) => e.message), label).toEqual([]);
        }
      } finally {
        await phone.close();
        await desktop.close();
      }
    }
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-13 companion — the same controls on a phone, in light and dark, at normal
// and large text, with values in the language their surroundings are NOT in:
// each resolves its own direction from the start edge; the keyboard reaches
// every action, which is a 44px target and never drops focus to the page; the
// draft on the form survives; only <main> scrolls.
// ---------------------------------------------------------------------------

const LARGE_TEXT = 'html { font-size: 150% !important; }';
const LONG_TITLE = 'A long English working title for a Persian piece, typed on the phone before its Farsi details';

async function layoutFacts(page: Page) {
  // The app's one deliberate overlay (a transient toast) is not layout.
  await page.locator('.toast').waitFor({ state: 'detached', timeout: 15_000 });
  return page.evaluate(() => {
    const main = document.querySelector('main')!;
    return {
      pageScrolls: document.scrollingElement!.scrollHeight > window.innerHeight + 1 || window.scrollY !== 0,
      sideways: document.documentElement.scrollWidth > window.innerWidth + 1 || main.scrollWidth > main.clientWidth + 1,
      pinned: [...document.querySelectorAll('body *')].filter((e) => ['fixed', 'sticky'].includes(getComputedStyle(e).position)).length,
    };
  });
}
const active = (page: Page) =>
  page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null;
    const s = a ? getComputedStyle(a) : null;
    return {
      tag: a?.tagName.toLowerCase() ?? '',
      name: a?.getAttribute('aria-label') || a?.textContent?.trim() || '',
      ring: !!s && ((s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1) || s.boxShadow !== 'none'),
    };
  });
const target = async (l: Locator) => {
  const b = await l.boundingBox();
  return !!b && b.width >= 44 && b.height >= 44;
};
const direction = (l: Locator) => l.evaluate((n) => [getComputedStyle(n).direction, getComputedStyle(n).textAlign]);

describe('musical term controls, on a phone', () => {
  it('term suggestion controls keep direction focus and scroll on new and edit forms', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      for (const [colorScheme, large] of [['light', false], ['dark', true]] as const) {
        const where = `${engine} ${colorScheme}${large ? ' large text' : ''}`;
        const app = await openPracticeApp({ now: CLOCK, engine, viewport: PHONE, colorScheme });
        const { page } = app;
        try {
          await importBackup(app, 'terms.json', fixture());
          expect(await importOutcome(app), where).toContain('Imported');
          if (large) await page.addStyleTag({ content: LARGE_TEXT });

          // --- NEW FORM: an English draft, Farsi terms found from Latin -------
          await goTo(app, '/items/new');
          if (large) await page.addStyleTag({ content: LARGE_TEXT });
          await page.getByRole('group', { name: 'Kind of practice item' }).getByRole('button', { name: 'Composed piece' }).click();
          await page.getByRole('textbox', { name: 'Title' }).fill(LONG_TITLE);
          const composer = field(page, 'Composer / maestro');
          await composer.fill('sab');
          const offered = suggestions(page, 'Composer / maestro').getByRole('button', { name: 'ابوالحسن صبا' });
          await offered.waitFor();
          // The Latin query reads LTR in its box; the Farsi term RTL in its button.
          expect(await direction(composer), where).toEqual(['ltr', 'start']);
          expect((await direction(offered))[0], where).toBe('rtl');
          for (const b of [offered, page.getByRole('button', { name: 'Clear Composer / maestro' }), page.getByRole('button', { name: 'All Composer / maestro terms' })]) {
            expect(await target(b), where).toBe(true);
          }
          // The list is in the flow: the page does not scroll, nothing is pinned.
          let facts = await layoutFacts(page);
          expect([facts.pageScrolls, facts.sideways, facts.pinned], where).toEqual([false, false, 0]);

          // KEYBOARD: box → Clear → All → the first suggestion, each ringed.
          await composer.focus();
          const seen: string[] = [];
          for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Tab');
            const a = await active(page);
            expect(a.ring, `${where}: ${a.name} has a visible ring`).toBe(true);
            seen.push(a.name);
          }
          expect(seen, where).toEqual(['Clear Composer / maestro', 'All Composer / maestro terms', 'ابوالحسن صبا']);
          await page.keyboard.press('Enter');
          // Chosen; focus is back in the box, not on the page.
          await expect.poll(() => composer.inputValue()).toBe('ابوالحسن صبا');
          expect(await active(page), where).toMatchObject({ tag: 'input', name: 'Composer / maestro' });
          expect(await direction(composer), where).toEqual(['rtl', 'start']);
          // Clear by keyboard: focus stays in the box, which takes typing at once.
          await page.keyboard.press('Tab');
          expect((await active(page)).name, where).toBe('Clear Composer / maestro');
          await page.keyboard.press('Enter');
          expect(await active(page), where).toMatchObject({ tag: 'input', name: 'Composer / maestro' });
          await page.keyboard.type('vazi');
          await suggestions(page, 'Composer / maestro').getByRole('button', { name: 'علی‌نقی وزیری' }).waitFor();
          // Escape closes the list and leaves the draft and the focus alone.
          await page.keyboard.press('Escape');
          expect(await suggestions(page, 'Composer / maestro').count(), where).toBe(0);
          expect([await composer.inputValue(), (await active(page)).name], where).toEqual(['vazi', 'Composer / maestro']);
          expect(await page.getByRole('textbox', { name: 'Title' }).inputValue(), `${where}: the draft survives`).toBe(LONG_TITLE);
          await pick(page, page.getByRole('button', { name: 'All Composer / maestro terms' }), 'keyboard');
          await pick(page, suggestions(page, 'Composer / maestro').getByRole('button', { name: 'علی‌نقی وزیری' }), 'keyboard');
          await page.getByRole('button', { name: 'Add practice item' }).click();
          await page.getByText(LONG_TITLE).first().waitFor({ timeout: 10_000 });
          const made = ((await persistedDb(app)) as { items: { title: string; persian?: { composer?: unknown } }[] }).items.find((i) => i.title === LONG_TITLE);
          expect(made?.persian?.composer, where).toEqual({ termId: 'composer:vaziri' });

          // --- EDIT FORM: a Farsi literal beside an English title -------------
          await goTo(app, '/items/it-literal');
          await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
          if (large) await page.addStyleTag({ content: LARGE_TEXT });
          const editComposer = field(page, 'Composer / maestro');
          expect(await direction(editComposer), where).toEqual(['rtl', 'start']);
          expect(await direction(page.getByRole('textbox', { name: 'Title' })), where).toEqual(['ltr', 'start']);
          await field(page, 'Form').fill('chahar');
          const forms = suggestions(page, 'Form');
          await forms.getByRole('button', { name: 'چهارپاره' }).waitFor();
          await forms.getByRole('button', { name: 'چهارپاره' }).scrollIntoViewIfNeeded();
          facts = await layoutFacts(page);
          expect([facts.pageScrolls, facts.sideways, facts.pinned], where).toEqual([false, false, 0]);
          await pick(page, forms.getByRole('button', { name: 'چهارپاره' }), 'keyboard');
          expect(await active(page), where).toMatchObject({ tag: 'input', name: 'Form' });
          // The other fields' drafts are untouched by the choice.
          expect(await editComposer.inputValue(), where).toBe('یک آهنگساز');
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
  }, 600_000);
});
