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

describe('what a course entry becomes in My repertoire', () => {
  const entries = catalogForStage(STAGE_1B);
  const g = group('1b');

  it("a level's study and packet works are repertoire works and its drill sections are not", () => {
    // The level's OWN study IS the Piece section, named as the course names it.
    expect(entries.find((e) => e.key === 'piece')?.title).toBe('1B Piece — Study #1');
    expect(isWork(added(STAGE_1B, 'piece'))).toBe(true);

    // Every named packet work, with its composer.
    expect(g.works.length).toBeGreaterThan(0);
    expect(g.works.find((w) => w.key === 'work-fernando-sor-opus-35-no-1')?.title).toBe(
      'Fernando Sor — Opus 35, no.1',
    );
    for (const w of g.works) {
      expect(entries.some((e) => e.key === w.key && e.strand === 'piece')).toBe(true);
      expect(isWork(added(STAGE_1B, w.key))).toBe(true);
    }

    // And nothing else from the same level.
    const practice = ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'other-study', 'contrast-cards'];
    const items = practice.map((k) => added(STAGE_1B, k));
    for (const item of items) expect(isWork(item), `${item.catalogKey} reached My repertoire`).toBe(false);
    expect(repertoireWorks(items)).toEqual([]);
  });

  it('emits no separate study entry beside the Piece section, which would repertoire it twice', () => {
    expect(g.works.some((w) => w.title === 'Study #1')).toBe(false);
    expect(entries.filter((e) => /Study #1/.test(e.title))).toHaveLength(1);
  });
});

// --- ac-2 -------------------------------------------------------------------

describe('a work carried forward across levels', () => {
  // Ferrer Ejercicio runs 2C-2F: ONE work, suggested in each level it appears.
  const CARRIED = 'work-ferrer-ejercicio';

  it('reuses a carried-forward work when it is added from a later level instead of duplicating it', () => {
    // The course names it by the same key in every level it appears in...
    expect(CGS_COURSE.groups.filter((g) => g.works.some((w) => w.key === CARRIED)).length).toBeGreaterThan(1);

    // ...so adding it from 2E returns the item created from 2C.
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

describe("a course item's material", () => {
  const item = added(STAGE_1B, 'piece');

  it("composes a catalogue item's course files without storing any reference on the item", () => {
    // The item stores nothing...
    expect(item.references ?? []).toEqual([]);
    const files = itemFiles(dbWith([item]), item.id);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.source === 'reference' && f.kind === 'video')).toBe(true);
    expect(files.some((f) => f.source === 'reference' && f.kind === 'pdf')).toBe(true);
    // ...and nothing was written back onto it.
    expect(item.references ?? []).toEqual([]);
    // It is read out of the catalogue EVERY time, which is what makes
    // regenerated course data reach an item that already exists.
    expect(files.map((f) => (f as ItemFileReference).path)).toEqual(
      courseFilesFor(STAGE_1B, 'piece').map((f) => f.path),
    );
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

describe('which base a composed reference resolves against', () => {
  const courseFile = courseFilesFor(STAGE_1B, 'scales')[0];
  const archiveRef = { path: 'session-39-1405-06-13/01-correction.mp4' };

  it('resolves a course file under the shared media root and leaves archive resolution unchanged', () => {
    // The Mac, over the LAN.
    expect(courseFile.path.startsWith('classical-guitar/classical-guitar-shed/Level_1B/')).toBe(true);
    expect(resolveRecording(mediaRoot({ archiveBase: MAC_ARCHIVE_BASE }) ?? undefined, courseFile)).toEqual({
      status: 'ok',
      url: `https://192.168.0.20:5010/${courseFile.path}`,
    });
    expect(resolveRecording(MAC_ARCHIVE_BASE, archiveRef)).toEqual({
      status: 'ok',
      url: `${MAC_ARCHIVE_BASE}/session-39-1405-06-13/01-correction.mp4`,
    });

    // The phone, over Tailscale — each keeps its own path prefix.
    const phoneRoot = mediaRoot({ archiveBase: PHONE_ARCHIVE_BASE });
    expect(phoneRoot).toBe('https://ds220plus.taild1d1f7.ts.net/media');
    expect(resolveRecording(phoneRoot ?? undefined, courseFile)).toEqual({
      status: 'ok',
      url: `https://ds220plus.taild1d1f7.ts.net/media/${courseFile.path}`,
    });
    expect(resolveRecording(PHONE_ARCHIVE_BASE, archiveRef)).toEqual({
      status: 'ok',
      url: `${PHONE_ARCHIVE_BASE}/session-39-1405-06-13/01-correction.mp4`,
    });

    // AND EACH COMPOSED REFERENCE PICKS ITS OWN BASE. The two resolutions
    // above prove the arithmetic; this is what makes a real item use it —
    // without it a course file would be pushed through the archive base and
    // 404, and a class recording through the root, landing a folder too high.
    const item = added(STAGE_1B, 'scales');
    const composed = itemFiles(dbWith([item]), item.id).filter(
      (f): f is ItemFileReference => f.source === 'reference',
    );
    expect(composed.length).toBeGreaterThan(0);
    const bases = { archiveBase: MAC_ARCHIVE_BASE, mediaRoot: mediaRoot({ archiveBase: MAC_ARCHIVE_BASE }) };
    for (const f of composed) {
      expect(f.root).toBe('media');
      expect(baseForItemFile(f, bases)).toBe('https://192.168.0.20:5010');
      expect(resolveRecording(baseForItemFile(f, bases), f)).toEqual({
        status: 'ok',
        url: `https://192.168.0.20:5010/${f.path}`,
      });
    }
    expect(baseForItemFile({ root: 'archive' } as ItemFileReference, bases)).toBe(MAC_ARCHIVE_BASE);
  });
});

describe('a course file with no media root behind it', () => {
  const courseFile = courseFilesFor(STAGE_1B, 'scales')[0];

  it('reports no-base for a course file when no media root is derivable or set', () => {
    // The LEGACY archive base, one folder too high: it IS the media root, so
    // nothing is derivable from it and nothing is guessed.
    const root = mediaRoot({ archiveBase: 'https://192.168.0.20:5010/' });
    expect(root).toBeNull();
    const resolution = resolveRecording(root ?? undefined, courseFile);
    expect(resolution).toEqual({ status: 'no-base' });
    // Honestly unavailable, never a dead link: the material row's Open is
    // enabled only for `ok`.
    expect(resolution.status === 'ok').toBe(false);
    // And the same for a device with nothing configured at all.
    expect(resolveRecording(mediaRoot({}) ?? undefined, courseFile)).toEqual({ status: 'no-base' });
  });
});

// --- ac-7, ac-8, ac-9, ac-10 ------------------------------------------------

describe('"Build one for where I am"', () => {
  it("builds a position routine from added current-level items plus the previous level's essentials", () => {
    const arp = added(STAGE_1C, 'arpeggios');
    const items = [arp, added(STAGE_1C, 'scales')];
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
    // Each current-level segment is bound to the item it was matched to;
    // nothing was added in 1B, so its maintenance segments are unbound
    // countdowns rather than fabricated bindings.
    expect(segments.find((s) => s.label === '1C Arpeggios')?.itemId).toBe(arp.id);
    expect(segments.find((s) => s.label === '1B Scales')?.itemId).toBeUndefined();
  });

  it('is just the added sections for the first level, which has no previous one', () => {
    const items = [added(STAGE_1B, 'scales')];
    expect(buildPositionRoutine(CGS_COURSE, '1a', items)).toEqual([]);
  });
});

describe('a section the owner has not reached yet', () => {
  it('omits a current-level segment whose catalogue item has not been added', () => {
    const items = [added(STAGE_1C, 'arpeggios')];
    const position = buildPositionRoutine(CGS_COURSE, '1c', items);
    const full = buildLevelRoutine(CGS_COURSE, '1c', items);

    expect(position.map((s) => s.label)).not.toContain('1C Sight-Reading');
    expect(full.map((s) => s.label)).toContain('1C Sight-Reading');
    // Absent, not skipped: the full routine keeps every one of its own segments.
    expect(full.map((s) => s.label)).toEqual(group('1c').routine.map((s) => s.label));
  });
});

describe('the segment-to-item join', () => {
  it('joins a segment to its item by stage and catalogue key together, never by key alone', () => {
    // `chords` exists in every level. An item added in 1B must not enable 1C's.
    const chords1B = added(STAGE_1B, 'chords');
    const segments = buildPositionRoutine(CGS_COURSE, '1c', [chords1B]);
    expect(segments.map((s) => s.label)).not.toContain('1C Chords');
    expect(segments.find((s) => s.label === '1B Arpeggios')?.itemId).toBeUndefined();

    // And with an item under the same key in BOTH levels, each binds its own.
    const chords1C = added(STAGE_1C, 'chords');
    const full = buildLevelRoutine(CGS_COURSE, '1c', [chords1B, chords1C]);
    expect(full.find((s) => s.label === '1C Chords')?.itemId).toBe(chords1C.id);
  });
});

describe('what adding an item does and does not enable', () => {
  it('ignores an added repertoire work when building the position routine and includes an added practice section', () => {
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

describe('"Add new levels from this course"', () => {
  const present = ['1a', '1b', '1c'].map((k) => stage(courseStageId(CGS_COURSE, k)));

  it('offers only the course levels absent from an existing pathway and never a renamed one already present', () => {
    const offered = offeredCourseLevels(CGS_COURSE, present).map((o) => o.groupKey);
    expect(offered).not.toContain('1a');
    expect(offered).not.toContain('1c');
    expect(offered).toContain('1d');
    expect(offered.length).toBe(CGS_COURSE.groups.length - 3);

    // Presence is the stage ID, never the title, so a renamed level is present.
    const renamed = [stage(courseStageId(CGS_COURSE, '2a'), { code: 'My warm-ups', title: 'Whatever I like' })];
    expect(offeredCourseLevels(CGS_COURSE, renamed).map((o) => o.groupKey)).not.toContain('2a');

    // And only what was explicitly selected is added.
    const next = planCourseLevels(CGS_COURSE, present, ['1d'], NOW);
    expect(next.filter((s) => !present.includes(s)).map((s) => s.id)).toEqual([
      courseStageId(CGS_COURSE, '1d'),
    ]);
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

describe("the course's own study source", () => {
  it('returns an existing study source when one matches and mints one only when none does', () => {
    // Minted on first use, and the item is grouped under it.
    const first = planCatalogAddition({ items: [], materials: [] }, STAGE_1B, 'scales', catalogForStage(STAGE_1B).find((e) => e.key === 'scales'), 'g', NOW);
    expect(first.materials).toHaveLength(1);
    expect(first.materials[0].title).toBe('Classical Guitar Shed');
    expect(first.items[0].materialId).toBe(first.materials[0].id);

    // A second course item returns the SAME collection — never a duplicate.
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
