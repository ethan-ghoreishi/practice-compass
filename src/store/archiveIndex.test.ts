import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error — no types for the .mjs operator tool; the decision is pure.
import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../../scripts/publish-setar-index.mjs';
import { fetchPublishedIndex, readIndexFile } from './archiveIndex';
import indexFixture from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
import V13_SETAR_TEXT from '../../tests/fixtures/setar-legacy-v13.json?raw';
import { decodeSourceIndex } from '../domain/sourceArchive';
import { validateDB } from '../domain/io';
import type { PracticeDB } from '../domain/types';

// ---------------------------------------------------------------------------
// The persist storage, CONTROLLABLE per assertion — the same stub io.test.ts
// uses, plus a settle promise this test can reject on demand. A failed
// IndexedDB write is the one thing `commitArchiveImport` must never mistake
// for a success, and it cannot be provoked in a real browser on purpose.
// ---------------------------------------------------------------------------
const fakeStorage = vi.hoisted(() => {
  let value: string | null = null;
  let failNextWrite = false;
  return {
    get: () => value,
    set: (v: string | null) => {
      value = v;
    },
    failNext: () => {
      failNextWrite = true;
    },
    takeFailure: () => {
      const f = failNextWrite;
      failNextWrite = false;
      return f;
    },
  };
});
vi.mock('./idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./idb')>();
  let settle: Promise<void> = Promise.resolve();
  return {
    ...actual,
    // Dexie itself has no IndexedDB to talk to in this environment, and
    // `clearAll` reaches for the blob store. Stubbed so a deliberate erasure
    // does not raise an unhandled rejection that would mask a real one.
    clearBlobs: async () => undefined,
    deleteBlob: async () => undefined,
    allBlobs: async () => [],
    heldBlobIds: async () => new Set<string>(),
    storageSettled: () => settle,
    idbStorage: {
      getItem: async () => fakeStorage.get(),
      setItem: async (_name: string, value: string) => {
        if (fakeStorage.takeFailure()) {
          settle = Promise.reject(new Error('the device refused the write'));
          // Mark it handled here so the rejection reaches only the one caller
          // that is waiting on it, exactly as the real adapter does.
          void settle.catch(() => undefined);
          return;
        }
        fakeStorage.set(value);
        settle = Promise.resolve();
      },
      removeItem: async () => fakeStorage.set(null),
    },
  };
});
// Imported AFTER the mock declaration on purpose: the store's persist
// middleware binds its storage at module load.
const { useStore } = await import('./useStore');

// ---------------------------------------------------------------------------
// A fake git repository, small enough to assert against exactly. It records
// EVERY write, so "this publisher cannot touch practice data" is a checked
// property of the calls made, not a claim about intent.
// ---------------------------------------------------------------------------

interface FakeRepo {
  refs: Map<string, string>;
  commits: Map<string, { treeSha: string; parents: string[] }>;
  trees: Map<string, Record<string, string>>;
  blobs: Map<string, string>;
  writes: { kind: string; target: string }[];
  n: number;
}

function newRepo(): FakeRepo {
  const repo: FakeRepo = {
    refs: new Map(),
    commits: new Map(),
    trees: new Map(),
    blobs: new Map(),
    writes: [],
    n: 0,
  };
  // The app's own data branch, exactly as the sync engine leaves it. Nothing in
  // this test may change any of these three.
  const tree = { 'state.json': 'blob-state', 'manifest.json': 'blob-manifest', 'files/a.pdf': 'blob-file' };
  repo.trees.set('tree-main', tree);
  repo.commits.set('commit-main', { treeSha: 'tree-main', parents: [] });
  repo.refs.set('main', 'commit-main');
  repo.refs.set('archive/2026-09-01', 'commit-main');
  return repo;
}

