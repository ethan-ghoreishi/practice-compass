import type {
  Curriculum,
  CurriculumLevel,
  CurriculumRoutine,
  CurriculumStage,
  CurriculumStep,
  StepKind,
  StepStrand,
} from './types';

// ---------------------------------------------------------------------------
// The Classical Guitar Shed "Woodshed" pathway.
//
// Content is defined here in code (not persisted) so it can be improved without
// migrations. Level 1A is seeded in full detail from the official 1A syllabus;
// the rest of Levels 1–3 are seeded faithfully from the real course structure
// (one step per practice area of each sub-level), so the learner always sees
// the whole path and exactly where they stand. Levels 4–5 are shown as the
// road ahead, to be filled in when reached. Nothing here is fabricated detail.
// ---------------------------------------------------------------------------

export const CGS_ID = 'cgs';

const LEVELS: CurriculumLevel[] = [
  {
    number: 1,
    title: 'Level 1 · Foundations',
    summary:
      'A relaxed setup, the right-hand “chunk”, finger-walking, first chords, counting rhythm aloud, reading on single strings, and your first pieces.',
    available: true,
  },
  {
    number: 2,
    title: 'Level 2 · Coordination',
    summary:
      'Arpeggios, scales, fuller chords and longer pieces — building fluent, independent hands.',
    available: true,
  },
  {
    number: 3,
    title: 'Level 3 · Musicianship',
    summary:
      'Phrasing, fretboard mastery, articulation and more expressive repertoire.',
    available: true,
  },
  {
    number: 4,
    title: 'Level 4 · The road ahead',
    summary: 'Continues the Woodshed path. Add your 4A–4G materials when you reach them — no rush.',
    available: false,
  },
  {
    number: 5,
    title: 'Level 5 · The road ahead',
    summary: 'The final Woodshed level. Add your 5A–5G materials when you reach them.',
    available: false,
  },
];

// --- Strand metadata (used to generate outline steps) ----------------------

const STRAND_META: Record<StepStrand, { label: string; kind: StepKind }> = {
  warmup: { label: 'Warm-up', kind: 'video' },
  left_hand: { label: 'Left-hand exercises', kind: 'drill' },
  right_hand: { label: 'Right-hand technique', kind: 'drill' },
  chords: { label: 'Chords', kind: 'drill' },
  arpeggios: { label: 'Arpeggios', kind: 'drill' },
  scales: { label: 'Scales', kind: 'drill' },
  exercise: { label: 'Exercises', kind: 'exercise' },
  fretboard: { label: 'Fretboard mastery', kind: 'drill' },
  rhythm: { label: 'Rhythm study', kind: 'exercise' },
  sight_reading: { label: 'Sight-reading', kind: 'exercise' },
  phrasing: { label: 'Phrasing', kind: 'drill' },
  piece: { label: 'Piece', kind: 'piece' },
  practice_skills: { label: 'Practice skills', kind: 'reading' },
  reading_theory: { label: 'Background knowledge', kind: 'reading' },
  technique: { label: 'Technique primer', kind: 'reading' },
  other: { label: 'Other study', kind: 'drill' },
};

// --- Stage definitions (sub-levels), faithful to the course folders --------

interface StageSeed {
  code: string;
  level: number;
  areas: StepStrand[];
  title?: string;
  intro?: string;
}

const COMMON_L1 = ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'piece', 'other'] as StepStrand[];
const COMMON_L2 = COMMON_L1;

