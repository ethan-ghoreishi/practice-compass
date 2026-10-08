---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
patchId: 924c3d2ef8fc2478d9869fecac5ca802cfd7523f
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: journey-wait-guard-complete-enforcement
    summary: "[P2] ac-7 fails open for statically known computed destructuring keys.
      Every recognisable rendered-state read must reach a judgement or ledger
      entry."
    counterexample: 'On HEAD 3cfbb69, scan() accepts const { ["isVisible"]: read } =
      box; expect(await Reflect.apply(read, box, [])).toBe(true). The same gap
      exists across the guarded read methods, string/no-substitution-template
      computed keys, and declaration/assignment/parameter destructuring. No real
      journey currently uses these forms. Close the family at shared
      property-name extraction rather than patching individual examples. Support
      all statically knowable property-name forms consistently; genuinely
      dynamic keys may remain outside the supported boundary but must be
      documented/tested as such. Earlier helper-return, export, read-reference,
      regex and navigation findings are resolved.'
createdAt: 2026-10-08T19:47:09.532Z
sealedAt: 2026-10-08T20:05:11.098Z
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
- **Diff patch-id:** `924c3d2ef8fc2478d9869fecac5ca802cfd7523f`
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

- **journey-wait-guard-complete-enforcement** — [P2] ac-7 still lets a helper or poll callback with an un-counted return path pass. returnsOf()/returned() in tests/journey-waits.test.ts (lines 517-536) count only `return <expr>`, so a bare `return;`, a reachable end of body (an if with no else, a switch fall-through, a try whose catch falls off) or an implicit undefined is not a second return path. That contradicts the header's own rule ('a second return path ... leaves every call unjudged') and 85fe668's 'a guard ... means UNKNOWN'; the GUARDED row covers only `return 0;`. The same hole reaches all three consumers of returned(): helperValue, reduce's arrow branch (inline poll callbacks) and arrayOf. Fold-ins in the same 'nothing unreducible counts as safe' family: `export { helper }` leaves the helper's read judged nowhere, a read method passed uncalled (Reflect.apply) is not a read node although helper references are, and toMatch accepts a regex whose sense is absence.
  _counterexample:_ Ran scan() from 33daf16, extracted unchanged into a scratch script, with file 'synthetic.browser.test.ts'. Each of these returns [] (accepted): (A1) `async function hidden(b, open) { if (!open) return; return b.isHidden(); } await expect.poll(() => hidden(box, open)).toBeFalsy();` With open=false it returns undefined and passes at once with nothing on screen, yet the scan judges it a presence wait. (A2) the same with `if (open) return b.isHidden();` and an implicit fall-through. (A3) inline: `await expect.poll(async () => { if (!open) return; return box.isHidden(); }).toBeFalsy();` (A4) `async function rows(b, open) { if (!open) return; return b.count(); } await expect.poll(() => rows(box, open)).toBeUndefined();` (E7) `async function rows(b) { try { return b.count(); } catch { } } await expect.poll(() => rows(box)).toBeUndefined();` (E9) `async function hidden(b, k) { switch (k) { case 1: return b.isHidden(); } } await expect.poll(() => hidden(box, k)).toBeFalsy();` Same family: (B1) `async function rows(b) { return b.count(); } export { rows };` returns [], while `export { rows as r }` and `export default rows` return ['read']. A file importing it, `import { rows } from './x'; expect(await rows(box)).toBe(1);`, also returns []. (D1) `expect(await Reflect.apply(box.isVisible, box, [])).toBe(true);` returns []. (C1/C2) `await expect.poll(() => page.url()).toMatch(/^[^?]+$/);` and `.toMatch(/^(?!.*composer=).+/)` return []: a regex's sense is as invisible as a boolean's, and C2 is the ledgered `.not.toMatch(/composer=/)` spelled differently. A repository sweep found no real journey site using any of these shapes today (the three real bare `return;` hits are in page scripts and fakes), so the holes are latent guard gaps, as in the prior rejection. Fix shape: returned() yields a value only when the body's ONE return statement, bare returns counted, is its last top-level statement; otherwise UNKNOWN. Treat `export { name }` as exporting the helper. Treat an uncalled reference to a READS method as a read. Refuse toMatch regexes containing a lookahead or a negated class, or treat every regex as unprovable.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 849e2943ef736afc5f3d6cee3c3800818a6fa2dd..ef5a022687326f8aa66fa63d28a14d5df42ef8d9 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -57,7 +57,13 @@ wrong, measured instead.
   be judged, and a value poll when its matcher passes on an empty value; a
   pattern list missed `isHidden` polls, `[false, false]` and `toBe(undefined)`. A
   wait whose failure `.catch` swallows is a timer when the thing never comes:
