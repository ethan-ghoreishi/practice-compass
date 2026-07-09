import type {
  CatalogEntry,
  GuitarFields,
  ID,
  Pathway,
  PathwayRoutine,
  PathwayStage,
  PersianFields,
  RoutineSegment,
  StepKind,
  StepStrand,
} from './types';
import { nowISO } from './util';

// ---------------------------------------------------------------------------
// Seeded default pathways. All of this becomes ordinary editable data in the
// store — the user can rename, reorder, add to, or delete any of it.
//
//  • Guitar  → Classical Guitar Shed "Woodshed" (1A in full from the syllabus;
//              1B–3F mapped from the real course structure).
//  • Setar   → a flexible radif/repertoire map (dastgāh → āvāz → gusheh), since
//              setar lessons are teacher-driven and change with need.
//  • Tar     → the Honarestān two-book method (as taught on Khonyagar.com).
//
// The Persian paths are honest, well-grounded *starting points* for inspiration,
// explicitly meant to be edited — not a fixed syllabus.
// ---------------------------------------------------------------------------

interface StepSeed {
  title: string;
  strand: StepStrand;
  kind?: StepKind;
  notes?: string;
  about?: string;
  bpm?: number;
  persian?: PersianFields;
  guitar?: GuitarFields;
}
interface StageSeed {
  code: string;
  title: string;
  group?: string;
  intro?: string;
  steps: StepSeed[];
}
interface RoutineSeed {
  name: string;
  stageCode?: string;
  segments: RoutineSegment[];
}
interface PathSeed {
  id: string;
  instrumentKey: 'guitar' | 'setar' | 'tar';
  name: string;
  source?: string;
  description?: string;
  note?: string;
  stages: StageSeed[];
  routines?: RoutineSeed[];
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// --- Strand → default step kind --------------------------------------------

const DEFAULT_KIND: Record<StepStrand, StepKind> = {
  warmup: 'drill',
  right_hand: 'drill',
  left_hand: 'drill',
  mezrab: 'drill',
  chords: 'drill',
  arpeggios: 'drill',
  scales: 'drill',
  exercise: 'exercise',
  rhythm: 'exercise',
  sight_reading: 'exercise',
  radif: 'piece',
  repertoire: 'piece',
  improvisation: 'drill',
  ornament: 'drill',
  piece: 'piece',
  phrasing: 'drill',
  fretboard: 'drill',
  practice_skills: 'reading',
  reading_theory: 'reading',
  technique: 'drill',
  other: 'drill',
};

// ===========================================================================
// Classical Guitar Shed
// ===========================================================================

const CGS_OUTLINE_NOTE = (code: string, area: string) =>
  `Work through the Classical Guitar Shed ${code} “${area}” lesson(s). Keep your attention on the current step; go slow.`;

function cgsOutline(code: string, strands: StepStrand[]): StepSeed[] {
  const label: Partial<Record<StepStrand, string>> = {
    chords: 'Chords',
    arpeggios: 'Arpeggios',
    scales: 'Scales',
    exercise: 'Exercises',
    rhythm: 'Rhythm study',
    sight_reading: 'Sight-reading',
    piece: 'Piece',
    phrasing: 'Phrasing',
    fretboard: 'Fretboard mastery',
    practice_skills: 'Practice skills',
    other: 'Other study',
  };
  return strands.map((s) => ({
    title: label[s] ?? s,
    strand: s,
    notes: CGS_OUTLINE_NOTE(code, label[s] ?? s),
  }));
}

const CGS_COMMON: StepStrand[] = ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'piece', 'other'];

