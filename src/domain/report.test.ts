import { describe, expect, it } from 'vitest';
import { buildTeacherReport } from './report';
import { openQuestionsForLessonId, renderClassQuestionsText } from './questions';
import { createQuestion, markQuestionAsked } from './lessonAgenda';
import { createBlock, createInstrument, createItem, createLesson } from './factories';
import { emptyDB } from './seed';
import type { ItemStatus, LessonAgendaEntry, PracticeDB, PracticeItem } from './types';

// ---------------------------------------------------------------------------
// The exported class text — the teacher report and the questions sheet that
// are copied, downloaded and printed — isolates every value the owner wrote,
// so a Farsi title followed by digits stops garbling an English line, and
// keeps every word of its wording. Fixtures are independent of the browser
// journeys': mixed languages, digits, punctuation, a multi-line question and
// a value the owner already isolated themselves.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-06-20T10:00:00.000Z');
const INST = 'inst-tar';
const FSI = '⁨';
const PDI = '⁩';

function item(id: string, title: string, status: ItemStatus = 'usable'): PracticeItem {
  return { ...createItem({ instrumentId: INST, title }, NOW), id, status };
}

const ITEMS = [
  item('iraq', 'عراق 3', 'repairing'),
  item('bridge', 'Bridge, bars 9–12', 'fragile'),
  item('pre', `${FSI}Already isolated${PDI}`),
  item('mixed', 'Mixed: شور drill'),
];

const block = (practiceItemId: string, day: string, result: 'same' | 'slightly_better', observation?: string) =>
  createBlock(
    { practiceItemId, instrumentId: INST, durationMinutes: 15, mode: 'repair', focus: 'tone', startedAt: `${day}T12:00:00.000Z`, result, observation },
    NOW,
  );

const AGENDA: LessonAgendaEntry[] = [
  createQuestion({ id: 'q-iraq', text: 'Line one: is the forud early?\nخط دوم: چرا؟', instrumentId: INST, itemId: 'iraq', lessonId: 'L', now: NOW }),
  createQuestion({ id: 'q-free', text: 'سرعت رنگ چقدر باشد؟', instrumentId: INST, lessonId: 'L', now: NOW }),
  createQuestion({ id: 'q-bridge', text: 'Tone or tension first?', instrumentId: INST, itemId: 'bridge', now: NOW }),
  createQuestion({ id: 'q-pre', text: 'Ask about 12/8 — again!', instrumentId: INST, itemId: 'pre', lessonId: 'L', now: NOW }),
  createQuestion({ id: 'q-pre-open', text: 'Pedal or not?', instrumentId: INST, itemId: 'pre', lessonId: 'L', now: NOW }),
];

function db(): PracticeDB {
  const asked = markQuestionAsked(AGENDA, 'q-pre', NOW, 'هنوز نه — slower, 60 bpm.');
  return {
    ...emptyDB(),
    instruments: [{ ...createInstrument({ name: 'تار', family: 'Persian' }, NOW), id: INST }],
    items: ITEMS,
    blocks: [
      block('iraq', '2026-06-15', 'same', 'فرود 2 بار زود آمد'),
      block('iraq', '2026-06-17', 'same'),
      block('iraq', '2026-06-19', 'same'),
      block('bridge', '2026-06-18', 'slightly_better', 'Cleaner, (mostly).'),
      block('mixed', '2026-06-18', 'slightly_better'),
    ],
    lessons: [{ ...createLesson({ instrumentId: INST, date: '2026-06-21', number: 7 }, NOW), id: 'L' }],
    lessonAgenda: asked,
  };
}

/** Every owner value the two outputs interpolate, exactly as stored. */
const OWNER_VALUES = [
  'تار',
  'عراق 3',
  'Bridge, bars 9–12',
  'Mixed: شور drill',
  'Line one: is the forud early?\nخط دوم: چرا؟',
  'سرعت رنگ چقدر باشد؟',
  'Tone or tension first?',
  'Ask about 12/8 — again!',
  'Pedal or not?',
  'هنوز نه — slower, 60 bpm.',
  'فرود 2 بار زود آمد',
];

/** One value as the export isolates it: each line its own pair (a newline ends every isolate). */
const isolated = (v: string) => v.split('\n').map((line) => `${FSI}${line}${PDI}`).join('\n');

