import { describe, expect, it, vi } from 'vitest';
import V11_TEXT from '../../tests/fixtures/practice-decisions-v11.json?raw';
import V12_TEXT from '../../tests/fixtures/practice-decisions-v12.json?raw';
import { serializeExport, validateDB, parseImport } from './io';
import { migrateToCurrent } from './migrations';
import { createSeedDB } from './seed';
import { createBlock, createItem, createLesson } from './factories';
import { blocksInWindow, nextLessonDates, nextLessonFor } from './selectors';
import { createPreparation, createQuestion, detachItem, detachLesson } from './lessonAgenda';
import { SCHEMA_VERSION, type PracticeDB } from './types';
import { addDays, nowISO, toISODate } from './util';
// The Zustand persist boundary (§C7's actual enforcement point, not just
// validateDB's own import-path callers) has no allowed dedicated store test
// file for this contract — the same situation routines.test.ts documents for
// the single-active-clock guard — so its regression coverage extends this
// ac-15 test instead of being left unproven.
import { useStore, getLastHydrationError } from '../store/useStore';

// The IndexedDB-backed persist storage doesn't exist in this test environment
// (no real indexedDB global) — same stub routines.test.ts uses, except the
// fake storage here is CONTROLLABLE per assertion: vi.hoisted keeps its state
// reachable from the mock factory (which Vitest hoists above these imports)
// without a temporal-dead-zone reference.
const fakeStorage = vi.hoisted(() => {
  let value: string | null = null;
  let setItemCalls = 0;
  return {
    get: () => value,
    set: (v: string | null) => {
      value = v;
    },
    recordSetItem: () => {
      setItemCalls += 1;
    },
    setItemCalls: () => setItemCalls,
  };
});
vi.mock('../store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store/idb')>();
  return {
    ...actual,
    idbStorage: {
      getItem: async () => fakeStorage.get(),
      setItem: async (_name: string, value: string) => {
        fakeStorage.recordSetItem();
        fakeStorage.set(value);
      },
      removeItem: async () => fakeStorage.set(null),
    },
  };
});

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
      // Truncated to one item on purpose (this test is about pathwaySteps,
      // not lesson agenda) — the seed's OWN agenda entries would otherwise
      // dangle against every item but this one, which the strict live-itemId
      // check now (correctly) refuses.
      lessonAgenda: [],
      pathwaySteps: [{ itemId: item.id, stageId: 'correct-stage' }],
    };
    // migrateToV5's overwrite behaviour wins over the old "fill only when
    // empty" precedence — the same result whichever path the data arrived by:
    // the chain directly, and the real import entry point.
    const viaChain = migrateToCurrent(legacy as unknown as PracticeDB, 4);
    expect(viaChain.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
    const viaImport = validateDB(legacy);
    expect(viaImport.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
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
      // Truncated to one item on purpose (see the sibling test above).
      lessonAgenda: [],
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

// ---------------------------------------------------------------------------
// ac-15 — C5/C6/C7: every inbound door, and what must be refused at it
// ---------------------------------------------------------------------------

// The exact bytes the browser journeys import through the real UI.

/** The shapes `validateDB` accepts, i.e. every door an inbound database uses. */
function doors(text: string): { label: string; payload: unknown }[] {
  const wrapped = JSON.parse(text) as { data: unknown };
  return [
    { label: 'full backup (data + files)', payload: JSON.parse(text) },
    { label: 'wrapped export', payload: { app: 'practice-compass', schemaVersion: 11, data: wrapped.data } },
    { label: 'bare database', payload: wrapped.data },
  ];
}

describe('the v12 model at every inbound door', () => {
  it('all inbound paths preserve the new model or reject before replacement', async () => {
    // 1. Every door migrates identically. `importFullBackup` (manual import,
    //    sync pull, Keep remote, archive restore) and the store's own
    //    `importDB` all route through THIS function, so a door that behaved
    //    differently would have to bypass it.
    const reference = JSON.stringify(validateDB(JSON.parse(V11_TEXT)));
    for (const { label, payload } of doors(V11_TEXT)) {
      expect(JSON.stringify(validateDB(payload)), label).toBe(reference);
    }

    // 2. A CURRENT v12 database round-trips with its agenda, question history,
    //    scheduling provenance and one-advance-per-day marker intact.
    const v12 = validateDB(JSON.parse(V12_TEXT));
    const enriched: PracticeDB = {
      ...v12,
      items: v12.items.map((i) =>
        i.id === 'i-scheduled'
          ? { ...i, nextReviewSource: 'user' as const, srLastProgressDay: '2026-08-01' }
          : i,
      ),
      lessonAgenda: v12.lessonAgenda.map((e) =>
        e.kind === 'question' && e.itemId === 'i-q-farsi'
          ? { ...e, askedAt: '2026-08-02T10:00:00.000Z', answer: 'بله، زینت را سبک‌تر کن.' }
          : e,
      ),
    };
    const round = validateDB(JSON.parse(serializeExport(enriched)));
    expect(round.lessonAgenda).toEqual(enriched.lessonAgenda);
    const scheduled = round.items.find((i) => i.id === 'i-scheduled')!;
    expect(scheduled.nextReviewSource).toBe('user');
    expect(scheduled.srLastProgressDay).toBe('2026-08-01');
    expect(scheduled.srReps).toBe(3);
    expect(scheduled.reviewMode).toBe('manual');

    // 3. INVALID NEW DATA is refused with actionable detail, and nothing is
    //    filtered away quietly — dropping an entry the owner wrote is the
    //    data loss this guard exists to prevent.
    const bad = (agenda: unknown[]) => () => validateDB({ ...v12, lessonAgenda: agenda });
    const sample = v12.lessonAgenda[0];
    expect(bad([{ ...sample, kind: 'reminder' }])).toThrow(/unknown kind/);
    expect(bad([{ ...sample, id: undefined }])).toThrow(/missing an id/);
    expect(bad([sample, { ...v12.lessonAgenda[1], id: sample.id }])).toThrow(/share the id/);
    expect(bad([{ ...sample, instrumentId: '' }])).toThrow(/missing its instrument/);
    expect(bad([{ ...sample, lessonId: 'L-guitar-past' }])).toThrow(/different instrument/);
    expect(bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: '  ' }])).toThrow(/has no text/);
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: 'yesterday' }]),
    ).toThrow(/unreadable asked date/);
    // An IMPOSSIBLE calendar timestamp is refused too, not merely an
    // unparseable one: `Date.parse` silently NORMALISES "2026-02-30" into
    // March 2nd rather than rejecting it, so a shape check (or `Date.parse`
    // alone) happily accepted it before this. A sealed review reproduced
    // exactly this string passing.
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: '2026-02-30T12:00:00.000Z' }]),
    ).toThrow(/unreadable asked date/);
    // A DANGLING live `lessonId` — set, but resolving to nothing — is neither
    // a real agenda entry nor an honest unassigned one: `deleteLesson` always
    // converts a live reference to a detached marker, so this app never
    // leaves one dangling, and it is refused rather than tolerated as legacy
    // debris.
    expect(bad([{ ...sample, lessonId: 'nonexistent' }])).toThrow(/class that no longer exists/);
    // A dangling `itemId` is REFUSED for the identical reason, not tolerated:
    // `deleteItem` (`useStore.ts`) always calls `detachItem` in the SAME
    // synchronous update that removes the item — a preparation naming it is
    // removed outright, and a question's `itemId` becomes
    // `detachedFromItemId` — so this app never leaves a LIVE `itemId`
    // dangling any more than a `lessonId`. A sealed review found this
    // previously tolerated on a theory the real producer above does not
    // support.
    expect(
      bad([{ kind: 'preparation', id: 'p', instrumentId: 'setar', itemId: 'nonexistent' }]),
    ).toThrow(/practice item that no longer exists/);
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', itemId: 'nonexistent' }]),
    ).toThrow(/practice item that no longer exists/);
    expect(() => validateDB({ ...v12, lessonAgenda: 'nope' })).toThrow(/must be a list/);
    // Calendar values are checked for real, not merely shape: a due date and
    // an item's own next-review date must both name a date that exists.
    expect(() =>
      validateDB({ ...v12, items: v12.items.map((i) => (i.id === 'i-scheduled' ? { ...i, nextReviewDate: '2027-99-99' } : i)) }),
    ).toThrow(/unreadable next-review date/);
    expect(() =>
      validateDB({ ...v12, reviews: v12.reviews.map((r) => ({ ...r, dueDate: '2026-02-30' })) }),
    ).toThrow(/unreadable due date/);
    // An INCOMPLETE conversion — a legacy field still set with no entry to
    // represent it — is converted rather than accepted as-is, because the
    // chain runs on every inbound database whatever version it claims.
    // Declaring schema 12 (the CURRENT version, not a legacy 11) is the real
    // counterexample: a version-gated conversion step would skip this
    // database entirely and accept the leftover field with zero questions to
    // show for it.
    const halfConverted = validateDB({
      ...v12,
      schemaVersion: 12,
      items: v12.items.map((i) => (i.id === 'i-flag-false' ? { ...i, teacherQuestion: 'left behind' } : i)),
    });
    expect(halfConverted.lessonAgenda.some((e) => e.kind === 'question' && e.text === 'left behind')).toBe(true);
    // A generated id that already names a DIFFERENT existing question is not
    // "already represented" merely by matching id/kind/itemId — the content
    // has to agree too. Both survive under distinct ids.
    const halfConvertedConflict = validateDB({
      ...v12,
      schemaVersion: 12,
      items: v12.items.map((i) => (i.id === 'i-flag-false' ? { ...i, teacherQuestion: 'a brand new question' } : i)),
      lessonAgenda: [
        ...v12.lessonAgenda,
        {
          id: 'question:i-flag-false',
          kind: 'question' as const,
          itemId: 'i-flag-false',
          instrumentId: 'setar',
          text: 'a completely different pre-existing question',
          createdAt: '2026-08-01T09:00:00.000Z',
          updatedAt: '2026-08-01T09:00:00.000Z',
        },
      ],
    });
    const conflictEntry = halfConvertedConflict.lessonAgenda.find((e) => e.id === 'question:i-flag-false');
    expect(conflictEntry?.kind === 'question' ? conflictEntry.text : undefined).toBe(
      'a completely different pre-existing question',
    );
    expect(
      halfConvertedConflict.lessonAgenda.some(
        (e) => e.kind === 'question' && e.itemId === 'i-flag-false' && e.text === 'a brand new question',
      ),
    ).toBe(true);

    // 4. LEGITIMATE unassigned and detached historical records PASS — proven
    //    against the REAL producer, not a hand-built approximation of its
    //    shape. `detachLesson` destructures `lessonId` OUT rather than
    //    setting it undefined; a JSON round-trip must still read that as
    //    genuinely absent, not as a lingering `null`/`undefined` key.
    const attached = createPreparation({ id: 'prep:real', itemId: 'i-premigrated', instrumentId: 'setar', lessonId: 'L-setar-1', now: NOW });
    const [reallyDetached] = JSON.parse(JSON.stringify(detachLesson([attached], 'L-setar-1', NOW))) as typeof v12.lessonAgenda;
    expect(reallyDetached).not.toHaveProperty('lessonId');
    expect(reallyDetached).toMatchObject({ detachedFromLessonId: 'L-setar-1' });
    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetached] })).not.toThrow();
    // The item-side equivalent, against the REAL producer `detachItem`
    // (`deleteItem`'s own path) rather than a hand-built approximation: it
    // destructures `itemId` OUT rather than setting it undefined, so the
    // strict live-itemId check just proven above must never see one here.
    const questionOnItem = createQuestion({ id: 'q:real', text: 'Real question', itemId: 'i-premigrated', instrumentId: 'setar', now: NOW });
    const [reallyDetachedQuestion] = JSON.parse(
      JSON.stringify(detachItem([questionOnItem], 'i-premigrated', NOW)),
    ) as typeof v12.lessonAgenda;
    expect(reallyDetachedQuestion).not.toHaveProperty('itemId');
    expect(reallyDetachedQuestion).toMatchObject({ detachedFromItemId: 'i-premigrated' });
    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetachedQuestion] })).not.toThrow();
    expect(() =>
      validateDB({
        ...v12,
        lessonAgenda: [
          { ...sample, lessonId: undefined, detachedFromLessonId: 'L-setar-past' },
          {
            kind: 'question',
            id: 'q-detached',
            instrumentId: 'setar',
            text: 'Asked about a piece I have since deleted',
            askedAt: '2026-02-01T00:00:00.000Z',
            answer: 'Yes.',
            detachedFromItemId: 'long-gone',
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
        ],
      }),
    ).not.toThrow();

    // 5. A NEWER schema is still refused outright rather than silently
    //    downgraded and stripped of whatever it added.
    expect(() => validateDB({ ...v12, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);

    // 6. No fake repair of old data: the v11 fixture's dangling instrument
    //    reference survives exactly as it arrived.
    const migrated = validateDB(JSON.parse(V11_TEXT));
    expect(migrated.items.find((i) => i.id === 'i-dangling')?.instrumentId).toBe('gone');
    expect(migrated.lessonAgenda.find((e) => e.itemId === 'i-dangling')?.instrumentId).toBe('gone');

    // 7. THE ACTUAL PERSISTED-HYDRATION BOUNDARY — a sealed review found that
    //    every check above, however thorough, only ever exercised
    //    `validateDB`'s own import-path callers. Zustand's persist
    //    `migrate`/`merge` called `migrateToCurrent` directly, bypassing both
    //    the newer-schema guard and every §C7 semantic check above: a
    //    version=13 database hydrated successfully relabelled as
    //    schemaVersion=12 (migrateToCurrent's own final line stamps the
    //    CURRENT version unconditionally), and an already-current v12
    //    database carrying a dangling live itemId or an impossible askedAt
    //    entered live state unchanged. Drive the REAL store through its own
    //    `persist.rehydrate()` — not a hand call to `migrate`/`merge` in
    //    isolation — so the actual wiring, including zustand's own
    //    no-write-back-on-a-thrown-migrate behaviour, is what's under test.
    const wrap = (db: unknown, version: number) => JSON.stringify({ state: { db }, version });

    // 7a. Valid CURRENT v12 data hydrates normally.
    fakeStorage.set(wrap(v12, SCHEMA_VERSION));
    await useStore.persist.rehydrate();
    expect(getLastHydrationError()).toBeNull();
    expect(useStore.getState().hydrated).toBe(true);
    expect(useStore.getState().db.lessonAgenda.length).toBe(v12.lessonAgenda.length);

    // 7b. Valid OLDER data migrates then hydrates — and, unlike the refusals
    //     below, genuinely gets written back (a real upgrade worth saving).
    const setItemsBeforeUpgrade = fakeStorage.setItemCalls();
    fakeStorage.set(wrap((JSON.parse(V11_TEXT) as { data: unknown }).data, 11));
    await useStore.persist.rehydrate();
    expect(getLastHydrationError()).toBeNull();
    expect(useStore.getState().db.schemaVersion).toBe(SCHEMA_VERSION);
    expect(useStore.getState().db.items.find((i) => i.id === 'i-dangling')?.instrumentId).toBe('gone');
    expect(fakeStorage.setItemCalls()).toBeGreaterThan(setItemsBeforeUpgrade);

    // 7c. INVALID current-v12 data — the exact sealed counterexample, a
    //     dangling live itemId — is refused. The previously live database is
    //     preserved BY REFERENCE (nothing was ever `set()`), and nothing is
    //     written back over whatever is actually on disk: refusing must not
    //     itself become a write, or a refusal of genuinely newer data (7d)
    //     would silently destroy it the moment this build merely NOTICES the
    //     problem.
    const sentinel = useStore.getState().db;
    const setItemsBeforeRefusal = fakeStorage.setItemCalls();
    const badCurrent: PracticeDB = {
      ...v12,
      lessonAgenda: [
        ...v12.lessonAgenda,
        {
          kind: 'question',
          id: 'q-hydration-refused',
          instrumentId: 'setar',
          text: 'x',
          itemId: 'nonexistent',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    fakeStorage.set(wrap(badCurrent, SCHEMA_VERSION));
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinel);
    expect(getLastHydrationError()).toMatch(/practice item that no longer exists/);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeRefusal);

    // 7d. A NEWER-than-supported schema is refused — never passed through
    //     migrateToCurrent and relabelled as the current version, and never
    //     written back over the (unreadable but genuinely newer) original.
    const sentinelNewer = useStore.getState().db;
    const setItemsBeforeNewer = fakeStorage.setItemCalls();
    fakeStorage.set(wrap({ ...v12, schemaVersion: SCHEMA_VERSION + 1 }, SCHEMA_VERSION + 1));
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinelNewer);
    expect(getLastHydrationError()).toMatch(/newer version/i);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeNewer);

    // 7e. REPEATED hydration stays safe: refusing the identical newer-schema
    //     data twice in a row is idempotent (same refusal, live state never
    //     mutated, and still no write-back the second time either)...
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinelNewer);
    expect(getLastHydrationError()).toMatch(/newer version/i);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeNewer);
    // ...and re-hydrating the same valid data twice in a row produces
    // byte-identical live state both times.
    fakeStorage.set(wrap(v12, SCHEMA_VERSION));
    await useStore.persist.rehydrate();
    const firstHydrate = JSON.stringify(useStore.getState().db);
    await useStore.persist.rehydrate();
    expect(JSON.stringify(useStore.getState().db)).toBe(firstHydrate);
    expect(getLastHydrationError()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ac-16 — C8: the rollout / rollback route
// ---------------------------------------------------------------------------

describe('the documented rollback route', () => {
  it('rollback fixtures preserve exports without pretending v12 can be downgraded', () => {
    // The owner's PRE-UPGRADE export restores into this build, upgrading
    // deterministically — the same result twice, whatever day it is run.
    const first = validateDB(JSON.parse(V11_TEXT));
    const second = validateDB(JSON.parse(V11_TEXT));
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.schemaVersion).toBe(SCHEMA_VERSION);

    // Attachment METADATA and the fixture's file bytes both survive the trip:
    // the metadata through the database, the bytes as the backup's own files
    // array, which `importFullBackup` writes before the data is installed.
    expect(first.attachments).toHaveLength(1);
    expect(first.attachments[0]).toMatchObject({ id: 'att-1', ownerType: 'item', ownerId: 'i-scheduled' });
    const files = (JSON.parse(V11_TEXT) as { files: { id: string; data: string }[] }).files;
    expect(files.map((f) => f.id)).toEqual(['att-1']);
    expect(atob(files[0].data)).toBe('score bytes');

    // A POST-UPGRADE export keeps everything v12 added — answers, manual
    // dates, provenance and SR state.
    const answered: PracticeDB = {
      ...first,
      lessonAgenda: first.lessonAgenda.map((e) =>
        e.kind === 'question' && e.itemId === 'i-q-only'
          ? { ...e, lessonId: 'L-setar-1', askedAt: '2027-03-05T10:00:00.000Z', answer: 'Tone first.' }
          : e,
      ),
    };
    const restored = validateDB(JSON.parse(serializeExport(answered)));
    const q = restored.lessonAgenda.find((e) => e.kind === 'question' && e.itemId === 'i-q-only')!;
    expect(q).toMatchObject({ lessonId: 'L-setar-1', answer: 'Tone first.' });
    expect(q.kind === 'question' && q.askedAt).toBe('2027-03-05T10:00:00.000Z');
    const manual = restored.items.find((i) => i.id === 'i-scheduled')!;
    expect(manual.nextReviewDate).toBe('2027-01-15');
    expect(manual.srEase).toBe(2.6);

    // THERE IS NO DOWNGRADE. An older build refuses a v12 file outright, and
    // this build must not pretend otherwise by rewriting the number or
    // dropping the new fields: the exported file says 12 and carries them.
    const exported = JSON.parse(serializeExport(answered)) as { schemaVersion: number; data: PracticeDB };
    expect(exported.schemaVersion).toBe(SCHEMA_VERSION);
    expect(exported.data.lessonAgenda.length).toBeGreaterThan(0);
    expect(() => validateDB({ ...first, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);
    // An old v11 build can only restore an explicitly chosen PRE-upgrade
    // backup — which still exists, unchanged, and still says 11.
    expect((JSON.parse(V11_TEXT) as { schemaVersion: number }).schemaVersion).toBe(11);
  });
});
