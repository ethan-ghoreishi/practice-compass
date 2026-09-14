import { describe, expect, it } from 'vitest';
import v11FixtureText from '../../tests/fixtures/practice-decisions-v11.json?raw';
import { migrateToCurrent, OLDEST_SCHEMA_VERSION } from './migrations';
import { createSeedDB } from './seed';
import { SCHEMA_VERSION, type Pathway, type PracticeDB } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

/** A raw, pre-v3 shaped database: no `pathways` key at all, and the old `curriculum` field. */
function legacyV2Fixture(): PracticeDB {
  return {
    schemaVersion: 2,
    instruments: [{ id: 'i-setar', name: 'Setar', family: 'Persian', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }],
    materials: [],
    items: [],
    blocks: [],
    reviews: [],
    curriculum: {},
  } as unknown as PracticeDB;
}

// A database that has already been through the full chain once — every
// optional field the chain normalises (recordings, kind, ...) is filled in,
// so re-running the whole chain over it (fromVersion held at the oldest)
// exercises v4-v10's actual idempotency, not just their version gates being
// skipped.
const NORMALIZED = migrateToCurrent(createSeedDB(NOW), OLDEST_SCHEMA_VERSION);

describe('migrateToCurrent', () => {
  it('migrates an older database through to the current version instead of stamping it', () => {
    const out = migrateToCurrent(legacyV2Fixture(), 2);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    // Actually migrated (v3 pathway seeding ran), not merely re-stamped:
    expect(out.pathways.length).toBeGreaterThan(0);
    expect((out as unknown as { curriculum?: unknown }).curriculum).toBeUndefined();
  });

  it('leaves an already-current database unchanged through the chain', () => {
    expect(migrateToCurrent(NORMALIZED, OLDEST_SCHEMA_VERSION)).toEqual(NORMALIZED);
  });

  it('applying the chain twice produces the same result as applying it once', () => {
    const once = migrateToCurrent(legacyV2Fixture(), OLDEST_SCHEMA_VERSION);
    const twice = migrateToCurrent(once, OLDEST_SCHEMA_VERSION);
    expect(twice).toEqual(once);
  });

  it('does not seed pathways into an unversioned current-shaped database', () => {
    const currentShaped: PracticeDB = { ...NORMALIZED, pathways: [] as Pathway[] };
    const out = migrateToCurrent(currentShaped, OLDEST_SCHEMA_VERSION);
    // The whole chain ran (fromVersion held at the oldest), yet the `pathways`
    // key's mere presence — empty — stopped v3 from reseeding it, and v4-v10
    // found nothing left to normalise: unchanged apart from schemaVersion.
    expect(out).toEqual({ ...currentShaped, schemaVersion: SCHEMA_VERSION });
  });

  it('still seeds pathways for a genuine pre-v3 database with no pathways key', () => {
    const out = migrateToCurrent(legacyV2Fixture(), OLDEST_SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
    expect(out.pathwayStages.length).toBeGreaterThan(0);
  });
});

// --- v11: routine instrumentId backfill --------------------------------------

const TS = '2025-01-01T00:00:00.000Z';
const guitarInstrument = { id: 'i-guitar', name: 'Guitar', family: 'Western', active: true, createdAt: TS, updatedAt: TS };
const setarInstrument = { id: 'i-setar', name: 'Setar', family: 'Persian', active: true, createdAt: TS, updatedAt: TS };

function fixturePathway(id: string, instrumentId?: string) {
  return { id, instrumentId, name: id, order: 0, createdAt: TS, updatedAt: TS };
}
function fixtureRoutine(id: string, pathwayId: string) {
  return { id, pathwayId, name: id, segments: [], order: 0, createdAt: TS, updatedAt: TS };
}
function v10DBWith(instruments: unknown[], pathways: unknown[], pathwayRoutines: unknown[]): PracticeDB {
  return {
    schemaVersion: 10,
    instruments,
    materials: [],
    items: [],
    blocks: [],
    reviews: [],
    pathways,
    pathwayStages: [],
    pathwayRoutines,
    attachments: [],
    lessons: [],
  } as unknown as PracticeDB;
}

describe('v11 routine instrumentId backfill', () => {
  it('backfills a routine instrument from its pathway on the shared chain', () => {
    const v10 = v10DBWith(
      [guitarInstrument],
      [fixturePathway('p-cgs', 'i-guitar')],
      [fixtureRoutine('r-stage1', 'p-cgs')],
    );

    const out = migrateToCurrent(v10, 10);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathwayRoutines[0].instrumentId).toBe('i-guitar');

    // A database already at the current version passes through unchanged.
    expect(migrateToCurrent(out, SCHEMA_VERSION)).toEqual(out);
  });

  it('backfills only from a resolvable instrument and never invents one', () => {
    const v10 = v10DBWith(
      [setarInstrument],
      [
        fixturePathway('p-general', undefined), // General — no instrument at all
        fixturePathway('p-legacy-empty', ''), // legacy migrateToV3's `?? ''`
        fixturePathway('p-dangling', 'i-missing'), // resolves to nothing
        fixturePathway('p-real', 'i-setar'), // control: the resolvable case
      ],
      [
        fixtureRoutine('r-general', 'p-general'),
        fixtureRoutine('r-legacy-empty', 'p-legacy-empty'),
        fixtureRoutine('r-dangling', 'p-dangling'),
        fixtureRoutine('r-real', 'p-real'),
      ],
    );

    const out = migrateToCurrent(v10, 10);
    const byId = new Map(out.pathwayRoutines.map((r) => [r.id, r]));
    expect(byId.get('r-general')!.instrumentId).toBeUndefined();
    expect(byId.get('r-legacy-empty')!.instrumentId).toBeUndefined();
    expect(byId.get('r-dangling')!.instrumentId).toBeUndefined();
    expect(byId.get('r-real')!.instrumentId).toBe('i-setar');
  });
});

