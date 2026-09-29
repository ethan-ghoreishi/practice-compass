import type {
  CatalogEntry,
  GuitarFields,
  ID,
  Instrument,
  Pathway,
  PathwayRoutine,
  PathwayStage,
  PersianFields,
  PracticeDB,
  RoutineSegment,
  StepKind,
  StepStrand,
} from './types';
import { CGS_COURSE } from './courseData';
import { normalizePersian } from './farsi';
import { catalogReferenceId, courseStageSeeds, type CourseStageSeed } from './courseSeed';
import { KHONYAGAR_COURSE, KHONYAGAR_PATHWAY } from './khonyagarData';
import { MIRZA_ABDOLLAH_RADIF, type RadifDastgah } from './referenceCatalog';
import { nowISO } from './util';

// ---------------------------------------------------------------------------
// Seeded default pathways. All of this becomes ordinary editable data in the
// store — the user can rename, reorder, add to, or delete any of it.
//
//  • Guitar  → Classical Guitar Shed "Woodshed" (1A hand-authored from the
//              syllabus; every other level read straight out of the course's
//              own tree — see `courseSeed.ts`).
//  • Setar   → a flexible radif/repertoire map (dastgāh → āvāz → gusheh), since
//              setar lessons are teacher-driven and change with need.
//  • Tar     → the Honarestān two-book method (as taught on Khonyagar.com),
//              and beside it the Khonyagar course itself, read straight out of
//              its own folder — see `khonyagarData.ts`.
//
// The Persian paths are honest, well-grounded *starting points* for inspiration,
// explicitly meant to be edited — not a fixed syllabus.
// ---------------------------------------------------------------------------

