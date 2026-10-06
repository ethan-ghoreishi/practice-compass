#!/usr/bin/env node
// Scan the normalised Setar class archive into a deterministic JSON index.
//
//   node scripts/scan-setar-classes.mjs --root <archive> --out <file>
//   node scripts/scan-setar-classes.mjs --root <archive>          # stdout
//   node scripts/scan-setar-classes.mjs --root <archive> --attention   # owner report, stdout only
//
// READ-ONLY over the archive: nothing is written, renamed or deleted inside
// `--root`, and the output must live outside it. Node stdlib only — the app's
// dependencies are not available to an operator running this on a NAS.
//
// The app never parses a filename: it consumes the published index. That is
// the whole reason this grammar lives here once rather than twice.
//
// Source contract: <ARCHIVE_ROOT>/CRAWLER-BRIEF.md.

import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, readdirSync, lstatSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const ARCHIVE_ID = 'setar-classes';
export const INDEX_FORMAT = 'setar-archive-index';
export const INDEX_VERSION = 1;

/**
 * Roles are NOT single hyphen-tokens — "ضبط-کلاس" and "تمرین-من" each contain
 * one — so a role is matched as a LONGEST prefix at a hyphen boundary, never
 * by splitting the stem on "-" and taking token 0 (which yields "تمرین" for
 * تمرین-من-عراق.mp4).
 */
export const ROLES = ['ضبط-کلاس', 'تمرین-من', 'تصحیح', 'تکلیف', 'جزوه', 'نمونه', 'نت'];

/** The student's own recordings: real evidence of work, never useful material. */
export const PERSONAL_ROLE = 'تمرین-من';
/** The teacher's demonstration. See §4 of the brief — its attribution is special. */
export const DEMO_ROLE = 'نمونه';
/** The whole class recording. Attaches to the SESSION; never carries a piece. */
export const CLASS_ROLE = 'ضبط-کلاس';

const KIND_BY_EXT = { '.mp4': 'video', '.pdf': 'score', '.jpg': 'photo' };

/** NAS housekeeping and dotfiles are never archive content. */
const IGNORED_DIRS = new Set(['@eaDir', '#recycle']);

// Bounds. A runaway mount or a wrong --root must fail loudly, not be indexed.
const MAX_FILES = 5000;
const MAX_CSV_BYTES = 4 * 1024 * 1024;

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/**
 * Quoting-aware CSV reader. The registry's `notes` column carries commas and
 * doubled quotes inside quoted fields, so splitting on "," loses rows and
 * silently shifts every column after it.
 *
 * Malformed quoting (a quoted field that never closes, or a stray quote after
 * a closing one) THROWS — a half-read registry is an ambiguous identity table,
 * which is exactly what this lane may not guess at.
 */
export function parseCsv(text) {
  return parseCsvCells(text).map((r) => r.values);
}

/**
 * The same reader, keeping each cell's RAW text beside its value — quoting and
 * all — so a draft amending ONE cell of an existing registry row can leave
 * every other cell exactly as the owner wrote it.
 */
export function parseCsvCells(text) {
  const rows = [];
  let row = [];
  let raws = [];
  let field = '';
  let quoted = false;
  let started = false; // this field opened with a quote
  let i = 0;
  let fieldStart = 0;
  const src = text.replace(/^﻿/, '');

  const endField = () => {
    row.push(field);
    raws.push(src.slice(fieldStart, i).replace(/\r$/, ''));
    field = '';
    started = false;
    fieldStart = i + 1;
  };
  const endRow = () => {
    endField();
    rows.push({ values: row, raws });
    row = [];
    raws = [];
  };

  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      if (field !== '' || started) throw new Error(`Malformed CSV: unexpected quote at offset ${i}.`);
      quoted = true;
      started = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      endField();
      i += 1;
      continue;
    }
    if (c === '\r') {
      i += 1;
      continue;
    }
    if (c === '\n') {
      endRow();
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (quoted) throw new Error('Malformed CSV: a quoted field is never closed.');
  if (field !== '' || row.length > 0) endRow();
  return rows.filter((r) => r.values.length > 1 || r.values[0] !== '');
}

