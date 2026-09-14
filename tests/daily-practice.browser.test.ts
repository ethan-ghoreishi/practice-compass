import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import { goTo, importBackup, importOutcome, openPracticeApp, reload } from './practiceBrowser';
import v12 from './fixtures/practice-decisions-v12.json?raw';

// ---------------------------------------------------------------------------
// ac-17 — the daily decision loop, in the real app.
//
// The pure engine is proven in `src/domain/scheduling.test.ts`. What only this
// can show is the SEAM: that the date the close screen SHOWS is the date the
// store WRITES, that the written date survives a reload, and that the same
// screen driven a second time on the same day does not quietly advance
// spacing again.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
/** A Setar item from the fixture, reached by its own detail screen. */
const ITEM = 'i-collision';

describe('the daily practice loop, end to end', () => {
  it('daily practice browser journey preserves the decision across close and rebuild', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      await importBackup(app, 'v12.json', v12);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);

      // --- 1. Five minutes, then thirty -----------------------------------
      await goTo(app, '/plan');
      await page.getByRole('button', { name: '5 min', exact: true }).click();
      await expect.poll(() => segmentCount(page)).toBe(1);
      expect(await totalMinutes(page)).toBe(5);
      // Under twelve minutes there is ONE useful main focus and no warm-up.
      expect(await page.locator('.list-row').filter({ hasText: 'Warm-up' }).count()).toBe(0);
      expect(await page.getByText(/min ·/).first().textContent()).toContain('5 min');

      // Changing the budget REBUILDS the preview. It used to key its re-seed
      // on a timestamp that never changed within a mount, so a longer session
      // showed the shorter session's plan.
      await page.getByRole('button', { name: '30 min', exact: true }).click();
      await expect.poll(() => totalMinutes(page)).toBe(30);
      expect(await segmentCount(page)).toBeGreaterThan(1);
      // A warm-up appears, and it is FIRST and familiar — not the demanding
      // new material, whatever it is labelled.
      expect(await page.locator('.list-row').filter({ hasText: 'Warm-up' }).count()).toBe(1);
      const firstRow = page.locator('.list-row').first();
      expect(await firstRow.textContent()).toContain('Warm-up');
      expect(await firstRow.textContent()).toContain('Warm up on something you already know');

      // --- 2. A real block from the plan, and progress that survives -------
      const planned = await segmentCount(page);
      await page.getByRole('button', { name: 'Start plan' }).click();
      await page.getByRole('button', { name: /^Start / }).first().click();
      await finishBlock(page);
      await page.getByRole('button', { name: 'Stable alone' }).click();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      await goTo(app, '/plan');
      // The plan is still running, one segment done, the rest still pending —
      // and it came back out of storage, not out of React state.
      await expect
        .poll(() => page.locator('main').innerText().then((t) => t.includes(`1 of ${planned} done`)))
        .toBe(true);
      await page.getByRole('button', { name: 'End the plan' }).click();

      // --- 3. THE DATE SHOWN IS THE DATE SAVED, after a reload -------------
      let savedDate = '';
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Stable alone' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        savedDate = await page.getByLabel('Next review date').inputValue();
        expect(savedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(savedDate > isoOf(CLOCK)).toBe(true);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(savedDate);

      // …and the item's PENDING ROW agrees: at that date the item appears
      // under Due reviews, which reads the ROW, not the item.
      const itemTitle = await itemTitleOf(page, app.origin, ITEM);
      await page.clock.setFixedTime(new Date(`${savedDate}T09:00:00`));
      await goTo(app, '/');
      await expect.poll(() => page.getByRole('heading', { name: 'Due reviews' }).isVisible()).toBe(true);
      await expect
        .poll(() => page.locator('main').innerText().then((t) => t.includes(itemTitle)))
        .toBe(true);
      await page.clock.setFixedTime(CLOCK);

      // --- 4. A SECOND successful close the same day does NOT advance again -
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Performable' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        expect(await page.getByLabel('Next review date').inputValue()).toBe(savedDate);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(savedDate);

      // --- 5. `same` keeps it too; only `worse` brings it forward ----------
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Same' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        expect(await page.getByLabel('Next review date').inputValue()).toBe(savedDate);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(savedDate);

      let repairedDate = '';
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Worse' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        repairedDate = await page.getByLabel('Next review date').inputValue();
        expect(repairedDate < savedDate).toBe(true);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(repairedDate);

      // --- 6. A date the owner types wins, in either direction -------------
      const chosen = '2027-05-09';
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Slightly better' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        await page.getByLabel('Next review date').fill(chosen);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(chosen);

      // …and once it is the owner's, successful practice leaves it alone.
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Stable in context' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        expect(await page.getByLabel('Next review date').inputValue()).toBe(chosen);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(chosen);

      // --- 7. Explicit No, then Schedule again from the item ---------------
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Stable alone' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        await page.getByRole('group', { name: '' }).first().waitFor().catch(() => {});
        await page.getByRole('button', { name: 'No', exact: true }).first().click();
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      await goTo(app, `/items/${ITEM}`);
      await expect.poll(() => page.getByRole('button', { name: 'Schedule again' }).isVisible()).toBe(true);

      const rearmed = '2027-06-20';
      const blocksBeforeRearm = await practiceBlockCount(page, app.origin, ITEM);
      await goTo(app, `/items/${ITEM}`);
      await page.getByRole('button', { name: 'Schedule again' }).click();
      await page.getByLabel('Next review date').fill(rearmed);
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(rearmed);
      // Re-arming is administration: it logged no practice.
      expect(await practiceBlockCount(page, app.origin, ITEM)).toBe(blocksBeforeRearm);
      const blocksBefore = await practiceBlockCount(page, app.origin, ITEM);

      // --- 8. Saving without a result answers nothing about the schedule ---
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Save without a result' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(rearmed);
      expect(await practiceBlockCount(page, app.origin, ITEM)).toBe(blocksBefore + 1);

      // --- 9. Across local midnight, with the draft intact -----------------
      // A DIFFERENT item, with no pending date at all, so the proposal is
      // derived from TODAY and a day boundary must visibly move it. (ITEM's
      // own date is the owner's by now, and is protected on purpose.)
      const FRESH = 'i-flag-missing';
      await goTo(app, `/items/${FRESH}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await finishBlock(page);
      const draft = 'the riz evened out after slowing right down';
      await page.getByPlaceholder('What did you notice?').fill(draft);
      await page.getByRole('button', { name: 'Worse' }).click();
      await page.getByRole('button', { name: 'Change' }).click();
      const beforeMidnight = await page.getByLabel('Next review date').inputValue();

      await page.clock.setFixedTime(new Date('2027-01-16T00:30:00'));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await expect
        .poll(() => page.getByLabel('Next review date').inputValue())
        .not.toBe(beforeMidnight);
      // The musician's own words survived the refresh.
      expect(await page.getByPlaceholder('What did you notice?').inputValue()).toBe(draft);
      const afterMidnight = await page.getByLabel('Next review date').inputValue();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, FRESH)).toBe(afterMidnight);

      // --- 10. The preview reflects the practice that has actually happened -
      // Everything above really was practised today, so a freshly built plan
      // must say so rather than proposing the same work again as if nothing
      // had been done. This is the live-data half of "no stale preview": the
      // budget half is step 1, the local-day half is step 9.
      await page.clock.setFixedTime(CLOCK);
      await goTo(app, '/plan');
      await page.getByRole('button', { name: '30 min', exact: true }).click();
      const summary = await page.locator('.page-sub').first().textContent();
      expect(summary).toContain('already practised today');
      expect(await page.locator('.list-row').filter({ hasText: itemTitle }).count()).toBe(0);

      // --- 11. A PLAN LEFT OPEN ACROSS MIDNIGHT IS MARKED STALE ------------
      // Still the same preview from step 10, on screen with no database
      // write in between. `rev` alone cannot see a day rolling over — this is
      // the OTHER half of "no stale preview" the review named: not data
      // changing beneath the plan, but the CLOCK moving past it while it sits
      // open, unstarted.
      expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
      await page.clock.setFixedTime(new Date('2027-01-16T00:15:00'));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await expect
        .poll(() => page.getByText(/plan was built for a day that has passed/).isVisible().catch(() => false))
        .toBe(true);
      expect(await page.getByRole('button', { name: 'Start plan' }).isDisabled()).toBe(true);
      // Regenerating clears it: the owner's swaps/removals up to that point
      // are the thing being protected, not the stale label itself.
      await page.getByRole('button', { name: 'Regenerate' }).click();
      expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
      await page.clock.setFixedTime(CLOCK);
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

      // --- 12. THE CLOSE-SCREEN RACE: a Save clicked exactly as the day
      // rolls, with NO visibilitychange/focus event and before the next
      // 30-second poll — the exact gap step 9's own visibilitychange dispatch
      // does not exercise. The first Save must refresh the decision instead
      // of silently writing the day it was previewed on; the second — now
      // agreeing with the true day — writes exactly what is on screen.
      const RACE_ITEM = 'i-q-and-flag';
      await goTo(app, `/items/${RACE_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await finishBlock(page);
      const raceDraft = 'the vibrato settled once the wrist relaxed';
      await page.getByPlaceholder('What did you notice?').fill(raceDraft);
      await page.getByRole('button', { name: 'Worse' }).click();
      await page.getByRole('button', { name: 'Change' }).click();
      const previewedBeforeRace = await page.getByLabel('Next review date').inputValue();

      await page.clock.setFixedTime(new Date('2027-01-16T00:05:00'));
      await page.getByRole('button', { name: 'Save block' }).click();
      // Still on the close screen: that click refreshed the stale decision
      // rather than saving it. The musician's own words survived untouched.
      expect(await page.getByRole('button', { name: 'Save block' }).isVisible()).toBe(true);
      expect(await page.getByPlaceholder('What did you notice?').inputValue()).toBe(raceDraft);
      await expect
        .poll(() => page.getByLabel('Next review date').inputValue())
        .not.toBe(previewedBeforeRace);
      const correctedDate = await page.getByLabel('Next review date').inputValue();
      await page.getByRole('button', { name: 'Save block' }).click();
      await page.waitForTimeout(300);
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, RACE_ITEM)).toBe(correctedDate);
      await page.clock.setFixedTime(CLOCK);
    } finally {
      await app.close();
    }
  });
});

