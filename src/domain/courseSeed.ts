import { createItem, createMaterial, itemFromCatalogEntry } from './factories';
import { CGS_CHECKLISTS, CGS_COURSE } from './courseData';
import type {
  CatalogEntry,
  ID,
  Material,
  PathwayRoutine,
  PathwayStage,
  PracticeItem,
  RoutineSegment,
  StepKind,
  StepStrand,
} from './types';
import { newId, nowISO } from './util';

// ---------------------------------------------------------------------------
// A COURSE the owner already owns, read as reference data in code.
//
// `courseData.ts` is the SCANNER'S OUTPUT (`scripts/scan-cgs-course.mjs`) and
// is never edited by hand; this module is the hand-written reader that turns it
// into the things the app already understands — stage seeds, catalogue entries,
// composed material and ordinary editable routines. Nothing here is persisted:
// no schema change, no migration, no new inbound door. That is what makes
// re-running the scanner after a course change reach every item that already
// exists — course material is DERIVED from the catalogue, never copied onto an
// item.
//
// It is deliberately NOT the Setar archive machinery. That source grows, gets
// renamed and carries piece identity to reconcile against existing repertoire,
// which is why it needs a published index, a digest and a reconciler. A
// downloaded course has none of that: it is a fixed tree whose own `notes.md`
// and `LEVEL_GUIDE.md` already state everything, so it belongs on the rung
// `pathwaySeed.ts` already stands on.
//
// The data is shaped as ordered GROUPS of UNITS, not as "levels", and how many
// there are is data. Buying Levels 4A-5F later is therefore: re-run the
// scanner, ship the regenerated data, and use the course-scoped "Add new levels
// from this course" action — never a migration.
// ---------------------------------------------------------------------------

export type CourseFileKind = 'video' | 'pdf' | 'image' | 'audio' | 'doc' | 'folder';

export interface CourseFile {
  /** Path relative to the shared MEDIA ROOT, never to the archive base. */
  path: string;
  kind: CourseFileKind;
  title: string;
}

export interface CourseUnit {
  /** Catalogue key. STABLE: keys are added, never renamed. */
  key: string;
  title: string;
  strand: StepStrand;
  mediaPath: string;
  files: CourseFile[];
  guidance?: string;
  /** Index into the course's deduplicated per-strand practice checklists. */
  checklistKey?: string;
  /** Watch once — not daily practice, and never in a routine. */
  reference?: boolean;
  routineMinutes?: number;
  essential?: boolean;
  bpm?: number;
}

/**
 * A named work from the level's practice packet — a real piece with a real
 * composer, the only thing besides the level's own study that may reach My
 * repertoire.
 *
 * The key is derived from the WORK, not from the level, so a work carried
 * forward across levels (Ferrer Ejercicio runs 2C-2F) is ONE entry the owner
 * adds once.
 */
export interface CourseWork {
  key: string;
  title: string;
  file?: string;
}

export interface CourseRoutineSegment {
  /** The unit this segment is FOR — its own declared catalogue key. */
  unitKey: string;
  label: string;
  minutes: number;
  essential?: boolean;
}

export interface CourseGroup {
  key: string;
  code: string;
  title: string;
  group: string;
  mediaPath: string;
  units: CourseUnit[];
  works: CourseWork[];
  routine: CourseRoutineSegment[];
}

export interface CourseData {
  id: string;
  /** The pathway this course's stages belong to. */
  pathwayId: string;
  name: string;
  /** The study source every item created from this course is grouped under. */
  sourceName: string;
  /** The course's own folder beneath the shared media root. */
  mediaPath: string;
  /** What the scanner could not read — reported, never silently dropped. */
  diagnostics: string[];
  groups: CourseGroup[];
}

/** Every course the app ships data for. A second course is a second entry. */
export const COURSES: CourseData[] = [CGS_COURSE];

/** Stage ids are deterministic and byte-identical to `stageIdFor(pathwayId, code)`. */
export function courseStageId(course: CourseData, groupKey: string): string {
  return `${course.pathwayId}-${groupKey}`;
}

export function courseById(id: string): CourseData | undefined {
  return COURSES.find((c) => c.id === id);
}

export function courseForPathway(pathwayId: string): CourseData | undefined {
  return COURSES.find((c) => c.pathwayId === pathwayId);
}

function groupForStage(course: CourseData, stageId: string): CourseGroup | undefined {
  return course.groups.find((g) => courseStageId(course, g.key) === stageId);
}

