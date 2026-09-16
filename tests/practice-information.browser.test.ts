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
  type PracticeApp,
} from './practiceBrowser';
import v12Text from './fixtures/practice-information-v12.json?raw';
import { buildReportData, renderReportText } from '../src/domain/report';
import { validateDB } from '../src/domain/io';
import type { PracticeDB, PracticeItem } from '../src/domain/types';
import { createItem } from '../src/domain/factories';
import { scoreItems } from '../src/domain/scoring';
import { isWarmupSuitable } from '../src/domain/plan';
import { decideReview } from '../src/domain/scheduling';
import { defaultModeForStatus } from '../src/domain/defaults';
import {
  BLOCK_MODE_LABELS,
  FOCUS_LABELS,
  ITEM_STATUS_DESCRIPTIONS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  RATING_ANCHORS,
  RATING_LABELS,
  RESULT_BUTTONS,
  RESULT_DESCRIPTIONS,
} from '../src/domain/labels';

// ---------------------------------------------------------------------------
// ac-6 … ac-10 — the information itself, in the real app.
//
// One notebook that belongs to the ITEM; one observation and one next action
// that belong to a BLOCK; questions that belong to a CLASS. These journeys
// drive the actual controls and then read what the app PERSISTED, because the
// whole point is that each kind of text ends up where its lifetime is.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const FARSI_ITEM = 'i-farsi';
const ENGLISH_ITEM = 'i-english';
const FARSI_NOTES = 'یادداشتِ کاری: فرود را آهسته بگیر.';

/** A seeded app with the fixture already imported and reloaded. */
async function seeded(viewport?: { width: number; height: number }): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, ...(viewport ? { viewport } : {}) });
  await importBackup(app, 'v12.json', v12Text);
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}

/** The notes the app has actually PERSISTED for one item. */
async function savedNotes(app: PracticeApp, itemId: string): Promise<string | undefined> {
  const db = await persistedDb(app);
  return db.items.find((i) => i.id === itemId)?.notes as string | undefined;
}

/** The notes TEXTAREA itself — not the buttons whose names also mention it. */
const notesBox = (page: Page) => page.getByRole('textbox', { name: 'Working notes', exact: true });

/** Type into the Working notes editor and press Done, wherever it is shown. */
async function editNotes(page: Page, text: string): Promise<void> {
  const show = page.getByRole('button', { name: /^Show Working notes$/ });
  if (await show.count()) await show.click();
  await page.getByRole('button', { name: 'Edit Working notes' }).click();
  await notesBox(page).fill(text);
  await page.getByRole('button', { name: 'Done editing Working notes' }).click();
  await page.getByText('Saved.').waitFor({ timeout: 10_000 });
}

/** Everything about an item that editing its notes must never disturb. */
async function practiceFacts(app: PracticeApp, itemId: string) {
  const db = await persistedDb(app);
  const item = db.items.find((i) => i.id === itemId) as Record<string, unknown>;
  return {
    blocks: db.blocks.length,
    reviews: JSON.stringify(db.reviews),
    timesPractised: item.timesPractised,
    totalMinutes: item.totalMinutes,
    lastResult: item.lastResult,
    status: item.status,
    srReps: item.srReps,
    srEase: item.srEase,
    srIntervalDays: item.srIntervalDays,
    srLastProgressDay: item.srLastProgressDay,
    nextReviewDate: item.nextReviewDate,
    nextReviewSource: item.nextReviewSource,
  };
}

