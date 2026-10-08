---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
patchId: dbfac76f619631282d9bb22642b9225b9c78e1f9
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: journey-wait-guard-complete-enforcement
    summary: "[P2] ac-7 still fails open for escaped static timer names and
      unreadable waitForSelector options. Every recognisable prohibited wait
      must receive a judgement or ledger entry."
    counterexample: On HEAD 32c3721, scan() accepts await
      page['waitFor\u0054imeout'](300); although its runtime key is
      waitForTimeout. All tested Unicode/hex/code-point escape variants and
      called/reference/destructuring timer forms bypass recognition. Separately,
      async function f(options) { await page.waitForSelector('x', options); }
      produces no finding although unknown options may request disappearance
      without a proved prior presence. No current journey uses either bypass.
      Repair both shared recognition paths and add discriminating rows to the
      exact named ac-7 test. Preserve the documented genuinely-dynamic-member
      boundary and fix the abstraction rather than these examples only.
createdAt: 2026-10-08T20:21:37.509Z
sealedAt: 2026-10-08T20:27:27.940Z
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
- **Diff patch-id:** `dbfac76f619631282d9bb22642b9225b9c78e1f9`
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

- **journey-wait-guard-complete-enforcement** — [P2] ac-7 fails open for statically known computed destructuring keys. Every recognisable rendered-state read must reach a judgement or ledger entry.
  _counterexample:_ On HEAD 3cfbb69, scan() accepts const { ["isVisible"]: read } = box; expect(await Reflect.apply(read, box, [])).toBe(true). The same gap exists across the guarded read methods, string/no-substitution-template computed keys, and declaration/assignment/parameter destructuring. No real journey currently uses these forms. Close the family at shared property-name extraction rather than patching individual examples. Support all statically knowable property-name forms consistently; genuinely dynamic keys may remain outside the supported boundary but must be documented/tested as such. Earlier helper-return, export, read-reference, regex and navigation findings are resolved.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index ef5a022687326f8aa66fa63d28a14d5df42ef8d9..29f359caab49e5773ac0e6619e34362c1316199e 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -63,6 +63,10 @@ wrong, measured instead.
   is a second path), an uncalled or destructured read method is a read, a helper
   exported by name is judged where it stands, and only plain-text `toMatch`
   alternatives prove presence (a regex's sense is as invisible as a boolean's).
+  Every name it decides by (a read, a matcher, a timer, `state`) goes through one
+  reader, `keyOf`, which folds a static computed key (`['is' + 'Visible']`) and
+  calls one it cannot fold unsafe, as is a `state` on any `waitFor…` it cannot
+  read; each consumer read names its own way, so each spelling opened a sibling.
   Its ledger says why each exception
   stands and how many sites it covers. 44 positive reads
   became `expect.poll` with the same matcher. Two polled negatives that followed a
diff --git a/tests/journey-waits.test.ts b/tests/journey-waits.test.ts
index f942f07974a8651aacee9eb1e5ea36e68dd4fa04..f39b0fcf71b0525c3911fa4d7518c0dff61e558f 100644
--- a/tests/journey-waits.test.ts
+++ b/tests/journey-waits.test.ts
@@ -15,7 +15,8 @@ import { describe, expect, it } from 'vitest';
 // is not a bracket. A timer named inside a string or template (a page script)
 // still counts. Six rules, each deny-by-default:
 //   sleep     no reference to `waitForTimeout`, `setTimeout` or `setInterval`
-//             — a call, a `.bind`, an import, a page script — and no wait
+//             — a call, a `.bind`, an import, a page script, a folded key —
+//             and no wait
 //             (`waitFor…`, an assertion) whose failure a `.catch` swallows:
 //             when the thing never comes, that is a timer;
 //   poller    no `while`, `do` or `for(;;)`-style loop that awaits —
@@ -34,7 +35,8 @@ import { describe, expect, it } from 'vitest';
 //             value (`[await a.count(), url]`);
 //   read      the same read OUTSIDE an assertion — a branch, a variable, a
 //             read method or helper named without a call (passed, aliased,
