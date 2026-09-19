import type { ID, ISODate, ISODateTime, LessonRecording, PracticeDB } from './types';
import { canonicalStringify, sha256Hex } from './canonical';

// ---------------------------------------------------------------------------
// The Setar class archive as the APP sees it.
//
// The app never parses a filename. A read-only scanner (scripts/scan-setar-
// classes.mjs) publishes a deterministic JSON index; everything here decodes
// that index, keeps the accepted graph, and answers questions about it.
//
// Pure: no React, no clock, no network. The decoder is a TRUST BOUNDARY — it
// refuses what it cannot vouch for rather than coercing it, because every
// identity downstream (which lesson, which piece, which file) is taken from
// this data verbatim.
// ---------------------------------------------------------------------------

export const INDEX_FORMAT = 'setar-archive-index';
export const INDEX_VERSION = 1;
/** The one archive this lane knows. Tar/Guitar do not share this grammar. */
export const SETAR_ARCHIVE_ID = 'setar-classes';

/** A published index larger than this is refused rather than parsed. */
export const MAX_INDEX_BYTES = 4 * 1024 * 1024;

// --- the published index ---------------------------------------------------

export interface SourcePiece {
  /** `canonical_fa` — the BYTE-EXACT join key. Never folded or transliterated. */
  key: string;
  form: string;
  piece: string;
  dastgah: string;
  composer: string;
  /** Literal historical spellings, for SEARCH only — never for identity. */
  aliases: string[];
  sessions: number[];
  notes: string;
  provisional?: boolean;
  mediumConfidence?: boolean;
  /** The source no longer describes this piece; its provenance is kept. */
  unavailable?: boolean;
}

export type SourceRole = string;
export type SourceKind = 'video' | 'score' | 'photo';

export interface SourceResource {
  /** Archive-RELATIVE path. Never an absolute URL: transport is per device. */
  path: string;
  role: SourceRole;
  kind: SourceKind;
  title: string;
  part?: number | null;
  size?: number;
  /** Canonical piece keys this resource is material for. Empty = lesson-level. */
  pieces: string[];
  /** Parts of ONE logical demonstration share a group. */
  group?: string | null;
  unavailable?: boolean;
}

export interface SourceMember {
  key: string;
  roles: SourceRole[];
}

export interface SourceSession {
  n: number;
  date: ISODate;
  folder: string;
  roster: string[];
  rosterTrusted: boolean;
  hasClassRecording: boolean;
  resources: SourceResource[];
  members: SourceMember[];
  unavailable?: boolean;
}

export interface SourceRename {
  from: string;
  to: string;
}

export interface SourceDiagnostic {
  path: string;
  reason: string;
}

export interface SourceIndex {
  format: typeof INDEX_FORMAT;
  version: number;
  archiveId: string;
  pieces: SourcePiece[];
  sessions: SourceSession[];
  renames: SourceRename[];
  diagnostics: SourceDiagnostic[];
  contentHash: string;
}

// --- what the database keeps ----------------------------------------------

/** An owner decision that a refresh, a reload and a sync must all respect. */
export interface SourceSuppression {
  /** `piece` / `session` / `resource` (a hidden file), `link` (item-to-lesson). */
  kind: 'piece' | 'session' | 'resource' | 'link';
  /** Piece key, session number, resource path, or `sessionN:pieceKey`. */
  ref: string;
  /** A resource hidden on ONE item only — never on its siblings. */
  itemId?: ID;
  at: ISODateTime;
}

/**
 * The last accepted source graph, persisted so material, provenance and the
 * next refresh all work offline. One row per archive; items and lessons carry
 * only a KEY into it, so a resource is never copied per item.
 */
export interface ArchiveSource {
  id: ID;
  instrumentId: ID;
  indexHash: string;
  acceptedAt: ISODateTime;
  pieces: SourcePiece[];
  sessions: SourceSession[];
  renames: SourceRename[];
  diagnostics: SourceDiagnostic[];
  suppressions: SourceSuppression[];
}

/** An item's binding to a canonical piece in an archive. */
export interface ItemSourceRef {
  archiveId: ID;
  pieceKey: string;
}

/** A lesson's binding to one archive session. */
export interface LessonSourceRef {
  archiveId: ID;
  sessionN: number;
}

// --- path safety -----------------------------------------------------------

/**
 * An archive path is a relative POSIX path of plain segments. Traversal,
 * absolute paths, backslashes, URL schemes, credentials and percent-encoded
 * separators are REFUSED, never sanitised: a rewritten path names a different
 * file, and this graph is an identity table.
 *
 * Deliberately a small copy of the scanner's own predicate rather than an
 * import — `scripts/` is a Node operator tool that must not be pulled into the
 * browser bundle, and this rule is eight lines.
 */
export function isSafeSourcePath(p: unknown): p is string {
  if (typeof p !== 'string' || !p) return false;
  if (p.length > 1024) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
  if (p.startsWith('/') || p.includes('\\')) return false;
  if (/%2f|%5c/i.test(p)) return false;
  if (p.includes('@')) return false; // no user:pass@host smuggled in
  return p.split('/').every((s) => s !== '' && s !== '.' && s !== '..');
}

// --- deterministic identity ------------------------------------------------

const NUL = String.fromCharCode(0);

/**
 * FNV-1a over the UTF-8 bytes, twice, for a stable 64-bit hex digest. Two
 * devices importing the same source must MINT THE SAME ID for the same logical
 * entity, or the next sync sees two records for one piece. A readable
 * `src:<archive>:piece:<farsi key>` would be equally deterministic but puts
 * Farsi into every route parameter; this keeps ids ASCII.
 */
