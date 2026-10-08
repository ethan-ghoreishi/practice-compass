import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Browser journeys wait on EVENTS. A fixed sleep, a hand-rolled poller or a
// read of the screen at one instant passes on a fast machine and fails on an
// unlucky runner — in a lane that never touched the journey. This reads every
// test file and the harness and refuses those shapes, so the rule holds by
// construction instead of by review.
//
// It parses each file with TypeScript (syntax only), so a quote, a comment, a
// template or a regex literal is what it is: `'A // B'` is a string and `')'`
// is not a bracket. A timer named inside a string or template (a page script)
// still counts. Six rules, each deny-by-default:
//   sleep     no reference to `waitForTimeout`, `setTimeout` or `setInterval`
//             — a call, a `.bind`, an import, a page script;
//   poller    no `while`, `do` or `for(;;)`-style loop that awaits —
//             `persistedUntil` is the one poller;
//   positive  a rendered-state read with no auto-wait — `count`, `isVisible`,
//             `isHidden`, `isChecked`, `isEnabled`, `isDisabled`, `isEditable`
//             — is asserted only inside `expect.poll`, or by an `expect` that
//             provably claims the thing ABSENT (directly, or as an array
//             element paired with an absent literal). Anything else in an
//             assertion is positive or unjudgeable, and refused;
//   read      the same read OUTSIDE an assertion — a branch, a variable — is
//             refused unless ledgered with what it was read after. A local
//             helper that returns a read makes each of its calls a read;
//   negative  every absence wait — `expect.poll(…)` with `.not`, `toBe(0)`,
//             `toBe(false)`, `toBe(null)`, `toEqual([])`, `toBeFalsy()`,
//             `toBeUndefined()`…, or `waitFor({ state: 'detached' | 'hidden' })`
//             — is ledgered as a disappearance AFTER presence: it passes at
//             once if the thing never arrived, so its test waited for it first;
//   goto      no raw `page.goto` to a hash route outside the harness: `goTo`
//             is the navigation that waits for the destination.
// Geometry (`boundingBox`) and list (`all`, `allInnerTexts`) reads are VALUE
// reads, like `inputValue`: taken after the element was awaited. Deliberately
// out of reach: `for…of`/`for…in` loops (walks over a fixed list, as the
// engine loops are; a timed poller in one still trips `sleep`), a `state:`
// given as a non-literal, and recursion (no helper here calls itself).
//
// A ledger entry names its file, the rule, a snippet of the site (whitespace
// collapsed), how many sites it vouches for (`sites`, default 1) and WHY they
// are allowed. An entry matching any other number of sites fails, so the
// ledger stays exactly as long as the code it vouches for.
// ---------------------------------------------------------------------------

type Rule = 'sleep' | 'poller' | 'positive' | 'read' | 'negative' | 'goto';
export type Site = { file: string; line: number; rule: Rule; text: string };

