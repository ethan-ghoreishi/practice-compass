import { describe, expect, it } from 'vitest';
import { fieldsForKind, kindFromItem, kindsForFamily, kindToItemType } from './itemKinds';

describe('tailored form kinds', () => {
  it('Persian instruments offer gusheh and composed piece; others offer plain piece', () => {
    expect(kindsForFamily('Persian').map((k) => k.value)).toContain('gusheh');
    expect(kindsForFamily('Persian').map((k) => k.value)).toContain('persian_piece');
    expect(kindsForFamily('Western').map((k) => k.value)).toContain('piece');
    expect(kindsForFamily('Western').map((k) => k.value)).not.toContain('gusheh');
  });

  it('a gusheh asks for dastgāh + gusheh, never composer/form', () => {
    const f = fieldsForKind('gusheh', 'Persian');
    expect(f).toMatchObject({ dastgah: true, gushehName: true, form: false, composer: false, parent: false });
  });

  it('a composed Persian piece asks for dastgāh + form + composer (the Sabā case)', () => {
    const f = fieldsForKind('persian_piece', 'Persian');
    expect(f).toMatchObject({ dastgah: true, form: true, composer: true, gushehName: false });
  });

  it('a passage asks for its parent work and range, not repertoire identity', () => {
    const f = fieldsForKind('passage', 'Persian');
    expect(f).toMatchObject({ parent: true, range: true, dastgah: false, form: false });
  });

  it('technique shows no repertoire identity fields at all', () => {
    const f = fieldsForKind('technique', 'Persian');
    expect(Object.values(f).every((v) => v === false)).toBe(true);
  });

  it('a guitar piece stays simple — no premature guitar schema', () => {
    const f = fieldsForKind('piece', 'Western');
    expect(Object.values(f).every((v) => v === false)).toBe(true);
  });

  it('kinds map onto existing ItemType values (no new persisted enum)', () => {
    expect(kindToItemType('gusheh')).toBe('gusheh');
    expect(kindToItemType('persian_piece')).toBe('full_piece');
    expect(kindToItemType('piece')).toBe('full_piece');
    expect(kindToItemType('passage')).toBe('phrase');
  });

  it('editing infers the kind back from the item', () => {
    expect(kindFromItem({ itemType: 'gusheh', persian: { dastgahAvaz: 'Shur' } })).toBe('gusheh');
    expect(kindFromItem({ itemType: 'full_piece', persian: { composer: 'Sabā' } })).toBe('persian_piece');
    expect(kindFromItem({ itemType: 'full_piece' })).toBe('piece');
    expect(kindFromItem({ itemType: 'section', parentItemId: 'x' })).toBe('passage');
  });
});
