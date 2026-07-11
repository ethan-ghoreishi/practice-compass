import { describe, expect, it } from 'vitest';
import { groupByDastgah, UNCLASSIFIED_DASTGAH } from './persian';
import { createItem } from './factories';

const now = new Date('2026-07-11T10:00:00Z');

function item(title: string, persian?: Record<string, string>) {
  return createItem({ instrumentId: 'setar', title, persian }, now);
}

describe('groupByDastgah', () => {
  it('groups radif and composed pieces under ONE dastgāh even with spelling variants, in standard order', () => {
    const groups = groupByDastgah([
      item('Chahār-mezrāb-e Sabā', { dastgahAvaz: 'Afshāri', form: 'Chahār-mezrāb', composer: 'Abolhasan Sabā' }),
      item('Darāmad', { dastgahAvaz: 'Āvāz-e Afshāri', gusheh: 'Darāmad' }),
      item('Zang-e shotor', { dastgahAvaz: 'Afshāri' }),
      item('Pish-darāmad-e Māhur', { dastgahAvaz: 'Māhur', composer: 'Darvish Khān' }),
      item('Darāmad-e Shur', { dastgahAvaz: 'Shur' }),
    ]);
    // "Afshāri" and "Āvāz-e Afshāri" fold into one group labelled by the majority spelling.
    expect(groups.map((g) => g.dastgah)).toEqual(['Shur', 'Afshāri', 'Māhur']);
    expect(groups[1].items).toHaveLength(3);
  });

  it('puts pieces with identity but no dastgāh in an explicit unclassified group at the end', () => {
    const groups = groupByDastgah([
      item('Zarbi piece', { form: 'Zarbi' }),
      item('Darāmad-e Shur', { dastgahAvaz: 'Shur' }),
    ]);
    expect(groups.map((g) => g.dastgah)).toEqual(['Shur', UNCLASSIFIED_DASTGAH]);
  });

  it('omits items with no Persian identity (plain technique work is not repertoire)', () => {
    const groups = groupByDastgah([item('Riz exercise'), item('Darāmad-e Shur', { dastgahAvaz: 'Shur' })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((i) => i.title)).toEqual(['Darāmad-e Shur']);
  });

  it('sorts items alphabetically inside a group and is deterministic', () => {
    const groups = groupByDastgah([
      item('Zang-e shotor', { dastgahAvaz: 'Segāh' }),
      item('Moqaddameh', { dastgahAvaz: 'Segāh' }),
    ]);
    expect(groups[0].items.map((i) => i.title)).toEqual(['Moqaddameh', 'Zang-e shotor']);
  });
});
