import { describe, expect, it, vi } from 'vitest';
import { applyBlockStats, lastNextAction, latestObservation, type CloseItemEdits } from './blocks';
import { createBlock, createItem } from './factories';
import { addDays, toISODate } from './util';
import type { BlockResult, PracticeItem } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

// Created a day earlier than NOW so `updatedAt` visibly advances on save.
const EARLIER = new Date('2026-06-17T12:00:00.000Z');

function freshItem() {
  return createItem({ instrumentId: 'i', title: 'Phrase', status: 'fragile' }, EARLIER);
}

function block(result: BlockResult, durationMinutes = 10, daysAgo = 0) {
  return createBlock(
    {
      practiceItemId: 'item',
      instrumentId: 'i',
      durationMinutes,
      mode: 'repair',
      focus: 'tone',
      result,
      observation: result === 'not_logged' ? undefined : 'Felt a bit smoother.',
      startedAt: addDays(NOW, -daysAgo).toISOString(),
      endedAt: addDays(NOW, -daysAgo).toISOString(),
    },
    NOW,
  );
}

describe('applyBlockStats', () => {
  it('increments counters and records the latest result', () => {
    const item = freshItem();
    item.timesPractised = 2;
    item.totalMinutes = 25;
    const b = block('slightly_better', 10);
    const nextReviewDate = toISODate(addDays(NOW, 2));

    const updated = applyBlockStats(item, b, {
      itemBlocksIncludingNew: [b],
      now: NOW,
      nextReviewDate,
    });

    expect(updated.timesPractised).toBe(3);
    expect(updated.totalMinutes).toBe(35);
    expect(updated.lastResult).toBe('slightly_better');
    // The item no longer caches an observation: it is DERIVED from the blocks
    // that actually recorded one, with the day it was written.
    expect(latestObservation([b])?.text).toBe('Felt a bit smoother.');
    expect(updated.lastPractisedAt).toBe(b.endedAt);
    expect(updated.nextReviewDate).toBe(nextReviewDate);
    expect(updated.saturationWarning).toBe(false);
    expect(updated.updatedAt).not.toBe(item.updatedAt);
  });

  it('clears nextReviewDate when passed null and keeps it when passed undefined', () => {
    const item = freshItem();
    item.nextReviewDate = toISODate(addDays(NOW, -14));
    const b = block('worse');

    const cleared = applyBlockStats(item, b, { itemBlocksIncludingNew: [b], now: NOW, nextReviewDate: null });
    expect(cleared.nextReviewDate).toBeUndefined();

    const kept = applyBlockStats(item, b, { itemBlocksIncludingNew: [b], now: NOW, nextReviewDate: undefined });
    expect(kept.nextReviewDate).toBe(item.nextReviewDate);
  });

  it('keeps the previous result when a block is left unlogged', () => {
    const item = freshItem();
    item.lastResult = 'stable_alone';
    const b = block('not_logged');
    const updated = applyBlockStats(item, b, { itemBlocksIncludingNew: [b], now: NOW });
    expect(updated.lastResult).toBe('stable_alone');
    expect(updated.timesPractised).toBe(1);
  });

  // Over-practice is MINUTES lately, not a block count and not a run of
  // identical results — three ten-minute sessions across three days is
  // ordinary practice, and a January run of "same" is a strategy hint in
  // January, not a permanent warning in September.
  it('sets the saturation warning from recent minutes, not from block counts or old results', () => {
    const item = freshItem();
    const modest = [block('same', 10, 0), block('same', 10, 1), block('same', 10, 2)];
    expect(applyBlockStats(item, modest[0], { itemBlocksIncludingNew: modest, now: NOW }).saturationWarning).toBe(
      false,
    );

    const heavy = [block('slightly_better', 45, 0), block('slightly_better', 45, 1)];
    expect(applyBlockStats(item, heavy[0], { itemBlocksIncludingNew: heavy, now: NOW }).saturationWarning).toBe(true);

    const longAgo = [block('same', 60, 40), block('same', 60, 45), block('same', 60, 50)];
    expect(applyBlockStats(item, longAgo[0], { itemBlocksIncludingNew: longAgo, now: NOW }).saturationWarning).toBe(
      false,
    );
  });

  it('does not accept negative minutes', () => {
    const item = freshItem();
    const b = block('same', -5);
    const updated = applyBlockStats(item, b, { itemBlocksIncludingNew: [b], now: NOW });
    expect(updated.totalMinutes).toBe(0);
  });
});

// --- A7: the last step of the loop was write-only -----------------------------
//
// `nextAction` was captured on every close and read NOWHERE, ever — the
// practice screen showed the item's general notes instead, so the one thing
// deliberately decided last time never reached the moment it was written for.

