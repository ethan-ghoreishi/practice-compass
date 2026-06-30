import { describe, expect, it } from 'vitest';
import { createBlock, createItem } from './factories';
import {
  fragilityScore,
  isSaturated,
  lastResultsAllSame,
  neglectedScore,
  overdueScore,
  recentBlockCount,
  scoreItem,
  teacherRelevanceScore,
} from './scoring';
import { addDays, toISODate } from './util';
import type { BlockResult } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

function itemAt(overrides: Parameters<typeof createItem>[0]) {
  return createItem(overrides, NOW);
}

function blockAgo(itemId: string, daysAgo: number, result: BlockResult) {
  return createBlock(
    {
      practiceItemId: itemId,
      instrumentId: 'inst',
      durationMinutes: 10,
      mode: 'repair',
      focus: 'tone',
      result,
      startedAt: addDays(NOW, -daysAgo).toISOString(),
    },
    NOW,
  );
}

describe('sub-scores', () => {
  it('fragilityScore maps status to weight', () => {
    expect(fragilityScore('fragile')).toBe(5);
    expect(fragilityScore('repairing')).toBe(5);
    expect(fragilityScore('performable')).toBe(0);
    expect(fragilityScore('new')).toBe(2);
  });

  it('overdueScore buckets days overdue', () => {
    const base = itemAt({ instrumentId: 'i', title: 't' });
    expect(overdueScore({ ...base, nextReviewDate: undefined }, NOW)).toBe(0);
    expect(overdueScore({ ...base, nextReviewDate: toISODate(addDays(NOW, 3)) }, NOW)).toBe(0); // future
    expect(overdueScore({ ...base, nextReviewDate: toISODate(NOW) }, NOW)).toBe(1); // today
    expect(overdueScore({ ...base, nextReviewDate: toISODate(addDays(NOW, -2)) }, NOW)).toBe(2);
    expect(overdueScore({ ...base, nextReviewDate: toISODate(addDays(NOW, -5)) }, NOW)).toBe(3);
    expect(overdueScore({ ...base, nextReviewDate: toISODate(addDays(NOW, -10)) }, NOW)).toBe(4);
    expect(overdueScore({ ...base, nextReviewDate: toISODate(addDays(NOW, -20)) }, NOW)).toBe(5);
  });

  it('teacherRelevanceScore rewards an open question', () => {
    const base = itemAt({ instrumentId: 'i', title: 't' });
    expect(teacherRelevanceScore(base)).toBe(0);
    expect(teacherRelevanceScore({ ...base, teacherQuestion: 'Is the landing right?' })).toBe(3);
  });

  it('neglectedScore buckets days since touched', () => {
    const base = itemAt({ instrumentId: 'i', title: 't' });
    const at = (d: number) => ({ ...base, lastPractisedAt: addDays(NOW, -d).toISOString() });
    expect(neglectedScore(at(1), NOW)).toBe(0);
    expect(neglectedScore(at(5), NOW)).toBe(1);
    expect(neglectedScore(at(10), NOW)).toBe(2);
    expect(neglectedScore(at(20), NOW)).toBe(3);
    expect(neglectedScore(at(40), NOW)).toBe(4);
  });
});

describe('priority score', () => {
  it('combines sub-scores per the documented formula', () => {
    const item = itemAt({
      instrumentId: 'i',
      title: 'Iraq phrase 4',
      status: 'fragile',
      importance: 5,
      difficulty: 4,
      teacherQuestion: 'Is my landing correct?',
    });
    item.lastPractisedAt = addDays(NOW, -10).toISOString(); // neglected band 2
    item.nextReviewDate = toISODate(addDays(NOW, -5)); // overdue band 3

    const score = scoreItem(item, [], NOW);
    // 5*2 + 4 + 5 + 3 + 3 + 2 - 0 = 27
    expect(score.parts).toEqual({
      importance: 10,
      difficulty: 4,
      fragility: 5,
      overdue: 3,
      teacher: 3,
      neglected: 2,
      saturationPenalty: 0,
    });
    expect(score.total).toBe(27);
    expect(score.saturated).toBe(false);
  });

  it('applies the saturation penalty', () => {
    const item = itemAt({ instrumentId: 'i', title: 't', status: 'usable', importance: 3, difficulty: 3 });
    item.lastPractisedAt = NOW.toISOString();
    const blocks = [
      blockAgo(item.id, 0, 'same'),
      blockAgo(item.id, 1, 'same'),
      blockAgo(item.id, 2, 'same'),
    ];
    const score = scoreItem(item, blocks, NOW);
    expect(score.parts.saturationPenalty).toBe(3);
    expect(score.saturated).toBe(true);
  });
});

describe('saturation detection', () => {
  it('flags 3+ blocks in the last 48 hours', () => {
    const blocks = [blockAgo('x', 0, 'slightly_better'), blockAgo('x', 1, 'worse'), blockAgo('x', 1, 'stable_alone')];
    expect(recentBlockCount(blocks, NOW)).toBe(3);
    expect(isSaturated(blocks, NOW)).toBe(true);
  });

  it('flags 3 identical "same" results even if spread out', () => {
    const blocks = [blockAgo('x', 3, 'same'), blockAgo('x', 6, 'same'), blockAgo('x', 10, 'same')];
    expect(recentBlockCount(blocks, NOW)).toBe(0);
    expect(lastResultsAllSame(blocks)).toBe(true);
    expect(isSaturated(blocks, NOW)).toBe(true);
  });

  it('does not flag light, varied practice', () => {
    const blocks = [blockAgo('x', 1, 'slightly_better'), blockAgo('x', 6, 'worse')];
    expect(isSaturated(blocks, NOW)).toBe(false);
  });
});
