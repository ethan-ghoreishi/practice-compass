import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// ac-17 — the UI refresh condensed AGENTS.md so the always-loaded rules keep
// working room: AGENTS.md alone and the CLAUDE.md import profile each stay at
// least 4 KiB under the 32 KiB ceiling. Counted exactly as
// tests/agent-context.test.ts counts them (the file's bytes; CLAUDE.md plus
// every `@path` it imports outside code, transitively, each once) — that
// file's own budget, prohibition and path tests stay as they are.
// ---------------------------------------------------------------------------

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS = join(ROOT, 'AGENTS.md');
const CEILING = 32_768;
const HEADROOM = 4_096;

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
];

it('UI refresh leaves instruction headroom without losing current prohibitions', () => {
  const claude = claudeProfile(join(ROOT, 'CLAUDE.md'));
  expect(claude.map((f) => f.slice(ROOT.length + 1))).toContain('AGENTS.md');
  expect(bytes(claude), 'Claude profile').toBeLessThanOrEqual(CEILING - HEADROOM);
  expect(bytes([AGENTS]), 'AGENTS.md').toBeLessThanOrEqual(CEILING - HEADROOM);
  const text = readFileSync(AGENTS, 'utf8').replace(/\s+/g, ' ');
  expect(LANE_RULES.filter((rule) => !text.includes(rule))).toEqual([]);
});
