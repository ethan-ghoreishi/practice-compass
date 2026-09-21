import { describe, expect, it } from 'vitest';
import { CGS_COURSE } from './courseData';
import {
  buildLevelRoutine,
  buildPositionRoutine,
  courseFilesFor,
  courseStageId,
  offeredCourseLevels,
  planCatalogAddition,
  planCourseLevels,
  resolveCourseSource,
} from './courseSeed';
import { createItem, createMaterial } from './factories';
import { catalogForStage } from './pathwaySeed';
import { isWork, repertoireWorks } from './repertoire';
import { baseForItemFile, itemFiles, type ItemFileReference } from './itemFiles';
import { mediaRoot } from './mediaRoots';
import { resolveRecording } from './recordings';
import type { Material, PathwayStage, PracticeDB, PracticeItem } from './types';

// ---------------------------------------------------------------------------
// The course, read as reference data. Every check below runs against the REAL
// generated `courseData.ts` — the owner's own eighteen levels — not a fixture,
// because what these rules have to hold for is the actual course.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-21T09:00:00.000Z');
const STAGE_1B = courseStageId(CGS_COURSE, '1b');
const STAGE_1C = courseStageId(CGS_COURSE, '1c');
const STAGE_2C = courseStageId(CGS_COURSE, '2c');
const STAGE_2E = courseStageId(CGS_COURSE, '2e');

function group(key: string) {
  const g = CGS_COURSE.groups.find((x) => x.key === key);
  if (!g) throw new Error(`no course group ${key}`);
  return g;
}

/** An item as `addFromCatalog` would have created it from that stage's entry. */
function added(stageId: string, catalogKey: string, over: Partial<PracticeItem> = {}): PracticeItem {
  const entry = catalogForStage(stageId).find((e) => e.key === catalogKey);
  if (!entry) throw new Error(`no catalog entry ${stageId}/${catalogKey}`);
  return {
    ...createItem({ instrumentId: 'g', title: entry.title, stageId, catalogKey }, NOW),
    itemType: entry.strand === 'piece' ? 'full_piece' : 'technique',
    strand: entry.strand,
    ...over,
  };
}

// --- ac-1 -------------------------------------------------------------------

describe("a level's study and packet works are repertoire works and its drill sections are not", () => {
  const entries = catalogForStage(STAGE_1B);
  const g = group('1b');

  it("makes the level's own study a repertoire work, named as the course names it", () => {
    const piece = entries.find((e) => e.key === 'piece');
    expect(piece?.title).toBe('1B Piece — Study #1');
    expect(isWork(added(STAGE_1B, 'piece'))).toBe(true);
  });

  it('makes every named packet work a repertoire work, with its composer', () => {
    expect(g.works.length).toBeGreaterThan(0);
    const sor = g.works.find((w) => w.key === 'work-fernando-sor-opus-35-no-1');
    expect(sor?.title).toBe('Fernando Sor — Opus 35, no.1');
    for (const w of g.works) {
      expect(entries.some((e) => e.key === w.key && e.strand === 'piece')).toBe(true);
      expect(isWork(added(STAGE_1B, w.key))).toBe(true);
    }
  });

  it('keeps every drill, exercise, rhythm, sight-reading and reading section out of repertoire', () => {
    const practice = ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'other-study', 'contrast-cards'];
    const items = practice.map((k) => added(STAGE_1B, k));
    for (const item of items) expect(isWork(item), `${item.catalogKey} reached My repertoire`).toBe(false);
    expect(repertoireWorks(items)).toEqual([]);
  });
});

// --- ac-2 -------------------------------------------------------------------

describe('reuses a carried-forward work when it is added from a later level instead of duplicating it', () => {
  // Ferrer Ejercicio runs 2C-2F: ONE work, suggested in each level it appears.
  const CARRIED = 'work-ferrer-ejercicio';

  it('names the same work by the same key in every level it appears in', () => {
    const levels = CGS_COURSE.groups.filter((g) => g.works.some((w) => w.key === CARRIED));
    expect(levels.length).toBeGreaterThan(1);
  });

  it('returns the item created from the earlier level rather than creating a second work', () => {
    const first = added(STAGE_2C, CARRIED);
    const db = { items: [first], materials: [] as Material[] };
    const entry = catalogForStage(STAGE_2E).find((e) => e.key === CARRIED);
    const plan = planCatalogAddition(db, STAGE_2E, CARRIED, entry, 'g', NOW);
    expect(plan.itemId).toBe(first.id);
    expect(plan.items).toHaveLength(1);
    expect(repertoireWorks(plan.items)).toHaveLength(1);
  });

  it('still creates it the first time, and never reuses across an ordinary per-stage key', () => {
    const chords1B = added(STAGE_1B, 'chords');
    const entry = catalogForStage(STAGE_1C).find((e) => e.key === 'chords');
    const plan = planCatalogAddition({ items: [chords1B], materials: [] }, STAGE_1C, 'chords', entry, 'g', NOW);
    expect(plan.itemId).not.toBe(chords1B.id);
    expect(plan.items).toHaveLength(2);
  });
});

