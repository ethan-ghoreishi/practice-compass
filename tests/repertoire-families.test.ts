import { afterEach, describe, expect, it, vi } from 'vitest';
import LEGACY_TEXT from './fixtures/repertoire-legacy-v14.json?raw';
import CURRENT_TEXT from './fixtures/repertoire-current-v15.json?raw';
import EXPECT_TEXT from './fixtures/repertoire-family-expectations.json?raw';
import { serializeExport, validateDB } from '../src/domain/io';
import { migrateToCurrent } from '../src/domain/migrations';
import { SCHEMA_VERSION, type PracticeDB, type PracticeItem } from '../src/domain/types';
import {
  catalogForStage,
  LEGACY_SEED_TIME,
  offeredDefaultPathways,
  planDefaultPathways,
  RADIF_PATHWAY_IDS,
  SEED_PATHWAY_IDS,
  stageIdFor,
} from '../src/domain/pathwaySeed';
import {
  hiddenUnits,
  nextUnitInStage,
  pathwayStageContext,
  planRemoveFromPathway,
  planSetReferenceHidden,
  stageProgress,
  stageUnits,
} from '../src/domain/pathways';
import { catalogReferenceId, planCatalogAddition, resolveCatalogReference } from '../src/domain/courseSeed';
import { discoverRepertoire, repertoireWorks } from '../src/domain/repertoire';
import STAGE_DETAIL_SRC from '../src/pages/StageDetail.tsx?raw';
import ITEM_DETAIL_SRC from '../src/pages/ItemDetail.tsx?raw';

// ---------------------------------------------------------------------------
// The focused family proof for the v15 repertoire model, over COMMITTED
// fixtures and HAND-AUTHORED expectations (tests/fixtures/). Family A (terms),
// B (references) and C (inbound boundary) at the domain level; the rendered
// doors and both browser engines are in the *.browser.test.ts beside this.
// Run the whole route with `node scripts/check-repertoire-families.mjs`.
// ---------------------------------------------------------------------------

// The store is driven for real (ac-11, ac-22). Its persist storage is an
// in-memory stand-in, exactly as src/store/archiveIndex.test.ts does it:
// Dexie has no IndexedDB to talk to in Node.
const fakeStorage = vi.hoisted(() => {
  let value: string | null = null;
  return { get: () => value, set: (v: string | null) => (value = v) };
});
vi.mock('../src/store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/store/idb')>();
  return {
    ...actual,
    clearBlobs: async () => undefined,
    deleteBlob: async () => undefined,
    allBlobs: async () => [],
    heldBlobIds: async () => new Set<string>(),
    storageSettled: () => Promise.resolve(),
    idbStorage: {
      getItem: async () => fakeStorage.get(),
      setItem: async (_n: string, v: string) => void fakeStorage.set(v),
      removeItem: async () => void fakeStorage.set(null),
    },
  };
});
const { useStore } = await import('../src/store/useStore');

const EXPECT = JSON.parse(EXPECT_TEXT);
const legacyRaw = () => JSON.parse(LEGACY_TEXT);
const currentRaw = () => JSON.parse(CURRENT_TEXT);
const NOW = new Date('2026-09-28T10:00:00.000Z');
const byId = (db: PracticeDB, id: string) => db.items.find((i) => i.id === id)!;

afterEach(() => vi.useRealTimers());

/** Validate the same bytes under a pinned wall clock. */
function underClock(date: string, raw: unknown): PracticeDB {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(date));
  try {
    return validateDB(raw);
  } finally {
    vi.useRealTimers();
  }
}

