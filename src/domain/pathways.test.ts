import { describe, expect, it } from 'vitest';
import { itemFromCatalogEntry } from './factories';
import {
  catalogForStage,
  offeredDefaultPathways,
  planDefaultPathways,
  SEED_PATHWAY_IDS,
  seedInstrumentIds,
  seedPathways,
  stageIdFor,
} from './pathwaySeed';
import {
  currentStage,
  groupStages,
  isLosslesslyRemovable,
  itemStageState,
  nextUnitInStage,
  pathwayProgress,
  stageProgress,
  stagesOfPathway,
  stageUnits,
} from './pathways';
import { createItem } from './factories';
import { validateDB } from './io';
import { migrateToCurrent } from './migrations';
import { detachRoutinesFromPathway } from './routines';
import { pathwaysForInstrumentFilter } from './selectors';
import { createSeedDB } from './seed';
import type { PracticeDB, PracticeItem } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const seed = seedPathways({ guitar: 'g', setar: 's', tar: 't' }, NOW);

const AFSHARI = stageIdFor(SEED_PATHWAY_IDS.setar, 'Afshārī');

function itemIn(stageId: string, catalogKey: string | undefined, o: Partial<PracticeItem> = {}): PracticeItem {
  const base = createItem(
    { instrumentId: 's', title: o.title ?? 'x', stageId, catalogKey, status: o.status ?? 'new' },
    NOW,
  );
  return { ...base, ...o };
}

describe('seeded pathways & catalog', () => {
  it('seeds Guitar, Setar and Tar with stages and routines (no persisted steps)', () => {
    // Setar, Tar (Honarestān), Guitar — and the Khonyagar Tar course appended.
    expect(seed.pathways.map((p) => p.id)).toEqual(['setar-radif', 'tar-honarestan', 'cgs', 'tar-khonyagar']);
    expect(seed.pathwayStages.length).toBeGreaterThan(30);
    expect(seed.pathwayRoutines.length).toBeGreaterThan(0);
  });

  it('provides a reference catalog per stage with stable keys', () => {
    const entries = catalogForStage(AFSHARI);
    expect(entries.map((e) => e.key)).toContain('iraq');
    expect(entries.map((e) => e.key)).toContain('daramad');
  });
});

describe('itemStageState', () => {
  it('maps mastery status onto todo / in-progress / done', () => {
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'new' }))).toBe('todo');
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'repairing' }))).toBe('in_progress');
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'integrated' }))).toBe('done');
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'new', timesPractised: 2 }))).toBe('in_progress');
  });
});

describe('stageUnits', () => {
  const stage = seed.pathwayStages.find((s) => s.id === AFSHARI)!;

  it('lays your items over the catalog and appends off-catalog items', () => {
    const mine = [
      itemIn(AFSHARI, 'iraq', { title: 'Iraq phrase 4', status: 'repairing' }),
      itemIn(AFSHARI, undefined, { title: 'Teacher qet‘e in Afshārī' }),
    ];
    const units = stageUnits(stage, mine);
    const iraq = units.find((u) => u.key === 'iraq')!;
    expect(iraq.item?.title).toBe('Iraq phrase 4');
    expect(iraq.state).toBe('in_progress');
    // catalog-only entry stays a suggestion
    expect(units.find((u) => u.key === 'daramad')?.item).toBeUndefined();
    // the custom item is appended as its own unit
    expect(units.some((u) => u.title === 'Teacher qet‘e in Afshārī')).toBe(true);
    expect(units.length).toBe(catalogForStage(AFSHARI).length + 1);
  });

  it('ignores items placed in other stages', () => {
    const other = [itemIn(stageIdFor(SEED_PATHWAY_IDS.setar, 'Shur'), 'kereshmeh')];
    const units = stageUnits(stage, other);
    expect(units.every((u) => !u.item)).toBe(true);
  });
});

