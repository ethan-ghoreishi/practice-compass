import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalStringify } from './canonical';
import { CGS_COURSE } from './courseData';
import {
  COURSE_LEGACY_KEYS,
  buildLevelRoutine,
  buildPositionRoutine,
  carriedCourseWorkItem,
  courseFilesFor,
  courseRoutineName,
  courseStageId,
  planCatalogAddition,
  type CourseFile,
} from './courseSeed';
import { createItem } from './factories';
import { hasPersianScript } from './farsi';
import { KHONYAGAR_COURSE, KHONYAGAR_LESSON_TYPES, KHONYAGAR_PATHWAY } from './khonyagarData';
import { catalogForStage, seedPathways, stageIdFor } from './pathwaySeed';
import { stageUnits } from './pathways';
import { isWork } from './repertoire';
import type { PathwayStage, PracticeItem } from './types';

const NOW = new Date('2026-09-22T09:00:00.000Z');
const IDS = { guitar: 'g', setar: 's', tar: 't' };

/**
 * Everything the Honarestān pathway and the Guitar course present today, as
 * one canonical value: stages, catalogue, routines, the routine each level
 * builds, the title and material every entry is created with. Hashed so the
 * ledger is a literal captured BEFORE this lane changed anything.
 */
function untouchedFingerprint(): string {
  const seeded = seedPathways(IDS, NOW);
  const keep = (pathwayId: string) => pathwayId === 'tar-honarestan' || pathwayId === 'cgs';
  const stages = seeded.pathwayStages.filter((s) => keep(s.pathwayId));
  const value = {
    pathways: seeded.pathways.filter((p) => keep(p.id)),
    stages,
    routines: seeded.pathwayRoutines.filter((r) => !!r.pathwayId && keep(r.pathwayId)),
    catalogue: stages.map((s) => ({ stage: s.id, entries: catalogForStage(s.id) })),
    legacy: COURSE_LEGACY_KEYS,
    levels: CGS_COURSE.groups.map((g) => ({
      key: g.key,
      level: buildLevelRoutine(CGS_COURSE, g.key, []),
      position: buildPositionRoutine(CGS_COURSE, g.key, []),
      names: [courseRoutineName(g, 'level'), courseRoutineName(g, 'position')],
    })),
    created: stages
      .filter((s) => s.pathwayId === 'cgs')
      .flatMap((s) =>
        catalogForStage(s.id).map((e) => {
          const add = planCatalogAddition({ items: [], materials: [] }, s.id, e.key, e, 'g', NOW);
          const item = add.items.find((i) => i.id === add.itemId)!;
          return {
            stage: s.id,
            key: e.key,
            title: item.title,
            type: item.itemType,
            notes: item.notes,
            files: courseFilesFor(s.id, e.key),
          };
        }),
      ),
  };
  return createHash('sha256').update(canonicalStringify(value)).digest('hex');
}

describe('the pathways this lane must not touch', () => {
  it('leaves the Honarestan pathway and the Guitar course entirely unchanged', () => {
    expect(courseStageId(CGS_COURSE, '1b')).toBe('cgs-1b');
    expect(untouchedFingerprint()).toBe('905de18c315c545aa8c020b9310ef9d05b02c151bdcb7a982d573e41ccbe34af');
  });
});

// ---------------------------------------------------------------------------
// The Khonyagar course, read as reference data. Every check runs against the
// REAL generated `khonyagarData.ts` — the owner's own 259 lessons — and every
// ledger below is a LITERAL written at first shipping, never derived from the
// data it guards.
// ---------------------------------------------------------------------------

const K = KHONYAGAR_COURSE;
const stageOf = (groupKey: string) => courseStageId(K, groupKey);
const REPERTOIRE_STRANDS = new Set(['piece', 'repertoire', 'radif']);

/** The lesson number a video path names, read from the path — never from a title. */
function lessonOf(f: CourseFile): number | undefined {
  const m = f.kind === 'video' ? f.path.match(/\/(\d{3}) - [^/]+\.mp4$/) : null;
  return m ? Number(m[1]) : undefined;
}
const lessonsOf = (files: CourseFile[]) => files.map(lessonOf).filter((n): n is number => n !== undefined);

