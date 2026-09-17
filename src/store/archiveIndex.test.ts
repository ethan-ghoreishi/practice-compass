import { describe, expect, it } from 'vitest';
// @ts-expect-error — no types for the .mjs operator tool; the decision is pure.
import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../../scripts/publish-setar-index.mjs';
import { fetchPublishedIndex, readIndexFile } from './archiveIndex';
import indexFixture from '../../tests/fixtures/setar-archive.json' with { type: 'json' };

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

const TOKEN = 'ghp-publisher-secret-token';
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
    expect(everything).not.toContain(TOKEN);
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
