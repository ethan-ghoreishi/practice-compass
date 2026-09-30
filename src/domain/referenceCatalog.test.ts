import { describe, expect, it } from 'vitest';
import {
  catalogForStage,
  planDefaultPathways,
  RADIF_PATHWAY_IDS,
  SEED_PATHWAY_IDS,
  seedPathways,
  stageIdFor,
} from './pathwaySeed';
import {
  catalogReferenceId,
  courseFilesFor,
  courseFilesForReference,
  courseStageId,
  planCatalogAddition,
  resolveCatalogReference,
} from './courseSeed';
import { CGS_COURSE } from './courseData';
import { KHONYAGAR_COURSE } from './khonyagarData';
import {
  currentStage,
  linkCandidates,
  nextUnitInStage,
  pathwayProgress,
  pathwayStageContext,
  planLinkReference,
  planRemoveFromPathway,
  settleLegacyEvidence,
  planStageAddition,
  stageProgress,
  stageUnits,
  unlinkedInStage,
} from './pathways';
import { itemFiles } from './itemFiles';
import { serializeExport, validateDB } from './io';
import { createSeedDB } from './seed';
import { MIRZA_ABDOLLAH_RADIF } from './referenceCatalog';
import { vocabulary, valueLabel } from './musicTerms';
import type { PathwayStage, PracticeDB, PracticeItem } from './types';
import LEGACY_TEXT from '../../tests/fixtures/repertoire-legacy-v14.json?raw';

const NOW = new Date('2026-09-28T10:00:00.000Z');
const IDS = { guitar: 'g', setar: 's', tar: 't' };

/** A database holding every shipped default pathway on these three instruments. */
function everyPathway(): PracticeDB {
  const base = createSeedDB(NOW);
  const instruments = [
    { id: 'g', name: 'Classical Guitar', family: 'Western', active: true, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() },
    { id: 's', name: 'Setar', family: 'Persian', active: true, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() },
    { id: 't', name: 'Tar', family: 'Persian', active: true, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() },
  ];
  const legacy = seedPathways(IDS, NOW);
  const db: PracticeDB = { ...base, instruments, items: [], blocks: [], reviews: [], lessonAgenda: [], lessons: [], materials: [], ...legacy };
  return { ...db, ...planDefaultPathways(db, [RADIF_PATHWAY_IDS.setar, RADIF_PATHWAY_IDS.tar], NOW) };
}

const stageOf = (db: PracticeDB, id: string) => db.pathwayStages.find((s) => s.id === id)!;
const add = (db: PracticeDB, stageId: string, key: string, instrumentId: string) => {
  const entry = catalogForStage(stageId).find((e) => e.key === key);
  const plan = planCatalogAddition(db, stageId, key, entry, instrumentId, NOW);
  return { db: { ...db, items: plan.items, materials: plan.materials }, plan };
};

