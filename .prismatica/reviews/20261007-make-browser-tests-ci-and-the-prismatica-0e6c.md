---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
patchId: b4276b018ddf7f75bc90c42ce714cbdc9d4c7aa9
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-08T21:28:41.527Z
sealedAt: 2026-10-08T21:35:58.650Z
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
- **Diff patch-id:** `b4276b018ddf7f75bc90c42ce714cbdc9d4c7aa9`
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

- **journey-wait-guard-complete-enforcement** — [P2] Define a finite recognition contract for the journey-wait guard and align its documentation, tests and enforcement claims with that boundary.
  _counterexample:_ The current scanner combines broad claims such as enforcement across every spelling with explicit exclusions, but does not define a stable supported syntax boundary. This makes family closure depend on discovering further JavaScript spellings rather than satisfying a finite contract. Closure requires: explicitly define the supported syntax classes and semantic judgements; fail closed or require a ledger entry when meaning is unknown within that boundary; identify excluded syntax as unchecked rather than proved safe; align scanner documentation, lane claims and the exact named ac-7 test with that definition; prove the supported classes and relevant interactions through a fixed policy-derived matrix, retaining the current repository sweep and exact ledger accounting. The stopping rule must state that a future counterexample blocks this family only when it violates the supported recognition contract or exposes an actual unreliable repository consumer; an explicitly excluded spelling alone is a possible extension. The previously identified syntax-specific bypasses are withdrawn as standalone blockers. Further analyser expansion is not required if boundary clarification and aligned proof close this issue.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 760d0deb981ad49935abc34982e7973eb9439c63..ac20057b91bc9311065e59791506199c62a0b968 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -44,35 +44,32 @@ wrong, measured instead.
   on-open sync finish (`syncNow`), or that sync writes the valid database back
   over the bytes (seen under slow storage once a racy branch read was ordered).
 - **Waits are events, by construction.** `tests/journey-waits.test.ts` parses every
-  test file and the harness with TypeScript, so quoted `//`, `)` and regex text
+  `tests/*.ts` (the journeys and the harness) with TypeScript, so quoted `//`, `)` and regex text
   cannot hide or end code; a regex scan let both through. Every rule is
   deny-by-default: any timer reference (page scripts included), any loop that
   awaits, a state read (`count`, `is*`) asserted at one instant unless the
   assertion passes only when the thing is absent, the same read outside an
   assertion, every absence wait, and raw hash `page.goto`. One evaluation decides
   both directions: the matcher is run on what each read returns when the thing is
