import { describe, expect, it, vi } from 'vitest';
import { associationsForItem, associationsForLesson, lessonAssociations } from '../src/domain/sourceArchive';
import { itemFiles } from '../src/domain/itemFiles';
import { validateDB } from '../src/domain/io';
import { createItem, createLesson } from '../src/domain/factories';
import { emptyDB } from '../src/domain/seed';
import type { PracticeDB } from '../src/domain/types';

// ---------------------------------------------------------------------------
// ac-6 — ONE lesson ↔ item relation for every reader. The owner's links are
// authored history; the archive's session membership is provenance, derived
// on read and never copied into `lesson.itemIds` or the agenda. Driven through
// the real store actions (storage stubbed, as the other store suites do).
// ---------------------------------------------------------------------------

vi.mock('../src/store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/store/idb')>();
  return {
    ...actual,
    deleteBlob: async () => undefined,
    storageSettled: () => Promise.resolve(),
    idbStorage: { getItem: async () => null, setItem: async () => undefined, removeItem: async () => undefined },
  };
});
const { useStore } = await import('../src/store/useStore');

const NOW = new Date('2026-10-05T08:00:00.000Z');
const T = NOW.toISOString();
const SETAR = 'inst-setar';
const TAR = 'inst-tar';
const A = 'سه‌گاه-آ';
const B = 'شور-ب';
const C = 'ماهور-پ';
const UNBOUND = 'چهارگاه-ت';

const resource = (n: number, name: string, pieces: string[], role = 'نت') => ({
  path: `session-${n}-0${n}-01-2025/${name}`,
  role,
  kind: role === 'نت' ? ('score' as const) : ('video' as const),
  title: name,
  part: null,
  pieces,
  group: role === 'نمونه' ? `نمونه:` : null,
});

function fixture(): PracticeDB {
  const piece = (key: string, sessions: number[], unavailable = false) => ({
    key,
    form: 'گوشه',
    piece: key,
    dastgah: '',
    composer: '',
    aliases: [],
    sessions,
    notes: '',
    ...(unavailable ? { unavailable: true } : {}),
  });
  const item = (id: string, title: string, instrumentId = SETAR, pieceKey?: string) => ({
    ...createItem({ instrumentId, title }, NOW),
    id,
    ...(pieceKey ? { source: { archiveId: 'setar-classes', pieceKey } } : {}),
  });
  const lesson = (id: string, n: number | undefined, itemIds: string[]) => ({
    ...createLesson({ instrumentId: SETAR, date: `2025-01-0${n ?? 9}`, number: n }, NOW),
    id,
    itemIds,
    ...(n ? { source: { archiveId: 'setar-classes', sessionN: n }, origin: 'archive' as const } : {}),
  });
  const session = (n: number, members: string[]) => ({
    n,
    date: `2025-01-0${n}`,
    folder: `session-${n}-0${n}-01-2025`,
    roster: members,
    rosterTrusted: true,
    hasClassRecording: false,
    resources: [resource(n, `نمونه.mp4`, members, 'نمونه')],
    members: members.map((key) => ({ key, roles: ['نمونه'] })),
  });
  return validateDB({
    ...emptyDB(),
    instruments: [
      { id: SETAR, name: 'Setar', active: true, createdAt: T, updatedAt: T },
      { id: TAR, name: 'Tar', active: true, createdAt: T, updatedAt: T },
    ],
    items: [
      item('it-a', A, SETAR, A),
      item('it-b', B, SETAR, B),
      item('it-c', C, SETAR, C),
      // Same TITLE as a piece, never bound: a title is not identity.
      item('it-a-lookalike', A),
      // Another instrument, same title: never this lesson's.
      item('it-a-tar', A, TAR),
      item('it-manual', 'An item I linked myself'),
    ],
    lessons: [
      // Session 1 lists A, B, C and a piece no item is bound to; the owner ALSO linked A.
      lesson('L-1', 1, ['it-a']),
      // Session 2 lists A only; the owner later deleted that class (suppressed).
      lesson('L-2', 2, []),
      // A manual class with an authored link.
      lesson('L-manual', undefined, ['it-manual']),
    ],
    lessonAgenda: [{ id: 'prep-1', kind: 'preparation', instrumentId: SETAR, itemId: 'it-b', lessonId: 'L-manual', createdAt: T, updatedAt: T }],
    archiveSources: [
      {
        id: 'setar-classes',
        instrumentId: SETAR,
        indexHash: 'h',
        acceptedAt: T,
        // B is no longer described by the registry: still bound, still provenance.
        pieces: [piece(A, [1, 2]), piece(B, [1], true), piece(C, [1]), piece(UNBOUND, [1])],
        sessions: [session(1, [A, B, C, UNBOUND]), session(2, [A])],
        renames: [],
        diagnostics: [],
        suppressions: [
          { kind: 'session', ref: '2', at: T },
          // A demonstration hidden on B only: material scope, not association.
          { kind: 'resource', ref: 'session-1-01-01-2025/نمونه.mp4', itemId: 'it-b', at: T },
        ],
      },
    ],
  } as unknown);
}

const pairs = (db: PracticeDB) =>
  lessonAssociations(db)
    .map((a) => `${a.lessonId}>${a.itemId}:${a.explicit ? 'E' : ''}${a.derived ? 'D' : ''}`)
    .sort();