/** One CSV cell, quoted only when it has to be — the inverse of the reader above. */
export function csvCell(value) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Rows as objects, checked against the exact headers a caller requires. */
export function readTable(text, requiredHeaders) {
  if (text.length > MAX_CSV_BYTES) throw new Error('CSV is larger than this scanner accepts.');
  const rows = parseCsv(text);
  if (rows.length === 0) throw new Error('CSV is empty.');
  const header = rows[0].map((h) => h.trim());
  for (const h of requiredHeaders) {
    if (!header.includes(h)) throw new Error(`CSV is missing the "${h}" column.`);
  }
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

// ---------------------------------------------------------------------------
// PIECES.csv — the canonical registry
// ---------------------------------------------------------------------------

const REGISTRY_HEADERS = ['canonical_fa', 'form', 'piece', 'dastgah', 'composer', 'aliases_seen', 'sessions', 'notes'];

/**
 * `canonical_fa` is the BYTE-EXACT join key: it is the `<piece>` segment of
 * every filename, unchanged. Nothing here folds spellings, transliterates or
 * normalises it — `aliases_seen` is literal SEARCH data and is never consulted
 * for identity.
 */
export function parseRegistry(text) {
  const rows = readTable(text, REGISTRY_HEADERS);
  const pieces = [];
  const seen = new Set();
  for (const r of rows) {
    const key = r.canonical_fa;
    if (!key || !key.trim()) throw new Error('Registry has a row with an empty canonical_fa.');
    if (seen.has(key)) throw new Error(`Registry has two rows for the canonical piece "${key}".`);
    seen.add(key);
    const sessions = [];
    for (const raw of r.sessions.split(',')) {
      const s = raw.trim();
      if (!s) continue;
      if (!/^\d+$/.test(s)) throw new Error(`Registry row "${key}" has an invalid session number "${s}".`);
      const n = Number(s);
      if (n < 1) throw new Error(`Registry row "${key}" has an invalid session number "${s}".`);
      if (!sessions.includes(n)) sessions.push(n);
    }
    sessions.sort((a, b) => a - b);
    const notes = r.notes ?? '';
    pieces.push({
      key,
      form: r.form ?? '',
      piece: r.piece ?? '',
      dastgah: r.dastgah ?? '',
      composer: r.composer ?? '',
      // The OPTIONAL `source` column, verbatim: the material this piece is
      // declared to be studied FROM. A registry without the column says
      // nothing (no key at all, so an old-shaped registry publishes a
      // byte-identical index); an empty cell is an explicit "none declared".
      // Provenance only — never a kind, a stage or an identity.
      ...(r.source !== undefined ? { studySource: r.source } : {}),
      aliases: r.aliases_seen ? r.aliases_seen.split('|').map((a) => a.trim()).filter(Boolean) : [],
      sessions,
      notes,
      // Caveats are SOURCE evidence, surfaced as flags — never a licence to
      // invent a category or to merge one piece into another.
      provisional: /PROVISIONAL/.test(notes),
      mediumConfidence: /MEDIUM confidence/i.test(notes),
    });
  }
  pieces.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return pieces;
}

// ---------------------------------------------------------------------------
// Filenames and folders
// ---------------------------------------------------------------------------

/** "session-12-06-08-2024" → { n: 12, date: "2024-08-06" }, else null. */
export function parseSessionFolderName(name) {
  const m = /^session-(\d+)-(\d{2})-(\d{2})-(\d{4})$/.exec(name);
  if (!m) return null;
  const [, n, dd, mm, yyyy] = m;
  // Round-trip through Date.UTC: /^\d{2}$/ happily matches "30-02-2024".
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (
    d.getUTCFullYear() !== Number(yyyy) ||
    d.getUTCMonth() !== Number(mm) - 1 ||
    d.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  return { n: Number(n), date: `${yyyy}-${mm}-${dd}` };
}

/** File extension, lowercased, including the dot ("" when there is none). */
export function fileExt(name) {
  const i = name.lastIndexOf('.');
  return i <= 0 ? '' : name.slice(i).toLowerCase();
}

/**
 * `<role>-<canonical_piece>[-<n>]` — the exact algorithm from §2 of the brief.
 * Returns null when no role matches: an unparseable file is SURFACED, never
 * guessed at.
 */
export function parseAssetStem(stem) {
  let role = null;
  for (const r of ROLES) {
    if (stem === r || stem.startsWith(`${r}-`)) {
      if (!role || r.length > role.length) role = r;
    }
  }
  if (!role) return null;
  const rest = stem.slice(role.length).replace(/^-+/, '');
  // A TRAILING "-<digits>" is always a part number: no canonical piece name
  // ends in a digit, so this cannot eat one. An EMBEDDED digit
  // (تمرین-دشتی-1-علیزاده) is piece identity and stays.
  let piece = null;
  let part = null;
  const trailing = /^(.*?)-(\d+)$/.exec(rest);
  if (trailing) {
    piece = trailing[1] || null;
    part = Number(trailing[2]);
  } else if (/^\d+$/.test(rest)) {
    part = Number(rest);
  } else {
    piece = rest || null;
  }
  return { role, piece, part };
}

/** Display title: the stem with "-"/"_" as spaces. Never used as identity. */
export function displayTitle(stem) {
  return stem.replace(/[-_]+/g, ' ').trim();
}

/**
 * A path is only ever an archive-relative POSIX path of plain segments.
 * Traversal, absolute paths, backslashes, URL schemes and percent-encoded
 * separators are refused rather than sanitised — a rewritten path is a
 * DIFFERENT file, and this index is an identity table.
 */
export function isSafeRelativePath(p) {
  if (typeof p !== 'string' || !p) return false;
  if (p.length > 1024) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false; // http:, file:, data:…
  if (p.startsWith('/') || p.includes('\\')) return false;
  if (/%2f|%5c/i.test(p)) return false;
  const segs = p.split('/');
  return segs.every((s) => s !== '' && s !== '.' && s !== '..');
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Build the semantic index from the registry text and a flat inventory of
 * `{ path, size }` entries (archive-relative). PURE and clock-free: the same
 * inventory in any order, with any mtimes, produces byte-identical output.
 *
 * Throws only for input that makes the whole index untrustworthy (a malformed
 * or ambiguous registry, a duplicate identity, an unsafe path, too many
 * files). Individual unhandled FILES are reported in `diagnostics` and left
 * out — surfaced for the owner, never relabelled.
 */
export function buildIndex({ registryText, inventory, renameLog, skipped = [] }) {
  const pieces = parseRegistry(registryText);
  const byKey = new Map(pieces.map((p) => [p.key, p]));

  if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);

  const diagnostics = [];
  const diag = (path, reason) => diagnostics.push({ path, reason });
  // Everything the WALK could not take in. A symlink is not followed and a
  // device node is not a file, but dropping either in silence publishes an
  // index that is quietly narrower than the archive — the same "partial view
  // sold as complete" this scanner's two-read check exists to refuse.
  for (const s of skipped) diag(s.path, s.reason);

  // --- sessions -----------------------------------------------------------
  const sessions = new Map(); // n -> { n, date, folder, assets: [] }
  const seenPaths = new Set();
  for (const entry of inventory) {
    const path = entry.path;
    if (!isSafeRelativePath(path)) throw new Error(`Refusing an unsafe archive path: ${JSON.stringify(path)}`);
    if (seenPaths.has(path)) throw new Error(`Two inventory entries share the path "${path}".`);
    seenPaths.add(path);

    const segs = path.split('/');
    if (segs.length !== 2) {
      diag(path, 'Outside a session folder — not indexed.');
      continue;
    }
    const [folder, name] = segs;
    const parsed = parseSessionFolderName(folder);
    if (!parsed) {
      diag(path, 'Not in a session-N-DD-MM-YYYY folder — not indexed.');
      continue;
    }
    const existing = sessions.get(parsed.n);
    if (existing && existing.folder !== folder) {
      throw new Error(`Two folders claim session ${parsed.n}: "${existing.folder}" and "${folder}".`);
    }
    const session = existing ?? { n: parsed.n, date: parsed.date, folder, assets: [], named: new Set() };
    sessions.set(parsed.n, session);

    const ext = fileExt(name);
    const kind = KIND_BY_EXT[ext];
    const stem = ext ? name.slice(0, -ext.length) : name;
    const parsedName = parseAssetStem(stem);
    if (!parsedName) {
      diag(path, 'Filename carries no known role — left for the owner to name or move.');
      continue;
    }
    // EVERY piece a filename names is evidence about this class — recorded
    // BEFORE a file is dropped for its type or for an unregistered key. The
    // roster check below used to see only the files that SURVIVED those
    // filters, so an unregistered score vanished first and the unnamed
    // demonstration beside it was spread across a roster the folder plainly
    // disagrees with.
    if (parsedName.piece) session.named.add(parsedName.piece);
    if (!kind) {
      diag(path, `Unsupported file type "${ext || '(none)'}" — not indexed. Save it as .mp4, .pdf or .jpg to include it.`);
      continue;
    }
    if (parsedName.piece && !byKey.has(parsedName.piece)) {
      diag(
        path,
        `Piece "${parsedName.piece}" is not in the registry — not indexed. If it is a new piece, declare it in PIECES.csv (the scanner's --attention report drafts the row).`,
      );
      continue;
    }
    if (parsedName.piece && parsedName.role === CLASS_ROLE) {
      diag(path, 'A class recording covers the whole lesson and cannot name a piece.');
      continue;
    }
    session.assets.push({
      path,
      role: parsedName.role,
      piece: parsedName.piece,
      part: parsedName.part,
      kind,
      title: displayTitle(stem),
      size: entry.size ?? 0,
    });
  }

  const ordered = [...sessions.values()].sort((a, b) => a.n - b.n);

  // --- attribution --------------------------------------------------------
  const out = [];
  for (const s of ordered) {
    s.assets.sort((a, b) => cmp(a.role, b.role) || cmp(a.piece ?? '', b.piece ?? '') || (a.part ?? 0) - (b.part ?? 0) || cmp(a.path, b.path));

    // The ROSTER is the registry's own answer to "which pieces were assigned
    // at class N" — never a set inferred from the filenames present.
    const roster = pieces.filter((p) => p.sessions.includes(s.n)).map((p) => p.key);
    // Every NAMED piece, registered or not (see the inventory loop above).
    const strays = [...s.named].filter((k) => !roster.includes(k)).sort(cmp);
    // A named piece the roster does not claim means the two halves of the
    // source disagree. An unnamed demo expands across the roster, so expanding
    // it here would spread a guess: block that one inference and say so.
    const rosterTrusted = strays.length === 0;
    for (const k of strays) {
      // An unregistered key already has its own per-file reason; this one is
      // about the ROSTER, and only a registered piece can be added to it.
      if (byKey.has(k)) {
        diag(
          `${s.folder}`,
          `Piece "${k}" appears in this folder but the registry does not list session ${s.n} for it. Add ${s.n} to its sessions in PIECES.csv only if it was taught in this class.`,
        );
      }
    }

    const resources = [];
    const memberships = new Map(); // pieceKey -> Set(role)
    const member = (key, role) => {
      if (!memberships.has(key)) memberships.set(key, new Set());
      memberships.get(key).add(role);
    };

    for (const a of s.assets) {
      if (a.piece) member(a.piece, a.role);
      // The student's own playing is EVIDENCE, not material: its membership
      // and role survive, the individual file does not.
      if (a.role === PERSONAL_ROLE) continue;
      const pieces_ =
        a.role === DEMO_ROLE && !a.piece
          ? rosterTrusted
            ? roster
            : []
          : a.piece
            ? [a.piece]
            : [];
      if (a.role === DEMO_ROLE && !a.piece && !rosterTrusted) {
        diag(
          a.path,
          `Unnamed demonstration not attributed: session ${s.n}'s roster disagrees with its filenames (${strays
            .map((k) => `"${k}"`)
            .join(', ')} named here, not listed for session ${s.n}). It stays with the lesson until PIECES.csv declares who this class taught.`,
        );
      } else if (a.role === DEMO_ROLE && !a.piece && roster.length === 0) {
        diag(
          a.path,
          `Unnamed demonstration not attributed: PIECES.csv lists no pieces for session ${s.n}. It stays with the lesson until a confirmed roster is declared there.`,
        );
      }
      for (const k of pieces_) member(k, a.role);
      resources.push({
        path: a.path,
        role: a.role,
        kind: a.kind,
        title: a.title,
        part: a.part,
        size: a.size,
        // A class recording, an unnamed handout and an unattributed demo stay
        // with the LESSON. Only a resource that names its pieces is scoped.
        pieces: a.role === CLASS_ROLE ? [] : pieces_,
        // Parts of one demonstration are ONE logical resource, ordered by part.
        group: a.role === DEMO_ROLE ? `${DEMO_ROLE}:${a.piece ?? ''}` : null,
      });
    }

    out.push({
      n: s.n,
      date: s.date,
      folder: s.folder,
      roster,
      rosterTrusted,
      hasClassRecording: s.assets.some((a) => a.role === CLASS_ROLE),
      resources: resources.sort((a, b) => cmp(a.role, b.role) || cmp(a.group ?? '', b.group ?? '') || (a.part ?? 0) - (b.part ?? 0) || cmp(a.path, b.path)),
      members: [...memberships.entries()]
        .map(([key, roles]) => ({ key, roles: [...roles].sort(cmp) }))
        .sort((a, b) => cmp(a.key, b.key)),
    });
  }

  // --- rename provenance --------------------------------------------------
  // EXACT old→new pairs only. This is path provenance, not a similarity model.
  //
  // ONE RULE, NOT TWO MECHANISMS: a path publishes a replacement name only
  // when this log determines it UNIQUELY and TERMINALLY. A source named with
  // two destinations does not say which file it became; a chain that walks
  // into a loop — or into such a source — cannot say either. Every one of
  // those publishes NOTHING and is diagnosed instead. The conflict case used
  // to publish the FIRST destination and diagnose the second as "not
  // applied", which is exactly backwards: the mapping the log cannot support
  // was handed to the app as exact identity, and the app then repaired an
  // authored reference onto it and re-keyed an owner's hide onto it.
  let renames = [];
  // ABSENT is a source fact; UNREADABLE never reaches here (readSource throws).
  // A present-but-empty log has no header and `readTable` says so, exactly as
  // it would for PIECES.csv — a zero-byte file is what a copy in flight looks
  // like, and guessing "no renames" from it is the failure this lane closed.
  if (renameLog && renameLog.present) {
    const rows = readTable(renameLog.text, ['old_path', 'new_path']);
    const dest = new Map();
    const forks = new Map(); // from → every destination the log names for it
    for (const r of rows) {
      const from = r.old_path.trim();
      const to = r.new_path.trim();
      if (!from || !to) continue;
      if (!isSafeRelativePath(from) || !isSafeRelativePath(to)) {
        diag(from, 'Rename row carries an unsafe path — ignored.');
        continue;
      }
      const prior = dest.get(from);
      if (prior !== undefined && prior !== to) {
        forks.set(from, (forks.get(from) ?? new Set([prior])).add(to));
        continue;
      }
      dest.set(from, to);
    }
    // A conflicted source stops being a mapping BEFORE anything walks the
    // graph: left in `dest`, its first destination would still be published,
    // and a chain ending there would publish a name on its strength too.
    for (const from of forks.keys()) dest.delete(from);

    // Each path is judged by ITS OWN walk, so the verdict does not depend on
    // the order rows arrived in — `diagnostics` is inside `contentHash`, and
    // ac-4's claim is that a shuffled source yields the same semantic index.
    const unresolvable = new Map();
    for (const from of dest.keys()) {
      const seen = new Set([from]);
      let cur = from;
      let loops = false;
      while (dest.has(cur)) {
        const next = dest.get(cur);
        if (seen.has(next)) {
          loops = true;
          break;
        }
        seen.add(next);
        cur = next;
      }
      if (loops) {
        unresolvable.set(from, 'Rename log loops through this path — no replacement name can be read from it.');
      } else if (forks.has(cur)) {
        unresolvable.set(
          from,
          `Rename log renames this path into "${cur}", which it names more than one destination for — no replacement name can be read from it.`,
        );
      }
    }
    for (const [from, reason] of unresolvable) {
      dest.delete(from);
      diag(from, reason);
    }
    for (const [from, tos] of forks) {
      const named = [...tos].sort(cmp).map((t) => `"${t}"`).join(' and ');
      diag(from, `Rename log names more than one destination for this path (${named}) — no replacement name can be read from it.`);
    }
    renames = [...dest].map(([from, to]) => ({ from, to })).sort((a, b) => cmp(a.from, b.from));
  }

  const body = {
    format: INDEX_FORMAT,
    version: INDEX_VERSION,
    archiveId: ARCHIVE_ID,
    pieces,
    sessions: out,
    renames,
    diagnostics: diagnostics.sort((a, b) => cmp(a.path, b.path) || cmp(a.reason, b.reason)),
  };
  return { ...body, contentHash: contentHash(body) };
}

/** Stable digest of the SEMANTIC body — no clock, no mtimes, no ordering luck. */
export function contentHash(body) {
  const { contentHash: _ignored, generatedAt: _also, ...rest } = body;
  return createHash('sha256').update(canonicalJson(rest)).digest('hex');
}

/** Key-sorted JSON, so an object-literal reordering cannot change the hash. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

// ---------------------------------------------------------------------------
// Filesystem (the only impure part)
// ---------------------------------------------------------------------------

/**
 * Inventory the archive: one pass, session folders only, dotfiles and NAS
 * housekeeping skipped, symlinks never followed (a link out of the archive is
 * a path this scanner has no authority over). Read-only by construction —
 * nothing here opens a file for writing.
 */
export function scanArchive(root) {
  const base = resolve(root);
  const inventory = [];
  const skipped = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
    if (!parseSessionFolderName(entry.name)) continue; // root folders out of scope
    if (!entry.isDirectory()) {
      // It CLAIMS to be a session and this walk will not open it. Silence here
      // would drop a whole class out of a "complete" index.
      skipped.push({ path: entry.name, reason: 'A session folder that is not a real directory — not scanned.' });
      continue;
    }
    const dir = join(base, entry.name);
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.name.startsWith('.') || IGNORED_DIRS.has(f.name)) continue;
      const full = join(dir, f.name);
      const st = lstatSync(full);
      const path = `${entry.name}/${f.name}`;
      if (st.isSymbolicLink()) {
        // Never FOLLOWED — a link out of the archive is a path this scanner
        // has no authority over — but always SAID, so the owner can see that
        // the index is not describing something the folder holds.
        skipped.push({ path, reason: 'A symbolic link — not followed, so this file is not indexed.' });
        continue;
      }
      if (!st.isFile()) {
        skipped.push({ path, reason: 'Not a regular file — not indexed.' });
        continue;
      }
      if (!full.startsWith(base + sep)) continue;
      // `mtimeMs` is deliberately NOT semantic — `buildIndex` reads `size` and
      // nothing else, so an altered time cannot change the published index. It
      // is here for the two-read comparison below: a file edited IN PLACE at
      // the same byte length is otherwise invisible to it.
      inventory.push({ path, size: st.size, mtimeMs: st.mtimeMs });
      if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);
    }
  }
  inventory.sort((a, b) => cmp(a.path, b.path));
  skipped.sort((a, b) => cmp(a.path, b.path) || cmp(a.reason, b.reason));
  return { inventory, skipped };
}

