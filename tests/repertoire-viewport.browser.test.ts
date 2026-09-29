import { describe, expect, it } from 'vitest';
import { goTo, importBackup, importOutcome, openPracticeApp, type Engine, type PracticeApp } from './practiceBrowser';
import LEGACY_TEXT from './fixtures/repertoire-legacy-v14.json?raw';

// ---------------------------------------------------------------------------
// ac-20 / ac-21 — the shell, in BOTH engines the owner uses.
//
// The viewport journey installs a SCRIPTED visual viewport before the app's
// own code runs: a desktop browser has no software keyboard, so the geometry
// an iPhone reports is written here BY HAND, per state, and the app's real
// guard (useViewportGuard → viewport.ts) is driven through it. This proves
// the mechanism, not the native keyboard — that stays the owner-device check.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-09-28T09:00:00');
const ENGINES: Engine[] = ['chromium', 'webkit'];

/**
 * The legacy fixture as a STATE-ONLY file: WebKit cannot store a Blob in
 * IndexedDB under the automation driver (AGENTS.md records this), and neither
 * journey here is about attachment bytes — the inbound journey is.
 */
function stateOnly(mutate: (data: { items: { id: string; title: string }[] }) => void = () => {}): string {
  const legacy = JSON.parse(LEGACY_TEXT);
  delete legacy.files;
  legacy.data.attachments = [];
  mutate(legacy.data);
  return JSON.stringify(legacy);
}

/**
 * A fake `visualViewport` and document scroll, installed before the app loads.
 * `window.__vv.set(height, scale, documentScroll)` moves the geometry;
 * `fire(type)` delivers the event the real viewport would; `restores` counts
 * every `window.scrollTo` the app makes — the guard's only action.
 */
const FAKE_VIEWPORT = `(() => {
  if (sessionStorage.getItem('noVisualViewport') === '1') {
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => undefined });
    return;
  }
  const listeners = { resize: new Set(), scroll: new Set() };
  const vv = {
    width: window.innerWidth, height: window.innerHeight, scale: 1, offsetTop: 0, offsetLeft: 0, pageTop: 0, pageLeft: 0,
    addEventListener(type, fn) { listeners[type] && listeners[type].add(fn); },
    removeEventListener(type, fn) { listeners[type] && listeners[type].delete(fn); },
  };
  let documentScroll = 0;
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv });
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => documentScroll });
  window.__vv = {
    restores: 0,
    set(height, scale, scroll) { vv.height = height; vv.scale = scale; documentScroll = scroll; },
    fire(type) { for (const fn of [...listeners[type]]) fn(new Event(type)); },
    listeners() { return listeners.resize.size + listeners.scroll.size; },
    scroll() { return documentScroll; },
  };
  window.scrollTo = function (x, y) {
    window.__vv.restores += 1;
    documentScroll = typeof x === 'object' && x ? (x.top ?? 0) : (y ?? 0);
  };
})();`;

type VV = { set(h: number, s: number, d: number): void; fire(t: string): void; listeners(): number; scroll(): number; restores: number };
const vv = (app: PracticeApp) => ({
  set: (h: number, s: number, d: number) =>
    app.page.evaluate(([h, s, d]) => (window as unknown as { __vv: VV }).__vv.set(h, s, d), [h, s, d] as const),
  fire: (t: 'resize' | 'scroll') => app.page.evaluate((t) => (window as unknown as { __vv: VV }).__vv.fire(t), t),
  restores: () => app.page.evaluate(() => (window as unknown as { __vv: VV }).__vv.restores),
  listeners: () => app.page.evaluate(() => (window as unknown as { __vv: VV }).__vv.listeners()),
  scroll: () => app.page.evaluate(() => (window as unknown as { __vv: VV }).__vv.scroll()),
});

