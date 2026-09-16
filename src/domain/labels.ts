import type {
  BlockMode,
  BlockResult,
  FocusArea,
  ItemStatus,
  ItemType,
  MaterialSourceType,
  MaterialStatus,
  ReviewMode,
  ReviewType,
  StepKind,
  StepStatus,
  StepStrand,
} from './types';

// ---------------------------------------------------------------------------
// Display labels. The domain stores terse snake_case enums; the UI shows these.
// Status labels favour plain language over jargon; the enum keys stay stable.
// ---------------------------------------------------------------------------

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  new: 'Not practised yet',
  fragile: 'Shaky',
  repairing: 'Fixing problems',
  usable: 'Coming together',
  integrated: 'Solid',
  performable: 'Performance-ready',
  maintenance: 'Keeping fresh',
  dormant: 'Resting',
};

/**
 * One-line plain-language description of each status, shown in pickers.
 *
 * Status answers HOW THIS ITEM CURRENTLY STANDS and how you are working on it
 * — never how the last ten minutes went (that is the block's `result`). These
 * eight are not eight rungs of one compulsory ladder: nothing makes you pass
 * through every one, neighbouring statuses deliberately overlap, and you may
 * move backwards whenever the material does. `new` in particular says "still
 * being established", NOT "never practised" — an item can carry recorded
 * blocks and still honestly be new material.
 */
export const ITEM_STATUS_DESCRIPTIONS: Record<ItemStatus, string> = {
  new: 'New material, still being established.',
  fragile: 'Unreliable — falls apart easily.',
  repairing: 'Actively working on a known problem.',
  usable: 'Holds together, but not reliably in context.',
  integrated: 'Reliable in context.',
  performable: 'Ready to play for someone.',
  maintenance: 'Learned — deliberately keeping it fresh.',
  dormant: 'Deliberately set aside for now.',
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
  gusheh: 'Gusheh',
  full_piece: 'Full piece',
  exercise: 'Exercise',
  technique: 'Technique',
  improvisation: 'Improvisation',
  body: 'Body / tension',
  memory: 'Memory',
  other: 'Other',
};

export const REVIEW_MODE_LABELS: Record<ReviewMode, string> = {
  auto: 'Auto',
  interval: 'Every N days',
  manual: 'Manual',
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
  pitch: 'Pitch / intonation',
  rhythm: 'Rhythm',
  tone: 'Tone',
  fingering: 'Fingering',
  right_hand: 'Right hand',
  left_hand: 'Left hand',
  mezrab: 'Mezrāb (right hand)',
  relaxation: 'Relaxation',
  memory: 'Memory',
  phrase_direction: 'Phrase direction',
  ornament: 'Ornament',
  tahrir: 'Tahrir',
  transition: 'Transition',
  musical_meaning: 'Musical meaning',
  dynamics: 'Dynamics',
  tempo: 'Tempo',
  body: 'Body',
  other: 'Other',
};

/**
 * What each result CLAIMS, in the owner's own terms — asked at the close of a
 * block as "the most concrete thing you actually demonstrated".
 *
 * The last three are EVIDENCE of stability at a named scope; the first three
 * describe CHANGE short of such a claim. `same` is not failed recall and never
 * becomes one: no improvement is distinct from deterioration, and only `worse`
 * is ever read as a slip. Fatigue, a blank field and a missing rating are none
 * of these — that is what "Save without a result" is for.
 */
