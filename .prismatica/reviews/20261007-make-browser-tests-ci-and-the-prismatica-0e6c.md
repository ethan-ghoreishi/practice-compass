---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
patchId: f0de497bc9886c8f3a8405ce6e46c958858c13d5
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: journey-wait-guard-complete-enforcement
    summary: "[P2] Define a finite recognition contract for the journey-wait guard
      and align its documentation, tests and enforcement claims with that
      boundary."
    counterexample: "The current scanner combines broad claims such as enforcement
      across every spelling with explicit exclusions, but does not define a
      stable supported syntax boundary. This makes family closure depend on
      discovering further JavaScript spellings rather than satisfying a finite
      contract. Closure requires: explicitly define the supported syntax classes
      and semantic judgements; fail closed or require a ledger entry when
      meaning is unknown within that boundary; identify excluded syntax as
      unchecked rather than proved safe; align scanner documentation, lane
      claims and the exact named ac-7 test with that definition; prove the
      supported classes and relevant interactions through a fixed policy-derived
      matrix, retaining the current repository sweep and exact ledger
      accounting. The stopping rule must state that a future counterexample
      blocks this family only when it violates the supported recognition
      contract or exposes an actual unreliable repository consumer; an
      explicitly excluded spelling alone is a possible extension. The previously
      identified syntax-specific bypasses are withdrawn as standalone blockers.
      Further analyser expansion is not required if boundary clarification and
      aligned proof close this issue."
createdAt: 2026-10-08T20:47:24.728Z
sealedAt: 2026-10-08T21:06:32.874Z
---

# Review: Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/49
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Diff patch-id:** `f0de497bc9886c8f3a8405ce6e46c958858c13d5`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified


## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, the findings
that review recorded, and the paths the rework touched — read any file you need
from the lane. The same Check already bound to this head is not to be rerun
wholesale.

Verify each prior finding's FAMILY across every consumer in the repository, not
only the lines this rework changed: a family is closed when no instance of its
invariant survives anywhere, and a fix that reached one consumer while a sibling
still breaks it is not closed.

**Approved intent:** `.prismatica/intents/20261007-make-browser-tests-ci-and-the-prismatica-0e6c.md`

**Findings from the previous review:**

- **journey-wait-guard-complete-enforcement** — [P2] ac-7 still fails open for escaped static timer names and unreadable waitForSelector options. Every recognisable prohibited wait must receive a judgement or ledger entry.
  _counterexample:_ On HEAD 32c3721, scan() accepts await page['waitFor\u0054imeout'](300); although its runtime key is waitForTimeout. All tested Unicode/hex/code-point escape variants and called/reference/destructuring timer forms bypass recognition. Separately, async function f(options) { await page.waitForSelector('x', options); } produces no finding although unknown options may request disappearance without a proved prior presence. No current journey uses either bypass. Repair both shared recognition paths and add discriminating rows to the exact named ac-7 test. Preserve the documented genuinely-dynamic-member boundary and fix the abstraction rather than these examples only.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 29f359caab49e5773ac0e6619e34362c1316199e..760d0deb981ad49935abc34982e7973eb9439c63 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -63,10 +63,16 @@ wrong, measured instead.
   is a second path), an uncalled or destructured read method is a read, a helper
   exported by name is judged where it stands, and only plain-text `toMatch`
   alternatives prove presence (a regex's sense is as invisible as a boolean's).
-  Every name it decides by (a read, a matcher, a timer, `state`) goes through one
-  reader, `keyOf`, which folds a static computed key (`['is' + 'Visible']`) and
-  calls one it cannot fold unsafe, as is a `state` on any `waitFor…` it cannot
-  read; each consumer read names its own way, so each spelling opened a sibling.
+  Every name it decides by (a read, a matcher, `state`) goes through one reader,
+  `keyOf`, which folds a static computed key (`['is' + 'Visible']`) and calls one
+  it cannot fold unsafe; each consumer read names its own way, so each spelling
+  opened a sibling. Timer names and goto URLs are judged by a string's runtime
+  text (escapes cooked, pieces folded, a page script's escapes cooked again): raw
+  source text let `'waitFor\u0054imeout'` and an escaped `#` through. Every wait
+  that can ask for absence is read where Playwright's types let it ask (options,
+  `waitForElementState`'s state, `waitForURL`'s matcher, `waitForFunction`'s page
+  function) in any calling form, and unread is negative; a `state:`-key hunt
+  missed options passed as a variable.
   Its ledger says why each exception
   stands and how many sites it covers. 44 positive reads
   became `expect.poll` with the same matcher. Two polled negatives that followed a
