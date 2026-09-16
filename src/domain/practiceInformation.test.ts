import { describe, expect, it } from 'vitest';
import v12FixtureText from '../../tests/fixtures/practice-information-v12.json?raw';
import { validateDB, SchemaTooNewError } from './io';
import { validatePracticeText, validateUnfinishedText } from './practiceInformation';
import { SCHEMA_VERSION, type PracticeDB } from './types';

// ---------------------------------------------------------------------------
// ac-2 — C2. The text that SURVIVES the v13 retirement is real text, or the
// database does not get installed.
// ---------------------------------------------------------------------------

function v12(): PracticeDB {
  return (JSON.parse(v12FixtureText) as { data: PracticeDB }).data;
}

/** One item, with whatever the case under test wants on it. */
function withItem(patch: Record<string, unknown>): PracticeDB {
  const db = v12();
  return { ...db, items: db.items.map((i) => (i.id === 'i-farsi' ? ({ ...i, ...patch } as typeof i) : i)) };
}

function withBlock(patch: Record<string, unknown>): PracticeDB {
  const db = v12();
  return { ...db, blocks: db.blocks.map((b) => (b.id === 'b-farsi-1' ? ({ ...b, ...patch } as typeof b) : b)) };
}

describe('surviving practice text is checked before anything installs it', () => {
  it('practice text validation rejects malformed canonical values without coercion', () => {
    // --- ACCEPTED: absent, empty, and real multilingual strings ------------
    const accepted: { name: string; db: PracticeDB }[] = [
      { name: 'the fixture as it stands', db: v12() },
      { name: 'notes absent', db: withItem({ notes: undefined }) },
      { name: 'notes null (a serialiser’s "no value")', db: withItem({ notes: null }) },
      { name: 'notes empty — deliberately emptied', db: withItem({ notes: '' }) },
      { name: 'notes in Farsi', db: withItem({ notes: 'فرود را آهسته بگیر' }) },
      { name: 'notes mixing scripts and newlines', db: withItem({ notes: 'Slow the forud\nفرود را آهسته بگیر' }) },
      { name: 'observation empty', db: withBlock({ observation: '' }) },
      { name: 'nextAction in Farsi', db: withBlock({ nextAction: 'آهسته‌تر' }) },
      { name: 'constraint absent', db: withBlock({ constraint: undefined }) },
    ];
    for (const { name, db } of accepted) {
      expect(validatePracticeText(db), name).toBeNull();
      expect(() => validateDB(db), name).not.toThrow();
    }

    // --- REFUSED: a present value that is not text -------------------------
    // Each must name the OFFENDING RECORD, so the owner can find it, and must
    // never be coerced — `String({})` is how a note becomes "[object Object]".
    const refusedItems: { name: string; value: unknown; says: RegExp }[] = [
      { name: 'a number', value: 3, says: /number/ },
      { name: 'a boolean', value: true, says: /boolean/ },
      { name: 'a list', value: ['a', 'b'], says: /list/ },
      { name: 'an object', value: { text: 'hidden' }, says: /object/ },
    ];
    for (const { name, value, says } of refusedItems) {
      const db = withItem({ notes: value });
      const problem = validatePracticeText(db);
      expect(problem, name).toMatch(says);
      // The record is identified by its own title, not by an index.
      expect(problem, name).toContain('آوازِ افشاری — عبارتِ ۴');
      expect(problem, name).toContain('notes');
      expect(() => validateDB(db), name).toThrow(/notes/);
    }

    for (const field of ['observation', 'nextAction', 'constraint'] as const) {
      for (const { name, value, says } of refusedItems) {
        const db = withBlock({ [field]: value });
        const problem = validatePracticeText(db);
        expect(problem, `${field}/${name}`).toMatch(says);
        expect(problem, `${field}/${name}`).toContain('b-farsi-1');
        expect(problem, `${field}/${name}`).toContain(field);
        expect(() => validateDB(db), `${field}/${name}`).toThrow(new RegExp(field));
      }
    }

    // --- A RETIRED field is never mistaken for a malformed canonical one ---
    // The retirement pass removes it before this check ever runs, so a
    // database carrying a malformed `currentProblem` still imports cleanly and
    // simply loses that field — it must NOT be refused.
    const withJunkRetired = withItem({ currentProblem: { was: 'an object' }, tags: 'not even a list', lastObservation: 7 });
    expect(() => validateDB(withJunkRetired)).not.toThrow();
    const installed = validateDB(withJunkRetired).items.find((i) => i.id === 'i-farsi')!;
    expect('currentProblem' in installed).toBe(false);
    expect(installed.notes).toBe('یادداشتِ کاری: فرود را آهسته بگیر.');

    // --- The existing doors stay authoritative -----------------------------
    // A newer schema is refused BEFORE any retirement pass or relabelling.
    expect(() => validateDB({ ...v12(), schemaVersion: SCHEMA_VERSION + 1 })).toThrow(SchemaTooNewError);
    const tooNew = { ...v12(), schemaVersion: SCHEMA_VERSION + 1, items: [] as PracticeDB['items'] };
    expect(() => validateDB(tooNew)).toThrow(/newer version/);
    // An impossible calendar date and a dangling agenda reference are still
    // refused by their own checks, which this one does not replace.
    expect(() => validateDB(withItem({ nextReviewDate: '2027-02-30' }))).toThrow(/next-review date/);
    expect(() =>
      validateDB({ ...v12(), lessonAgenda: v12().lessonAgenda.map((e) => ({ ...e, lessonId: 'no-such-lesson' })) }),
    ).toThrow();

    // --- The UNFINISHED block's scratch observation ------------------------
    // It lives outside PracticeDB, so `validatePracticeText` never sees it —
    // and it reaches live state through the same hydration boundary.
    expect(validateUnfinishedText(undefined)).toBeNull();
    expect(validateUnfinishedText(null)).toBeNull();
    expect(validateUnfinishedText({ itemId: 'i-farsi' })).toBeNull();
    expect(validateUnfinishedText({ itemId: 'i-farsi', note: '' })).toBeNull();
    expect(validateUnfinishedText({ itemId: 'i-farsi', note: 'فرود افتاد' })).toBeNull();
    expect(validateUnfinishedText({ itemId: 'i-farsi', note: { was: 'an object' } })).toMatch(/object/);
    expect(validateUnfinishedText({ itemId: 'i-farsi', note: 12 })).toMatch(/number/);
    expect(validateUnfinishedText([])).toMatch(/not readable/);
  });
});
