import { describe, expect, it } from 'vitest';
import { validateDB, parseImport } from './io';
import { createSeedDB } from './seed';
import { createBlock, createItem, createLesson } from './factories';
import { blocksInWindow, nextLessonDates, nextLessonFor } from './selectors';
import { addDays, toISODate } from './util';

const NOW = new Date('2026-06-18T12:00:00.000Z');

describe('validateDB — backward-compatible import', () => {
  it('round-trips a current export untouched', () => {
    const db = createSeedDB(NOW);
    const out = validateDB({ app: 'practice-compass', data: db });
    expect(out.items.length).toBe(db.items.length);
    expect(out.lessons.length).toBe(db.lessons.length);
  });

  it('normalises legacy (≤v5) attachment metadata with itemId to owner shape', () => {
    const db = createSeedDB(NOW);
    const legacy = {
      ...db,
      attachments: [
        { id: 'att1', itemId: db.items[0].id, name: 'afshari.pdf', mime: 'application/pdf', size: 100, kind: 'pdf', createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(legacy);
    expect(out.attachments[0].ownerType).toBe('item');
    expect(out.attachments[0].ownerId).toBe(db.items[0].id);
    expect((out.attachments[0] as unknown as { itemId?: string }).itemId).toBeUndefined();
  });

  it('keeps modern owner-shaped attachments and lesson item links as-is', () => {
    const db = createSeedDB(NOW);
    const lesson = createLesson({ instrumentId: db.instruments[0].id, date: '2026-06-01' }, NOW);
    lesson.itemIds = [db.items[0].id];
    const withData = {
      ...db,
      lessons: [...db.lessons, lesson],
      attachments: [
        { id: 'a2', ownerType: 'lesson' as const, ownerId: lesson.id, name: 'notes.pdf', mime: 'application/pdf', size: 5, kind: 'pdf' as const, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(withData);
    expect(out.attachments[0].ownerType).toBe('lesson');
    expect(out.lessons.find((l) => l.id === lesson.id)?.itemIds).toEqual([db.items[0].id]);
  });

  it('rejects unusable shapes with a readable error', () => {
    expect(parseImport('not json').ok).toBe(false);
    expect(parseImport(JSON.stringify({ items: 'nope' })).ok).toBe(false);
  });
});

describe('blocksInWindow — history stays historical', () => {
  const item = createItem({ instrumentId: 'i', title: 't' }, NOW);
  const at = (daysAgo: number) =>
    createBlock(
      {
        practiceItemId: item.id,
        instrumentId: 'i',
        durationMinutes: 10,
        mode: 'learn',
        focus: 'tone',
        result: 'slightly_better',
        startedAt: addDays(NOW, -daysAgo).toISOString(),
      },
      NOW,
    );

  it('excludes future-dated blocks from insight windows', () => {
    const blocks = [at(1), at(3), at(-2)]; // one block "from the future"
    const windowed = blocksInWindow(blocks, NOW, 7);
    expect(windowed).toHaveLength(2);
    expect(windowed.every((b) => new Date(b.startedAt) <= NOW)).toBe(true);
  });

  it('still bounds the window at N days back', () => {
    const blocks = [at(1), at(10)];
    expect(blocksInWindow(blocks, NOW, 7)).toHaveLength(1);
  });
});

describe('per-instrument lesson dates', () => {
  it('nextLessonDates maps each instrument only to its own next class', () => {
    const lessons = [
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, 5)) }, NOW),
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, 30)) }, NOW),
      createLesson({ instrumentId: 'tar', date: toISODate(addDays(NOW, 2)) }, NOW),
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, -10)) }, NOW), // past
    ];
    const map = nextLessonDates(lessons, NOW);
    expect(map.get('setar')).toBe(toISODate(addDays(NOW, 5)));
    expect(map.get('tar')).toBe(toISODate(addDays(NOW, 2)));
    expect(map.get('guitar')).toBeUndefined();
    expect(nextLessonFor(lessons, 'guitar', NOW)).toBeUndefined();
  });
});
