import { appendFileSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error — the operator tools are untyped .mjs; these are the REAL producer and publisher.
import { buildIndex, parseAssetStem, readStableSource, readSource, scanToIndex } from '../scripts/scan-setar-classes.mjs';
// @ts-expect-error — see above.
import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
import SOURCE from './fixtures/setar-lifecycle-source.json' with { type: 'json' };
import EXPECTED from './fixtures/setar-lifecycle-expected.json' with { type: 'json' };
import OWNER from './fixtures/setar-lifecycle-owner.json' with { type: 'json' };
import {
  applyArchiveImport,
  archiveFor,
  decodeSourceIndex,
  defaultTargetLesson,
  emptyDB,
  lessonFiles,
  nextLessonFor,
  planArchiveImport,
  preparationDatesByItem,
  repairReferencePath,
  validateDB,
  type AttachmentMeta,
  type Lesson,
  type LessonAgendaEntry,
  type PracticeDB,
  type PracticeItem,
  type ReconcileDecision,
  type SourceIndex,
} from '../src/domain';
import { readIndexFile } from '../src/store/archiveIndex';

// ---------------------------------------------------------------------------
// The Setar lesson lifecycle's Node families (docs/setar-lesson-lifecycle.md).
// Expectations come from the hand-written fixtures, never from the code under
// test. Storage is the same controllable stub the archive store tests use.
// ---------------------------------------------------------------------------

const storage = vi.hoisted(() => {
  let value: string | null = null;
  let failNext = false;
  return {
    get: () => value,
    set: (v: string | null) => (value = v),
    failNext: () => (failNext = true),
    take: () => {
      const f = failNext;
      failNext = false;
      return f;
    },
    deleted: [] as string[],
  };
});
vi.mock('../src/store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/store/idb')>();
  let settle: Promise<void> = Promise.resolve();
  return {
    ...actual,
    clearBlobs: async () => undefined,
    deleteBlob: async (id: string) => void storage.deleted.push(id),
    allBlobs: async () => [],
    heldBlobIds: async () => new Set<string>(),
    storageSettled: () => settle,
    idbStorage: {
      getItem: async () => storage.get(),
      setItem: async (_n: string, v: string) => {
        if (storage.take()) {
          settle = Promise.reject(new Error('the device refused the write'));
          void settle.catch(() => undefined);
          return;
        }
        storage.set(v);
        settle = Promise.resolve();
      },
      removeItem: async () => storage.set(null),
    },
  };
});
// localStorage for the notes recovery copies (Node has none).
const local = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => local.get(k) ?? null,
  setItem: (k: string, v: string) => void local.set(k, v),
  removeItem: (k: string) => void local.delete(k),
  key: (i: number) => [...local.keys()][i] ?? null,
  get length() {
    return local.size;
  },
});
const { useStore, useLiveQuestion } = await import('../src/store/useStore');
const { holdNoteDraft, dropNoteDraft, heldNoteDraft } = await import('../src/store/notesDrafts');

const SETAR = 'inst-setar';
const ARCHIVE = 'setar-classes';
const NOW = new Date('2026-10-30T12:00:00.000Z');

