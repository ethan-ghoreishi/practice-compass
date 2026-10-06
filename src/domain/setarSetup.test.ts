import { describe, expect, it, vi } from 'vitest';
import OWNER_V16 from '../../tests/fixtures/setar-practice-owner-v16.json';
import EXPECT from '../../tests/fixtures/setar-practice-setup-expectations.json';
import { applySetarSetup, classifyPiece, planSetarSetup, type SetupContext, type SetupProposal, type SetupSelection } from './setarSetup';
import { applyArchiveImport, planArchiveImport } from './sourceReconcile';
import { decodeSourceIndex } from './sourceArchive';
import { validateDB } from './io';
import { canonicalStringify } from './canonical';
import type { PracticeDB } from './types';

// ---------------------------------------------------------------------------
// ac-9 / ac-10 — "Review Setar setup" over a synthetic OWNER-SHAPED database
// (tests/fixtures/setar-practice-owner-v16.json: imported under the old kind
// policy, then worked on — practised, placed by hand, a deliberate technique,
// a second recension, a class unlink, a shared Tar reference, an attachment).
// Expected outcomes are written by hand in setar-practice-setup-expectations.json.
// ---------------------------------------------------------------------------

vi.mock('../store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store/idb')>();
  let settle: Promise<void> = Promise.resolve();
  let fail = false;
  (globalThis as { __failNextWrite?: () => void }).__failNextWrite = () => {
    fail = true;
  };
  return {
    ...actual,
    deleteBlob: async () => undefined,
    storageSettled: () => settle,
    idbStorage: {
      getItem: async () => null,
      setItem: async () => {
        settle = fail ? Promise.reject(new Error('refused')) : Promise.resolve();
        void settle.catch(() => undefined);
        fail = false;
      },
      removeItem: async () => undefined,
    },
  };
});

const NOW = new Date('2026-10-05T09:00:00.000Z');
const OWNER: PracticeDB = validateDB(OWNER_V16);
const CTX: SetupContext = { instrumentId: EXPECT.context.instrumentId, pathwayId: EXPECT.context.pathwayId };
const DECLARED = `declared:${EXPECT.context.declared}`;
const WITH_SOURCE: SetupContext = { ...CTX, sources: { [DECLARED]: { materialId: EXPECT.context.material } } };

const keyOf = (db: PracticeDB, id: string) => db.items.find((i) => i.id === id)?.source?.pieceKey ?? id;
const idOf = (db: PracticeDB, key: string) => db.items.find((i) => i.source?.pieceKey === key || i.id === key)!.id;
const byField = (proposals: SetupProposal[], field: string) => proposals.filter((p) => p.field === field);
const summarise = (p: SetupProposal): unknown[] => {
  if (p.state === 'exception') {
    if (p.field === 'kind') return ['exception', p.choices.map((c) => ('itemType' in c.after ? c.after.itemType : null))];
    if (p.field === 'reference') return ['exception', p.choices.length];
    const targets = p.choices.flatMap((c) => ('stageId' in c.after ? [c.after.stageId] : 'materialId' in c.after ? [c.after.materialId] : []));
    return targets.length ? ['exception', targets] : ['exception'];
  }
  if (p.state === 'correct') return ['correct'];
  const a = p.after!;
  if ('itemType' in a) return ['proposed', a.itemType, a.gusheh];
  if ('stageId' in a) return ['proposed', a.stageId];
  if ('materialId' in a) return ['proposed', a.materialId];
  return ['proposed'];
};

