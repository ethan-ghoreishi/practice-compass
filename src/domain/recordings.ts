import type { LessonRecording } from './types';

// ---------------------------------------------------------------------------
// Class-recording references. The app stores WHERE a recording is, never the
// bytes: a relative path under a NAS base URL (set in Settings) or a full
// https:// URL. Resolving a reference is pure; the video is only ever fetched
// when the user explicitly opens it, never at startup.
// ---------------------------------------------------------------------------

const HTTP_RE = /^https?:\/\//i;

/** Format a byte count for display (e.g. "686 MB"). */
export function formatFileSize(bytes: number | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  if (mb < 1024) return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

/**
 * Normalise a user-entered NAS base URL to a valid http(s) origin+path.
 * - Missing scheme → assume `https://` (the app runs on an HTTPS origin, so a
 *   bare host like `nas.example.ts.net` would otherwise be treated as a
 *   relative path and every recording would resolve to the same in-app route).
 * - Validates with `new URL`; only http/https accepted.
 * - Strips a trailing slash.
 * Returns null when the value is blank or unparseable.
 */
const ANY_SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

export function normalizeBaseUrl(raw: string | undefined): string | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;
  // A string that already carries a scheme must be http(s); don't silently
  // rewrite ftp://, file://, etc. into https://.
  if (ANY_SCHEME_RE.test(trimmed) && !HTTP_RE.test(trimmed)) return null;
  const withScheme = HTTP_RE.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url.toString().replace(/\/+$/, '');
}

export type RecordingResolution =
  | { status: 'ok'; url: string }
  | { status: 'no-base' }
  | { status: 'bad-base' }
  | { status: 'unsafe' }
  | { status: 'empty' };

/**
 * A stored RELATIVE reference is a path of plain segments under the media
 * base, and nothing else. Traversal, an absolute path, a backslash, an
 * embedded credential and a percent-encoded separator are all REFUSED rather
 * than escaped into something that resolves: each of them is an attempt to
 * leave the base the owner configured, and `encodeURIComponent` would turn
 * `../` into a literal segment that silently 404s instead of saying so.
 */
function isSafeRelativeReference(p: string): boolean {
  if (/%2f|%5c/i.test(p)) return false;
  if (p.includes('\\') || p.includes('@')) return false;
  return p
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .every((seg) => seg !== '.' && seg !== '..');
}

/**
 * Resolve a recording reference to an openable URL, distinguishing WHY it
 * can't resolve so the UI can react (prompt for a base, warn about a bad one,
 * etc.). Full http(s) paths pass through the `URL` parser rather than
 * `encodeURI` — it escapes a raw unsafe character (a literal space) the same
 * way, but leaves an already-valid `%XX` escape alone instead of re-encoding
 * its `%` into `%25`, which is what a retained foreign or query-bearing URL
 * (percent-encoded Farsi filename, `?download=1`) already carries. Relative
 * paths join under the normalised base with each segment URL-encoded (spaces,
 * Farsi filenames).
 */
export function resolveRecording(
  baseUrl: string | undefined,
  ref: Pick<LessonRecording, 'path'>,
): RecordingResolution {
  const p = ref.path.trim();
  if (!p) return { status: 'empty' };
  if (HTTP_RE.test(p)) {
    try {
      return { status: 'ok', url: new URL(p).toString() };
    } catch {
      return { status: 'ok', url: encodeURI(p) };
    }
  }

  const raw = (baseUrl ?? '').trim();
  if (!raw) return { status: 'no-base' };
  const base = normalizeBaseUrl(raw);
  if (!base) return { status: 'bad-base' };
  if (!isSafeRelativeReference(p)) return { status: 'unsafe' };

  const rel = p
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  // `base` is a validated absolute URL; append the encoded relative path.
  return { status: 'ok', url: `${base}/${rel}` };
}

/** Openable URL, or null. Thin wrapper over {@link resolveRecording}. */
export function resolveRecordingUrl(baseUrl: string | undefined, ref: Pick<LessonRecording, 'path'>): string | null {
  const r = resolveRecording(baseUrl, ref);
  return r.status === 'ok' ? r.url : null;
}

/** Whether opening this reference needs a NAS base URL that isn't set yet. */
export function needsBaseUrl(baseUrl: string | undefined, ref: Pick<LessonRecording, 'path'>): boolean {
  return resolveRecording(baseUrl, ref).status === 'no-base';
}