function stableHash(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (const byte of bytes) {
    a = Math.imul(a ^ byte, 0x01000193) >>> 0;
    b = Math.imul(b ^ byte, 0x85ebca6b) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

/** Deterministic id for the item a canonical piece becomes. */
export function sourceItemId(archiveId: string, pieceKey: string): ID {
  return `src-${stableHash(`${archiveId}${NUL}piece${NUL}${pieceKey}`)}`;
}

/** Deterministic id for the historical lesson an archive session becomes. */
export function sourceLessonId(archiveId: string, sessionN: number): ID {
  return `src-${stableHash(`${archiveId}${NUL}session${NUL}${sessionN}`)}`;
}

/** Deterministic id for a resource reference minted from the graph. */
export function sourceResourceId(archiveId: string, path: string): ID {
  return `src-${stableHash(`${archiveId}${NUL}asset${NUL}${path}`)}`;
}

// --- decoding --------------------------------------------------------------

/** The fixed role vocabulary, byte-exact from the archive's own contract. */
export const SOURCE_ROLES: readonly string[] = [
  'ضبط-کلاس', // class recording
  'تمرین-من', // my practice
  'تصحیح', // corrected notation
  'تکلیف', // homework
  'جزوه', // handout
  'نمونه', // teacher demonstration
  'نت', // clean notation
];

/**
 * Plain-English names for the archive's own role words, for UI copy only.
 * The Farsi word stays the identity everywhere else — this is a LABEL map,
 * exactly like `ITEM_STATUS_LABELS`, and never a second vocabulary.
 */
export const SOURCE_ROLE_LABELS: Record<string, string> = {
  [SOURCE_ROLES[0]!]: 'class recording',
  [SOURCE_ROLES[1]!]: 'my practice',
  [SOURCE_ROLES[2]!]: 'teacher’s corrections',
  [SOURCE_ROLES[3]!]: 'homework',
  [SOURCE_ROLES[4]!]: 'handout',
  [SOURCE_ROLES[5]!]: 'teacher’s demonstration',
  [SOURCE_ROLES[6]!]: 'notation',
};

export const CLASS_ROLE = SOURCE_ROLES[0];
export const PERSONAL_ROLE = SOURCE_ROLES[1];
export const CORRECTION_ROLE = SOURCE_ROLES[2];
export const DEMO_ROLE = SOURCE_ROLES[5];
export const NOTATION_ROLE = SOURCE_ROLES[6];

const ROLE_SET = new Set<string>(SOURCE_ROLES);
const KIND_SET = new Set<string>(['video', 'score', 'photo']);
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, what: string): string {
  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
  return v;
}

function strList(v: unknown, what: string): string[] {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`${what} must be a list of text.`);
  return v as string[];
}

/**
 * ABSENT IS A DEFAULT; PRESENT-AND-WRONG IS A REFUSAL. Never a coercion.
 *
 * The decoder NORMALISES before `checkSourceGraph` runs, so the grammar only
 * ever sees what these produce — which is why `Array.isArray(x) ? x : []` was
 * not a tolerance but a silent erasure: a session whose `resources` arrived as
 * `null` decoded to a session with NO resources, passed the grammar (it is a
 * valid empty list by then) and turned six files into zero. The same held for
 * every scalar: `part: "3"` became `null`, a wrong-typed `size` vanished, and
 * `rosterTrusted: 'yes'` became a boolean the grammar was happy with.
 *
 * These three are that rule in one place, and they throw NAMING the record —
 * the same treatment `validatePracticeText` gives the owner's own words.
 */
function list(v: unknown, what: string): unknown[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error(`${what} must be a list.`);
  return v;
}

/**
 * OPTIONAL TEXT. `str(raw.form ?? '')` read ABSENT and PRESENT-AND-NULL as the
 * same thing and quietly produced `''` for both — the very normalisation the
 * list/num/bool rule above exists to stop, left in place for every string
 * field that has a default. A resource `title: null` became an untitled row
 * the grammar was perfectly happy with. Absent is a default; null is a value,
 * and a wrong one.
 */
function text(v: unknown, what: string): string {
  if (v === undefined) return '';
  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
  return v;
}

function num(v: unknown, what: string): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
  return v;
}

/** A number that is genuinely a number — no `null`, unlike an optional part. */
function size(v: unknown, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
  return v;
}

function bool(v: unknown, what: string, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  if (typeof v !== 'boolean') throw new Error(`${what} must be true or false.`);
  return v;
}

/** A real calendar day, not merely four-two-two digits ("2026-02-30" is not). */
export function isValidSourceDate(v: unknown): v is ISODate {
  if (typeof v !== 'string') return false;
  const m = DATE_RE.exec(v);
  if (!m) return false;
  const [, y, mo, d] = m;
  const t = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return t.getUTCFullYear() === Number(y) && t.getUTCMonth() === Number(mo) - 1 && t.getUTCDate() === Number(d);
}

