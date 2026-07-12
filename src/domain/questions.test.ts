import { describe, expect, it } from 'vitest';
import { questionsForNextClass, renderClassQuestionsText } from './questions';
import type { PracticeItem } from './types';

function item(partial: Partial<PracticeItem> & { id: string; instrumentId: string; title: string }): PracticeItem {
  return {
    status: 'new',
    itemType: 'gusheh',
    importance: 3,
    difficulty: 3,
    tags: [],
    timesPractised: 0,
    totalMinutes: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  } as PracticeItem;
}

describe('questionsForNextClass', () => {
  const items: PracticeItem[] = [
    item({ id: 'a', instrumentId: 'setar', title: 'درآمد شور', assignedForLesson: true, teacherQuestion: 'تحریر را کجا شروع کنم؟', currentProblem: 'ناهماهنگی مضراب' }),
    item({ id: 'b', instrumentId: 'setar', title: 'کرشمه', assignedForLesson: true, teacherQuestion: '' }), // no question → excluded
    item({ id: 'c', instrumentId: 'setar', title: 'رهاب', assignedForLesson: false, teacherQuestion: 'سرعت مناسب؟' }), // not for class → excluded
    item({ id: 'd', instrumentId: 'setar', title: 'آواز افشاری', assignedForLesson: true, teacherQuestion: 'How to phrase the forud?', lastObservation: 'شاهد کمی بالا بود' }),
    item({ id: 'e', instrumentId: 'tar', title: 'Some Tar gusheh', assignedForLesson: true, teacherQuestion: 'Wrong instrument' }), // other instrument
  ];

  it('includes only items that are assigned for the class AND carry a question', () => {
    const qs = questionsForNextClass(items, 'setar');
    expect(qs.map((q) => q.itemId).sort()).toEqual(['a', 'd']);
  });

  it('excludes items with an empty/whitespace question', () => {
    const qs = questionsForNextClass([item({ id: 'x', instrumentId: 'setar', title: 't', assignedForLesson: true, teacherQuestion: '   ' })], 'setar');
    expect(qs).toHaveLength(0);
  });

  it('excludes items not assigned for the class even if they have a question', () => {
    const qs = questionsForNextClass(items, 'setar');
    expect(qs.find((q) => q.itemId === 'c')).toBeUndefined();
  });

  it('scopes strictly to the given instrument', () => {
    expect(questionsForNextClass(items, 'tar').map((q) => q.itemId)).toEqual(['e']);
  });

  it('orders by title with the Persian collator (آ before ک before د? — deterministic fa order)', () => {
    const qs = questionsForNextClass(items, 'setar');
    // Deterministic: whatever fa-collator order is, it is stable and sorted.
    const titles = qs.map((q) => q.title);
    const resorted = [...titles].sort((a, b) => new Intl.Collator('fa').compare(a, b));
    expect(titles).toEqual(resorted);
  });

  it('carries optional current problem and last observation, trimmed', () => {
    const qs = questionsForNextClass(items, 'setar');
    const a = qs.find((q) => q.itemId === 'a')!;
    expect(a.currentProblem).toBe('ناهماهنگی مضراب');
    const d = qs.find((q) => q.itemId === 'd')!;
    expect(d.lastObservation).toBe('شاهد کمی بالا بود');
  });

  it('renders a numbered plain-text export preserving mixed-language text', () => {
    const text = renderClassQuestionsText('سه‌تار', '۲۵ مرداد', questionsForNextClass(items, 'setar'));
    expect(text).toContain('Questions for سه‌تار class');
    expect(text).toContain('Q: تحریر را کجا شروع کنم؟');
    expect(text).toContain('Q: How to phrase the forud?');
    expect(text).toMatch(/1\. /);
    expect(text).toMatch(/2\. /);
  });

  it('renders a friendly empty state', () => {
    const text = renderClassQuestionsText('Setar', 'today', []);
    expect(text).toMatch(/No questions yet/);
  });
});
