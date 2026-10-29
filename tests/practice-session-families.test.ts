import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  buildSessionPlan,
  canonicalStringify,
  captureRoutineResults,
  createItem,
  createLesson,
  createPreparation,
  decideReview,
  effectiveReturnDate,
  emptyDB,
  fitRoutineToMinutes,
  hashState,
  migrateToCurrent,
  movePlanSegment,
  nextPractice,
  overdueDays,
  planNextReview,
  planPreviewDayHasPassed,
  planRunTime,
  planSegmentStartable,
  preparationDatesByItem,
  recommendForInstrument,
  removePlanSegment,
  returnIntentOf,
  routineRunTime,
  runSegmentStates,
  SCHEMA_VERSION,
  SchemaTooNewError,
  suggestStatusAfterBlock,
  swapSegment,
  validateDB,
  validateUnfinishedRun,
  type BlockResult,
  type EvidenceScope,
  type ISODate,
  type PlanSegment,
  type PracticeBlock,
  type PracticeDB,
  type PracticeItem,
  type ReturnIntent,
  type Review,
  type RoutineSegment,
  type SessionPlan,
} from '../src/domain';

// ---------------------------------------------------------------------------
// The practice-session families (docs/practice-session-model.md), proved in
// Node through the REAL store: its IndexedDB adapter is replaced by a stub
// whose writes this file can refuse, exactly as blocks.test.ts already does,
// so every action here is the one the screens call. Expected minutes, dates
// and statuses are LITERALS worked out in the doc's tables, never read back
// from the implementation.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-10-23T12:00:00.000Z');
const TODAY = '2026-10-23';
const T = NOW.toISOString();
const SETAR = 'inst-setar';
const TAR = 'inst-tar';

const storage = { fail: false, writes: 0, pending: Promise.resolve() as Promise<void> };
type Store = typeof import('../src/store/useStore').useStore;
let useStore: Store;

beforeAll(async () => {
  vi.resetModules();
  vi.doMock('../src/store/idb', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../src/store/idb')>()),
    idbStorage: {
      getItem: async () => null,
      setItem: async () => {
        storage.writes += 1;
        const write = storage.fail ? Promise.reject(new Error('storage is full')) : Promise.resolve();
        write.catch(() => undefined);
        storage.pending = write;
      },
      removeItem: async () => undefined,
    },
    storageSettled: () => storage.pending,
  }));
  useStore = (await import('../src/store/useStore')).useStore;
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterAll(() => {
  vi.useRealTimers();
  vi.doUnmock('../src/store/idb');
});

const at = (seconds: number) => vi.setSystemTime(new Date(NOW.getTime() + seconds * 1000));

function item(id: string, title: string, over: Partial<PracticeItem> = {}): PracticeItem {
  return {
    ...createItem({ instrumentId: SETAR, title, itemType: 'gusheh', status: 'usable', importance: 3, difficulty: 3 }, new Date('2026-09-01T12:00:00.000Z')),
    id,
    ...over,
  };
}

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

function seed(state: PracticeDB) {
  at(0);
  useStore.setState({ db: state, active: null, activePlan: null, activeRoutine: null });
}

const minutesByItem = (blocks: PracticeBlock[]) =>
  Object.fromEntries(blocks.map((b) => [b.practiceItemId, b.durationMinutes]));

// ---------------------------------------------------------------------------
// ac-2 — one control policy for Plan and Routine
// ---------------------------------------------------------------------------

/** 0 Open strings 2′ (warm) · 1 Chahārmezrāb 3′ (chahar) · 2 Open strings again 1′ (warm) · 3 Breathe 1′ (unbound). */
const WARM_UP: RoutineSegment[] = [
  { label: 'Open strings', minutes: 2, itemId: 'warm' },
  { label: 'Chahārmezrāb slow', minutes: 3, itemId: 'chahar' },
  { label: 'Open strings again', minutes: 1, itemId: 'warm' },
  { label: 'Breathe', minutes: 1 },
];

function routineDb(): PracticeDB {
  return db({
    items: [
      item('warm', 'Open strings', { itemType: 'technique', nextReviewDate: '2026-10-25', nextReviewSource: 'auto', srReps: 2 }),
      item('chahar', 'چهارمضراب ماهور', { itemType: 'full_piece', status: 'fragile' }),
    ],
    reviews: [{ id: 'rev-warm', practiceItemId: 'warm', dueDate: '2026-10-25', reviewType: 'retention', createdAt: T, updatedAt: T }],
    pathwayRoutines: [{ id: 'rt', instrumentId: SETAR, name: 'Warm up', segments: WARM_UP, order: 0, createdAt: T, updatedAt: T }],
  });
}

/** Run the routine from t=0 through a script of timed actions, then Finish. */
function runRoutine(script: [number, (s: ReturnType<Store['getState']>) => void][], finishAt: number) {
  seed(routineDb());
  useStore.getState().startRoutineRun('rt', false, WARM_UP);
  for (const [t, act] of script) {
    at(t);
    act(useStore.getState());
  }
  at(finishAt);
  const ids = useStore.getState().finishRoutine();
  const blocks = useStore.getState().db.blocks.filter((b) => ids.includes(b.id));
  return { ids, blocks, minutes: minutesByItem(blocks) };
}

