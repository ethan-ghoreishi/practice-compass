import type { ID, Instrument, Material, MaterialSourceType, PracticeDB } from './types';
import type { CourseData } from './courseSeed';
import { MATERIAL_SOURCE_LABELS } from './labels';
import { normalizePersian } from './farsi';

// ---------------------------------------------------------------------------
// A STUDY SOURCE is the named book, collection or radif edition, course, or
// teaching material a piece is studied FROM. It is not a person (Composer /
// maestro classifies the work), not a practice item, not a pathway (that is
// organisation) and not a dated lesson (lessons link separately).
//
// The record stays `Material` / `materialId` — no rename migration. New
// sources are offered five clear kinds; the seven older kinds a source may
// already carry stay stored and selectable ON THAT SOURCE, never coerced into
// a guessed new meaning.
// ---------------------------------------------------------------------------

/** The kinds offered for a NEW source, with an example of each. */
export const NEW_SOURCE_KINDS: { kind: MaterialSourceType; example: string }[] = [
  { kind: 'radif', example: 'a radif edition, e.g. ردیف میرزا عبدالله' },
  { kind: 'method_book', example: 'a method book, e.g. Honarestān Book 1' },
  { kind: 'repertoire', example: 'a collection of pieces, e.g. a songbook' },
  { kind: 'course', example: 'a course, e.g. Classical Guitar Shed' },
  { kind: 'other', example: 'a teacher handout or other material' },
];

const NEW_KINDS = new Set(NEW_SOURCE_KINDS.map((k) => k.kind));

/** True for a kind kept only because an existing source already has it. */
export function isLegacySourceKind(kind: MaterialSourceType): boolean {
  return !NEW_KINDS.has(kind);
}

/**
 * The kind choices for one editor: the five current kinds, plus — only when
 * the source being edited already carries one — its own older kind, labelled
 * as such so saving without touching it keeps it exactly.
 */
export function sourceKindOptions(current?: MaterialSourceType): { value: MaterialSourceType; label: string }[] {
  const options = NEW_SOURCE_KINDS.map(({ kind }) => ({ value: kind, label: MATERIAL_SOURCE_LABELS[kind] }));
  if (current && isLegacySourceKind(current)) {
    options.push({ value: current, label: `${MATERIAL_SOURCE_LABELS[current]} (older kind)` });
  }
  return options;
}

/**
 * The instrument a new source starts on: the one being browsed or practised,
 * when it still exists, else the first. Never a required choice.
 */
export function defaultSourceInstrument(preferred: ID | null | undefined, instruments: Pick<Instrument, 'id'>[]): ID {
  return (preferred && instruments.some((i) => i.id === preferred) ? preferred : instruments[0]?.id) ?? '';
}

// --- the one bounded provenance key: a shipped course's own source ------------

export function courseSourceKey(course: Pick<CourseData, 'id'>): string {
  return `course:${course.id}`;
}

const sameTitle = (a: string, b: string) => normalizePersian(a).toLowerCase() === normalizePersian(b).toLowerCase();

/**
 * PROOF that an unkeyed source is the one a course minted: the course's own
 * source title AND kind, exactly as the app has always created it. A renamed or
 * re-kinded source proves nothing and is left alone — a title alone is never
 * merge authority.
 */
export function isProvenCourseSource(m: Material, course: Pick<CourseData, 'sourceName'>): boolean {
  return m.sourceKey === undefined && m.sourceType === 'course' && sameTitle(m.title, course.sourceName);
}

export type CourseSourceLookup =
  | { status: 'keyed'; material: Material }
  | { status: 'proven'; material: Material }
  | { status: 'ambiguous'; candidates: Material[] }
  | { status: 'none' };

/**
 * Which of this instrument's sources IS the course: the one carrying its key
 * (a rename changes nothing), else the ONE unkeyed source proven to be it.
 * Anything short of that proof — two proven candidates, or a source that only
 * shares the course's title — is a question for the owner: never a first
 * match, and never a silently minted second copy beside it.
 */
export function findCourseSource(materials: Material[], course: Pick<CourseData, 'id' | 'sourceName'>, instrumentId: ID): CourseSourceLookup {
  const key = courseSourceKey(course);
  const own = materials.filter((m) => m.instrumentId === instrumentId);
  const keyed = own.find((m) => m.sourceKey === key);
  if (keyed) return { status: 'keyed', material: keyed };
  const proven = own.filter((m) => isProvenCourseSource(m, course));
  if (proven.length === 1) return { status: 'proven', material: proven[0] };
  const titled = own.filter((m) => m.sourceKey === undefined && sameTitle(m.title, course.sourceName));
  if (titled.length) return { status: 'ambiguous', candidates: titled };
  return { status: 'none' };
}

/** Stamp the course's key on one source the owner (or proof) chose. */
export function withCourseSourceKey(materials: Material[], materialId: ID, course: Pick<CourseData, 'id'>): Material[] {
  const key = courseSourceKey(course);
  return materials.map((m) => (m.id === materialId && m.sourceKey !== key ? { ...m, sourceKey: key } : m));
}

/**
 * The v15 backfill: key every UNIQUELY proven course source, per instrument,
 * and nothing else. Deterministic and idempotent — the same materials always
 * give the same answer, whatever order they arrive in, and an instrument with
 * two candidates is left for the owner to choose when it matters.
 */
export function backfillCourseSourceKeys(materials: Material[], courses: Pick<CourseData, 'id' | 'sourceName'>[]): Material[] {
  let next = materials;
  const instruments = [...new Set(materials.map((m) => m.instrumentId))];
  for (const course of courses) {
    for (const instrumentId of instruments) {
      const found = findCourseSource(next, course, instrumentId);
      if (found.status === 'proven') next = withCourseSourceKey(next, found.material.id, course);
    }
  }
  return next;
}

/** Inbound validation of the one field this lane adds to a source. */
export function validateStudySources(db: Pick<PracticeDB, 'materials'>, courses: Pick<CourseData, 'id'>[]): string | null {
  const known = new Set(courses.map(courseSourceKey));
  const taken = new Set<string>();
  for (const m of db.materials) {
    const key = (m as { sourceKey?: unknown }).sourceKey;
    if (key === undefined) continue;
    if (typeof key !== 'string' || !known.has(key)) return `Study source "${m.id}" carries an unknown course key.`;
    const slot = `${m.instrumentId}\u0000${key}`;
    if (taken.has(slot)) return `Two study sources on one instrument both claim to be "${key}".`;
    taken.add(slot);
  }
  return null;
}