diff --git a/tests/journey-waits.test.ts b/tests/journey-waits.test.ts
index f39b0fcf71b0525c3911fa4d7518c0dff61e558f..d272de109ab57076c545011ffd4b36ec58eec52a 100644
--- a/tests/journey-waits.test.ts
+++ b/tests/journey-waits.test.ts
@@ -16,7 +16,8 @@ import { describe, expect, it } from 'vitest';
 // still counts. Six rules, each deny-by-default:
 //   sleep     no reference to `waitForTimeout`, `setTimeout` or `setInterval`
 //             — a call, a `.bind`, an import, a page script, a folded key —
-//             and no wait
+//             by its RUNTIME text (escapes cooked, `+` and `${}` folded, a page
+//             script's own escapes cooked again), and no wait
 //             (`waitFor…`, an assertion) whose failure a `.catch` swallows:
 //             when the thing never comes, that is a timer;
 //   poller    no `while`, `do` or `for(;;)`-style loop that awaits —
@@ -61,10 +62,18 @@ import { describe, expect, it } from 'vitest';
 //             `toBeGreaterThan(n >= 0)`, `toBeGreaterThanOrEqual(n > 0)`,
 //             `toHaveLength(n > 0)`. Everything else is negative: `.not`, no
 //             matcher, a variable, an unknown matcher, a boolean (its sense —
-//             `!t.includes(x)` — is invisible). So is any `waitFor…` with
-//             `state: 'detached' | 'hidden'`, a state it cannot read (a
-//             variable, an expression, a getter), or options it cannot read;
-//   goto      no raw `page.goto` to a hash route outside the harness: `goTo`
+//             `!t.includes(x)` — is invisible). So is every wait that may pass
+//             on what never came, read where Playwright's types let it ask:
+//             `state: 'detached' | 'hidden'` anywhere; `waitFor`/
+//             `waitForSelector` options it cannot read (a variable, a call, a
+//             spread, an unfoldable key, a state that is not a literal);
+//             `waitForElementState('hidden')` or an unread state; `waitForURL`
+//             unless a plain regex or glob-free URL; `waitForFunction` (a page
+//             function's sense is invisible); a `waitFor…` not in the table; and
+//             any of these by `.apply`, `.bind`, destructuring or passing. Event
+//             waits (`waitForEvent`, `…Request`, `…Response`, `…LoadState`,
+//             `…Navigation`) need something to happen, so cannot;
+//   goto      no raw `page.goto` to a hash route (by runtime text) outside the harness: `goTo`
 //             is the navigation that waits for the destination.
 // `expect`, `expect.soft`, `.poll` and every matcher are matched by name in
 // any spelling (`expect['poll']`, `['not']`). Every NAME — a read, a matcher,
@@ -81,7 +90,11 @@ import { describe, expect, it } from 'vitest';
 // (`x[k]()` may be anything; inside one it is refused), a computed member
 // named without a call (`x[k]` is indexing, everywhere and indistinguishable
 // from a read method, where destructuring a locator is not), a name passed as
-// an argument (`Reflect.get(x, 'count')`), an aliased `expect`,
+// an argument (`Reflect.get(x, 'count')`), an aliased `expect`, a name or
+// URL with a piece held in any binding (`const` included) or computed by a
+// call (`page['waitFor' + t]`, `'a'.concat(b)`) (runtime text is what an
+// expression built from literals alone evaluates to; a binding holding the
+// WHOLE name is still caught, as its literal is scanned),
 // a helper exported to another file in any spelling (`export function`,
 // `export { rows }`, `export default rows`: its read is judged where it
 // stands, as there is no caller here to judge), and Playwright's own
