import { describe, expect, it } from 'vitest';
import {
  arrive,
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  persistedUntil,
  readPersistedState,
  reload,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';
import FIXTURE from './fixtures/ui-refresh.json?raw';

// ---------------------------------------------------------------------------
// The UI refresh's outcome guards, on ONE committed mixed-language fixture: a
// Farsi-named instrument holding English titles, an English-named one holding
// Farsi titles, and a Farsi title followed by digits ('عراق 3').
//
//   ac-1  the route sweep: every route reflows, names its controls, has one
//         h1, keeps its layout primitives' geometry and meets the 44px floor
//         at phone width. Every failure is COLLECTED first, so one run names
//         the whole inventory rather than the first casualty.
//   ac-2  direction, MEASURED: where the words actually land on screen, never
//         which attributes the markup carries.
//   ac-8 / ac-9  Settings: the instrument rename and the headed sections.
//
// `UI_BASE_ROOT` serves another checkout instead (the baseline, 24a84be) to
// reproduce the base inventory DECISIONS.md records; `UI_PACKET_DIR` saves the
// owner's before/after review packet. Neither changes what is asserted.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-20T21:00:00');
const ROOT = process.env.UI_BASE_ROOT || undefined;
const PACKET = process.env.UI_PACKET_DIR || undefined;

type Config = { engine: Engine; width: number; height: number };
const SWEEP: Config[] = [
  { engine: 'chromium', width: 390, height: 844 },
  { engine: 'webkit', width: 390, height: 844 },
  { engine: 'chromium', width: 1280, height: 900 },
];
const PHONES: Config[] = SWEEP.filter((c) => c.width === 390);
const label = (c: Config) => `${c.engine} ${c.width}`;

async function open(c: Config): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine: c.engine, viewport: { width: c.width, height: c.height }, root: ROOT });
  await importBackup(app, 'ui-refresh.json', FIXTURE);
  expect(await importOutcome(app), label(c)).toContain('Imported');
  return app;
}

/** Light and dark of what is on screen now, for the owner's packet only. */
async function snap(app: PracticeApp, c: Config, name: string): Promise<void> {
  if (!PACKET) return;
  for (const colorScheme of ['light', 'dark'] as const) {
    await app.page.emulateMedia({ colorScheme });
    await app.page.screenshot({ path: `${PACKET}/${name}-${c.engine}-${c.width}-${colorScheme}.png` });
  }
  await app.page.emulateMedia({ colorScheme: null });
}

/**
 * Everything one screen gets wrong against the route-sweep contract, judged in
 * the page. Accessible names follow the accname order a browser uses for
 * these controls (labelledby, aria-label, an associated label, title,
 * placeholder, then the content) — never aria-label alone.
 */