/** A real calendar instant — the date-time sibling of {@link isValidSourceDate}. */
export function isValidSourceDateTime(v: unknown): v is ISODateTime {
  if (typeof v !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(v);
  if (!m) return false;
  if (!isValidSourceDate(v.slice(0, 10))) return false;
  return !Number.isNaN(Date.parse(v));
}

/**
 * Validate an unknown published index into a {@link SourceIndex}, or throw with
 * a message the owner can act on.
 *
 * A NEWER version is refused rather than read leniently: a future scanner may
 * mean something different by the same field, and this graph decides which
 * file is which piece.
 */
export function decodeSourceIndex(input: unknown): SourceIndex {
  if (!isRecord(input)) throw new Error('The source index is not a valid object.');
  if (input.format !== INDEX_FORMAT) throw new Error('That file is not a Setar archive index.');
  if (typeof input.version !== 'number' || !Number.isInteger(input.version)) {
    throw new Error('The source index has no usable version.');
  }
  if (input.version > INDEX_VERSION) {
    throw new Error(
      `This index was written by a newer scanner (version ${input.version}) than this app understands (version ${INDEX_VERSION}). Update the app.`,
    );
  }
  if (input.version < INDEX_VERSION) {
    throw new Error(`This index is from an older scanner (version ${input.version}). Re-run the scanner.`);
  }
  const archiveId = str(input.archiveId, 'The index archive id');
  if (!archiveId.trim()) throw new Error('The index archive id is empty.');
  if (typeof input.contentHash !== 'string' || !/^[0-9a-f]{64}$/.test(input.contentHash)) {
    throw new Error('The index carries no usable content hash.');
  }

  if (!Array.isArray(input.pieces)) throw new Error('The index has no piece registry.');
  if (!Array.isArray(input.sessions)) throw new Error('The index has no sessions.');

  const pieces: SourcePiece[] = [];
  const keys = new Set<string>();
  for (const raw of input.pieces) {
    if (!isRecord(raw)) throw new Error('A registry entry is not an object.');
    const key = str(raw.key, 'A registry entry key');
    if (!key.trim()) throw new Error('A registry entry has an empty canonical key.');
    if (keys.has(key)) throw new Error(`Two registry entries share the canonical key "${key}".`);
    keys.add(key);
    const sessions = list(raw.sessions, `Registry entry "${key}" sessions`);
    if (sessions.some((n) => typeof n !== 'number' || !Number.isInteger(n) || n < 1)) {
      throw new Error(`Registry entry "${key}" has an invalid session number.`);
    }
    pieces.push({
      key,
      form: text(raw.form, `Registry entry "${key}" form`),
      piece: text(raw.piece, `Registry entry "${key}" piece`),
      dastgah: text(raw.dastgah, `Registry entry "${key}" dastgah`),
      composer: text(raw.composer, `Registry entry "${key}" composer`),
      aliases: strList(raw.aliases, `Registry entry "${key}" aliases`),
      sessions: sessions as number[],
      notes: text(raw.notes, `Registry entry "${key}" notes`),
      ...(bool(raw.provisional, `Registry entry "${key}" provisional`, false) ? { provisional: true } : {}),
      ...(bool(raw.mediumConfidence, `Registry entry "${key}" confidence`, false) ? { mediumConfidence: true } : {}),
    });
  }

  const sessions: SourceSession[] = [];
  const seenN = new Set<number>();
  const seenPaths = new Set<string>();
  for (const raw of input.sessions) {
    if (!isRecord(raw)) throw new Error('A session entry is not an object.');
    const n = raw.n;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) throw new Error('A session has no usable number.');
    if (seenN.has(n)) throw new Error(`Two entries claim session ${n}.`);
    seenN.add(n);
    if (!isValidSourceDate(raw.date)) throw new Error(`Session ${n} has an unreadable date.`);
    const folder = str(raw.folder, `Session ${n} folder`);
    if (!isSafeSourcePath(folder)) throw new Error(`Session ${n} has an unsafe folder path.`);
    const roster = strList(raw.roster, `Session ${n} roster`);
    for (const k of roster) {
      if (!keys.has(k)) throw new Error(`Session ${n} lists piece "${k}", which is not in the registry.`);
    }
    const resources: SourceResource[] = [];
    for (const r of list(raw.resources, `Session ${n} resources`)) {
      if (!isRecord(r)) throw new Error(`Session ${n} has a resource that is not an object.`);
      const path = r.path;
      if (!isSafeSourcePath(path)) throw new Error(`Session ${n} has an unsafe resource path.`);
      if (seenPaths.has(path)) throw new Error(`Two resources share the path "${path}".`);
      seenPaths.add(path);
      const role = str(r.role, 'A resource role');
      if (!ROLE_SET.has(role)) throw new Error(`Resource "${path}" has an unknown role.`);
      const kind = str(r.kind, 'A resource kind');
      if (!KIND_SET.has(kind)) throw new Error(`Resource "${path}" has an unknown kind "${kind}".`);
      const forPieces = strList(r.pieces, `Resource "${path}" pieces`);
      for (const k of forPieces) {
        if (!keys.has(k)) throw new Error(`Resource "${path}" names piece "${k}", which is not in the registry.`);
      }
      resources.push({
        path,
        role,
        kind: kind as SourceKind,
        title: text(r.title, `Resource "${path}" title`),
        part: num(r.part, `Resource "${path}" part`),
        // `part` and `group` are genuinely nullable in the published format —
        // the scanner emits `null` for both — so null stays legal THERE and
        // nowhere else. `size` it always emits as a number, and a present null
        // is refused HERE rather than spread into the output as a value the
        // declared type does not admit and left for the grammar to catch.
        ...(r.size === undefined ? {} : { size: size(r.size, `Resource "${path}" size`) }),
        pieces: forPieces,
        group: r.group === undefined || r.group === null ? null : str(r.group, `Resource "${path}" group`),
      });
    }
    const members: SourceMember[] = [];
    for (const m of list(raw.members, `Session ${n} members`)) {
      if (!isRecord(m)) throw new Error(`Session ${n} has a membership that is not an object.`);
      const key = str(m.key, 'A membership key');
      if (!keys.has(key)) throw new Error(`Session ${n} claims piece "${key}", which is not in the registry.`);
      const roles = strList(m.roles, `Membership "${key}" roles`);
      for (const role of roles) if (!ROLE_SET.has(role)) throw new Error(`Membership "${key}" has an unknown role.`);
      members.push({ key, roles });
    }
    sessions.push({
      n,
      date: raw.date as ISODate,
      folder,
      roster,
      rosterTrusted: bool(raw.rosterTrusted, `Session ${n} roster trust`, true),
      hasClassRecording: bool(raw.hasClassRecording, `Session ${n} class recording`, false),
      resources,
      members,
    });
  }

  const renames: SourceRename[] = [];
  const froms = new Set<string>();
  for (const r of list(input.renames, 'The rename log')) {
    if (!isRecord(r)) throw new Error('A rename entry is not an object.');
    if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) throw new Error('A rename entry carries an unsafe path.');
    if (froms.has(r.from)) throw new Error(`The index maps "${r.from}" to more than one destination.`);
    froms.add(r.from);
    renames.push({ from: r.from, to: r.to });
  }

  const diagnostics: SourceDiagnostic[] = [];
  for (const d of list(input.diagnostics, 'The diagnostic list')) {
    if (!isRecord(d)) throw new Error('A diagnostic entry is not an object.');
    diagnostics.push({
      path: text(d.path, 'A diagnostic path'),
      reason: text(d.reason, 'A diagnostic reason'),
    });
  }

  // The decoder's own normalisation, held to the SAME grammar the persisted
  // graph is held to. Every field below has just been built here, so this can
  // only fail if the two ever drift — which is exactly what it exists to stop.
  const bad = checkSourceGraph({ pieces, sessions, renames, diagnostics }, 'The source index');
  if (bad) throw new Error(bad);

  return {
    format: INDEX_FORMAT,
    version: INDEX_VERSION,
    archiveId,
    pieces,
    sessions,
    renames,
    diagnostics,
    contentHash: input.contentHash,
  };
}