/**
 * May `--out` be written? Only if it is this scanner's OWN output, outside the
 * archive it describes. Checked before the source is read and again inside the
 * writer. Returns the target, addressed through its parent's REAL path.
 *
 * - The parent must exist; nothing here creates a folder.
 * - Real paths, NFC-normalised, decide "inside the archive" — never the text
 *   typed: a symlinked parent, a case-variant name (`realpathSync.native`
 *   canonicalises case on macOS) and an NFD/NFC spelling all reach the same
 *   folder on this setup.
 * - An existing output must be a regular file, not a link, holding a Setar
 *   index. Anything else is somebody else's file and is never replaced.
 */
export function checkOutput(outPath, root) {
  const out = resolve(outPath);
  let parent;
  try {
    parent = realpathSync.native(dirname(out));
  } catch {
    throw new Error(`Refusing --out ${out}: its folder does not exist, and this scanner creates none.`);
  }
  if (!statSync(parent).isDirectory()) throw new Error(`Refusing --out ${out}: its parent is not a folder.`);
  const target = join(parent, basename(out));
  if (root !== undefined) {
    let archive;
    try {
      archive = realpathSync.native(resolve(root)).normalize('NFC');
    } catch {
      throw new Error(`Refusing --out ${out}: --root ${root} cannot be resolved.`);
    }
    const t = target.normalize('NFC');
    if (t === archive || t.startsWith(archive + sep)) throw new Error('Refusing to write the index inside the archive it describes.');
  }
  let st;
  try {
    st = lstatSync(target);
  } catch (err) {
    if (err?.code === 'ENOENT') return target;
    throw new Error(`Refusing --out ${out}: it cannot be read (${err?.code}).`);
  }
  if (!st.isFile()) throw new Error(`Refusing --out ${out}: it is not a regular file (a link is never written through).`);
  let format;
  try {
    format = JSON.parse(readFileSync(target, 'utf8'))?.format;
  } catch {
    format = undefined;
  }
  if (format !== INDEX_FORMAT) throw new Error(`Refusing --out ${out}: it exists and is not an index this scanner wrote.`);
  return target;
}

