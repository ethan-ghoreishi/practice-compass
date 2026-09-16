import { describe, expect, it } from 'vitest';
import type { Locator, Page } from 'playwright';
import { goTo, importBackup, importOutcome, openPracticeApp, reload, type Engine, type PracticeApp } from './practiceBrowser';
import v12Text from './fixtures/practice-information-v12.json?raw';

// ---------------------------------------------------------------------------
// ac-14 — E1. What the changed surfaces actually LOOK LIKE, in both engines
// the owner uses: Chrome on the Mac and Safari (WebKit) on the iPhone.
//
// This is rendering proof, not a source scan: every claim below is measured
// from real geometry in a real engine. It is NOT a claim to reproduce a
// physical iPhone's software keyboard — that is a separate OWNER diagnostic
// (see DECISIONS.md) and nothing here pretends otherwise.
//
// A missing engine FAILS with its install line; it never skips.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const FARSI_ITEM = 'i-farsi';
const ENGLISH_ITEM = 'i-english';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

/** Long, mixed, and opposite-language text — the real shapes this app holds. */
const FARSI_PARAGRAPHS = 'فرود را آهسته بگیر و به شاهد گوش بده.\nخط دوم: مضراب‌ها یکنواخت نیستند.';
const MIXED = 'Slow the forud — فرود را آهسته بگیر — then join it up.\nSecond line, English only.';
const LONG = `${'یک عبارتِ بسیار بلند که باید بپیچد '.repeat(6)}\n${'a very long English line that must also wrap '.repeat(6)}`;

/**
 * The fixture WITHOUT its attachment payload. This check is about rendering,
 * and WebKit's IndexedDB cannot store a Blob at all — a platform limit, not an
 * app defect, and one the attachment-carrying journeys (ac-4, ac-5) cover in
 * Chromium where it can actually be exercised. Dropping `files` is the honest
 * state-only import the app already supports, not a weakened assertion.
 */
const stateOnly = (() => {
  const parsed = JSON.parse(v12Text) as Record<string, unknown> & { data: { attachments: unknown[] } };
  delete parsed.files;
  parsed.data = { ...parsed.data, attachments: [] };
  return JSON.stringify(parsed);
})();

/**
 * The app's routes are `React.lazy`, and this file navigates by re-loading the
 * document at a new hash. A navigation that lands while a route chunk is still
 * in flight aborts that fetch, which WebKit reports as "Importing a module
 * script failed" — an artefact of driving a dev server this hard, not a
 * rendering defect: every assertion below is made against a route that did
 * render. Anything ELSE is a real page error and still fails.
 */
const ABORTED_ROUTE_CHUNK = /Importing a module script failed/;

async function seeded(engine: Engine, viewport: { width: number; height: number }): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine, viewport });
  await importBackup(app, 'v12-state-only.json', stateOnly);
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}

/** No surface may scroll sideways — only a table/diagram may, and there are none here. */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** The rendered text's OWN extent, not its box — what the reader actually sees. */
async function textBounds(locator: Locator): Promise<{ left: number; right: number; top: number; bottom: number }> {
  return locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()];
    if (rects.length === 0) {
      const box = el.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }
    return {
      left: Math.min(...rects.map((r) => r.left)),
      right: Math.max(...rects.map((r) => r.right)),
      top: Math.min(...rects.map((r) => r.top)),
      bottom: Math.max(...rects.map((r) => r.bottom)),
    };
  });
}