/**
 * The message a device that cannot hash anything gets, instead of a TypeError.
 *
 * Exported so the reader boundary and its test name ONE string rather than two
 * copies of a sentence that must stay identical.
 */
export const INSECURE_CONTEXT_REFUSAL =
  'This device opened the app over an insecure connection (plain http://), so the browser withholds the ' +
  'cryptography needed to verify the index against its own content hash. Open the app over https:// (or ' +
  'localhost) and refresh again. Nothing was changed.';

/**
 * WebCrypto EXISTS ONLY IN A SECURE CONTEXT, and this app can be opened outside
 * one — a build served from a LAN address over plain http:// is the ordinary way
 * an unmerged branch reaches a phone. There `globalThis.crypto` is present but
 * `crypto.subtle` is `undefined`, so `sha256Hex` threw
 * `Cannot read properties of undefined (reading 'digest')` — a stack trace about
 * a property, handed to the owner in place of the one fact they can act on.
 *
 * This is a precondition of the DEVICE, not a defect in the FILE, which is why
 * it is checked BEFORE the size/JSON/structure order below rather than folded
 * into it: a device that cannot compute a digest cannot verify ANY index, so
 * reporting the first thing that happens to be wrong with the file would send
 * the owner to fix a file that is fine. It is also why this refuses rather than
 * degrading to an unverified read — `contentHash` is the refresh identity, and
 * skipping it is how altered content gets reported "Already current".
 *
 * Deliberately NOT a fallback implementation: the hash is only one of this
 * app's secure-context dependencies (the service worker that makes it work
 * offline is another), so hashing without one would leave the app still broken
 * while implying plain http:// were supported.
 */
function requireDigest(): void {
  if (!globalThis.crypto?.subtle) throw new Error(INSECURE_CONTEXT_REFUSAL);
}

/**
 * The scanner's own digest, recomputed here: SHA-256 over the key-sorted JSON
 * of the SEMANTIC body — everything but `contentHash` and the clock-bearing
 * `generatedAt`. Byte-for-byte the definition in `scripts/scan-setar-classes.mjs`
 * (`contentHash` / `canonicalJson`), and `canonicalStringify` produces exactly
 * that serialisation for JSON-derived data.
 */
async function computeIndexDigest(parsed: Record<string, unknown>): Promise<string> {
  const body = { ...parsed };
  delete body.contentHash;
  delete body.generatedAt;
  return sha256Hex(canonicalStringify(body));
}

/**
 * Read published index TEXT: size, JSON, structure, and finally the DIGEST.
 *
 * `contentHash` is not a checksum the app may take on faith — it is the
 * REFRESH IDENTITY. `planArchiveImport` compares it against the hash already
 * accepted to decide that nothing has changed, so content altered in transit
 * (or in the repository) under a retained old hash would be reported "Already
 * current" and the changed facts silently ignored. Recomputing it here, at the
 * ONE boundary both the GitHub fetch and the file fallback pass through, makes
 * that fail closed instead.
 *
 * `decodeSourceIndex` stays synchronous and digest-free on purpose: it is the
 * STRUCTURAL decoder, and the digest is a transport-integrity concern. Tests
 * that build an index object in memory call it directly and have no transport.
 *
 * Order matters: size → parse → structure → digest, so a structurally broken
 * file reports the error the owner can act on rather than a hash mismatch. The
 * secure-context precondition sits ahead of all four, for the reason
 * `requireDigest` records: it is a fact about the DEVICE, and no file can pass
 * on a device that cannot hash.
 */