/** The course, group and stage a stage id names — or nothing, for a stage no course owns. */
export function courseStage(stageId: string): { course: CourseData; group: CourseGroup } | undefined {
  for (const course of COURSES) {
    const group = groupForStage(course, stageId);
    if (group) return { course, group };
  }
  return undefined;
}

// --- stage seeds -------------------------------------------------------------

/** The shape `pathwaySeed.ts` expands into stages and catalogue entries. */
export interface CourseStepSeed {
  key: string;
  title: string;
  strand: StepStrand;
  kind?: StepKind;
  notes?: string;
  about?: string;
  bpm?: number;
}

export interface CourseStageSeed {
  slug: string;
  code: string;
  title: string;
  group: string;
  intro?: string;
  steps: CourseStepSeed[];
}

/** The level's own practice guidance plus the course's checklist for its strand. */
function unitNotes(unit: CourseUnit): string | undefined {
  const checklist = unit.checklistKey ? CGS_CHECKLISTS[unit.checklistKey] : undefined;
  const parts = [
    unit.guidance?.trim(),
    unit.bpm ? `Syllabus target: ${unit.bpm} bpm.` : undefined,
    checklist ? `Each session:\n${checklist}` : undefined,
  ].filter(Boolean);
  return parts.length ? parts.join('\n\n') : undefined;
}

const WORK_NOTE = (code: string) =>
  `Optional repertoire from the Level ${code} practice packet. Learn it when it appeals — nothing here is a deadline.`;

/**
 * One stage seed per course group, its real sections followed by the level's
 * named packet works.
 *
 * `skipCodes` is how a level whose steps are HAND-AUTHORED keeps them: Level 1A
 * was written out from the syllabus before this scanner existed, and the
 * contract keeps it byte-for-byte.
 */
export function courseStageSeeds(course: CourseData, skipCodes: string[] = []): CourseStageSeed[] {
  const skip = new Set(skipCodes.map((c) => c.toLowerCase()));
  return course.groups
    .filter((g) => !skip.has(g.key))
    .map((g) => ({
      slug: g.key,
      code: g.code,
      title: g.title,
      group: g.group,
      intro: g.units.find((u) => u.key === 'welcome')?.guidance?.split('\n').find((l) => l.trim())?.trim(),
      steps: [
        ...g.units.map((u) => ({
          key: u.key,
          title: u.title,
          strand: u.strand,
          kind: u.strand === 'piece' ? ('piece' as StepKind) : undefined,
          notes: unitNotes(u),
          bpm: u.bpm,
        })),
        // The packet works. `strand: 'piece'` is what makes them — and ONLY
        // them and the level's own study section — repertoire works.
        ...g.works.map((w) => ({
          key: w.key,
          title: w.title,
          strand: 'piece' as StepStrand,
          kind: 'piece' as StepKind,
          notes: WORK_NOTE(g.code),
        })),
      ],
    }));
}

// --- composed material -------------------------------------------------------

/**
 * The course files that belong to one catalogue entry — its section's videos,
 * scores, images and contrast-card folder, or a packet work's own score.
 *
 * COMPOSED, NEVER STORED. The item holds nothing but the stage and the
 * catalogue key it was created from; the files come from the course data every
 * time they are read, so regenerating that data reaches every item that already
 * exists and the owner never types a link.
 */
export function courseFilesFor(stageId: string, catalogKey: string): CourseFile[] {
  const found = courseStage(stageId);
  if (!found) return [];
  const unit = found.group.units.find((u) => u.key === catalogKey);
  if (unit) return unit.files;
  const work = found.group.works.find((w) => w.key === catalogKey);
  return work?.file ? [{ path: work.file, kind: 'pdf', title: work.title }] : [];
}

// --- routines ----------------------------------------------------------------

/** A course segment bound to the item the owner created from its unit, if any. */
function toSegment(
  seg: CourseRoutineSegment,
  stageId: string,
  itemsByKey: Map<string, PracticeItem>,
): RoutineSegment {
  const item = itemsByKey.get(`${stageId}\u0000${seg.unitKey}`);
  return {
    label: seg.label,
    minutes: seg.minutes,
    ...(seg.essential ? { essential: true } : {}),
    ...(item ? { itemId: item.id } : {}),
  };
}

/**
 * A SEGMENT IS JOINED TO ITS ITEM BY STAGE AND CATALOGUE KEY TOGETHER.
 * `CatalogEntry.key` is unique per stage, not globally — `chords` exists in
 * every level — and a position routine spans two stages by construction, so a
 * key-only lookup would silently bind the wrong level's item.
 */
