import { describe, expect, it } from 'vitest';
import { applyBlockStats } from './blocks';
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
