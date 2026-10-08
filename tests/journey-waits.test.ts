import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Browser journeys wait on EVENTS. A fixed sleep, a hand-rolled poller or a
// read of the screen at one instant passes on a fast machine and fails on an
// unlucky runner — in a lane that never touched the journey. This reads the
// journeys and the harness and refuses those shapes, so the rule holds by
// construction instead of by review: within the RECOGNITION CONTRACT below,
// and only there.
//
// SCANNED: every `tests/*.ts` but this file (no subdirectory, `.tsx` or
// `.js`; no journey lives elsewhere), parsed with TypeScript, syntax only. A
// quote, a comment, a template or a regex literal is what it is: `'A // B'`
// is a string and `')'` is not a bracket.
//
// SUPPORTED NAMES. Every rule decides by a NAME: a read (`READS`), a timer
// (`TIMER`), a wait (`waitFor…`), `expect`, `soft`, `poll`, a matcher, `not`,
// `resolves`, `rejects`, `state`, an expected object's key, `goto`. One
// reader, `keyOf`/`member`, recognises a name written
//   - as a member: `.n`, `?.n`, an escaped identifier, `[s]`, `?.[s]`;
//   - as a key, in an object literal or a destructuring pattern (declaration,
//     parameter, catch, `=`, `for…of`): `n`, an escaped identifier, a string,
//     `[s]`;
// where `s` is STATIC TEXT: strings and templates, escapes cooked, folded
// through `+`, `${}`, parentheses and `as` from literals alone. A timer name
// and a hash URL are also recognised as the runtime text of any string
// expression built that way, and a timer as a page script cooks its own
// escapes again. A name that is not static text is UNKNOWN, and so is an
// expected object's key whose text is `__proto__`, in every spelling (JS makes
// it the prototype in one spelling and an own key in another). Unknown FAILS
// CLOSED in an assertion or a poll (refused), as a destructuring key (a read)
// and as a key in wait options (a negative). Anywhere else — a member called
// or named outside an assertion, an assertion reached by an unknown name, a
// piece of timer or URL text held in a binding — it is EXCLUDED. `SUPPORTED`
// below derives every spelling × position cell from this policy alone; the
// matrix spells the matcher as `toBe`, and the interaction rows prove each
// matcher's judgement.
//
// SUPPORTED JUDGEMENTS. Six rules, each deny-by-default:
//   sleep     a timer named anywhere but a comment — called, referenced,
//             bound, imported, destructured, or in a string's runtime text —
//             and a wait (`waitFor…`, an assertion) whose failure a `.catch`
//             swallows: when the thing never comes, that is a timer;
//   poller    a `while`, `do` or `for(;;)` loop that awaits —
//             `persistedUntil` is the one poller;
//   positive  a rendered-state READ with no auto-wait (`READS`) — called,
//             by `?.()`, `.call`, `.apply`, or through a local helper — is
//             asserted at one instant only by an `expect` that PASSES WHEN
//             THE THING IS ABSENT. One evaluation decides it: each read takes
//             its absent value (0, false; `isHidden` true), through `.not`,
//             `.resolves`, `!` on an awaited read, `Promise.all`, a `.catch`
//             falling back to that same value, and arrays judged element by
//             element. It refuses what it cannot reduce (an unknown name, a
//             variable, a comparison, an object, `.rejects`), a read it did
//             not carry to the value (one held in a variable), and a read
//             mixed with a value (`[await a.count(), url]`). `inputValue`,
//             geometry (`boundingBox`) and list (`all`, `allInnerTexts`)
//             reads are VALUE reads, taken after the element was awaited;
//   read     the same read OUTSIDE an assertion — a branch, a variable, a
//             read method or helper named without a call (passed, aliased,
//             bound, destructured) — unless ledgered with what it was read
//             after. A HELPER is a local function with a read in what it
//             returns; it means what its ONE return evaluates to, and only
//             when that return is the body's last statement: a second
//             return, a bare `return;`, a reachable end, a generator, two
//             definitions, a helper reached while it is evaluated, or a
//             return the evaluation cannot reduce leaves every call unjudged
//             (inline callbacks and `.catch` fallbacks alike). A helper
//             exported in any form is judged where it stands;
//   negative  every poll and wait not PROVEN unable to pass on what never
//             came is ledgered with why it cannot: it follows a wait that SAW
//             the thing (a disappearance after presence), or it is a presence
//             the table below cannot see (a variable, template or boolean
//             expectation, a read mixed with a value). A poll of reads waits
//             for presence when the same evaluation fails at every read's
//             absent value, element by element (`[true, false]` still waits
//             on nothing for its second half). A poll of a value (no read in
//             it) may hold ANY value, an empty one included, so only a closed
//             table proves it cannot pass on an empty value: `toBe`/`toEqual`
//             of a literal whose every leaf is a non-empty string or a
//             POSITIVE number (no boolean, 0, -1), `toContain` of a non-empty
//             string, `toMatch` of a regex of plain-text alternatives (no
//             anchor, class, group, quantifier or `\D`-style escape, whose
//             sense may be absence; at most the `i` flag),
//             `toBeGreaterThan(n >= 0)`, `toBeGreaterThanOrEqual(n > 0)`,
//             `toHaveLength(n > 0)`. Everything else is negative: `.not`, no
//             matcher, a variable, an unknown matcher, a boolean (its sense —
//             `!t.includes(x)` — is invisible). So is every wait that may
//             pass on what never came, read where Playwright's types let it
//             ask: `state: 'detached' | 'hidden'` anywhere; options it cannot
//             read (a variable, a call, a spread, an unknown key, a `state`
//             that is not a literal); `waitForElementState('hidden')` or an
//             unread state; `waitForURL` unless a plain regex or glob-free
//             URL; `waitForFunction` (a page function's sense is invisible); a
//             `waitFor…` not in the table; and any of these by `.call`,
//             `.apply`, `.bind`, destructuring or passing. Event waits
//             (`waitForEvent`, `…Request`, `…Response`, `…LoadState`,
//             `…Navigation`) need something to happen, so cannot;
//   goto      a raw `page.goto` whose URL's runtime text holds a `#`, outside
//             the harness: `goTo` is the navigation that waits.
//
// EXCLUDED — UNCHECKED, NOT PROVED SAFE. `EXCLUDED` below names each class
// outside the contract with one example. The scanner says nothing about
// them, and that silence is no verdict: a journey must not rely on them.
//
// STOPPING RULE. A counterexample blocks this guard only when it is written in
// a supported class and gets a verdict other than the policy's, or when it is
// an actual repository consumer that is unreliable. A spelling in an excluded
// class alone is a possible extension: its class joins the contract, with its
// policy cells, before it is judged.
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
    file: 'practiceBrowser.ts',
    rule: 'negative',
    snippet: 'page.waitForFunction( ([old, text]) =>',
    why: "goTo's arrival: true only once a rendered <main> exists whose heading element or text differs from the outgoing one captured before navigating, and a Primary-nav presence wait follows; the N1 self-test fails the pre-fix goTo in both engines",
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

