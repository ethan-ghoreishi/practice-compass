import { describe, expect, it } from 'vitest';
import {
  lessonLabel,
  openQuestionsForLessonId,
  renderClassQuestionsText,
  unassignedOpenQuestions,
} from './questions';
import { createQuestion, markQuestionAsked } from './lessonAgenda';
import { createBlock, createItem, createLesson } from './factories';
import type { LessonAgendaEntry, PracticeItem } from './types';

const NOW = new Date('2026-06-01T08:00:00.000Z');
const INST = 'setar';

function item(o: Partial<PracticeItem> & { id: string; title: string }): PracticeItem {
  return { ...createItem({ instrumentId: INST, title: o.title }, NOW), ...o };
}

const items = [item({ id: 'b', title: 'Bridge passage' }), item({ id: 'a', title: 'آواز افشاری' })];

/**
 * Current context now comes from the item's own BLOCKS, not from a cached
 * field on the item — so it always carries the day it was written.
 */
const blocks = [
  createBlock(
    { practiceItemId: 'a', instrumentId: INST, durationMinutes: 10, mode: 'repair', focus: 'phrase_direction', startedAt: '2026-06-17T10:00:00.000Z', observation: 'فرود روشن‌تر شد' },
    NOW,
  ),
];

const agenda: LessonAgendaEntry[] = [
  createQuestion({ id: 'q-b', text: 'Tone or tension first?', instrumentId: INST, itemId: 'b', lessonId: 'L', now: NOW }),
  createQuestion({ id: 'q-a', text: 'آیا فرودم درست است؟', instrumentId: INST, itemId: 'a', lessonId: 'L', now: NOW }),
  createQuestion({ id: 'q-free', text: 'A question with no item at all', instrumentId: INST, lessonId: 'L', now: NOW }),
  createQuestion({ id: 'q-loose', text: 'Not pointed at any class', instrumentId: INST, now: NOW }),
];

describe('questions for one class', () => {
  it('selects by lesson id, orders with the Persian collator, and survives a missing item', () => {
    const list = openQuestionsForLessonId(agenda, items, 'L');
    expect(list.map((q) => q.id)).toHaveLength(3);
    // A question with no item still renders — title simply absent.
    expect(list.find((q) => q.id === 'q-free')?.title).toBeUndefined();
    // Item context travels with the question when there is an item — and only
    // when its own blocks recorded something, dated.
    const withBlocks = openQuestionsForLessonId(agenda, items, 'L', blocks);
    expect(withBlocks.find((q) => q.id === 'q-b')?.lastObservation).toBeUndefined();
    expect(withBlocks.find((q) => q.id === 'q-a')?.lastObservation).toEqual({
      text: 'فرود روشن‌تر شد',
      at: '2026-06-17T10:00:00.000Z',
    });
    // Another class's list is genuinely empty, not the same list again.
    expect(openQuestionsForLessonId(agenda, items, 'other')).toEqual([]);
    // Unassigned questions are their own list.
    expect(unassignedOpenQuestions(agenda, items, INST).map((q) => q.id)).toEqual(['q-loose']);

    // Asked questions leave the open list.
    const asked = markQuestionAsked(agenda, 'q-a', NOW, 'Yes.');
    expect(openQuestionsForLessonId(asked, items, 'L').map((q) => q.id)).not.toContain('q-a');
  });

  it('renders a plain-text sheet with answers and honest empty copy', () => {
    const list = openQuestionsForLessonId(agenda, items, 'L');
    const text = renderClassQuestionsText('Setar', '2026-06-14', list);
    expect(text).toContain('Questions for Setar class — 2026-06-14');
    expect(text).toContain('Tone or tension first?');
    expect(text).toContain('آیا فرودم درست است؟');
    // The sheet never dumps the item's own Working notes, and the only
    // context it does carry is the item's latest recorded observation, DATED.
    expect(text).not.toContain('Problem:');
    expect(renderClassQuestionsText('Setar', '2026-06-14', openQuestionsForLessonId(agenda, items, 'L', blocks))).toContain(
      'Last observed 2026-06-17: فرود روشن‌تر شد',
    );
    expect(text).toContain('(no item)');

    const answered = openQuestionsForLessonId(markQuestionAsked(agenda, 'q-b', NOW, 'Tone.'), items, 'L');
    expect(renderClassQuestionsText('Setar', 'x', answered)).not.toContain('A: Tone.'); // asked ⇒ not open

    expect(renderClassQuestionsText('Setar', 'x', [])).toContain('No questions yet');
  });

  it('labels a class by its number and date, and says plainly when there is none', () => {
    const numbered = { ...createLesson({ instrumentId: INST, date: '2026-06-14', number: 38 }, NOW) };
    expect(lessonLabel(numbered)).toBe('Class 38 · 2026-06-14');
    expect(lessonLabel({ ...numbered, number: undefined })).toBe('2026-06-14');
    expect(lessonLabel(undefined)).toBe('Unassigned');
  });
});
