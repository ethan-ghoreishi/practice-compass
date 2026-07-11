import type { ItemType, PracticeItem } from '../domain';

/**
 * "What are you adding?" — the creation form asks the KIND first and then
 * shows only the identity fields that make sense for it. Kinds are a UI
 * concept mapped onto the persisted ItemType enum; no new data model.
 */

export type ItemKind = 'gusheh' | 'persian_piece' | 'piece' | 'etude' | 'passage' | 'technique' | 'other';

export interface KindOption {
  value: ItemKind;
  label: string;
}

export function kindsForFamily(family: string | undefined): KindOption[] {
  if (family === 'Persian') {
    return [
      { value: 'gusheh', label: 'Gusheh (radif)' },
      { value: 'persian_piece', label: 'Composed piece' },
      { value: 'passage', label: 'Passage / part' },
      { value: 'etude', label: 'Étude / exercise' },
      { value: 'technique', label: 'Technique' },
    ];
  }
  return [
    { value: 'piece', label: 'Piece' },
    { value: 'etude', label: 'Étude / study' },
    { value: 'passage', label: 'Passage / part' },
    { value: 'technique', label: 'Technique / drill' },
  ];
}

export function kindToItemType(kind: ItemKind): ItemType {
  switch (kind) {
    case 'gusheh':
      return 'gusheh';
    case 'persian_piece':
    case 'piece':
      return 'full_piece';
    case 'etude':
      return 'exercise';
    case 'passage':
      return 'phrase';
    case 'technique':
      return 'technique';
    case 'other':
      return 'other';
  }
}

/** Infer the kind when editing an existing item. */
export function kindFromItem(item: Pick<PracticeItem, 'itemType' | 'persian' | 'parentItemId'>): ItemKind {
  if (item.parentItemId) return 'passage';
  switch (item.itemType) {
    case 'gusheh':
      return 'gusheh';
    case 'full_piece':
      return item.persian && Object.values(item.persian).some(Boolean) ? 'persian_piece' : 'piece';
    case 'phrase':
    case 'section':
    case 'bar':
      return 'passage';
    case 'exercise':
      return 'etude';
    case 'technique':
    case 'body':
      return 'technique';
    default:
      return 'other';
  }
}

export interface KindFields {
  /** Dastgāh / āvāz input. */
  dastgah: boolean;
  /** Gusheh name input. */
  gushehName: boolean;
  /** Persian musical form (chahārmezrāb, pish-darāmad…). */
  form: boolean;
  /** Composer / maestro. */
  composer: boolean;
  /** Parent work picker (passages/parts). */
  parent: boolean;
  /** Bar range / phrase label. */
  range: boolean;
}

/** Which identity fields a kind shows, given the instrument family. */
export function fieldsForKind(kind: ItemKind, family: string | undefined): KindFields {
  const persian = family === 'Persian';
  switch (kind) {
    case 'gusheh':
      return { dastgah: true, gushehName: true, form: false, composer: false, parent: false, range: false };
    case 'persian_piece':
      return { dastgah: true, gushehName: false, form: true, composer: true, parent: false, range: false };
    case 'piece':
      return { dastgah: false, gushehName: false, form: false, composer: false, parent: false, range: false };
    case 'passage':
      return { dastgah: false, gushehName: false, form: false, composer: false, parent: true, range: true };
    case 'etude':
      return { dastgah: persian, gushehName: false, form: false, composer: persian, parent: false, range: false };
    case 'technique':
    case 'other':
      return { dastgah: false, gushehName: false, form: false, composer: false, parent: false, range: false };
  }
}