-  absent (`isHidden` true), through any spelling of the read, `expect` and
-  matcher (arguments, computed names, `.call`, `.not`, `Promise.all`, arrays per
-  element). A poll is an absence wait when any read in it passes absent or cannot
-  be judged, and a value poll when its matcher passes on an empty value; a
-  pattern list missed `isHidden` polls, `[false, false]` and `toBe(undefined)`. A
-  wait whose failure `.catch` swallows is a timer when the thing never comes:
-  daily-practice's one now fails loudly instead. Recognising one more spelling at a
-  time kept leaving its siblings open, so what the guard cannot reduce counts as
-  unsafe: a helper means its one final `return` (a bare return or a reachable end
-  is a second path), an uncalled or destructured read method is a read, a helper
-  exported by name is judged where it stands, and only plain-text `toMatch`
-  alternatives prove presence (a regex's sense is as invisible as a boolean's).
-  Every name it decides by (a read, a matcher, `state`) goes through one reader,
-  `keyOf`, which folds a static computed key (`['is' + 'Visible']`) and calls one
-  it cannot fold unsafe; each consumer read names its own way, so each spelling
-  opened a sibling. Timer names and goto URLs are judged by a string's runtime
-  text (escapes cooked, pieces folded, a page script's escapes cooked again): raw
-  source text let `'waitFor\u0054imeout'` and an escaped `#` through. Every wait
-  that can ask for absence is read where Playwright's types let it ask (options,
-  `waitForElementState`'s state, `waitForURL`'s matcher, `waitForFunction`'s page
-  function) in any calling form, and unread is negative; a `state:`-key hunt
-  missed options passed as a variable.
+  absent (`isHidden` true). A pattern list missed `isHidden` polls, `[false,
+  false]` and `toBe(undefined)`; a swallowed wait is a timer when the thing never
+  comes (daily-practice's one now fails loudly). The guard holds a FINITE
+  recognition contract, written once in its header: the files it scans, the name
+  spellings it reads (members and keys whose name is static text: escapes
+  cooked, `+` and `${}` folded from literals; timer names and hash URLs by a
+  string's runtime text), the judgements it makes, and an `EXCLUDED` list of
+  classes it does not check (a name piece held in a binding, a computed call
+  outside an assertion, reflection, an aliased `expect`, an imported helper's
+  meaning…), which are unchecked, not proved safe. An unknown name fails closed
+  in an assertion, a poll, a destructuring key and wait options, and every cell
+  it leaves unchecked names its excluded class. Its test derives every spelling ×
+  position cell's verdict from that policy alone; breaking a shared reader (member
+  keys, destructuring keys, `+` folding, page-script escapes, option keys) fails
+  its whole column. Why a contract: closing one more spelling per review kept
+  leaving siblings open, and "every spelling" has no end. The stopping rule: a
+  counterexample blocks only if it is in a supported class and gets another
+  verdict, or it is a real journey that is unreliable; an excluded spelling
+  alone is a possible extension.
   Its ledger says why each exception
   stands and how many sites it covers. 44 positive reads
   became `expect.poll` with the same matcher. Two polled negatives that followed a
diff --git a/tests/journey-waits.test.ts b/tests/journey-waits.test.ts
index d272de109ab57076c545011ffd4b36ec58eec52a..9cadda91b75bb935c52ea5abbbebbd43d0cf647b 100644
--- a/tests/journey-waits.test.ts
+++ b/tests/journey-waits.test.ts
@@ -6,104 +6,109 @@ import { describe, expect, it } from 'vitest';
 // ---------------------------------------------------------------------------
 // Browser journeys wait on EVENTS. A fixed sleep, a hand-rolled poller or a
 // read of the screen at one instant passes on a fast machine and fails on an
-// unlucky runner — in a lane that never touched the journey. This reads every
-// test file and the harness and refuses those shapes, so the rule holds by
-// construction instead of by review.
+// unlucky runner — in a lane that never touched the journey. This reads the
+// journeys and the harness and refuses those shapes, so the rule holds by
+// construction instead of by review: within the RECOGNITION CONTRACT below,
+// and only there.
 //
-// It parses each file with TypeScript (syntax only), so a quote, a comment, a
-// template or a regex literal is what it is: `'A // B'` is a string and `')'`
-// is not a bracket. A timer named inside a string or template (a page script)
-// still counts. Six rules, each deny-by-default:
-//   sleep     no reference to `waitForTimeout`, `setTimeout` or `setInterval`
-//             — a call, a `.bind`, an import, a page script, a folded key —
-//             by its RUNTIME text (escapes cooked, `+` and `${}` folded, a page
-//             script's own escapes cooked again), and no wait
-//             (`waitFor…`, an assertion) whose failure a `.catch` swallows:
-//             when the thing never comes, that is a timer;
-//   poller    no `while`, `do` or `for(;;)`-style loop that awaits —
+// SCANNED: every `tests/*.ts` but this file (no subdirectory, `.tsx` or
+// `.js`; no journey lives elsewhere), parsed with TypeScript, syntax only. A
+// quote, a comment, a template or a regex literal is what it is: `'A // B'`
+// is a string and `')'` is not a bracket.
+//
+// SUPPORTED NAMES. Every rule decides by a NAME: a read (`READS`), a timer
+// (`TIMER`), a wait (`waitFor…`), `expect`, `soft`, `poll`, a matcher, `not`,
+// `resolves`, `rejects`, `state`, an expected object's key, `goto`. One
+// reader, `keyOf`/`member`, recognises a name written
+//   - as a member: `.n`, `?.n`, an escaped identifier, `[s]`, `?.[s]`;
+//   - as a key, in an object literal or a destructuring pattern (declaration,
+//     parameter, catch, `=`, `for…of`): `n`, an escaped identifier, a string,
+//     `[s]`;
+// where `s` is STATIC TEXT: strings and templates, escapes cooked, folded
+// through `+`, `${}`, parentheses and `as` from literals alone. A timer name
+// and a hash URL are also recognised as the runtime text of any string
+// expression built that way, and a timer as a page script cooks its own
+// escapes again. A name that is not static text is UNKNOWN. Unknown FAILS
+// CLOSED in an assertion or a poll (refused), as a destructuring key (a read)
+// and as a key in wait options (a negative). Anywhere else — a member called
+// or named outside an assertion, an assertion reached by an unknown name, a
+// piece of timer or URL text held in a binding — it is EXCLUDED. `SUPPORTED`
+// below derives every spelling × position cell from this policy alone; the
+// matrix spells the matcher as `toBe`, and the interaction rows prove each
+// matcher's judgement.
+//
+// SUPPORTED JUDGEMENTS. Six rules, each deny-by-default:
+//   sleep     a timer named anywhere but a comment — called, referenced,
+//             bound, imported, destructured, or in a string's runtime text —
+//             and a wait (`waitFor…`, an assertion) whose failure a `.catch`
+//             swallows: when the thing never comes, that is a timer;
+//   poller    a `while`, `do` or `for(;;)` loop that awaits —
 //             `persistedUntil` is the one poller;
-//   positive  a rendered-state READ with no auto-wait — `count`, `isVisible`,
-//             `isHidden`, `isChecked`, `isEnabled`, `isDisabled`, `isEditable`,
-//             by any spelling (arguments, `x['count']`, `?.`, `.call`), or a
-//             local helper — is asserted at one instant only by an `expect`
-//             that PASSES WHEN THE THING IS ABSENT. One evaluation decides it:
-//             each read takes its absent value (0, false; `isHidden` true),
-//             through `.not`, `.resolves`, `!`, `Promise.all`, a `.catch`
+//   positive  a rendered-state READ with no auto-wait (`READS`) — called,
+//             by `?.()`, `.call`, `.apply`, or through a local helper — is
+//             asserted at one instant only by an `expect` that PASSES WHEN
+//             THE THING IS ABSENT. One evaluation decides it: each read takes
+//             its absent value (0, false; `isHidden` true), through `.not`,
+//             `.resolves`, `!` on an awaited read, `Promise.all`, a `.catch`
 //             falling back to that same value, and arrays judged element by
-//             element. It refuses what it cannot reduce (a computed name, a
-//             variable, a comparison, an object), a read it did not carry to
-//             the value (one held in a variable), and a read mixed with a
-//             value (`[await a.count(), url]`);
-//   read      the same read OUTSIDE an assertion — a branch, a variable, a
+//             element. It refuses what it cannot reduce (an unknown name, a
+//             variable, a comparison, an object, `.rejects`), a read it did
+//             not carry to the value (one held in a variable), and a read
+//             mixed with a value (`[await a.count(), url]`). `inputValue`,
+//             geometry (`boundingBox`) and list (`all`, `allInnerTexts`)
+//             reads are VALUE reads, taken after the element was awaited;
+//   read     the same read OUTSIDE an assertion — a branch, a variable, a
 //             read method or helper named without a call (passed, aliased,
-//             bound, destructured in a declaration, parameter, catch, `=` or
-//             `for…of`) — is refused unless ledgered with what it
-//             was read after. A HELPER is a local function with a read in what
-//             it returns; it means what its ONE return evaluates to, and only
-//             when that return is the body's last statement: a second return,
-//             a bare `return;`, an end of body it can reach, a generator, or a
+//             bound, destructured) — unless ledgered with what it was read
+//             after. A HELPER is a local function with a read in what it
+//             returns; it means what its ONE return evaluates to, and only
+//             when that return is the body's last statement: a second
+//             return, a bare `return;`, a reachable end, a generator, two
+//             definitions, a helper reached while it is evaluated, or a
 //             return the evaluation cannot reduce leaves every call unjudged
-//             (inline callbacks and `.catch` fallbacks alike);
-//   negative  every poll not PROVEN unable to pass on what never came is
-//             ledgered with why it cannot: it follows a wait that SAW the thing
-//             (a disappearance after presence), or it is a presence the table
-//             below cannot see (a variable, template or boolean expectation, a
-//             read mixed with a value). A poll
-//             of reads waits for presence when the same evaluation fails at
-//             every read's absent value, element by element (`[true, false]`
-//             still waits on nothing for its second half). A poll of a value
-//             (no read in it) may hold ANY value, an empty one included, so
-//             only a closed table proves it cannot pass on an empty value:
-//             `toBe`/`toEqual` of a literal whose every leaf is a non-empty
-//             string or a POSITIVE number (no boolean, 0, -1), `toContain` of a
-//             non-empty string, `toMatch` of a regex of plain-text alternatives
-//             (no anchor, class, group, quantifier or `\D`-style escape, whose
+//             (inline callbacks and `.catch` fallbacks alike). A helper
+//             exported in any form is judged where it stands;
+//   negative  every poll and wait not PROVEN unable to pass on what never
+//             came is ledgered with why it cannot: it follows a wait that SAW
+//             the thing (a disappearance after presence), or it is a presence
+//             the table below cannot see (a variable, template or boolean
+//             expectation, a read mixed with a value). A poll of reads waits
+//             for presence when the same evaluation fails at every read's
+//             absent value, element by element (`[true, false]` still waits
+//             on nothing for its second half). A poll of a value (no read in
+//             it) may hold ANY value, an empty one included, so only a closed
+//             table proves it cannot pass on an empty value: `toBe`/`toEqual`
+//             of a literal whose every leaf is a non-empty string or a
+//             POSITIVE number (no boolean, 0, -1), `toContain` of a non-empty
+//             string, `toMatch` of a regex of plain-text alternatives (no
+//             anchor, class, group, quantifier or `\D`-style escape, whose
 //             sense may be absence; at most the `i` flag),
 //             `toBeGreaterThan(n >= 0)`, `toBeGreaterThanOrEqual(n > 0)`,
 //             `toHaveLength(n > 0)`. Everything else is negative: `.not`, no
 //             matcher, a variable, an unknown matcher, a boolean (its sense —
-//             `!t.includes(x)` — is invisible). So is every wait that may pass
-//             on what never came, read where Playwright's types let it ask:
-//             `state: 'detached' | 'hidden'` anywhere; `waitFor`/
-//             `waitForSelector` options it cannot read (a variable, a call, a
-//             spread, an unfoldable key, a state that is not a literal);
-//             `waitForElementState('hidden')` or an unread state; `waitForURL`
-//             unless a plain regex or glob-free URL; `waitForFunction` (a page
-//             function's sense is invisible); a `waitFor…` not in the table; and
-//             any of these by `.apply`, `.bind`, destructuring or passing. Event
-//             waits (`waitForEvent`, `…Request`, `…Response`, `…LoadState`,
+//             `!t.includes(x)` — is invisible). So is every wait that may
+//             pass on what never came, read where Playwright's types let it
+//             ask: `state: 'detached' | 'hidden'` anywhere; options it cannot
+//             read (a variable, a call, a spread, an unknown key, a `state`
+//             that is not a literal); `waitForElementState('hidden')` or an
+//             unread state; `waitForURL` unless a plain regex or glob-free
+//             URL; `waitForFunction` (a page function's sense is invisible); a
+//             `waitFor…` not in the table; and any of these by `.call`,
+//             `.apply`, `.bind`, destructuring or passing. Event waits
+//             (`waitForEvent`, `…Request`, `…Response`, `…LoadState`,
 //             `…Navigation`) need something to happen, so cannot;
-//   goto      no raw `page.goto` to a hash route (by runtime text) outside the harness: `goTo`
-//             is the navigation that waits for the destination.
-// `expect`, `expect.soft`, `.poll` and every matcher are matched by name in
-// any spelling (`expect['poll']`, `['not']`). Every NAME — a read, a matcher,
-// a destructured key, `state`, an expected object's key — is read by one
-// function, `keyOf`: its static value however spelled (`'a'`, `` `a` ``, `1`,
-// `['is' + 'A']`, `` [`is${'A'}`] ``); a key it cannot fold may be any name,
-// so it is unsafe wherever a name decides (refused in an assertion, a read
-// when destructured, a negative in waitFor options, unjudged in an expected
-// object). Geometry (`boundingBox`) and
-// list (`all`, `allInnerTexts`) reads are VALUE reads, like `inputValue`:
-// taken after the element was awaited. Deliberately out of reach: `for…of`/
-// `for…in` loops (walks over a fixed list, as the engine loops are; a timed
-// poller in one still trips `sleep`), a computed call OUTSIDE an assertion
-// (`x[k]()` may be anything; inside one it is refused), a computed member
-// named without a call (`x[k]` is indexing, everywhere and indistinguishable
-// from a read method, where destructuring a locator is not), a name passed as
-// an argument (`Reflect.get(x, 'count')`), an aliased `expect`, a name or
-// URL with a piece held in any binding (`const` included) or computed by a
-// call (`page['waitFor' + t]`, `'a'.concat(b)`) (runtime text is what an
-// expression built from literals alone evaluates to; a binding holding the
-// WHOLE name is still caught, as its literal is scanned),
-// a helper exported to another file in any spelling (`export function`,
-// `export { rows }`, `export default rows`: its read is judged where it
-// stands, as there is no caller here to judge), and Playwright's own
-// web-first matchers (`toBeHidden`…), which these tests cannot reach: they
-// import Vitest's `expect`; and a value COMPUTED to encode absence (a fallback string, a count
-// of what is missing) — the table proves a poll cannot pass on an empty or
-// sentinel value, not that the value means presence. Two helpers sharing a
-// name, and a helper reached again while it is being evaluated, are judged
-// unknown; so is `!` on a read that is not awaited.
+//   goto      a raw `page.goto` whose URL's runtime text holds a `#`, outside
+//             the harness: `goTo` is the navigation that waits.
+//
+// EXCLUDED — UNCHECKED, NOT PROVED SAFE. `EXCLUDED` below names each class
+// outside the contract with one example. The scanner says nothing about
+// them, and that silence is no verdict: a journey must not rely on them.
+//
+// STOPPING RULE. A counterexample blocks this guard only when it is written in
+// a supported class and gets a verdict other than the policy's, or when it is
+// an actual repository consumer that is unreliable. A spelling in an excluded
+// class alone is a possible extension: its class joins the contract, with its
+// policy cells, before it is judged.
 //
 // A ledger entry names its file, the rule, a snippet of the site (whitespace
 // collapsed), how many sites it vouches for (`sites`, default 1) and WHY they
@@ -384,6 +389,25 @@ const LEDGER: { file: string; rule: Rule; snippet: string; sites?: number; why:
   },
 ];
 