/**
 * Outside the recognition contract: UNCHECKED, not proved safe. Each class
 * with one example; the test asserts no verdict on them, only that none is
 * also a supported cell.
 */
const EXCLUDED: { id: string; class: string; example: string }[] = [
  { id: 'binding-piece', class: 'a name or URL, or a piece of one, held in a binding (`const` included) or computed by a call', example: "async function f(t) {\n  await page['waitFor' + t](300);\n}" },
  { id: 'computed-call', class: 'a call by an unknown name outside an assertion', example: 'await page[k](300);' },
  { id: 'computed-member', class: 'a member by an unknown name, not called, outside an assertion (indexing)', example: 'expect(await Reflect.apply(box[m], box, [])).toBe(true);' },
  { id: 'unknown-assertion', class: 'an assertion reached by an unknown name, with no read in it (with one, the read is refused)', example: 'await expect[k](() => q()).toBe(null);' },
  { id: 'reflection', class: 'a name passed as an argument to reflection', example: "expect(await Reflect.get(box, 'isVisible').call(box)).toBe(true);" },
  { id: 'aliased-expect', class: 'an aliased `expect`', example: 'const e = expect;\nawait e.poll(() => q()).toBe(null);' },
  { id: 'for-of-loop', class: 'a `for…of`/`for…in` loop that awaits, with no timer in it', example: 'for (const b of boxes) if (await ok(b)) break;' },
  { id: 'imported-helper', class: 'the meaning of a helper imported from another file at its call (its own read is refused where it is defined)', example: "import { rows } from './rows';\nexpect(await rows(box)).toBe(1);" },
  { id: 'web-first-matcher', class: "Playwright's web-first matchers, unreachable through Vitest's `expect`", example: 'await expect(box).toBeHidden();' },
  { id: 'encoded-absence', class: 'a value COMPUTED to encode absence (the table proves a poll cannot pass on an empty value, not that the value means presence)', example: "await expect.poll(() => (gone() ? 'gone' : 'there')).toBe('gone');" },
  { id: 'unscanned-file', class: 'a file outside `tests/*.ts`', example: '// tests/sub/x.ts, tests/x.tsx, tests/x.js' },
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
      // `__proto__` is the prototype in one spelling and an own key in another, and
      // `o[key] =` would drop its leaf silently: it is never judged.
      if (key === UNKNOWN || key === '__proto__') return UNKNOWN;
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

/**
 * A string expression's RUNTIME text — escapes cooked, `+` and `${}` folded, a
 * tagged template's raw text — with NUL where a part is not static.
 */
function fold(node: ts.Expression): string {
  const e = bare(node);
  const raw = (t: ts.TemplateLiteralLikeNode) => t.rawText ?? t.text;
  if (ts.isTaggedTemplateExpression(e)) {
    const t = e.template;
    return ts.isNoSubstitutionTemplateLiteral(t) ? raw(t) : raw(t.head) + t.templateSpans.map((s) => fold(s.expression) + raw(s.literal)).join('');
  }
  if (ts.isStringLiteralLike(e)) return e.text;
  if (ts.isTemplateExpression(e)) return e.head.text + e.templateSpans.map((s) => fold(s.expression) + s.literal.text).join('');
  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) return fold(e.left) + fold(e.right);
  return '\0';
}
/** Is this a whole string expression — not a piece of a larger `+`, template or tagged template? */
function textRoot(node: ts.Node): node is ts.Expression {
  const kind =
    ts.isStringLiteralLike(node) || ts.isTemplateExpression(node) || ts.isTaggedTemplateExpression(node) || (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken);
  let p = node.parent;
  while (p && (ts.isParenthesizedExpression(p) || ts.isAsExpression(p) || ts.isSatisfiesExpression(p) || ts.isNonNullExpression(p))) p = p.parent;
  return kind && !(ts.isTemplateSpan(p) || ts.isTaggedTemplateExpression(p) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.PlusToken));
}
const ESCAPE = /\\+(?:u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|([0-7]{1,3}))|\\+\r?\n/g;
/** Text a page script cooks again: every escape layer decoded (`\\u0054`, `\\x54`, `\\124` → `T`), so a name under any of them is the name. */
function decode(s: string): string {
  for (let prev = ''; prev !== s; ) {
    prev = s;
    s = s.replace(ESCAPE, (all, cp, u, x, o) => {
      if (cp === undefined && u === undefined && x === undefined && o === undefined) return '';
      const n = o !== undefined ? parseInt(o, 8) : parseInt(cp ?? u ?? x, 16);
      return n <= 0x10ffff ? String.fromCodePoint(n) : all;
    });
  }
  return s;
}

