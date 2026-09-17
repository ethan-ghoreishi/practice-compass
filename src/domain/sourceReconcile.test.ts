import { describe, expect, it } from 'vitest';
import rawIndex from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
import { decodeSourceIndex, sourceItemId, sourceLessonId, type SourceIndex } from './sourceArchive';
import {
  applyArchiveImport,
  planArchiveImport,
  repairReferencePath,
  repairLessonReferences,
  toArchiveRelative,
  withSuppression,
} from './sourceReconcile';
import { emptyDB } from './seed';
import { createItem, createLesson } from './factories';
import type { Lesson, PracticeDB, PracticeItem } from './types';

const NOW = new Date('2026-09-17T09:00:00.000Z');
const INDEX: SourceIndex = decodeSourceIndex(rawIndex);
const SETAR = 'inst-setar';

function baseDB(over: Partial<PracticeDB> = {}): PracticeDB {
  return {
    ...emptyDB(),
    instruments: [
      { id: SETAR, name: 'Setar', family: 'Persian', active: true, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
    ],
    ...over,
  };
}

const item = (over: Partial<PracticeItem>): PracticeItem => ({
  ...createItem({ instrumentId: SETAR, title: 'x' }, NOW),
  ...over,
});

const lesson = (over: Partial<Lesson>): Lesson => ({
  ...createLesson({ instrumentId: SETAR, date: '2026-01-01' }, NOW),
  ...over,
});

const plan = (db: PracticeDB, index = INDEX, decisions = undefined as never) =>
  planArchiveImport({ db, index, instrumentId: SETAR, decisions, now: NOW });

describe('reconciling the archive with the owner’s own records', () => {
  it('setar reconciliation binds exact identities without merging owner records', () => {
    // --- a first import of an empty database --------------------------------
    const first = plan(baseDB());
    expect(first.newLessons).toHaveLength(39);
    expect(first.newItems).toHaveLength(94);
    expect(first.questions).toEqual([]);
    expect(first.newLessons.every((l) => l.origin === 'archive')).toBe(true);
    const after = applyArchiveImport(baseDB(), first);
    expect(after.lessons).toHaveLength(39);
    expect(after.items).toHaveLength(94);
    expect(after.archiveSources).toHaveLength(1);

    // Canonical keys survive BYTE-EXACT as the items' own titles.
    expect(after.items.map((i) => i.title)).toContain('رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان');
    expect(after.items.map((i) => i.title)).toContain('تمرین-دشتی-1-علیزاده');

    // --- repeating it adds NOTHING -----------------------------------------
    const second = plan(after);
    expect(second.newLessons).toEqual([]);
    expect(second.newItems).toEqual([]);
    expect(second.summary.unchanged).toBe(true);
    // ...and applying it returns the very same database object, so an
    // unchanged refresh cannot bump a revision or churn a timestamp.
    expect(applyArchiveImport(after, second)).toBe(after);

    // --- DETERMINISTIC IDENTITY across devices ------------------------------
    // Two devices importing the same published index separately must agree on
    // which record is which, or the next sync sees two of everything.
    const other = applyArchiveImport(baseDB(), plan(baseDB()));
    expect(other.items.map((i) => i.id).sort()).toEqual(after.items.map((i) => i.id).sort());
    expect(other.lessons.map((l) => l.id).sort()).toEqual(after.lessons.map((l) => l.id).sort());
    expect(after.items.some((i) => i.id === sourceItemId('setar-classes', 'عراق'))).toBe(true);
    expect(after.lessons.some((l) => l.id === sourceLessonId('setar-classes', 13))).toBe(true);

    // --- EXISTING BINDINGS WIN, across edited titles and dates --------------
    const edited: PracticeDB = {
      ...after,
      items: after.items.map((i) =>
        i.source?.pieceKey === 'عراق' ? { ...i, title: 'Iraq — my own name for it', notes: 'teacher said…' } : i,
      ),
      lessons: after.lessons.map((l) => (l.source?.sessionN === 13 ? { ...l, date: '2020-01-01', number: 999 } : l)),
    };
    const third = plan(edited);
    expect(third.newItems).toEqual([]);
    expect(third.newLessons).toEqual([]);
    const applied = applyArchiveImport(edited, third);
    // The owner's edits are still there: a binding identifies, it never rewrites.
    expect(applied.items.find((i) => i.source?.pieceKey === 'عراق')!.title).toBe('Iraq — my own name for it');
    expect(applied.lessons.find((l) => l.source?.sessionN === 13)!.date).toBe('2020-01-01');

    // --- adopting ONE legacy lesson, on EXACT evidence ----------------------
    const evidence = lesson({
      id: 'legacy-13',
      date: '2024-09-03',
      number: 13,
      // The owner's own old reference — legacy prefix and pre-rename name.
      recordings: [
        {
          id: 'r1',
          title: 'Class 13',
          path: 'setar-classes/session-13-03-09-2024/video-20240903-152547-meeting-recording.mp4',
          kind: 'video',
          createdAt: '2024-09-04T00:00:00.000Z',
        },
      ],
      notes: 'What the teacher said that day.',
    });
    const withLegacy = plan(baseDB({ lessons: [evidence] }));
    const adopted = withLegacy.adoptedLessons.find((l) => l.source?.sessionN === 13);
    expect(adopted).toBeDefined();
    expect(adopted!.id).toBe('legacy-13'); // the owner's record KEEPS its id
    expect(adopted!.notes).toBe('What the teacher said that day.');
    expect(withLegacy.newLessons).toHaveLength(38);

    // --- weaker equivalences CANNOT auto-merge ------------------------------
    const dateOnly = lesson({ id: 'date-only', date: '2024-09-03' });
    const numberOnly = lesson({ id: 'number-only', date: '2019-05-05', number: 13 });
    const dateAndNumber = lesson({ id: 'date-and-number', date: '2024-09-03', number: 13 });
    const weak = plan(baseDB({ lessons: [dateOnly, numberOnly, dateAndNumber] }));
    expect(weak.adoptedLessons).toEqual([]);
    expect(weak.newLessons).toHaveLength(39);
    // Two identical candidates do not pick the first: the owner is asked.
    const twin = { ...evidence, id: 'legacy-13-twin' };
    const ambiguous = plan(baseDB({ lessons: [evidence, twin] }));
    expect(ambiguous.adoptedLessons).toEqual([]);
    const q = ambiguous.questions.find((x) => x.sessionN === 13)!;
    expect(q.candidates.map((c) => c.id).sort()).toEqual(['legacy-13', 'legacy-13-twin']);

    // --- the owner's real upcoming class 38 survives ------------------------
    const upcoming = lesson({ id: 'class-38-upcoming', date: '2026-09-27', number: 38 });
    const withUpcoming = plan(baseDB({ lessons: [upcoming] }));
    expect(withUpcoming.adoptedLessons).toEqual([]);
    expect(withUpcoming.newLessons).toHaveLength(39);
    const installed = applyArchiveImport(baseDB({ lessons: [upcoming] }), withUpcoming);
    const thirtyEights = installed.lessons.filter((l) => l.number === 38);
    expect(thirtyEights.map((l) => l.date).sort()).toEqual(['2026-08-04', '2026-09-27']);
    expect(installed.lessons.find((l) => l.id === 'class-38-upcoming')!.origin).toBeUndefined();

    // --- a catalogue slug is NEVER a canonical Farsi key --------------------
    const catalogued = item({ id: 'cat-iraq', title: 'Iraq', catalogKey: 'iraq' });
    const withCatalogue = plan(baseDB({ items: [catalogued] }));
    expect(withCatalogue.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    expect(withCatalogue.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(true);
    const cataloguedAfter = applyArchiveImport(baseDB({ items: [catalogued] }), withCatalogue);
    expect(cataloguedAfter.items.find((i) => i.id === 'cat-iraq')!.source).toBeUndefined();

    // --- exact title / literal alias equality ASKS, never merges ------------
    const sameTitle = item({ id: 'mine-araq', title: 'عراق' });
    const aliasTitle = item({ id: 'mine-alias', title: 'araq' });
    const asked = plan(baseDB({ items: [sameTitle, aliasTitle] }));
    const itemQ = asked.questions.find((x) => x.pieceKey === 'عراق')!;
    expect(itemQ.candidates.map((c) => c.id).sort()).toEqual(['mine-alias', 'mine-araq']);
    expect(asked.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    const untouched = applyArchiveImport(baseDB({ items: [sameTitle, aliasTitle] }), asked);
    expect(untouched.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(0);

    // Link: the owner's record keeps its id and gains the binding.
    const linked = planArchiveImport({
      db: baseDB({ items: [sameTitle, aliasTitle] }),
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'link-item', pieceKey: 'عراق', itemId: 'mine-araq' }],
      now: NOW,
    });
    expect(linked.adoptedItems.map((i) => i.id)).toEqual(['mine-araq']);
    expect(linked.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    const linkedDb = applyArchiveImport(baseDB({ items: [sameTitle, aliasTitle] }), linked);
    expect(linkedDb.items.find((i) => i.id === 'mine-araq')!.source).toEqual({
      archiveId: 'setar-classes',
      pieceKey: 'عراق',
    });
    // ...and the binding PERSISTS: a later refresh asks nothing more about it.
    expect(plan(linkedDb).questions.some((x) => x.pieceKey === 'عراق')).toBe(false);

    // Create separately: two records, both kept, only one bound.
    const separate = planArchiveImport({
      db: baseDB({ items: [sameTitle] }),
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'create-item', pieceKey: 'عراق' }],
      now: NOW,
    });
    const separateDb = applyArchiveImport(baseDB({ items: [sameTitle] }), separate);
    expect(separateDb.items.filter((i) => i.title === 'عراق')).toHaveLength(2);
    expect(separateDb.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(1);
    expect(separateDb.items.find((i) => i.id === 'mine-araq')!.source).toBeUndefined();

    // --- the source/instrument binding is explicit and validated -----------
    expect(after.archiveSources[0]!.instrumentId).toBe(SETAR);
    expect(after.archiveSources[0]!.id).toBe('setar-classes');
    expect(after.items.every((i) => i.instrumentId === SETAR)).toBe(true);
  });

  it('archive refresh preserves owner edits and applies only the new source delta', () => {
    const installed = applyArchiveImport(baseDB(), plan(baseDB()));

    // The owner then works on their own records.
    const owned: PracticeDB = {
      ...installed,
      items: installed.items.map((i) =>
        i.source?.pieceKey === 'عراق'
          ? { ...i, title: 'My own title', notes: 'my notes', status: 'usable', persian: { ...i.persian, composer: '' } }
          : i,
      ),
      lessons: installed.lessons.map((l) => (l.source?.sessionN === 1 ? { ...l, notes: 'class one notes' } : l)),
    };

    // --- ONE new session, plus one new score on an existing session ---------
    const session40 = {
      n: 40,
      date: '2026-09-29',
      folder: 'session-40-29-09-2026',
      roster: ['عراق'],
      rosterTrusted: true,
      hasClassRecording: true,
      resources: [
        {
          path: 'session-40-29-09-2026/ضبط-کلاس.mp4',
          role: 'ضبط-کلاس',
          kind: 'video' as const,
          title: 'ضبط کلاس',
          part: null,
          pieces: [],
          group: null,
        },
      ],
      members: [{ key: 'عراق', roles: ['ضبط-کلاس'] }],
    };
    const addedScore = {
      path: 'session-12-06-08-2024/نت-عراق.pdf',
      role: 'نت',
      kind: 'score' as const,
      title: 'نت عراق',
      part: null,
      pieces: ['عراق'],
      group: null,
    };
    const next: SourceIndex = {
      ...INDEX,
      contentHash: 'b'.repeat(64),
      sessions: [
        ...INDEX.sessions.map((s) => (s.n === 12 ? { ...s, resources: [...s.resources, addedScore] } : s)),
        session40,
      ],
      // A later registry improvement on a piece already seeded.
      pieces: INDEX.pieces.map((p) => (p.key === 'عراق' ? { ...p, composer: 'میرزا-حسینقلی' } : p)),
    };

    const delta = planArchiveImport({ db: owned, index: next, instrumentId: SETAR, now: NOW });
    // ONLY the delta: one lesson, no items (عراق is already bound).
    expect(delta.newLessons.map((l) => l.source?.sessionN)).toEqual([40]);
    expect(delta.newItems).toEqual([]);

    const refreshed = applyArchiveImport(owned, delta);
    expect(refreshed.lessons).toHaveLength(40);
    // AUTHORED FIELDS ARE SEEDED ONCE AND THEN PRESERVED — including the
    // deliberately EMPTY composer the owner cleared.
    const araq = refreshed.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(araq.title).toBe('My own title');
    expect(araq.notes).toBe('my notes');
    expect(araq.status).toBe('usable');
    expect(araq.persian?.composer).toBe('');
    expect(refreshed.lessons.find((l) => l.source?.sessionN === 1)!.notes).toBe('class one notes');
    // Source facts DID update: the new score is in the graph.
    const source = refreshed.archiveSources.find((s) => s.id === 'setar-classes')!;
    expect(source.sessions.find((s) => s.n === 12)!.resources.some((r) => r.path === addedScore.path)).toBe(true);
    expect(source.indexHash).toBe('b'.repeat(64));

    // The registry improvement is OFFERED, never applied behind the owner.
    const suggestion = delta.suggestions.find((s) => s.pieceKey === 'عراق' && s.field === 'composer')!;
    expect(suggestion).toBeDefined();
    expect(suggestion.from).toBe('');
    expect(suggestion.to).toBe('میرزا-حسینقلی');
    const selective = applyArchiveImport(owned, delta, [
      { kind: 'apply-field', pieceKey: 'عراق', field: 'composer' },
    ]);
    const applied = selective.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(applied.persian?.composer).toBe('میرزا-حسینقلی');
    // ...and applying a field NEVER touches the notebook or the title.
    expect(applied.notes).toBe('my notes');
    expect(applied.title).toBe('My own title');

    // --- an UNCHANGED refresh writes nothing --------------------------------
    const same = planArchiveImport({ db: refreshed, index: next, instrumentId: SETAR, now: NOW });
    expect(same.summary.unchanged).toBe(true);
    expect(applyArchiveImport(refreshed, same)).toBe(refreshed);

    // --- a missing file / missing registry row keeps its provenance ---------
    const shrunk: SourceIndex = {
      ...next,
      contentHash: 'c'.repeat(64),
      sessions: next.sessions.map((s) => (s.n === 12 ? { ...s, resources: [] } : s)),
    };
    const shrunkPlan = planArchiveImport({ db: refreshed, index: shrunk, instrumentId: SETAR, now: NOW });
    const afterShrink = applyArchiveImport(refreshed, shrunkPlan);
    // The LESSON and the ITEM are still there — a vanished file never deletes
    // an owner record, it only changes what the source can offer.
    expect(afterShrink.lessons).toHaveLength(40);
    expect(afterShrink.items.find((i) => i.source?.pieceKey === 'عراق')!.title).toBe('My own title');
    expect(afterShrink.blocks).toEqual(refreshed.blocks);

    // --- a CHANGED canonical key is a NEW identity, never a rename ----------
    const renamedKey: SourceIndex = {
      ...INDEX,
      contentHash: 'd'.repeat(64),
      pieces: INDEX.pieces.map((p) => (p.key === 'عراق' ? { ...p, key: 'عراق-جدید' } : p)),
      sessions: INDEX.sessions.map((s) => ({
        ...s,
        roster: s.roster.map((k) => (k === 'عراق' ? 'عراق-جدید' : k)),
        members: s.members.map((m) => (m.key === 'عراق' ? { ...m, key: 'عراق-جدید' } : m)),
        resources: s.resources.map((r) => ({
          ...r,
          pieces: r.pieces.map((k) => (k === 'عراق' ? 'عراق-جدید' : k)),
        })),
      })),
    };
    const keyChange = planArchiveImport({ db: refreshed, index: renamedKey, instrumentId: SETAR, now: NOW });
    // A NEW piece appears; the old binding is NOT silently carried across.
    expect(keyChange.newItems.map((i) => i.source?.pieceKey)).toEqual(['عراق-جدید']);
    expect(keyChange.adoptedItems).toEqual([]);

    // --- an unresolved question stays a question until answered ------------
    const stranger = item({ id: 'stranger', title: 'چهار-پاره' });
    const strangerDb = { ...baseDB(), items: [stranger] };
    const asked = planArchiveImport({ db: strangerDb, index: INDEX, instrumentId: SETAR, now: NOW });
    expect(asked.questions.some((x) => x.pieceKey === 'چهار-پاره')).toBe(true);
    const stillAsked = planArchiveImport({ db: strangerDb, index: INDEX, instrumentId: SETAR, now: NOW });
    expect(stillAsked.questions.some((x) => x.pieceKey === 'چهار-پاره')).toBe(true);
    // The SAME index with a NEW owner decision resolves it, with no re-scan.
    const resolved = planArchiveImport({
      db: strangerDb,
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'چهار-پاره' }],
      now: NOW,
    });
    expect(resolved.questions.some((x) => x.pieceKey === 'چهار-پاره')).toBe(false);
    expect(resolved.newItems.some((i) => i.source?.pieceKey === 'چهار-پاره')).toBe(false);
  });

  it('exact Setar rename repair preserves saved references and their metadata', () => {
    const renames = new Map(INDEX.renames.map((r) => [r.from, r.to]));
    const known = new Set(INDEX.sessions.flatMap((s) => s.resources.map((r) => r.path)));

    // The archive prefix the owner's legacy paths carry is not part of the
    // archive-relative identity; the device base now ends in it.
    expect(toArchiveRelative('setar-classes/session-1-26-09-2023/x.mp4')).toBe('session-1-26-09-2023/x.mp4');
    expect(toArchiveRelative('session-1-26-09-2023/x.mp4')).toBe('session-1-26-09-2023/x.mp4');

    // Every legacy seed path in the shipped session table maps through the
    // rename log EXACTLY — no title, size or modification-time matching.
    const legacy = [
      'setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4',
      'setar-classes/session-1-26-09-2023/chahar-mezarabe-avale-dashti.pdf',
      'setar-classes/session-13-03-09-2024/aragh-mirzahoseyngholi.pdf',
      'setar-classes/session-28-28-10-2025/video-2025-10-28-19-56-30.mp4',
      'setar-classes/session-37-09-07-2026/chahaar-mezrabe-afshaari-sabaa.pdf',
    ];
    for (const p of legacy) {
      const outcome = repairReferencePath(p, renames, known);
      expect(outcome.status).toBe('repaired');
      if (outcome.status !== 'repaired') throw new Error('unreachable');
      expect(outcome.path.startsWith('session-')).toBe(true);
      expect(known.has(outcome.path)).toBe(true);
    }
    // Session 28's "main video" is really a NAMED DEMONSTRATION; the repair
    // says so by landing on the demo file, and nothing invents a class
    // recording for a session that has none.
    const s28 = repairReferencePath(legacy[3]!, renames, known);
    expect(s28.status === 'repaired' && s28.path).toBe('session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4');

    // A path with no rename row and no file is DIAGNOSED, never guessed.
    const missing = repairReferencePath('setar-classes/session-1-26-09-2023/nothing.mp4', renames, known);
    expect(missing.status).toBe('attention');
    // A foreign link, and a link carrying a query, are left exactly as they are.
    const base = 'https://192.168.0.20:5010/setar-classes';
    expect(repairReferencePath('https://elsewhere.example/x.mp4', renames, known, base).status).toBe('unchanged');
    expect(repairReferencePath(`${base}/session-1-26-09-2023/x.mp4?download=1`, renames, known, base).status).toBe(
      'unchanged',
    );
    // Without a VERIFIED base a full URL is not converted at all.
    expect(repairReferencePath(`${base}/session-1-26-09-2023/x.mp4`, renames, known).status).toBe('attention');
    // Under the verified base it converts, decoding each segment once.
    const encoded = `${base}/${encodeURIComponent('session-13-03-09-2024')}/${encodeURIComponent('نمونه-1.mp4')}`;
    const converted = repairReferencePath(encoded, renames, known, base);
    expect(converted.status === 'repaired' && converted.path).toBe('session-13-03-09-2024/نمونه-1.mp4');
    // A cycle in the log is reported rather than followed forever.
    const cyclic = new Map([
      ['a/b.mp4', 'a/c.mp4'],
      ['a/c.mp4', 'a/b.mp4'],
    ]);
    expect(repairReferencePath('a/b.mp4', cyclic, new Set(['a/c.mp4'])).status).toBe('attention');

    // --- both rows of a real collision survive, with their own metadata -----
    // Session 1's class part 1 and the first Dashti score each have an OLD and
    // a CURRENT row that now point at one physical file. Repairing them keeps
    // TWO rows, because each carries something the owner wrote.
    const collided = lesson({
      id: 'L1',
      date: '2023-09-26',
      number: 1,
      recordings: [
        {
          id: 'old-video',
          title: 'Class 1 (old link)',
          path: 'setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4',
          kind: 'video',
          notes: 'The half I watched first.',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
        {
          id: 'current-video',
          title: 'Class 1 part 1',
          path: 'session-1-26-09-2023/ضبط-کلاس-1.mp4',
          kind: 'video',
          createdAt: '2026-09-10T00:00:00.000Z',
        },
        {
          id: 'old-score',
          title: 'First Dashti score (old link)',
          path: 'setar-classes/session-1-26-09-2023/chahar-mezarabe-avale-dashti.pdf',
          kind: 'pdf',
          notes: 'Teacher marked bar 12.',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
        {
          id: 'current-score',
          title: 'Dashti score',
          path: 'session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.pdf',
          kind: 'pdf',
          createdAt: '2026-09-10T00:00:00.000Z',
        },
      ],
    });
    const repaired = repairLessonReferences(collided, renames, known);
    expect(repaired.repaired).toBe(2);
    expect(repaired.attention).toEqual([]);
    expect(repaired.lesson.recordings).toHaveLength(4);
    const byId = new Map(repaired.lesson.recordings!.map((r) => [r.id, r]));
    // The two old rows now resolve to the same physical files as the new ones…
    expect(byId.get('old-video')!.path).toBe(byId.get('current-video')!.path);
    expect(byId.get('old-score')!.path).toBe(byId.get('current-score')!.path);
    // …and neither authored row, nor its notes or title, was deleted.
    expect(byId.get('old-video')!.notes).toBe('The half I watched first.');
    expect(byId.get('old-video')!.title).toBe('Class 1 (old link)');
    expect(byId.get('old-score')!.notes).toBe('Teacher marked bar 12.');

    // --- the owner's own practice recordings stay, outside useful material --
    const personal = lesson({
      id: 'L2',
      date: '2025-08-05',
      recordings: [
        {
          id: 'mine-1',
          title: 'My take, August',
          path: 'setar-classes/session-25-05-08-2025/mine.mp4',
          kind: 'video',
          notes: 'Slow but even.',
          createdAt: '2025-08-06T00:00:00.000Z',
        },
      ],
    });
    const personalRepair = repairLessonReferences(personal, renames, known);
    expect(personalRepair.lesson.recordings).toHaveLength(1);
    expect(personalRepair.lesson.recordings![0]!.notes).toBe('Slow but even.');
    // The archive never offers a personal recording as material for a piece.
    const source = applyArchiveImport(baseDB(), plan(baseDB())).archiveSources[0]!;
    expect(source.sessions.every((s) => s.resources.every((r) => r.role !== 'تمرین-من'))).toBe(true);
  });
});

describe('owner suppressions', () => {
  it('a suppressed piece or session is never re-created by a later refresh', () => {
    const installed = applyArchiveImport(baseDB(), plan(baseDB()));
    const stripped: PracticeDB = {
      ...installed,
      items: installed.items.filter((i) => i.source?.pieceKey !== 'عراق'),
      lessons: installed.lessons.filter((l) => l.source?.sessionN !== 13),
      archiveSources: withSuppression(
        withSuppression(installed.archiveSources, 'setar-classes', {
          kind: 'piece',
          ref: 'عراق',
          at: NOW.toISOString(),
        }),
        'setar-classes',
        { kind: 'session', ref: '13', at: NOW.toISOString() },
      ),
    };
    const again = plan(stripped);
    expect(again.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(again.newLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    // Idempotent: suppressing the same thing twice does not grow the list.
    const twice = withSuppression(stripped.archiveSources, 'setar-classes', {
      kind: 'piece',
      ref: 'عراق',
      at: '2027-01-01T00:00:00.000Z',
    });
    expect(twice[0]!.suppressions).toHaveLength(2);
  });
});