+/**
+ * Outside the recognition contract: UNCHECKED, not proved safe. Each class
+ * with one example; the test asserts no verdict on them, only that none is
+ * also a supported cell.
+ */
+const EXCLUDED: { id: string; class: string; example: string }[] = [
+  { id: 'binding-piece', class: 'a name or URL, or a piece of one, held in a binding (`const` included) or computed by a call', example: "async function f(t) {\n  await page['waitFor' + t](300);\n}" },
+  { id: 'computed-call', class: 'a call by an unknown name outside an assertion', example: 'await page[k](300);' },
+  { id: 'computed-member', class: 'a member by an unknown name, not called, outside an assertion (indexing)', example: 'expect(await Reflect.apply(box[m], box, [])).toBe(true);' },
+  { id: 'unknown-assertion', class: 'an assertion reached by an unknown name, with no read in it (with one, the read is refused)', example: 'await expect[k](() => q()).toBe(null);' },
+  { id: 'reflection', class: 'a name passed as an argument to reflection', example: "expect(await Reflect.get(box, 'isVisible').call(box)).toBe(true);" },
+  { id: 'aliased-expect', class: 'an aliased `expect`', example: 'const e = expect;\nawait e.poll(() => q()).toBe(null);' },
+  { id: 'for-of-loop', class: 'a `for…of`/`for…in` loop that awaits, with no timer in it', example: 'for (const b of boxes) if (await ok(b)) break;' },
+  { id: 'imported-helper', class: 'the meaning of a helper imported from another file at its call (its own read is refused where it is defined)', example: "import { rows } from './rows';\nexpect(await rows(box)).toBe(1);" },
+  { id: 'web-first-matcher', class: "Playwright's web-first matchers, unreachable through Vitest's `expect`", example: 'await expect(box).toBeHidden();' },
+  { id: 'encoded-absence', class: 'a value COMPUTED to encode absence (the table proves a poll cannot pass on an empty value, not that the value means presence)', example: "await expect.poll(() => (gone() ? 'gone' : 'there')).toBe('gone');" },
+  { id: 'unscanned-file', class: 'a file outside `tests/*.ts`', example: '// tests/sub/x.ts, tests/x.tsx, tests/x.js' },
+];
+
 const DIR = join(process.cwd(), 'tests');
 const SELF = 'journey-waits.test.ts';
 const HARNESS = 'practiceBrowser.ts';