describe('progress & navigation', () => {
  const stages = stagesOfPathway(seed.pathwayStages, SEED_PATHWAY_IDS.setar);
  const first = stages[0];

  it('stageProgress counts done/in-progress from item mastery', () => {
    const stage = seed.pathwayStages.find((s) => s.id === AFSHARI)!;
    const catalogSize = catalogForStage(AFSHARI).length;
    const mine = [
      itemIn(AFSHARI, 'iraq', { status: 'integrated' }),
      itemIn(AFSHARI, 'daramad', { status: 'repairing' }),
    ];
    const sp = stageProgress(stageUnits(stage, mine));
    expect(sp.total).toBe(catalogSize);
    expect(sp.done).toBe(1);
    expect(sp.inProgress).toBe(1);
    expect(sp.addedItems).toBe(2);
    expect(sp.complete).toBe(false);
  });

  it('currentStage is the first incomplete stage', () => {
    expect(currentStage(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar)?.id).toBe(first.id);

    // Complete every catalog unit of the first stage → current advances.
    const done = catalogForStage(first.id).map((e) =>
      itemIn(first.id, e.key, { status: 'integrated' }),
    );
    expect(currentStage(seed.pathwayStages, done, SEED_PATHWAY_IDS.setar)?.id).toBe(stages[1].id);
  });

  it('nextUnitInStage prefers in-progress, else first to-do', () => {
    const stage = seed.pathwayStages.find((s) => s.id === AFSHARI)!;
    expect(nextUnitInStage(stage, [])?.key).toBe(catalogForStage(AFSHARI)[0].key);
    const mine = [itemIn(AFSHARI, 'iraq', { status: 'fragile' })];
    expect(nextUnitInStage(stage, mine)?.key).toBe('iraq');
  });

  it('pathwayProgress aggregates across stages', () => {
    const p = pathwayProgress(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar);
    expect(p.stagesTotal).toBe(stages.length);
    expect(p.total).toBeGreaterThan(stages.length);
    expect(p.done).toBe(0);
  });

  it('groupStages keeps order and groups by heading', () => {
    const groups = groupStages(stages);
    // Setar section headings are now Farsi (built-in Persian-music data).
    expect(groups[0].group).toBe('مبانی');
    expect(groups.some((g) => g.group === 'دستگاه شور و آوازهای آن')).toBe(true);
  });

  it('a user-pinned stage wins over "first incomplete" (teacher-led paths)', () => {
    // Nothing complete → fallback is the first stage…
    expect(currentStage(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar)?.id).toBe(first.id);
    // …but a pin (e.g. "we are in Afshārī now") takes precedence.
    expect(currentStage(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar, AFSHARI)?.id).toBe(AFSHARI);
    // A stale pin (deleted stage / other pathway) falls back safely.
    expect(currentStage(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar, 'gone')?.id).toBe(first.id);
  });
});

describe('itemFromCatalogEntry', () => {
  it('creates an honest "Not practised yet" item — no implied progress', () => {
    const entry = catalogForStage(AFSHARI).find((e) => e.key === 'iraq')!;
    const item = itemFromCatalogEntry(entry, 'setar-1', NOW);
    expect(item.status).toBe('new');
    expect(item.timesPractised).toBe(0);
    expect(item.totalMinutes).toBe(0);
    expect(item.lastPractisedAt).toBeUndefined();
    expect(item.stageId).toBe(AFSHARI);
    expect(item.catalogKey).toBe('iraq');
    expect(item.instrumentId).toBe('setar-1');
  });
});

