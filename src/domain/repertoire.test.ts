import { describe, expect, it } from 'vitest';
import { formsPresent, isWork, repertoireWorks } from './repertoire';
import { createItem } from './factories';
import type { CreateItemInput } from './factories';

const now = new Date('2026-07-11T10:00:00Z');

function item(input: Partial<CreateItemInput> & { title: string }) {
  return createItem({ instrumentId: 'setar', ...input }, now);
}

describe('My repertoire lens (repertoireWorks)', () => {
  it('a radif gusheh and a composed maestro piece coexist as works', () => {
    const gusheh = item({ title: 'Darāmad-e Afshāri', itemType: 'gusheh', persian: { dastgahAvaz: 'Afshāri', gusheh: 'Darāmad' } });
    const saba = item({
      title: 'Chahārmezrāb-e Sabā',
      itemType: 'full_piece',
      persian: { dastgahAvaz: 'Afshāri', form: 'Chahārmezrāb', composer: 'Abolhasan Sabā' },
    });
    const works = repertoireWorks([gusheh, saba]);
    expect(works.map((w) => w.work.title)).toEqual(['Chahārmezrāb-e Sabā', 'Darāmad-e Afshāri']);
  });

  it('a Classical Guitar piece appears through the same lens without any special model', () => {
    const guitar = item({ instrumentId: 'guitar', title: 'Lágrima', itemType: 'full_piece' });
    expect(isWork(guitar)).toBe(true);
  });

  it('technique drills and generic exercises are NOT works — they stay in the practice list', () => {
    expect(isWork(item({ title: 'Riz evenness', itemType: 'technique' }))).toBe(false);
    expect(isWork(item({ title: 'Spider exercise', itemType: 'exercise' }))).toBe(false);
    expect(isWork(item({ title: 'Random phrase', itemType: 'phrase' }))).toBe(false);
  });

  it('parts nest under their parent work and never appear as standalone works', () => {
    const piece = item({ title: 'Pish-darāmad-e Māhur', itemType: 'full_piece', persian: { dastgahAvaz: 'Māhur' } });
    const partB = item({ title: 'B section', itemType: 'section', parentItemId: piece.id });
    const partA = item({ title: 'A section', itemType: 'section', parentItemId: piece.id });
    // Even a part WITH Persian identity stays nested, not duplicated.
    const partC = item({ title: 'Forud phrase', itemType: 'phrase', parentItemId: piece.id, persian: { dastgahAvaz: 'Māhur' } });

    const works = repertoireWorks([piece, partB, partA, partC]);
    expect(works).toHaveLength(1);
    expect(works[0].parts.map((p) => p.title)).toEqual(['A section', 'B section', 'Forud phrase']);
  });

  it('an item linked to a source, stage and lesson appears exactly once — links never duplicate it', () => {
    const linked = item({
      title: 'Chahārmezrāb-e Sabā',
      itemType: 'full_piece',
      persian: { dastgahAvaz: 'Afshāri', form: 'Chahārmezrāb', composer: 'Abolhasan Sabā' },
      materialId: 'radif-saba',
      stageId: 'stage-afshari',
    });
    const works = repertoireWorks([linked]);
    expect(works).toHaveLength(1);
    expect(works[0].work.materialId).toBe('radif-saba');
    expect(works[0].work.stageId).toBe('stage-afshari');
  });

  it('collects distinct forms for filter chips, folding case', () => {
    const works = repertoireWorks([
      item({ title: 'A', itemType: 'full_piece', persian: { form: 'Chahārmezrāb' } }),
      item({ title: 'B', itemType: 'full_piece', persian: { form: 'chahārmezrāb' } }),
      item({ title: 'C', itemType: 'full_piece', persian: { form: 'Tasnif' } }),
    ]);
    expect(formsPresent(works)).toEqual(['Chahārmezrāb', 'Tasnif']);
  });
});