/** A wait that may pass on what never came, read where Playwright lets it ask (playwright-core's types). */
const ABSENT_STATES = new Set(['detached', 'hidden']);
/** Waits for an EVENT — something must happen, so none can pass on nothing; `waitForTimeout` is a sleep, judged as one. */
const EVENT_WAITS = new Set(['waitForEvent', 'waitForRequest', 'waitForResponse', 'waitForLoadState', 'waitForNavigation', 'waitForTimeout']);
const absenceWait = (name: string | typeof UNKNOWN | undefined): name is string => typeof name === 'string' && name.startsWith('waitFor') && !EVENT_WAITS.has(name);
/** Options that may ask for absence: not an object literal, a spread, a key `keyOf` cannot fold, or a `state` that is not a literal presence. */
function optionsMayAskAbsence(a: ts.Expression): boolean {
  const e = bare(a);
  if (!ts.isObjectLiteralExpression(e)) return true;
  return e.properties.some((p) => {
    if (ts.isSpreadAssignment(p) || !p.name) return true;
    const key = keyOf(p.name);
    if (key !== 'state') return key === UNKNOWN;
    const state = ts.isPropertyAssignment(p) ? literal(p.initializer) : UNKNOWN;
    return typeof state !== 'string' || ABSENT_STATES.has(state);
  });
}
/** A URL matcher that names a URL to be AT: plain regex alternatives (as `toMatch`), or a string with no glob in it. */
function urlPresence(a: ts.Expression): boolean {
  const e = bare(a);
  if (ts.isRegularExpressionLiteral(e)) return PLAIN_REGEX.test(e.text);
  const url = constant(e);
  return typeof url === 'string' && url !== '' && !/[*?[\]{}]/.test(url);
}
/** May this `waitFor…` call pass on what never came? Unknown waits, and anything the scan cannot read, may. */
function waitMayPassOnAbsence(name: string, args: readonly ts.Expression[]): boolean {
  if (EVENT_WAITS.has(name)) return false;
  if (args.some(ts.isSpreadElement)) return true;
  switch (name) {
    case 'waitFor':
      return args.length > 0 && optionsMayAskAbsence(args[0]);
    case 'waitForSelector':
      return args.length > 1 && optionsMayAskAbsence(args[1]);
    case 'waitForElementState': {
      const state = args[0] ? text(constant(args[0])) : UNKNOWN;
      return state === UNKNOWN || ABSENT_STATES.has(state);
    }
    case 'waitForURL':
      return !(args[0] && urlPresence(args[0]));
    default: // `waitForFunction`: a page function's sense is as invisible as a boolean's; and any wait not in the table
      return true;
  }
}
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

/** `expect` or `expect.soft`, by any supported spelling. */
const isExpectFn = (node: ts.Expression): boolean => {
  const e = bare(node);
  return (ts.isIdentifier(e) && e.text === 'expect') || (named(e, 'soft') && isExpectFn(member(e)!.of));
};
const isExpect = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n) && isExpectFn(n.expression);
const isPoll = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n) && named(n.expression, 'poll') && isExpectFn(member(n.expression)!.of);

