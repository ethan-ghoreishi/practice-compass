import type { ID, ISODate, ISODateTime, LessonRecording, PracticeDB } from './types';

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

/** A real calendar day, not merely four-two-two digits ("2026-02-30" is not). */
export function isValidSourceDate(v: unknown): v is ISODate {
  if (typeof v !== 'string') return false;
  const m = DATE_RE.exec(v);
  if (!m) return false;
  const [, y, mo, d] = m;
  const t = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return t.getUTCFullYear() === Number(y) && t.getUTCMonth() === Number(mo) - 1 && t.getUTCDate() === Number(d);
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
    const sessions = Array.isArray(raw.sessions) ? raw.sessions : [];
    if (sessions.some((n) => typeof n !== 'number' || !Number.isInteger(n) || n < 1)) {
      throw new Error(`Registry entry "${key}" has an invalid session number.`);
    }
    pieces.push({
      key,
      form: str(raw.form ?? '', 'form'),
      piece: str(raw.piece ?? '', 'piece'),
      dastgah: str(raw.dastgah ?? '', 'dastgah'),
      composer: str(raw.composer ?? '', 'composer'),
      aliases: strList(raw.aliases, `Registry entry "${key}" aliases`),
      sessions: sessions as number[],
      notes: str(raw.notes ?? '', 'notes'),
      ...(raw.provisional ? { provisional: true } : {}),
      ...(raw.mediumConfidence ? { mediumConfidence: true } : {}),
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
    for (const r of Array.isArray(raw.resources) ? raw.resources : []) {
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
        title: str(r.title ?? '', 'A resource title'),
        part: typeof r.part === 'number' ? r.part : null,
        ...(typeof r.size === 'number' ? { size: r.size } : {}),
        pieces: forPieces,
        group: typeof r.group === 'string' ? r.group : null,
      });
    }
    const members: SourceMember[] = [];
    for (const m of Array.isArray(raw.members) ? raw.members : []) {
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
      rosterTrusted: raw.rosterTrusted !== false,
      hasClassRecording: raw.hasClassRecording === true,
      resources,
      members,
    });
  }

  const renames: SourceRename[] = [];
  const froms = new Set<string>();
  for (const r of Array.isArray(input.renames) ? input.renames : []) {
    if (!isRecord(r)) throw new Error('A rename entry is not an object.');
    if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) throw new Error('A rename entry carries an unsafe path.');
    if (froms.has(r.from)) throw new Error(`The index maps "${r.from}" to more than one destination.`);
    froms.add(r.from);
    renames.push({ from: r.from, to: r.to });
  }

  const diagnostics: SourceDiagnostic[] = [];
  for (const d of Array.isArray(input.diagnostics) ? input.diagnostics : []) {
    if (!isRecord(d)) throw new Error('A diagnostic entry is not an object.');
    diagnostics.push({
      path: str(d.path ?? '', 'A diagnostic path'),
      reason: str(d.reason ?? '', 'A diagnostic reason'),
    });
  }

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

/** Parse and decode published index TEXT, refusing anything oversized. */
export function parseSourceIndex(text: string): SourceIndex {
  if (text.length > MAX_INDEX_BYTES) throw new Error('That index file is too large to be a Setar archive index.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  return decodeSourceIndex(parsed);
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
    if (!Array.isArray(s.pieces) || !Array.isArray(s.sessions)) return `Archive source "${s.id}" is missing its graph.`;
    if (!Array.isArray(s.suppressions)) return `Archive source "${s.id}" has no suppression list.`;

    const keys = new Set<string>();
    for (const p of s.pieces) {
      if (typeof p?.key !== 'string' || !p.key) return `Archive source "${s.id}" has a piece with no canonical key.`;
      if (keys.has(p.key)) return `Archive source "${s.id}" has two pieces keyed "${p.key}".`;
      keys.add(p.key);
    }
    const ns = new Set<number>();
    const paths = new Set<string>();
    for (const sess of s.sessions) {
      if (typeof sess?.n !== 'number' || !Number.isInteger(sess.n)) {
        return `Archive source "${s.id}" has a session with no number.`;
      }
      if (ns.has(sess.n)) return `Archive source "${s.id}" has two entries for session ${sess.n}.`;
      ns.add(sess.n);
      if (!isValidSourceDate(sess.date)) return `Archive source "${s.id}" session ${sess.n} has an unreadable date.`;
      for (const r of sess.resources ?? []) {
        if (!isSafeSourcePath(r?.path)) return `Archive source "${s.id}" has an unsafe resource path.`;
        if (paths.has(r.path)) return `Archive source "${s.id}" lists "${r.path}" twice.`;
        paths.add(r.path);
        for (const k of r.pieces ?? []) {
          if (!keys.has(k)) return `Resource "${r.path}" names piece "${k}", which this source does not describe.`;
        }
        // A demonstration's parts form ONE group; anything but a plain label
        // here would let a part claim membership of an arbitrary structure.
        if (r.group !== null && r.group !== undefined && typeof r.group !== 'string') {
          return `Resource "${r.path}" has an invalid part group.`;
        }
      }
      for (const m of sess.members ?? []) {
        if (!keys.has(m?.key)) return `Archive source "${s.id}" session ${sess.n} claims an unknown piece.`;
      }
    }
    for (const sup of s.suppressions) {
      if (!['piece', 'session', 'resource', 'link'].includes(sup?.kind)) {
        return `Archive source "${s.id}" has a suppression of an unknown kind.`;
      }
      if (typeof sup.ref !== 'string' || !sup.ref) return `Archive source "${s.id}" has a suppression with no target.`;
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