describe('lastNextAction · the decision from last time', () => {
  function withNextAction(nextAction: string | undefined, daysAgo: number) {
    return createBlock(
      {
        practiceItemId: 'item',
        instrumentId: 'i',
        durationMinutes: 10,
        mode: 'repair',
        focus: 'tone',
        result: 'slightly_better',
        nextAction,
        startedAt: addDays(NOW, -daysAgo).toISOString(),
      },
      NOW,
    );
  }

  it('returns the most recent non-empty next action and nothing when none was ever written', () => {
    const older = withNextAction('Slow the forud right down', 3);
    const recent = withNextAction('Play it against the drone', 1);
    // A LATER block that recorded no next action must not blank out a decision
    // that still stands — so the most recent NON-EMPTY one wins.
    const latestWithNone = withNextAction(undefined, 0);
    const latestWithBlank = withNextAction('   ', 0);

    expect(lastNextAction([older, recent])).toBe('Play it against the drone');
    expect(lastNextAction([older, recent, latestWithNone])).toBe('Play it against the drone');
    expect(lastNextAction([older, recent, latestWithBlank])).toBe('Play it against the drone');
    // Order is derived, not trusted from the caller.
    expect(lastNextAction([latestWithNone, recent, older])).toBe('Play it against the drone');

    // Nothing was ever written: nothing is shown, rather than an empty line.
    expect(lastNextAction([])).toBeUndefined();
    expect(lastNextAction([latestWithNone, withNextAction('', 2)])).toBeUndefined();
  });

  it('trims the stored text so stray whitespace never renders as content', () => {
    expect(lastNextAction([withNextAction('  Keep the riz even  ', 1)])).toBe('Keep the riz even');
  });
});

// ---------------------------------------------------------------------------
// Closing a block can revise the item: Status, Primary focus and Current
// effort, by key presence, in the block's one write — and the review is
// decided from the item AS PRACTISED, so the date shown is the date saved.
// Driven through the store's real `closeSession` (IndexedDB mocked away, as
// practiceCue.test.ts does), against expectations derived here.
// ---------------------------------------------------------------------------

