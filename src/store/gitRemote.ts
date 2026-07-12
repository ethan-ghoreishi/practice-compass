import type { RemotePort, TreeEntry } from './syncEngine';

// ---------------------------------------------------------------------------
// The real RemotePort: GitHub's Git Data API over fetch. One commit per
// snapshot; the branch ref only advances fast-forward, so a concurrent push
// from another device surfaces as a race instead of clobbering anything.
// ---------------------------------------------------------------------------

const API = 'https://api.github.com';
const BRANCH = 'main';

const BOOTSTRAP_README = `# Practice Compass — data

This repository is the private sync + backup store for the Practice Compass app.
It holds whole-snapshot commits (\`manifest.json\`, \`state.json\`, \`files/\`) written
by the app; it is not meant to be edited by hand.

If sync ever reports the repo is empty and cannot initialize it, this first
commit is the manual fallback — the app takes over from here on the next sync.
`;

export interface GitHubConfig {
  /** owner/name */
  repo: string;
  token: string;
}

export function b64encodeText(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function makeGitHubRemote(cfg: GitHubConfig): RemotePort {
  async function gh(path: string, init: RequestInit = {}, accept = 'application/vnd.github+json'): Promise<Response> {
    return fetch(`${API}/repos/${cfg.repo}/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  }

  async function ok<T>(res: Response, what: string): Promise<T> {
    if (!res.ok) throw new Error(`GitHub ${res.status} ${what}: ${(await res.text()).slice(0, 180)}`);
    return (await res.json()) as T;
  }

  return {
    async getHead() {
      const res = await gh(`git/ref/heads/${BRANCH}`);
      // 404 = no branch; 409 = completely empty repository.
      if (res.status === 404 || res.status === 409) return null;
      const data = await ok<{ object: { sha: string } }>(res, 'reading branch head');
      return data.object.sha;
    },

    async initialize() {
      const existing = await this.getHead();
      if (existing) return existing;

      // The Contents API can make the FIRST commit in an empty repo (the
      // git-data endpoints cannot). This bootstrap file holds no user data —
      // the first real snapshot replaces the tree entirely; it just exists so
      // the repository has a history.
      const res = await gh(`contents/README.md`, {
        method: 'PUT',
        body: JSON.stringify({
          message: 'Initialize Practice Compass data repository',
          content: b64encodeText(BOOTSTRAP_README),
          branch: BRANCH,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { commit: { sha: string } };
        return data.commit.sha;
      }
      // 409/422 here usually means another device initialized it a moment ago
      // (the file or branch now exists). Re-read the head and use it.
      if (res.status === 409 || res.status === 422) {
        const head = await this.getHead();
        if (head) return head;
      }
      const detail = (await res.text()).slice(0, 180);
      throw new Error(
        `Couldn't set up the empty GitHub repo automatically (${res.status}: ${detail}). ` +
          `Add any first commit to ${cfg.repo} — e.g. create a README on github.com — then Sync again. ` +
          `See the README's "Sync" section for the manual fallback.`,
      );
    },

    async readText(path, ref) {
      const res = await gh(`contents/${path}?ref=${ref}`, {}, 'application/vnd.github.raw+json');
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`GitHub ${res.status} reading ${path}`);
      return res.text();
    },

    async listDir(path, ref) {
      const res = await gh(`contents/${path}?ref=${ref}`);
      if (res.status === 404) return [];
      const arr = await ok<{ name: string }[]>(res, `listing ${path}`);
      return Array.isArray(arr) ? arr.map(({ name }) => ({ name })) : [];
    },

    async readBlobBase64(sha) {
      const res = await gh(`git/blobs/${sha}`);
      const data = await ok<{ content: string }>(res, 'reading file blob');
      return data.content.replace(/\n/g, '');
    },

    async createBlobBase64(b64) {
      const res = await gh('git/blobs', { method: 'POST', body: JSON.stringify({ content: b64, encoding: 'base64' }) });
      const data = await ok<{ sha: string }>(res, 'uploading file blob');
      return data.sha;
    },

    async createTextBlob(text) {
      const res = await gh('git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: b64encodeText(text), encoding: 'base64' }),
      });
      const data = await ok<{ sha: string }>(res, 'uploading text blob');
      return data.sha;
    },

    async createTree(entries: TreeEntry[]) {
      const res = await gh('git/trees', {
        method: 'POST',
        body: JSON.stringify({ tree: entries.map((e) => ({ path: e.path, mode: '100644', type: 'blob', sha: e.sha })) }),
      });
      const data = await ok<{ sha: string }>(res, 'creating snapshot tree');
      return data.sha;
    },

    async createCommit(message, treeSha, parents) {
      const res = await gh('git/commits', { method: 'POST', body: JSON.stringify({ message, tree: treeSha, parents }) });
      const data = await ok<{ sha: string }>(res, 'creating snapshot commit');
      return data.sha;
    },

    async advanceHead(sha, expectedParent) {
      if (expectedParent === null) {
        const res = await gh('git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha }) });
        if (res.status === 422) return 'race'; // branch appeared meanwhile
        await ok(res, 'creating branch');
        return 'ok';
      }
      const res = await gh(`git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha, force: false }) });
      if (res.status === 422) return 'race'; // not fast-forward — someone else pushed
      await ok(res, 'advancing branch');
      return 'ok';
    },

    async createArchiveBranch(name, sha) {
      const res = await gh('git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${name}`, sha }) });
      if (!res.ok) throw new Error(`GitHub ${res.status} creating archive branch`);
    },
  };
}
