import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  persistedDb,
  reload,
  type PracticeApp,
} from './practiceBrowser';
import v12Text from './fixtures/practice-information-v12.json?raw';

// ---------------------------------------------------------------------------
// ac-12 / ac-13 — who manages a review date, and what happens after it changes
// hands.
//
// Handing a date back to the engine is ADMINISTRATION: the date stays exactly
// where it is, no practice is recorded, and nothing is calculated. What
// follows is the shipped scheduling behaviour, unchanged — which is the point
// of testing the two together.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const FARSI_ITEM = 'i-farsi';     // manual mode, user-chosen future date 2027-02-10
const ROWLESS = 'i-rowless';      // a pending date with NO open review row
const CONFLICT = 'i-conflict';    // item and rows disagree
const NODATE = 'i-nodate';        // auto, nothing scheduled
const AUTO_DUE = 'i-auto-due';    // auto, due today

async function seeded(): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK });
  await importBackup(app, 'v12.json', v12Text);
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}

/** Everything about an item a transfer must not invent or disturb. */
async function facts(app: PracticeApp, itemId: string) {
  const db = await persistedDb(app);
  const i = db.items.find((x) => x.id === itemId) as Record<string, unknown>;
  return {
    nextReviewDate: i.nextReviewDate,
    reviewMode: i.reviewMode,
    nextReviewSource: i.nextReviewSource,
    srReps: i.srReps,
    srEase: i.srEase,
    srIntervalDays: i.srIntervalDays,
    srLastProgressDay: i.srLastProgressDay,
    timesPractised: i.timesPractised,
    totalMinutes: i.totalMinutes,
    lastResult: i.lastResult,
    status: i.status,
    blocks: db.blocks.filter((b) => b.practiceItemId === itemId).length,
    openRows: db.reviews.filter((r) => r.practiceItemId === itemId && !r.completedAt).map((r) => r.dueDate),
    completedRows: db.reviews.filter((r) => r.practiceItemId === itemId && r.completedAt).map((r) => JSON.stringify(r)),
  };
}

const transferButton = (page: Page) => page.getByRole('button', { name: 'Use automatic scheduling' });

