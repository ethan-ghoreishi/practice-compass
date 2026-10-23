import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// ac-17 — the UI refresh condensed AGENTS.md so the always-loaded rules keep
// working room: AGENTS.md alone and the CLAUDE.md import profile each stay at
// least 3.5 KiB under the 32 KiB ceiling (owner amendment 2026-10-23: every
// rule kept, subsystem mechanism moved to its doc). Counted exactly as
// tests/agent-context.test.ts counts them (the file's bytes; CLAUDE.md plus
// every `@path` it imports outside code, transitively, each once) — that
// file's own budget, prohibition and path tests stay as they are.
// ---------------------------------------------------------------------------

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS = join(ROOT, 'AGENTS.md');
const CEILING = 32_768;
const HEADROOM = 3_584;

const withoutCode = (text: string) => text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

function claudeProfile(entry: string): string[] {
  const files: string[] = [];
  const visit = (file: string) => {
    if (files.includes(file)) return;
    files.push(file);
    for (const [, target] of withoutCode(readFileSync(file, 'utf8')).matchAll(/(?:^|\s)@(\S+)/g)) {
      if (target.startsWith('~')) continue;
      const path = resolve(dirname(file), target);
      if (existsSync(path) && statSync(path).isFile()) visit(path);
    }
  };
  visit(entry);
  return files;
}

const bytes = (files: string[]) => files.reduce((n, f) => n + readFileSync(f).length, 0);

/**
 * The rules this lane ADDED or reworded while condensing, each as the exact
 * phrase now carrying it — so headroom is never bought by dropping them.
 */
const LANE_RULES = [
  // Added by the UI refresh.
  '`isolate` (`src/domain/util.ts`',
  'an insight title never embeds one',
  '`partRelationRefusal`',
  '`dropUnshownIdentity`',
  'Back keeps the inputs for THAT block only (`closeDraft.ts`), in memory',
  '"Why this date?" opens `SchedulingExplanation` in place',
  'roll at local midnight (`useDecisionNow`), never a `now` frozen at mount',
  'the group re-declares `textAlign: \'start\'`',
  'separators stay outside a label isolate',
  'in every file',
  '`tests/ui-conformance.browser.test.ts` sweeps',
  // Base rules reworded while condensing, substance kept.
  'never a custom server, never a NAS backend replacing it',
  'A mid-run sync request is remembered (`rerunWanted`), never dropped',
  'Deliberate erasure keeps no guard',
  'a block never auto-finishes',
  'A routine starts only from a tap, never an effect',
  'never invented specifics',
  'every role-named file, registered or not, counts against the roster',
  '`validateDB` refuses invalid new intent, including a dangling live `lessonId` or `itemId`',
  '"represented" means the same text',
  'Pathways, stages and routines are editable',
  'Delete practice item is the only destructive action',
  'Fix the grammar or the door, never with a guard in a component',
  'never guess',
  // Restored after a clause-by-clause check of the moved sections.
  'A date the owner owns (or of unknown provenance) is protected until due',
  'a whole work (`isWork`) gets at least 10',
  'its branch restriction is never called credential isolation',
  'Restore lifts one exact suppression',
  'imported pieces arrive resting',
  'The commit re-plans, validates, waits for IndexedDB',
  'never a bare date compare',
  'guidance is copied into notes once',
  'diversity stays subordinate',
  'A plan is stale when `rev` or the day moves',
  'Skip clamps to elapsed; Short on time drops non-essentials',
  'an unproven match is asked',
  'excluding technique, exercise and study material',
  "Active's title group is deliberately start-aligned",
  'an independently authored value gets its own `dir="auto"`',
  'only the owner changes it',
  'edited in place only when a rule changes',
  // Restored after the sealed review's clause-by-clause comparison of each
  // moved section with the baseline: binding constraints stay here, not only
  // in the optional doc.
  'audio and vibration are best-effort, never asserted',
  'via one resolver, `resolveCatalogReference`,',
  'never by rewriting an instrument',
  'A run freezes its segments',
  'ONE practice clock (`locateClock`, wall-clock elapsed)',
  "a reclassifying edit or another term's spelling is refused",
  'Decisions, Skips and deletions persist',
  "The NAS publisher's token is separate, repository-scoped",
  'and only in the NAS runtime',
  'no persisted graph, inbound door or schema change',
  '`reseedDefaultPathways` never adds a stage to an existing pathway',
  'stable, due, not yet advanced today: `srLastProgressDay`',
  'build and swap share `isProactiveCandidate`/`candidatePool`',
  'warm-up takes familiar easy items',
  'each item is revalidated at start',
  // Each moved section points to where it is written in full.
  'Full: `docs/repertoire-experience.md`',
  'Runbook and full: `docs/setar-archive.md`',
  'Full: `docs/cgs-course.md`, `docs/khonyagar-course.md`',
  'Numbers and full: `docs/scheduling-evidence.md`',
  'Full: `docs/setar-practice-reliability.md`',
];

it('UI refresh leaves instruction headroom without losing current prohibitions', () => {
  const claude = claudeProfile(join(ROOT, 'CLAUDE.md'));
  expect(claude.map((f) => f.slice(ROOT.length + 1))).toContain('AGENTS.md');
  expect(bytes(claude), 'Claude profile').toBeLessThanOrEqual(CEILING - HEADROOM);
  expect(bytes([AGENTS]), 'AGENTS.md').toBeLessThanOrEqual(CEILING - HEADROOM);
  const text = readFileSync(AGENTS, 'utf8').replace(/\s+/g, ' ');
  expect(LANE_RULES.filter((rule) => !text.includes(rule))).toEqual([]);
});
