---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
patchId: b70ac5ecb53f2c58f385e3693af2e45ab95c0a08
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-08T22:54:03.553Z
sealedAt: 2026-10-08T22:56:35.532Z
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
- **Diff patch-id:** `b70ac5ecb53f2c58f385e3693af2e45ab95c0a08`
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

- **journey-wait-guard-complete-enforcement** — [P2] Preserve computed expected-object keys or fail closed: literal() loses __proto__ leaves, so the guard violates its supported recognition contract.
  _counterexample:_ tests/journey-waits.test.ts:457-461 builds expected objects with {} and o[key] assignment. scan('probe.ts', "await expect.poll(() => q()).toEqual({a: 'x', ['__proto__']: ''});") returns [] instead of ['negative']; an unknown leaf also passes. Independent sweep: 288 failures across toEqual/toStrictEqual, eight supported computed-key spellings, six empty/unknown leaves, and top-level/nested-object/array positions. Shared affected chain: literal, full/unjudgeable, provesPresence, waitsForPresence. Checked clean: ordinary keys, constructor, prototype, rendered-read assertions, wait options, repository ledger and existing journeys; no existing journey uses __proto__. Repair the shared evaluator and cover this family in the exact named ac-7 test, aligning its matrix and documentation.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 986b351fbb8522b63d426413dcc80ad057dfa809..610f61598f2a861cf3796bece433099f40e5c7ea 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -61,8 +61,10 @@ wrong, measured instead.
   classes it does not check (a name piece held in a binding, a computed call
   outside an assertion, reflection, an aliased `expect`, an imported helper's
   meaning…), which are unchecked, not proved safe. An unknown name fails closed
-  in an assertion, a poll, a destructuring key and wait options, and every cell
-  it leaves unchecked names its excluded class. Its test derives every spelling ×
+  in an assertion, a poll, a destructuring key and wait options. So does an
+  expected object's `__proto__` key in any spelling: JS makes it the prototype in
+  one spelling and an own key in another, and assigning it as a key dropped its
+  leaf silently. Every cell it leaves unchecked names its excluded class. Its test derives every spelling ×
   position cell's verdict from that policy alone; breaking a shared reader (member
   keys, destructuring keys, `+` folding, page-script escapes, option keys) fails
   its whole column. Why a contract: closing one more spelling per review kept
diff --git a/tests/journey-waits.test.ts b/tests/journey-waits.test.ts
index 9cadda91b75bb935c52ea5abbbebbd43d0cf647b..281cbad06fd40c97154b34626806b83f89a9b144 100644
--- a/tests/journey-waits.test.ts
+++ b/tests/journey-waits.test.ts
@@ -28,7 +28,9 @@ import { describe, expect, it } from 'vitest';
 // through `+`, `${}`, parentheses and `as` from literals alone. A timer name
 // and a hash URL are also recognised as the runtime text of any string
 // expression built that way, and a timer as a page script cooks its own
-// escapes again. A name that is not static text is UNKNOWN. Unknown FAILS
+// escapes again. A name that is not static text is UNKNOWN, and so is an
+// expected object's key whose text is `__proto__`, in every spelling (JS makes
+// it the prototype in one spelling and an own key in another). Unknown FAILS
 // CLOSED in an assertion or a poll (refused), as a destructuring key (a read)
 // and as a key in wait options (a negative). Anywhere else — a member called
 // or named outside an assertion, an assertion reached by an unknown name, a
