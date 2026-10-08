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
//             — a call, a `.bind`, an import, a page script, a folded key —
//             and no wait
//             (`waitFor…`, an assertion) whose failure a `.catch` swallows:
//             when the thing never comes, that is a timer;
//   poller    no `while`, `do` or `for(;;)`-style loop that awaits —
//             `persistedUntil` is the one poller;
//   positive  a rendered-state READ with no auto-wait — `count`, `isVisible`,
//             `isHidden`, `isChecked`, `isEnabled`, `isDisabled`, `isEditable`,
//             by any spelling (arguments, `x['count']`, `?.`, `.call`), or a
//             local helper — is asserted at one instant only by an `expect`
//             that PASSES WHEN THE THING IS ABSENT. One evaluation decides it:
//             each read takes its absent value (0, false; `isHidden` true),
//             through `.not`, `.resolves`, `!`, `Promise.all`, a `.catch`
//             falling back to that same value, and arrays judged element by
//             element. It refuses what it cannot reduce (a computed name, a
//             variable, a comparison, an object), a read it did not carry to
//             the value (one held in a variable), and a read mixed with a
//             value (`[await a.count(), url]`);
//   read      the same read OUTSIDE an assertion — a branch, a variable, a
//             read method or helper named without a call (passed, aliased,
//             bound, destructured in a declaration, parameter, catch, `=` or
//             `for…of`) — is refused unless ledgered with what it
//             was read after. A HELPER is a local function with a read in what
//             it returns; it means what its ONE return evaluates to, and only
//             when that return is the body's last statement: a second return,
//             a bare `return;`, an end of body it can reach, a generator, or a
//             return the evaluation cannot reduce leaves every call unjudged
//             (inline callbacks and `.catch` fallbacks alike);
//   negative  every poll not PROVEN unable to pass on what never came is
//             ledgered with why it cannot: it follows a wait that SAW the thing
//             (a disappearance after presence), or it is a presence the table
//             below cannot see (a variable, template or boolean expectation, a
//             read mixed with a value). A poll
//             of reads waits for presence when the same evaluation fails at
//             every read's absent value, element by element (`[true, false]`
//             still waits on nothing for its second half). A poll of a value
//             (no read in it) may hold ANY value, an empty one included, so
//             only a closed table proves it cannot pass on an empty value:
//             `toBe`/`toEqual` of a literal whose every leaf is a non-empty
//             string or a POSITIVE number (no boolean, 0, -1), `toContain` of a
//             non-empty string, `toMatch` of a regex of plain-text alternatives
//             (no anchor, class, group, quantifier or `\D`-style escape, whose
//             sense may be absence; at most the `i` flag),
//             `toBeGreaterThan(n >= 0)`, `toBeGreaterThanOrEqual(n > 0)`,
//             `toHaveLength(n > 0)`. Everything else is negative: `.not`, no
//             matcher, a variable, an unknown matcher, a boolean (its sense —
//             `!t.includes(x)` — is invisible). So is any `waitFor…` with
//             `state: 'detached' | 'hidden'`, a state it cannot read (a
//             variable, an expression, a getter), or options it cannot read;
//   goto      no raw `page.goto` to a hash route outside the harness: `goTo`
//             is the navigation that waits for the destination.
// `expect`, `expect.soft`, `.poll` and every matcher are matched by name in
// any spelling (`expect['poll']`, `['not']`). Every NAME — a read, a matcher,
// a destructured key, `state`, an expected object's key — is read by one
// function, `keyOf`: its static value however spelled (`'a'`, `` `a` ``, `1`,
// `['is' + 'A']`, `` [`is${'A'}`] ``); a key it cannot fold may be any name,
// so it is unsafe wherever a name decides (refused in an assertion, a read
// when destructured, a negative in waitFor options, unjudged in an expected
// object). Geometry (`boundingBox`) and
// list (`all`, `allInnerTexts`) reads are VALUE reads, like `inputValue`:
// taken after the element was awaited. Deliberately out of reach: `for…of`/
// `for…in` loops (walks over a fixed list, as the engine loops are; a timed
// poller in one still trips `sleep`), a computed call OUTSIDE an assertion
// (`x[k]()` may be anything; inside one it is refused), a computed member
// named without a call (`x[k]` is indexing, everywhere and indistinguishable
// from a read method, where destructuring a locator is not), a name passed as
// an argument (`Reflect.get(x, 'count')`), an aliased `expect`,
// a helper exported to another file in any spelling (`export function`,
// `export { rows }`, `export default rows`: its read is judged where it
// stands, as there is no caller here to judge), and Playwright's own
// web-first matchers (`toBeHidden`…), which these tests cannot reach: they
// import Vitest's `expect`; and a value COMPUTED to encode absence (a fallback string, a count
// of what is missing) — the table proves a poll cannot pass on an empty or
// sentinel value, not that the value means presence. Two helpers sharing a
// name, and a helper reached again while it is being evaluated, are judged
// unknown; so is `!` on a read that is not awaited.
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
  // --- negative: presence waits the table cannot prove, each with what makes it one ---
  {
    file: 'daily-practice.browser.test.ts',
    rule: 'negative',
    snippet: 't.includes(`1 of ${planned} done`)',
    why: 'a boolean of "main contains the progress line": true only once that text is on screen; the expectation is a template, so the table cannot see it is non-empty',
  },
  {
    file: 'daily-practice.browser.test.ts',
    rule: 'negative',
    snippet: 't.includes(itemTitle)',
    why: "a boolean of \"main contains the item's title\", read from storage just above (itemTitleOf), so non-empty: true only once the row is on screen",
  },
  {
    file: 'practice-information-inbound.browser.test.ts',
    rule: 'negative',
    snippet: 'toBe(goodAttachment)',
    why: "goodAttachment is the non-empty text this test wrote into the attachment; the poll waits for those bytes to be readable",
  },
  {
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: "freshName.isEnabled()]).toEqual(['', true])",
    why: "the isEnabled half waits for the fresh session's field to be there and editable; its '' is that field's own value, which Done must leave empty (the finished session's name was 'چهارپاره')",
  },
  {
    file: 'repertoire-inbound.browser.test.ts',
    rule: 'negative',
    snippet: 'c.says.test(await syncMessage(page))',
    why: "a boolean of \"the sync message names this malformation\" (c.says, each a non-empty pattern): true only once the refusal is on screen",
  },
  {
    file: 'review-ownership.browser.test.ts',
    rule: 'negative',
    snippet: 'toBeGreaterThan(pushesAtConnect)',
    why: 'pushesAtConnect is the push count before the reload; the poll waits for one MORE commit to land',
  },
  {
    file: 'setar-practice-inbound.browser.test.ts',
    rule: 'negative',
    snippet: 'provenance(await db(app)).every(([, s]) => s === ABSENT)',
    why: "a disappearance: the poll just above saw piece 1's declared study source; this waits for the legacy index to clear it",
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
  {
    file: 'repertoire-families.test.ts',
    rule: 'read',
    snippet: 'exp.count',
    why: "a plain number in the test's own expectation table, not a Locator: no page is read",
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
    file: 'repertoire-experience.browser.test.ts',
    rule: 'negative',
    snippet: "expect.poll(() => search().inputValue()).toBe('')",
    sites: 2,
    why: "each follows a read or poll that saw 'pishdaramad' in the box; the poll waits for THAT to empty",
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
/** Plain non-empty text: no anchor, class, group, quantifier or letter escape, any of which may give a regex the sense of absence. */
const PLAIN_TEXT = String.raw`(?:[^\\^$.|?*+()[\]{}/]|\\[^A-Za-z0-9])+`;
/** A regex literal of plain-text alternatives, at most the `i` flag: it matches only where one of them IS — `toContain` by another name. */
const PLAIN_REGEX = new RegExp(String.raw`^/${PLAIN_TEXT}(?:\|${PLAIN_TEXT})*/i?$`);
const SLEEP = /\b(?:waitForTimeout|setTimeout|setInterval)\b/g;
const TIMER = /^(?:waitForTimeout|setTimeout|setInterval)$/;
/** What the scan cannot judge: a computed name, an ambiguous helper, a shape it does not reduce. */
const UNKNOWN = Symbol('unknown');
/** A value with no read in it — a URL, a field's text, stored data: it may be ANYTHING, an empty one included. */
const OPAQUE = Symbol('opaque');
type Verdict = boolean | typeof UNKNOWN;
type Fn = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;

/** Through parentheses, `await`, `!.` and `as` — the value is still the value. */
function bare(e: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(e) || ts.isAwaitExpression(e) || ts.isNonNullExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e)) e = e.expression;
  return e;
}