describe('the Setar setup review', () => {
  it('setar setup proposals distinguish learning organisation and source evidence', () => {
    // --- THE KIND POLICY, family by family, from the registry's own words ---
    const read = (form: string, composer = '', provisional = false) => classifyPiece({ form, composer, provisional });
    expect(read('گوشه')).toMatchObject({ kind: 'gusheh', family: 'gusheh' });
    // All six radif درامد variants carry the form «درامد» — the opening gusheh, never a composed piece.
    expect(read('درامد')).toMatchObject({ kind: 'gusheh', family: 'radif-daramad' });
    expect(read('چهارپاره')).toMatchObject({ kind: 'gusheh', family: 'radif-chaharpareh' });
    // DECLARED RADIF SOURCE NEVER DECIDES KIND: a composer-attributed چهارپاره is asked about.
    expect(read('چهارپاره', 'مرادخانی')).toMatchObject({ kind: null, family: 'composed-chaharpareh' });
    expect(read('رنگ')).toMatchObject({ kind: null, family: 'radif-reng' });
    expect(read('رنگ', 'درویش-خان')).toMatchObject({ kind: 'full_piece', family: 'composed' });
    expect(read('اتود', 'وزیری')).toMatchObject({ kind: 'exercise', family: 'etude' });
    expect(read('تمرین', 'علیزاده')).toMatchObject({ kind: 'exercise', family: 'exercise' });
    // Personal improvisation is never minted as a composed work.
    expect(read('بداهه')).toMatchObject({ kind: 'improvisation', family: 'improvisation' });
    expect(read('(قطعه)', 'صبا')).toMatchObject({ kind: 'full_piece' });
    expect(read('گوشه', '', true)).toMatchObject({ kind: null, family: 'provisional' });
    expect(read('')).toMatchObject({ kind: null, family: 'unknown' });

    // --- THE REVIEW over the owner-shaped database ---------------------------
    const plan = planSetarSetup(OWNER, WITH_SOURCE);
    // Another instrument's item is never in a Setar review.
    for (const id of EXPECT.never) expect(plan.proposals.some((p) => p.itemId === id), id).toBe(false);
    // Materials offered are this instrument's only — two recensions, never merged.
    expect(plan.materials.map((m) => m.id).sort()).toEqual(['mat-forms', 'mat-radif', 'mat-radif-borumand']);
    expect(plan.sourceGroups.map((g) => [g.key, g.itemIds.length])).toEqual([[DECLARED, 11]]);
    // Each field, each row, as written by hand.
    for (const [key, want] of Object.entries(EXPECT.rows) as [string, Record<string, unknown>][]) {
      const id = idOf(OWNER, key);
      const mine = plan.proposals.filter((p) => p.itemId === id);
      for (const field of ['kind', 'stage', 'reference', 'source', 'class']) {
        const got = mine.filter((p) => p.field === field).map(summarise);
        if (want[field] === undefined) expect(got, `${key} ${field}`).toEqual([]);
        else expect(got, `${key} ${field}`).toEqual([want[field]]);
      }
      // STATUS is a batch the owner selects: never pre-decided, flags shown.
      const status = mine.find((p) => p.field === 'status')!;
      expect(status.state, key).toBe('exception');
      if (want.status) expect(status.evidence, key).toContain(want.status as string);
    }
    // Every Setar item is in the status batch, once; nothing is selected for the owner.
    expect(byField(plan.proposals, 'status').map((p) => keyOf(OWNER, p.itemId)).sort()).toEqual(Object.keys(EXPECT.rows).sort());
    expect(plan.proposals.filter((p) => p.field === 'status' && p.state === 'proposed')).toEqual([]);

    // --- SHARED Setar/Tar reference: the Tar item does not take it from Setar.
    const kereshmeh = plan.proposals.find((p) => p.field === 'reference' && keyOf(OWNER, p.itemId) === 'کرشمه-ماهور-ردیف-میرزاعبدالله')!;
    expect(kereshmeh.choices.map((c) => ('catalogRefs' in c.after ? c.after.catalogRefs : []))).toContainEqual([
      'radif:mirza-abdollah:mahur:daramad-e-mahur',
    ]);
    // PARTIAL catalogue: nothing is proposed — only explicit choices.
    expect(kereshmeh.after).toBeUndefined();

    // --- A MISSING stage and an unchosen source -------------------------------
    const noAfshari = { ...OWNER, pathwayStages: OWNER.pathwayStages.filter((s) => s.id !== 'setar-radif-afshari') };
    const missing = planSetarSetup(noAfshari, WITH_SOURCE).proposals.find(
      (p) => p.field === 'stage' && keyOf(OWNER, p.itemId) === 'درامد-افشاری-ردیف-میرزاعبدالله',
    )!;
    expect(missing).toMatchObject({ state: 'exception', choices: [] });
    expect(missing.evidence).toMatch(/no stage for it/);
    // Without a chosen study source there is no source row at all — and
    // nothing is matched by title, even with «ردیف میرزا عبدالله» right there.
    expect(byField(planSetarSetup(OWNER, CTX).proposals, 'source')).toEqual([]);
    // Without a chosen pathway, nothing is placed.
    expect(byField(planSetarSetup(OWNER, { instrumentId: CTX.instrumentId }).proposals, 'stage')).toEqual([]);

    // --- A NEW import under the same policy: dormant, unpractised, honest kinds
    const fresh = { ...OWNER, items: OWNER.items.filter((i) => !i.source), archiveSources: [], lessons: [] };
    const graph = OWNER.archiveSources[0]!;
    const index = decodeSourceIndex({
      format: 'setar-archive-index',
      version: 1,
      archiveId: graph.id,
      pieces: graph.pieces,
      sessions: graph.sessions,
      renames: [],
      diagnostics: [],
      contentHash: graph.indexHash,
    });
    const imported = applyArchiveImport(fresh, planArchiveImport({ db: fresh, index, instrumentId: CTX.instrumentId, now: NOW }));
    const kinds = Object.fromEntries(imported.items.filter((i) => i.source).map((i) => [i.source!.pieceKey, i.itemType]));
    expect(kinds['درامد-ماهور-ردیف-میرزاعبدالله']).toBe('gusheh');
    expect(kinds['اتود-وزیری']).toBe('exercise');
    expect(kinds['بداهه-درامد-افشاری']).toBe('improvisation');
    expect(kinds['چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله']).toBe('other');
    expect(kinds['جنگ-شهنازی']).toBe('full_piece');
    for (const i of imported.items.filter((x) => x.source)) {
      expect([i.status, i.timesPractised, i.totalMinutes, i.lastPractisedAt, i.nextReviewDate], i.title).toEqual(['dormant', 0, 0, undefined, undefined]);
    }
    expect(imported.reviews).toEqual(fresh.reviews);
    expect(imported.blocks).toEqual(fresh.blocks);
    // The review never deletes anything: applying EVERY offered value keeps every record.
    const everything: SetupSelection[] = planSetarSetup(OWNER, WITH_SOURCE).proposals.flatMap((p) => {
      const after = p.state === 'proposed' ? p.after : p.choices[0]?.after;
      return after ? [{ id: p.id, before: p.before, after }] : [];
    });
    const all = applySetarSetup(OWNER, WITH_SOURCE, everything, NOW);
    expect(all.ok).toBe(true);
    if (all.ok) expect(all.db.items.map((i) => i.id).sort()).toEqual(OWNER.items.map((i) => i.id).sort());
  });

  it('setar setup commits selected rows atomically idempotently and without collateral changes', async () => {
    const { useStore } = await import('../store/useStore');
    const s = () => useStore.getState();
    const active = { itemId: idOf(OWNER, 'کرشمه-ماهور-ردیف-میرزاعبدالله'), instrumentId: 'inst-setar', mode: 'repair' as const, focus: 'rhythm' as const, targetMinutes: 10, startedAt: '2026-10-05T08:55:00.000Z', accumulatedSeconds: 0, running: true, segmentStartedAt: '2026-10-05T08:55:00.000Z' };
    useStore.setState({ db: OWNER, active, activeRoutine: null, activePlan: null });

    const plan = planSetarSetup(OWNER, WITH_SOURCE);
    const pick = (field: string, key: string) => plan.proposals.find((p) => p.field === field && keyOf(OWNER, p.itemId) === key)!;
    const sel = (p: SetupProposal, after = p.after ?? p.choices[0]!.after): SetupSelection => ({ id: p.id, before: p.before, after });
    // The owner selects a FEW displayed rows of every kind; everything else stays unselected.
    const selections = [
      sel(pick('kind', 'درامد-ماهور-ردیف-میرزاعبدالله')),
      sel(pick('stage', 'درامد-ماهور-ردیف-میرزاعبدالله')),
      sel(pick('source', 'درامد-ماهور-ردیف-میرزاعبدالله')),
      sel(pick('status', 'کرشمه-ماهور-ردیف-میرزاعبدالله')),
      sel(pick('kind', 'چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله'), pick('kind', 'چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله').choices.find((c) => 'itemType' in c.after && c.after.itemType === 'full_piece')!.after),
      sel(pick('reference', 'کرشمه-ماهور-ردیف-میرزاعبدالله'), pick('reference', 'کرشمه-ماهور-ردیف-میرزاعبدالله').choices.find((c) => 'catalogRefs' in c.after && c.after.catalogRefs!.includes('radif:mirza-abdollah:mahur:dad'))!.after),
      sel(plan.proposals.find((p) => p.field === 'class')!),
    ];
    const untouched = JSON.parse(JSON.stringify(OWNER)) as PracticeDB;

    // --- PREMISE DRIFT refuses ALL of it, writing nothing ----------------------
    s().updateItem(idOf(OWNER, 'درامد-ماهور-ردیف-میرزاعبدالله'), { itemType: 'technique' });
    const drifted = s().db;
    expect(s().commitSetarSetup({ context: WITH_SOURCE, selections, now: NOW })).toMatch(/changed since/);
    expect(s().db).toBe(drifted);
    useStore.setState({ db: OWNER });
    // A pathway or instrument that is not the one reviewed offers different rows: refused.
    expect(s().commitSetarSetup({ context: { ...WITH_SOURCE, pathwayId: 'setar-radif-mirza' }, selections, now: NOW })).toMatch(/changed since/);
    expect(s().commitSetarSetup({ context: { ...WITH_SOURCE, instrumentId: 'inst-tar' }, selections, now: NOW })).toMatch(/changed since/);
    expect(s().db).toBe(OWNER);
    // A value that was never offered is refused too.
    const forged = { ...selections[1]!, after: { stageId: 'setar-radif-shur' } };
    expect(s().commitSetarSetup({ context: WITH_SOURCE, selections: [forged], now: NOW })).toMatch(/changed since/);

    // --- AN UNRELATED edit and a LATER-ARRIVING row do not block or join -----
    s().updateItem(idOf(OWNER, 'جنگ-شهنازی'), { notes: 'written during the review' });
    const later = s().addItem({ instrumentId: 'inst-setar', title: 'arrived after the review' });
    const revBefore = s().rev;
    expect(s().commitSetarSetup({ context: WITH_SOURCE, selections, now: NOW })).toBeNull();
    const after = s().db;
    expect(s().rev).toBe(revBefore + 1); // ONE mutation
    const item = (key: string) => after.items.find((i) => i.id === idOf(OWNER, key))!;
    expect(item('درامد-ماهور-ردیف-میرزاعبدالله')).toMatchObject({ itemType: 'gusheh', stageId: 'setar-radif-mahur', materialId: 'mat-radif', persian: { gusheh: 'درامد' } });
    expect(item('کرشمه-ماهور-ردیف-میرزاعبدالله').status).toBe('maintenance');
    expect(item('کرشمه-ماهور-ردیف-میرزاعبدالله').catalogRefs).toEqual(['radif:mirza-abdollah:mahur:dad']);
    expect(item('چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله').itemType).toBe('full_piece');
    expect(after.archiveSources[0]!.suppressions.filter((x) => x.kind === 'link')).toEqual([]);
    expect(after.items.find((i) => i.id === later)!.updatedAt).toBe(s().db.items.find((i) => i.id === later)!.updatedAt);
    expect(item('جنگ-شهنازی').notes).toBe('written during the review');

    // --- NOTHING ELSE moved: every unselected field, record and collection ----
    const selectedFields = new Map<string, string[]>([
      [idOf(OWNER, 'درامد-ماهور-ردیف-میرزاعبدالله'), ['itemType', 'stageId', 'materialId', 'persian', 'updatedAt']],
      [idOf(OWNER, 'کرشمه-ماهور-ردیف-میرزاعبدالله'), ['status', 'catalogRefs', 'updatedAt']],
      [idOf(OWNER, 'چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله'), ['itemType', 'updatedAt']],
      [idOf(OWNER, 'جنگ-شهنازی'), ['notes', 'updatedAt']],
    ]);
    for (const was of untouched.items) {
      const now = after.items.find((i) => i.id === was.id)!;
      const changed = Object.keys({ ...was, ...now }).filter((k) => canonicalStringify((was as never)[k]) !== canonicalStringify((now as never)[k]));
      expect(changed.filter((k) => !(selectedFields.get(was.id) ?? []).includes(k)), was.id).toEqual([]);
    }
    for (const key of ['blocks', 'reviews', 'lessons', 'lessonAgenda', 'attachments', 'materials', 'pathways', 'pathwayStages', 'pathwayRoutines', 'musicTerms', 'instruments'] as const) {
      expect(canonicalStringify(after[key]), key).toBe(canonicalStringify(untouched[key]));
    }
    // The running clock is not part of the mutation.
    expect(s().active).toEqual(active);
    // A written state is one every door accepts, and round-trips.
    expect(canonicalStringify(validateDB(JSON.parse(JSON.stringify(after))))).toBe(canonicalStringify(after));

    // --- A COMPLETED rerun is a no-op: same object, same revision ------------
    const rev = s().rev;
    expect(s().commitSetarSetup({ context: WITH_SOURCE, selections, now: NOW })).toBeNull();
    expect(s().db).toBe(after);
    expect(s().rev).toBe(rev);
    // An undecidable kind: the owner's different answer is settled, never asked
    // again; confirming the import's old default stays a question (nothing
    // records answers beside the item).
    const harbi = plan.proposals.find((p) => p.id === `kind:${idOf(OWNER, 'رنگ-حربی-ماهور-ردیف-میرزاعبدالله')}`)!;
    const toGusheh = harbi.choices.find((c) => 'itemType' in c.after && c.after.itemType === 'gusheh')!.after;
    const settled = applySetarSetup(OWNER, WITH_SOURCE, [{ id: harbi.id, before: harbi.before, after: toGusheh }], NOW);
    if (!settled.ok) throw new Error(settled.reason);
    const harbiAgain = planSetarSetup(settled.db, WITH_SOURCE).proposals.find((p) => p.id === harbi.id)!;
    expect([harbiAgain.state, harbiAgain.choices]).toEqual(['correct', []]);
    const confirmedDefault = planSetarSetup(after, WITH_SOURCE).proposals.find((p) => p.id === `kind:${idOf(OWNER, 'چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله')}`)!;
    expect(confirmedDefault.state).toBe('exception');

    // --- CREATE a study source ONCE, never by title, never cross-instrument -
    useStore.setState({ db: OWNER });
    const create: SetupContext = { ...CTX, sources: { [DECLARED]: { create: true } } };
    const createPlan = planSetarSetup(OWNER, create);
    const sources = createPlan.proposals.filter((p) => p.field === 'source' && p.state === 'proposed').map((p) => sel(p));
    expect(sources.length).toBeGreaterThan(1);
    expect(s().commitSetarSetup({ context: create, selections: sources, now: NOW })).toBeNull();
    const made = s().db.materials.filter((m) => !OWNER.materials.some((o) => o.id === m.id));
    expect(made).toHaveLength(1);
    expect(made[0]).toMatchObject({ instrumentId: 'inst-setar', title: EXPECT.context.declared });
    expect(new Set(sources.map((x) => s().db.items.find((i) => i.id === x.id.split(':')[1])!.materialId))).toEqual(new Set([made[0]!.id]));
    // Existing materials — including the same-titled Tar one — are untouched.
    expect(s().db.materials.filter((m) => OWNER.materials.some((o) => o.id === m.id))).toEqual(OWNER.materials);
    // Once made, the review names it; the same rows again change nothing.
    const named: SetupContext = { ...CTX, sources: { [DECLARED]: { materialId: made[0]!.id } } };
    const afterCreate = s().db;
    const again = planSetarSetup(afterCreate, named).proposals.filter((p) => p.field === 'source');
    expect(again.filter((p) => sources.some((x) => x.id === p.id)).every((p) => p.state === 'correct')).toBe(true);
    expect(s().commitSetarSetup({ context: named, selections: again.filter((p) => p.state === 'correct').map((p) => ({ id: p.id, before: p.before, after: p.before })), now: NOW })).toBeNull();
    expect(s().db).toBe(afterCreate);

    // --- TWO DISTINCT GROUPS created in ONE apply keep their own identity ------
    // Each declared text is its own study source; replaying the very same
    // selections (a retry after a refused write, a second tab) names the
    // sources already made — a no-op, never stale and never a second source.
    const two = structuredClone(OWNER) as PracticeDB;
    const second = 'منبع-دوم-آزمون';
    two.archiveSources[0]!.pieces = two.archiveSources[0]!.pieces.map((p) => (p.key === 'چهارمضراب-ماهور-صبا' ? { ...p, studySource: second } : p));
    const bothCreate: SetupContext = { ...CTX, sources: { [DECLARED]: { create: true }, [`declared:${second}`]: { create: true } } };
    const bothSel = planSetarSetup(two, bothCreate).proposals.filter((p) => p.field === 'source' && p.state === 'proposed').map((p) => sel(p));
    const secondItem = idOf(two, 'چهارمضراب-ماهور-صبا');
    expect(bothSel.some((x) => x.id === `source:${secondItem}`)).toBe(true);
    const first = applySetarSetup(two, bothCreate, bothSel, NOW);
    if (!first.ok) throw new Error(first.reason);
    const madeTwo = first.db.materials.filter((m) => !two.materials.some((o) => o.id === m.id));
    expect(madeTwo.map((m) => m.title).sort()).toEqual([EXPECT.context.declared, second].sort());
    const materialOf = (db: PracticeDB, itemId: string) => db.items.find((i) => i.id === itemId)!.materialId;
    expect(materialOf(first.db, secondItem)).toBe(madeTwo.find((m) => m.title === second)!.id);
    expect(materialOf(first.db, idOf(two, 'درامد-ماهور-ردیف-میرزاعبدالله'))).toBe(madeTwo.find((m) => m.title === EXPECT.context.declared)!.id);
    const replay = applySetarSetup(first.db, bothCreate, bothSel, NOW);
    if (!replay.ok) throw new Error(replay.reason);
    expect(replay.db).toBe(first.db);
    // A group whose source exists but a later row arrives: it joins THAT source, once.
    const lateTwo = applySetarSetup(first.db, bothCreate, bothSel.slice(0, 1), NOW);
    expect(lateTwo.ok && lateTwo.db.materials.length).toBe(first.db.materials.length);

    // --- A REFUSED WRITE of a CREATION: memory keeps what it made, Try again writes it ONCE
    // Two groups are created in one Apply and the disk refuses. What is on
    // screen still holds the original selections (their `new:<group>` premise);
    // Try again sends exactly those, and must be a real write of the state in
    // memory — not stale, not a third source, each group still its OWN source.
    const { storageSettled } = await import('../store/idb');
    const failNext = () => (globalThis as { __failNextWrite?: () => void }).__failNextWrite!();
    useStore.setState({ db: two });
    failNext();
    expect(s().commitSetarSetup({ context: bothCreate, selections: bothSel, now: NOW })).toBeNull();
    await expect(storageSettled()).rejects.toThrow();
    const inMemory = s().db;
    const created = inMemory.materials.filter((m) => !two.materials.some((o) => o.id === m.id));
    expect(created.map((m) => m.title).sort()).toEqual([EXPECT.context.declared, second].sort());
    expect(s().commitSetarSetup({ context: bothCreate, selections: bothSel, now: NOW })).toBeNull();
    await expect(storageSettled()).resolves.toBeUndefined();
    expect(s().db).toBe(inMemory);
    expect(s().db.materials).toHaveLength(two.materials.length + 2);
    // Once "Saved." finalises the screen, each group names ITS source and every
    // row this Apply selected reads as done; one group's source taken for both
    // would put the other's item in conflict with the source it already has.
    const idByTitle = (title: string) => created.find((m) => m.title === title)!.id;
    const finalised: SetupContext = {
      ...CTX,
      sources: { [DECLARED]: { materialId: idByTitle(EXPECT.context.declared) }, [`declared:${second}`]: { materialId: idByTitle(second) } },
    };
    const sourceRows = (ctx: SetupContext) => planSetarSetup(s().db, ctx).proposals.filter((p) => p.field === 'source');
    // (An item the owner pointed at another recension stays an exception, as it was.)
    const done = sourceRows(finalised);
    expect(done.filter((p) => p.state === 'proposed')).toEqual([]);
    expect(bothSel.map((x) => done.find((p) => p.id === x.id)!.state)).toEqual(bothSel.map(() => 'correct'));
    const bothToFirst: SetupContext = { ...CTX, sources: { [DECLARED]: finalised.sources![DECLARED]!, [`declared:${second}`]: finalised.sources![DECLARED]! } };
    expect(sourceRows(bothToFirst).find((p) => p.itemId === secondItem)!.state).toBe('exception');
    expect(done.find((p) => p.itemId === secondItem)!.state).toBe('correct');
    expect(s().commitSetarSetup({ context: finalised, selections: bothSel, now: NOW })).toBeNull();
    expect(s().db).toBe(inMemory);

    // --- A REFUSED WRITE: the store says nothing it cannot keep, and Try again writes
    useStore.setState({ db: OWNER });
    failNext();
    expect(s().commitSetarSetup({ context: WITH_SOURCE, selections: selections.slice(0, 1), now: NOW })).toBeNull();
    await expect(storageSettled()).rejects.toThrow();
    // The retry is a REAL write of the state already in memory.
    expect(s().commitSetarSetup({ context: WITH_SOURCE, selections: selections.slice(0, 1), now: NOW })).toBeNull();
    await expect(storageSettled()).resolves.toBeUndefined();
  });
});
