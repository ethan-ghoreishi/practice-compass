import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as runnerModule from '../scripts/check-setar-practice-families.mjs';

// ---------------------------------------------------------------------------
// ac-17 — the family proof route itself. `node scripts/check-setar-practice-
// families.mjs` runs every acceptance check's ONE named test (both engines,
// through practiceBrowser), and `--mutations` applies each targeted partial
// fix and requires its focused behavioural test to FAIL. This test checks the
// runner's manifest WITHOUT running it: list mode spawns nothing, so the proof
// never recurses into itself. The mutation results are recorded in
// docs/setar-practice-reliability.md.
// ---------------------------------------------------------------------------

type Row = [string, string, string];
interface Mutation {
  name: string;
  file: string;
  find: string;
  replace: string;
  test: string;
}
const runner = runnerModule as { ACCEPTANCE: Row[]; COMPANIONS: Row[]; MUTATIONS: Mutation[]; titleProblems(): string[] };
const SCRIPT = 'scripts/check-setar-practice-families.mjs';

/**
 * The families the contract requires a targeted mutation for — a literal
 * ledger, so dropping one from the runner fails here rather than going quiet.
 */
const REQUIRED_FAMILIES: RegExp[] = [
  /^scanner drops studySource$/,
  /^decoder drops studySource$/,
  /^inbound drops studySource/,
  /^restore widened/,
  /^a relation reader bypasses the selector/,
  /^a same-label premise accepted$/,
  /^unchanged metadata re-offered/,
  /^the selected-patch guard bypassed$/,
  /^an omitted gesture door/,
  /^term suggestions back to a datalist only$/,
  /^removal from a pathway by deleting the item$/,
  /^a hard-coded session ceiling$/,
  /^a fix hard-coded to Session 40's keys$/,
  /^an inferred roster/,
  /^an auto-confirmed draft/,
  /^draft row appended positionally/,
  /^roster amendment rebuilt from parsed cells/,
  /^an unlogged rename guessed by part number$/,
  /^a context created per boundary$/,
  /^no resume or state gate in the prime$/,
  /^an unconditional marker claim/,
  /^a delayed cue queued/,
  /^routine Start moved back into an effect$/,
];

describe('the Setar practice family proof route', () => {
  it('setar practice family proof rejects targeted partial fixes before review', () => {
    // LIST MODE runs nothing: with no PATH it cannot reach npx or vitest, and
    // still answers — so it is a manifest, not a run.
    const listed = spawnSync(process.execPath, [SCRIPT, '--list'], { env: { PATH: '' }, encoding: 'utf8' });
    expect(listed.status, listed.stderr).toBe(0);
    const manifest = JSON.parse(listed.stdout) as { acceptance: Row[]; companions: Row[]; mutations: Omit<Mutation, 'find' | 'replace'>[]; runs: string[] };

    // Seventeen automated checks, in order, each ONE named test in its file.
    expect(manifest.acceptance.map(([id]) => id)).toEqual(Array.from({ length: 17 }, (_, i) => `ac-${i + 1}`));
    expect(manifest.acceptance).toEqual(runner.ACCEPTANCE);
    expect(runner.titleProblems()).toEqual([]);
    expect(new Set([...manifest.acceptance, ...manifest.companions].map(([, title]) => title)).size).toBe(manifest.acceptance.length + manifest.companions.length);
    // The run set never contains this file: no recursion.
    expect(manifest.runs).not.toContain('tests/setar-practice-proof.test.ts');
    expect(manifest.runs).toEqual(expect.arrayContaining([...new Set(runner.ACCEPTANCE.filter(([id]) => id !== 'ac-17').map(([, , f]) => f))]));

    // Every mutation still APPLIES (exactly one match), changes something, and
    // is owned by a named behavioural test — never this one, never a scan.
    const titles = new Map([...runner.ACCEPTANCE, ...runner.COMPANIONS].map(([, title, file]) => [title, file]));
    for (const m of runner.MUTATIONS) {
      const source = readFileSync(m.file, 'utf8');
      expect(source.split(m.find).length - 1, `${m.name}: applies once`).toBe(1);
      expect(m.replace, m.name).not.toBe(m.find);
      expect(titles.has(m.test), `${m.name}: owned by a named test`).toBe(true);
      expect(titles.get(m.test), m.name).not.toBe('tests/setar-practice-proof.test.ts');
      expect(m.file.startsWith('tests/'), `${m.name}: mutates behaviour, not a test`).toBe(false);
    }
    expect(manifest.mutations.map((m) => m.name)).toEqual(runner.MUTATIONS.map((m) => m.name));
    // Every family the contract names has its mutation.
    for (const family of REQUIRED_FAMILIES) {
      expect(runner.MUTATIONS.some((m) => family.test(m.name)), String(family)).toBe(true);
    }
  });
});
