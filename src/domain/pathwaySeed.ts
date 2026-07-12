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

/** The standing conscious-practice prompt for any gushe (kept generic — the
 *  teacher's account of each gushe is the authority; write it in the item's notes). */
const GUSHEH_ABOUT = (context: string) =>
  `گوشه‌ای از ${context}. پیش از نواختن، گوش بسپار به: شاهد (نتی که ملودی حول آن می‌گردد)، ایست (جایی که عبارت‌ها می‌آسایند) و شیوهٔ فرود آن به خانه. اول خط آغازین را زمزمه کن — پیش از آنکه دست‌ها حرکت کنند، بدان به کجا می‌رود.`;

/** Each gushe as [Farsi display name, stable ascii key]. The key was the old
 *  slug of the English name, so existing catalog links stay valid. */
const gusheh = (entries: [string, string][], context: string): StepSeed[] =>
  entries.map(([title, key]) => ({
    title,
    key,
    strand: 'radif' as StepStrand,
    kind: 'piece' as StepKind,
    about: GUSHEH_ABOUT(context),
  }));

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
    {
      code: 'شور',
      slug: 'shur',
      group: 'دستگاه شور و آوازهای آن',
      title: 'دستگاه شور',
      intro:
        'شور سنگ‌بنای موسیقی ایرانی است و معمولاً آغازگاهِ هنرجویان — درون‌گرا، لطیف، و مادرِ چهار آواز. توجه کن که چگونه تقریباً همه‌چیز به شاهدِ آن بازمی‌گردد.',
      steps: gusheh(
        [
          ['درآمد شور', 'daramad-e-shur'],
          ['کرشمه', 'kereshmeh'],
          ['رهاب', 'rohab'],
          ['سلمک', 'salmak'],
          ['گلریز', 'golriz'],
          ['شهناز', 'shahnaz'],
          ['قرچه', 'qarche'],
          ['حسینی', 'hosseini'],
          ['فرود', 'forud'],
        ],
        'شور',
      ),
    },
    {
      code: 'ابوعطا',
      slug: 'abu-ata',
      group: 'دستگاه شور و آوازهای آن',
      title: 'آواز ابوعطا',
      intro: 'آوازی از شور با رنگی سوزناک و مردمی. بشنو که چگونه بر شور تکیه می‌زند و به آن بازمی‌گردد.',
      steps: gusheh(
        [
          ['درآمد', 'daramad'],
          ['سیخی', 'sayakhi'],
          ['حجاز', 'hejaz'],
          ['چهارباغ', 'chaharbagh'],
          ['فرود', 'forud'],
        ],
        'ابوعطا',
      ),
    },
    {
      code: 'بیات ترک',
      slug: 'bayat-e-tork',
      group: 'دستگاه شور و آوازهای آن',
      title: 'آواز بیات ترک',
      intro: 'آوازی از شور با نمایی روشن‌تر و بازتر — که بسیار در آواز مذهبی شنیده می‌شود.',
      steps: gusheh(
        [
          ['درآمد', 'daramad'],
          ['دوگاه', 'dogah'],
          ['مهربانی', 'mehrabani'],
          ['قطار', 'qatar'],
          ['فرود', 'forud'],
        ],
        'بیات ترک',
      ),
    },
    {
      code: 'افشاری',
      slug: 'afshari',
      group: 'دستگاه شور و آوازهای آن',
      title: 'آواز افشاری',
      intro:
        'آوازی از شور — جستجوگر و تلخ‌وشیرین، با کیفیتی سرگردان و ویژه. فرودِ آن به شور، لحظه‌ای است که باید به آن گوش سپرد.',
      steps: gusheh(
        [
          ['درآمد', 'daramad'],
          ['جامه‌دران', 'jamedaran'],
          ['عراق', 'iraq'],
          ['فرود', 'forud'],
        ],
        'افشاری',
      ),
    },
    {
      code: 'دشتی',
      slug: 'dashti',
      group: 'دستگاه شور و آوازهای آن',
      title: 'آواز دشتی',
      intro: 'آوازی از شور، غنایی و اندوهگین — صدای بسیاری از نغمه‌های محلی. شاهدِ آن به‌طرزی نامدار می‌لرزد.',
      steps: gusheh(
        [
          ['درآمد', 'daramad'],
          ['گیلکی', 'gilaki'],
          ['بیات راجه', 'bayat-e-rajeh'],
          ['فرود', 'forud'],
        ],
        'دشتی',
      ),
    },
    {
      code: 'همایون',
      slug: 'homayun',
      group: 'دیگر دستگاه‌ها',
      title: 'دستگاه همایون',
      intro: 'هم‌زمان باشکوه و سوگوار. به جهشِ آغازینِ ویژه‌اش و کششِ بیداد گوش بسپار.',
      steps: gusheh(
        [
          ['درآمد همایون', 'daramad-e-homayun'],
          ['چکاوک', 'chakavak'],
          ['بیداد', 'bidad'],
          ['نی‌داوود', 'ney-davud'],
          ['فرود', 'forud'],
        ],
        'همایون',
      ),
    },
    {
      code: 'اصفهان',
      slug: 'esfahan',
      group: 'دیگر دستگاه‌ها',
      title: 'آواز بیات اصفهان',
      intro: 'آوازی از همایون — عاشقانه و گرم، نزدیک به رنگِ مینورِ هارمونیکِ غربی.',
      steps: gusheh(
        [
          ['درآمد', 'daramad'],
          ['جامه‌دران', 'jamedaran'],
          ['بیات راجه', 'bayat-e-rajeh'],
          ['فرود', 'forud'],
        ],
        'بیات اصفهان',
      ),
    },
    {
      code: 'سه‌گاه',
      slug: 'segah',
      group: 'دیگر دستگاه‌ها',
      title: 'دستگاه سه‌گاه',
      intro: 'اندوهگین و التماس‌گر، حول شاهدِ ربع‌پرده‌اش ساخته شده. مخالف اوجِ عاطفیِ آن است — به تغییرِ رجیستر توجه کن.',
      steps: gusheh(
        [
          ['درآمد سه‌گاه', 'daramad-e-segah'],
          ['زابل', 'zabol'],
          ['مخالف', 'mokhalef'],
          ['مقلوب', 'maqlub'],
          ['فرود', 'forud'],
        ],
        'سه‌گاه',
      ),
    },
    {
      code: 'چهارگاه',
      slug: 'chahargah',
      group: 'دیگر دستگاه‌ها',
      title: 'دستگاه چهارگاه',
      intro: 'روشن، حماسی، جشن‌گونه — که اغلب با طلوعِ آفتاب مقایسه می‌شود. تقارنِ دانگ‌هایش را حول شاهد حس کن.',
      steps: gusheh(
        [
          ['درآمد چهارگاه', 'daramad-e-chahargah'],
          ['زابل', 'zabol'],
          ['مخالف', 'mokhalef'],
          ['منصوری', 'mansuri'],
          ['فرود', 'forud'],
        ],
        'چهارگاه',
      ),
    },
    {
      code: 'ماهور',
      slug: 'mahur',
      group: 'دیگر دستگاه‌ها',
      title: 'دستگاه ماهور',
      intro: 'باز و شادمان — نزدیک‌ترین به گامِ ماژورِ غربی. دلکش گردشِ نامدار است: بشنو که چگونه رنگِ شور را وام می‌گیرد.',
      steps: gusheh(
        [
          ['درآمد ماهور', 'daramad-e-mahur'],
          ['داد', 'dad'],
          ['خسروانی', 'khosravani'],
          ['دلکش', 'delkash'],
          ['فرود', 'forud'],
        ],
        'ماهور',
      ),
    },
    {
      code: 'نوا',
      slug: 'nava',
      group: 'دیگر دستگاه‌ها',
      title: 'دستگاه نوا',
      intro: 'آرام، مراقبه‌گون، متعادل — اغلب برای پاسی از شب نگه داشته می‌شود. خویشاوندِ شور؛ به مرکزِ آرام‌ترش توجه کن.',
      steps: gusheh(
        [
          ['درآمد نوا', 'daramad-e-nava'],
          ['گردانیه', 'gardaniyeh'],
          ['نهفت', 'nahoft'],
          ['فرود', 'forud'],
        ],
        'نوا',
      ),
    },
    {
      code: 'راست‌پنجگاه',
      slug: 'rast-panjgah',
      group: 'دیگر دستگاه‌ها',
      title: 'دستگاه راست‌پنجگاه',
      intro: 'کمیاب‌ترین دستگاه — باوقار، گسترده، و محبوب برای مدولاسیون میان مُدها.',
      steps: gusheh(
        [
          ['درآمد راست‌پنجگاه', 'daramad-e-rast-panjgah'],
          ['پروانه', 'parvaneh'],
          ['قرچه', 'qarache'],
          ['فرود', 'forud'],
        ],
        'راست‌پنجگاه',
      ),
    },
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

export const SEED_PATHWAY_IDS = { guitar: CGS.id, setar: SETAR.id, tar: TAR.id };
