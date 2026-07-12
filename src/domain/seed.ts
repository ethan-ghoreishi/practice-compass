import type { PracticeBlock, PracticeDB, PracticeItem } from './types';
import { SCHEMA_VERSION } from './types';
import { SEED_PATHWAY_IDS, seedPathways, stageIdFor } from './pathwaySeed';
import {
  createBlock,
  createInstrument,
  createItem,
  createLesson,
  createMaterial,
  createReview,
} from './factories';
import { isSaturated } from './scoring';
import { addDays, newId, nowISO, toISODate } from './util';

// ---------------------------------------------------------------------------
// Demo dataset. Small but deliberately shaped so every screen has something
// meaningful on first run: a saturated item, a strong "best next focus", a
// quick win, a maintenance item, due reviews, and a couple of teacher
// questions. Item stats are derived from the seed blocks so nothing lies.
// ---------------------------------------------------------------------------

function ago(now: Date, days: number): string {
  return nowISO(addDays(now, -days));
}
function agoDate(now: Date, days: number): string {
  return toISODate(addDays(now, days));
}

export function createSeedDB(now: Date = new Date()): PracticeDB {
  // --- Instruments ---------------------------------------------------------
  const setar = createInstrument({ name: 'Setar', family: 'Persian' }, now);
  const tar = createInstrument({ name: 'Tar', family: 'Persian' }, now);
  const guitar = createInstrument({ name: 'Classical Guitar', family: 'Western' }, now);

  // --- Materials -----------------------------------------------------------
  const mAfshari = createMaterial(
    {
      instrumentId: setar.id,
      title: 'ردیف میرزا عبدالله',
      sourceType: 'radif',
      sourceName: 'ردیف میرزا عبدالله',
    },
    now,
  );
  const mMezrab = createMaterial(
    {
      instrumentId: tar.id,
      title: 'تمرین‌های مضراب',
      sourceType: 'technique',
      sourceName: 'تمرین‌های استاد',
    },
    now,
  );
  const mLesson6 = createMaterial(
    {
      instrumentId: guitar.id,
      title: 'Lesson 6',
      sourceType: 'course',
      sourceName: 'Online Course',
    },
    now,
  );
  const mRepertoire = createMaterial(
    {
      instrumentId: guitar.id,
      title: 'Repertoire',
      sourceType: 'piece',
    },
    now,
  );

  // --- Items (stats filled in from blocks below) ---------------------------
  const iraq = createItem(
    {
      instrumentId: setar.id,
      materialId: mAfshari.id,
      stageId: stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari'),
      strand: 'radif',
      catalogKey: 'iraq',
      assignedForLesson: true,
      title: 'پایان‌بندیِ عبارتِ ۴ (عراق)',
      itemType: 'phrase',
      status: 'repairing',
      importance: 5,
      difficulty: 4,
      currentProblem: 'فرود هنگام اتصال به عبارتِ پیشین روشن نیست.',
      primaryFocus: 'phrase_direction',
      teacherQuestion: 'آیا نقطهٔ فرودم درست است، یا زینت دارد فرود را می‌پوشاند؟',
      persian: {
        dastgahAvaz: 'افشاری',
        gusheh: 'عراق',
        phraseLabel: 'عبارت ۴',
        foroud: 'فرودِ نامطمئن',
        ornamentIssue: 'زینت ممکن است فرود را بپوشاند',
      },
    },
    now,
  );
  const rizeh = createItem(
    {
      instrumentId: tar.id,
      materialId: mMezrab.id,
      stageId: stageIdFor(SEED_PATHWAY_IDS.tar, 'rh-basics'),
      strand: 'mezrab',
      title: 'وضوحِ ریز روی سیمِ باز',
      itemType: 'technique',
      status: 'fragile',
      importance: 4,
      difficulty: 4,
      currentProblem: 'حمله ناهموار است — برخی مضراب‌ها می‌افتند.',
      primaryFocus: 'right_hand',
      persian: { mezrabIssue: 'ریزِ ناهموار روی سیمِ باز' },
    },
    now,
  );
  const shift = createItem(
    {
      instrumentId: guitar.id,
      materialId: mLesson6.id,
      title: 'Lesson 6 bars 4–5 shift',
      itemType: 'bar',
      status: 'repairing',
      importance: 4,
      difficulty: 3,
      currentProblem: 'Left-hand shift causes shoulder tension.',
      primaryFocus: 'left_hand',
      teacherQuestion: 'Should I prioritise tone or releasing shoulder tension on this shift?',
      guitar: {
        lessonNumber: '6',
        barRange: '4–5',
        leftHandIssue: 'Shift arrives late',
        bodyTensionNote: 'Right shoulder lifts on the shift',
        toneIssue: 'Note drops out just after the shift',
      },
    },
    now,
  );
  const studyC = createItem(
    {
      instrumentId: guitar.id,
      materialId: mRepertoire.id,
      title: 'Study in C — full run',
      itemType: 'full_piece',
      status: 'usable',
      importance: 3,
      difficulty: 3,
      currentProblem: 'Rushes through the middle section.',
      primaryFocus: 'tempo',
      guitar: { tempo: '~80 bpm', fingering: 'Settled' },
    },
    now,
  );
  const daramad = createItem(
    {
      instrumentId: setar.id,
      materialId: mAfshari.id,
      stageId: stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari'),
      strand: 'radif',
      catalogKey: 'daramad',
      title: 'درآمد افشاری (آغاز)',
      itemType: 'section',
      status: 'integrated',
      importance: 3,
      difficulty: 2,
      primaryFocus: 'musical_meaning',
      persian: { dastgahAvaz: 'افشاری', gusheh: 'درآمد' },
    },
    now,
  );

  const items: PracticeItem[] = [iraq, rizeh, shift, studyC, daramad];

  // --- Blocks --------------------------------------------------------------
  const b = (
    item: PracticeItem,
    daysAgo: number,
    durationMinutes: number,
    result: PracticeBlock['result'],
    focus: PracticeBlock['focus'],
    mode: PracticeBlock['mode'],
    observation?: string,
  ): PracticeBlock =>
    createBlock(
      {
        practiceItemId: item.id,
        instrumentId: item.instrumentId,
        materialId: item.materialId,
        startedAt: ago(now, daysAgo),
        endedAt: ago(now, daysAgo),
        durationMinutes,
        mode,
        focus,
        result,
        observation,
        createdReview: true,
      },
      now,
    );

  const blocks: PracticeBlock[] = [
    // Iraq — stuck on "same" (saturated, triggers strategy insight)
    b(iraq, 5, 12, 'same', 'phrase_direction', 'repair', 'فرود هنوز مبهم است.'),
    b(iraq, 3, 10, 'same', 'phrase_direction', 'repair'),
    b(iraq, 1, 11, 'same', 'phrase_direction', 'repair', 'مثل قبل، فرود نامشخص.'),
    // Rizeh — improving but fragile and overdue (a strong next focus)
    b(rizeh, 7, 8, 'worse', 'right_hand', 'repair', 'با تندتر کردن، حمله از هم پاشید.'),
    b(rizeh, 5, 10, 'slightly_better', 'right_hand', 'repair', 'تمپوِ آهسته‌تر به یکدستی کمک کرد.'),
    // Shift — steady progress
    b(shift, 6, 9, 'same', 'left_hand', 'repair'),
    b(shift, 4, 8, 'slightly_better', 'left_hand', 'repair', 'Dropping the shoulder helped.'),
    b(shift, 2, 10, 'slightly_better', 'left_hand', 'repair'),
    // Study in C — solid, a good quick win / due review
    b(studyC, 12, 20, 'stable_alone', 'tempo', 'integrate'),
    b(studyC, 8, 20, 'stable_alone', 'tempo', 'integrate'),
    b(studyC, 4, 20, 'stable_alone', 'tempo', 'integrate', 'Middle section still wants to rush.'),
    // Darāmad — integrated but neglected (maintenance)
    b(daramad, 30, 50, 'stable_in_context', 'musical_meaning', 'maintain'),
    b(daramad, 21, 45, 'stable_in_context', 'musical_meaning', 'maintain'),
  ];

  // --- Derive item stats from blocks (keep everything consistent) ----------
  const reviewDates: Record<string, string> = {
    [iraq.id]: agoDate(now, 0), // due today
    [rizeh.id]: agoDate(now, -2), // overdue by 2 days
    [shift.id]: agoDate(now, 1), // due tomorrow
    [studyC.id]: agoDate(now, 0), // due today
    [daramad.id]: agoDate(now, -14), // overdue by 14 days
  };

  for (const item of items) {
    const own = blocks
      .filter((bl) => bl.practiceItemId === item.id)
      .sort((x, y) => x.startedAt.localeCompare(y.startedAt));
    if (own.length === 0) continue;
    const last = own[own.length - 1];
    item.timesPractised = own.length;
    item.totalMinutes = own.reduce((s, x) => s + x.durationMinutes, 0);
    item.lastPractisedAt = last.startedAt;
    item.lastResult = last.result;
    item.lastObservation = [...own].reverse().find((x) => x.observation)?.observation;
    item.nextReviewDate = reviewDates[item.id];
    item.saturationWarning = isSaturated(own, now);
  }

  // --- Reviews (pending, so Today shows due reviews) -----------------------
  const reviews = [
    createReview({ practiceItemId: iraq.id, dueDate: reviewDates[iraq.id], reviewType: 'repair', reason: 'سه بار نتیجهٔ یکسان — راهبرد را عوض کن.' }, now),
    createReview({ practiceItemId: rizeh.id, dueDate: reviewDates[rizeh.id], reviewType: 'repair' }, now),
    createReview({ practiceItemId: studyC.id, dueDate: reviewDates[studyC.id], reviewType: 'integration' }, now),
    createReview({ practiceItemId: shift.id, dueDate: reviewDates[shift.id], reviewType: 'repair' }, now),
    createReview({ practiceItemId: daramad.id, dueDate: reviewDates[daramad.id], reviewType: 'maintenance', reason: 'نگهداریِ معمول.' }, now),
  ];

  const pathways = seedPathways({ guitar: guitar.id, setar: setar.id, tar: tar.id }, now);

  // --- Lessons (a monthly Setar class: last one + the next one) -------------
  const pastLesson = createLesson(
    {
      instrumentId: setar.id,
      date: agoDate(now, -16),
      notes:
        'روی افشاری کار شد: مرورِ درآمد و پایان‌بندی‌های عبارتِ عراق. استاد: اول فرود را بدون زینت بیاور، بعد زینت را اضافه کن. تأکید روی فرود — اول بدون تحریر.',
    },
    now,
  );
  // A class recording lives on the NAS, referenced (never stored) by the app.
  pastLesson.recordings = [
    {
      id: newId(),
      title: 'ضبطِ کلاس',
      path: 'setar-classes/session-37-09-07-2026/2026-07-09_Setar_Class_FIXED_v3.mp4',
      date: agoDate(now, -16),
      sizeBytes: 686136347,
      notes: undefined,
      createdAt: nowISO(now),
    },
  ];
  const lessons = [
    pastLesson,
    createLesson({ instrumentId: setar.id, date: agoDate(now, 14) }, now),
  ];

  return {
    schemaVersion: SCHEMA_VERSION,
    instruments: [setar, tar, guitar],
    materials: [mAfshari, mMezrab, mLesson6, mRepertoire],
    items,
    blocks,
    reviews,
    ...pathways,
    attachments: [],
    lessons,
  };
}

export function emptyDB(): PracticeDB {
  return {
    schemaVersion: SCHEMA_VERSION,
    instruments: [],
    materials: [],
    items: [],
    blocks: [],
    reviews: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [],
    attachments: [],
    lessons: [],
  };
}