/** A literal's value — `true`, `0`, `[false, 0]`, `{ a: 'x' }`, `'hidden' as const` — or UNKNOWN. */
function literal(node: ts.Expression | undefined): unknown {
  if (!node) return UNKNOWN;
  const e = bare(node);
  if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (e.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(e) && e.text === 'undefined') return undefined;
  if (ts.isNumericLiteral(e)) return Number(e.text);
  if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return -Number(e.operand.text);
  if (ts.isStringLiteralLike(e)) return e.text;
  if (ts.isArrayLiteralExpression(e)) return e.elements.map(literal);
  if (ts.isObjectLiteralExpression(e)) {
    const o: Record<string, unknown> = {};
    for (const p of e.properties) {
      const key = ts.isPropertyAssignment(p) ? keyOf(p.name) : UNKNOWN;
      if (key === UNKNOWN) return UNKNOWN;
      o[key] = literal((p as ts.PropertyAssignment).initializer);
    }
    return o;
  }
  return UNKNOWN;
}
const unjudgeable = (v: unknown): boolean => v === UNKNOWN || v === OPAQUE || (typeof v === 'object' && v !== null && Object.values(v).some(unjudgeable));
const hasOpaque = (v: unknown): boolean => v === OPAQUE || (Array.isArray(v) && v.some(hasOpaque));
/** Every leaf THERE: no 0 or negative sentinel (`indexOf`'s -1), '', boolean, null, undefined, empty list or empty object anywhere inside. */
const full = (v: unknown): boolean =>
  typeof v === 'number' ? v > 0 : typeof v === 'string' ? v !== '' : typeof v === 'object' && v !== null && Object.values(v).length > 0 && Object.values(v).every(full);

/** A computed key's static value — a string, template or number, `+` and `${}` folded as JS does — or UNKNOWN. */
function constant(node: ts.Expression): string | number | typeof UNKNOWN {
  const e = bare(node);
  if (ts.isStringLiteralLike(e)) return e.text;
  if (ts.isNumericLiteral(e)) return Number(e.text);
  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const [a, b] = [constant(e.left), constant(e.right)];
    return a === UNKNOWN || b === UNKNOWN ? UNKNOWN : (a as string) + (b as string);
  }
  if (ts.isTemplateExpression(e)) {
    let s = e.head.text;
    for (const span of e.templateSpans) {
      const v = constant(span.expression);
      if (v === UNKNOWN) return UNKNOWN;
      s += String(v) + span.literal.text;
    }
    return s;
  }
  return UNKNOWN;
}
const text = (v: string | number | typeof UNKNOWN) => (v === UNKNOWN ? v : String(v));
/** THE one reading of a property name — `a`, `'a'`, `1`, `['a']`, `` [`a`] ``, `['is' + 'A']` — UNKNOWN for a key it cannot fold. */
function keyOf(name: ts.PropertyName): string | typeof UNKNOWN {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  return text(constant(ts.isComputedPropertyName(name) ? name.expression : name));
}

/** The member an access names — `x.a`, `x?.a`, `x['a']`, `` x[`a`] `` — UNKNOWN for a key `keyOf` cannot fold. */
function member(node: ts.Expression): { of: ts.Expression; name: string | typeof UNKNOWN } | undefined {
  const e = bare(node);
  if (ts.isPropertyAccessExpression(e)) return { of: e.expression, name: e.name.text };
  if (ts.isElementAccessExpression(e)) return { of: e.expression, name: text(constant(e.argumentExpression)) };
  return undefined;
}
const named = (e: ts.Expression, name: string) => member(e)?.name === name;
/** `Promise.all([…])` — the array it resolves, or undefined. */
const promiseAll = (e: ts.Expression): ts.Expression | undefined => {
  const m = ts.isCallExpression(e) ? member(e.expression) : undefined;
  const of = m && bare(m.of);
  return m?.name === 'all' && of && ts.isIdentifier(of) && of.text === 'Promise' && (e as ts.CallExpression).arguments.length === 1 ? (e as ts.CallExpression).arguments[0] : undefined;
};

/** `expect` or `expect.soft`, by any spelling. */
const isExpectFn = (node: ts.Expression): boolean => {
  const e = bare(node);
  return (ts.isIdentifier(e) && e.text === 'expect') || (named(e, 'soft') && isExpectFn(member(e)!.of));
};
const isExpect = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n) && isExpectFn(n.expression);
const isPoll = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n) && named(n.expression, 'poll') && isExpectFn(member(n.expression)!.of);

