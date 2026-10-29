import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  aggregateItemMinutes,
  buildReportData,
  buildSessionPlan,
  candidatePool,
  captureRoutineResults,
  completePlanSegment,
  createItem,
  createPreparation,
  emptyDB,
  fitRoutineToMinutes,
  freedMinutes,
  freedRoom,
  generateInsights,
  groupBlocksByItem,
  movePlanSegment,
  nextPractice,
  planClassCoverage,
  planRunTime,
  planStartRefusal,
  preparationDatesByItem,
  previewRoutine,
  previewRunSegments,
  recentResults,
  recommendForInstrument,
  removeFromPreview,
  removePlanSegment,
  requiredClassWork,
  reuseFreedMinutes,
  reuseFreedRoutineMinutes,
  routineRunTime,
  scoreItems,
  segmentsForRun,
  skipCurrentSegment,
  skipPlanSegment,
  skipSegmentUnpractised,
  swapSegment,
  toRunSegments,
  type BlockResult,
  type Lesson,
  type LessonAgendaEntry,
  type PlanBucket,
  type PlanRun,
  type PracticeBlock,
  type PracticeDB,
  type PracticeItem,
  type Review,
  type RoutinePreview,
  type RoutineSegment,
  type SessionPlan,
} from '../src/domain';

// ---------------------------------------------------------------------------
// The live-practice families (docs/practice-session-model.md §12), in Node.
// Every expected minute, id, date and record is a LITERAL from
// tests/fixtures/live-practice-expectations.json, worked out by hand from the
// published rules. The store runs for real with its IndexedDB adapter stubbed
// (writes this file can refuse), exactly as practice-session-families does;
// the sound module runs against a fake AudioContext whose clock this file
// moves. Real speakers are the owner's walkthrough (ac-8).
// ---------------------------------------------------------------------------

const E = JSON.parse(readFileSync(join(process.cwd(), 'tests', 'fixtures', 'live-practice-expectations.json'), 'utf8'));

const SETAR = 'inst-setar';
const TAR = 'inst-tar';
/** The fixed LOCAL day: a morning session, then an evening one. */
const MORNING = new Date(2026, 9, 28, 8, 0);
const EVENING = new Date(2026, 9, 28, 19, 0);
const T = new Date(2026, 8, 1, 12).toISOString();

const storage = { fail: false, writes: 0, pending: Promise.resolve() as Promise<void>, last: '', gate: null as Promise<void> | null };
type Store = typeof import('../src/store/useStore').useStore;
let useStore: Store;

beforeAll(async () => {
  vi.resetModules();
  vi.doMock('../src/store/idb', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../src/store/idb')>()),
    idbStorage: {
      getItem: async () => null,
      setItem: async (_name: string, value: string) => {
        storage.writes += 1;
        storage.last = value;
        const write = storage.gate ?? (storage.fail ? Promise.reject(new Error('storage is full')) : Promise.resolve());
        write.catch(() => undefined);
        storage.pending = write;
      },
      removeItem: async () => undefined,
    },
    storageSettled: () => storage.pending,
  }));
  useStore = (await import('../src/store/useStore')).useStore;
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(EVENING);
});

afterAll(() => {
  vi.useRealTimers();
  vi.doUnmock('../src/store/idb');
});

function item(id: string, title: string, over: Partial<PracticeItem> = {}): PracticeItem {
  return {
    ...createItem({ instrumentId: SETAR, title, itemType: 'technique', status: 'usable', importance: 3, difficulty: 3 }, new Date(T)),
    id,
    ...over,
  };
}

function block(id: string, itemId: string, at: Date, minutes: number, result: BlockResult = 'not_logged', over: Partial<PracticeBlock> = {}): PracticeBlock {
  return {
    id,
    practiceItemId: itemId,
    instrumentId: SETAR,
    startedAt: at.toISOString(),
    durationMinutes: minutes,
    mode: 'learn',
    focus: 'other',
    result,
    scope: 'focused',
    createdReview: false,
    createdAt: at.toISOString(),
    updatedAt: at.toISOString(),
    ...over,
  };
}

const lesson = (id: string, date: string, over: Partial<Lesson> = {}): Lesson =>
  ({ id, instrumentId: SETAR, date, itemIds: [], recordings: [], createdAt: T, updatedAt: T, ...over }) as Lesson;
const prep = (id: string, itemId: string, lessonId: string | undefined, instrumentId = SETAR): LessonAgendaEntry =>
  createPreparation({ id, itemId, instrumentId, lessonId, now: MORNING });

function db(over: Partial<PracticeDB> = {}): PracticeDB {
  return {
    ...emptyDB(),
    instruments: [
      { id: SETAR, name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T },
      { id: TAR, name: 'Tar', family: 'Persian', active: true, createdAt: T, updatedAt: T },
    ],
    ...over,
  };
}

const pairs = (plan: SessionPlan) => plan.segments.map((s) => [s.itemId, s.minutes]);
const planned = (plan: SessionPlan) => plan.segments.reduce((n, s) => n + s.minutes, 0);
const unusedOf = (plan: SessionPlan) => plan.budgetMinutes - planned(plan);
const recipientsOf = (plan: SessionPlan) => plan.segments.filter((_, i) => freedRoom(plan, i) > 0).map((s) => s.itemId);

// ---------------------------------------------------------------------------
// ac-1 — freed preview time is an explicit choice; running time never moves
// ---------------------------------------------------------------------------

function seg(itemId: string, minutes: number, bucket: PlanBucket, floorMinutes = 2) {
  return { itemId, title: itemId.toUpperCase(), minutes, bucket, core: false, mode: 'learn' as const, focus: 'other' as const, reason: `why ${itemId}`, floorMinutes };
}