/**
 * Atomically REPLACE this scanner's own output: an exclusively created (`wx`)
 * temp beside it, renamed onto it. The rename replaces the entry, so a hard
 * link's other name keeps its old bytes. A temp left by a failure is left —
 * this scanner never deletes.
 */
export function writeIndexAtomically(outPath, text, root) {
  const target = checkOutput(outPath, root);
  const tmp = join(dirname(target), `.${basename(target)}.tmp-${process.pid}-${randomBytes(4).toString('hex')}`);
  writeFileSync(tmp, text, { flag: 'wx' });
  renameSync(tmp, target);
  return target;
}

/**
 * EVERY input this scanner reads, in one place — so "read it twice and compare"
 * below covers all of them by construction, including one added later.
 */
export function readSource(base) {
  const registryText = readRequired(join(base, 'PIECES.csv'), 'PIECES.csv');
  const renameLog = readOptional(join(base, 'RENAME-LOG.csv'), 'RENAME-LOG.csv');
  const { inventory, skipped } = scanArchive(base);
  return { registryText, renameLog, inventory, skipped };
}

/** A required input. Any failure to read it is a failure to scan. */
function readRequired(path, label) {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`Could not read ${label}: ${err?.code ?? err?.message ?? 'unreadable'}.`);
  }
}