describe('Family C — the v15 inbound boundary', () => {
  it('repertoire v15 migration is deterministic idempotent and lossless', () => {
    for (const [name, raw] of [
      ['legacy v14', legacyRaw],
      ['current v15', currentRaw],
    ] as const) {
      // 1. DETERMINISTIC across clocks, and IDEMPOTENT across repeated runs.
      const a = underClock('2026-01-01T00:00:00Z', raw());
      const b = underClock('2031-12-31T23:59:59Z', raw());
      expect(JSON.stringify(b), name).toBe(JSON.stringify(a));
      expect(JSON.stringify(validateDB(a)), name).toBe(JSON.stringify(a));
      expect(JSON.stringify(validateDB(JSON.parse(serializeExport(a, NOW)))), name).toBe(JSON.stringify(a));
      // …and independent of the ORDER records arrive in.
      const reversed = raw();
      reversed.data.items.reverse();
      reversed.data.materials.reverse();
      const r = validateDB(reversed);
      for (const item of a.items) expect(byId(r, item.id), `${name} ${item.id}`).toEqual(item);
      expect(a.schemaVersion).toBe(SCHEMA_VERSION);
    }

    // 2. LOSSLESS: the legacy fixture's every id and authored string survives;
    //    the ONLY changes are decided bindings and keyed course sources.
    const source = legacyRaw().data as PracticeDB;
    const migrated = validateDB(legacyRaw());
    const want = EXPECT.legacy;
    expect(migrated.musicTerms).toEqual(want.musicTerms);
    expect(migrated.items.map((i) => i.id)).toEqual(source.items.map((i) => i.id));
    for (const before of source.items) {
      const after = byId(migrated, before.id);
      const { catalogRefs, ...rest } = after;
      expect(rest, before.id).toEqual(before);
      expect(catalogRefs, before.id).toEqual(want.bindings[before.id]);
    }
    expect(migrated.items.filter((i) => i.catalogRefs === undefined).map((i) => i.id).sort()).toEqual(want.undecided);
    for (const [id, persian] of Object.entries(want.verbatimPersian)) expect(byId(migrated, id).persian).toEqual(persian);
    for (const m of source.materials) {
      const { sourceKey, ...rest } = migrated.materials.find((x) => x.id === m.id)!;
      expect(rest).toEqual(m);
      expect(sourceKey, m.id).toBe(want.sourceKeys[m.id]);
    }
    // Nothing else moved: history, reviews, agenda, lessons, routines,
    // attachments and pathways are byte-equal. No deletion waiver.
    for (const key of ['blocks', 'reviews', 'lessonAgenda', 'lessons', 'pathwayRoutines', 'attachments', 'pathways', 'pathwayStages'] as const) {
      expect(migrated[key], key).toEqual(source[key]);
    }
    // Ambiguous legacy evidence is kept, not resolved: both records remain.
    for (const [ref, ids] of Object.entries(want.ambiguous as Record<string, string[]>)) {
      const r = resolveCatalogReference(ref, 'inst-setar', migrated.items);
      expect(r.status === 'ambiguous' && r.candidates.map((i) => i.id).sort()).toEqual(ids);
    }

    // 3. PARTIAL current-schema data: a v15 file missing the collection gets
    //    an empty one; an intentionally EMPTY one stays empty; an unlinked item
    //    ([] — a decided "no") is never re-bound from its old placement.
    // (A reference to a custom term needs its term, so the one item pointing
    // at one is left out of these two — kept, it would be a dangling
    // reference, which the next test shows is refused.)
    const withoutCustomRefs = () => {
      const raw = currentRaw();
      raw.data.items = raw.data.items.filter((i: { id: string }) => i.id !== 'it-khatai');
      return raw;
    };
    const partial = withoutCustomRefs();
    delete partial.data.musicTerms;
    expect(validateDB(partial).musicTerms).toEqual([]);
    const emptied = withoutCustomRefs();
    emptied.data.musicTerms = [];
    const emptiedOut = validateDB(emptied);
    expect(emptiedOut.musicTerms).toEqual([]);
    expect(byId(emptiedOut, 'it-unlinked').catalogRefs).toEqual([]);
    const current = validateDB(currentRaw());
    for (const [id, refs] of Object.entries(EXPECT.current.bindings)) expect(byId(current, id).catalogRefs, id).toEqual(refs);
    expect(current.items.filter((i) => i.catalogRefs === undefined).map((i) => i.id).sort()).toEqual(EXPECT.current.undecided);
    expect(current.musicTerms).toEqual(currentRaw().data.musicTerms);

    // 4. PRE-v3 SEEDING is deterministic: a fixed, documented timestamp, never
    //    the wall clock.
    const v2 = () => ({
      schemaVersion: 2,
      instruments: [
        { id: 'i-setar', name: 'Setar', family: 'Persian', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      ],
      materials: [],
      items: [],
      blocks: [],
      reviews: [],
      curriculum: {},
    });
    const early = underClock('2027-03-01T00:00:00Z', v2());
    const late = underClock('2030-07-01T00:00:00Z', v2());
    expect(JSON.stringify(late)).toBe(JSON.stringify(early));
    expect(early.pathways.length).toBeGreaterThan(0);
    expect(new Set(early.pathways.map((p) => p.createdAt))).toEqual(new Set([LEGACY_SEED_TIME.toISOString()]));
    expect(JSON.stringify(migrateToCurrent(early, SCHEMA_VERSION))).toBe(JSON.stringify(early));
  });

  it('repertoire identity validation refuses malformed state without discarding legacy evidence', () => {
    const good = validateDB(currentRaw());
    const refuse = (label: string, mutate: (db: PracticeDB) => unknown, says: RegExp) => {
      const next = structuredClone(good) as PracticeDB;
      const out = mutate(next) ?? next;
      expect(() => validateDB(out), label).toThrow(says);
    };
    const setItem = (db: PracticeDB, id: string, patch: Record<string, unknown>) => {
      db.items = db.items.map((i) => (i.id === id ? ({ ...i, ...patch } as PracticeItem) : i));
    };

    // WRONG TYPES — refused, never coerced.
    refuse('collection not a list', (db) => ({ ...db, musicTerms: {} }), /must be a list/);
    refuse('term not a record', (db) => ({ ...db, musicTerms: ['شور'] }), /missing an id|not a record/);
    refuse('term without a name', (db) => void (db.musicTerms[1] = { ...db.musicTerms[1], name: '' }), /has no name/);
    refuse('aliases not text', (db) => void (db.musicTerms[1] = { ...db.musicTerms[1], aliases: [7] as never }), /alias list/);
    refuse('unknown kind', (db) => void (db.musicTerms[1] = { ...db.musicTerms[1], kind: 'raga' as never }), /unknown kind/);
    refuse('a number as a form', (db) => setItem(db, 'it-khatai', { persian: { form: 42 } }), /unreadable form/);
    refuse('an object that is not a reference', (db) => setItem(db, 'it-khatai', { persian: { form: { name: 'x' } } }), /unreadable form/);
    refuse('a non-text gusheh', (db) => setItem(db, 'it-khatai', { persian: { gusheh: ['a'] } }), /unreadable gusheh/);
    refuse('bindings not a list', (db) => setItem(db, 'it-iraq', { catalogRefs: 'radif' }), /reference list/);
    refuse('hides not a list', (db) => void (db.pathways[1] = { ...db.pathways[1], hiddenRefs: 'x' as never }), /hidden list/);
    // DUPLICATE NEW IDS.
    refuse('duplicate term id', (db) => void db.musicTerms.push({ ...db.musicTerms[1] }), /share the id/);
    refuse('built-in kind changed', (db) => void (db.musicTerms[0] = { ...db.musicTerms[0], kind: 'form' }), /changes the kind/);
    refuse('one suggestion named twice', (db) => setItem(db, 'it-iraq', { catalogRefs: ['radif:mirza-abdollah:afshari:iraq', 'radif:mirza-abdollah:afshari:iraq'] }), /twice/);
    refuse('a course key claimed twice', (db) => void db.materials.push({ ...db.materials[1], id: 'mat-cgs-2' }), /both claim/);
    // WRONG-KIND and DANGLING term references.
    refuse('dangling term', (db) => setItem(db, 'it-khatai', { persian: { form: { termId: 'term-gone' } } }), /does not exist/);
    refuse('wrong kind', (db) => setItem(db, 'it-khatai', { persian: { dastgahAvaz: { termId: 'form:reng' } } }), /form term/);
    // INVALID BINDINGS AND SUPPRESSION SCOPE.
    refuse('dangling suggestion', (db) => setItem(db, 'it-iraq', { catalogRefs: ['radif:mirza-abdollah:afshari:no-such'] }), /does not ship/);
    refuse('two items, one instrument, one suggestion', (db) => setItem(db, 'it-daramad-a', { catalogRefs: ['radif:mirza-abdollah:shur:daramad-e-shur'] }), /Two items/);
    refuse('hiding outside its pathway', (db) => void (db.pathways[2] = { ...db.pathways[2], hiddenRefs: ['stage:cgs-1b:chords'] }), /does not present/);
    refuse('unknown course key', (db) => void (db.materials[0] = { ...db.materials[0], sourceKey: 'course:nope' }), /unknown course key/);
    refuse('unsupported version', (db) => ({ ...db, schemaVersion: SCHEMA_VERSION + 1 }), /newer version/);

    // …WHILE unknown, ambiguous and composite legacy strings stay EXACT and usable.
    const lenient = structuredClone(good) as PracticeDB;
    lenient.musicTerms.push({ id: 'term-clash', kind: 'dastgah', name: 'Mine', aliases: ['Shour'], createdAt: 'x', updatedAt: 'x' });
    setItem(lenient, 'it-daramad-a', { persian: { dastgahAvaz: 'Shour', form: 'دوضربی', composer: 'فروتن', gusheh: 'درآمد' } });
    setItem(lenient, 'it-khatai', { persian: { dastgahAvaz: 'دشتی/شور', form: null } });
    const kept = validateDB(lenient);
    expect(byId(kept, 'it-daramad-a').persian).toEqual({ dastgahAvaz: 'Shour', form: 'دوضربی', composer: 'فروتن', gusheh: 'درآمد' });
    expect(byId(kept, 'it-khatai').persian).toEqual({ dastgahAvaz: 'دشتی/شور', form: null });
    const found = discoverRepertoire(kept, { instrumentId: 'inst-setar', text: 'فروتن' });
    expect(found.groups.flatMap((g) => g.works.map((w) => w.work.id))).toEqual(['it-daramad-a']);
    // Undecided legacy evidence (no catalogRefs) is never refused.
    expect(byId(kept, 'it-daramad-a').catalogRefs).toBeUndefined();
    // Validity never reads an instrument's NAME — the owner's editable text.
    // Renaming Setar to "Guitar" (or anything) leaves every binding as valid
    // as it was; which instrument a suggestion is offered on is decided where
    // a binding is made, against the pathway's own instrument id.
    const renamed = structuredClone(good) as PracticeDB;
    renamed.instruments = renamed.instruments.map((i) => (i.id === 'inst-setar' ? { ...i, name: 'Guitar' } : { ...i, name: 'سه‌تار' }));
    expect(() => validateDB(renamed)).not.toThrow();
  });
});

describe('Family B — reference suggestions', () => {
  it('hidden reference suggestions never delete or complete owned practice', () => {
    const db = validateDB(currentRaw());
    const mirza = db.pathways.find((p) => p.id === RADIF_PATHWAY_IDS.setar)!;
    const shur = stageIdFor(RADIF_PATHWAY_IDS.setar, 'shur');
    const stage = db.pathwayStages.find((s) => s.id === shur)!;
    const ref = catalogReferenceId(shur, 'daramad-e-shur');
    const exp = EXPECT.current.visibleUnits['setar-radif-mirza-shur'];

    // Already hidden in the fixture (rohab), and it round-tripped.
    let ctx = pathwayStageContext(mirza);
    expect(stageUnits(stage, db.items, ctx)).toHaveLength(exp.count);
    expect(hiddenUnits(stage, db.items, ctx).map((u) => u.key)).toEqual(exp.hidden);

    // HIDE the bound daramad suggestion — in THIS pathway only.
    const hid = planSetReferenceHidden(db.pathways, mirza.id, ref, true, NOW);
    expect(hid.ok).toBe(true);
    const after: PracticeDB = { ...db, pathways: hid.ok ? hid.pathways : db.pathways };
    // Survives a reload and a backup round trip.
    const reloaded = validateDB(JSON.parse(serializeExport(after, NOW)));
    expect(reloaded.pathways.find((p) => p.id === mirza.id)!.hiddenRefs).toEqual(['radif:mirza-abdollah:shur:rohab', ref]);
    ctx = pathwayStageContext(reloaded.pathways.find((p) => p.id === mirza.id));
    const units = stageUnits(stage, reloaded.items, ctx);
    expect(units.find((u) => u.key === 'daramad-e-shur')).toBeUndefined();
    expect(hiddenUnits(stage, reloaded.items, ctx).map((u) => u.key)).toEqual(['daramad-e-shur', 'rohab']); // catalogue order
    // The OWNED item is untouched and still in My repertoire and its own placement.
    expect(byId(reloaded, 'it-daramad-b')).toEqual(byId(db, 'it-daramad-b'));
    expect(repertoireWorks(reloaded.items).some((w) => w.work.id === 'it-daramad-b')).toBe(true);
    // Other contexts are unaffected: the old pathway still shows it bound.
    const oldShur = reloaded.pathwayStages.find((s) => s.id === stageIdFor(SEED_PATHWAY_IDS.setar, 'shur'))!;
    const oldCtx = pathwayStageContext(reloaded.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar));
    expect(stageUnits(oldShur, reloaded.items, oldCtx).find((u) => u.key === 'daramad-e-shur')!.item?.id).toBe('it-daramad-b');
    // An EXPLICITLY PLACED item stays visible in the stage even when its suggestion is hidden.
    const placed = reloaded.items.map((i) => (i.id === 'it-daramad-b' ? { ...i, stageId: shur } : i));
    expect(stageUnits(stage, placed, ctx).some((u) => u.item?.id === 'it-daramad-b')).toBe(true);

    // PROGRESS and NEXT SUGGESTION use the same visible set; hiding is not completion.
    const before = stageProgress(stageUnits(stage, db.items, pathwayStageContext(mirza)));
    const hiddenProgress = stageProgress(units);
    expect(hiddenProgress.done).toBe(before.done);
    expect(hiddenProgress.total).toBe(before.total - 1);
    expect(nextUnitInStage(stage, reloaded.items, ctx)?.key).not.toBe('daramad-e-shur');
    // Hiding EVERY suggestion leaves an empty stage — never a mastered one.
    const allRefs = catalogForStage(shur).map((e) => catalogReferenceId(shur, e.key));
    const everything = { ...mirza, hiddenRefs: allRefs };
    const emptyUnits = stageUnits(stage, db.items, pathwayStageContext(everything));
    expect(emptyUnits).toEqual([]);
    expect(stageProgress(emptyUnits).complete).toBe(false);

    // RESTORE brings it back exactly.
    const restored = planSetReferenceHidden(reloaded.pathways, mirza.id, ref, false, NOW);
    const back = pathwayStageContext(restored.ok ? restored.pathways.find((p) => p.id === mirza.id) : undefined);
    expect(stageUnits(stage, reloaded.items, back).find((u) => u.key === 'daramad-e-shur')!.item?.id).toBe('it-daramad-b');
  });

  it('pathway removal keeps enriched and never practised owner items', async () => {
    useStore.getState().importDB(legacyRaw());
    const store = () => useStore.getState();
    const snapshot = (id: string) => {
      const db = store().db;
      const item = db.items.find((i) => i.id === id)!;
      // Everything the owner owns about the item — all but the three
      // organisation fields these actions may legitimately move.
      const owned = Object.fromEntries(
        Object.entries(item).filter(([k]) => !['stageId', 'catalogRefs', 'updatedAt'].includes(k)),
      );
      return {
        owned,
        attachments: db.attachments.filter((a) => a.ownerId === id),
        lessons: db.lessons.filter((l) => l.itemIds?.includes(id)).map((l) => l.id),
        agenda: db.lessonAgenda.filter((e) => e.itemId === id),
        routines: db.pathwayRoutines.flatMap((r) => r.segments.filter((s) => s.itemId === id).map((s) => `${r.id}:${s.label}`)),
        children: db.items.filter((i) => i.parentItemId === id).map((i) => i.id),
        reviews: db.reviews.filter((r) => r.practiceItemId === id),
        blocks: db.blocks.filter((b) => b.practiceItemId === id),
      };
    };
    const ids = ['it-forms-chahar', 'it-iraq', 'it-daramad-b', 'it-shur-farsi'];
    const before = Object.fromEntries(ids.map((id) => [id, snapshot(id)]));
    // The never-practised generic item really is enriched: notes, a file, a
    // lesson link, a class commitment and a routine segment.
    expect(before['it-forms-chahar'].owned.timesPractised).toBe(0);
    expect(before['it-forms-chahar'].attachments).toHaveLength(1);
    expect(before['it-forms-chahar'].agenda).toHaveLength(1);
    expect(before['it-forms-chahar'].routines).toHaveLength(1);

    // REMOVE FROM PATHWAY on the never-practised item: out of every stage of
    // that pathway, its suggestion hidden THERE — binding and everything else kept.
    store().removeFromPathway('it-forms-chahar', SEED_PATHWAY_IDS.setar);
    const chahar = store().db.items.find((i) => i.id === 'it-forms-chahar')!;
    expect([chahar.stageId, chahar.catalogRefs]).toEqual([undefined, ['stage:setar-radif-forms:chahar-mezrab']]);
    expect(store().db.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar)!.hiddenRefs).toEqual(['stage:setar-radif-forms:chahar-mezrab']);
    // UNLINK REFERENCE on a practised item: only that binding goes.
    store().unlinkReference('it-iraq', 'radif:mirza-abdollah:afshari:iraq');
    const iraq = store().db.items.find((i) => i.id === 'it-iraq')!;
    expect([iraq.stageId, iraq.catalogRefs]).toEqual(['setar-radif-afshari', []]);
    // Removing from a pathway never deletes anything, ever — and while
    // it-daramad-b is one of two UNDECIDED candidates for «درآمد شور», nothing
    // may move it out of its stage: that would hand the suggestion to the
    // other candidate without the owner choosing.
    const daramad = catalogReferenceId('setar-radif-shur', 'daramad-e-shur');
    const daramadB = () => store().db.items.find((i) => i.id === 'it-daramad-b')!;
    const undecided = daramadB();
    expect(store().removeFromPathway('it-daramad-b', SEED_PATHWAY_IDS.setar)).toMatch(/Choose which one/);
    expect(daramadB()).toEqual(undecided);
    expect(store().placeItemInStage('it-daramad-b', undefined)).toMatch(/Choose which one/);
    expect(store().deleteStage('setar-radif-shur')).toMatch(/Choose which one/);
    expect(store().deletePathway(SEED_PATHWAY_IDS.setar)).toMatch(/Choose which one/);
    expect(store().db.pathwayStages.some((st) => st.id === 'setar-radif-shur')).toBe(true);
    // Once the owner chooses the OTHER one, it leaves freely — kept whole.
    expect(store().linkReference(SEED_PATHWAY_IDS.setar, daramad, 'it-daramad-a')).toBeNull();
    expect(store().removeFromPathway('it-daramad-b', SEED_PATHWAY_IDS.setar)).toBeNull();
    expect(daramadB().stageId).toBeUndefined();
    // Removing a PARENT work from its pathway keeps its parts under it.
    store().removeFromPathway('it-shur-farsi', SEED_PATHWAY_IDS.setar);

    for (const id of ids) expect(snapshot(id), id).toEqual(before[id]);
    // Unlinked stays unlinked through a reload: old placement evidence never re-binds it.
    const reloaded = validateDB(store().db);
    expect(byId(reloaded, 'it-iraq').catalogRefs).toEqual([]);
    expect(byId(reloaded, 'it-forms-chahar').catalogRefs).toEqual(['stage:setar-radif-forms:chahar-mezrab']);

    // No catalogue shortcut on either screen calls item deletion.
    for (const [name, src] of [
      ['StageDetail', STAGE_DETAIL_SRC],
      ['ItemDetail ConnectedTo', ITEM_DETAIL_SRC.slice(ITEM_DETAIL_SRC.indexOf('function ConnectedTo'))],
    ] as const) {
      expect(/deleteItem|removeCatalogItem|isLosslesslyRemovable/.test(src.split('function ReviewOwnership')[0]), name).toBe(false);
    }
  });

  it('new Persian reference views preserve existing Setar organisation', () => {
    const source = legacyRaw().data as PracticeDB;
    const db = validateDB(legacyRaw());
    // 1. UPGRADE CHANGES NOTHING of the owner's organisation: the renamed,
    //    pinned mixed pathway, its edited stages, its routine, and the generic
    //    form item (text and all) are byte-equal.
    expect(db.pathways).toEqual(source.pathways);
    expect(db.pathwayStages).toEqual(source.pathwayStages);
    expect(db.pathwayRoutines).toEqual(source.pathwayRoutines);
    const generic = Object.fromEntries(Object.entries(byId(db, 'it-forms-chahar')).filter(([k]) => k !== 'catalogRefs'));
    expect(generic).toEqual(source.items.find((i) => i.id === 'it-forms-chahar'));
    // Nothing is added on load: the named view is OFFERED, by name.
    expect(db.pathways.some((p) => p.id === RADIF_PATHWAY_IDS.setar)).toBe(false);
    expect(offeredDefaultPathways(db, NOW).map((p) => p.id)).toContain(RADIF_PATHWAY_IDS.setar);

    // 2. EXPLICITLY ADDING it reuses every proven binding — no duplicate music.
    const added = { ...db, ...planDefaultPathways(db, [RADIF_PATHWAY_IDS.setar], NOW) };
    const ctx = pathwayStageContext(added.pathways.find((p) => p.id === RADIF_PATHWAY_IDS.setar));
    const afshari = added.pathwayStages.find((s) => s.id === stageIdFor(RADIF_PATHWAY_IDS.setar, 'afshari'))!;
    expect(stageUnits(afshari, added.items, ctx).find((u) => u.key === 'iraq')!.item?.id).toBe('it-iraq');
    const again = planCatalogAddition(added, afshari.id, 'iraq', catalogForStage(afshari.id).find((e) => e.key === 'iraq'), 'inst-setar', NOW);
    expect([again.created, again.itemId, again.items.length]).toEqual([false, 'it-iraq', added.items.length]);
    // The unresolved legacy pair stays a visible choice there too.
    const shur = added.pathwayStages.find((s) => s.id === stageIdFor(RADIF_PATHWAY_IDS.setar, 'shur'))!;
    expect(stageUnits(shur, added.items, ctx).find((u) => u.key === 'daramad-e-shur')!.candidates?.length).toBe(2);
    // The old pathway is untouched by the addition.
    expect(added.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar)).toEqual(source.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar));
    // Tidying the OLD pathway never costs the new one its binding: removing
    // عراق from the mixed pathway hides it there, and the named view still
    // shows the same item — Add there still creates nothing.
    const tidied = planRemoveFromPathway(added, 'it-iraq', SEED_PATHWAY_IDS.setar, NOW);
    expect(tidied.ok).toBe(true);
    const afterTidy = { ...added, ...(tidied.ok ? { items: tidied.items, pathways: tidied.pathways } : {}) };
    const oldCtx = pathwayStageContext(afterTidy.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar));
    const oldAfshari = afterTidy.pathwayStages.find((s) => s.id === stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari'))!;
    expect(stageUnits(oldAfshari, afterTidy.items, oldCtx).some((u) => u.item?.id === 'it-iraq' || u.key === 'iraq')).toBe(false);
    const newCtx = pathwayStageContext(afterTidy.pathways.find((p) => p.id === RADIF_PATHWAY_IDS.setar));
    expect(stageUnits(afshari, afterTidy.items, newCtx).find((u) => u.key === 'iraq')!.item?.id).toBe('it-iraq');
    const addAfterTidy = planCatalogAddition(afterTidy, afshari.id, 'iraq', catalogForStage(afshari.id).find((e) => e.key === 'iraq'), 'inst-setar', NOW);
    expect([addAfterTidy.created, addAfterTidy.itemId]).toEqual([false, 'it-iraq']);

    // 3. The named view carries NO generic form suggestion and no Forms stage:
    //    every one of its suggestions is a gusheh with its dastgāh.
    const mirzaStages = added.pathwayStages.filter((s) => s.pathwayId === RADIF_PATHWAY_IDS.setar);
    expect(mirzaStages.some((s) => /forms/.test(s.id))).toBe(false);
    for (const s of mirzaStages) {
      for (const e of catalogForStage(s.id)) {
        expect(e.strand, `${s.id}/${e.key}`).toBe('radif');
        expect(e.persian?.gusheh, `${s.id}/${e.key}`).toBe(e.title);
      }
    }

    // 4. FORMS IS A LENS over real works, from the shared vocabulary — it
    //    lists the owner's own pieces and creates nothing.
    const byForm = discoverRepertoire(added, { instrumentId: 'inst-setar', groupBy: 'form' });
    const pish = byForm.groups.find((g) => g.key === 'form:term:form:pish-daramad')!;
    expect(pish.works.map((w) => w.work.id).sort()).toEqual(['it-shur-farsi', 'it-shur-latin']);
    expect(byForm.groups.flatMap((g) => g.works).length).toBe(EXPECT.legacy.setarDiscovery.scopeCount);
    expect(added.items).toBe(added.items);
    expect(added.items.length).toBe(db.items.length);
  });
});