describe('catalogue identity', () => {
  it('catalogue identity survives placement changes across every consumer', () => {
    // A Guitar section, added the ordinary way.
    const base = everyPathway();
    const onebChords = courseStageId(CGS_COURSE, '1b');
    const { db: added, plan } = add(base, onebChords, 'chords', 'g');
    const id = plan.itemId;
    expect(plan.created).toBe(true);
    const ref = catalogReferenceId(onebChords, 'chords');
    expect(added.items.find((i) => i.id === id)!.catalogRefs).toEqual([ref]);
    const expectedFiles = courseFilesFor(onebChords, 'chords').map((f) => f.path);
    expect(expectedFiles.length).toBeGreaterThan(0);

    const moveTo = (db: PracticeDB, stageId: string | undefined): PracticeDB => ({
      ...db,
      items: db.items.map((i) => (i.id === id ? { ...i, stageId } : i)),
    });
    const withoutStage = (db: PracticeDB, stageId: string): PracticeDB => ({
      ...moveTo(db, undefined),
      pathwayStages: db.pathwayStages.filter((s) => s.id !== stageId),
    });
    const withoutPathway = (db: PracticeDB): PracticeDB => ({
      ...moveTo(db, undefined),
      pathways: db.pathways.filter((p) => p.id !== 'cgs'),
      pathwayStages: db.pathwayStages.filter((s) => s.pathwayId !== 'cgs'),
    });
    const reload = (db: PracticeDB): PracticeDB => validateDB(JSON.parse(serializeExport(db, NOW)));

    const scenarios: [string, PracticeDB][] = [
      ['as added', added],
      ['moved to another level', moveTo(added, courseStageId(CGS_COURSE, '2b'))],
      ['detached from every stage', moveTo(added, undefined)],
      ['its stage deleted', withoutStage(added, onebChords)],
      ['its pathway deleted', withoutPathway(added)],
      ['moved, then reloaded', reload(moveTo(added, courseStageId(CGS_COURSE, '2b')))],
      ['detached, then reloaded', reload(moveTo(added, undefined))],
    ];
    const seededStage = seedPathways(IDS, NOW).pathwayStages.find((s) => s.id === onebChords)!;

    for (const [name, db] of scenarios) {
      // ROW: the suggestion shows the SAME item, wherever it sits now.
      const units = stageUnits(seededStage, db.items, { instrumentId: 'g' });
      expect(units.find((u) => u.key === 'chords')?.item?.id, name).toBe(id);
      // PROGRESS counts it once, as added.
      expect(stageProgress(units).addedItems, name).toBe(1);
      // ADD, even repeated from a stale screen, hands back the same item: no copy.
      const again = add(db, onebChords, 'chords', 'g');
      expect([again.plan.created, again.plan.itemId], name).toEqual([false, id]);
      const twice = add(again.db, onebChords, 'chords', 'g');
      expect(twice.plan.itemId, name).toBe(id);
      expect(twice.db.items.filter((i) => i.catalogRefs?.includes(ref)), name).toHaveLength(1);
      // START uses that id (the stage page starts `addFromCatalog(...).id`).
      expect(twice.db.items.some((i) => i.id === id), name).toBe(true);
      // COURSE MATERIAL follows the reference, not the placement.
      const files = itemFiles(db, id).filter((f) => f.source === 'reference').map((f) => (f.source === 'reference' ? f.path : ''));
      expect(files, name).toEqual(expectedFiles);
      // NEXT SUGGESTION never offers the added section as untaken.
      expect(nextUnitInStage(seededStage, db.items, { instrumentId: 'g' })?.key === 'chords' && !nextUnitInStage(seededStage, db.items, { instrumentId: 'g' })?.item, name).toBe(false);
    }

    // SAME GENERIC KEY, DISTINCT CONTEXT: 2B's `chords` is a different
    // suggestion, and 1B's item never answers it.
    const twob = courseStageId(CGS_COURSE, '2b');
    expect(catalogReferenceId(twob, 'chords')).not.toBe(ref);
    expect(resolveCatalogReference(catalogReferenceId(twob, 'chords'), 'g', added.items).status).toBe('absent');
    const second = add(added, twob, 'chords', 'g');
    expect(second.plan.created).toBe(true);
    expect(second.plan.itemId).not.toBe(id);

    // A DECLARED SHARED COURSE WORK is one item across levels (courseWorkKey).
    const workRows = CGS_COURSE.groups.flatMap((g) => g.works.map((w) => ({ stageId: courseStageId(CGS_COURSE, g.key), key: w.key, identity: w.workKey ?? w.key })));
    const shared = workRows.find((r) => workRows.some((o) => o.identity === r.identity && o.stageId !== r.stageId))!;
    const other = workRows.find((o) => o.identity === shared.identity && o.stageId !== shared.stageId)!;
    const first = add(base, shared.stageId, shared.key, 'g');
    const carried = add(first.db, other.stageId, other.key, 'g');
    expect([carried.plan.created, carried.plan.itemId]).toEqual([false, first.plan.itemId]);
  });

  it('catalogue linking preserves owner records and refuses ambiguous automatic reuse', () => {
    const db = validateDB(JSON.parse(LEGACY_TEXT));
    const shur = stageIdFor(SEED_PATHWAY_IDS.setar, 'shur');
    const stage: PathwayStage = db.pathwayStages.find((s) => s.id === shur)!;
    const ref = catalogReferenceId(shur, 'daramad-e-shur');
    const a = db.items.find((i) => i.id === 'it-daramad-a')!;
    const b = db.items.find((i) => i.id === 'it-daramad-b')!;

    // 1. Two legacy items answer one suggestion: nothing is picked, both stay.
    const unit = stageUnits(stage, db.items, { instrumentId: 'inst-setar' }).find((u) => u.key === 'daramad-e-shur')!;
    expect(unit.item).toBeUndefined();
    expect(unit.candidates!.map((i) => i.id).sort()).toEqual(['it-daramad-a', 'it-daramad-b']);
    // …and both still appear in the stage as the owner's own items.
    expect(stageUnits(stage, db.items, { instrumentId: 'inst-setar' }).filter((u) => u.item && ['it-daramad-a', 'it-daramad-b'].includes(u.item.id))).toHaveLength(2);
    // Add refuses to create a third copy or to guess.
    const refusedAdd = planCatalogAddition(db, shur, 'daramad-e-shur', catalogForStage(shur).find((e) => e.key === 'daramad-e-shur'), 'inst-setar', NOW);
    expect([refusedAdd.created, refusedAdd.itemId, refusedAdd.items]).toEqual([false, '', db.items]);
    expect(refusedAdd.candidates!.map((i) => i.id).sort()).toEqual(['it-daramad-a', 'it-daramad-b']);

    // 2. Titles are CANDIDATES, not authority: the same title only sorts first.
    const candidates = linkCandidates(db.items, 'inst-setar', 'درآمد شور');
    expect(candidates[0].id).toBe('it-daramad-a');
    expect(candidates.every((i) => i.instrumentId === 'inst-setar')).toBe(true);

    // 3. An explicit Link changes the binding and NOTHING else about the item.
    // 3a. While the two are UNDECIDED candidates, neither may be linked
    //     somewhere else: deciding one would silently hand «درآمد شور» to the
    //     other. Nor may either leave its stage — by a move, Remove from
    //     pathway, or a deleted stage — for the same reason. Nothing changes.
    const rohab = catalogReferenceId(shur, 'rohab');
    const golriz = catalogReferenceId(shur, 'golriz');
    expect(planLinkReference(db, rohab, 'it-daramad-a', 'inst-setar', NOW)).toMatchObject({ ok: false, reason: expect.stringMatching(/Choose which one/) });
    expect(planLinkReference(db, golriz, 'it-daramad-b', 'inst-setar', NOW)).toMatchObject({ ok: false });
    expect(planRemoveFromPathway(db, 'it-daramad-a', SEED_PATHWAY_IDS.setar, NOW)).toMatchObject({ ok: false });
    for (const move of [
      { stageId: undefined },
      { stageId: stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari') },
      { instrumentId: 'inst-tar' },
    ]) {
      const moved = db.items.map((i) => (i.id === 'it-daramad-b' ? { ...i, ...move } : i));
      expect(settleLegacyEvidence(db, moved, NOW), JSON.stringify(move)).toMatchObject({ ok: false });
    }
    // A UNIQUE legacy answer is kept by deciding it when its item moves; an
    // item with no evidence passes through untouched (same array back).
    const iraqMoved = db.items.map((i) => (i.id === 'it-iraq' ? { ...i, stageId: undefined } : i));
    const keptIraq = settleLegacyEvidence(db, iraqMoved, NOW);
    expect(keptIraq.ok && keptIraq.items.find((i) => i.id === 'it-iraq')!.catalogRefs).toEqual(['radif:mirza-abdollah:afshari:iraq']);
    const plain = db.items.map((i) => (i.id === 'it-title-only' ? { ...i, stageId: shur } : i));
    expect(settleLegacyEvidence(db, plain, NOW)).toEqual({ ok: true, items: plain });
    // An undecided item moved INTO a stage where its key happens to name a
    // suggestion never silently becomes its answer.
    const into = db.items.map((i) => (i.id === 'it-kereshmeh-moved' ? { ...i, stageId: shur } : i));
    const settledInto = settleLegacyEvidence(db, into, NOW);
    expect(settledInto.ok && settledInto.items.find((i) => i.id === 'it-kereshmeh-moved')!.catalogRefs).toEqual([]);

    // …and an item that is NOT a candidate may not take the disputed
    // suggestion, nor one another item answers through unique legacy
    // evidence: either would overrule a record the owner never chose against.
    expect(planLinkReference(db, ref, 'it-title-only', 'inst-setar', NOW)).toMatchObject({ ok: false });
    const onlyB = { ...db, items: db.items.filter((i) => i.id !== 'it-daramad-a') };
    expect(planLinkReference(onlyB, ref, 'it-title-only', 'inst-setar', NOW)).toMatchObject({ ok: false, reason: expect.stringMatching(/already answers/) });
    const stillOnlyB = resolveCatalogReference(ref, 'inst-setar', onlyB.items);
    expect(stillOnlyB.status === 'bound' && stillOnlyB.item.id).toBe('it-daramad-b');

    // 3b. Choosing one candidate FOR the disputed suggestion is the explicit choice.
    const linked = planLinkReference(db, ref, 'it-daramad-b', 'inst-setar', NOW);
    expect(linked.ok).toBe(true);
    const items = linked.ok ? linked.items : [];
    const after = items.find((i) => i.id === 'it-daramad-b')!;
    const strip = (i: PracticeItem) => ({ ...i, catalogRefs: undefined, updatedAt: undefined });
    expect(strip(after)).toEqual(strip(b));
    expect(after.catalogRefs).toEqual([ref]);
    expect(items.find((i) => i.id === 'it-daramad-a')).toBe(a);
    const resolved = resolveCatalogReference(ref, 'inst-setar', items);
    expect(resolved.status === 'bound' && resolved.item.id).toBe('it-daramad-b');

    // 4. A second item cannot silently take a suggestion another already answers.
    expect(planLinkReference({ ...db, items }, ref, 'it-daramad-a', 'inst-setar', NOW)).toMatchObject({ ok: false });
    // Once chosen, the other candidate is free to answer something else — and
    // does NOT carry the disputed suggestion along: the choice stands, and the
    // result is a database reload accepts.
    const elsewhere = planLinkReference({ ...db, items }, rohab, 'it-daramad-a', 'inst-setar', NOW);
    expect(elsewhere.ok && elsewhere.items.find((i) => i.id === 'it-daramad-a')!.catalogRefs).toEqual([rohab]);
    const chosen = elsewhere.ok ? elsewhere.items : [];
    expect(() => validateDB({ ...db, items: chosen })).not.toThrow();
    const stillB = resolveCatalogReference(ref, 'inst-setar', chosen);
    expect(stillB.status === 'bound' && stillB.item.id).toBe('it-daramad-b');

    // 5. Several references may deliberately name ONE item.
    const afshariDaramad = catalogReferenceId(stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari'), 'daramad');
    const both = planLinkReference(db, afshariDaramad, 'it-iraq', 'inst-setar', NOW);
    expect(both.ok && both.items.find((i) => i.id === 'it-iraq')!.catalogRefs).toEqual([
      'radif:mirza-abdollah:afshari:iraq',
      afshariDaramad,
    ]);

    // 6. Cross-instrument reuse is refused: Tar work is never Setar evidence.
    expect(planLinkReference(db, ref, 'it-tar-afshari', 'inst-setar', NOW)).toMatchObject({ ok: false });
    expect(resolveCatalogReference('radif:mirza-abdollah:afshari:iraq', 'inst-tar', db.items).status).toBe('absent');
    // …and nothing on the stage page links by title on its own.
    expect(stageUnits(stage, db.items, { instrumentId: 'inst-setar' }).find((u) => u.key === 'kereshmeh')!.item).toBeUndefined();

    // 7. PLACING AN OWNED ITEM IS NOT LINKING IT — and Add beside it never mints
    //    a silent second copy. The ordinary journey: an item the owner already
    //    has is given a stage from Item Detail (stageId only, through the same
    //    settle step every placement write passes).
    const every = everyPathway();
    const abuAta = stageIdFor(SEED_PATHWAY_IDS.setar, 'abu-ata');
    const sayakhi = catalogReferenceId(abuAta, 'sayakhi');
    const owned: PracticeItem = {
      ...db.items.find((i) => i.id === 'it-title-only')!,
      id: 'it-sayakhi-owned',
      instrumentId: 's',
      title: 'سیخی-ابوعطا-ردیف-میرزاعبدالله',
      notes: 'teacher: slower in the second phrase',
      timesPractised: 3,
      stageId: undefined,
      catalogKey: undefined,
      catalogRefs: undefined,
    };
    const before: PracticeDB = { ...every, items: [owned] };
    const placedWrite = settleLegacyEvidence(before, [{ ...owned, stageId: abuAta }], NOW);
    expect(placedWrite.ok).toBe(true);
    const placedDb: PracticeDB = { ...before, items: placedWrite.ok ? placedWrite.items : [] };
    const placedItem = placedDb.items[0];
    expect(placedItem.catalogRefs).toBeUndefined(); // placement decided no identity
    const abuStage = stageOf(placedDb, abuAta);
    const setarCtx = pathwayStageContext(placedDb.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar));

    // The stage says so: the suggestion is untaken, and the placed item's own
    // row names it as answering no suggestion (one clear flag, never a merge).
    expect(unlinkedInStage(abuAta, placedDb.items, 's').map((i) => i.id)).toEqual(['it-sayakhi-owned']);
    const rows = stageUnits(abuStage, placedDb.items, setarCtx);
    expect(rows.find((u) => u.key === 'sayakhi')!.item).toBeUndefined();
    expect(rows.filter((u) => u.item?.id === 'it-sayakhi-owned').map((u) => u.unlinked)).toEqual([true]);
    // …a Tar instance never counts a Setar item placed beside its stages.
    expect(unlinkedInStage(abuAta, placedDb.items, 't')).toEqual([]);

    // Add (and Play, which adds through the same planner) on ANY untaken
    // suggestion of that stage creates NOTHING while the placed item is
    // unlinked: it hands the item back to be chosen.
    for (const key of ['sayakhi', 'hejaz']) {
      const entry = catalogForStage(abuAta).find((e) => e.key === key);
      const asked = planStageAddition(placedDb, abuAta, key, entry, 's', NOW);
      expect([asked.created, asked.itemId, asked.items], key).toEqual([false, '', placedDb.items]);
      expect(asked.placed!.map((i) => i.id), key).toEqual(['it-sayakhi-owned']);
    }
    const sayakhiEntry = catalogForStage(abuAta).find((e) => e.key === 'sayakhi');

    // LINK is the owner's explicit answer: one item, every owner field kept,
    // one row, and Add now reuses it.
    const linkedPlaced = planLinkReference(placedDb, sayakhi, 'it-sayakhi-owned', 's', NOW);
    expect(linkedPlaced.ok).toBe(true);
    const linkedDb: PracticeDB = { ...placedDb, items: linkedPlaced.ok ? linkedPlaced.items : [] };
    expect(linkedDb.items).toHaveLength(1);
    expect(strip(linkedDb.items[0])).toEqual(strip(placedItem));
    const linkedRows = stageUnits(abuStage, linkedDb.items, setarCtx);
    expect(linkedRows.filter((u) => u.item?.id === 'it-sayakhi-owned').map((u) => [u.key, u.unlinked])).toEqual([['sayakhi', undefined]]);
    const reAdd = planStageAddition(linkedDb, abuAta, 'sayakhi', sayakhiEntry, 's', NOW);
    expect([reAdd.created, reAdd.itemId, reAdd.items, reAdd.placed]).toEqual([false, 'it-sayakhi-owned', linkedDb.items, undefined]);
    // The stage's OTHER suggestions are no longer held: the placed item now
    // answers one of them, so Add creates exactly what was asked for.
    const hejaz = planStageAddition(linkedDb, abuAta, 'hejaz', catalogForStage(abuAta).find((e) => e.key === 'hejaz'), 's', NOW);
    expect([hejaz.created, hejaz.items.length, hejaz.placed]).toEqual([true, 2, undefined]);

    // "Add as a new item" is the other explicit answer: one new item, bound,
    // the placed one untouched — and a second Add reuses the new one.
    const separate = planStageAddition(placedDb, abuAta, 'sayakhi', sayakhiEntry, 's', NOW, true);
    expect(separate.created).toBe(true);
    expect(separate.items).toHaveLength(2);
    expect(separate.items[0]).toBe(placedItem);
    const separateDb: PracticeDB = { ...placedDb, items: separate.items, materials: separate.materials };
    const again = planStageAddition(separateDb, abuAta, 'sayakhi', sayakhiEntry, 's', NOW);
    expect([again.created, again.itemId, again.items]).toEqual([false, separate.itemId, separate.items]);
    expect(() => validateDB({ ...separateDb })).not.toThrow();
  });

  it('Setar and Tar share reference definitions without sharing practice state', () => {
    const db = everyPathway();
    const setarStage = (slug: string) => stageIdFor(RADIF_PATHWAY_IDS.setar, slug);
    const tarStage = (slug: string) => stageIdFor(RADIF_PATHWAY_IDS.tar, slug);

    // ONE definition: both instances present the same entries under the same references.
    for (const d of MIRZA_ABDOLLAH_RADIF.dastgahs) {
      const s = catalogForStage(setarStage(d.slug));
      const t = catalogForStage(tarStage(d.slug));
      expect(s.map((e) => [e.key, e.title, e.persian]), d.slug).toEqual(t.map((e) => [e.key, e.title, e.persian]));
      expect(s.map((e) => catalogReferenceId(setarStage(d.slug), e.key))).toEqual(t.map((e) => catalogReferenceId(tarStage(d.slug), e.key)));
      // …and the mixed Setar pathway's modal stage is the SAME reference too.
      expect(s.map((e) => catalogReferenceId(stageIdFor(SEED_PATHWAY_IDS.setar, d.slug), e.key))).toEqual(
        s.map((e) => catalogReferenceId(setarStage(d.slug), e.key)),
      );
    }

    // REPEATED GUSHEH NAMES STAY SCOPED by recension and dastgāh.
    const refFor = (slug: string, title: string) => {
      const e = catalogForStage(setarStage(slug)).find((x) => x.title === title)!;
      return catalogReferenceId(setarStage(slug), e.key);
    };
    expect(refFor('abu-ata', 'درآمد')).not.toBe(refFor('afshari', 'درآمد'));
    expect(refFor('segah', 'زابل')).not.toBe(refFor('chahargah', 'زابل'));
    expect(refFor('afshari', 'جامه‌دران')).not.toBe(refFor('esfahan', 'جامه‌دران'));
    const fruds = MIRZA_ABDOLLAH_RADIF.dastgahs.map((d) => refFor(d.slug, 'فرود'));
    expect(new Set(fruds).size).toBe(MIRZA_ABDOLLAH_RADIF.dastgahs.length);

    // NEW gusheh items arrive classified: their dastgāh term and their gusheh name.
    const vocab = vocabulary();
    const setarAdd = add(db, setarStage('afshari'), 'iraq', 's');
    const setarItem = setarAdd.db.items.find((i) => i.id === setarAdd.plan.itemId)!;
    expect(setarItem.persian).toEqual({ dastgahAvaz: { termId: 'dastgah:afshari' }, gusheh: 'عراق' });
    expect(valueLabel(setarItem.persian!.dastgahAvaz, vocab)).toBe('افشاری');

    // INDEPENDENT PRACTICE: the Tar instance does not see Setar's item…
    const tarCtx = pathwayStageContext(db.pathways.find((p) => p.id === RADIF_PATHWAY_IDS.tar));
    const tarAfshari = stageOf(setarAdd.db, tarStage('afshari'));
    expect(stageUnits(tarAfshari, setarAdd.db.items, tarCtx).find((u) => u.key === 'iraq')!.item).toBeUndefined();
    // …adding there creates Tar's own, and each instrument resolves to its own.
    const tarAdd = add(setarAdd.db, tarStage('afshari'), 'iraq', 't');
    expect(tarAdd.plan.created).toBe(true);
    expect(tarAdd.plan.itemId).not.toBe(setarItem.id);
    const ref = catalogReferenceId(tarStage('afshari'), 'iraq');
    const both = tarAdd.db.items;
    expect([resolveCatalogReference(ref, 's', both), resolveCatalogReference(ref, 't', both)].map((r) => r.status === 'bound' && r.item.id)).toEqual([
      setarItem.id,
      tarAdd.plan.itemId,
    ]);
    // Progress is per instrument: Setar's practised gusheh never completes Tar's stage.
    const practised = both.map((i) => (i.id === setarItem.id ? { ...i, status: 'integrated' as const, timesPractised: 9 } : i));
    const setarCtx = pathwayStageContext(db.pathways.find((p) => p.id === RADIF_PATHWAY_IDS.setar));
    expect(stageProgress(stageUnits(stageOf(db, setarStage('afshari')), practised, setarCtx)).done).toBe(1);
    expect(stageProgress(stageUnits(tarAfshari, practised, tarCtx)).done).toBe(0);
    expect(pathwayProgress(db.pathwayStages, practised, RADIF_PATHWAY_IDS.tar, tarCtx).done).toBe(0);
    expect(currentStage(db.pathwayStages, practised, RADIF_PATHWAY_IDS.tar, undefined, tarCtx)?.id).toBe(tarStage('shur'));

    // EXISTING COURSE IDENTITIES ARE INTACT: a Khonyagar work's reference
    // composes exactly the material its own entry always did, and a Guitar
    // section's likewise (the full fingerprint is khonyagarCourse.test.ts's).
    const kGroup = KHONYAGAR_COURSE.groups.find((g) => g.units.some((u) => u.workKey))!;
    const kUnit = kGroup.units.find((u) => u.workKey)!;
    const kStage = courseStageId(KHONYAGAR_COURSE, kGroup.key);
    const kRef = catalogReferenceId(kStage, kUnit.key);
    expect(kRef).toBe(`course:${KHONYAGAR_COURSE.id}:work:${kUnit.workKey}`);
    expect(courseFilesForReference(kRef)).toEqual(courseFilesFor(kStage, kUnit.key));
    const cgs1b = courseStageId(CGS_COURSE, '1b');
    expect(courseFilesForReference(catalogReferenceId(cgs1b, 'chords'))).toEqual(courseFilesFor(cgs1b, 'chords'));
    // No Honarestān entry is a radif reference: it keeps its own stage scope.
    const honarestan = seedPathways(IDS, NOW).pathwayStages.filter((s) => s.pathwayId === SEED_PATHWAY_IDS.tar);
    for (const s of honarestan) for (const e of catalogForStage(s.id)) expect(catalogReferenceId(s.id, e.key)).toBe(`stage:${s.id}:${e.key}`);
  });
});
