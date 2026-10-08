import { describe, expect, it } from 'vitest';
import {
  goTo,
  openPracticeApp,
  readPersistedState,
  reload,
  writePersistedState,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// The harness's own promises, proven against the real app rather than assumed.
//
// Every journey reads the screen right after `goTo` and reads or reloads the
// stored bytes right after an action. Each of those reads is only meaningful
// if the helper before it waited for what its name claims: "went to" means
// the destination page is on screen, and "reloaded" means every write the app
// had already issued survived. Both used to be true only on a fast machine.
// These tests widen the window each claim depends on — slow page modules,
// slow storage — until the old helper visibly fails, and each keeps a CONTROL
// ARM that reproduces the old helper, so every run proves the fixture still
// opens that window and the check is not passing vacuously.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-10-01T09:00:00Z');
const ENGINES: Engine[] = ['chromium', 'webkit'];
const SHARED = 'Repertoire';

/** Every level-1 heading inside `<main>`, right now — a point-in-time value read, no auto-wait. */
const headings = (app: PracticeApp) =>
  app.page.evaluate(() => [...document.querySelectorAll('main h1')].map((h) => (h.textContent ?? '').trim()));

describe('the journey harness', () => {
  it('navigation returns only once the destination page has rendered, in Chromium and WebKit, even when page modules load slowly', async () => {
    for (const engine of ENGINES) {
      const app = await openPracticeApp({ now: NOW, engine, delayPagesMs: 1500 });
      const { page } = app;
      try {
        // One item is titled like the Repertoire page, so its own page and
        // Repertoire share a heading — the pair an arrival exists for.
        const persisted = await readPersistedState(app);
        const [a, b] = (persisted.state as { db: { items: { id: string; title: string }[] } }).db.items;
        b.title = SHARED;
        await writePersistedState(app, persisted.state, persisted.version);
        await reload(app);
        expect(await headings(app), engine).toEqual([]); // Today has no page title

        // A first-load lazy page, from a page with no heading of its own.
        await goTo(app, '/lessons');
        expect(await headings(app), engine).toEqual(['Lessons']);

        // CONTROL ARM — the window is real: once the URL moves, the outgoing
        // page is hidden behind the loading fallback but still in the
        // document, its heading included, while the slow module loads.
        await page.goto(`${app.origin}#/settings`);
        await expect.poll(() => page.locator('main').isVisible(), { message: `${engine}: the outgoing page is hidden` }).toBe(false);
        expect(await headings(app), `${engine}: …and still there`).toEqual(['Lessons']);
        await page.getByRole('heading', { level: 1, name: 'Settings & backup' }).waitFor();

        // A page whose module is already cached.
        await goTo(app, '/lessons');
        expect(await headings(app), engine).toEqual(['Lessons']);

        // A TAP's navigation renders in a transition that keeps the outgoing
        // page VISIBLE while the slow destination loads, and the URL is already
        // the destination's. "Going" there again is a reload in WebKit — which
        // aborts whatever the tap just started — so it is refused, loudly.
        await page.getByRole('link', { name: 'More' }).click();
        await expect(goTo(app, '/more')).rejects.toThrow(/already on that route/);
        await page.getByRole('heading', { level: 1, name: 'More' }).waitFor();

        // The same page component with new params: the heading element may be
        // reused, so its TEXT is what tells the two items apart.
        await goTo(app, `/items/${a.id}`);
        expect(await headings(app), engine).toEqual([a.title]);
        await goTo(app, `/items/${b.id}`);
        expect(await headings(app), engine).toEqual([SHARED]);

        // A destination sharing the outgoing heading, its module still loading.
        // The heading cannot tell them apart — the page being left already
        // shows it — so as an arrival it is refused before anything moves…
        await expect(goTo(app, '/repertoire?view=all', { arrival: SHARED })).rejects.toThrow(/already shows the arrival/);
        expect(new URL(page.url()).hash, engine).toBe(`#/items/${b.id}`);
        // …and an arrival only the destination has is waited for through the
        // slow load: on return, the view is the destination's and the item
        // page, its heading included, is gone.
        await goTo(app, '/repertoire?view=all', { arrival: page.getByRole('button', { name: 'Practice list', pressed: true }) });
        expect(await headings(app), engine).toEqual([SHARED]);
        expect(await page.getByRole('button', { name: 'Practice list' }).getAttribute('aria-pressed'), engine).toBe('true');
        expect(await page.getByRole('button', { name: 'Start a block' }).count(), engine).toBe(0);

        // A focused route (no tab bar), then a URL that redirects: the
        // redirect's target is the destination.
        await goTo(app, '/active');
        expect(await headings(app), engine).toEqual(['No block in progress']);
        await goTo(app, '/items');
        expect(await headings(app), engine).toEqual(['Repertoire']);

        // The same page with another view keeps its heading element and
        // text. Without an arrival that fails LOUDLY, naming the cause —
        // never a hang and never a quiet early return…
        await expect(goTo(app, '/repertoire?view=paths', { timeout: 3_000 })).rejects.toThrow(/pass an arrival/);
        await page.getByRole('button', { name: 'Pathways', pressed: true }).waitFor();
        // …the shared heading as the arrival is refused…
        await expect(goTo(app, '/repertoire?view=works', { arrival: SHARED })).rejects.toThrow(/already shows the arrival/);
        // …and the destination's own view is what it waits for.
        await goTo(app, '/repertoire?view=works', { arrival: page.getByRole('button', { name: 'My repertoire', pressed: true }) });
        expect(await page.getByRole('button', { name: 'My repertoire' }).getAttribute('aria-pressed'), engine).toBe('true');
        expect(await page.getByRole('button', { name: 'Pathways' }).getAttribute('aria-pressed'), engine).toBe('false');
        expect(await headings(app), engine).toEqual([SHARED]);

        // Back to a page with no title at all: the outgoing heading is gone.
        await goTo(app, '/');
        expect(await headings(app), engine).toEqual([]);
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  });

  it('persisted reads and reload are ordered after every write the app has already issued, in Chromium and WebKit', async () => {
    const active = async (app: PracticeApp) => (await readPersistedState(app)).state as { active: { itemId: string } | null };
    for (const engine of ENGINES) {
      const app = await openPracticeApp({ now: NOW, engine, delayStorageMs: 1500 });
      const { page } = app;
      try {
        // CONTROL ARM — the pre-fix reload: a fixed 400 ms, then a fresh
        // document. Slow storage has not committed the write yet, the unload
        // aborts it, and the block the owner started is gone.
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await page.waitForTimeout(400);
        await page.reload();
        await page.locator('main h1').waitFor({ timeout: 20_000 });
        expect((await active(app)).active, `${engine}: the old reload lost the write`).toBeNull();
        expect(await headings(app), engine).toEqual(['No block in progress']);
        await goTo(app, '/');

        // The same action, then reload() with nothing in between: it waits for
        // the write the app already issued, so the new document opens on the
        // running block.
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await reload(app);
        await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 20_000 });
        const started = (await active(app)).active as { running: boolean } | null;
        expect(started?.running, engine).toBe(true);

        // A persisted read straight after an action is ordered behind the
        // write the action issued, so it sees it without polling.
        await page.getByRole('button', { name: 'Pause' }).click();
        await page.getByRole('button', { name: 'Resume' }).waitFor();
        expect(((await active(app)).active as { running: boolean } | null)?.running, engine).toBe(false);
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  });
});
