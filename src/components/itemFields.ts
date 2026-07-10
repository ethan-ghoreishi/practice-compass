import type { GuitarFields, PersianFields } from '../domain';

export const PERSIAN_FIELDS: { key: keyof PersianFields; label: string }[] = [
  { key: 'dastgahAvaz', label: 'Dastgāh / Āvāz' },
  { key: 'gusheh', label: 'Gusheh' },
  { key: 'form', label: 'Form (pish-darāmad, chahār-mezrāb…)' },
  { key: 'composer', label: 'Composer / maestro' },
  { key: 'phraseLabel', label: 'Phrase label' },
  { key: 'shahed', label: 'Shāhed' },
  { key: 'ist', label: 'Ist' },
  { key: 'foroud', label: 'Forud' },
  { key: 'ornamentIssue', label: 'Ornament issue' },
  { key: 'mezrabIssue', label: 'Mezrāb issue' },
  { key: 'importantNote', label: 'Important note' },
];

export const GUITAR_FIELDS: { key: keyof GuitarFields; label: string }[] = [
  { key: 'lessonNumber', label: 'Lesson number' },
  { key: 'barRange', label: 'Bar range' },
  { key: 'rightHandIssue', label: 'Right-hand issue' },
  { key: 'leftHandIssue', label: 'Left-hand issue' },
  { key: 'toneIssue', label: 'Tone issue' },
  { key: 'fingering', label: 'Fingering' },
  { key: 'tempo', label: 'Tempo' },
  { key: 'stringNoiseIssue', label: 'String noise' },
  { key: 'bodyTensionNote', label: 'Body tension' },
];
