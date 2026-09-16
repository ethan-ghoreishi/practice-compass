import type { PracticeDB } from './types';

// ---------------------------------------------------------------------------
// The few things the musician records, and where each of them lives.
//
// ONE canonical home per kind of information:
//
//   item.notes          — Working notes. The item's own notebook: what this
//                         piece is, what your teacher said, what to watch.
//                         Readable and editable WHILE practising.
//   block.observation   — what happened in ONE recorded block.
//   block.nextAction    — the one thing to try next time, decided at that
//                         block's close and read at the next one.
//   lessonAgenda        — questions for a teacher, and commitments to a class.
//
// Everything below is the list of persisted practice-text fields that used to
// COMPETE with those four. The owner settled (2026-09-16) that their current
// content is dummy test data and that lossless preservation of these
// particular fields is waived: they are retired outright rather than migrated
// into `notes`, because merging dummy text into the one canonical notebook is
// the failure mode, not the fix.
//
// This is a BOUNDED, one-way exception. It is not permission to reset practice
// history, ratings, reviews, commitments or any future meaningful text — see
// `validatePracticeText` below, which guards exactly the fields that survive.
// ---------------------------------------------------------------------------

/** Retired item-level practice text (schema v13). */
export const RETIRED_ITEM_KEYS = ['currentProblem', 'bestStrategy', 'tags', 'lastObservation'] as const;

/**
 * Retired Persian WORKING-DETAIL keys. The Persian IDENTITY keys
 * (`dastgahAvaz`, `gusheh`, `form`, `composer`) are kept — they say what the
 * piece IS, and they group the repertoire.
 */
export const RETIRED_PERSIAN_KEYS = [
  'phraseLabel',
  'shahed',
  'ist',
  'foroud',
  'importantNote',
  'ornamentIssue',
  'mezrabIssue',
] as const;

/**
 * Retired Guitar WORKING-DETAIL keys. `lessonNumber` and `barRange` are
 * identity and are kept. Note `bodyTensionNote` here is the ITEM's guitar
 * detail — a different field from the block's own `bodyNote` below, which is
 * also retired; confusing the two leaves one of them live.
 */
export const RETIRED_GUITAR_KEYS = [
  'rightHandIssue',
  'leftHandIssue',
  'toneIssue',
  'fingering',
  'tempo',
  'stringNoiseIssue',
  'bodyTensionNote',
] as const;

/** Retired block-level practice text (schema v13). */
export const RETIRED_BLOCK_KEYS = ['bodyNote'] as const;

/** The item's own surviving free text — the one canonical notebook. */
export const CANONICAL_ITEM_TEXT_KEYS = ['notes'] as const;

/** A recorded block's own surviving free text. */
export const CANONICAL_BLOCK_TEXT_KEYS = ['observation', 'nextAction', 'constraint'] as const;

type Container = Record<string, unknown>;

/**
 * Strip the retired keys from one object, and report whether anything was
 * actually there. Deletion ONLY: this never writes a value, which is what
 * makes re-running the whole pass incapable of resetting canonical text.
 */
function stripKeys(row: Container, keys: readonly string[]): { row: Container; changed: boolean } {
  let changed = false;
  let next = row;
  for (const key of keys) {
    if (key in next) {
      if (!changed) {
        next = { ...row };
        changed = true;
      }
      delete next[key];
    }
  }
  return { row: next, changed };
}

/**
 * Strip a nested family container (`persian` / `guitar`), dropping the
 * container itself only when stripping leaves it TRULY empty — an item that
 * still carries `dastgahAvaz` keeps its `persian` object, identity intact.
 */
function stripFamily(parent: Container, key: string, retired: readonly string[]): boolean {
  const family = parent[key];
  if (family === undefined) return false;
  if (typeof family !== 'object' || family === null || Array.isArray(family)) return false;
  const { row, changed } = stripKeys(family as Container, retired);
  if (!changed) return false;
  if (Object.keys(row).length === 0) delete parent[key];
  else parent[key] = row;
  return true;
}

