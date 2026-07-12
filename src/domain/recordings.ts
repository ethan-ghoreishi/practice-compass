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
 * Resolve a recording reference to an openable URL.
 * - A full https:// URL is used as-is (encoded).
 * - A relative path is joined under `baseUrl`; each segment is URL-encoded so
 *   spaces and Farsi filenames work. Returns null when a relative path has no
 *   base URL configured (the UI then prompts to set one).
 */
export function resolveRecordingUrl(baseUrl: string | undefined, ref: Pick<LessonRecording, 'path'>): string | null {
  const p = ref.path.trim();
  if (!p) return null;
  if (HTTP_RE.test(p)) return encodeURI(p);
  const base = (baseUrl ?? '').trim();
  if (!base) return null;
  const cleanBase = base.replace(/\/+$/, '');
  const rel = p
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  return `${cleanBase}/${rel}`;
}

/** Whether opening this reference needs a NAS base URL that isn't set yet. */
export function needsBaseUrl(baseUrl: string | undefined, ref: Pick<LessonRecording, 'path'>): boolean {
  const p = ref.path.trim();
  return p.length > 0 && !HTTP_RE.test(p) && !(baseUrl ?? '').trim();
}
