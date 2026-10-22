import { describe, expect, it } from 'vitest';
import { dropUnshownIdentity, emptyItemValues, valuesToCreateInput, type ItemFormValues } from './itemFormValues';

const filled = (): ItemFormValues => ({
  ...emptyItemValues('inst-a'),
  title: 'چهارمضراب 2',
  materialId: 'mat',
  stageId: 'stage',
  parentItemId: '',
  itemType: 'full_piece',
  status: 'usable',
  importance: 4,
  difficulty: 2,
  primaryFocus: 'tone',
  notes: 'Working notes stay.',
  reviewMode: 'interval',
  reviewIntervalDays: '5',
  persian: { dastgahAvaz: { termId: 'dastgah:mahur' }, form: 'چهارمضراب', composer: 'صبا', gusheh: 'درآمد' },
  guitar: { barRange: 'bars 9–16', lessonNumber: '12' },
});

describe('switching instrument family on the item form', () => {
  it('switching instrument family drops identity fields the new family cannot show', () => {
    const v = filled();
    // Persian → Guitar: the Persian identity goes, everything else stays.
    expect(dropUnshownIdentity(v, 'Persian', 'Guitar')).toEqual({ ...v, persian: {} });
    // Guitar → Persian: the guitar identity goes, everything else stays.
    expect(dropUnshownIdentity(v, 'Guitar', 'Persian')).toEqual({ ...v, guitar: {} });
    // A family the form treats like Guitar (none named) is the same family.
    expect(dropUnshownIdentity(v, 'Guitar', undefined)).toBe(v);
    // The same family, and an unchanged instrument: nothing is dropped.
    expect(dropUnshownIdentity(v, 'Persian', 'Persian')).toBe(v);
    expect(dropUnshownIdentity(v, 'Guitar', 'Guitar')).toBe(v);
    // What is dropped is not saved: the write clears it rather than keeping
    // the hidden old value.
    const saved = valuesToCreateInput(dropUnshownIdentity(v, 'Persian', 'Guitar'));
    expect(saved.persian).toBeUndefined();
    expect(saved.guitar).toEqual({ barRange: 'bars 9–16', lessonNumber: '12' });
    expect('persian' in saved).toBe(true);
  });
});