export async function parseSourceIndex(text: string): Promise<SourceIndex> {
  requireDigest();
  if (text.length > MAX_INDEX_BYTES) throw new Error('That index file is too large to be a Setar archive index.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const index = decodeSourceIndex(parsed);
  const actual = await computeIndexDigest(parsed as Record<string, unknown>);
  if (actual !== index.contentHash) {
    throw new Error(
      'This index does not match its own content hash — it was altered after the scanner wrote it. Nothing was changed.',
    );
  }
  return index;
}

// --- what counts as an UPCOMING class ---------------------------------------

/**
 * THE one predicate for "is this lesson still ahead of me". Every caller that
 * asks about the next class — the badges, the default question target, the
 * commitment deadline that reaches practice priority — goes through this.
 *
 * A lesson imported from a source archive is a record of a class that ALREADY
 * HAPPENED. Its date can still be in the future relative to this device's
 * clock (the archive runs to September 2026 and a device may be behind it, or
 * the owner may simply be importing early), and a plain `date >= today` then
 * turns thirty-nine pieces of history into thirty-nine deadlines: urgency on
 * items nobody committed to anything, and a question sheet defaulting to a
 * class that is over. `origin: 'archive'` is checked FIRST, before the date,
 * because no date can make history upcoming.
 */
export function isUpcomingLesson(lesson: { date: ISODate; origin?: string }, todayISO: ISODate): boolean {
  if (lesson.origin === 'archive') return false;
  return lesson.date >= todayISO;
}

// --- queries over the accepted graph ---------------------------------------

export function archiveFor(db: PracticeDB, archiveId: string): ArchiveSource | undefined {
  return db.archiveSources?.find((a) => a.id === archiveId);
}

function suppressed(source: ArchiveSource, kind: SourceSuppression['kind'], ref: string, itemId?: ID): boolean {
  return source.suppressions.some(
    (s) => s.kind === kind && s.ref === ref && (s.itemId === undefined || s.itemId === itemId),
  );
}

/** Sessions a canonical piece appears in, numerically ordered. */
export function sessionsForPiece(source: ArchiveSource, pieceKey: string): SourceSession[] {
  return source.sessions.filter((s) => s.members.some((m) => m.key === pieceKey)).sort((a, b) => a.n - b.n);
}

/**
 * Consecutive runs of sessions a piece was practised in. Six sessions in a row
 * is six CLASSES worth of provenance — never six weeks, and never practice
 * this app recorded.
 */
export function repeatChains(source: ArchiveSource, pieceKey: string): number[][] {
  // A REPEAT is the student having been asked to play the piece again: its own
  // practice recording, in consecutive sessions. Membership alone is the wrong
  // input — an unnamed demonstration gives every piece in its session
  // membership, so a chain read from membership would report a repeat nobody
  // was asked for.
  const ns = source.sessions
    .filter((s) => s.members.some((m) => m.key === pieceKey && m.roles.includes(PERSONAL_ROLE)))
    .sort((a, b) => a.n - b.n)
    .map((s) => s.n);
  const chains: number[][] = [];
  for (const n of ns) {
    const last = chains[chains.length - 1];
    if (last && last[last.length - 1] === n - 1) last.push(n);
    else chains.push([n]);
  }
  return chains.filter((c) => c.length > 1);
}

export interface ScopedResource extends SourceResource {
  sessionN: number;
  sessionDate: ISODate;
}

/**
 * Every archive resource that is USEFUL PRACTICE MATERIAL for one piece, in
 * session order. A class recording stays with its lesson, a resource the owner
 * hid on THIS item is dropped for this item only, and a suppressed session or
 * piece contributes nothing.
 */
export function resourcesForPiece(source: ArchiveSource, pieceKey: string, itemId?: ID): ScopedResource[] {
  if (suppressed(source, 'piece', pieceKey)) return [];
  const out: ScopedResource[] = [];
  for (const s of sessionsForPiece(source, pieceKey)) {
    if (suppressed(source, 'session', String(s.n))) continue;
    for (const r of s.resources) {
      if (!r.pieces.includes(pieceKey)) continue;
      if (suppressed(source, 'resource', r.path, itemId)) continue;
      out.push({ ...r, sessionN: s.n, sessionDate: s.date });
    }
  }
  return out;
}

/** Everything an archive session contributes to its own lesson, in role order. */
export function resourcesForSession(source: ArchiveSource, sessionN: number): SourceResource[] {
  const s = source.sessions.find((x) => x.n === sessionN);
  if (!s || suppressed(source, 'session', String(sessionN))) return [];
  return s.resources.filter((r) => !suppressed(source, 'resource', r.path));
}

/** Turn a graph resource into the app's ordinary NAS reference shape. */
export function resourceReference(archiveId: string, r: SourceResource, date?: ISODate): LessonRecording {
  return {
    id: sourceResourceId(archiveId, r.path),
    title: r.title,
    path: r.path,
    kind: r.kind === 'video' ? 'video' : r.kind === 'score' ? 'pdf' : 'doc',
    ...(date ? { date } : {}),
    ...(r.size ? { sizeBytes: r.size } : {}),
    createdAt: '1970-01-01T00:00:00.000Z',
  };
}

// --- the graph's own grammar, in ONE place ---------------------------------

/**
 * THE grammar of a source graph — every nested field, one definition.
 *
 * `decodeSourceIndex` and `validateArchiveSources` used to state this
 * separately, and the second stated LESS of it: it checked a resource's path
 * and its part group and then walked straight past `members[].roles`,
 * `piece.aliases`, a resource's `kind`, `title` and `pieces`, a session's
 * `folder` and `roster`, and the rename and diagnostic rows entirely. A
 * database carrying `members[0].roles: null` was therefore accepted and
 * PERSISTED by every inbound door, and the first production reader to touch it
 * — `repeatChains`, doing `m.roles.includes(...)` — threw while rendering
 * material. `planArchiveImport` had the same exposure through
 * `new Set([piece.key, ...piece.aliases])`, which throws on a non-iterable.
 *
 * Both callers run THIS function now, so the decoder and the persisted-graph
 * validator cannot drift apart again: a reader may dereference any field this
 * grammar admits, and nothing else can reach the database.
 *
 * `unavailable` stays legal on a piece, a session and a resource — a file gone
 * from the NAS with its provenance kept is a VALID state, not a broken graph.
 */
function checkSourceGraph(
  graph: { pieces: unknown; sessions: unknown; renames?: unknown; diagnostics?: unknown },
  label: string,
): string | null {
  const text = (v: unknown) => typeof v === 'string';
  const textList = (v: unknown) => Array.isArray(v) && v.every(text);
  const flag = (v: unknown) => v === undefined || typeof v === 'boolean';

  if (!Array.isArray(graph.pieces)) return `${label} has no piece registry.`;
  if (!Array.isArray(graph.sessions)) return `${label} has no sessions.`;

  const keys = new Set<string>();
  for (const raw of graph.pieces) {
    if (!isRecord(raw)) return `${label} has a registry entry that is not an object.`;
    const p = raw as Partial<SourcePiece>;
    if (typeof p.key !== 'string' || !p.key) return `${label} has a piece with no canonical key.`;
    if (keys.has(p.key)) return `${label} has two pieces keyed "${p.key}".`;
    keys.add(p.key);
    for (const field of ['form', 'piece', 'dastgah', 'composer', 'notes'] as const) {
      if (!text(p[field])) return `Piece "${p.key}" has an unreadable ${field}.`;
    }
    // SEARCH data, read as `[...piece.aliases]` by the reconciler: a value
    // that is not a list of text takes the whole refresh down with a TypeError.
    if (!textList(p.aliases)) return `Piece "${p.key}" has an unreadable alias list.`;
    if (!Array.isArray(p.sessions) || p.sessions.some((n) => !Number.isInteger(n) || (n as number) < 1)) {
      return `Piece "${p.key}" has an invalid session number.`;
    }
    if (!flag(p.provisional) || !flag(p.mediumConfidence) || !flag(p.unavailable)) {
      return `Piece "${p.key}" has an unreadable flag.`;
    }
  }

  const ns = new Set<number>();
  const paths = new Set<string>();
  for (const raw of graph.sessions) {
    if (!isRecord(raw)) return `${label} has a session entry that is not an object.`;
    const sess = raw as Partial<SourceSession>;
    if (typeof sess.n !== 'number' || !Number.isInteger(sess.n) || sess.n < 1) {
      return `${label} has a session with no number.`;
    }
    if (ns.has(sess.n)) return `${label} has two entries for session ${sess.n}.`;
    ns.add(sess.n);
    if (!isValidSourceDate(sess.date)) return `${label} session ${sess.n} has an unreadable date.`;
    if (!isSafeSourcePath(sess.folder)) return `${label} session ${sess.n} has an unsafe folder path.`;
    if (!textList(sess.roster)) return `${label} session ${sess.n} has an unreadable roster.`;
    for (const k of sess.roster as string[]) {
      if (!keys.has(k)) return `${label} session ${sess.n} lists piece "${k}", which it does not describe.`;
    }
    if (typeof sess.rosterTrusted !== 'boolean' || typeof sess.hasClassRecording !== 'boolean' || !flag(sess.unavailable)) {
      return `${label} session ${sess.n} has an unreadable flag.`;
    }

    if (!Array.isArray(sess.resources)) return `${label} session ${sess.n} has no resource list.`;
    for (const rawRes of sess.resources) {
      if (!isRecord(rawRes)) return `${label} session ${sess.n} has a resource that is not an object.`;
      const r = rawRes as Partial<SourceResource>;
      if (!isSafeSourcePath(r.path)) return `${label} has an unsafe resource path.`;
      if (paths.has(r.path)) return `${label} lists "${r.path}" twice.`;
      paths.add(r.path);
      if (typeof r.role !== 'string' || !ROLE_SET.has(r.role)) return `Resource "${r.path}" has an unknown role.`;
      if (typeof r.kind !== 'string' || !KIND_SET.has(r.kind)) return `Resource "${r.path}" has an unknown kind.`;
      if (!text(r.title)) return `Resource "${r.path}" has an unreadable title.`;
      if (!(r.part === null || r.part === undefined || typeof r.part === 'number')) {
        return `Resource "${r.path}" has an unreadable part number.`;
      }
      if (!(r.size === undefined || typeof r.size === 'number')) return `Resource "${r.path}" has an unreadable size.`;
      if (!textList(r.pieces)) return `Resource "${r.path}" has an unreadable piece list.`;
      for (const k of r.pieces as string[]) {
        if (!keys.has(k)) return `Resource "${r.path}" names piece "${k}", which this source does not describe.`;
      }
      // A demonstration's parts form ONE group; anything but a plain label
      // here would let a part claim membership of an arbitrary structure.
      if (!(r.group === null || r.group === undefined || typeof r.group === 'string')) {
        return `Resource "${r.path}" has an invalid part group.`;
      }
      if (!flag(r.unavailable)) return `Resource "${r.path}" has an unreadable flag.`;
    }

    if (!Array.isArray(sess.members)) return `${label} session ${sess.n} has no membership list.`;
    for (const rawMember of sess.members) {
      if (!isRecord(rawMember)) return `${label} session ${sess.n} has a membership that is not an object.`;
      const m = rawMember as Partial<SourceMember>;
      if (typeof m.key !== 'string' || !keys.has(m.key)) {
        return `${label} session ${sess.n} claims an unknown piece.`;
      }
      // `repeatChains` reads `roles.includes(...)` on every one of these.
      if (!textList(m.roles)) return `${label} session ${sess.n} gives piece "${m.key}" an unreadable role list.`;
      for (const role of m.roles as string[]) {
        if (!ROLE_SET.has(role)) return `${label} session ${sess.n} gives piece "${m.key}" an unknown role.`;
      }
    }

    // --- SEMANTIC RELATIONS, not merely field types ------------------------
    //
    // A field-type grammar says every value is READABLE; it says nothing about
    // whether the graph agrees with itself. A resource physically sitting in
    // class 2's folder, listed under class 1, is type-perfect and attributes
    // someone else's file to the wrong lesson on every screen that reads it —
    // and an arbitrary `group` on a non-demonstration invents a logical
    // resource out of unrelated files.
    //
    // Scoped to what the source still DESCRIBES. `unavailable` is retained
    // provenance about what it has STOPPED describing — a piece dropped from
    // the registry, a file deleted from the NAS — so holding those rows to the
    // current source's internal agreement is a category error, and would make
    // every refresh after a removal refuse at every door.
    if (!sess.unavailable) {
      const live = (sess.resources as SourceResource[]).filter((r) => !r.unavailable);
      const rolesFor = new Map<string, Set<string>>();
      for (const m of sess.members as SourceMember[]) rolesFor.set(m.key, new Set(m.roles));
      const groups = new Map<string, SourceResource[]>();
      let classRecordings = 0;
      for (const r of live) {
        const segs = r.path.split('/');
        if (segs.length !== 2 || segs[0] !== sess.folder) {
          return `${label} session ${sess.n} lists "${r.path}", which is not a file in its own folder.`;
        }
        if (r.role === CLASS_ROLE) {
          classRecordings += 1;
          if (r.pieces.length > 0) return `Resource "${r.path}" is a class recording and cannot name a piece.`;
        }
        for (const k of r.pieces) {
          if (!rolesFor.get(k)?.has(r.role)) {
            return `${label} session ${sess.n} gives "${r.path}" to piece "${k}" without recording that membership.`;
          }
        }
        if (r.group !== null && r.group !== undefined) {
          if (r.role !== DEMO_ROLE) return `Resource "${r.path}" carries a part group but is not a demonstration.`;
          groups.set(r.group, [...(groups.get(r.group) ?? []), r]);
        }
      }
      if (classRecordings > 0 !== sess.hasClassRecording) {
        return `${label} session ${sess.n} disagrees with itself about having a class recording.`;
      }
      // Parts of ONE demonstration: the same material, told in order. Parts
      // that are material for different pieces are not one resource, and two
      // parts with one number have no order to be read in.
      for (const [g, parts] of groups) {
        const pieces = [...parts[0]!.pieces].sort().join(NUL);
        const numbers = new Set<number | null>();
        for (const r of parts) {
          if ([...r.pieces].sort().join(NUL) !== pieces) {
            return `${label} session ${sess.n} has a part group "${g}" whose parts belong to different pieces.`;
          }
          const part = r.part ?? null;
          if (numbers.has(part)) return `${label} session ${sess.n} has two parts numbered alike in "${g}".`;
          numbers.add(part);
        }
      }
    }
  }

  if (graph.renames !== undefined) {
    if (!Array.isArray(graph.renames)) return `${label} has an unreadable rename log.`;
    const froms = new Set<string>();
    for (const rawRename of graph.renames) {
      if (!isRecord(rawRename)) return `${label} has a rename entry that is not an object.`;
      const r = rawRename as Partial<SourceRename>;
      if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) return `${label} has a rename with an unsafe path.`;
      if (froms.has(r.from)) return `${label} maps "${r.from}" to more than one destination.`;
      froms.add(r.from);
    }
  }

  if (graph.diagnostics !== undefined) {
    if (!Array.isArray(graph.diagnostics)) return `${label} has an unreadable diagnostic list.`;
    for (const rawDiag of graph.diagnostics) {
      if (!isRecord(rawDiag)) return `${label} has a diagnostic entry that is not an object.`;
      const d = rawDiag as Partial<SourceDiagnostic>;
      if (!text(d.path) || !text(d.reason)) return `${label} has an unreadable diagnostic entry.`;
    }
  }

  return null;
}