const units = K.groups.flatMap((g) => g.units.map((u) => ({ group: g, unit: u })));
const rows = K.groups.flatMap((g) => g.works.map((w) => ({ group: g, work: w })));

/** Every catalogue entry naming one identity: `[stageId, catalogKey]`. */
function entriesOf(identity: string): [string, string][] {
  return [
    ...units.filter(({ unit }) => unit.workKey === identity).map(({ group, unit }) => [stageOf(group.key), unit.key] as [string, string]),
    ...rows.filter(({ work }) => (work.workKey ?? work.key) === identity).map(({ group, work }) => [stageOf(group.key), work.key] as [string, string]),
  ];
}
function identityFiles(identity: string): CourseFile[] {
  return [
    ...units.filter(({ unit }) => unit.workKey === identity).flatMap(({ unit }) => unit.files),
    ...rows.filter(({ work }) => (work.workKey ?? work.key) === identity).flatMap(({ work }) => work.files ?? []),
  ];
}

function stageRecord(groupKey: string): PathwayStage {
  const s = seedPathways(IDS, NOW).pathwayStages.find((x) => x.id === stageOf(groupKey));
  if (!s) throw new Error(`no seeded stage ${groupKey}`);
  return s;
}

/** Add one catalogue entry the way the store does, returning the new state and item. */
function add(items: PracticeItem[], stageId: string, key: string) {
  const entry = catalogForStage(stageId).find((e) => e.key === key);
  if (!entry) throw new Error(`no catalogue entry ${stageId}/${key}`);
  const plan = planCatalogAddition({ items, materials: [] }, stageId, key, entry, 't', NOW);
  return { items: plan.items, item: plan.items.find((i) => i.id === plan.itemId)!, created: plan.created };
}

// --- literal ledgers, written when these keys first shipped -----------------

/** Every (stage, work row) an item may hold as `stageId` + `catalogKey`. */
const SHIPPED_WORK_ROWS: [string, string][] = [
  ['s006-s013', 'w036'], ['s006-s013', 'w043'], ['s006-s013', 'w044'], ['s006-s013', 'w048'], ['s006-s013', 'w063'],
  ['s006-s013', 'w080'], ['s006-s013', 'w087'], ['s014-s023', 'w093'], ['s014-s023', 'w101'], ['s014-s023', 'w104'],
  ['s014-s023', 'w109'], ['s014-s023', 'w110'], ['s014-s023', 'w113'], ['s014-s023', 'w118'], ['s014-s023', 'w121'],
  ['s014-s023', 'w124'], ['s014-s023', 'w128'], ['s024-s028', 'w135'], ['s024-s028', 'w136'], ['s024-s028', 'w138'],
  ['s024-s028', 'w140'], ['s029-s035', 'w146'], ['s029-s035', 'w153'], ['s036-s045', 'w163'], ['s036-s045', 'w165'],
  ['s036-s045', 'w167'], ['s036-s045', 'w174'], ['s036-s045', 'w177'], ['s036-s045', 'w181'], ['s036-s045', 'w184'],
];

/** Every work key that shipped. Its number is its ANCHOR lesson. */
const SHIPPED_WORK_KEYS = [
  'w036', 'w043', 'w044', 'w048', 'w063', 'w080', 'w087', 'w093', 'w101', 'w104', 'w109', 'w110', 'w113', 'w118',
  'w121', 'w124', 'w128', 'w135', 'w136', 'w138', 'w140', 'w142', 'w146', 'w148', 'w153', 'w155', 'w157', 'w159',
  'w163', 'w165', 'w167', 'w169', 'w171', 'w174', 'w177', 'w179', 'w181', 'w184', 'w186', 'w188', 'w190', 'w191',
  'w192', 'w197', 'w204', 'w205', 'w206', 'w211', 'w212', 'w213', 'w214', 'w219', 'w220', 'w221', 'w222', 'w223',
  'w227', 'w229', 'w230', 'w231', 'w235', 'w236', 'w238', 'w242', 'w244', 'w245', 'w246', 'w250', 'w251', 'w252',
  'w258', 'w259',
];