const CGS: PathSeed = {
  id: 'cgs',
  instrumentKey: 'guitar',
  name: 'Classical Guitar Shed · The Woodshed',
  source: 'classicalguitarshed.com',
  description:
    'A step-by-step path to mastery. Follow it at your own pace — there’s no rush and no deadline. Trust the plan and put your attention on the practice itself.',
  stages: [
    {
      code: '1A',
      group: 'Level 1 · Foundations',
      title: 'Foundations of tone & reading',
      intro:
        'A relaxed setup, the right-hand “chunk”, finger-walking, your first 3-note chords, counting rhythm aloud, reading on the 1st string, and your first piece. Go slow and trust the process — it works.',
      steps: [
        { title: 'Warm-up & stretches', strand: 'warmup', kind: 'video', notes: 'Relax your whole body and face; take your time and be gentle. The goal is blood flow and loosening up — not a hard stretch. Don’t skip it, and don’t over-stretch (it’s not a contest).' },
        { title: 'Finger-walking', strand: 'right_hand', bpm: 60, notes: 'Steady tempo. Touch the strings and pause; keep the big knuckles over the strings; close from the big knuckle; keep the tip joints soft. Give extra time to your weakest fingers.' },
        { title: 'Contrast practice (right hand)', strand: 'right_hand', notes: 'Alternate firm vs. relaxed to feel the difference, and find the lightest touch that still speaks.' },
        { title: 'Chunks (right hand only)', strand: 'right_hand', notes: 'Wrist up; fingers touch each other; close the hand; pads (not tips) touch the palm.' },
        { title: 'Thumb-chunks (right hand only)', strand: 'right_hand', notes: 'The thumb plays from the wrist, not the tip joint.' },
        { title: '3-note chords', strand: 'chords', notes: 'Press just behind the frets; keep fingers curved with space in the hand; thumb behind the 2nd finger, straight, pressing on the meaty pad. Avoid locking the index knuckle to the neck.' },
        { title: '3-note chords with chunks', strand: 'chords', notes: 'Combine the chord shapes with the right-hand chunk.' },
        { title: 'Rhythm practice #1 (clap & count aloud)', strand: 'rhythm', kind: 'exercise', bpm: 80, notes: 'Clap and count aloud — out loud, not in your head — exercises A–D. Go slow; count with your voice.' },
        { title: 'Notes on the 1st string', strand: 'sight_reading', kind: 'video', notes: 'Learn the note names on the 1st string before the play-along.' },
        { title: 'Sight-reading practice #1 (play-along)', strand: 'sight_reading', kind: 'exercise', bpm: 70, notes: 'Play along with the video and keep going — don’t stop for missed notes. 80%+ correct is a success; if you hit 100%, go faster. Short and daily (3–5 min) beats long and occasional.' },
        { title: 'Piece — “The Forest Glade”', strand: 'piece', kind: 'piece', bpm: 60, notes: 'Break it into small sections. For each: clap & count the rhythm aloud; name the chords; play the right hand alone on open strings (count aloud); play the left hand alone (count aloud); then hands together. Join 1+2, then 2+3, then 3+4, then the whole piece. Go slow and trust the process.' },
        { title: 'Reading music — “How Notes Work” & “Musical Notation”', strand: 'reading_theory', kind: 'reading', notes: 'Watch “How Notes Work” and “Getting Started with Musical Notation”.' },
        { title: 'Technique primer — “What is Technique”', strand: 'technique', kind: 'reading', notes: 'Watch “What is Technique” to frame how you’ll practise everything else.' },
        { title: 'Checkpoint — ready for 1B', strand: 'practice_skills', kind: 'checkpoint', notes: 'When the 1A areas feel comfortable and “The Forest Glade” plays through slowly and steadily, you’re ready for 1B. Move on when it feels right, not by a deadline.' },
      ],
    },
    { code: '1B', group: 'Level 1 · Foundations', title: 'Arpeggios begin', steps: cgsOutline('1B', CGS_COMMON) },
    { code: '1C', group: 'Level 1 · Foundations', title: 'Chord changes & progressions', steps: cgsOutline('1C', CGS_COMMON) },
    { code: '1D', group: 'Level 1 · Foundations', title: 'Building the toolkit', steps: cgsOutline('1D', CGS_COMMON) },
    { code: '1E', group: 'Level 1 · Foundations', title: 'Steadier hands', steps: cgsOutline('1E', CGS_COMMON) },
    { code: '1F', group: 'Level 1 · Foundations', title: 'Consolidating Level 1', steps: cgsOutline('1F', CGS_COMMON) },
    { code: '2A', group: 'Level 2 · Coordination', title: 'Independence & flow', steps: cgsOutline('2A', CGS_COMMON) },
    { code: '2B', group: 'Level 2 · Coordination', title: 'Fuller textures', steps: cgsOutline('2B', CGS_COMMON) },
    { code: '2C', group: 'Level 2 · Coordination', title: 'Longer phrases', steps: cgsOutline('2C', CGS_COMMON) },
    { code: '2D', group: 'Level 2 · Coordination', title: 'Control & evenness', steps: cgsOutline('2D', CGS_COMMON) },
    { code: '2E', group: 'Level 2 · Coordination', title: 'Articulation & scales', steps: cgsOutline('2E', CGS_COMMON) },
    { code: '2F', group: 'Level 2 · Coordination', title: 'Consolidating Level 2', steps: cgsOutline('2F', CGS_COMMON) },
    { code: '3A', group: 'Level 3 · Musicianship', title: 'Phrasing enters', steps: cgsOutline('3A', ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other']) },
    { code: '3B', group: 'Level 3 · Musicianship', title: 'Fretboard mastery I', steps: cgsOutline('3B', ['chords', 'arpeggios', 'scales', 'fretboard', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other']) },
    { code: '3C', group: 'Level 3 · Musicianship', title: 'Fretboard mastery II', steps: cgsOutline('3C', ['chords', 'arpeggios', 'scales', 'fretboard', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other']) },
    { code: '3D', group: 'Level 3 · Musicianship', title: 'Refining practice skills', steps: cgsOutline('3D', ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'practice_skills']) },
    { code: '3E', group: 'Level 3 · Musicianship', title: 'Expressive control', steps: cgsOutline('3E', ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'practice_skills']) },
    { code: '3F', group: 'Level 3 · Musicianship', title: 'Consolidating Level 3', steps: cgsOutline('3F', ['chords', 'arpeggios', 'scales', 'exercise', 'rhythm', 'sight_reading', 'phrasing', 'piece', 'other']) },
  ],
  routines: [
    {
      name: 'Stage 1 routine · 20 min',
      stageCode: '1A',
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
      name: 'Stage 2 routine · 20 min',
      stageCode: '1A',
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
  ],
};

// ===========================================================================
// Setar · Radif & Repertoire
// ===========================================================================

/** The standing conscious-practice prompt for any gushe (kept generic — your
 *  teacher's account of each gushe is the authority; write it in the item's notes). */
const GUSHEH_ABOUT = (context: string) =>
  `A gushe of ${context}. Before playing, listen for: its shāhed (the note it circles), its ist (where phrases rest), and how it foruds back home. Hum the opening line first — know where it's headed before your hands move.`;

const gusheh = (names: string[], context = 'this dastgāh'): StepSeed[] =>
  names.map((n) => ({
    title: n,
    strand: 'radif' as StepStrand,
    kind: 'piece' as StepKind,
    about: GUSHEH_ABOUT(context),
  }));

const SETAR: PathSeed = {
  id: 'setar-radif',
  instrumentKey: 'setar',
  name: 'Setar · Radif & Repertoire',
  source: 'Radif of Mirzā Abdollāh + teacher repertoire',
  description:
    'A flexible map of Persian classical music for setar, organised by the dastgāh / āvāz system.',
  note:
    'Your setar lessons are teacher-driven and change with your needs — radif gusheh-hā one week, a qet‘e or pish-darāmad from a master the next. Treat this as a living map: reorder it, and add the gusheh and pieces your teacher gives you. There’s no fixed order to rush through.',
  stages: [
    {
      code: 'Setup',
      group: 'Foundations',
      title: 'Posture & hand position',
      intro: 'A relaxed, sustainable setup is the foundation of good tone and avoids tension.',
      steps: [
        { title: 'Sitting & holding the setar', strand: 'warmup', notes: 'Relaxed shoulders, balanced instrument, free right wrist.' },
        { title: 'Right-hand position (mezrāb finger)', strand: 'mezrab', notes: 'The setar is played with the nail of the index finger. Find a relaxed angle with an even tone on down (rāst) strokes.' },
        { title: 'Left-hand position & relaxation', strand: 'left_hand', notes: 'Light, curved fingers; thumb behind the neck; no squeezing.' },
      ],
    },
    {
      code: 'Mezrāb',
      group: 'Foundations',
      title: 'Right-hand technique (mezrāb)',
      intro: 'Even, clear strokes are the heart of setar tone.',
      steps: [
        { title: 'Rāst (down-stroke) on open strings', strand: 'mezrab', notes: 'Even tone, relaxed finger.' },
        { title: 'Chap (up-stroke)', strand: 'mezrab' },
        { title: 'Rāst–chap alternation', strand: 'mezrab', bpm: 60, notes: 'Aim for identical tone on both directions.' },
        { title: 'Riz (tremolo)', strand: 'mezrab', notes: 'Start slow and even; speed comes from relaxation, not force.' },
        { title: 'Dynamics & evenness', strand: 'mezrab', kind: 'drill', notes: 'Soft to loud while keeping evenness.' },
      ],
    },
    {
      code: 'Left hand',
      group: 'Foundations',
      title: 'Left hand, intonation & ornaments',
      steps: [
        { title: 'Finger placement & intonation', strand: 'left_hand' },
        { title: 'Position shifts (dast)', strand: 'left_hand' },
        { title: 'Tekiye & left-hand ornaments', strand: 'ornament' },
        { title: 'Tahrir-style ornaments', strand: 'ornament', kind: 'drill' },
      ],
    },
    {
      code: 'Shur',
      group: 'Dastgāh-e Shur & its āvāz-hā',
      title: 'Dastgāh-e Shur',
      intro:
        'Shur is the cornerstone of Persian music and usually where learners begin — inward, tender, and the mother of four āvāz-hā. Notice how nearly everything gravitates back to its shāhed.',
      steps: gusheh(['Darāmad-e Shur', 'Kereshmeh', 'Rohāb', 'Salmak', 'Golriz', 'Shahnāz', 'Qarche', 'Hosseini', 'Forud'], 'Shur'),
    },
    {
      code: 'Abu‘atā',
      group: 'Dastgāh-e Shur & its āvāz-hā',
      title: 'Āvāz-e Abu‘atā',
      intro: 'An āvāz of Shur with a plaintive, folk-tinged colour. Hear how it leans on Shur and returns to it.',
      steps: gusheh(['Darāmad', 'Sayakhi', 'Hejāz', 'Chāhārbāgh', 'Forud'], 'Abu‘atā'),
    },
    {
      code: 'Bayāt-e Tork',
      group: 'Dastgāh-e Shur & its āvāz-hā',
      title: 'Āvāz-e Bayāt-e Tork',
      intro: 'An āvāz of Shur with a brighter, open character — often heard in devotional singing.',
      steps: gusheh(['Darāmad', 'Dogāh', 'Mehrabāni', 'Qatār', 'Forud'], 'Bayāt-e Tork'),
    },
    {
      code: 'Afshārī',
      group: 'Dastgāh-e Shur & its āvāz-hā',
      title: 'Āvāz-e Afshārī',
      intro:
        'An āvāz of Shur — searching and bittersweet, with a characteristic wandering quality. Its forud back to Shur is the moment to listen for.',
      steps: gusheh(['Darāmad', 'Jāmedarān', 'Iraq', 'Forud'], 'Afshārī'),
    },
    {
      code: 'Dashtī',
      group: 'Dastgāh-e Shur & its āvāz-hā',
      title: 'Āvāz-e Dashtī',
      intro: 'An āvāz of Shur, lyrical and melancholic — the voice of many folk melodies. Its shāhed famously wavers.',
      steps: gusheh(['Darāmad', 'Gilaki', 'Bayāt-e Rājeh', 'Forud'], 'Dashtī'),
    },
    {
      code: 'Homāyun',
      group: 'The other dastgāh-hā',
      title: 'Dastgāh-e Homāyun',
      intro: 'Majestic and grieving at once. Listen for its distinctive opening leap and the pull of Bidād.',
      steps: gusheh(['Darāmad-e Homāyun', 'Chakāvak', 'Bidād', 'Ney-Dāvud', 'Forud'], 'Homāyun'),
    },
    {
      code: 'Esfahān',
      group: 'The other dastgāh-hā',
      title: 'Āvāz-e Bayāt-e Esfahān',
      intro: 'An āvāz of Homāyun — romantic and warm, close to a Western harmonic-minor colour.',
      steps: gusheh(['Darāmad', 'Jāmedarān', 'Bayāt-e Rājeh', 'Forud'], 'Bayāt-e Esfahān'),
    },
    {
      code: 'Segāh',
      group: 'The other dastgāh-hā',
      title: 'Dastgāh-e Segāh',
      intro: 'Plaintive and pleading, built around its quarter-tone shāhed. Mokhālef is its emotional peak — notice the shift of register.',
      steps: gusheh(['Darāmad-e Segāh', 'Zābol', 'Mokhālef', 'Maqlub', 'Forud'], 'Segāh'),
    },
    {
      code: 'Chahārgāh',
      group: 'The other dastgāh-hā',
      title: 'Dastgāh-e Chahārgāh',
      intro: 'Bright, heroic, celebratory — often compared to sunrise. Feel the symmetry of its tetrachords around the shāhed.',
      steps: gusheh(['Darāmad-e Chahārgāh', 'Zābol', 'Mokhālef', 'Mansuri', 'Forud'], 'Chahārgāh'),
    },
    {
      code: 'Māhur',
      group: 'The other dastgāh-hā',
      title: 'Dastgāh-e Māhur',
      intro: 'Open and joyful — the closest to the Western major scale. Delkash is the famous turn: hear it borrow the colour of Shur.',
      steps: gusheh(['Darāmad-e Māhur', 'Dād', 'Khosravāni', 'Delkash', 'Forud'], 'Māhur'),
    },
    {
      code: 'Navā',
      group: 'The other dastgāh-hā',
      title: 'Dastgāh-e Navā',
      intro: 'Calm, meditative, balanced — often kept for late night. Related to Shur; notice the more settled centre.',
      steps: gusheh(['Darāmad-e Navā', 'Gardāniyeh', 'Nahoft', 'Forud'], 'Navā'),
    },
    {
      code: 'Rāst-Panjgāh',
      group: 'The other dastgāh-hā',
      title: 'Dastgāh-e Rāst-Panjgāh',
      intro: 'The rarest dastgāh — stately, wide-ranging, a favourite for modulation between modes.',
      steps: gusheh(['Darāmad-e Rāst-Panjgāh', 'Parvāneh', 'Qarache', 'Forud'], 'Rāst-Panjgāh'),
    },
    {
      code: 'Forms',
      group: 'Composed forms & repertoire',
      title: 'Composed forms & improvisation',
      intro: 'The repertoire your teacher gives you from different masters lives here.',
      steps: [
        { title: 'Pish-darāmad', strand: 'repertoire' },
        { title: 'Chahār-mezrāb', strand: 'repertoire', notes: 'Rhythmic showpiece — great for right-hand control.' },
        { title: 'Qet‘e (composed pieces)', strand: 'repertoire' },
        { title: 'Tasnif (songs)', strand: 'repertoire' },
        { title: 'Reng (dance pieces)', strand: 'repertoire' },
        { title: 'Bedāhe-navāzi (improvisation)', strand: 'improvisation', notes: 'Improvise within a dastgāh you know well.' },
      ],
    },
  ],
};

// ===========================================================================
// Tar · Honarestān method (Khonyagar.com)
// ===========================================================================

const TAR: PathSeed = {
  id: 'tar-honarestan',
  instrumentKey: 'tar',
  name: 'Tar · Honarestān method',
  source: 'Honarestān books · via Khonyagar.com',
  description:
    'The classic two-book Honarestān (Tehran Conservatory) curriculum for tar — in Western notation, progressing from basics to dastgāh-based pieces.',
  note:
    'Following Khonyagar.com, which teaches the Honarestān method. This is a scaffold of the two books — add or rename the exact lessons, exercises and pieces as you cover them with the platform.',
  stages: [
    {
      code: 'Setup',
      group: 'Book 1 · Ketāb-e Avval',
      title: 'Holding the tar & mezrāb',
      steps: [
        { title: 'Posture & holding the tar', strand: 'warmup' },
        { title: 'Holding the mezrāb (plectrum)', strand: 'mezrab', notes: 'Relaxed grip; the stroke comes from the wrist.' },
      ],
    },
    {
      code: 'RH basics',
      group: 'Book 1 · Ketāb-e Avval',
      title: 'Right-hand mezrāb on open strings',
      steps: [
        { title: 'Rāst (down) on open strings', strand: 'mezrab' },
        { title: 'Chap (up)', strand: 'mezrab' },
        { title: 'Rāst–chap alternation', strand: 'mezrab', bpm: 60 },
      ],
    },
    {
      code: 'Reading',
      group: 'Book 1 · Ketāb-e Avval',
      title: 'First notes & reading',
      steps: [
        { title: 'Note reading (Western staff)', strand: 'reading_theory', kind: 'reading', notes: 'The Honarestān books use Western notation.' },
        { title: 'First-position notes', strand: 'sight_reading' },
        { title: 'Simple note exercises', strand: 'exercise' },
      ],
    },
    {
      code: 'Exercises 1',
      group: 'Book 1 · Ketāb-e Avval',
      title: 'Beginning exercises',
      steps: [
        { title: 'Beginning technical exercises', strand: 'exercise' },
        { title: 'Basic rhythm & meter', strand: 'rhythm' },
      ],
    },
    {
      code: 'Pieces 1',
      group: 'Book 1 · Ketāb-e Avval',
      title: 'First short pieces (qet‘e)',
      steps: [
        { title: 'First short pieces in Māhur', strand: 'repertoire' },
        { title: 'First short pieces in Shur', strand: 'repertoire' },
      ],
    },
    {
      code: 'Positions',
      group: 'Book 2 · Ketāb-e Dovvom',
      title: 'Higher positions & shifts',
      steps: [
        { title: 'Higher positions', strand: 'left_hand' },
        { title: 'Position shifts', strand: 'left_hand' },
      ],
    },
    {
      code: 'Chahār-mezrāb',
      group: 'Book 2 · Ketāb-e Dovvom',
      title: 'Chahār-mezrāb studies',
      steps: [{ title: 'Chahār-mezrāb (rhythmic studies)', strand: 'repertoire', notes: 'Builds right-hand stamina and evenness.' }],
    },
    {
      code: 'Dastgāh pieces',
      group: 'Book 2 · Ketāb-e Dovvom',
      title: 'Pieces in the dastgāh-hā',
      steps: gusheh(['Pieces in Shur', 'Pieces in Māhur', 'Pieces in Segāh', 'Pieces in Chahārgāh', 'Pieces in Homāyun']).map((s) => ({ ...s, strand: 'repertoire' })),
    },
    {
      code: 'Reng & Tasnif',
      group: 'Book 2 · Ketāb-e Dovvom',
      title: 'Dance pieces & songs',
      steps: [
        { title: 'Reng (dance pieces)', strand: 'repertoire' },
        { title: 'Tasnif (songs)', strand: 'repertoire' },
      ],
    },
    {
      code: 'Radif intro',
      group: 'Book 2 · Ketāb-e Dovvom',
      title: 'Introduction to the radif',
      steps: [{ title: 'First radif gusheh-hā', strand: 'radif', notes: 'A bridge towards studying the radif itself.' }],
    },
  ],
};

// --- Expansion --------------------------------------------------------------
//
// Pathways/stages/routines are seeded as editable DATA. The per-stage entries
// become a code-defined CATALOG of suggestions (not persisted) that the user
// turns into real items — this is how the pathway connects to items.

export interface SeededPathways {
  pathways: Pathway[];
  pathwayStages: PathwayStage[];
  pathwayRoutines: PathwayRoutine[];
}

const ALL_SEEDS: { seed: PathSeed; key: 'guitar' | 'setar' | 'tar'; order: number }[] = [
  { seed: SETAR, key: 'setar', order: 0 },
  { seed: TAR, key: 'tar', order: 1 },
  { seed: CGS, key: 'guitar', order: 2 },
];

export function stageIdFor(pathwayId: string, code: string): string {
  return `${pathwayId}-${slug(code)}`;
}

function expand(seed: PathSeed, instrumentId: ID, pathOrder: number, now: Date): SeededPathways {
  const ts = nowISO(now);
  const pathway: Pathway = {
    id: seed.id,
    instrumentId,
    name: seed.name,
    source: seed.source,
    description: seed.description,
    note: seed.note,
    order: pathOrder,
    createdAt: ts,
    updatedAt: ts,
  };
  const stages: PathwayStage[] = seed.stages.map((st, si) => ({
    id: stageIdFor(seed.id, st.code),
    pathwayId: seed.id,
    code: st.code,
    title: st.title,
    group: st.group,
    intro: st.intro,
    order: si,
    createdAt: ts,
    updatedAt: ts,
  }));
  const routines: PathwayRoutine[] = (seed.routines ?? []).map((r, ri) => ({
    id: `${seed.id}-routine-${slug(r.name)}`,
    pathwayId: seed.id,
    stageId: r.stageCode ? stageIdFor(seed.id, r.stageCode) : undefined,
    name: r.name,
    segments: r.segments,
    order: ri,
    createdAt: ts,
    updatedAt: ts,
  }));
  return { pathways: [pathway], pathwayStages: stages, pathwayRoutines: routines };
}

/** Build all seeded pathways for the given instrument ids. */
export function seedPathways(
  instrumentIds: { guitar: ID; setar: ID; tar: ID },
  now: Date = new Date(),
): SeededPathways {
  const parts = ALL_SEEDS.map(({ seed, key, order }) => expand(seed, instrumentIds[key], order, now));
  return {
    pathways: parts.flatMap((p) => p.pathways),
    pathwayStages: parts.flatMap((p) => p.pathwayStages),
    pathwayRoutines: parts.flatMap((p) => p.pathwayRoutines),
  };
}

// --- Catalog (reference suggestions per stage) ------------------------------

let catalogCache: Record<string, CatalogEntry[]> | null = null;

function buildCatalog(): Record<string, CatalogEntry[]> {
  const map: Record<string, CatalogEntry[]> = {};
  for (const { seed } of ALL_SEEDS) {
    for (const st of seed.stages) {
      const stageId = stageIdFor(seed.id, st.code);
      map[stageId] = st.steps.map((sp) => ({
        key: slug(sp.title),
        stageId,
        title: sp.title,
        strand: sp.strand,
        kind: sp.kind ?? DEFAULT_KIND[sp.strand] ?? 'drill',
        about: sp.about,
        notes: sp.notes,
        targetBpm: sp.bpm,
        persian: sp.persian,
        guitar: sp.guitar,
      }));
    }
  }
  return map;
}

export function getCatalog(): Record<string, CatalogEntry[]> {
  if (!catalogCache) catalogCache = buildCatalog();
  return catalogCache;
}

export function catalogForStage(stageId: string): CatalogEntry[] {
  return getCatalog()[stageId] ?? [];
}

export const SEED_PATHWAY_IDS = { guitar: CGS.id, setar: SETAR.id, tar: TAR.id };