describe('lesson and item associations', () => {
  it('setar association readers agree without copying source membership into owner history', () => {
    const db = fixture();
    useStore.setState({ db, active: null, activeRoutine: null, activePlan: null });
    const s = () => useStore.getState();

    // --- ONE relation, each pair ONCE -------------------------------------
    expect(pairs(db)).toEqual(
      [
        'L-1>it-a:ED', // linked AND listed: one association
        'L-1>it-b:D', // unavailable piece, still bound: provenance kept
        'L-1>it-c:D',
        'L-manual>it-manual:E',
        // nothing for session 2 (deleted class), nothing for the lookalike,
        // the Tar item or the piece no item is bound to
      ].sort(),
    );
    // Lesson-side and item-side readers are the SAME relation, without duplicates.
    for (const lesson of db.lessons) {
      const ids = associationsForLesson(db, lesson.id).map((a) => a.itemId);
      expect(new Set(ids).size, lesson.id).toBe(ids.length);
      for (const id of ids) expect(associationsForItem(db, id).map((a) => a.lessonId), lesson.id).toContain(lesson.id);
    }
    for (const item of db.items) {
      const ids = associationsForItem(db, item.id).map((a) => a.lessonId);
      expect(new Set(ids).size, item.id).toBe(ids.length);
    }
    expect(associationsForItem(db, 'it-a-lookalike')).toEqual([]);
    expect(associationsForItem(db, 'it-a-tar')).toEqual([]);

    const materialOfB = itemFiles(db, 'it-b');
    const agenda = JSON.stringify(db.lessonAgenda);

    // --- UNLINK a derived association: the owner's decision, narrowly -------
    s().unlinkItemFromLesson('L-1', 'it-b');
    expect(pairs(s().db)).not.toContain('L-1>it-b:D');
    expect(s().db.lessons.find((l) => l.id === 'L-1')!.itemIds).toEqual(['it-a']);
    expect(s().db.archiveSources[0]!.suppressions.filter((x) => x.kind === 'link').map((x) => x.ref)).toEqual([`1:${B}`]);
    // …and RELINK lifts exactly that unlink — never copying membership into itemIds.
    s().linkItemToLesson('L-1', 'it-b');
    expect(pairs(s().db)).toContain('L-1>it-b:D');
    expect(s().db.lessons.find((l) => l.id === 'L-1')!.itemIds).toEqual(['it-a']);
    expect(s().db.archiveSources[0]!.suppressions.filter((x) => x.kind === 'link')).toEqual([]);
    // The OTHER suppressions — the deleted class, the material hide — are untouched.
    expect(s().db.archiveSources[0]!.suppressions.map((x) => `${x.kind}:${x.ref}:${x.itemId ?? ''}`).sort()).toEqual(
      ['session:2:', `resource:session-1-01-01-2025/نمونه.mp4:it-b`].sort(),
    );
    // Material scope is independent of association: B's hidden demo stays hidden.
    expect(itemFiles(s().db, 'it-b')).toEqual(materialOfB);

    // --- UNLINK an association that is BOTH: the link and the listing go ----
    s().unlinkItemFromLesson('L-1', 'it-a');
    expect(pairs(s().db).filter((p) => p.startsWith('L-1>it-a'))).toEqual([]);
    expect(s().db.lessons.find((l) => l.id === 'L-1')!.itemIds).toEqual([]);
    // Relinking brings back the archive's listing — and adds no authored link.
    s().linkItemToLesson('L-1', 'it-a');
    expect(pairs(s().db)).toContain('L-1>it-a:D');
    expect(s().db.lessons.find((l) => l.id === 'L-1')!.itemIds).toEqual([]);

    // --- A MANUAL link stays authored history, with no suppression ---------
    s().unlinkItemFromLesson('L-manual', 'it-manual');
    expect(s().db.archiveSources[0]!.suppressions.some((x) => x.kind === 'link')).toBe(false);
    s().linkItemToLesson('L-manual', 'it-manual');
    expect(s().db.lessons.find((l) => l.id === 'L-manual')!.itemIds).toEqual(['it-manual']);
    // A lookalike linked BY HAND is an authored link to THAT record, nothing more.
    s().linkItemToLesson('L-1', 'it-a-lookalike');
    expect(pairs(s().db)).toContain('L-1>it-a-lookalike:E');
    expect(pairs(s().db)).toContain('L-1>it-a:D');

    // --- DELETED entities simply stop associating --------------------------
    s().deleteItem('it-c');
    expect(pairs(s().db).some((p) => p.includes('it-c'))).toBe(false);
    s().deleteLesson('L-manual');
    expect(pairs(s().db).some((p) => p.startsWith('L-manual'))).toBe(false);

    // Nothing in the agenda was touched by any link or unlink above (the
    // lesson deletion detaches its entries, as it always has).
    expect(JSON.parse(agenda)[0].itemId).toBe('it-b');
    expect(s().db.lessonAgenda.find((e) => e.id === 'prep-1')!.itemId).toBe('it-b');
    // Every state above is a database every door accepts.
    expect(() => validateDB(s().db)).not.toThrow();
  });
});
