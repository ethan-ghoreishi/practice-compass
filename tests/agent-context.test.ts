// The instructions every agent session loads at the repository root stay
// small enough to be read whole, and keep the guidance that has to be in them.
//
// 32 KiB is what Codex reads of AGENTS.md by default, and the budget
// Prismatica's instruction-budget check applies per provider profile. That
// check is a ratchet against each lane's baseline and never runs on a direct
// push; this test runs in `npm test`, which deploy.yml runs on every push to
// main. It measures the working tree and `@path` imports only — Prismatica
// stays the authority on committed bytes and other import shapes.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS = join(ROOT, 'AGENTS.md');
const BUDGET = 32_768;

/** Markdown without code fences or code spans, so `@eaDir` in an example is not an import. */
function withoutCode(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

/** CLAUDE.md plus every file it @-imports, transitively, each counted once. */
function claudeProfile(entry: string): string[] {
  const files: string[] = [];
  const visit = (file: string) => {
    if (files.includes(file)) return;
    files.push(file);
    for (const [, target] of withoutCode(readFileSync(file, 'utf8')).matchAll(/(?:^|\s)@(\S+)/g)) {
      if (target.startsWith('~')) continue; // user-level context, not this repository's
      const path = resolve(dirname(file), target);
      if (existsSync(path) && statSync(path).isFile()) visit(path);
    }
  };
  visit(entry);
  return files;
}

const bytes = (files: string[]) => files.reduce((n, f) => n + readFileSync(f).length, 0);

const CORE_LOOP = 'one item · one mode · one focus · one result · one next action';
const HARD_DO_NOTS = ['No gamification', 'No backend', 'No AI or audio analysis', 'No guilt'];
// The owner-approved app rules as of 2026-10-01, written out rather than read
// from .prismatica/rules.md, so a later rules approval on main cannot break a
// deploy. A new rule is added here in the lane that elaborates it.
const APP_RULE_IDS = [
  'r-direction-aware-text',
  'r-explainable-scheduling',
  'r-large-files-stay-on-nas',
  'r-local-first-offline',
  'r-no-gamification',
  'r-no-silent-data-loss',
  'r-one-instrument-per-session',
  'r-practice-completes-reviews',
  'r-pure-tested-domain',
  'r-quick-start',
  'r-secrets-stay-on-device',
];

const PATH_ROOTS = ['src/', 'tests/', 'scripts/', 'docs/', 'public/', '.github/'];

// A code span (or fence) is a backtick run closed by a run of the same length.
const CODE_SPAN = /(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g;
// Where a link destination starts: an inline link or image `](`, or a reference definition
// `]:` read anywhere, so one inside a block quote, a list or any indent is never missed
// (reading one that is not a definition only checks one more path).
const DESTINATION_START = /\]\(\s*|\]:\s*/g;
// An HTML target, quoted or not, in any case; srcset lists several.
const HTML_TARGET = /\b(href|src|srcset|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** The link destination at `i`: `<...>`, or a run without spaces whose parentheses balance. */
function destinationAt(text: string, i: number): string {
  if (text[i] === '<') return /^<([^>\n]*)>/.exec(text.slice(i))?.[1] ?? '';
  let depth = 0;
  let end = i;
  for (; end < text.length && !/\s/.test(text[end]); end++) {
    if (text[end] === '\\') end++; // an escaped character never opens or closes
    else if (text[end] === '(') depth++;
    else if (text[end] === ')' && --depth < 0) break;
  }
  return text.slice(i, end);
}

/** A link target as the path it names: escapes and entities decoded, anchor and query dropped. */
function targetPath(target: string): string {
  const unescaped = target.replace(/\\([!-/:-@[-`{-~])|&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, escaped, entity: string) => {
    if (escaped) return escaped;
    if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
    if (entity in ENTITIES) return ENTITIES[entity];
    throw new Error(`undecoded entity ${all} in ${target}`);
  });
  const path = unescaped.replace(/[#?].*$/, '');
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/**
 * Repository paths AGENTS.md names: every whitespace-separated token of a code span or
 * fence, and every link target (an inline link or image, a reference definition, an HTML
 * href/src/srcset/poster). Anchors, queries and, in code, line suffixes and trailing
 * punctuation are stripped BEFORE globs are skipped. A backtick left unpaired throws: it
 * would shift every span after it, so the text cannot be read reliably.
 */
function namedPaths(text: string): string[] {
  const spans = [...text.matchAll(CODE_SPAN)];
  const prose = text.replace(CODE_SPAN, ' ');
  if (prose.includes('`')) throw new Error(`unpaired backtick near: ${prose.slice(prose.indexOf('`'), prose.indexOf('`') + 60)}`);
  const inCode = spans
    .flatMap(([, , span]) => span.split(/\s+/))
    .map((t) => t.replace(/^[<('"]+|[>'"]+$/g, '').replace(/[#?].*$/, '').replace(/[),.;:]+$/, '').replace(/(:L?\d+(-L?\d+)?)+$/, ''));
  const html = [...prose.matchAll(HTML_TARGET)].flatMap(([, name, ...values]) => {
    const value = values.find((v) => v !== undefined) ?? '';
    return name.toLowerCase() === 'srcset' ? value.split(',').map((c) => c.trim().split(/\s+/)[0]) : [value];
  });
  const linked = [...[...prose.matchAll(DESTINATION_START)].map((m) => destinationAt(prose, m.index + m[0].length)), ...html].map(targetPath);
  const paths = [...inCode, ...linked]
    .map((t) => t.replace(/^\.?\//, ''))
    .filter((t) => PATH_ROOTS.some((root) => t.startsWith(root)) && !/[*{[]/.test(t));
  return [...new Set(paths)];
}

it('the instructions every agent session loads at the repository root fit in 32768 bytes', () => {
  const claude = claudeProfile(join(ROOT, 'CLAUDE.md'));
  const names = claude.map((f) => relative(ROOT, f));
  expect(names, 'CLAUDE.md keeps importing AGENTS.md').toContain('AGENTS.md');
  expect(bytes(claude), `Claude profile: ${names.join(' + ')}`).toBeLessThanOrEqual(BUDGET);
  expect(bytes([AGENTS]), 'Codex profile: AGENTS.md').toBeLessThanOrEqual(BUDGET);
});

it('AGENTS.md states the core loop, every hard do-not and each owner-approved app rule', () => {
  const text = readFileSync(AGENTS, 'utf8');
  expect([CORE_LOOP, ...HARD_DO_NOTS, ...APP_RULE_IDS].filter((anchor) => !text.includes(anchor))).toEqual([]);
});

it('every repository path AGENTS.md names exists', () => {
  const paths = namedPaths(readFileSync(AGENTS, 'utf8'));
  expect(paths.length).toBeGreaterThan(0);
  expect(paths.filter((p) => !existsSync(join(ROOT, p)))).toEqual([]);
});

// The proof route for namedPaths: one Markdown form per row, each expectation written
// by hand from what CommonMark says the text names, not from running namedPaths.
// Bare prose paths are out of scope by the contract (backticks or link targets only).
it('namedPaths reads a repository path out of every Markdown form that can name one', () => {
  const cases: [string, string[]][] = [
    ['`docs/a.md`', ['docs/a.md']],
    ['see `src/x.ts and tests/y.ts` here', ['src/x.ts', 'tests/y.ts']],
    ['``docs/a.md``', ['docs/a.md']],
    ['```\nscripts/run.mjs --dry\n```', ['scripts/run.mjs']],
    ['`src/x.ts:12`, `src/y.ts:L10-L20`.', ['src/x.ts', 'src/y.ts']],
    ['(`.github/workflows/deploy.yml`).', ['.github/workflows/deploy.yml']],
    ['`docs/a.md#part[0]`', ['docs/a.md']],
    ['[t](docs/a.md)', ['docs/a.md']],
    ['[t](docs/a.md "Guide")', ['docs/a.md']],
    ["[t](docs/a.md 'Guide')", ['docs/a.md']],
    ['[t](docs/a.md (Guide))', ['docs/a.md']],
    ['[t](<docs/a b.md>)', ['docs/a b.md']],
    ['[t](<docs/a.md> "Guide")', ['docs/a.md']],
    ['[t]( ./docs/a.md#part )', ['docs/a.md']],
    ['[t](docs/a%20b.md?plain=1)', ['docs/a b.md']],
    ['![alt](public/icon.png)', ['public/icon.png']],
    ['[ref]: docs/a.md "Guide"', ['docs/a.md']],
    ['text\n   [ref]: <docs/a.md>', ['docs/a.md']],
    ['<a href="docs/a.md">a</a> <img src="public/i.png">', ['docs/a.md', 'public/i.png']],
    ['`docs/a.md` and [t](docs/a.md)', ['docs/a.md']],
    ['`src/**/*.ts` `src/{a,b}.ts` `src/[id].ts`', []],
    ['`README.md` [x](https://example.com/src/a.ts) `importFullBackup(text, intent)`', []],
    ['`[x](docs/a.md)`', []],
    // Balanced and escaped parentheses belong to the destination; the link's own close does not.
    ['[t](docs/(a).md)', ['docs/(a).md']],
    ['[t](docs/a(b(c)).md "Guide")', ['docs/a(b(c)).md']],
    ['[t](docs/a\\(b.md)', ['docs/a(b.md']],
    ['(see [t](docs/a.md))', ['docs/a.md']],
    ['![alt](public/(i).png)', ['public/(i).png']],
    ['[ref]: docs/(a).md', ['docs/(a).md']],
    // A reference definition inside any container, or with its destination on the next line.
    ['> [ref]: docs/a.md', ['docs/a.md']],
    ['- [ref]: docs/a.md', ['docs/a.md']],
    ['1. > - [ref]: <docs/a.md>', ['docs/a.md']],
    ['- item\n\n      [ref]: docs/a.md', ['docs/a.md']],
    ['[ref]:\n  docs/a.md', ['docs/a.md']],
    // HTML targets unquoted, in any case, and every srcset candidate.
    ['<a href=docs/a.md>a</a> <img src=public/i.png>', ['docs/a.md', 'public/i.png']],
    ["<IMG SRC = 'public/i.png'>", ['public/i.png']],
    ['<img srcset="public/a.png 1x, public/b.png 2x"> <video poster=public/p.png>', ['public/a.png', 'public/b.png', 'public/p.png']],
    // Entities and backslash escapes decode before the path is read.
    ['[t](docs&#47;a.md) <a href="docs&#x2F;b.md">', ['docs/a.md', 'docs/b.md']],
    ['[t](docs/a&amp;b.md) [u](docs/\\_c.md)', ['docs/a&b.md', 'docs/_c.md']],
    // The 2026-10-01 review's counterexamples, each naming a file that is not the existing prefix.
    ['[missing](docs/(reviewer-missing).md)', ['docs/(reviewer-missing).md']],
    ['[missing]: docs/(reviewer-missing).md', ['docs/(reviewer-missing).md']],
    ['![missing](public/(reviewer-missing).png)', ['public/(reviewer-missing).png']],
    ['[missing](docs/cgs-course.md(reviewer-missing))', ['docs/cgs-course.md(reviewer-missing)']],
    ['> [missing]: docs/reviewer-missing.md', ['docs/reviewer-missing.md']],
    ['<a href=docs/reviewer-missing.md> <img src=public/reviewer-missing.png>', ['docs/reviewer-missing.md', 'public/reviewer-missing.png']],
  ];
  for (const [markdown, expected] of cases) expect(namedPaths(markdown), markdown).toEqual(expected);
  expect(() => namedPaths('`docs/a.md` and a stray ` tick')).toThrow(/unpaired backtick/);
  expect(() => namedPaths('[t](docs&sol;a.md)')).toThrow(/undecoded entity/);
});

// Every agent-facing prohibition the 2026-10-01 reworks restored from the baseline
// (56789a8) sweeps, one short exact phrase each. Condensing may reword around them; deleting
// one fails here. A rule that genuinely changes edits its phrase here in the same lane.
const RESTORED_PROHIBITIONS = [
  // Practice information, closing a block, unfinished practice, totals, hands-free
  'read through a ref, never a closure',
  'only a typed date is an override (`closeOverrideDate`)',
  'never installing before `replaceAllBlobs`',
  '`decidedFromRev` is passed in (sync captures it with its db), never read from module scope',
  'seeded with current presence',
  '`active`, `activeRoutine` and `activePlan` are ephemeral, never in `PracticeDB`',
  'no goal, filling bar or judging colour',
  'to the boundaries passed, never by one',
  'routine boundaries are `segmentBoundaries`, never a second sum',
  'a routine boundary shows for a window, never one render',
  // Pathways, routines and repertoire
  'never a second `addMaterial`',
  'hidden suggestions count for nothing; an empty stage is never complete',
  "never overruling another item's legacy answer (`legacyClaimRefusal`)",
  'an unresolved placement is cleared, never read as General',
  'never completes a review or advances SM-2',
  'legacy text is never rewritten, nothing reseeds',
  'nothing closes before acknowledgement',
  'never a person, pathway or lesson',
  'a second is refused, never silently un-keyed',
  // Lessons and the agenda
  "`lessonFiles` is only the archive's",
  'never with a bad base',
  'logs no practice and is never copied forward',
  'one raised at close is a new entry, never overwriting another',
  'one check per file, never a shared import',
  // Direction-aware text
  'never a second matcher',
  'write every `dir` literally, never computed',
  // Material
  'never remove the cross-instrument view',
  'references and attachments never merge or split across sections',
  "ItemDetail's Files list only adds and removes",
  'never a panel, viewer or dashboard; no material or viewer concern may touch a recorded minute, the wake lock or a boundary announcement',
  'never strips them',
  'never as a dead link or an error',
  // The Setar archive
  'The scanner never follows a symlink, treats a failed read as empty, splits on token 0 or picks the largest file',
  'a rename loop or fork is diagnosed, never walked',
  'The app refuses a newer index version',
  "The owner's own practice takes are never a resource",
  "a roster is the registry's, never inferred from files; an unnamed demo never spreads over a guessed set",
  '`aliases_seen` is search only, never identity',
  'a built-in `catalogKey` never equals a canonical key',
  'an unanswered offer writes nothing',
  'never replaces the database or touches a blob',
  'Moving an archive-bound item to another instrument is refused',
  '`not-described` never means gone; two rows naming one file both survive',
  'an undecodable base is unrecognised, never thrown',
  'An unreachable NAS is never called absent',
  'no workflow or admin scope',
  // Courses
  'never imported by or reachable from runtime',
  'absent with a diagnostic, never guessed; it refuses a duplicate key',
  'legacy key aliases live in hand-written `courseSeed.ts`',
  'Stored paths are NFC',
  'a shipped work row is never removed (literal ledgers, never derived from the data)',
  'only a declared work key crosses stages',
  'never matched by name, ZWNJ or space',
  'only an entry naming one work becomes repertoire, never a drill, an aid or two works',
  'never basename',
  'contrast-card decks are one folder reference, never a viewer, flashcard player or deck-by-deck list',
  'regeneration never rewrites notes or stored fields',
  'never on load, hydration, import or sync',
  '`seedInstrumentIds` never reads Setar or Guitar as Tar',
  'never reuses `allocateMinutes`',
  'creates no `Lesson`',
  // Review scheduling and the Session Plan
  'nothing else reads as failure',
  'manual mode with no new date keeps it',
  'reconciled each render, never from an effect',
  'day read at the tap',
  'an ordinary item save never releases a protected date',
  'no scores, no "optimal" claims, its evidence never dressed up as an optimum',
  'resting material never surfaces, even by fallback',
  'never a due review or class commitment',
  'Start rechecks the day and refuses visibly',
  // Device, sync, architecture and tests
  '"newest" is a hint, never an auto-winner',
  'never the only backup',
  'never `height: 100%`',
  "by geometry, never focus, never touching `<main>`'s scroll",
  'a catalogue row shows its status once',
  'links never duplicate the item',
  'components never touch IndexedDB',
  'by key presence, never `??`',
  'which read no clock and guess nothing',
  'a new collection goes in its `ARRAY_KEYS` and returned object',
  'its throw is never caught, `hydrated` never forced open, nothing set through `setState`',
  'never a second importer',
  'only one that fails a listed pair',
  // The second sweep (a sentence whose main clause survived but a second negated qualifier did not)
  'never a closure or a ref an effect mirrors',
  'audio unlocks on the page that starts the clock, never on the practice screen',
  'a preserved key goes to the one with real content, never merely the lower ordinal',
  '`planMinutesByInstrument`) is store state, never in `PracticeDB`, sync or a backup',
  'never while the viewport is short or zoomed',
  'components never touch IndexedDB or rebuild domain objects by hand',
];

it('AGENTS.md keeps every agent-facing prohibition restored from the baseline sweep', () => {
  const text = readFileSync(AGENTS, 'utf8').replace(/\s+/g, ' ');
  expect(new Set(RESTORED_PROHIBITIONS).size).toBe(RESTORED_PROHIBITIONS.length);
  expect(RESTORED_PROHIBITIONS.filter((phrase) => !text.includes(phrase))).toEqual([]);
});
