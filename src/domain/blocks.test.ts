import { describe, expect, it } from 'vitest';
import { applyBlockStats, lastNextAction } from './blocks';
import { createBlock, createItem } from './factories';
import { addDays, toISODate } from './util';
import type { BlockResult } from './types';

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
    expect(updated.lastObservation).toBe('Felt a bit smoother.');
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

  it('sets the saturation warning when the item is over-drilled', () => {
    const item = freshItem();
    const blocks = [block('same', 10, 0), block('same', 10, 1), block('same', 10, 2)];
    const updated = applyBlockStats(item, blocks[0], {
      itemBlocksIncludingNew: blocks,
      now: NOW,
    });
    expect(updated.saturationWarning).toBe(true);
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