interface StepSeed {
  title: string;
  /** STABLE ascii catalog key. Defaults to slug(title) for English seeds; the
   *  Farsi seeds set it explicitly so keys never change when titles do. */
  key?: string;
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
  /** STABLE ascii id part. Defaults to slug(code); Farsi seeds set it so the
   *  stage id stays identical even though the displayed code is now Farsi. */
  slug?: string;
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

// LEVELS 1B ONWARDS COME FROM THE COURSE'S OWN PUBLISHED STRUCTURE.
//
// They used to be eight generic placeholders per level from a `cgsOutline()`
// helper — "Chords", "Arpeggios", "Piece" — each with one boilerplate sentence.
// They are now the level's real sections, read out of the course tree by
// `scripts/scan-cgs-course.mjs` into `courseData.ts`. Every catalogue key those
// placeholders produced is PRESERVED by the real section that replaces it
// (`chords`, `arpeggios`, `scales`, `exercises`, `rhythm-study`,
// `sight-reading`, `piece`, `other-study`, `phrasing`, `fretboard-mastery`,
// `practice-skills`), so an item the owner already added stays attached to its
// suggestion. Keys are ADDED, never renamed.
//
// Level 1A keeps its fourteen hand-authored steps exactly as they are.
const CGS_HAND_AUTHORED_LEVELS = ['1a'];

/** A course's generated stage seeds, in the shape this file expands. */
const fromCourse = (seeds: CourseStageSeed[]): StageSeed[] => seeds.map((s) => ({
  code: s.code,
  slug: s.slug,
  title: s.title,
  group: s.group,
  intro: s.intro,
  steps: s.steps.map((st) => ({
    key: st.key,
    title: st.title,
    strand: st.strand,
    kind: st.kind,
    notes: st.notes,
    about: st.about,
    bpm: st.bpm,
  })),
}));

const cgsCourseStages: StageSeed[] = fromCourse(courseStageSeeds(CGS_COURSE, CGS_HAND_AUTHORED_LEVELS));

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
    ...cgsCourseStages,
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

/** The standing conscious-practice prompt for any gushe (kept generic — the
 *  teacher's account of each gushe is the authority; write it in the item's notes). */
const GUSHEH_ABOUT = (context: string) =>
  `گوشه‌ای از ${context}. پیش از نواختن، گوش بسپار به: شاهد (نتی که ملودی حول آن می‌گردد)، ایست (جایی که عبارت‌ها می‌آسایند) و شیوهٔ فرود آن به خانه. اول خط آغازین را زمزمه کن — پیش از آنکه دست‌ها حرکت کنند، بدان به کجا می‌رود.`;

/**
 * One dastgāh of the SHARED Persian reference (`referenceCatalog.ts`) as a
 * stage. Every pathway that presents it — the Setar pathway's own modal stages
 * and both named reference pathways — gets the same keys, so the same
 * references: a gusheh added in one is ADDED in the others on that instrument.
 * Each gusheh arrives classified by its dastgāh term and named as a gusheh,
 * which the factory used to leave empty.
 */
const radifStage = (d: RadifDastgah): StageSeed => ({
  code: d.code,
  slug: d.slug,
  group: d.group,
  title: d.title,
  intro: d.intro,
  steps: d.gushehs.map(([title, key]) => ({
    title,
    key,
    strand: 'radif' as StepStrand,
    kind: 'piece' as StepKind,
    about: GUSHEH_ABOUT(d.context),
    persian: { dastgahAvaz: { termId: d.termId }, gusheh: title },
  })),
});

const RADIF_STAGES: StageSeed[] = MIRZA_ABDOLLAH_RADIF.dastgahs.map(radifStage);

const SETAR: PathSeed = {
  id: 'setar-radif',
  instrumentKey: 'setar',
  name: 'سه‌تار · ردیف و رپرتوار',
  source: 'ردیف میرزا عبدالله + رپرتوار استاد',
  description:
    'نقشه‌ای انعطاف‌پذیر از موسیقی کلاسیک ایرانی برای سه‌تار، بر پایهٔ نظام دستگاه و آواز.',
  note:
    'درس‌های سه‌تار تو استادمحور است و با نیازت تغییر می‌کند — یک هفته گوشه‌های ردیف، هفتهٔ بعد قطعه یا پیش‌درآمدی از یک استاد. این را نقشه‌ای زنده بدان: ترتیبش را عوض کن و گوشه‌ها و قطعه‌هایی را که استادت می‌دهد بیفزای. ترتیب ثابتی برای عجله کردن نیست.',
  stages: [
    {
      code: 'نشست',
      slug: 'setup',
      group: 'مبانی',
      title: 'نشستن و وضعیت دست‌ها',
      intro: 'نشستِ آسوده و پایدار، بنیانِ صدای خوب است و از تنش جلوگیری می‌کند.',
      steps: [
        { title: 'نشستن و در دست گرفتن سه‌تار', key: 'sitting-holding-the-setar', strand: 'warmup', notes: 'شانه‌های رها، سازِ متعادل، مچِ راستِ آزاد.' },
        { title: 'وضعیت دست راست (انگشت مضراب)', key: 'right-hand-position-mezrab-finger', strand: 'mezrab', notes: 'سه‌تار با ناخنِ انگشت اشاره نواخته می‌شود. زاویه‌ای آسوده با صدایی یکدست در مضرابِ راست (پایین) بیاب.' },
        { title: 'وضعیت و رهایی دست چپ', key: 'left-hand-position-relaxation', strand: 'left_hand', notes: 'انگشتانِ سبک و خمیده؛ شست پشتِ دسته؛ بدون فشار.' },
      ],
    },
    {
      code: 'مضراب',
      slug: 'mezrab',
      group: 'مبانی',
      title: 'تکنیک دست راست (مضراب)',
      intro: 'مضراب‌های یکدست و روشن، قلبِ صدای سه‌تار است.',
      steps: [
        { title: 'راست (مضرابِ پایین) روی سیمِ باز', key: 'rast-down-stroke-on-open-strings', strand: 'mezrab', notes: 'صدای یکدست، انگشتِ رها.' },
        { title: 'چپ (مضرابِ بالا)', key: 'chap-up-stroke', strand: 'mezrab' },
        { title: 'تناوبِ راست–چپ', key: 'rast-chap-alternation', strand: 'mezrab', bpm: 60, notes: 'صدای یکسان در هر دو جهت را هدف بگیر.' },
        { title: 'ریز (تِرِمولو)', key: 'riz-tremolo', strand: 'mezrab', notes: 'آهسته و یکدست آغاز کن؛ سرعت از رهایی می‌آید، نه از زور.' },
        { title: 'دینامیک و یکدستی', key: 'dynamics-evenness', strand: 'mezrab', kind: 'drill', notes: 'از آرام به بلند، با حفظِ یکدستی.' },
      ],
    },
    {
      code: 'دست چپ',
      slug: 'left-hand',
      group: 'مبانی',
      title: 'دست چپ، کوک و زینت‌ها',
      steps: [
        { title: 'انگشت‌گذاری و کوک', key: 'finger-placement-intonation', strand: 'left_hand' },
        { title: 'تغییر دست (پوزیسیون)', key: 'position-shifts-dast', strand: 'left_hand' },
        { title: 'تکیه و زینت‌های دست چپ', key: 'tekiye-left-hand-ornaments', strand: 'ornament' },
        { title: 'زینت‌های تحریرگونه', key: 'tahrir-style-ornaments', strand: 'ornament', kind: 'drill' },
      ],
    },
    ...RADIF_STAGES,
    {
      code: 'فرم‌ها',
      slug: 'forms',
      group: 'فرم‌های ساخته‌شده و رپرتوار',
      title: 'فرم‌های ساخته‌شده و بداهه',
      intro: 'رپرتواری که استادت از استادانِ گوناگون به تو می‌دهد اینجا جای می‌گیرد.',
      steps: [
        { title: 'پیش‌درآمد', key: 'pish-daramad', strand: 'repertoire' },
        { title: 'چهارمضراب', key: 'chahar-mezrab', strand: 'repertoire', notes: 'نمایشِ ریتمیک — عالی برای کنترلِ دست راست.' },
        { title: 'قطعه (قطعه‌های ساخته‌شده)', key: 'qet-e-composed-pieces', strand: 'repertoire' },
        { title: 'تصنیف (آوازها)', key: 'tasnif-songs', strand: 'repertoire' },
        { title: 'رِنگ (قطعه‌های رقص)', key: 'reng-dance-pieces', strand: 'repertoire' },
        { title: 'بداهه‌نوازی', key: 'bedahe-navazi-improvisation', strand: 'improvisation', notes: 'در دستگاهی که خوب می‌شناسی بداهه بنواز.' },
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
  name: 'تار · روش هنرستان',
  source: 'کتاب‌های هنرستان · از طریق خنیاگر',
  description:
    'برنامهٔ کلاسیکِ دو‌جلدیِ هنرستان (هنرستان موسیقی تهران) برای تار — با نت‌نویسیِ غربی، از مبانی تا قطعه‌های دستگاهی.',
  note:
    'برگرفته از خنیاگر که روش هنرستان را آموزش می‌دهد. این چارچوبی از دو کتاب است — درس‌ها، تمرین‌ها و قطعه‌های دقیق را همان‌طور که در پلتفرم پیش می‌روی بیفزای یا نامشان را عوض کن.',
  stages: [
    {
      code: 'نشست',
      slug: 'setup',
      group: 'کتاب اول هنرستان',
      title: 'در دست گرفتن تار و مضراب',
      steps: [
        { title: 'نشست و در دست گرفتن تار', key: 'posture-holding-the-tar', strand: 'warmup' },
        { title: 'در دست گرفتن مضراب', key: 'holding-the-mezrab-plectrum', strand: 'mezrab', notes: 'گرفتنِ رها؛ مضراب از مچ می‌آید.' },
      ],
    },
    {
      code: 'مبانی دست راست',
      slug: 'rh-basics',
      group: 'کتاب اول هنرستان',
      title: 'مضرابِ دست راست روی سیم‌های باز',
      steps: [
        { title: 'راست (پایین) روی سیم‌های باز', key: 'rast-down-on-open-strings', strand: 'mezrab' },
        { title: 'چپ (بالا)', key: 'chap-up', strand: 'mezrab' },
        { title: 'تناوبِ راست–چپ', key: 'rast-chap-alternation', strand: 'mezrab', bpm: 60 },
      ],
    },
    {
      code: 'نت‌خوانی',
      slug: 'reading',
      group: 'کتاب اول هنرستان',
      title: 'نت‌های نخست و نت‌خوانی',
      steps: [
        { title: 'نت‌خوانی (خطِ حاملِ غربی)', key: 'note-reading-western-staff', strand: 'reading_theory', kind: 'reading', notes: 'کتاب‌های هنرستان از نت‌نویسیِ غربی استفاده می‌کنند.' },
        { title: 'نت‌های پوزیسیونِ اول', key: 'first-position-notes', strand: 'sight_reading' },
        { title: 'تمرین‌های سادهٔ نت', key: 'simple-note-exercises', strand: 'exercise' },
      ],
    },
    {
      code: 'تمرین‌ها ۱',
      slug: 'exercises-1',
      group: 'کتاب اول هنرستان',
      title: 'تمرین‌های آغازین',
      steps: [
        { title: 'تمرین‌های تکنیکیِ آغازین', key: 'beginning-technical-exercises', strand: 'exercise' },
        { title: 'ریتم و وزنِ پایه', key: 'basic-rhythm-meter', strand: 'rhythm' },
      ],
    },
    {
      code: 'قطعه‌ها ۱',
      slug: 'pieces-1',
      group: 'کتاب اول هنرستان',
      title: 'نخستین قطعه‌های کوتاه',
      steps: [
        { title: 'نخستین قطعه‌های کوتاه در ماهور', key: 'first-short-pieces-in-mahur', strand: 'repertoire' },
        { title: 'نخستین قطعه‌های کوتاه در شور', key: 'first-short-pieces-in-shur', strand: 'repertoire' },
      ],
    },
    {
      code: 'پوزیسیون‌ها',
      slug: 'positions',
      group: 'کتاب دوم هنرستان',
      title: 'پوزیسیون‌های بالاتر و تغییر دست',
      steps: [
        { title: 'پوزیسیون‌های بالاتر', key: 'higher-positions', strand: 'left_hand' },
        { title: 'تغییر پوزیسیون', key: 'position-shifts', strand: 'left_hand' },
      ],
    },
    {
      code: 'چهارمضراب',
      slug: 'chahar-mezrab',
      group: 'کتاب دوم هنرستان',
      title: 'چهارمضرابِ تمرینی',
      steps: [{ title: 'چهارمضراب (تمرین‌های ریتمیک)', key: 'chahar-mezrab-rhythmic-studies', strand: 'repertoire', notes: 'استقامت و یکدستیِ دست راست را می‌سازد.' }],
    },
    {
      code: 'قطعه‌های دستگاهی',
      slug: 'dastgah-pieces',
      group: 'کتاب دوم هنرستان',
      title: 'قطعه‌ها در دستگاه‌ها',
      steps: [
        { title: 'قطعه‌هایی در شور', key: 'pieces-in-shur', strand: 'repertoire' },
        { title: 'قطعه‌هایی در ماهور', key: 'pieces-in-mahur', strand: 'repertoire' },
        { title: 'قطعه‌هایی در سه‌گاه', key: 'pieces-in-segah', strand: 'repertoire' },
        { title: 'قطعه‌هایی در چهارگاه', key: 'pieces-in-chahargah', strand: 'repertoire' },
        { title: 'قطعه‌هایی در همایون', key: 'pieces-in-homayun', strand: 'repertoire' },
      ],
    },
    {
      code: 'رِنگ و تصنیف',
      slug: 'reng-tasnif',
      group: 'کتاب دوم هنرستان',
      title: 'قطعه‌های رقص و آوازها',
      steps: [
        { title: 'رِنگ (قطعه‌های رقص)', key: 'reng-dance-pieces', strand: 'repertoire' },
        { title: 'تصنیف (آوازها)', key: 'tasnif-songs', strand: 'repertoire' },
      ],
    },
    {
      code: 'آشنایی با ردیف',
      slug: 'radif-intro',
      group: 'کتاب دوم هنرستان',
      title: 'آشنایی با ردیف',
      steps: [{ title: 'نخستین گوشه‌های ردیف', key: 'first-radif-gusheh-ha', strand: 'radif', notes: 'پلی به‌سوی مطالعهٔ خودِ ردیف.' }],
    },
  ],
};

// ===========================================================================
// Tar · Khonyagar (آزاد میرزاپور) — the course itself
// ===========================================================================
//
// A second Tar pathway BESIDE `tar-honarestan`, which stays exactly as it is.
// Every stage, section and work comes from the course's own folder
// (`scripts/scan-khonyagar-course.mjs`); the note carries the course's own
// daily template and Quick Win, quoted as written. It ships no routine: the
// guide asks for block-shaped days around the current lesson, not a tour of a
// stage's sections.
const KHONYAGAR: PathSeed = {
  id: KHONYAGAR_COURSE.pathwayId,
  instrumentKey: 'tar',
  name: KHONYAGAR_PATHWAY.name,
  source: KHONYAGAR_COURSE.sourceName,
  description: KHONYAGAR_PATHWAY.description,
  note: KHONYAGAR_PATHWAY.note,
  stages: fromCourse(courseStageSeeds(KHONYAGAR_COURSE)),
};

// ===========================================================================
// Setar and Tar · ردیف میرزا عبدالله — one shared reference, two instruments
// ===========================================================================
//
// Two INDEPENDENT pathway instances of the same reference: the same stages and
// the same references, never the same items — Setar's practice evidence stays
// Setar's. Deliberately no foundations stage and no Forms stage: technique
// stays in ordinary items and routines, and Forms is a LENS in My repertoire
// over real works, never a pathway of generic «چهارمضراب» items.
const radifNote = (instrument: string) =>
  `گزیده‌ای ناقص از گوشه‌های ردیف میرزا عبدالله برای ${instrument} — نه همهٔ ردیف و نه ترتیبی قطعی؛ روایتِ استادت مرجع است. هر گوشه با دستگاهش افزوده می‌شود.`;

const SETAR_RADIF_MIRZA: PathSeed = {
  id: 'setar-radif-mirza',
  instrumentKey: 'setar',
  name: 'سه‌تار · ردیف میرزا عبدالله',
  source: `${MIRZA_ABDOLLAH_RADIF.name} (گزیده)`,
  description: radifNote('سه‌تار'),
  note:
    'گوشه‌هایی که پیش‌تر در «سه‌تار · ردیف و رپرتوار» افزوده‌ای اینجا هم افزوده دیده می‌شوند — چیزی دوباره ساخته نمی‌شود. هر وقت مسیر قدیمی را نخواستی، از صفحهٔ همان مسیر «بایگانی» را بزن: پنهان می‌شود و هیچ آیتمی از دست نمی‌رود.',
  stages: RADIF_STAGES,
};

const TAR_RADIF_MIRZA: PathSeed = {
  id: 'tar-radif-mirza',
  instrumentKey: 'tar',
  name: 'تار · ردیف میرزا عبدالله',
  source: `${MIRZA_ABDOLLAH_RADIF.name} (گزیده)`,
  description: radifNote('تار'),
  note: 'همان گزیدهٔ سه‌تار، با تمرین و پیشرفتِ جداگانه برای تار. روش هنرستان و دورهٔ خنیاگر همان‌طور که بودند می‌مانند.',
  stages: RADIF_STAGES,
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

type SeedRow = { seed: PathSeed; key: 'guitar' | 'setar' | 'tar'; order: number };

/**
 * What `seedPathways` has always produced — for a pre-v3 database's legacy
 * seed and every caller that relies on it. Unchanged by the reference work.
 */
const LEGACY_SEEDS: SeedRow[] = [
  { seed: SETAR, key: 'setar', order: 0 },
  { seed: TAR, key: 'tar', order: 1 },
  { seed: CGS, key: 'guitar', order: 2 },
  // Appended, so no existing pathway's order moves.
  { seed: KHONYAGAR, key: 'tar', order: 3 },
];

/** Every default this build ships — what "Add default pathway" can offer. */
const ALL_SEEDS: SeedRow[] = [
  ...LEGACY_SEEDS,
  { seed: SETAR_RADIF_MIRZA, key: 'setar', order: 4 },
  { seed: TAR_RADIF_MIRZA, key: 'tar', order: 5 },
];

/**
 * A NEW installation's defaults: Setar starts on the named reference pathway
 * instead of the mixed one; Tar keeps Honarestān and Khonyagar. Everything not
 * seeded here stays OFFERED by name, never added on its own.
 */
const INSTALL_SEEDS: SeedRow[] = [
  { seed: SETAR_RADIF_MIRZA, key: 'setar', order: 0 },
  { seed: TAR, key: 'tar', order: 1 },
  { seed: CGS, key: 'guitar', order: 2 },
  { seed: KHONYAGAR, key: 'tar', order: 3 },
];

/**
 * The fixed timestamp a PRE-v3 database's legacy seed is stamped with. The
 * migration chain may read no clock — two devices migrating the same old file
 * on different days must produce identical bytes — and this is the date the
 * first build (which shipped v2) was committed.
 */
export const LEGACY_SEED_TIME = new Date('2026-06-30T00:00:00.000Z');

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
    id: stageIdFor(seed.id, st.slug ?? st.code),
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

function expandAll(rows: SeedRow[], instrumentIds: { guitar: ID; setar: ID; tar: ID }, now: Date): SeededPathways {
  const parts = rows.map(({ seed, key, order }) => expand(seed, instrumentIds[key], order, now));
  return {
    pathways: parts.flatMap((p) => p.pathways),
    pathwayStages: parts.flatMap((p) => p.pathwayStages),
    pathwayRoutines: parts.flatMap((p) => p.pathwayRoutines),
  };
}

/** The legacy seeded pathways for the given instrument ids (see `LEGACY_SEEDS`). */
export function seedPathways(
  instrumentIds: { guitar: ID; setar: ID; tar: ID },
  now: Date = new Date(),
): SeededPathways {
  return expandAll(LEGACY_SEEDS, instrumentIds, now);
}

/** A new installation's default pathways (see `INSTALL_SEEDS`). */
export function installSeedPathways(instrumentIds: { guitar: ID; setar: ID; tar: ID }, now: Date): SeededPathways {
  return expandAll(INSTALL_SEEDS, instrumentIds, now);
}

// --- Adding a missing default pathway to an existing database ----------------
//
// A default pathway shipped after a database was created (the Khonyagar course)
// is absent in exactly the same way as one the owner deliberately DELETED, so
// neither is ever added on its own: each is OFFERED by name and only the one
// tapped is added — the `offeredCourseLevels`/`planCourseLevels` shape, one
// level up. Whole pathways only: nothing here adds a stage to a pathway that
// already exists.

// One classification. «سه‌تار» and «گیتار» both contain «تار», so a name the
// Setar or Guitar rule recognises is never Tar. «گیتار» is matched after
// `normalizePersian`, so a legacy keyboard's Arabic yeh («گيتار») is Guitar too.
const isGuitar = (name: string) => /guitar/i.test(name) || normalizePersian(name).includes('گیتار');
const isSetar = (name: string) => /setar/i.test(name) || name.includes('سه');
const isTar = (name: string) =>
  (/^tar$/i.test(name.trim()) || name.includes('تار')) && !isSetar(name) && !isGuitar(name);

/**
 * Which of this device's instruments each seed belongs to, by name — the ONE
 * rule, shared by `migrateToV3`. An instrument that matches nothing yields ''
 * — see `offeredDefaultPathways`.
 */
export function seedInstrumentIds(instruments: Instrument[]): { guitar: ID; setar: ID; tar: ID } {
  const idOf = (is: (name: string) => boolean) => instruments.find((i) => is(i.name))?.id ?? '';
  return { guitar: idOf(isGuitar), setar: idOf(isSetar), tar: idOf(isTar) };
}

type PathwayCollections = Pick<PracticeDB, 'pathways' | 'pathwayStages' | 'pathwayRoutines'>;

function missingDefaults(db: Pick<PracticeDB, 'instruments' | 'pathways'>, now: Date) {
  const seeded = expandAll(ALL_SEEDS, seedInstrumentIds(db.instruments), now);
  const have = new Set(db.pathways.map((p) => p.id));
  // A default whose instrument this device does not have is not offered: it
  // would arrive as an unscoped pathway nothing on this device plays.
  const offered = seeded.pathways.filter((p) => p.instrumentId && !have.has(p.id));
  return { seeded, offered };
}

/** The shipped default pathways this database lacks, on instruments it has. */
export function offeredDefaultPathways(db: Pick<PracticeDB, 'instruments' | 'pathways'>, now: Date): Pathway[] {
  return missingDefaults(db, now).offered;
}

/**
 * The pathway collections after adding the CHOSEN offered defaults with their
 * seeded stages and placed routines. Every existing element is kept, by
 * reference, as the prefix; a seeded stage or routine whose id already exists
 * is skipped (a routine the owner kept after deleting that pathway still holds
 * its id, detached, and is never duplicated or re-placed). An id that is not
 * offered — present, never shipped, or on an instrument this device lacks —
 * adds nothing, and a collection that gains nothing is returned as the SAME
 * array, so a no-op plan is detectable by identity.
 */
export function planDefaultPathways(
  db: Pick<PracticeDB, 'instruments'> & PathwayCollections,
  pathwayIds: string[],
  now: Date,
): PathwayCollections {
  const { seeded, offered } = missingDefaults(db, now);
  const chosen = new Set(offered.filter((p) => pathwayIds.includes(p.id)).map((p) => p.id));
  const stageIds = new Set(db.pathwayStages.map((s) => s.id));
  const routineIds = new Set(db.pathwayRoutines.map((r) => r.id));
  const stages = seeded.pathwayStages.filter((s) => chosen.has(s.pathwayId) && !stageIds.has(s.id));
  const routines = seeded.pathwayRoutines.filter(
    (r) => !!r.pathwayId && chosen.has(r.pathwayId) && !routineIds.has(r.id),
  );
  return {
    pathways: chosen.size ? [...db.pathways, ...offered.filter((p) => chosen.has(p.id))] : db.pathways,
    pathwayStages: stages.length ? [...db.pathwayStages, ...stages] : db.pathwayStages,
    pathwayRoutines: routines.length ? [...db.pathwayRoutines, ...routines] : db.pathwayRoutines,
  };
}

// --- Catalog (reference suggestions per stage) ------------------------------

let catalogCache: Record<string, CatalogEntry[]> | null = null;

function buildCatalog(): Record<string, CatalogEntry[]> {
  const map: Record<string, CatalogEntry[]> = {};
  for (const { seed } of ALL_SEEDS) {
    for (const st of seed.stages) {
      const stageId = stageIdFor(seed.id, st.slug ?? st.code);
      map[stageId] = st.steps.map((sp) => ({
        key: sp.key ?? slug(sp.title),
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

let referenceCache: {
  known: Set<string>;
  byPathway: Map<string, Set<string>>;
  kinds: Map<string, Set<string>>;
} | null = null;

function references() {
  if (!referenceCache) {
    const known = new Set<string>();
    const byPathway = new Map<string, Set<string>>();
    const kinds = new Map<string, Set<string>>();
    for (const { seed, key } of ALL_SEEDS) {
      const own = byPathway.get(seed.id) ?? new Set<string>();
      for (const st of seed.stages) {
        const stageId = stageIdFor(seed.id, st.slug ?? st.code);
        for (const e of catalogForStage(stageId)) {
          const ref = catalogReferenceId(stageId, e.key);
          known.add(ref);
          own.add(ref);
          kinds.set(ref, (kinds.get(ref) ?? new Set()).add(key));
        }
      }
      byPathway.set(seed.id, own);
    }
    referenceCache = { known, byPathway, kinds };
  }
  return referenceCache;
}

/** Which instruments' shipped pathways present a reference ('guitar' / 'setar' / 'tar'). */
export function referenceInstrumentKinds(refId: string): ReadonlySet<string> {
  return references().kinds.get(refId) ?? new Set();
}

/** True when some shipped suggestion carries this reference id. */
export function knownReference(refId: string): boolean {
  return references().known.has(refId);
}

/**
 * The references a pathway's SHIPPED definition presents, whatever the owner
 * has since done to its stages — the scope a hidden suggestion may name. A
 * pathway the owner made has none.
 */
export function pathwayReferenceIds(pathwayId: string): ReadonlySet<string> {
  return references().byPathway.get(pathwayId) ?? new Set();
}

export const SEED_PATHWAY_IDS = { guitar: CGS.id, setar: SETAR.id, tar: TAR.id };

/** The two named instances of the shared Persian reference. */
export const RADIF_PATHWAY_IDS = { setar: SETAR_RADIF_MIRZA.id, tar: TAR_RADIF_MIRZA.id };