type Matcher = { not: boolean; rejects: boolean; name: string; args: readonly ts.Expression[]; call: ts.CallExpression };
/** The matcher an `expect(…)`/`expect.poll(…)` call is chained into, through `.not`, `.resolves`, `.rejects`, by any spelling. */
function matcherOf(subject: ts.CallExpression): Matcher | null {
  let node: ts.Node = subject;
  let not = false;
  let rejects = false;
  for (;;) {
    while (ts.isParenthesizedExpression(node.parent)) node = node.parent;
    const access = node.parent;
    if (!(ts.isPropertyAccessExpression(access) || ts.isElementAccessExpression(access)) || access.expression !== node) return null;
    const name = member(access)!.name;
    if (name === UNKNOWN) return null;
    if (name === 'not') not = !not;
    else if (name === 'rejects') rejects = true;
    else if (name !== 'resolves') {
      const call = access.parent;
      return ts.isCallExpression(call) && call.expression === access ? { not, rejects, name, args: call.arguments, call } : null;
    }
    node = access;
  }
}

/** Does a matcher pass on `actual`? UNKNOWN when either side, or the matcher, cannot be judged. */
function passes(m: Matcher | null, actual: unknown, want: unknown = literal(m?.args[0])): Verdict {
  if (!m || m.rejects || unjudgeable(actual)) return UNKNOWN;
  const num = typeof actual === 'number' && typeof want === 'number';
  const verdicts: Record<string, () => Verdict> = {
    toBe: () => (unjudgeable(want) ? UNKNOWN : !Array.isArray(actual) && Object.is(actual, want)),
    toEqual: () => (unjudgeable(want) ? UNKNOWN : JSON.stringify(actual) === JSON.stringify(want)),
    toBeTruthy: () => !!actual,
    toBeFalsy: () => !actual,
    toBeNull: () => actual === null,
    toBeUndefined: () => actual === undefined,
    toBeDefined: () => actual !== undefined,
    toBeGreaterThan: () => (num ? (actual as number) > (want as number) : UNKNOWN),
    toBeGreaterThanOrEqual: () => (num ? (actual as number) >= (want as number) : UNKNOWN),
    toBeLessThan: () => (num ? (actual as number) < (want as number) : UNKNOWN),
    toBeLessThanOrEqual: () => (num ? (actual as number) <= (want as number) : UNKNOWN),
    toHaveLength: () => (Array.isArray(actual) && typeof want === 'number' ? actual.length === want : UNKNOWN),
  };
  verdicts.toStrictEqual = verdicts.toEqual;
  const v = Object.hasOwn(verdicts, m.name) ? verdicts[m.name]() : UNKNOWN;
  return v === UNKNOWN ? v : v !== m.not;
}

/**
 * Does a poll of a VALUE (no read in it) wait for something to be there? It
 * may hold any value, so only this closed table says yes: the matcher fails
 * on every empty value however nested, and never rests on a boolean, whose
 * sense (`!t.includes(x)`) the scan cannot see.
 */
function provesPresence(m: Matcher): boolean {
  const want = literal(m.args[0]);
  const arg = m.args[0] && bare(m.args[0]);
  if (m.args.length !== 1) return false;
  switch (m.name) {
    case 'toBe':
    case 'toEqual':
    case 'toStrictEqual':
      return full(want);
    case 'toContain':
      return typeof want === 'string' && want !== '';
    case 'toMatch':
      return !!arg && ts.isRegularExpressionLiteral(arg) && PLAIN_REGEX.test(arg.text);
    case 'toBeGreaterThan':
      return typeof want === 'number' && want >= 0;
    case 'toBeGreaterThanOrEqual':
    case 'toHaveLength':
      return typeof want === 'number' && want > 0;
    default:
      return false;
  }
}

/** Does an `expect.poll` wait for something to be THERE, so it cannot pass on what never came? */
function waitsForPresence(value: unknown, m: Matcher | null): boolean {
  if (!m || m.not || m.rejects) return false;
  if (value === OPAQUE) return provesPresence(m);
  if (unjudgeable(value)) return false;
  // Read-derived, so exact: it must FAIL at the absent value, element by element when an array is compared whole.
  const want = literal(m.args[0]);
  if (Array.isArray(value) && (m.name === 'toEqual' || m.name === 'toStrictEqual') && Array.isArray(want) && want.length === value.length)
    return value.every((v, i) => passes(m, v, want[i]) === false);
  return passes(m, value) === false;
}

/**
 * The expression a function returns: its body, or its ONE `return` when that
 * is the body's last statement — undefined (so UNKNOWN) for any other shape:
 * a second `return`, a bare `return;`, an end of body it can reach, a generator.
 */
function returned(fn: Fn): ts.Expression | undefined {
  if (!fn.body || fn.asteriskToken) return undefined;
  if (!ts.isBlock(fn.body)) return fn.body;
  const returns = returnStatements(fn.body);
  return returns.length === 1 && returns[0] === fn.body.statements.at(-1) ? returns[0].expression : undefined;
}
/** Every `return` in a body, bare ones included, not counting functions nested in it. */
function returnStatements(body: ts.Node): ts.ReturnStatement[] {
  const out: ts.ReturnStatement[] = [];
  const find = (n: ts.Node): void => {
    if (ts.isReturnStatement(n)) out.push(n);
    else if (!ts.isFunctionLike(n)) ts.forEachChild(n, find);
  };
  ts.forEachChild(body, find);
  return out;
}
/** Every expression a function can return. */
const returnsOf = (fn: Fn): ts.Expression[] =>
  !fn.body ? [] : !ts.isBlock(fn.body) ? [fn.body] : returnStatements(fn.body).flatMap((r) => (r.expression ? [r.expression] : []));

/** Climb out of `await`, parentheses, `!` and `as` — the read's value is still the read. */
function valueOf(node: ts.Node): ts.Node {
  let n = node;
  while (ts.isAwaitExpression(n.parent) || ts.isParenthesizedExpression(n.parent) || ts.isNonNullExpression(n.parent) || ts.isAsExpression(n.parent)) n = n.parent;
  return n;
}

