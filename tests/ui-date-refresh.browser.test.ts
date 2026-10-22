import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import { goTo, importBackup, importOutcome, openPracticeApp, type PracticeApp } from './practiceBrowser';
import FIXTURE from './fixtures/ui-refresh.json?raw';

// ---------------------------------------------------------------------------
// ac-11 — a screen left open across local midnight moves to the new day by
// itself. The known consumers of a frozen `now` (B3) were Lessons (the page
// and an open lesson), Repertoire (My repertoire and the Practice list) and
// StageDetail's "for class" marks; each now reads `useDecisionNow`, which
// checks the local day on a timer. The clock here is the browser's own, run
// across midnight with the screen MOUNTED — the same elements, never a
// reload or a revisit — and each screen's before and after is spelled out.
//
// The fixture's Tar classes: Class 11 today (2026-10-20), Class 12
// tomorrow, and Class 40 — imported archive history dated 2026-11-15, which
// must never become an upcoming class. Its preparations: رنگ اصفهان for
// Class 11, تحریر for Class 12.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-20T23:58:00');

async function open(): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, viewport: { width: 390, height: 844 } });
  await importBackup(app, 'ui-refresh.json', FIXTURE);
  expect(await importOutcome(app)).toContain('Imported');
  return app;
}

/** Tag the page's heading, so "still mounted" is a fact about one element. */
const mark = (page: Page) => page.locator('main h1').evaluate((h) => ((h as unknown as { mounted: boolean }).mounted = true));
const stillMounted = (page: Page) => page.locator('main h1').evaluate((h) => (h as unknown as { mounted?: boolean }).mounted === true);

/** Run the page's own clock past local midnight: every timer fires as it would. */
const crossMidnight = (page: Page) => page.clock.runFor(4 * 60_000);

const card = (page: Page, label: string) => page.locator('article', { hasText: label });

describe('a screen left open across midnight', () => {
  it('date-dependent screens refresh across midnight without remounting', async () => {
    const failures = (
      await Promise.all([
        // LESSONS — relative days, which classes are upcoming, and which
        // preparations still count.
        (async () => {
          const app = await open();
          const { page } = app;
          try {
            await goTo(app, '/lessons', { arrival: 'Lessons' });
            const tar = page.locator('section', { has: page.getByRole('heading', { name: 'Tar', exact: true }) });
            await tar.getByText('2 items to complete before this class').waitFor();
            await card(page, 'Class 11 · 2026-10-20').getByText('upcoming').waitFor();
            await card(page, 'Class 12 · 2026-10-21').getByText('tomorrow').waitFor();
            await card(page, 'Class 40 · 2026-11-15').getByText('in 26 days').waitFor();
            const archiveBefore = await card(page, 'Class 40 · 2026-11-15').textContent();
            await mark(page);

            await crossMidnight(page);

            await card(page, 'Class 11 · 2026-10-20').getByText('yesterday').waitFor();
            await card(page, 'Class 12 · 2026-10-21').getByText('today').waitFor();
            await tar.getByText('1 item to complete before this class').waitFor();
            await card(page, 'Class 40 · 2026-11-15').getByText('in 25 days').waitFor();
            return [
              ...(await stillMounted(page) ? [] : ['Lessons remounted']),
              ...((await card(page, 'Class 11 · 2026-10-20').textContent())?.includes('upcoming') ? ['Class 11 is still upcoming after it passed'] : []),
              ...(/upcoming/.test(archiveBefore ?? '') || (await card(page, 'Class 40 · 2026-11-15').textContent())?.includes('upcoming')
                ? ['imported Class 40 shows as upcoming']
                : []),
              ...app.pageErrors.map((e) => `Lessons: ${e.message}`),
            ];
          } finally {
            await app.close();
          }
        })(),
        // REPERTOIRE — "last practised" on My repertoire and the Practice list.
        (async () => {
          const app = await open();
          const { page } = app;
          try {
            await goTo(app, '/repertoire?inst=all', { arrival: 'Repertoire' });
            const row = page.locator('.list-row', { hasText: 'عراق 3' }).first();
            await row.getByText('last yesterday').waitFor();
            await mark(page);
            await crossMidnight(page);
            await row.getByText('last 2 days ago').waitFor();
            return [...(await stillMounted(page) ? [] : ['Repertoire remounted']), ...app.pageErrors.map((e) => `Repertoire: ${e.message}`)];
          } finally {
            await app.close();
          }
        })(),
        // A STAGE — an item prepared for tonight's class is marked "for
        // class" until that class has passed.
        (async () => {
          const app = await open();
          const { page } = app;
          try {
            await goTo(app, '/pathway/pw-tar/stage-fa', { arrival: /آواز افشاری/ });
            const unit = page.locator('.stage-unit', { hasText: 'رنگ اصفهان' });
            await unit.getByText('for class').waitFor();
            await mark(page);
            await crossMidnight(page);
            // The row's one metadata line, without its class mark.
            await expect.poll(() => unit.locator('span[dir="ltr"]').first().textContent()).toBe('Shaky');
            return [...(await stillMounted(page) ? [] : ['StageDetail remounted']), ...app.pageErrors.map((e) => `StageDetail: ${e.message}`)];
          } finally {
            await app.close();
          }
        })(),
      ])
    ).flat();
    expect(failures).toEqual([]);
  }, 600_000);
});