// --- inbound validation (C7) -----------------------------------------------

/**
 * The v14 graph, checked at EVERY inbound door through `validateDB`. Invalid
 * structure is REFUSED with the record named, never coerced or dropped: a
 * binding that points at nothing is a claim about which file is which piece,
 * and silently discarding it loses the owner's own reconciliation decisions.
 *
 * A source entity marked `unavailable` is a VALID state (the file is gone from
 * the NAS, its provenance is kept) — not a dangling reference.
 */
export function validateArchiveSources(db: PracticeDB): string | null {
  const sources = db.archiveSources ?? [];
  const ids = new Set<string>();
  const instrumentIds = new Set(db.instruments.map((i) => i.id));
  const byId = new Map<string, ArchiveSource>();

  for (const s of sources) {
    if (typeof s?.id !== 'string' || !s.id.trim()) return 'An archive source has no id.';
    if (ids.has(s.id)) return `Two archive sources share the id "${s.id}".`;
    ids.add(s.id);
    byId.set(s.id, s);
    if (typeof s.instrumentId !== 'string' || !instrumentIds.has(s.instrumentId)) {
      return `Archive source "${s.id}" is bound to an instrument that does not exist.`;
    }
    if (typeof s.indexHash !== 'string') return `Archive source "${s.id}" has no index hash.`;
    // THE RECORD'S OWN FIELDS, not merely its nested graph. `acceptedAt` is
    // read back by Settings (`acceptedAt.slice(0, 16)`) to say when the index
    // last changed, so a non-string here crashes the screen that renders it —
    // and the fix belongs at this door, never as a guard in the component.
    // Checked for REAL validity for the same reason `askedAt` is: a shape
    // regex matches "2026-02-30T12:00:00.000Z" and `Date.parse` silently
    // normalises it into March. Deliberately a local check beside
    // `isValidSourceDate` rather than an import — this file's own pattern.
    if (!isValidSourceDateTime(s.acceptedAt)) return `Archive source "${s.id}" has an unreadable accepted time.`;
    if (!Array.isArray(s.pieces) || !Array.isArray(s.sessions)) return `Archive source "${s.id}" is missing its graph.`;
    // Required AT REST, where `checkSourceGraph` tolerates them absent: the
    // decoder always emits both, and `planArchiveImport` reads
    // `index.renames`/`source.renames` unguarded.
    if (!Array.isArray(s.renames)) return `Archive source "${s.id}" has no rename log.`;
    if (!Array.isArray(s.diagnostics)) return `Archive source "${s.id}" has no diagnostic list.`;
    if (!Array.isArray(s.suppressions)) return `Archive source "${s.id}" has no suppression list.`;

    // THE WHOLE NESTED GRAPH, through the one grammar the decoder also uses.
    const bad = checkSourceGraph(s, `Archive source "${s.id}"`);
    if (bad) return bad;

    for (const sup of s.suppressions) {
      if (!['piece', 'session', 'resource', 'link'].includes(sup?.kind)) {
        return `Archive source "${s.id}" has a suppression of an unknown kind.`;
      }
      if (typeof sup.ref !== 'string' || !sup.ref) return `Archive source "${s.id}" has a suppression with no target.`;
      // An owner decision carries the id it was scoped to and the moment it
      // was taken; both are read back — a resource hidden on ONE item is
      // decided by comparing `itemId`, so a non-string silently widens it.
      if (!(sup.itemId === undefined || (typeof sup.itemId === 'string' && sup.itemId !== ''))) {
        return `Archive source "${s.id}" has a suppression with an unreadable item.`;
      }
      // `at` is provenance only — nothing reads it back as a date — so it is
      // held to being real text and no further.
      if (typeof sup.at !== 'string' || !sup.at) return `Archive source "${s.id}" has a suppression with no timestamp.`;
    }
  }

  // Bindings: exactly one live record per source identity, resolving to a real
  // entity of the right instrument.
  const itemBindings = new Set<string>();
  for (const item of db.items) {
    const ref = item.source;
    if (!ref) continue;
    if (typeof ref.archiveId !== 'string' || typeof ref.pieceKey !== 'string') {
      return `Item "${item.title}" has an unreadable archive binding.`;
    }
    const source = byId.get(ref.archiveId);
    if (!source) return `Item "${item.title}" is bound to archive "${ref.archiveId}", which is not present.`;
    if (!source.pieces.some((p) => p.key === ref.pieceKey)) {
      return `Item "${item.title}" is bound to piece "${ref.pieceKey}", which archive "${ref.archiveId}" does not describe.`;
    }
    if (item.instrumentId !== source.instrumentId) {
      return `Item "${item.title}" is bound to archive "${ref.archiveId}" but belongs to another instrument.`;
    }
    const k = `${ref.archiveId}${NUL}${ref.pieceKey}`;
    if (itemBindings.has(k)) return `Two items are bound to piece "${ref.pieceKey}".`;
    itemBindings.add(k);
  }

  const lessonBindings = new Set<string>();
  for (const lesson of db.lessons) {
    const ref = lesson.source;
    if (!ref) continue;
    if (typeof ref.archiveId !== 'string' || typeof ref.sessionN !== 'number') {
      return 'A lesson has an unreadable archive binding.';
    }
    const source = byId.get(ref.archiveId);
    if (!source) return `A lesson is bound to archive "${ref.archiveId}", which is not present.`;
    if (!source.sessions.some((s) => s.n === ref.sessionN)) {
      return `A lesson is bound to session ${ref.sessionN}, which archive "${ref.archiveId}" does not describe.`;
    }
    if (lesson.instrumentId !== source.instrumentId) {
      return `A lesson is bound to archive "${ref.archiveId}" but belongs to another instrument.`;
    }
    const k = `${ref.archiveId}${NUL}${ref.sessionN}`;
    if (lessonBindings.has(k)) return `Two lessons are bound to session ${ref.sessionN}.`;
    lessonBindings.add(k);
  }

  // Manual item references: the same path rules as every other NAS reference.
  for (const item of db.items) {
    for (const r of item.references ?? []) {
      if (typeof r?.path !== 'string' || !r.path.trim()) return `Item "${item.title}" has a reference with no path.`;
      if (!/^https?:\/\//i.test(r.path) && !isSafeSourcePath(r.path)) {
        return `Item "${item.title}" has an unsafe reference path.`;
      }
    }
  }
  return null;
}

/**
 * The canonical pieces an archive session is associated with, honouring an
 * owner's explicit unlink of ONE piece from ONE class.
 *
 * Derived from the graph, never stored on the lesson: a session's membership
 * is a source fact, and copying it into `lesson.itemIds` would make one fact
 * two that can disagree.
 */
export function membersForSession(source: ArchiveSource, sessionN: number): SourceMember[] {
  const s = source.sessions.find((x) => x.n === sessionN);
  if (!s || suppressed(source, 'session', String(sessionN))) return [];
  return s.members.filter((m) => !suppressed(source, 'link', `${sessionN}:${m.key}`));
}