describe('preview time choices', () => {
  it('preview time choices preserve identity order capacity and unused remainders', async () => {
    const X = E.ac1.plan;
    const base: SessionPlan = {
      instrumentId: SETAR,
      budgetMinutes: X.budget,
      segments: [seg('w', 5, 'warmup'), seg('a', 15, 'deep', 10), seg('b', 10, 'lesson', 10), seg('r', 6, 'review'), seg('c', 4, 'cooldown')],
      summary: '',
      generatedAt: T,
    };
    expect(pairs(base)).toEqual(X.base);
    const frozenBase = JSON.stringify(base);
    const state = (p: SessionPlan) => ({ minutes: pairs(p), freed: freedMinutes(p), unused: unusedOf(p) });
    /** Identity, role, reason and floor of every surviving segment — only minutes may move. */
    const identity = (p: SessionPlan) => p.segments.map((s) => [s.itemId, s.bucket, s.reason, s.floorMinutes, s.title]);
    const survivorsOf = (p: SessionPlan, gone: string[]) => identity(p).filter(([id]) => !gone.includes(id as string));

    // LEAVE: removal frees the minutes, visibly unused; nothing else moves, no tap needed.
    const left = removePlanSegment(base, 2);
    expect({ ...state(left), recipients: recipientsOf(left) }).toEqual(X.afterRemoveB);
    expect(identity(left)).toEqual(survivorsOf(base, ['b']));
    expect(left.summary).toContain('15 of your 45 minutes are unused');

    // SPREAD: work first (never a warm-up or cool-down), each to its ceiling.
    const spread = reuseFreedMinutes(left, 'spread');
    expect(state(spread)).toEqual(X.spread);
    expect(identity(spread)).toEqual(identity(left));
    // Once: the freed time is spent, a second spread changes nothing.
    expect(reuseFreedMinutes(spread, 'spread')).toBe(spread);

    // GIVE to one chosen entry, up to its ceiling.
    expect(state(reuseFreedMinutes(left, 2))).toEqual(X.giveR);
    // A cool-down takes only up to its split + 1; the rest stays freed for another choice.
    const [cDone, aDone] = X.giveCThenA;
    const toC = reuseFreedMinutes(left, 3);
    expect(state(toC)).toEqual(cDone);
    expect(state(reuseFreedMinutes(toC, 1))).toEqual(aDone);
    // A warm-up at its pinned share has no room: offered nowhere, changes nothing.
    expect(freedRoom(left, 0)).toBe(0);
    expect(reuseFreedMinutes(left, 0)).toBe(left);
    // A cancelled choice — or a target that is not a segment — changes nothing.
    expect(reuseFreedMinutes(left, 9)).toBe(left);
    expect(JSON.stringify(left)).toBe(JSON.stringify(removePlanSegment(base, 2)));

    // REPEATED removes pool their minutes; only time still freed is ever spent.
    const twice = removePlanSegment(left, 2);
    const R = X.removeBThenR;
    expect(state(twice)).toEqual(R.removed);
    const twiceSpread = reuseFreedMinutes(twice, 'spread');
    expect({ ...state(twiceSpread), recipients: recipientsOf(twiceSpread) }).toEqual(R.spread);
    expect(reuseFreedMinutes(twiceSpread, 'spread')).toBe(twiceSpread); // full: nothing it may spread to
    expect(state(reuseFreedMinutes(twiceSpread, 2))).toEqual(R.giveC);

    // ALL removed: everything freed, nothing can take it, nothing to offer.
    let empty = base;
    while (empty.segments.length > 0) empty = removePlanSegment(empty, 0);
    expect({ freed: freedMinutes(empty), unused: unusedOf(empty), recipients: recipientsOf(empty) }).toEqual(X.allRemoved);
    expect(reuseFreedMinutes(empty, 'spread')).toBe(empty);

    // FULL recipients: work at 25 and a warm-up at its share — the time stays unused.
    const N = X.noRecipients;
    const full: SessionPlan = { ...base, budgetMinutes: N.budget, segments: [seg('w', 7, 'warmup'), seg('a', 25, 'deep', 10), seg('b', 25, 'deep', 10)] };
    expect(pairs(full)).toEqual(N.base);
    const fullLeft = removePlanSegment(full, 2);
    expect({ freed: freedMinutes(fullLeft), unused: unusedOf(fullLeft), recipients: recipientsOf(fullLeft) }).toEqual(N.afterRemoveB);
    expect(reuseFreedMinutes(fullLeft, 'spread')).toBe(fullLeft);

    // The PRIOR unplanned remainder is never "freed": every state above keeps it.
    for (const p of [left, spread, toC, twice, twiceSpread]) expect(unusedOf(p) - freedMinutes(p)).toBe(X.priorRemainder);
    // Manual order survives a reuse: move, then spread, then the order is the owner's.
    const moved = reuseFreedMinutes(movePlanSegment(left, 2, -1), 'spread');
    expect(moved.segments.map((s) => s.itemId)).toEqual(['w', 'r', 'a', 'c']);
    expect(JSON.stringify(base)).toBe(frozenBase);

    // START uses exactly the preview: identities, order, minutes.
    useStore.setState({ db: db(), active: null, activePlan: null, activeRoutine: null });
    useStore.getState().startPlan(spread);
    expect(useStore.getState().activePlan!.segments.map((s) => [s.itemId, s.minutes, s.bucket, s.status])).toEqual(
      spread.segments.map((s) => [s.itemId, s.minutes, s.bucket, 'pending']),
    );

    // RUNNING: Skip and an early finish free time and never hand it on.
    const run = useStore.getState().activePlan!;
    const baseRun: PlanRun = { ...run, budgetMinutes: X.budget, segments: base.segments.map((s) => ({ ...s, status: 'pending' as const })) };
    const skipped = skipPlanSegment(baseRun, 2);
    expect(planRunTime(skipped)).toEqual(E.ac1.running.planSkip);
    expect(skipped.segments.map((s) => s.minutes)).toEqual(base.segments.map((s) => s.minutes));
    const early = completePlanSegment(baseRun, 'w', 3);
    expect(planRunTime(early)).toEqual(E.ac1.running.planEarlyFinish);
    expect(early.segments.map((s) => s.minutes)).toEqual(base.segments.map((s) => s.minutes));
    useStore.getState().endPlan();

    // --- the Routine preview: the same choices, its own proportions ----------
    const RT = E.ac1.routine;
    const authored: RoutineSegment[] = [
      { label: 'Open strings', minutes: 2, itemId: 'warm', essential: true },
      { label: 'Mahur phrases', minutes: 4, itemId: 'chahar' },
      { label: 'Breathe', minutes: 1 },
    ];
    const frozenAuthored = JSON.stringify(authored);
    const named = (segs: RoutineSegment[]) => segs.map((s) => [s.label, s.minutes]);
    const rp = previewRoutine(authored);
    expect(named(rp.segments)).toEqual(RT.base);
    const noMahur = removeFromPreview(rp, 1);
    expect({ minutes: named(previewRunSegments(noMahur)), freed: noMahur.freedMinutes }).toEqual(RT.removeMahur);
    expect(removeFromPreview(noMahur, 1)).toBe(noMahur); // removing twice frees nothing more
    expect(named(previewRunSegments(reuseFreedRoutineMinutes(noMahur, 'spread')))).toEqual(RT.spread);
    expect(named(previewRunSegments(reuseFreedRoutineMinutes(noMahur, 2)))).toEqual(RT.giveBreathe);
    expect(reuseFreedRoutineMinutes(noMahur, 1)).toBe(noMahur); // a removed entry is no recipient
    // Give, remove the receiver, give again: the minutes move once each, never twice.
    let chain: RoutinePreview = reuseFreedRoutineMinutes(noMahur, 0);
    chain = removeFromPreview(chain, 0);
    chain = reuseFreedRoutineMinutes(chain, 2);
    expect(named(previewRunSegments(chain))).toEqual(RT.giveThenRemoveThenGive);
    // Invariant: kept minutes + freed minutes = the previewed total, after every step.
    for (const p of [rp, noMahur, chain, reuseFreedRoutineMinutes(noMahur, 'spread')]) {
      expect(previewRunSegments(p).reduce((n, s) => n + s.minutes, 0) + p.freedMinutes).toBe(7);
    }
    let allGone = rp;
    for (const i of [0, 1, 2]) allGone = removeFromPreview(allGone, i);
    expect({ freed: allGone.freedMinutes, run: previewRunSegments(allGone) }).toEqual(RT.allRemoved);
    expect(reuseFreedRoutineMinutes(allGone, 'spread')).toBe(allGone);

    // A fitted length and short-on-time compose with the same choices.
    const F = RT.fitted;
    const fitSource: RoutineSegment[] = F.segments.map(([label, minutes, essential]: [string, number, boolean]) => ({ label, minutes, essential }));
    const fitted = previewRoutine(fitRoutineToMinutes(fitSource, F.fitTo));
    expect(named(fitted.segments)).toEqual(F.fit);
    expect(named(previewRunSegments(reuseFreedRoutineMinutes(removeFromPreview(fitted, 1), 'spread')))).toEqual(F.removeN1Spread);
    const S = RT.shortOnTime;
    const short = previewRoutine(fitRoutineToMinutes(segmentsForRun(fitSource, true), S.fitTo));
    expect(named(short.segments)).toEqual(S.fit);
    expect(named(previewRunSegments(reuseFreedRoutineMinutes(removeFromPreview(short, 0), 1)))).toEqual(S.removeE1GiveE2);
    // The saved routine is never touched, and Start runs exactly the preview.
    expect(JSON.stringify(authored)).toBe(frozenAuthored);
    expect(JSON.stringify(fitSource)).toBe(JSON.stringify(F.segments.map(([label, minutes, essential]: [string, number, boolean]) => ({ label, minutes, essential }))));
    const routine = { id: 'rt', instrumentId: SETAR, name: 'Day', segments: authored, order: 0, createdAt: T, updatedAt: T };
    useStore.setState({ db: db({ pathwayRoutines: [routine] }), active: null, activePlan: null, activeRoutine: null });
    const startedWith = previewRunSegments(reuseFreedRoutineMinutes(noMahur, 'spread'));
    useStore.getState().startRoutineRun('rt', false, startedWith);
    expect(useStore.getState().activeRoutine!.authoredSegments).toEqual(startedWith);
    expect(useStore.getState().activeRoutine!.segs.map((s) => s.seconds)).toEqual([300, 120]);
    expect(useStore.getState().db.pathwayRoutines[0].segments).toBe(authored);
    useStore.setState({ activeRoutine: null });

    // RUNNING routine: Move on keeps elapsed, Skip logs nothing — neither lengthens another.
    const runSegs = toRunSegments(authored);
    const movedOn = skipCurrentSegment(runSegs, 60);
    expect(routineRunTime(authored, movedOn, 60)).toEqual(E.ac1.running.routineMoveOn);
    expect(movedOn.slice(1)).toEqual(runSegs.slice(1));
    const skippedRun = skipSegmentUnpractised(runSegs, 90);
    expect({ ...routineRunTime(authored, skippedRun, 90), minutes: [...aggregateItemMinutes(skippedRun, 90)] }).toEqual(E.ac1.running.routineSkip);
  });
});

// ---------------------------------------------------------------------------
// ac-2 — the evening plan after a morning session keeps the next class's work
// ---------------------------------------------------------------------------

