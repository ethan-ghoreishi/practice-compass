#!/usr/bin/env node
// Publish the scanned Setar index to ONE file on ONE branch of the private
// data repository, and nothing else, ever.
//
//   node scripts/publish-setar-index.mjs --index <file> --root <archive> [--expect <contentHash>] [--holder <lock token>]
//     env: PC_INDEX_REPO=owner/name  PC_INDEX_TOKEN=<publisher token>
//
// On success the LAST stdout line is the evidence a caller checks:
//   published-index <unchanged|published|created> <contentHash>
// `--expect` refuses, before any request, an index whose contentHash is not
// the one the caller validated (exit 3: nothing was published). Exit 2: usage
// refused; exit 4: it failed before its ref write (nothing was published). Any other failure,
// exit 1 included, may have come after GitHub accepted the ref: unknown.
//
// THE ARCHIVE IS ASKED AGAIN BEFORE EVERY REF WRITE (`archiveConfirmation`):
// the index must still be what `--root` scans to NOW, and the archive's
// maintenance lock must be absent (the scheduled job) or held by `--holder`
// (the maintenance run that asked for this publication). A publisher paused or
// orphaned while the archive moved on, or while a maintenance run owns it,
// therefore refuses (exit 4) instead of putting an older index over a newer
// one; the ref write itself stays non-force from the commit read, so the last
// publisher to confirm is the one whose index stands.
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

import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { scanToIndex } from './scan-setar-classes.mjs';

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
 *   published one: a blob and a commit nothing points at are invisible. Such
 *   a failure carries `nothingPublished: true`. A throw FROM the ref write (a
 *   lost response, a 5xx) does not: GitHub may have accepted it.
 */
export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX_BRANCH, path = INDEX_PATH, message, expectedContentHash, confirm }) {
  if (branch !== SOURCE_INDEX_BRANCH) throw new Error(`This publisher only writes the "${SOURCE_INDEX_BRANCH}" branch.`);
  if (path !== INDEX_PATH) throw new Error(`This publisher only writes "${INDEX_PATH}".`);
  if (PROTECTED_PREFIXES.some((p) => branch === p || branch.startsWith(p))) {
    throw new Error('Refusing to write a protected branch.');
  }
  if (typeof indexText !== 'string' || !indexText.trim()) throw new Error('There is no index to publish.');
  // WHAT WAS VALIDATED IS WHAT IS PUBLISHED, decided before Git is touched:
  // a job scanning another root, or an archive changed since validation, is
  // refused here — never compared after the ref has already moved.
  if (expectedContentHash !== undefined) {
    const actual = contentHashOf(indexText);
    if (actual !== expectedContentHash) throw new ExpectationRefused(`This index is ${String(actual).slice(0, 12)}, not the validated ${String(expectedContentHash).slice(0, 12)}; nothing was published.`);
  }

  const confirmed = async () => {
    if (!confirm) return;
    const now = await confirm();
    if (now !== contentHashOf(indexText)) throw new Error('The archive has changed since this index was scanned; nothing was published (the next run publishes what it holds now).');
  };
  let lastConflict = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let ref;
    let commitSha;
    try {
      ref = await transport.getRef(branch);

      if (ref) {
        const current = await transport.getFile(ref.sha, path);
        if (current && current.text === indexText) return { status: 'unchanged', commit: ref.sha };
      }
      // Asked AFTER the ref is read, before anything is written: an archive
      // that moved on (or a maintenance run that now owns it) since this index
      // was scanned refuses, leaving no objects behind.
      await confirmed();

      const blobSha = await transport.createBlob(indexText);
      const baseTreeSha = ref ? (await transport.getCommit(ref.sha)).treeSha : null;
      const treeSha = await transport.createTree({ baseTreeSha, path, blobSha });
      commitSha = await transport.createCommit({
        message: message ?? 'Update Setar source index',
        treeSha,
        parents: ref ? [ref.sha] : [],
      });
      // …and again immediately before the ref write: a newer decision that
      // moved no ref (an `unchanged` publication) is still seen. The ref write
      // is non-force from the read above, so a publisher that confirmed later
      // wins any race that does move the ref.
      // ponytail: a pause exactly between this check and the ref write cannot
      // be closed without a lock the read-only scheduled job could take; the
      // next scheduled run sees branch ≠ archive and republishes.
      await confirmed();
    } catch (err) {
      throw nothingPublished(err);
    }

    // A conflict answer is GitHub refusing the write; a throw here is unknown.
    const outcome = ref
      ? await transport.updateRef(branch, commitSha, ref.sha)
      : await transport.createRef(branch, commitSha);
    if (outcome === 'ok') return { status: ref ? 'published' : 'created', commit: commitSha };
    lastConflict = outcome;
  }
  throw nothingPublished(new Error(`Another publisher updated the index while this one was writing (${lastConflict}); nothing was overwritten.`));
}