type Inventory = { path: string; size: number }[];
const inventoryOf = (files: Record<string, number>): Inventory =>
  Object.entries(files)
    .map(([path, size]) => ({ path, size }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

/** A pure build of the corpus, for the reconciliation family's setup (the source family owns the real filesystem run). */
function corpusIndex(extra: Record<string, number> = {}): SourceIndex {
  return decodeSourceIndex(
    buildIndex({
      registryText: SOURCE.registryBefore,
      inventory: inventoryOf({ ...SOURCE.filesBefore, ...extra }),
      renameLog: { present: true, text: SOURCE.renameLogBefore },
    }),
  );
}

/** What the source family compares: the published facts, never a re-derivation. */
function project(index: { sessions: SourceIndex['sessions']; diagnostics: SourceIndex['diagnostics']; renames: SourceIndex['renames'] }) {
  return {
    sessions: index.sessions.map((s) => ({
      n: s.n,
      date: s.date,
      roster: s.roster,
      rosterTrusted: s.rosterTrusted,
      resources: s.resources.map((r) => ({ path: r.path, role: r.role, pieces: r.pieces })),
      members: s.members.map((m) => ({ key: m.key, roles: m.roles })),
    })),
    diagnostics: index.diagnostics.map((d) => ({ path: d.path, code: d.code })),
    renames: index.renames.map((r) => ({ from: r.from, to: r.to })),
  };
}

// --- a fake Git boundary: the publisher's whole world ------------------------
function fakeGit() {
  const repo = {
    refs: new Map<string, string>([['main', 'c-main']]),
    commits: new Map<string, { tree: Record<string, string> }>([['c-main', { tree: { 'state.json': 'practice data' } }]]),
    n: 0,
  };
  const transport = {
    getRef: async (b: string) => (repo.refs.has(b) ? { sha: repo.refs.get(b)! } : null),
    getCommit: async (sha: string) => ({ treeSha: sha }),
    getFile: async (sha: string, path: string) => {
      const t = repo.commits.get(sha)?.tree[path];
      return t === undefined ? null : { text: t };
    },
    createBlob: async (text: string) => text,
    createTree: async ({ baseTreeSha, path, blobSha }: { baseTreeSha: string | null; path: string; blobSha: string }) =>
      JSON.stringify({ ...(baseTreeSha ? repo.commits.get(baseTreeSha)!.tree : {}), [path]: blobSha }),
    createCommit: async ({ treeSha }: { treeSha: string }) => {
      const sha = `c-${(repo.n += 1)}`;
      repo.commits.set(sha, { tree: JSON.parse(treeSha) });
      return sha;
    },
    updateRef: async (b: string, sha: string, expected: string) => (repo.refs.get(b) === expected ? (repo.refs.set(b, sha), 'ok') : 'HTTP 422'),
    createRef: async (b: string, sha: string) => (repo.refs.has(b) ? 'HTTP 422' : (repo.refs.set(b, sha), 'ok')),
  };
  const published = () => repo.commits.get(repo.refs.get(SOURCE_INDEX_BRANCH)!)?.tree[INDEX_PATH] ?? null;
  return { repo, transport, published };
}

function writeCorpus(root: string) {
  writeFileSync(join(root, 'PIECES.csv'), SOURCE.registryBefore);
  writeFileSync(join(root, 'RENAME-LOG.csv'), SOURCE.renameLogBefore);
  for (const [path, size] of Object.entries(SOURCE.filesBefore)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), Buffer.alloc(size, path.length % 251));
  }
  for (const f of SOURCE.emptyFolders) mkdirSync(join(root, f), { recursive: true });
}

function cleanDB(): PracticeDB {
  return { ...emptyDB(), instruments: [{ ...OWNER.instrument }] } as PracticeDB;
}