function audit(app: PracticeApp, phone: boolean): Promise<string[]> {
  return app.page.evaluate((phone) => {
    const out: string[] = [];
    const main = document.querySelector('main')!;
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''} "${(el.textContent ?? '').trim().slice(0, 40)}"`;
    const shown = (el: Element) => {
      if (el.closest('[hidden], .print-sheet')) return false;
      const s = getComputedStyle(el);
      return el.getClientRects().length > 0 && s.visibility !== 'hidden';
    };
    const text = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const nameOf = (el: Element): string => {
      const by = el.getAttribute('aria-labelledby');
      if (by) {
        const t = by.split(/\s+/).map((id) => text(document.getElementById(id))).join(' ').trim();
        if (t) return t;
      }
      const aria = el.getAttribute('aria-label')?.trim();
      if (aria) return aria;
      if (el.matches('input, select, textarea')) {
        const id = el.getAttribute('id');
        const forLabel = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
        const t = text(forLabel) || text(el.closest('label'));
        if (t) return t;
      } else {
        const own = text(el) || [...el.querySelectorAll('img[alt], [aria-label]')].map((n) => n.getAttribute('alt') || n.getAttribute('aria-label')).join(' ').trim();
        if (own) return own;
      }
      return el.getAttribute('title')?.trim() || el.getAttribute('placeholder')?.trim() || '';
    };

    // One h1 per route (an sr-only one counts: it is the page's name).
    const h1s = [...document.querySelectorAll('h1')].filter(shown);
    if (h1s.length !== 1) out.push(`${h1s.length} h1 elements (${h1s.map((h) => text(h)).join(' | ')})`);

    // Reflow: nothing scrolls sideways that was not built to.
    if (document.documentElement.scrollWidth > window.innerWidth + 1) out.push('the page scrolls sideways');
    if (main.scrollWidth > main.clientWidth + 1) {
      // Name what pushes it: an element past the edge, or one whose own
      // content spills past it.
      const right = main.getBoundingClientRect().right;
      const culprits = [...main.querySelectorAll('*')].filter(
        (el) => el.getBoundingClientRect().right > right + 1 || el.getBoundingClientRect().left + el.scrollWidth > right + 1,
      );
      out.push(`main scrolls sideways (${culprits.slice(-2).map(describe).join('; ')})`);
    }
    const box = main.getBoundingClientRect();
    for (const el of main.querySelectorAll('*')) {
      if (!shown(el) || el.matches('input, textarea, select, option') || el.closest('.sr-only, svg')) continue;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if ((s.overflowX === 'auto' || s.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1) out.push(`scrolls sideways: ${describe(el)}`);
      // Content clipped by its container (text-overflow ellipsis and line
      // clamps are deliberate truncation, not clipping).
      if ((s.overflowX === 'hidden' || s.overflowX === 'clip') && s.textOverflow !== 'ellipsis' && s.webkitLineClamp === 'none' && el.scrollWidth > el.clientWidth + 1 && !el.matches('.balance-track'))
        out.push(`clips its content: ${describe(el)}`);
      if (r.width > 0 && s.position !== 'fixed' && (r.right > box.right + 1 || r.left < box.left - 1)) out.push(`overflows main: ${describe(el)}`);
    }

    // Layout primitives keep the geometry their class promises.
    const want: [string, string, string?][] = [
      ['.row', 'flex', 'row'],
      ['.row-wrap', 'flex', 'row'],
      ['.stack, .stack-sm, .stack-lg', 'flex', 'column'],
      ['.grid-2, .grid-stats', 'grid'],
    ];
    for (const [sel, display, direction] of want) {
      for (const el of document.querySelectorAll(sel)) {
        if (!shown(el)) continue;
        const s = getComputedStyle(el);
        if (!s.display.endsWith(display) || (direction && s.flexDirection !== direction)) out.push(`${sel} renders ${s.display}/${s.flexDirection}: ${describe(el)}`);
      }
    }

    // Every visible control has a name; at phone width, a 44px target.
    const controls = document.querySelectorAll('button, a[href], input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])');
    for (const el of controls) {
      if (!shown(el) || (el as HTMLInputElement).type === 'hidden') continue;
      if (!nameOf(el)) out.push(`unnamed control: ${el.outerHTML.slice(0, 90)}`);
      if (!phone || !el.matches('button, select, input, textarea, summary, a.btn') || el.matches('.rating button')) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 43.5) out.push(`${Math.round(r.height)}px tall: ${describe(el)}`);
      if (el.matches('button') && !text(el) && r.width < 43.5) out.push(`${Math.round(r.width)}px wide icon button: ${describe(el)}`);
    }
    return out;
  }, phone);
}

async function sweep(c: Config): Promise<string[]> {
  const app = await open(c);
  const { page } = app;
  const phone = c.width === 390;
  const failures: string[] = [];
  const check = async (route: string) => {
    for (const f of await audit(app, phone)) failures.push(`${label(c)} ${route}: ${f}`);
  };
  try {
    // TODAY — a session, its two doorways opened, then the Overview.
    await goTo(app, '/');
    await page.getByRole('navigation', { name: 'Which instrument are you practising?' }).getByRole('button', { name: 'Tar', exact: true }).click();
    await page.getByText('Due reviews').waitFor();
    await check('Today (Tar session)');
    await snap(app, c, 'today');
    await page.getByRole('button', { name: /^Plan this session/ }).click();
    await page.getByRole('button', { name: /^Routines/ }).click();
    await page.getByText('How long today?').waitFor();
    await check('Today (doorways open)');
    await page.getByRole('button', { name: 'Overview' }).click();
    await page.getByText('Each instrument, at a glance').waitFor();
    await check('Today (Overview)');

    // REPERTOIRE — its three views.
    await goTo(app, '/repertoire?inst=all', { arrival: 'Repertoire' });
    for (const view of ['My repertoire', 'Pathways', 'Practice list']) {
      await page.getByRole('button', { name: view, exact: true }).click();
      await page.locator(`button[aria-pressed="true"]`, { hasText: view }).waitFor();
      await check(`Repertoire (${view})`);
    }
    await page.getByRole('button', { name: 'My repertoire', exact: true }).click();
    await page.getByText('عراق 3').first().waitFor();
    await snap(app, c, 'repertoire');
    // A work's parts, opened: part rows are link cards laid out as rows.
    await page.locator('.list-row', { hasText: 'چهارمضراب ماهور' }).locator('button[aria-expanded]').first().click();
    await page.getByText('بخش اول').first().waitFor();
    await check('Repertoire (a work\'s parts open)');

    for (const [route, heading] of [
      ['/start', 'Start a block'],
      ['/plan?minutes=20', /session$/],
      ['/routine/new?instrument=inst-tar', 'New routine'],
      ['/routine/rt-tar', 'گرم کردن تار'],
      ['/items/new', 'Add practice item'],
      ['/pathway/pw-tar', 'ردیف تار'],
      ['/pathway/pw-tar/stage-fa', /آواز افشاری/],
      ['/materials', 'Study sources'],
      ['/terms', 'Musical terms'],
      ['/report', 'Teacher report'],
      ['/more', 'More'],
    ] as const) {
      await goTo(app, route, { arrival: heading });
      await check(route);
    }

    await goTo(app, '/lessons', { arrival: 'Lessons' });
    await check('/lessons');
    await page.getByText(/Class 12/).first().click();
    await page.getByRole('textbox').first().waitFor();
    await check('/lessons (a class open)');

    await goTo(app, '/insights', { arrival: 'Insights' });
    await check('/insights (7 days)');
    await page.getByRole('button', { name: 'Last 30 days' }).click();
    await page.getByText('Over the last 30 days').waitFor();
    await check('/insights (30 days)');

    await goTo(app, '/items/it-iraq3', { arrival: 'عراق 3' });
    await check('/items/it-iraq3');
    await snap(app, c, 'item');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await arrive(page, 'Edit item');
    await check('/items/it-iraq3 (editing)');
    await page.getByRole('button', { name: 'Cancel edit' }).click();
    await arrive(page, 'عراق 3');

    await goTo(app, '/settings', { arrival: 'Settings & backup' });
    await check('/settings');
    await snap(app, c, 'settings');

    // ACTIVE and CLOSE — a block started for real, then discarded, so the
    // fixture leaves this sweep as it arrived.
    await goTo(app, '/');
    await page.getByRole('navigation', { name: 'Which instrument are you practising?' }).getByRole('button', { name: 'Tar', exact: true }).click();
    await page.getByRole('button', { name: /^Start · 10 min/ }).click();
    await page.getByRole('button', { name: 'Finish' }).waitFor();
    await check('/active');
    // The block in progress, seen from Today: its own instrument's banner,
    // then another instrument's "still running elsewhere" row.
    await goTo(app, '/');
    await page.getByText('In progress').waitFor();
    await check('Today (block in progress)');
    await page.getByRole('navigation', { name: 'Which instrument are you practising?' }).getByRole('button', { name: 'سه‌تار', exact: true }).click();
    await page.getByText('· in progress').waitFor();
    await check('Today (block running elsewhere)');
    await goTo(app, '/active', { arrival: /رنگ اصفهان|چهارمضراب ماهور|عراق 3|درآمد شور|تحریر/ });
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByText('A few seconds to capture what happened.').waitFor();
    await page.getByRole('button', { name: 'Same', exact: true }).click();
    await page.getByRole('button', { name: 'Change', exact: true }).click();
    await page.getByLabel('Next review date').waitFor();
    await page.getByRole('button', { name: 'Change status, focus and effort' }).click();
    await page.getByRole('combobox', { name: 'Primary focus' }).waitFor();
    await check('/close (controls open)');
    await snap(app, c, 'close');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'Discard block' }).click();
    await page.getByRole('button', { name: /^Start · 10 min/ }).waitFor();

    for (const e of app.pageErrors) failures.push(`${label(c)}: page error ${e.message}`);
  } finally {
    await app.close();
  }
  return failures;
}

describe('the route sweep', () => {
  it('every route reflows, names its controls and meets the touch floor', async () => {
    const failures = (await Promise.all(SWEEP.map(sweep))).flat();
    expect(failures).toEqual([]);
  }, 900_000);
});

// ---------------------------------------------------------------------------
// ac-2 — direction as the owner SEES it. Each probe finds characters by
// their text and reads where the browser actually drew them.
// ---------------------------------------------------------------------------

/** The rectangle the browser drew a substring of `el`'s text in (first match of `needle`, from `from`). */
const RECT_OF = `(el, needle, from = 0) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let all = '';
  for (let n = walker.nextNode(); n; n = walker.nextNode()) { nodes.push([n, all.length]); all += n.data; }
  const at = all.indexOf(needle, from);
  if (at < 0) return null;
  const range = document.createRange();
  const place = (offset, end) => {
    for (const [n, start] of nodes) if (offset >= start && (offset < start + n.data.length || (end && offset === start + n.data.length))) return [n, offset - start];
    return null;
  };
  const a = place(at, false), b = place(at + needle.length, true);
  if (!a || !b) return null;
  range.setStart(a[0], a[1]);
  range.setEnd(b[0], b[1]);
  const r = range.getBoundingClientRect();
  return { left: r.left, right: r.right, top: r.top, width: r.width };
}`;

type Rect = { left: number; right: number; top: number; width: number };

async function rectOf(app: PracticeApp, selector: string, hasText: string, needle: string, from = 0): Promise<Rect | null> {
  const el = app.page.locator(selector, { hasText }).first();
  await el.waitFor();
  return el.evaluate(
    (node, [src, needle, from]) => (new Function(`return ${src}`)() as (e: Element, n: string, f: number) => Rect | null)(node, needle, from),
    [RECT_OF, needle, from] as const,
  );
}

async function directions(c: Config): Promise<string[]> {
  const app = await open(c);
  const { page } = app;
  const failures: string[] = [];
  const fail = (what: string) => failures.push(`${label(c)}: ${what}`);
  try {
    // QuickAdd's instrument picker, before any instrument is chosen.
    await goTo(app, '/');
    await page.getByRole('group', { name: 'Instrument for the new item' }).waitFor();
    const quick = await page
      .getByRole('group', { name: 'Instrument for the new item' })
      .getByRole('button', { name: 'سه‌تار' })
      .evaluate((b) => {
        const walker = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
        const t = walker.nextNode();
        return t?.parentElement ? getComputedStyle(t.parentElement).direction : 'none';
      });
    if (quick !== 'rtl') fail(`QuickAdd's Farsi instrument name computes ${quick}`);

    // Today, the Tar session: a Farsi title's due caption and the
    // "Then, if you have time" reason.
    await page.getByRole('navigation', { name: 'Which instrument are you practising?' }).getByRole('button', { name: 'Tar', exact: true }).click();
    await page.getByText('Due reviews').waitFor();
    const due = await rectOf(app, '.list-row', 'چهارمضراب ماهور', 'due');
    const dueDay = await rectOf(app, '.list-row', 'چهارمضراب ماهور', '14 days ago');
    if (!due || !dueDay || !(due.right <= dueDay.left + 1)) fail(`the due caption does not read "due" before its day (${JSON.stringify([due, dueDay])})`);

    const then = page.locator('section', { hasText: 'Then, if you have time' });
    await then.waitFor();
    const clipped = await then.evaluate((s) =>
      [...s.querySelectorAll('span[dir="ltr"]')].flatMap((span) => {
        const r = span.getBoundingClientRect();
        // The nearest box that would clip it.
        let box = span.parentElement;
        while (box && getComputedStyle(box).overflowX === 'visible') box = box.parentElement;
        const b = (box ?? s).getBoundingClientRect();
        return r.left < b.left - 1 || r.right > b.right + 1 ? [span.textContent ?? ''] : [];
      }),
    );
    if (clipped.length) fail(`"Then, if you have time" clips the start of: ${clipped.join(' | ')}`);

    // The Overview's "next:" line under a Farsi-named instrument, whose
    // group resolves right-to-left around an English line.
    await page.getByRole('button', { name: 'Overview' }).click();
    const next = await rectOf(app, '.list-row', 'سه‌تار', 'next');
    const row = page.locator('.list-row', { hasText: 'سه‌تار' }).first();
    const rowBox = await row.boundingBox();
    if (!next || !rowBox || next.left < rowBox.x - 1 || next.right > rowBox.x + rowBox.width + 1) fail(`the Overview "next:" line hides its first word (${JSON.stringify(next)})`);

    // Repertoire: "gusheh:" then its value, never ":gusheh".
    await goTo(app, '/repertoire?inst=all', { arrival: 'Repertoire' });
    const word = await rectOf(app, '.list-row', 'عراق 3', 'gusheh');
    const colon = await rectOf(app, '.list-row', 'عراق 3', ':', 0);
    if (!word || !colon || Math.abs(colon.left - word.right) > 2) fail(`Repertoire's label reads ":gusheh" (${JSON.stringify([word, colon])})`);

    // A stage: a Farsi title and its intro share the right edge; an English
    // one stays left.
    for (const [route, rtl] of [
      ['/pathway/pw-tar/stage-fa', true],
      ['/pathway/pw-setar/stage-en', false],
    ] as const) {
      await goTo(app, route, { arrival: rtl ? /آواز افشاری/ : /Basics of the right hand/ });
      const edges = await page.evaluate(() => {
        const h = document.querySelector('main h1')!;
        const p = h.parentElement!.querySelector('.page-sub')!;
        const range = (el: Element) => {
          const r = document.createRange();
          r.selectNodeContents(el);
          return r.getBoundingClientRect();
        };
        const main = document.querySelector('.main-inner')!.getBoundingClientRect();
        const [a, b] = [range(h), range(p)];
        return { title: [a.left - main.left, main.right - a.right], intro: [b.left - main.left, main.right - b.right] };
      });
      const side = rtl ? 1 : 0;
      const pad = edges.title[side];
      if (Math.abs(edges.intro[side] - pad) > 2 || pad > 20) fail(`${route}: the title and intro do not share the ${rtl ? 'right' : 'left'} edge (${JSON.stringify(edges)})`);
    }

    // ItemDetail: "Study source:" keeps its gap on the value's side.
    await goTo(app, '/items/it-iraq3', { arrival: 'عراق 3' });
    const label = await rectOf(app, '.card span.dim', 'Study source', 'Study source:');
    const value = await rectOf(app, '.card span.dim', 'Study source', 'دستور تار');
    if (!label || !value) fail('ItemDetail shows no study source');
    else {
      const gap = value.left >= label.right ? value.left - label.right : label.left - value.right;
      if (gap < 2) fail(`"Study source:" touches its value (${gap.toFixed(1)}px)`);
    }

    // Insights and the teacher report: a Farsi title followed by digits never
    // pulls the English words after it out of order.
    await goTo(app, '/insights', { arrival: 'Insights' });
    const body = 'article';
    const dash = await rectOf(app, body, 'Most of your time', '—');
    const mins = await rectOf(app, body, 'Most of your time', '45');
    const across = await rectOf(app, body, 'Most of your time', 'across');
    if (!dash || !mins || !across || !(dash.right <= mins.left + 1 && mins.right <= across.left + 1)) fail(`the Insights body is out of order (${JSON.stringify([dash, mins, across])})`);

    await goTo(app, '/report', { arrival: 'Teacher report' });
    await page.getByRole('combobox', { name: 'Instrument', exact: true }).selectOption('inst-tar');
    const pre = 'pre.pre';
    await page.locator(pre, { hasText: 'عراق 3' }).waitFor();
    const start = await page.locator(pre).first().evaluate((p, t) => (p.textContent ?? '').indexOf(t), 'عراق 3');
    const blocks = await rectOf(app, pre, 'Worked on', 'blocks', start);
    const minutes = await rectOf(app, pre, 'Worked on', 'minutes', start);
    const count = await rectOf(app, pre, 'Worked on', ': 3', start);
    if (!blocks || !minutes || !count || !(count.right <= blocks.left + 1 && blocks.right <= minutes.left + 1)) fail(`the report line is out of order (${JSON.stringify([count, blocks, minutes])})`);

    for (const e of app.pageErrors) fail(`page error ${e.message}`);
  } finally {
    await app.close();
  }
  return failures;
}