describe('isLosslesslyRemovable', () => {
  const fresh = itemIn(AFSHARI, 'iraq', { status: 'new', timesPractised: 0 });

  it('is true for a fresh catalog item with no blocks', () => {
    expect(isLosslesslyRemovable(fresh, [])).toBe(true);
  });

  it('is false once any block is logged against it', () => {
    // A block existing is enough even if stats weren't recomputed.
    expect(isLosslesslyRemovable(fresh, [{ practiceItemId: fresh.id } as never])).toBe(false);
  });

  it('is false once it has been practised (timesPractised > 0)', () => {
    expect(isLosslesslyRemovable({ ...fresh, timesPractised: 1 }, [])).toBe(false);
  });

  it('is false once its status has moved on', () => {
    expect(isLosslesslyRemovable({ ...fresh, status: 'fragile' }, [])).toBe(false);
  });

  it('is false for a hand-made item (no catalogKey)', () => {
    expect(isLosslesslyRemovable(itemIn(AFSHARI, undefined, { status: 'new' }), [])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ac-15 — the course import adds keys, it never renames one.
//
// Bringing the real course into the pathway replaced eighteen levels of generic
// placeholders with the sections the course actually teaches. An item the owner
// had already added carries the placeholder's key, so if a real section took a
// differently-named key that item would still show in the stage — silently
// DETACHED from its suggestion, as a non-catalogue unit. Every stage id and
// every key that existing data may reference is therefore recorded here as it
// stood BEFORE the import, and must still resolve after it.
// ---------------------------------------------------------------------------

/** Exactly what `cgsOutline()` produced per level, and 1A's hand-authored keys. */
const CGS_KEYS_BEFORE_THE_COURSE_IMPORT: Record<string, string[]> = {
  '1A': [
    'warm-up-stretches',
    'finger-walking',
    'contrast-practice-right-hand',
    'chunks-right-hand-only',
    'thumb-chunks-right-hand-only',
    '3-note-chords',
    '3-note-chords-with-chunks',
    'rhythm-practice-1-clap-count-aloud',
    'notes-on-the-1st-string',
    'sight-reading-practice-1-play-along',
    'piece-the-forest-glade',
    'reading-music-how-notes-work-musical-notation',
    'technique-primer-what-is-technique',
    'checkpoint-ready-for-1b',
  ],
  '1B': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '1C': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '1D': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '1E': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '1F': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '2A': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '2B': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '2C': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '2D': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '2E': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '2F': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'piece', 'other-study'],
  '3A': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'phrasing', 'piece', 'other-study'],
  '3B': ['chords', 'arpeggios', 'scales', 'fretboard-mastery', 'exercises', 'rhythm-study', 'sight-reading', 'phrasing', 'piece', 'other-study'],
  '3C': ['chords', 'arpeggios', 'scales', 'fretboard-mastery', 'exercises', 'rhythm-study', 'sight-reading', 'phrasing', 'piece', 'other-study'],
  '3D': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'phrasing', 'piece', 'practice-skills'],
  '3E': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'phrasing', 'piece', 'practice-skills'],
  '3F': ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'phrasing', 'piece', 'other-study'],
};