const LEDGER: { file: string; rule: Rule; snippet: string; sites?: number; why: string }[] = [
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
    sites: 2,
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
  // --- read: a branch or value read, each after the signal it depends on ---
  {
    file: 'practiceBrowser.ts',
    rule: 'read',
    snippet: "await page.getByRole('navigation', { name: 'Primary' }).isVisible()",
    why: 'openSettings: which way to Settings — the tab bar or a focused route — read on a page the caller already reached',
  },
  {
    file: 'practiceBrowser.ts',
    rule: 'read',
    snippet: '(await target.count())',
    why: "goTo's refusal of an arrival the page being left already shows: it can only refuse, never let a navigation pass",
  },
  {
    file: 'daily-practice.browser.test.ts',
    rule: 'read',
    snippet: 'await segmentCount(page)',
    why: "the plan's size as a value, after the polls above saw it rebuilt (30 min, more than one row, its warm-up)",
  },
  {
    file: 'lessonNotes.browser.test.ts',
    rule: 'read',
    snippet: "(await card.getByRole('button', { name: /Class notes/ }).first().isVisible())",
    why: 'whether the awaited card is already open; either way the next line waits for Class notes',
  },
  {
    file: 'practice-cues.browser.test.ts',
    rule: 'read',
    snippet: 'await turnOn.count()',
    why: 'taps the recovery control whenever a failure mode offers it, after Finish showed the practice screen; the claim after it is an upper bound (at most one context)',
  },
  {
    file: 'practice-information.browser.test.ts',
    rule: 'read',
    snippet: 'await show.count()',
    why: "editNotes: whether this screen folds the notes behind Show, on a page its caller already reached; the next line's Edit waits either way",
  },
  {
    file: 'setar-practice.browser.test.ts',
    rule: 'read',
    snippet: 'await manual.count()',
    why: 'after goTo settled Lessons: both arms open Class 99; only how they find it differs',
  },
  {
    file: 'setar-practice.browser.test.ts',
    rule: 'read',
    snippet: 'from this lesson — the item is kept` }).count()',
    why: "after the opened class's own Link existing… arrived: the pair may be linked or not, and a missing Unlink is that answer",
  },
  {
    file: 'setar-practice.browser.test.ts',
    rule: 'read',
    snippet: "await page.getByText('Which instrument is your Setar?').count()",
    why: "after the opened review's own Pathway control arrived: the question is asked only on devices that need it",
  },
  {
    file: 'setarInbound.browser.test.ts',
    rule: 'read',
    snippet: '(await takeRemote.count())',
    why: "after syncNow waited for the sync to finish, so whether it asks is its outcome. Only the unasked arm has been seen (the Edit tap saves nothing, so nothing local changed — the owner's setup gap); the GitHub copy is asserted after either",
  },
  // --- poller: counted loops that ACT each time, never waiting on a state ---
  {
    file: 'musical-term-suggestions.browser.test.ts',
    rule: 'poller',
    snippet: "for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab');",
    why: 'three Tab presses, each asserted: a counted walk, not a wait',
  },
  {
    file: 'practice-cues.browser.test.ts',
    rule: 'poller',
    snippet: 'for (let i = 0; i < 3; i += 1) { const turnOn',
    why: 'three repeated taps — the very thing the claim after it is about',
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'poller',
    snippet: 'for (let n = 0; n < 2; n++)',
    why: 'creates two sources, each awaited to "Saved."',
  },
  {
    file: 'repertoire-viewport.browser.test.ts',
    rule: 'poller',
    snippet: "for (let i = 0; i < 40 && !(reached && ringed); i++) { await page.keyboard.press('Tab');",
    why: 'walks the focus order with Tab, at most 40 stops: each step is a key press, not a wait',
  },
  // --- negative: absences after presence --------------------------------
  {
    file: 'practice-information-inbound.browser.test.ts',
    rule: 'negative',
    snippet: 'expect.poll(() => attachmentText()).toBe(null)',
    sites: 2,
    why: "each follows a read of the attachment's bytes (the good attachment polled; 'legacy' read) before the import that removes them",
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: "expect.poll(() => query().get('q')).toBe(null)",
    sites: 3,
    why: "each follows a poll that saw q=pishdaramad in the URL; the poll waits for THAT to go",
  },
  {
    file: 'review-ownership.browser.test.ts',
    rule: 'negative',
    snippet: '.toBeUndefined()',
    why: "the item's date was read as 2027-01-15 after the reload above; the poll waits for the pull to clear it",
  },
  {
    file: 'practice-cues.browser.test.ts',
    rule: 'negative',
    snippet: "getByRole('button', { name: 'Turn on sound' }).waitFor({ state: 'detached'",
    why: 'the control was awaited, then tapped, just before',
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: "getByText(/Not saved/).first().waitFor({ state: 'detached'",
    why: '"Not saved" was awaited after the failed write, before Try again',
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: "inlineName.waitFor({ state: 'detached'",
    why: 'the inline field was filled and read back before Create',
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: "choice.waitFor({ state: 'detached'",
    sites: 2,
    why: 'each follows a wait for the choice region (and a tap inside it)',
  },
  {
    file: 'musical-term-suggestions.browser.test.ts',
    rule: 'negative',
    snippet: "page.locator('.toast').waitFor({ state: 'detached'",
    why: 'layoutFacts: no overlay may be measured as layout — no toast at all is the state it wants, so passing at once is right',
  },
  {
    file: 'setar-practice.browser.test.ts',
    rule: 'negative',
    snippet: "page.locator('.toast').waitFor({ state: 'detached'",
    why: 'layoutFacts: no overlay may be measured as layout — no toast at all is the state it wants, so passing at once is right',
  },
];

const DIR = join(process.cwd(), 'tests');
const SELF = 'journey-waits.test.ts';
const HARNESS = 'practiceBrowser.ts';

