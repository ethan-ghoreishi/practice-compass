import { describe, expect, it } from 'vitest';
import {
  goTo,
  openPracticeApp,
  persistedDb,
  readPersistedState,
  reload,
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

/** Every level-1 heading inside `<main>`, right now — a point-in-time value read, no auto-wait. */
const headings = (app: PracticeApp) =>
  app.page.evaluate(() => [...document.querySelectorAll('main h1')].map((h) => (h.textContent ?? '').trim()));

describe('the journey harness', () => {
  it('navigation returns only once the destination page has rendered, in Chromium and WebKit, even when page modules load slowly', async () => {
    for (const engine of ENGINES) {
      const app = await openPracticeApp({ now: NOW, engine, delayPagesMs: 1500 });
      const { page } = app;
      try {
        const [a, b] = (await persistedDb(app)).items as { id: string; title: string }[];
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
        expect(await headings(app), engine).toEqual([b.title]);

        // A focused route (no tab bar), then a URL that redirects: the
        // redirect's target is the destination.
        await goTo(app, '/active');
        expect(await headings(app), engine).toEqual(['No block in progress']);
        await goTo(app, '/items');
        expect(await headings(app), engine).toEqual(['Repertoire']);

        // Two URLs sharing one heading cannot be told apart by it. Without an
        // explicit arrival that fails LOUDLY, naming the cause — never a hang
        // and never a quiet early return; with one, it is the caller's word.
        await expect(goTo(app, '/repertoire?view=paths', { timeout: 3_000 })).rejects.toThrow(/pass an arrival/);
        await goTo(app, '/repertoire?view=list', { arrival: 'Repertoire' });
        expect(await headings(app), engine).toEqual(['Repertoire']);

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
