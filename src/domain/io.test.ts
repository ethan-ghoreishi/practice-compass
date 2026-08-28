import { describe, expect, it } from 'vitest';
import { validateDB, parseImport } from './io';
import { createSeedDB } from './seed';
import { createBlock, createItem, createLesson } from './factories';
import { blocksInWindow, nextLessonDates, nextLessonFor } from './selectors';
import { SCHEMA_VERSION } from './types';
import { addDays, nowISO, toISODate } from './util';

const NOW = new Date('2026-06-18T12:00:00.000Z');

describe('validateDB — backward-compatible import', () => {
  it('round-trips a current export untouched', () => {
    const db = createSeedDB(NOW);
    const out = validateDB({ app: 'practice-compass', data: db });
    expect(out.items.length).toBe(db.items.length);
    expect(out.lessons.length).toBe(db.lessons.length);
  });

  it('folds a legacy attachment itemId into ownerType and ownerId', () => {
    const db = createSeedDB(NOW);
    const legacy = {
      ...db,
      schemaVersion: 5,
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

  it('treats a missing schemaVersion as the oldest and runs the whole chain', () => {
    // Pre-v3 shaped: no `pathways` key at all, and no schemaVersion field.
    const legacy = {
      instruments: [{ id: 'i-setar', name: 'Setar', family: 'Persian', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }],
      materials: [],
      items: [],
      blocks: [],
      reviews: [],
    };
    const out = validateDB(legacy);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
  });

  it('places a legacy pathwaySteps item into its stage on every path', () => {
    const db = createSeedDB(NOW);
    const item = { ...db.items[0], stageId: 'stale-stage' };
    const legacy = {
      ...db,
      schemaVersion: 4,
      items: [item],
      pathwaySteps: [{ itemId: item.id, stageId: 'correct-stage' }],
    };
    const out = validateDB(legacy);
    // migrateToV5's overwrite behaviour wins over the old "fill only when
    // empty" precedence — the same result whichever path the data arrived by.
    expect(out.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
  });

  it('returns a legacy backup with no schemaVersion fully migrated', () => {
    const db = createSeedDB(NOW);
    const item = db.items[0];
    const legacy: Record<string, unknown> = {
      instruments: db.instruments,
      materials: db.materials,
      items: [{ ...item, stageId: undefined }],
      blocks: db.blocks,
      reviews: db.reviews,
      pathwaySteps: [{ itemId: item.id, stageId: 'legacy-stage' }],
      attachments: [
        { id: 'att-legacy', itemId: item.id, name: 'notes.pdf', mime: 'application/pdf', size: 10, kind: 'pdf', createdAt: '2025-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(legacy);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
    expect(out.items.find((i) => i.id === item.id)?.stageId).toBe('legacy-stage');
    expect(out.attachments[0].ownerType).toBe('item');
    expect(out.attachments[0].ownerId).toBe(item.id);
    expect(out.lessons).toEqual([]);
  });

  it('rejects a database from a newer schema version instead of downgrading it', () => {
    const db = createSeedDB(NOW);
    const fromTheFuture = {
      app: 'practice-compass' as const,
      schemaVersion: SCHEMA_VERSION + 1,
      exportedAt: nowISO(NOW),
      data: { ...db, schemaVersion: SCHEMA_VERSION + 1 },
    };
    const result = parseImport(JSON.stringify(fromTheFuture));
    expect(result.ok).toBe(false);
    expect(() => validateDB(fromTheFuture)).toThrow(/newer version/i);
  });

  it('keeps legacy pathwaySteps placements when imported through the real entry point', () => {
    const db = createSeedDB(NOW);
    const item = { ...db.items[0], stageId: undefined };
    const legacyText = JSON.stringify({
      ...db,
      schemaVersion: undefined,
      items: [item],
      pathwaySteps: [{ itemId: item.id, stageId: 'from-pathway-steps' }],
    });
    const result = parseImport(legacyText);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.db.items.find((i) => i.id === item.id)?.stageId).toBe('from-pathway-steps');
    }
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
