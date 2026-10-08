import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Browser journeys wait on EVENTS. A fixed sleep, a hand-rolled poller or a
// read of the screen at one instant passes on a fast machine and fails on an
// unlucky runner — in a lane that never touched the journey. This reads every
// test file and the harness and refuses those shapes, so the rule holds by
// construction instead of by review.
//
// Five rules:
//   sleep     no `waitForTimeout(` or `setTimeout(` outside the ledger below;
//   poller    no loop that awaits and sleeps — `persistedUntil` is the one;
//   positive  no `expect(await X.count())` claiming at least one, and no
//             `expect(await X.isVisible|isChecked|isEnabled|isDisabled|isEditable())`
//             claiming true: a positive claim about rendered state is polled;
//   negative  every polled negative (`expect.poll(…)` with `.not`, `toBe(0)`,
//             `toBe(false)` or `toEqual([])`) is ledgered as a disappearance
//             AFTER presence — a poll for absence passes at once if the thing
//             never arrived, so its test must have waited for it first;
//   goto      no raw `page.goto` to a hash route outside the harness: `goTo`
//             is the navigation that waits for the destination.
//
// A ledger entry names its file, the rule, a snippet of the site (whitespace
// collapsed) and WHY it is allowed. An entry that matches nothing is stale and
// fails, so the ledger stays exactly as long as the code it vouches for.
// ---------------------------------------------------------------------------

type Rule = 'sleep' | 'poller' | 'positive' | 'negative' | 'goto';
export type Site = { file: string; line: number; rule: Rule; text: string };

const LEDGER: { file: string; rule: Rule; snippet: string; why: string }[] = [
  {
    file: 'practiceBrowser.ts',
    rule: 'sleep',
    snippet: 'setTimeout(r, delay)',
    why: 'the delayPagesMs fixture: it holds a page module back, it is not a wait',
  },
  {
    file: 'practiceBrowser.ts',
    rule: 'sleep',
    snippet: 'waitForTimeout(50)',
    why: "persistedUntil's interval — the one persistence poller every read of a later write goes through",
  },
  {
    file: 'practiceBrowser.ts',
    rule: 'poller',
    snippet: 'last = read(await readPersistedState(app))',
    why: 'persistedUntil itself: the one persistence poller, bounded, failing with the value it last saw',
  },
  {
    file: 'practiceBrowser.ts',
    rule: 'sleep',
    snippet: 'waitForTimeout(ms)',
    why: 'quietWindow: the one bounded window for a NEGATIVE claim, called only after a positive signal',
  },
  {
    file: 'practice-cues.browser.test.ts',
    rule: 'sleep',
    snippet: 'setTimeout(() => { this.onended && this.onended(); }, 500)',
    why: "page-side fake: the AudioContext stand-in ends its tone on the page's own (faked) clock",
  },
  {
    file: 'journey-harness.browser.test.ts',
    rule: 'sleep',
    snippet: 'waitForTimeout(400)',
    why: 'control arm: the pre-fix reload, kept so every run proves slow storage still loses a write to it',
  },
  {
    file: 'journey-harness.browser.test.ts',
    rule: 'goto',
    snippet: 'page.goto(`${app.origin}#/settings`)',
    why: 'control arm: a bare navigation, to observe the window goTo waits through',
  },
  {
    file: 'daily-practice.browser.test.ts',
    rule: 'negative',
    snippet: "page.getByLabel('Next review date').inputValue()",
    why: 'the date was read (beforeMidnight, previewedBeforeRace) just before; the poll waits for THAT value to move',
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: 'page.url()).not.toMatch(/composer=/)',
    why: 'the URL is asserted to carry composer= just before Clear filters; the poll waits for it to go',
  },
  {
    file: 'journey-harness.browser.test.ts',
    rule: 'negative',
    snippet: "page.locator('main').isVisible()",
    why: 'the main it polls away was asserted on screen (["Lessons"]) just before',
  },
];

const DIR = join(process.cwd(), 'tests');
const SELF = 'journey-waits.test.ts';

/** Blank comments, keeping every offset (and so every line number) where it was. */
function stripComments(text: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/^[ \t]*\/\*[\s\S]*?\*\//gm, blank) // block comments open a line in this code base
    .replace(/(^|[ \t])\/\/[^\n]*/g, (m, lead: string) => lead + blank(m.slice(lead.length)));
}

/** The index just past the bracket that closes the one at `open`. */
function closing(text: string, open: number): number {
  const pair: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
  const stack: string[] = [];
  for (let i = open; i < text.length; i += 1) {
    const c = text[i];
    if (c in pair) stack.push(pair[c]);
    else if (c === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return i + 1;
    }
  }
  return text.length;
}

