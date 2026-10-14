import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — no type declarations for the .mjs build module.
import * as stampModule from '../scripts/app-version.mjs';

// ---------------------------------------------------------------------------
// The build stamp names the last commit that changed what ships — in a
// throwaway git repository, driven by the stamp module's OWN input list, so a
// path added to that list is tested the moment it is added.
// ---------------------------------------------------------------------------

const stamp = stampModule as {
  BUILD_INPUTS: string[];
  VERSION_OVERRIDE: string;
  appVersion(opts?: { cwd?: string; env?: Record<string, string | undefined> }): string;
};

/** One concrete file each pathspec covers: a directory gets a file inside it, a glob each name it matches here. */
function filesFor(spec: string): string[] {
  if (spec.endsWith('/')) return [`${spec}module.ts`];
  if (spec === 'tsconfig*.json') return ['tsconfig.json', 'tsconfig.app.json'];
  return [spec];
}

const NOT_SHIPPED = ['.prismatica/records/change.md', 'docs/guide.md', 'tests/journey.test.ts', 'scripts/other-tool.mjs', 'README.md', 'NOTES.md'];

describe('the build stamp', () => {
  it('the build stamp names the last commit that changed what ships', () => {
    const root = mkdtempSync(join(tmpdir(), 'app-version-'));
    const repo = join(root, 'repo');
    mkdirSync(repo);
    let tick = 0;
    const git = (cwd: string, ...args: string[]) => {
      const day = String(1 + (tick % 27)).padStart(2, '0');
      return execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'Owner',
          GIT_AUTHOR_EMAIL: 'owner@example.invalid',
          GIT_COMMITTER_NAME: 'Owner',
          GIT_COMMITTER_EMAIL: 'owner@example.invalid',
          // Every commit dated in 2020, never the clock this test runs at.
          GIT_AUTHOR_DATE: `2020-03-${day}T12:00:00Z`,
          GIT_COMMITTER_DATE: `2020-03-${day}T12:00:00Z`,
        },
      }).trim();
    };
    const commitTouching = (path: string) => {
      tick += 1;
      const file = join(repo, path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `change ${tick}\n`);
      git(repo, 'add', '-A');
      git(repo, 'commit', '-q', '-m', `touch ${path}`);
      const [date, sha] = git(repo, 'log', '-1', '--format=%cs %H').split(' ');
      return `${date}·${sha.slice(0, 7)}`;
    };
    const read = (cwd = repo, env: Record<string, string | undefined> = {}) => stamp.appVersion({ cwd, env });
    try {
      git(repo, 'init', '-q');
      // Every shipped input, and every path that is not, exists from the start.
      const inputs = stamp.BUILD_INPUTS.flatMap(filesFor);
      expect(inputs.length).toBeGreaterThanOrEqual(stamp.BUILD_INPUTS.length);
      for (const path of [...inputs, ...NOT_SHIPPED]) {
        const file = join(repo, path);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, 'start\n');
      }
      git(repo, 'add', '-A');
      git(repo, 'commit', '-q', '-m', 'start');
      const [d0, s0] = git(repo, 'log', '-1', '--format=%cs %H').split(' ');
      let expected = `${d0}·${s0.slice(0, 7)}`;
      expect(read()).toBe(expected);
      // The date is the commit's — 2020 — never the clock this build runs at.
      expect(read()).toMatch(/^2020-03-\d{2}·[0-9a-f]{7}$/);

      // Records, docs, tests, other scripts and any Markdown: the stamp holds.
      for (const path of NOT_SHIPPED) {
        commitTouching(path);
        expect(read(), path).toBe(expected);
      }
      // Each listed input: the stamp becomes that commit.
      for (const path of inputs) {
        expected = commitTouching(path);
        expect(read(), path).toBe(expected);
      }
      // A records-only commit after them all still names the last input commit.
      const recordsOnly = commitTouching('.prismatica/records/approve.md');
      expect(read()).toBe(expected);
      expect(recordsOnly).not.toBe(expected);

      // SHALLOW history cannot answer, so it names HEAD.
      const shallow = join(root, 'shallow');
      git(root, 'clone', '-q', '--depth', '1', `file://${repo}`, shallow);
      expect(git(shallow, 'rev-parse', '--is-shallow-repository')).toBe('true');
      expect(read(shallow)).toBe(recordsOnly);

      // An explicit override wins, for the tests and the owner's preview checks.
      expect(read(repo, { [stamp.VERSION_OVERRIDE]: 'owner-check-2' })).toBe('owner-check-2');
      // No git at all: a plain marker, never the build clock.
      expect(read(root)).toBe('dev');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