-  daily-practice's one now fails loudly instead. Its ledger says why each exception
+  daily-practice's one now fails loudly instead. Recognising one more spelling at a
+  time kept leaving its siblings open, so what the guard cannot reduce counts as
+  unsafe: a helper means its one final `return` (a bare return or a reachable end
+  is a second path), an uncalled or destructured read method is a read, a helper
+  exported by name is judged where it stands, and only plain-text `toMatch`
+  alternatives prove presence (a regex's sense is as invisible as a boolean's).
+  Its ledger says why each exception
   stands and how many sites it covers. 44 positive reads
   became `expect.poll` with the same matcher. Two polled negatives that followed a
   positive arrival became point-in-time reads. Element disappearances became
diff --git a/tests/journey-waits.test.ts b/tests/journey-waits.test.ts
index c198c5cc757627905c2e57b878c7f5e8612a0e81..f942f07974a8651aacee9eb1e5ea36e68dd4fa04 100644
--- a/tests/journey-waits.test.ts
+++ b/tests/journey-waits.test.ts
@@ -33,11 +33,14 @@ import { describe, expect, it } from 'vitest';
 //             the value (one held in a variable), and a read mixed with a
 //             value (`[await a.count(), url]`);
 //   read      the same read OUTSIDE an assertion — a branch, a variable, a
-//             `.bind`, a helper passed or aliased instead of called — is
-//             refused unless ledgered with what it was read after. A HELPER is
-//             a local function with a read in what it returns; it means what
-//             its ONE return evaluates to, so a second return path or a
-//             return the evaluation cannot reduce leaves every call unjudged;
+//             read method or helper named without a call (passed, aliased,
+//             bound, destructured in a declaration or an `=`) — is refused unless ledgered with what it
+//             was read after. A HELPER is a local function with a read in what
+//             it returns; it means what its ONE return evaluates to, and only
+//             when that return is the body's last statement: a second return,
+//             a bare `return;`, an end of body it can reach, a generator, or a
+//             return the evaluation cannot reduce leaves every call unjudged
+//             (inline callbacks and `.catch` fallbacks alike);
 //   negative  every poll not PROVEN unable to pass on what never came is
 //             ledgered with why it cannot: it follows a wait that SAW the thing
 //             (a disappearance after presence), or it is a presence the table
@@ -50,7 +53,9 @@ import { describe, expect, it } from 'vitest';
 //             only a closed table proves it cannot pass on an empty value:
 //             `toBe`/`toEqual` of a literal whose every leaf is a non-empty
 //             string or a POSITIVE number (no boolean, 0, -1), `toContain` of a
-//             non-empty string, `toMatch` of a regex that fails on '',
+//             non-empty string, `toMatch` of a regex of plain-text alternatives
+//             (no anchor, class, group, quantifier or `\D`-style escape, whose
+//             sense may be absence; at most the `i` flag),
 //             `toBeGreaterThan(n >= 0)`, `toBeGreaterThanOrEqual(n > 0)`,
 //             `toHaveLength(n > 0)`. Everything else is negative: `.not`, no
 //             matcher, a variable, an unknown matcher, a boolean (its sense —
@@ -64,13 +69,15 @@ import { describe, expect, it } from 'vitest';
 // list (`all`, `allInnerTexts`) reads are VALUE reads, like `inputValue`:
 // taken after the element was awaited. Deliberately out of reach: `for…of`/
 // `for…in` loops (walks over a fixed list, as the engine loops are; a timed
