import { getSyncConfig } from './githubSync';
import { parseSourceIndex, MAX_INDEX_BYTES, type SourceIndex } from '../domain/sourceArchive';

// ---------------------------------------------------------------------------
// Reading the published source index.
//
// The app only ever GETs. The NAS publisher's credential never reaches the
// browser — this reuses the device's OWN already-configured GitHub connection,
// which is read/write for the app's data but is used here for reads alone.
//
// A separate branch, not a sidecar on main: the sync engine writes main's whole
// tree with no base_tree, so anything placed beside state.json would vanish on
// the next sync. That engine is not touched by any of this.
// ---------------------------------------------------------------------------

const API = 'https://api.github.com';
/** The one branch and the one path the app reads. */
export const SOURCE_INDEX_BRANCH = 'source-index';
export const INDEX_PATH = 'setar/index.json';

export interface FetchedIndex {
  index: SourceIndex;
  /** The commit the file was read AT — not merely the branch name. */
  commitSha: string;
  /** When THIS DEVICE fetched it. Transient, device-local, never synced. */
  fetchedAt: string;
}

export type IndexFetchResult = { ok: true; value: FetchedIndex } | { ok: false; error: string };

type Fetcher = typeof fetch;

function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\s+/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Fetch the published index, PINNED to the commit the branch points at.
 *
 * Resolving the ref and then asking for the file "on that branch" would read
 * two different states when a publish lands between the two calls — half of an
 * older index with a newer hash. Reading the ref first and then the file AT
 * THAT SHA is one consistent snapshot.
 *
 * Every failure returns a message; nothing is thrown at the caller and nothing
 * is written. A network or auth failure leaves the last accepted graph exactly
 * as it is — the app keeps working offline from it.
 */
export async function fetchPublishedIndex(
  options: { repo?: string; token?: string; fetchImpl?: Fetcher; now?: Date } = {},
): Promise<IndexFetchResult> {
  const cfg = options.repo && options.token ? { repo: options.repo, token: options.token } : getSyncConfig();
  if (!cfg) {
    return { ok: false, error: 'Connect this device to your GitHub data repository in Sync first.' };
  }
  const doFetch = options.fetchImpl ?? fetch;
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  let commitSha: string;
  try {
    const res = await doFetch(`${API}/repos/${cfg.repo}/git/ref/heads/${SOURCE_INDEX_BRANCH}`, { headers });
    if (res.status === 404 || res.status === 409) {
      return { ok: false, error: 'No source index has been published yet. Run the archive scanner on the NAS.' };
    }
    if (!res.ok) return { ok: false, error: githubError(res.status) };
    const body = (await res.json()) as { object?: { sha?: string } };
    if (typeof body.object?.sha !== 'string') return { ok: false, error: 'The source index branch has no commit.' };
    commitSha = body.object.sha;
  } catch {
    return { ok: false, error: 'Could not reach GitHub. The material already imported is unaffected.' };
  }

  let text: string;
  try {
    const res = await doFetch(`${API}/repos/${cfg.repo}/contents/${INDEX_PATH}?ref=${commitSha}`, { headers });
    if (res.status === 404) {
      return { ok: false, error: `The index branch exists but carries no ${INDEX_PATH}.` };
    }
    if (!res.ok) return { ok: false, error: githubError(res.status) };
    const body = (await res.json()) as { content?: string; encoding?: string; size?: number };
    if (typeof body.size === 'number' && body.size > MAX_INDEX_BYTES) {
      return { ok: false, error: 'That index file is too large to be a Setar archive index.' };
    }
    if (typeof body.content !== 'string' || body.encoding !== 'base64') {
      return { ok: false, error: 'GitHub returned the index in a shape this app cannot read.' };
    }
    text = decodeBase64Utf8(body.content);
  } catch {
    return { ok: false, error: 'Could not reach GitHub. The material already imported is unaffected.' };
  }

  try {
    return {
      ok: true,
      value: { index: parseSourceIndex(text), commitSha, fetchedAt: (options.now ?? new Date()).toISOString() },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'That index could not be read.' };
  }
}

/**
 * The file-import fallback. The SAME decoder, so a hand-copied index is held to
 * exactly the rules a fetched one is.
 */
export function readIndexFile(text: string, now: Date = new Date()): IndexFetchResult {
  try {
    return { ok: true, value: { index: parseSourceIndex(text), commitSha: '', fetchedAt: now.toISOString() } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'That index could not be read.' };
  }
}

function githubError(status: number): string {
  if (status === 401 || status === 403) {
    return 'GitHub refused this device’s access token. Check Sync settings; nothing was changed.';
  }
  return `GitHub returned an error (HTTP ${status}). Nothing was changed.`;
}