export const RESULT_DESCRIPTIONS: Record<BlockResult, string> = {
  worse: 'Genuine deterioration, or you struggled to recall it.',
  same: 'No meaningful change either way.',
  slightly_better: 'Some improvement, short of holding together.',
  stable_alone: 'The passage held together on its own, in isolation.',
  stable_in_context: 'It held together joined to the music around it.',
  performable: 'Ready to play for someone.',
  not_logged: 'Time recorded, no judgement made.',
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
  method_book: 'Method book',
  repertoire: 'Repertoire',
  piece: 'Piece',
  song: 'Song / tasnif',
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

/**
 * The two 1–5 estimates the owner sets by hand. Their STORED names stay
 * `importance` / `difficulty` (every weight, bound and test depends on them);
 * these are what the screens call them, because "importance" and "difficulty"
 * both read like intrinsic properties of the music and they are neither —
 * they are changeable personal estimates, and the app never infers or measures
 * them.
 */
export const RATING_LABELS = {
  importance: 'Personal priority',
  difficulty: 'Current effort',
} as const;

export const RATING_HINTS = {
  importance: 'How much you want this in the mix right now. It can change any time.',
  difficulty: 'How demanding it feels right now, at the level you are aiming for.',
} as const;

/** Anchored 1 / 3 / 5 wording; 2 and 4 are the meaningful steps between. */
export const RATING_ANCHORS: Record<'importance' | 'difficulty', Record<1 | 3 | 5, string>> = {
  importance: {
    1: 'Barely — happy to leave it aside',
    3: 'Ordinary — part of the mix',
    5: 'Front of the queue right now',
  },
  difficulty: {
    1: 'Easy — comes out without much thought',
    3: 'Ordinary — needs attention',
    5: 'Very demanding at the level I want',
  },
};

/** What the two estimates actually DO, stated plainly wherever they are set. */
export const RATING_EFFECT_NOTE =
  'These two estimates help order what to practise and how soon reviews come round; high effort also keeps an item out of easy warm-ups. They are your estimates, not measurements, and nothing needs to be kept up to date on a schedule.';

// --- Pathways ---------------------------------------------------------------

export const STRAND_LABELS: Record<StepStrand, string> = {
  warmup: 'Warm-up',
  right_hand: 'Right hand',
  left_hand: 'Left hand',
  mezrab: 'Mezrāb',
  chords: 'Chords',
  arpeggios: 'Arpeggios',
  scales: 'Scales',
  exercise: 'Exercises',
  rhythm: 'Rhythm',
  sight_reading: 'Sight-reading',
  radif: 'Radif / gusheh',
  repertoire: 'Repertoire',
  improvisation: 'Improvisation',
  ornament: 'Ornament',
  piece: 'Piece',
  phrasing: 'Phrasing',
  fretboard: 'Fretboard',
  practice_skills: 'Practice skills',
  reading_theory: 'Reading & theory',
  technique: 'Technique',
  other: 'Other study',
};

/** Strands grouped for the step-editor picker. */
export const STRAND_ORDER: StepStrand[] = [
  'warmup',
  'right_hand',
  'left_hand',
  'mezrab',
  'chords',
  'arpeggios',
  'scales',
  'exercise',
  'rhythm',
  'sight_reading',
  'radif',
  'repertoire',
  'improvisation',
  'ornament',
  'piece',
  'phrasing',
  'fretboard',
  'practice_skills',
  'reading_theory',
  'technique',
  'other',
];

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

/** Map a pathway strand to the closest practice FocusArea (for quick-start). */
export const STRAND_TO_FOCUS: Record<StepStrand, FocusArea> = {
  warmup: 'body',
  right_hand: 'right_hand',
  left_hand: 'left_hand',
  mezrab: 'mezrab',
  chords: 'fingering',
  arpeggios: 'right_hand',
  scales: 'fingering',
  exercise: 'fingering',
  rhythm: 'rhythm',
  sight_reading: 'pitch',
  radif: 'musical_meaning',
  repertoire: 'musical_meaning',
  improvisation: 'musical_meaning',
  ornament: 'ornament',
  piece: 'musical_meaning',
  phrasing: 'phrase_direction',
  fretboard: 'fingering',
  practice_skills: 'other',
  reading_theory: 'other',
  technique: 'other',
  other: 'other',
};

/** Suggested itemType when creating a practice item from a pathway step. */
export const STRAND_TO_ITEM_TYPE: Record<StepStrand, ItemType> = {
  warmup: 'body',
  right_hand: 'technique',
  left_hand: 'technique',
  mezrab: 'technique',
  chords: 'technique',
  arpeggios: 'technique',
  scales: 'technique',
  exercise: 'exercise',
  rhythm: 'exercise',
  sight_reading: 'exercise',
  radif: 'gusheh',
  repertoire: 'full_piece',
  improvisation: 'improvisation',
  ornament: 'technique',
  piece: 'full_piece',
  phrasing: 'phrase',
  fretboard: 'technique',
  practice_skills: 'other',
  reading_theory: 'other',
  technique: 'technique',
  other: 'other',
};
