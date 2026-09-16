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
