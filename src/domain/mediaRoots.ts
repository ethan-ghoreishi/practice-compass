import { COURSES } from './courseSeed';
import { normalizeBaseUrl } from './recordings';

// ---------------------------------------------------------------------------
// ONE MEDIA ROOT PER DEVICE, AND EVERY SOURCE IS A FOLDER BENEATH IT.
//
// The owner's NAS serves one `video-courses` tree with `setar-classes/`,
// `classical-guitar/` and `tar-classes/` side by side. The archive base this
// device already has is therefore exactly `<media root>/setar-classes` — root
// plus source folder — so the root need not be asked for at all: it is DERIVED
// from the base the owner already set, and a stored reference stays relative to
// its own source. Adding a course later needs no new device setting.
//
// THIS IS NOT THE SECOND ARCHIVE-SPECIFIC BASE, AND NOT A RESOLVER FALLBACK,
// that `docs/setar-archive.md` and AGENTS.md rule out. Nothing resolves against
// two bases in turn and no source has a base of its own. There is one setting
// on the device — `getNasBaseUrl()`, unchanged in value and in meaning, still
// naming the Setar archive folder — and the shared root is the folder ABOVE it.
// Every Setar and lesson code path reads the same string it always did.
//
// NOTHING IS GUESSED. The derivation applies only when the base's last segment
// is a folder a source this app ships actually declares. A base that names
// something else — including the LEGACY value one folder too high, which is the
// media root itself — yields NO root, and a course file then reports `no-base`
// and offers no open action rather than pointing at a dead link. (That state is
// not new and not this lane's doing: Setar references are already broken in it,
// so correcting the archive base once fixes both.) The explicit override is for
// a device whose tree genuinely is not laid out this way.
// ---------------------------------------------------------------------------

/**
 * The Setar class archive's own folder beneath the shared root. It is a
 * constant here rather than a reach into `sourceArchive.ts`: the archive
 * describes its own CONTENT and has never named the folder it sits in, and
 * this lane changes nothing about it.
 */
export const ARCHIVE_SOURCE_FOLDER = 'setar-classes';

/**
 * Every folder beneath the shared media root that a source this app ships
 * declares — the archive's, plus each course's own first path segment. A
 * second course adds itself here for free.
 */
export function knownSourceFolders(): string[] {
  const out = [ARCHIVE_SOURCE_FOLDER];
  for (const course of COURSES) {
    const first = course.mediaPath.split('/').filter(Boolean)[0];
    if (first && !out.includes(first)) out.push(first);
  }
  return out;
}

/**
 * The shared media root implied by the configured archive base: the base minus
 * its last segment, and only when that segment names a known source.
 *
 * Returns null — never a guess — when the base is blank, unusable, or names
 * something no source declares.
 */
export function deriveMediaRoot(archiveBase: string | undefined): string | null {
  const base = normalizeBaseUrl(archiveBase);
  if (!base) return null;
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return null;
  }
  const segments = url.pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || !knownSourceFolders().includes(decodeURIComponent(last))) return null;
  url.pathname = `/${segments.slice(0, -1).join('/')}`;
  return normalizeBaseUrl(url.toString());
}

/**
 * The media root this device actually uses. An explicit override WINS over the
 * derivation whenever it is set and usable, because the owner setting one is a
 * statement that the derivation does not apply to their tree.
 */
export function mediaRoot(input: { archiveBase?: string; override?: string }): string | null {
  return normalizeBaseUrl(input.override) ?? deriveMediaRoot(input.archiveBase);
}

/** Why there is no media root, in words the owner can act on. */
export function describeMediaRoot(input: { archiveBase?: string; override?: string }): string {
  const root = mediaRoot(input);
  if (root) {
    return normalizeBaseUrl(input.override)
      ? `Course files open from the media root you set on this device: ${root}`
      : `Course files open from the media root derived from your archive base: ${root}`;
  }
  if ((input.override ?? '').trim()) {
    return 'The media root you set is not a usable http(s) address. A root is a plain http(s) address and folder — it may not carry a username, a password, a query or a #fragment.';
  }
  if (!normalizeBaseUrl(input.archiveBase)) {
    return 'No media root yet: this device has no usable archive base to derive one from. Set the archive base, or set a media root explicitly.';
  }
  return `No media root yet: your archive base does not end in a folder this app knows a source for (${knownSourceFolders().join(', ')}). It should name the archive folder itself — set a media root explicitly if your tree is laid out differently.`;
}
