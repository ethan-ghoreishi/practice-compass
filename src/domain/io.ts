import type { CurriculumProgress, ExportFile, PracticeDB } from './types';
import { emptyCurriculumProgress, SCHEMA_VERSION } from './types';
import { nowISO } from './util';

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

const ARRAY_KEYS = ['instruments', 'materials', 'items', 'blocks', 'reviews'] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Validate and normalise an unknown object into a PracticeDB. Throws with a
 * human-readable message when the shape is unusable.
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

  const curriculum = isRecord(raw.curriculum)
    ? {
        stepStatus: (raw.curriculum as Record<string, unknown>).stepStatus ?? {},
        stepItemId: (raw.curriculum as Record<string, unknown>).stepItemId ?? {},
        customSteps: Array.isArray((raw.curriculum as Record<string, unknown>).customSteps)
          ? (raw.curriculum as Record<string, unknown>).customSteps
          : [],
      }
    : emptyCurriculumProgress();

  const db: PracticeDB = {
    schemaVersion: typeof raw.schemaVersion === 'number' ? (raw.schemaVersion as number) : SCHEMA_VERSION,
    instruments: (raw.instruments as PracticeDB['instruments']) ?? [],
    materials: (raw.materials as PracticeDB['materials']) ?? [],
    items: (raw.items as PracticeDB['items']) ?? [],
    blocks: (raw.blocks as PracticeDB['blocks']) ?? [],
    reviews: (raw.reviews as PracticeDB['reviews']) ?? [],
    curriculum: curriculum as CurriculumProgress,
  };

  // Minimal per-entity sanity: every record needs an id.
  for (const key of ARRAY_KEYS) {
    const list = db[key] as { id?: unknown }[];
    if (list.some((row) => !isRecord(row) || typeof row.id !== 'string')) {
      throw new Error(`Some entries in "${key}" are missing an id.`);
    }
  }

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