/** A rendered-state read with no auto-wait, and what it returns when the thing is ABSENT. */
const READS: Record<string, unknown> = {
  count: 0,
  isVisible: false,
  isHidden: true,
  isChecked: false,
  isEnabled: false,
  isDisabled: false,
  isEditable: false,
};
const SLEEP = /\b(?:waitForTimeout|setTimeout|setInterval)\b/g;
const EQUALS = new Set(['toBe', 'toEqual', 'toStrictEqual']);
const NOT_LITERAL = Symbol('not a literal');

/** A literal's value — `true`, `0`, `[false, 0]` — or NOT_LITERAL for anything the scan cannot judge. */
function literal(e: ts.Expression | undefined): unknown {
  if (!e) return NOT_LITERAL;
  if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (e.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isNumericLiteral(e)) return Number(e.text);
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  if (ts.isArrayLiteralExpression(e)) return e.elements.map(literal);
  return NOT_LITERAL;
}

const isExpect = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'expect';
const isPoll = (n: ts.Node): n is ts.CallExpression =>
  ts.isCallExpression(n) &&
  ts.isPropertyAccessExpression(n.expression) &&
  n.expression.name.text === 'poll' &&
  ts.isIdentifier(n.expression.expression) &&
  n.expression.expression.text === 'expect';

/** The matcher an `expect(…)`/`expect.poll(…)` call is chained into: `.not?.name(args)`. */
function matcherOf(subject: ts.CallExpression): { not: boolean; name: string; args: readonly ts.Expression[]; call: ts.CallExpression } | null {
  let node: ts.Node = subject;
  let not = false;
  let access = node.parent;
  if (ts.isPropertyAccessExpression(access) && access.expression === node && access.name.text === 'not') {
    not = true;
    node = access;
    access = access.parent;
  }
  if (!ts.isPropertyAccessExpression(access) || access.expression !== node) return null;
  const call = access.parent;
  if (!ts.isCallExpression(call) || call.expression !== access) return null;
  return { not, name: access.name.text, args: call.arguments, call };
}

/** Climb out of `await`, parentheses, `!` and `as` — the read's value is still the read. */
function valueOf(node: ts.Node): ts.Node {
  let n = node;
  while (ts.isAwaitExpression(n.parent) || ts.isParenthesizedExpression(n.parent) || ts.isNonNullExpression(n.parent) || ts.isAsExpression(n.parent)) n = n.parent;
  return n;
}

/** The name a function is called by in this file, unless it is exported (its callers are elsewhere). */
function localName(fn: ts.Node | undefined): string | null {
  if (fn && ts.isFunctionDeclaration(fn)) return fn.name && !fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? fn.name.text : null;
  if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name)) {
    const statement = fn.parent.parent.parent;
    return ts.isVariableStatement(statement) && statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ? null : fn.parent.name.text;
  }
  return null;
}

/** The index just past the parenthesis that closes the call opening at or after `from` — for page-script text only. */
function callEnd(text: string, from: number): number {
  const open = /^\s*\(/.exec(text.slice(from));
  if (!open) return from;
  let depth = 0;
  for (let i = from + open[0].length - 1; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')' && --depth === 0) return i + 1;
  }
  return text.length;
}