function transportFor(repo: FakeRepo, opts: { failAfterCommit?: boolean; raceOnce?: () => void } = {}) {
  const id = (p: string) => `${p}-${(repo.n += 1)}`;
  return {
    async getRef(branch: string) {
      const sha = repo.refs.get(branch);
      return sha ? { sha } : null;
    },
    async getCommit(sha: string) {
      return { treeSha: repo.commits.get(sha)!.treeSha };
    },
    async getFile(sha: string, path: string) {
      const tree = repo.trees.get(repo.commits.get(sha)!.treeSha)!;
      const blob = tree[path];
      return blob ? { text: repo.blobs.get(blob)! } : null;
    },
    async createBlob(text: string) {
      const sha = id('blob');
      repo.blobs.set(sha, text);
      repo.writes.push({ kind: 'blob', target: sha });
      return sha;
    },
    async createTree({ baseTreeSha, path, blobSha }: { baseTreeSha: string | null; path: string; blobSha: string }) {
      const sha = id('tree');
      repo.trees.set(sha, { ...(baseTreeSha ? repo.trees.get(baseTreeSha) : {}), [path]: blobSha });
      repo.writes.push({ kind: 'tree', target: path });
      return sha;
    },
    async createCommit({ treeSha, parents }: { treeSha: string; parents: string[] }) {
      const sha = id('commit');
      repo.commits.set(sha, { treeSha, parents });
      repo.writes.push({ kind: 'commit', target: treeSha });
      return sha;
    },
    async updateRef(branch: string, sha: string, expectedSha: string) {
      opts.raceOnce?.();
      if (opts.failAfterCommit) throw new Error('network dropped');
      // NON-FORCE: the ref only advances from the commit that was read.
      if (repo.refs.get(branch) !== expectedSha) return 'HTTP 422';
      repo.refs.set(branch, sha);
      repo.writes.push({ kind: 'ref', target: branch });
      return 'ok';
    },
    async createRef(branch: string, sha: string) {
      if (opts.failAfterCommit) throw new Error('network dropped');
      if (repo.refs.has(branch)) return 'HTTP 422';
      repo.refs.set(branch, sha);
      repo.writes.push({ kind: 'ref', target: branch });
      return 'ok';
    },
  };
}

const publishedText = (repo: FakeRepo) => {
  const sha = repo.refs.get(SOURCE_INDEX_BRANCH);
  if (!sha) return null;
  const tree = repo.trees.get(repo.commits.get(sha)!.treeSha)!;
  return repo.blobs.get(tree[INDEX_PATH]) ?? null;
};

// A credential-shaped placeholder — never a real token, and never a
// contiguous 16+ char [A-Za-z0-9_-] run (the space keeps it that way) — used
// only to prove no credential text reaches anything the publisher's output
// touches.
const NEVER_LEAKED_CREDENTIAL = 'publisher credential placeholder';
const ROOT = '/volume1/media/setar-classes';