// ---------------------------------------------------------------------------
// ac-14 — C5: the one-time conversion of legacy lesson intent
// ---------------------------------------------------------------------------

// The fixture is read through Vite's `?raw` import rather than node:fs: the
// app's own tsconfig does not carry Node types, and the fixture has to be the
// SAME bytes the browser journeys import through the real UI.
const V11_FIXTURE = JSON.parse(v11FixtureText) as { data: PracticeDB };

type LegacyItem = { id: string; assignedForLesson?: boolean; teacherQuestion?: string };

function v11(): PracticeDB {
  return JSON.parse(JSON.stringify(V11_FIXTURE.data)) as PracticeDB;
}

describe('v11 → v12 · legacy lesson intent', () => {
  it('legacy lesson intent migrates unassigned exactly once without losing text', () => {
    const source = v11();
    const out = migrateToCurrent(v11(), 11);
    const agenda = out.lessonAgenda;
    const preparations = agenda.filter((e) => e.kind === 'preparation');
    const questions = agenda.filter((e) => e.kind === 'question');

    // 1. EVERY conversion is UNASSIGNED. The old data recorded no target, so
    //    none is invented — not from today's clock, not from the nearest
    //    class, not from a creation time.
    expect(agenda.every((e) => e.lessonId === undefined)).toBe(true);
    expect(agenda.every((e) => e.detachedFromLessonId === undefined)).toBe(true);

    // 2. EXACTLY ONE preparation per `assignedForLesson: true` item, and none
    //    for false or missing. (One entry the fixture already held is an
    //    UNRELATED question, so the comparison is per item, not a raw count.)
    const flaggedTrue = (source.items as unknown as LegacyItem[])
      .filter((i) => i.assignedForLesson === true)
      .map((i) => i.id)
      .sort();
    expect([...new Set(preparations.map((e) => e.itemId))].sort()).toEqual(flaggedTrue);
    for (const id of flaggedTrue) {
      expect(preparations.filter((e) => e.itemId === id), id).toHaveLength(1);
    }
    const notFlagged = (source.items as unknown as LegacyItem[])
      .filter((i) => i.assignedForLesson !== true)
      .map((i) => i.id);
    for (const id of notFlagged) {
      expect(preparations.some((e) => e.itemId === id), id).toBe(false);
    }

    // 3. EXACTLY ONE question per NON-EMPTY teacherQuestion, whatever the
    //    boolean said — the old "both fields" rule silently dropped questions
    //    on unflagged items. Whitespace-only text represents nothing.
    const withText = (source.items as unknown as LegacyItem[])
      .filter((i) => typeof i.teacherQuestion === 'string' && i.teacherQuestion.trim().length > 0)
      .map((i) => i.id)
      .sort();
    for (const id of withText) {
      const original = (source.items as unknown as LegacyItem[]).find((i) => i.id === id)!.teacherQuestion!;
      expect(questions.filter((q) => q.itemId === id && q.text === original), id).toHaveLength(1);
    }
    expect(questions.some((q) => q.itemId === 'i-q-empty')).toBe(false);
    expect(questions.some((q) => q.itemId === 'i-q-only')).toBe(true); // never flagged, still converted

    // 4. Multiline text stays ONE question — splitting on newlines would
    //    invent questions the owner never wrote.
    const farsi = questions.find((q) => q.itemId === 'i-q-farsi')!;
    expect(farsi.text.split('\n').length).toBeGreaterThan(2);

    // 5. NOTHING IS INVENTED: no asked state, no answer, no target — and the
    //    entry count grew by exactly what the legacy fields described.
    expect(questions.every((q) => q.askedAt === undefined && q.answer === undefined)).toBe(true);
    const preExisting = new Set(source.lessonAgenda.map((e) => e.id));
    const added = agenda.filter((e) => !preExisting.has(e.id));
    expect(added).toHaveLength(flaggedTrue.length + withText.length - 2); // i-premigrated's two already existed

    // 6. A PARTIALLY MIGRATED database converts nothing twice, and an id that
    //    an UNRELATED entry already owns gets a deterministic alternative
    //    rather than colliding.
    expect(agenda.filter((e) => e.itemId === 'i-premigrated')).toHaveLength(2);
    expect(agenda.find((e) => e.id === 'prep:i-collision')!.kind).toBe('question'); // the pre-existing one
    expect(agenda.find((e) => e.id === 'prep:i-collision~2')).toMatchObject({
      kind: 'preparation',
      itemId: 'i-collision',
    });

    // 6b. A generated id that already names a DIFFERENT question is not
    //     "already represented" just because the id/kind/itemId match — the
    //     content has to agree too. Both survive: the pre-existing question
    //     is untouched and the new one gets its own collision-safe id.
    const conflictExisting = agenda.find((e) => e.id === 'question:i-conflict');
    expect(conflictExisting).toMatchObject({ kind: 'question', itemId: 'i-conflict', text: 'different existing question' });
    const conflictNew = agenda.find((e) => e.id === 'question:i-conflict~2');
    expect(conflictNew).toMatchObject({ kind: 'question', itemId: 'i-conflict', text: 'new distinct question' });

    // 7. The legacy fields are gone only now their content is represented.
    for (const raw of out.items as unknown as LegacyItem[]) {
      expect('assignedForLesson' in raw, raw.id).toBe(false);
      expect('teacherQuestion' in raw, raw.id).toBe(false);
    }

    // 8. IDENTICAL on any day, and on repeated application.
    const differentDay = migrateToCurrent(v11(), 11);
    expect(JSON.stringify(differentDay)).toBe(JSON.stringify(out));
    const twice = migrateToCurrent(migrateToCurrent(v11(), 11), OLDEST_SCHEMA_VERSION);
    expect(JSON.stringify(twice)).toBe(JSON.stringify(out));

    // 9. Already-current EMPTY collections stay empty.
    const current: PracticeDB = { ...out, items: [], lessonAgenda: [] };
    expect(migrateToCurrent(current, SCHEMA_VERSION).lessonAgenda).toEqual([]);

    // 10. Unrelated data and SR state come through byte-equivalent.
    const strip = (db: PracticeDB) =>
      JSON.stringify({
        ...db,
        schemaVersion: 0,
        lessonAgenda: [],
        items: db.items.map((i) => {
          const copy = { ...i } as Record<string, unknown>;
          delete copy.assignedForLesson;
          delete copy.teacherQuestion;
          return copy;
        }),
      });
    expect(strip(out)).toBe(strip(source));
  });
});