describe('the iPhone keyboard, as geometry', () => {
  it('viewport recovery respects focus zoom and scroll ownership', async () => {
    for (const engine of ENGINES) {
      const app = await openPracticeApp({ now: CLOCK, engine, initScript: FAKE_VIEWPORT });
      const { page } = app;
      const g = vv(app);
      try {
        await importBackup(app, 'repertoire-legacy-v14.json', stateOnly());
        expect(await importOutcome(app), engine).toContain('Imported');
        await goTo(app, '/repertoire');
        // Exactly one guard, listening to exactly the visual viewport's two events.
        expect(await g.listeners(), engine).toBe(2);
        const search = page.getByRole('searchbox', { name: 'Search my repertoire' });
        await search.focus();
        await search.fill('shur');

        // KEYBOARD UP: WebKit reveals the field by moving the layout viewport.
        // That is intentional — nothing is corrected while it is short.
        await g.set(508, 1, 214);
        await g.fire('resize');
        await g.fire('scroll');
        expect(await g.restores(), `${engine}: keyboard up`).toBe(0);

        // DONE, FOCUS RETAINED: the keyboard is gone, the field still focused.
        // The old guard skipped this case entirely; now it restores — once.
        await g.set(844, 1, 214);
        await g.fire('resize');
        expect(await g.restores(), `${engine}: done with retained focus`).toBe(1);
        expect(await g.scroll(), engine).toBe(0);
        expect(
          await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.getAttribute('aria-label')),
          engine,
        ).toBe('Search my repertoire');
        // Repeated events after that find nothing to do: no loop.
        await g.fire('resize');
        await g.fire('scroll');
        await g.fire('resize');
        expect(await g.restores(), `${engine}: repeated`).toBe(1);

        // BLUR path: keyboard up, field blurred, keyboard gone → one restore.
        await g.set(508, 1, 120);
        await g.fire('resize');
        await search.blur();
        await g.set(844, 1, 120);
        await g.fire('resize');
        expect(await g.restores(), `${engine}: blur`).toBe(2);

        // ZOOM is the owner's: a pinch-zoomed viewport is never pulled back.
        await g.set(422, 2, 300);
        await g.fire('scroll');
        await g.fire('resize');
        expect(await g.restores(), `${engine}: zoom`).toBe(2);
        await g.set(844, 1, 0);

        // HARDWARE KEYBOARD: focus with no geometry change moves nothing.
        await search.focus();
        await g.fire('resize');
        expect(await g.restores(), `${engine}: hardware keyboard`).toBe(2);

        // SCROLL OWNERSHIP: <main>'s own scroll is the owner's, never touched.
        // Nothing focused here: WebKit's own reveal of the field focused above can
        // land after the scroll below under load, and that is not the guard.
        await search.blur();
        await page.evaluate(() => {
          document.querySelector('main')!.scrollTop = 260;
        });
        const mainBefore = await page.evaluate(() => document.querySelector('main')!.scrollTop);
        await g.set(844, 1, 90);
        await g.fire('resize');
        expect(await g.restores(), `${engine}: residual after scroll`).toBe(3);
        expect(await page.evaluate(() => document.querySelector('main')!.scrollTop), engine).toBe(mainBefore);

        // SHELL BOXES: `overflow: hidden` stops the owner scrolling #root, not
        // the browser — a reveal can scroll it, which LIFTS the bar while the
        // document offset reads 0. A spacer makes #root scrollable so the
        // lifted bar is real, not a number; it is removed afterwards.
        const barBottom = () => page.evaluate(() => document.querySelector('.tabbar')!.getBoundingClientRect().bottom);
        const rootScroll = () => page.evaluate(() => document.getElementById('root')!.scrollTop);
        const restingBottom = await barBottom();
        await page.evaluate(() => {
          const spacer = document.createElement('div');
          spacer.id = 'lift-spacer';
          spacer.style.height = '2000px';
          document.getElementById('root')!.append(spacer);
          document.getElementById('root')!.scrollTop = 150;
        });
        expect(await barBottom(), `${engine}: bar lifted by #root`).toBe(restingBottom - 150);
        await g.set(508, 1, 0);
        await g.fire('resize');
        expect([await g.restores(), await rootScroll()], `${engine}: shell, keyboard up`).toEqual([3, 150]);
        await g.set(844, 1, 0);
        await g.fire('resize');
        expect([await g.restores(), await rootScroll(), await barBottom()], `${engine}: shell, keyboard gone`).toEqual([4, 0, restingBottom]);
        expect(await page.evaluate(() => document.querySelector('main')!.scrollTop), engine).toBe(mainBefore);
        await page.evaluate(() => document.getElementById('lift-spacer')!.remove());

        // ROUTE CHANGES tear nothing down twice and add nothing: still ONE guard.
        for (const route of ['/', '/lessons', '/repertoire?view=paths', '/terms', '/start']) {
          await goTo(app, route);
          expect(await g.listeners(), `${engine}: ${route}`).toBe(2);
        }
        // BACK FROM THE BACKGROUND with residual displacement: one restore.
        await g.set(844, 1, 70);
        await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
        expect(await g.restores(), `${engine}: resume`).toBe(5);

        // THE OWNER'S TRACE (More → Keyboard trace) writes down what a device
        // reports at each event, and changes nothing the guard does.
        await goTo(app, '/more');
        await page.locator('summary', { hasText: 'Keyboard trace' }).click();
        await page.getByRole('button', { name: 'Start recording' }).click();
        await g.set(508, 1, 120);
        await g.fire('resize');
        await g.set(844, 1, 120);
        await g.fire('resize');
        expect(await g.restores(), `${engine}: traced restore`).toBe(6);
        await page.getByRole('button', { name: 'Stop recording' }).click();
        const lines = (await page.getByRole('textbox', { name: 'Keyboard trace' }).inputValue()).split('\n').map((l) => JSON.parse(l));
        expect(lines[0], engine).toHaveProperty('ua');
        expect(lines.some((l) => l.ev === 'resize' && l.vvH === 508), `${engine}: keyboard-up sample`).toBe(true);
        expect(lines.some((l) => l.ev === 'restore'), `${engine}: guard action recorded`).toBe(true);
        expect(await g.listeners(), `${engine}: recorder torn down`).toBe(2);
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }

      // ABSENT VisualViewport: the guard is a clean no-op — no error, no listener.
      const bare = await openPracticeApp({
        now: CLOCK,
        engine,
        initScript: `sessionStorage.setItem('noVisualViewport', '1');${FAKE_VIEWPORT}`,
      });
      try {
        expect(await bare.page.evaluate(() => window.visualViewport), engine).toBeUndefined();
        await goTo(bare, '/repertoire');
        await bare.page.getByRole('searchbox', { name: 'Search my repertoire' }).focus();
        expect(bare.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await bare.close();
      }
    }
  }, 480_000);
});

