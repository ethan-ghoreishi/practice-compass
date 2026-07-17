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
  | { status: 'empty' };

/**
 * Resolve a recording reference to an openable URL, distinguishing WHY it
 * can't resolve so the UI can react (prompt for a base, warn about a bad one,
 * etc.). Full http(s) paths pass through; relative paths join under the
 * normalised base with each segment URL-encoded (spaces, Farsi filenames).
 */
export function resolveRecording(
  baseUrl: string | undefined,
  ref: Pick<LessonRecording, 'path'>,
): RecordingResolution {
  const p = ref.path.trim();
  if (!p) return { status: 'empty' };
  if (HTTP_RE.test(p)) return { status: 'ok', url: encodeURI(p) };

  const raw = (baseUrl ?? '').trim();
  if (!raw) return { status: 'no-base' };
  const base = normalizeBaseUrl(raw);
  if (!base) return { status: 'bad-base' };

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