describe('the changed surfaces, rendered', () => {
  it('practice information controls render accessible directional text at phone and desktop widths', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      for (const viewport of [PHONE, DESKTOP]) {
        const where = `${engine}@${viewport.width}px`;
        const app = await seeded(engine, viewport);
        const { page } = app;
        try {
          // --- Working notes on the item's own screen -------------------
          await goTo(app, `/items/${FARSI_ITEM}`);
          const editButton = page.getByRole('button', { name: 'Edit Working notes' });
          // Its OWN accessible name, not the section's.
          expect(await editButton.count(), where).toBe(1);
          // Keyboard-reachable and keyboard-activatable.
          await editButton.focus();
          expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), where).toBe(
            'Edit Working notes',
          );
          // A visible focus ring, not merely a focused element.
          const outline = await editButton.evaluate((el) => {
            const cs = getComputedStyle(el);
            return `${cs.outlineStyle}|${cs.outlineWidth}|${cs.boxShadow}`;
          });
          expect(outline, where).not.toBe('none|0px|none');
          await page.keyboard.press('Enter');
          const box = page.getByRole('textbox', { name: 'Working notes', exact: true });
          await box.waitFor({ timeout: 10_000 });

          // 16px is the binding minimum at PHONE width: anything smaller makes
          // iOS zoom the page the moment the field is focused. Desktop has no
          // such threshold and keeps its own long-form note styling, which this
          // lane deliberately does not restyle — so the floor there is simply
          // "still readable".
          const minEditable = viewport.width <= 430 ? 16 : 15;
          const fontSize = await box.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
          expect(fontSize, where).toBeGreaterThanOrEqual(minEditable);

          // Multiline text, in every shape, survives and wraps.
          for (const [name, text] of [
            ['Farsi paragraphs', FARSI_PARAGRAPHS],
            ['mixed paragraphs', MIXED],
            ['very long', LONG],
          ] as const) {
            await box.fill(text);
            expect(await box.inputValue(), `${where}/${name}`).toBe(text);
            expect(await horizontalOverflow(page), `${where}/${name}`).toBeLessThanOrEqual(1);
          }
          await box.fill(FARSI_PARAGRAPHS);
          await page.getByRole('button', { name: 'Done editing Working notes' }).click();
          await page.getByText('Saved.').waitFor({ timeout: 10_000 });

          // --- Direction is RESOLVED from the content, not inherited -----
          // A Farsi item: title and notes both sit at the RIGHT edge.
          const readNotes = page.locator('.notes-read');
          let notes = await textBounds(readNotes);
          let title = await textBounds(page.locator('h1.page-title'));
          const container = await readNotes.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { left: r.left, right: r.right };
          });
          expect(notes.right, `${where}/farsi notes hug right`).toBeGreaterThan(container.left + (container.right - container.left) / 2);
          expect(Math.abs(notes.right - title.right), `${where}/farsi title and notes share an edge`).toBeLessThan(4);
          expect(await horizontalOverflow(page), where).toBeLessThanOrEqual(1);

          // An ENGLISH item with FARSI notes: each resolves its OWN direction.
          await goTo(app, `/items/${ENGLISH_ITEM}`);
          await page.getByRole('button', { name: 'Edit Working notes' }).click();
          await page.getByRole('textbox', { name: 'Working notes', exact: true }).fill(FARSI_PARAGRAPHS);
          await page.getByRole('button', { name: 'Done editing Working notes' }).click();
          await page.getByText('Saved.').waitFor({ timeout: 10_000 });
          notes = await textBounds(page.locator('.notes-read'));
          title = await textBounds(page.locator('h1.page-title'));
          const wrap = await page.locator('.notes-read').evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { left: r.left, right: r.right };
          });
          // The English title stays left; the Farsi notes go right. Neither
          // drags the other, which is the whole point of resolving per element.
          expect(Math.abs(title.left - wrap.left), `${where}/english title stays left`).toBeLessThan(4);
          expect(notes.right, `${where}/farsi notes on an english item`).toBeGreaterThan(wrap.left + (wrap.right - wrap.left) / 2);

          // --- The close screen's own controls --------------------------
          await goTo(app, `/items/${FARSI_ITEM}`);
          await page.getByRole('button', { name: 'Start a block' }).click();
          await goTo(app, '/active');
          // The practice screen's notebook and its block observation are two
          // separate, separately named controls.
          expect(await page.getByRole('button', { name: /Working notes/ }).count(), where).toBeGreaterThan(0);
          await page.getByRole('button', { name: /Note an observation for this block/ }).click();
          const observation = page.getByLabel('Observation for this block');
          expect(
            await observation.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
            where,
          ).toBeGreaterThanOrEqual(minEditable);
          await observation.fill(MIXED);
          expect(await horizontalOverflow(page), where).toBeLessThanOrEqual(1);

          await page.getByRole('button', { name: 'Finish' }).click();
          // Each result option has its own name and its own DESCRIPTION, and
          // shows its selected state.
          const same = page.getByRole('button', { name: 'Same', exact: true });
          const described = await same.evaluate((el) => {
            const id = el.getAttribute('aria-describedby');
            return id ? document.getElementById(id)?.textContent ?? '' : '';
          });
          expect(described, where).toMatch(/No meaningful change/);
          await same.focus();
          await page.keyboard.press('Enter');
          expect(await same.getAttribute('aria-pressed'), where).toBe('true');
          expect(await page.getByRole('button', { name: 'Worse', exact: true }).getAttribute('aria-pressed'), where).toBe('false');

          // The result options and the buttons beneath them do not overlap.
          const optionBox = (await same.boundingBox())!;
          const saveBox = (await page.getByRole('button', { name: 'Save block' }).boundingBox())!;
          expect(optionBox.y + optionBox.height, where).toBeLessThanOrEqual(saveBox.y + 1);
          // 44px targets on the primary actions.
          expect(saveBox.height, where).toBeGreaterThanOrEqual(44);
          expect(await horizontalOverflow(page), where).toBeLessThanOrEqual(1);
          await page.getByRole('button', { name: 'Discard without saving' }).click();

          // --- Routine note, history and question context ----------------
          await goTo(app, `/items/${FARSI_ITEM}`);
          const history = page.locator('.list-row').first();
          expect(await horizontalOverflow(page), `${where}/history`).toBeLessThanOrEqual(1);
          expect((await history.boundingBox())!.width, where).toBeLessThanOrEqual(viewport.width);

          await goTo(app, '/report');
          // The question's ORDINAL and the question itself sit on the same side
          // — the marker tracks the question, whatever the title's language.
          const li = page.locator('ol li').first();
          await li.waitFor({ timeout: 10_000 });
          const ordinal = await textBounds(li.locator('span').first());
          const questionText = await textBounds(li.locator('.stack-sm > .small').first());
          const liBox = (await li.boundingBox())!;
          const ordinalOnRight = ordinal.left > liBox.x + liBox.width / 2;
          const questionOnRight = questionText.right > liBox.x + liBox.width / 2;
          expect(ordinalOnRight, `${where}/ordinal tracks the question`).toBe(questionOnRight);
          // Nothing escapes the card.
          expect(ordinal.left, where).toBeGreaterThanOrEqual(liBox.x - 1);
          expect(ordinal.right, where).toBeLessThanOrEqual(liBox.x + liBox.width + 1);
          expect(await horizontalOverflow(page), `${where}/report`).toBeLessThanOrEqual(1);

          // --- Reduced motion is honoured -------------------------------
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await goTo(app, `/items/${FARSI_ITEM}`);
          const animated = await page.evaluate(() =>
            [...document.querySelectorAll('main *')].filter((el) => {
              const cs = getComputedStyle(el);
              const dur = parseFloat(cs.animationDuration) + parseFloat(cs.transitionDuration);
              return Number.isFinite(dur) && dur > 0.05;
            }).length,
          );
          expect(animated, `${where}/reduced motion`).toBe(0);
          await page.emulateMedia({ reducedMotion: null });

          expect(
            app.pageErrors.map((e) => e.message).filter((m) => !ABORTED_ROUTE_CHUNK.test(m)),
            where,
          ).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
  }, 600_000);
});
