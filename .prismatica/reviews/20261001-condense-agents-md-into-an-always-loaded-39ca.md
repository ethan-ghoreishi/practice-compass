---
id: 20261001-condense-agents-md-into-an-always-loaded-39ca
contractId: 20261001-condense-agents-md-into-an-always-loaded-39ca
patchId: 8c4c473bc98837cdd99de5217c1f8459984b2034
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-01T23:38:27.202Z
sealedAt: 2026-10-01T23:47:03.590Z
---

# Review: Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261001-condense-agents-md-into-an-always-loaded-39ca
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/43
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Diff patch-id:** `8c4c473bc98837cdd99de5217c1f8459984b2034`
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

**Approved intent:** `.prismatica/intents/20261001-condense-agents-md-into-an-always-loaded-39ca.md`

**Findings from the previous review:**

- **repository-guidance-path-reachability** — The path-reachability family remains open: ac-3 passes missing targets through container continuations, Unicode whitespace truncation, context-blind backtick stripping and srcset URL splitting. Close all branches and extend the named proof fixtures.
  _counterexample:_ HEAD 174b4b9, tests/agent-context.test.ts:69-79,111-119. Read-only execution of the actual 'every repository path AGENTS.md names exists' callback passes after appending each example: > [missing]:\n> docs/reviewer-missing.md\n>\n> [missing]; > [missing](\n> docs/reviewer-missing.md); > ![missing](\n> public/reviewer-missing.png). It also passes inline links, reference definitions and images whose destination is an existing docs/cgs-course.md or public/icon.svg followed by U+00A0 and reviewer-missing, because only the existing prefix is checked. Paired backticks around reviewer-missing after the same prefixes are stripped inside inline links, definitions and images; quoted HTML srcset has the same bypass. <img srcset="public/icon.svg,reviewer-missing.png 1x"> and the U+00A0 variant also check only public/icon.svg. Sweep: one namedPaths implementation; CODE_SPAN/inCode, DESTINATION_START/destinationAt, HTML_TARGET/srcset and targetPath; ac-3 and its named fixture test; package.json npm test, ci.yml and deploy.yml. Clean: current named paths, genuine code spans/fences, ordinary/titled/angle links and images, same-line container definitions, plain next-line definitions, balanced/escaped parentheses, ordinary quoted/unquoted HTML, entities, anchors/queries, deduplication and specified glob exclusions. Original rejection examples now fail. All five existing exact test bodies pass, but the counterexamples above are absent from the fixtures.

**What changed since the previously reviewed head:**

````diff
diff --git a/tests/agent-context.test.ts b/tests/agent-context.test.ts
index d63c3458e5e9a57db61b5883bdd8c1cdf5977659..190ac8747f569797128364b1988262d3ccdffdc9 100644
--- a/tests/agent-context.test.ts
+++ b/tests/agent-context.test.ts
@@ -8,8 +8,8 @@
 // main. It measures the working tree and `@path` imports only — Prismatica
 // stays the authority on committed bytes and other import shapes.
 
-import { existsSync, readFileSync, statSync } from 'node:fs';
-import { dirname, join, relative, resolve } from 'node:path';
+import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
+import { dirname, join, posix, relative, resolve } from 'node:path';
 import { fileURLToPath } from 'node:url';
 import { expect, it } from 'vitest';
 