/**
 * AN OPTIONAL INPUT IS ABSENT OR PRESENT — NEVER "EMPTY BECAUSE IT THREW".
 *
 * `catch { text = '' }` made every failure to read RENAME-LOG.csv — a
 * permission change, an I/O error, a mount that went away mid-copy — look
 * exactly like an archive that has no rename log. Both readings then agreed
 * with each other, so the consistency check below passed and the scan
 * published an index with no renames at all: a file that moved during that
 * window is flagged unavailable and its saved references can never be
 * repaired. Only ENOENT is an observation; everything else is a failure.
 */
function readOptional(path, label) {
  try {
    return { present: true, text: readFileSync(path, 'utf8') };
  } catch (err) {
    if (err?.code === 'ENOENT') return { present: false };
    throw new Error(`Could not read ${label}: ${err?.code ?? err?.message ?? 'unreadable'}.`);
  }
}

/**
 * Read the archive and build its index — from ONE consistent view, or none.
 *
 * The registry used to be the only input re-read after the walk, which made
 * the guarantee exactly as narrow as the file it named: the MEDIA is what a
 * non-atomic NAS copy actually perturbs. Move a resource out before its folder
 * is enumerated and put it back while later folders are walked, and PIECES.csv
 * never changes — the scan publishes an index missing that file, and the next
 * Refresh marks still-present material unavailable. The rename log had the
 * same exposure, read once and never checked.
 *
 * So the whole source is read TWICE and the two readings compared. `size` is
 * part of the comparison, so a file still being copied is caught too.
 *
 * This is a CONSISTENCY check, not atomicity: a perturbation that is stable
 * across both readings agrees with itself and is indistinguishable, from here,
 * from the archive genuinely being in that state. What it removes is the
 * transient, which is what a copy in flight actually looks like.
 */