// ---------------------------------------------------------------------------
// ac-21 — one shell, readable and operable at phone and desktop widths.
// ---------------------------------------------------------------------------

const LONG_TITLE = 'دشتی و شور — a deliberately long mixed-script title that must wrap instead of pushing the page sideways';

/** WCAG relative-luminance contrast between two computed rgb() colours. */
function contrast(fg: string, bg: string): number {
  const lum = (c: string) => {
    const [r, g, b] = (c.match(/[\d.]+/g) ?? ['0', '0', '0'])
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

describe('the shared practice shell', () => {
  it('the shared practice shell remains accessible and readable across layouts', async () => {
    const fixture = stateOnly((data) => {
      data.items = data.items.map((i) => (i.id === 'it-composite' ? { ...i, title: LONG_TITLE } : i));
    });

    for (const engine of ENGINES) {
      for (const [layout, viewport] of [
        ['phone', { width: 390, height: 844 }],
        ['desktop', { width: 1280, height: 900 }],
      ] as const) {
        for (const colorScheme of ['light', 'dark'] as const) {
          const where = `${engine} ${layout} ${colorScheme}`;
          const app = await openPracticeApp({ now: CLOCK, engine, viewport, colorScheme });
          const { page } = app;
          try {
            await importBackup(app, 'repertoire-legacy-v14.json', fixture);
            expect(await importOutcome(app), where).toContain('Imported');

            // TODAY keeps the owner's order — Plan, then Routines, above the
            // recommendation — and the recommendation is visible without scrolling.
            await goTo(app, '/');
            await page.getByRole('button', { name: 'Setar' }).first().click();
            const plan = await page.getByText(/^Plan/).first().boundingBox();
            const routines = await page.getByText(/^Routines$/).first().boundingBox();
            const now = await page.getByText(/Practise now/i).first().boundingBox();
            expect(plan && routines && now, where).toBeTruthy();
            expect(plan!.y, `${where}: plan above routines`).toBeLessThan(routines!.y);
            expect(routines!.y, `${where}: routines above the recommendation`).toBeLessThan(now!.y);
            expect(now!.y + now!.height, `${where}: recommendation above the fold`).toBeLessThan(viewport.height);

            // REPERTOIRE: reflow (no sideways scroll), a wrapping mixed-script
            // title, every control named, and readable body contrast.
            await goTo(app, '/repertoire?inst=all');
            await page.getByText(LONG_TITLE).first().waitFor({ timeout: 20_000 });
            const facts = await page.evaluate((title) => {
              const main = document.querySelector('main')!;
              const row = [...document.querySelectorAll('.row-title')].find((n) => n.textContent === title) as HTMLElement | undefined;
              const unnamed = [...document.querySelectorAll('main button, main a, main input, main select, main textarea, main summary')]
                .filter((el) => {
                  const e = el as HTMLElement;
                  if (e.offsetParent === null) return false;
                  const name = e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent?.trim();
                  return !name;
                })
                .map((e) => e.outerHTML.slice(0, 80));
              const rowBox = row?.getBoundingClientRect();
              return {
                sideways: document.documentElement.scrollWidth > window.innerWidth + 1 || main.scrollWidth > main.clientWidth + 1,
                rowFits: row ? row.scrollWidth <= Math.ceil(rowBox!.width) + 1 : false,
                rowLines: row && rowBox ? Math.round(rowBox.height / parseFloat(getComputedStyle(row).lineHeight)) : 0,
                unnamed,
                text: getComputedStyle(document.body).color,
                bg: getComputedStyle(document.body).backgroundColor,
              };
            }, LONG_TITLE);
            expect(facts.sideways, `${where}: reflow`).toBe(false);
            expect(facts.rowFits, `${where}: long title stays inside its row`).toBe(true);
            if (layout === 'phone') expect(facts.rowLines, `${where}: long title wraps`).toBeGreaterThan(1);
            expect(facts.unnamed, `${where}: unnamed controls`).toEqual([]);
            expect(contrast(facts.text, facts.bg), `${where}: body contrast`).toBeGreaterThanOrEqual(4.5);
            // A Farsi dastgāh heading reads right-to-left, an English one left-to-right.
            const dirs = await page.evaluate(() =>
              [...document.querySelectorAll('main section h2')].map((h) => [h.textContent, getComputedStyle(h).direction]),
            );
            expect(dirs.find(([t]) => t === 'شور')?.[1], where).toBe('rtl');
            expect(dirs.find(([t]) => t === 'No dastgāh yet')?.[1], where).toBe('ltr');

            // KEYBOARD: Tab reaches the view switcher (with a visible ring) and
            // the search box.
            await page.locator('main').click({ position: { x: 2, y: 2 } });
            let reached = false;
            let ringed = false;
            for (let i = 0; i < 40 && !(reached && ringed); i++) {
              await page.keyboard.press('Tab');
              const f = await page.evaluate(() => {
                const a = document.activeElement as HTMLElement | null;
                if (!a) return { name: '', ring: false };
                const s = getComputedStyle(a);
                return {
                  name: a.getAttribute('aria-label') || a.textContent?.trim() || '',
                  ring: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1) || s.boxShadow !== 'none',
                };
              });
              if (f.name === 'Search my repertoire') reached = true;
              if (f.name === 'Practice list' && f.ring) ringed = true;
            }
            expect([reached, ringed], `${where}: keyboard`).toEqual([true, true]);

            // The PRIMARY action is a full 44px target.
            const primary = await page.getByRole('link', { name: 'Add practice item' }).boundingBox();
            expect(primary!.height, where).toBeGreaterThanOrEqual(44);

            // NO-MATCH is announced, distinct from an empty library, with a way out.
            await page.getByRole('searchbox', { name: 'Search my repertoire' }).fill('zzz-nothing-matches');
            await page.getByRole('status').filter({ hasText: 'No works match' }).waitFor({ timeout: 10_000 });
            await page.getByRole('button', { name: 'Clear filters' }).click();
            await page.getByText(LONG_TITLE).first().waitFor({ timeout: 10_000 });

            // A stage page's row actions are real, named 44×44 targets.
            await goTo(app, '/pathway/setar-radif/setar-radif-afshari');
            const add = page.getByRole('button', { name: /^Add .* to your items$/ }).first();
            const box = await add.boundingBox();
            expect([box!.width >= 44, box!.height >= 44], where).toEqual([true, true]);
            expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
          } finally {
            await app.close();
          }
        }
      }
    }
  }, 600_000);
});