@@ -61,68 +61,162 @@ const APP_RULE_IDS = [
 
 const PATH_ROOTS = ['src/', 'tests/', 'scripts/', 'docs/', 'public/', '.github/'];
 
-// A code span (or fence) is a backtick run closed by a run of the same length.
-const CODE_SPAN = /(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g;
-// Where a link destination starts: an inline link or image `](`, or a reference definition
-// `]:` read anywhere, so one inside a block quote, a list or any indent is never missed
-// (reading one that is not a definition only checks one more path).
-const DESTINATION_START = /\]\(\s*|\]:\s*/g;
-// An HTML target, quoted or not, in any case; srcset lists several.
-const HTML_TARGET = /\b(href|src|srcset|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
+// Markdown and HTML both separate on ASCII whitespace only: JavaScript's `\s` also matches
+// U+00A0 and would end a destination early, leaving an existing prefix to be checked.
+const SPACE = /[ \t\n\f\r]/;
+const PUNCTUATION = /[!-/:-@[-`{-~]/;
 const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
+// No construct crosses a line ending except the whitespace before a destination or a title
+// (one at most): a span, title or tag that did could swallow a real link in a later block.
+const GAP = String.raw`[ \t]*\n?[ \t]*`;
+// What may follow an inline destination (an optional title, then the closing parenthesis),
+// and a reference definition's (an optional title, then the end of its line).
+const TITLE = String.raw`(?:"(?:\\[^\n]|[^"\\\n])*"|'(?:\\[^\n]|[^'\\\n])*'|\((?:\\[^\n]|[^()\\\n])*\))`;
+const INLINE_TAIL = new RegExp(String.raw`${GAP}(?:${TITLE}${GAP})?\)`, 'y');
+const DEFINITION_TAIL = new RegExp(String.raw`(?:${GAP}${TITLE})?[ \t]*(?:\n|$)`, 'y');
+// Raw HTML as CommonMark reads it, kept to one line; it binds tighter than code spans and links.
+const ATTRIBUTE = String.raw`[ \t]+([A-Za-z_:][\w.:-]*)(?:[ \t]*=[ \t]*(?:([^ \t\n"'=<>` + '`' + String.raw`]+)|'([^'\n]*)'|"([^"\n]*)"))?`;
+const OPEN_TAG = new RegExp(String.raw`<[A-Za-z][A-Za-z0-9-]*(?:${ATTRIBUTE})*[ \t]*\/?>`, 'y');
+const OTHER_HTML = /<\/[A-Za-z][A-Za-z0-9-]*[ \t]*>|<!--[^\n]*?-->|<[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<> \t\n]*>/y;
 
-/** The link destination at `i`: `<...>`, or a run without spaces whose parentheses balance. */
-function destinationAt(text: string, i: number): string {
-  if (text[i] === '<') return /^<([^>\n]*)>/.exec(text.slice(i))?.[1] ?? '';
-  let depth = 0;
-  let end = i;
-  for (; end < text.length && !/\s/.test(text[end]); end++) {
-    if (text[end] === '\\') end++; // an escaped character never opens or closes
-    else if (text[end] === '(') depth++;
-    else if (text[end] === ')' && --depth < 0) break;
-  }
-  return text.slice(i, end);
-}
-
-/** A link target as the path it names: escapes and entities decoded, anchor and query dropped. */
-function targetPath(target: string): string {
-  const unescaped = target.replace(/\\([!-/:-@[-`{-~])|&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, escaped, entity: string) => {
-    if (escaped) return escaped;
+/** Character references (and, in Markdown, backslash escapes) decoded; an unknown one throws. */
+function decode(text: string, markdown: boolean): string {
+  return text.replace(/\\([!-/:-@[-`{-~])|&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, escaped, entity: string) => {
+    if (escaped) return markdown ? escaped : all;
     if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
     if (entity in ENTITIES) return ENTITIES[entity];
-    throw new Error(`undecoded entity ${all} in ${target}`);
+    throw new Error(`undecoded entity ${all} in ${text}`);
   });
-  const path = unescaped.replace(/[#?].*$/, '');
+}
+
+/** A link target as the repository path it names: anchor and query dropped, percent-decoded. */
+function targetPath(target: string): string {
+  const path = target.replace(/[#?][^]*$/, '');
   try {
-    return decodeURI(path);
+    return decodeURIComponent(path);
   } catch {
     return path;
   }
 }
 
+/** The whole destination at `i` and where it ends: `<...>`, or a run whose parentheses balance. */
+function destinationAt(text: string, i: number): [string, number] {
+  let j = i;
+  if (text[i] === '<') {
+    for (j++; text[j] !== '>'; j++) {
+      if (j >= text.length || text[j] === '\n' || text[j] === '<') throw new Error(`unreadable link near: ${text.slice(i, i + 60)}`);
+      if (text[j] === '\\') j++;
+    }
+    return [text.slice(i + 1, j), j + 1];
+  }
+  for (let depth = 0; j < text.length && text[j] > ' ' && text[j] !== '\x7f'; j++) {
+    if (text[j] === '\\' && PUNCTUATION.test(text[j + 1] ?? '')) j++; // never opens or closes
+    else if (text[j] === '(') depth++;
+    else if (text[j] === ')' && --depth < 0) break;
+  }
+  return [text.slice(i, j), j];
+}
+
+/** The URLs of a srcset, by the HTML candidate grammar: a comma inside a URL is part of it. */
+function srcsetUrls(value: string): string[] {
+  const urls: string[] = [];
+  for (let i = 0; ; ) {
+    while (i < value.length && (SPACE.test(value[i]) || value[i] === ',')) i++;
+    if (i >= value.length) return urls;
+    let j = i;
+    while (j < value.length && !SPACE.test(value[j])) j++;
+    const url = value.slice(i, j);
+    urls.push(url.replace(/,+$/, ''));
+    i = j;
+    if (url.endsWith(',')) continue;
+    for (let depth = 0; i < value.length && (value[i] !== ',' || depth > 0); i++) {
+      if (value[i] === '(') depth++;
+      else if (value[i] === ')' && depth > 0) depth--;
+    }
+  }
+}
+
 /**
- * Repository paths AGENTS.md names: every whitespace-separated token of a code span or
- * fence, and every link target (an inline link or image, a reference definition, an HTML
- * href/src/srcset/poster). Anchors, queries and, in code, line suffixes and trailing
- * punctuation are stripped BEFORE globs are skipped. A backtick left unpaired throws: it
- * would shift every span after it, so the text cannot be read reliably.
+ * Repository paths AGENTS.md names: every whitespace-separated token of a code span or fence,
+ * and every link target (an inline link or image, a reference definition, an HTML attribute
+ * value, each srcset URL). One left-to-right pass with CommonMark's precedence: block-quote
+ * markers are removed first so a destination can continue on the next line, then each
+ * construct is consumed WHOLE before anything after it is read, and the destination it
+ * yields is checked exactly as written. Text it cannot read whole (an unpaired or escaped
+ * backtick, an unclosed fence, a link or tag that does not parse, a span, title or tag
+ * crossing a line ending) throws rather than being
+ * skipped. Anchors, queries and, in code, line suffixes are stripped BEFORE globs are
+ * skipped; only code is ever read as a glob. Nothing else is trimmed from a token.
  */
-function namedPaths(text: string): string[] {
-  const spans = [...text.matchAll(CODE_SPAN)];
-  const prose = text.replace(CODE_SPAN, ' ');
-  if (prose.includes('`')) throw new Error(`unpaired backtick near: ${prose.slice(prose.indexOf('`'), prose.indexOf('`') + 60)}`);
-  const inCode = spans
-    .flatMap(([, , span]) => span.split(/\s+/))
-    .map((t) => t.replace(/^[<('"]+|[>'"]+$/g, '').replace(/[#?].*$/, '').replace(/[),.;:]+$/, '').replace(/(:L?\d+(-L?\d+)?)+$/, ''));
-  const html = [...prose.matchAll(HTML_TARGET)].flatMap(([, name, ...values]) => {
-    const value = values.find((v) => v !== undefined) ?? '';
-    return name.toLowerCase() === 'srcset' ? value.split(',').map((c) => c.trim().split(/\s+/)[0]) : [value];
-  });
-  const linked = [...[...prose.matchAll(DESTINATION_START)].map((m) => destinationAt(prose, m.index + m[0].length)), ...html].map(targetPath);
-  const paths = [...inCode, ...linked]
-    .map((t) => t.replace(/^\.?\//, ''))
-    .filter((t) => PATH_ROOTS.some((root) => t.startsWith(root)) && !/[*{[]/.test(t));
-  return [...new Set(paths)];
+function namedPaths(markdown: string): string[] {
+  const lines = markdown.replace(/\r\n?/g, '\n').replace(/^(?:[ \t]*>)+/gm, '').split('\n');
+  const code: string[] = [];
+  const targets: string[] = [];
+  let fence: RegExp | undefined;
+  for (let i = 0; i < lines.length; i++) {
+    const open = /^[ \t]*(`{3,}(?=[^`]*$)|~{3,})/.exec(lines[i]);
+    if (fence?.test(lines[i])) fence = undefined;
+    else if (fence) code.push(lines[i]);
+    else if (open) fence = new RegExp(`^[ \\t]*\\${open[1][0]}{${open[1].length},}[ \\t]*$`);
+    else continue;
+    lines[i] = '';
+  }
+  if (fence) throw new Error('unclosed code fence');
+  const text = lines.join('\n');
+  const at = (pattern: RegExp, i: number) => ((pattern.lastIndex = i), pattern.exec(text));
+  let brackets = 0;
+  for (let i = 0; i < text.length; i++) {
+    const c = text[i];
+    if (c === '\\' && text[i + 1] === '`') throw new Error(`escaped backtick near: ${text.slice(i, i + 60)}`);
+    if (c === '\\' && PUNCTUATION.test(text[i + 1] ?? '')) i++;
+    else if (c === '`') {
+      const ticks = at(/`+/y, i)![0];
+      const close = at(new RegExp(`(?<!\`)${ticks}(?!\`)`, 'g'), i + ticks.length);
+      if (!close) throw new Error(`unpaired backtick near: ${text.slice(i, i + 60)}`);
+      if (text.slice(i, close.index).includes('\n')) throw new Error(`code span crosses a line near: ${text.slice(i, i + 60)}`);
+      code.push(text.slice(i + ticks.length, close.index));
+      i = close.index + ticks.length - 1;
+    } else if (c === '<' && at(OPEN_TAG, i)) {
+      const tag = OPEN_TAG.lastIndex;
+      for (const [, name, ...values] of text.slice(i, tag).matchAll(new RegExp(ATTRIBUTE, 'g'))) {
+        const value = values.find((v) => v !== undefined);
+        if (value !== undefined) targets.push(...(name.toLowerCase().endsWith('srcset') ? srcsetUrls(decode(value, false)) : [decode(value, false)]));
+      }
+      i = tag - 1;
+    } else if (c === '<' && at(OTHER_HTML, i)) i = OTHER_HTML.lastIndex - 1;
+    else if (c === '<' && /[A-Za-z!/?]/.test(text[i + 1] ?? '')) throw new Error(`unreadable HTML near: ${text.slice(i, i + 60)}`);
+    else if (c === '[') brackets++;
+    else if (c === ']' && brackets > 0) {
+      brackets--;
+      const tail = text[i + 1] === '(' ? INLINE_TAIL : text[i + 1] === ':' ? DEFINITION_TAIL : undefined;
+      if (!tail) continue;
+      const [destination, end] = destinationAt(text, i + 2 + at(new RegExp(GAP, 'y'), i + 2)![0].length);
+      if (!at(tail, end)) throw new Error(`unreadable link near: ${text.slice(i, i + 60)}`);
+      targets.push(decode(destination, true));
+      i = tail.lastIndex - 1;
+    }
+  }
+  const inCode = code
+    .flatMap((span) => span.split(/[ \t\n\f\r]+/))
+    .map((t) => t.replace(/[#?].*$/, '').replace(/(:L?\d+(-L?\d+)?)+$/, ''))
+    .filter((t) => !/[*{[]/.test(t));
+  const paths = [...inCode, ...targets.map(targetPath)].map((t) => posix.normalize(t).replace(/^\/+/, ''));
+  return [...new Set(paths.filter((t) => PATH_ROOTS.some((root) => t.startsWith(root))))];
+}
+
+/** Whether `path` exists under ROOT spelt exactly, case included (APFS would ignore case). */
+function existsExactly(path: string): boolean {
+  let dir = ROOT;
+  for (const segment of path.split('/').filter(Boolean)) {
+    if (!statSync(dir).isDirectory() || !readdirSync(dir).includes(segment)) return false;
+    dir = join(dir, segment);
+  }
+  return true;
+}
+
+/** The repository paths `text` names that do not exist. */
+function missingPaths(text: string): string[] {
+  return namedPaths(text).filter((p) => !existsExactly(p));
 }
 
 it('the instructions every agent session loads at the repository root fit in 32768 bytes', () => {
@@ -139,9 +233,9 @@ it('AGENTS.md states the core loop, every hard do-not and each owner-approved ap
 });
 
 it('every repository path AGENTS.md names exists', () => {
-  const paths = namedPaths(readFileSync(AGENTS, 'utf8'));
-  expect(paths.length).toBeGreaterThan(0);
-  expect(paths.filter((p) => !existsSync(join(ROOT, p)))).toEqual([]);
+  const text = readFileSync(AGENTS, 'utf8');
+  expect(namedPaths(text).length).toBeGreaterThan(0);
+  expect(missingPaths(text)).toEqual([]);
 });
 
 // The proof route for namedPaths: one Markdown form per row, each expectation written
@@ -192,17 +286,88 @@ it('namedPaths reads a repository path out of every Markdown form that can name
     // Entities and backslash escapes decode before the path is read.
     ['[t](docs&#47;a.md) <a href="docs&#x2F;b.md">', ['docs/a.md', 'docs/b.md']],
     ['[t](docs/a&amp;b.md) [u](docs/\\_c.md)', ['docs/a&b.md', 'docs/_c.md']],
-    // The 2026-10-01 review's counterexamples, each naming a file that is not the existing prefix.
+    // Code fences of either kind, inside a block quote too; a destination keeps its backticks.
+    ['~~~\nscripts/run.mjs\n~~~', ['scripts/run.mjs']],
+    ['> ```\n> docs/a.md\n> ```', ['docs/a.md']],
+    ['[t](docs/`a`.md) `src/x.ts`', ['src/x.ts', 'docs/`a`.md']],
+    // HTML binds tighter than code; autolinks and comments name no repository path.
+    ['<a title="`docs/a.md`" href="docs/b.md">', ['docs/b.md']],
+    ['<https://example.com/docs/a.md> <!-- [t](docs/a.md) -->', []],
+    // A link target is a URL, never a glob, and its percent-encoding decodes whole.
+    ['[t](docs/a[1].md) [u](docs%2Fb.md)', ['docs/a[1].md', 'docs/b.md']],
+    ['<img srcset="public/a.png, public/b.png,, public/c(1).png 2x">', ['public/a.png', 'public/b.png', 'public/c(1).png']],
+  ];
+  for (const [markdown, expected] of cases) {
+    if (expected === 'refused') expect(() => namedPaths(markdown), markdown).toThrow();
+    else expect(namedPaths(markdown), markdown).toEqual(expected);
+  }
+  expect(() => namedPaths('`docs/a.md` and a stray ` tick')).toThrow(/unpaired backtick/);
+  expect(() => namedPaths('[t](docs&sol;a.md)')).toThrow(/undecoded entity/);
+  expect(() => namedPaths('\\`docs/a.md\\`')).toThrow(/escaped backtick/);
+  expect(() => namedPaths('```\ndocs/a.md')).toThrow(/unclosed code fence/);
+  expect(() => namedPaths('[t](docs/a.md extra)')).toThrow(/unreadable link/);
+  expect(() => namedPaths('[t](<docs/a.md)')).toThrow(/unreadable link/);
+  expect(() => namedPaths('<img src="public/i.png"')).toThrow(/unreadable HTML/);
+});
+
+// Every counterexample a review of this lane has raised against ac-3, each appended to the
+// real AGENTS.md and run through the same check ac-3 runs: the check must fail (a missing
+// path or a refusal). `expected` is the whole destination each one names, so a reader can see
+// the extraction did not stop at an existing prefix.
+it('every reviewer counterexample appended to AGENTS.md fails the path check', () => {
+  const NBSP = '\u00A0';
+  const cases: [string, string[] | 'refused'][] = [
+    // Round 1: titled and angle-bracket links, and an anchor read as a glob.
+    ['[missing](docs/reviewer-missing.md "Guide")', ['docs/reviewer-missing.md']],
+    ['[missing](<docs/reviewer-missing.md>)', ['docs/reviewer-missing.md']],
+    ['`docs/reviewer-missing.md#part[0]`', ['docs/reviewer-missing.md']],
+    // Round 2: parentheses inside a destination, container definitions, unquoted HTML.
     ['[missing](docs/(reviewer-missing).md)', ['docs/(reviewer-missing).md']],
     ['[missing]: docs/(reviewer-missing).md', ['docs/(reviewer-missing).md']],
     ['![missing](public/(reviewer-missing).png)', ['public/(reviewer-missing).png']],
     ['[missing](docs/cgs-course.md(reviewer-missing))', ['docs/cgs-course.md(reviewer-missing)']],
     ['> [missing]: docs/reviewer-missing.md', ['docs/reviewer-missing.md']],
-    ['<a href=docs/reviewer-missing.md> <img src=public/reviewer-missing.png>', ['docs/reviewer-missing.md', 'public/reviewer-missing.png']],
+    ['- [missing]: docs/reviewer-missing.md', ['docs/reviewer-missing.md']],
+    ['<a href=docs/reviewer-missing.md>', ['docs/reviewer-missing.md']],
+    ['<img src=public/reviewer-missing.png>', ['public/reviewer-missing.png']],
+    // Round 3: block-quote continuations, U+00A0 inside a destination, backticks inside a
+    // destination or attribute, and a comma inside a srcset URL.
+    ['> [missing]:\n> docs/reviewer-missing.md\n>\n> [missing]', ['docs/reviewer-missing.md']],
+    ['> [missing](\n> docs/reviewer-missing.md)', ['docs/reviewer-missing.md']],
+    ['> ![missing](\n> public/reviewer-missing.png)', ['public/reviewer-missing.png']],
+    [`[missing](docs/cgs-course.md${NBSP}reviewer-missing)`, [`docs/cgs-course.md${NBSP}reviewer-missing`]],
+    [`[missing]: docs/cgs-course.md${NBSP}reviewer-missing`, [`docs/cgs-course.md${NBSP}reviewer-missing`]],
+    [`![missing](public/icon.svg${NBSP}reviewer-missing)`, [`public/icon.svg${NBSP}reviewer-missing`]],
+    [`\`docs/cgs-course.md${NBSP}reviewer-missing\``, [`docs/cgs-course.md${NBSP}reviewer-missing`]],
+    ['[missing](docs/cgs-course.md`reviewer-missing`)', ['docs/cgs-course.md`reviewer-missing`']],
+    ['[missing]: docs/cgs-course.md`reviewer-missing`', ['docs/cgs-course.md`reviewer-missing`']],
+    ['![missing](public/icon.svg`reviewer-missing`)', ['public/icon.svg`reviewer-missing`']],
+    ['<img srcset="public/icon.svg`reviewer-missing` 1x">', ['public/icon.svg`reviewer-missing`']],
+    ['<a href="docs/cgs-course.md`reviewer-missing`">', ['docs/cgs-course.md`reviewer-missing`']],
+    ['<img srcset="public/icon.svg,reviewer-missing.png 1x">', ['public/icon.svg,reviewer-missing.png']],
+    [`<img srcset="public/icon.svg${NBSP}reviewer-missing.png 1x">`, [`public/icon.svg${NBSP}reviewer-missing.png`]],
+    // Round 4 (pre-review): a span, title, comment or attribute that runs on into a later
+    // block and swallows a real link there; and a name that matches only if case is ignored.
+    ['a stray ` tick\n\n[missing](docs/reviewer-missing.md)\n\nand ` another', 'refused'],
+    ['[t](docs/cgs-course.md "x\n\n[u](docs/reviewer-missing.md)\n\n")', 'refused'],
+    ['text <!-- x\n\n[u](docs/reviewer-missing.md)\n\n-->', 'refused'],
+    ['<a title="x\n\n[u](docs/reviewer-missing.md)\n\n" href="docs/cgs-course.md">', 'refused'],
+    ['[empty]:\n\n[missing](docs/reviewer-missing.md)', ['docs/reviewer-missing.md']],
+    ['[t](docs/CGS-Course.md)', ['docs/CGS-Course.md']],
   ];
-  for (const [markdown, expected] of cases) expect(namedPaths(markdown), markdown).toEqual(expected);
-  expect(() => namedPaths('`docs/a.md` and a stray ` tick')).toThrow(/unpaired backtick/);
-  expect(() => namedPaths('[t](docs&sol;a.md)')).toThrow(/undecoded entity/);
+  const agents = readFileSync(AGENTS, 'utf8');
+  const stillPassing = (markdown: string) => {
+    try {
+      return missingPaths(`${agents}\n\n${markdown}\n`).length === 0;
+    } catch {
+      return false;
+    }
+  };
+  for (const [markdown, expected] of cases) {
+    if (expected === 'refused') expect(() => namedPaths(markdown), markdown).toThrow();
+    else expect(namedPaths(markdown), markdown).toEqual(expected);
+  }
+  expect(cases.map(([markdown]) => markdown).filter(stillPassing)).toEqual([]);
 });
 
 // Every agent-facing prohibition the 2026-10-01 reworks restored from the baseline
````

**Paths the rework touched:**

- `tests/agent-context.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

````
e6c0e83 Rework: read every link, code and HTML target whole before checking it

Family: repository-guidance-path-reachability (fourth round). Every earlier
fix added a branch to the extractor, and each review found another way the
extractor stopped early and checked only an existing prefix. This changes
the method instead of adding a fifth branch.

Invariant: every construct ac-3 reads is consumed whole, and the exact
destination it names is validated, or the text is refused (a throw fails
ac-3). Nothing is trimmed off a destination to make it match.

Design (tests/agent-context.test.ts, namedPaths):
- One left-to-right scanner with CommonMark precedence replaces the old
  "strip code spans first, then regex the rest" order. Raw HTML and
  autolinks bind tighter than code spans, and code spans tighter than link
  brackets. A link destination is read raw, so backticks inside it belong to
  it.
- Block-quote markers are stripped per line before scanning, so a destination
  can continue onto the next "> " line.
- Destinations, srcset candidates and code tokens split on ASCII whitespace
  only (the CommonMark/HTML class), never JavaScript's \s, which matches
  U+00A0.
- Every destination must be followed by a valid tail (title, then ")" for
  an inline link; title, then end of line for a definition). A tail that does
  not parse is refused, which closes truncation generally.
- srcset follows the WHATWG candidate grammar, so a comma inside a URL stays
  part of that URL.
- Every HTML attribute value is a candidate.
- Fences (``` and ~~~) are line-level, and an unclosed one is refused. An
  escaped backtick or an unparseable tag is refused too.
- Code tokens lose only anchors, queries and line suffixes. The leading and
  trailing punctuation trimming was another prefix truncation, and nothing
  needed it. Link targets are never read as globs.

Consumers enumerated: namedPaths is the only implementation, and its code
spans, fences, inline links/images, definitions, HTML at
… (truncated)

bfc4d2d Rework: no read construct crosses a line it cannot; exact-case existence

Same family, repository-guidance-path-reachability, from the other side.
The previous commit stopped constructs ending too early. This one stops them
running on too far. A code span, link title, HTML tag or comment that crosses
a line ending could pair with something in a later block and swallow a real
link there, so ac-3 never read it.

Invariant, extended: every construct is read whole and no further. Only the
whitespace before a destination or a title may cross a line ending, and at
most one. Anything else that would cross one is refused. Existence is checked
segment by segment against the directory listing, so a name that matches only
case-insensitively (APFS) counts as missing, as it would on Linux CI.

Consumers: the namedPaths code span, TITLE (both tails), ATTRIBUTE/OPEN_TAG,
OTHER_HTML and the destination gap. missingPaths serves both ac-3 and the
reviewer table. The reviewer table gains the cross-block cases (span,
title, comment, attribute, blank-line definition) and a case-only mismatch.
Each new rule has a mutation (allow the crossing, or use existsSync) that
makes the named table test fail.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
````

## Check against the contract

- [ ] **ac-1** — Meaningful reduction that holds: the Claude profile (CLAUDE.md plus every file it @-imports) and the Codex profile (AGENTS.md alone) each total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the baseline tree and runs in npm test on every push, main included via deploy.yml. Limit: it measures the working tree and @path tokens only; Prismatica's instruction-budget check stays the authority on other import shapes and committed bytes. _(proof: the instructions every agent session loads at the repository root fit in 32768 bytes)_
- [ ] **ac-2** — Required guidance stays in the always-loaded file: AGENTS.md contains the core-loop line (one item · one mode · one focus · one result · one next action), the four hard do-nots (No gamification, No backend, No AI or audio analysis, No guilt) and the 11 owner-approved rule ids, hardcoded in the test rather than read from .prismatica/rules.md so a later rules approval on main cannot break deploy. Deleting any anchor fails it. _(proof: AGENTS.md states the core loop, every hard do-not and each owner-approved app rule)_
- [ ] **ac-3** — Moved guidance stays reachable: every path AGENTS.md names in backticks or a link target under src/, tests/, scripts/, docs/, public/ or .github/ exists (anchor and line suffixes stripped, globs skipped); a pointer to a missing file fails it. _(proof: every repository path AGENTS.md names exists)_
- [ ] **ac-4** — In a new Claude Code session started in the lane worktree there is no "...-char limit" notice, /doctor shows no large instruction-file warning, /context shows the memory-files figure far below main's (note both), and `prismatica doctor` lists both profiles at or under 32,768 bytes with no warning. The owner then picks any two baseline sections and finds each rule in the home the DECISIONS.md disposition table names, or listed there as dropped with a reason. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

_none_

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

_No flows affected — reported by agent at 2026-10-01T22:20:05.480Z._


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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261001-condense-agents-md-into-an-always-loaded-39ca' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
