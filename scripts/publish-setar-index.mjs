#!/usr/bin/env node
// Publish the scanned Setar index to ONE file on ONE branch of the private
// data repository, and nothing else, ever.
//
//   node scripts/publish-setar-index.mjs --index <file>
//     env: PC_INDEX_REPO=owner/name  PC_INDEX_TOKEN=<publisher token>
//
// WHY A SEPARATE BRANCH. The app's own sync writes main's whole tree with no
// base_tree, so a sidecar placed beside state.json disappears on the next
// sync. `source-index` is outside that, and outside the `archive/` recovery
// branches too.
//
// WHAT THE TOKEN IS. A token scoped to this ONE PRIVATE REPOSITORY with
// Contents write + metadata read, no workflow or admin permission. GitHub does
// not issue BRANCH-scoped tokens: the branch and path restriction below is a
// property of THIS CODE (and, optionally, of repository rules), and must never
// be described as credential isolation. The token lives in the NAS runtime's
// own protected configuration — never in the archive, the app, a backup, sync,
// a commit or a log line.
//
// Node stdlib only.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

/** The ONLY branch this publisher may write. */
export const SOURCE_INDEX_BRANCH = 'source-index';
/** The ONLY path this publisher may write. */
export const INDEX_PATH = 'setar/index.json';
/** Branches whose contents this publisher must never be able to touch. */
const PROTECTED_PREFIXES = ['main', 'master', 'archive/'];

const MAX_ATTEMPTS = 4;

/**
 * Publish `indexText` as a single commit on the source-index branch.
 *
 * `transport` is injected, so this decision is reachable from an ordinary test
 * and so no credential or URL is in scope here at all. Returns
 * `{ status: 'unchanged' | 'published' | 'created', commit? }`, or throws with
 * a message built only from what the transport reported.
 *
 * - UNCHANGED CONTENT MAKES NO COMMIT. The index is clock-free, so identical
 *   bytes mean an identical archive; committing anyway would turn "the index
 *   changed" into "a scan ran", which is a different and weaker claim.
 * - The ref only ever advances NON-FORCE from the commit that was read, so a
 *   second publisher racing this one loses the update-ref rather than
 *   overwriting it, and the retry re-reads before deciding anything.
 * - An interruption before the ref advances leaves the previous index as the
 *   published one: a blob and a commit nothing points at are invisible.
 */
export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX_BRANCH, path = INDEX_PATH, message }) {
  if (branch !== SOURCE_INDEX_BRANCH) throw new Error(`This publisher only writes the "${SOURCE_INDEX_BRANCH}" branch.`);
  if (path !== INDEX_PATH) throw new Error(`This publisher only writes "${INDEX_PATH}".`);
  if (PROTECTED_PREFIXES.some((p) => branch === p || branch.startsWith(p))) {
    throw new Error('Refusing to write a protected branch.');
  }
  if (typeof indexText !== 'string' || !indexText.trim()) throw new Error('There is no index to publish.');

  let lastConflict = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const ref = await transport.getRef(branch);

    if (ref) {
      const current = await transport.getFile(ref.sha, path);
      if (current && current.text === indexText) return { status: 'unchanged', commit: ref.sha };
    }

    const blobSha = await transport.createBlob(indexText);
    const baseTreeSha = ref ? (await transport.getCommit(ref.sha)).treeSha : null;
    const treeSha = await transport.createTree({ baseTreeSha, path, blobSha });
    const commitSha = await transport.createCommit({
      message: message ?? 'Update Setar source index',
      treeSha,
      parents: ref ? [ref.sha] : [],
    });

    const outcome = ref
      ? await transport.updateRef(branch, commitSha, ref.sha)
      : await transport.createRef(branch, commitSha);
    if (outcome === 'ok') return { status: ref ? 'published' : 'created', commit: commitSha };
    lastConflict = outcome;
  }
  throw new Error(`Another publisher updated the index while this one was writing (${lastConflict}); nothing was overwritten.`);
}

// ---------------------------------------------------------------------------
// The real transport
// ---------------------------------------------------------------------------

const API = 'https://api.github.com';