-// poller in one still trips `sleep`), a read method destructured or aliased
-// (`const { count } = x`), a computed call OUTSIDE an assertion (`x[k]()`
-// may be anything; inside one it is refused), an aliased `expect`, a helper
-// exported to another file (its read is judged where it stands, as there is
-// no caller here to judge), and Playwright's own web-first matchers
-// (`toBeHidden`…), which these tests cannot reach: they import Vitest's
-// `expect`; and a value COMPUTED to encode absence (a fallback string, a count
+// poller in one still trips `sleep`), a computed call OUTSIDE an assertion
+// (`x[k]()` may be anything; inside one it is refused), a computed member
+// named without a call (`x[k]` is indexing, indistinguishable from a read
+// method), an aliased `expect`,
+// a helper exported to another file in any spelling (`export function`,
+// `export { rows }`, `export default rows`: its read is judged where it
+// stands, as there is no caller here to judge), and Playwright's own
+// web-first matchers (`toBeHidden`…), which these tests cannot reach: they
+// import Vitest's `expect`; and a value COMPUTED to encode absence (a fallback string, a count
 // of what is missing) — the table proves a poll cannot pass on an empty or
 // sentinel value, not that the value means presence. Two helpers sharing a
 // name, and a helper reached again while it is being evaluated, are judged
@@ -251,6 +258,12 @@ const LEDGER: { file: string; rule: Rule; snippet: string; sites?: number; why:
     snippet: '(await takeRemote.count())',
     why: "after syncNow waited for the sync to finish, so whether it asks is its outcome. Only the unasked arm has been seen (the Edit tap saves nothing, so nothing local changed — the owner's setup gap); the GitHub copy is asserted after either",
   },