-//             bound, destructured in a declaration or an `=`) — is refused unless ledgered with what it
+//             bound, destructured in a declaration, parameter, catch, `=` or
+//             `for…of`) — is refused unless ledgered with what it
 //             was read after. A HELPER is a local function with a read in what
 //             it returns; it means what its ONE return evaluates to, and only
 //             when that return is the body's last statement: a second return,
@@ -59,20 +61,27 @@ import { describe, expect, it } from 'vitest';
 //             `toBeGreaterThan(n >= 0)`, `toBeGreaterThanOrEqual(n > 0)`,
 //             `toHaveLength(n > 0)`. Everything else is negative: `.not`, no
 //             matcher, a variable, an unknown matcher, a boolean (its sense —
-//             `!t.includes(x)` — is invisible). So is `waitFor` with
-//             `state: 'detached' | 'hidden'`, a state it cannot read, or
-//             options it cannot read;
+//             `!t.includes(x)` — is invisible). So is any `waitFor…` with
+//             `state: 'detached' | 'hidden'`, a state it cannot read (a
+//             variable, an expression, a getter), or options it cannot read;
 //   goto      no raw `page.goto` to a hash route outside the harness: `goTo`
 //             is the navigation that waits for the destination.
 // `expect`, `expect.soft`, `.poll` and every matcher are matched by name in
-// any spelling (`expect['poll']`, `['not']`). Geometry (`boundingBox`) and
+// any spelling (`expect['poll']`, `['not']`). Every NAME — a read, a matcher,
+// a destructured key, `state`, an expected object's key — is read by one
+// function, `keyOf`: its static value however spelled (`'a'`, `` `a` ``, `1`,
+// `['is' + 'A']`, `` [`is${'A'}`] ``); a key it cannot fold may be any name,
+// so it is unsafe wherever a name decides (refused in an assertion, a read
+// when destructured, a negative in waitFor options, unjudged in an expected
+// object). Geometry (`boundingBox`) and
 // list (`all`, `allInnerTexts`) reads are VALUE reads, like `inputValue`:
 // taken after the element was awaited. Deliberately out of reach: `for…of`/
 // `for…in` loops (walks over a fixed list, as the engine loops are; a timed
 // poller in one still trips `sleep`), a computed call OUTSIDE an assertion
 // (`x[k]()` may be anything; inside one it is refused), a computed member
-// named without a call (`x[k]` is indexing, indistinguishable from a read
-// method), an aliased `expect`,
+// named without a call (`x[k]` is indexing, everywhere and indistinguishable
+// from a read method, where destructuring a locator is not), a name passed as
+// an argument (`Reflect.get(x, 'count')`), an aliased `expect`,
 // a helper exported to another file in any spelling (`export function`,
 // `export { rows }`, `export default rows`: its read is judged where it
 // stands, as there is no caller here to judge), and Playwright's own
@@ -375,6 +384,7 @@ const PLAIN_TEXT = String.raw`(?:[^\\^$.|?*+()[\]{}/]|\\[^A-Za-z0-9])+`;
 /** A regex literal of plain-text alternatives, at most the `i` flag: it matches only where one of them IS — `toContain` by another name. */
 const PLAIN_REGEX = new RegExp(String.raw`^/${PLAIN_TEXT}(?:\|${PLAIN_TEXT})*/i?$`);
 const SLEEP = /\b(?:waitForTimeout|setTimeout|setInterval)\b/g;
+const TIMER = /^(?:waitForTimeout|setTimeout|setInterval)$/;
 /** What the scan cannot judge: a computed name, an ambiguous helper, a shape it does not reduce. */
 const UNKNOWN = Symbol('unknown');
 /** A value with no read in it — a URL, a field's text, stored data: it may be ANYTHING, an empty one included. */