type Matcher = { not: boolean; rejects: boolean; name: string; args: readonly ts.Expression[]; call: ts.CallExpression };
/** The matcher an `expect(…)`/`expect.poll(…)` call is chained into, through `.not`, `.resolves`, `.rejects`, by any supported spelling. */
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
  /** One negative per wait: its literal `state` and the wait table both read it. (Two reads in one assertion stay two sites.) */
  const negatives = new Set<number>();
  const at = (node: ts.Node, rule: Rule, text = node.getText(sf), pos = node.getStart(sf)) => {
    if (rule === 'negative' && negatives.has(pos)) return;
    if (rule === 'negative') negatives.add(pos);
    sites.push({ file, rule, line: sf.getLineAndCharacterOfPosition(pos).line + 1, text: text.replace(/\s+/g, ' ').trim() });
  };
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
    // … or a timer named by a string's RUNTIME text: a page script, `page['waitFor\u0054imeout']`, `['wait' + 'ForTimeout']`.
    if (textRoot(node)) {
      const text = decode(fold(node));
      for (const m of text.matchAll(SLEEP)) at(node, 'sleep', text.slice(m.index, callEnd(text, m.index + m[0].length)), node.getStart(sf) + m.index);
    }
    // poller: a loop that awaits — `persistedUntil` is the one.
    if ((ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isForStatement(node)) && hasAwait(node)) at(node, 'poller');
    // negative: a wait for something to be GONE passes at once if it never came — `state: 'detached' | 'hidden'`
    // in any supported spelling, wherever it is written (the wait table below reads a state it cannot read).
    if (ts.isPropertyAssignment(node) && keyOf(node.name) === 'state') {
      const state = literal(node.initializer);
      if (typeof state === 'string' && ABSENT_STATES.has(state)) at(ts.findAncestor(node, ts.isCallExpression) ?? node, 'negative');
    }
    // … or a wait that can ask for absence, named without a call (bound, passed, `.apply`): what it waits for is unread.
    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && absenceWait(member(node)!.name) && !called(node)) at(node, 'negative');
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
    if (absenceWait(key)) at(node, 'negative');
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
    const hash = (n: ts.Node): boolean => (textRoot(n) && fold(n).includes('#')) || ts.forEachChild(n, hash) === true;
    if (file !== HARNESS && named(call.expression, 'goto') && call.arguments.some(hash)) at(call, 'goto');
    // negative: a poll not proven to wait for presence.
    if (isPoll(call)) {
      const m = matcherOf(call);
      if (!waitsForPresence(evaluate(call.arguments[0]), m)) at(m?.call ?? call, 'negative');
    }
    // negative: a `waitFor…` that may pass on what never came (the wait table), called directly, by `.call` or `.apply`.
    // `.apply`'s list is one value the table cannot read.
    let wait = member(call.expression);
    let args: readonly ts.Expression[] | undefined = call.arguments;
    if ((wait?.name === 'call' || wait?.name === 'apply') && member(wait.of)) {
      args = wait.name === 'call' ? args.slice(1) : undefined;
      wait = member(wait.of);
    }
    const waitName = wait?.name;
    if (absenceWait(waitName) && (!args || waitMayPassOnAbsence(waitName, args))) at(call, 'negative');
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

// ---------------------------------------------------------------------------
// SUPPORTED: every spelling class the contract names, at every position it
// names, with the verdict the POLICY gives — a static name one verdict, an
// unknown name the fail-closed one, or the `EXCLUDED` class it falls in where
// the contract does not check it. The verdict is read off the class alone, never through the scanner's own
// readers, so a cell cannot pass by agreeing with itself.
// ---------------------------------------------------------------------------
/** A verdict, or the `EXCLUDED` class the cell falls in. */
type Want = Rule[] | { unchecked: string };
const code = (n: string) => n.codePointAt(0)!.toString(16);
const uEsc = (n: string) => `\\u${code(n).padStart(4, '0')}${n.slice(1)}`;
const xEsc = (n: string) => `\\x${code(n).padStart(2, '0')}${n.slice(1)}`;
const cpEsc = (n: string) => `\\u{${code(n)}}${n.slice(1)}`;
const [head, tail] = [(n: string) => n.slice(0, 4), (n: string) => n.slice(4)];
/** Static text as the parts of a string expression: literal, escaped, folded. */
const TEXT: Record<string, (n: string) => string> = {
  string: (n) => `'${n}'`,
  'unicode-escaped string': (n) => `'${uEsc(n)}'`,
  'code-point-escaped string': (n) => `'${cpEsc(n)}'`,
  'hex-escaped string': (n) => `'${xEsc(n)}'`,
  template: (n) => `\`${n}\``,
  'escaped template': (n) => `\`${uEsc(n)}\``,
  concatenation: (n) => `'${head(n)}' + '${tail(n)}'`,
  interpolation: (n) => `\`${head(n)}\${'${tail(n)}'}\``,
  'as const': (n) => `('${n}' as const)`,
};
/** …and, for a page script only, text the page cooks again. */
const SCRIPT: Record<string, (n: string) => string> = {
  ...TEXT,
  'page-escaped string': (n) => `'${uEsc(n).replace('\\', '\\\\')}'`,
  'page-escaped raw template': (n) => `String.raw\`${uEsc(n)}\``,
};
const MEMBER: Record<string, (n: string) => string> = {
  identifier: (n) => `.${n}`,
  'escaped identifier': (n) => `.${uEsc(n)}`,
  'optional chain': (n) => `?.${n}`,
  ...Object.fromEntries(Object.entries(TEXT).map(([k, f]) => [`[${k}]`, (n: string) => `[${f(n)}]`])),
  '?.[string]': (n) => `?.['${n}']`,
};
const KEY: Record<string, (n: string) => string> = {
  identifier: (n) => n,
  'escaped identifier': uEsc,
  string: (n) => `'${n}'`,
  'escaped string': (n) => `'${uEsc(n)}'`,
  ...Object.fromEntries(Object.entries(TEXT).map(([k, f]) => [`[${k}]`, (n: string) => `[${f(n)}]`])),
};
/** The one unknown spelling per position: a name only the run decides. */
/** A literal: static text that is not folded from pieces. */
const { concatenation, interpolation, ...LITERAL } = TEXT;
const UNKNOWN_SPELLING = { member: '[k]', key: '[k]', text: 'k', script: 'k', literal: 'k', folded: 'k' } as const;
const SPELLINGS = { member: MEMBER, key: KEY, text: TEXT, script: SCRIPT, literal: LITERAL, folded: { concatenation, interpolation } };