@@ -457,7 +459,9 @@ function literal(node: ts.Expression | undefined): unknown {
     const o: Record<string, unknown> = {};
     for (const p of e.properties) {
       const key = ts.isPropertyAssignment(p) ? keyOf(p.name) : UNKNOWN;
-      if (key === UNKNOWN) return UNKNOWN;
+      // `__proto__` is the prototype in one spelling and an own key in another, and
+      // `o[key] =` would drop its leaf silently: it is never judged.
+      if (key === UNKNOWN || key === '__proto__') return UNKNOWN;
       o[key] = literal((p as ts.PropertyAssignment).initializer);
     }
     return o;
@@ -1089,6 +1093,11 @@ const OTHER_WAITS = ['waitForElementState', 'waitForURL', 'waitForFunction', 'wa
 const EVENTS = ['waitForEvent', 'waitForRequest', 'waitForResponse', 'waitForLoadState', 'waitForNavigation'];
 const [waitOn, before] = [(n: string) => (n === 'waitFor' ? 'toast' : 'page'), (n: string) => (n === 'waitFor' ? '' : "'x', ")];
 const DESTRUCTURING = [(k: string) => `const { ${k}: v } = box;`, (k: string) => `({ ${k}: v } = box);`, (k: string) => `async function f({ ${k}: v }) {}`, (k: string) => `try {} catch ({ ${k}: v }) {}`, (k: string) => `for (const { ${k}: v } of boxes);`, (k: string) => `for ({ ${k}: v } of boxes);`];
+const PROTO_MATCHERS = ['toEqual', 'toStrictEqual'];
+const PROTO_SUBJECTS = ['q()', 'box.isVisible()'];
+const PROTO_PLACES = [(o: string) => o, (o: string) => `{ b: 'y', c: ${o} }`, (o: string) => `['y', ${o}]`];
+/** Every leaf kind: full, each empty kind, and an unknown one. */
+const PROTO_LEAVES = ["'x'", "''", '0', 'false', 'null', 'undefined', '[]', '{}', 'k'];
 const POLICY: Position[] = [
   // A read: judged at its absent value in an assertion, refused outside one.
   { names: READ_NAMES, as: 'member', code: (s, n) => `expect(await box${s}()).toBe(${presentOf(n)});`, known: ['positive'], unknown: ['positive'] },
@@ -1147,6 +1156,21 @@ const POLICY: Position[] = [
   { names: ['poll'], as: 'member', code: (s) => `await expect${s}(() => q()).toBe(null);`, known: ['negative'], unknown: { unchecked: 'unknown-assertion' } },
   { names: ['a'], as: 'key', code: (s) => `await expect.poll(() => q()).toEqual({ ${s}: 'x' });`, known: [], unknown: ['negative'] },
   { names: ['a'], as: 'key', code: (s) => `await expect.poll(() => q()).toEqual({ ${s}: '' });`, known: ['negative'], unknown: ['negative'] },
+  // `__proto__` as an expected object's key is never judged: whatever its leaf, wherever the
+  // object sits, a poll of a value or of a read fails closed.
+  ...PROTO_MATCHERS.flatMap((matcher) =>
+    PROTO_SUBJECTS.flatMap((subject) =>
+      PROTO_PLACES.flatMap((place) =>
+        PROTO_LEAVES.map((leaf): Position => ({
+          names: ['__proto__'],
+          as: 'key',
+          code: (s) => `await expect.poll(() => ${subject}).${matcher}(${place(`{ a: 'x', ${s}: ${leaf} }`)});`,
+          known: ['negative'],
+          unknown: ['negative'],
+        })),
+      ),
+    ),
+  ),
   // A raw hash navigation: by its method's name and its URL's runtime text.
   { names: ['goto'], as: 'member', code: (s) => `await page${s}(\`\${origin}#/items\`);`, known: ['goto'], unknown: { unchecked: 'computed-call' } },
   { names: ['#/items'], as: 'text', code: (s) => `await page.goto(origin + ${s});`, known: ['goto'], unknown: { unchecked: 'binding-piece' } },
```

**Paths the rework touched:**

- `DECISIONS.md`
- `tests/journey-waits.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
6672c22 The wait guard fails closed on an expected object's __proto__ key

Fresh review finding [journey-wait-guard-complete-enforcement] (P2). literal()
built expected objects as {} with o[key] = …. The key '__proto__' hits the
prototype setter, which drops a primitive leaf silently. So
`await expect.poll(() => q()).toEqual({a: 'x', ['__proto__']: ''})` was judged
a presence wait instead of a negative, and an unknown leaf passed too.

The fix sits in the shared evaluator, where literal(), full/unjudgeable,
provesPresence and waitsForPresence all read it. A key whose static text is
`__proto__`, in any spelling, makes the literal UNKNOWN. JS makes it the
prototype in one spelling and an own key in another, so it is never judged,
and unknown fails closed in a poll. The analyser boundary is unchanged: no new
spelling class, position or EXCLUDED entry. The header contract and DECISIONS
say so.

Proof, in the named ac-7 test's matrix: the family is the key `__proto__` in
every KEY spelling (13 static, 1 unknown), under toEqual and toStrictEqual,
polling a value or a read. The object is top-level, nested or in an array, and
the leaf is full, each empty kind ('' 0 false null undefined [] {}) or unknown.
That is 1512 cells, all negative.

Fails before the fix: revert the one line in literal() (drop
`|| key === '__proto__'`) and run
  npx vitest run tests/journey-waits.test.ts
  -> 1404 cells fail, every static-spelling cell of the family, judged [] instead
     of ["negative"]; the 108 unknown-spelling cells already failed closed.
The repository journeys still scan clean.

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