/**
 * GitHub's Git Data API. Every error message is built from the STATUS and the
 * endpoint NAME only — never from the request URL or the headers, so a token
 * can never reach a log or a scheduler mail.
 */
export function makeGitHubIndexTransport({ repo, token }) {
  async function gh(endpoint, init = {}) {
    const res = await fetch(`${API}/repos/${repo}/${endpoint}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    return res;
  }
  async function ok(res, what) {
    if (!res.ok) throw new Error(`GitHub refused ${what} (HTTP ${res.status}).`);
    return res.json();
  }
  const json = (body) => JSON.stringify(body);

  return {
    async getRef(branch) {
      const res = await gh(`git/ref/heads/${branch}`);
      if (res.status === 404 || res.status === 409) return null;
      const body = await ok(res, 'the branch reference');
      return { sha: body.object.sha };
    },
    async getFile(sha, path) {
      const res = await gh(`contents/${path}?ref=${sha}`);
      if (res.status === 404) return null;
      const body = await ok(res, 'the published index');
      return { text: Buffer.from(body.content ?? '', 'base64').toString('utf8') };
    },
    async getCommit(sha) {
      const body = await ok(await gh(`git/commits/${sha}`), 'the current commit');
      return { treeSha: body.tree.sha };
    },
    async createBlob(text) {
      const body = await ok(
        await gh('git/blobs', { method: 'POST', body: json({ content: text, encoding: 'utf-8' }) }),
        'the index blob',
      );
      return body.sha;
    },
    async createTree({ baseTreeSha, path, blobSha }) {
      const body = await ok(
        await gh('git/trees', {
          method: 'POST',
          body: json({
            ...(baseTreeSha ? { base_tree: baseTreeSha } : {}),
            tree: [{ path, mode: '100644', type: 'blob', sha: blobSha }],
          }),
        }),
        'the index tree',
      );
      return body.sha;
    },
    async createCommit({ message, treeSha, parents }) {
      const body = await ok(
        await gh('git/commits', { method: 'POST', body: json({ message, tree: treeSha, parents }) }),
        'the index commit',
      );
      return body.sha;
    },
    async updateRef(branch, sha, expectedSha) {
      // NON-FORCE, and the expected head is sent so GitHub itself refuses a
      // race rather than trusting this process's own read.
      const res = await gh(`git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: json({ sha, force: false, ...(expectedSha ? { expected_head_sha: expectedSha } : {}) }),
      });
      if (res.ok) return 'ok';
      if (res.status === 422 || res.status === 409) return `HTTP ${res.status}`;
      throw new Error(`GitHub refused the index reference update (HTTP ${res.status}).`);
    },
    async createRef(branch, sha) {
      const res = await gh('git/refs', { method: 'POST', body: json({ ref: `refs/heads/${branch}`, sha }) });
      if (res.ok) return 'ok';
      if (res.status === 422) return 'HTTP 422';
      throw new Error(`GitHub refused creating the index branch (HTTP ${res.status}).`);
    },
  };
}

async function main() {
  const { values } = parseArgs({ options: { index: { type: 'string' } } });
  const repo = process.env.PC_INDEX_REPO;
  const token = process.env.PC_INDEX_TOKEN;
  if (!values.index || !repo || !token) {
    console.error('Usage: publish-setar-index.mjs --index <file>');
    console.error('  PC_INDEX_REPO=owner/name PC_INDEX_TOKEN=<publisher token> must be set.');
    process.exit(2);
  }
  let indexText;
  try {
    indexText = readFileSync(values.index, 'utf8');
  } catch {
    console.error('Could not read the scanned index; the published one is unchanged.');
    process.exit(1);
  }
  try {
    const result = await publishIndex({ transport: makeGitHubIndexTransport({ repo, token }), indexText });
    console.error(
      result.status === 'unchanged'
        ? 'Index unchanged — no commit.'
        : `Index ${result.status} as ${result.commit.slice(0, 12)}.`,
    );
  } catch (err) {
    // Never the URL, never the token, never the archive root.
    console.error(`Publish failed: ${err.message}`);
    console.error('The previously published index is still the one the app reads.');
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