const SLEEP = /\b(?:waitForTimeout|setTimeout)\s*\(/g;
const LOOP = /\b(?:for\s*\(\s*;\s*;\s*\)|while\s*\(|do\s*\{)/g;
const COUNT = /expect\(\s*await\s+[^;]*?\.count\(\)\s*(?:,[^)]*)?\)\s*\.(not\.)?(toBe|toEqual|toBeGreaterThan|toBeGreaterThanOrEqual)\(\s*(\d+)\s*\)/g;
const STATE =
  /expect\(\s*await\s+[^;]*?\.(?:isVisible|isChecked|isEnabled|isDisabled|isEditable)\(\)\s*(?:,[^)]*)?\)\s*\.(not\.)?(toBe\(\s*(true|false)\s*\)|toBeTruthy\(\))/g;
const POLL = /expect\s*\.poll\s*\(/g;
const GOTO = /\bpage\.goto\(\s*[^)]*#/g;

/** Every offending site in one file's text, ledgered or not. */
export function scan(file: string, raw: string): Site[] {
  const text = stripComments(raw);
  const sites: Site[] = [];
  const at = (index: number, end: number, rule: Rule) =>
    sites.push({ file, rule, line: text.slice(0, index).split('\n').length, text: text.slice(index, end).replace(/\s+/g, ' ').trim() });

  for (const m of text.matchAll(SLEEP)) at(m.index, closing(text, m.index + m[0].length - 1), 'sleep');

  for (const m of text.matchAll(LOOP)) {
    const open = text.indexOf('{', m.index + (m[0].startsWith('do') ? 0 : closing(text, text.indexOf('(', m.index)) - m.index));
    const body = text.slice(open, closing(text, open));
    if (/\bawait\b/.test(body) && /\b(?:waitForTimeout|setTimeout)\s*\(/.test(body)) at(open, closing(text, open), 'poller');
  }

  for (const m of text.matchAll(COUNT)) {
    const [, not, matcher, n] = m;
    const atLeastOne =
      ((matcher === 'toBe' || matcher === 'toEqual') && (not ? Number(n) === 0 : Number(n) >= 1)) ||
      (!not && matcher === 'toBeGreaterThan' && Number(n) >= 0) ||
      (!not && matcher === 'toBeGreaterThanOrEqual' && Number(n) >= 1);
    if (atLeastOne) at(m.index, m.index + m[0].length, 'positive');
  }
  for (const m of text.matchAll(STATE)) {
    const [, not, , bool] = m;
    const claimsTrue = bool === undefined ? !not : (bool === 'true') !== Boolean(not);
    if (claimsTrue) at(m.index, m.index + m[0].length, 'positive');
  }

  for (const m of text.matchAll(POLL)) {
    const argsEnd = closing(text, m.index + m[0].length - 1);
    const chain = /^\s*\.(not\.)?(\w+)\(\s*([^)]*?)\s*\)/.exec(text.slice(argsEnd));
    if (!chain) continue;
    const [, not, matcher, arg] = chain;
    const negative = Boolean(not) || (matcher === 'toBe' && (arg === '0' || arg === 'false')) || (matcher === 'toEqual' && arg === '[]') || matcher === 'toBeFalsy' || (matcher === 'toHaveLength' && arg === '0');
    if (negative) at(m.index, argsEnd + chain[0].length, 'negative');
  }

  if (file !== 'practiceBrowser.ts') for (const m of text.matchAll(GOTO)) at(m.index, closing(text, m.index + 'page.goto'.length), 'goto');

  return sites;
}

const ledgered = (site: Site) => LEDGER.some((e) => e.file === site.file && e.rule === site.rule && site.text.includes(e.snippet));

function scanAll(): Site[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.ts') && f !== SELF)
    .sort()
    .flatMap((f) => scan(f, readFileSync(join(DIR, f), 'utf8')));
}

describe('journey waits', () => {
  it('browser journeys wait on events, never on fixed sleeps, hand-rolled pollers or positive point-in-time reads', () => {
    // The scanner reads something: the harness's own ledgered sites are found.
    const all = scanAll();
    expect(all.filter(ledgered).length).toBeGreaterThan(0);

    // Nothing unledgered, in the real journeys and harness.
    expect(all.filter((s) => !ledgered(s)).map((s) => `${s.file}:${s.line} [${s.rule}] ${s.text}`)).toEqual([]);

    // Every ledger entry still vouches for a real site.
    expect(LEDGER.filter((e) => !all.some((s) => s.file === e.file && s.rule === e.rule && s.text.includes(e.snippet)))).toEqual([]);

    // And each rule rejects its synthetic offender.
    const rules = (snippet: string) => scan('synthetic.browser.test.ts', snippet).map((s) => s.rule);
    // sleep
    expect(rules('await page.waitForTimeout(300);')).toEqual(['sleep']);
    expect(rules('await new Promise((r) => setTimeout(r, 300));')).toEqual(['sleep']);
    // poller (its sleep is a sleep too)
    expect(
      rules(`const until = async (app, read, ok) => {
  for (;;) {
    const v = read(await db(app));
    if (ok(v)) return v;
    await app.page.waitForTimeout(100);
  }
};`).sort(),
    ).toEqual(['poller', 'sleep']);
    // positive point-in-time existence and state
    expect(rules("expect(await page.getByRole('button', { name: 'Finish' }).count()).toBe(1);")).toEqual(['positive']);
    expect(rules('expect(await editButton.count(), where).toBeGreaterThan(0);')).toEqual(['positive']);
    expect(rules('expect(\n  await page.getByText(x).isVisible(),\n).toBe(true);')).toEqual(['positive']);
    expect(rules('expect(await box.isChecked()).not.toBe(false);')).toEqual(['positive']);
    // …while the absent, the polled and the value read stay allowed.
    expect(rules("expect(await page.getByText('Saved.').count(), where).toBe(0);")).toEqual([]);
    expect(rules('expect(await box.isVisible()).toBe(false);')).toEqual([]);
    expect(rules('await expect.poll(() => button.count()).toBe(1);')).toEqual([]);
    expect(rules("expect(await box.inputValue()).toBe('shur');")).toEqual([]);
    // an unledgered polled negative
    expect(rules('await expect.poll(() => choice.count()).toBe(0);')).toEqual(['negative']);
    expect(rules("await expect.poll(() => page.url()).not.toMatch(/q=/);")).toEqual(['negative']);
    // a raw hash navigation
    expect(rules('await page.goto(`${origin}#/items/${id}`);')).toEqual(['goto']);
    // A comment that quotes a sleep is not one.
    expect(rules('// never `await page.waitForTimeout(300)` here')).toEqual([]);
  });
});