/** Every offending site in one file's text, ledgered or not. */
export function scan(file: string, raw: string): Site[] {
  const sf = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const sites: Site[] = [];
  const at = (node: ts.Node, rule: Rule, text = node.getText(sf), pos = node.getStart(sf)) =>
    sites.push({ file, rule, line: sf.getLineAndCharacterOfPosition(pos).line + 1, text: text.replace(/\s+/g, ' ').trim() });
  const calls: ts.CallExpression[] = [];

  const visit = (node: ts.Node): void => {
    // sleep: any REFERENCE to a timer (a call, `.bind`, an import) …
    if (ts.isIdentifier(node) && /^(?:waitForTimeout|setTimeout|setInterval)$/.test(node.text)) {
      const ref = ts.isPropertyAccessExpression(node.parent) && node.parent.name === node ? node.parent : node;
      at(ts.isCallExpression(ref.parent) && ref.parent.expression === ref ? ref.parent : ref.parent, 'sleep');
    }
    // … or a timer named inside a string or template: a page script, `page['waitForTimeout']`.
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      const text = node.getText(sf);
      for (const m of text.matchAll(SLEEP)) at(node, 'sleep', text.slice(m.index, callEnd(text, m.index + m[0].length)), node.getStart(sf) + m.index);
    }
    // poller: a loop that awaits — `persistedUntil` is the one.
    if ((ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isForStatement(node)) && hasAwait(node)) at(node, 'poller');
    // negative: a wait for something to be GONE passes at once if it never came.
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(sf) === 'state' &&
      ts.isStringLiteral(node.initializer) &&
      (node.initializer.text === 'detached' || node.initializer.text === 'hidden')
    ) {
      let call: ts.Node = node;
      while (!ts.isCallExpression(call) && !ts.isSourceFile(call)) call = call.parent;
      at(call, 'negative');
    }
    if (ts.isCallExpression(node)) calls.push(node);
    ts.forEachChild(node, visit);
  };
  const hasAwait = (node: ts.Node): boolean => ts.isAwaitExpression(node) || (ts.isForOfStatement(node) && !!node.awaitModifier) || ts.forEachChild(node, hasAwait) === true;
  visit(sf);

  for (const call of calls) {
    // goto: a raw hash navigation outside the harness.
    if (file !== HARNESS && ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'goto' && call.arguments.some((a) => a.getText(sf).includes('#')))
      at(call, 'goto');
    // negative: a polled absence.
    if (isPoll(call)) {
      const m = matcherOf(call);
      if (!m) continue;
      const v = literal(m.args[0]);
      const negative =
        m.not ||
        ['toBeFalsy', 'toBeNull', 'toBeUndefined'].includes(m.name) ||
        (EQUALS.has(m.name) && (v === 0 || v === false || v === null || (Array.isArray(v) && v.length === 0))) ||
        (m.name === 'toHaveLength' && v === 0);
      if (negative) at(m.call, 'negative');
    }
  }

  // positive / read: a rendered-state read is allowed only inside `expect.poll`,
  // or as an `expect` claiming the thing ABSENT. A local helper that returns a
  // read makes each of ITS calls a read.
  const helpers = new Map<string, string>();
  const methodOf = (c: ts.CallExpression): string | undefined =>
    ts.isPropertyAccessExpression(c.expression) && c.arguments.length === 0 && Object.hasOwn(READS, c.expression.name.text)
      ? c.expression.name.text
      : ts.isIdentifier(c.expression)
        ? helpers.get(c.expression.text)
        : undefined;
  const judged = new Set<ts.CallExpression>();
  for (let grew = true; grew; ) {
    grew = false;
    for (const c of calls) {
      const method = methodOf(c);
      if (!method || judged.has(c)) continue;
      judged.add(c);
      let a: ts.Node = c.parent;
      while (!ts.isSourceFile(a) && !isPoll(a)) a = a.parent;
      if (isPoll(a)) continue;
      const absent = READS[method];
      const value = valueOf(c);
      const holder = value.parent;
      const assertion = isExpect(holder) && holder.arguments[0] === value ? holder : ts.isArrayLiteralExpression(holder) && isExpect(holder.parent) && holder.parent.arguments[0] === holder ? holder.parent : null;
      if (assertion) {
        const m = matcherOf(assertion);
        const v = literal(m?.args[0]);
        const claimed = assertion === holder ? v : Array.isArray(v) && v.length === (holder as ts.ArrayLiteralExpression).elements.length ? v[(holder as ts.ArrayLiteralExpression).elements.indexOf(value as ts.Expression)] : NOT_LITERAL;
        const claimsAbsent =
          !!m &&
          ((EQUALS.has(m.name) && (m.not ? typeof absent === 'boolean' && claimed === !absent : claimed === absent)) ||
            (!m.not && m.name === (absent === true ? 'toBeTruthy' : 'toBeFalsy') && assertion === holder));
        if (!claimsAbsent) at(m?.call ?? assertion, 'positive');
        continue;
      }
      let inside: ts.Node = holder;
      while (!ts.isSourceFile(inside) && !isExpect(inside) && !ts.isFunctionLike(inside)) inside = inside.parent;
      if (isExpect(inside)) {
        at(matcherOf(inside)?.call ?? inside, 'positive'); // a read the scan cannot judge, inside an assertion
        continue;
      }
      const fn = ts.isReturnStatement(holder) ? ts.findAncestor(holder, ts.isFunctionLike) : ts.isArrowFunction(holder) && holder.body === value ? holder : undefined;
      const name = localName(fn);
      if (name) {
        if (!helpers.has(name)) grew = true;
        helpers.set(name, method);
        continue;
      }
      at(value, 'read');
    }
  }
  return sites.sort((x, y) => x.line - y.line);
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

    // Every ledger entry vouches for exactly as many real sites as it says.
    const vouched = (e: (typeof LEDGER)[number]) => all.filter((s) => s.file === e.file && s.rule === e.rule && s.text.includes(e.snippet)).length;
    expect(LEDGER.filter((e) => vouched(e) !== (e.sites ?? 1)).map((e) => `${e.file} [${e.rule}] ${e.snippet}: ${vouched(e)} sites`)).toEqual([]);

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

    // QUOTED SYNTAX is what it is: a `//`, `/*` or `)` inside a string, a
    // template or a regex literal neither hides code nor ends a call.
    expect(rules("expect(await page.getByText('A // B').count()).toBe(1);")).toEqual(['positive']);
    expect(rules("await page.getByText('A // B').click(); await page.waitForTimeout(300);")).toEqual(['sleep']);
    expect(rules("await expect.poll(() => page.getByText(')').count()).toBe(0);")).toEqual(['negative']);
    expect(rules('await page.getByText(`a ) ${x} // b`).click(); await page.waitForTimeout(300);')).toEqual(['sleep']);
    expect(rules("await page.getByRole('button', { name: /\\(/ }).click(); expect(await page.getByText('x').count()).toBe(1);")).toEqual(['positive']);
    expect(rules("await x.click(); /* ) */ expect(await y.isVisible()).toBe(true);")).toEqual(['positive']);
    // A timer by any other route: a page script, a bound method, a computed name, a renamed import.
    expect(rules('await page.addInitScript(`setTimeout(() => go(), 100)`);')).toEqual(['sleep']);
    expect(rules('const wait = page.waitForTimeout.bind(page);')).toEqual(['sleep']);
    expect(rules("await page['waitForTimeout'](300);")).toEqual(['sleep']);
    expect(rules("import { setTimeout as sleep } from 'node:timers/promises';")).toEqual(['sleep']);
    // A loop that awaits is a poller even with no sleep in it.
    expect(rules('while (Date.now() < end) { if (await ok()) break; }')).toEqual(['poller']);
    // COMPOUND assertions: each read is judged against its own expected element.
    expect(rules("expect([await name.inputValue(), await name.isEnabled()]).toEqual(['', true]);")).toEqual(['positive']);
    expect(rules('expect([await a.isChecked(), await b.isChecked()], where).toEqual([true, true]);')).toEqual(['positive', 'positive']);
    expect(rules('expect([await a.isChecked(), await b.count()]).toEqual([false, 0]);')).toEqual([]);
    expect(rules('expect([await a.isChecked()]).toEqual(EXPECTED);')).toEqual(['positive']);
    expect(rules('expect({ on: await a.isChecked() }).toEqual({ on: false });')).toEqual(['positive']);
    expect(rules('expect((await rows.count()) > 0).toBe(true);')).toEqual(['positive']);
    expect(rules('await expect.poll(() => Promise.all([a.isChecked(), b.isChecked()])).toEqual([true, true]);')).toEqual([]);
    // isHidden is a read too, with its sense inverted.
    expect(rules('expect(await x.isHidden()).toBe(false);')).toEqual(['positive']);
    expect(rules('expect(await x.isHidden()).toBe(true);')).toEqual([]);
    // A method that merely shares Object's prototype is not a read.
    expect(rules("expect(await x.toString()).toBe('a');")).toEqual([]);
    // INDIRECT reads: through a local helper, a variable, a branch.
    const helper = 'async function rows(page) {\n  return page.getByRole("row").count();\n}\n';
    expect(rules(`${helper}expect(await rows(page)).toBeGreaterThan(1);`)).toEqual(['positive']);
    expect(rules(`${helper}await expect.poll(() => rows(page)).toBeGreaterThan(1);`)).toEqual([]);
    expect(rules('const n = await rows.count();\nexpect(n).toBe(1);')).toEqual(['read']);
    expect(rules('if (await more.isVisible()) await more.click();')).toEqual(['read']);
    // An absence by waitFor is a negative wait like any other.
    expect(rules("await toast.waitFor({ state: 'detached' });")).toEqual(['negative']);
    expect(rules("await toast.waitFor({ state: 'hidden', timeout: 5_000 });")).toEqual(['negative']);
    expect(rules("await row.waitFor({ state: 'attached' });")).toEqual([]);
    expect(rules('await expect.poll(() => q()).toBe(null);')).toEqual(['negative']);
  });
});