/** Every (stage, section) pair that shipped. */
const SHIPPED_SECTIONS: Record<string, string[]> = {
  's001-s005': ['s001', 's002', 's003', 's004', 's005'],
  's006-s013': ['s006', 's007', 's008', 's009', 's010', 's011', 's012', 's013'],
  's014-s023': ['s014', 's015', 's016', 's017', 's018', 's019', 's020', 's021', 's022', 's023'],
  's024-s028': ['s024', 's025', 's026', 's027', 's028'],
  's029-s035': ['s029', 's030', 's031', 's032', 's033', 's034', 's035'],
  's036-s045': ['s036', 's037', 's038', 's039', 's040', 's041', 's042', 's043', 's044', 's045'],
  's046-s059': ['s046', 's047', 's048', 's049', 's050', 's051', 's052', 's053', 's054', 's055', 's056', 's057', 's058', 's059'],
  's060-s074': ['s060', 's061', 's062', 's063', 's064', 's065', 's066', 's067', 's068', 's069', 's070', 's071', 's072', 's073', 's074'],
  's075-s092': ['s075', 's076', 's077', 's078', 's079', 's080', 's081', 's082', 's083', 's084', 's085', 's086', 's087', 's088', 's089', 's090', 's091', 's092'],
  's093-s106': ['s093', 's094', 's095', 's096', 's097', 's098', 's099', 's100', 's101', 's102', 's103', 's104', 's105', 's106'],
};

describe('the Khonyagar course as data', () => {
  it('every Khonyagar media path is NFC-normalised and inside the course folder', () => {
    const paths = [
      ...K.groups.flatMap((g) => g.units.flatMap((u) => u.files.map((f) => f.path))),
      ...K.groups.flatMap((g) => g.works.flatMap((w) => (w.files ?? []).map((f) => f.path))),
    ];
    const folders = [K.mediaPath, ...K.groups.map((g) => g.mediaPath), ...units.map(({ unit }) => unit.mediaPath)];
    expect(paths.length).toBeGreaterThan(259);
    for (const p of [...paths, ...folders]) {
      expect(p).toBe(p.normalize('NFC'));
      expect(p === K.mediaPath || p.startsWith(`${K.mediaPath}/`)).toBe(true);
      expect(p.split('/')).not.toContain('..');
      expect(p.split('/')).not.toContain('.');
      expect(p.startsWith('/')).toBe(false);
    }
    // Not vacuous: these paths DO carry characters a decomposing filesystem
    // would store differently — exactly the ones that 404 in NFD.
    expect(paths.filter((p) => p.normalize('NFD') !== p).length).toBeGreaterThan(50);
    // Lesson 148's real name has one space where its index title has two; the
    // path is the FILE's name, and the title is the index's, collapsed.
    const l148 = units.flatMap(({ unit }) => unit.files).find((f) => lessonOf(f) === 148)!;
    expect(l148.path).toBe(`${K.mediaPath}/148 - آموزش رنگ شور از موسی معروفی.mp4`.normalize('NFC'));
    expect(l148.title).toBe('آموزش رنگ شور از موسی معروفی');
  });

  it('Khonyagar keys and stage ids are pure ascii while its titles are Farsi', () => {
    const ascii = /^[\x20-\x7e]+$/;
    const stageIds = K.groups.map((g) => stageOf(g.key));
    for (const id of stageIds) {
      expect(id).toMatch(/^tar-khonyagar-s\d{3}-s\d{3}$/);
      // Byte-identical to the id the pathway seed gives the same stage.
      expect(stageIdFor(K.pathwayId, id.slice(K.pathwayId.length + 1))).toBe(id);
      expect(hasPersianScript(id)).toBe(false);
      for (const e of catalogForStage(id)) {
        expect(e.key).toMatch(/^[sw]\d{3}$/);
        expect(ascii.test(e.key) && !hasPersianScript(e.key)).toBe(true);
        expect(hasPersianScript(e.title)).toBe(true);
      }
    }
    for (const { unit } of units) if (unit.workKey) expect(unit.workKey).toMatch(/^w\d{3}$/);
    for (const { work } of rows) expect((work.workKey ?? work.key)).toMatch(/^w\d{3}$/);

    for (const g of K.groups) {
      expect(hasPersianScript(g.code)).toBe(true);
      expect(hasPersianScript(g.title)).toBe(true);
      expect(hasPersianScript(g.group)).toBe(true);
    }
    for (const { unit } of units) {
      expect(hasPersianScript(unit.title)).toBe(true);
      if (unit.workTitle) expect(hasPersianScript(unit.workTitle)).toBe(true);
    }
    for (const { work } of rows) expect(hasPersianScript(work.title)).toBe(true);
    expect(hasPersianScript(KHONYAGAR_PATHWAY.name)).toBe(true);
    expect(hasPersianScript(K.sourceName)).toBe(true);
    expect(new Set(K.groups.map((g) => g.group))).toEqual(new Set(['تار مقدماتی', 'تار متوسطه', 'تار ۳']));
  });

  it('accounts for all 106 sections, each of the 259 lessons exactly once and all four score books', () => {
    // 106 sections, s001–s106, in the index's own order.
    expect(units).toHaveLength(106);
    expect(units.map(({ unit }) => unit.key)).toEqual(
      Array.from({ length: 106 }, (_, i) => `s${String(i + 1).padStart(3, '0')}`),
    );
    // Lessons read from the video PATHS: 1–259, each once, contiguous and in
    // order within each section — dropping, duplicating or misplacing one
    // lesson breaks the one sequence below.
    const perSection = units.map(({ unit }) => lessonsOf(unit.files));
    for (const ls of perSection) {
      expect(ls.length).toBeGreaterThan(0);
      ls.forEach((n, i) => i > 0 && expect(n).toBe(ls[i - 1] + 1));
    }
    expect(perSection.flat()).toEqual(Array.from({ length: 259 }, (_, i) => i + 1));
    // Nothing but lesson videos and score books.
    const all = units.flatMap(({ unit }) => unit.files);
    expect(all.filter((f) => f.kind === 'video')).toHaveLength(259);
    expect(all.every((f) => f.kind === 'video' || f.kind === 'pdf')).toBe(true);
    // Exactly the four score books, each referenced at least once.
    const books = new Set(all.filter((f) => f.kind === 'pdf').map((f) => f.path));
    expect([...books].sort()).toEqual(
      [
        'نت ۱ - دروس تکمیلی تار مقدماتی.pdf',
        'نت ۲ - تکمیلی تار متوسطه.pdf',
        'نت ۳ - تار ۳ ردیف (ماهور).pdf',
        'نت ۴ - تار ۳ قطعات ضربی.pdf',
      ].map((b) => `${K.mediaPath}/${b}`).sort(),
    );
    // Every section carries exactly one book.
    for (const { unit } of units) expect(unit.files.filter((f) => f.kind === 'pdf')).toHaveLength(1);
    // Every work's files are files the sections already carry.
    const sectionPaths = new Set(all.map((f) => f.path));
    for (const { work } of rows) {
      expect(work.files?.length).toBeGreaterThan(0);
      for (const f of work.files ?? []) expect(sectionPaths.has(f.path)).toBe(true);
    }
  });
});