type Position = { names: readonly string[]; as: keyof typeof SPELLINGS; code: (s: string, n: string) => string; known: Want; unknown: Want };
const READ_NAMES = Object.keys(READS);
const absentOf = (n: string) => String(READS[n]);
const presentOf = (n: string) => (typeof READS[n] === 'number' ? '1' : String(!READS[n]));
const TIMERS = ['waitForTimeout', 'setTimeout', 'setInterval'];
const on = (n: string) => (n === 'waitForTimeout' ? 'page' : 'globalThis');
const WAITS = ['waitFor', 'waitForSelector'];
const OTHER_WAITS = ['waitForElementState', 'waitForURL', 'waitForFunction', 'waitForAnythingElse'];
const EVENTS = ['waitForEvent', 'waitForRequest', 'waitForResponse', 'waitForLoadState', 'waitForNavigation'];
const [waitOn, before] = [(n: string) => (n === 'waitFor' ? 'toast' : 'page'), (n: string) => (n === 'waitFor' ? '' : "'x', ")];
const DESTRUCTURING = [(k: string) => `const { ${k}: v } = box;`, (k: string) => `({ ${k}: v } = box);`, (k: string) => `async function f({ ${k}: v }) {}`, (k: string) => `try {} catch ({ ${k}: v }) {}`, (k: string) => `for (const { ${k}: v } of boxes);`, (k: string) => `for ({ ${k}: v } of boxes);`];
const PROTO_MATCHERS = ['toEqual', 'toStrictEqual'];
const PROTO_SUBJECTS = ['q()', 'box.isVisible()'];
const PROTO_PLACES = [(o: string) => o, (o: string) => `{ b: 'y', c: ${o} }`, (o: string) => `['y', ${o}]`];
/** Every leaf kind: full, each empty kind, and an unknown one. */
const PROTO_LEAVES = ["'x'", "''", '0', 'false', 'null', 'undefined', '[]', '{}', 'k'];
const POLICY: Position[] = [
  // A read: judged at its absent value in an assertion, refused outside one.
  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}()).toBe(${presentOf(n)});`, known: ['positive'], unknown: ['positive'] },
  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}()).toBe(${absentOf(n)});`, known: [], unknown: ['positive'] },
  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}.call(box)).toBe(${presentOf(n)});`, known: ['positive'], unknown: ['positive'] },
  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}.apply(box, [])).toBe(${absentOf(n)});`, known: [], unknown: ['positive'] },
  { names: READ_NAMES, as: 'member', code: (s, n) => `await expect.poll(() => box${s}()).toBe(${absentOf(n)});`, known: ['negative'], unknown: ['negative'] },
  { names: READ_NAMES, as: 'member', code: (s, n) => `await expect.poll(() => box${s}()).toBe(${presentOf(n)});`, known: [], unknown: ['negative'] },
  { names: READ_NAMES, as: 'member', code: (s) => `const v = await box${s}();`, known: ['read'], unknown: { unchecked: 'computed-call' } },
  { names: READ_NAMES, as: 'member', code: (s) => `const f = box${s};`, known: ['read'], unknown: { unchecked: 'computed-member' } },
  ...DESTRUCTURING.map((d): Position => ({ names: READ_NAMES, as: 'key', code: (s) => d(s), known: ['read'], unknown: ['read'] })),
  // A timer: a sleep wherever it is named.
  { names: TIMERS, as: 'member', code: (s, n) => `await ${on(n)}${s}(1);`, known: ['sleep'], unknown: { unchecked: 'computed-call' } },
  { names: TIMERS, as: 'member', code: (s, n) => `const w = ${on(n)}${s};`, known: ['sleep'], unknown: { unchecked: 'computed-member' } },
  { names: TIMERS, as: 'member', code: (s, n) => `${on(n)}${s}.call(${on(n)}, go, 1);`, known: ['sleep'], unknown: { unchecked: 'computed-member' } },
  { names: TIMERS, as: 'key', code: (s, n) => `const { ${s}: w } = ${on(n)};`, known: ['sleep'], unknown: ['read'] },
  { names: TIMERS, as: 'text', code: (s, n) => `Reflect.get(${on(n)}, ${s});`, known: ['sleep'], unknown: { unchecked: 'binding-piece' } },
  { names: TIMERS, as: 'script', code: (s) => `await page.addInitScript(${s} + '(go, 1)');`, known: ['sleep'], unknown: { unchecked: 'binding-piece' } },
  // A wait that can ask for absence: negative unless its options are read as presence.
  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}(${before(n)}{ state: 'hidden' });`, known: ['negative'], unknown: ['negative'] },
  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}(${before(n)}{ state: 'visible' });`, known: [], unknown: { unchecked: 'computed-call' } },
  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}(${before(n)}opts);`, known: ['negative'], unknown: { unchecked: 'computed-call' } },
  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}.call(${waitOn(n)}, ${before(n)}{ state: 'visible' });`, known: [], unknown: { unchecked: 'computed-member' } },
  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}.call(${waitOn(n)}, ${before(n)}opts);`, known: ['negative'], unknown: { unchecked: 'computed-member' } },
  { names: WAITS, as: 'member', code: (s, n) => `const w = ${waitOn(n)}${s};`, known: ['negative'], unknown: { unchecked: 'computed-member' } },
  { names: WAITS, as: 'key', code: (s, n) => `const { ${s}: w } = ${waitOn(n)};`, known: ['negative'], unknown: ['read'] },
  // Every other wait name: absence-capable ones are negative wherever named, event waits are not.
  { names: OTHER_WAITS, as: 'member', code: (s) => `const w = page${s};`, known: ['negative'], unknown: { unchecked: 'computed-member' } },
  { names: OTHER_WAITS, as: 'key', code: (s) => `const { ${s}: w } = page;`, known: ['negative'], unknown: ['read'] },
  { names: EVENTS, as: 'member', code: (s) => `const w = page${s};`, known: [], unknown: { unchecked: 'computed-member' } },
  { names: EVENTS, as: 'key', code: (s) => `const { ${s}: w } = page;`, known: [], unknown: ['read'] },
  ...WAITS.flatMap((w): Position[] => [
    { names: ['state'], as: 'key', code: (s) => `await ${waitOn(w)}.${w}(${before(w)}{ ${s}: 'detached' });`, known: ['negative'], unknown: ['negative'] },
    { names: ['state'], as: 'key', code: (s) => `await ${waitOn(w)}.${w}(${before(w)}{ ${s}: 'attached' });`, known: [], unknown: ['negative'] },
  ]),
  // `state`'s value is judged only as a literal; folded or not, any other text is unknown.
  { names: ['hidden', 'detached'], as: 'text', code: (s) => `await toast.waitFor({ state: ${s} });`, known: ['negative'], unknown: ['negative'] },
  { names: ['visible', 'attached'], as: 'literal', code: (s) => `await toast.waitFor({ state: ${s} });`, known: [], unknown: ['negative'] },
  { names: ['visible', 'attached'], as: 'folded', code: (s) => `await toast.waitFor({ state: ${s} });`, known: ['negative'], unknown: ['negative'] },
  // The assertion's own names.
  { names: ['toBe'], as: 'member', code: (s) => `expect(await box.isVisible())${s}(true);`, known: ['positive'], unknown: ['positive'] },
  { names: ['toBe'], as: 'member', code: (s) => `expect(await box.isVisible())${s}(false);`, known: [], unknown: ['positive'] },
  { names: ['toBe'], as: 'member', code: (s) => `await expect.poll(() => box.count())${s}(1);`, known: [], unknown: ['negative'] },
  { names: ['toBe'], as: 'member', code: (s) => `await expect.poll(() => q())${s}('x');`, known: [], unknown: ['negative'] },
  { names: ['toBe'], as: 'member', code: (s) => `await expect.poll(() => q())${s}(null);`, known: ['negative'], unknown: ['negative'] },
  { names: ['not'], as: 'member', code: (s) => `expect(await box.isVisible())${s}.toBe(false);`, known: ['positive'], unknown: ['positive'] },
  { names: ['not'], as: 'member', code: (s) => `expect(await box.isVisible())${s}.toBe(true);`, known: [], unknown: ['positive'] },
  { names: ['not'], as: 'member', code: (s) => `await expect.poll(() => box.count())${s}.toBe(1);`, known: ['negative'], unknown: ['negative'] },
  { names: ['resolves'], as: 'member', code: (s) => `await expect(box.isVisible())${s}.toBe(true);`, known: ['positive'], unknown: ['positive'] },
  { names: ['resolves'], as: 'member', code: (s) => `await expect(box.isVisible())${s}.toBe(false);`, known: [], unknown: ['positive'] },
  { names: ['rejects'], as: 'member', code: (s) => `await expect(box.isVisible())${s}.toBe(false);`, known: ['positive'], unknown: ['positive'] },
  { names: ['soft'], as: 'member', code: (s) => `expect${s}(await box.isVisible()).toBe(true);`, known: ['positive'], unknown: ['read'] },
  { names: ['soft'], as: 'member', code: (s) => `expect${s}(await box.isVisible()).toBe(false);`, known: [], unknown: ['read'] },
  { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => box.count()).toBe(0);`, known: ['negative'], unknown: ['read'] },
  { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => box.count()).toBe(1);`, known: [], unknown: ['read'] },
  { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => q()).toBe(null);`, known: ['negative'], unknown: { unchecked: 'unknown-assertion' } },
  { names: ['a'], as: 'key', code: (s) => `await expect.poll(() => q()).toEqual({ ${s}: 'x' });`, known: [], unknown: ['negative'] },
  { names: ['a'], as: 'key', code: (s) => `await expect.poll(() => q()).toEqual({ ${s}: '' });`, known: ['negative'], unknown: ['negative'] },
  // `__proto__` as an expected object's key is never judged: whatever its leaf, wherever the
  // object sits, a poll of a value or of a read fails closed.
  ...PROTO_MATCHERS.flatMap((matcher) =>
    PROTO_SUBJECTS.flatMap((subject) =>
      PROTO_PLACES.flatMap((place) =>
        PROTO_LEAVES.map((leaf): Position => ({
          names: ['__proto__'],
          as: 'key',
          code: (s) => `await expect.poll(() => ${subject}).${matcher}(${place(`{ a: 'x', ${s}: ${leaf} }`)});`,
          known: ['negative'],
          unknown: ['negative'],
        })),
      ),
    ),
  ),
  // A raw hash navigation: by its method's name and its URL's runtime text.
  { names: ['goto'], as: 'member', code: (s) => `await page${s}(\`\${origin}#/items\`);`, known: ['goto'], unknown: { unchecked: 'computed-call' } },
  { names: ['#/items'], as: 'text', code: (s) => `await page.goto(origin + ${s});`, known: ['goto'], unknown: { unchecked: 'binding-piece' } },
];
/** Every cell: [source, the policy's verdict, the spelling class it exercises]. */
const SUPPORTED: [string, Want, string][] = POLICY.flatMap((p) =>
  p.names.flatMap((n) => [
    ...Object.entries(SPELLINGS[p.as]).map(([cls, spell]): [string, Want, string] => [p.code(spell(n), n), p.known, `${p.as} ${cls}`]),
    [p.code(UNKNOWN_SPELLING[p.as], n), p.unknown, `${p.as} unknown`] as [string, Want, string],
  ]),
);

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

    // INTERACTIONS: each supported judgement through the shapes it composes
    // with — helpers, arrays, `.catch`, `!`, the presence and wait tables —
    // checked against what each read returns when the thing is absent. One
    // table, so a run shows every miss at once.
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
      // the assertion by its spellings: soft, a computed matcher, resolves, a not by name
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
      // a POLLED absence, by its spellings, is a negative to ledger
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
      // A helper exported IN ANY FORM has its callers elsewhere: its read is judged where it stands, once.
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
      // …an absence by any waitFor, its state in each supported form…
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
      // A TIMER NAME is its runtime text: escapes cooked (unicode, code point,
      // hex), pieces folded, and a page script's own escapes cooked again —
      // called, referenced, destructured or passed as a name.
      ["await page['waitFor\\u0054imeout'](300);", ['sleep']],
      ["await page['waitFor\\u{54}imeout'](300);", ['sleep']],
      ["await page['waitFor\\u{0054}imeout'](300);", ['sleep']],
      ["await page['\\x77aitForTimeout'](300);", ['sleep']],
      ['await page[`waitFor\\u0054imeout`](300);', ['sleep']],
      ["await page[`waitFor${'\\u0054'}imeout`](300);", ['sleep']],
      ["await page['waitFor' + '\\x54imeout'](300);", ['sleep']],
      ["const w = page['waitFor\\u0054imeout'];", ['sleep']],
      ["const { 'waitFor\\u0054imeout': w } = page;", ['sleep']],
      ["const { ['set\\u0054imeout']: s } = globalThis;", ['sleep']],
      ["Reflect.get(page, 'waitFor\\x54imeout');", ['sleep']],
      ['await page.waitFor\\u0054imeout(300);', ['sleep']],
      ['const { waitFor\\u{54}imeout } = page;', ['sleep']],
      ['await page.addInitScript("set\\\\u0054imeout(go, 100)");', ['sleep']],
      ['await page.addInitScript("window[\'set\\\\x54imeout\'](go, 100)");', ['sleep']],
      ['await page.addInitScript("window[\'set\\\\124imeout\'](go, 100)");', ['sleep']],
      ['await page.addInitScript(String.raw`set\\u0054imeout(go, 100)`);', ['sleep']],
      // A raw hash navigation is its runtime URL however the `#` is written.
      ['await page.goto(`${origin}\\u0023/items`);', ['goto']],
      ["await page.goto(origin + '\\x23/items');", ['goto']],
      // EVERY WAIT that can ask for absence (playwright-core's types) is read
      // where it asks — options, a positional state, a URL matcher, a page
      // function — and is a negative when the scan cannot read it, in any
      // calling form; a wait for an event cannot pass on nothing.
      ["async function f(options) {\n  await page.waitForSelector('x', options);\n}", ['negative']],
      ["await page.waitForSelector('x', open ? a : b);", ['negative']],
      ["await page.waitForSelector('x', opts());", ['negative']],
      ['await page.waitForSelector(...args);', ['negative']],
      ["await page.waitForSelector('x', ...rest);", ['negative']],
      ["await page.waitForSelector('x');", []],
      ['await page.waitForSelector(sel, { timeout: 1 });', []],
      ["await page.waitForSelector.call(page, 'x', { state: gone });", ['negative']],
      ["await page.waitForSelector.call(page, 'x', { state: 'attached' });", []],
      ["await page.waitForSelector.apply(page, ['x', o]);", ['negative']],
      ['const w = page.waitForSelector.bind(page);', ['negative']],
      ['const { waitForSelector } = page;', ['negative']],
      ["await Reflect.apply(page.waitForSelector, page, ['x', o]);", ['negative']],
      ["await toast.waitFor({ ...o, state: 'hidden' });", ['negative']],
      ["await handle.waitForElementState('hidden');", ['negative']],
      ['await handle.waitForElementState(s);', ['negative']],
      ["await handle.waitForElementState('visible');", []],
      ["await page.waitForFunction(() => !document.querySelector('x'));", ['negative']],
      ["await page.waitForURL((u) => !u.href.includes('q='));", ['negative']],
      ['await page.waitForURL(/^(?!.*q=)/);', ['negative']],
      ['await page.waitForURL(url);', ['negative']],
      ["await page.waitForURL('**');", ['negative']],
      ['await page.waitForURL(/#\\/active/, { timeout: 1 });', []],
      ["await page.waitForURL('http://x/#/items');", []],
      ["await page.waitForEvent('popup', pick);", []],
      ["await page.waitForRequest((r) => !r.url().includes('x'));", []],
      ['await page.waitForLoadState(s);', []],
      ["await page.waitForSomething('x');", ['negative']],
    ];
    expect(spellings.filter(([code, want]) => JSON.stringify(rules(code)) !== JSON.stringify(want)).map(([code, want]) => `${code} → ${JSON.stringify(rules(code))}, want ${JSON.stringify(want)}`)).toEqual([]);

    // THE CONTRACT'S MATRIX: every supported spelling at every supported
    // position gets the policy's verdict; an unchecked cell is asserted nothing.
    const judged = SUPPORTED.filter((c): c is [string, Rule[], string] => Array.isArray(c[1]));
    expect(judged.length).toBeGreaterThan(2000);
    expect(judged.filter(([src, want]) => JSON.stringify(rules(src)) !== JSON.stringify(want)).map(([src, want, cls]) => `${cls}: ${src} → ${JSON.stringify(rules(src))}, want ${JSON.stringify(want)}`)).toEqual([]);
    // No cell is vacuous: an escaped spelling holds a backslash for the scanner to cook, and each name's spellings differ.
    for (const [kind, table] of Object.entries(SPELLINGS))
      for (const n of ['count', 'state', '#/items']) {
        const spelled = Object.entries(table).map(([cls, f]) => [cls, f(n)]);
        expect(spelled.filter(([cls, src]) => /escaped/.test(cls) && !src.includes('\\')).map(([cls]) => `${kind} ${cls}`)).toEqual([]);
        expect(new Set(spelled.map(([, src]) => src)).size, `${kind} ${n}`).toBe(spelled.length);
      }
    // Every unchecked cell falls in a declared EXCLUDED class.
    const ids = new Set(EXCLUDED.map((e) => e.id));
    expect(SUPPORTED.flatMap(([src, want]) => (Array.isArray(want) || ids.has(want.unchecked) ? [] : [`${want.unchecked}: ${src}`]))).toEqual([]);
    // The boundary is one line: nothing excluded is also a judged cell or a judged interaction.
    const asserted = new Set([...judged.map(([src]) => src), ...spellings.map(([src]) => src)]);
    expect(EXCLUDED.filter((e) => asserted.has(e.example)).map((e) => e.class)).toEqual([]);
  });
});