// --- helpers ---------------------------------------------------------------

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function segmentCount(page: Page): Promise<number> {
  // Every segment row carries a Swap button; the Total row does not.
  return page.getByRole('button', { name: /^Swap / }).count();
}

async function totalMinutes(page: Page): Promise<number> {
  const rows = page.locator('.list-row');
  const last = await rows.last().textContent();
  return Number((last ?? '').replace(/[^0-9]/g, ''));
}

/** The item's own title, read from its detail screen. */
async function itemTitleOf(page: Page, origin: string, itemId: string): Promise<string> {
  await page.goto(`${origin}#/items/${itemId}`);
  await page.locator('h1.page-title').first().waitFor();
  return ((await page.locator('h1.page-title').first().textContent()) ?? '').trim();
}

/** Run one ordinary block on an item and close it however `close` says. */
async function practise(page: Page, origin: string, itemId: string, close: () => Promise<void>): Promise<void> {
  await page.goto(`${origin}#/items/${itemId}`);
  await page.getByRole('button', { name: 'Start a block' }).click();
  await finishBlock(page);
  await close();
  await page.waitForTimeout(300);
}

async function finishBlock(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Stable alone' }).waitFor();
}

/**
 * The date the DATABASE holds for this item, read back through the item's own
 * "change review date" control — a real control showing the persisted value,
 * never a debug hook.
 */
async function persistedReviewDate(page: Page, origin: string, itemId: string): Promise<string> {
  await page.goto(`${origin}#/items/${itemId}`);
  const open = page.getByRole('button', { name: /Change review date|Schedule again/ });
  await open.waitFor();
  const label = await open.textContent();
  if (label?.includes('Schedule again')) return '';
  await open.click();
  const value = await page.getByLabel('Next review date').inputValue();
  await page.getByRole('button', { name: 'Cancel' }).click();
  return value;
}

/**
 * How many blocks this item has recorded, read from its own Blocks stat — the
 * honest count of practice, and the thing an administrative action must never
 * move.
 */
async function practiceBlockCount(page: Page, origin: string, itemId: string): Promise<number> {
  await page.goto(`${origin}#/items/${itemId}`);
  const stat = page.locator('.stat').filter({ hasText: 'Blocks' }).first();
  await stat.waitFor();
  return Number(((await stat.locator('.stat-value').textContent()) ?? '').trim());
}