describe('the item notebook, while you are playing', () => {
  it('working notes persist across practice navigation without controlling the clock', async () => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const app = await seeded(viewport);
      const { page } = app;
      const where = `${viewport.width}px`;
      try {
        const factsBefore = await practiceFacts(app, FARSI_ITEM);

        // --- On the item's own screen ------------------------------------
        await goTo(app, `/items/${FARSI_ITEM}`);
        expect(await page.locator('main').innerText(), where).toContain(FARSI_NOTES);
        await editNotes(page, 'یادداشتِ تازه روی صفحهٔ قطعه');
        expect(await savedNotes(app, FARSI_ITEM), where).toBe('یادداشتِ تازه روی صفحهٔ قطعه');

        // --- While the clock RUNS ----------------------------------------
        await page.getByRole('button', { name: 'Start a block' }).click();
        await goTo(app, '/active');
        // Let the timer genuinely tick — a re-render every second is exactly
        // what used to reset a caret or overwrite fresh text.
        await page.clock.runFor(3_000);
        await editNotes(page, 'یادداشتِ تازه روی صفحهٔ قطعه\nنوشته‌شده هنگام نواختن');
        expect(await savedNotes(app, FARSI_ITEM), where).toContain('نوشته‌شده هنگام نواختن');
        // The clock is untouched by the edit: same block, still running.
        let state = (await readPersistedState(app)).state as { active: { itemId: string; running: boolean } };
        expect(state.active.itemId, where).toBe(FARSI_ITEM);
        expect(state.active.running, where).toBe(true);

        // --- While PAUSED, and offline -----------------------------------
        await page.getByRole('button', { name: 'Pause' }).click();
        await page.context().setOffline(true);
        await editNotes(page, 'یادداشتِ تازه روی صفحهٔ قطعه\nنوشته‌شده هنگام نواختن\nedited offline');
        await page.context().setOffline(false);
        expect(await savedNotes(app, FARSI_ITEM), where).toContain('edited offline');
        state = (await readPersistedState(app)).state as { active: { itemId: string; running: boolean } };
        expect(state.active.running, where).toBe(false);

        // --- Navigating away and back ------------------------------------
        await goTo(app, `/items/${FARSI_ITEM}`);
        expect(await page.locator('main').innerText(), where).toContain('edited offline');
        await goTo(app, '/active');

        // --- Finish, and the notes are still the item's ------------------
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Same' }).click();
        await page.getByRole('button', { name: 'Save block' }).click();
        await reload(app);
        expect(await savedNotes(app, FARSI_ITEM), where).toContain('edited offline');

        // --- Discard, and they are STILL the item's ----------------------
        await goTo(app, `/items/${FARSI_ITEM}`);
        await page.getByRole('button', { name: 'Start a block' }).click();
        await goTo(app, '/active');
        await editNotes(page, 'written during a block that gets discarded');
        await page.getByRole('button', { name: 'Discard block' }).click();
        await reload(app);
        expect(await savedNotes(app, FARSI_ITEM), where).toBe('written during a block that gets discarded');

        // --- CLEARING is deliberate, and survives a reload ---------------
        await goTo(app, `/items/${FARSI_ITEM}`);
        await editNotes(page, '');
        await reload(app);
        expect(await savedNotes(app, FARSI_ITEM), where).toBeUndefined();
        await goTo(app, `/items/${FARSI_ITEM}`);
        expect(await page.locator('main').innerText(), where).toContain('No notes yet.');
        // Nothing resurrects the retired text that used to live beside it.
        expect(await page.locator('main').innerText(), where).not.toContain('فرود روشن نیست');

        // --- Editing changed NO practice fact ----------------------------
        const factsAfter = await practiceFacts(app, FARSI_ITEM);
        expect({ ...factsAfter, blocks: 0 }, where).toEqual({
          ...factsBefore,
          blocks: 0,
          // One block was deliberately practised above; everything the NOTES
          // could have touched is unchanged.
          timesPractised: factsAfter.timesPractised,
          totalMinutes: factsAfter.totalMinutes,
          lastResult: factsAfter.lastResult,
          reviews: factsAfter.reviews,
          nextReviewDate: factsAfter.nextReviewDate,
          nextReviewSource: factsAfter.nextReviewSource,
          srLastProgressDay: factsAfter.srLastProgressDay,
        });

        // --- A REFUSED storage write never reads as success --------------
        // Rejected at the real storage seam (IndexedDB itself), not by a hook
        // inside the app.
        await goTo(app, `/items/${ENGLISH_ITEM}`);
        await page.evaluate(() => {
          const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
          proto.__realPut = proto.put;
          proto.put = function failing() {
            throw new DOMException('storage is full', 'QuotaExceededError');
          };
        });
        await page.getByRole('button', { name: /^Show Working notes$/ }).click().catch(() => {});
        await page.getByRole('button', { name: 'Edit Working notes' }).click();
        await notesBox(page).fill('words that must not be lost');
        await page.getByRole('button', { name: 'Done editing Working notes' }).click();
        await page.getByText(/Not saved/).waitFor({ timeout: 10_000 });
        // The text is still on screen, still editable, with a way out.
        expect(await notesBox(page).inputValue(), where).toBe('words that must not be lost');
        expect(await page.getByRole('button', { name: 'Try again' }).isVisible(), where).toBe(true);
        expect(await page.getByRole('button', { name: 'Copy the text' }).isVisible(), where).toBe(true);
        expect(await page.getByText('Saved.').count(), where).toBe(0);
        // And restoring storage lets the retry actually succeed.
        await page.evaluate(() => {
          const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
          if (proto.__realPut) proto.put = proto.__realPut;
        });
        await page.getByRole('button', { name: 'Try again' }).click();
        await page.getByText('Saved.').waitFor({ timeout: 10_000 });
        await persistedUntil(
          app,
          (s) => (s.state as { db: { items: { id: string; notes?: string }[] } }).db.items.find((i) => i.id === ENGLISH_ITEM)?.notes,
          (n) => n === 'words that must not be lost',
        );

        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 300_000);
});

describe('a notebook belongs to ITS item, never to whatever is on screen', () => {
  it('working note editors retain item ownership across routine and database changes', async () => {
    const app = await seeded();
    const { page } = app;
    try {
      // --- Build a bound routine through the real editor ------------------
      // A → B, plus an UNBOUND segment and one bound to an item that is then
      // deleted, so every shape a segment can take is exercised.
      await goTo(app, '/routine/new');
      await page.getByRole('group', { name: 'Name' }).locator('input').fill('Ownership run');
      await page.getByRole('group', { name: 'Instrument' }).locator('select').selectOption({ label: 'Setar' });
      const segments: { label: string; minutes: string; bind?: string }[] = [
        { label: 'Segment A', minutes: '1', bind: 'آوازِ افشاری — عبارتِ ۴' },
        { label: 'Segment B', minutes: '1', bind: 'Auto and due' },
        { label: 'Just a countdown', minutes: '1' },
        { label: 'Bound to a doomed item', minutes: '1', bind: 'Nothing scheduled' },
      ];
      for (const [i, seg] of segments.entries()) {
        await page.getByRole('button', { name: 'Add segment' }).click();
        const card = page.locator('.card').filter({ has: page.getByPlaceholder('Segment label') }).nth(i);
        await card.getByPlaceholder('Segment label').fill(seg.label);
        await card.getByLabel('Minutes').fill(seg.minutes);
        if (seg.bind) await card.getByLabel('Bind to a practice item (optional)').selectOption({ label: seg.bind });
      }
      await page.getByRole('button', { name: 'Save' }).click();
      await reload(app);

      const routineId = (await persistedDb(app)).pathwayRoutines?.[0]?.id as string;
      expect(routineId).toBeTruthy();

      // --- Editing A's notes while time crosses into B --------------------
      await goTo(app, `/routine/${routineId}`);
      expect(await page.locator('main').innerText()).toContain('Segment A');
      await page.getByRole('button', { name: /^Show Working notes$/ }).click();
      await page.getByRole('button', { name: 'Edit Working notes' }).click();
      await notesBox(page).fill('typed against segment A');
      // Let the run cross the boundary NATURALLY — no dispatched event, no
      // skip: exactly the race an open editor has to survive.
      await page.clock.runFor(70_000);
      await expect.poll(() => page.locator('main').innerText()).toContain('Segment B');
      // The editor re-pointed at B and ABANDONED A's draft rather than
      // carrying it across. Neither item has been written to.
      expect(await savedNotes(app, FARSI_ITEM)).toBe(FARSI_NOTES);
      expect(await savedNotes(app, 'i-auto-due')).toBeUndefined();
      // And the run itself is unharmed: still one routine, no extra blocks.
      let state = (await readPersistedState(app)).state as { activeRoutine: { routineId: string } | null };
      expect(state.activeRoutine?.routineId).toBe(routineId);
      expect((await persistedDb(app)).blocks).toHaveLength(6);

      // B's own notebook is B's, in either language.
      await page.getByRole('button', { name: /^Show Working notes$/ }).click().catch(() => {});
      await editNotes(page, 'notes for the second item');
      expect(await savedNotes(app, 'i-auto-due')).toBe('notes for the second item');
      expect(await savedNotes(app, FARSI_ITEM)).toBe(FARSI_NOTES);

      // --- SKIP into the unbound segment: no fictitious notebook ----------
      await page.getByRole('button', { name: 'Skip' }).click();
      await expect.poll(() => page.locator('main').innerText()).toContain('Just a countdown');
      expect(await page.getByRole('button', { name: /Working notes/ }).count()).toBe(0);

      // --- Skip into the segment whose item is DELETED mid-run ------------
      await page.getByRole('button', { name: 'Skip' }).click();
      await expect.poll(() => page.locator('main').innerText()).toContain('Bound to a doomed item');
      expect(await page.getByRole('button', { name: /^Show Working notes$/ }).count()).toBe(1);
      await goTo(app, '/items/i-nodate');
      await page.getByRole('button', { name: 'Delete item' }).click();
      await goTo(app, `/routine/${routineId}`);
      // The run survives; the missing item simply has no notebook to offer.
      await expect.poll(() => page.locator('main').innerText()).toContain('Bound to a doomed item');
      expect(await page.getByRole('button', { name: /Working notes/ }).count()).toBe(0);
      await page.getByRole('button', { name: 'Finish & save' }).click();
      await expect.poll(() => page.locator('main').innerText()).toContain('Routine complete');

      // --- Item Detail: switching route A → B mid-edit --------------------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Edit Working notes' }).click();
      await notesBox(page).fill('a draft typed on the Farsi item');
      await goTo(app, `/items/${ENGLISH_ITEM}`);
      // B opens on B's own text — never A's draft.
      expect(await page.locator('main').innerText()).toContain('No notes yet.');
      await editNotes(page, 'notes that belong to the English item');
      expect(await savedNotes(app, ENGLISH_ITEM)).toBe('notes that belong to the English item');
      expect(await savedNotes(app, FARSI_ITEM)).toBe(FARSI_NOTES);

      // --- A STALE editor must not overwrite newer content ----------------
      // The panel is open with an old draft while the SAME item's data is
      // replaced underneath it (an import — exactly what a sync pull does).
      await goTo(app, `/items/${ENGLISH_ITEM}`);
      await page.getByRole('button', { name: 'Edit Working notes' }).click();
      await notesBox(page).fill('stale draft from before the replacement');
      const replaced = await persistedDb(app);
      await importBackup(
        app,
        'replacement.json',
        JSON.stringify({
          app: 'practice-compass',
          schemaVersion: replaced.schemaVersion,
          exportedAt: CLOCK.toISOString(),
          data: {
            ...replaced,
            attachments: [],
            items: replaced.items.map((i) => (i.id === ENGLISH_ITEM ? { ...i, notes: 'arrived from the other device' } : i)),
          },
          files: [],
        }),
      );
      expect(await importOutcome(app)).toContain('Imported');
      // Returning to the item shows the NEW content, and the stale draft is
      // gone rather than waiting to be committed over it.
      await goTo(app, `/items/${ENGLISH_ITEM}`);
      expect(await page.locator('main').innerText()).toContain('arrived from the other device');
      expect(await page.locator('main').innerText()).not.toContain('stale draft from before');
      expect(await savedNotes(app, ENGLISH_ITEM)).toBe('arrived from the other device');

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

describe('reflection at the close of a block', () => {
  it('practice reflection keeps notebook observation next action and question distinct', async () => {
    const app = await seeded();
    const { page } = app;
    try {
      const scheduleBefore = async () => {
        const db = await persistedDb(app);
        const item = db.items.find((i) => i.id === ENGLISH_ITEM) as Record<string, unknown>;
        return {
          nextReviewDate: item.nextReviewDate,
          nextReviewSource: item.nextReviewSource,
          srReps: item.srReps,
          srIntervalDays: item.srIntervalDays,
          openRows: db.reviews.filter((r) => r.practiceItemId === ENGLISH_ITEM && !r.completedAt).length,
        };
      };

      // --- A block with all four kinds of text, each in its own home ------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await editNotes(page, 'the notebook, which reflection must never touch');
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      // The scratch capture is explicitly THIS BLOCK's observation.
      await page.getByRole('button', { name: /Note an observation for this block/ }).click();
      await page.getByLabel('Observation for this block').fill('scratch: the forud landed twice');
      await page.getByRole('button', { name: 'Finish' }).click();
      // It seeded the close screen's observation — one carry, not a copy of
      // the notebook.
      expect(await page.getByPlaceholder('What did you notice?').inputValue()).toBe('scratch: the forud landed twice');
      await page.getByPlaceholder('What did you notice?').fill('observation for this block only');
      await page.getByPlaceholder('The one thing to try next time').fill('try it without the ornament');
      await page.getByRole('button', { name: 'Slightly better' }).click();
      // A question raised here is its OWN agenda entry.
      await page.getByRole('group', { name: 'Make this a teacher question?' }).getByRole('button', { name: 'Yes' }).click();
      await page.getByLabel('Question for your teacher').fill('Should the forud come before the ornament?');
      const prepsBefore = (await persistedDb(app)).lessonAgenda.filter((e) => e.kind === 'preparation').length;
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);

      // --- Each piece of text is exactly where it belongs ------------------
      let db = await persistedDb(app);
      const newest = db.blocks
        .filter((b) => b.practiceItemId === FARSI_ITEM)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))[0];
      expect(newest.observation).toBe('observation for this block only');
      expect(newest.nextAction).toBe('try it without the ornament');
      expect(newest.result).toBe('slightly_better');
      // The notebook is untouched by all of it.
      expect(await savedNotes(app, FARSI_ITEM)).toBe('the notebook, which reflection must never touch');
      // The question is its own entry, and committed the item to nothing.
      const questions = db.lessonAgenda.filter((e) => e.kind === 'question');
      expect(questions.map((q) => q.text)).toContain('Should the forud come before the ornament?');
      expect(db.lessonAgenda.filter((e) => e.kind === 'preparation')).toHaveLength(prepsBefore);
      // …and the question it did not overwrite is still there.
      expect(questions.map((q) => q.text)).toContain('آیا فرودم درست است؟');

      // --- The next session READS the decision, labelled as a past one ----
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      const activeText = await page.locator('main').innerText();
      expect(activeText).toContain('Last time you decided to try:');
      expect(activeText).toContain('try it without the ornament');

      // --- An EMPTY next action preserves the earlier non-empty one -------
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByPlaceholder('What did you notice?').fill('a block that decided nothing new');
      await page.getByRole('button', { name: 'Same' }).click();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      expect(await page.locator('main').innerText()).toContain('try it without the ornament');
      await page.getByRole('button', { name: 'Discard block' }).click();

      // --- Older history is REACHABLE, with everything the block holds ----
      await goTo(app, `/items/${FARSI_ITEM}`);
      const history = await page.locator('main').innerText();
      expect(history.toLowerCase()).toContain('practice history');
      expect(history).toContain('observation for this block only');
      expect(history).toContain('Decided to try next: try it without the ornament');
      // The fixture's oldest blocks carry a legacy constraint; the disclosure
      // is what makes them reachable at all once there are more than ten.
      expect(await page.getByRole('button', { name: /Show all \d+ blocks/ }).count()).toBe(0);

      // --- A DELIBERATE unlogged close preserves the schedule -------------
      const before = await scheduleBefore();
      await goTo(app, `/items/${ENGLISH_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Save without a result' }).click();
      await reload(app);
      expect(await scheduleBefore()).toEqual(before);
      db = await persistedDb(app);
      expect(db.blocks.filter((b) => b.practiceItemId === ENGLISH_ITEM && b.result === 'not_logged')).toHaveLength(2);

      // --- A close that spans local MIDNIGHT ------------------------------
      // The authored text survives; the decision refreshes to the real day.
      await goTo(app, `/items/${ENGLISH_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByPlaceholder('What did you notice?').fill('typed just before midnight');
      await page.getByPlaceholder('The one thing to try next time').fill('decided just before midnight');
      await page.getByRole('button', { name: 'Stable alone' }).click();
      const shownDate = await page.getByLabel('Next review date').inputValue().catch(async () => {
        await page.getByRole('button', { name: 'Change', exact: true }).click();
        return page.getByLabel('Next review date').inputValue();
      });
      const blocksBefore = (await persistedDb(app)).blocks.length;
      // The local day rolls with NO timer firing — exactly the window the
      // screen's own 30-second poll cannot see, and the one instant at which
      // saving yesterday's decision would actually be wrong.
      await page.clock.setSystemTime(new Date('2027-01-16T01:00:00'));
      await page.getByRole('button', { name: 'Save block' }).click();
      // REFUSED and refreshed, not silently written: the draft is exactly where
      // it was, the date on screen has moved to the real day, and nothing has
      // been recorded yet.
      expect(await page.getByPlaceholder('What did you notice?').inputValue()).toBe('typed just before midnight');
      expect(await page.getByPlaceholder('The one thing to try next time').inputValue()).toBe('decided just before midnight');
      expect((await persistedDb(app)).blocks).toHaveLength(blocksBefore);
      // The decision is REDERIVED for the real day. This item is on a fixed
      // cadence with a protected future date, so the honest answer is the same
      // date — which is the point: the refresh recomputes, it does not shuffle.
      const refreshedDate = await page.getByLabel('Next review date').inputValue();
      expect(refreshedDate).toBe(shownDate);
      // The second Save simply works, and writes the date the screen now shows.
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      db = await persistedDb(app);
      const midnightBlock = db.blocks
        .filter((b) => b.practiceItemId === ENGLISH_ITEM)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))[0];
      expect(midnightBlock.observation).toBe('typed just before midnight');
      expect(midnightBlock.nextAction).toBe('decided just before midnight');
      expect(db.items.find((i) => i.id === ENGLISH_ITEM)!.nextReviewDate).toBe(refreshedDate);

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

describe('what a summary may claim about a period it did not watch', () => {
  it('practice summaries separate recorded period evidence from current context', async () => {
    // --- Pure consumer cases, against the real engine --------------------
    const base = (JSON.parse(v12Text) as { data: PracticeDB }).data;
    const db = validateDB(base);
    const NOV = { from: '2026-11-01', to: '2026-11-30' };
    const opts = { instrumentId: 'setar', ...NOV, now: CLOCK };

    const nov = buildReportData(db, opts);
    const farsiRow = nov.periodResults.find((r) => r.item.id === FARSI_ITEM)!;
    // November recorded `worse` then `same`. The item's CURRENT lastResult is
    // `stable_alone` from a December block — reporting that as November's
    // outcome is the false statement this whole section exists to end.
    expect(db.items.find((i) => i.id === FARSI_ITEM)!.lastResult).toBe('stable_alone');
    expect(farsiRow.best).toBe('same');
    expect(farsiRow.last).toBe('same');
    let text = renderReportText(nov);
    expect(text).toContain('Results recorded in this period:');
    expect(text).not.toMatch(/is now .*stable/i);
    expect(text).not.toContain('Improved:');

    // Later practice changes the CURRENT sections, never the period's results.
    const withLater = validateDB({
      ...base,
      blocks: [
        ...(base.blocks as unknown[]),
        {
          id: 'b-later',
          practiceItemId: FARSI_ITEM,
          instrumentId: 'setar',
          startedAt: '2027-01-14T10:00:00.000Z',
          durationMinutes: 20,
          mode: 'perform',
          focus: 'tone',
          result: 'performable',
          observation: 'a much later observation',
          createdReview: false,
          createdAt: '2027-01-14T10:00:00.000Z',
          updatedAt: '2027-01-14T10:00:00.000Z',
        },
      ],
    } as unknown);
    const novAgain = buildReportData(withLater, opts);
    expect(novAgain.periodResults.find((r) => r.item.id === FARSI_ITEM)!.best).toBe('same');
    expect(novAgain.worked.map((w) => w.item.id).sort()).toEqual(nov.worked.map((w) => w.item.id).sort());

    // An UNLOGGED block is time, not evidence: it appears in "worked on" and
    // contributes no result at all.
    const english = buildReportData(db, { instrumentId: 'guitar', ...NOV, now: CLOCK });
    expect(english.worked.find((w) => w.item.id === ENGLISH_ITEM)!.blocks).toBe(2);
    expect(english.periodResults.find((r) => r.item.id === ENGLISH_ITEM)!.best).toBe('slightly_better');

    // A period with NO blocks says so rather than borrowing current state.
    const empty = buildReportData(db, { instrumentId: 'setar', from: '2026-01-01', to: '2026-01-31', now: CLOCK });
    expect(empty.worked).toEqual([]);
    expect(empty.periodResults).toEqual([]);
    text = renderReportText(empty);
    expect(text).toContain('(no logged practice in this range)');
    expect(text).toContain('(no results recorded in this range)');
    // Everything drawn from TODAY is labelled as current, not as the period's.
    expect(text).toContain('current status, not this period');
    expect(text).toContain('Suggested lesson focus (current)');
    expect(text).toContain('current, not part of the period above');
    // The personal notebook never appears on a teacher's sheet.
    expect(text).not.toContain(FARSI_NOTES);

    // --- Local day boundaries, ORDINARY and across a DST change ----------
    const dayBlock = (id: string, at: Date) => ({
      id,
      practiceItemId: FARSI_ITEM,
      instrumentId: 'setar',
      startedAt: at.toISOString(),
      durationMinutes: 5,
      mode: 'repair' as const,
      focus: 'tone' as const,
      result: 'same' as const,
      createdReview: false,
      createdAt: at.toISOString(),
      updatedAt: at.toISOString(),
    });
    const local = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) => new Date(y, m - 1, d, h, min, s, ms);
    const boundary = validateDB({
      ...base,
      blocks: [
        dayBlock('b-first-instant', local(2026, 11, 1, 0, 0, 0, 0)),
        dayBlock('b-last-instant', local(2026, 11, 30, 23, 59, 59, 999)),
        dayBlock('b-just-before', local(2026, 10, 31, 23, 59, 59, 999)),
        dayBlock('b-just-after', local(2026, 12, 1, 0, 0, 0, 0)),
      ],
    } as unknown);
    const edges = buildReportData(boundary, opts);
    expect(edges.worked.find((w) => w.item.id === FARSI_ITEM)!.blocks).toBe(2);

    // A day on which this machine's own UTC offset changes — whatever zone it
    // runs in. The range is one local day wide, and the block inside it counts.
    const dstDay = findOffsetChangeDay(2026);
    if (dstDay) {
      const iso = `${dstDay.getFullYear()}-${String(dstDay.getMonth() + 1).padStart(2, '0')}-${String(dstDay.getDate()).padStart(2, '0')}`;
      const across = validateDB({
        ...base,
        blocks: [
          dayBlock('b-dst-morning', local(dstDay.getFullYear(), dstDay.getMonth() + 1, dstDay.getDate(), 9)),
          dayBlock('b-dst-evening', local(dstDay.getFullYear(), dstDay.getMonth() + 1, dstDay.getDate(), 22)),
        ],
      } as unknown);
      const dstReport = buildReportData(across, { instrumentId: 'setar', from: iso, to: iso, now: CLOCK });
      expect(dstReport.worked.find((w) => w.item.id === FARSI_ITEM)!.blocks, `DST day ${iso}`).toBe(2);
    }

    // --- The rendered and exported sheet ---------------------------------
    const app = await seeded();
    const { page } = app;
    try {
      // Give the item a notebook that must NOT reach the teacher's sheet.
      await goTo(app, `/items/${FARSI_ITEM}`);
      await editNotes(page, 'private notebook — never a line on a teacher sheet');
      await goTo(app, '/report');
      // The Field wrapper is itself a role="group" named "Instrument", so take
      // the control, not the group around it.
      await page.getByRole('combobox', { name: 'Instrument' }).selectOption({ label: 'Setar' });
      await page.getByRole('group', { name: 'From' }).locator('input').fill(NOV.from);
      await page.getByRole('group', { name: 'To' }).locator('input').fill(NOV.to);
      await expect.poll(() => page.locator('pre.pre').innerText()).toContain('Results recorded in this period:');
      const sheet = await page.locator('pre.pre').innerText();
      expect(sheet).not.toContain('private notebook');
      expect(sheet).not.toMatch(/is now .*stable/i);

      // The question list carries its targets, its asked answers, and the
      // item's latest observation WITH the day it was written.
      const shown = await page.locator('main').innerText();
      expect(shown).toContain('آیا فرودم درست است؟');
      expect(shown).toMatch(/Last observed 2026-12-20/);
      expect(shown).toContain('بهتر');
      expect(shown).not.toContain('Problem');
      expect(shown).not.toContain('private notebook');

      // A past class's asked question keeps its own answer, unrewritten.
      await page.getByRole('combobox', { name: 'Class this report is for' }).selectOption('L-setar-past');
      await expect.poll(() => page.locator('pre.pre').innerText()).toContain('Already asked at that class:');
      expect(await page.locator('pre.pre').innerText()).toContain('Ornament after the rest.');

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

/**
 * The first day of `year` on which this machine's LOCAL UTC offset differs
 * from the day before — a real daylight-saving transition in whatever zone the
 * suite happens to run in, or null in a zone that has none.
 */
function findOffsetChangeDay(year: number): Date | null {
  let prev = new Date(year, 0, 1).getTimezoneOffset();
  for (let d = 1; d < 366; d++) {
    const day = new Date(year, 0, 1 + d);
    if (day.getFullYear() !== year) break;
    const offset = day.getTimezoneOffset();
    if (offset !== prev) return day;
    prev = offset;
  }
  return null;
}

describe('clearer wording, identical decisions', () => {
  it('clarified practice choices preserve existing defaults and decision inputs', async () => {
    // --- The numbers a label change may never move ----------------------
    // Pinned against the real engine, per rating and per result, so a wording
    // change that quietly shifted a weight fails here rather than in a lane
    // six months from now.
    const item = (o: Partial<PracticeItem>): PracticeItem => ({
      ...createItem({ instrumentId: 'setar', title: 'pinned', status: 'usable' }, CLOCK),
      id: 'pinned',
      ...o,
    });
    // The two estimates' OWN contribution, isolated from fragility/overdue/
    // neglect so a wording change is checked against the weights themselves.
    const scored = (i: PracticeItem) => {
      const parts = scoreItems([i], new Map(), CLOCK, new Map())[0].parts;
      return parts.importance + parts.difficulty;
    };
    // importance×2 + difficulty, with 1 / 3 / 5 all represented.
    expect(scored(item({ importance: 1, difficulty: 1 }))).toBe(3);
    expect(scored(item({ importance: 3, difficulty: 3 }))).toBe(9);
    expect(scored(item({ importance: 5, difficulty: 5 }))).toBe(15);
    expect(scored(item({ importance: 5, difficulty: 1 }))).toBe(11);
    expect(scored(item({ importance: 1, difficulty: 5 }))).toBe(7);
    // High effort keeps an item out of an easy warm-up; the wording of the
    // label has no bearing on it.
    expect(isWarmupSuitable(item({ difficulty: 3, status: 'integrated', timesPractised: 5 }))).toBe(true);
    expect(isWarmupSuitable(item({ difficulty: 4, status: 'integrated', timesPractised: 5 }))).toBe(false);
    // Same versus Worse, at the same due date, still decide differently — and
    // `same` is still not a slip.
    const due = item({ nextReviewDate: '2027-01-15', nextReviewSource: 'auto', srReps: 2, srEase: 2.5, srIntervalDays: 6 });
    const sameOutcome = decideReview({ item: due, result: 'same', now: CLOCK });
    const worseOutcome = decideReview({ item: due, result: 'worse', now: CLOCK });
    expect(sameOutcome.sr?.srReps).toBe(2);
    expect(sameOutcome.rationale).not.toMatch(/slip/i);
    expect(worseOutcome.sr?.srReps).toBe(0);
    expect(worseOutcome.dueDate! < sameOutcome.dueDate!).toBe(true);
    // Every retained enum still has a label AND a distinct description.
    const statusDescriptions = ITEM_STATUS_ORDER.map((s) => ITEM_STATUS_DESCRIPTIONS[s]);
    expect(new Set(statusDescriptions).size).toBe(ITEM_STATUS_ORDER.length);
    expect(new Set(ITEM_STATUS_ORDER.map((s) => ITEM_STATUS_LABELS[s])).size).toBe(ITEM_STATUS_ORDER.length);
    const resultDescriptions = RESULT_BUTTONS.map((r) => RESULT_DESCRIPTIONS[r]);
    expect(new Set(resultDescriptions).size).toBe(RESULT_BUTTONS.length);
    expect(RESULT_BUTTONS).toHaveLength(6);
    expect(Object.keys(BLOCK_MODE_LABELS)).toHaveLength(7);
    expect(Object.keys(FOCUS_LABELS)).toHaveLength(18);

    const app = await seeded();
    const { page } = app;
    try {
      // --- Creating an item: title only is still enough -------------------
      await goTo(app, '/start');
      await page.getByRole('button', { name: 'Quick add' }).click();
      await page.getByRole('group', { name: 'Title' }).locator('input').fill('title-only quick add');
      await page.getByRole('button', { name: 'Begin practice' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Discard block' }).click();
      let db = await persistedDb(app);
      const quick = db.items.find((i) => i.title === 'title-only quick add') as Record<string, unknown>;
      expect(quick).toBeTruthy();
      // The shipped defaults, unchanged by any relabelling.
      expect(quick.importance).toBe(3);
      expect(quick.difficulty).toBe(3);
      expect(quick.status).toBe('new');

      // --- Start leads with a readable default, options behind it ---------
      await goTo(app, '/start');
      await page.getByRole('group', { name: 'Instrument' }).getByRole('button', { name: 'Setar' }).click();
      await page.locator('.list-row').filter({ hasText: 'Auto and due' }).click();
      const startText = await page.locator('main').innerText();
      // ONE readable line stands in for the two choices already made from the
      // item's own status and focus — the defaults themselves are unchanged.
      expect(startText).toContain(BLOCK_MODE_LABELS[defaultModeForStatus('usable')]);
      expect(startText).toMatch(/attending to/);
      // The seven modes and eighteen focus values are one tap away, never gone.
      await page.getByRole('button', { name: 'Change practice approach' }).click();
      expect(await page.getByRole('group', { name: 'Mode' }).getByRole('button').count()).toBe(7);
      expect(await page.getByRole('group', { name: 'Focus' }).getByRole('button').count()).toBe(18);

      // --- The full form: every retained choice, with its own name --------
      await goTo(app, `/items/${ENGLISH_ITEM}`);
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      expect(await page.getByRole('group', { name: 'Status' }).getByRole('combobox').count()).toBe(1);
      expect(await page.getByRole('combobox', { name: 'Status' }).locator('option').count()).toBe(8);
      // The two estimates are named for what they are, with anchored levels…
      const form = await page.locator('main').innerText();
      expect(form).toContain(RATING_LABELS.importance);
      expect(form).toContain(RATING_LABELS.difficulty);
      expect(form).toContain(RATING_ANCHORS.difficulty[3]);
      expect(form).toContain('not measurements');
      // …and each star carries its OWN accessible name and selected state.
      for (const n of [1, 2, 3, 4, 5]) {
        expect(await page.getByRole('button', { name: `${RATING_LABELS.importance} ${n}` }).count(), `star ${n}`).toBe(1);
      }
      const chosenStar = page.getByRole('button', { name: `${RATING_LABELS.difficulty} 3` });
      expect(await chosenStar.getAttribute('aria-pressed')).toBe('true');
      // Changing a label does not change a stored code: set 5 and read it back.
      await page.getByRole('button', { name: `${RATING_LABELS.importance} 5` }).click();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      db = await persistedDb(app);
      expect(db.items.find((i) => i.id === ENGLISH_ITEM)!.importance).toBe(5);
      expect(db.items.find((i) => i.id === ENGLISH_ITEM)!.status).toBe('usable');

      // --- "Not practised yet" is honest in BOTH directions ---------------
      // An item whose status is `new` but which HAS real blocks must not be
      // described as untouched…
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('combobox', { name: 'Status' }).selectOption('new');
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      const newWithHistory = await page.locator('main').innerText();
      // The status label is shown for what it is, with the real history right
      // there beside it — the wording never stands in as evidence that nothing
      // has been practised.
      expect(newWithHistory).toContain(ITEM_STATUS_LABELS.new);
      expect(newWithHistory.toLowerCase()).toContain('practice history');
      expect(newWithHistory).toContain('فرود بهتر شد');
      expect(newWithHistory).not.toContain('No blocks yet.');
      // …and the status change recorded no practice and moved no history.
      db = await persistedDb(app);
      expect(db.blocks.filter((b) => b.practiceItemId === FARSI_ITEM)).toHaveLength(3);
      expect(db.items.find((i) => i.id === FARSI_ITEM)!.timesPractised).toBe(4);

      // A GENUINELY untouched item says so honestly, from its own evidence —
      // no blocks at all — rather than from the enum alone.
      const untouchedId = String(db.items.find((i) => i.title === 'title-only quick add')!.id);
      await goTo(app, `/items/${untouchedId}`);
      const untouched = await page.locator('main').innerText();
      expect(untouched).toContain(ITEM_STATUS_LABELS.new);
      expect(untouched).toContain('No blocks yet.');
      expect(db.blocks.filter((b) => b.practiceItemId === untouchedId)).toHaveLength(0);

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});