describe('the CGS course import and what existing data may reference', () => {
  it('CGS stage ids and catalog keys stay stable across the course import', () => {
    for (const [code, keys] of Object.entries(CGS_KEYS_BEFORE_THE_COURSE_IMPORT)) {
      const stageId = stageIdFor(SEED_PATHWAY_IDS.guitar, code);
      // The stage id itself is what an item's `stageId` holds.
      expect(seed.pathwayStages.map((s) => s.id)).toContain(stageId);
      const present = catalogForStage(stageId).map((e) => e.key);
      for (const key of keys) {
        expect(present, `${stageId} lost catalog key "${key}"`).toContain(key);
      }
    }
  });

  it('keeps Level 1A exactly as it was hand-authored — same keys, in the same order', () => {
    const stageId = stageIdFor(SEED_PATHWAY_IDS.guitar, '1A');
    expect(catalogForStage(stageId).map((e) => e.key)).toEqual(CGS_KEYS_BEFORE_THE_COURSE_IMPORT['1A']);
  });

  it('gives each preserved key to the section it actually names, and never to two at once', () => {
    // A duplicate key is two sections claiming ONE item: `stageUnits` maps a key
    // to a single item and `addFromCatalog` takes the first entry under it. The
    // scanner refuses to emit one, and this holds the generated data to it.
    for (const code of Object.keys(CGS_KEYS_BEFORE_THE_COURSE_IMPORT)) {
      const keys = catalogForStage(stageIdFor(SEED_PATHWAY_IDS.guitar, code)).map((e) => e.key);
      expect(new Set(keys).size, `${code} has a duplicate catalog key`).toBe(keys.length);
    }

    // And where a level ships two folders of one family, the preserved key goes
    // to the section with real content — 2E's `08_Sight_Reading` is an empty
    // stub beside the real `09_Sight_Reading`, and first-by-ordinal would have
    // left an already-added item attached to the titleless one while the
    // level's own routine named the other.
    const twoE = catalogForStage(stageIdFor(SEED_PATHWAY_IDS.guitar, '2E'));
    expect(twoE.find((e) => e.key === 'sight-reading')?.title).toBe(
      '2E Sight-Reading: All Strings (3 PDFs)',
    );
  });

  it('adds real sections rather than renaming one — every level gained entries', () => {
    for (const code of Object.keys(CGS_KEYS_BEFORE_THE_COURSE_IMPORT)) {
      if (code === '1A') continue;
      const stageId = stageIdFor(SEED_PATHWAY_IDS.guitar, code);
      expect(catalogForStage(stageId).length).toBeGreaterThan(
        CGS_KEYS_BEFORE_THE_COURSE_IMPORT[code].length,
      );
    }
  });
});