// --- ac-3 -------------------------------------------------------------------

function dbWith(items: PracticeItem[]): PracticeDB {
  return {
    schemaVersion: 14,
    instruments: [],
    materials: [],
    items,
    blocks: [],
    reviews: [],
    lessons: [],
    lessonAgenda: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [],
    attachments: [],
    archiveSources: [],
  } as unknown as PracticeDB;
}

describe("composes a catalogue item's course files without storing any reference on the item", () => {
  const item = added(STAGE_1B, 'piece');

  it("lists the section's own videos and scores for an item that stores none of them", () => {
    expect(item.references ?? []).toEqual([]);
    const files = itemFiles(dbWith([item]), item.id);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.source === 'reference' && f.kind === 'video')).toBe(true);
    expect(files.some((f) => f.source === 'reference' && f.kind === 'pdf')).toBe(true);
    // Nothing was written back onto the item.
    expect(item.references ?? []).toEqual([]);
  });

  it('reads them from the catalogue every time, so regenerated course data reaches an item that already exists', () => {
    const before = itemFiles(dbWith([item]), item.id).map((f) => (f as ItemFileReference).path);
    expect(before).toEqual(courseFilesFor(STAGE_1B, 'piece').map((f) => f.path));
  });

  it('gives an item from no course nothing at all', () => {
    const plain = createItem({ instrumentId: 'g', title: 'Scales' }, NOW);
    expect(itemFiles(dbWith([plain]), plain.id)).toEqual([]);
  });
});

// --- ac-4, ac-5, ac-6 -------------------------------------------------------

// The values the owner's own devices actually carry.
const MAC_ARCHIVE_BASE = 'https://192.168.0.20:5010/setar-classes';
const PHONE_ARCHIVE_BASE = 'https://ds220plus.taild1d1f7.ts.net/media/setar-classes';

describe('resolves a course file under the shared media root and leaves archive resolution unchanged', () => {
  const courseFile = courseFilesFor(STAGE_1B, 'scales')[0];
  const archiveRef = { path: 'session-39-1405-06-13/01-correction.mp4' };

  it("joins the course's own media path under the root derived from the real configured base", () => {
    const root = mediaRoot({ archiveBase: MAC_ARCHIVE_BASE });
    expect(courseFile.path.startsWith('classical-guitar/classical-guitar-shed/Level_1B/')).toBe(true);
    expect(resolveRecording(root ?? undefined, courseFile)).toEqual({
      status: 'ok',
      url: `https://192.168.0.20:5010/${courseFile.path}`,
    });
  });

  it("resolves an archive reference against the UNCHANGED archive base, not the root", () => {
    expect(resolveRecording(MAC_ARCHIVE_BASE, archiveRef)).toEqual({
      status: 'ok',
      url: `${MAC_ARCHIVE_BASE}/session-39-1405-06-13/01-correction.mp4`,
    });
  });

  it("keeps the phone's own path prefix on both", () => {
    const root = mediaRoot({ archiveBase: PHONE_ARCHIVE_BASE });
    expect(root).toBe('https://ds220plus.taild1d1f7.ts.net/media');
    expect(resolveRecording(root ?? undefined, courseFile)).toEqual({
      status: 'ok',
      url: `https://ds220plus.taild1d1f7.ts.net/media/${courseFile.path}`,
    });
    expect(resolveRecording(PHONE_ARCHIVE_BASE, archiveRef)).toEqual({
      status: 'ok',
      url: `${PHONE_ARCHIVE_BASE}/session-39-1405-06-13/01-correction.mp4`,
    });
  });

  it('picks each reference its own base, so neither is ever tried against the other', () => {
    const item = added(STAGE_1B, 'scales');
    const composed = itemFiles(dbWith([item]), item.id).filter(
      (f): f is ItemFileReference => f.source === 'reference',
    );
    expect(composed.length).toBeGreaterThan(0);
    const bases = { archiveBase: MAC_ARCHIVE_BASE, mediaRoot: mediaRoot({ archiveBase: MAC_ARCHIVE_BASE }) };
    for (const f of composed) {
      expect(f.root).toBe('media');
      expect(baseForItemFile(f, bases)).toBe('https://192.168.0.20:5010');
    }
    expect(baseForItemFile({ root: 'archive' } as ItemFileReference, bases)).toBe(MAC_ARCHIVE_BASE);
  });
});

