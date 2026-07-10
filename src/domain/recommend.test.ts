import { describe, expect, it } from 'vitest';
import { pickNextPart, recommend, recommendForInstrument, stallHint } from './recommend';
import { createSeedDB } from './seed';
import { createBlock, createItem } from './factories';
import type { BlockResult, PracticeItem } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

function sameBlocks(item: PracticeItem, n = 3) {
  return Array.from({ length: n }, (_, idx) =>
    createBlock(
      {
        practiceItemId: item.id,
        instrumentId: item.instrumentId,
        durationMinutes: 10,
        mode: 'repair',
        focus: 'tone',
        result: 'same',
        startedAt: new Date(NOW.getTime() - idx * 3_600_000).toISOString(),
      },
      NOW,
    ),
  );
}

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

    expect(recs.best?.reason).toMatch(/^Next up/);
    expect(recs.quickWin?.reason).toMatch(/^A quick win/);
    expect(recs.maintenance?.reason).toMatch(/^Worth keeping fresh/);
  });

  it('explains the drivers in plain language', () => {
    const db = createSeedDB(NOW);
    const recs = recommend(db.items, db.blocks, NOW);
    // Rizeh is fragile with an overdue review — the reason must say so.
    expect(recs.best?.reason).toMatch(/review is .* overdue/);
    expect(recs.best?.reason).toMatch(/shaky|fragile/i);
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

describe('recommendForInstrument (session scoping)', () => {
  it('never surfaces another instrument in a Setar session', () => {
    const db = createSeedDB(NOW);
    const setarId = db.instruments.find((i) => i.name === 'Setar')!.id;

    const recs = recommendForInstrument(setarId, db.items, db.blocks, NOW);
    for (const r of [recs.best, recs.quickWin, recs.maintenance]) {
      if (r) expect(r.score.item.instrumentId).toBe(setarId);
    }
    // And the cards exist — Setar has items in the seed.
    expect(recs.best).not.toBeNull();
  });

  it('an instrument with no items yields empty cards, not leakage', () => {
    const db = createSeedDB(NOW);
    const recs = recommendForInstrument('nonexistent-instrument', db.items, db.blocks, NOW);
    expect(recs.best).toBeNull();
    expect(recs.quickWin).toBeNull();
    expect(recs.maintenance).toBeNull();
  });
});

describe('études: pickNextPart & stallHint', () => {
  const parent = createItem(
    { instrumentId: 'g', title: 'Study in C', itemType: 'full_piece', status: 'repairing' },
    NOW,
  );
  const partA = { ...createItem({ instrumentId: 'g', title: 'Bars 1–8', parentItemId: parent.id, importance: 3, difficulty: 3, status: 'usable' }, NOW) };
  const partB = { ...createItem({ instrumentId: 'g', title: 'Bars 9–16', parentItemId: parent.id, importance: 5, difficulty: 4, status: 'fragile' }, NOW) };

  it('picks the highest-priority non-saturated part, deterministically', () => {
    const pick = pickNextPart(parent.id, [parent, partA, partB], [], NOW);
    expect(pick?.score.item.id).toBe(partB.id); // important + fragile beats usable
    expect(pick?.reason.length).toBeGreaterThan(0);
  });

  it('avoids a saturated part when another exists, but never returns null while parts exist', () => {
    const blocks = sameBlocks(partB);
    const pick = pickNextPart(parent.id, [parent, partA, partB], blocks, NOW);
    expect(pick?.score.item.id).toBe(partA.id);

    const onlySaturated = pickNextPart(parent.id, [parent, partB], blocks, NOW);
    expect(onlySaturated?.score.item.id).toBe(partB.id);
  });

  it('returns null when the piece has no parts', () => {
    expect(pickNextPart(parent.id, [parent], [], NOW)).toBeNull();
  });

  it('stalling suggests a smaller unit for whole pieces, a new strategy for small units — never guilt', () => {
    const wholeHint = stallHint(parent, sameBlocks(parent));
    expect(wholeHint).toMatch(/smaller unit/i);
    const phrase = createItem({ instrumentId: 'g', title: 'One phrase', itemType: 'phrase' }, NOW);
    const phraseHint = stallHint(phrase, sameBlocks(phrase));
    expect(phraseHint).toMatch(/different strategy/i);
    expect(stallHint(parent, [])).toBeNull();
    // Calm voice: no quotas, no shame words.
    expect(wholeHint).not.toMatch(/must|behind|fail/i);
  });
});