describe('closing a block with item edits', () => {
  it('closing a block saves only the item edits the owner chose and decides the review from the item as practised', async () => {
    vi.resetModules();
    vi.doMock('../store/idb', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../store/idb')>()),
      idbStorage: { getItem: async () => null, setItem: async () => undefined, removeItem: async () => undefined },
    }));
    const { useStore } = await import('../store/useStore');
    const { emptyDB } = await import('./seed');
    const { planNextReview, suggestStatusAfterBlock, clampSchedulingParams } = await import('./scheduling');
    const AT = new Date('2026-06-18T09:30:00.000Z');
    const RESULT: BlockResult = 'stable_in_context';
    const MODES: { name: string; over: Partial<PracticeItem> }[] = [
      { name: 'auto', over: {} },
      { name: 'interval', over: { reviewMode: 'interval', reviewIntervalDays: 5 } },
      { name: 'manual', over: { reviewMode: 'manual', nextReviewDate: '2026-07-02', nextReviewSource: 'user' } },
    ];
    const item = (over: Partial<PracticeItem>): PracticeItem => ({
      ...createItem({ instrumentId: 'i', title: 'Gusheh', status: 'usable', itemType: 'gusheh', primaryFocus: 'tone', importance: 4, difficulty: 3, notes: 'Working notes' }, EARLIER),
      id: 'item',
      timesPractised: 4,
      srReps: 2,
      srEase: 2.5,
      srIntervalDays: 6,
      ...over,
    });
    const seed = (practised: PracticeItem) => {
      const db = emptyDB();
      useStore.setState({
        db: {
          ...db,
          instruments: [{ id: 'i', name: 'Setar', family: 'Persian', active: true, createdAt: EARLIER.toISOString(), updatedAt: EARLIER.toISOString() }],
          items: [practised],
          reviews: [{ id: 'open', practiceItemId: 'item', dueDate: '2026-06-17', reviewType: 'retention', createdAt: EARLIER.toISOString(), updatedAt: EARLIER.toISOString() }],
        },
        active: { itemId: 'item', instrumentId: 'i', mode: 'learn', focus: 'rhythm', targetMinutes: 10, startedAt: '2026-06-18T09:00:00.000Z', accumulatedSeconds: 600, running: false },
        activePlan: null,
        activeRoutine: null,
      });
    };
    const withoutIds = <T extends { id: string }>(rows: T[]) => rows.map(({ id: _id, ...rest }) => (void _id, rest));

    let cases = 0;
    for (const mode of MODES) {
      const practised = item(mode.over);
      const params = clampSchedulingParams(undefined);
      const suggested = suggestStatusAfterBlock({ item: practised, result: RESULT, last3AllSame: false }).suggestedStatus;
      expect(suggested, mode.name).toBe('integrated');
      // What the close screen previewed: the plan for the item as practised.
      const shown = planNextReview({ item: practised, result: RESULT, now: AT, params });
      const answerFor = (withResult: boolean) => (withResult ? (shown ? 'scheduled' : 'declined') : 'unanswered') as 'scheduled' | 'declined' | 'unanswered';

      // The same close with no edits at all: everything an edit must NOT move.
      const baseline: Record<string, ReturnType<typeof useStore.getState>['db']> = {};
      for (const withResult of [true, false]) {
        seed(practised);
        useStore.getState().closeSession({
          result: withResult ? RESULT : 'not_logged',
          durationMinutes: 10,
          answer: answerFor(withResult),
          reviewType: shown?.reviewType ?? 'retention',
          now: AT,
        });
        baseline[String(withResult)] = useStore.getState().db;
      }

      for (const status of ['suggested', 'other', 'unchanged'] as const) {
        for (const focus of ['set', 'cleared', 'unchanged'] as const) {
          for (const effort of ['changed', 'unchanged'] as const) {
            for (const action of ['save', 'without', 'discard'] as const) {
              for (const present of [true, false]) {
                const untouched = status === 'suggested' && focus === 'unchanged' && effort === 'unchanged';
                if (!present && !untouched) continue; // an absent edit is only possible when nothing was touched
                const label = `${mode.name} · status ${status} · focus ${focus} · effort ${effort} · ${action} · edit ${present ? 'present' : 'absent'}`;
                const edits: CloseItemEdits = {};
                if (status === 'other') edits.status = 'maintenance';
                if (status === 'unchanged') edits.status = 'usable'; // the owner keeps it, declining the suggestion
                if (focus === 'set') edits.primaryFocus = 'memory';
                if (focus === 'cleared') edits.primaryFocus = null;
                if (effort === 'changed') edits.difficulty = 5;

                seed(practised);
                const before = useStore.getState().db;
                let writes = 0;
                const stop = useStore.subscribe((s, prev) => {
                  if (s.db !== prev.db) writes += 1;
                });
                if (action === 'discard') {
                  useStore.getState().cancelSession();
                } else {
                  const withResult = action === 'save';
                  useStore.getState().closeSession({
                    result: withResult ? RESULT : 'not_logged',
                    durationMinutes: 10,
                    answer: answerFor(withResult),
                    reviewType: shown?.reviewType ?? 'retention',
                    newStatus: suggested, // offered pre-selected; the store applies it only with a result
                    itemEdits: present ? edits : undefined,
                    now: AT,
                  });
                }
                stop();
                cases += 1;
                const after = useStore.getState().db;
                expect(useStore.getState().active, label).toBeNull();
                if (action === 'discard') {
                  // Discard writes nothing at all.
                  expect(writes, label).toBe(0);
                  expect(after, label).toBe(before);
                  continue;
                }
                // ONE write: the block, the item and its reviews together.
                expect(writes, label).toBe(1);
                const base = baseline[String(action === 'save')];
                const saved = after.items[0];
                const expected = { ...base.items[0] };
                // Only what the owner chose moves — and the engine's
                // suggestion only with a result.
                expected.status =
                  status === 'other' ? 'maintenance' : status === 'unchanged' ? 'usable' : action === 'save' ? 'integrated' : 'usable';
                if (focus === 'set') expected.primaryFocus = 'memory';
                if (focus === 'cleared') delete expected.primaryFocus;
                if (effort === 'changed') expected.difficulty = 5;
                expect(saved, label).toEqual(expected);
                // Importance, notes, review fields and SR state: exactly as the review decision left them.
                for (const k of ['importance', 'notes', 'nextReviewDate', 'nextReviewSource', 'reviewMode', 'reviewIntervalDays', 'srReps', 'srEase', 'srIntervalDays', 'srLastProgressDay', 'lastResult'] as const) {
                  expect(saved[k], `${label} ${k}`).toEqual(base.items[0][k]);
                }
                // The review is the one shown before saving — from the item as practised.
                expect(withoutIds(after.reviews), label).toEqual(withoutIds(base.reviews));
                if (action === 'save' && shown) {
                  expect(saved.nextReviewDate, label).toBe(shown.dueDate);
                  const created = after.reviews.find((r) => r.id !== 'open');
                  if (created) expect([created.dueDate, created.reviewType], label).toEqual([shown.dueDate, shown.reviewType]);
                }
                if (action === 'without') expect(saved.nextReviewDate, label).toBe(practised.nextReviewDate);
                // The block keeps its own mode and focus; edits never rewrite it.
                const block = after.blocks.at(-1)!;
                expect([block.mode, block.focus], label).toEqual(['learn', 'rhythm']);
                expect(withoutIds(after.blocks), label).toEqual(withoutIds(base.blocks));
              }
            }
          }
        }
      }
    }
    expect(cases).toBe(3 * (3 * 3 * 2 * 3 + 3));
    vi.doUnmock('../store/idb');
  });
});