export function scanToIndex(root) {
  return buildIndex(readStableSource(root));
}

/**
 * The ONE consistent reading both the index and the attention report are built
 * from. `reread` exists only so a test can stand in a SECOND reading that
 * differs — nothing in a synchronous process can change a disk between two.
 */
export function readStableSource(root, reread) {
  const base = resolve(root);
  const before = readSource(base);
  const after = reread ? reread(base) : readSource(base);
  if (canonicalJson(before) !== canonicalJson(after)) {
    throw new Error('The archive changed during the scan; no index was produced.');
  }
  return before;
}

// ---------------------------------------------------------------------------
// --attention: what needs the OWNER, and the smallest safe step for each
// ---------------------------------------------------------------------------
//
// An operator aid over the SAME reading and the SAME grammar as the index —
// never a second scanner, an importer, a ledger or a registry editor. It
// prints to stdout and writes nothing anywhere: every draft in it is
// UNCONFIRMED, because a filename is evidence of what a file is called, not of
// which piece it is, who taught it or what it means musically. The owner
// confirms an identity and edits PIECES.csv / RENAME-LOG.csv themselves; the
// ordinary NAS job then publishes, and the app's Refresh imports.

/** The report as data. `formatAttention` is its only rendering. */
export function attentionReport(source) {
  const index = buildIndex(source);
  const table = parseCsvCells(source.registryText);
  const header = table[0].values.map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const byKey = new Map(index.pieces.map((p) => [p.key, p]));

  // What the filenames NAME, by the index's own grammar — candidates only.
  const observed = new Map(); // key -> { sessions: Map<n, Set<role>>, files: [] }
  for (const entry of source.inventory) {
    const segs = entry.path.split('/');
    if (segs.length !== 2) continue;
    const folder = parseSessionFolderName(segs[0]);
    if (!folder) continue;
    const ext = fileExt(segs[1]);
    const parsed = parseAssetStem(ext ? segs[1].slice(0, -ext.length) : segs[1]);
    if (!parsed?.piece) continue;
    const o = observed.get(parsed.piece) ?? { sessions: new Map(), files: [] };
    if (!o.sessions.has(folder.n)) o.sessions.set(folder.n, new Set());
    o.sessions.get(folder.n).add(parsed.role);
    o.files.push(entry.path);
    observed.set(parsed.piece, o);
  }
  const seenIn = (o) =>
    [...o.sessions.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([n, roles]) => ({ session: n, roles: [...roles].sort(cmp) }));

  const newIdentities = [...observed.entries()]
    .filter(([key]) => !byKey.has(key))
    .sort((a, b) => cmp(a[0], b[0]))
    .map(([key, o]) => ({
      key,
      seen: seenIn(o),
      files: [...o.files].sort(cmp),
      // Against the registry's ACTUAL header, in its order: the identity and
      // nothing else. No form, dastgah, composer, source or session is read
      // off a filename.
      draft: header.map((h) => (h === 'canonical_fa' ? csvCell(key) : '')).join(','),
    }));

  const rosterCandidates = [];
  for (const [key, o] of [...observed.entries()].sort((a, b) => cmp(a[0], b[0]))) {
    const piece = byKey.get(key);
    if (!piece) continue;
    const missing = [...o.sessions.keys()].filter((n) => !piece.sessions.includes(n)).sort((a, b) => a - b);
    if (!missing.length) continue;
    const row = table.slice(1).find((r) => r.values[col('canonical_fa')] === key);
    const current = row.values[col('sessions')].trim();
    const raws = [...row.raws];
    // ONE cell changes; every other cell keeps the exact text it had.
    raws[col('sessions')] = csvCell(current ? `${current},${missing.join(',')}` : missing.join(','));
    rosterCandidates.push({ key, missing, files: o.files.filter((f) => missing.includes(parseSessionFolderName(f.split('/')[0]).n)).sort(cmp), draft: raws.join(',') });
  }

  const unattributedDemos = [];
  for (const s of index.sessions) {
    for (const r of s.resources) {
      if (r.role !== DEMO_ROLE || r.group !== `${DEMO_ROLE}:` || r.pieces.length) continue;
      unattributedDemos.push({
        session: s.n,
        path: r.path,
        roster: s.roster,
        why: s.rosterTrusted ? 'empty' : 'inconsistent',
      });
    }
  }

  // Rename evidence: where the log says a file ENDED UP, and that name is not
  // on disk. The files in the same folder that no row names are shown beside
  // them — never paired with them. Which became which is the owner's to say.
  const onDisk = new Set(source.inventory.map((e) => e.path));
  const renameGaps = [];
  const logHeader = [];
  if (source.renameLog?.present) {
    const rows = parseCsvCells(source.renameLog.text);
    logHeader.push(...rows[0].values.map((h) => h.trim()));
    const pairs = readTable(source.renameLog.text, ['old_path', 'new_path'])
      .map((r) => ({ from: r.old_path.trim(), to: r.new_path.trim() }))
      .filter((r) => r.from && r.to);
    const froms = new Set(pairs.map((p) => p.from));
    const destinations = new Set(pairs.map((p) => p.to));
    const ends = new Map();
    for (const p of pairs) {
      if (froms.has(p.to) || onDisk.has(p.to)) continue;
      ends.set(p.to, [...(ends.get(p.to) ?? []), p.from]);
    }
    const byFolder = new Map();
    for (const [end, from] of ends) {
      const folder = end.split('/')[0];
      const name = end.split('/').pop();
      const ext = fileExt(name);
      const personal = parseAssetStem(ext ? name.slice(0, -ext.length) : name)?.role === PERSONAL_ROLE;
      byFolder.set(folder, [...(byFolder.get(folder) ?? []), { path: end, from: [...from].sort(cmp), personal }]);
    }
    const sessionOf = (folder) => parseSessionFolderName(folder)?.n ?? Number.MAX_SAFE_INTEGER;
    for (const [folder, missing] of [...byFolder.entries()].sort((a, b) => sessionOf(a[0]) - sessionOf(b[0]) || cmp(a[0], b[0]))) {
      renameGaps.push({
        folder,
        missing: missing.sort((a, b) => cmp(a.path, b.path)),
        unlogged: [...onDisk].filter((p) => p.startsWith(`${folder}/`) && !destinations.has(p) && !froms.has(p)).sort(cmp),
      });
    }
  }

  // Everything else the index already explains, minus what the sections above
  // say better.
  const covered = new Set([...newIdentities.flatMap((n) => n.files), ...unattributedDemos.map((d) => d.path)]);
  const other = index.diagnostics.filter(
    (d) => !covered.has(d.path) && !/registry does not list session/.test(d.reason),
  );

  return {
    contentHash: index.contentHash,
    sessions: index.sessions.length,
    pieces: index.pieces.length,
    diagnostics: index.diagnostics.length,
    registryHeader: header,
    logHeader,
    newIdentities,
    rosterCandidates,
    unattributedDemos,
    renameGaps,
    other,
  };
}