/** Refused before any request: nothing was published. */
export class ExpectationRefused extends Error {
  nothingPublished = true;
}

function nothingPublished(err) {
  const e = err instanceof Error ? err : new Error(String(err));
  e.nothingPublished = true;
  return e;
}

/** The archive's maintenance lock: ONE file in the archive root, which the scanner skips (a dotfile). */
export const ARCHIVE_LOCK = '.setar-maintenance.lock';

/**
 * The lock as it stands: null (absent), its record, or `{ unreadable }` with
 * the digest of bytes that are not a complete record in this tool's form —
 * never guessed into one. A record is written whole before it is linked into
 * place, so a partial one is never this tool's.
 */
export function readArchiveLock(root) {
  let bytes;
  try {
    bytes = readFileSync(join(root, ARCHIVE_LOCK));
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
  const digest = createHash('sha256').update(bytes).digest('hex');
  try {
    const r = JSON.parse(bytes.toString('utf8'));
    if (typeof r?.token === 'string' && /^[0-9a-f-]{36}$/.test(r.token) && Number.isInteger(r.pid) && r.pid > 0 && typeof r.host === 'string' && typeof r.since === 'string') {
      return { ...r, digest };
    }
  } catch {
    // not a record: said as unreadable below
  }
  return { unreadable: true, digest };
}

/**
 * What a publisher asks before its ref write: who holds the archive, then what
 * it scans to now. `holder` is the maintenance run's lock token; without one
 * (the scheduled job) any lock refuses.
 */
export function archiveConfirmation(root, holder) {
  return () => {
    const held = readArchiveLock(root);
    if (holder ? held?.token !== holder : held) {
      throw new Error(
        holder
          ? 'The maintenance run that asked for this publication no longer holds the archive; nothing was published.'
          : 'A maintenance run holds the archive; nothing was published. That run publishes when it finishes.',
      );
    }
    return scanToIndex(root).contentHash;
  };
}

function contentHashOf(indexText) {
  try {
    return JSON.parse(indexText).contentHash ?? null;
  } catch {
    return null;
  }
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
  const { values } = parseArgs({ options: { index: { type: 'string' }, root: { type: 'string' }, expect: { type: 'string' }, holder: { type: 'string' } } });
  const repo = process.env.PC_INDEX_REPO;
  const token = process.env.PC_INDEX_TOKEN;
  if (!values.index || !values.root || !repo || !token) {
    console.error('Usage: publish-setar-index.mjs --index <file> --root <archive> [--expect <contentHash>] [--holder <lock token>]');
    console.error('  PC_INDEX_REPO=owner/name PC_INDEX_TOKEN=<publisher token> must be set.');
    process.exit(2);
  }
  let indexText;
  try {
    indexText = readFileSync(values.index, 'utf8');
  } catch {
    console.error('Could not read the scanned index; the published one is unchanged.');
    process.exit(4);
  }
  try {
    const result = await publishIndex({
      transport: makeGitHubIndexTransport({ repo, token }),
      indexText,
      expectedContentHash: values.expect,
      confirm: archiveConfirmation(values.root, values.holder),
    });
    console.error(
      result.status === 'unchanged'
        ? 'Index unchanged — no commit.'
        : `Index ${result.status} as ${result.commit.slice(0, 12)}.`,
    );
    console.log(`published-index ${result.status} ${contentHashOf(indexText)}`);
  } catch (err) {
    if (err instanceof ExpectationRefused) {
      console.error(`Refused: ${err.message}`);
      process.exit(3);
    }
    // Never the URL, never the token, never the archive root.
    console.error(`Publish failed: ${err.message}`);
    if (err?.nothingPublished) {
      console.error('This run published nothing; the source-index branch is as it was.');
      process.exit(4);
    }
    console.error('It may already be published; running the job again makes no new commit if so.');
    process.exit(1);
  }
}

if ((() => { try { return realpathSync.native(process.argv[1]) === realpathSync.native(fileURLToPath(import.meta.url)); } catch { return false; } })()) main();