describe('reports no-base for a course file when no media root is derivable or set', () => {
  const courseFile = courseFilesFor(STAGE_1B, 'scales')[0];

  it('is honestly unavailable rather than a dead link', () => {
    const root = mediaRoot({ archiveBase: 'https://192.168.0.20:5010/' });
    expect(root).toBeNull();
    const resolution = resolveRecording(root ?? undefined, courseFile);
    expect(resolution).toEqual({ status: 'no-base' });
    // The material row offers no open action for anything but `ok`.
    expect(resolution.status === 'ok').toBe(false);
  });

  it('says so for a device with nothing configured at all', () => {
    expect(resolveRecording(mediaRoot({}) ?? undefined, courseFile)).toEqual({ status: 'no-base' });
  });
});

// --- ac-7, ac-8, ac-9, ac-10 ------------------------------------------------

describe("builds a position routine from added current-level items plus the previous level's essentials", () => {
  it("is the previous level's essential segments followed by only the sections actually added", () => {
    const items = [added(STAGE_1C, 'arpeggios'), added(STAGE_1C, 'scales')];
    const segments = buildPositionRoutine(CGS_COURSE, '1c', items);
    expect(segments.map((s) => s.label)).toEqual([
      // 1B's essentials — the maintenance the syllabus itself carries forward.
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
      // 1C, only what has been added.
      '1C Arpeggios',
      '1C Scales',
    ]);
    expect(segments.slice(0, 3).every((s) => s.essential)).toBe(true);
  });

  it('binds each segment to the item the owner actually created from it', () => {
    const arp = added(STAGE_1C, 'arpeggios');
    const segments = buildPositionRoutine(CGS_COURSE, '1c', [arp]);
    expect(segments.find((s) => s.label === '1C Arpeggios')?.itemId).toBe(arp.id);
    // Nothing was added in 1B, so its maintenance segments are unbound countdowns.
    expect(segments.find((s) => s.label === '1B Scales')?.itemId).toBeUndefined();
  });

  it('is just the added sections for the first level, which has no previous one', () => {
    const items = [added(STAGE_1B, 'scales')];
    expect(buildPositionRoutine(CGS_COURSE, '1a', items)).toEqual([]);
  });
});

describe('omits a current-level segment whose catalogue item has not been added', () => {
  it("leaves it out of the position routine while the level's full routine still has it", () => {
    const items = [added(STAGE_1C, 'arpeggios')];
    const position = buildPositionRoutine(CGS_COURSE, '1c', items);
    const full = buildLevelRoutine(CGS_COURSE, '1c', items);

    expect(position.map((s) => s.label)).not.toContain('1C Sight-Reading');
    expect(full.map((s) => s.label)).toContain('1C Sight-Reading');
    // Absent, not skipped: the full routine keeps every one of its own segments.
    expect(full.map((s) => s.label)).toEqual(group('1c').routine.map((s) => s.label));
  });
});

describe('joins a segment to its item by stage and catalogue key together, never by key alone', () => {
  it("never matches an identically-keyed entry in another level", () => {
    // `chords` exists in every level. An item added in 1B must not enable 1C's.
    const chords1B = added(STAGE_1B, 'chords');
    const segments = buildPositionRoutine(CGS_COURSE, '1c', [chords1B]);
    expect(segments.map((s) => s.label)).not.toContain('1C Chords');
    expect(segments.find((s) => s.label === '1B Arpeggios')?.itemId).toBeUndefined();
  });

  it('binds the right level when both levels have an item under the same key', () => {
    const chords1B = added(STAGE_1B, 'chords');
    const chords1C = added(STAGE_1C, 'chords');
    const full = buildLevelRoutine(CGS_COURSE, '1c', [chords1B, chords1C]);
    expect(full.find((s) => s.label === '1C Chords')?.itemId).toBe(chords1C.id);
  });
});

describe('ignores an added repertoire work when building the position routine and includes an added practice section', () => {
  it('is decided by each segment\'s OWN declared key, not by how many items the stage holds', () => {
    const work = added(STAGE_1C, group('1c').works[0].key);
    expect(isWork(work)).toBe(true);
    expect(buildPositionRoutine(CGS_COURSE, '1c', [work]).map((s) => s.label)).toEqual([
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
    ]);

    const section = added(STAGE_1C, 'rhythm-study');
    expect(buildPositionRoutine(CGS_COURSE, '1c', [work, section]).map((s) => s.label)).toEqual([
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
      '1C Rhythm Study',
    ]);
  });

  it('enables nothing for an item the owner created by hand with no catalogue key', () => {
    const byHand = createItem({ instrumentId: 'g', title: 'My own thing', stageId: STAGE_1C }, NOW);
    expect(buildPositionRoutine(CGS_COURSE, '1c', [byHand]).map((s) => s.label)).toEqual([
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
    ]);
  });
});

