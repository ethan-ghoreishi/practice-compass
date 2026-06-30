import type {
  BlockMode,
  BlockResult,
  FocusArea,
  ItemStatus,
  ItemType,
  MaterialSourceType,
  MaterialStatus,
  ReviewType,
  StepKind,
  StepStatus,
  StepStrand,
} from './types';

// ---------------------------------------------------------------------------
// Display labels. The domain stores terse snake_case enums; the UI shows these.
// ---------------------------------------------------------------------------

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  new: 'New',
  fragile: 'Fragile',
  repairing: 'Repairing',
  usable: 'Usable',
  integrated: 'Integrated',
  performable: 'Performable',
  maintenance: 'Maintenance',
  dormant: 'Dormant',
};

export const ITEM_STATUS_ORDER: ItemStatus[] = [
  'new',
  'fragile',
  'repairing',
  'usable',
  'integrated',
  'performable',
  'maintenance',
  'dormant',
];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  phrase: 'Phrase',
  section: 'Section',
  bar: 'Bar',
  full_piece: 'Full piece',
  exercise: 'Exercise',
  technique: 'Technique',
  improvisation: 'Improvisation',
  body: 'Body / tension',
  memory: 'Memory',
  other: 'Other',
};

export const BLOCK_MODE_LABELS: Record<BlockMode, string> = {
  learn: 'Learn',
  repair: 'Repair',
  integrate: 'Integrate',
  maintain: 'Maintain',
  perform: 'Perform',
  explore: 'Explore',
  diagnose: 'Diagnose',
};

export const FOCUS_LABELS: Record<FocusArea, string> = {
  pitch: 'Pitch',
  rhythm: 'Rhythm',
  tone: 'Tone',
  fingering: 'Fingering',
  right_hand: 'Right hand',
  left_hand: 'Left hand',
  relaxation: 'Relaxation',
  memory: 'Memory',
  phrase_direction: 'Phrase direction',
  ornament: 'Ornament',
  transition: 'Transition',
  musical_meaning: 'Musical meaning',
  tempo: 'Tempo',
  body: 'Body',
  other: 'Other',
};

export const RESULT_LABELS: Record<BlockResult, string> = {
  worse: 'Worse',
  same: 'Same',
  slightly_better: 'Slightly better',
  stable_alone: 'Stable alone',
  stable_in_context: 'Stable in context',
  performable: 'Performable',
  not_logged: 'Not logged',
};

/** Result options shown as quick buttons when closing a block (best last). */
export const RESULT_BUTTONS: BlockResult[] = [
  'worse',
  'same',
  'slightly_better',
  'stable_alone',
  'stable_in_context',
  'performable',
];

export const MATERIAL_SOURCE_LABELS: Record<MaterialSourceType, string> = {
  radif: 'Radif',
  piece: 'Piece',
  course: 'Course',
  lesson: 'Lesson',
  etude: 'Étude',
  technique: 'Technique',
  exercise: 'Exercise',
  improvisation: 'Improvisation',
  other: 'Other',
};

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  new: 'New',
  active: 'Active',
  maintenance: 'Maintenance',
  dormant: 'Dormant',
  archived: 'Archived',
};

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  retention: 'Retention',
  repair: 'Repair',
  integration: 'Integration',
  maintenance: 'Maintenance',
  teacher_check: 'Teacher check',
};

/** A coarse tone bucket per status, used to pick a status colour token. */
export const STATUS_TONE: Record<ItemStatus, 'alert' | 'warn' | 'progress' | 'good' | 'rest'> = {
  new: 'progress',
  fragile: 'alert',
  repairing: 'warn',
  usable: 'progress',
  integrated: 'good',
  performable: 'good',
  maintenance: 'rest',
  dormant: 'rest',
};

/** Where a result sits on the worse → better scale (for trend display). */
export const RESULT_RANK: Record<BlockResult, number> = {
  not_logged: -1,
  worse: 0,
  same: 1,
  slightly_better: 2,
  stable_alone: 3,
  stable_in_context: 4,
  performable: 5,
};

// --- Curriculum -------------------------------------------------------------

export const STRAND_LABELS: Record<StepStrand, string> = {
  warmup: 'Warm-up',
  right_hand: 'Right hand',
  left_hand: 'Left hand',
  chords: 'Chords',
  arpeggios: 'Arpeggios',
  scales: 'Scales',
  exercise: 'Exercises',
  rhythm: 'Rhythm',
  sight_reading: 'Sight-reading',
  piece: 'Piece',
  phrasing: 'Phrasing',
  fretboard: 'Fretboard',
  practice_skills: 'Practice skills',
  reading_theory: 'Reading & theory',
  technique: 'Technique',
  other: 'Other study',
};

export const STEP_STATUS_LABELS: Record<StepStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export const STEP_KIND_LABELS: Record<StepKind, string> = {
  video: 'Video',
  exercise: 'Exercise',
  drill: 'Drill',
  piece: 'Piece',
  reading: 'Reading',
  checkpoint: 'Checkpoint',
};

/** Map a curriculum strand to the closest practice FocusArea (for quick-start). */
export const STRAND_TO_FOCUS: Record<StepStrand, FocusArea> = {
  warmup: 'body',
  right_hand: 'right_hand',
  left_hand: 'left_hand',
  chords: 'fingering',
  arpeggios: 'right_hand',
  scales: 'fingering',
  exercise: 'fingering',
  rhythm: 'rhythm',
  sight_reading: 'pitch',
  piece: 'musical_meaning',
  phrasing: 'phrase_direction',
  fretboard: 'fingering',
  practice_skills: 'other',
  reading_theory: 'other',
  technique: 'other',
  other: 'other',
};