/** Remove ONLY the wrapper marks this change adds — never a mark the owner wrote. */
const stripAdded = (text: string) => OWNER_VALUES.reduce((t, v) => t.split(isolated(v)).join(v), text);

// The two outputs as the baseline (24a84be) rendered these fixtures, captured
// before the isolation change and committed with it.
const BASE_REPORT = [
  'Practice report: تار\n',
  '(2026-06-01 → 2026-06-20)\n',
  '\n',
  'Worked on:\n',
  '- عراق 3: 3 blocks, 45 minutes\n',
  '- Bridge, bars 9–12: 1 block, 15 minutes\n',
  '- Mixed: شور drill: 1 block, 15 minutes\n',
  '\n',
  'Results recorded in this period:\n',
  '- عراق 3: best same; last recorded same.\n',
  '- Bridge, bars 9–12: best slightly better; last recorded slightly better.\n',
  '- Mixed: شور drill: best slightly better; last recorded slightly better.\n',
  '\n',
  'Currently shaky or being repaired (current status, not this period):\n',
  '- عراق 3\n',
  '- Bridge, bars 9–12\n',
  '\n',
  'To ask at the class this report is for:\n',
  '1. سرعت رنگ چقدر باشد؟\n',
  '2. Line one: is the forud early?\n',
  'خط دوم: چرا؟ (عراق 3)\n',
  '3. Pedal or not? (\u2068Already isolated\u2069)\n',
  '\n',
  'Other open questions (not for that class):\n',
  '1. Tone or tension first? (Bridge, bars 9–12) [unassigned]\n',
  '\n',
  'Already asked at that class:\n',
  '1. Ask about 12/8 — again! — answer: هنوز نه — slower, 60 bpm.\n',
  '\n',
  'Currently repeating the same result (current pattern, not this period):\n',
  '- عراق 3\n',
  '\n',
  'Suggested lesson focus (current):\n',
  '1. Bridge, bars 9–12\n',
  '2. عراق 3\n',
  '3. \u2068Already isolated\u2069',
].join('');
const BASE_SHEET = [
  'Questions for تار class — Class 7 · 2026-06-21\n',
  '\n',
  '1. (no item)\n',
  '   Q: سرعت رنگ چقدر باشد؟\n',
  '\n',
  '2. عراق 3\n',
  '   Q: Line one: is the forud early?\n',
  'خط دوم: چرا؟\n',
  '   Last observed 2026-06-15: فرود 2 بار زود آمد\n',
  '\n',
  '3. \u2068Already isolated\u2069\n',
  '   Q: Pedal or not?',
].join('');

describe('exported class text', () => {
  it('exported class text isolates every owner value and keeps its wording', () => {
    const report = buildTeacherReport(db(), { instrumentId: INST, from: '2026-06-01', to: '2026-06-20', now: NOW, lessonId: 'L' });
    const questions = openQuestionsForLessonId(db().lessonAgenda, ITEMS, 'L', db().blocks);
    const sheet = renderClassQuestionsText('تار', 'Class 7 · 2026-06-21', questions);

    for (const [name, text, base] of [
      ['report', report, BASE_REPORT],
      ['class sheet', sheet, BASE_SHEET],
    ] as const) {
      // The wording is the baseline's, byte for byte, once the added marks go.
      expect(stripAdded(text), name).toBe(base);
      // Every owner value that appears is isolated wherever it appears.
      for (const v of OWNER_VALUES) {
        const bare = base.split(v).length - 1;
        expect(text.split(isolated(v)).length - 1, `${name}: ${JSON.stringify(v)}`).toBe(bare);
      }
      // A value the owner already isolated is not wrapped again.
      expect(text, name).not.toContain(`${FSI}${FSI}`);
      // Marks are balanced on every line.
      for (const line of text.split('\n')) {
        expect(line.split(FSI).length, `${name}: ${line}`).toBe(line.split(PDI).length);
      }
    }
    // The pre-isolated title kept its own single pair.
    expect(report).toContain(`(${FSI}Already isolated${PDI})`);
    // Stored values never gain marks.
    expect(db().items.map((i) => i.title)).toEqual(ITEMS.map((i) => i.title));
  });
});