// --- ac-13 ------------------------------------------------------------------

function stage(id: string, over: Partial<PathwayStage> = {}): PathwayStage {
  return {
    id,
    pathwayId: CGS_COURSE.pathwayId,
    code: id,
    title: id,
    order: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...over,
  };
}

describe('offers only the course levels absent from an existing pathway and never a renamed one already present', () => {
  const present = ['1a', '1b', '1c'].map((k) => stage(courseStageId(CGS_COURSE, k)));

  it('offers exactly the levels the pathway does not have', () => {
    const offered = offeredCourseLevels(CGS_COURSE, present).map((o) => o.groupKey);
    expect(offered).not.toContain('1a');
    expect(offered).not.toContain('1c');
    expect(offered).toContain('1d');
    expect(offered.length).toBe(CGS_COURSE.groups.length - 3);
  });

  it('never offers a level the owner renamed — presence is the stage id, never the title', () => {
    const renamed = [stage(courseStageId(CGS_COURSE, '2a'), { code: 'My warm-ups', title: 'Whatever I like' })];
    expect(offeredCourseLevels(CGS_COURSE, renamed).map((o) => o.groupKey)).not.toContain('2a');
  });

  it('adds only what was explicitly selected, leaving every other level alone', () => {
    const next = planCourseLevels(CGS_COURSE, present, ['1d'], NOW);
    const addedIds = next.filter((s) => !present.includes(s)).map((s) => s.id);
    expect(addedIds).toEqual([courseStageId(CGS_COURSE, '1d')]);
    expect(next).toHaveLength(present.length + 1);
  });

  it('adds NOTHING on its own, so a deliberately deleted stage is offered but never recreated', () => {
    // 1B deleted: it is offered again...
    const afterDeletion = present.filter((s) => s.id !== courseStageId(CGS_COURSE, '1b'));
    expect(offeredCourseLevels(CGS_COURSE, afterDeletion).map((o) => o.groupKey)).toContain('1b');
    // ...but selecting nothing changes nothing, and the collection is untouched.
    expect(planCourseLevels(CGS_COURSE, afterDeletion, [], NOW)).toBe(afterDeletion);
  });

  it('ignores a selection naming a level the pathway already has, rather than duplicating it', () => {
    expect(planCourseLevels(CGS_COURSE, present, ['1c'], NOW)).toBe(present);
  });

  it('gives the added stage the deterministic id the catalogue is keyed by', () => {
    const next = planCourseLevels(CGS_COURSE, present, ['3f'], NOW);
    const addedStage = next[next.length - 1];
    expect(addedStage.id).toBe(courseStageId(CGS_COURSE, '3f'));
    expect(catalogForStage(addedStage.id).length).toBeGreaterThan(0);
  });
});

// --- ac-14 ------------------------------------------------------------------

describe('returns an existing study source when one matches and mints one only when none does', () => {
  it('mints one on first use, and groups the item under it', () => {
    const plan = planCatalogAddition({ items: [], materials: [] }, STAGE_1B, 'scales', catalogForStage(STAGE_1B).find((e) => e.key === 'scales'), 'g', NOW);
    expect(plan.materials).toHaveLength(1);
    expect(plan.materials[0].title).toBe('Classical Guitar Shed');
    expect(plan.items[0].materialId).toBe(plan.materials[0].id);
  });

  it('returns the existing one for a second course item, never a duplicate', () => {
    const first = planCatalogAddition({ items: [], materials: [] }, STAGE_1B, 'scales', catalogForStage(STAGE_1B).find((e) => e.key === 'scales'), 'g', NOW);
    const second = planCatalogAddition(
      { items: first.items, materials: first.materials },
      STAGE_1C,
      'chords',
      catalogForStage(STAGE_1C).find((e) => e.key === 'chords'),
      'g',
      NOW,
    );
    expect(second.materials).toHaveLength(1);
    expect(second.materials).toBe(first.materials);
    expect(second.items[1].materialId).toBe(first.materials[0].id);
  });

  it('matches on the source the owner may already have created by hand', () => {
    const mine = createMaterial({ instrumentId: 'g', title: '  classical guitar shed ' }, NOW);
    const r = resolveCourseSource([mine], CGS_COURSE, 'g', NOW);
    expect(r.materialId).toBe(mine.id);
    expect(r.materials).toHaveLength(1);
  });

  it('mints a separate one per instrument, because a source belongs to one', () => {
    const forGuitar = resolveCourseSource([], CGS_COURSE, 'g', NOW);
    const forOther = resolveCourseSource(forGuitar.materials, CGS_COURSE, 'other', NOW);
    expect(forOther.materials).toHaveLength(2);
    expect(forOther.materialId).not.toBe(forGuitar.materialId);
  });
});