@@ -403,8 +413,9 @@ function literal(node: ts.Expression | undefined): unknown {
   if (ts.isObjectLiteralExpression(e)) {
     const o: Record<string, unknown> = {};
     for (const p of e.properties) {
-      if (!ts.isPropertyAssignment(p) || !(ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name))) return UNKNOWN;
-      o[p.name.text] = literal(p.initializer);
+      const key = ts.isPropertyAssignment(p) ? keyOf(p.name) : UNKNOWN;
+      if (key === UNKNOWN) return UNKNOWN;
+      o[key] = literal((p as ts.PropertyAssignment).initializer);
     }
     return o;
   }
@@ -416,14 +427,38 @@ const hasOpaque = (v: unknown): boolean => v === OPAQUE || (Array.isArray(v) &&
 const full = (v: unknown): boolean =>
   typeof v === 'number' ? v > 0 : typeof v === 'string' ? v !== '' : typeof v === 'object' && v !== null && Object.values(v).length > 0 && Object.values(v).every(full);
 
-/** The member an access names — `x.a`, `x?.a`, `x['a']`, `` x[`a`] `` — UNKNOWN for a computed key. */
+/** A computed key's static value — a string, template or number, `+` and `${}` folded as JS does — or UNKNOWN. */
+function constant(node: ts.Expression): string | number | typeof UNKNOWN {
+  const e = bare(node);
+  if (ts.isStringLiteralLike(e)) return e.text;
+  if (ts.isNumericLiteral(e)) return Number(e.text);
+  if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.PlusToken) {
+    const [a, b] = [constant(e.left), constant(e.right)];
+    return a === UNKNOWN || b === UNKNOWN ? UNKNOWN : (a as string) + (b as string);
+  }
+  if (ts.isTemplateExpression(e)) {
+    let s = e.head.text;
+    for (const span of e.templateSpans) {
+      const v = constant(span.expression);
+      if (v === UNKNOWN) return UNKNOWN;
+      s += String(v) + span.literal.text;
+    }
+    return s;
+  }
+  return UNKNOWN;
+}
+const text = (v: string | number | typeof UNKNOWN) => (v === UNKNOWN ? v : String(v));
+/** THE one reading of a property name — `a`, `'a'`, `1`, `['a']`, `` [`a`] ``, `['is' + 'A']` — UNKNOWN for a key it cannot fold. */
+function keyOf(name: ts.PropertyName): string | typeof UNKNOWN {
+  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
+  return text(constant(ts.isComputedPropertyName(name) ? name.expression : name));
+}
+
+/** The member an access names — `x.a`, `x?.a`, `x['a']`, `` x[`a`] `` — UNKNOWN for a key `keyOf` cannot fold. */
 function member(node: ts.Expression): { of: ts.Expression; name: string | typeof UNKNOWN } | undefined {
   const e = bare(node);
   if (ts.isPropertyAccessExpression(e)) return { of: e.expression, name: e.name.text };
-  if (ts.isElementAccessExpression(e)) {
-    const key = bare(e.argumentExpression);
-    return { of: e.expression, name: ts.isStringLiteralLike(key) ? key.text : UNKNOWN };
-  }
+  if (ts.isElementAccessExpression(e)) return { of: e.expression, name: text(constant(e.argumentExpression)) };
   return undefined;
 }
 const named = (e: ts.Expression, name: string) => member(e)?.name === name;
