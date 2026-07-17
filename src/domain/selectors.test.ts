import { describe, expect, it } from 'vitest';
import { nextLessonNumber } from './selectors';
import type { Lesson } from './types';

function lesson(partial: Partial<Lesson> & { id: string; instrumentId: string; date: string }): Lesson {
  return { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...partial };
}

describe('nextLessonNumber', () => {
  it('is 1 when the instrument has no numbered lessons', () => {
    expect(nextLessonNumber([], 'setar')).toBe(1);
    expect(nextLessonNumber([lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01' })], 'setar')).toBe(1);
  });

  it('is max existing number + 1, scoped per instrument', () => {
    const lessons = [
      lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01', number: 3 }),
      lesson({ id: 'b', instrumentId: 'setar', date: '2026-02-01', number: 7 }),
      lesson({ id: 'c', instrumentId: 'tar', date: '2026-02-01', number: 40 }),
    ];
    expect(nextLessonNumber(lessons, 'setar')).toBe(8);
    expect(nextLessonNumber(lessons, 'tar')).toBe(41);
  });

  it('ignores unnumbered lessons when computing the max', () => {
    const lessons = [
      lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01', number: 5 }),
      lesson({ id: 'b', instrumentId: 'setar', date: '2026-03-01' }), // no number
    ];
    expect(nextLessonNumber(lessons, 'setar')).toBe(6);
  });
});