const STAGE_SEEDS: StageSeed[] = [
  // Level 1 — 1A is detailed separately below
  {
    code: '1A',
    level: 1,
    title: 'Foundations of tone & reading',
    intro:
      'Build the foundation: a relaxed setup, the right-hand “chunk”, finger-walking, your first 3-note chords, counting rhythm aloud, reading on the 1st string, and your first piece. Go slow and trust the process — it works.',
    areas: ['warmup', 'right_hand', 'chords', 'rhythm', 'sight_reading', 'piece', 'reading_theory'],
  },
  { code: '1B', level: 1, areas: COMMON_L1 },
  { code: '1C', level: 1, areas: COMMON_L1 },
  { code: '1D', level: 1, areas: COMMON_L1 },
  { code: '1E', level: 1, areas: COMMON_L1 },
  { code: '1F', level: 1, areas: COMMON_L1 },
  // Level 2
  { code: '2A', level: 2, areas: COMMON_L2 },
  { code: '2B', level: 2, areas: COMMON_L2 },
  { code: '2C', level: 2, areas: COMMON_L2 },
  { code: '2D', level: 2, areas: COMMON_L2 },
  { code: '2E', level: 2, areas: COMMON_L2 },
  { code: '2F', level: 2, areas: COMMON_L2 },
  // Level 3 — phrasing enters; fretboard / practice-skills appear in some stages
  { code: '3A', level: 3, areas: ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other'] },
  { code: '3B', level: 3, areas: ['chords', 'arpeggios', 'scales', 'fretboard', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other'] },
  { code: '3C', level: 3, areas: ['chords', 'arpeggios', 'scales', 'fretboard', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other'] },
  { code: '3D', level: 3, areas: ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'practice_skills'] },
  { code: '3E', level: 3, areas: ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'practice_skills'] },
  { code: '3F', level: 3, areas: ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other'] },
];

function stageId(code: string): string {
  return `${CGS_ID}-${code}`;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// --- Detailed Level 1A steps (from the official syllabus) ------------------

interface StepSeed {
  title: string;
  strand: StepStrand;
  kind: StepKind;
  notes?: string;
  targetBpm?: number;
}

const STEPS_1A: StepSeed[] = [
  {
    title: 'Warm-up & stretches',
    strand: 'warmup',
    kind: 'video',
    notes:
      'Relax your whole body and face; take your time and be gentle. The goal is blood flow and loosening up — not a hard stretch. Don’t skip it, and don’t over-stretch (it’s not a contest).',
  },
  {
    title: 'Finger-walking',
    strand: 'right_hand',
    kind: 'drill',
    targetBpm: 60,
    notes:
      'Steady tempo. Touch the strings and pause; keep the big knuckles over the strings; close from the big knuckle; keep the tip joints soft. Give extra time to your weakest fingers.',
  },
  {
    title: 'Contrast practice (right hand)',
    strand: 'right_hand',
    kind: 'drill',
    notes: 'Alternate firm vs. relaxed to feel the difference, and find the lightest touch that still speaks.',
  },
  {
    title: 'Chunks (right hand only)',
    strand: 'right_hand',
    kind: 'drill',
    notes: 'Wrist up; fingers touch each other; close the hand; pads (not tips) touch the palm.',
  },
  {
    title: 'Thumb-chunks (right hand only)',
    strand: 'right_hand',
    kind: 'drill',
    notes: 'The thumb plays from the wrist, not the tip joint.',
  },
  {
    title: '3-note chords',
    strand: 'chords',
    kind: 'drill',
    notes:
      'Press just behind the frets; keep fingers curved with space in the hand; thumb behind the 2nd finger, straight, pressing on the meaty pad. Avoid locking the index knuckle to the neck.',
  },
  {
    title: '3-note chords with chunks',
    strand: 'chords',
    kind: 'drill',
    notes: 'Combine the chord shapes with the right-hand chunk.',
  },
  {
    title: 'Rhythm practice #1 (clap & count aloud)',
    strand: 'rhythm',
    kind: 'exercise',
    targetBpm: 80,
    notes: 'Clap and count aloud — out loud, not in your head — exercises A–D. Go slow; count with your voice.',
  },
  {
    title: 'Notes on the 1st string',
    strand: 'sight_reading',
    kind: 'video',
    notes: 'Learn the note names on the 1st string before the play-along.',
  },
  {
    title: 'Sight-reading practice #1 (play-along)',
    strand: 'sight_reading',
    kind: 'exercise',
    targetBpm: 70,
    notes:
      'Play along with the video and keep going — don’t stop for missed notes. 80%+ correct is a success; if you hit 100%, go faster. Short and daily (3–5 min) beats long and occasional.',
  },
  {
    title: 'Piece — “The Forest Glade”',
    strand: 'piece',
    kind: 'piece',
    targetBpm: 60,
    notes:
      'Break it into small sections. For each: clap & count the rhythm aloud; name the chords; play the right hand alone on open strings (count aloud); play the left hand alone (count aloud); then hands together. Join 1+2, then 2+3, then 3+4, then the whole piece. Go slow and trust the process.',
  },
  {
    title: 'Reading music — “How Notes Work” & “Musical Notation”',
    strand: 'reading_theory',
    kind: 'reading',
    notes: 'Watch “How Notes Work” and “Getting Started with Musical Notation”.',
  },
  {
    title: 'Technique primer — “What is Technique”',
    strand: 'technique',
    kind: 'reading',
    notes: 'Watch “What is Technique” to frame how you’ll practise everything else.',
  },
  {
    title: 'Checkpoint — ready for 1B',
    strand: 'practice_skills',
    kind: 'checkpoint',
    notes:
      'When the 1A areas feel comfortable and “The Forest Glade” plays through slowly and steadily, you’re ready for 1B. Move on when it feels right, not by a deadline.',
  },
];

// --- 1A guided routines (from the syllabus’ sample 20-minute routines) ------

const ROUTINES_1A: Omit<CurriculumRoutine, 'stageId'>[] = [
  {
    id: `${stageId('1A')}-routine-1`,
    name: 'Stage 1 routine · 20 min',
    segments: [
      { label: 'Chunk chords (right hand only)', minutes: 1, essential: true },
      { label: '3-note chords', minutes: 2 },
      { label: 'Finger-walking', minutes: 2, essential: true },
      { label: 'Chunk chords (right hand only)', minutes: 1 },
      { label: 'Rhythm practice (clap & count aloud)', minutes: 1 },
      { label: '3-note chords', minutes: 2 },
      { label: 'Chunk chords (right hand only)', minutes: 1 },
      { label: 'Sight-reading (play-along)', minutes: 3 },
      { label: 'Finger-walking (weakest fingers)', minutes: 2 },
      { label: 'Rhythm practice (clap & count aloud)', minutes: 1 },
      { label: '3-note chords', minutes: 2 },
      { label: 'Finger-walking (weakest fingers)', minutes: 1 },
      { label: 'Chunk chords (right hand only)', minutes: 1 },
    ],
  },
  {
    id: `${stageId('1A')}-routine-2`,
    name: 'Stage 2 routine · 20 min',
    segments: [
      { label: 'Chunk chords (right hand only)', minutes: 1, essential: true },
      { label: 'Thumb/chunks (right hand only)', minutes: 1, essential: true },
      { label: 'Finger-walking', minutes: 2, essential: true },
      { label: '3-note chords', minutes: 1 },
      { label: 'Rhythm practice (clap & count aloud)', minutes: 1 },
      { label: '3-note chords with chunks', minutes: 2, essential: true },
      { label: 'Sight-reading (play-along)', minutes: 3 },
      { label: 'Chunk chords (right hand only)', minutes: 2 },
      { label: 'Finger-walking (weakest fingers)', minutes: 2 },
      { label: 'Rhythm practice (clap & count aloud)', minutes: 1 },
      { label: '3-note chords with chunks', minutes: 2 },
      { label: 'Finger-walking', minutes: 2 },
    ],
  },
];

// --- Assembly --------------------------------------------------------------

function buildStages(): { stages: CurriculumStage[]; steps: CurriculumStep[] } {
  const stages: CurriculumStage[] = [];
  const steps: CurriculumStep[] = [];

  STAGE_SEEDS.forEach((seed, stageOrder) => {
    const id = stageId(seed.code);
    const detailed = seed.code === '1A';
    stages.push({
      id,
      levelNumber: seed.level,
      code: seed.code,
      title: seed.title ?? seed.code,
      order: stageOrder,
      intro: seed.intro,
      mainAreas: seed.areas.map((a) => STRAND_META[a].label),
      detailed,
    });

    if (detailed) {
      STEPS_1A.forEach((s, i) => {
        steps.push({
          id: `${id}-${slug(s.title)}`,
          stageId: id,
          title: s.title,
          strand: s.strand,
          kind: s.kind,
          notes: s.notes,
          targetBpm: s.targetBpm,
          order: i,
        });
      });
    } else {
      seed.areas.forEach((strand, i) => {
        const meta = STRAND_META[strand];
        steps.push({
          id: `${id}-${slug(meta.label)}`,
          stageId: id,
          title: meta.label,
          strand,
          kind: meta.kind,
          notes: `Work through the Classical Guitar Shed ${seed.code} “${meta.label}” lesson(s). Keep your attention on the current step; go slow.`,
          order: i,
        });
      });
    }
  });

  return { stages, steps };
}

let cached: Curriculum | null = null;

export function getCurriculum(): Curriculum {
  if (cached) return cached;
  const { stages, steps } = buildStages();
  const routines: CurriculumRoutine[] = ROUTINES_1A.map((r) => ({ ...r, stageId: stageId('1A') }));
  cached = {
    id: CGS_ID,
    name: 'Classical Guitar Shed · The Woodshed',
    source: 'classicalguitarshed.com',
    description:
      'A step-by-step path to mastery. Follow it at your own pace — there’s no rush and no deadline. Trust the plan and put your attention on the practice itself.',
    levels: LEVELS,
    stages,
    steps,
    routines,
  };
  return cached;
}
