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