function itemsByStageAndKey(items: PracticeItem[]): Map<string, PracticeItem> {
  const out = new Map<string, PracticeItem>();
  for (const i of items) {
    if (i.stageId && i.catalogKey) out.set(`${i.stageId}\u0000${i.catalogKey}`, i);
  }
  return out;
}

/** The level's own routine, exactly as its syllabus states it. */
export function buildLevelRoutine(
  course: CourseData,
  groupKey: string,
  items: PracticeItem[],
): RoutineSegment[] {
  const group = course.groups.find((g) => g.key === groupKey);
  if (!group) return [];
  const stageId = courseStageId(course, groupKey);
  const byKey = itemsByStageAndKey(items);
  return group.routine.map((s) => toSegment(s, stageId, byKey));
}

/**
 * "Build one for where I am" — the PREVIOUS level's essential segments (the
 * maintenance the syllabus itself says carries forward) followed by only the
 * segments of the current level whose catalogue item the owner has ACTUALLY
 * ADDED.
 *
 * The catalogue-to-item flow is the position marker; no new stored concept is
 * needed and none is introduced. A segment is matched by its OWN declared
 * catalogue key, never by how many items the stage now holds — so adding one of
 * the level's optional repertoire works enables nothing, and an item the owner
 * created by hand with no catalogue key is not one of the course's sections.
 *
 * The result is ORDINARY EDITABLE DATA: a segment the marker leaves out is one
 * edit away from being added back.
 */
export function buildPositionRoutine(
  course: CourseData,
  groupKey: string,
  items: PracticeItem[],
): RoutineSegment[] {
  const index = course.groups.findIndex((g) => g.key === groupKey);
  if (index < 0) return [];
  const byKey = itemsByStageAndKey(items);
  const out: RoutineSegment[] = [];

  const previous = course.groups[index - 1];
  if (previous) {
    const prevStageId = courseStageId(course, previous.key);
    for (const s of previous.routine) {
      if (s.essential) out.push(toSegment(s, prevStageId, byKey));
    }
  }

  const stageId = courseStageId(course, groupKey);
  for (const s of course.groups[index].routine) {
    if (byKey.has(`${stageId}\u0000${s.unitKey}`)) out.push(toSegment(s, stageId, byKey));
  }
  return out;
}

export function courseRoutineName(group: CourseGroup, kind: 'level' | 'position'): string {
  return kind === 'level'
    ? `${group.code} · the course routine`
    : `${group.code} · where I am`;
}

/** A whole, ordinary editable routine placed in the course's own stage. */
export function courseRoutine(
  course: CourseData,
  group: CourseGroup,
  segments: RoutineSegment[],
  instrumentId: ID | undefined,
  order: number,
  kind: 'level' | 'position',
  now: Date,
): PathwayRoutine {
  const ts = nowISO(now);
  return {
    id: newId(),
    pathwayId: course.pathwayId,
    stageId: courseStageId(course, group.key),
    instrumentId,
    name: courseRoutineName(group, kind),
    segments,
    order,
    createdAt: ts,
    updatedAt: ts,
  };
}

// --- the study source --------------------------------------------------------

export interface CourseSourceResolution {
  /** The materials collection to install — the SAME array when none was minted. */
  materials: Material[];
  materialId: ID;
}

/**
 * The course's own study source, FOUND OR CREATED — never a duplicate.
 *
 * A second item created from the same course must group under the same "Classical
 * Guitar Shed" source in My repertoire, so this returns the existing Material
 * whenever one already matches (same instrument, same title) and mints one only
 * when none does. The caller installs `materials` in the SAME `set()` as the
 * item, so the two can never be applied apart.
 */
export function resolveCourseSource(
  materials: Material[],
  course: CourseData,
  instrumentId: ID,
  now: Date,
): CourseSourceResolution {
  const title = course.sourceName.trim().toLowerCase();
  const existing = materials.find(
    (m) => m.instrumentId === instrumentId && m.title.trim().toLowerCase() === title,
  );
  if (existing) return { materials, materialId: existing.id };
  const mat = createMaterial(
    { instrumentId, title: course.sourceName, sourceType: 'course', sourceName: course.name },
    now,
  );
  return { materials: [...materials, mat], materialId: mat.id };
}

// --- adding a catalogue entry ------------------------------------------------

export interface CatalogAddition {
  items: PracticeItem[];
  materials: Material[];
  itemId: ID;
}

interface CatalogAdditionDB {
  items: PracticeItem[];
  materials: Material[];
}