function eveningFixture() {
  const items = [
    item('c1', 'Class gusheh', { itemType: 'gusheh', status: 'integrated', lastPractisedAt: MORNING.toISOString(), timesPractised: 14, reviewMode: 'manual', nextReviewDate: '2027-03-01', nextReviewSource: 'user' }),
    item('c2', 'Class drill', { importance: 2, difficulty: 2, lastPractisedAt: new Date(2026, 9, 28, 7).toISOString(), timesPractised: 20, returnIntent: 'keep_fresh', nextReviewDate: '2027-01-15', nextReviewSource: 'user', srReps: 4, srIntervalDays: 40, srEase: 2.5, srLastProgressDay: '2026-10-10' }),
    item('f1', 'Fresh one', { status: 'fragile', importance: 5, difficulty: 4, lastPractisedAt: new Date(2026, 9, 20, 12).toISOString() }),
    item('f2', 'Fresh two', { status: 'repairing', importance: 4, difficulty: 4, lastPractisedAt: new Date(2026, 9, 19, 12).toISOString() }),
    item('f3', 'Fresh three', { importance: 4, lastPractisedAt: new Date(2026, 9, 15, 12).toISOString(), timesPractised: 8 }),
    item('u', 'Uncommitted morning', { status: 'fragile', importance: 5, lastPractisedAt: MORNING.toISOString() }),
    item('fut', 'For the later class', { importance: 2, lastPractisedAt: new Date(2026, 9, 26, 12).toISOString() }),
    item('past', 'For a passed class', { importance: 1 }),
    item('arch', 'For an archive class', { importance: 1 }),
    item('unas', 'Unassigned', { importance: 1 }),
    item('asked', 'Only a question', { importance: 1 }),
    item('rest', 'Resting class piece', { status: 'dormant', importance: 5 }),
    item('tar1', 'Tar class piece', { instrumentId: TAR, importance: 5 }),
  ];
  const blocks = [
    block('m1', 'c1', MORNING, 25, 'stable_alone'),
    block('r1', 'c2', new Date(2026, 9, 28, 7), 30),
    block('r0', 'c2', new Date(2026, 9, 27, 7), 40),
    block('r00', 'c2', new Date(2026, 9, 26, 7), 40),
    block('mu', 'u', MORNING, 10, 'same'),
  ];
  const lessons = [
    lesson('L1', '2026-10-30'),
    lesson('L2', '2026-11-06'),
    lesson('Lpast', '2026-10-20'),
    lesson('Larch', '2026-10-29', { origin: 'archive' } as Partial<Lesson>),
    lesson('Ltar', '2026-10-29', { instrumentId: TAR }),
  ];
  const agenda: LessonAgendaEntry[] = [
    prep('p1', 'c1', 'L1'),
    prep('p2', 'c2', 'L1'),
    prep('p3', 'fut', 'L2'),
    prep('p4', 'past', 'Lpast'),
    prep('p5', 'arch', 'Larch'),
    prep('p6', 'unas', undefined),
    prep('p7', 'rest', 'L1'),
    prep('p8', 'tar1', 'Ltar', TAR),
    { id: 'q1', kind: 'question', text: 'Which fingering?', itemId: 'asked', instrumentId: SETAR, lessonId: 'L1', createdAt: T, updatedAt: T },
  ];
  return { items, blocks, lessons, agenda };
}

