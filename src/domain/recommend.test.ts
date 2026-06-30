import { describe, expect, it } from 'vitest';
import { recommend } from './recommend';
import { createSeedDB } from './seed';
import { createItem } from './factories';
import { createBlock } from './factories';
import type { BlockResult } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

describe('recommend', () => {
  it('selects three distinct, explained cards from the seed data', () => {
    const db = createSeedDB(NOW);
    const byTitle = (t: string) => db.items.find((i) => i.title.includes(t))!;
    const rizeh = byTitle('Rizeh');
    const shift = byTitle('shift');
    const daramad = byTitle('darāmad');

    const recs = recommend(db.items, db.blocks, NOW);

    // Iraq phrase 4 is the highest raw score but is saturated, so the best
    // next focus skips it in favour of the fragile, overdue Rizeh item.
    expect(recs.best?.score.item.id).toBe(rizeh.id);
    expect(recs.quickWin?.score.item.id).toBe(shift.id);
    expect(recs.maintenance?.score.item.id).toBe(daramad.id);

    const ids = [recs.best, recs.quickWin, recs.maintenance].map((r) => r?.score.item.id);
    expect(new Set(ids).size).toBe(3); // all distinct

    expect(recs.best?.reason).toMatch(/^Top priority/);
    expect(recs.quickWin?.reason).toMatch(/^A quick win/);
    expect(recs.maintenance?.reason).toMatch(/^Worth keeping fresh/);
  });

  it('falls back to a saturated item when nothing else is available', () => {
    const item = createItem({ instrumentId: 'i', title: 'Only item', status: 'fragile', importance: 4 }, NOW);
    const sat: BlockResult[] = ['same', 'same', 'same'];
    const blocks = sat.map((r, idx) =>
      createBlock(
        {
          practiceItemId: item.id,
          instrumentId: 'i',
          durationMinutes: 10,
          mode: 'repair',
          focus: 'tone',
          result: r,
          startedAt: new Date(NOW.getTime() - idx * 3_600_000).toISOString(),
        },
        NOW,
      ),
    );
    const recs = recommend([item], blocks, NOW);
    expect(recs.best?.score.item.id).toBe(item.id);
    expect(recs.best?.score.saturated).toBe(true);
  });

  it('returns nulls for an empty library', () => {
    const recs = recommend([], [], NOW);
    expect(recs.best).toBeNull();
    expect(recs.quickWin).toBeNull();
    expect(recs.maintenance).toBeNull();
  });
});
