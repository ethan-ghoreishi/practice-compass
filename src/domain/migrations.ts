import { seedPathways } from './pathwaySeed';
import { SCHEMA_VERSION, type AttachmentMeta, type PracticeDB } from './types';

// ---------------------------------------------------------------------------
// The one migration chain every inbound database runs, whatever door it came
// in (rehydration, manual import, sync pull, conflict-keep-remote, archive
// restore). Each migrateToVN is a pure PracticeDB → PracticeDB step;
// migrateToCurrent gates them on the version the data actually arrived at.
// ---------------------------------------------------------------------------

/**
 * The oldest schema version this app has ever shipped (the initial commit
 * shipped v2, with `curriculum` required and no `pathways` key; no
 * migrateToV2 has ever existed). A database with no schemaVersion at all is
 * assumed to be this old, so the whole chain runs over it.
 */
export const OLDEST_SCHEMA_VERSION = 2;

/**
 * v1/v2 → v3: seed editable pathways from the db's instruments; drop old
 * `curriculum`. Keyed on the PRESENCE of the `pathways` key, not its length —
 * a current-shaped database that legitimately has zero pathways must not be
 * reseeded, but a genuinely pre-v3 database (no `pathways` key at all) still
 * gets the legacy seed.
 */
function migrateToV3(db: PracticeDB): PracticeDB {
  if ('pathways' in (db as unknown as Record<string, unknown>)) return db;
  // db.instruments is a fixed part of the PracticeDB type, but this function
  // now also runs directly on raw, untrusted import data (not just already-
  // valid persisted state) — guard the one field it reads before validation.
  const instruments = db.instruments ?? [];
  const ids = {
    guitar: instruments.find((i) => /guitar/i.test(i.name))?.id ?? '',
    setar: instruments.find((i) => /setar/i.test(i.name) || i.name.includes('سه'))?.id ?? '',
    tar:
      instruments.find((i) => (/^tar$/i.test(i.name.trim()) || i.name.includes('تار')) && !/setar/i.test(i.name))?.id ?? '',
  };
  const seeded = seedPathways(ids);
  const next: PracticeDB & { curriculum?: unknown } = { ...db, ...seeded };
  delete next.curriculum;
  return next;
}

/** v3 → v4: introduce the attachments array. */
function migrateToV4(db: PracticeDB): PracticeDB {
  return { ...db, attachments: db.attachments ?? [] };
}

/**
 * v4 → v5: steps are gone — items live directly in stages. Place any item
 * that a step had linked into that step's stage, then drop the pathwaySteps
 * field.
 */
function migrateToV5(db: PracticeDB): PracticeDB {
  const legacy = (db as unknown as { pathwaySteps?: { itemId?: string; stageId?: string }[] }).pathwaySteps;
  let items = db.items;
  if (Array.isArray(legacy)) {
    const stageByItem = new Map<string, string>();
    for (const s of legacy) if (s.itemId && s.stageId) stageByItem.set(s.itemId, s.stageId);
    if (stageByItem.size) {
      items = db.items.map((i) => (stageByItem.has(i.id) ? { ...i, stageId: stageByItem.get(i.id) } : i));
    }
  }
  const next = { ...db, items, lessons: db.lessons ?? [], attachments: db.attachments ?? [] } as PracticeDB & {
    pathwaySteps?: unknown;
  };
  delete next.pathwaySteps;
  return next;
}

/**
 * v5 → v6: attachments can belong to an item OR a lesson. Old metadata carried
 * `itemId`; fold it into `ownerType: 'item'` + `ownerId` (lossless).
 */
function migrateToV6(db: PracticeDB): PracticeDB {
  const attachments = (db.attachments ?? []).map((a) => {
    const legacy = a as AttachmentMeta & { itemId?: string };
    if (!legacy.ownerId && legacy.itemId) {
      const { itemId, ...rest } = legacy;
      return { ...rest, ownerType: 'item' as const, ownerId: itemId };
    }
    return a;
  });
  return { ...db, attachments, lessons: db.lessons ?? [] };
}

// v7: lessons gained optional `recordings` (NAS references). Nothing to
// rewrite — the field is optional — but normalise it to an array so callers
// never guard against undefined.
function migrateToV7(db: PracticeDB): PracticeDB {
  return { ...db, lessons: (db.lessons ?? []).map((l) => ({ ...l, recordings: l.recordings ?? [] })) };
}

// v8: lessons gained an optional `number`. Existing lessons stay unnumbered
// (undefined) — nothing to backfill.
function migrateToV8(db: PracticeDB): PracticeDB {
  return db;
}

// v9: lesson recordings gained a `kind`. Every existing reference was a class
// video, so stamp the missing kind explicitly.
function migrateToV9(db: PracticeDB): PracticeDB {
  return {
    ...db,
    lessons: (db.lessons ?? []).map((l) => ({
      ...l,
      recordings: (l.recordings ?? []).map((r) => ({ ...r, kind: r.kind ?? ('video' as const) })),
    })),
  };
}

// v10: the DB gained optional scheduling `settings`. Existing DBs leave it
// undefined (⇒ DEFAULT_SCHEDULING_PARAMS); nothing to backfill.
function migrateToV10(db: PracticeDB): PracticeDB {
  return db;
}

/**
 * v10 → v11: routines gained an optional `instrumentId`, and `pathwayId` /
 * `stageId` became placement rather than identity. Backfill a routine's
 * instrument from the pathway it belonged to — but ONLY when that pathway
 * names an instrument that actually resolves in `db.instruments`. A General
 * (no-instrument) pathway, a legacy empty-string id (migrateToV3's `?? ''`),
 * or a dangling reference all leave the routine unscoped rather than
 * fabricating an instrument for it. A routine that already has an
 * instrumentId (already-current data) is never overwritten, which is also
 * what keeps this idempotent.
 */
function migrateToV11(db: PracticeDB): PracticeDB {
  const instrumentIds = new Set((db.instruments ?? []).map((i) => i.id));
  return {
    ...db,
    pathwayRoutines: (db.pathwayRoutines ?? []).map((r) => {
      if (r.instrumentId !== undefined) return r;
      const pathway = r.pathwayId ? (db.pathways ?? []).find((p) => p.id === r.pathwayId) : undefined;
      const resolved = pathway?.instrumentId && instrumentIds.has(pathway.instrumentId) ? pathway.instrumentId : undefined;
      return resolved ? { ...r, instrumentId: resolved } : r;
    }),
  };
}

/**
 * Bring a database of any known version fully to the current schema. Must
 * run BEFORE normalisation to the current shape — legacy fields the chain
 * reads (`pathwaySteps`, an attachment's `itemId`) would otherwise already be
 * gone. Idempotent: re-running it over its own output (or over already-current
 * data with `fromVersion` held at the oldest) changes nothing further.
 */
export function migrateToCurrent(db: PracticeDB, fromVersion: number): PracticeDB {
  let next = db;
  if (fromVersion < 3) next = migrateToV3(next);
  if (fromVersion < 4) next = migrateToV4(next);
  if (fromVersion < 5) next = migrateToV5(next);
  if (fromVersion < 6) next = migrateToV6(next);
  if (fromVersion < 7) next = migrateToV7(next);
  if (fromVersion < 8) next = migrateToV8(next);
  if (fromVersion < 9) next = migrateToV9(next);
  if (fromVersion < 10) next = migrateToV10(next);
  if (fromVersion < 11) next = migrateToV11(next);
  return { ...next, schemaVersion: SCHEMA_VERSION };
}