/**
 * v12 → v13: retire the practice-text fields that competed with the four
 * canonical homes above.
 *
 * Deterministic, clock-free and idempotent. It reads no date, derives nothing
 * and WRITES nothing — every change is a key removal — so a second run over
 * its own output is a no-op and current canonical text can never be reset by
 * it. Runs on EVERY inbound database, not only one declaring `fromVersion < 13`:
 * a database claiming the current schema can still carry a stray retired key
 * from a partial conversion or a hand-edited file, and gating on the declared
 * version would accept that leftover as a second, silent source of truth
 * (exactly the reasoning `migrateToV12` already records for itself).
 */
export function retirePracticeText(db: PracticeDB): PracticeDB {
  let itemsChanged = false;
  const items = (db.items ?? []).map((raw) => {
    const base = raw as unknown as Container;
    const { row, changed } = stripKeys(base, RETIRED_ITEM_KEYS);
    // `row` is already a fresh copy whenever `changed`; take one before
    // touching a nested family so the input is never mutated.
    const next = changed ? row : { ...base };
    const persianChanged = stripFamily(next, 'persian', RETIRED_PERSIAN_KEYS);
    const guitarChanged = stripFamily(next, 'guitar', RETIRED_GUITAR_KEYS);
    if (!changed && !persianChanged && !guitarChanged) return raw;
    itemsChanged = true;
    return next as unknown as PracticeDB['items'][number];
  });

  let blocksChanged = false;
  const blocks = (db.blocks ?? []).map((raw) => {
    const { row, changed } = stripKeys(raw as unknown as Container, RETIRED_BLOCK_KEYS);
    if (!changed) return raw;
    blocksChanged = true;
    return row as unknown as PracticeDB['blocks'][number];
  });

  if (!itemsChanged && !blocksChanged) return db;
  return { ...db, items, blocks };
}

/** An optional free-text field: absent, or a real string (empty is fine). */
function textProblem(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return null;
  if (Array.isArray(value)) return 'a list';
  if (typeof value === 'object') return 'an object';
  return `a ${typeof value}`;
}

/**
 * Validate the practice text that SURVIVES this lane, before any install.
 *
 * Bounded on purpose: the four canonical homes' own string fields, nothing
 * else. A present value of the wrong type is REJECTED with the record
 * identified, never coerced — `String({})` is how a note becomes the literal
 * text "[object Object]" and the owner's real words are gone. Absent and
 * empty are both legitimate: emptying a notebook is a deliberate act, and an
 * empty string is not a reason to resurrect anything.
 *
 * Retired keys are NOT checked here. They are removed by `retirePracticeText`
 * before this runs, so a malformed retired field can never masquerade as a
 * malformed canonical one (or refuse an otherwise-valid restore).
 */
export function validatePracticeText(db: Pick<PracticeDB, 'items' | 'blocks'>): string | null {
  for (const item of db.items) {
    for (const key of CANONICAL_ITEM_TEXT_KEYS) {
      const problem = textProblem((item as unknown as Container)[key]);
      if (problem) return `Item "${item.title ?? item.id}" has ${problem} where its ${key} should be text.`;
    }
  }
  for (const block of db.blocks) {
    for (const key of CANONICAL_BLOCK_TEXT_KEYS) {
      const problem = textProblem((block as unknown as Container)[key]);
      if (problem) {
        return `A practice block (${block.id}) has ${problem} where its ${key} should be text.`;
      }
    }
  }
  return null;
}

/**
 * The unfinished block's scratch observation lives OUTSIDE `PracticeDB` (in
 * the store's ephemeral `active`), so `validatePracticeText` above never sees
 * it — yet it reaches live state through the very same hydration boundary and
 * is rendered as text the moment the practice screen opens. Checked here, with
 * the same rule and the same refusal.
 */
export function validateUnfinishedText(active: unknown): string | null {
  if (active === undefined || active === null) return null;
  if (typeof active !== 'object' || Array.isArray(active)) return 'The unfinished practice session is not readable.';
  const problem = textProblem((active as Container).note);
  return problem ? `The unfinished practice session has ${problem} where its observation should be text.` : null;
}