describe('Khonyagar work identity', () => {
  it('every shipped Khonyagar work row still exists and every shipped work key keeps its anchor lesson', () => {
    for (const [groupKey, key] of SHIPPED_WORK_ROWS) {
      expect(K.groups.find((g) => g.key === groupKey)?.works.some((w) => w.key === key)).toBe(true);
      expect(catalogForStage(stageOf(groupKey)).some((e) => e.key === key)).toBe(true);
    }
    for (const key of SHIPPED_WORK_KEYS) {
      const files = identityFiles(key);
      // A key may stop resolving only because a section joined another
      // identity; if it resolves, it still names the work its anchor taught.
      if (files.length === 0) continue;
      expect(lessonsOf(files)).toContain(Number(key.slice(1)));
    }
    // Every shipped row is one of the shipped keys. A key held only by sections
    // may stop resolving (a later join is allowed), but not vacuously: today
    // every shipped key resolves.
    for (const [, key] of SHIPPED_WORK_ROWS) expect(SHIPPED_WORK_KEYS).toContain(key);
    expect(SHIPPED_WORK_KEYS.filter((key) => entriesOf(key).length > 0).length).toBeGreaterThan(60);
  });

  it('every shipped Khonyagar section stays in the stage it shipped in', () => {
    for (const [groupKey, keys] of Object.entries(SHIPPED_SECTIONS)) {
      const catalogue = catalogForStage(stageOf(groupKey)).map((e) => e.key);
      for (const key of keys) expect(catalogue).toContain(key);
    }
    expect(Object.values(SHIPPED_SECTIONS).flat()).toHaveLength(106);
  });

  it('a work spanning several sections is one item titled with the work carrying every section\'s files once', () => {
    const multi = [...new Set(units.map(({ unit }) => unit.workKey).filter((k): k is string => !!k))].filter(
      (k) => entriesOf(k).length > 1,
    );
    // Not vacuous, and the two the owner named are among them.
    expect(multi).toEqual(expect.arrayContaining(['w192', 'w197', 'w206', 'w214', 'w246']));

    for (const identity of multi) {
      const entries = entriesOf(identity);
      const title = units.find(({ unit }) => unit.workKey === identity)!.unit.workTitle!;
      const expected = [...new Set(identityFiles(identity).map((f) => f.path))];
      for (const [firstStage, firstKey] of entries) {
        let state = add([], firstStage, firstKey);
        const item = state.item;
        expect(state.created).toBe(true);
        expect(item.title).toBe(title);
        expect(isWork(item)).toBe(true);
        for (const [stageId, key] of entries) {
          const again = add(state.items, stageId, key);
          expect(again.created).toBe(false);
          expect(again.item.id).toBe(item.id);
          state = { ...again, item };
        }
        expect(state.items).toHaveLength(1);
        const files = courseFilesFor(item.stageId!, item.catalogKey!).map((f) => f.path);
        expect(new Set(files).size).toBe(files.length);
        expect(files.sort()).toEqual([...expected].sort());
      }
    }

    // The radif's چهارمضراب ماهور, concretely: seven sections, nine lessons,
    // one book — added from part two, it is the WORK, and all seven rows read so.
    expect(entriesOf('w246').map(([, k]) => k)).toEqual(['s095', 's096', 's097', 's101', 's102', 's103', 's104']);
    const { items, item } = add([], stageOf('s093-s106'), 's096');
    expect(item.title).toBe('چهارمضراب ماهور');
    const files = courseFilesFor(item.stageId!, item.catalogKey!);
    expect(lessonsOf(files)).toEqual([246, 247, 248, 249, 253, 254, 255, 256, 257]);
    expect(files.filter((f) => f.kind === 'pdf')).toHaveLength(1);
    const rowsNow = stageUnits(stageRecord('s093-s106'), items).filter((u) => u.item?.id === item.id);
    expect(rowsNow.map((u) => u.key)).toEqual(['s095', 's096', 's097', 's101', 's102', 's103', 's104']);
    expect(rowsNow.every((u) => u.title === 'چهارمضراب ماهور')).toBe(true);
    // A performance section added first is the work too, never «اجرای …».
    expect(add([], stageOf('s046-s059'), 's057').item.title).toBe('پیش‌درآمد ماهور درویش‌خان');
    expect(add([], stageOf('s046-s059'), 's048').item.title).toBe('رنگ دوم ماهور از درویش‌خان');
  });

  it('keeps two distinct files whose titles match and never repeats one path', () => {
    // Lessons 148 and 149 are two different videos whose index titles match
    // once whitespace is collapsed. Assert the pair exists before relying on it.
    const w148 = courseFilesFor(stageOf('s029-s035'), 's030');
    const videos = w148.filter((f) => f.kind === 'video');
    expect(videos).toHaveLength(2);
    expect(videos[0].title).toBe(videos[1].title);
    expect(videos[0].path).not.toBe(videos[1].path);
    expect(lessonsOf(videos)).toEqual([148, 149]);

    // One file referenced from several entries appears once: the band book
    // every part of the radif's چهارمضراب carries.
    const w246 = courseFilesFor(stageOf('s093-s106'), 's101');
    const book = `${K.mediaPath}/نت ۴ - تار ۳ قطعات ضربی.pdf`;
    expect(entriesOf('w246').length).toBe(7);
    expect(w246.filter((f) => f.path === book)).toHaveLength(1);

    // And across EVERY identity: nothing dropped, nothing repeated — the list
    // is exactly the distinct paths of every entry, whatever their titles.
    for (const key of SHIPPED_WORK_KEYS) {
      const [stageId, entryKey] = entriesOf(key)[0];
      const got = courseFilesFor(stageId, entryKey).map((f) => f.path);
      expect(new Set(got).size).toBe(got.length);
      expect([...got].sort()).toEqual([...new Set(identityFiles(key).map((f) => f.path))].sort());
    }
  });

  it('a mixed section yields each work it teaches as its own row and becomes no work itself', () => {
    const stage3 = K.groups.find((g) => g.key === 's014-s023')!;
    const unit = (key: string) => units.find(({ unit: u }) => u.key === key)!.unit;

    // Section 17 teaches two works, in lessons 109 and 110; it is neither.
    expect(unit('s017').workKey).toBeUndefined();
    expect(REPERTOIRE_STRANDS.has(unit('s017').strand)).toBe(false);
    expect(lessonsOf(unit('s017').files)).toEqual([107, 108, 109, 110]);
    const taught = stage3.works.filter((w) => lessonsOf(w.files ?? []).some((n) => n === 109 || n === 110));
    expect(taught.map((w) => w.key)).toEqual(['w109', 'w110']);
    expect(lessonsOf(taught[0].files ?? [])).toEqual([109]);
    expect(lessonsOf(taught[1].files ?? [])).toEqual([110]);

    // پیش‌درآمد ابوعطا is ONE row carrying exactly lessons 124 and 125, although
    // they sit in sections 21 and 22 — neither of which is a work.
    const abuAta = stage3.works.find((w) => w.key === 'w124')!;
    expect(abuAta.title).toBe('پیش‌درآمد ابوعطا');
    expect(lessonsOf(abuAta.files ?? [])).toEqual([124, 125]);
    expect(stage3.works.filter((w) => lessonsOf(w.files ?? []).some((n) => n === 124 || n === 125))).toHaveLength(1);
    for (const key of ['s021', 's022']) {
      expect(unit(key).workKey).toBeUndefined();
      expect(REPERTOIRE_STRANDS.has(unit(key).strand)).toBe(false);
    }
    const added = add([], stageOf('s014-s023'), 'w124');
    expect(added.item.title).toBe('پیش‌درآمد ابوعطا');
    expect(isWork(added.item)).toBe(true);
    expect(lessonsOf(courseFilesFor(added.item.stageId!, added.item.catalogKey!))).toEqual([124, 125]);
    // Adding the section beside it is practice material, never a second work.
    const section = add(added.items, stageOf('s014-s023'), 's021');
    expect(section.created).toBe(true);
    expect(isWork(section.item)).toBe(false);
    expect(section.item.title).toBe('قطعه‌نوازی ۱');
  });

  it('no Khonyagar section carries a repertoire strand unless it is a work', () => {
    for (const { group, unit } of units) {
      expect(REPERTOIRE_STRANDS.has(unit.strand)).toBe(!!unit.workKey);
      expect(!!unit.workTitle).toBe(!!unit.workKey);
      const entry = catalogForStage(stageOf(group.key)).find((e) => e.key === unit.key)!;
      expect(isWork(add([], stageOf(group.key), entry.key).item)).toBe(!!unit.workKey);
    }
    for (const { work } of rows) expect(REPERTOIRE_STRANDS.has(work.strand ?? 'piece')).toBe(true);
    // Not vacuous: both kinds exist in the real data.
    expect(units.filter(({ unit }) => !unit.workKey).length).toBeGreaterThan(20);
    expect(units.filter(({ unit }) => unit.workKey).length).toBeGreaterThan(20);
  });

  it('joins a performance section only where the work table says so and never merges on a ZWNJ difference', () => {
    const sectionsOf = (identity: string) => units.filter(({ unit }) => unit.workKey === identity).map(({ unit }) => unit.key);
    expect(sectionsOf('w197')).toEqual(['s052', 's053', 's054', 's055', 's056', 's057']);
    expect(sectionsOf('w192')).toEqual(['s048', 's049', 's050', 's051']);

    // The titles are kept exactly as the index writes them: parts one to four
    // with a space, part five with a ZWNJ. Nothing folds them — the join is the
    // work table's, and the same composer's رنگ is a different work.
    const title = (key: string) => units.find(({ unit }) => unit.key === key)!.unit.title;
    for (const key of ['s052', 's053', 's054', 's055']) expect(title(key).startsWith('پیش درآمد ماهور')).toBe(true);
    expect(title('s056').startsWith('پیش\u200cدرآمد ماهور')).toBe(true);
    const stem = (key: string) => title(key).split(' - ')[0];
    expect(stem('s056')).not.toBe(stem('s052'));
    expect(stem('s056').replace(/[\u200c\s]/g, '')).toBe(stem('s052').replace(/[\u200c\s]/g, ''));

    // Performances («اجرای …») join exactly the work the table names…
    for (const [key, identity] of [['s048', 'w192'], ['s057', 'w197'], ['s063', 'w206'], ['s104', 'w246']] as const) {
      expect(title(key).startsWith('اجرای')).toBe(true);
      expect(units.find(({ unit }) => unit.key === key)!.unit.workKey).toBe(identity);
    }
    // …and a section holding «اجرای تمرین تک ریز» — a performed EXERCISE — is no work.
    expect(units.find(({ unit }) => unit.key === 's031')!.unit.workKey).toBeUndefined();

    // Titles that fold equal under ZWNJ/space removal are NOT an identity: the
    // app resolves by declared key only. Two entries with one folded title
    // stay two unless the table joined them.
    const fold = (s: string) => s.replace(/[\u200c\s]/g, '');
    const all = [
      ...units.map(({ group, unit }) => ({ stage: stageOf(group.key), key: unit.key, title: unit.workTitle ?? unit.title, id: unit.workKey })),
      ...rows.map(({ group, work }) => ({ stage: stageOf(group.key), key: work.key, title: work.title, id: work.workKey ?? work.key })),
    ];
    let pairs = 0;
    for (const a of all) {
      for (const b of all) {
        if (a === b || fold(a.title) !== fold(b.title) || (a.id && a.id === b.id)) continue;
        pairs++;
        const first = add([], a.stage, a.key);
        expect(add(first.items, b.stage, b.key).created).toBe(true);
      }
    }
    expect(pairs).toBeGreaterThan(0);
  });

  it('keeps two distinct works that share a title apart', () => {
    // Ma'rufi's چهارمضراب ماهور (section 26) and the radif's (95–104).
    const marufi = add([], stageOf('s024-s028'), 'w138');
    expect(marufi.item.title).toBe('چهارمضراب ماهور از موسی معروفی');
    const radif = add(marufi.items, stageOf('s093-s106'), 's095');
    expect(radif.created).toBe(true);
    expect(radif.item.id).not.toBe(marufi.item.id);
    expect(carriedCourseWorkItem(stageOf('s093-s106'), 's095', marufi.items)).toBeUndefined();
    const a = courseFilesFor(stageOf('s024-s028'), 'w138').map((f) => f.path);
    const b = courseFilesFor(stageOf('s093-s106'), 's095').map((f) => f.path);
    expect(lessonsOf(courseFilesFor(stageOf('s024-s028'), 'w138'))).toEqual([138, 139]);
    expect(a.filter((p) => b.includes(p))).toEqual([]);
    // And section 85 is a third.
    const third = add(radif.items, stageOf('s075-s092'), 's085');
    expect(third.created).toBe(true);
    expect(new Set([marufi.item.id, radif.item.id, third.item.id]).size).toBe(3);

    // Identical authored titles still give distinct identities: three کرشمه,
    // two رنگ شور.
    const kereshmeh = add([], stageOf('s024-s028'), 'w135');
    const kereshmeh59 = add(kereshmeh.items, stageOf('s046-s059'), 's059');
    expect(kereshmeh.item.title).toBe(kereshmeh59.item.title);
    expect(kereshmeh59.created).toBe(true);
    const shur = add([], stageOf('s029-s035'), 's030');
    const shur32 = add(shur.items, stageOf('s029-s035'), 'w153');
    expect(shur32.created).toBe(true);
    expect(courseFilesFor(stageOf('s029-s035'), 'w153').some((f) => lessonOf(f) === 148)).toBe(false);
  });

  it('a Khonyagar work never reuses an item from another course or instrument', () => {
    const honarestan = stageIdFor('tar-honarestan', 'chahar-mezrab');
    const setarMahur = stageIdFor('setar-radif', 'mahur');
    const others: PracticeItem[] = [
      // A Guitar item that somehow holds a Khonyagar-shaped key.
      createItem({ instrumentId: 'g', title: 'چهارمضراب ماهور', stageId: 'cgs-2c', catalogKey: 'w246' }, NOW),
      // The owner's Setar piece of the same name, in a Setar stage and outside any stage.
      createItem({ instrumentId: 's', title: 'چهارمضراب ماهور', stageId: setarMahur, catalogKey: 'w246' }, NOW),
      createItem({ instrumentId: 's', title: 'گوشه زنگوله', catalogKey: 'w259' }, NOW),
      // The Honarestān pathway's own Tar item.
      createItem({ instrumentId: 't', title: 'چهارمضراب ماهور', stageId: honarestan, catalogKey: 's095' }, NOW),
    ];
    for (const [stageId, key] of [
      [stageOf('s093-s106'), 's095'],
      [stageOf('s093-s106'), 's106'],
      [stageOf('s006-s013'), 'w063'],
    ]) {
      expect(carriedCourseWorkItem(stageId, key, others)).toBeUndefined();
      const plan = planCatalogAddition({ items: others, materials: [] }, stageId, key, catalogForStage(stageId).find((e) => e.key === key), 't', NOW);
      expect(plan.created).toBe(true);
      expect(others.map((i) => i.id)).not.toContain(plan.itemId);
    }
    // And the other way round: a Khonyagar item is never a Guitar work.
    const tar = add([], stageOf('s093-s106'), 's095').items;
    const cgs = CGS_COURSE.groups.find((g) => g.works.length > 0)!;
    const cgsStage = courseStageId(CGS_COURSE, cgs.key);
    expect(carriedCourseWorkItem(cgsStage, cgs.works[0].key, tar)).toBeUndefined();
  });

  it('a Khonyagar stage builds no routine while every Guitar level still builds its own', () => {
    for (const g of K.groups) {
      expect(g.routine).toEqual([]);
      // Even with every section and work of the stage added.
      let items: PracticeItem[] = [];
      for (const e of catalogForStage(stageOf(g.key))) items = add(items, stageOf(g.key), e.key).items;
      expect(stageUnits(stageRecord(g.key), items).every((u) => !!u.item)).toBe(true);
      expect(buildLevelRoutine(K, g.key, items)).toEqual([]);
      expect(buildPositionRoutine(K, g.key, items)).toEqual([]);
    }
    for (const g of CGS_COURSE.groups) {
      expect(g.routine.length).toBeGreaterThan(0);
      expect(buildLevelRoutine(CGS_COURSE, g.key, []).length).toBe(g.routine.length);
    }
    // And the pathway seeds no routine for the course.
    expect(seedPathways(IDS, NOW).pathwayRoutines.filter((r) => r.pathwayId === K.pathwayId)).toEqual([]);
  });

  it('a Khonyagar work carries its own guidance and never the Guitar packet note', () => {
    const packet = /practice packet/;
    const guide = new Set(Object.values(KHONYAGAR_LESSON_TYPES));
    expect(guide.size).toBe(5);
    const radif = KHONYAGAR_LESSON_TYPES.radif;
    expect(radif.startsWith('**Radif / gusheh / āvāz:**')).toBe(true);
    for (const g of K.groups) {
      for (const e of catalogForStage(stageOf(g.key))) {
        expect(guide.has(e.notes ?? '')).toBe(true);
        expect(e.notes).not.toMatch(packet);
        const item = add([], stageOf(g.key), e.key).item;
        expect(item.notes).toBe(e.notes);
        if (item.itemType === 'gusheh') expect(item.notes).toBe(radif);
      }
    }
    // A work row in particular — the entries that used to take the packet note.
    expect(catalogForStage(stageOf('s014-s023')).find((e) => e.key === 'w124')?.notes).toBe(KHONYAGAR_LESSON_TYPES.composed);
    expect(catalogForStage(stageOf('s024-s028')).find((e) => e.key === 'w135')?.notes).toBe(radif);
    // Guitar works keep their sentence.
    const cgsWorks = CGS_COURSE.groups.flatMap((g) => g.works.map((w) => ({ g, w })));
    expect(cgsWorks.length).toBeGreaterThan(0);
    for (const { g, w } of cgsWorks) {
      const entry = catalogForStage(courseStageId(CGS_COURSE, g.key)).find((e) => e.key === w.key)!;
      expect(entry.notes).toBe(
        `Optional repertoire from the Level ${g.code} practice packet. Learn it when it appeals — nothing here is a deadline.`,
      );
    }
  });
});
