#!/usr/bin/env node
// ---------------------------------------------------------------------------
// The ONE reproducible route for the repertoire v15 family proof.
//
//   node scripts/check-repertoire-families.mjs            # unit + both browser engines
//   node scripts/check-repertoire-families.mjs --unit     # the fast domain families only
//
// It uses nothing but the repository's own Vitest (and, for the browser
// families, the same Playwright harness every other journey uses — a missing
// browser FAILS with its install instruction, never skips). It:
//
//  1. checks that every acceptance title names EXACTLY ONE `it()` in the repo;
//  2. runs the family files with a JSON report;
//  3. prints each acceptance check with the one test that proves it, and fails
//     unless every one of them ran and passed.
//
// Fixtures and expectations are committed (tests/fixtures/repertoire-*.json);
// the clocks are fixed inside the tests, so a rerun proves the same thing.
// docs/repertoire-experience.md records the matrix this runs.
// ---------------------------------------------------------------------------

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** [acceptance id, exact test title, file that holds it]. */
const ACCEPTANCE = [
  ['ac-1', 'repertoire v15 migration is deterministic idempotent and lossless', 'tests/repertoire-families.test.ts'],
  ['ac-2', 'repertoire identity validation refuses malformed state without discarding legacy evidence', 'tests/repertoire-families.test.ts'],
  ['ac-3', 'musical term resolution separates exact identity from broad search', 'src/domain/musicTerms.test.ts'],
  ['ac-4', 'musical term management preserves identities and reports durable saves honestly', 'tests/repertoire-experience.browser.test.ts'],
  ['ac-5', 'repertoire discovery includes every eligible work without duplicate parents', 'src/domain/repertoire.test.ts'],
  ['ac-6', 'repertoire navigation restores browse context without changing session scope', 'tests/repertoire-experience.browser.test.ts'],
  ['ac-7', 'catalogue identity survives placement changes across every consumer', 'src/domain/referenceCatalog.test.ts'],
  ['ac-8', 'catalogue linking preserves owner records and refuses ambiguous automatic reuse', 'src/domain/referenceCatalog.test.ts'],
  ['ac-9', 'hidden reference suggestions never delete or complete owned practice', 'tests/repertoire-families.test.ts'],
  ['ac-10', 'pathway restoration remains explicit additive and lossless', 'src/domain/pathways.test.ts'],
  ['ac-11', 'pathway removal keeps enriched and never practised owner items', 'tests/repertoire-families.test.ts'],
  ['ac-12', 'Setar and Tar share reference definitions without sharing practice state', 'src/domain/referenceCatalog.test.ts'],
  ['ac-13', 'new Persian reference views preserve existing Setar organisation', 'tests/repertoire-families.test.ts'],
  ['ac-14', 'pathway context readers agree on visible routes and pinned stages', 'src/domain/pathways.test.ts'],
  ['ac-15', 'study sources clarify new choices without rewriting legacy meaning', 'src/domain/studySources.test.ts'],
  ['ac-16', 'every inbound door enforces the repertoire v15 boundary', 'tests/repertoire-inbound.browser.test.ts'],
  ['ac-17', 'repertoire backups round trip and older readers refuse v15 safely', 'tests/repertoire-inbound.browser.test.ts'],
  ['ac-18', 'musical metadata integration preserves archive reconciliation boundaries', 'src/domain/sourceReconcile.test.ts'],
  ['ac-19', 'the unified repertoire journey works in Chromium and WebKit', 'tests/repertoire-experience.browser.test.ts'],
  ['ac-20', 'viewport recovery respects focus zoom and scroll ownership', 'tests/repertoire-viewport.browser.test.ts'],
  ['ac-21', 'the shared practice shell remains accessible and readable across layouts', 'tests/repertoire-viewport.browser.test.ts'],
  ['ac-22', 'repertoire administration never fabricates or resets practice evidence', 'tests/repertoire-families.test.ts'],
];

/** Supporting families the acceptance checks lean on (never replace them). */
const SUPPORT = [
  'src/components/viewport.test.ts',
  'src/domain/persian.test.ts',
  'src/domain/farsi.test.ts',
  'src/components/direction.test.ts',
  'src/domain/khonyagarCourse.test.ts',
];

const unitOnly = process.argv.includes('--unit');
const isBrowser = (file) => file.includes('.browser.');

// --- 1. every title names exactly one test ------------------------------------
const testFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.test\.ts$/.test(name)) testFiles.push(path);
  }
};
walk('src');
walk('tests');
const sources = testFiles.map((f) => [f, readFileSync(f, 'utf8')]);
const problems = [];
for (const [id, title, file] of ACCEPTANCE) {
  const quoted = new RegExp(`\\bit\\(\\s*['"\`]${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
  const hits = sources.flatMap(([f, src]) => (src.match(quoted) ?? []).map(() => f));
  if (hits.length !== 1) problems.push(`${id}: "${title}" names ${hits.length} tests (${hits.join(', ') || 'none'})`);
  else if (hits[0] !== file) problems.push(`${id}: "${title}" lives in ${hits[0]}, not ${file}`);
}
if (problems.length) {
  console.error(`Acceptance titles are not one-to-one:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

// --- 2. run the families -------------------------------------------------------
const files = [...new Set([...ACCEPTANCE.map(([, , f]) => f), ...SUPPORT])].filter((f) => !unitOnly || !isBrowser(f));
const out = mkdtempSync(join(tmpdir(), 'repertoire-families-'));
const report = join(out, 'report.json');
const run = spawnSync('npx', ['vitest', 'run', ...files, '--reporter=json', `--outputFile=${report}`, '--reporter=default'], {
  stdio: 'inherit',
});

// --- 3. one line per acceptance check -------------------------------------------
let results = {};
try {
  const json = JSON.parse(readFileSync(report, 'utf8'));
  for (const file of json.testResults) for (const t of file.assertionResults) results[t.title] = t.status;
} catch {
  results = {};
}
rmSync(out, { recursive: true, force: true });
let failed = run.status !== 0;
console.log('\nRepertoire v15 — acceptance checks and the one test proving each:');
for (const [id, title, file] of ACCEPTANCE) {
  if (unitOnly && isBrowser(file)) {
    console.log(`  ${id.padEnd(6)} (browser, not run with --unit)  ${title}`);
    continue;
  }
  const status = results[title] ?? 'did not run';
  if (status !== 'passed') failed = true;
  console.log(`  ${id.padEnd(6)} ${status.padEnd(12)} ${title}`);
}
console.log('  ac-23..25  manual:OWNER — see docs/repertoire-experience.md');
process.exit(failed ? 1 : 0);