describe('handing a review date back to the app', () => {
  it('review ownership controls distinguish explicit transfer from ordinary item edits', async () => {
    const app = await seeded();
    const { page } = app;
    try {
      // --- 1. A manual item with a user-chosen future date ----------------
      await goTo(app, `/items/${FARSI_ITEM}`);
      const before = await facts(app, FARSI_ITEM);
      expect(before.nextReviewDate).toBe('2027-02-10');
      expect(before.reviewMode).toBe('manual');
      const panel = await page.locator('main').innerText();
      expect(panel).toContain('You set each date yourself.');
      // The explanation never calls the retained date a fresh calculation.
      expect(panel).toContain('Keeps 2027-02-10 exactly as it is');
      expect(panel).toContain('calculates no new date');
      expect(panel).not.toMatch(/new date has been calculated|recalculated for you/i);

      await transferButton(page).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      const after = await facts(app, FARSI_ITEM);
      // THE DATE IS KEPT; only who manages it changed. Nothing else moved.
      expect(after).toEqual({ ...before, reviewMode: 'auto', nextReviewSource: 'auto' });
      expect(await page.locator('main').innerText()).toContain('The app manages this: next on 2027-02-10.');
      // Repeated transfer is a no-op: the control is simply no longer offered.
      expect(await transferButton(page).count()).toBe(0);

      // --- 2. An UNRELATED save while already auto keeps a protected date --
      // First make the date the owner's again, so there is protection to lose.
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-03-15');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      expect((await facts(app, FARSI_ITEM)).nextReviewSource).toBe('user');
      // An ordinary edit — a title change — must not release that protection.
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('textbox', { name: 'Title' }).fill('آوازِ افشاری — عبارتِ ۴ (renamed)');
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      const afterUnrelated = await facts(app, FARSI_ITEM);
      expect(afterUnrelated.nextReviewDate).toBe('2027-03-15');
      expect(afterUnrelated.nextReviewSource).toBe('user');
      expect(afterUnrelated.reviewMode).toBe('auto');
      // The explicit transfer is still OFFERED on an already-auto item whose
      // date is the owner's.
      expect(await transferButton(page).count()).toBe(1);
      await transferButton(page).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      expect((await facts(app, FARSI_ITEM)).nextReviewDate).toBe('2027-03-15');
      expect((await facts(app, FARSI_ITEM)).nextReviewSource).toBe('auto');

      // --- 3. A pending date with NO open row gets ONE reminder back ------
      await goTo(app, `/items/${ROWLESS}`);
      const rowlessBefore = await facts(app, ROWLESS);
      expect(rowlessBefore.openRows).toEqual([]);
      await transferButton(page).click();
      await reload(app);
      const rowlessAfter = await facts(app, ROWLESS);
      expect(rowlessAfter.openRows).toEqual(['2027-02-20']);
      expect(rowlessAfter.nextReviewDate).toBe('2027-02-20');
      expect(rowlessAfter.blocks).toBe(rowlessBefore.blocks);
      expect(rowlessAfter.timesPractised).toBe(rowlessBefore.timesPractised);

      // --- 4. A CONFLICTING schedule is refused, actionably ---------------
      await goTo(app, `/items/${CONFLICT}`);
      const conflictBefore = await facts(app, CONFLICT);
      await transferButton(page).click();
      await page.getByRole('alert').waitFor({ timeout: 10_000 });
      const refusal = await page.getByRole('alert').innerText();
      expect(refusal).toMatch(/more than one pending review date/);
      expect(refusal).toMatch(/Change review date/);
      await reload(app);
      expect(await facts(app, CONFLICT)).toEqual(conflictBefore);
      // Resolving it explicitly is what the refusal actually points at.
      await goTo(app, `/items/${CONFLICT}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-03-01');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      await goTo(app, `/items/${CONFLICT}`);
      await transferButton(page).click();
      await reload(app);
      const conflictAfter = await facts(app, CONFLICT);
      expect(conflictAfter.nextReviewDate).toBe('2027-03-01');
      expect(conflictAfter.openRows).toEqual(['2027-03-01', '2027-03-01']);
      expect(conflictAfter.reviewMode).toBe('auto');
      expect(conflictAfter.blocks).toBe(conflictBefore.blocks);

      // --- 5. No date: auto stays UNSCHEDULED until Review today ----------
      await goTo(app, `/items/${NODATE}`);
      const nodateBefore = await facts(app, NODATE);
      expect(nodateBefore.nextReviewDate).toBeUndefined();
      expect(await page.locator('main').innerText()).toContain('The app manages this. Nothing is scheduled.');
      expect(await transferButton(page).count()).toBe(0);
      await page.getByRole('button', { name: /^Review today/ }).click();
      await reload(app);
      const nodateAfter = await facts(app, NODATE);
      expect(nodateAfter.nextReviewDate).toBe('2027-01-15');
      expect(nodateAfter.nextReviewSource).toBe('user');
      expect(nodateAfter.reviewMode).toBe('auto');
      // Administration only: no block, no result, no spacing movement.
      expect(nodateAfter.blocks).toBe(nodateBefore.blocks);
      expect(nodateAfter.lastResult).toBe(nodateBefore.lastResult);
      expect(nodateAfter.srReps).toBe(nodateBefore.srReps);

      // --- 6. The FORM is the same transition, not a quieter one ----------
      // A saved manual → auto change routes through the transfer: the date
      // stays and its management moves, exactly as the button does.
      await goTo(app, `/items/${ROWLESS}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-04-01');
      await page.getByRole('button', { name: 'Save date' }).click();
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('group', { name: 'Reminder mode' }).getByRole('button', { name: 'Manual' }).click();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      await goTo(app, `/items/${ROWLESS}`);
      expect((await facts(app, ROWLESS)).reviewMode).toBe('manual');
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('group', { name: 'Reminder mode' }).getByRole('button', { name: 'Auto', exact: true }).click();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      const viaForm = await facts(app, ROWLESS);
      expect(viaForm.nextReviewDate).toBe('2027-04-01');
      expect(viaForm.reviewMode).toBe('auto');
      expect(viaForm.nextReviewSource).toBe('auto');

      // --- 7. The panel always reads the LIVE item, never a stale mount ----
      // Switch items, then come back: the date shown is the current one.
      await goTo(app, `/items/${FARSI_ITEM}`);
      await goTo(app, `/items/${ROWLESS}`);
      expect(await page.locator('main').innerText()).toContain('2027-04-01');
      // An update arriving from elsewhere (an import — what a sync pull is)
      // while the screen is open is reflected, not overwritten by it.
      const live = await persistedDb(app);
      await importBackup(
        app,
        'external.json',
        JSON.stringify({
          app: 'practice-compass',
          schemaVersion: live.schemaVersion,
          exportedAt: CLOCK.toISOString(),
          data: {
            ...live,
            attachments: [],
            items: live.items.map((i) => (i.id === ROWLESS ? { ...i, nextReviewDate: '2027-05-05', nextReviewSource: 'user' } : i)),
            reviews: live.reviews.map((r) => (r.practiceItemId === ROWLESS && !r.completedAt ? { ...r, dueDate: '2027-05-05' } : r)),
          },
          files: [],
        }),
      );
      expect(await importOutcome(app)).toContain('Imported');
      await goTo(app, `/items/${ROWLESS}`);
      expect(await page.locator('main').innerText()).toContain('2027-05-05');
      await transferButton(page).click();
      await reload(app);
      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-05-05');

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

describe('after the date changes hands, the shipped rules apply', () => {
  it('released review dates obey the shipped early practice and local day rules', async () => {
    const app = await seeded();
    const { page } = app;
    try {
      /** Practise the item once and close with `result`. */
      async function practise(itemId: string, result: string): Promise<void> {
        await goTo(app, `/items/${itemId}`);
        await page.getByRole('button', { name: 'Start a block' }).click();
        await goTo(app, '/active');
        await page.getByRole('button', { name: 'Finish' }).click();
        if (result === 'none') {
          await page.getByRole('button', { name: 'Save without a result' }).click();
        } else {
          await page.getByRole('button', { name: result, exact: true }).click();
          await page.getByRole('button', { name: 'Save block' }).click();
        }
        await reload(app);
      }

      // --- Transfer a FUTURE custom date through the real control ---------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await transferButton(page).click();
      await reload(app);
      let state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate).toBe('2027-02-10');
      expect(state.nextReviewSource).toBe('auto');
      const spacing = { srReps: state.srReps, srEase: state.srEase, srIntervalDays: state.srIntervalDays };

      // --- EARLY practice, in isolation, one result at a time -------------
      // `same`: nothing moves — not the date, not the spacing.
      await practise(FARSI_ITEM, 'Same');
      state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate).toBe('2027-02-10');
      expect({ srReps: state.srReps, srEase: state.srEase, srIntervalDays: state.srIntervalDays }).toEqual(spacing);
      expect(state.openRows).toEqual(['2027-02-10']);

      // A POSITIVE early result is real practice, not the review: the date and
      // the spacing both stand, and the pending row stays OPEN.
      await practise(FARSI_ITEM, 'Stable alone');
      state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate).toBe('2027-02-10');
      expect({ srReps: state.srReps, srEase: state.srEase, srIntervalDays: state.srIntervalDays }).toEqual(spacing);
      expect(state.openRows).toEqual(['2027-02-10']);

      // `worse` ALONE may bring an engine-managed date forward — never later.
      await practise(FARSI_ITEM, 'Worse');
      state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate! < '2027-02-10').toBe(true);
      const repaired = String(state.nextReviewDate);
      expect(state.openRows).toEqual([repaired]);

      // --- Choosing a date again RE-ESTABLISHES the owner's protection -----
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-02-25');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect((await facts(app, FARSI_ITEM)).nextReviewSource).toBe('user');
      await practise(FARSI_ITEM, 'Worse');
      // Protected: even `worse` leaves a date the owner just chose alone.
      expect((await facts(app, FARSI_ITEM)).nextReviewDate).toBe('2027-02-25');

      // --- A DUE, eligible close advances spacing — once per local day -----
      const dueBefore = await facts(app, AUTO_DUE);
      expect(dueBefore.nextReviewDate).toBe('2027-01-15');
      await practise(AUTO_DUE, 'Stable alone');
      const advanced = await facts(app, AUTO_DUE);
      expect(advanced.nextReviewDate! > '2027-01-15').toBe(true);
      expect(advanced.srReps).toBe((dueBefore.srReps as number) + 1);
      expect(advanced.srLastProgressDay).toBe('2027-01-15');
      // A SECOND eligible close the same day buys no second expansion.
      await goTo(app, `/items/${AUTO_DUE}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-01-15');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      await goTo(app, `/items/${AUTO_DUE}`);
      await transferButton(page).click();
      await reload(app);
      await practise(AUTO_DUE, 'Stable alone');
      const twice = await facts(app, AUTO_DUE);
      expect(twice.srReps).toBe(advanced.srReps);
      expect(twice.srLastProgressDay).toBe('2027-01-15');

      // --- A deliberate NO clears the pending intent ----------------------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Same', exact: true }).click();
      await page.getByRole('button', { name: 'Change', exact: true }).click();
      await page.getByRole('group', { name: 'Should this come back?' }).getByRole('button', { name: 'No' }).click();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      const declined = await facts(app, FARSI_ITEM);
      expect(declined.nextReviewDate).toBeUndefined();
      expect(declined.openRows).toEqual([]);

      // …while an UNANSWERED / unlogged close leaves the schedule alone.
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Schedule again' }).click();
      await page.getByLabel('Next review date').fill('2027-06-01');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      const armed = await facts(app, FARSI_ITEM);
      expect(armed.nextReviewDate).toBe('2027-06-01');
      expect(armed.openRows).toEqual(['2027-06-01']);
      await practise(FARSI_ITEM, 'none');
      const unanswered = await facts(app, FARSI_ITEM);
      expect(unanswered.nextReviewDate).toBe('2027-06-01');
      expect(unanswered.openRows).toEqual(['2027-06-01']);
      expect(unanswered.srReps).toBe(armed.srReps);

      // --- The local day rolls BEFORE a displayed date action -------------
      // No dispatched event: the clock simply moves, as it does on a device
      // left open overnight.
      await goTo(app, `/items/${NODATE}`);
      expect((await facts(app, NODATE)).nextReviewDate).toBeUndefined();
      await page.clock.setSystemTime(new Date('2027-01-16T01:00:00'));
      await page.getByRole('button', { name: /^Review today/ }).click();
      // The first tap REFRESHES rather than writing yesterday's "today": the
      // button now names the real day, and nothing has been scheduled.
      await expect.poll(() => page.getByRole('button', { name: /^Review today/ }).innerText()).toContain('2027-01-16');
      expect((await facts(app, NODATE)).nextReviewDate).toBeUndefined();
      await page.getByRole('button', { name: /^Review today/ }).click();
      await reload(app);
      // "Today" is the day it actually is, not the day the page was opened on.
      expect((await facts(app, NODATE)).nextReviewDate).toBe('2027-01-16');
      await goTo(app, `/items/${NODATE}`);
      expect(await page.locator('main').innerText()).toContain('2027-01-16');

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});