describe('adding a missing shipped default pathway to an existing database', () => {
  // A real install from before the Khonyagar course shipped: the demo seed's
  // own Setar / Tar / Classical Guitar instruments and seeded pathways, then
  // lived in — an owner pathway, a renamed seeded pathway with a pinned stage,
  // an owner stage inside it and an owner routine.
  const LATER = new Date('2026-09-23T12:00:00.000Z');
  const KHONYAGAR = 'tar-khonyagar';

  function existingDb(missing: string[] = [KHONYAGAR]): PracticeDB {
    const shipped = createSeedDB(NOW);
    const tar = shipped.instruments.find((i) => i.name === 'Tar')!;
    const ts = NOW.toISOString();
    return {
      ...shipped,
      pathways: [
        ...shipped.pathways
          .filter((p) => !missing.includes(p.id))
          .map((p) => (p.id === SEED_PATHWAY_IDS.setar ? { ...p, name: 'My Setar radif', currentStageId: AFSHARI } : p)),
        { id: 'owner-path', instrumentId: tar.id, name: 'Tar · my teacher', order: 9, createdAt: ts, updatedAt: ts },
      ],
      pathwayStages: [
        ...shipped.pathwayStages.filter((s) => !missing.includes(s.pathwayId)),
        { id: 'owner-stage', pathwayId: SEED_PATHWAY_IDS.setar, code: 'Mine', title: 'Teacher extras', order: 99, createdAt: ts, updatedAt: ts },
      ],
      pathwayRoutines: [
        ...shipped.pathwayRoutines.filter((r) => !r.pathwayId || !missing.includes(r.pathwayId)),
        { id: 'owner-routine', instrumentId: tar.id, name: 'My Tar warm-up', segments: [{ label: 'Scales', minutes: 5 }], order: 0, createdAt: ts, updatedAt: ts },
      ],
    };
  }
  const instrumentIds = (db: PracticeDB) => seedInstrumentIds(db.instruments);
  const expectPrefix = <T,>(next: T[], prev: T[]) => prev.forEach((x, i) => expect(next[i]).toBe(x));

  it('offers only the shipped default pathway an existing database is missing', () => {
    const db = existingDb();
    const tar = db.instruments.find((i) => i.name === 'Tar')!;
    const offered = offeredDefaultPathways(db, LATER);
    expect(offered.map((p) => p.id)).toEqual([KHONYAGAR]);
    expect(offered[0].instrumentId).toBe(tar.id);
    // The renamed seeded pathway is present by id, so it is never offered again.
    expect(offered.map((p) => p.id)).not.toContain(SEED_PATHWAY_IDS.setar);
  });

  it('adds the chosen missing pathway with its stages and leaves every existing pathway, stage and routine untouched', () => {
    const db = existingDb();
    const next = planDefaultPathways(db, [KHONYAGAR], LATER);
    const expected = seedPathways(instrumentIds(db), LATER);

    // Only the pathway collections come back — nothing else is the plan's to touch.
    expect(Object.keys(next).sort()).toEqual(['pathwayRoutines', 'pathwayStages', 'pathways']);

    expect(next.pathways).toHaveLength(db.pathways.length + 1);
    expectPrefix(next.pathways, db.pathways);
    expect(next.pathways.at(-1)).toEqual(expected.pathways.find((p) => p.id === KHONYAGAR));
    const renamed = next.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar)!;
    expect([renamed.name, renamed.currentStageId]).toEqual(['My Setar radif', AFSHARI]);

    const khonyagarStages = expected.pathwayStages.filter((s) => s.pathwayId === KHONYAGAR);
    expect(khonyagarStages.length).toBeGreaterThan(0);
    expect(next.pathwayStages).toHaveLength(db.pathwayStages.length + khonyagarStages.length);
    expectPrefix(next.pathwayStages, db.pathwayStages);
    expect(next.pathwayStages.slice(db.pathwayStages.length)).toEqual(khonyagarStages);

    // The course ships no routine, so the routines array is not even copied.
    expect(next.pathwayRoutines).toBe(db.pathwayRoutines);

    // What the store would install is accepted at every inbound door.
    expect(() => validateDB({ ...db, ...next })).not.toThrow();
    expect(offeredDefaultPathways({ ...db, ...next }, LATER)).toEqual([]);
  });

  it('offers nothing and returns the same collections when every default pathway is present', () => {
    const db = existingDb([]);
    expect(offeredDefaultPathways(db, LATER)).toEqual([]);
    for (const ids of [[], [KHONYAGAR], seedPathways(instrumentIds(db), LATER).pathways.map((p) => p.id)]) {
      const next = planDefaultPathways(db, ids, LATER);
      // Identity is the store's no-op signal: no set(), no rev bump, no sync.
      expect(next.pathways).toBe(db.pathways);
      expect(next.pathwayStages).toBe(db.pathwayStages);
      expect(next.pathwayRoutines).toBe(db.pathwayRoutines);
    }
  });

  it('adds only the pathway chosen and ignores an id that is present or was never shipped', () => {
    const db = existingDb([KHONYAGAR, SEED_PATHWAY_IDS.guitar]);
    expect(offeredDefaultPathways(db, LATER).map((p) => p.id)).toEqual([SEED_PATHWAY_IDS.guitar, KHONYAGAR]);

    const next = planDefaultPathways(db, [SEED_PATHWAY_IDS.guitar], LATER);
    const expected = seedPathways(instrumentIds(db), LATER);
    expect(next.pathways.slice(db.pathways.length).map((p) => p.id)).toEqual([SEED_PATHWAY_IDS.guitar]);
    expect(next.pathwayStages.slice(db.pathwayStages.length)).toEqual(
      expected.pathwayStages.filter((s) => s.pathwayId === SEED_PATHWAY_IDS.guitar),
    );
    const cgsRoutines = expected.pathwayRoutines.filter((r) => r.pathwayId === SEED_PATHWAY_IDS.guitar);
    expect(cgsRoutines.length).toBeGreaterThan(0);
    expect(next.pathwayRoutines.slice(db.pathwayRoutines.length)).toEqual(cgsRoutines);
    expectPrefix(next.pathways, db.pathways);
    expectPrefix(next.pathwayStages, db.pathwayStages);
    expectPrefix(next.pathwayRoutines, db.pathwayRoutines);
    // Khonyagar was offered too, and not chosen.
    expect(next.pathways.some((p) => p.id === KHONYAGAR)).toBe(false);

    for (const ids of [[SEED_PATHWAY_IDS.setar], ['never-shipped'], [SEED_PATHWAY_IDS.tar, 'never-shipped']]) {
      const noop = planDefaultPathways(db, ids, LATER);
      expect(noop.pathways).toBe(db.pathways);
      expect(noop.pathwayStages).toBe(db.pathwayStages);
      expect(noop.pathwayRoutines).toBe(db.pathwayRoutines);
    }
  });

  it('never duplicates or re-places a routine the owner kept after deleting a default pathway', () => {
    // The owner deleted Classical Guitar Shed the way `deletePathway` does: its
    // stages go, and its routines are DETACHED by the real helper, not deleted.
    const lived = existingDb([]);
    const cgs = SEED_PATHWAY_IDS.guitar;
    const db: PracticeDB = {
      ...lived,
      pathways: lived.pathways.filter((p) => p.id !== cgs),
      pathwayStages: lived.pathwayStages.filter((s) => s.pathwayId !== cgs),
      pathwayRoutines: detachRoutinesFromPathway(lived.pathwayRoutines, cgs, NOW),
    };
    const kept = db.pathwayRoutines.filter((r) => r.id.startsWith(`${cgs}-routine-`));
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((r) => r.pathwayId === undefined && r.stageId === undefined)).toBe(true);

    expect(offeredDefaultPathways(db, LATER).map((p) => p.id)).toEqual([cgs]);
    const next = planDefaultPathways(db, [cgs], LATER);
    const expected = seedPathways(instrumentIds(db), LATER);

    expect(next.pathways.at(-1)?.id).toBe(cgs);
    expect(next.pathwayStages.slice(db.pathwayStages.length)).toEqual(
      expected.pathwayStages.filter((s) => s.pathwayId === cgs),
    );
    // Every seeded routine id is already held, detached — none is added again,
    // and each kept routine is the very same object, still unplaced.
    expect(next.pathwayRoutines).toBe(db.pathwayRoutines);
    const ids = next.pathwayRoutines.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);

    // A seeded routine the owner deleted outright is not held, so it returns
    // placed — skipping is by id, not a blanket "no routines".
    const [gone, ...stillKept] = kept;
    const pruned = { ...db, pathwayRoutines: db.pathwayRoutines.filter((r) => r.id !== gone.id) };
    const replanned = planDefaultPathways(pruned, [cgs], LATER);
    expect(replanned.pathwayRoutines.slice(pruned.pathwayRoutines.length)).toEqual([
      expected.pathwayRoutines.find((r) => r.id === gone.id),
    ]);
    stillKept.forEach((r) => expect(replanned.pathwayRoutines.find((x) => x.id === r.id)).toBe(r));
  });

  it('does not offer a default pathway whose instrument this device does not have', () => {
    const lived = existingDb([KHONYAGAR, SEED_PATHWAY_IDS.guitar]);
    const db: PracticeDB = { ...lived, instruments: lived.instruments.filter((i) => !/guitar/i.test(i.name)) };
    expect(seedInstrumentIds(db.instruments).guitar).toBe('');

    expect(offeredDefaultPathways(db, LATER).map((p) => p.id)).toEqual([KHONYAGAR]);
    const noop = planDefaultPathways(db, [SEED_PATHWAY_IDS.guitar], LATER);
    expect(noop.pathways).toBe(db.pathways);
    expect(noop.pathwayStages).toBe(db.pathwayStages);
    expect(noop.pathwayRoutines).toBe(db.pathwayRoutines);
    // Asked for both, only the one this device can play arrives — never an
    // unscoped ('' instrument) Guitar pathway.
    const both = planDefaultPathways(db, [SEED_PATHWAY_IDS.guitar, KHONYAGAR], LATER);
    expect(both.pathways.slice(db.pathways.length).map((p) => p.id)).toEqual([KHONYAGAR]);
    expect(both.pathways.every((p) => p.instrumentId !== '')).toBe(true);
  });

  // Persian names, escaped so a lost ZWNJ cannot silently weaken the test.
  const SETAR_FA = '\u0633\u0647\u200c\u062a\u0627\u0631'; // سه‌تار
  const SETAR_FA_SPACED = '\u0633\u0647 \u062a\u0627\u0631'; // سه تار
  const TAR_FA = '\u062a\u0627\u0631'; // تار

  it('never mistakes a Persian-named Setar for Tar when offering a default pathway', () => {
    const lived = existingDb();
    // The seed's own instruments renamed in place: ids kept, Setar still first.
    const named = (setarName: string): PracticeDB => ({
      ...lived,
      instruments: lived.instruments.map((i) =>
        i.name === 'Setar' ? { ...i, name: setarName } : i.name === 'Tar' ? { ...i, name: TAR_FA } : i,
      ),
    });
    const db = named(SETAR_FA);
    const setarId = db.instruments.find((i) => i.name === SETAR_FA)!.id;
    const tarId = db.instruments.find((i) => i.name === TAR_FA)!.id;
    expect(db.instruments[0].id).toBe(setarId);

    for (const spelling of [SETAR_FA, SETAR_FA_SPACED]) {
      const ids = seedInstrumentIds(named(spelling).instruments);
      expect([ids.setar, ids.tar]).toEqual([setarId, tarId]);
    }

    const offered = offeredDefaultPathways(db, LATER);
    expect(offered.map((p) => [p.id, p.instrumentId])).toEqual([[KHONYAGAR, tarId]]);
    expect(pathwaysForInstrumentFilter(offered, setarId)).toEqual([]);
    expect(pathwaysForInstrumentFilter(offered, tarId).map((p) => p.id)).toEqual([KHONYAGAR]);

    // No Tar at all: the Tar course is not offered on the Setar, and cannot be planned.
    const noTar: PracticeDB = { ...db, instruments: db.instruments.filter((i) => i.id !== tarId) };
    expect(seedInstrumentIds(noTar.instruments).tar).toBe('');
    expect(offeredDefaultPathways(noTar, LATER)).toEqual([]);
    const noop = planDefaultPathways(noTar, [KHONYAGAR], LATER);
    expect(noop.pathways).toBe(noTar.pathways);
    expect(noop.pathwayStages).toBe(noTar.pathwayStages);
    expect(noop.pathwayRoutines).toBe(noTar.pathwayRoutines);
  });

  it("seeds a pre-v3 database's Tar pathways on the real Tar, never a Persian-named Setar", () => {
    const ts = '2025-01-01T00:00:00.000Z';
    // A raw pre-v3 database: no `pathways` key at all, and the old `curriculum`.
    const raw = {
      schemaVersion: 2,
      instruments: [
        { id: 'i-setar', name: SETAR_FA, family: 'Persian', active: true, createdAt: ts, updatedAt: ts },
        { id: 'i-tar', name: TAR_FA, family: 'Persian', active: true, createdAt: ts, updatedAt: ts },
      ],
      materials: [],
      items: [],
      blocks: [],
      reviews: [],
      curriculum: {},
    } as unknown as PracticeDB;
    const out = migrateToCurrent(raw, 2);
    const on = (id: string) => out.pathways.find((p) => p.id === id)?.instrumentId;
    expect(on(SEED_PATHWAY_IDS.setar)).toBe('i-setar');
    expect(on(SEED_PATHWAY_IDS.tar)).toBe('i-tar');
    expect(on(KHONYAGAR)).toBe('i-tar');
  });
});
