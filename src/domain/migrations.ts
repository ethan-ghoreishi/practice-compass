import { seedPathways } from './pathwaySeed';
import { retirePracticeText } from './practiceInformation';
import {
  SCHEMA_VERSION,
  type AttachmentMeta,
  type LessonAgendaEntry,
  type PracticeDB,
  type PracticeItem,
} from './types';

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
 * v11 → v12: the item's rolling `assignedForLesson` boolean and its single
 * mutable `teacherQuestion` string become entries in the one `lessonAgenda`
 * collection.
 *
 * Every conversion is UNASSIGNED. The old data recorded WHICH class it was for
 * nowhere at all — the boolean only ever meant "the next one", whenever that
 * happened to be — so naming a lesson here would be a guess. Deriving one from
 * today's clock would also make the same database migrate differently on two
 * devices run on different days, which is exactly what C5 forbids: this step
 * reads no clock, and its timestamps come from the ITEM's own, so the result is
 * byte-identical whenever and wherever it runs.
 *
 * A question converts whatever the boolean said: the two were always
 * independent facts, and requiring both is how the old "questions for next
 * class" list silently dropped questions on unflagged items.
 *
 * Multiline text stays ONE question. A teacher question typed as three lines in
 * one box is one thing the owner meant to ask, and splitting on newlines would
 * invent questions they never wrote.
 *
 * Idempotent by construction: the conversion is driven by the legacy fields,
 * which this step then removes, and it never creates an entry whose id already
 * describes the same thing. An already-current database — including one whose
 * agenda is legitimately EMPTY — comes through unchanged.
 *
 * This step runs on EVERY inbound database, not only one that declares itself
 * pre-v12: a database claiming the current schema can still carry a stray
 * `assignedForLesson`/`teacherQuestion` left behind by an interrupted write, a
 * hand-edited file, or a bug in an earlier build — an INCOMPLETE current-schema
 * conversion, not a genuine v11 input. Gating this on the declared version
 * would accept that leftover silently, with the intent it recorded gone
 * nowhere. Running it unconditionally is safe because it is a no-op wherever
 * neither legacy field is present.
 */
function migrateToV12(db: PracticeDB): PracticeDB {
  type LegacyItem = PracticeItem & { assignedForLesson?: boolean; teacherQuestion?: string };
  const existing: LegacyAgenda[] = ((db.lessonAgenda ?? []) as LegacyAgenda[]).slice();
  const takenIds = new Set(existing.map((e) => e?.id).filter((id): id is string => typeof id === 'string'));

  // "Represented" means an entry with this id/kind/itemId already says the
  // SAME thing the legacy field says — not merely that one exists. A
  // preparation carries no content beyond the link itself, so any matching
  // entry represents it; a question's content IS its text, so an entry that
  // merely shares the generated id but holds DIFFERENT text is not a
  // duplicate of this question — it is a distinct one that happens to want
  // the same id, and `freeId` gives it a collision-safe alternative exactly
  // as it would for an unrelated entry. Treating a same-id/different-text
  // match as "already represented" would silently discard the new question's
  // own text — the exact incomplete-migration defect this function exists to
  // prevent.
  const represented = (base: string, kind: 'preparation' | 'question', itemId: string, text?: string): boolean =>
    existing.some(
      (e) =>
        e?.id === base &&
        e?.kind === kind &&
        e?.itemId === itemId &&
        (kind !== 'question' || (e as { text?: unknown }).text === text),
    );

  // A deterministic id that cannot collide with an UNRELATED entry that
  // happens to already own the obvious one. Same input, same output, always.
  const freeId = (base: string): string => {
    if (!takenIds.has(base)) return base;
    for (let n = 2; ; n++) {
      const candidate = `${base}~${n}`;
      if (!takenIds.has(candidate)) return candidate;
    }
  };

  const added: LessonAgendaEntry[] = [];
  const items = (db.items ?? []).map((raw) => {
    const item = raw as LegacyItem;
    const { assignedForLesson, teacherQuestion, ...rest } = item;
    if (assignedForLesson === undefined && teacherQuestion === undefined) return raw;

    // The entry's own timestamps come from the item it was extracted from:
    // data, never a clock.
    const at = item.updatedAt ?? item.createdAt ?? '';

    if (assignedForLesson === true) {
      const base = `prep:${item.id}`;
      if (!represented(base, 'preparation', item.id)) {
        const id = freeId(base);
        takenIds.add(id);
        added.push({
          id,
          kind: 'preparation',
          itemId: item.id,
          instrumentId: item.instrumentId,
          createdAt: at,
          updatedAt: at,
        });
      }
    }
    if (typeof teacherQuestion === 'string' && teacherQuestion.trim().length > 0) {
      const base = `question:${item.id}`;
      if (!represented(base, 'question', item.id, teacherQuestion)) {
        const id = freeId(base);
        takenIds.add(id);
        added.push({
          id,
          kind: 'question',
          // Verbatim: not trimmed, not split, not re-wrapped.
          text: teacherQuestion,
          itemId: item.id,
          instrumentId: item.instrumentId,
          createdAt: at,
          updatedAt: at,
        });
      }
    }
    // The legacy fields go only now that their content is represented.
    return rest as PracticeItem;
  });

  return { ...db, items, lessonAgenda: [...(existing as LessonAgendaEntry[]), ...added] };
}

/** The agenda as it may arrive: possibly absent, possibly partially migrated. */
type LegacyAgenda = { id?: string; kind?: string; itemId?: string } | undefined;

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
  // Unconditional, not gated on `fromVersion < 12`: see migrateToV12's own
  // docstring for why an already-current-declared database still needs this
  // pass over it.
  next = migrateToV12(next);
  // v12 → v13: retire the practice-text fields that competed with the four
  // canonical homes (`retirePracticeText`'s own docstring says which, and why
  // this too is unconditional rather than gated on `fromVersion < 13`).
  next = retirePracticeText(next);
  return { ...next, schemaVersion: SCHEMA_VERSION };
}
