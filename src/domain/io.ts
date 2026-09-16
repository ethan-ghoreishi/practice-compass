import type { ExportFile, PracticeDB } from './types';
import { SCHEMA_VERSION } from './types';
import { nowISO } from './util';
import { migrateToCurrent, OLDEST_SCHEMA_VERSION } from './migrations';
import { validateLessonAgenda } from './lessonAgenda';
import { validateSchedulingFields } from './scheduling';
import { validatePracticeText } from './practiceInformation';

// ---------------------------------------------------------------------------
// JSON export / import. Export wraps the full DB with app + schema metadata.
// Import validates shape "enough to avoid crashing" and accepts either a
// wrapped ExportFile or a bare DB object.
// ---------------------------------------------------------------------------

export function buildExport(db: PracticeDB, now: Date = new Date()): ExportFile {
  return {
    app: 'practice-compass',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(now),
    data: db,
  };
}

export function serializeExport(db: PracticeDB, now: Date = new Date()): string {
  return JSON.stringify(buildExport(db, now), null, 2);
}

const ARRAY_KEYS = [
  'instruments',
  'materials',
  'items',
  'blocks',
  'reviews',
  'pathways',
  'pathwayStages',
  'pathwayRoutines',
  'attachments',
  'lessons',
  'lessonAgenda',
] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Thrown only for a schema newer than this build supports — never for
 * invalid/corrupt current-version data. Lets a caller (the hydration
 * boundary, in particular) tell "update the app" apart from "this data is
 * broken" without parsing the message text.
 */
export class SchemaTooNewError extends Error {}

/**
 * Validate and normalise an unknown object into a PracticeDB. Throws with a
 * human-readable message when the shape is unusable.
 *
 * Migration runs BEFORE normalisation, on the source shape: a fixed-allowlist
 * rebuild would drop legacy fields (`pathwaySteps`, an attachment's `itemId`)
 * before the migration chain ever got to read them. A missing schemaVersion
 * is assumed to be the oldest this app ever shipped, so the whole chain runs;
 * a schemaVersion newer than this build supports is rejected rather than
 * silently downgraded and stripped of whatever fields it added.
 */
export function validateDB(input: unknown): PracticeDB {
  if (!isRecord(input)) throw new Error('File is not a valid object.');

  // Accept a wrapped ExportFile or a bare DB.
  const raw: Record<string, unknown> = isRecord(input.data) ? (input.data as Record<string, unknown>) : input;

  for (const key of ARRAY_KEYS) {
    if (raw[key] !== undefined && !Array.isArray(raw[key])) {
      throw new Error(`Field "${key}" must be a list.`);
    }
  }

  const fromVersion = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : OLDEST_SCHEMA_VERSION;
  if (fromVersion > SCHEMA_VERSION) {
    throw new SchemaTooNewError(
      `This file is from a newer version of Practice Compass (schema ${fromVersion}) than this device supports (schema ${SCHEMA_VERSION}). Update the app before importing it.`,
    );
  }

  const migrated = migrateToCurrent(raw as unknown as PracticeDB, fromVersion);

  const db: PracticeDB = {
    schemaVersion: migrated.schemaVersion,
    instruments: migrated.instruments ?? [],
    materials: migrated.materials ?? [],
    items: migrated.items ?? [],
    blocks: migrated.blocks ?? [],
    reviews: migrated.reviews ?? [],
    pathways: migrated.pathways ?? [],
    pathwayStages: migrated.pathwayStages ?? [],
    pathwayRoutines: migrated.pathwayRoutines ?? [],
    attachments: migrated.attachments ?? [],
    lessons: migrated.lessons ?? [],
    lessonAgenda: migrated.lessonAgenda ?? [],
    // Optional scheduling knobs — a top-level object, not an array. Carry it
    // through so a user's adjusted params survive export/import round-trips.
    ...(isRecord(migrated.settings) ? { settings: migrated.settings as unknown as PracticeDB['settings'] } : {}),
  };

  // Minimal per-entity sanity: every record needs an id.
  for (const key of ARRAY_KEYS) {
    const list = db[key] as { id?: unknown }[];
    if (list.some((row) => !isRecord(row) || typeof row.id !== 'string')) {
      throw new Error(`Some entries in "${key}" are missing an id.`);
    }
  }

  // The v12 model, checked BEFORE anything installs this database (§C7). This
  // is deliberately bounded to the lesson agenda and the scheduling fields it
  // shares a schema version with — the decision loop's own inputs and
  // outcomes — and is NOT a general repair of legacy malformed records.
  // Invalid intent is REJECTED with actionable detail, never silently filtered
  // away: dropping an entry the owner wrote is the data loss this guards.
  const agendaProblem = validateLessonAgenda(db);
  if (agendaProblem) throw new Error(agendaProblem);
  const schedulingProblem = validateSchedulingFields(db);
  if (schedulingProblem) throw new Error(schedulingProblem);
  // The practice text that SURVIVES the v13 retirement — the item's notebook
  // and a block's own observation/next action/constraint. Checked AFTER the
  // migration chain has already removed the retired keys, so a malformed
  // retired field can never be mistaken for a malformed canonical one.
  const textProblem = validatePracticeText(db);
  if (textProblem) throw new Error(textProblem);

  return db;
}

export type ImportResult =
  | { ok: true; db: PracticeDB }
  | { ok: false; error: string };

export function parseImport(rawText: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  try {
    return { ok: true, db: validateDB(parsed) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unrecognised file shape.' };
  }
}
