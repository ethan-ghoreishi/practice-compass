import type { GuitarFields, PersianFields } from '../domain';

/** What the piece IS — filled in when creating it. */
export const PERSIAN_IDENTITY_FIELDS: { key: keyof PersianFields; label: string; suggestions?: string[] }[] = [
  { key: 'dastgahAvaz', label: 'Dastgāh / Āvāz', suggestions: [] },
  { key: 'form', label: 'Form', suggestions: [] },
  { key: 'composer', label: 'Composer / maestro' },
  { key: 'gusheh', label: 'Gusheh (radif only)' },
];

/**
 * Identity only. The per-field "working detail" lists that used to sit here
 * (shāhed / ist / forud / hand / tone / tension…) were retired at schema v13 —
 * that kind of text belongs in the item's one Working notes field, where it is
 * readable while you play instead of buried in a form.
 */
export const PERSIAN_FIELDS: { key: keyof PersianFields; label: string }[] = PERSIAN_IDENTITY_FIELDS.map(
  ({ key, label }) => ({ key, label }),
);

export const GUITAR_IDENTITY_FIELDS: { key: keyof GuitarFields; label: string }[] = [
  { key: 'lessonNumber', label: 'Lesson number' },
  { key: 'barRange', label: 'Bar range' },
];

export const GUITAR_FIELDS: { key: keyof GuitarFields; label: string }[] = GUITAR_IDENTITY_FIELDS;

/**
 * Reference suggestions (never required, free text always allowed) — the
 * twelve standard dastgāh/āvāz of Persian classical music, and common forms.
 */
export const DASTGAH_SUGGESTIONS = [
  'Shur',
  'Abu’atā',
  'Bayāt-e Tork',
  'Afshāri',
  'Dashti',
  'Navā',
  'Homāyun',
  'Bayāt-e Esfahān',
  'Segāh',
  'Chahārgāh',
  'Māhur',
  'Rāst-Panjgāh',
];

export const FORM_SUGGESTIONS = [
  'Pish-darāmad',
  'Chahār-mezrāb',
  'Zarbi',
  'Tasnif',
  'Rang',
  'Ghet’e',
  'Āvāz (improvisation)',
  'Radif gusheh',
  'Étude / exercise',
];
