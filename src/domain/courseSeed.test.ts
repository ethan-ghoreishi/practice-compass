import { describe, expect, it } from 'vitest';
import { CGS_COURSE } from './courseData';
import {
  COURSE_LEGACY_KEYS,
  buildLevelRoutine,
  buildPositionRoutine,
  carriedCourseWorkItem,
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
import { stageUnits } from './pathways';
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
const STAGE_1A = courseStageId(CGS_COURSE, '1a');
const STAGE_3A = courseStageId(CGS_COURSE, '3a');
const STAGE_3B = courseStageId(CGS_COURSE, '3b');
const STAGE_2F = courseStageId(CGS_COURSE, '2f');
const STAGE_3F = courseStageId(CGS_COURSE, '3f');

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

type Pair = readonly [string, string];

/** The files ONE catalogue entry declares in the generated data, read directly. */
function declaredEntries([stageId, key]: Pair): Array<{ path: string; title: string }> {
  const g = group(stageId.replace('cgs-', ''));
  const unit = g.units.find((u) => u.key === key);
  if (unit) return unit.files;
  const work = g.works.find((w) => w.key === key);
  return work?.file ? [{ path: work.file, title: work.title }] : [];
}

function declaredFiles(entry: Pair): string[] {
  return declaredEntries(entry).map((f) => f.path);
}

/**
 * Every repertoire identity this course names from MORE THAN ONE catalogue
 * entry, read out of the generated data rather than written down here — the
 * two declared aliases and every packet work the course carries across levels.
 */
function multiEntryIdentities(): Array<{ identity: string; entries: Pair[] }> {
  const byIdentity = new Map<string, Pair[]>();
  const push = (id: string, entry: Pair) => byIdentity.set(id, [...(byIdentity.get(id) ?? []), entry]);
  for (const g of CGS_COURSE.groups) {
    const stageId = courseStageId(CGS_COURSE, g.key);
    for (const u of g.units) if (u.workKey) push(u.workKey, [stageId, u.key]);
    for (const w of g.works) push(w.workKey ?? w.key, [stageId, w.key]);
  }
  return [...byIdentity]
    .filter(([, entries]) => entries.length > 1)
    .map(([identity, entries]) => ({ identity, entries }));
}

/** Taking a list of suggestions in order, through the real addition path. */
function addAll(pairs: readonly Pair[]): PracticeItem[] {
  let db = { items: [] as PracticeItem[], materials: [] as Material[] };
  for (const [stageId, key] of pairs) {
    const entry = catalogForStage(stageId).find((e) => e.key === key);
    if (!entry) throw new Error(`no catalog entry ${stageId}/${key}`);
    const plan = planCatalogAddition(db, stageId, key, entry, 'g', NOW);
    db = { items: plan.items, materials: plan.materials };
  }
  return db.items;
}

// --- ac-1 -------------------------------------------------------------------

describe('what a course entry becomes in My repertoire', () => {
  const entries = catalogForStage(STAGE_1B);
  const g = group('1b');

  it("a level's study and packet works are repertoire works and its drill sections are not", () => {
    // The level's OWN study IS the Piece section, named as the course names it
    // — a repertoire work at the level the owner actually meets it, with the
    // whole section's material rather than one loose PDF lifted out of it.
    expect(entries.find((e) => e.key === 'piece')?.title).toBe('1B Piece — Study #1');
    expect(isWork(added(STAGE_1B, 'piece'))).toBe(true);
    expect(courseFilesFor(STAGE_1B, 'piece')).toEqual(g.units.find((u) => u.key === 'piece')!.files);

    // EVERY level whose Piece section names one study, including the two whose
    // study is a "Full course" with no study sheet of its own.
    for (const key of ['1c', '1d', '1e', '1f', '2a', '2b', '2c', '2d', '2e', '2f', '3b', '3d', '3e']) {
      const stageId = courseStageId(CGS_COURSE, key);
      expect(isWork(added(stageId, 'piece')), `${key}'s study did not reach My repertoire`).toBe(true);
    }

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

    // A PIECE SECTION THE COURSE NAMES NO SINGLE WORK FOR IS NOT A WORK
    // EITHER. 3C ("Excerpts + Fur Elise, Minuet in G, Red is the Rose") and 3F
    // ("Repertoire + Video Review") are practice on material named elsewhere;
    // the scanner already DIAGNOSED that it could not name a study there and
    // then kept the `piece` strand anyway, so both became full_piece items
    // titled after the section. Their real works reach My repertoire as the
    // packet works, which is the whole rule: repertoire only where the course
    // NAMES a work.
    for (const key of ['3c', '3f']) {
      const stageId = courseStageId(CGS_COURSE, key);
      const section = catalogForStage(stageId).find((e) => e.key === 'piece');
      // The KEY is untouched — keys are added, never renamed (ac-15).
      expect(section, `${key} lost its piece entry`).toBeDefined();
      expect(section!.strand).not.toBe('piece');
      expect(isWork(added(stageId, 'piece')), `${key}'s piece section reached My repertoire`).toBe(false);
      expect(
        CGS_COURSE.diagnostics.some((d) =>
          d.startsWith(`${key.toUpperCase()}: the Piece section is practice material, not a repertoire work — it names no single work`),
        ),
      ).toBe(true);
      // Its named packet works still do.
      const works = group(key).works;
      expect(works.length).toBeGreaterThan(0);
      for (const w of works) expect(isWork(added(stageId, w.key)), `${w.key}`).toBe(true);
    }

    // AND A DOWNLOAD IN A SHEET-MUSIC LIST IS NOT AUTOMATICALLY A WORK EITHER —
    // the same rule one level down. 3F's list carries "Here's the video review
    // checklist" beside four real pieces, and it became a repertoire work
    // called exactly that. It is an AID, so it is not a work; it is still
    // reachable, because it is one of that section's own files.
    const aid = /syllabus|materials|course notes|checklist/i;
    for (const g of CGS_COURSE.groups) {
      for (const w of g.works) expect(aid.test(w.title), `${g.key}: "${w.title}" reached My repertoire`).toBe(false);
    }
    expect(
      courseFilesFor(courseStageId(CGS_COURSE, '3f'), 'piece').some((f) => /Video-Review-Checklist/.test(f.path)),
    ).toBe(true);
  });

  it('emits no separate study entry beside the Piece section, which would repertoire it twice', () => {
    expect(g.works.some((w) => w.title === 'Study #1')).toBe(false);
    expect(entries.filter((e) => /Study #1/.test(e.title))).toHaveLength(1);
  });

  it("a level's study and a packet entry for the same work are ONE repertoire item", () => {
    // ONE MUSICAL WORK, ONE REPERTOIRE ITEM — and the owner takes it at the
    // level they meet it. The Piece SECTION and the packet works are two
    // entries the course can name one piece by, so each carries that work's
    // IDENTITY and the second tap hands back the first item. Both sealed
    // counterexamples, in BOTH addition orders:
    //
    //  (a) WITHIN a level: 3B's section studies Malagueña and its packet named
    //      the same score. The scanner drops the packet entry outright there —
    //      the section IS that work and the PDF is already one of its files —
    //      so the level offers it exactly once.
    expect(group('3b').works).toEqual([]);
    const malaguena = catalogForStage(STAGE_3B).filter((e) => e.strand === 'piece');
    expect(malaguena.map((e) => e.key)).toEqual(['piece']);
    expect(malaguena[0].title).toBe('3B Piece — Malagueña by Lecuona');
    expect(repertoireWorks(addAll([[STAGE_3B, 'piece']])).map((w) => w.work.title)).toEqual([
      '3B Piece — Malagueña by Lecuona',
    ]);
    expect(courseFilesFor(STAGE_3B, 'piece').some((f) => /Lecuona-Malaguena/.test(f.path))).toBe(true);

    //  (b) ACROSS levels, where there is no shared file at all — 2E's own
    //      folder holds no copy of the Valse — and the two titles only a fuzzy
    //      match would join. The identity is DECLARED in the scanner from the
    //      course's own words, so both entries resolve to one item whichever
    //      is added first, INCLUDING when the later level is added first.
    const pairs: Array<[Pair, Pair, string]> = [
      [[STAGE_2E, 'piece'], [STAGE_3F, 'work-carulli-valse-op-50-no-7-1'], '2E Piece — Carulli Valse Op.50 No.7'],
      [[STAGE_2F, 'piece'], [STAGE_3F, 'work-sor-etude-no-1-op-44-practice-packet'], '2F Piece — Fernando Sor Etude #1 Op.44'],
    ];
    for (const [study, packet, studyTitle] of pairs) {
      const studyFirst = addAll([study, packet]);
      expect(studyFirst, `${study[0]} then ${packet[1]}`).toHaveLength(1);
      expect(repertoireWorks(studyFirst).map((w) => w.work.title)).toEqual([studyTitle]);

      const packetFirst = addAll([packet, study]);
      expect(packetFirst, `${packet[1]} then ${study[0]}`).toHaveLength(1);
      expect(repertoireWorks(packetFirst)).toHaveLength(1);

      // The row at the OTHER level shows the existing item rather than an
      // untaken suggestion, so its “+” can never report “Added” for something
      // it did not create and Undo can never reach it.
      const item = studyFirst[0];
      expect(stageUnits(stage(packet[0]), [item]).find((u) => u.key === packet[1])?.item?.id).toBe(item.id);
      expect(stageUnits(stage(study[0]), [item]).find((u) => u.key === 'piece')?.item?.id).toBe(item.id);
      const entry = catalogForStage(packet[0]).find((e) => e.key === packet[1]);
      expect(planCatalogAddition({ items: [item], materials: [] }, packet[0], packet[1], entry, 'g', NOW).created).toBe(
        false,
      );

      // AND THE ROUTINE BINDS TO IT. Taken from the later level, the work is
      // still the study level's own Piece section, so that level's routine
      // segment binds and its position routine counts the section as added —
      // the row and the binding are one resolution, not two.
      const fromPacket = addAll([packet])[0];
      const levelKey = study[0].replace('cgs-', '');
      const pieceSeg = buildLevelRoutine(CGS_COURSE, levelKey, [fromPacket]).find((seg) =>
        /Piece/.test(seg.label),
      );
      expect(pieceSeg?.itemId, `${levelKey} routine did not bind its Piece segment`).toBe(fromPacket.id);
      expect(
        buildPositionRoutine(CGS_COURSE, levelKey, [fromPacket]).some((seg) => seg.itemId === fromPacket.id),
      ).toBe(true);

      // AND ITS MATERIAL IS THE WORK'S, NEVER THE ENTRY'S. Composing from the
      // item's own stage and catalogue key alone made the files depend on
      // WHICH entry created it — 2E's section material or 3F's score, never
      // both — so the one item the identity rule produces was half a work
      // whichever way round it was added. Both entries compose the IDENTICAL
      // list, not merely the same set: the scan is course-ordered.
      const studyFiles = courseFilesFor(study[0], study[1]);
      expect(courseFilesFor(packet[0], packet[1]), `${study[1]} vs ${packet[1]}`).toEqual(studyFiles);
      // It is a UNION, not one side quietly winning: the packet's own score is
      // in it, and so is the section's own material.
      const packetScore = group(packet[0].replace('cgs-', '')).works.find((w) => w.key === packet[1])!.file;
      expect(studyFiles.map((f) => f.path), packet[1]).toContain(packetScore);
      for (const f of group(study[0].replace('cgs-', '')).units.find((u) => u.key === 'piece')!.files) {
        expect(studyFiles, f.path).toContainEqual(f);
      }
      // And the ONE item composes exactly that, whichever entry created it.
      for (const items of [studyFirst, packetFirst]) {
        const paths = itemFiles(dbWith(items), items[0].id).map((f) => (f as ItemFileReference).path);
        expect(paths, `created from ${items[0].catalogKey}`).toEqual(studyFiles.map((f) => f.path));
      }
    }

    // AN ORDINARY PER-STAGE KEY CARRIES NO IDENTITY, so nothing above leaks
    // into it: `chords` exists at every level and is never joined across them.
    expect(carriedCourseWorkItem(STAGE_1C, 'chords', [added(STAGE_1B, 'chords')])).toBeUndefined();
    // — including for its MATERIAL, which is the half the widening above could
    // have leaked into: 1C's chords section composes 1C's files and no other
    // level's, because an ordinary per-stage key names no work at all.
    expect(courseFilesFor(STAGE_1C, 'chords')).toEqual(group('1c').units.find((u) => u.key === 'chords')!.files);

    // The packet's own arm of the same rule, which holds today and is what a
    // level bought later could quietly break: one score is one key, so a
    // re-titled reappearance can never become a second work.
    //
    // THIS ONE KEEPS ITS BASENAME READING ON PURPOSE, and is not the defect
    // `courseFilesFor` was just fixed for. That one DROPPED a file silently;
    // this one FAILS LOUDLY — a course that ever shipped two different scores
    // under one basename breaks this assertion rather than hiding anything,
    // which is exactly the visibility the sealed finding asked for. Weakening
    // it to compare paths would let a re-titled reappearance mint a second
    // work, which is the identity design the contract fences off.
    const byScore = new Map<string, Set<string>>();
    for (const w of CGS_COURSE.groups.flatMap((x) => x.works)) {
      const score = w.file?.split('/').pop();
      if (!score) continue;
      byScore.set(score, (byScore.get(score) ?? new Set()).add(w.workKey ?? w.key));
    }
    for (const [score, keys] of byScore) expect([...keys], score).toHaveLength(1);
  });

  it('treats a Piece section naming two works as practice material, never one work', () => {
    // 3A: "Tarrega Study in C + Canon in D". Two distinct works cannot be one
    // repertoire item, and the stage already offers each of them separately —
    // so the section keeps its key, its title and its material, and the two
    // works are what reach My repertoire.
    const section = catalogForStage(STAGE_3A).find((e) => e.key === 'piece');
    expect(section?.title).toBe('3A Piece — Tarrega Study in C + Canon in D');
    expect(section?.strand).not.toBe('piece');
    expect(isWork(added(STAGE_3A, 'piece'))).toBe(false);
    expect(courseFilesFor(STAGE_3A, 'piece').length).toBeGreaterThan(0);
    expect(
      CGS_COURSE.diagnostics.some((d) =>
        d.startsWith('3A: the Piece section is practice material, not a repertoire work — it names 2 works'),
      ),
    ).toBe(true);

    const works = group('3a').works;
    expect(works).toHaveLength(2);
    expect(repertoireWorks(addAll(works.map((w) => [STAGE_3A, w.key] as const)))).toHaveLength(2);
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

    // AND THE LATER LEVEL SAYS SO. Reuse that only the store could see left 2E
    // showing an untaken suggestion: its “+” handed back the 2C item while
    // reporting “Added”, and the Undo beside that message then offered to
    // delete an item created at another level weeks earlier. One resolution,
    // one answer on every surface — so the row shows the existing item...
    const unit = stageUnits(stage(STAGE_2E), [first]).find((u) => u.key === CARRIED);
    expect(unit?.item?.id).toBe(first.id);
    // ...and the plan reports that it created NOTHING, which is what stops an
    // Undo ever reaching it.
    expect(plan.created).toBe(false);

    // The reuse is bounded to the course. An identically-keyed item in a stage
    // no course owns is never adopted.
    const stranger = { ...added(STAGE_2C, CARRIED), id: 'stranger', stageId: 'setar-radif-mezrab' };
    const fresh = planCatalogAddition({ items: [stranger], materials: [] }, STAGE_2E, CARRIED, entry, 'g', NOW);
    expect(fresh.created).toBe(true);
    expect(fresh.itemId).not.toBe('stranger');
    expect(stageUnits(stage(STAGE_2E), [stranger]).find((u) => u.key === CARRIED)?.item).toBeUndefined();
  });

  it('holds for EVERY identity this course names twice, in both addition orders', () => {
    // THE SWEEP, NOT THE COUNTEREXAMPLE. The two declared aliases are the pair
    // a reviewer happened to name; the course names nine more identities from
    // more than one entry, and every one of them has the same two orders and
    // the same four consumers. Enumerating them from the DATA rather than by
    // hand is what makes a regenerated course — a fourth Ferrer level, a new
    // alias — swept too, instead of silently falling outside a written list.
    const sets = multiEntryIdentities();
    expect(sets.map((x) => x.identity)).toEqual(
      expect.arrayContaining(['work-carulli-valse-op-50-no-7', 'work-fernando-sor-etude-1-op-44']),
    );
    expect(sets.length).toBeGreaterThan(2);

    for (const { identity, entries } of sets) {
      // Every entry naming this work composes the SAME material — the work's,
      // never the entry's. This is the half that was order-dependent.
      const paths = courseFilesFor(...entries[0]).map((f) => f.path);
      for (const e of entries) {
        expect(courseFilesFor(...e).map((f) => f.path), `${identity} at ${e[0]}/${e[1]}`).toEqual(paths);
      }
      // And it is a UNION, not merely agreement: every entry's OWN declared
      // files are in the one list all of them compose. Without this a
      // regression that let the LAST matching entry win would still have every
      // entry agreeing with every other and pass unnoticed. Compared by the
      // whole PATH — every declared file survives composition, never merely one
      // per basename.
      for (const e of entries) {
        const own = declaredFiles(e);
        expect(own.length, `${identity}: ${e[0]}/${e[1]} declares nothing`).toBeGreaterThan(0);
        for (const f of own) expect(paths, `${identity}: ${e[0]}/${e[1]}`).toContain(f);
      }

      const first = entries[0];
      const last = entries[entries.length - 1];
      for (const order of [[first, last], [last, first]] as const) {
        const why = `${identity}: ${order[0][1]} then ${order[1][1]}`;
        const items = addAll(order);
        expect(items, why).toHaveLength(1);
        expect(repertoireWorks(items), why).toHaveLength(1);
        // ONE item, and the WHOLE work's material on it either way round.
        expect(itemFiles(dbWith(items), items[0].id).map((f) => (f as ItemFileReference).path), why).toEqual(paths);
        // Every level that names it shows that item as added, and no tap there
        // claims to have created it — so no Undo can reach it.
        for (const [stageId, key] of entries) {
          expect(stageUnits(stage(stageId), items).find((u) => u.key === key)?.item?.id, `${why} @ ${stageId}`).toBe(
            items[0].id,
          );
          const entry = catalogForStage(stageId).find((e) => e.key === key);
          expect(
            planCatalogAddition({ items, materials: [] }, stageId, key, entry, 'g', NOW).created,
            `${why} @ ${stageId}`,
          ).toBe(false);
        }
      }
    }
  });

  it('keeps every distinct path, even when two share a basename AND a title', () => {
    // THE DEDUP KEY IS THE PATH, AND NOTHING WEAKER. It used to be the
    // BASENAME, to keep the copy of one packet the course ships in each level
    // folder that names it from appearing four times — but a basename is not a
    // file's identity. Two genuinely different scores sharing one (two
    // revisions of Ferrer-Ejercicio.pdf) had the second silently dropped, and
    // nothing on the item said a score was missing. Nothing in this data
    // establishes content identity — a CourseFile is a path, a kind and a
    // title — so completeness wins: a repeated packet is one visible extra row,
    // a hidden one is material the owner cannot see.
    //
    // Driven from the LIVE data rather than a fixture, and from the hardest
    // shape there is: paths the old key could not tell apart even with the
    // title added, which is exactly the counterexample's own shape.
    const collisions = multiEntryIdentities()
      .map(({ identity, entries }) => {
        const byNameAndTitle = new Map<string, Set<string>>();
        for (const e of entries) {
          for (const f of declaredEntries(e)) {
            const k = `${f.path.split('/').pop()}\u0000${f.title}`;
            byNameAndTitle.set(k, (byNameAndTitle.get(k) ?? new Set()).add(f.path));
          }
        }
        return { identity, entries, shared: [...byNameAndTitle.values()].filter((ps) => ps.size > 1) };
      })
      .filter((x) => x.shared.length > 0);

    // NON-VACUITY FIRST. A regenerated course that stopped shipping duplicate
    // basenames would otherwise pass this while asserting nothing at all.
    expect(collisions.length, 'no basename collision left to prove anything with').toBeGreaterThan(0);
    expect(collisions.map((x) => x.identity)).toContain('work-ferrer-ejercicio');

    for (const { identity, entries, shared } of collisions) {
      const composed = courseFilesFor(...entries[0]).map((f) => f.path);
      // Every distinct path survives, and the ROW COUNT says so: a set
      // comparison alone would pass a list that had quietly collapsed them.
      for (const ps of shared) {
        for (const path of ps) expect(composed, `${identity}: ${path}`).toContain(path);
        expect(composed.filter((c) => ps.has(c)).length, identity).toBe(ps.size);
      }
      // And all the way out to the real item's Material, where each copy is its
      // own row with its own stable id rather than a collision.
      const items = addAll([entries[0]]);
      const files = itemFiles(dbWith(items), items[0].id) as ItemFileReference[];
      for (const ps of shared) for (const path of ps) expect(files.map((f) => f.path), identity).toContain(path);
      expect(new Set(files.map((f) => f.id)).size, identity).toBe(files.length);
    }
  });

  it('still creates it the first time, and never reuses across an ordinary per-stage key', () => {
    const chords1B = added(STAGE_1B, 'chords');
    const entry = catalogForStage(STAGE_1C).find((e) => e.key === 'chords');
    const plan = planCatalogAddition({ items: [chords1B], materials: [] }, STAGE_1C, 'chords', entry, 'g', NOW);
    expect(plan.itemId).not.toBe(chords1B.id);
    expect(plan.items).toHaveLength(2);
    expect(plan.created).toBe(true);

    // The ordinary per-stage reuse reports the same thing, so an Undo after
    // tapping “+” on a row that was already added deletes nothing either.
    const again = planCatalogAddition({ items: [chords1B], materials: [] }, STAGE_1B, 'chords', entry, 'g', NOW);
    expect(again.itemId).toBe(chords1B.id);
    expect(again.created).toBe(false);
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

  it("composes it for a hand-authored level's own keys too, which name the same sections", () => {
    // Level 1A's fourteen steps predate this course data and the contract keeps
    // them byte for byte, so their keys are slugs of their own titles
    // (`warm-up-stretches`) and match no course unit key (`warm-up`). Left at
    // that, 1A was the ONE level whose items got no course material at all —
    // on the very level the owner starts from. The keys are untouched; what is
    // added is a reading of which course section each one names.
    const catalog = catalogForStage(STAGE_1A);
    expect(catalog.length).toBe(14);

    // EVERY ALIAS NAMES A REAL ENTRY. A stale one would alias nothing and no
    // test would notice, which is exactly how fourteen dead entries ship.
    const keys = new Set(catalog.map((e) => e.key));
    const units = new Set(group('1a').units.map((u) => u.key));
    for (const [unitKey, legacy] of Object.entries(COURSE_LEGACY_KEYS[STAGE_1A])) {
      expect(units.has(unitKey), `no course unit ${unitKey}`).toBe(true);
      for (const k of legacy) expect(keys.has(k), `no 1A catalogue entry ${k}`).toBe(true);
    }

    // The Forest Glade reads the course's own Piece section, and the two
    // right-hand steps share the one Right Hand Technique section the course
    // writes them both from.
    expect(courseFilesFor(STAGE_1A, 'piece-the-forest-glade')).toEqual(
      group('1a').units.find((u) => u.key === 'piece')!.files,
    );
    expect(courseFilesFor(STAGE_1A, 'chunks-right-hand-only')).toEqual(
      courseFilesFor(STAGE_1A, 'thumb-chunks-right-hand-only'),
    );
    // Composed, never stored, exactly as for every other level.
    const glade = added(STAGE_1A, 'piece-the-forest-glade');
    const files = itemFiles(dbWith([glade]), glade.id);
    expect(files.length).toBeGreaterThan(0);
    expect(glade.references ?? []).toEqual([]);

    // Thirteen of the fourteen resolve. The one that does not is named rather
    // than given a guessed section's videos: no course section clearly
    // corresponds to "Technique primer — What is Technique".
    const without = catalog.filter((e) => courseFilesFor(STAGE_1A, e.key).length === 0);
    expect(without.map((e) => e.key)).toEqual(['technique-primer-what-is-technique']);
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

  it("binds a hand-authored level's carried-forward essentials to the items that stand for them", () => {
    // 1B's "where I am" carries 1A's essentials forward — and 1A is the level
    // whose catalogue keys are hand-authored, so before this those three
    // segments could NEVER bind to an item however much 1A the owner had
    // added: unbound countdowns on the level they have actually practised.
    const oneA = catalogForStage(STAGE_1A).map((e) => added(STAGE_1A, e.key));
    const position = buildPositionRoutine(CGS_COURSE, '1b', oneA);
    expect(position.map((s) => s.label)).toEqual([
      '1A Warm Up',
      '1A Right Hand Technique (*Most important going forward *)',
      '1A Piece — The Forest Glade',
    ]);
    expect(position.every((s) => s.itemId)).toBe(true);
    const glade = oneA.find((i) => i.catalogKey === 'piece-the-forest-glade');
    expect(position[2].itemId).toBe(glade!.id);

    // And 1A's own "where I am" is no longer EMPTY with all fourteen added,
    // which is the shape the gap took: it had no previous level and could
    // match none of its own sections either, so it built nothing at all.
    const own1A = buildPositionRoutine(CGS_COURSE, '1a', oneA);
    expect(own1A).toHaveLength(group('1a').routine.length);
    expect(own1A.every((s) => s.itemId)).toBe(true);

    // 1A's OWN routine binds the same way, and a many-to-one section takes the
    // first of the keys it stands for that has an item — deterministic, never
    // whichever the array happened to hold first.
    expect(buildLevelRoutine(CGS_COURSE, '1a', oneA).every((s) => s.itemId)).toBe(true);
    const onlyThumb = oneA.filter((i) => i.catalogKey === 'thumb-chunks-right-hand-only');
    expect(
      buildLevelRoutine(CGS_COURSE, '1a', onlyThumb).find((s) => /Right Hand Technique/.test(s.label))?.itemId,
    ).toBe(onlyThumb[0].id);
    // And an empty 1A still carries the maintenance as unbound countdowns
    // rather than fabricating a binding.
    expect(buildPositionRoutine(CGS_COURSE, '1b', []).every((s) => s.itemId === undefined)).toBe(true);
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