/** The report as the owner reads it. Archive-relative paths only — never a root. */
export function formatAttention(r) {
  const out = [];
  const line = (s = '') => out.push(s);
  line('Setar archive — attention report. READ-ONLY: nothing was written, renamed or published.');
  line(`An ordinary scan of this archive would publish index ${r.contentHash.slice(0, 12)} (${r.sessions} sessions, ${r.pieces} pieces, ${r.diagnostics} needing attention).`);
  line('After the NAS job runs, Refresh in the app shows the hash it accepted: the same hash means it already has this state.');
  line('Every draft below is UNCONFIRMED. Nothing in it is read from a filename except the name itself.');
  line();

  line(`1. Pieces named by files but missing from PIECES.csv: ${r.newIdentities.length}`);
  for (const n of r.newIdentities) {
    line(`   ${n.key}`);
    line(`     seen: ${n.seen.map((s) => `session ${s.session} (${s.roles.join(', ')})`).join('; ')}`);
    for (const f of n.files) line(`       ${f}`);
    line('     why it is not imported: PIECES.csv is the identity table, and an unregistered name is never guessed into a piece.');
    line('     to import it: confirm this exact spelling IS the piece (it becomes canonical_fa byte for byte), then add one row.');
    line(`     UNCONFIRMED draft row for the header ${r.registryHeader.join(',')}:`);
    line(`       ${n.draft}`);
    line('     Musical fields may stay empty. Put a session number in `sessions` only if that class taught it.');
  }
  line();

  line(`2. Unnamed demonstrations kept with their lesson: ${r.unattributedDemos.length}`);
  for (const d of r.unattributedDemos) {
    line(`   ${d.path}`);
    line(
      d.why === 'empty'
        ? `     PIECES.csv lists no pieces for session ${d.session}, so the demonstration stays with the class.`
        : `     PIECES.csv lists ${d.roster.length ? d.roster.join(', ') : 'no pieces'} for session ${d.session}, but files in that folder name other pieces, so the roster cannot be trusted for it.`,
    );
    line(`     to attribute it: add ${d.session} to \`sessions\` for exactly the pieces you can confirm this class taught. A named file needs no such entry.`);
  }
  line();

  line(`3. Registered pieces named in a class their row does not list: ${r.rosterCandidates.length}`);
  for (const c of r.rosterCandidates) {
    line(`   ${c.key} — named in session ${c.missing.join(', ')}`);
    for (const f of c.files) line(`       ${f}`);
    line('     Its named files are imported already. Only if it was TAUGHT in that class, its row becomes (UNCONFIRMED; every other cell unchanged):');
    line(`       ${c.draft}`);
  }
  line();

  line(`4. Rename-log names that are not on disk: ${r.renameGaps.reduce((n, g) => n + g.missing.length, 0)}`);
  for (const g of r.renameGaps) {
    line(`   ${g.folder}`);
    line('     the log says these files ended up here, but no such file exists:');
    for (const m of g.missing) {
      line(`       ${m.path}   (logged from ${m.from.join(', ')}${m.personal ? '; your own take — never material' : ''})`);
    }
    line(g.unlogged.length ? '     files in that folder that no log row names:' : '     every file in that folder is already named by the log.');
    for (const u of g.unlogged) line(`       ${u}`);
    line('     If a missing name was renamed to one of these, append ONE exact row per file to RENAME-LOG.csv:');
    // One cell per header COLUMN, by name — a reordered or extended log keeps old and new in their own columns.
    const logCols = r.logHeader.includes('old_path') && r.logHeader.includes('new_path') ? r.logHeader : ['old_path', 'new_path'];
    line(`       ${logCols.join(',')}`);
    line(`       ${logCols.map((h) => (h === 'old_path' ? '<the missing path>' : h === 'new_path' ? '<its current path>' : '')).join(',')}`);
    line('     Only you know which became which: nothing here pairs them by number, size or similarity. Unpaired, the old name stays "not described".');
  }
  line();

  line(`5. Other files and rows needing attention: ${r.other.length}`);
  for (const d of r.other) line(`   ${d.path} — ${d.reason}`);
  line();
  line('Edit PIECES.csv and RENAME-LOG.csv yourself, let the existing NAS job publish, then Refresh in the app.');
  return `${out.join('\n')}\n`;
}