describe('Family A — administration is organisation, never practice evidence', () => {
  it('repertoire administration never fabricates or resets practice evidence', async () => {
    useStore.getState().importDB(legacyRaw());
    const store = () => useStore.getState();
    // An unfinished block and a running plan, both ephemeral practice state.
    store().startItemSession('it-shur-farsi');
    useStore.setState({
      activePlan: { instrumentId: 'inst-setar', budgetMinutes: 20, startedAt: NOW.toISOString(), pointer: 0, segments: [] },
    });
    const PRACTICE_FIELDS = [
      'status', 'importance', 'difficulty', 'primaryFocus', 'notes', 'nextReviewDate', 'reviewMode', 'reviewIntervalDays',
      'srReps', 'srEase', 'srIntervalDays', 'nextReviewSource', 'srLastProgressDay', 'lastPractisedAt', 'timesPractised',
      'totalMinutes', 'lastResult', 'saturationWarning', 'persian', 'title', 'instrumentId', 'parentItemId',
    ] as const;
    const project = () => {
      const s = store();
      return {
        items: s.db.items.map((i) => [i.id, Object.fromEntries(PRACTICE_FIELDS.map((k) => [k, i[k]]))]),
        blocks: s.db.blocks,
        reviews: s.db.reviews,
        agenda: s.db.lessonAgenda,
        lessons: s.db.lessons,
        attachments: s.db.attachments,
        active: s.active,
        activePlan: s.activePlan,
        activeRoutine: s.activeRoutine,
      };
    };
    const before = JSON.stringify(project());
    const run = (label: string, action: () => unknown) => {
      action();
      expect(JSON.stringify(project()), label).toBe(before);
    };

    // TERM administration.
    let added = '';
    run('add term', () => {
      const r = store().addTerm({ kind: 'composer', name: 'مرتضی محجوبی', aliases: ['Mahjoubi'] });
      added = 'id' in r ? r.id : '';
    });
    run('rename built-in', () => expect(store().updateTerm('dastgah:shur', { name: 'دستگاه شور' })).toBeNull());
    run('edit aliases', () => expect(store().updateTerm(added, { aliases: ['Mahjoubi', 'Morteza Mahjoubi'] })).toBeNull());
    run('archive', () => expect(store().updateTerm(added, { archived: true })).toBeNull());
    run('restore', () => expect(store().updateTerm(added, { archived: false })).toBeNull());
    run('refused delete of a used built-in', () => expect(store().deleteTerm('dastgah:shur')).toMatch(/built-in/));
    run('delete unused custom', () => expect(store().deleteTerm(added)).toBeNull());
    // SOURCE administration.
    run('edit a source', () => store().updateMaterial('mat-song', { title: 'Songbook', sourceType: 'song' }));
    run('choose a course source', () => store().chooseCourseSource(['it-cgs-chords'], 'mat-cgs', 'cgs'));
    // REFERENCE and PATHWAY administration.
    run('link', () => expect(store().linkReference(SEED_PATHWAY_IDS.setar, catalogReferenceId('setar-radif-shur', 'daramad-e-shur'), 'it-daramad-a')).toBeNull());
    run('unlink', () => store().unlinkReference('it-daramad-a', catalogReferenceId('setar-radif-shur', 'daramad-e-shur')));
    run('hide', () => store().setReferenceHidden(SEED_PATHWAY_IDS.setar, catalogReferenceId('setar-radif-shur', 'kereshmeh'), true));
    run('restore hidden', () => store().setReferenceHidden(SEED_PATHWAY_IDS.setar, catalogReferenceId('setar-radif-shur', 'kereshmeh'), false));
    run('remove from pathway', () => store().removeFromPathway('it-kereshmeh-moved', SEED_PATHWAY_IDS.setar));
    run('archive pathway', () => store().updatePathway(SEED_PATHWAY_IDS.setar, { archived: true }));
    run('restore pathway', () => store().updatePathway(SEED_PATHWAY_IDS.setar, { archived: false }));
    run('add a default pathway', () => store().reseedDefaultPathways([RADIF_PATHWAY_IDS.setar]));
    run('re-add (no-op)', () => store().reseedDefaultPathways([RADIF_PATHWAY_IDS.setar]));
    // Adding a suggestion that is already an owned item reuses it: no evidence moves.
    run('add an owned suggestion', () =>
      expect(store().addFromCatalog(stageIdFor(RADIF_PATHWAY_IDS.setar, 'afshari'), 'iraq').id).toBe('it-iraq'),
    );
    // A genuinely new suggestion creates an honest "not practised yet" item
    // and touches no other item's evidence.
    const created = store().addFromCatalog(stageIdFor(RADIF_PATHWAY_IDS.setar, 'afshari'), 'jamedaran');
    expect(created.created).toBe(true);
    const fresh = store().db.items.find((i) => i.id === created.id)!;
    expect([fresh.status, fresh.timesPractised, fresh.totalMinutes, fresh.lastPractisedAt, fresh.nextReviewDate]).toEqual(['new', 0, 0, undefined, undefined]);
    const afterCreate = JSON.parse(JSON.stringify(project()));
    afterCreate.items = afterCreate.items.filter(([id]: [string]) => id !== created.id);
    expect(JSON.stringify(afterCreate)).toBe(before);

    // EVERY LOCAL WRITE STAYS A DATABASE RELOAD ACCEPTS. Each administrative
    // action that can move a binding, an item's instrument or a course key is
    // followed by the SAME validation every inbound door runs; a write that
    // would fail it is refused with a sentence and changes nothing.
    const reloads = (label: string) => expect(() => validateDB(store().exportDB()), label).not.toThrow();
    const unchanged = (label: string, action: () => unknown, says: RegExp) => {
      const db = store().db;
      expect(action(), label).toMatch(says);
      expect(store().db, label).toBe(db);
    };
    reloads('after the administration above');
    // Moving a bound item to another instrument keeps its binding where it
    // answers nothing anything else answers there (Tar)…
    expect(store().updateItem('it-cgs-chords', { instrumentId: 'inst-tar' })).toBeNull();
    reloads('bound item moved to another instrument');
    expect(store().updateItem('it-cgs-chords', { instrumentId: 'inst-guitar' })).toBeNull();
    // …and is refused where an undecided Setar item's legacy evidence already
    // answers the same suggestion: the move would silently overrule it.
    unchanged('a move onto legacy evidence', () => store().updateItem('it-cgs-chords', { instrumentId: 'inst-setar' }), /already answers/);
    // An instrument's name is the owner's text: renaming never invalidates.
    store().updateInstrument('inst-setar', { name: 'Guitar' });
    reloads('Setar renamed to Guitar');
    store().updateInstrument('inst-setar', { name: 'Setar' });
    // A pathway moved to another instrument still adds valid items.
    store().updatePathway(SEED_PATHWAY_IDS.guitar, { instrumentId: 'inst-setar' });
    expect(store().addFromCatalog('cgs-1b', 'arpeggios').created).toBe(true);
    reloads('pathway moved to Setar, then Add');
    store().updatePathway(SEED_PATHWAY_IDS.guitar, { instrumentId: 'inst-guitar' });
    // Moving a bound Tar radif item onto Setar, where another item already
    // answers the same shared gusheh, is refused rather than written — both
    // while that Setar item answers only through its undecided legacy
    // evidence (it-daramad-b, since it-daramad-a was unlinked above) and once
    // it is explicitly bound. A move never silently overrules either.
    store().reseedDefaultPathways([RADIF_PATHWAY_IDS.tar]);
    const tarDaramad = store().addFromCatalog(stageIdFor(RADIF_PATHWAY_IDS.tar, 'shur'), 'daramad-e-shur');
    expect(tarDaramad.created).toBe(true);
    unchanged('a move overruling legacy evidence', () => store().updateItem(tarDaramad.id, { instrumentId: 'inst-setar' }), /already answers/);
    expect(store().linkReference(SEED_PATHWAY_IDS.setar, catalogReferenceId('setar-radif-shur', 'daramad-e-shur'), 'it-daramad-b')).toBeNull();
    unchanged('two items, one gusheh, one instrument', () => store().updateItem(tarDaramad.id, { instrumentId: 'inst-setar' }), /already answers/);
    // A notes save is never judged by any of this.
    expect(store().updateItem(tarDaramad.id, { notes: 'on Tar' })).toBeNull();
    // A course key stays on ONE source per instrument: choosing a second
    // source, or moving the keyed one onto an instrument that already holds
    // the key, is refused — the other source is never silently un-keyed.
    const copy = store().addMaterial({ instrumentId: 'inst-guitar', title: 'CGS notes', sourceType: 'course' });
    unchanged('a second source for a keyed course', () => store().chooseCourseSource(['it-cgs-chords'], copy, 'cgs'), /already this course's study source/);
    // (Adding from the pathway while it sat on Setar minted Setar's own keyed source.)
    expect(store().db.materials.filter((m) => m.sourceKey === 'course:cgs').map((m) => m.instrumentId).sort()).toEqual(['inst-guitar', 'inst-setar']);
    unchanged('keyed source moved onto a holder', () => store().updateMaterial('mat-cgs', { instrumentId: 'inst-setar' }), /already this course's study source/);
    expect(store().updateMaterial('mat-cgs', { title: 'CGS (renamed)' })).toBeNull();
    reloads('after every counterexample');
  });
});