+  {
+    file: 'repertoire-families.test.ts',
+    rule: 'read',
+    snippet: 'exp.count',
+    why: "a plain number in the test's own expectation table, not a Locator: no page is read",
+  },
   // --- poller: counted loops that ACT each time, never waiting on a state ---
   {
     file: 'musical-term-suggestions.browser.test.ts',
@@ -357,6 +370,10 @@ const READS: Record<string, unknown> = {
   isDisabled: false,
   isEditable: false,
 };
+/** Plain non-empty text: no anchor, class, group, quantifier or letter escape, any of which may give a regex the sense of absence. */
+const PLAIN_TEXT = String.raw`(?:[^\\^$.|?*+()[\]{}/]|\\[^A-Za-z0-9])+`;
+/** A regex literal of plain-text alternatives, at most the `i` flag: it matches only where one of them IS — `toContain` by another name. */
+const PLAIN_REGEX = new RegExp(String.raw`^/${PLAIN_TEXT}(?:\|${PLAIN_TEXT})*/i?$`);
 const SLEEP = /\b(?:waitForTimeout|setTimeout|setInterval)\b/g;
 /** What the scan cannot judge: a computed name, an ambiguous helper, a shape it does not reduce. */
 const UNKNOWN = Symbol('unknown');
@@ -487,11 +504,8 @@ function provesPresence(m: Matcher): boolean {
       return full(want);
     case 'toContain':
       return typeof want === 'string' && want !== '';
-    case 'toMatch': {
-      if (!arg || !ts.isRegularExpressionLiteral(arg)) return false;
-      const end = arg.text.lastIndexOf('/');
-      return !new RegExp(arg.text.slice(1, end), arg.text.slice(end + 1)).test('');
-    }
+    case 'toMatch':
+      return !!arg && ts.isRegularExpressionLiteral(arg) && PLAIN_REGEX.test(arg.text);
     case 'toBeGreaterThan':
       return typeof want === 'number' && want >= 0;
     case 'toBeGreaterThanOrEqual':
@@ -514,26 +528,30 @@ function waitsForPresence(value: unknown, m: Matcher | null): boolean {
   return passes(m, value) === false;
 }
 
-/** The expression a function returns: its body, or its ONE `return` — undefined for two or none. */
+/**
+ * The expression a function returns: its body, or its ONE `return` when that
+ * is the body's last statement — undefined (so UNKNOWN) for any other shape:
+ * a second `return`, a bare `return;`, an end of body it can reach, a generator.
+ */
 function returned(fn: Fn): ts.Expression | undefined {
-  if (!fn.body) return undefined;
+  if (!fn.body || fn.asteriskToken) return undefined;
   if (!ts.isBlock(fn.body)) return fn.body;
-  const returns = returnsOf(fn);
-  return returns.length === 1 ? returns[0] : undefined;
+  const returns = returnStatements(fn.body);
+  return returns.length === 1 && returns[0] === fn.body.statements.at(-1) ? returns[0].expression : undefined;
 }
-/** Every expression a function can return, not counting functions nested in it. */
-function returnsOf(fn: Fn): ts.Expression[] {
-  if (!fn.body) return [];
-  if (!ts.isBlock(fn.body)) return [fn.body];
-  const out: ts.Expression[] = [];
+/** Every `return` in a body, bare ones included, not counting functions nested in it. */
+function returnStatements(body: ts.Node): ts.ReturnStatement[] {
+  const out: ts.ReturnStatement[] = [];
   const find = (n: ts.Node): void => {
-    if (ts.isReturnStatement(n)) {
-      if (n.expression) out.push(n.expression);
-    } else if (!ts.isFunctionLike(n)) ts.forEachChild(n, find);
+    if (ts.isReturnStatement(n)) out.push(n);
+    else if (!ts.isFunctionLike(n)) ts.forEachChild(n, find);
   };
-  ts.forEachChild(fn.body, find);
+  ts.forEachChild(body, find);
   return out;
 }
+/** Every expression a function can return. */
+const returnsOf = (fn: Fn): ts.Expression[] =>
+  !fn.body ? [] : !ts.isBlock(fn.body) ? [fn.body] : returnStatements(fn.body).flatMap((r) => (r.expression ? [r.expression] : []));
 
 /** Climb out of `await`, parentheses, `!` and `as` — the read's value is still the read. */
 function valueOf(node: ts.Node): ts.Node {
@@ -574,6 +592,23 @@ export function scan(file: string, raw: string): Site[] {
   /** Local (unexported) functions by the name they are called by. */
   const fns = new Map<string, Fn[]>();
   const isRead = (name: string | typeof UNKNOWN | undefined) => typeof name === 'string' && Object.hasOwn(READS, name);
+  /** Read methods named without a call (`Reflect.apply(x.count, …)`, `const { count } = x`). */
+  const refs: ts.Node[] = [];
+  /** Is this object literal (or one nested in it) the target of a destructuring `=`? */
+  const assignedTo = (literal: ts.Node): boolean => {
+    for (let n = literal; ts.isObjectLiteralExpression(n) || ts.isArrayLiteralExpression(n) || ts.isPropertyAssignment(n) || ts.isParenthesizedExpression(n); n = n.parent)
+      if (ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && n.parent.left === n) return true;
+    return false;
+  };
+  /** Is this access the callee of a call — directly, or through `.call`/`.apply`, which `readOf` judges as the read? */
+  const called = (access: ts.Expression): boolean => {
+    let n: ts.Node = access;
+    while (ts.isParenthesizedExpression(n.parent) || ts.isNonNullExpression(n.parent) || ts.isAsExpression(n.parent)) n = n.parent;
+    const p = n.parent;
+    if (ts.isCallExpression(p) && p.expression === n) return true;
+    const via = (ts.isPropertyAccessExpression(p) || ts.isElementAccessExpression(p)) && p.expression === n ? member(p)!.name : undefined;
+    return (via === 'call' || via === 'apply') && ts.isCallExpression(p.parent) && p.parent.expression === p;
+  };
 
   const visit = (node: ts.Node): void => {
     // sleep: any REFERENCE to a timer (a call, `.bind`, an import) …
@@ -595,8 +630,15 @@ export function scan(file: string, raw: string): Site[] {
       const call = ts.findAncestor(node, ts.isCallExpression);
       if (state === 'detached' || state === 'hidden' || (typeof state !== 'string' && call && named(call.expression, 'waitFor'))) at(call ?? node, 'negative');
     }
-    // read: a read bound for later is a read nobody judges.
-    if (named(node as ts.Expression, 'bind') && isRead(member(member(node as ts.Expression)!.of)?.name)) at(ts.isCallExpression(node.parent) ? node.parent : node, 'read');
+    // read: a read method named without being called — passed, aliased, bound, destructured — is a read nobody judges.
+    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && isRead(member(node)!.name) && !called(node)) refs.push(node);
+    const key =
+      ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)
+        ? (node.propertyName ?? node.name)
+        : (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) && assignedTo(node.parent)
+          ? node.name
+          : undefined;
+    if (key && (ts.isIdentifier(key) || ts.isStringLiteralLike(key)) && isRead(key.text)) refs.push(node);
     if (ts.isCallExpression(node)) calls.push(node);
     if (ts.isIdentifier(node)) identifiers.push(node);
     if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
@@ -607,6 +649,12 @@ export function scan(file: string, raw: string): Site[] {
   };
   const hasAwait = (node: ts.Node): boolean => ts.isAwaitExpression(node) || (ts.isForOfStatement(node) && !!node.awaitModifier) || ts.forEachChild(node, hasAwait) === true;
   visit(sf);
+  // A function exported by name (`export { rows }`, `export default rows`) has callers elsewhere: no local helper.
+  for (const s of sf.statements) {
+    if (ts.isExportDeclaration(s) && !s.moduleSpecifier && s.exportClause && ts.isNamedExports(s.exportClause))
+      for (const e of s.exportClause.elements) fns.delete((e.propertyName ?? e.name).text);
+    if (ts.isExportAssignment(s) && ts.isIdentifier(s.expression)) fns.delete(s.expression.text);
+  }
 
   // HELPERS: a local function with a read in what it returns. Its calls are reads.
   const helpers = new Set<string>();
@@ -640,7 +688,7 @@ export function scan(file: string, raw: string): Site[] {
     const via = n.parent;
     return !(ts.isPropertyAccessExpression(via) && (via.name.text === 'call' || via.name.text === 'apply') && ts.isCallExpression(via.parent) && via.parent.expression === via);
   };
-  const readNodes = (): ts.Node[] => [...calls.filter((c) => readOf(c)), ...identifiers.filter(isHelperRef)];
+  const readNodes = (): ts.Node[] => [...calls.filter((c) => readOf(c)), ...identifiers.filter(isHelperRef), ...refs];
   const within = (n: ts.Node, outer: ts.Node) => n.pos >= outer.pos && n.end <= outer.end;
   for (let grew = true; grew; ) {
     grew = false;
@@ -785,7 +833,8 @@ export function scan(file: string, raw: string): Site[] {
     }
     if (helperReturns.some((h) => within(r, h))) continue;
     if (ts.isIdentifier(r)) at(r.parent, 'read');
-    else if (!readOf(r as ts.CallExpression)!.computed) at(valueOf(r), 'read');
+    else if (!ts.isCallExpression(r)) at(r, 'read');
+    else if (!readOf(r)!.computed) at(valueOf(r), 'read');
   }
   return sites.sort((x, y) => x.line - y.line);
 }
@@ -892,7 +941,8 @@ describe('journey waits', () => {
     const BRANCHY = 'async function state(b, open) {\n  if (open) return b.count();\n  return b.isHidden();\n}\n';
     const TERNARY = 'const state = (b, open) => (open ? b.count() : b.isHidden());\n';
     const GUARDED = 'async function rows(b, open) {\n  if (!open) return 0;\n  return b.count();\n}\n';
-    const CYCLE = 'function f(b) {\n  return g(b);\n}\nfunction g(b) {\n  return f(b).catch(() => b.count());\n}\n';
+    const BARE = 'async function hidden(b, open) {\n  if (!open) return;\n  return b.isHidden();\n}\n';
+    const CYCLE ='function f(b) {\n  return g(b);\n}\nfunction g(b) {\n  return f(b).catch(() => b.count());\n}\n';
     const spellings: [string, Rule[]][] = [
       // a read with arguments, by computed name, optional chain, `.call`, parenthesised
       ['expect(await box.isVisible({ timeout: 100 })).toBe(true);', ['positive']],
@@ -1032,9 +1082,46 @@ describe('journey waits', () => {
       // …while each table entry's provable side stays allowed.
       ["await expect.poll(() => q()).toEqual(['a', 'b']);", []],
       ["await expect.poll(() => q()).toEqual({ a: 'x', b: { c: 1 } });", []],
-      ['await expect.poll(() => q()).toMatch(/a+/);', []],
       ['await expect.poll(() => n()).toHaveLength(2);', []],
       ['await expect.poll(() => n()).toBeGreaterThanOrEqual(1);', []],
+      // EVERY RETURN PATH counts: a bare `return;`, or an end of body the
+      // function can reach, returns undefined — a second path, so UNKNOWN.
+      [`${BARE}await expect.poll(() => hidden(box, open)).toBeFalsy();`, ['negative']],
+      [`${BARE}expect(await hidden(box, open)).toBe(true);`, ['positive']],
+      ['async function hidden(b, open) {\n  if (open) return b.isHidden();\n}\nawait expect.poll(() => hidden(box, open)).toBeFalsy();', ['negative']],
+      ['await expect.poll(async () => { if (!open) return; return box.isHidden(); }).toBeFalsy();', ['negative']],
+      ['async function rows(b, open) {\n  if (!open) return;\n  return b.count();\n}\nawait expect.poll(() => rows(box, open)).toBeUndefined();', ['negative']],
+      ['async function rows(b) {\n  try { return b.count(); } catch { }\n}\nawait expect.poll(() => rows(box)).toBeUndefined();', ['negative']],
+      ['async function hidden(b, k) {\n  switch (k) { case 1: return b.isHidden(); }\n}\nawait expect.poll(() => hidden(box, k)).toBeFalsy();', ['negative']],
+      ['expect(await box.isVisible().catch(() => { if (!open) return; return false; })).toBe(false);', ['positive']],
+      ['async function* rows(b) {\n  return b.count();\n}\nawait expect.poll(() => rows(box)).toBe(1);', ['negative']],
+      // A helper exported IN ANY SPELLING has its callers elsewhere: its read is judged where it stands, once.
+      ['async function rows(b) {\n  return b.count();\n}\nexport { rows };', ['read']],
+      ['const rows = (b) => b.count();\nexport { rows };', ['read']],
+      ['async function rows(b) {\n  return b.count();\n}\nexport { rows as r };', ['read']],
+      ['async function rows(b) {\n  return b.count();\n}\nexport default rows;', ['read']],
+      // A READ METHOD named without being called — passed, aliased, destructured — is a read nobody judges.
+      ['expect(await Reflect.apply(box.isVisible, box, [])).toBe(true);', ['positive']],
+      ['await expect.poll(() => Reflect.apply(box.count, box, [])).toBe(1);', ['negative']],
+      ['const see = box.isVisible;', ['read']],
+      ["const see = box['isVisible'];", ['read']],
+      ['const { isVisible } = box;', ['read']],
+      ['const { count: n } = box;', ['read']],
+      ['let see;\n({ isVisible: see } = box);', ['read']],
+      ['({ count } = box);', ['read']],
+      // …but an uncalled COMPUTED member is indexing, indistinguishable from a read method: out of reach.
+      ['expect(await Reflect.apply(box[m], box, [])).toBe(true);', []],
+      // A REGEX'S SENSE is as invisible as a boolean's: only alternatives of
+      // plain non-empty text prove presence, like `toContain`.
+      ['await expect.poll(() => page.url()).toMatch(/^[^?]+$/);', ['negative']],
+      ['await expect.poll(() => page.url()).toMatch(/^(?!.*composer=).+/);', ['negative']],
+      ['await expect.poll(() => page.url()).toMatch(/^[a-z:\\/.#]+$/);', ['negative']],
+      ['await expect.poll(() => q()).toMatch(/\\D/);', ['negative']],
+      ['await expect.poll(() => q()).toMatch(/a+/);', ['negative']],
+      ['await expect.poll(() => q()).toMatch(/x/m);', ['negative']],
+      ['await expect.poll(() => q()).toMatch(/pushed|in sync/i);', []],
+      ['await expect.poll(() => q()).toMatch(/a\\.b/);', []],
+      ['await expect.poll(() => page.url()).toMatch(/view=paths&inst=inst-tar/);', []],
     ];
     expect(spellings.filter(([code, want]) => JSON.stringify(rules(code)) !== JSON.stringify(want)).map(([code, want]) => `${code} → ${JSON.stringify(rules(code))}, want ${JSON.stringify(want)}`)).toEqual([]);
   });
```

**Paths the rework touched:**

- `DECISIONS.md`
- `tests/journey-waits.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
347c46e Add return-path, export, read-reference and regex-sense rows, failing on 33daf16's scanner

Discriminating rows for the "nothing unreducible counts as safe" family,
added before the fix. On 33daf16's scanner,
`npx vitest run tests/journey-waits.test.ts` fails with 23 rows wrong:

- a helper or inline callback with a bare `return;`, a reachable end of
  body (if with no else, switch, try/catch) or a generator is evaluated
  as if its one `return <expr>` were its only path;
- `export { rows }` (declaration and arrow) leaves the helper's read
  judged nowhere;
- a read method referenced without a call (Reflect.apply, an alias, a
  computed-name alias, a destructured name) is not a read;
- toMatch accepts a regex whose sense is absence (negated class,
  lookahead, anchored class, \D) or rests on a quantifier or `m` flag.

`/a+/` moves from the allowed side to the negative side deliberately: no
real poll uses a quantifier, and only plain text alternatives are now
provable. Rows for `export { rows as r }`, `export default rows` and the
real `/view=paths&inst=inst-tar/` pass already and stay as controls.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

456c6b5 A helper means its one final return; exports, read references and regex sense fail closed

Invariant: the wait guard counts nothing as safe that it cannot reduce.
A value it judges must be the ONLY value the code can produce, and every
read of the page must reach a judgement somewhere.

Fixes, each at the choke point every consumer goes through:

- returned() now yields an expression only when the body has exactly one
  `return` (bare ones counted, nested functions excluded), that return is
  the body's last top-level statement, and the function is not a
  generator. Anything else is UNKNOWN. Its four consumers are
  helperValue (named helpers), reduce's arrow branch (inline poll and
  expect callbacks), reduce's `.catch` fallback, and arrayOf (per-element
  judgement). All four route through it and are covered by rows.
  returnsOf still finds every returned expression, for helper detection
  and the helper-return exemption.
- A function exported by name (`export { rows }`, `{ rows as r }`,
  `export default rows`) is no local helper. Its read is judged where it
  stands, once, matching `export function`. Re-exports `from` another
  module name no local function and are left alone.
- An uncalled reference to a READS method is a read node, like a helper
  reference. That covers a property or element access that is neither
  called directly nor through `.call`/`.apply` (Reflect.apply, an alias,
  `.bind`), and a destructured binding keyed by a READS name. The
  special `.bind` rule is gone because this covers it. Inside an
  assertion such a reference cannot be reduced, so it is positive or
  negative. Outside one it is 'read'.
- toMatch proves presence only for a regex literal made of plain-text
  alternatives with at most the `i` flag: no anchor, class, group,
  quantifier or letter escape. That is toContain by another name.
  `/a+/` is now negative on purpose.

Sweep (the scanner's own output over every tests/*.ts, not grep):
- The 12 real `expect.poll(...)
… (truncated)

3cfbb69 Destructuring assignment of a read method is a read; say why the guard fails closed

This closes the rest of the read-reference family. A READS-keyed property
on the left of a destructuring `=` is now a read node, nested object and
array patterns included: `({ isVisible: see } = box)`, `({ count } = box)`.
Before this commit both rows passed unflagged on 456c6b5's scanner, as
`npx vitest run tests/journey-waits.test.ts` shows.

An uncalled COMPUTED member (`Reflect.apply(box[m], …)`) stays out of
reach. It is indexing and can't be told apart from a read method. The
header now lists it, and a `[]` row makes that limit executable.

DECISIONS.md gets the reason for the method change: recognising one more
spelling at a time kept leaving siblings open, so the guard now treats
whatever it cannot reduce as unsafe.

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
