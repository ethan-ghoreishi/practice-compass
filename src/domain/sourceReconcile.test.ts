import { describe, expect, it } from 'vitest';
import rawIndex from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
import {
  decodeSourceIndex,
  resourcesForPiece,
  resourcesForSession,
  sourceItemId,
  sourceLessonId,
  validateArchiveSources,
  type SourceIndex,
} from './sourceArchive';
import {
  applyArchiveImport,
  planArchiveImport,
  repairReferencePath,
  repairLessonReferences,
  toArchiveRelative,
  withSuppression,
  followRenames,
} from './sourceReconcile';
import { archiveRootUrl, resolveRecordingUrl } from './recordings';
// The published log is the SCANNER's output, so the downstream transitions
// below are driven by what it actually publishes for a forked log — never by
// a hand-written approximation of it.
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as scannerModule from '../../scripts/scan-setar-classes.mjs';
const { buildIndex } = scannerModule as {
  buildIndex(input: {
    registryText: string;
    inventory: never[];
    renameLog: { present: true; text: string };
  }): { renames: { from: string; to: string }[]; diagnostics: { path: string; reason: string }[] };
};
const EMPTY_REGISTRY = 'canonical_fa,form,piece,dastgah,composer,aliases_seen,sessions,notes\n';
import { emptyDB } from './seed';
import { LEGACY_SEED_PATHS } from './setarClasses';
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

    // --- SKIP IS A DECISION, AND A DECISION IS PERSISTED -------------------
    // It used to live only in the preview's own `decisions` argument, so "no,
    // not this one" survived exactly as long as the screen did: a reload, or
    // simply the next refresh, asked the identical question again with nothing
    // in the database to show it had ever been answered.
    const skipDb = baseDB({ items: [sameTitle] });
    const skipDecisions = [{ kind: 'skip-item' as const, pieceKey: 'عراق' }];
    const skipped = planArchiveImport({ db: skipDb, index: INDEX, instrumentId: SETAR, decisions: skipDecisions, now: NOW });
    expect(skipped.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    expect(skipped.source.suppressions).toContainEqual({ kind: 'piece', ref: 'عراق', at: NOW.toISOString() });
    const afterSkip = applyArchiveImport(skipDb, skipped, skipDecisions);
    expect(afterSkip.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(afterSkip.items.find((i) => i.id === 'mine-araq')!.title).toBe('عراق');
    expect(validateArchiveSources(afterSkip)).toBeNull();
    // ...and it survives the persisted shape. A LATER refresh, carrying no
    // decisions at all, neither asks nor re-creates.
    const reloaded = JSON.parse(JSON.stringify(afterSkip)) as PracticeDB;
    const afterReload = plan(reloaded);
    expect(afterReload.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    expect(afterReload.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(afterReload.summary.unchanged).toBe(true);
    expect(applyArchiveImport(reloaded, afterReload)).toBe(reloaded);
    // Skipping the same thing twice does not grow the list either.
    const skipTwice = planArchiveImport({ db: reloaded, index: INDEX, instrumentId: SETAR, decisions: skipDecisions, now: NOW });
    expect(skipTwice.source.suppressions).toHaveLength(1);
    expect(applyArchiveImport(reloaded, skipTwice, skipDecisions)).toBe(reloaded);

    // The same holds for a CLASS the owner skips.
    const skipSession = [{ kind: 'skip-lesson' as const, sessionN: 13 }];
    const lessonSkipped = planArchiveImport({ db: baseDB(), index: INDEX, instrumentId: SETAR, decisions: skipSession, now: NOW });
    expect(lessonSkipped.newLessons).toHaveLength(38);
    const afterLessonSkip = applyArchiveImport(baseDB(), lessonSkipped, skipSession);
    const lessonReloaded = JSON.parse(JSON.stringify(afterLessonSkip)) as PracticeDB;
    expect(plan(lessonReloaded).newLessons).toEqual([]);
    expect(lessonReloaded.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);

    // --- "CREATE SEPARATELY" RESOLVES AN AMBIGUOUS CLASS -------------------
    // Two indistinguishable candidates; the owner says neither of them is this
    // session. The decision used to be dropped on the floor for lessons — the
    // item side had it from the start — and the question came back for ever.
    const twinDb = baseDB({ lessons: [evidence, twin] });
    const createSeparately = [{ kind: 'create-lesson' as const, sessionN: 13 }];
    const resolvedLesson = planArchiveImport({ db: twinDb, index: INDEX, instrumentId: SETAR, decisions: createSeparately, now: NOW });
    expect(resolvedLesson.questions.some((x) => x.sessionN === 13)).toBe(false);
    expect(resolvedLesson.adoptedLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    expect(resolvedLesson.newLessons.filter((l) => l.source?.sessionN === 13)).toHaveLength(1);
    const afterCreate = applyArchiveImport(twinDb, resolvedLesson, createSeparately);
    // Three records for that day now: the archive's own, and BOTH of the
    // owner's, each keeping its id, its notes and its unbound status.
    expect(afterCreate.lessons.filter((l) => l.date === '2024-09-03')).toHaveLength(3);
    expect(afterCreate.lessons.find((l) => l.id === 'legacy-13')!.source).toBeUndefined();
    expect(afterCreate.lessons.find((l) => l.id === 'legacy-13')!.notes).toBe('What the teacher said that day.');
    expect(afterCreate.lessons.find((l) => l.id === 'legacy-13-twin')!.source).toBeUndefined();
    expect(validateArchiveSources(afterCreate)).toBeNull();
    // ...and the binding it did create is the archive's own deterministic one.
    expect(afterCreate.lessons.some((l) => l.id === sourceLessonId('setar-classes', 13))).toBe(true);

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
        // A scan records the MEMBERSHIP a new resource creates in the same
        // pass that lists the resource, so a fixture that adds one without the
        // other is a graph disagreeing with itself — refused at every door.
        ...INDEX.sessions.map((s) =>
          s.n === 12
            ? {
                ...s,
                resources: [...s.resources, addedScore],
                members: [
                  ...s.members.filter((m) => m.key !== 'عراق'),
                  {
                    key: 'عراق',
                    roles: [...new Set([...(s.members.find((m) => m.key === 'عراق')?.roles ?? []), 'نت'])],
                  },
                ],
              }
            : s,
        ),
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
    // A field decision names the RECORD it was shown against, not just the
    // piece: a rebase must not hand the answer to whichever item happens to
    // hold that piece by the time Apply is pressed.
    const araqItemId = suggestion.itemId;
    const selective = applyArchiveImport(owned, delta, [
      { kind: 'apply-field', pieceKey: 'عراق', itemId: araqItemId, field: 'composer', from: '' },
    ]);
    const applied = selective.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(applied.persian?.composer).toBe('میرزا-حسینقلی');
    // ...and applying a field NEVER touches the notebook or the title.
    expect(applied.notes).toBe('my notes');
    expect(applied.title).toBe('My own title');

    // --- THE ITEM'S KIND IS THE OWNER'S, SEEDED ONCE AND NEVER RE-OFFERED ---
    // The registry's `form` decides `itemType` at CREATION and nothing after
    // it: a piece the archive calls a گوشه that the owner works as a full piece
    // is their reading of the music, not a source fact to be corrected back.
    // `itemType` is not in the suggestion list at all, so no refresh can even
    // ask, let alone revert it.
    const reKinded = { ...owned, items: owned.items.map((i) => (i.id === araqItemId ? { ...i, itemType: 'full_piece' as const } : i)) };
    const afterReKind = applyArchiveImport(
      reKinded,
      planArchiveImport({ db: reKinded, index: next, instrumentId: SETAR, now: NOW }),
    );
    expect(afterReKind.items.find((i) => i.id === araqItemId)!.itemType).toBe('full_piece');
    expect(
      planArchiveImport({ db: reKinded, index: next, instrumentId: SETAR, now: NOW }).suggestions.some(
        (x) => (x.field as string) === 'itemType',
      ),
    ).toBe(false);

    // --- an UNCHANGED refresh writes nothing --------------------------------
    const same = planArchiveImport({ db: refreshed, index: next, instrumentId: SETAR, now: NOW });
    expect(same.summary.unchanged).toBe(true);
    expect(applyArchiveImport(refreshed, same)).toBe(refreshed);

    // --- ...BUT A NEW OWNER DECISION AGAINST IT IS NOT "UNCHANGED" ---------
    // The suggestion stands until it is answered, and it may be answered days
    // later against the very same published index. Judging "already current"
    // by the index hash alone reported exactly that and discarded the answer.
    const lateField = [
      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqItemId, field: 'composer' as const, from: '' },
    ];
    const lateDecision = planArchiveImport({
      db: refreshed,
      index: next,
      instrumentId: SETAR,
      decisions: lateField,
      now: NOW,
    });
    expect(lateDecision.suggestions.some((x) => x.pieceKey === 'عراق' && x.field === 'composer')).toBe(true);
    expect(lateDecision.summary.unchanged).toBe(false);
    const lateApplied = applyArchiveImport(refreshed, lateDecision, lateField);
    expect(lateApplied).not.toBe(refreshed);
    const lateItem = lateApplied.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(lateItem.persian?.composer).toBe('میرزا-حسینقلی');
    // Only that field: the notebook, the title and the status are the owner's.
    expect(lateItem.notes).toBe('my notes');
    expect(lateItem.title).toBe('My own title');
    expect(lateItem.status).toBe('usable');
    expect(lateApplied.blocks).toEqual(refreshed.blocks);
    // Applied, the suggestion is gone: the next refresh has nothing to offer.
    expect(planArchiveImport({ db: lateApplied, index: next, instrumentId: SETAR, now: NOW }).suggestions).toEqual([]);
    // A decision for a field with NO suggestion changes nothing at all.
    const emptyField = [
      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqItemId, field: 'form' as const, from: '' },
    ];
    const noop = planArchiveImport({ db: lateApplied, index: next, instrumentId: SETAR, decisions: emptyField, now: NOW });
    expect(noop.summary.unchanged).toBe(true);
    expect(applyArchiveImport(lateApplied, noop, emptyField)).toBe(lateApplied);

    // --- A DECISION IS ABOUT THE VALUE THE OWNER SAW -----------------------
    // Choose the archive's composer over an EMPTY field, then write one of
    // your own before the plan is applied. The choice was an answer about the
    // empty field; it is not an instruction to replace the new words.
    const ownWrote = {
      ...refreshed,
      items: refreshed.items.map((i) =>
        i.source?.pieceKey === 'عراق'
          ? { ...i, persian: { ...i.persian, composer: 'Owner wrote this during refresh' } }
          : i,
      ),
    };
    const rebased = planArchiveImport({
      db: ownWrote,
      index: next,
      instrumentId: SETAR,
      decisions: lateField,
      now: NOW,
    });
    expect(rebased.staleDecisions).toEqual(lateField);
    // Not applied, and not counted as a change either: both sides of the
    // preview/commit boundary agree that this decision no longer stands.
    expect(rebased.summary.unchanged).toBe(true);
    const notOverwritten = applyArchiveImport(ownWrote, rebased, lateField);
    expect(notOverwritten.items.find((i) => i.source?.pieceKey === 'عراق')!.persian?.composer).toBe(
      'Owner wrote this during refresh',
    );
    // The suggestion is re-offered against what is there NOW, so the owner can
    // answer the question that actually stands.
    expect(rebased.suggestions.find((x) => x.pieceKey === 'عراق' && x.field === 'composer')!.from).toBe(
      'Owner wrote this during refresh',
    );
    // A decision carrying the CURRENT value still applies, on the same data.
    const answeredNow = [{ ...lateField[0]!, from: 'Owner wrote this during refresh' }];
    const fresh = planArchiveImport({ db: ownWrote, index: next, instrumentId: SETAR, decisions: answeredNow, now: NOW });
    expect(fresh.staleDecisions).toEqual([]);
    expect(applyArchiveImport(ownWrote, fresh, answeredNow).items.find((i) => i.source?.pieceKey === 'عراق')!.persian
      ?.composer).toBe('میرزا-حسینقلی');

    // --- A LINK TARGET THAT MOVED IS THE SAME KIND OF STALENESS ------------
    // Bound elsewhere, moved instrument or deleted: never silently turned into
    // "create a new record instead".
    const araqId = owned.items.find((i) => i.source?.pieceKey === 'عراق')!.id;
    const otherKey = INDEX.pieces.find((x) => x.key !== 'عراق')!.key;
    const unbound: PracticeDB = {
      ...owned,
      items: owned.items.map((i) => {
        const { source, ...rest } = i;
        void source;
        return rest.id === araqId ? { ...rest, title: 'عراق' } : rest;
      }),
    };
    const linkDecision = [{ kind: 'link-item' as const, pieceKey: 'عراق', itemId: araqId }];
    const linkable = planArchiveImport({ db: unbound, index: next, instrumentId: SETAR, decisions: linkDecision, now: NOW });
    expect(linkable.staleDecisions).toEqual([]);
    expect(linkable.adoptedItems.map((i) => i.id)).toEqual([araqId]);
    const takenElsewhere: PracticeDB = {
      ...unbound,
      items: unbound.items.map((i) =>
        i.id === araqId ? { ...i, source: { archiveId: 'setar-classes', pieceKey: otherKey } } : i,
      ),
    };
    const stalelink = planArchiveImport({
      db: takenElsewhere,
      index: next,
      instrumentId: SETAR,
      decisions: linkDecision,
      now: NOW,
    });
    expect(stalelink.staleDecisions).toEqual(linkDecision);
    expect(stalelink.adoptedItems).toEqual([]);

    // --- A DECISION NAMES ITS RECORD, AND EVERY DECISION IS ACCOUNTED FOR ---
    //
    // The loops start with "already bound? nothing to decide" / "already
    // suppressed? nothing to decide", so a decision about a record that became
    // bound between the preview and the commit was never looked at: no
    // adoption, no question, and an EMPTY `staleDecisions` — the commit
    // reported success for an action it had not performed. And a field
    // decision keyed by piece alone was worse than ignored: it was REDIRECTED
    // onto whichever record held that piece by the time Apply ran.
    const otherItemId = 'someone-elses-item';
    const boundToAnother: PracticeDB = {
      ...unbound,
      items: [
        ...unbound.items,
        item({
          id: otherItemId,
          instrumentId: SETAR,
          title: 'Another record',
          source: { archiveId: 'setar-classes', pieceKey: 'عراق' },
        }),
      ],
    };
    // LINK: the approved record is not the one holding the piece now, so the
    // choice is stale — never quietly satisfied by the other record.
    const redirectedLink = planArchiveImport({
      db: boundToAnother,
      index: next,
      instrumentId: SETAR,
      decisions: linkDecision,
      now: NOW,
    });
    expect(redirectedLink.staleDecisions).toEqual(linkDecision);
    expect(redirectedLink.adoptedItems).toEqual([]);
    expect(applyArchiveImport(boundToAnother, redirectedLink, linkDecision).items.find((i) => i.id === araqId)!.source)
      .toBeUndefined();
    // APPLY-FIELD: the archive's composer, chosen against item A's empty
    // field, must not be written to the item that holds the piece now — whose
    // composer is also empty, so nothing about the VALUE would have caught it.
    const fieldForA = [
      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqId, field: 'composer' as const, from: '' },
    ];
    const redirectedField = planArchiveImport({
      db: boundToAnother,
      index: next,
      instrumentId: SETAR,
      decisions: fieldForA,
      now: NOW,
    });
    expect(redirectedField.staleDecisions).toEqual(fieldForA);
    expect(redirectedField.suggestions.every((x) => x.itemId === otherItemId)).toBe(true);
    const notRedirected = applyArchiveImport(boundToAnother, redirectedField, fieldForA);
    expect(notRedirected.items.find((i) => i.id === otherItemId)!.persian?.composer ?? '').toBe('');
    // SKIP and CREATE are the same rule: an answer about a record that has
    // since been bound is an answer to a question that no longer stands.
    for (const decision of [
      [{ kind: 'skip-item' as const, pieceKey: 'عراق' }],
      [{ kind: 'create-item' as const, pieceKey: 'عراق' }],
    ]) {
      const swept = planArchiveImport({
        db: boundToAnother,
        index: next,
        instrumentId: SETAR,
        decisions: decision,
        now: NOW,
      });
      expect(swept.staleDecisions).toEqual(decision);
      expect(swept.newItems).toEqual([]);
    }
    // …and LOOP PREVENTION: the action the owner approved, once it HAS
    // happened, is not stale. `ArchiveRefresh` drops a stale decision and
    // re-previews, so a realised action that could never be consumed again
    // would go stale for ever.
    const afterLink = applyArchiveImport(unbound, linkable, linkDecision);
    const again = planArchiveImport({
      db: afterLink,
      index: next,
      instrumentId: SETAR,
      decisions: linkDecision,
      now: NOW,
    });
    expect(again.staleDecisions).toEqual([]);
    const skipped = applyArchiveImport(
      unbound,
      planArchiveImport({
        db: unbound,
        index: next,
        instrumentId: SETAR,
        decisions: [{ kind: 'skip-item', pieceKey: otherKey }],
        now: NOW,
      }),
    );
    expect(
      planArchiveImport({
        db: skipped,
        index: next,
        instrumentId: SETAR,
        decisions: [{ kind: 'skip-item', pieceKey: otherKey }],
        now: NOW,
      }).staleDecisions,
    ).toEqual([]);

    // --- a missing FILE keeps its provenance, flagged ----------------------
    const goneFile = next.sessions.find((s) => s.n === 12)!.resources[0]!.path;
    const shrunk: SourceIndex = {
      ...next,
      contentHash: 'c'.repeat(64),
      // A session that has lost every file has lost its class recording with
      // them: a scan recomputes that flag, and a hand-built index that keeps
      // it is a graph disagreeing with itself — which `checkSourceGraph` now
      // refuses at every door, so it cannot be used to prove anything else.
      sessions: next.sessions.map((s) =>
        s.n === 12 ? { ...s, resources: [], members: [], hasClassRecording: false } : s,
      ),
    };
    const shrunkPlan = planArchiveImport({ db: refreshed, index: shrunk, instrumentId: SETAR, now: NOW });
    const afterShrink = applyArchiveImport(refreshed, shrunkPlan);
    // The LESSON and the ITEM are still there — a vanished file never deletes
    // an owner record, it only changes what the source can offer.
    expect(afterShrink.lessons).toHaveLength(40);
    expect(afterShrink.items.find((i) => i.source?.pieceKey === 'عراق')!.title).toBe('My own title');
    expect(afterShrink.blocks).toEqual(refreshed.blocks);
    const shrunkSource = afterShrink.archiveSources.find((s) => s.id === 'setar-classes')!;
    const goneRow = shrunkSource.sessions.find((s) => s.n === 12)!.resources.find((r) => r.path === goneFile)!;
    expect(goneRow.unavailable).toBe(true);
    // ...and the database this produced is one every inbound door accepts.
    expect(validateArchiveSources(afterShrink)).toBeNull();

    // --- a missing REGISTRY ROW is the case that used to lock refresh out ---
    // Dropping a piece the owner has an item bound to would leave that binding
    // pointing at nothing — which `validateDB` refuses at every door, so the
    // next Refresh, and every one after it, would fail outright. Provenance is
    // RETAINED and flagged instead.
    const withoutPiece: SourceIndex = {
      ...next,
      contentHash: 'e'.repeat(64),
      pieces: next.pieces.filter((p) => p.key !== 'عراق'),
      sessions: next.sessions.map((s) => ({
        ...s,
        roster: s.roster.filter((k) => k !== 'عراق'),
        members: s.members.filter((m) => m.key !== 'عراق'),
        resources: s.resources.map((r) => ({ ...r, pieces: r.pieces.filter((k) => k !== 'عراق') })),
      })),
    };
    const withoutPlan = planArchiveImport({ db: refreshed, index: withoutPiece, instrumentId: SETAR, now: NOW });
    const afterWithout = applyArchiveImport(refreshed, withoutPlan);
    expect(validateArchiveSources(afterWithout)).toBeNull();
    const keptPiece = afterWithout.archiveSources[0]!.pieces.find((p) => p.key === 'عراق')!;
    expect(keptPiece.unavailable).toBe(true);
    // The owner's item, its title and its binding are all still there.
    const keptItem = afterWithout.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(keptItem.title).toBe('My own title');
    expect(keptItem.notes).toBe('my notes');
    // It is not re-created as a second item either.
    expect(afterWithout.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(1);
    // A WHOLE SESSION that disappears is retained the same way.
    const withoutSession: SourceIndex = {
      ...next,
      contentHash: 'f'.repeat(64),
      sessions: next.sessions.filter((s) => s.n !== 13),
    };
    const afterNoSession = applyArchiveImport(
      refreshed,
      planArchiveImport({ db: refreshed, index: withoutSession, instrumentId: SETAR, now: NOW }),
    );
    expect(validateArchiveSources(afterNoSession)).toBeNull();
    expect(afterNoSession.archiveSources[0]!.sessions.find((s) => s.n === 13)!.unavailable).toBe(true);
    expect(afterNoSession.lessons.filter((l) => l.source?.sessionN === 13)).toHaveLength(1);
    // ...and the source coming BACK clears the flag: the source is
    // authoritative about what it has.
    const restoredPlan = planArchiveImport({ db: afterWithout, index: next, instrumentId: SETAR, now: NOW });
    const afterRestore = applyArchiveImport(afterWithout, restoredPlan);
    expect(afterRestore.archiveSources[0]!.pieces.find((p) => p.key === 'عراق')!.unavailable).toBeUndefined();
    expect(afterRestore.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(1);

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

    // EVERY legacy seed path the old importer ever wrote — all 67 of them —
    // maps through the rename log EXACTLY. No title, size or modification-time
    // matching is involved anywhere, and none of the 67 is left to a guess.
    expect(LEGACY_SEED_PATHS).toHaveLength(67);
    // 257 rows in RENAME-LOG.csv (the corpus baseline in `docs/setar-archive.md`)
    // and 257 mappings out: no row of the REAL log is dropped for any reason —
    // not unsafe, not empty, not a loop and not a fork — so the rule below
    // changes nothing the operator actually publishes today.
    expect(INDEX.renames).toHaveLength(257);
    const repairedPaths = new Map<string, string>();
    for (const p of LEGACY_SEED_PATHS) {
      const outcome = repairReferencePath(p, renames, known);
      expect(outcome.status).toBe('repaired');
      if (outcome.status !== 'repaired') throw new Error('unreachable');
      expect(outcome.path.startsWith('session-')).toBe(true);
      expect(known.has(outcome.path)).toBe(true);
      repairedPaths.set(p, outcome.path);
    }
    expect(repairedPaths.size).toBe(67);
    // Session 28's "main video" is really a NAMED DEMONSTRATION; the repair
    // says so by landing on the demo file, and nothing invents a class
    // recording for a session that has none.
    const s28 = repairReferencePath('setar-classes/session-28-28-10-2025/video-2025-10-28-19-56-30.mp4', renames, known);
    expect(s28.status === 'repaired' && s28.path).toBe('session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4');

    // A path with no rename row and no file is DIAGNOSED, never guessed — and
    // the diagnosis is about the FILE, so it is reached only once the path is
    // already in the current namespace. A legacy-prefixed one is first said in
    // that namespace (same bytes, words the device base addresses); the second
    // pass is what reports it.
    const missing = repairReferencePath('setar-classes/session-1-26-09-2023/nothing.mp4', renames, known);
    expect(missing).toEqual({ status: 'repaired', path: 'session-1-26-09-2023/nothing.mp4' });
    expect(repairReferencePath('session-1-26-09-2023/nothing.mp4', renames, known).status).toBe('attention');
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
    // ONE NAMESPACE PER ARCHIVE-OWNED LESSON. The device base is the archive
    // ROOT, so the legacy folder segment comes OFF even though the index
    // describes nothing at this path: it names the same bytes in the words the
    // base addresses. Leaving it on is what made a corrected base kill exactly
    // the references a refresh never touches — the owner's own practice takes.
    expect(personalRepair.lesson.recordings![0]!.path).toBe('session-25-05-08-2025/mine.mp4');
    // Saying so is NOT saying the file is there: no attention row is raised,
    // because the index describes only material scoped to pieces and classes.
    expect(personalRepair.attention.some((a) => a.path.includes('mine.mp4'))).toBe(false);
    // …and it is IDEMPOTENT: once said in the current namespace there is
    // nothing left to change, so a second refresh writes nothing.
    expect(repairReferencePath('session-25-05-08-2025/mine.mp4', renames, known)).toEqual({
      status: 'attention',
      reason: 'The archive no longer has a file at this path.',
      code: 'not-described',
    });
    // The archive never offers a personal recording as material for a piece.
    const source = applyArchiveImport(baseDB(), plan(baseDB())).archiveSources[0]!;
    expect(source.sessions.every((s) => s.resources.every((r) => r.role !== 'تمرین-من'))).toBe(true);

    // --- THE REFRESH ITSELF REPAIRS THEM ------------------------------------
    // The helper above proves the mapping. THIS proves the production journey:
    // the rename log arrives WITH the index, so the one moment the app can
    // repair a stored path is the moment it accepts a new graph — and a lesson
    // adopted with its own references still pointing at names the archive
    // renamed is half a job, bound and broken.
    const ownPersonal = lesson({
      id: 'L25',
      date: '2025-08-05',
      number: 25,
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
    const legacyDb = baseDB({ lessons: [collided, ownPersonal] });
    const refresh = plan(legacyDb);
    const adoptedOne = refresh.adoptedLessons.find((l) => l.id === 'L1')!;
    expect(adoptedOne.source).toEqual({ archiveId: 'setar-classes', sessionN: 1 });
    // The PLAN already shows the repaired paths, so the preview and the commit
    // cannot disagree about what is about to be written.
    const planned = new Map(adoptedOne.recordings!.map((r) => [r.id, r]));
    expect(planned.get('old-video')!.path).toBe('session-1-26-09-2023/ضبط-کلاس-1.mp4');
    expect(planned.get('old-score')!.path).toBe('session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.pdf');

    const installedLegacy = applyArchiveImport(legacyDb, refresh);
    const storedOne = installedLegacy.lessons.find((l) => l.id === 'L1')!;
    expect(storedOne.recordings).toEqual(adoptedOne.recordings);
    // BOTH rows of each collision survive, with everything the owner wrote.
    expect(storedOne.recordings).toHaveLength(4);
    const stored = new Map(storedOne.recordings!.map((r) => [r.id, r]));
    expect(stored.get('old-video')!.path).toBe(stored.get('current-video')!.path);
    expect(stored.get('old-score')!.path).toBe(stored.get('current-score')!.path);
    expect(stored.get('old-video')!.title).toBe('Class 1 (old link)');
    expect(stored.get('old-video')!.notes).toBe('The half I watched first.');
    expect(stored.get('old-score')!.notes).toBe('Teacher marked bar 12.');
    expect(validateArchiveSources(installedLegacy)).toBeNull();

    // The owner's own practice takes are RETAINED and never reported missing —
    // the index describes only material scoped to pieces and classes, so a path
    // it does not name is outside what it knows, never evidence that the file is
    // gone. RETAINED IS NOT THE SAME CLAIM AS LEFT IN THE OLD NAMESPACE: the row,
    // its title and its notes are the owner's and are untouched, while the path
    // text is said in the one namespace the device base addresses, exactly like
    // every described row on the same class.
    const storedPersonal = installedLegacy.lessons.find((l) => l.id === 'L25')!;
    expect(storedPersonal.recordings![0]!.path).toBe('session-25-05-08-2025/mine.mp4');
    expect(storedPersonal.recordings![0]!.notes).toBe('Slow but even.');
    expect(storedPersonal.recordings![0]!.title).toBe('My take, August');
    expect(refresh.attention.some((a) => a.path.includes('mine.mp4'))).toBe(false);
    // NO ARCHIVE-OWNED LESSON IS LEFT HOLDING TWO NAMESPACES AT ONCE. This is
    // the invariant the fix is actually for: resolving any of these against the
    // device base (the archive root) must not produce `…/setar-classes/…`.
    // …proved against the RESOLVER and the owner's own Mac archive base, because
    // the namespace only matters at the moment a file is opened: the reported
    // failure was a URL, not a stored string.
    const macBase = 'https://192.168.0.20:5010/setar-classes';
    for (const l of installedLegacy.lessons) {
      if (!l.source) continue;
      for (const r of l.recordings ?? []) {
        expect(r.path.startsWith('setar-classes/')).toBe(false);
        expect(resolveRecordingUrl(macBase, r)).toMatch(
          /^https:\/\/192\.168\.0\.20:5010\/setar-classes\/session-[^/]+\/[^/]+$/,
        );
      }
    }

    // --- A FULL URL CONVERTS ONLY UNDER THE DEVICE'S OWN BASE ---------------
    // `ArchiveRefresh` threads `archiveRootUrl(getNasBaseUrl())` into the plan
    // as `verifiedBase`, so this uses that FUNCTION's own output rather than a
    // literal: a trailing-slash or prefix mismatch between the two would fail
    // silently, leaving the link exactly as it was with nothing to show why.
    const deviceBase = archiveRootUrl('https://192.168.0.20:5010/setar-classes')!;
    const absolute = lesson({
      id: 'L-abs',
      date: '2023-09-26',
      number: 1,
      recordings: [
        {
          id: 'abs-1',
          title: 'Class 1, saved as a full link',
          path: `${deviceBase}session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4`,
          kind: 'video',
          notes: 'Typed in from the browser bar.',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
        {
          id: 'foreign',
          title: 'Somewhere else entirely',
          path: 'https://elsewhere.example/x.mp4',
          kind: 'video',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
      ],
    });
    const absDb = baseDB({ lessons: [absolute] });
    const urlRepaired = applyArchiveImport(
      absDb,
      planArchiveImport({ db: absDb, index: INDEX, instrumentId: SETAR, verifiedBase: deviceBase, now: NOW }),
    );
    const convertedRows = new Map(urlRepaired.lessons.find((l) => l.id === 'L-abs')!.recordings!.map((r) => [r.id, r]));
    expect(convertedRows.get('abs-1')!.path).toBe('session-1-26-09-2023/ضبط-کلاس-1.mp4');
    expect(convertedRows.get('abs-1')!.notes).toBe('Typed in from the browser bar.');
    // A link to somewhere else is not this archive's to rewrite.
    expect(convertedRows.get('foreign')!.path).toBe('https://elsewhere.example/x.mp4');
    // WITHOUT a base, nothing is converted and nothing is mangled.
    const noBase = applyArchiveImport(absDb, plan(absDb));
    const noBaseRows = new Map(noBase.lessons.find((l) => l.id === 'L-abs')!.recordings!.map((r) => [r.id, r]));
    expect(noBaseRows.get('abs-1')!.path).toBe(absolute.recordings![0]!.path);
    expect(noBaseRows.get('foreign')!.path).toBe('https://elsewhere.example/x.mp4');

    // --- IDEMPOTENT: the second refresh repairs nothing ---------------------
    const again = plan(installedLegacy);
    expect(again.repairedLessons).toEqual([]);
    expect(again.summary.unchanged).toBe(true);
    expect(applyArchiveImport(installedLegacy, again)).toBe(installedLegacy);

    // --- AN ALREADY-BOUND LESSON IS REPAIRED BY A LATER RENAME -------------
    // The archive moves a file the owner's bound class already points at. The
    // next refresh follows the log; the row, its title and its notes stay.
    const movedTo = 'session-1-26-09-2023/ضبط-کلاس-part-1.mp4';
    const moved: SourceIndex = {
      ...INDEX,
      contentHash: '9'.repeat(64),
      renames: [...INDEX.renames, { from: 'session-1-26-09-2023/ضبط-کلاس-1.mp4', to: movedTo }],
      sessions: INDEX.sessions.map((sess) =>
        sess.n === 1
          ? {
              ...sess,
              resources: sess.resources.map((r) =>
                r.path === 'session-1-26-09-2023/ضبط-کلاس-1.mp4' ? { ...r, path: movedTo } : r,
              ),
            }
          : sess,
      ),
    };
    const later = planArchiveImport({ db: installedLegacy, index: moved, instrumentId: SETAR, now: NOW });
    expect(later.repairedLessons.map((l) => l.id)).toEqual(['L1']);
    const afterMove = applyArchiveImport(installedLegacy, later);
    const movedLesson = afterMove.lessons.find((l) => l.id === 'L1')!;
    const movedRows = new Map(movedLesson.recordings!.map((r) => [r.id, r]));
    expect(movedRows.get('old-video')!.path).toBe(movedTo);
    expect(movedRows.get('current-video')!.path).toBe(movedTo);
    expect(movedRows.get('old-video')!.notes).toBe('The half I watched first.');
    // The score, which did not move, is exactly as it was.
    expect(movedRows.get('old-score')!.path).toBe(stored.get('old-score')!.path);
    // Nothing about practice moved with it.
    expect(afterMove.blocks).toEqual(installedLegacy.blocks);
    expect(validateArchiveSources(afterMove)).toBeNull();

    // --- A BROKEN CHAIN IS DIAGNOSED, never guessed ------------------------
    // A rename whose destination the archive no longer has: the stored path is
    // left exactly as it is, and the owner is told which file and why.
    const dangling: SourceIndex = {
      ...INDEX,
      contentHash: '8'.repeat(64),
      renames: [...INDEX.renames, { from: 'session-1-26-09-2023/ضبط-کلاس-1.mp4', to: 'session-1-26-09-2023/gone.mp4' }],
    };
    const broken = planArchiveImport({ db: installedLegacy, index: dangling, instrumentId: SETAR, now: NOW });
    expect(broken.repairedLessons).toEqual([]);
    expect(broken.attention.some((a) => /renamed, but the archive no longer has it/.test(a.reason))).toBe(true);
    const afterBroken = applyArchiveImport(installedLegacy, broken);
    expect(afterBroken.lessons.find((l) => l.id === 'L1')!.recordings).toEqual(storedOne.recordings);

    // --- ONE READING OF A CHAIN, EVERYWHERE IT IS USED AS AN IDENTITY ------
    // Adoption took a single hop while repair followed the whole chain, so one
    // rename log gave two different answers about the same file. With
    // A -> B -> C logged, B in session 1 and C in session 2, a unique legacy
    // class was adopted AS SESSION 1 on the strength of B, and then had that
    // very reference repaired into session 2's folder: bound to one class,
    // pointing at another's files.
    const hopA = 'session-1-26-09-2023/first-name.mp4';
    const hopB = 'session-1-26-09-2023/second-name.mp4';
    const hopC = 'session-5-23-01-2024/ضبط-کلاس.mp4'; // a real file, another session
    expect(known.has(hopC)).toBe(true);
    const chained: SourceIndex = {
      ...INDEX,
      contentHash: '7'.repeat(64),
      renames: [...INDEX.renames, { from: hopA, to: hopB }, { from: hopB, to: hopC }],
    };
    const chainRenames = new Map(chained.renames.map((r) => [r.from, r.to]));
    expect(followRenames(hopA, chainRenames)).toBe(hopC);
    const legacyClass = lesson({
      id: 'L-chain',
      date: '2023-09-26',
      number: 1,
      recordings: [{ id: 'c1', title: 'Class 1', path: hopA, kind: 'video', createdAt: '2023-09-27T00:00:00.000Z' }],
    });
    const chainDb = baseDB({ lessons: [legacyClass] });
    const chainPlan = planArchiveImport({ db: chainDb, index: chained, instrumentId: SETAR, now: NOW });
    // Its ONLY reference now points into session 5, so it is NOT evidence of
    // session 1 — and the class is not adopted on it.
    expect(chainPlan.adoptedLessons.some((l) => l.id === 'L-chain')).toBe(false);
    // A CYCLE is no reading at all, so it is no evidence either.
    const cyclicIndex: SourceIndex = {
      ...INDEX,
      contentHash: '6'.repeat(64),
      renames: [...INDEX.renames, { from: hopA, to: hopB }, { from: hopB, to: hopA }],
    };
    expect(
      planArchiveImport({ db: chainDb, index: cyclicIndex, instrumentId: SETAR, now: NOW }).adoptedLessons.some(
        (l) => l.id === 'L-chain',
      ),
    ).toBe(false);

    // --- A HIDE FOLLOWS ITS FILE, AND A RENAMED FILE IS NOT "MISSING" ------
    // A resource suppression is keyed BY PATH. Left on the old name, the file
    // came back into view under its new one while the old row sat there
    // flagged unavailable — the owner's decision silently undone by a rename.
    const hiddenPath = 'session-1-26-09-2023/ضبط-کلاس-1.mp4';
    const hidden: PracticeDB = {
      ...installedLegacy,
      archiveSources: withSuppression(installedLegacy.archiveSources, 'setar-classes', {
        kind: 'resource',
        ref: hiddenPath,
        itemId: 'item-x',
        at: NOW.toISOString(),
      }),
    };
    const afterRename = applyArchiveImport(hidden, planArchiveImport({ db: hidden, index: moved, instrumentId: SETAR, now: NOW }));
    const renamedSource = afterRename.archiveSources[0]!;
    const hide = renamedSource.suppressions.find((x) => x.kind === 'resource')!;
    expect(hide.ref).toBe(movedTo);
    expect(hide.itemId).toBe('item-x'); // the SCOPE is carried, not widened
    expect(renamedSource.suppressions.filter((x) => x.kind === 'resource')).toHaveLength(1);
    // And the old row is GONE rather than retained-and-flagged: the log says
    // exactly where the bytes went, so this file moved, it did not disappear.
    const session1 = renamedSource.sessions.find((x) => x.n === 1)!;
    expect(session1.resources.some((r) => r.path === hiddenPath)).toBe(false);
    expect(session1.resources.some((r) => r.path === movedTo && !r.unavailable)).toBe(true);
    // ACROSS sessions too — a rename can move a file into a different session,
    // which is exactly the shape of the A -> B -> C log above. Asking only
    // "is it still in THIS session" flagged the old row as missing while the
    // very same bytes sat in the graph under their new name.
    const crossTo = 'session-5-23-01-2024/moved-out-of-session-1.mp4';
    const oldRow = INDEX.sessions.find((x) => x.n === 1)!.resources.find((r) => r.path === hiddenPath)!;
    const crossSession: SourceIndex = {
      ...INDEX,
      contentHash: '4'.repeat(64),
      renames: [...INDEX.renames, { from: hiddenPath, to: crossTo }],
      sessions: INDEX.sessions.map((sess) =>
        sess.n === 1
          ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) }
          : sess.n === 5
            ? { ...sess, resources: [...sess.resources, { ...oldRow, path: crossTo }] }
            : sess,
      ),
    };
    const afterCross = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: crossSession, instrumentId: SETAR, now: NOW }),
    );
    const crossSource = afterCross.archiveSources[0]!;
    expect(crossSource.sessions.find((x) => x.n === 1)!.resources.some((r) => r.path === hiddenPath)).toBe(false);
    expect(crossSource.sessions.find((x) => x.n === 5)!.resources.some((r) => r.path === crossTo)).toBe(true);
    // The hide went WITH it, into the other session, still scoped to one item.
    expect(crossSource.suppressions.find((x) => x.kind === 'resource')).toMatchObject({
      ref: crossTo,
      itemId: 'item-x',
    });
    expect(validateArchiveSources(afterCross)).toBeNull();

    // --- A CYCLE IS NO READING, FOR EVERY CONSUMER OF THE LOG -------------
    // `followRenames` used to hand back `{ path, cycle: true }` — a perfectly
    // usable-looking path beside a flag — and only ONE of its three callers
    // read the flag. Hide A, then publish A->B and B->A: the re-key walked
    // straight past the verdict and moved the owner's hide onto B, so A came
    // back into view and the wrong file went dark. It returns `null` now, so
    // there is no way to drop the verdict and still have a path.
    const cyclicTo = 'session-1-26-09-2023/ضبط-کلاس-2.mp4'; // a real sibling file
    const cyclicLog: SourceIndex = {
      ...INDEX,
      contentHash: '3'.repeat(64),
      renames: [...INDEX.renames, { from: hiddenPath, to: cyclicTo }, { from: cyclicTo, to: hiddenPath }],
    };
    const afterCycle = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: cyclicLog, instrumentId: SETAR, now: NOW }),
    );
    const cycledSource = afterCycle.archiveSources[0]!;
    const cycledHide = cycledSource.suppressions.find((x) => x.kind === 'resource')!;
    expect(cycledHide.ref).toBe(hiddenPath); // exactly where the owner put it
    expect(cycledHide.itemId).toBe('item-x');
    expect(cycledSource.suppressions.filter((x) => x.kind === 'resource')).toHaveLength(1);
    // …so the file the owner hid is still hidden, and its sibling is not.
    expect(resourcesForPiece(cycledSource, 'عراق', 'item-x').some((r) => r.path === hiddenPath)).toBe(false);
    expect(resourcesForSession(cycledSource, 1).some((r) => r.path === cyclicTo)).toBe(true);

    // AVAILABILITY reads the same verdict: a cycle is not a move, so a row the
    // incoming index has dropped keeps its provenance flagged rather than
    // being silently deleted on the strength of a destination nothing can read.
    const cyclicAndRemoved: SourceIndex = {
      ...cyclicLog,
      contentHash: '2'.repeat(64),
      sessions: cyclicLog.sessions.map((sess) =>
        sess.n === 1 ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) } : sess,
      ),
    };
    const afterCyclicRemoval = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: cyclicAndRemoved, instrumentId: SETAR, now: NOW }),
    );
    expect(
      afterCyclicRemoval.archiveSources[0]!.sessions.find((x) => x.n === 1)!.resources.find(
        (r) => r.path === hiddenPath,
      )?.unavailable,
    ).toBe(true);
    expect(validateArchiveSources(afterCyclicRemoval)).toBeNull();

    // REPAIR says so out loud rather than rewriting the path to a stop on the
    // loop — and ADOPTION, which reads the same verdict, takes it as no
    // evidence at all (asserted above for the same shape).
    const loopMap = new Map(cyclicLog.renames.map((r) => [r.from, r.to]));
    expect(followRenames(hiddenPath, loopMap)).toBeNull();
    expect(repairReferencePath(hiddenPath, loopMap, known)).toEqual({
      status: 'attention',
      reason: 'The rename log loops on this path.',
      code: 'cycle',
    });
    const loopLesson = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: cyclicLog, instrumentId: SETAR, now: NOW }),
    ).lessons.find((l) => l.id === 'L1')!;
    expect(loopLesson.recordings).toEqual(storedOne.recordings);

    // --- TWO DESTINATIONS IS NO READING EITHER, AND THE SAME THREE CONSUMERS
    // READ IT THAT WAY. A loop and a fork are ONE defect said two ways: the
    // log does not determine what this file is called now. The scanner used to
    // publish the FIRST destination and diagnose the second as "not applied",
    // so the app was handed a mapping the log cannot support and used it as
    // exact identity — repairing an authored reference onto it and re-keying
    // an owner's hide onto it. What it publishes for a fork is nothing, and
    // this drives the transitions from that real output rather than a guess
    // at it. (A forked log reaching the app from anywhere else is REFUSED at
    // every door by the one grammar — asserted in `io.test.ts` against the
    // persisted door, and by `checkSourceGraph` for the decoder.)
    const forkTo = 'session-1-26-09-2023/ضبط-کلاس-2.mp4';
    const forkOther = 'session-5-23-01-2024/ضبط-کلاس.mp4';
    const scanned = buildIndex({
      registryText: EMPTY_REGISTRY,
      inventory: [],
      renameLog: {
        present: true,
        text: `old_path,new_path\n${hiddenPath},${forkTo}\n${hiddenPath},${forkOther}\n`,
      },
    });
    expect(scanned.renames).toEqual([]);
    expect(scanned.diagnostics.find((d) => d.path === hiddenPath)!.reason).toContain('more than one destination');
    const forkMap = new Map(scanned.renames.map((r) => [r.from, r.to]));
    // The READING: the file keeps the only name this log establishes — its own.
    expect(followRenames(hiddenPath, forkMap)).toBe(hiddenPath);
    // The REFERENCE: left exactly as the owner saved it, never rewritten onto
    // either destination.
    expect(repairReferencePath(hiddenPath, forkMap, known)).toEqual({ status: 'unchanged' });
    const forkIndex: SourceIndex = { ...INDEX, contentHash: '1'.repeat(64), renames: scanned.renames };
    const afterFork = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: forkIndex, instrumentId: SETAR, now: NOW }),
    );
    expect(afterFork.lessons.find((l) => l.id === 'L1')!.recordings).toEqual(storedOne.recordings);
    // The HIDE: exactly where the owner put it, still scoped to one item — so
    // the file they hid is still hidden and neither destination went dark.
    const forkedSource = afterFork.archiveSources[0]!;
    expect(forkedSource.suppressions.filter((x) => x.kind === 'resource')).toEqual([
      { kind: 'resource', ref: hiddenPath, itemId: 'item-x', at: NOW.toISOString() },
    ]);
    expect(resourcesForPiece(forkedSource, 'عراق', 'item-x').some((r) => r.path === hiddenPath)).toBe(false);
    expect(resourcesForSession(forkedSource, 1).some((r) => r.path === forkTo)).toBe(true);
    expect(validateArchiveSources(afterFork)).toBeNull();

    // A file that really IS gone still keeps its provenance, flagged.
    const removed: SourceIndex = {
      ...INDEX,
      contentHash: '5'.repeat(64),
      sessions: INDEX.sessions.map((sess) =>
        sess.n === 1 ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) } : sess,
      ),
    };
    const afterRemoval = applyArchiveImport(
      installedLegacy,
      planArchiveImport({ db: installedLegacy, index: removed, instrumentId: SETAR, now: NOW }),
    );
    expect(
      afterRemoval.archiveSources[0]!.sessions.find((x) => x.n === 1)!.resources.find((r) => r.path === hiddenPath)
        ?.unavailable,
    ).toBe(true);
    expect(validateArchiveSources(afterRename)).toBeNull();
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
