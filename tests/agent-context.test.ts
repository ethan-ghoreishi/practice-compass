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

/** Repository paths named in code spans (any whitespace-separated token) or as link targets. */
function namedPaths(text: string): string[] {
  const tokens = [
    ...[...text.matchAll(/`([^`\n]+)`/g)].flatMap(([, span]) => span.split(/\s+/)),
    ...[...text.matchAll(/\]\(([^)\s]+)\)/g)].map(([, target]) => target),
  ];
  const paths = tokens
    .map((t) => t.replace(/^\.\//, ''))
    .filter((t) => PATH_ROOTS.some((root) => t.startsWith(root)) && !/[*{[]/.test(t))
    .map((t) => t.replace(/[#?].*$/, '').replace(/:L?\d+(-L?\d+)?$/, '').replace(/[),.;:]+$/, ''));
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