@@ -126,6 +139,12 @@ const LEDGER: { file: string; rule: Rule; snippet: string; sites?: number; why:
     snippet: 'waitForTimeout(ms)',
     why: 'quietWindow: the one bounded window for a NEGATIVE claim, called only after a positive signal',
   },
+  {
+    file: 'practiceBrowser.ts',
+    rule: 'negative',
+    snippet: 'page.waitForFunction( ([old, text]) =>',
+    why: "goTo's arrival: true only once a rendered <main> exists whose heading element or text differs from the outgoing one captured before navigating, and a Primary-nav presence wait follows; the N1 self-test fails the pre-fix goTo in both engines",
+  },
   {
     file: 'practice-cues.browser.test.ts',
     rule: 'sleep',
@@ -448,6 +467,88 @@ function constant(node: ts.Expression): string | number | typeof UNKNOWN {
   return UNKNOWN;
 }
 const text = (v: string | number | typeof UNKNOWN) => (v === UNKNOWN ? v : String(v));
+
+/**
+ * A string expression's RUNTIME text — escapes cooked, `+` and `${}` folded, a
+ * tagged template's raw text — with NUL where a part is not static.
+ */
+function fold(node: ts.Expression): string {
+  const e = bare(node);
+  const raw = (t: ts.TemplateLiteralLikeNode) => t.rawText ?? t.text;
+  if (ts.isTaggedTemplateExpression(e)) {
+    const t = e.template;
+    return ts.isNoSubstitutionTemplateLiteral(t) ? raw(t) : raw(t.head) + t.templateSpans.map((s) => fold(s.expression) + raw(s.literal)).join('');
+  }
+  if (ts.isStringLiteralLike(e)) return e.text;
+  if (ts.isTemplateExpression(e)) return e.head.text + e.templateSpans.map((s) => fold(s.expression) + s.literal.text).join('');
+  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) return fold(e.left) + fold(e.right);
+  return '\0';
+}
+/** Is this a whole string expression — not a piece of a larger `+`, template or tagged template? */
+function textRoot(node: ts.Node): node is ts.Expression {
+  const kind =
+    ts.isStringLiteralLike(node) || ts.isTemplateExpression(node) || ts.isTaggedTemplateExpression(node) || (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken);
+  let p = node.parent;
+  while (p && (ts.isParenthesizedExpression(p) || ts.isAsExpression(p) || ts.isSatisfiesExpression(p) || ts.isNonNullExpression(p))) p = p.parent;
+  return kind && !(ts.isTemplateSpan(p) || ts.isTaggedTemplateExpression(p) || (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.PlusToken));
+}
+const ESCAPE = /\\+(?:u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|([0-7]{1,3}))|\\+\r?\n/g;
+/** Text a page script cooks again: every escape layer decoded (`\\u0054`, `\\x54`, `\\124` → `T`), so a name under any of them is the name. */
+function decode(s: string): string {
+  for (let prev = ''; prev !== s; ) {
+    prev = s;
+    s = s.replace(ESCAPE, (all, cp, u, x, o) => {
+      if (cp === undefined && u === undefined && x === undefined && o === undefined) return '';
+      const n = o !== undefined ? parseInt(o, 8) : parseInt(cp ?? u ?? x, 16);
+      return n <= 0x10ffff ? String.fromCodePoint(n) : all;
+    });
+  }
+  return s;
+}
+
+/** A wait that may pass on what never came, read where Playwright lets it ask (playwright-core's types). */
+const ABSENT_STATES = new Set(['detached', 'hidden']);
+/** Waits for an EVENT — something must happen, so none can pass on nothing; `waitForTimeout` is a sleep, judged as one. */
+const EVENT_WAITS = new Set(['waitForEvent', 'waitForRequest', 'waitForResponse', 'waitForLoadState', 'waitForNavigation', 'waitForTimeout']);
+const absenceWait = (name: string | typeof UNKNOWN | undefined): name is string => typeof name === 'string' && name.startsWith('waitFor') && !EVENT_WAITS.has(name);
+/** Options that may ask for absence: not an object literal, a spread, a key `keyOf` cannot fold, or a `state` that is not a literal presence. */
+function optionsMayAskAbsence(a: ts.Expression): boolean {
+  const e = bare(a);
+  if (!ts.isObjectLiteralExpression(e)) return true;
+  return e.properties.some((p) => {
+    if (ts.isSpreadAssignment(p) || !p.name) return true;
+    const key = keyOf(p.name);
+    if (key !== 'state') return key === UNKNOWN;
+    const state = ts.isPropertyAssignment(p) ? literal(p.initializer) : UNKNOWN;
+    return typeof state !== 'string' || ABSENT_STATES.has(state);
+  });
+}
+/** A URL matcher that names a URL to be AT: plain regex alternatives (as `toMatch`), or a string with no glob in it. */
+function urlPresence(a: ts.Expression): boolean {
+  const e = bare(a);
+  if (ts.isRegularExpressionLiteral(e)) return PLAIN_REGEX.test(e.text);
+  const url = constant(e);
+  return typeof url === 'string' && url !== '' && !/[*?[\]{}]/.test(url);
+}
+/** May this `waitFor…` call pass on what never came? Unknown waits, and anything the scan cannot read, may. */
+function waitMayPassOnAbsence(name: string, args: readonly ts.Expression[]): boolean {
+  if (EVENT_WAITS.has(name)) return false;
+  if (args.some(ts.isSpreadElement)) return true;
+  switch (name) {
+    case 'waitFor':
+      return args.length > 0 && optionsMayAskAbsence(args[0]);
+    case 'waitForSelector':
+      return args.length > 1 && optionsMayAskAbsence(args[1]);
+    case 'waitForElementState': {
+      const state = args[0] ? text(constant(args[0])) : UNKNOWN;
+      return state === UNKNOWN || ABSENT_STATES.has(state);
+    }
+    case 'waitForURL':
+      return !(args[0] && urlPresence(args[0]));
+    default: // `waitForFunction`: a page function's sense is as invisible as a boolean's; and any wait not in the table
+      return true;
+  }
+}
 /** THE one reading of a property name — `a`, `'a'`, `1`, `['a']`, `` [`a`] ``, `['is' + 'A']` — UNKNOWN for a key it cannot fold. */
 function keyOf(name: ts.PropertyName): string | typeof UNKNOWN {
   if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
@@ -620,8 +721,13 @@ function callEnd(text: string, from: number): number {
 export function scan(file: string, raw: string): Site[] {
   const sf = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
   const sites: Site[] = [];
-  const at = (node: ts.Node, rule: Rule, text = node.getText(sf), pos = node.getStart(sf)) =>
+  /** One negative per wait: its literal `state` and the wait table both read it. (Two reads in one assertion stay two sites.) */
+  const negatives = new Set<number>();
+  const at = (node: ts.Node, rule: Rule, text = node.getText(sf), pos = node.getStart(sf)) => {
+    if (rule === 'negative' && negatives.has(pos)) return;
+    if (rule === 'negative') negatives.add(pos);
     sites.push({ file, rule, line: sf.getLineAndCharacterOfPosition(pos).line + 1, text: text.replace(/\s+/g, ' ').trim() });
+  };
   const calls: ts.CallExpression[] = [];
   const identifiers: ts.Identifier[] = [];
   /** Local (unexported) functions by the name they are called by. */
@@ -653,26 +759,21 @@ export function scan(file: string, raw: string): Site[] {
       const ref = ts.isPropertyAccessExpression(node.parent) && node.parent.name === node ? node.parent : node;
       at(ts.isCallExpression(ref.parent) && ref.parent.expression === ref ? ref.parent : ref.parent, 'sleep');
     }
-    // … or a timer named inside a string or template: a page script, `page['waitForTimeout']`.
-    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
-      const text = node.getText(sf);
+    // … or a timer named by a string's RUNTIME text: a page script, `page['waitFor\u0054imeout']`, `['wait' + 'ForTimeout']`.
+    if (textRoot(node)) {
+      const text = decode(fold(node));
       for (const m of text.matchAll(SLEEP)) at(node, 'sleep', text.slice(m.index, callEnd(text, m.index + m[0].length)), node.getStart(sf) + m.index);
     }
     // poller: a loop that awaits — `persistedUntil` is the one.
     if ((ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isForStatement(node)) && hasAwait(node)) at(node, 'poller');
-    // … or a computed key folded from pieces no one string holds (`page['wait' + 'ForTimeout']`).
-    const folded = ts.isElementAccessExpression(node) ? node.argumentExpression : ts.isComputedPropertyName(node) ? node.expression : undefined;
-    const timer = folded && !ts.isStringLiteralLike(bare(folded)) ? text(constant(folded)) : UNKNOWN;
-    if (typeof timer === 'string' && TIMER.test(timer)) at(node.parent, 'sleep');
-    // negative: a wait for something to be GONE passes at once if it never came —
-    // `state: 'detached' | 'hidden'` however spelled, or a `waitFor…` state the scan cannot read (a getter's included).
-    if (ts.isObjectLiteralElementLike(node) && node.name && keyOf(node.name) === 'state') {
-      const state = ts.isPropertyAssignment(node) ? literal(node.initializer) : UNKNOWN;
-      const call = ts.findAncestor(node, ts.isCallExpression);
-      const waitName = call && member(call.expression)?.name;
-      if (state === 'detached' || state === 'hidden' || (typeof state !== 'string' && typeof waitName === 'string' && waitName.startsWith('waitFor')))
-        at(call ?? node, 'negative');
+    // negative: a wait for something to be GONE passes at once if it never came — `state: 'detached' | 'hidden'`
+    // however spelled, wherever it is written (the wait table below reads a state it cannot read).
+    if (ts.isPropertyAssignment(node) && keyOf(node.name) === 'state') {
+      const state = literal(node.initializer);
+      if (typeof state === 'string' && ABSENT_STATES.has(state)) at(ts.findAncestor(node, ts.isCallExpression) ?? node, 'negative');
     }
+    // … or a wait that can ask for absence, named without a call (bound, passed, `.apply`): what it waits for is unread.
+    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && absenceWait(member(node)!.name) && !called(node)) at(node, 'negative');
     // read: a read method named without being called — passed, aliased, bound, destructured — is a read nobody judges.
     if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && isRead(member(node)!.name) && !called(node)) refs.push(node);
     // A destructured key the scan cannot fold may be any method: a read too.
@@ -683,6 +784,7 @@ export function scan(file: string, raw: string): Site[] {
           ? keyOf(node.name)
           : undefined;
     if (key === UNKNOWN || isRead(key)) refs.push(node);
+    if (absenceWait(key)) at(node, 'negative');
     if (ts.isCallExpression(node)) calls.push(node);
     if (ts.isIdentifier(node)) identifiers.push(node);
     if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
@@ -851,19 +953,23 @@ export function scan(file: string, raw: string): Site[] {
   };
   for (const call of calls) {
     // goto: a raw hash navigation outside the harness.
-    if (file !== HARNESS && named(call.expression, 'goto') && call.arguments.some((a) => a.getText(sf).includes('#'))) at(call, 'goto');
+    const hash = (n: ts.Node): boolean => (textRoot(n) && fold(n).includes('#')) || ts.forEachChild(n, hash) === true;
+    if (file !== HARNESS && named(call.expression, 'goto') && call.arguments.some(hash)) at(call, 'goto');
     // negative: a poll not proven to wait for presence.
     if (isPoll(call)) {
       const m = matcherOf(call);
       if (!waitsForPresence(evaluate(call.arguments[0]), m)) at(m?.call ?? call, 'negative');
     }
-    // negative: a `waitFor…` whose options the scan cannot read — `waitFor`'s own a variable, any one's a spread or
-    // a key `keyOf` cannot fold — may be waiting for absence.
-    const name = member(call.expression)?.name;
-    const unread = (a: ts.Expression) => ts.isObjectLiteralExpression(a) && a.properties.some((p) => ts.isSpreadAssignment(p) || (p.name && keyOf(p.name) === UNKNOWN));
-    if (typeof name === 'string' && name.startsWith('waitFor') && call.arguments.some((a) => unread(bare(a))))
-      at(call, 'negative');
-    else if (name === 'waitFor' && call.arguments[0] && !ts.isObjectLiteralExpression(bare(call.arguments[0]))) at(call, 'negative');
+    // negative: a `waitFor…` that may pass on what never came (the wait table), called directly, by `.call` or `.apply`.
+    // `.apply`'s list is one value the table cannot read.
+    let wait = member(call.expression);
+    let args: readonly ts.Expression[] | undefined = call.arguments;
+    if ((wait?.name === 'call' || wait?.name === 'apply') && member(wait.of)) {
+      args = wait.name === 'call' ? args.slice(1) : undefined;
+      wait = member(wait.of);
+    }
+    const waitName = wait?.name;
+    if (absenceWait(waitName) && (!args || waitMayPassOnAbsence(waitName, args))) at(call, 'negative');
     // sleep: a wait whose failure is swallowed waits out its timeout when the thing never comes.
     const caught = named(call.expression, 'catch') ? bare(member(call.expression)!.of) : undefined;
     if (caught && ts.isCallExpression(caught) && isWait(caught)) at(call, 'sleep');
@@ -1225,6 +1331,65 @@ describe('journey waits', () => {
       ['await expect.poll(() => q()).toMatch(/pushed|in sync/i);', []],
       ['await expect.poll(() => q()).toMatch(/a\\.b/);', []],
       ['await expect.poll(() => page.url()).toMatch(/view=paths&inst=inst-tar/);', []],
+      // A TIMER NAME is its runtime text: escapes cooked (unicode, code point,
+      // hex), pieces folded, and a page script's own escapes cooked again —
+      // called, referenced, destructured or passed as a name.
+      ["await page['waitFor\\u0054imeout'](300);", ['sleep']],
+      ["await page['waitFor\\u{54}imeout'](300);", ['sleep']],
+      ["await page['waitFor\\u{0054}imeout'](300);", ['sleep']],
+      ["await page['\\x77aitForTimeout'](300);", ['sleep']],
+      ['await page[`waitFor\\u0054imeout`](300);', ['sleep']],
+      ["await page[`waitFor${'\\u0054'}imeout`](300);", ['sleep']],
+      ["await page['waitFor' + '\\x54imeout'](300);", ['sleep']],
+      ["const w = page['waitFor\\u0054imeout'];", ['sleep']],
+      ["const { 'waitFor\\u0054imeout': w } = page;", ['sleep']],
+      ["const { ['set\\u0054imeout']: s } = globalThis;", ['sleep']],
+      ["Reflect.get(page, 'waitFor\\x54imeout');", ['sleep']],
+      ['await page.waitFor\\u0054imeout(300);', ['sleep']],
+      ['const { waitFor\\u{54}imeout } = page;', ['sleep']],
+      ['await page.addInitScript("set\\\\u0054imeout(go, 100)");', ['sleep']],
+      ['await page.addInitScript("window[\'set\\\\x54imeout\'](go, 100)");', ['sleep']],
+      ['await page.addInitScript("window[\'set\\\\124imeout\'](go, 100)");', ['sleep']],
+      ['await page.addInitScript(String.raw`set\\u0054imeout(go, 100)`);', ['sleep']],
+      // …while a name only the run decides stays out of reach.
+      ['await page[k](300);', []],
+      ["async function f(t) {\n  await page['waitFor' + t](300);\n}", []],
+      // A raw hash navigation is its runtime URL however the `#` is written.
+      ['await page.goto(`${origin}\\u0023/items`);', ['goto']],
+      ["await page.goto(origin + '\\x23/items');", ['goto']],
+      ['await page.goto(url);', []],
+      // EVERY WAIT that can ask for absence (playwright-core's types) is read
+      // where it asks — options, a positional state, a URL matcher, a page
+      // function — and is a negative when the scan cannot read it, in any
+      // calling form; a wait for an event cannot pass on nothing.
+      ["async function f(options) {\n  await page.waitForSelector('x', options);\n}", ['negative']],
+      ["await page.waitForSelector('x', open ? a : b);", ['negative']],
+      ["await page.waitForSelector('x', opts());", ['negative']],
+      ['await page.waitForSelector(...args);', ['negative']],
+      ["await page.waitForSelector('x', ...rest);", ['negative']],
+      ["await page.waitForSelector('x');", []],
+      ['await page.waitForSelector(sel, { timeout: 1 });', []],
+      ["await page.waitForSelector.call(page, 'x', { state: gone });", ['negative']],
+      ["await page.waitForSelector.call(page, 'x', { state: 'attached' });", []],
+      ["await page.waitForSelector.apply(page, ['x', o]);", ['negative']],
+      ['const w = page.waitForSelector.bind(page);', ['negative']],
+      ['const { waitForSelector } = page;', ['negative']],
+      ["await Reflect.apply(page.waitForSelector, page, ['x', o]);", ['negative']],
+      ["await toast.waitFor({ ...o, state: 'hidden' });", ['negative']],
+      ["await handle.waitForElementState('hidden');", ['negative']],
+      ['await handle.waitForElementState(s);', ['negative']],
+      ["await handle.waitForElementState('visible');", []],
+      ["await page.waitForFunction(() => !document.querySelector('x'));", ['negative']],
+      ["await page.waitForURL((u) => !u.href.includes('q='));", ['negative']],
+      ['await page.waitForURL(/^(?!.*q=)/);', ['negative']],
+      ['await page.waitForURL(url);', ['negative']],
+      ["await page.waitForURL('**');", ['negative']],
+      ['await page.waitForURL(/#\\/active/, { timeout: 1 });', []],
+      ["await page.waitForURL('http://x/#/items');", []],
+      ["await page.waitForEvent('popup', pick);", []],
+      ["await page.waitForRequest((r) => !r.url().includes('x'));", []],
+      ['await page.waitForLoadState(s);', []],
+      ["await page.waitForSomething('x');", ['negative']],
     ];
     expect(spellings.filter(([code, want]) => JSON.stringify(rules(code)) !== JSON.stringify(want)).map(([code, want]) => `${code} → ${JSON.stringify(rules(code))}, want ${JSON.stringify(want)}`)).toEqual([]);
   });
```

**Paths the rework touched:**

- `DECISIONS.md`
- `tests/journey-waits.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
e890667 Add runtime-text timer, goto and wait-matrix rows to the wait guard, failing on 32c3721's scanner

`npx -y -p node@24 node node_modules/vitest/vitest.mjs run tests/journey-waits.test.ts`
fails 34 of the new rows here.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

3c6c82f Timer names, goto URLs and every absence-capable wait are judged by what runs

Invariant: wherever the wait guard decides by a name or URL, it reads the
value the expression has when built from literals alone (escapes cooked,
`+` and `${}` folded, a page script's own escapes cooked again), never its
source spelling; and every wait that can pass on what never came is read
where it asks, or counted as a negative. A piece held in any binding
(`const` included) or computed by a call stays the documented dynamic
boundary, the one reads already have, now named in the header; a binding
holding the WHOLE name is still caught, because its literal is scanned.

Two recognition paths read source instead:
- Timer names: the string scan matched raw text, so an escaped name
  (`'waitForTimeout'`, `\x77…`, `\u{54}`) in a call, reference,
  destructured key or `Reflect.get` argument reached no rule. Now `fold`
  gives every whole string expression's runtime text (a tagged template's
  raw text) and `decode` cooks a page script's own escape layers again; it
  replaces both the raw string scan and the separate folded-key branch, so
  each timer is reported once.
- Waits: a `state:`-key hunt only saw object literals. A closed table from
  playwright-core's types reads each wait where it can ask for absence:
  `waitFor`/`waitForSelector` options (a variable, call, spread, unfoldable
  key or non-literal state is negative), `waitForElementState`'s positional
  state, `waitForURL`'s matcher (plain regex or glob-free URL only),
  `waitForFunction` (a page function's sense is invisible), and an unknown
  `waitFor…` fails closed. `.call` is judged with shifted arguments;
  `.apply`, `.bind`, destructuring and passing are negative. Event waits
  (`waitForEvent`, `…Request`, `…Response`, `…LoadState`, `…Navigation`)
  need something to happen, so stay clean.

Consumers of the invariant:
- fixed: the goto rule read raw source (`getText`), so an escaped `#`
  slipped past; it reads runti
… (truncated)
```

## Check against the contract

- [ ] **ac-1** — N4: every workflow that runs the suite (discovered, never listed) has a job time bound, a bounded browser-install step, and apt mirror failover configured before `playwright install --with-deps`; CI offers the dispatch-only dead-mirror drill. Synthetic workflows missing any of these are reported. _(proof: every workflow that runs the test suite bounds its time and fails over from a dead package mirror)_
- [ ] **ac-2** — N4: every workflow that runs the suite sets up the same Node major, 24; a synthetic workflow on another major is reported. _(proof: every workflow that runs the test suite uses one Node major)_
- [ ] **ac-3** — N4: on pull_request only the Gate runs the suite, CI runs on branch pushes and dispatch, and every suite workflow cancels superseded runs with a concurrency group keyed by its own workflow; synthetic duplicates and an unkeyed group are reported. _(proof: the suite runs once per ref kind and superseded runs are cancelled)_
- [ ] **ac-4** — N4: deploy.yml's check job runs the same setup and check steps, in the same order, as ci.yml's check job (deploy adds only its upload and deploy steps); a synthetic divergence is reported. _(proof: the deploy check runs exactly the steps CI proves on every push)_
- [ ] **ac-5** — N1: in Chromium and WebKit, with slow page modules, goTo returns only after the destination has committed and the outgoing heading is gone. Covers a first-load lazy page, a cached page, the same page with new params, a focused route and a redirecting URL; a shared-heading pair passed an explicit arrival works, and one without it fails loudly. Fails on the pre-fix goTo. _(proof: navigation returns only once the destination page has rendered, in Chromium and WebKit, even when page modules load slowly)_
- [ ] **ac-6** — N2: in Chromium and WebKit, with `delayStorageMs` 1500, an action followed by reload() keeps the write and later reads observe it. The pre-fix 400 ms sleep loses it. _(proof: persisted reads and reload are ordered after every write the app has already issued, in Chromium and WebKit)_
- [ ] **ac-7** — N3: the static guard rejects synthetic offenders of all four rules (a sleep, a local poller, a positive point-in-time existence assertion, an unledgered polled negative) and finds none in the real journeys and harness. _(proof: browser journeys wait on events, never on fixed sleeps, hand-rolled pollers or positive point-in-time reads)_
- [ ] **ac-8** — N2 applied: every read of the effect-claimed signal marker waits for it to land and still asserts exactly one claim. _(proof: practice sound reuses one gesture primed context across all start and resume doors)_
- [ ] **ac-9** — N2 applied to routine boundaries, pause and save: persisted reads wait for effect-issued writes, and minutes stay exact. _(proof: practice cues preserve wall clock boundaries and every recorded minute)_
- [ ] **ac-10** — N1 applied: the WebKit 1280px failure path (Working notes count after reaching the active page) is deterministic. _(proof: practice information controls render accessible directional text at phone and desktop widths)_
- [ ] **ac-11** — N1/N3 applied: the repertoire navigation journey that failed four times is deterministic. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-12** — N3 applied: the transition-held select read stays polled and exact under 20× CPU slowdown. _(proof: repertoire search keeps every typed character under heavy cpu slowdown)_

## Flow impact — detected vs reported

**Detected from the diff:**

_none_

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

_No flow entries yet._


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## The builder's family proof plan

The builder was asked for one before this review: Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Find
where its commit messages say it lives; subtle work without one, or a plan
whose expected results come only from the implementation under test, is a
finding.

## Close each family in this round

A counterexample is one instance of an invariant. For every finding: name the
invariant it breaks (its family), sweep the repository for every instance of
that invariant — each consumer, sibling function and caller, not only this
diff — and list every instance you found plus the consumers you checked and
found clean. One round that names the whole family saves a round per instance.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-make-browser-tests-ci-and-the-prismatica-0e6c/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261007-make-browser-tests-ci-and-the-prismatica-0e6c' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-make-browser-tests-ci-and-the-prismatica-0e6c/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-make-browser-tests-ci-and-the-prismatica-0e6c/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