@@ -594,10 +629,12 @@ export function scan(file: string, raw: string): Site[] {
   const isRead = (name: string | typeof UNKNOWN | undefined) => typeof name === 'string' && Object.hasOwn(READS, name);
   /** Read methods named without a call (`Reflect.apply(x.count, …)`, `const { count } = x`). */
   const refs: ts.Node[] = [];
-  /** Is this object literal (or one nested in it) the target of a destructuring `=`? */
+  /** Is this object literal (or one nested in it) the target of a destructuring `=` or `for (… of/in …)`? */
   const assignedTo = (literal: ts.Node): boolean => {
-    for (let n = literal; ts.isObjectLiteralExpression(n) || ts.isArrayLiteralExpression(n) || ts.isPropertyAssignment(n) || ts.isParenthesizedExpression(n); n = n.parent)
+    for (let n = literal; ts.isObjectLiteralExpression(n) || ts.isArrayLiteralExpression(n) || ts.isPropertyAssignment(n) || ts.isParenthesizedExpression(n); n = n.parent) {
       if (ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && n.parent.left === n) return true;
+      if ((ts.isForOfStatement(n.parent) || ts.isForInStatement(n.parent)) && n.parent.initializer === n) return true;
+    }
     return false;
   };
   /** Is this access the callee of a call — directly, or through `.call`/`.apply`, which `readOf` judges as the read? */
@@ -612,7 +649,7 @@ export function scan(file: string, raw: string): Site[] {
 
   const visit = (node: ts.Node): void => {
     // sleep: any REFERENCE to a timer (a call, `.bind`, an import) …
-    if (ts.isIdentifier(node) && /^(?:waitForTimeout|setTimeout|setInterval)$/.test(node.text)) {
+    if (ts.isIdentifier(node) && TIMER.test(node.text)) {
       const ref = ts.isPropertyAccessExpression(node.parent) && node.parent.name === node ? node.parent : node;
       at(ts.isCallExpression(ref.parent) && ref.parent.expression === ref ? ref.parent : ref.parent, 'sleep');
     }
@@ -623,22 +660,29 @@ export function scan(file: string, raw: string): Site[] {
     }
     // poller: a loop that awaits — `persistedUntil` is the one.
     if ((ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isForStatement(node)) && hasAwait(node)) at(node, 'poller');
+    // … or a computed key folded from pieces no one string holds (`page['wait' + 'ForTimeout']`).
+    const folded = ts.isElementAccessExpression(node) ? node.argumentExpression : ts.isComputedPropertyName(node) ? node.expression : undefined;
+    const timer = folded && !ts.isStringLiteralLike(bare(folded)) ? text(constant(folded)) : UNKNOWN;
+    if (typeof timer === 'string' && TIMER.test(timer)) at(node.parent, 'sleep');
     // negative: a wait for something to be GONE passes at once if it never came —
-    // `state: 'detached' | 'hidden'` however spelled, or a `waitFor` state the scan cannot read.
-    if ((ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) && (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)) && node.name.text === 'state') {
+    // `state: 'detached' | 'hidden'` however spelled, or a `waitFor…` state the scan cannot read (a getter's included).
+    if (ts.isObjectLiteralElementLike(node) && node.name && keyOf(node.name) === 'state') {
       const state = ts.isPropertyAssignment(node) ? literal(node.initializer) : UNKNOWN;
       const call = ts.findAncestor(node, ts.isCallExpression);
-      if (state === 'detached' || state === 'hidden' || (typeof state !== 'string' && call && named(call.expression, 'waitFor'))) at(call ?? node, 'negative');
+      const waitName = call && member(call.expression)?.name;
+      if (state === 'detached' || state === 'hidden' || (typeof state !== 'string' && typeof waitName === 'string' && waitName.startsWith('waitFor')))
+        at(call ?? node, 'negative');
     }
     // read: a read method named without being called — passed, aliased, bound, destructured — is a read nobody judges.
     if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && isRead(member(node)!.name) && !called(node)) refs.push(node);
+    // A destructured key the scan cannot fold may be any method: a read too.
     const key =
       ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)
-        ? (node.propertyName ?? node.name)
+        ? keyOf(node.propertyName ?? (node.name as ts.Identifier))
         : (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) && assignedTo(node.parent)
-          ? node.name
+          ? keyOf(node.name)
           : undefined;
-    if (key && (ts.isIdentifier(key) || ts.isStringLiteralLike(key)) && isRead(key.text)) refs.push(node);
+    if (key === UNKNOWN || isRead(key)) refs.push(node);
     if (ts.isCallExpression(node)) calls.push(node);
     if (ts.isIdentifier(node)) identifiers.push(node);
     if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
@@ -686,7 +730,8 @@ export function scan(file: string, raw: string): Site[] {
     while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
     if (ts.isCallExpression(n.parent) && n.parent.expression === n) return false; // `f(…)`
     const via = n.parent;
-    return !(ts.isPropertyAccessExpression(via) && (via.name.text === 'call' || via.name.text === 'apply') && ts.isCallExpression(via.parent) && via.parent.expression === via);
+    const by = (ts.isPropertyAccessExpression(via) || ts.isElementAccessExpression(via)) && via.expression === n ? member(via)!.name : undefined;
+    return !((by === 'call' || by === 'apply') && ts.isCallExpression(via.parent) && via.parent.expression === via);
   };
   const readNodes = (): ts.Node[] => [...calls.filter((c) => readOf(c)), ...identifiers.filter(isHelperRef), ...refs];
   const within = (n: ts.Node, outer: ts.Node) => n.pos >= outer.pos && n.end <= outer.end;
@@ -812,10 +857,13 @@ export function scan(file: string, raw: string): Site[] {
       const m = matcherOf(call);
       if (!waitsForPresence(evaluate(call.arguments[0]), m)) at(m?.call ?? call, 'negative');
     }
-    // negative: a `waitFor` whose options the scan cannot read may be waiting for absence.
-    const options = named(call.expression, 'waitFor') && call.arguments[0] ? bare(call.arguments[0]) : undefined;
-    if (options && (!ts.isObjectLiteralExpression(options) || options.properties.some((p) => ts.isSpreadAssignment(p) || (p.name && ts.isComputedPropertyName(p.name)))))
+    // negative: a `waitFor…` whose options the scan cannot read — `waitFor`'s own a variable, any one's a spread or
+    // a key `keyOf` cannot fold — may be waiting for absence.
+    const name = member(call.expression)?.name;
+    const unread = (a: ts.Expression) => ts.isObjectLiteralExpression(a) && a.properties.some((p) => ts.isSpreadAssignment(p) || (p.name && keyOf(p.name) === UNKNOWN));
+    if (typeof name === 'string' && name.startsWith('waitFor') && call.arguments.some((a) => unread(bare(a))))
       at(call, 'negative');
+    else if (name === 'waitFor' && call.arguments[0] && !ts.isObjectLiteralExpression(bare(call.arguments[0]))) at(call, 'negative');
     // sleep: a wait whose failure is swallowed waits out its timeout when the thing never comes.
     const caught = named(call.expression, 'catch') ? bare(member(call.expression)!.of) : undefined;
     if (caught && ts.isCallExpression(caught) && isWait(caught)) at(call, 'sleep');
@@ -1109,8 +1157,63 @@ describe('journey waits', () => {
       ['const { count: n } = box;', ['read']],
       ['let see;\n({ isVisible: see } = box);', ['read']],
       ['({ count } = box);', ['read']],
-      // …but an uncalled COMPUTED member is indexing, indistinguishable from a read method: out of reach.
+      // …but an uncalled COMPUTED member is indexing, indistinguishable from a read method: out of reach,
+      // as is a name passed as an argument (`Reflect.get`), which is no property-name form.
       ['expect(await Reflect.apply(box[m], box, [])).toBe(true);', []],
+      ["expect(await Reflect.get(box, 'isVisible').call(box)).toBe(true);", []],
+      // A PROPERTY NAME means its static value however it is spelled — an
+      // identifier, a string, a template, a number, or a computed key folding
+      // those (`'is' + 'Visible'`, `` `is${'Visible'}` ``) — at every consumer:
+      // a destructured read (declaration, `=`, `for…of`, parameter, catch)…
+      ['const { ["isVisible"]: read } = box;\nexpect(await Reflect.apply(read, box, [])).toBe(true);', ['read']],
+      ['const { [`count`]: n } = box;', ['read']],
+      ["const { ['is' + 'Visible']: see } = box;", ['read']],
+      ['const { [`is${"Visible"}`]: see } = box;', ['read']],
+      ["const { [('count' as const)]: n } = box;", ['read']],
+      ['let see;\n({ ["isVisible"]: see } = box);', ['read']],
+      ["for ({ ['count']: n } of boxes);", ['read']],
+      ['for ({ count: n } of boxes);', ['read']],
+      ['async function f({ ["isVisible"]: see }) {}', ['read']],
+      ["try {} catch ({ ['count']: n }) {}", ['read']],
+      ['const { 0: first, ["name"]: n } = box;', []],
+      // …a computed member, called or named…
+      ["expect(await box['is' + 'Visible']()).toBe(true);", ['positive']],
+      ["expect(await box['is' + 'Visible']()).toBe(false);", []],
+      ["const see = box[`is${'Visible'}`];", ['read']],
+      ['await expect.poll(() => box["is" + "Hidden"]()).toBe(false);', []],
+      ["expect(await box.isVisible())['to' + 'Be'](false);", []],
+      ["expect(await box.isVisible())['to' + 'Be'](true);", ['positive']],
+      // …a helper's `.call`…
+      [`${H}expect(await hidden['call'](null, box)).toBe(true);`, []],
+      [`${H}expect(await hidden['call'](null, box)).toBe(false);`, ['positive']],
+      // …an absence option, on any waitFor…
+      ["await toast.waitFor({ ['state']: 'detached' });", ['negative']],
+      ["await page.waitForSelector('x', { ['state']: 'hidden' });", ['negative']],
+      ["await page.waitForSelector('x', { [`sta${'te'}`]: 'detached' });", ['negative']],
+      ["await toast.waitFor({ ['timeout']: 5_000 });", []],
+      // …an absence by any waitFor, its state however written…
+      ["await page.waitForSelector('x', { state: gone });", ['negative']],
+      ["await page.waitForSelector('x', { state });", ['negative']],
+      ["await page.waitForSelector('x', { state: 'hid' + 'den' });", ['negative']],
+      ["await toast.waitFor({ get state() { return 'hidden'; } });", ['negative']],
+      ["await page.waitForSelector('x', { get ['state']() { return 'hidden'; } });", ['negative']],
+      ["await page.waitForSelector('x', { state: 'attached' });", []],
+      ["await page.waitForEvent('popup', { predicate(p) { return true; } });", []],
+      // …a timer, a key folded from pieces no one string holds — reported once…
+      ["await page['wait' + 'ForTimeout'](300);", ['sleep']],
+      ["await page[`waitFor${'Timeout'}`](300);", ['sleep']],
+      ["globalThis['set' + 'Timeout'](go, 100);", ['sleep']],
+      ["const { ['wait' + 'ForTimeout']: w } = page;", ['sleep']],
+      ["const { ['waitForTimeout']: w } = page;", ['sleep']],
+      // …and an expected object.
+      ["await expect.poll(() => q()).toEqual({ ['a']: 'x' });", []],
+      // A key the scan cannot fold may be any name: unsafe wherever a name decides.
+      ['const { [k]: v } = box;', ['read']],
+      ["({ ['is' + k]: see } = box);", ['read']],
+      ["await page.waitForSelector('x', { [key]: value });", ['negative']],
+      ["await page.waitForSelector('x', { ...o });", ['negative']],
+      ["await expect.poll(() => q()).toEqual({ [k]: 'x' });", ['negative']],
+      ['expect(await box[`is${k}`]()).toBe(false);', ['positive']],
       // A REGEX'S SENSE is as invisible as a boolean's: only alternatives of
       // plain non-empty text prove presence, like `toContain`.
       ['await expect.poll(() => page.url()).toMatch(/^[^?]+$/);', ['negative']],
```

**Paths the rework touched:**

- `DECISIONS.md`
- `tests/journey-waits.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
5a4991e Add property-name rows to the wait guard, failing on a2f250a's scanner

A property name means its static value however it is spelled: an
identifier, a string, a template, a number, or a computed key folding
those. These rows exercise every consumer that decides by a name (a
destructured read in a declaration, `=`, `for…of`, parameter and catch;
a computed member called or named; a matcher; a helper's `.call`; the
`state` option of any waitFor; an expected object), plus a key the scan
cannot fold, which must count as unsafe.

On this commit, `npx -y -p node@24 node node_modules/vitest/vitest.mjs
run tests/journey-waits.test.ts` fails 24 of the new rows; the scanner
is unchanged from a2f250a (and 3cfbb69).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

d9d6365 A property name means its static value at every consumer; an unfoldable key is unsafe

Invariant: wherever the wait guard decides by a NAME, it reads that name
one way. A name means its static value however spelled (identifier,
string, no-substitution template, number, or a computed key folding
those with `+` and `${}`, through parentheses and `as`); a key it cannot
fold may be any name, so it counts as unsafe wherever a name decides.
The choke point is `keyOf` (with `constant` for computed expressions);
before, each consumer had its own `isIdentifier || isStringLiteralLike`
test, so each spelling left a sibling open.

Consumers enumerated in tests/journey-waits.test.ts:
- member(): element-access names (reads, `.call`/`.apply`, matchers,
  `expect['poll']`, `goto`, `waitFor`) — fixed, now folds computed keys.
- literal(): an expected object's keys — fixed; unfoldable stays UNKNOWN.
- destructured read keys: BindingElement (declaration, parameter, catch)
  and `=` targets — fixed; an unfoldable key is now a `read`.
- assignedTo(): a `for (… of/in …)` initializer is a destructuring
  target too — fixed (it was missed even for plain keys).
- the `state` option — fixed, any spelling of the key.
- waitFor options — widened from `waitFor` to every `waitFor…` call:
  a spread or unfoldable key in any object argument is a negative
  (`waitForSelector('x', { ['state']: 'hidden' })` passed before).
- isHelperRef(): `helper['call'](…)` now judged like `helper.call(…)`.
- checked clean: called() and matcherOf() already went through member();
  export specifiers and declaration names are identifiers, not keys; the
  timer check reads identifiers and string text, so computed timer names
  were already caught by the string scan.
Boundary, documented in the header and tested: an uncalled `x[k]` stays
indexing; a name passed as an argument (`Reflect.get`) is no property
name form.

Proof: the rows were committed first in 5a4991e; on that commit
`npx -y -p node@24 node node_
… (truncated)

d4135be Add timer-key and waitFor-state rows to the wait guard, failing on d9d6365

Two more consumers decide by a name or its value: the timer rule (a key
folded from pieces that no single string holds) and the `state` option
of any `waitFor…` call (a variable, a folded value, a getter). Each
`waitFor` twin is already a negative; these rows hold the siblings to
the same verdict, and check a plain string key is reported once.

On this commit, `npx -y -p node@24 node node_modules/vitest/vitest.mjs
run tests/journey-waits.test.ts` fails 9 of the new rows; the scanner is
unchanged from d9d6365.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

32c3721 The timer rule and every waitFor's state read names like the rest of the guard

Same invariant as d9d6365: wherever the guard decides by a name, a
static name means its folded value and an unreadable one is unsafe.
d9d6365's message listed the timer check as checked clean; it was not.
It saw only identifiers and raw string text, so a key folded from pieces
(`page['wait' + 'ForTimeout']`, a template, a destructured computed key)
reached no rule.

Consumers fixed here:
- timer: an element-access or computed key that `constant` folds to a
  timer name is a sleep; a plain string key stays with the string scan,
  so it is reported once.
- `state`: read from any object member through `keyOf` (a getter or
  method named `state` has a value the scan cannot read), and an
  unreadable state is a negative on every `waitFor…` call, not only
  `waitFor` (`waitForSelector('x', { state: gone })` passed before).
Real journeys: every `state` they pass is a literal; the ledger counts
are unchanged.

Proof: the rows were committed first in d4135be; on that commit
`npx -y -p node@24 node node_modules/vitest/vitest.mjs run
tests/journey-waits.test.ts` fails 9 of them. It passes here.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
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