/**
 * Everything adding one catalogue suggestion changes, as ONE value the store
 * applies in a single `set()`. The Node test environment cannot import the
 * store (it pulls in Dexie through `./idb`), so the DECISION is proved here and
 * the SHAPE is what protects the wiring — the same reason `installDatabase`
 * returns its ephemeral resets alongside the database.
 *
 * Two course rules ride on top of what adding a suggestion has always done:
 *
 *  • A WORK CARRIED FORWARD ACROSS LEVELS IS ONE WORK. Adding Ferrer Ejercicio
 *    from 2E reuses the item created from 2C rather than putting a second copy
 *    in My repertoire. This lookup is deliberately CROSS-STAGE and deliberately
 *    restricted to course works, whose keys are derived from the work itself;
 *    the ordinary per-stage reuse below is unchanged, so a `chords` item in 1B
 *    can never be reused by 2B's `chords`.
 *  • A COURSE ITEM IS GROUPED UNDER THE COURSE'S OWN STUDY SOURCE, found or
 *    created on first use.
 */
export function planCatalogAddition(
  db: CatalogAdditionDB,
  stageId: ID,
  entryKey: string,
  entry: CatalogEntry | undefined,
  instrumentId: ID,
  now: Date,
): CatalogAddition {
  // Reuse an existing item already created from this catalogue entry.
  const existing = db.items.find((i) => i.stageId === stageId && i.catalogKey === entryKey);
  if (existing) return { items: db.items, materials: db.materials, itemId: existing.id };

  const found = courseStage(stageId);
  const work = found?.group.works.find((w) => w.key === entryKey);
  if (work) {
    const carried = db.items.find((i) => i.catalogKey === entryKey && isCourseWorkKey(i.catalogKey));
    if (carried) return { items: db.items, materials: db.materials, itemId: carried.id };
  }

  const base = entry
    ? itemFromCatalogEntry(entry, instrumentId, now)
    : createItem({ instrumentId, title: 'New item', stageId }, now);

  if (!found) return { items: [...db.items, base], materials: db.materials, itemId: base.id };

  const source = resolveCourseSource(db.materials, found.course, instrumentId, now);
  const item = { ...base, materialId: source.materialId };
  return { items: [...db.items, item], materials: source.materials, itemId: item.id };
}

/** Course works carry a key derived from the work, so it is stable across levels. */
function isCourseWorkKey(key: string): boolean {
  return key.startsWith('work-');
}

// --- adding levels the owner has just bought ---------------------------------

export interface CourseLevelOffer {
  groupKey: string;
  code: string;
  title: string;
  group: string;
}

/**
 * The course levels this pathway does NOT have.
 *
 * Absence is decided by the stage's deterministic ID, never by its title: a
 * level the owner renamed is present and is never offered again, and a stage
 * they deliberately DELETED is offered — in a list — but is never recreated
 * unless they choose it. That is exactly why this is a separate, course-scoped
 * action and not an extension of `reseedDefaultPathways`: making that shipped
 * button additive would resurrect a deleted stage on its own, because a deleted
 * stage's id is absent in precisely the same way a never-seeded one is.
 */
export function offeredCourseLevels(course: CourseData, stages: PathwayStage[]): CourseLevelOffer[] {
  const have = new Set(stages.filter((s) => s.pathwayId === course.pathwayId).map((s) => s.id));
  return course.groups
    .filter((g) => !have.has(courseStageId(course, g.key)))
    .map((g) => ({ groupKey: g.key, code: g.code, title: g.title, group: g.group }));
}

/**
 * The stages collection with exactly the SELECTED levels added — as one value
 * the store applies in a single `set()`. Nothing is added that was not
 * explicitly selected, and a selection naming a level the pathway already has
 * is ignored rather than duplicated.
 */
export function planCourseLevels(
  course: CourseData,
  stages: PathwayStage[],
  selectedGroupKeys: string[],
  now: Date,
): PathwayStage[] {
  const offered = new Map(offeredCourseLevels(course, stages).map((o) => [o.groupKey, o]));
  const chosen = course.groups.filter((g) => selectedGroupKeys.includes(g.key) && offered.has(g.key));
  if (chosen.length === 0) return stages;
  const ts = nowISO(now);
  let order = stages.filter((s) => s.pathwayId === course.pathwayId).length;
  const added = chosen.map((g) => ({
    id: courseStageId(course, g.key),
    pathwayId: course.pathwayId,
    code: g.code,
    title: g.title,
    group: g.group,
    order: order++,
    createdAt: ts,
    updatedAt: ts,
  }));
  return [...stages, ...added];
}