function main() {
  let values;
  try {
    ({ values } = parseArgs({ options: { root: { type: 'string' }, out: { type: 'string' }, attention: { type: 'boolean' } } }));
  } catch (err) {
    console.error(err.message);
    values = {};
  }
  if (!values.root) {
    console.error('Usage: scan-setar-classes.mjs --root <archive> [--out <file> | --attention]');
    process.exit(2);
  }
  if (values.attention) {
    // A REPORT, never an output file: refused before anything is read.
    if (values.out) {
      console.error('--attention prints to stdout only and never writes a file; remove --out. Nothing was read or written.');
      process.exit(2);
    }
    let report;
    try {
      report = attentionReport(readStableSource(values.root));
    } catch (err) {
      console.error(`Scan failed: ${err.message}`);
      console.error('No report was produced, and nothing was written.');
      process.exit(1);
    }
    process.stdout.write(formatAttention(report));
    return;
  }
  if (values.out) {
    try {
      checkOutput(values.out, values.root);
    } catch (err) {
      console.error(err.message);
      console.error('Nothing was scanned or written.');
      process.exit(1);
    }
  }
  let index;
  try {
    index = scanToIndex(values.root);
  } catch (err) {
    console.error(`Scan failed: ${err.message}`);
    console.error('The last published index is left exactly as it is.');
    process.exit(1);
  }
  const text = `${JSON.stringify(index, null, 2)}\n`;
  if (values.out) {
    let written;
    try {
      written = writeIndexAtomically(values.out, text, values.root);
    } catch (err) {
      console.error(err.message);
      console.error('Nothing was written.');
      process.exit(1);
    }
    const files = index.sessions.reduce((n, s) => n + s.resources.length, 0);
    console.error(`${index.sessions.length} sessions, ${index.pieces.length} pieces, ${files} useful resources, ${index.diagnostics.length} needing attention.`);
    console.error(`Wrote ${written} (${index.contentHash.slice(0, 12)}).`);
  } else {
    process.stdout.write(text);
  }
}

/** By REAL path: run through a symlinked folder (DSM's /var/services/…), this must still run. */
function isDirectRun() {
  try {
    return realpathSync.native(process.argv[1]) === realpathSync.native(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isDirectRun()) main();