describe('publishing and reading the source index', () => {
  it('source index publication cannot replace practice data or lose a concurrent update', async () => {
    const repo = newRepo();
    const first = `${JSON.stringify(indexFixture, null, 1)}\n`;

    // --- first publish: creates the branch, main untouched -----------------
    const created = await publishIndex({ transport: transportFor(repo), indexText: first });
    expect(created.status).toBe('created');
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(created.commit);
    expect(publishedText(repo)).toBe(first);
    expect(repo.refs.get('main')).toBe('commit-main');
    expect(repo.refs.get('archive/2026-09-01')).toBe('commit-main');
    expect(repo.trees.get('tree-main')).toEqual({
      'state.json': 'blob-state',
      'manifest.json': 'blob-manifest',
      'files/a.pdf': 'blob-file',
    });
    // Every ref this publisher advanced, and every path it wrote.
    expect(repo.writes.filter((w) => w.kind === 'ref').map((w) => w.target)).toEqual([SOURCE_INDEX_BRANCH]);
    expect(repo.writes.filter((w) => w.kind === 'tree').map((w) => w.target)).toEqual([INDEX_PATH]);
    expect(repo.writes.some((w) => /state\.json|manifest\.json|^files\//.test(w.target))).toBe(false);

    // --- an identical scan makes NO commit ---------------------------------
    const before = repo.refs.get(SOURCE_INDEX_BRANCH);
    const writesBefore = repo.writes.length;
    const again = await publishIndex({ transport: transportFor(repo), indexText: first });
    expect(again.status).toBe('unchanged');
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(before);
    expect(repo.writes).toHaveLength(writesBefore);

    // --- a changed scan advances the branch, and only it --------------------
    const changed = `${JSON.stringify({ ...indexFixture, diagnostics: [{ path: 'x', reason: 'y' }] }, null, 1)}\n`;
    const second = await publishIndex({ transport: transportFor(repo), indexText: changed });
    expect(second.status).toBe('published');
    expect(publishedText(repo)).toBe(changed);
    expect(repo.commits.get(second.commit)!.parents).toEqual([before]);
    expect(repo.refs.get('main')).toBe('commit-main');

    // --- interrupted BEFORE the ref advances: the old index still stands ----
    const head = repo.refs.get(SOURCE_INDEX_BRANCH);
    const interrupted = `${JSON.stringify({ ...indexFixture, archiveId: 'half-written' }, null, 1)}\n`;
    await expect(
      publishIndex({ transport: transportFor(repo, { failAfterCommit: true }), indexText: interrupted }),
    ).rejects.toThrow(/network dropped/);
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(head);
    expect(publishedText(repo)).toBe(changed);

    // --- racing a second publisher: nothing is overwritten ------------------
    // The other publisher lands its own commit between this one's read and its
    // update. Non-force, so this update is refused; the retry re-reads and,
    // because the other publisher wrote exactly what this one has, it settles
    // on "unchanged" rather than clobbering.
    const rival = `${JSON.stringify({ ...indexFixture, archiveId: 'setar-classes' }, null, 1)}\n`;
    let raced = false;
    const race = () => {
      if (raced) return;
      raced = true;
      const blob = 'blob-rival';
      repo.blobs.set(blob, rival);
      repo.trees.set('tree-rival', { [INDEX_PATH]: blob });
      repo.commits.set('commit-rival', { treeSha: 'tree-rival', parents: [repo.refs.get(SOURCE_INDEX_BRANCH)!] });
      repo.refs.set(SOURCE_INDEX_BRANCH, 'commit-rival');
    };
    const afterRace = await publishIndex({ transport: transportFor(repo, { raceOnce: race }), indexText: rival });
    expect(afterRace.status).toBe('unchanged');
    expect(publishedText(repo)).toBe(rival);
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe('commit-rival');
    // A racing publisher with DIFFERENT content gives up rather than force it.
    let always = true;
    const alwaysRace = () => {
      if (!always) return;
      repo.commits.set(`commit-rival-${(repo.n += 1)}`, { treeSha: 'tree-rival', parents: [] });
      repo.refs.set(SOURCE_INDEX_BRANCH, `commit-rival-${repo.n}`);
    };
    await expect(
      publishIndex({ transport: transportFor(repo, { raceOnce: alwaysRace }), indexText: changed }),
    ).rejects.toThrow(/nothing was overwritten/);
    always = false;

    // --- the target is fixed in CODE, not by trusting the caller ------------
    for (const branch of ['main', 'master', 'archive/2026-09-01', 'source-index-2']) {
      await expect(publishIndex({ transport: transportFor(repo), indexText: first, branch })).rejects.toThrow(
        /only writes/,
      );
    }
    for (const path of ['state.json', 'manifest.json', 'files/a.pdf', 'setar/other.json']) {
      await expect(publishIndex({ transport: transportFor(repo), indexText: first, path })).rejects.toThrow(
        /only writes "setar\/index\.json"/,
      );
    }

    // --- the READER pins the file to the branch's own commit ----------------
    const requests: string[] = [];
    const publishedCommit = repo.refs.get(SOURCE_INDEX_BRANCH)!;
    const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      requests.push(href);
      // The reader must never send anything but a GET.
      expect(init?.method ?? 'GET').toBe('GET');
      if (href.includes('/git/ref/heads/')) {
        return new Response(JSON.stringify({ object: { sha: publishedCommit } }), { status: 200 });
      }
      const m = /contents\/(.+)\?ref=(.+)$/.exec(href)!;
      const tree = repo.trees.get(repo.commits.get(m[2])!.treeSha)!;
      const text = repo.blobs.get(tree[decodeURIComponent(m[1])])!;
      return new Response(
        JSON.stringify({ content: Buffer.from(text, 'utf8').toString('base64'), encoding: 'base64', size: text.length }),
        { status: 200 },
      );
    };
    const got = await fetchPublishedIndex({ repo: 'owner/data', token: 'device-token', fetchImpl: fakeFetch as typeof fetch });
    expect(got.ok).toBe(true);
    if (!got.ok) throw new Error(got.error);
    expect(got.value.commitSha).toBe(publishedCommit);
    expect(got.value.index.archiveId).toBe('setar-classes');
    // The content request names the COMMIT, not the branch: a publish landing
    // between the two calls cannot hand back half of one index and half of
    // another.
    expect(requests[1]).toContain(`?ref=${publishedCommit}`);
    expect(requests[1]).not.toContain(SOURCE_INDEX_BRANCH);
    expect(requests.every((r) => r.startsWith('https://api.github.com/'))).toBe(true);

    // --- authentication and network failures change nothing -----------------
    const refuse = async () => new Response('no', { status: 401 });
    const denied = await fetchPublishedIndex({ repo: 'owner/data', token: 'bad', fetchImpl: refuse as typeof fetch });
    expect(denied.ok).toBe(false);
    if (denied.ok) throw new Error('expected refusal');
    expect(denied.error).toMatch(/refused/i);
    const offline = async () => {
      throw new Error('offline');
    };
    const down = await fetchPublishedIndex({ repo: 'owner/data', token: 't', fetchImpl: offline as typeof fetch });
    expect(down.ok).toBe(false);
    if (down.ok) throw new Error('expected refusal');
    expect(down.error).toMatch(/already imported is unaffected/);
    // The published index and the app's data branch are exactly as they were.
    expect(publishedText(repo)).toBe(rival);
    expect(repo.refs.get('main')).toBe('commit-main');

    // --- no credential and no archive root in anything that travels ---------
    const everything = JSON.stringify([
      [...repo.blobs.values()],
      [...repo.trees.values()],
      [...repo.commits.keys()],
      requests,
      denied.error,
      down.error,
    ]);
    expect(everything).not.toContain(NEVER_LEAKED_CREDENTIAL);
    expect(everything).not.toContain(ROOT);
    expect(everything).not.toContain('/Volumes/');

    // The file-import fallback goes through the SAME decoder.
    expect(readIndexFile(rival).ok).toBe(true);
    const badFile = readIndexFile('{"format":"setar-archive-index","version":99}');
    expect(badFile.ok).toBe(false);
    if (badFile.ok) throw new Error('expected refusal');
    expect(badFile.error).toMatch(/newer scanner/);
  });
});

// ---------------------------------------------------------------------------
// ac-11 — the commit boundary, against the REAL store.
// ---------------------------------------------------------------------------

const INDEX = decodeSourceIndex(indexFixture);
const SETAR = 'inst-setar';
const NOW = new Date('2026-09-17T09:00:00.000Z');

function loadOwnerData(): PracticeDB {
  const db = validateDB(JSON.parse(V13_SETAR_TEXT));
  useStore.setState({ db, active: null, activeRoutine: null, activePlan: null, sessionInstrumentId: SETAR });
  return db;
}

const commit = (decidedFromRev: number) =>
  useStore.getState().commitArchiveImport({ index: INDEX, instrumentId: SETAR, decidedFromRev, now: NOW });

describe('committing an archive import', () => {
  it('archive commits survive interruption and never apply a stale preview', async () => {
    loadOwnerData();

    // --- ONE mutation, validated first, acknowledged by storage -------------
    const { plan, rev } = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(plan.newItems).toHaveLength(94);
    const applied = await commit(rev);
    expect(applied).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);
    // The storage adapter holds the WHOLE new state, not a partial one.
    const persisted = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    expect(persisted.state.db.items.filter((i) => i.source)).toHaveLength(94);
    expect(persisted.state.db.archiveSources).toHaveLength(1);

    // --- an unchanged refresh writes NOTHING, and churns no revision --------
    const quietRev = useStore.getState().rev;
    const again = await commit(quietRev);
    expect(again).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().rev).toBe(quietRev);

    // --- a REVISION CHANGE during the fetch rebases without losing edits ----
    loadOwnerData();
    const stale = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    // The owner edits a notebook while the index is being read.
    useStore.getState().updateItem('own-dashti', { notes: 'edited while the index was being read' });
    expect(useStore.getState().rev).not.toBe(stale.rev);
    const rebased = await commit(stale.rev);
    expect(rebased).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'edited while the index was being read',
    );
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);

    // --- a rebase that raises a NEW question refuses, and changes nothing ---
    loadOwnerData();
    const before = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(before.plan.questions).toEqual([]);
    // An item appears with a canonical title while the index is being read —
    // now there IS something to decide, and it is not this code's decision.
    useStore.getState().addItem({ instrumentId: SETAR, title: 'عراق' });
    const itemsBefore = useStore.getState().db.items.length;
    const refused = await commit(before.rev);
    expect(refused).toMatchObject({ ok: false, status: 'stale' });
    expect(useStore.getState().db.items).toHaveLength(itemsBefore);
    expect(useStore.getState().db.archiveSources).toEqual([]);
    // Answering it explicitly lets the same index through.
    const answered = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'عراق' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(answered).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(0);

    // --- A RUNNING SESSION IS UNTOUCHED, and one that FINISHES is kept ------
    loadOwnerData();
    useStore.getState().startItemSession('own-dashti');
    const activeBefore = useStore.getState().active;
    expect(activeBefore).not.toBeNull();
    const duringPractice = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const withClock = await commit(duringPractice.rev);
    expect(withClock).toMatchObject({ ok: true, status: 'applied' });
    // Not replaced, not nulled, not restarted: the same object, still running.
    expect(useStore.getState().active).toBe(activeBefore);
    expect(useStore.getState().activeRoutine).toBeNull();
    expect(useStore.getState().activePlan).toBeNull();
    expect(useStore.getState().sessionInstrumentId).toBe(SETAR);

    loadOwnerData();
    const beforeBlock = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    useStore.getState().startItemSession('own-dashti');
    useStore.getState().closeSession({ durationMinutes: 12, result: 'same', answer: 'unanswered', now: NOW });
    const blocksAfterClose = useStore.getState().db.blocks.length;
    expect(blocksAfterClose).toBe(2);
    const afterBlock = await commit(beforeBlock.rev);
    expect(afterBlock).toMatchObject({ ok: true, status: 'applied' });
    // The minute played while the index was being read is still there.
    expect(useStore.getState().db.blocks).toHaveLength(2);

    // --- A FAILED WRITE IS REPORTED, and the retry really writes -----------
    loadOwnerData();
    const toFail = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const persistedBefore = fakeStorage.get();
    fakeStorage.failNext();
    const unsaved = await commit(toFail.rev);
    expect(unsaved).toMatchObject({ ok: false, status: 'unsaved' });
    expect(unsaved.message).toMatch(/could not save/i);
    // The store holds the graph; the DISK does not. A reload before the
    // acknowledgement therefore yields the PREVIOUS complete state.
    expect(useStore.getState().db.archiveSources).toHaveLength(1);
    expect(fakeStorage.get()).toBe(persistedBefore);

    // THE RETRY IS THE POINT: the in-memory index hash already matches, so a
    // "nothing changed" shortcut would answer "Already current" over data that
    // was never saved.
    const retry = await commit(useStore.getState().rev);
    expect(retry).toMatchObject({ ok: true, status: 'applied' });
    const afterRetry = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    // A COMPLETE state, not a delta: the graph, the owner's items, the blocks.
    expect(afterRetry.state.db.archiveSources).toHaveLength(1);
    expect(afterRetry.state.db.items.filter((i) => i.source)).toHaveLength(94);
    expect(afterRetry.state.db.blocks).toHaveLength(1);
    expect(afterRetry.state.db.lessonAgenda).toHaveLength(1);

    // --- reload AFTER the acknowledgement yields the NEW complete state -----
    // The bytes on disk at the moment of the acknowledgement, replayed through
    // the app's own hydration. (Every `setState` re-persists, so the captured
    // text is put back first — otherwise this would only prove that the store
    // can read what it has just written.)
    const onDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(onDisk);
    await useStore.persist.rehydrate();
    expect(useStore.getState().db.archiveSources).toHaveLength(1);
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);
    expect(useStore.getState().db.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'Teacher: keep the mezrab light on the return.',
    );

    // --- a graph this device would REFUSE to import is never written -------
    loadOwnerData();
    const broken = { ...INDEX, sessions: INDEX.sessions.map((s) => ({ ...s, n: 1 })) };
    const refusedGraph = await useStore.getState().commitArchiveImport({
      index: broken,
      instrumentId: SETAR,
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(refusedGraph.ok).toBe(false);
    expect(refusedGraph.status).toBe('refused');
    expect(useStore.getState().db.archiveSources).toEqual([]);

    // --- refresh NEVER runs a whole-database import or reset ---------------
    // `importDB`, `resetDemo` and `clearAll` each null the active session and
    // reset `notNow`/`sessionInstrumentId`; every assertion above shows those
    // intact across a commit. The source, too, says so:
    const storeSource = await (await import('node:fs/promises')).readFile('src/store/useStore.ts', 'utf8');
    const from = storeSource.indexOf('commitArchiveImport: async');
    expect(from).toBeGreaterThan(0);
    const body = storeSource.slice(from, storeSource.indexOf('hideArchiveResource: (', from));
    expect(body.length).toBeGreaterThan(200);
    // Comments stripped first — this action's own docstring NAMES the things
    // it must not call, and a scan that matched prose would be checking the
    // comment rather than the code.
    const code = body.replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/importDB|installDatabase|resetDemo|clearAll|replaceAllBlobs|addAttachment/);
    // ONE db mutation in the whole action.
    expect(code.match(/\bset\(/g) ?? []).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ac-9 — an import may establish membership and provenance. Never practice.
// ---------------------------------------------------------------------------

describe('what an archive import may and may not establish', () => {
  it('archive import cannot fabricate practice or next-class urgency', async () => {
    loadOwnerData();
    useStore.getState().startItemSession('own-dashti');
    useStore.getState().notNowReview('rev-1');
    const beforeState = useStore.getState();
    const before = JSON.parse(JSON.stringify(beforeState.db)) as PracticeDB;
    const activeBefore = beforeState.active;
    const notNowBefore = JSON.parse(JSON.stringify(beforeState.notNow)) as unknown;

    const applied = await commit(useStore.getState().rev);
    expect(applied).toMatchObject({ ok: true, status: 'applied' });
    const after = useStore.getState();

    // --- EVERY existing record, byte for byte ------------------------------
    expect(after.db.blocks).toEqual(before.blocks);
    expect(after.db.reviews).toEqual(before.reviews);
    expect(after.db.lessonAgenda).toEqual(before.lessonAgenda);
    expect(after.db.materials).toEqual(before.materials);
    expect(after.db.pathways).toEqual(before.pathways);
    expect(after.db.pathwayStages).toEqual(before.pathwayStages);
    expect(after.db.pathwayRoutines).toEqual(before.pathwayRoutines);
    expect(after.db.attachments).toEqual(before.attachments);
    for (const original of before.items) {
      const now = after.db.items.find((i) => i.id === original.id)!;
      expect(now).toEqual(original);
    }
    // ...and the ephemeral session state the owner is standing in.
    expect(after.active).toBe(activeBefore);
    expect(after.activeRoutine).toBeNull();
    expect(after.activePlan).toBeNull();
    expect(after.notNow).toEqual(notNowBefore);
    expect(after.sessionInstrumentId).toBe(SETAR);

    // --- NEW items carry no practice at all ---------------------------------
    const fresh = after.db.items.filter((i) => i.source);
    expect(fresh).toHaveLength(94);
    for (const item of fresh) {
      expect(item.timesPractised).toBe(0);
      expect(item.totalMinutes).toBe(0);
      expect(item.lastPractisedAt).toBeUndefined();
      expect(item.lastResult).toBeUndefined();
      expect(item.nextReviewDate).toBeUndefined();
      expect(item.nextReviewSource).toBeUndefined();
      expect(item.srReps).toBeUndefined();
      expect(item.srEase).toBeUndefined();
      expect(item.srIntervalDays).toBeUndefined();
      expect(item.srLastProgressDay).toBeUndefined();
      // RESTING by explicit import policy: 94 pieces must not flood Today.
      expect(item.status).toBe('dormant');
      // No pathway placement, no catalogue identity, no material invented.
      expect(item.stageId).toBeUndefined();
      expect(item.catalogKey).toBeUndefined();
      expect(item.materialId).toBeUndefined();
    }
    // No review row and no agenda entry was created for any of them.
    expect(after.db.reviews.filter((r) => fresh.some((i) => i.id === r.practiceItemId))).toEqual([]);
    expect(after.db.lessonAgenda).toHaveLength(1);
    expect(after.db.blocks.filter((b) => fresh.some((i) => i.id === b.practiceItemId))).toEqual([]);

    // A resting item is still DIRECTLY startable — resting is administrative,
    // not a lock.
    const araq = after.db.items.find((i) => i.source?.pieceKey === 'عراق')!;
    useStore.getState().cancelSession();
    useStore.getState().startItemSession(araq.id);
    expect(useStore.getState().active?.itemId).toBe(araq.id);
    useStore.getState().cancelSession();

    // --- THE OWNER'S OWN RECORDINGS ARE EVIDENCE, NOT MATERIAL -------------
    const source = useStore.getState().db.archiveSources[0]!;
    // 125 personal files in the real corpus, and not one of them is a resource.
    expect(source.sessions.every((s) => s.resources.every((r) => r.role !== 'تمرین-من'))).toBe(true);
    // Their membership and role survive — that is the whole of what they leave.
    const chainPiece = 'پیش-درامد-سه-گاه-فروتن';
    const { repeatChains } = await import('../domain/sourceArchive');
    // The longest repeat chain in the real archive. It is read from the
    // PERSONAL role — a piece is a repeat because the student was asked to play
    // it again, not because an unnamed demonstration gave it membership of a
    // session (which would report a repeat nobody was asked for).
    expect(repeatChains(source, chainPiece)).toEqual([[22, 23, 24, 25, 26, 27]]);
    // The real counterexample: پیش-درامد-ماهور-هرمزی is a MEMBER of sessions
    // 16, 17 and 18, but the student only recorded themselves playing it in 17
    // and 18 — session 16's membership comes from a correction and a
    // demonstration. Read from membership the chain would be three classes
    // long; read from what was actually asked for again, it is two.
    const hormozi = 'پیش-درامد-ماهور-هرمزی';
    expect(source.sessions.filter((s) => s.members.some((m) => m.key === hormozi)).map((s) => s.n)).toEqual([
      16, 17, 18,
    ]);
    expect(repeatChains(source, hormozi)).toEqual([[17, 18]]);
    const chainItem = useStore.getState().db.items.find((i) => i.source?.pieceKey === chainPiece)!;
    // Six classes of provenance, and still zero recorded practice.
    expect(chainItem.timesPractised).toBe(0);
    expect(chainItem.totalMinutes).toBe(0);
    const material = (await import('../domain/itemFiles')).itemFiles(useStore.getState().db, chainItem.id);
    expect(material.every((f) => f.source !== 'reference' || !f.path.includes('تمرین-من'))).toBe(true);

    // --- HISTORY NEVER BECOMES THE NEXT CLASS ------------------------------
    const { nextLessonFor } = await import('../domain/selectors');
    const { preparationDatesByItem, defaultTargetLesson } = await import('../domain/lessonAgenda');
    const db = useStore.getState().db;
    expect(db.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
    expect(nextLessonFor(db.lessons, SETAR, NOW)!.id).toBe('L-38-upcoming');
    expect(defaultTargetLesson(db.lessons, SETAR, NOW)!.id).toBe('L-38-upcoming');
    expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, NOW).values()]).toEqual([]);

    // AND ON A DEVICE WHOSE CLOCK IS BEHIND THE ARCHIVE. Read from 1 June 2026,
    // the last three imported classes are all in the FUTURE and all NEARER than
    // the owner's own next class — the exact case a plain `date >= today` turns
    // into a deadline. They are still history.
    const EARLIER = new Date('2026-06-01T09:00:00.000Z');
    const futureHistory = db.lessons.filter((l) => l.origin === 'archive' && l.date > '2026-06-01');
    expect(futureHistory.map((l) => l.date).sort()).toEqual(['2026-06-09', '2026-07-09', '2026-08-04', '2026-09-01']);
    expect(nextLessonFor(db.lessons, SETAR, EARLIER)!.id).toBe('L-38-upcoming');
    expect(defaultTargetLesson(db.lessons, SETAR, EARLIER)!.id).toBe('L-38-upcoming');
    expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, EARLIER).values()]).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ac-8 — an owner's deletion is a decision a refresh has to respect.
// ---------------------------------------------------------------------------

describe('deletions, unlinking and hiding', () => {
  it('archive deletions and unlinking remain respected after refresh and reload', async () => {
    loadOwnerData();
    await commit(useStore.getState().rev);
    const store = () => useStore.getState();
    const itemFor = (key: string) => store().db.items.find((i) => i.source?.pieceKey === key)!;
    const lessonFor = (n: number) => store().db.lessons.find((l) => l.source?.sessionN === n)!;
    const suppressions = () => store().db.archiveSources[0]!.suppressions;

    // --- deleteItem records the decision IN THE SAME mutation --------------
    const araqId = itemFor('عراق').id;
    store().deleteItem(araqId);
    expect(store().db.items.some((i) => i.id === araqId)).toBe(false);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'piece', ref: 'عراق' }));

    // --- deleteLesson likewise ---------------------------------------------
    const lesson13 = lessonFor(13).id;
    store().deleteLesson(lesson13);
    expect(store().db.lessons.some((l) => l.id === lesson13)).toBe(false);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'session', ref: '13' }));

    // --- REFRESHING THE SAME SOURCE MUST NOT BRING THEM BACK ---------------
    const again = await commit(store().rev);
    expect(again.ok).toBe(true);
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(store().db.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);

    // ...nor may a RELOAD, which replays the persisted bytes through hydration.
    const onDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(onDisk);
    await useStore.persist.rehydrate();
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(store().db.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    await commit(store().rev);
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);

    // --- lifting a suppression lets the next refresh bring it back ----------
    store().resetArchiveSuppression('setar-classes', 'piece', 'عراق');
    const restored = await commit(store().rev);
    expect(restored).toMatchObject({ ok: true, status: 'applied' });
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(true);

    // --- HIDING A SHARED DEMO IS SCOPED TO ONE ITEM ------------------------
    const { itemFiles } = await import('../domain/itemFiles');
    const sharedDemo = 'session-13-03-09-2024/نمونه-1.mp4';
    const oneMember = itemFor('کرشمه-در-عراق');
    const otherMember = itemFor('حزین-در-عراق');
    // Session 13 was suppressed above and is back only for the piece; re-run a
    // refresh so its resources are present for both members.
    store().resetArchiveSuppression('setar-classes', 'session', '13');
    await commit(store().rev);
    expect(itemFiles(store().db, oneMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(true);
    store().hideArchiveResource('setar-classes', sharedDemo, oneMember.id);
    expect(itemFiles(store().db, oneMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(false);
    // Its seven siblings still have it.
    expect(itemFiles(store().db, otherMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(
      true,
    );

    // --- unlinking an item from an archive class is remembered -------------
    const lesson28 = lessonFor(28);
    const zendan = itemFor('به-زندان-شوشتری');
    store().unlinkItemFromLesson(lesson28.id, zendan.id);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'link', ref: `28:${'به-زندان-شوشتری'}` }));
    const { membersForSession } = await import('../domain/sourceArchive');
    expect(membersForSession(store().db.archiveSources[0]!, 28).some((m) => m.key === 'به-زندان-شوشتری')).toBe(false);

    // --- a MANUAL reference is removed without touching the archive --------
    store().addItemReference(zendan.id, { title: 'my own copy', path: 'session-28-28-10-2025/نت-به-زندان-شوشتری.pdf' });
    const added = store().db.items.find((i) => i.id === zendan.id)!.references![0]!;
    const suppressionsBefore = suppressions().length;
    store().removeItemReference(zendan.id, added.id);
    expect(store().db.items.find((i) => i.id === zendan.id)!.references).toEqual([]);
    // Removing an owner's own link says nothing about the archive.
    expect(suppressions()).toHaveLength(suppressionsBefore);

    // --- a catalogue removal of a bound item is still lossless -------------
    const catalogueItem = itemFor('چهار-پاره');
    expect(store().removeCatalogItem(catalogueItem.id)).toBe(false); // no catalogKey
    expect(store().db.items.some((i) => i.id === catalogueItem.id)).toBe(true);

    // --- MOVING A BOUND ITEM TO ANOTHER INSTRUMENT IS REFUSED --------------
    useStore.setState((s) => ({
      db: {
        ...s.db,
        instruments: [
          ...s.db.instruments,
          { ...s.db.instruments[0]!, id: 'inst-tar', name: 'Tar' },
        ],
      },
    }));
    const boundId = itemFor('به-زندان-شوشتری').id;
    const refusal = store().updateItem(boundId, { instrumentId: 'inst-tar' });
    expect(refusal).toMatch(/Detach it from the archive/);
    expect(store().db.items.find((i) => i.id === boundId)!.instrumentId).toBe(SETAR);
    // No invalid graph was emitted: the database still validates.
    expect(() => validateDB(store().db)).not.toThrow();

    // --- a PARTIAL binding is refused, never healed by duplication ---------
    expect(() =>
      validateDB({
        ...store().db,
        items: store().db.items.map((i) =>
          i.id === boundId ? { ...i, source: { archiveId: 'setar-classes', pieceKey: 'not-a-real-piece' } } : i,
        ),
      }),
    ).toThrow(/does not describe/);

    // --- clearing everything takes the source state with it ----------------
    store().clearAll();
    expect(store().db.archiveSources).toEqual([]);
    expect(store().db.items).toEqual([]);
    expect(store().active).toBeNull();
  });
});