const exported = (n: ts.Node | undefined) => !!n && ts.canHaveModifiers(n) && !!ts.getModifiers(n)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
/** The name a function is called by in this file, unless it is exported (its callers are elsewhere). */
function localName(fn: ts.Node): string | null {
  if (ts.isFunctionDeclaration(fn)) return fn.name && !exported(fn) ? fn.name.text : null;
  if ((ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && ts.isVariableDeclaration(fn.parent) && fn.parent.initializer === fn && ts.isIdentifier(fn.parent.name))
    return exported(fn.parent.parent.parent) ? null : fn.parent.name.text;
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
  const identifiers: ts.Identifier[] = [];
  /** Local (unexported) functions by the name they are called by. */
  const fns = new Map<string, Fn[]>();
  const isRead = (name: string | typeof UNKNOWN | undefined) => typeof name === 'string' && Object.hasOwn(READS, name);
  /** Read methods named without a call (`Reflect.apply(x.count, …)`, `const { count } = x`). */
  const refs: ts.Node[] = [];
  /** Is this object literal (or one nested in it) the target of a destructuring `=` or `for (… of/in …)`? */
  const assignedTo = (literal: ts.Node): boolean => {
    for (let n = literal; ts.isObjectLiteralExpression(n) || ts.isArrayLiteralExpression(n) || ts.isPropertyAssignment(n) || ts.isParenthesizedExpression(n); n = n.parent) {
      if (ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && n.parent.left === n) return true;
      if ((ts.isForOfStatement(n.parent) || ts.isForInStatement(n.parent)) && n.parent.initializer === n) return true;
    }
    return false;
  };
  /** Is this access the callee of a call — directly, or through `.call`/`.apply`, which `readOf` judges as the read? */
  const called = (access: ts.Expression): boolean => {
    let n: ts.Node = access;
    while (ts.isParenthesizedExpression(n.parent) || ts.isNonNullExpression(n.parent) || ts.isAsExpression(n.parent)) n = n.parent;
    const p = n.parent;
    if (ts.isCallExpression(p) && p.expression === n) return true;
    const via = (ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) && p.expression === n ? member(p)!.name : undefined;
    return (via === 'call' || via === 'apply') && ts.isCallExpression(p.parent) && p.parent.expression === p;
  };

  const visit = (node: ts.Node): void => {
    // sleep: any REFERENCE to a timer (a call, `.bind`, an import) …
    if (ts.isIdentifier(node) && TIMER.test(node.text)) {
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
    // … or a computed key folded from pieces no one string holds (`page['wait' + 'ForTimeout']`).
    const folded = ts.isElementAccessExpression(node) ? node.argumentExpression : ts.isComputedPropertyName(node) ? node.expression : undefined;
    const timer = folded && !ts.isStringLiteralLike(bare(folded)) ? text(constant(folded)) : UNKNOWN;
    if (typeof timer === 'string' && TIMER.test(timer)) at(node.parent, 'sleep');
    // negative: a wait for something to be GONE passes at once if it never came —
    // `state: 'detached' | 'hidden'` however spelled, or a `waitFor…` state the scan cannot read (a getter's included).
    if (ts.isObjectLiteralElementLike(node) && node.name && keyOf(node.name) === 'state') {
      const state = ts.isPropertyAssignment(node) ? literal(node.initializer) : UNKNOWN;
      const call = ts.findAncestor(node, ts.isCallExpression);
      const waitName = call && member(call.expression)?.name;
      if (state === 'detached' || state === 'hidden' || (typeof state !== 'string' && typeof waitName === 'string' && waitName.startsWith('waitFor')))
        at(call ?? node, 'negative');
    }
    // read: a read method named without being called — passed, aliased, bound, destructured — is a read nobody judges.
    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && isRead(member(node)!.name) && !called(node)) refs.push(node);
    // A destructured key the scan cannot fold may be any method: a read too.
    const key =
      ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)
        ? keyOf(node.propertyName ?? (node.name as ts.Identifier))
        : (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) && assignedTo(node.parent)
          ? keyOf(node.name)
          : undefined;
    if (key === UNKNOWN || isRead(key)) refs.push(node);
    if (ts.isCallExpression(node)) calls.push(node);
    if (ts.isIdentifier(node)) identifiers.push(node);
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      const name = localName(node);
      if (name) fns.set(name, [...(fns.get(name) ?? []), node]);
    }
    ts.forEachChild(node, visit);
  };
  const hasAwait = (node: ts.Node): boolean => ts.isAwaitExpression(node) || (ts.isForOfStatement(node) && !!node.awaitModifier) || ts.forEachChild(node, hasAwait) === true;
  visit(sf);
  // A function exported by name (`export { rows }`, `export default rows`) has callers elsewhere: no local helper.
  for (const s of sf.statements) {
    if (ts.isExportDeclaration(s) && !s.moduleSpecifier && s.exportClause && ts.isNamedExports(s.exportClause))
      for (const e of s.exportClause.elements) fns.delete((e.propertyName ?? e.name).text);
    if (ts.isExportAssignment(s) && ts.isIdentifier(s.expression)) fns.delete(s.expression.text);
  }

  // HELPERS: a local function with a read in what it returns. Its calls are reads.
  const helpers = new Set<string>();
  /** What a call reads: a rendered-state method (UNKNOWN through a computed name), a helper, or nothing. */
  const readOf = (c: ts.CallExpression): { absent: () => unknown; computed: boolean } | undefined => {
    const callee = bare(c.expression);
    const helper = (e: ts.Expression) => {
      const id = bare(e);
      return ts.isIdentifier(id) && helpers.has(id.text) ? { absent: () => helperValue(id.text), computed: false } : undefined;
    };
    if (ts.isIdentifier(callee)) return helper(callee);
    let m = member(callee);
    if (m && (m.name === 'call' || m.name === 'apply')) {
      const h = helper(m.of);
      if (h) return h;
      if (member(m.of)) m = member(m.of);
    }
    if (!m) return undefined;
    const name = m.name;
    if (name === UNKNOWN) return { absent: () => UNKNOWN, computed: true };
    return isRead(name) ? { absent: () => READS[name], computed: false } : undefined;
  };
  /** A helper named WITHOUT being called — passed, aliased, bound: a read nobody judges unless an assertion does. */
  const isHelperRef = (id: ts.Identifier): boolean => {
    if (!helpers.has(id.text)) return false;
    const p = id.parent as ts.Node & { name?: ts.Node };
    if (p.name === id && !ts.isShorthandPropertyAssignment(p)) return false; // a declaration or a property name
    let n: ts.Node = id;
    while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
    if (ts.isCallExpression(n.parent) && n.parent.expression === n) return false; // `f(…)`
    const via = n.parent;
    const by = (ts.isPropertyAccessExpression(via) || ts.isElementAccessExpression(via)) && via.expression === n ? member(via)!.name : undefined;
    return !((by === 'call' || by === 'apply') && ts.isCallExpression(via.parent) && via.parent.expression === via);
  };
  const readNodes = (): ts.Node[] => [...calls.filter((c) => readOf(c)), ...identifiers.filter(isHelperRef), ...refs];
  const within = (n: ts.Node, outer: ts.Node) => n.pos >= outer.pos && n.end <= outer.end;
  for (let grew = true; grew; ) {
    grew = false;
    const reads = readNodes();
    for (const [name, defs] of fns)
      if (!helpers.has(name) && defs.some((fn) => returnsOf(fn).some((r) => reads.some((n) => within(n, r))))) {
        helpers.add(name);
        grew = true;
      }
  }
  const reads = readNodes();
  const readsIn = (e: ts.Node) => reads.filter((n) => within(n, e));
  const helperReturns = [...helpers].flatMap((name) => fns.get(name)!.flatMap(returnsOf));

  /** A helper means what its ONE return evaluates to; two definitions, or one reached while it is evaluated, mean UNKNOWN. */
  const memo = new Map<string, unknown>();
  const helperValue = (name: string): unknown => {
    if (memo.has(name)) return memo.get(name);
    memo.set(name, UNKNOWN);
    const defs = fns.get(name)!;
    const v = defs.length === 1 ? evaluate(returned(defs[0])) : UNKNOWN;
    memo.set(name, v);
    return v;
  };
  /**
   * What `node` evaluates to when every read in it finds the thing ABSENT —
   * OPAQUE when it holds no read, UNKNOWN when a read in it was not carried
   * to the value, or a read was mixed with a value.
   */
  const evaluate = (node: ts.Expression | undefined): unknown => {
    if (!node) return UNKNOWN;
    const used = new Set<ts.Node>();
    const v = reduce(node, used);
    const all = readsIn(node);
    if (all.length === 0) return OPAQUE;
    return hasOpaque(v) || all.some((r) => !used.has(r)) ? UNKNOWN : v;
  };
  const reduce = (node: ts.Expression, used: Set<ts.Node>): unknown => {
    const e = bare(node);
    if (readsIn(e).length === 0) return OPAQUE;
    if (ts.isIdentifier(e)) {
      used.add(e); // a helper reference: `expect.poll(helper)`
      return helperValue(e.text);
    }
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const r = returned(e);
      return r ? reduce(r, used) : UNKNOWN;
    }
    if (ts.isCallExpression(e)) {
      const read = readOf(e);
      if (read) {
        used.add(e);
        return read.absent();
      }
      const m = member(e.expression);
      // `read.catch(() => fallback)`: absent either way only when the fallback IS the absent value.
      if (m?.name === 'catch' && e.arguments.length === 1 && (ts.isArrowFunction(e.arguments[0]) || ts.isFunctionExpression(e.arguments[0]))) {
        const absent = reduce(m.of, used);
        const r = returned(e.arguments[0]);
        return !unjudgeable(absent) && r && Object.is(literal(r), absent) ? absent : UNKNOWN;
      }
      const all = promiseAll(e);
      return all ? reduce(all, used) : UNKNOWN;
    }
    if (ts.isArrayLiteralExpression(e)) return e.elements.map((x) => reduce(x, used));
    // `!` sees the read's value only through `await`: on the bare Promise it is a constant false.
    if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.ExclamationToken) {
      let operand: ts.Expression = e.operand;
      while (ts.isParenthesizedExpression(operand)) operand = operand.expression;
      if (!ts.isAwaitExpression(operand)) return UNKNOWN;
      const v = reduce(e.operand, used);
      return unjudgeable(v) ? UNKNOWN : !v;
    }
    return UNKNOWN;
  };
  /** The array an assertion's subject resolves to, through a callback and `Promise.all`. */
  const arrayOf = (node: ts.Expression): ts.ArrayLiteralExpression | undefined => {
    const e = bare(node);
    if (ts.isArrayLiteralExpression(e)) return e;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      const r = returned(e);
      return r && arrayOf(r);
    }
    const all = promiseAll(e);
    return all && arrayOf(all);
  };
  /**
   * For every read in a point-in-time assertion's subject: does it PASS when
   * the thing is absent? An array compared whole is judged per element.
   */
  const claims = (assertion: ts.CallExpression): Map<ts.Node, Verdict> => {
    const subject = assertion.arguments[0];
    const m = matcherOf(assertion);
    const out = new Map<ts.Node, Verdict>();
    if (!subject) return out;
    const whole = evaluate(subject);
    const array = arrayOf(subject);
    const want = literal(m?.args[0]);
    const perElement = whole !== UNKNOWN && array && m && !m.not && (m.name === 'toEqual' || m.name === 'toStrictEqual') && Array.isArray(want) && want.length === array.elements.length;
    for (const r of readsIn(subject)) {
      const i = perElement ? array.elements.findIndex((el) => within(r, el)) : -1;
      out.set(r, !perElement ? passes(m, whole) : i < 0 ? UNKNOWN : passes(m, evaluate(array.elements[i]), want[i]));
    }
    return out;
  };

  /** A `waitFor…` call, or an assertion's matcher: something that waits, then throws. */
  const isWait = (c: ts.CallExpression): boolean => {
    const name = member(c.expression)?.name;
    if (typeof name === 'string' && name.startsWith('waitFor')) return true;
    let e: ts.Expression = c.expression;
    while (member(e)) e = member(e)!.of;
    e = bare(e);
    return ts.isCallExpression(e) && (isExpect(e) || isPoll(e));
  };
  for (const call of calls) {
    // goto: a raw hash navigation outside the harness.
    if (file !== HARNESS && named(call.expression, 'goto') && call.arguments.some((a) => a.getText(sf).includes('#'))) at(call, 'goto');
    // negative: a poll not proven to wait for presence.
    if (isPoll(call)) {
      const m = matcherOf(call);
      if (!waitsForPresence(evaluate(call.arguments[0]), m)) at(m?.call ?? call, 'negative');
    }
    // negative: a `waitFor…` whose options the scan cannot read — `waitFor`'s own a variable, any one's a spread or
    // a key `keyOf` cannot fold — may be waiting for absence.
    const name = member(call.expression)?.name;
    const unread = (a: ts.Expression) => ts.isObjectLiteralExpression(a) && a.properties.some((p) => ts.isSpreadAssignment(p) || (p.name && keyOf(p.name) === UNKNOWN));
    if (typeof name === 'string' && name.startsWith('waitFor') && call.arguments.some((a) => unread(bare(a))))
      at(call, 'negative');
    else if (name === 'waitFor' && call.arguments[0] && !ts.isObjectLiteralExpression(bare(call.arguments[0]))) at(call, 'negative');
    // sleep: a wait whose failure is swallowed waits out its timeout when the thing never comes.
    const caught = named(call.expression, 'catch') ? bare(member(call.expression)!.of) : undefined;
    if (caught && ts.isCallExpression(caught) && isWait(caught)) at(call, 'sleep');
  }

  // positive / read: a read is allowed only inside `expect.poll` (judged above),
  // in an `expect` that passes when the thing is ABSENT, or in what a helper
  // returns (judged at its calls).
  for (const r of reads) {
    const assertion = ts.findAncestor(r.parent, (a) => isPoll(a) || isExpect(a)) as ts.CallExpression | undefined;
    if (assertion && isPoll(assertion)) continue;
    if (assertion) {
      if (claims(assertion).get(r) !== true) at(matcherOf(assertion)?.call ?? assertion, 'positive');
      continue;
    }
    if (helperReturns.some((h) => within(r, h))) continue;
    if (ts.isIdentifier(r)) at(r.parent, 'read');
    else if (!ts.isCallExpression(r)) at(r, 'read');
    else if (!readOf(r)!.computed) at(valueOf(r), 'read');
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

    // EVERY SPELLING of a read, a matcher and an absence is judged the same
    // way: the claim is checked against what the read returns when the thing
    // is absent. One table, so a run shows every miss at once.
    const H = 'async function hidden(b) {\n  return b.isHidden();\n}\n';
    const BRANCHY = 'async function state(b, open) {\n  if (open) return b.count();\n  return b.isHidden();\n}\n';
    const TERNARY = 'const state = (b, open) => (open ? b.count() : b.isHidden());\n';
    const GUARDED = 'async function rows(b, open) {\n  if (!open) return 0;\n  return b.count();\n}\n';
    const BARE = 'async function hidden(b, open) {\n  if (!open) return;\n  return b.isHidden();\n}\n';
    const CYCLE ='function f(b) {\n  return g(b);\n}\nfunction g(b) {\n  return f(b).catch(() => b.count());\n}\n';
    const spellings: [string, Rule[]][] = [
      // a read with arguments, by computed name, optional chain, `.call`, parenthesised
      ['expect(await box.isVisible({ timeout: 100 })).toBe(true);', ['positive']],
      ['expect(await box["isVisible"]()).toBe(true);', ['positive']],
      ['expect(await box[`count`]()).toBe(1);', ['positive']],
      ['expect(await box?.isVisible()).toBe(true);', ['positive']],
      ['expect(await box.isVisible?.()).toBe(true);', ['positive']],
      ['expect(await box.isVisible.call(box)).toBe(true);', ['positive']],
      ['await expect((box.isVisible)()).resolves.toBe(true);', ['positive']],
      ['expect(await box[method]()).toBe(true);', ['positive']],
      ['expect(await box[method]()).toBe(false);', ['positive']],
      ['const see = box.isVisible.bind(box);', ['read']],
      // the assertion by any spelling: soft, a computed matcher, resolves, a not by name
      ['expect.soft(await box.isVisible()).toBe(true);', ['positive']],
      ['expect(await box.isVisible())["toBe"](true);', ['positive']],
      ['await expect(box.isVisible()).resolves.toBe(true);', ['positive']],
      ['expect(await box.isVisible())["not"].toBe(false);', ['positive']],
      ['await expect(box.isVisible()).rejects.toThrow();', ['positive']],
      // compound and inverted point-in-time claims
      ['expect(await Promise.all([a.isChecked(), b.isChecked()])).toEqual([true, false]);', ['positive']],
      ['expect(await Promise.all([a.isChecked(), b.isChecked()])).toEqual([false, false]);', []],
      ['expect(!(await box.isVisible())).toBe(true);', []],
      ['expect(!(await box.isVisible())).toBe(false);', ['positive']],
      ['expect(await box.count()).toBeLessThan(1);', []],
      ['expect(await box.count()).toBeGreaterThanOrEqual(1);', ['positive']],
      ['expect(await box.isHidden()).toBeTruthy();', []],
      ['expect(await box.isVisible({ timeout: 100 })).toBe(false);', []],
      // a POLLED absence, by any spelling, is a negative to ledger
      ['await expect.poll(() => box.isHidden()).toBe(true);', ['negative']],
      ['await expect.poll(() => Promise.all([a.isChecked(), b.isChecked()])).toEqual([false, false]);', ['negative']],
      ['await expect.poll(() => Promise.all([a.isChecked(), b.isChecked()])).toEqual([true, false]);', ['negative']],
      ['await expect.poll(async () => [await a.count(), await b.count()]).toEqual([1, 0]);', ['negative']],
      ['await expect.poll(() => box.isVisible()).not.toBe(true);', ['negative']],
      ['await expect.poll(() => box.isVisible())["toBe"](false);', ['negative']],
      ['await expect.poll(() => box.count()).toBeLessThan(1);', ['negative']],
      ['await expect.poll(() => box.count()).toBeLessThanOrEqual(0);', ['negative']],
      ['await expect.poll(() => box.isChecked()).toBeFalsy();', ['negative']],
      ['await expect.poll(async () => !(await box.isVisible())).toBe(true);', ['negative']],
      ['await expect.poll(async () => { const n = await box.count(); return n; }).toBe(1);', ['negative']],
      ['await expect.poll(async () => { await go(); return box.isHidden(); }).toBe(true);', ['negative']],
      ['await expect.poll(async () => ({ on: await box.isChecked() })).toEqual({ on: true });', ['negative']],
      ['await expect.poll(() => box.count()).toBe(expected);', ['negative']],
      ['await expect.poll(() => box["isHidden"]()).toBe(true);', ['negative']],
      ['await expect.poll(() => box.isVisible({ timeout: 100 })).toBe(false);', ['negative']],
      ['await expect.soft.poll(() => box.count()).toBe(0);', ['negative']],
      ['await expect["poll"](() => box.count()).toBe(0);', ['negative']],
      ['await expect.poll(() => box.count());', ['negative']],
      [`${H}await expect.poll(() => hidden(box)).toBe(true);`, ['negative']],
      [`${H}await expect.poll(hidden).toBe(true);`, ['negative']],
      // …while a polled PRESENCE, by the same spellings, stays allowed
      ['await expect.poll(() => box.isHidden()).toBe(false);', []],
      ['await expect.poll(() => Promise.all([a.isChecked(), b.isChecked()])).toEqual([true, true]);', []],
      ['await expect.poll(async () => { await go(); return box.count(); }).toBe(2);', []],
      ['await expect.poll(() => box.count()).toBeGreaterThan(0);', []],
      ['await expect.poll(() => box["isVisible"]({ timeout: 100 })).toBe(true);', []],
      [`${H}await expect.poll(() => hidden(box)).toBe(false);`, []],
      ['await expect.poll(() => box.isVisible().catch(() => false)).toBe(true);', []],
      ['await expect.poll(() => box.isVisible().catch(() => false)).toBe(false);', ['negative']],
      ['await expect.poll(() => box.isVisible().catch(() => true)).toBe(true);', ['negative']],
      ['expect(await box.isVisible().catch(() => true)).toBe(true);', ['positive']],
      // an absence by waitFor, however the option is spelled
      ["await toast.waitFor({ 'state': 'detached' });", ['negative']],
      ['await toast.waitFor({ state: `hidden` });', ['negative']],
      ["await toast.waitFor({ state: 'hidden' as const });", ['negative']],
      ['await toast.waitFor({ state });', ['negative']],
      ['await toast.waitFor({ state: gone });', ['negative']],
      ["await toast['waitFor']({ state: 'detached' });", ['negative']],
      ["await toast.waitFor({ 'state': 'visible' });", []],
      // a raw hash navigation by a computed name
      ["await page['goto'](`${origin}#/items`);", ['goto']],
      // a poll of a VALUE is an absence wait when its matcher passes on an empty value
      ['await expect.poll(() => q()).toBe(undefined);', ['negative']],
      ["await expect.poll(() => q()).toBe('');", ['negative']],
      ['await expect.poll(() => n()).toBeLessThan(1);', ['negative']],
      ['await expect.poll(() => n()).toBeGreaterThanOrEqual(0);', ['negative']],
      ['await expect.poll(() => q())["toBeNull"]();', ['negative']],
      ['await expect.poll(() => n()).toBeGreaterThan(0);', []],
      ["await expect.poll(() => q()).toBe('x');", []],
      ["await expect.poll(() => q()).toContain('x');", []],
      ['await expect.poll(() => page.url()).toMatch(/q=/);', []],
      // a helper read through `.call`; `.all` that is not Promise's
      [`${H}expect(await hidden.call(null, box)).toBe(false);`, ['positive']],
      ['expect(await foo.all([await a.count()])).toEqual([0]);', ['positive']],
      // a waitFor whose options the scan cannot read
      ['await toast.waitFor(opts);', ['negative']],
      ['await toast.waitFor({ ...o });', ['negative']],
      ['await toast.waitFor({ [key]: value });', ['negative']],
      ['await toast.waitFor();', []],
      ['await toast.waitFor({ timeout: 5_000 });', []],
      // a wait whose failure is swallowed waits out its timeout when the thing never comes: a timer
      ['await row.waitFor().catch(() => {});', ['sleep']],
      ["await page.waitForURL(/#\\/items/).catch(() => {});", ['sleep']],
      ['await expect.poll(() => row.count()).toBe(1).catch(() => {});', ['sleep']],
      ['await box.isVisible().catch(() => false);', ['read']],
      // A HELPER means what its one return means; more than one path, or a
      // return the scan cannot reduce, means it cannot be judged at any call.
      [`${BRANCHY}await expect.poll(() => state(box, open)).toBe(true);`, ['negative']],
      [`${BRANCHY}expect(await state(box, open)).toBe(0);`, ['positive']],
      [`${TERNARY}await expect.poll(() => state(box, open)).toBe(1);`, ['negative']],
      [`${TERNARY}expect(await state(box, open)).toBe(0);`, ['positive']],
      [`${GUARDED}expect(await rows(box, open)).toBe(0);`, ['positive']],
      [`${CYCLE}expect(await f(box)).toBe(0);`, ['positive']],
      // …a reference that is not a call is a read nobody judges…
      [`${H}const see = hidden;`, ['read']],
      [`${H}await Promise.all([box].map(hidden));`, ['read']],
      // …and an exported helper's callers are elsewhere, so its read is judged where it stands.
      ['export async function rows(b) {\n  return b.count();\n}\n', ['read']],
      // A poll of a VALUE waits for presence only when a closed table proves
      // it: anything else — an unknown or variable expectation, an empty one
      // anywhere inside, a boolean whose sense the scan cannot see — is an
      // absence wait to ledger.
      ["await expect.poll(() => q()).toEqual(['', '']);", ['negative']],
      ["await expect.poll(() => q()).toEqual(['a', '']);", ['negative']],
      ['await expect.poll(() => q()).toEqual({});', ['negative']],
      ["await expect.poll(() => q()).toEqual({ a: '' });", ['negative']],
      ['await expect.poll(() => q()).toBe(expected);', ['negative']],
      ['await expect.poll(() => n()).toBeGreaterThan(m);', ['negative']],
      ['await expect.poll(() => q()).toMatch(/^$/);', ['negative']],
      ['await expect.poll(() => q()).toMatch(/a|/);', ['negative']],
      ["await expect.poll(() => q()).toMatch('x');", ['negative']],
      ["await expect.poll(() => q()).toContain('');", ['negative']],
      ['await expect.poll(() => q()).toContain(x);', ['negative']],
      ['await expect.poll(() => q()).toSatisfy(ok);', ['negative']],
      ['await expect.poll(() => q()).toBe(true);', ['negative']],
      ['await expect.poll(() => q()).toBeTruthy();', ['negative']],
      ["await expect.poll(() => main.innerText().then((t) => !t.includes('x'))).toBe(true);", ['negative']],
      ['await expect.poll(() => n()).toHaveLength(0);', ['negative']],
      ["await expect.poll(() => q().indexOf('x')).toBe(-1);", ['negative']],
      // `!` on a read that is not awaited negates the PROMISE: a constant false, whatever is on screen.
      ['await expect.poll(() => !box.isVisible()).toBe(false);', ['negative']],
      ['function gone(b) {\n  return !b.isVisible();\n}\nawait expect.poll(() => gone(box)).toBe(false);', ['negative']],
      ['expect(!box.isVisible()).toBe(true);', ['positive']],
      // …a subject mixing a read with a value is judged as neither…
      ['await expect.poll(async () => [await name.inputValue(), await name.isEnabled()]).toEqual(["", true]);', ['negative']],
      ['await expect.poll(async () => [await a.count(), q()]).toEqual([1, "x"]);', ['negative']],
      ['expect([await a.count(), await q()]).toEqual([0, "x"]);', ['positive']],
      // …while each table entry's provable side stays allowed.
      ["await expect.poll(() => q()).toEqual(['a', 'b']);", []],
      ["await expect.poll(() => q()).toEqual({ a: 'x', b: { c: 1 } });", []],
      ['await expect.poll(() => n()).toHaveLength(2);', []],
      ['await expect.poll(() => n()).toBeGreaterThanOrEqual(1);', []],
      // EVERY RETURN PATH counts: a bare `return;`, or an end of body the
      // function can reach, returns undefined — a second path, so UNKNOWN.
      [`${BARE}await expect.poll(() => hidden(box, open)).toBeFalsy();`, ['negative']],
      [`${BARE}expect(await hidden(box, open)).toBe(true);`, ['positive']],
      ['async function hidden(b, open) {\n  if (open) return b.isHidden();\n}\nawait expect.poll(() => hidden(box, open)).toBeFalsy();', ['negative']],
      ['await expect.poll(async () => { if (!open) return; return box.isHidden(); }).toBeFalsy();', ['negative']],
      ['async function rows(b, open) {\n  if (!open) return;\n  return b.count();\n}\nawait expect.poll(() => rows(box, open)).toBeUndefined();', ['negative']],
      ['async function rows(b) {\n  try { return b.count(); } catch { }\n}\nawait expect.poll(() => rows(box)).toBeUndefined();', ['negative']],
      ['async function hidden(b, k) {\n  switch (k) { case 1: return b.isHidden(); }\n}\nawait expect.poll(() => hidden(box, k)).toBeFalsy();', ['negative']],
      ['expect(await box.isVisible().catch(() => { if (!open) return; return false; })).toBe(false);', ['positive']],
      ['async function* rows(b) {\n  return b.count();\n}\nawait expect.poll(() => rows(box)).toBe(1);', ['negative']],
      // A helper exported IN ANY SPELLING has its callers elsewhere: its read is judged where it stands, once.
      ['async function rows(b) {\n  return b.count();\n}\nexport { rows };', ['read']],
      ['const rows = (b) => b.count();\nexport { rows };', ['read']],
      ['async function rows(b) {\n  return b.count();\n}\nexport { rows as r };', ['read']],
      ['async function rows(b) {\n  return b.count();\n}\nexport default rows;', ['read']],
      // A READ METHOD named without being called — passed, aliased, destructured — is a read nobody judges.
      ['expect(await Reflect.apply(box.isVisible, box, [])).toBe(true);', ['positive']],
      ['await expect.poll(() => Reflect.apply(box.count, box, [])).toBe(1);', ['negative']],
      ['const see = box.isVisible;', ['read']],
      ["const see = box['isVisible'];", ['read']],
      ['const { isVisible } = box;', ['read']],
      ['const { count: n } = box;', ['read']],
      ['let see;\n({ isVisible: see } = box);', ['read']],
      ['({ count } = box);', ['read']],
      // …but an uncalled COMPUTED member is indexing, indistinguishable from a read method: out of reach,
      // as is a name passed as an argument (`Reflect.get`), which is no property-name form.
      ['expect(await Reflect.apply(box[m], box, [])).toBe(true);', []],
      ["expect(await Reflect.get(box, 'isVisible').call(box)).toBe(true);", []],
      // A PROPERTY NAME means its static value however it is spelled — an
      // identifier, a string, a template, a number, or a computed key folding
      // those (`'is' + 'Visible'`, `` `is${'Visible'}` ``) — at every consumer:
      // a destructured read (declaration, `=`, `for…of`, parameter, catch)…
      ['const { ["isVisible"]: read } = box;\nexpect(await Reflect.apply(read, box, [])).toBe(true);', ['read']],
      ['const { [`count`]: n } = box;', ['read']],
      ["const { ['is' + 'Visible']: see } = box;", ['read']],
      ['const { [`is${"Visible"}`]: see } = box;', ['read']],
      ["const { [('count' as const)]: n } = box;", ['read']],
      ['let see;\n({ ["isVisible"]: see } = box);', ['read']],
      ["for ({ ['count']: n } of boxes);", ['read']],
      ['for ({ count: n } of boxes);', ['read']],
      ['async function f({ ["isVisible"]: see }) {}', ['read']],
      ["try {} catch ({ ['count']: n }) {}", ['read']],
      ['const { 0: first, ["name"]: n } = box;', []],
      // …a computed member, called or named…
      ["expect(await box['is' + 'Visible']()).toBe(true);", ['positive']],
      ["expect(await box['is' + 'Visible']()).toBe(false);", []],
      ["const see = box[`is${'Visible'}`];", ['read']],
      ['await expect.poll(() => box["is" + "Hidden"]()).toBe(false);', []],
      ["expect(await box.isVisible())['to' + 'Be'](false);", []],
      ["expect(await box.isVisible())['to' + 'Be'](true);", ['positive']],
      // …a helper's `.call`…
      [`${H}expect(await hidden['call'](null, box)).toBe(true);`, []],
      [`${H}expect(await hidden['call'](null, box)).toBe(false);`, ['positive']],
      // …an absence option, on any waitFor…
      ["await toast.waitFor({ ['state']: 'detached' });", ['negative']],
      ["await page.waitForSelector('x', { ['state']: 'hidden' });", ['negative']],
      ["await page.waitForSelector('x', { [`sta${'te'}`]: 'detached' });", ['negative']],
      ["await toast.waitFor({ ['timeout']: 5_000 });", []],
      // …an absence by any waitFor, its state however written…
      ["await page.waitForSelector('x', { state: gone });", ['negative']],
      ["await page.waitForSelector('x', { state });", ['negative']],
      ["await page.waitForSelector('x', { state: 'hid' + 'den' });", ['negative']],
      ["await toast.waitFor({ get state() { return 'hidden'; } });", ['negative']],
      ["await page.waitForSelector('x', { get ['state']() { return 'hidden'; } });", ['negative']],
      ["await page.waitForSelector('x', { state: 'attached' });", []],
      ["await page.waitForEvent('popup', { predicate(p) { return true; } });", []],
      // …a timer, a key folded from pieces no one string holds — reported once…
      ["await page['wait' + 'ForTimeout'](300);", ['sleep']],
      ["await page[`waitFor${'Timeout'}`](300);", ['sleep']],
      ["globalThis['set' + 'Timeout'](go, 100);", ['sleep']],
      ["const { ['wait' + 'ForTimeout']: w } = page;", ['sleep']],
      ["const { ['waitForTimeout']: w } = page;", ['sleep']],
      // …and an expected object.
      ["await expect.poll(() => q()).toEqual({ ['a']: 'x' });", []],
      // A key the scan cannot fold may be any name: unsafe wherever a name decides.
      ['const { [k]: v } = box;', ['read']],
      ["({ ['is' + k]: see } = box);", ['read']],
      ["await page.waitForSelector('x', { [key]: value });", ['negative']],
      ["await page.waitForSelector('x', { ...o });", ['negative']],
      ["await expect.poll(() => q()).toEqual({ [k]: 'x' });", ['negative']],
      ['expect(await box[`is${k}`]()).toBe(false);', ['positive']],
      // A REGEX'S SENSE is as invisible as a boolean's: only alternatives of
      // plain non-empty text prove presence, like `toContain`.
      ['await expect.poll(() => page.url()).toMatch(/^[^?]+$/);', ['negative']],
      ['await expect.poll(() => page.url()).toMatch(/^(?!.*composer=).+/);', ['negative']],
      ['await expect.poll(() => page.url()).toMatch(/^[a-z:\\/.#]+$/);', ['negative']],
      ['await expect.poll(() => q()).toMatch(/\\D/);', ['negative']],
      ['await expect.poll(() => q()).toMatch(/a+/);', ['negative']],
      ['await expect.poll(() => q()).toMatch(/x/m);', ['negative']],
      ['await expect.poll(() => q()).toMatch(/pushed|in sync/i);', []],
      ['await expect.poll(() => q()).toMatch(/a\\.b/);', []],
      ['await expect.poll(() => page.url()).toMatch(/view=paths&inst=inst-tar/);', []],
    ];
    expect(spellings.filter(([code, want]) => JSON.stringify(rules(code)) !== JSON.stringify(want)).map(([code, want]) => `${code} → ${JSON.stringify(rules(code))}, want ${JSON.stringify(want)}`)).toEqual([]);
  });
});