describe('next class work in the evening plan', () => {
  it('next class work survives morning practice in every evening plan', () => {
    const X = E.ac2;
    const fx = eveningFixture();
    const before = JSON.stringify(fx);
    const required = requiredClassWork(fx.agenda, fx.lessons, fx.items, SETAR, EVENING);
    expect(required).toEqual(X.required);
    const prepDates = preparationDatesByItem(fx.agenda, fx.lessons, EVENING);
    const args = { instrumentId: SETAR, now: EVENING, items: fx.items, blocks: fx.blocks, reviews: [] as Review[], preparationDates: prepDates };

    // The pool admits live class work practised today; everything else practised today steps aside.
    const scored = scoreItems(fx.items.filter((i) => i.instrumentId === SETAR && i.status !== 'dormant'), groupBlocksByItem(fx.blocks), EVENING, prepDates);
    const pool = candidatePool(scored, fx.blocks, EVENING);
    expect([pool.isRepeatPool, [...pool.classRepeats].sort(), pool.pool.some((s) => s.item.id === 'u')]).toEqual([false, ['c1', 'c2'], false]);
    // c2 is HEAVILY practised (saturated, the full exposure penalty) and still required.
    expect(scored.find((s) => s.item.id === 'c2')).toMatchObject({ saturated: true, parts: { exposurePenalty: 8 } });

    // Every fresh build, regeneration and length change seats BOTH, once each, with an honest reason.
    for (const budget of [12, 15, 20, 30, 45, 60, 90, 120]) {
      const plan = buildSessionPlan({ ...args, budgetMinutes: budget, requiredItemIds: required.itemIds });
      const again = buildSessionPlan({ ...args, budgetMinutes: budget, requiredItemIds: required.itemIds });
      expect(again.segments, `regenerate ${budget}`).toEqual(plan.segments);
      const ids = plan.segments.map((s) => s.itemId);
      expect(new Set(ids).size, `no duplicate ${budget}`).toBe(ids.length);
      expect(ids.filter((id) => id === 'c1' || id === 'c2').sort(), `seated ${budget}`).toEqual(['c1', 'c2']);
      for (const id of ['u', 'past', 'arch', 'unas', 'asked', 'rest', 'tar1']) expect(ids, `${id} at ${budget}`).not.toContain(id);
      for (const s of plan.segments) {
        expect(s.reason, `${s.itemId} at ${budget}`).not.toContain('nothing else eligible');
        expect(s.reason.endsWith(X.classReason), `${s.itemId} at ${budget}`).toBe(s.itemId === 'c1' || s.itemId === 'c2');
        if (s.itemId === 'c1') expect(s.minutes).toBeGreaterThanOrEqual(10);
      }
      expect(planClassCoverage(plan, required, fx.items).omitted, `coverage ${budget}`).toEqual([]);
      expect(plan.summary).not.toContain('Class gusheh');
    }
    expect(pairs(buildSessionPlan({ ...args, budgetMinutes: 20, requiredItemIds: required.itemIds })).map(([id, m], i) => [id, m, buildSessionPlan({ ...args, budgetMinutes: 20, requiredItemIds: required.itemIds }).segments[i].bucket])).toEqual(X.evening20);
    // The counterexample: scoring alone (no reservation) lets the fresh work push the class out.
    expect(buildSessionPlan({ ...args, budgetMinutes: 20 }).segments.map((s) => s.itemId)).not.toContain('c2');
    // No lower-priority optional displacement: whatever else is seated, the class work is.
    const plan45 = buildSessionPlan({ ...args, budgetMinutes: 45, requiredItemIds: required.itemIds });
    expect(plan45.segments.map((s) => s.itemId)).toEqual(expect.arrayContaining(['c1', 'c2']));

    // SWAP draws from the same pool: a deep slot never hands back the uncommitted morning item,
    // and swapping a class slot is an explicit override the coverage reports.
    const plan30 = buildSessionPlan({ ...args, budgetMinutes: 30, requiredItemIds: required.itemIds });
    const excludeIds = new Set(plan30.segments.map((s) => s.itemId));
    const c1At = plan30.segments.findIndex((s) => s.itemId === 'c1');
    const swapped = swapSegment(plan30, c1At, { ...args, excludeIds });
    expect(swapped.segments[c1At].itemId).toBe('fut');
    expect(planClassCoverage(swapped, required, fx.items).omitted).toEqual([{ itemId: 'c1', title: 'Class gusheh', floorMinutes: 10, why: 'edited' }]);
    expect(swapped.segments.map((s) => s.itemId)).not.toContain('u');
    // A swap of a deep slot may bring class work back in (the pool admits it).
    const deepOnly: SessionPlan = { instrumentId: SETAR, budgetMinutes: 20, segments: [seg('f1', 10, 'deep', 2), seg('f2', 10, 'deep', 2)], summary: '', generatedAt: T };
    const deepSwap = swapSegment(deepOnly, 1, { ...args, excludeIds: new Set(['f1', 'f2']) });
    expect(deepSwap.segments[1].itemId).not.toBe('u');

    // TODAY: a small ranked suggestion from the same pool — class work eligible, honestly explained,
    // and no "nothing else is waiting" claim beside it.
    const recs = recommendForInstrument(SETAR, fx.items, fx.blocks, EVENING, prepDates);
    const shown = [recs.best, recs.quickWin, recs.maintenance].filter(Boolean);
    expect(shown.map((r) => r!.score.item.id)).not.toContain('u');
    for (const r of shown) expect(r!.reason).not.toContain('nothing else eligible');
    const classCard = recommendForInstrument(SETAR, fx.items.filter((i) => i.id === 'c1' || i.id === 'u'), fx.blocks, EVENING, prepDates).best!;
    expect([classCard.score.item.id, classCard.reason.endsWith(X.todayReason)]).toEqual(['c1', true]);

    // NEXT PRACTICE: available again this session, never "back tomorrow"; stored dates kept.
    for (const id of ['c1', 'c2'] as const) {
      const it = fx.items.find((i) => i.id === id)!;
      expect(nextPractice({ item: it, preparationDate: prepDates.get(id), now: EVENING })).toMatchObject(X.nextPractice[id]);
    }
    for (const id of ['past', 'arch', 'unas', 'asked']) expect(prepDates.has(id), id).toBe(false);
    expect(prepDates.get('fut')).toBe('2026-11-06');
    // The later class keeps its own bounded urgency and no guarantee.
    expect(required.itemIds).not.toContain('fut');
    // The morning, before any practice, plans the same class work.
    const morningPlan = buildSessionPlan({ ...args, now: MORNING, blocks: [], budgetMinutes: 20, requiredItemIds: requiredClassWork(fx.agenda, fx.lessons, fx.items, SETAR, MORNING).itemIds });
    expect(morningPlan.segments.map((s) => s.itemId)).toEqual(expect.arrayContaining(['c1', 'c2']));

    // Organisation, never evidence: every input — dates, spacing, blocks — is exactly as it was.
    expect(JSON.stringify(fx)).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// ac-3 — what cannot fit is named, and a partial start is a deliberate choice
// ---------------------------------------------------------------------------

describe('class plan capacity', () => {
  it('class plan capacity exceptions name omissions before any partial start', () => {
    const X = E.ac3;
    const L1 = lesson('L1', '2026-10-30');
    const L2 = lesson('L2', '2026-11-06');
    const build = (items: PracticeItem[], agenda: LessonAgendaEntry[], budget: number, lessons = [L1, L2], reviews: Review[] = []) => {
      const required = requiredClassWork(agenda, lessons, items, SETAR, EVENING);
      const plan = buildSessionPlan({ instrumentId: SETAR, budgetMinutes: budget, now: EVENING, items, blocks: [], reviews, preparationDates: preparationDatesByItem(agenda, lessons, EVENING), requiredItemIds: required.itemIds });
      return { plan, required, coverage: planClassCoverage(plan, required, items, 'rev1|2026-10-28') };
    };
    const work = (id: string, importance: number) => item(id, id.toUpperCase(), { itemType: 'gusheh', importance });
    const optional = [
      item('o1', 'Open strings', { importance: 2, difficulty: 2, timesPractised: 6 }),
      item('o2', 'Shaky passage', { status: 'fragile', importance: 5, difficulty: 4 }),
    ];
    const two = [work('w1', 4), work('w2', 3), ...optional];
    const twoAgenda = [prep('pw1', 'w1', 'L1'), prep('pw2', 'w2', 'L1')];

    // Floors fit: both whole works, 10 each — the optional roles yield.
    const t20 = build(two, twoAgenda, 20);
    expect(pairs(t20.plan)).toEqual(X.twoWorks20);
    expect([t20.coverage.omitted, planStartRefusal(t20.plan, t20.coverage)]).toEqual([[], null]);

    // 15: one fits; the other is NAMED with the minimum that holds both, and no optional padding.
    const t15 = build(two, twoAgenda, 15);
    expect({ segments: pairs(t15.plan), omitted: t15.coverage.omitted.map((o) => o.itemId), minimum: t15.coverage.minimumMinutes }).toEqual(X.twoWorks15);
    expect(t15.coverage.omitted).toEqual([{ itemId: 'w2', title: 'W2', floorMinutes: 10, why: 'capacity' }]);
    // No silent start: only a choice made against THIS coverage starts it.
    expect(planStartRefusal(t15.plan, t15.coverage)).toBe('partial');
    expect(planStartRefusal(t15.plan, t15.coverage, 'something else')).toBe('partial');
    expect(planStartRefusal(t15.plan, t15.coverage, t15.coverage.key)).toBeNull();

    // 5 with a lone whole work: no token slot — nothing to start, the minimum said.
    const lone = build([work('w1', 4), ...optional], [prep('pw1', 'w1', 'L1')], 5);
    expect({ segments: pairs(lone.plan), omitted: lone.coverage.omitted.map((o) => o.itemId), minimum: lone.coverage.minimumMinutes }).toEqual(X.loneWork5);
    expect(planStartRefusal(lone.plan, lone.coverage, lone.coverage.key)).toBe('empty');

    // Several 2-minute parts at 10: all seated, past the old one-segment count.
    const parent = item('parent', 'The piece', { itemType: 'full_piece' });
    const parts = [5, 4, 3, 2].map((imp, k) => item(`p${k + 1}`, `Part ${k + 1}`, { itemType: 'section', parentItemId: 'parent', importance: imp }));
    const partsPlan = build([parent, ...parts], parts.map((p) => prep(`pp-${p.id}`, p.id, 'L1')), 10);
    expect(pairs(partsPlan.plan)).toEqual(X.parts10);

    // Parent AND child both prepared: two deliberate commitments, both seated
    // (the familiar drill still warms up — its share fits beside their floors);
    // an uncommitted sibling never duplicates the reserved family.
    const pa = item('pa', 'Parent', { itemType: 'full_piece', importance: 4 });
    const ch = item('ch', 'Child', { itemType: 'section', parentItemId: 'pa', importance: 3 });
    const sib = item('sib', 'Sibling', { itemType: 'section', parentItemId: 'pa', importance: 5, difficulty: 2, timesPractised: 5 });
    const oth = item('oth', 'Other drill', { importance: 2 });
    const fam = [pa, ch, sib, oth];
    const both = build(fam, [prep('ppa', 'pa', 'L1'), prep('pch', 'ch', 'L1')], 20);
    expect(pairs(both.plan)).toEqual(X.parentAndChild20);
    // Only the parent: the uncommitted child and sibling stay out — unless a review of their own is due.
    const onlyParent = build(fam, [prep('ppa', 'pa', 'L1')], 30);
    expect(onlyParent.plan.segments.map((s) => s.itemId)).toContain('pa');
    expect(onlyParent.plan.segments.map((s) => s.itemId).filter((id) => id === 'ch' || id === 'sib')).toEqual([]);
    const dueSib = fam.map((i) => (i.id === 'sib' ? { ...i, nextReviewDate: '2026-10-28', nextReviewSource: 'auto' as const } : i));
    const dueRow: Review[] = [{ id: 'rv', practiceItemId: 'sib', dueDate: '2026-10-28', reviewType: 'retention', createdAt: T, updatedAt: T }];
    expect(build(dueSib, [prep('ppa', 'pa', 'L1')], 30, [L1, L2], dueRow).plan.segments.map((s) => s.itemId)).toEqual(expect.arrayContaining(['pa', 'sib']));
    // Only the child: it never proves the parent (which stays out), and its sibling is distinct.
    const onlyChild = build(fam, [prep('pch', 'ch', 'L1')], 30);
    expect(onlyChild.required.itemIds).toEqual(['ch']);
    expect(onlyChild.plan.segments.map((s) => s.itemId)).toContain('ch');
    expect(onlyChild.plan.segments.map((s) => s.itemId)).not.toContain('pa');
    expect(onlyChild.coverage.seated).toEqual(['ch']);

    // More than 120 required minutes: the same partial exception, never an impossible increase.
    const many = Array.from({ length: 13 }, (_, k) => work(`w${String(k + 1).padStart(2, '0')}`, 3));
    const over = build(many, many.map((w) => prep(`p-${w.id}`, w.id, 'L1')), 120);
    expect({ seated: over.plan.segments.length, omitted: over.coverage.omitted.map((o) => o.itemId), minimum: over.coverage.minimumMinutes }).toEqual(X.over120);
    expect(over.plan.segments.every((s) => s.minutes === 10)).toBe(true);
    expect(planStartRefusal(over.plan, over.coverage)).toBe('partial');

    // Two classes on the nearest date: both count; the later class does not.
    const La = lesson('L1a', '2026-10-30');
    const Lb = lesson('L1b', '2026-10-30');
    const eq = [item('e1', 'E1'), item('e2', 'E2'), item('e3', 'E3')];
    const eqReq = requiredClassWork([prep('a', 'e1', 'L1a'), prep('b', 'e2', 'L1b'), prep('c', 'e3', 'L2')], [La, Lb, L2], eq, SETAR, EVENING);
    expect({ lessonIds: eqReq.lessonIds, itemIds: eqReq.itemIds }).toEqual(X.equalDates);
    // The nearest class with nothing prepared requires nothing, whatever a later one holds.
    expect(requiredClassWork([prep('c', 'e3', 'L2')], [La, L2], eq, SETAR, EVENING).itemIds).toEqual([]);

    // OVERRIDES: a remove or swap shows as an omission — never repaired, never counted covered.
    const removed = removePlanSegment(t20.plan, 1);
    const removedCov = planClassCoverage(removed, t20.required, two, 'rev1|2026-10-28');
    expect(removedCov.omitted).toEqual([{ itemId: 'w2', title: 'W2', floorMinutes: 10, why: 'edited' }]);
    expect(planStartRefusal(removed, removedCov)).toBe('partial');
    const accepted = removedCov.key;
    expect(planStartRefusal(removed, removedCov, accepted)).toBeNull();
    // A NEW commitment after the choice, another revision or another day: the old choice is stale.
    const w3 = work('w3', 2);
    const grown = requiredClassWork([...twoAgenda, prep('pw3', 'w3', 'L1')], [L1, L2], [...two, w3], SETAR, EVENING);
    expect(planStartRefusal(removed, planClassCoverage(removed, grown, [...two, w3], 'rev1|2026-10-28'), accepted)).toBe('partial');
    expect(planStartRefusal(removed, planClassCoverage(removed, t20.required, two, 'rev2|2026-10-28'), accepted)).toBe('partial');
    expect(planStartRefusal(removed, planClassCoverage(removed, t20.required, two, 'rev1|2026-10-29'), accepted)).toBe('partial');
    // A class retargeted away removes the obligation at once.
    const retargeted = requiredClassWork([prep('pw1', 'w1', 'L1'), prep('pw2', 'w2', 'L2')], [L1, L2], two, SETAR, EVENING);
    expect(planClassCoverage(removed, retargeted, two).omitted).toEqual([]);
    // Manual order survives all of it.
    const reordered = movePlanSegment(t20.plan, 1, -1);
    expect(removePlanSegment(reordered, 0).segments.map((s) => s.itemId)).toEqual(['w1']);
    expect(reordered.segments.map((s) => s.itemId)).toEqual(['w2', 'w1']);

    // USEFUL FLOORS THROUGH EVERY PREVIEW EDIT AND START. A whole work and a
    // drill for the same class at 5: the drill is seated, the work named.
    const cw = item('cw', 'Class work', { itemType: 'full_piece', importance: 5 });
    const cd = item('cd', 'Class drill', { importance: 4 });
    const pair = [cw, cd, ...optional];
    const pairAgenda = [prep('pcw', 'cw', 'L1'), prep('pcd', 'cd', 'L1')];
    const five = build(pair, pairAgenda, 5);
    expect({ segments: pairs(five.plan), omitted: five.coverage.omitted.map((o) => [o.itemId, o.why]) }).toEqual(X.pairAt5);
    // Swapping the ONLY row never seats the 10-minute work in a 5-minute slot.
    const swapArgs = { instrumentId: SETAR, now: EVENING, items: pair, blocks: [], reviews: [], preparationDates: preparationDatesByItem(pairAgenda, [L1, L2], EVENING), requiredItemIds: five.required.itemIds };
    const swappedOnly = swapSegment(five.plan, 0, swapArgs);
    expect(pairs(swappedOnly)).toEqual(X.pairAt5Swapped);
    expect(swappedOnly.segments.some((s) => s.itemId === 'cw')).toBe(false);
    // (Discriminator: the same swap blind to the required set is exactly the token slot.)
    expect(pairs(swapSegment(five.plan, 0, { ...swapArgs, requiredItemIds: [] }))).toEqual([['cw', 5]]);
    // Coverage and every Start door judge a sub-floor class slot as NOT seated,
    // and no partial-start choice can accept it (the plan the old swap made).
    const token: SessionPlan = { ...five.plan, segments: [{ ...five.plan.segments[0], itemId: 'cw', title: 'Class work', minutes: 5, floorMinutes: 10 }] };
    const tokenCov = planClassCoverage(token, five.required, pair, 'rev1|2026-10-28');
    expect({ seated: tokenCov.seated, omitted: tokenCov.omitted.map((o) => [o.itemId, o.why]) }).toEqual(X.tokenCoverage);
    expect(planStartRefusal(token, tokenCov, tokenCov.key)).toBe('short');
    // Run installation (the store's startPlan) rechecks live: the token plan
    // never becomes a running plan, an unaccepted partial neither; the swap
    // result starts only with the choice made against its own coverage.
    useStore.setState({ db: db({ items: pair, lessons: [L1, L2], lessonAgenda: pairAgenda }), active: null, activePlan: null, activeRoutine: null });
    const liveKey = (p: SessionPlan) => planClassCoverage(p, five.required, pair, `${useStore.getState().rev}|2026-10-28`).key;
    expect(useStore.getState().startPlan(token, liveKey(token))).toBe('short');
    expect(useStore.getState().startPlan(swappedOnly)).toBe('partial');
    expect(useStore.getState().activePlan).toBeNull();
    expect(useStore.getState().startPlan(swappedOnly, liveKey(swappedOnly))).toBeNull();
    expect(useStore.getState().activePlan!.segments.map((s) => [s.itemId, s.minutes])).toEqual(X.pairAt5Swapped);
    // SEGMENT START rechecks the LIVE floor: the installed drill made a whole
    // work before its segment starts is refused — never a 5-minute token of a
    // 10-minute class work — and the run waits, unskipped, for the owner.
    const asWork = pair.map((i) => (i.id === 'cd' ? { ...i, itemType: 'full_piece' as const } : i));
    useStore.setState((s) => ({ db: { ...s.db, items: asWork } }));
    expect(useStore.getState().beginPlanSegment()).toEqual({ ok: false, reason: 'short', floorMinutes: 10 });
    expect([useStore.getState().active, useStore.getState().activePlan!.pointer, useStore.getState().activePlan!.segments[0].status]).toEqual([null, 0, 'pending']);
    // Discriminators: the same work no longer committed for the class starts
    // (no class floor applies), and so does the drill as it was.
    useStore.setState((s) => ({ db: { ...s.db, lessonAgenda: [prep('pcw', 'cw', 'L1'), prep('pcd', 'cd', 'L2')] } }));
    expect(useStore.getState().beginPlanSegment()).toMatchObject({ ok: true });
    expect(useStore.getState().active!.targetMinutes).toBe(5);
    useStore.setState((s) => ({ active: null, db: { ...s.db, items: pair, lessonAgenda: pairAgenda } }));
    expect(useStore.getState().beginPlanSegment()).toMatchObject({ ok: true });
    expect([useStore.getState().active!.itemId, useStore.getState().active!.targetMinutes]).toEqual(['cd', 5]);
    useStore.setState({ active: null, activePlan: null });
  });
});

// ---------------------------------------------------------------------------
// ac-4 — optional routine feedback can be cleared, honestly
// ---------------------------------------------------------------------------

describe('routine feedback', () => {
  it('routine feedback can be cleared without changing practice or retention', async () => {
    const X = E.ac4;
    const runAt = new Date(2026, 9, 28, 8);
    const items = [
      item('x', 'Has an older result', { lastResult: 'same', status: 'usable', nextReviewDate: '2026-11-02', nextReviewSource: 'auto', srReps: 2, srIntervalDays: 6, srEase: 2.5 }),
      item('y', 'No older result', { status: 'new' }),
      item('z', 'Newer result elsewhere', { lastResult: 'stable_alone', status: 'usable' }),
    ];
    const blocks = [
      block('old-x', 'x', new Date(2026, 9, 20, 9), 10, 'same'),
      block('rb-x', 'x', runAt, 6),
      block('rb-y', 'y', runAt, 4),
      block('rb-z', 'z', runAt, 3),
      block('new-z', 'z', new Date(2026, 9, 28, 9), 12, 'stable_alone'),
      block('foreign', 'x', new Date(2026, 9, 12, 9), 8, 'worse'),
    ];
    const reviews: Review[] = [{ id: 'rv-x', practiceItemId: 'x', dueDate: '2026-11-02', reviewType: 'retention', createdAt: T, updatedAt: T }];
    useStore.setState({ db: db({ items, blocks, reviews }), active: null, activePlan: null, activeRoutine: null });
    const run = ['rb-x', 'rb-y', 'rb-z'];
    const capture = (c: { blockId: string; result: BlockResult; observation?: string }[]) => useStore.getState().recordRoutineCapture(run, c);
    const st = () => useStore.getState().db;
    const lastResult = (id: string) => st().items.find((i) => i.id === id)!.lastResult ?? null;
    const untouched = () => ({
      minutes: st().blocks.map((b) => [b.id, b.durationMinutes, b.scope, b.practiceItemId, b.startedAt]),
      reviews: st().reviews,
      schedule: st().items.map((i) => [i.id, i.status, i.nextReviewDate, i.srReps, i.srIntervalDays, i.srEase, i.returnIntent, i.timesPractised, i.totalMinutes]),
    });
    const fixed = JSON.stringify(untouched());

    /** What a reload would read back: the snapshot the LAST write carried. */
    const onDisk = () => (JSON.parse(storage.last) as { state: { db: PracticeDB } }).state.db;
    const diskOf = (blockId: string, itemId: string) => {
      const d = onDisk();
      const b = d.blocks.find((x) => x.id === blockId)!;
      return { result: b.result, observation: b.observation ?? null, lastResult: d.items.find((i) => i.id === itemId)!.lastResult ?? null };
    };
    /** The UI's Save and Try again, exactly: `Object.entries(draft)`, an observation string on every row. */
    const uiSave = (draft: Record<string, { result: BlockResult; observation: string }>) =>
      capture(Object.entries(draft).map(([blockId, v]) => ({ blockId, result: v.result, observation: v.observation })));

    // Select then clear BEFORE saving: the draft is "Not assessed" again — memory
    // is unchanged, and the Save still writes what memory holds (one write, settled).
    const writes0 = storage.writes;
    const dbBefore = st();
    expect(uiSave({ 'rb-x': { result: 'not_logged', observation: '' } })).toBeNull();
    expect([st() === dbBefore, storage.writes - writes0]).toEqual([true, 1]);
    await expect(storage.pending).resolves.toBeUndefined();

    // SAVE, then CLEAR (save-clear-save), several items at once.
    expect(capture([
      { blockId: 'rb-x', result: 'slightly_better', observation: 'Left hand freer' },
      { blockId: 'rb-y', result: 'performable' },
      { blockId: 'rb-z', result: 'performable' },
    ])).toBeNull();
    expect([lastResult('x'), lastResult('y'), lastResult('z')]).toEqual([X.x.afterSave, X.y.afterSave, X.z.afterSave]);
    expect(generateInsights(st(), EVENING).find((i) => i.id === 'improved')?.body).toContain('No older result');

    // A FAILED write, then the UI's Try again with nothing edited — for each kind
    // of capture (an assessment, an observation-only edit, a clear). The retry
    // finds memory already matching, and must still write it: exactly one more
    // write, which settles, carrying the capture a reload would read back.
    const retryCases: { name: string; draft: Record<string, { result: BlockResult; observation: string }>; disk: Record<string, [string, string, ReturnType<typeof diskOf>]> }[] = [
      {
        name: 'assessment',
        draft: { 'rb-y': { result: 'worse', observation: '' } },
        disk: { y: ['rb-y', 'y', { result: 'worse', observation: null, lastResult: 'worse' }] },
      },
      {
        name: 'observation only',
        draft: { 'rb-x': { result: 'slightly_better', observation: 'Left hand freer still' } },
        disk: { x: ['rb-x', 'x', { result: 'slightly_better', observation: 'Left hand freer still', lastResult: 'slightly_better' }] },
      },
      {
        // Clear: the observation stays unless edited; the summary follows the history honestly.
        name: 'clear',
        draft: {
          'rb-x': { result: 'not_logged', observation: 'Left hand freer' },
          'rb-y': { result: 'not_logged', observation: '' },
          'rb-z': { result: 'not_logged', observation: '' },
        },
        disk: {
          x: ['rb-x', 'x', { result: 'not_logged', observation: 'Left hand freer', lastResult: X.x.afterClear }],
          y: ['rb-y', 'y', { result: 'not_logged', observation: null, lastResult: X.y.afterClear }],
          z: ['rb-z', 'z', { result: 'not_logged', observation: null, lastResult: X.z.afterClear }],
        },
      },
    ];
    for (const c of retryCases) {
      storage.fail = true; // the write FAILS — the capture is held in memory only
      expect(uiSave(c.draft), c.name).toBeNull();
      await expect(storage.pending, c.name).rejects.toThrow('storage is full');
      storage.fail = false;
      const w = storage.writes;
      const inMemory = st();
      expect(uiSave(c.draft), c.name).toBeNull(); // Try again: the SAME draft, nothing edited
      expect([st() === inMemory, storage.writes - w], c.name).toEqual([true, 1]);
      await expect(storage.pending, c.name).resolves.toBeUndefined();
      for (const [blockId, itemId, expected] of Object.values(c.disk)) expect(diskOf(blockId, itemId), `${c.name} ${blockId}`).toEqual(expected);
    }
    expect([lastResult('x'), lastResult('y'), lastResult('z')]).toEqual([X.x.afterClear, X.y.afterClear, X.z.afterClear]);
    expect(Object.prototype.hasOwnProperty.call(st().items.find((i) => i.id === 'y'), 'lastResult')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(onDisk().items.find((i) => i.id === 'y'), 'lastResult')).toBe(false);
    expect(st().blocks.find((b) => b.id === 'rb-x')).toMatchObject({ result: 'not_logged', observation: 'Left hand freer' });
    // Repeating the clear (a second Save) changes nothing in memory: the same arrays, one identical write.
    const afterClear = st();
    const w = storage.writes;
    expect(uiSave({ 'rb-x': { result: 'not_logged', observation: 'Left hand freer' }, 'rb-y': { result: 'not_logged', observation: '' } })).toBeNull();
    expect([st() === afterClear, storage.writes - w]).toEqual([true, 1]);
    // Save again after the clear.
    expect(capture([{ blockId: 'rb-y', result: 'worse' }])).toBeNull();
    expect(lastResult('y')).toBe('worse');
    expect(capture([{ blockId: 'rb-y', result: 'not_logged' }])).toBeNull();
    expect(lastResult('y')).toBeNull();

    // A foreign or deleted block refuses the WHOLE capture; nothing changes.
    const beforeRefusal = st();
    expect(capture([{ blockId: 'rb-x', result: 'same' }, { blockId: 'foreign', result: 'same' }])).toMatch(/foreign/);
    expect(capture([{ blockId: 'rb-x', result: 'same' }, { blockId: 'gone', result: 'same' }])).toMatch(/gone/);
    expect(st()).toBe(beforeRefusal);
    expect(captureRoutineResults(beforeRefusal, run, [{ blockId: 'rb-x', result: 'nope' as BlockResult }], EVENING)).toHaveProperty('refused');

    // Minutes, scope, reviews, dates, spacing, status and counters: exactly as the run left them.
    expect(JSON.stringify(untouched())).toBe(fixed);
    // Every reader of results sees only what remains: history, Insights, the teacher report.
    const byItem = groupBlocksByItem(st().blocks);
    expect(recentResults(byItem.get('x')!)).toEqual(['same', 'worse']);
    expect(recentResults(byItem.get('y')!)).toEqual([]);
    expect(generateInsights(st(), EVENING).find((i) => i.id === 'improved')?.body ?? '').not.toContain('No older result');
    const report = buildReportData(st(), { instrumentId: SETAR, from: '2026-10-28', to: '2026-10-28', now: EVENING });
    expect(report.periodResults.map((r) => [r.item.id, r.best, r.last])).toEqual([['z', 'stable_alone', 'stable_alone']]);
  });
});

// ---------------------------------------------------------------------------
// ac-6 — the metronome on the audio clock, and the cue's priority over it
// ---------------------------------------------------------------------------

type Ev = { e: string; [k: string]: unknown };

function fakeAudio(log: Ev[], resume: { mode: 'ok' | 'rejects' | 'hangs' | 'manual' }) {
  let ids = 0;
  class Param {
    private v = 1;
    private ctx: number;
    constructor(private owner: { id: number; currentTime: number }, private node: string) { this.ctx = owner.id; }
    // As the spec has it: assigning `value` is an automation event at the context's `currentTime`.
    get value() { return this.v; }
    set value(v: number) { this.v = v; log.push({ e: 'value', ctx: this.ctx, node: this.node, v, t: this.owner.currentTime }); }
    setValueAtTime(v: number, t: number) { log.push({ e: 'set', ctx: this.ctx, node: this.node, v, t }); }
    linearRampToValueAtTime(v: number, t: number) { log.push({ e: 'lin', ctx: this.ctx, node: this.node, v, t }); }
    exponentialRampToValueAtTime(v: number, t: number) { log.push({ e: 'exp', ctx: this.ctx, node: this.node, v, t }); }
  }
  class Ctx {
    id = ++ids;
    state = 'suspended';
    currentTime = 10;
    destination = { kind: 'destination' };
    nodes = 0;
    private listeners: (() => void)[] = [];
    constructor() { log.push({ e: 'ctor', id: this.id, ctx: this }); }
    addEventListener(_t: string, fn: () => void) { this.listeners.push(fn); }
    setState(s: string) { this.state = s; for (const fn of this.listeners) fn(); }
    close() { log.push({ e: 'close', id: this.id }); this.setState('closed'); return Promise.resolve(); }
    resume() {
      log.push({ e: 'resume', id: this.id });
      if (resume.mode === 'rejects') return Promise.reject(new Error('denied'));
      if (resume.mode === 'hangs') return new Promise<void>(() => undefined);
      if (resume.mode === 'manual') return new Promise<void>((done) => log.push({ e: 'pending', done: () => { this.setState('running'); done(); } }));
      this.setState('running');
      return Promise.resolve();
    }
    createGain() {
      const n = ++this.nodes;
      const node = { kind: `gain${n}`, gain: new Param(this, `gain${n}`), connect: (to: { kind: string }) => (log.push({ e: 'connect', ctx: this.id, from: `gain${n}`, to: to.kind }), to), disconnect: () => log.push({ e: 'disconnect', ctx: this.id, node: `gain${n}` }) };
      return node;
    }
    createOscillator() {
      const n = ++this.nodes;
      const node = {
        kind: `osc${n}`,
        type: 'sine',
        frequency: { value: 0 },
        onended: null as null | (() => void),
        connect: (to: { kind: string }) => (log.push({ e: 'connect', ctx: this.id, from: `osc${n}`, to: to.kind }), to),
        disconnect: () => log.push({ e: 'disconnect', ctx: this.id, node: `osc${n}` }),
        start: (t: number) => log.push({ e: 'start', ctx: this.id, node: `osc${n}`, t, hz: node.frequency.value, wave: node.type }),
        stop: (t?: number) => log.push({ e: 'stop', ctx: this.id, t }),
      };
      return node;
    }
  }
  return Ctx;
}

async function loadSound(log: Ev[], resume: { mode: 'ok' | 'rejects' | 'hangs' | 'manual' }, audio = true) {
  vi.resetModules();
  vi.stubGlobal('window', audio ? { AudioContext: fakeAudio(log, resume) } : {});
  vi.stubGlobal('navigator', { vibrate: (p: unknown) => (log.push({ e: 'vibrate', p }), true) });
  const cue = await import('../src/components/practiceCue');
  const metronome = await import('../src/components/metronome');
  const store = (await import('../src/store/useStore')).useStore;
  return { ...cue, ...metronome, store };
}

/**
 * The level the beat's MUTE stage (the duck) holds at each 1600 Hz tick: walk
 * the tick's own route (oscillator -> its envelope -> the duck it feeds) and
 * read the latest automation event at or before the tick, time-sorted as the
 * audio engine orders them (insertion order breaks ties). No event: 1.
 */
function tickLevels(log: Ev[]): [number, number][] {
  const ms = (t: unknown) => Math.round((t as number) * 1000) / 1000;
  const to = (ctx: unknown, from: unknown) => log.find((x) => x.e === 'connect' && x.ctx === ctx && x.from === from)?.to;
  return log
    .filter((x) => x.e === 'start' && x.hz === 1600)
    .map((tick) => {
      const duck = to(tick.ctx, to(tick.ctx, tick.node));
      const events = log
        .map((x, i) => ({ x, i }))
        .filter(({ x }) => (x.e === 'set' || x.e === 'value') && x.ctx === tick.ctx && x.node === duck && (x.t as number) <= (tick.t as number))
        .sort((a, b) => (a.x.t as number) - (b.x.t as number) || a.i - b.i);
      return [ms(tick.t), events.length ? (events.at(-1)!.x.v as number) : 1];
    });
}

// ---------------------------------------------------------------------------
// ac-5 support — the live question's one write lifecycle, against a storage
// whose every answer this file controls (the real UI proof is the browser's).
// ---------------------------------------------------------------------------

describe('the live question lifecycle', () => {
  it('a live question writes one agenda question whose every answered write settles', async () => {
    const live = await import('../src/store/useStore');
    const L = lesson('L1', '2026-10-30');
    useStore.setState({ db: db({ items: [item('a', 'A')], lessons: [L] }), active: null, activePlan: null, activeRoutine: null });
    const cap = () => live.useLiveQuestion.getState().capture;
    const qs = () => useStore.getState().db.lessonAgenda.filter((e) => e.kind === 'question') as (LessonAgendaEntry & { text: string; itemId?: string; lessonId?: string })[];
    const onDisk = () => (JSON.parse(storage.last) as { state: { db: PracticeDB } }).state.db.lessonAgenda.filter((e) => e.kind === 'question').map((q) => [q.id, (q as { text: string }).text]);
    /** Let an answered write's acknowledgement run (a resolved promise's continuation, no timer). */
    const flush = async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    };
    /** A write the test answers by hand. */
    const hold = () => {
      let answer!: (ok: boolean) => void;
      storage.gate = new Promise<void>((res, rej) => (answer = (ok) => (ok ? res() : rej(new Error('refused')))));
      storage.gate.catch(() => undefined);
      return async (ok: boolean) => {
        storage.gate = null;
        answer(ok);
        await flush();
      };
    };

    // Opening and closing blank (or whitespace) creates nothing.
    live.openLiveQuestion(SETAR, 'a', 's1');
    expect(cap()!.owner).toEqual({ instrumentId: SETAR, itemId: 'a', lessonId: 'L1' });
    live.editLiveQuestion('   ');
    live.closeLiveQuestion();
    expect([cap(), qs()]).toEqual([null, []]);

    // First write appends ONE question; later writes update THAT id.
    live.openLiveQuestion(SETAR, 'a', 's1');
    live.editLiveQuestion('Which finger?');
    live.saveLiveQuestion();
    await flush();
    const id = cap()!.questionId!;
    expect([cap()!.attempt?.status, cap()!.written, onDisk()]).toEqual(['saved', 'Which finger?', [[id, 'Which finger?']]]);
    // Coalesced: the same words again write nothing more.
    const writes = storage.writes;
    live.saveLiveQuestion();
    live.flushLiveQuestion();
    expect(storage.writes).toBe(writes);

    // Pending write, then the field cleared to blank: no blank question, the
    // written one untouched, and the answer SETTLES — on success…
    let answer = hold();
    live.editLiveQuestion('Which finger for the trill?');
    live.saveLiveQuestion();
    expect(cap()!.attempt?.status).toBe('saving');
    live.editLiveQuestion('');
    live.saveLiveQuestion();
    await answer(true);
    expect([cap()!.attempt?.status, cap()!.written, live.liveQuestionSettled(cap()!), qs().map((q) => [q.id, q.text])]).toEqual(['saved', 'Which finger for the trill?', true, [[id, 'Which finger for the trill?']]]);
    // …and on failure: settled as failed, never saving, and not "settled" — the
    // question in memory holds words the device refused; Try again writes them.
    answer = hold();
    live.editLiveQuestion('Left hand?');
    live.saveLiveQuestion();
    live.editLiveQuestion('  ');
    await answer(false);
    expect([cap()!.attempt?.status, cap()!.written, live.liveQuestionSettled(cap()!)]).toEqual(['failed', 'Which finger for the trill?', false]);
    live.closeLiveQuestion(); // Done never closes over refused words
    expect(cap()).not.toBeNull();
    live.saveLiveQuestion(true);
    await flush();
    // Acknowledged now, so the Done asked for completes.
    expect([cap(), onDisk()]).toEqual([null, [[id, 'Left hand?']]]);

    // An OLDER acknowledgement never closes, clears or marks newer words saved.
    live.openLiveQuestion(SETAR, 'a', 's1');
    live.editLiveQuestion('Second capture');
    live.saveLiveQuestion();
    await flush();
    const id2 = cap()!.questionId!;
    expect(id2).not.toBe(id);
    answer = hold();
    live.editLiveQuestion('Older words');
    live.closeLiveQuestion(); // Done: close only once the LATEST words land
    live.editLiveQuestion('Newer words');
    live.saveLiveQuestion();
    await answer(true);
    expect([cap()!.text, cap()!.attempt?.carried, cap()!.attempt?.status, cap()!.closing]).toEqual(['Newer words', 'Newer words', 'saved', false]);
    // A failed write keeps words and id; Try again writes even with memory unchanged.
    storage.fail = true;
    live.editLiveQuestion('Retry me');
    live.saveLiveQuestion();
    await flush();
    expect([cap()!.attempt?.status, cap()!.questionId]).toEqual(['failed', id2]);
    storage.fail = false;
    const before = storage.writes;
    live.saveLiveQuestion(true);
    await flush();
    expect([storage.writes - before, cap()!.attempt?.status, onDisk()]).toEqual([1, 'saved', [[id, 'Left hand?'], [id2, 'Retry me']]]);

    // Removed elsewhere: never recreated by a later write; only a deliberate new question.
    useStore.getState().removeAgendaEntry(id);
    useStore.getState().removeAgendaEntry(id2);
    live.editLiveQuestion('After removal');
    live.saveLiveQuestion();
    await flush();
    expect(qs()).toEqual([]);
    live.saveLiveQuestionAsNew();
    await flush();
    expect(qs().map((q) => [q.text, q.itemId, q.lessonId])).toEqual([['After removal', 'a', 'L1']]);
    expect(cap()!.questionId).not.toBe(id2);

    // Done closes once acknowledged; a NEW capture is a new question.
    live.closeLiveQuestion();
    expect([cap(), live.useLiveQuestion.getState().note]).toEqual([null, 'Question saved on this device for 2026-10-30.']);
    live.openLiveQuestion(SETAR, undefined, 's2');
    live.editLiveQuestion('Instrument question');
    live.closeLiveQuestion();
    await flush();
    expect(qs().map((q) => [q.text, q.itemId ?? null])).toEqual([['After removal', 'a'], ['Instrument question', null]]);
    expect(cap()).toBeNull();

    // Its class chosen with the field EMPTY is a write acknowledged like any
    // other: refused → failed and unsettled, Done writes it again and stays
    // open; answered → saved, and only then does Done close, saying where.
    live.openLiveQuestion(SETAR, 'a', 's3');
    live.editLiveQuestion('Class question');
    live.saveLiveQuestion();
    await flush();
    const id3 = cap()!.questionId!;
    live.editLiveQuestion('');
    storage.fail = true;
    const w0 = storage.writes;
    live.chooseLiveQuestionLesson(undefined);
    await flush();
    expect([cap()!.attempt?.status, cap()!.attempt?.carried, live.liveQuestionSettled(cap()!)]).toEqual(['failed', 'Class question', false]);
    live.closeLiveQuestion();
    await flush();
    expect([cap()?.questionId, cap()?.attempt?.status, storage.writes - w0 >= 3]).toEqual([id3, 'failed', true]);
    storage.fail = false;
    live.saveLiveQuestion(true);
    await flush();
    expect([cap()!.attempt?.status, live.liveQuestionSettled(cap()!), qs().find((q) => q.id === id3)!.lessonId]).toEqual(['saved', true, undefined]);
    live.closeLiveQuestion();
    expect([cap(), live.useLiveQuestion.getState().note]).toEqual([null, 'Question saved on this device — unassigned.']);
  });
});

describe('the metronome', () => {
  it('metronome scheduling and cue priority survive sound lifecycle changes', async () => {
    const X = E.ac6;
    vi.useFakeTimers();
    const flush = () => vi.advanceTimersByTimeAsync(0);
    const log: Ev[] = [];
    const resume = { mode: 'ok' as 'ok' | 'rejects' | 'hangs' | 'manual' };
    const m = await loadSound(log, resume);
    const ms = (t: unknown) => Math.round((t as number) * 1000) / 1000;
    const ctxs = () => log.filter((x) => x.e === 'ctor').map((x) => x.ctx as InstanceType<ReturnType<typeof fakeAudio>>);
    const beats = (id?: number) => log.filter((x) => x.e === 'start' && x.hz === 1600 && (id === undefined || x.ctx === id)).map((x) => ms(x.t));
    /** Move the audio clock and let the look-ahead timer run once. */
    const at = async (t: number) => { ctxs().at(-1)!.currentTime = t; await vi.advanceTimersByTimeAsync(25); };

    // Bounded tempo: 80 by default, 40–240, refused rather than clamped from rubbish.
    expect([m.BPM_DEFAULT, m.validateBpm(39.4), m.validateBpm(240.4), m.validateBpm(Number.NaN), m.validateBpm(120.4)]).toEqual([80, null, 240, null, 120]);
    m.stepBpm(-100);
    expect(m.validateBpm(40)).toBe(40);
    m.setBpm(80);

    // START on a running context: beats on the AUDIO clock, from the look-ahead, exactly.
    m.primePracticeSound();
    await flush();
    const c1 = ctxs()[0];
    expect(c1.state).toBe('running');
    m.startMetronome();
    m.startMetronome(); // a double tap never stacks a second scheduler
    expect(vi.getTimerCount()).toBe(1);
    await at(10.7);
    await at(11.45);
    expect(beats(c1.id)).toEqual(X.bpm80From10);
    expect(log.filter((x) => x.e === 'start' && x.hz === 1600).every((x) => x.wave === 'triangle')).toBe(true);
    // A tempo edit takes effect from the next beat not yet placed — no double beat.
    m.setBpm(120);
    await at(12.2);
    await at(12.7);
    expect(beats(c1.id).slice(-2)).toEqual(X.bpm120After);
    // A late timer (throttled) skips the missed beats on the grid — never a burst.
    const n = beats(c1.id).length;
    await at(X.lateJump.to);
    expect(beats(c1.id).slice(n)).toEqual(X.lateJump.beats);

    // CUE PRIORITY: a boundary mutes the beat for the cue's window, then the beat resumes in time.
    await at(30);
    const beforeCue = beats(c1.id).length;
    m.playPracticeCue();
    const duck = log.filter((x) => x.e === 'set' && x.node === 'gain1').map((x) => [x.v, ms(x.t)]);
    expect(duck).toEqual(X.duck);
    expect(log.filter((x) => x.e === 'start' && (x.hz === 988 || x.hz === 1319)).map((x) => [x.hz, ms(x.t)])).toEqual([[988, 30], [1319, 30.3]]);
    expect(log.filter((x) => x.e === 'vibrate')).toHaveLength(1);
    await at(30.5);
    await at(31);
    const after = beats(c1.id).slice(beforeCue);
    for (let i = 1; i < after.length; i++) expect(ms(after[i] - after[i - 1])).toBe(0.5);
    expect(after.length).toBeLessThanOrEqual(3);
    // The cue's once-only claim is unchanged.
    m.store.setState({ active: { itemId: 'i', instrumentId: SETAR, mode: 'learn', focus: 'other', targetMinutes: 10, startedAt: 'S', accumulatedSeconds: 0, running: true } });
    expect([m.store.getState().claimSessionSignal('S', 600), m.store.getState().claimSessionSignal('S', 600)]).toEqual([true, false]);
    m.store.setState({ active: null });

    // STOP cancels every beat already placed and leaves nothing connected.
    m.stopMetronome();
    expect(vi.getTimerCount()).toBe(0);
    const stoppedAt = beats().length;
    await at(40);
    expect(beats().length).toBe(stoppedAt);
    expect(log.some((x) => x.e === 'disconnect' && x.node === 'gain1')).toBe(true);
    // Rapid toggles: one scheduler, one first beat each time.
    for (let i = 0; i < 3; i++) { m.startMetronome(); m.stopMetronome(); }
    m.startMetronome();
    expect(vi.getTimerCount()).toBe(1);

    // The practice screen's say: hidden, paused, finished or left — it stops and never restarts itself.
    for (const screen of [{ visible: false, running: true }, { visible: true, running: false }]) {
      m.startMetronome();
      m.holdMetronome(screen);
      expect(m.useMetronome).toBeTypeOf('function');
      expect(vi.getTimerCount()).toBe(0);
      m.holdMetronome({ visible: true, running: true });
      expect(vi.getTimerCount()).toBe(0);
    }

    // A readying tap (Test sound, Turn on sound, Resume, a Start) REPLACES the context:
    // the beat stops with the old one and nothing more is ever placed on it.
    m.startMetronome();
    const oldBeats = beats(c1.id).length;
    m.testPracticeSound();
    await flush();
    const c2 = ctxs()[1];
    expect([c1.state, c2.state, vi.getTimerCount()]).toEqual(['closed', 'running', 0]);
    await at(50);
    expect([beats(c1.id).length, beats(c2.id)]).toEqual([oldBeats, []]);

    // Lost readiness: an interruption stops the beat; it stays off until a tap.
    m.startMetronome();
    expect(vi.getTimerCount()).toBe(1);
    c2.setState('interrupted');
    expect(vi.getTimerCount()).toBe(0);
    c2.setState('running');
    await at(60);
    expect(vi.getTimerCount()).toBe(0);

    // Start from a tap while sound is NOT ready: it readies sound; a denied,
    // rejected or never-settled resume never begins a beat.
    for (const mode of ['rejects', 'hangs'] as const) {
      resume.mode = mode;
      ctxs().at(-1)!.setState('suspended');
      m.startMetronome();
      await flush();
      await vi.advanceTimersByTimeAsync(1000);
      expect(vi.getTimerCount(), mode).toBe(0);
    }
    // An OLD start whose resume lands after a stop (a remount, Pause, a newer tap) never begins.
    resume.mode = 'manual';
    ctxs().at(-1)!.setState('suspended');
    m.startMetronome();
    const pending = log.filter((x) => x.e === 'pending').at(-1)!.done as () => void;
    m.stopMetronome();
    pending();
    await flush();
    expect(vi.getTimerCount()).toBe(0);
    // …while a resume that lands for the CURRENT start begins the beat on that context.
    m.startMetronome();
    (log.filter((x) => x.e === 'pending').at(-1)!.done as () => void)();
    await flush();
    expect(vi.getTimerCount()).toBe(1);
    m.stopMetronome();

    // CUE PRIORITY ACROSS STARTS: a beat started — or stopped and restarted —
    // inside a cue's window yields until the window ends, on every door that
    // sounds the cue (a boundary, Test sound / Turn on sound). A window on a
    // context since replaced, or one already over, mutes nothing.
    type Sound = Awaited<ReturnType<typeof loadSound>>;
    const clock = (l: Ev[], t: number) => { (l.filter((x) => x.e === 'ctor').at(-1)!.ctx as { currentTime: number }).currentTime = t; };
    const cueCases: { name: string; run: (s: Sound, l: Ev[]) => Promise<void> }[] = [
      {
        name: 'cue then Start',
        run: async (s, l) => {
          s.playPracticeCue(); // 10.00 -> 10.56
          clock(l, 10.1);
          s.startMetronome();
          clock(l, 10.85);
          await vi.advanceTimersByTimeAsync(25);
        },
      },
      {
        name: 'stop and restart inside the window',
        run: async (s, l) => {
          s.startMetronome(); // first beat 10.05
          clock(l, 10.02);
          s.playPracticeCue(); // 10.02 -> 10.58, over a running beat
          s.stopMetronome();
          clock(l, 10.2);
          s.startMetronome(); // a fresh mute stage, still inside the window
          clock(l, 10.95);
          await vi.advanceTimersByTimeAsync(25);
          clock(l, 11.7);
          await vi.advanceTimersByTimeAsync(25);
        },
      },
      {
        name: 'window already over at Start',
        run: async (s, l) => {
          s.playPracticeCue();
          clock(l, 10.6);
          s.startMetronome();
        },
      },
      {
        name: 'cue on a replaced context',
        run: async (s, l) => {
          s.playPracticeCue(); // on the first context
          s.primePracticeSound(); // a readying tap: a NEW context, its clock at 10
          await vi.advanceTimersByTimeAsync(0);
          clock(l, 10.1);
          s.startMetronome();
        },
      },
      {
        name: 'recovery cue then Start',
        run: async (s, l) => {
          s.testPracticeSound(); // Turn on sound: a new context, and the cue on it at 10.00
          await vi.advanceTimersByTimeAsync(0);
          clock(l, 10.1);
          s.startMetronome();
          clock(l, 10.85);
          await vi.advanceTimersByTimeAsync(25);
        },
      },
    ];
    for (const c of cueCases) {
      const l: Ev[] = [];
      const s = await loadSound(l, { mode: 'ok' });
      s.setBpm(80);
      s.primePracticeSound();
      await vi.advanceTimersByTimeAsync(0);
      await c.run(s, l);
      expect(tickLevels(l), c.name).toEqual(X.cueAcrossStarts[c.name]);
      // A mute is the only automation to 0 (envelopes start at a floor): none where no window applies.
      if (c.name === 'window already over at Start' || c.name === 'cue on a replaced context') {
        expect(l.filter((x) => x.e === 'set' && x.v === 0), c.name).toEqual([]);
      }
      s.stopMetronome();
    }

    // Unavailable audio: nothing starts, nothing throws, practice is usable.
    {
      const quiet: Ev[] = [];
      const q = await loadSound(quiet, resume, false);
      expect(() => q.startMetronome()).not.toThrow();
      expect(q.useMetronome).toBeTypeOf('function');
      q.store.setState({ active: null, activeRoutine: null });
      q.store.getState().startSession({ itemId: 'i', instrumentId: SETAR, mode: 'learn', focus: 'other', targetMinutes: 10 });
      expect(!!q.store.getState().active).toBe(true);
      q.store.setState({ active: null });
    }
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(EVENING);
    vi.unstubAllGlobals();
  });
});
