import { describe, expect, it } from 'vitest';
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