describe('the shared session-control policy', () => {
  it('routine controls distinguish skipped time from partial practice across run transitions', async () => {
    // --- ROUTINE: each case is a script against the 7-minute Warm up -------
    const cases: { name: string; script: [number, (s: ReturnType<Store['getState']>) => void][]; finishAt: number; expected: Record<string, number> }[] = [
      // Played through: the repeated item aggregates 2′+1′; the unbound segment logs nothing.
      { name: 'natural completion', script: [], finishAt: 420, expected: { warm: 3, chahar: 3 } },
      // Skip after 50 s in the first segment: that occurrence logs NOTHING; its later occurrence still counts.
      { name: 'skip the current segment', script: [[50, (s) => s.skipRoutineRun()]], finishAt: 350, expected: { warm: 1, chahar: 3 } },
      // Move on after 90 s keeps 90 s; skipping the LATER occurrence 30 s in keeps the earlier 90 s (round(1.5) = 2).
      {
        name: 'move on, then skip a repeated item',
        script: [
          [90, (s) => s.moveOnRoutineRun()],
          [300, (s) => s.skipRoutineRun()],
        ],
        finishAt: 360,
        expected: { warm: 2, chahar: 3 },
      },
      // Remove a not-yet-reached segment, then Finish early at 70 s: no block for the removed item.
      { name: 'remove pending, finish early', script: [[30, (s) => s.removeRoutineSegment(1)]], finishAt: 70, expected: { warm: 1 } },
      // Paused 80 s into the piece, wall time passes, then Skip: nothing for the piece.
      {
        name: 'paused skip after real elapsed time',
        script: [
          [200, (s) => s.pauseRoutineRun()],
          [500, (s) => s.skipRoutineRun()],
          [500, (s) => s.resumeRoutineRun()],
        ],
        finishAt: 620,
        expected: { warm: 3 },
      },
      // Everything skipped or removed: the ordinary completed outcome, nothing recorded.
      {
        name: 'all removed',
        script: [
          [10, (s) => s.skipRoutineRun()],
          [10, (s) => s.removeRoutineSegment(3)],
          [10, (s) => s.skipRoutineRun()],
          [10, (s) => s.skipRoutineRun()],
        ],
        finishAt: 15,
        expected: {},
      },
    ];
    for (const c of cases) {
      const { blocks, minutes } = runRoutine(c.script, c.finishAt);
      expect(minutes, c.name).toEqual(c.expected);
      for (const b of blocks) expect([b.result, b.scope], c.name).toEqual(['not_logged', 'focused']);
      const after = useStore.getState().db;
      // No retention judgement: the warm item's date, row and spacing stand.
      const warm = after.items.find((i) => i.id === 'warm')!;
      expect([warm.nextReviewDate, warm.srReps, warm.status], c.name).toEqual(['2026-10-25', 2, 'usable']);
      expect(after.reviews.map((r) => [r.dueDate, r.completedAt]), c.name).toEqual([['2026-10-25', undefined]]);
      expect(useStore.getState().activeRoutine, c.name).toBeNull();
    }

    // The run's own states and time figures, mid-run (seconds).
    seed(routineDb());
    useStore.getState().startRoutineRun('rt', false, WARM_UP);
    at(90);
    useStore.getState().moveOnRoutineRun();
    at(100);
    useStore.getState().removeRoutineSegment(2);
    at(130);
    const live = useStore.getState().activeRoutine!;
    expect(runSegmentStates(WARM_UP, live.segs, 130)).toEqual(['moved_on', 'current', 'skipped', 'pending']);
    // Planned 420; Move on freed 30 and Remove freed 60 — unused, never handed on; the piece keeps its 180.
    expect(live.segs.map((s) => s.seconds)).toEqual([90, 180, 0, 60]);
    expect(routineRunTime(WARM_UP, live.segs, 130)).toEqual({ planned: 420, remaining: 200, unused: 90 });
    // Completed records cannot be removed retrospectively, nor the current one.
    useStore.getState().removeRoutineSegment(0);
    useStore.getState().removeRoutineSegment(1);
    expect(useStore.getState().activeRoutine!.segs).toBe(live.segs);

    // DUPLICATE FINISH counts each real item once.
    at(330);
    const first = useStore.getState().finishRoutine();
    const blocksAfter = useStore.getState().db.blocks.length;
    expect(useStore.getState().finishRoutine()).toEqual([]);
    expect([first.length, useStore.getState().db.blocks.length]).toEqual([2, blocksAfter]);

    // RELOAD / RESUME: the persisted run round-trips, validates and continues.
    seed(routineDb());
    useStore.getState().startRoutineRun('rt', false, WARM_UP);
    at(100);
    useStore.getState().pauseRoutineRun();
    const persisted = JSON.parse(JSON.stringify({ activeRoutine: useStore.getState().activeRoutine }));
    expect(validateUnfinishedRun(persisted)).toBeNull();
    useStore.setState({ activeRoutine: persisted.activeRoutine });
    at(150);
    useStore.getState().resumeRoutineRun();
    at(470);
    const resumedIds = useStore.getState().finishRoutine();
    expect(minutesByItem(useStore.getState().db.blocks.filter((b) => resumedIds.includes(b.id)))).toEqual({ warm: 3, chahar: 3 });

    // A LEGACY run (no skip flags): its old Skip kept 50 s, and still does.
    seed(routineDb());
    useStore.setState({
      activeRoutine: {
        routineId: 'rt',
        shortOnTime: false,
        authoredSegments: WARM_UP,
        segs: [{ itemId: 'warm', seconds: 50 }, { itemId: 'chahar', seconds: 180 }, { itemId: 'warm', seconds: 60 }, { seconds: 60 }],
        accumulatedSeconds: 50,
        running: false,
      },
    });
    expect(validateUnfinishedRun({ activeRoutine: useStore.getState().activeRoutine })).toBeNull();
    useStore.getState().finishRoutine();
    expect(minutesByItem(useStore.getState().db.blocks)).toEqual({ warm: 1 });

    // A FAILED FINISH WRITE keeps the outcome once, in memory, and a retry really writes.
    seed(routineDb());
    useStore.getState().startRoutineRun('rt', false, WARM_UP);
    at(420);
    storage.fail = true;
    useStore.getState().finishRoutine();
    await expect(storage.pending).rejects.toThrow('storage is full');
    expect(minutesByItem(useStore.getState().db.blocks)).toEqual({ warm: 3, chahar: 3 });
    storage.fail = false;
    const writes = storage.writes;
    useStore.getState().persistAgain();
    await expect(storage.pending).resolves.toBeUndefined();
    expect(storage.writes).toBe(writes + 1);
    expect(useStore.getState().db.blocks).toHaveLength(2);

    // AN EXPLICIT ROUTINE LENGTH reallocates in proportion (7′ → 14′).
    expect(fitRoutineToMinutes(WARM_UP, 14).map((s) => s.minutes)).toEqual([4, 6, 2, 2]);

    // --- PLAN: the same policy over independently closed blocks ------------
    const seg = (itemId: string, minutes: number, bucket: PlanSegment['bucket']): PlanSegment => ({
      itemId,
      title: itemId,
      minutes,
      bucket,
      core: false,
      mode: 'learn',
      focus: 'other',
      reason: `reason for ${itemId}`,
      floorMinutes: 2,
    });
    const plan: SessionPlan = {
      instrumentId: SETAR,
      budgetMinutes: 30,
      segments: [seg('warm', 4, 'warmup'), seg('chahar', 12, 'lesson'), seg('gusheh', 8, 'deep')],
      summary: '',
      generatedAt: T,
    };
    // Remove before start — first, middle, final, all: the rest never grow.
    expect(removePlanSegment(plan, 0).segments.map((s) => s.minutes)).toEqual([12, 8]);
    expect(removePlanSegment(plan, 1).segments.map((s) => s.minutes)).toEqual([4, 8]);
    const removedLast = removePlanSegment(plan, 2);
    expect([removedLast.segments.map((s) => s.minutes), removedLast.removedMinutes]).toEqual([[4, 12], 8]);
    expect(removedLast.summary).toContain('14 of your 30 minutes are unused');
    expect([0, 0, 0].reduce((p, i) => removePlanSegment(p, i), plan).segments).toEqual([]);

    const planDb = db({
      items: [
        item('warm', 'Open strings', { itemType: 'technique' }),
        item('chahar', 'چهارمضراب ماهور', { itemType: 'full_piece' }),
        item('gusheh', 'درآمد شور'),
      ],
    });
    // An explicit regeneration IS the allocation boundary: it may spend the time again.
    const rebuilt = buildSessionPlan({ instrumentId: SETAR, budgetMinutes: 30, now: NOW, items: planDb.items, blocks: [], reviews: [] });
    expect(rebuilt.segments.reduce((n, s) => n + s.minutes, 0)).toBeGreaterThan(16);

    seed(planDb);
    useStore.getState().startPlan(removedLast);
    // Overtime on the first: recorded as practised, charged to nobody else.
    useStore.getState().beginPlanSegment();
    expect(useStore.getState().active?.itemId).toBe('warm');
    useStore.getState().closeSession({ result: 'same', durationMinutes: 6, answer: 'scheduled', now: NOW });
    let run = useStore.getState().activePlan!;
    expect(run.segments.map((s) => [s.itemId, s.status, s.minutes, s.actualMinutes])).toEqual([
      ['warm', 'done', 4, 6],
      ['chahar', 'pending', 12, undefined],
    ]);
    expect(planRunTime(run)).toEqual({ available: 30, planned: 16, remaining: 12, unused: 14, recorded: 6 });
    // Skip the current block AFTER time passed: nothing is saved for it.
    useStore.getState().beginPlanSegment();
    at(300);
    useStore.getState().skipPlanBlockUnsaved();
    run = useStore.getState().activePlan!;
    expect([useStore.getState().active, run.pointer, run.segments[1].status]).toEqual([null, 2, 'skipped']);
    expect(useStore.getState().db.blocks.map((b) => [b.practiceItemId, b.durationMinutes])).toEqual([['warm', 6]]);
    expect(planRunTime(run)).toEqual({ available: 30, planned: 4, remaining: 0, unused: 26, recorded: 6 });
    // A done segment and its saved block are never undone by a control.
    useStore.getState().skipPlanSegment(0);
    expect(useStore.getState().activePlan!.segments[0].status).toBe('done');

    // EARLY COMPLETION frees the rest of that target: unused, never handed on.
    // 20′ available, two 10′ entries. Saved after 2′: 10 left, 2 recorded,
    // 20 − (2 + 10) = 8 unused. Saved after 3′: 20 − (2 + 3) = 15 unused.
    const twoTens: SessionPlan = { ...plan, budgetMinutes: 20, segments: [seg('warm', 10, 'warmup'), seg('chahar', 10, 'lesson')] };
    const closeAfter = (minutes: number) => {
      useStore.getState().beginPlanSegment();
      useStore.getState().closeSession({ result: 'same', durationMinutes: minutes, answer: 'scheduled', now: NOW });
    };
    seed(planDb);
    useStore.getState().startPlan(twoTens);
    closeAfter(2);
    expect(planRunTime(useStore.getState().activePlan!)).toEqual({ available: 20, planned: 12, remaining: 10, unused: 8, recorded: 2 });
    // A RESTORED run (the persisted shape, round-tripped) reads the same figures.
    const restored = JSON.parse(JSON.stringify(useStore.getState().activePlan)) as typeof run;
    expect(planRunTime(restored)).toEqual({ available: 20, planned: 12, remaining: 10, unused: 8, recorded: 2 });
    closeAfter(3);
    run = useStore.getState().activePlan!;
    expect([run.pointer, planRunTime(run)]).toEqual([2, { available: 20, planned: 5, remaining: 0, unused: 15, recorded: 5 }]);
    // Partial practice, then Skip the next: 20 − 2 = 18 unused, 2 recorded.
    seed(planDb);
    useStore.getState().startPlan(twoTens);
    closeAfter(2);
    useStore.getState().skipPlanSegment();
    expect(planRunTime(useStore.getState().activePlan!)).toEqual({ available: 20, planned: 2, remaining: 0, unused: 18, recorded: 2 });
    // A done segment with no recorded figure (an older run) claims nothing freed.
    const older = { ...restored, segments: restored.segments.map((x) => ({ ...x, actualMinutes: undefined })) };
    expect(planRunTime(older)).toEqual({ available: 20, planned: 20, remaining: 10, unused: 0, recorded: 0 });

    // Skip a LATER pending entry while running: the current one is untouched.
    seed(planDb);
    useStore.getState().startPlan(plan);
    useStore.getState().skipPlanSegment(2);
    run = useStore.getState().activePlan!;
    expect([run.pointer, run.segments.map((s) => s.status)]).toEqual([0, ['pending', 'pending', 'skipped']]);
    // Skipping every entry is the ordinary finished outcome, with nothing recorded.
    useStore.getState().skipPlanSegment();
    useStore.getState().skipPlanSegment();
    run = useStore.getState().activePlan!;
    expect([run.pointer, planRunTime(run).recorded, useStore.getState().db.blocks.length]).toEqual([3, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// ac-4 — reordering the Session Plan preview
// ---------------------------------------------------------------------------

describe('session plan reordering', () => {
  it('session plan reordering preserves segment identity allocation and execution order', () => {
    const items = [
      item('a', 'Darāmad', { itemType: 'gusheh' }),
      item('b', 'Kereshme', { itemType: 'technique', difficulty: 2, timesPractised: 5 }),
      item('c', 'Chahār-mezrāb', { itemType: 'full_piece' }),
      item('d', 'Spare', { itemType: 'technique' }),
    ];
    const seg = (itemId: string, minutes: number, bucket: PlanSegment['bucket']): PlanSegment => ({
      itemId,
      title: itemId,
      minutes,
      bucket,
      core: bucket !== 'deep',
      mode: 'learn',
      focus: 'tone',
      reason: `why ${itemId}`,
      floorMinutes: 2,
    });
    const plan: SessionPlan = {
      instrumentId: SETAR,
      budgetMinutes: 30,
      segments: [seg('a', 10, 'lesson'), seg('b', 4, 'warmup'), seg('c', 12, 'deep')],
      summary: 'kept',
      generatedAt: T,
    };
    const [a, b, c] = plan.segments;
    // No-ops: first earlier, last later, out of range, an empty and a single plan.
    expect(movePlanSegment(plan, 0, -1)).toBe(plan);
    expect(movePlanSegment(plan, 2, 1)).toBe(plan);
    expect(movePlanSegment(plan, 7, 1)).toBe(plan);
    const empty = { ...plan, segments: [] };
    expect(movePlanSegment(empty, 0, 1)).toBe(empty);
    const single = { ...plan, segments: [a] };
    expect(movePlanSegment(single, 0, 1)).toBe(single);
    // A move carries the WHOLE segment — same objects, minutes, roles, reasons, focus.
    const moved = movePlanSegment(plan, 0, 1);
    expect(moved.segments).toEqual([b, a, c]);
    moved.segments.forEach((s, i) => expect(s).toBe([b, a, c][i]));
    expect([moved.budgetMinutes, moved.summary]).toEqual([30, 'kept']);
    // Repeated moves, then a swap and a remove: allocations never redistribute.
    const twice = movePlanSegment(moved, 1, 1);
    expect(twice.segments.map((s) => s.itemId)).toEqual(['b', 'c', 'a']);
    const swapped = swapSegment(twice, 1, { instrumentId: SETAR, now: NOW, items, blocks: [], reviews: [] });
    expect([swapped.segments[1].itemId, swapped.segments[1].minutes, swapped.segments[1].bucket]).toEqual(['d', 12, 'deep']);
    const trimmed = removePlanSegment(swapped, 0);
    expect(trimmed.segments.map((s) => [s.itemId, s.minutes])).toEqual([
      ['d', 12],
      ['a', 10],
    ]);
    expect(trimmed.removedMinutes).toBe(4);

    // Executing the owner's order: Start runs the segments as listed, and a
    // reorder itself wrote nothing.
    seed(db({ items }));
    const rev = useStore.getState().rev;
    useStore.getState().startPlan(twice);
    expect(useStore.getState().rev).toBe(rev);
    const order: string[] = [];
    for (let i = 0; i < 3; i++) {
      useStore.getState().beginPlanSegment();
      order.push(useStore.getState().active!.itemId);
      expect(useStore.getState().active!.targetMinutes).toBe(twice.segments[i].minutes);
      useStore.getState().closeSession({ result: 'not_logged', durationMinutes: twice.segments[i].minutes, answer: 'unanswered', now: NOW });
    }
    expect(order).toEqual(['b', 'c', 'a']);
    expect(useStore.getState().db.blocks.map((x) => [x.practiceItemId, x.durationMinutes])).toEqual([
      ['b', 4],
      ['c', 12],
      ['a', 10],
    ]);

    // A reorder cannot bypass the live checks: a deleted or moved item, the day.
    const run = { instrumentId: SETAR, budgetMinutes: 30, startedAt: T, pointer: 0, segments: twice.segments.map((s) => ({ ...s, status: 'pending' as const })) };
    expect(planSegmentStartable(run, items.filter((i) => i.id !== 'b')).ok).toBe(false);
    expect(planSegmentStartable(run, items.map((i) => (i.id === 'b' ? { ...i, instrumentId: TAR } : i)))).toEqual({ ok: false, reason: 'moved' });
    expect(planPreviewDayHasPassed(TODAY, new Date('2026-10-24T12:00:00.000Z'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ac-8 / ac-9 — scoped evidence and Working / Keep fresh returns
// ---------------------------------------------------------------------------

const RESULTS: BlockResult[] = ['worse', 'same', 'slightly_better', 'stable_alone', 'stable_in_context', 'performable', 'not_logged'];
const STABLE = ['stable_alone', 'stable_in_context', 'performable'];
/** Working returns, written out here from the doc, not imported. */
const WORKING_DAYS: Record<string, ISODate> = {
  worse: '2026-10-24',
  same: '2026-10-24',
  slightly_better: '2026-10-25',
  stable_alone: '2026-10-25',
  stable_in_context: '2026-10-26',
  performable: '2026-10-26',
};

/** The table's answer for a close on an item with reps 2, gap 6, ease 2.5, importance 3, difficulty 3. */
function expectedDate(intent: ReturnIntent, scope: EvidenceScope, result: BlockResult, date: 'due' | 'future' | 'none'): ISODate | undefined {
  const existing = date === 'due' ? TODAY : date === 'future' ? '2026-11-12' : undefined;
  if (result === 'not_logged') return existing;
  if (intent === 'working') return WORKING_DAYS[result];
  if (scope === 'focused') return existing;
  if (date === 'future') return result === 'worse' ? '2026-10-24' : existing;
  if (result === 'worse') return '2026-10-24';
  if (STABLE.includes(result)) return '2026-11-07'; // round(6 × 2.5) = 15 days
  return '2026-10-29'; // same / slightly better hold the 6-day gap
}

describe('scoped evidence', () => {
  it('scoped evidence separates focused progress from whole item retention and readiness', () => {
    let cases = 0;
    for (const intent of ['working', 'keep_fresh'] as ReturnIntent[]) {
      for (const scope of ['focused', 'whole', undefined] as (EvidenceScope | undefined)[]) {
        for (const date of ['due', 'future', 'none'] as const) {
          for (const result of RESULTS) {
            const label = `${intent} · ${scope ?? 'legacy-unknown'} · ${date} · ${result}`;
            const existing = date === 'due' ? TODAY : date === 'future' ? '2026-11-12' : undefined;
            const before = item('x', 'Shur', {
              status: 'integrated',
              returnIntent: intent,
              nextReviewDate: existing,
              nextReviewSource: existing ? 'auto' : undefined,
              srReps: 2,
              srEase: 2.5,
              srIntervalDays: 6,
            });
            seed(db({
              items: [before],
              reviews: existing ? [{ id: 'open', practiceItemId: 'x', dueDate: existing, reviewType: 'retention', createdAt: T, updatedAt: T }] : [],
            }));
            useStore.getState().startItemSession('x');
            useStore.getState().closeSession({
              result,
              scope,
              durationMinutes: 10,
              answer: result === 'not_logged' ? 'unanswered' : 'scheduled',
              now: NOW,
            });
            const after = useStore.getState().db;
            const saved = after.items[0];
            const want = expectedDate(intent, scope ?? 'focused', result, date);
            expect(saved.nextReviewDate, label).toBe(want);
            // The preview IS the saved decision.
            expect(planNextReview({ item: before, result, now: NOW, scope: scope ?? 'focused' })?.dueDate, label).toBe(want);
            // Only an explicit whole check on a Keep-fresh item may move spacing.
            const spacingMoves = intent === 'keep_fresh' && scope === 'whole' && result !== 'not_logged' && (date !== 'future' || result === 'worse') && result !== 'same' && result !== 'slightly_better';
            expect(saved.srReps !== 2, `${label} spacing`).toBe(spacingMoves);
            // No promotion from any close: the status is the owner's.
            expect([saved.status, saved.returnIntent], label).toEqual(['integrated', intent]);
            // The pending row moves only with a written date.
            const open = after.reviews.filter((r) => !r.completedAt);
            if (want) expect(open.map((r) => r.dueDate), label).toEqual([want]);
            else expect(open, label).toEqual([]);
            expect(after.blocks[0].scope, label).toBe(scope ?? 'focused');
            cases += 1;
          }
        }
      }
    }
    expect(cases).toBe(2 * 3 * 3 * 7);

    // Readiness is suggested only for a whole-item check — and never applied by itself.
    const usable = item('u', 'Usable', { status: 'usable' });
    expect(suggestStatusAfterBlock({ item: usable, result: 'performable', last3AllSame: false, scope: 'focused' })).toEqual({});
    expect(suggestStatusAfterBlock({ item: usable, result: 'performable', last3AllSame: false, scope: 'whole' }).suggestedStatus).toBe('performable');

    // A child checked as its own whole unit: the parent stays byte for byte.
    const parent = item('piece', 'Chahārmezrāb', { itemType: 'full_piece', returnIntent: 'keep_fresh', nextReviewDate: TODAY, nextReviewSource: 'auto', srReps: 3 });
    const child = item('bars', 'Bars 1–8', { itemType: 'section', parentItemId: 'piece' });
    seed(db({ items: [parent, child] }));
    useStore.getState().startItemSession('bars');
    useStore.getState().closeSession({ result: 'performable', scope: 'whole', durationMinutes: 8, answer: 'scheduled', now: NOW });
    expect(useStore.getState().db.items.find((i) => i.id === 'piece')).toEqual(parent);
    expect(useStore.getState().db.items.find((i) => i.id === 'bars')!.nextReviewDate).toBe('2026-10-26');

    // Same-day double close: one advance per local day.
    const fresh = item('k', 'Keep', { returnIntent: 'keep_fresh', nextReviewDate: TODAY, nextReviewSource: 'auto', srReps: 2, srEase: 2.5, srIntervalDays: 6 });
    seed(db({ items: [fresh] }));
    for (let i = 0; i < 2; i++) {
      useStore.getState().startItemSession('k');
      useStore.getState().closeSession({ result: 'stable_in_context', scope: 'whole', durationMinutes: 10, answer: 'scheduled', now: NOW });
    }
    const k = useStore.getState().db.items[0];
    expect([k.srReps, k.nextReviewDate, k.srLastProgressDay]).toEqual([3, '2026-11-07', TODAY]);

    // Unassessed capture and administration fabricate nothing.
    const routineBlock: PracticeBlock = {
      id: 'rb', practiceItemId: 'k', instrumentId: SETAR, startedAt: T, durationMinutes: 5, mode: 'maintain', focus: 'other', result: 'not_logged', scope: 'focused', createdReview: false, createdAt: T, updatedAt: T,
    };
    const captured = captureRoutineResults({ blocks: [routineBlock], items: [k] }, ['rb'], [{ blockId: 'rb', result: 'performable' }], NOW);
    expect('refused' in captured).toBe(false);
    const ck = (captured as { items: PracticeItem[] }).items[0];
    expect([ck.nextReviewDate, ck.srReps, ck.status, ck.returnIntent]).toEqual([k.nextReviewDate, 3, k.status, 'keep_fresh']);
    seed(db({ items: [k] }));
    useStore.getState().setReturnIntent('k', 'working');
    const switched = useStore.getState().db.items[0];
    expect({ ...switched, updatedAt: k.updatedAt }).toEqual({ ...k, returnIntent: 'working' });
    // Legacy scope stays unknown through validation.
    const legacy = validateDB({ ...db({ items: [k], blocks: [{ ...routineBlock, scope: undefined }] }), schemaVersion: 16 });
    expect('scope' in legacy.blocks[0] && legacy.blocks[0].scope !== undefined).toBe(false);
  });

  it('working returns stay short while protected dates and retention spacing keep their authority', () => {
    // The unfinished piece with a long SM-2 history: reps 8, gap 90.
    const piece = (over: Partial<PracticeItem> = {}) =>
      item('piece', 'Chahārmezrāb Shur', { itemType: 'full_piece', status: 'integrated', srReps: 8, srEase: 2.5, srIntervalDays: 90, lastPractisedAt: '2026-10-18T12:00:00.000Z', ...over });
    const close = (it: PracticeItem, result: BlockResult, scope: EvidenceScope = 'focused', reviews: Review[] = []) => {
      seed(db({ items: [it], reviews }));
      useStore.getState().startItemSession(it.id);
      useStore.getState().closeSession({ result, scope, durationMinutes: 10, answer: 'scheduled', now: NOW });
      return useStore.getState().db;
    };

    // Engine-owned 60-day date: focused success brings it forward to 3 days, `same` to 1 — never 90 × ease.
    const auto = piece({ nextReviewDate: '2026-12-22', nextReviewSource: 'auto' });
    expect(returnIntentOf(auto)).toBe('working');
    let after = close(auto, 'stable_in_context');
    expect([after.items[0].nextReviewDate, after.items[0].srReps, after.items[0].srIntervalDays]).toEqual(['2026-10-26', 8, 90]);
    expect(close(auto, 'same').items[0].nextReviewDate).toBe('2026-10-24');
    // Due and unscheduled behave the same.
    expect(close(piece({ nextReviewDate: TODAY, nextReviewSource: 'auto' }), 'performable').items[0].nextReviewDate).toBe('2026-10-26');
    expect(close(piece(), 'slightly_better').items[0].nextReviewDate).toBe('2026-10-25');
    // The preview and its sentence are the saved decision.
    expect(decideReview({ item: auto, result: 'stable_in_context', now: NOW }).rationale).toBe('Working on this: back in 3 days.');

    // PROTECTED future dates stand — the owner's, a fixed cadence's, an unknown one's.
    for (const over of [
      { nextReviewDate: '2027-01-21', nextReviewSource: 'user' as const },
      { nextReviewDate: '2027-01-21' },
      { nextReviewDate: '2026-10-28', reviewMode: 'interval' as const, reviewIntervalDays: 5 },
      { nextReviewDate: '2027-01-21', reviewMode: 'manual' as const },
    ]) {
      const p = piece(over);
      after = close(p, 'stable_in_context', 'focused', [{ id: 'row', practiceItemId: 'piece', dueDate: over.nextReviewDate, reviewType: 'retention', createdAt: T, updatedAt: T }]);
      expect([after.items[0].nextReviewDate, after.items[0].nextReviewSource, after.reviews[0].completedAt], JSON.stringify(over)).toEqual([over.nextReviewDate, p.nextReviewSource, undefined]);
    }
    // …but the unfinished piece is still reachable NOW: its next practice is 3 days after the last.
    const unknown = piece({ nextReviewDate: '2027-01-21' });
    expect(effectiveReturnDate(unknown)).toBe('2026-10-21');
    expect(overdueDays(unknown, NOW)).toBe(2);
    expect(nextPractice({ item: unknown, now: NOW })).toEqual({
      kind: 'working',
      date: '2026-10-21',
      sentence: 'Working on this — next practice 2026-10-21.',
      keptDate: '2027-01-21',
      keptNote: 'Review date 2027-01-21 stays as it is (an older date).',
    });

    // KEEP FRESH: a real due whole-item check keeps honest spaced progression.
    const kept = piece({ returnIntent: 'keep_fresh', nextReviewDate: TODAY, nextReviewSource: 'auto' });
    after = close(kept, 'stable_in_context', 'whole');
    expect([after.items[0].srReps, after.items[0].nextReviewDate, after.items[0].srLastProgressDay]).toEqual([9, '2027-06-05', TODAY]); // round(90 × 2.5) = 225 days
    // Focused work on it never moves the check, even `worse` or `performable`.
    for (const r of ['worse', 'performable'] as BlockResult[]) {
      after = close(kept, r, 'focused');
      expect([after.items[0].nextReviewDate, after.items[0].srReps], r).toEqual([TODAY, 8]);
    }
    // Early whole practice keeps an engine-owned Keep-fresh date (the old early-date protection).
    expect(close(piece({ returnIntent: 'keep_fresh', nextReviewDate: '2026-12-22', nextReviewSource: 'auto' }), 'performable', 'whole').items[0].nextReviewDate).toBe('2026-12-22');

    // Deliberate clear vs omitted: a decline clears both sides; no result keeps both.
    seed(db({ items: [auto], reviews: [{ id: 'row', practiceItemId: 'piece', dueDate: '2026-12-22', reviewType: 'retention', createdAt: T, updatedAt: T }] }));
    useStore.getState().startItemSession('piece');
    useStore.getState().closeSession({ result: 'same', durationMinutes: 5, answer: 'declined', now: NOW });
    expect([useStore.getState().db.items[0].nextReviewDate, useStore.getState().db.reviews[0].completedAt]).toEqual([undefined, T]);
    // Re-arm, reload (a JSON round trip through validation), and a later close keeps the owner's date.
    useStore.getState().scheduleReviewAgain('piece', '2026-11-30');
    const reloaded = validateDB(JSON.parse(JSON.stringify(useStore.getState().db)));
    expect([reloaded.items[0].nextReviewDate, reloaded.items[0].nextReviewSource]).toEqual(['2026-11-30', 'user']);
    seed(reloaded);
    useStore.getState().startItemSession('piece');
    useStore.getState().closeSession({ result: 'performable', durationMinutes: 5, answer: 'scheduled', now: NOW });
    expect(useStore.getState().db.items[0].nextReviewDate).toBe('2026-11-30');

    // Switching intention keeps the date, its provenance, the row and every SR field.
    seed(db({ items: [auto], reviews: [{ id: 'row', practiceItemId: 'piece', dueDate: '2026-12-22', reviewType: 'retention', createdAt: T, updatedAt: T }] }));
    useStore.getState().setReturnIntent('piece', 'keep_fresh');
    const sw = useStore.getState().db;
    expect([sw.items[0].nextReviewDate, sw.items[0].nextReviewSource, sw.items[0].srReps, sw.reviews[0], sw.blocks]).toEqual(['2026-12-22', 'auto', 8, sw.reviews[0], []]);
    expect(sw.reviews[0].completedAt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ac-10 — class preparation and the one candidate pool
// ---------------------------------------------------------------------------

describe('class preparation and the shared pool', () => {
  it('class preparation and shared recommendation pools return useful work without repetition noise', () => {
    const P = item('p', 'Piece for class', { itemType: 'full_piece', status: 'integrated', srReps: 8, srIntervalDays: 90, nextReviewDate: '2027-01-21', nextReviewSource: 'user', lastPractisedAt: '2026-10-21T12:00:00.000Z' });
    const Q = item('q', 'Other gusheh', { lastPractisedAt: '2026-10-13T12:00:00.000Z' });
    const R = item('r', 'New drill', { itemType: 'technique', importance: 2, difficulty: 2, status: 'new', createdAt: '2026-10-22T12:00:00.000Z' });
    const lesson = { ...createLesson({ instrumentId: SETAR, date: '2026-10-27' }, NOW), id: 'L' };
    const later = { ...createLesson({ instrumentId: SETAR, date: '2026-11-07' }, NOW), id: 'L2' };
    const prep = createPreparation({ id: 'prep', itemId: 'p', instrumentId: SETAR, lessonId: 'L', now: NOW });
    const dates = (agenda = [prep], lessons = [lesson, later], now = NOW) => preparationDatesByItem(agenda, lessons, now);
    const best = (items: PracticeItem[], blocks: PracticeBlock[] = [], now = NOW, prepDates = dates()) =>
      recommendForInstrument(SETAR, items, blocks, now, prepDates).best;

    // Class in 4 days, review months away: it returns as class preparation, the date untouched.
    expect(best([P, Q, R])!.score.item.id).toBe('p');
    expect(nextPractice({ item: P, preparationDate: dates().get('p'), now: NOW })).toMatchObject({
      kind: 'class',
      date: TODAY,
      keptDate: '2027-01-21',
      keptNote: 'Review date 2027-01-21 stays as it is (your date).',
    });

    // Heavy practice today (a routine, no feedback) does NOT step class work
    // aside: it stays available this session until its class (2026-10-28
    // policy, superseding 2026-10-23), and its reason says so honestly.
    const todayBlock: PracticeBlock = {
      id: 'b1', practiceItemId: 'p', instrumentId: SETAR, startedAt: '2026-10-23T08:00:00.000Z', durationMinutes: 20, mode: 'maintain', focus: 'other', result: 'not_logged', scope: 'focused', createdReview: false, createdAt: T, updatedAt: T,
    };
    const practisedP = { ...P, lastPractisedAt: todayBlock.startedAt };
    const again = best([practisedP, Q, R], [todayBlock])!;
    expect([again.score.item.id, again.reason.endsWith('Practised earlier today — class work stays available until its class.')]).toEqual(['p', true]);
    const plan = buildSessionPlan({ instrumentId: SETAR, budgetMinutes: 20, now: NOW, items: [practisedP, Q, R], blocks: [todayBlock], reviews: [], preparationDates: dates() });
    expect(plan.segments.map((s) => s.itemId)).toContain('p');
    expect(nextPractice({ item: practisedP, preparationDate: dates().get('p'), now: NOW })).toMatchObject({
      kind: 'class',
      date: TODAY,
      sentence: 'Class preparation — for your class on 2026-10-27 (4 days away); practised earlier today, still available this session.',
    });
    // … and on the next day, still before its class.
    const tomorrow = new Date('2026-10-24T12:00:00.000Z');
    expect(best([practisedP, Q, R], [todayBlock], tomorrow, dates([prep], [lesson, later], tomorrow))!.score.item.id).toBe('p');
    // Only candidate, practised today and committed to no class: an honest, explained repeat.
    const qBlock = { ...todayBlock, id: 'bq', practiceItemId: 'q' };
    const only = recommendForInstrument(SETAR, [{ ...Q, lastPractisedAt: qBlock.startedAt }], [qBlock], NOW, dates()).best!;
    expect([only.score.item.id, only.reason.startsWith('Practised earlier today — nothing else eligible is waiting.')]).toEqual(['q', true]);

    // Near beats later; a passed, removed, unassigned, archive or other-instrument class adds nothing.
    const P2 = item('p2', 'For the later class', { itemType: 'full_piece', status: 'integrated', lastPractisedAt: '2026-10-21T12:00:00.000Z' });
    const prep2 = createPreparation({ id: 'prep2', itemId: 'p2', instrumentId: SETAR, lessonId: 'L2', now: NOW });
    const both = dates([prep, prep2]);
    expect([both.get('p'), both.get('p2')]).toEqual(['2026-10-27', '2026-11-07']);
    expect(best([P, P2], [], NOW, both)!.score.item.id).toBe('p');
    const past = { ...lesson, id: 'past', date: '2026-10-20' };
    const archive = { ...lesson, id: 'arch', date: '2026-10-25', origin: 'archive' as const };
    const tarLesson = { ...lesson, id: 'tar', instrumentId: TAR };
    for (const [name, agenda, lessons] of [
      ['passed', [{ ...prep, lessonId: 'past' }], [past]],
      ['removed', [prep], []],
      ['unassigned', [{ ...prep, lessonId: undefined }], [lesson]],
      ['archive', [{ ...prep, lessonId: 'arch' }], [archive]],
      ['other instrument', [{ ...prep, lessonId: 'tar' }], [tarLesson]],
      ['question only', [{ id: 'q1', kind: 'question' as const, text: 'Which fingering?', itemId: 'p', instrumentId: SETAR, lessonId: 'L', createdAt: T, updatedAt: T }], [lesson]],
    ] as const) {
      const d = preparationDatesByItem(agenda as never, lessons as never, NOW);
      expect(d.has('p'), name).toBe(false);
      expect(nextPractice({ item: P, preparationDate: d.get('p'), now: NOW }).kind, name).toBe('working');
    }
    // Resting material never surfaces, even as the only candidate.
    expect(recommendForInstrument(SETAR, [{ ...P, status: 'dormant' }], [], NOW, dates()).best).toBeNull();
    // Equal scores break on the id, whatever the input order.
    const twinA = item('twin-a', 'A'), twinB = item('twin-b', 'B');
    expect(best([twinB, twinA], [], NOW, new Map())!.score.item.id).toBe('twin-a');

    // A piece and its own part are one intended work: one card …
    const part = item('p-part', 'Bars 1–8', { itemType: 'section', parentItemId: 'p', importance: 5 });
    const recs = recommendForInstrument(SETAR, [P, part, Q, R], [], NOW, dates());
    const shown = [recs.best, recs.quickWin, recs.maintenance].filter(Boolean).map((r) => r!.score.item.id);
    expect(shown.filter((id) => id === 'p' || id === 'p-part')).toHaveLength(1);
    // … unless the other has its own due review — a distinct need.
    const dueParent = { ...P, returnIntent: 'keep_fresh' as const, status: 'maintenance' as const, nextReviewDate: '2026-10-20', nextReviewSource: 'auto' as const };
    const recs2 = recommendForInstrument(SETAR, [dueParent, part, R], [], NOW, new Map());
    expect([recs2.best, recs2.quickWin, recs2.maintenance].filter(Boolean).map((r) => r!.score.item.id).sort()).toEqual(['p', 'p-part']);
    const planned = buildSessionPlan({ instrumentId: SETAR, budgetMinutes: 30, now: NOW, items: [P, part, Q, R], blocks: [], reviews: [], preparationDates: dates() });
    expect(planned.segments.filter((s) => s.itemId === 'p' || s.itemId === 'p-part')).toHaveLength(1);
    // … and a SWAP keeps that rule, in both directions: swapping the other
    // entry never brings in the relative of the one that stays.
    for (const [parentImportance, childImportance] of [[5, 4], [4, 5]] as const) {
      const tech = (id: string, importance: number, over: Partial<PracticeItem> = {}) => item(id, id, { itemType: 'technique', importance, ...over });
      const family = [tech('parent', parentImportance), tech('child', childImportance, { parentItemId: 'parent' }), tech('other', 1)];
      const anchor = parentImportance > childImportance ? 'parent' : 'child';
      const args = { instrumentId: SETAR, now: NOW, items: family, blocks: [], reviews: [] };
      const built = buildSessionPlan({ ...args, budgetMinutes: 30 });
      expect(built.segments.map((x) => [x.itemId, x.minutes]), anchor).toEqual([['other', 4], [anchor, 25]]);
      // No other candidate: the slot keeps what it had rather than repeat the work.
      expect(swapSegment(built, 0, args).segments.map((x) => x.itemId), anchor).toEqual(['other', anchor]);
      // A relative whose OWN review is due is a distinct need: never spent as
      // a warm-up, but it may take a deep slot beside the work.
      const relative = anchor === 'parent' ? 'child' : 'parent';
      const dueFamily = family.map((i) => (i.id === relative ? { ...i, nextReviewDate: TODAY, nextReviewSource: 'auto' as const } : i));
      const dueRow = [{ id: 'due-row', practiceItemId: relative, dueDate: TODAY, reviewType: 'retention' as const, createdAt: T, updatedAt: T }];
      const due = { ...args, items: dueFamily, reviews: dueRow };
      expect(swapSegment(built, 0, due).segments.map((x) => x.itemId), anchor).toEqual(['other', anchor]);
      const deep = (itemId: string): PlanSegment => ({ itemId, title: itemId, minutes: 10, bucket: 'deep', core: false, mode: 'learn', focus: 'other', reason: '', floorMinutes: 2 });
      const twoDeep: SessionPlan = { instrumentId: SETAR, budgetMinutes: 20, segments: [deep(anchor), deep('other')], summary: '', generatedAt: T };
      expect(swapSegment(twoDeep, 1, args).segments.map((x) => x.itemId), anchor).toEqual([anchor, 'other']);
      expect(swapSegment(twoDeep, 1, due).segments.map((x) => x.itemId), anchor).toEqual([anchor, relative]);
    }
    // Urgency first: the class anchor leads a short plan.
    expect(buildSessionPlan({ instrumentId: SETAR, budgetMinutes: 10, now: NOW, items: [P, Q, R], blocks: [], reviews: [], preparationDates: dates() }).segments.map((s) => s.itemId)).toEqual(['p']);
  });
});

// ---------------------------------------------------------------------------
// ac-13 — v17 migration over a committed v16 database
// ---------------------------------------------------------------------------

const FIXTURES = join(process.cwd(), 'tests', 'fixtures');

describe('session model migration', () => {
  it('session model migration preserves history dates bytes and unresolved legacy meanings', async () => {
    const v16 = JSON.parse(readFileSync(join(FIXTURES, 'practice-session-v16.json'), 'utf8'));
    const expected = JSON.parse(readFileSync(join(FIXTURES, 'practice-session-expectations.json'), 'utf8')) as {
      items: Record<string, Partial<PracticeItem>>;
      blockIds: string[];
      reviews: Review[];
      lessonAgenda: unknown[];
      attachments: unknown[];
      routineSegments: RoutineSegment[];
      derivedIntent: Record<string, ReturnIntent>;
    };
    expect(v16.data.schemaVersion).toBe(16);
    // One door, run twice and on two different days: identical data, identical hash.
    vi.setSystemTime(new Date('2026-10-23T12:00:00.000Z'));
    const once = validateDB(JSON.parse(JSON.stringify(v16)));
    vi.setSystemTime(new Date('2027-03-01T12:00:00.000Z'));
    const again = validateDB(JSON.parse(JSON.stringify(v16)));
    const twice = validateDB(JSON.parse(JSON.stringify(once)));
    expect(once.schemaVersion).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe(17);
    expect(again).toEqual(once);
    expect(twice).toEqual(once);
    expect(await hashState(once)).toBe(await hashState(again));
    expect(migrateToCurrent(once, SCHEMA_VERSION)).toEqual(once);

    // Every record and field preserved verbatim, nothing inferred.
    const src = v16.data as PracticeDB;
    expect(once.blocks).toEqual(src.blocks);
    expect(once.blocks.map((b) => b.id)).toEqual(expected.blockIds);
    for (const b of once.blocks) expect('scope' in b, b.id).toBe(false);
    expect(once.items).toEqual(src.items);
    for (const [id, fields] of Object.entries(expected.items)) expect(once.items.find((i) => i.id === id), id).toMatchObject(fields);
    for (const i of once.items) expect('returnIntent' in i, i.id).toBe(false);
    expect(Object.fromEntries(once.items.map((i) => [i.id, returnIntentOf(i)]))).toEqual(expected.derivedIntent);
    expect(once.reviews).toEqual(expected.reviews);
    expect(once.lessonAgenda).toEqual(expected.lessonAgenda);
    expect(once.attachments).toEqual(expected.attachments);
    expect(once.pathwayRoutines[0].segments).toEqual(expected.routineSegments);
    expect(once.lessons).toEqual(src.lessons);
    expect(once.archiveSources).toEqual(src.archiveSources);

    // The supported older chain arrives at the same v17 shape.
    const v11 = JSON.parse(readFileSync(join(FIXTURES, 'practice-decisions-v11.json'), 'utf8'));
    expect(validateDB(v11).schemaVersion).toBe(17);

    // New fields round-trip; wrong ones are refused before anything is installed.
    const current = validateDB({
      ...once,
      items: once.items.map((i, n) => (n === 0 ? { ...i, returnIntent: 'keep_fresh' } : i)),
      blocks: once.blocks.map((b, n) => (n === 0 ? { ...b, scope: 'whole' } : b)),
    });
    expect(validateDB(JSON.parse(canonicalStringify(current)))).toEqual(current);
    expect([current.items[0].returnIntent, current.blocks[0].scope]).toEqual(['keep_fresh', 'whole']);
    expect(() => validateDB({ ...once, blocks: once.blocks.map((b, n) => (n === 0 ? { ...b, scope: 'chunk' } : b)) })).toThrow(/unknown evidence scope/);
    expect(() => validateDB({ ...once, items: once.items.map((i, n) => (n === 0 ? { ...i, returnIntent: 1 } : i)) })).toThrow(/unknown return intention/);
    expect(() => validateDB({ ...once, reviews: [...once.reviews, once.reviews[0]] })).toThrow(/share the id/);
    expect(() => validateDB({ ...once, schemaVersion: 18 })).toThrow(SchemaTooNewError);
    // The hydration-only shapes refuse a wrong type, never coerce it.
    expect(validateUnfinishedRun({ activeRoutine: { segs: [{ seconds: 'x' }], authoredSegments: [{}], accumulatedSeconds: 0 } })).toMatch(/unreadable segment/);
    expect(validateUnfinishedRun({ activePlan: { segments: [{ status: 'done', actualMinutes: -1 }], pointer: 0 } })).toMatch(/recorded minutes/);
    vi.setSystemTime(NOW);
  });
});