@@ -570,7 +594,7 @@ const promiseAll = (e: ts.Expression): ts.Expression | undefined => {
   return m?.name === 'all' && of && ts.isIdentifier(of) && of.text === 'Promise' && (e as ts.CallExpression).arguments.length === 1 ? (e as ts.CallExpression).arguments[0] : undefined;
 };
 
-/** `expect` or `expect.soft`, by any spelling. */
+/** `expect` or `expect.soft`, by any supported spelling. */
 const isExpectFn = (node: ts.Expression): boolean => {
   const e = bare(node);
   return (ts.isIdentifier(e) && e.text === 'expect') || (named(e, 'soft') && isExpectFn(member(e)!.of));
@@ -579,7 +603,7 @@ const isExpect = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n)
 const isPoll = (n: ts.Node): n is ts.CallExpression => ts.isCallExpression(n) && named(n.expression, 'poll') && isExpectFn(member(n.expression)!.of);
 
 type Matcher = { not: boolean; rejects: boolean; name: string; args: readonly ts.Expression[]; call: ts.CallExpression };
-/** The matcher an `expect(…)`/`expect.poll(…)` call is chained into, through `.not`, `.resolves`, `.rejects`, by any spelling. */
+/** The matcher an `expect(…)`/`expect.poll(…)` call is chained into, through `.not`, `.resolves`, `.rejects`, by any supported spelling. */
 function matcherOf(subject: ts.CallExpression): Matcher | null {
   let node: ts.Node = subject;
   let not = false;
@@ -767,7 +791,7 @@ export function scan(file: string, raw: string): Site[] {
     // poller: a loop that awaits — `persistedUntil` is the one.
     if ((ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isForStatement(node)) && hasAwait(node)) at(node, 'poller');
     // negative: a wait for something to be GONE passes at once if it never came — `state: 'detached' | 'hidden'`
-    // however spelled, wherever it is written (the wait table below reads a state it cannot read).
+    // in any supported spelling, wherever it is written (the wait table below reads a state it cannot read).
     if (ts.isPropertyAssignment(node) && keyOf(node.name) === 'state') {
       const state = literal(node.initializer);
       if (typeof state === 'string' && ABSENT_STATES.has(state)) at(ts.findAncestor(node, ts.isCallExpression) ?? node, 'negative');
@@ -1002,6 +1026,139 @@ function scanAll(): Site[] {
     .flatMap((f) => scan(f, readFileSync(join(DIR, f), 'utf8')));
 }
 
+// ---------------------------------------------------------------------------
+// SUPPORTED: every spelling class the contract names, at every position it
+// names, with the verdict the POLICY gives — a static name one verdict, an
+// unknown name the fail-closed one, or the `EXCLUDED` class it falls in where
+// the contract does not check it. The verdict is read off the class alone, never through the scanner's own
+// readers, so a cell cannot pass by agreeing with itself.
+// ---------------------------------------------------------------------------
+/** A verdict, or the `EXCLUDED` class the cell falls in. */
+type Want = Rule[] | { unchecked: string };
+const code = (n: string) => n.codePointAt(0)!.toString(16);
+const uEsc = (n: string) => `\\u${code(n).padStart(4, '0')}${n.slice(1)}`;
+const xEsc = (n: string) => `\\x${code(n).padStart(2, '0')}${n.slice(1)}`;
+const cpEsc = (n: string) => `\\u{${code(n)}}${n.slice(1)}`;
+const [head, tail] = [(n: string) => n.slice(0, 4), (n: string) => n.slice(4)];
+/** Static text as the parts of a string expression: literal, escaped, folded. */
+const TEXT: Record<string, (n: string) => string> = {
+  string: (n) => `'${n}'`,
+  'unicode-escaped string': (n) => `'${uEsc(n)}'`,
+  'code-point-escaped string': (n) => `'${cpEsc(n)}'`,
+  'hex-escaped string': (n) => `'${xEsc(n)}'`,
+  template: (n) => `\`${n}\``,
+  'escaped template': (n) => `\`${uEsc(n)}\``,
+  concatenation: (n) => `'${head(n)}' + '${tail(n)}'`,
+  interpolation: (n) => `\`${head(n)}\${'${tail(n)}'}\``,
+  'as const': (n) => `('${n}' as const)`,
+};
+/** …and, for a page script only, text the page cooks again. */
+const SCRIPT: Record<string, (n: string) => string> = {
+  ...TEXT,
+  'page-escaped string': (n) => `'${uEsc(n).replace('\\', '\\\\')}'`,
+  'page-escaped raw template': (n) => `String.raw\`${uEsc(n)}\``,
+};
+const MEMBER: Record<string, (n: string) => string> = {
+  identifier: (n) => `.${n}`,
+  'escaped identifier': (n) => `.${uEsc(n)}`,
+  'optional chain': (n) => `?.${n}`,
+  ...Object.fromEntries(Object.entries(TEXT).map(([k, f]) => [`[${k}]`, (n: string) => `[${f(n)}]`])),
+  '?.[string]': (n) => `?.['${n}']`,
+};
+const KEY: Record<string, (n: string) => string> = {
+  identifier: (n) => n,
+  'escaped identifier': uEsc,
+  string: (n) => `'${n}'`,
+  'escaped string': (n) => `'${uEsc(n)}'`,
+  ...Object.fromEntries(Object.entries(TEXT).map(([k, f]) => [`[${k}]`, (n: string) => `[${f(n)}]`])),
+};
+/** The one unknown spelling per position: a name only the run decides. */
+/** A literal: static text that is not folded from pieces. */
+const { concatenation, interpolation, ...LITERAL } = TEXT;
+const UNKNOWN_SPELLING = { member: '[k]', key: '[k]', text: 'k', script: 'k', literal: 'k', folded: 'k' } as const;
+const SPELLINGS = { member: MEMBER, key: KEY, text: TEXT, script: SCRIPT, literal: LITERAL, folded: { concatenation, interpolation } };
+
+type Position = { names: readonly string[]; as: keyof typeof SPELLINGS; code: (s: string, n: string) => string; known: Want; unknown: Want };
+const READ_NAMES = Object.keys(READS);
+const absentOf = (n: string) => String(READS[n]);
+const presentOf = (n: string) => (typeof READS[n] === 'number' ? '1' : String(!READS[n]));
+const TIMERS = ['waitForTimeout', 'setTimeout', 'setInterval'];
+const on = (n: string) => (n === 'waitForTimeout' ? 'page' : 'globalThis');
+const WAITS = ['waitFor', 'waitForSelector'];
+const OTHER_WAITS = ['waitForElementState', 'waitForURL', 'waitForFunction', 'waitForAnythingElse'];
+const EVENTS = ['waitForEvent', 'waitForRequest', 'waitForResponse', 'waitForLoadState', 'waitForNavigation'];
+const [waitOn, before] = [(n: string) => (n === 'waitFor' ? 'toast' : 'page'), (n: string) => (n === 'waitFor' ? '' : "'x', ")];
+const DESTRUCTURING = [(k: string) => `const { ${k}: v } = box;`, (k: string) => `({ ${k}: v } = box);`, (k: string) => `async function f({ ${k}: v }) {}`, (k: string) => `try {} catch ({ ${k}: v }) {}`, (k: string) => `for (const { ${k}: v } of boxes);`, (k: string) => `for ({ ${k}: v } of boxes);`];
+const POLICY: Position[] = [
+  // A read: judged at its absent value in an assertion, refused outside one.
+  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}()).toBe(${presentOf(n)});`, known: ['positive'], unknown: ['positive'] },
+  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}()).toBe(${absentOf(n)});`, known: [], unknown: ['positive'] },
+  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}.call(box)).toBe(${presentOf(n)});`, known: ['positive'], unknown: ['positive'] },
+  { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}.apply(box, [])).toBe(${absentOf(n)});`, known: [], unknown: ['positive'] },
+  { names: READ_NAMES, as: 'member', code: (s, n) => `await expect.poll(() => box${s}()).toBe(${absentOf(n)});`, known: ['negative'], unknown: ['negative'] },
+  { names: READ_NAMES, as: 'member', code: (s, n) => `await expect.poll(() => box${s}()).toBe(${presentOf(n)});`, known: [], unknown: ['negative'] },
+  { names: READ_NAMES, as: 'member', code: (s) => `const v = await box${s}();`, known: ['read'], unknown: { unchecked: 'computed-call' } },
+  { names: READ_NAMES, as: 'member', code: (s) => `const f = box${s};`, known: ['read'], unknown: { unchecked: 'computed-member' } },
+  ...DESTRUCTURING.map((d): Position => ({ names: READ_NAMES, as: 'key', code: (s) => d(s), known: ['read'], unknown: ['read'] })),
+  // A timer: a sleep wherever it is named.
+  { names: TIMERS, as: 'member', code: (s, n) => `await ${on(n)}${s}(1);`, known: ['sleep'], unknown: { unchecked: 'computed-call' } },
+  { names: TIMERS, as: 'member', code: (s, n) => `const w = ${on(n)}${s};`, known: ['sleep'], unknown: { unchecked: 'computed-member' } },
+  { names: TIMERS, as: 'member', code: (s, n) => `${on(n)}${s}.call(${on(n)}, go, 1);`, known: ['sleep'], unknown: { unchecked: 'computed-member' } },
+  { names: TIMERS, as: 'key', code: (s, n) => `const { ${s}: w } = ${on(n)};`, known: ['sleep'], unknown: ['read'] },
+  { names: TIMERS, as: 'text', code: (s, n) => `Reflect.get(${on(n)}, ${s});`, known: ['sleep'], unknown: { unchecked: 'binding-piece' } },
+  { names: TIMERS, as: 'script', code: (s) => `await page.addInitScript(${s} + '(go, 1)');`, known: ['sleep'], unknown: { unchecked: 'binding-piece' } },
+  // A wait that can ask for absence: negative unless its options are read as presence.
+  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}(${before(n)}{ state: 'hidden' });`, known: ['negative'], unknown: ['negative'] },
+  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}(${before(n)}{ state: 'visible' });`, known: [], unknown: { unchecked: 'computed-call' } },
+  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}(${before(n)}opts);`, known: ['negative'], unknown: { unchecked: 'computed-call' } },
+  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}.call(${waitOn(n)}, ${before(n)}{ state: 'visible' });`, known: [], unknown: { unchecked: 'computed-member' } },
+  { names: WAITS, as: 'member', code: (s, n) => `await ${waitOn(n)}${s}.call(${waitOn(n)}, ${before(n)}opts);`, known: ['negative'], unknown: { unchecked: 'computed-member' } },
+  { names: WAITS, as: 'member', code: (s, n) => `const w = ${waitOn(n)}${s};`, known: ['negative'], unknown: { unchecked: 'computed-member' } },
+  { names: WAITS, as: 'key', code: (s, n) => `const { ${s}: w } = ${waitOn(n)};`, known: ['negative'], unknown: ['read'] },
+  // Every other wait name: absence-capable ones are negative wherever named, event waits are not.
+  { names: OTHER_WAITS, as: 'member', code: (s) => `const w = page${s};`, known: ['negative'], unknown: { unchecked: 'computed-member' } },
+  { names: OTHER_WAITS, as: 'key', code: (s) => `const { ${s}: w } = page;`, known: ['negative'], unknown: ['read'] },
+  { names: EVENTS, as: 'member', code: (s) => `const w = page${s};`, known: [], unknown: { unchecked: 'computed-member' } },
+  { names: EVENTS, as: 'key', code: (s) => `const { ${s}: w } = page;`, known: [], unknown: ['read'] },
+  ...WAITS.flatMap((w): Position[] => [
+    { names: ['state'], as: 'key', code: (s) => `await ${waitOn(w)}.${w}(${before(w)}{ ${s}: 'detached' });`, known: ['negative'], unknown: ['negative'] },
+    { names: ['state'], as: 'key', code: (s) => `await ${waitOn(w)}.${w}(${before(w)}{ ${s}: 'attached' });`, known: [], unknown: ['negative'] },
+  ]),
+  // `state`'s value is judged only as a literal; folded or not, any other text is unknown.
+  { names: ['hidden', 'detached'], as: 'text', code: (s) => `await toast.waitFor({ state: ${s} });`, known: ['negative'], unknown: ['negative'] },
+  { names: ['visible', 'attached'], as: 'literal', code: (s) => `await toast.waitFor({ state: ${s} });`, known: [], unknown: ['negative'] },
+  { names: ['visible', 'attached'], as: 'folded', code: (s) => `await toast.waitFor({ state: ${s} });`, known: ['negative'], unknown: ['negative'] },
+  // The assertion's own names.
+  { names: ['toBe'], as: 'member', code: (s) => `expect(await box.isVisible())${s}(true);`, known: ['positive'], unknown: ['positive'] },
+  { names: ['toBe'], as: 'member', code: (s) => `expect(await box.isVisible())${s}(false);`, known: [], unknown: ['positive'] },
+  { names: ['toBe'], as: 'member', code: (s) => `await expect.poll(() => box.count())${s}(1);`, known: [], unknown: ['negative'] },
+  { names: ['toBe'], as: 'member', code: (s) => `await expect.poll(() => q())${s}('x');`, known: [], unknown: ['negative'] },
+  { names: ['toBe'], as: 'member', code: (s) => `await expect.poll(() => q())${s}(null);`, known: ['negative'], unknown: ['negative'] },
+  { names: ['not'], as: 'member', code: (s) => `expect(await box.isVisible())${s}.toBe(false);`, known: ['positive'], unknown: ['positive'] },
+  { names: ['not'], as: 'member', code: (s) => `expect(await box.isVisible())${s}.toBe(true);`, known: [], unknown: ['positive'] },
+  { names: ['not'], as: 'member', code: (s) => `await expect.poll(() => box.count())${s}.toBe(1);`, known: ['negative'], unknown: ['negative'] },
+  { names: ['resolves'], as: 'member', code: (s) => `await expect(box.isVisible())${s}.toBe(true);`, known: ['positive'], unknown: ['positive'] },
+  { names: ['resolves'], as: 'member', code: (s) => `await expect(box.isVisible())${s}.toBe(false);`, known: [], unknown: ['positive'] },
+  { names: ['rejects'], as: 'member', code: (s) => `await expect(box.isVisible())${s}.toBe(false);`, known: ['positive'], unknown: ['positive'] },
+  { names: ['soft'], as: 'member', code: (s) => `expect${s}(await box.isVisible()).toBe(true);`, known: ['positive'], unknown: ['read'] },
+  { names: ['soft'], as: 'member', code: (s) => `expect${s}(await box.isVisible()).toBe(false);`, known: [], unknown: ['read'] },
+  { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => box.count()).toBe(0);`, known: ['negative'], unknown: ['read'] },
+  { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => box.count()).toBe(1);`, known: [], unknown: ['read'] },
+  { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => q()).toBe(null);`, known: ['negative'], unknown: { unchecked: 'unknown-assertion' } },
+  { names: ['a'], as: 'key', code: (s) => `await expect.poll(() => q()).toEqual({ ${s}: 'x' });`, known: [], unknown: ['negative'] },
+  { names: ['a'], as: 'key', code: (s) => `await expect.poll(() => q()).toEqual({ ${s}: '' });`, known: ['negative'], unknown: ['negative'] },
+  // A raw hash navigation: by its method's name and its URL's runtime text.
+  { names: ['goto'], as: 'member', code: (s) => `await page${s}(\`\${origin}#/items\`);`, known: ['goto'], unknown: { unchecked: 'computed-call' } },
+  { names: ['#/items'], as: 'text', code: (s) => `await page.goto(origin + ${s});`, known: ['goto'], unknown: { unchecked: 'binding-piece' } },
+];
+/** Every cell: [source, the policy's verdict, the spelling class it exercises]. */
+const SUPPORTED: [string, Want, string][] = POLICY.flatMap((p) =>
+  p.names.flatMap((n) => [
+    ...Object.entries(SPELLINGS[p.as]).map(([cls, spell]): [string, Want, string] => [p.code(spell(n), n), p.known, `${p.as} ${cls}`]),
+    [p.code(UNKNOWN_SPELLING[p.as], n), p.unknown, `${p.as} unknown`] as [string, Want, string],
+  ]),
+);
+
 describe('journey waits', () => {
   it('browser journeys wait on events, never on fixed sleeps, hand-rolled pollers or positive point-in-time reads', () => {
     // The scanner reads something: the harness's own ledgered sites are found.
@@ -1088,9 +1245,10 @@ describe('journey waits', () => {
     expect(rules("await row.waitFor({ state: 'attached' });")).toEqual([]);
     expect(rules('await expect.poll(() => q()).toBe(null);')).toEqual(['negative']);
 
-    // EVERY SPELLING of a read, a matcher and an absence is judged the same
-    // way: the claim is checked against what the read returns when the thing
-    // is absent. One table, so a run shows every miss at once.
+    // INTERACTIONS: each supported judgement through the shapes it composes
+    // with — helpers, arrays, `.catch`, `!`, the presence and wait tables —
+    // checked against what each read returns when the thing is absent. One
+    // table, so a run shows every miss at once.
     const H = 'async function hidden(b) {\n  return b.isHidden();\n}\n';
     const BRANCHY = 'async function state(b, open) {\n  if (open) return b.count();\n  return b.isHidden();\n}\n';
     const TERNARY = 'const state = (b, open) => (open ? b.count() : b.isHidden());\n';
@@ -1109,7 +1267,7 @@ describe('journey waits', () => {
       ['expect(await box[method]()).toBe(true);', ['positive']],
       ['expect(await box[method]()).toBe(false);', ['positive']],
       ['const see = box.isVisible.bind(box);', ['read']],
-      // the assertion by any spelling: soft, a computed matcher, resolves, a not by name
+      // the assertion by its spellings: soft, a computed matcher, resolves, a not by name
       ['expect.soft(await box.isVisible()).toBe(true);', ['positive']],
       ['expect(await box.isVisible())["toBe"](true);', ['positive']],
       ['await expect(box.isVisible()).resolves.toBe(true);', ['positive']],
@@ -1124,7 +1282,7 @@ describe('journey waits', () => {
       ['expect(await box.count()).toBeGreaterThanOrEqual(1);', ['positive']],
       ['expect(await box.isHidden()).toBeTruthy();', []],
       ['expect(await box.isVisible({ timeout: 100 })).toBe(false);', []],
-      // a POLLED absence, by any spelling, is a negative to ledger
+      // a POLLED absence, by its spellings, is a negative to ledger
       ['await expect.poll(() => box.isHidden()).toBe(true);', ['negative']],
       ['await expect.poll(() => Promise.all([a.isChecked(), b.isChecked()])).toEqual([false, false]);', ['negative']],
       ['await expect.poll(() => Promise.all([a.isChecked(), b.isChecked()])).toEqual([true, false]);', ['negative']],
@@ -1249,7 +1407,7 @@ describe('journey waits', () => {
       ['async function hidden(b, k) {\n  switch (k) { case 1: return b.isHidden(); }\n}\nawait expect.poll(() => hidden(box, k)).toBeFalsy();', ['negative']],
       ['expect(await box.isVisible().catch(() => { if (!open) return; return false; })).toBe(false);', ['positive']],
       ['async function* rows(b) {\n  return b.count();\n}\nawait expect.poll(() => rows(box)).toBe(1);', ['negative']],
-      // A helper exported IN ANY SPELLING has its callers elsewhere: its read is judged where it stands, once.
+      // A helper exported IN ANY FORM has its callers elsewhere: its read is judged where it stands, once.
       ['async function rows(b) {\n  return b.count();\n}\nexport { rows };', ['read']],
       ['const rows = (b) => b.count();\nexport { rows };', ['read']],
       ['async function rows(b) {\n  return b.count();\n}\nexport { rows as r };', ['read']],
@@ -1263,10 +1421,6 @@ describe('journey waits', () => {
       ['const { count: n } = box;', ['read']],
       ['let see;\n({ isVisible: see } = box);', ['read']],
       ['({ count } = box);', ['read']],
-      // …but an uncalled COMPUTED member is indexing, indistinguishable from a read method: out of reach,
-      // as is a name passed as an argument (`Reflect.get`), which is no property-name form.
-      ['expect(await Reflect.apply(box[m], box, [])).toBe(true);', []],
-      ["expect(await Reflect.get(box, 'isVisible').call(box)).toBe(true);", []],
       // A PROPERTY NAME means its static value however it is spelled — an
       // identifier, a string, a template, a number, or a computed key folding
       // those (`'is' + 'Visible'`, `` `is${'Visible'}` ``) — at every consumer:
@@ -1297,7 +1451,7 @@ describe('journey waits', () => {
       ["await page.waitForSelector('x', { ['state']: 'hidden' });", ['negative']],
       ["await page.waitForSelector('x', { [`sta${'te'}`]: 'detached' });", ['negative']],
       ["await toast.waitFor({ ['timeout']: 5_000 });", []],
-      // …an absence by any waitFor, its state however written…
+      // …an absence by any waitFor, its state in each supported form…
       ["await page.waitForSelector('x', { state: gone });", ['negative']],
       ["await page.waitForSelector('x', { state });", ['negative']],
       ["await page.waitForSelector('x', { state: 'hid' + 'den' });", ['negative']],
@@ -1351,13 +1505,9 @@ describe('journey waits', () => {
       ['await page.addInitScript("window[\'set\\\\x54imeout\'](go, 100)");', ['sleep']],
       ['await page.addInitScript("window[\'set\\\\124imeout\'](go, 100)");', ['sleep']],
       ['await page.addInitScript(String.raw`set\\u0054imeout(go, 100)`);', ['sleep']],
-      // …while a name only the run decides stays out of reach.
-      ['await page[k](300);', []],
-      ["async function f(t) {\n  await page['waitFor' + t](300);\n}", []],
       // A raw hash navigation is its runtime URL however the `#` is written.
       ['await page.goto(`${origin}\\u0023/items`);', ['goto']],
       ["await page.goto(origin + '\\x23/items');", ['goto']],
-      ['await page.goto(url);', []],
       // EVERY WAIT that can ask for absence (playwright-core's types) is read
       // where it asks — options, a positional state, a URL matcher, a page
       // function — and is a negative when the scan cannot read it, in any
@@ -1392,5 +1542,24 @@ describe('journey waits', () => {
       ["await page.waitForSomething('x');", ['negative']],
     ];
     expect(spellings.filter(([code, want]) => JSON.stringify(rules(code)) !== JSON.stringify(want)).map(([code, want]) => `${code} → ${JSON.stringify(rules(code))}, want ${JSON.stringify(want)}`)).toEqual([]);
+
+    // THE CONTRACT'S MATRIX: every supported spelling at every supported
+    // position gets the policy's verdict; an unchecked cell is asserted nothing.
+    const judged = SUPPORTED.filter((c): c is [string, Rule[], string] => Array.isArray(c[1]));
+    expect(judged.length).toBeGreaterThan(2000);
+    expect(judged.filter(([src, want]) => JSON.stringify(rules(src)) !== JSON.stringify(want)).map(([src, want, cls]) => `${cls}: ${src} → ${JSON.stringify(rules(src))}, want ${JSON.stringify(want)}`)).toEqual([]);
+    // No cell is vacuous: an escaped spelling holds a backslash for the scanner to cook, and each name's spellings differ.
+    for (const [kind, table] of Object.entries(SPELLINGS))
+      for (const n of ['count', 'state', '#/items']) {
+        const spelled = Object.entries(table).map(([cls, f]) => [cls, f(n)]);
+        expect(spelled.filter(([cls, src]) => /escaped/.test(cls) && !src.includes('\\')).map(([cls]) => `${kind} ${cls}`)).toEqual([]);
+        expect(new Set(spelled.map(([, src]) => src)).size, `${kind} ${n}`).toBe(spelled.length);
+      }
+    // Every unchecked cell falls in a declared EXCLUDED class.
+    const ids = new Set(EXCLUDED.map((e) => e.id));
+    expect(SUPPORTED.flatMap(([src, want]) => (Array.isArray(want) || ids.has(want.unchecked) ? [] : [`${want.unchecked}: ${src}`]))).toEqual([]);
+    // The boundary is one line: nothing excluded is also a judged cell or a judged interaction.
+    const asserted = new Set([...judged.map(([src]) => src), ...spellings.map(([src]) => src)]);
+    expect(EXCLUDED.filter((e) => asserted.has(e.example)).map((e) => e.class)).toEqual([]);
   });
 });
```

**Paths the rework touched:**

- `DECISIONS.md`
- `tests/journey-waits.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
af4f612 The wait guard holds a finite recognition contract, proved cell by cell

Family: journey-wait-guard-complete-enforcement.

Invariant: the guard's enforcement claim is bounded by one written
contract — the files it scans, the name spellings and positions it reads,
the judgements it makes — and inside that boundary every cell gets the
policy's verdict, an unknown name or shape failing closed. Outside it,
syntax is listed as UNCHECKED, never asserted as passing.

What changed:
- tests/journey-waits.test.ts header is now that contract: SCANNED,
  SUPPORTED NAMES (member and key spellings of static text; timer names
  and hash URLs by runtime text), SUPPORTED JUDGEMENTS (the six rules,
  with no "any spelling" claims left), EXCLUDED, and the STOPPING RULE.
- EXCLUDED is data: one example per unchecked class. The five old table
  rows that asserted [] for out-of-reach syntax (page[k](), the
  'waitFor' + t helper, Reflect.apply(box[m]), Reflect.get(...).call,
  page.goto(url)) moved there, because asserting [] meant "proved safe".
- SUPPORTED is a policy-derived matrix: a POLICY of positions (read,
  timer, absence-wait, state key and value, matcher/not/resolves/rejects/
  soft/poll, expected-object key, goto name and URL), each crossed with
  every spelling class of its kind plus one unknown spelling. Expected
  verdicts come from the class alone, never from keyOf/member/constant/
  fold/decode. 2,134 judged cells (of 2,176; 42 unchecked), all inside the exact-named ac-7 test,
  after the unchanged repository sweep and exact ledger accounting.
- Anti-vacuity: every "escaped" spelling must hold a backslash, and every
  name's spellings must differ; nothing EXCLUDED may also be a judged cell
  or interaction row.
- DECISIONS 2026-10-08 now describes the contract and stopping rule
  instead of claiming every spelling.

Proof: the matrix passes on the unchanged scanner (3c6c82f's), so no
fail-open was found inside the boundary and the analyser is not grown.
That it d
… (truncated)

efa469f Every unchecked cell names its excluded class; the header says exactly where unknown fails closed

Family: journey-wait-guard-complete-enforcement (same rework, aligning the
contract's text with its matrix).

- Header: an unknown name fails closed in an assertion or poll, as a
  destructuring key and as a wait-option key; a member called or named
  outside an assertion, an assertion reached by an unknown name, and a
  piece of timer or URL text in a binding are EXCLUDED. That matches the
  matrix's unchecked cells, which the previous wording contradicted.
  Numbers are dropped from the claimed key spellings (no cell used them).
  The matrix spells the matcher as `toBe`; the interaction rows prove
  each matcher's judgement, and the header now says so.
- EXCLUDED entries carry ids; every unchecked cell names one, and the
  test asserts each named id exists (new class: unknown-assertion).
- New positions cross every spelling with the other wait names:
  waitForElementState, waitForURL, waitForFunction and an unknown
  waitFor… are negative wherever named; the five event waits are not.
  Dropping waitForEvent from EVENT_WAITS fails every spelling column of
  those cells (checked by mutation, with the sweep and interaction
  assertions made soft for the trial only).
- Cells: 2,377 judged of 2,428 (51 unchecked, each in a named class),
  measured on this commit. The scanner is unchanged.
- DECISIONS 2026-10-08 states where unknown fails closed.

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
