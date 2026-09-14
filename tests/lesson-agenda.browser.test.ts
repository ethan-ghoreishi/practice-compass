import { describe, expect, it } from 'vitest';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  readPersistedState,
  reload,
  writePersistedState,
} from './practiceBrowser';
import v11 from './fixtures/practice-decisions-v11.json?raw';

// ---------------------------------------------------------------------------
// ac-18 — the lesson-agenda journey, in the real app.
//
// The legacy fixture goes in through the real Settings importer, and
// everything after that is done with the controls the owner actually uses.
// The point is the SEAM: the pure migration and the pure agenda transforms are
// proven in `src/domain`, but only this can show that what the owner sees and
// what the database holds are the same thing.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const FARSI_QUESTION = 'آیا مضرابِ ریز را سبک‌تر بگیرم؟';
const ENGLISH_QUESTION = 'Should I keep the tempo steady through the foroud?';

describe('the lesson agenda, end to end', () => {
  it('lesson agenda browser journey retains questions after the targeted class', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- 1. The legacy database arrives through the real import control ---
      await importBackup(app, 'legacy-v11.json', v11);
      expect(await importOutcome(app)).toContain('Imported');

      // A RELOAD, so what follows is read back out of IndexedDB rather than
      // out of whatever React happened to be holding.
      await reload(app);
      await goTo(app, '/lessons');

      const classA = page.locator('article').filter({ hasText: 'Class 41 · 2027-03-05' }).first();
      const classB = page.locator('article').filter({ hasText: 'Class 42 · 2027-04-02' }).first();
      await classA.waitFor();

      // --- 2. Migrated intent is VISIBLY UNASSIGNED, never guessed onto a class -
      const unassignedA = classA.getByText('These name no class yet');
      await expect.poll(() => unassignedA.isVisible()).toBe(true);
      // The Farsi question came through verbatim, as ONE question.
      await expect
        .poll(() => classA.getByText('آیا نقطهٔ فرودم درست است؟', { exact: false }).first().isVisible())
        .toBe(true);
      // Nothing was silently attached to either class.
      await expect.poll(() => classA.getByText('No open questions for this class').isVisible()).toBe(true);
      await expect.poll(() => classB.getByText('Nothing committed to this class yet').isVisible()).toBe(true);

      // --- 3. Question and preparation are targeted INDEPENDENTLY -----------
      // The question goes to class B, from the class surface.
      const farsiRow = classB
        .locator('div')
        .filter({ hasText: 'آیا نقطهٔ فرودم درست است؟' })
        .filter({ has: page.getByRole('button', { name: 'Move to this class' }) })
        .last();
      await farsiRow.getByRole('button', { name: 'Move to this class' }).click();

      // The preparation goes to class A, from the ITEM surface — a different
      // screen, the same one collection.
      await goTo(app, '/repertoire');
      await page.getByRole('button', { name: 'Practice list' }).click();
      await page.getByRole('link', { name: /پیش‌درآمدِ افشاری/ }).first().click();
      await page.getByRole('button', { name: /Prepare for Class 41/ }).click();
      await expect.poll(() => page.getByText('For Class 41 · 2027-03-05').first().isVisible()).toBe(true);

      await reload(app);
      await goTo(app, '/lessons');

      // Each class now shows ITS OWN commitment and nobody else's.
      await expect
        .poll(() => classB.getByText('آیا نقطهٔ فرودم درست است؟', { exact: false }).first().isVisible())
        .toBe(true);
      await expect.poll(() => classA.getByText('Nothing committed to this class yet').isVisible()).toBe(false);
      await expect.poll(() => classB.getByText('Nothing committed to this class yet').isVisible()).toBe(true);
      await expect.poll(() => classA.getByText('No open questions for this class').isVisible()).toBe(true);

      // --- 4. Asked, with an answer — and it STAYS on that class ------------
      const questionCard = classB
        .locator('div.card')
        .filter({ hasText: 'آیا نقطهٔ فرودم درست است؟' })
        .first();
      await questionCard.getByRole('button', { name: 'Add answer' }).click();
      await questionCard.getByLabel('Teacher answer').fill('بله، سبک‌تر.');
      await questionCard.getByRole('button', { name: 'Save answer' }).click();
      await questionCard.getByRole('button', { name: 'Mark asked' }).click();

      await reload(app);
      await goTo(app, '/lessons');

      // It has left the OPEN list for that class…
      await expect.poll(() => classB.getByText('Already asked at this class').isVisible()).toBe(true);
      await expect.poll(() => classB.getByText('بله، سبک‌تر.').first().isVisible()).toBe(true);
      // …and it was NOT carried forward to the other class.
      await expect
        .poll(() => classA.getByText('آیا نقطهٔ فرودم درست است؟', { exact: false }).count())
        .toBe(0);
      // No practice was logged by any of it.
      await goTo(app, '/');
      await expect.poll(() => page.getByText(/Practised today: 0 min · 0 blocks/).isVisible()).toBe(true);

      // --- 5. Mixed languages, checked against the REAL laid-out DOM --------
      // A Farsi question on an ENGLISH-titled item, and an English question on
      // a FARSI-titled item: the two combinations that only differ when the
      // title and the question disagree, which matching-language seed data can
      // never show.
      await addQuestionToItem(page, /Question but never flagged/, FARSI_QUESTION);
      await addQuestionToItem(page, /آوازِ افشاری/, ENGLISH_QUESTION);

      await reload(app);
      await goTo(app, '/lessons');
      const sheet = classA.getByRole('list').filter({ has: page.getByText(FARSI_QUESTION) }).first();
      await sheet.waitFor();

      const farsiOnEnglish = await rowDirection(page, FARSI_QUESTION);
      const englishOnFarsi = await rowDirection(page, ENGLISH_QUESTION);
      // The row's direction tracks the QUESTION, which is the field that is
      // always present — never the optional, independently-authored title.
      expect(farsiOnEnglish).toBe('rtl');
      expect(englishOnFarsi).toBe('ltr');

      // --- 6. A refused clipboard says so, and offers something else --------
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: () => Promise.reject(new Error('denied')) },
        });
      });
      await reload(app);
      await goTo(app, '/lessons');
      await classA.getByRole('button', { name: 'Copy' }).first().click();
      const status = page.getByRole('status').filter({ hasText: 'Couldn’t copy' }).first();
      await status.waitFor();
      expect(await status.textContent()).toContain('select it, or use Download');
      // The fallback is a real, selectable control with an accessible name.
      const fallback = page.getByLabel('Questions text to select and copy');
      await fallback.waitFor();
      expect(await fallback.inputValue()).toContain(FARSI_QUESTION);
      expect(await page.getByRole('button', { name: 'Download' }).first().isEnabled()).toBe(true);

      // --- 7. The controls this lane added are reachable by role and name ---
      for (const name of ['Mark asked', 'Add answer', 'Remove this question']) {
        expect(await classA.getByRole('button', { name }).first().isVisible(), name).toBe(true);
      }
      expect(await classA.getByLabel('New question for this class').first().isVisible()).toBe(true);

      // --- 8. An INVALID new-model import is refused, old data still there --
      const broken = JSON.parse(v11) as { data: { lessonAgenda: unknown[] } };
      broken.data.lessonAgenda = [{ id: 'x', kind: 'reminder', instrumentId: 'setar' }];
      await importBackup(app, 'broken.json', JSON.stringify(broken));
      expect(await importOutcome(app)).toContain('Import failed');
      await reload(app);
      await goTo(app, '/lessons');
      // Everything established above survived the refusal untouched.
      await expect.poll(() => classB.getByText('بله، سبک‌تر.').first().isVisible()).toBe(true);
      await expect.poll(() => classA.getByText(FARSI_QUESTION).first().isVisible()).toBe(true);

      // --- 9. HYDRATION COMPLETES AN INCOMPLETE CURRENT-SCHEMA CONVERSION ---
      // Zustand's persist middleware only calls `migrate` when the persisted
      // version differs from the current one — a persisted v12 database that
      // already carries a stray legacy field (an interrupted write, a bug in
      // an earlier build) never reaches it that way. This writes directly
      // into the app's own IndexedDB, the way an already-current device holds
      // its state, bypassing every import door (which always runs
      // `validateDB`, and so always runs the migration chain, regardless of
      // the version a FILE claims).
      const persisted = await readPersistedState(app);
      expect(persisted.version).toBe(12);
      const HYDRATION_ITEM = 'i-q-empty'; // has a preparation already, no question yet
      const stateBefore = persisted.state as { db: { items: { id: string; teacherQuestion?: string }[] } };
      const withLeftover = {
        ...(persisted.state as Record<string, unknown>),
        db: {
          ...stateBefore.db,
          items: stateBefore.db.items.map((i) =>
            i.id === HYDRATION_ITEM ? { ...i, teacherQuestion: 'hydration leftover question' } : i,
          ),
        },
      };
      await writePersistedState(app, withLeftover, 12);
      await reload(app);

      // The leftover was completed LOSSLESSLY, not silently dropped: a real
      // open question now exists for the item, reachable the ordinary way.
      await goTo(app, `/items/${HYDRATION_ITEM}`);
      await expect.poll(() => page.getByText('hydration leftover question').first().isVisible()).toBe(true);

      // Idempotent: a SECOND, ordinary reload (now genuinely current, nothing
      // left behind) creates no duplicate.
      await reload(app);
      await goTo(app, `/items/${HYDRATION_ITEM}`);
      expect(await page.getByText('hydration leftover question').count()).toBe(1);
    } finally {
      await app.close();
    }
  });
});

/** Raise a question from the ITEM surface, the way the owner does. */
async function addQuestionToItem(
  page: import('playwright').Page,
  title: RegExp,
  text: string,
): Promise<void> {
  await page.goto(page.url().replace(/#.*$/, '') + '#/repertoire');
  await page.getByRole('button', { name: 'Practice list' }).click();
  await page.getByRole('link', { name: title }).first().click();
  await page.getByRole('button', { name: '+ Ask about this' }).click();
  await page.getByLabel('New question').fill(text);
  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByText(text).first().waitFor();
}

/**
 * The direction a question's own row actually RESOLVES to in the laid-out DOM —
 * read from the browser, not inferred from source.
 */
async function rowDirection(page: import('playwright').Page, question: string): Promise<string> {
  return page.evaluate((q) => {
    const all = [...document.querySelectorAll('li')];
    const li = all.find((el) => (el.textContent ?? '').includes(q));
    if (!li) return 'not-found';
    return getComputedStyle(li).direction;
  }, question);
}