describe('the Setar source pipeline', () => {
  it('setar source pipeline indexes sessions 40 and 41 without creating a lesson from empty session 42', async () => {
    const root = mkdtempSync(join(tmpdir(), 'setar-lifecycle-'));
    try {
      writeCorpus(root);

      // --- BEFORE REPAIR: the real scanner over the real filesystem ---------
      const before = scanToIndex(root);
      expect(project(before)).toEqual({ sessions: EXPECTED.before.sessions, diagnostics: EXPECTED.before.diagnostics, renames: EXPECTED.before.renames });
      // Session 40: the registry ALREADY holds the right identity; the
      // personal take's filename stacks a role, so the grammar reads a piece
      // that is not registered — and nothing strips it heuristically.
      expect(before.pieces.map((p: { key: string; sessions: number[] }) => [p.key, p.sessions])).toContainEqual(['چهارمضراب-چهارگاه-عبادی', [40]]);
      expect(parseAssetStem('تمرین-من-نت-چهارمضراب-چهارگاه-عبادی')).toEqual({ role: 'تمرین-من', piece: 'نت-چهارمضراب-چهارگاه-عبادی', part: null });
      expect(before.pieces.some((p: { key: string }) => p.key.startsWith('نت-'))).toBe(false);
      // Session 41: genuinely unregistered, so its demo is excluded, never guessed.
      expect(before.pieces.some((p: { key: string }) => p.key === 'پیش-درامد-ابوعطا-لطفی')).toBe(false);
      // Session 42: an EMPTY folder is no session at all.
      expect(before.sessions.map((s: { n: number }) => s.n)).toEqual([39, 40, 41]);
      // Personal takes are evidence, never material, anywhere in the graph.
      expect(before.sessions.flatMap((s: SourceIndex['sessions'][number]) => s.resources).some((r: { role: string }) => r.role === 'تمرین-من')).toBe(false);

      // --- FAILED OR PARTIAL INVENTORY publishes nothing --------------------
      expect(() => readStableSource(root, (b: string) => ({ ...readSource(b), inventory: [] }))).toThrow(/changed during the scan/);
      renameSync(join(root, 'PIECES.csv'), join(root, 'PIECES.moved'));
      expect(() => scanToIndex(root)).toThrow(/Could not read PIECES\.csv/);
      renameSync(join(root, 'PIECES.moved'), join(root, 'PIECES.csv'));

      // --- PUBLISH through a fake Git boundary, decode with the app's door --
      const git = fakeGit();
      const text1 = `${JSON.stringify(before, null, 2)}\n`;
      expect(await publishIndex({ transport: git.transport, indexText: text1 })).toMatchObject({ status: 'created' });
      expect(git.repo.refs.get('main')).toBe('c-main'); // practice data untouched
      expect(git.repo.commits.get('c-main')!.tree).toEqual({ 'state.json': 'practice data' });
      const read1 = await readIndexFile(git.published()!);
      if (!read1.ok) throw new Error(read1.error);
      expect(project(read1.value.index)).toEqual(project(before));

      // --- THE CORRECTION the owner confirmed --------------------------------
      appendFileSync(join(root, 'PIECES.csv'), `${SOURCE.correction.registryRow}\n`);
      const { from, to } = SOURCE.correction.rename;
      renameSync(join(root, from), join(root, to));
      appendFileSync(join(root, 'RENAME-LOG.csv'), `${from},${to},\n`);
      rmSync(join(root, SOURCE.correction.removed));
      const after = scanToIndex(root);
      expect(project(after)).toEqual({ sessions: EXPECTED.after.sessions, diagnostics: EXPECTED.after.diagnostics, renames: EXPECTED.after.renames });
      expect(after.pieces.map((p: { key: string }) => p.key).sort()).toEqual([...EXPECTED.after.pieces].sort());
      // The new identity carries exactly the confirmed facts — nothing read off a filename.
      expect(after.pieces.find((p: { key: string }) => p.key === 'پیش-درامد-ابوعطا-لطفی')).toMatchObject({ form: '', piece: '', dastgah: '', composer: '', sessions: [41] });

      // --- UNCHANGED RERUN: same bytes, no commit ---------------------------
      expect(scanToIndex(root).contentHash).toBe(after.contentHash);
      const text2 = `${JSON.stringify(after, null, 2)}\n`;
      expect(await publishIndex({ transport: git.transport, indexText: text2 })).toMatchObject({ status: 'published' });
      const commits = git.repo.n;
      expect(await publishIndex({ transport: git.transport, indexText: `${JSON.stringify(scanToIndex(root), null, 2)}\n` })).toMatchObject({ status: 'unchanged' });
      expect(git.repo.n).toBe(commits);
      expect(git.repo.refs.get('main')).toBe('c-main');

      // --- A THIN CLEAN-STORE IMPORT reads it the way the app does ---------
      useStore.setState({ db: cleanDB(), active: null, activeRoutine: null, activePlan: null, sessionInstrumentId: SETAR });
      for (const published of [text1, git.published()!]) {
        const read = await readIndexFile(published);
        if (!read.ok) throw new Error(read.error);
        const result = await useStore.getState().commitArchiveImport({ index: read.value.index, instrumentId: SETAR, decidedFromRev: useStore.getState().rev, now: NOW });
        expect(result.ok, result.message).toBe(true);
      }
      const db = useStore.getState().db;
      const bound = db.lessons.filter((l) => l.source).map((l) => l.source!.sessionN).sort();
      expect(bound).toEqual(EXPECTED.store.sessions);
      expect(db.lessons.some((l) => l.number === EXPECTED.store.noSession || l.date === '2026-11-24')).toBe(false);
      expect(db.lessons.every((l) => l.origin === 'archive')).toBe(true);
      // No deadline from history: nothing upcoming, nothing prepared.
      expect(nextLessonFor(db.lessons, SETAR, NOW)).toBeUndefined();
      expect(defaultTargetLesson(db.lessons, SETAR, new Date('2026-09-01T00:00:00.000Z'))).toBeUndefined();
      expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, NOW).values()]).toEqual([]);
      // Session 40's demonstration reaches both pieces; 41's reaches its one piece; no personal take is material.
      const src = archiveFor(db, ARCHIVE)!;
      const of = (n: number) => src.sessions.find((s) => s.n === n)!;
      expect(of(40).resources.find((r) => r.path.endsWith('/نمونه.mp4'))!.pieces).toEqual(['پیش-درامد-چهارگاه-فروتن', 'چهارمضراب-چهارگاه-عبادی']);
      expect(of(41).resources.map((r) => r.path)).toEqual(EXPECTED.after.sessions[2]!.resources.map((r) => r.path));
      // Retained, flagged, never called deleted.
      expect(of(39).resources.filter((r) => r.unavailable).map((r) => r.path)).toEqual(EXPECTED.after.retainedNotDescribed);
      // Every new piece rests; no practice was invented.
      expect(db.items.every((i) => i.status === 'dormant' && i.timesPractised === 0 && !i.nextReviewDate)).toBe(true);
      expect(db.blocks).toEqual([]);
      // An exact rename CHAIN resolves a legacy reference, end to end.
      const renames = new Map(src.renames.map((r) => [r.from, r.to]));
      const known = new Set(src.sessions.flatMap((s) => s.resources.map((r) => r.path)));
      expect(repairReferencePath(EXPECTED.before.legacyChain.stored, renames, known)).toEqual({ status: 'repaired', path: EXPECTED.before.legacyChain.resolves });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// The reconciliation family: one real class, one record.
// ---------------------------------------------------------------------------

const C41 = EXPECTED.class41;
const TWIN = C41.boundId;
const twinOf = (s: string) => (s === 'TWIN' ? TWIN : s);

/** The real pair: an earlier Refresh created the archive twin; the owner's planned Class 41 sits beside it. */
function class41Pair(extended = false): PracticeDB {
  const base: PracticeDB = { ...cleanDB(), items: OWNER.items.map((i) => ({ ...i }) as PracticeItem) };
  const imported = applyArchiveImport(base, planArchiveImport({ db: base, index: corpusIndex(), instrumentId: SETAR, now: NOW }));
  const manual: Lesson = { ...(OWNER.manualLesson as Lesson) };
  let db: PracticeDB = { ...imported, lessons: [...imported.lessons, manual], lessonAgenda: OWNER.agenda.map((e) => ({ ...e }) as LessonAgendaEntry) };
  if (extended) {
    const x = OWNER.extended;
    db = {
      ...db,
      lessons: db.lessons.map((l) =>
        l.id === manual.id
          ? { ...l, notes: x.manualNotes, recordings: [x.manualRecording] as Lesson['recordings'] }
          : l.id === TWIN
            ? { ...l, notes: x.twinNotes, itemIds: x.twinItemIds, recordings: [x.twinRecording] as Lesson['recordings'] }
            : l,
      ),
      lessonAgenda: [
        ...db.lessonAgenda,
        ...x.twinAgenda.map((e) => {
          const { lessonId, detachedFromLessonId, ...rest } = e as LessonAgendaEntry & { lessonId?: string; detachedFromLessonId?: string };
          return { ...rest, ...(lessonId ? { lessonId: twinOf(lessonId) } : {}), ...(detachedFromLessonId ? { detachedFromLessonId: twinOf(detachedFromLessonId) } : {}) } as LessonAgendaEntry;
        }),
      ],
      attachments: x.attachments.map((a) => ({ id: a.id, ownerType: a.ownerType, ownerId: twinOf(a.ownerId), name: a.name, mime: a.mime, size: a.size, kind: a.kind, createdAt: a.createdAt }) as AttachmentMeta),
    };
  }
  return validateDB(db);
}

const merge = { kind: 'merge-lesson', sessionN: 41, lessonId: C41.manualId, boundId: TWIN } as const satisfies ReconcileDecision;
const separate = { kind: 'separate-lesson', sessionN: 41, lessonId: C41.manualId } as const satisfies ReconcileDecision;

describe('one class, one record', () => {
  it('setar lesson reconciliation preserves both owners through decisions failures retries and repeat refresh', async () => {
    const index = corpusIndex();
    const s = () => useStore.getState();
    const load = (db: PracticeDB) => {
      useStore.setState({ db, active: null, activeRoutine: null, activePlan: null, sessionInstrumentId: SETAR });
      useLiveQuestion.setState({ capture: null, note: null });
      local.clear();
      storage.deleted.length = 0;
    };
    const commit = (decisions: ReconcileDecision[], rev = s().rev) =>
      s().commitArchiveImport({ index, instrumentId: SETAR, decisions, decidedFromRev: rev, now: NOW });

    // --- THE REAL SHAPE: asked, never merged on its own ------------------
    const pair = class41Pair();
    expect(pair.lessons.find((l) => l.source?.sessionN === 41)!.id).toBe(TWIN);
    load(pair);
    const asked = s().previewArchiveImport({ index, instrumentId: SETAR, now: NOW }).plan;
    expect(asked.questions).toEqual([
      expect.objectContaining({ kind: 'duplicate', sessionN: 41, lessonId: C41.manualId, boundId: TWIN }),
    ]);
    expect(asked.merges).toEqual([]);
    expect(applyArchiveImport(pair, asked)).toBe(pair); // ambiguity changes nothing silently

    // --- COMBINE, through the supported repair -------------------------
    const suppressionsBefore = archiveFor(pair, ARCHIVE)!.suppressions;
    const combined = await commit([merge]);
    expect(combined).toMatchObject({ ok: true, status: 'applied' });
    const one = s().db.lessons.filter((l) => l.date === C41.date && l.number === C41.number);
    expect(one.map((l) => [l.id, l.source, l.origin])).toEqual([[C41.manualId, { archiveId: ARCHIVE, sessionN: 41 }, undefined]]);
    expect(one[0]!.itemIds).toEqual(C41.itemIds);
    const agendaFor = (db: PracticeDB, id: string) => db.lessonAgenda.filter((e) => e.lessonId === id).map((e) => e.id).sort();
    expect(agendaFor(s().db, C41.manualId)).toEqual([...C41.preparations, ...C41.questions].sort());
    expect(lessonFiles(s().db, C41.manualId).map((f) => f.path)).toContain(C41.classRecording);
    expect(archiveFor(s().db, ARCHIVE)!.suppressions).toEqual(suppressionsBefore); // no deletion, no suppression
    expect(JSON.parse(storage.get()!).state.db.lessons.some((l: Lesson) => l.id === TWIN)).toBe(false);
    // Repeat Refresh: nothing left, nothing written, no revision churn.
    const quiet = s().rev;
    expect(s().previewArchiveImport({ index, instrumentId: SETAR, now: NOW }).plan.summary.unchanged).toBe(true);
    expect(await commit([merge])).toMatchObject({ ok: true, status: 'unchanged' });
    expect(s().rev).toBe(quiet);

    // --- BOTH OWNERS' AUTHORED DATA, every kind ---------------------------
    const rich = class41Pair(true);
    load(rich);
    expect(await commit([merge])).toMatchObject({ ok: true, status: 'applied' });
    const survivor = s().db.lessons.find((l) => l.id === C41.manualId)!;
    const x = OWNER.extended;
    expect(survivor.notes).toBe(`${x.manualNotes}\n\n${x.twinNotes}`);
    expect(survivor.itemIds).toEqual(['it-abouata', 'it-chahargah', 'it-extra']);
    // A shared path with different authored metadata stays TWO rows, each as written.
    expect(survivor.recordings).toEqual([x.manualRecording, x.twinRecording]);
    expect(agendaFor(s().db, C41.manualId)).toEqual([...C41.preparations, ...C41.questions, 'q-41-asked'].sort());
    expect(s().db.lessonAgenda.find((e) => e.id === 'q-41-asked')).toMatchObject({ askedAt: '2026-10-27T18:30:00.000Z', answer: 'Not yet — slower.', text: 'Is the tremolo even?' });
    expect(s().db.lessonAgenda.find((e) => e.id === 'q-41-history')).toMatchObject({ detachedFromLessonId: C41.manualId });
    expect(s().db.lessonAgenda.find((e) => e.id === 'q-41-history')!.lessonId).toBeUndefined();
    expect(s().db.attachments.map((a) => [a.id, a.ownerType, a.ownerId, a.size])).toEqual([
      ['att-mine', 'lesson', C41.manualId, 9],
      ['att-twin', 'lesson', C41.manualId, 9],
    ]);
    expect(storage.deleted).toEqual([]); // no blob was touched: bytes stay keyed by attachment id
    expect(s().db.lessons.some((l) => l.id === TWIN)).toBe(false);
    expect(() => validateDB(s().db)).not.toThrow(); // every entry still reachable

    // --- WORDS IN PROGRESS: refused, kept ---------------------------------
    load(rich);
    expect(holdNoteDraft({ kind: 'lesson', id: TWIN }, 'still typing after class')).toBe(true);
    const held = await commit([merge]);
    expect(held).toMatchObject({ ok: false, status: 'held' });
    expect(s().db).toBe(rich);
    expect(heldNoteDraft({ kind: 'lesson', id: TWIN })?.text).toBe('still typing after class');
    dropNoteDraft({ kind: 'lesson', id: TWIN });
    useLiveQuestion.setState({ capture: { owner: { instrumentId: SETAR, lessonId: TWIN }, session: 'x', text: 'a live question', focused: true }, note: null });
    expect(await commit([merge])).toMatchObject({ ok: false, status: 'held' });
    expect(useLiveQuestion.getState().capture?.text).toBe('a live question');
    useLiveQuestion.setState({ capture: null, note: null });
    // A draft on the SURVIVOR is not in the way: its record stays, and its words stay held.
    holdNoteDraft({ kind: 'lesson', id: C41.manualId }, 'my own draft');
    expect(await commit([merge])).toMatchObject({ ok: true, status: 'applied' });
    expect(heldNoteDraft({ kind: 'lesson', id: C41.manualId })?.text).toBe('my own draft');

    // --- A FAILED ACKNOWLEDGEMENT, then the retry that really writes ------
    load(rich);
    storage.set(null);
    storage.failNext();
    expect(await commit([merge])).toMatchObject({ ok: false, status: 'unsaved' });
    expect(storage.get()).toBeNull();
    expect(await commit([merge])).toMatchObject({ ok: true, status: 'applied' });
    expect(JSON.parse(storage.get()!).state.db.lessons.filter((l: Lesson) => l.source?.sessionN === 41).map((l: Lesson) => l.id)).toEqual([C41.manualId]);

    // --- STALE: the premise moved between preview and Apply ---------------
    load(pair);
    const seen = s().rev;
    s().updateLesson(C41.manualId, { date: '2026-10-28' });
    const stale = await commit([merge], seen);
    expect(stale).toMatchObject({ ok: false, status: 'stale', staleDecisions: [merge] });
    expect(s().db.lessons.filter((l) => l.number === 41)).toHaveLength(2);
    load(pair);
    const otherTwin = { ...merge, boundId: 'not-the-bound-row' };
    expect(await commit([otherTwin])).toMatchObject({ ok: false, status: 'stale', staleDecisions: [otherTwin] });

    // --- KEEP SEPARATE is durable, scoped, and hides nothing --------------
    load(pair);
    expect(await commit([separate])).toMatchObject({ ok: true, status: 'applied' });
    const kept = archiveFor(s().db, ARCHIVE)!.suppressions.filter((x) => x.kind === 'session');
    expect(kept.map((x) => [x.ref, x.itemId])).toEqual([['41', C41.manualId]]);
    expect(s().db.lessons.filter((l) => l.number === 41).map((l) => l.id).sort()).toEqual([C41.manualId, TWIN].sort());
    const again = s().previewArchiveImport({ index, instrumentId: SETAR, now: NOW }).plan;
    expect([again.questions, again.summary.unchanged]).toEqual([[], true]);
    expect(lessonFiles(s().db, TWIN).map((f) => f.path)).toContain(C41.classRecording); // the session is NOT hidden
    // Restore lifts exactly that decision, and the question comes back.
    expect(s().restoreArchiveSuppression(ARCHIVE, { kind: 'session', ref: '41', itemId: C41.manualId })).toBeNull();
    expect(s().previewArchiveImport({ index, instrumentId: SETAR, now: NOW }).plan.questions.map((q) => q.kind)).toEqual(['duplicate']);

    // --- TWO TWINS: one fold per commit, the other asked about the survivor
    const second: Lesson = { ...(OWNER.manualLesson as Lesson), id: 'L41-also', itemIds: [] };
    load(validateDB({ ...pair, lessons: [...pair.lessons, second] }));
    const both = s().previewArchiveImport({ index, instrumentId: SETAR, now: NOW }).plan;
    expect(both.questions.map((q) => q.lessonId).sort()).toEqual(['L41-also', C41.manualId].sort());
    expect(both.merges).toEqual([]);
    // Combining BOTH into the one archive row contradicts itself: the second is
    // refused as stale (never silently folded), the first stands.
    const secondMerge = { ...merge, lessonId: 'L41-also' };
    expect(await commit([merge, secondMerge])).toMatchObject({ ok: false, status: 'stale', staleDecisions: [secondMerge] });
    expect(s().db.lessons.filter((l) => l.number === 41)).toHaveLength(3);
    expect(await commit([merge])).toMatchObject({ ok: true, status: 'applied' });
    const next = s().previewArchiveImport({ index, instrumentId: SETAR, now: NOW }).plan;
    expect(next.questions.map((q) => [q.kind, q.lessonId, q.boundId])).toEqual([['duplicate', 'L41-also', C41.manualId]]);

    // --- FIRST TIME: the planned class, no path, session not yet imported -
    // (pure plans below: the store's commit path is already proved above)
    const fresh = (lessons: Lesson[]): PracticeDB => validateDB({ ...cleanDB(), items: OWNER.items.map((i) => ({ ...i }) as PracticeItem), lessons, lessonAgenda: lessons.some((l) => l.id === C41.manualId) ? OWNER.agenda.map((e) => ({ ...e }) as LessonAgendaEntry) : [] });
    const planned = fresh([{ ...(OWNER.manualLesson as Lesson) }]);
    const first = planArchiveImport({ db: planned, index, instrumentId: SETAR, now: NOW });
    expect(first.questions.filter((q) => q.sessionN === 41).map((q) => [q.kind, q.candidates.map((c) => c.id)])).toEqual([['lesson', [C41.manualId]]]);
    expect(first.newLessons.some((l) => l.source?.sessionN === 41)).toBe(false);
    const link = { kind: 'link-lesson', sessionN: 41, lessonId: C41.manualId } as const;
    const linked = applyArchiveImport(planned, planArchiveImport({ db: planned, index, instrumentId: SETAR, decisions: [link], now: NOW }), [link]);
    expect(linked.lessons.filter((l) => l.source?.sessionN === 41).map((l) => [l.id, l.origin])).toEqual([[C41.manualId, undefined]]);
    expect(linked.lessonAgenda).toEqual(planned.lessonAgenda);
    // Create separately says so durably: no twin question afterwards.
    const create = { kind: 'create-lesson', sessionN: 41 } as const;
    const apart = applyArchiveImport(planned, planArchiveImport({ db: planned, index, instrumentId: SETAR, decisions: [create], now: NOW }), [create]);
    expect(planArchiveImport({ db: apart, index, instrumentId: SETAR, now: NOW }).questions.filter((q) => q.sessionN === 41)).toEqual([]);
    // Skip says so durably too: an unscoped suppression, never asked again, the planned class untouched.
    const skip = { kind: 'skip-lesson', sessionN: 41 } as const;
    const skipped = applyArchiveImport(planned, planArchiveImport({ db: planned, index, instrumentId: SETAR, decisions: [skip], now: NOW }), [skip]);
    expect(archiveFor(skipped, ARCHIVE)!.suppressions.filter((x) => x.kind === 'session').map((x) => [x.ref, x.itemId])).toEqual([['41', undefined]]);
    expect(planArchiveImport({ db: skipped, index, instrumentId: SETAR, now: NOW }).questions.filter((q) => q.sessionN === 41)).toEqual([]);
    expect(skipped.lessons.find((l) => l.id === C41.manualId)).toEqual(planned.lessons.find((l) => l.id === C41.manualId));
    expect(skipped.lessons.some((l) => l.source?.sessionN === 41)).toBe(false);
    // A unique exact path still adopts on its own.
    const withPath = fresh([{ ...(OWNER.manualLesson as Lesson), recordings: [OWNER.extended.manualRecording as NonNullable<Lesson['recordings']>[number]] }]);
    const auto = planArchiveImport({ db: withPath, index, instrumentId: SETAR, now: NOW });
    expect([auto.questions.filter((q) => q.sessionN === 41), auto.adoptedLessons.map((l) => [l.id, l.origin])]).toEqual([[], [[C41.manualId, undefined]]]);
    // Several candidates: asked, never picked.
    const many = planArchiveImport({ db: fresh([{ ...(OWNER.manualLesson as Lesson) }, { ...(OWNER.manualLesson as Lesson), id: 'L41-also' }]), index, instrumentId: SETAR, now: NOW });
    expect([many.questions.find((q) => q.sessionN === 41)!.candidates.length, many.adoptedLessons]).toEqual([2, []]);
    // Another instrument, another date, another number: not the same class.
    const tar = { id: 'inst-tar', name: 'Tar', family: 'Persian', active: true, createdAt: OWNER.instrument.createdAt, updatedAt: OWNER.instrument.updatedAt };
    for (const other of [
      { ...(OWNER.manualLesson as Lesson), instrumentId: 'inst-tar', itemIds: [] },
      { ...(OWNER.manualLesson as Lesson), date: '2026-10-28' },
      { ...(OWNER.manualLesson as Lesson), number: 40 },
    ]) {
      const db = validateDB({ ...fresh([]), instruments: [OWNER.instrument, tar], lessons: [other], lessonAgenda: [] });
      const p = planArchiveImport({ db, index, instrumentId: SETAR, now: NOW });
      expect(p.questions.filter((q) => q.sessionN === 41)).toEqual([]);
      expect(p.newLessons.filter((l) => l.source?.sessionN === 41)).toHaveLength(1);
    }
    // The real Class 38: same number, a different date — never the same class.
    const index38 = corpusIndex({ 'session-38-04-08-2026/ضبط-کلاس.mp4': 10 });
    const planned38: Lesson = { ...(OWNER.manualLesson as Lesson), id: 'L38-planned', date: '2026-09-27', number: 38, itemIds: [] };
    const db38 = fresh([planned38]);
    const p38 = planArchiveImport({ db: db38, index: index38, instrumentId: SETAR, now: NOW });
    expect(p38.questions.filter((q) => q.sessionN === 38)).toEqual([]);
    const after38 = applyArchiveImport(db38, p38);
    expect(after38.lessons.filter((l) => l.number === 38).map((l) => [l.date, l.origin]).sort()).toEqual([['2026-08-04', 'archive'], ['2026-09-27', undefined]]);
    expect(nextLessonFor(after38.lessons, SETAR, new Date('2026-09-20T00:00:00.000Z'))!.id).toBe('L38-planned');
  });
});