/** Decode a stored-relative path segment-wise; `resolveRecording` re-encodes. */
function decodeSegments(rel: string): string {
  return rel
    .split('/')
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg; // malformed %-escape: leave it exactly as given
      }
    })
    .join('/');
}

/**
 * Store a pasted reference TRANSPORT-INDEPENDENTLY.
 *
 * Browsing the NAS and pasting a file's URL is the whole point of the Browse
 * link — but an absolute URL saved verbatim is PINNED TO ONE ROUTE to the NAS:
 * it dies on a phone away from home, and everywhere at once if the base URL
 * ever changes. So a URL that sits UNDER the configured base is stored as the
 * path beneath it, which every device then resolves through its own base.
 *
 * Everything else is left EXACTLY as given, because guessing is worse than
 * leaving it alone: a different origin is a deliberate external link, a URL
 * carrying a query or fragment is not a plain file path, and a blank or
 * unparseable base is not something to reason from at all.
 *
 * A stored path is decoded (`resolveRecording` encodes each segment on the way
 * out), so a Farsi filename copied from a directory listing survives the round
 * trip instead of being double-escaped into a dead link.
 */
export function relativizeReference(baseUrl: string | undefined, pasted: string): string {
  const raw = pasted.trim();
  if (!raw || !HTTP_RE.test(raw)) return raw; // already a relative path
  const base = normalizeBaseUrl(baseUrl);
  if (!base) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  if (url.search || url.hash) return raw;

  // Compare normalised forms (host case, default ports) and require the path
  // BOUNDARY, so `…/media` never swallows `…/mediaXYZ/`.
  const prefix = `${base}/`;
  const abs = url.toString();
  if (!abs.startsWith(prefix)) return raw;
  const relative = decodeSegments(abs.slice(prefix.length));
  // DECODING CAN CREATE A PATH THE RAW URL DID NOT HAVE. `…%2F..%2Fx.mp4` is
  // ONE segment in the URL and three after decoding, the middle one being a
  // step out of the base — storing that would be storing a reference to a file
  // outside the archive the owner configured. It is not rewritten into
  // something safe (that would name a different file again): the pasted value
  // is kept exactly as given, and `resolveRecording` refuses to open it.
  if (!relative || !isSafeRelativeReference(relative)) return raw;
  return relative;
}

// ---------------------------------------------------------------------------
// Archive media access, stated honestly.
// ---------------------------------------------------------------------------

/**
 * The archive ROOT for a configured base — what "Open archive root" opens.
 *
 * Deliberately NOT a media filename. Probing one particular clip proves only
 * that that clip exists: it fails for a file that was renamed, and it passes
 * for a base whose other thousand files are unreachable. The root is the thing
 * the owner actually configured, so it is the thing to open.
 */
export function archiveRootUrl(baseUrl: string | undefined): string | null {
  const base = normalizeBaseUrl(baseUrl);
  return base ? `${base}/` : null;
}

export interface ArchiveAccess {
  /** What is KNOWN about the published index — this app fetched it, or did not. */
  index: string;
  /** What is known about the MEDIA — which, from here, is almost nothing. */
  media: string;
}

/**
 * Two separate statements, because they are two separate facts.
 *
 * Reading the index proves GitHub answered; it says nothing whatever about
 * whether the NAS is reachable from this device. And a failed media request
 * from a web page cannot tell a certificate rejection, a CORS refusal and a
 * network outage apart from a missing file — so this never calls any of them
 * absence. The honest report is "the app cannot check this from here; open the
 * archive root and see".
 */
export function describeArchiveAccess(input: {
  indexFetchedAt?: string | null;
  indexChangedAt?: string | null;
  baseUrl?: string;
}): ArchiveAccess {
  const base = normalizeBaseUrl(input.baseUrl);
  return {
    index: input.indexFetchedAt
      ? `Index last fetched ${input.indexFetchedAt}${input.indexChangedAt ? `; last changed ${input.indexChangedAt}` : ''}.`
      : 'No index has been fetched on this device yet.',
    media: !input.baseUrl?.trim()
      ? 'No media base is set on this device, so files cannot be opened here.'
      : !base
        ? 'This device’s media base is not a usable http(s) address.'
        : 'Files open directly from this device’s media base. The app cannot verify from here that the archive is reachable — open the archive root to check.',
  };
}