describe('direction, measured', () => {
  it('mismatched languages keep their own direction on every fixed surface', async () => {
    const failures = (await Promise.all(PHONES.map(directions))).flat();
    expect(failures).toEqual([]);
  }, 600_000);
});

// ---------------------------------------------------------------------------
// ac-8 / ac-9 — Settings, at phone width, in both engines.
// ---------------------------------------------------------------------------

type Persisted = { state: { db: { instruments: { id: string; name: string; updatedAt: string; active: boolean }[] } } };
const tar = (s: { state: unknown }) => (s as Persisted).state.db.instruments.find((i) => i.id === 'inst-tar')!;

describe('Settings', () => {
  it('an instrument rename saves trimmed on commit and an empty name is refused', async () => {
    await Promise.all(
      PHONES.map(async (c) => {
        const app = await open(c);
        const { page } = app;
        const where = label(c);
        try {
          await goTo(app, '/more', { arrival: 'More' });
          await goTo(app, '/settings', { arrival: 'Settings & backup' });

          // Typing writes nothing (a reload drops the draft and finds the old
          // name); leaving the field commits it, trimmed.
          await page.getByRole('textbox', { name: 'Rename Tar', exact: true }).fill('  Tar 2  ');
          await reload(app);
          expect(tar(await readPersistedState(app)).name, where).toBe('Tar');
          const field = page.getByRole('textbox', { name: 'Rename Tar', exact: true });
          await field.fill('  Tar 2  ');
          await field.press('Tab');
          await persistedUntil(app, tar, (t) => t.name === 'Tar 2');
          await reload(app);
          await page.getByRole('textbox', { name: 'Rename Tar 2', exact: true }).waitFor();
          expect(await page.getByRole('textbox', { name: 'Rename Tar 2', exact: true }).inputValue(), where).toBe('Tar 2');

          // An empty name is refused, visibly, and nothing about the
          // instrument moves.
          const saved = tar(await readPersistedState(app));
          const renamed = page.getByRole('textbox', { name: 'Rename Tar 2', exact: true });
          await renamed.fill('   ');
          await renamed.press('Tab');
          await page.getByRole('alert').filter({ hasText: 'needs a name' }).waitFor();
          expect(await renamed.inputValue(), where).toBe('Tar 2');
          await reload(app);
          await page.getByRole('textbox', { name: 'Rename Tar 2', exact: true }).waitFor();
          expect(tar(await readPersistedState(app)), where).toEqual(saved);

          // Enter commits; the blur that follows applies nothing a second time.
          const again = page.getByRole('textbox', { name: 'Rename Tar 2', exact: true });
          await again.fill('Tar 3');
          await again.press('Enter');
          const once = await persistedUntil(app, tar, (t) => t.name === 'Tar 3');
          await page.clock.fastForward(5_000);
          await page.getByRole('textbox', { name: 'Rename Tar 3', exact: true }).press('Tab');
          await reload(app);
          await page.getByRole('textbox', { name: 'Rename Tar 3', exact: true }).waitFor();
          expect(tar(await readPersistedState(app)), where).toEqual(once);
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }),
    );
  }, 600_000);

  it('Settings keeps every control in reach under headed sections', async () => {
    await Promise.all(
      PHONES.map(async (c) => {
        const app = await open(c);
        const { page } = app;
        const where = label(c);
        try {
          await goTo(app, '/more', { arrival: 'More' });
          await goTo(app, '/settings', { arrival: 'Settings & backup' });
          const facts = await page.evaluate(() => {
            const main = document.querySelector('main')!;
            const sections = [...main.querySelectorAll('section')].filter((s) => !s.parentElement?.closest('section'));
            const exempt = /^(Review Setar setup|Hidden and removed from the archive|Keeping fresh)/;
            const hidden = [...main.querySelectorAll('details:not([open])')]
              .filter((d) => !exempt.test((d.querySelector('summary')?.textContent ?? '').trim()))
              .flatMap((d) => [...d.querySelectorAll('button, input, select, textarea, a[href]')].map((c) => c.outerHTML.slice(0, 80)));
            const visible = (t: string) =>
              [...main.querySelectorAll('*')].some((el) => el.children.length === 0 && (el.textContent ?? '').includes(t) && !el.closest('details:not([open])') && el.getClientRects().length > 0);
            return {
              unheaded: sections.filter((s) => s.firstElementChild?.tagName !== 'H2').map((s) => (s.textContent ?? '').slice(0, 40)),
              headings: [...main.querySelectorAll('h2')].map((h) => (h.textContent ?? '').trim()),
              hidden,
              formula: visible('importance×2 + difficulty + fragility + overdue + neglected + class-deadline − recent-minutes'),
              collapsedProse: ['What each choice means', 'On this device'].map((t) =>
                [...main.querySelectorAll('details:not([open])')].some((d) => (d.textContent ?? '').includes(t)),
              ),
              newestWins: /newest copy wins/i.test(main.textContent ?? ''),
            };
          });
          expect(facts.unheaded, where).toEqual([]);
          expect(facts.headings.length, where).toBeGreaterThan(6);
          expect(facts.hidden, where).toEqual([]);
          expect(facts.formula, where).toBe(true);
          expect(facts.collapsedProse, where).toEqual([true, true]);
          expect(facts.newestWins, where).toBe(false);

          // Live values: the first gap shown in the explanation follows the field.
          const first = page.getByRole('spinbutton', { name: /^First review gap/ });
          await first.fill('3');
          await page.getByText('≈ 3 →').first().waitFor();

          // Every section is reachable by heading, and a disclosure opens from
          // the keyboard.
          for (const h of facts.headings) await page.getByRole('heading', { level: 2, name: h, exact: true }).waitFor();
          const summary = page.locator('summary', { hasText: 'What each choice means' });
          await summary.focus();
          await page.keyboard.press('Enter');
          await page.locator('details[open] summary', { hasText: 'What each choice means' }).waitFor();
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }),
    );
  }, 600_000);
});
