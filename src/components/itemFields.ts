import type { GuitarFields, PersianFields } from '../domain';

/** What the piece IS — filled in when creating it. */
export const PERSIAN_IDENTITY_FIELDS: { key: keyof PersianFields; label: string; suggestions?: string[] }[] = [
  { key: 'dastgahAvaz', label: 'Dastgāh / Āvāz', suggestions: [] },
  { key: 'form', label: 'Form', suggestions: [] },
  { key: 'composer', label: 'Composer / maestro' },
  { key: 'gusheh', label: 'Gusheh (radif only)' },
];

/** Working detail — usually added later, while practising. */
export const PERSIAN_DETAIL_FIELDS: { key: keyof PersianFields; label: string }[] = [
  { key: 'phraseLabel', label: 'Phrase label' },
  { key: 'shahed', label: 'Shāhed' },
  { key: 'ist', label: 'Ist' },
  { key: 'foroud', label: 'Forud' },
  { key: 'ornamentIssue', label: 'Ornament issue' },
  { key: 'mezrabIssue', label: 'Mezrāb issue' },
  { key: 'importantNote', label: 'Important note' },
];

export const PERSIAN_FIELDS: { key: keyof PersianFields; label: string }[] = [
  ...PERSIAN_IDENTITY_FIELDS.map(({ key, label }) => ({ key, label })),
  ...PERSIAN_DETAIL_FIELDS,
];

export const GUITAR_IDENTITY_FIELDS: { key: keyof GuitarFields; label: string }[] = [
  { key: 'lessonNumber', label: 'Lesson number' },
  { key: 'barRange', label: 'Bar range' },
];

export const GUITAR_DETAIL_FIELDS: { key: keyof GuitarFields; label: string }[] = [
  { key: 'rightHandIssue', label: 'Right-hand issue' },
  { key: 'leftHandIssue', label: 'Left-hand issue' },
  { key: 'toneIssue', label: 'Tone issue' },
  { key: 'fingering', label: 'Fingering' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'stringNoiseIssue', label: 'String noise' },
  { key: 'bodyTensionNote', label: 'Body tension' },
];

export const GUITAR_FIELDS: { key: keyof GuitarFields; label: string }[] = [
  ...GUITAR_IDENTITY_FIELDS,
  ...GUITAR_DETAIL_FIELDS,
];

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
