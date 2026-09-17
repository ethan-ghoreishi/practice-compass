#!/usr/bin/env node
// Scan the normalised Setar class archive into a deterministic JSON index.
//
//   node scripts/scan-setar-classes.mjs --root <archive> --out <file>
//   node scripts/scan-setar-classes.mjs --root <archive>          # stdout
//
// READ-ONLY over the archive: nothing is written, renamed or deleted inside
// `--root`, and the output must live outside it. Node stdlib only — the app's
// dependencies are not available to an operator running this on a NAS.
//
// The app never parses a filename: it consumes the published index. That is
// the whole reason this grammar lives here once rather than twice.
//
// Source contract: <ARCHIVE_ROOT>/CRAWLER-BRIEF.md.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, readdirSync, lstatSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
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
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let started = false; // this field opened with a quote
  let i = 0;
  const src = text.replace(/^﻿/, '');

  const endField = () => {
    row.push(field);
    field = '';
    started = false;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
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
  return rows.filter((r) => r.length > 1 || r[0] !== '');
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
export function buildIndex({ registryText, inventory, renameLogText }) {
  const pieces = parseRegistry(registryText);
  const byKey = new Map(pieces.map((p) => [p.key, p]));

  if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);

  const diagnostics = [];
  const diag = (path, reason) => diagnostics.push({ path, reason });

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
    const session = existing ?? { n: parsed.n, date: parsed.date, folder, assets: [] };
    sessions.set(parsed.n, session);

    const ext = fileExt(name);
    const kind = KIND_BY_EXT[ext];
    const stem = ext ? name.slice(0, -ext.length) : name;
    const parsedName = parseAssetStem(stem);
    if (!parsedName) {
      diag(path, 'Filename carries no known role — left for the owner to name or move.');
      continue;
    }
    if (!kind) {
      diag(path, `Unsupported file type "${ext || '(none)'}" — not indexed.`);
      continue;
    }
    if (parsedName.piece && !byKey.has(parsedName.piece)) {
      diag(path, `Piece "${parsedName.piece}" is not in the registry — not indexed.`);
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
    const named = [...new Set(s.assets.map((a) => a.piece).filter(Boolean))];
    const strays = named.filter((k) => !roster.includes(k));
    // A named piece the roster does not claim means the two halves of the
    // source disagree. An unnamed demo expands across the roster, so expanding
    // it here would spread a guess: block that one inference and say so.
    const rosterTrusted = strays.length === 0;
    for (const k of strays) diag(`${s.folder}`, `Piece "${k}" appears in this folder but the registry does not list session ${s.n} for it.`);

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
        diag(a.path, `Unnamed demonstration not attributed: session ${s.n}'s roster disagrees with its filenames.`);
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
  // EXACT old→new pairs only. This is path provenance, not a similarity model:
  // an old path with two destinations is reported, never resolved by guessing.
  const renames = [];
  if (renameLogText) {
    const rows = readTable(renameLogText, ['old_path', 'new_path']);
    const dest = new Map();
    for (const r of rows) {
      const from = r.old_path.trim();
      const to = r.new_path.trim();
      if (!from || !to) continue;
      if (!isSafeRelativePath(from) || !isSafeRelativePath(to)) {
        diag(from, 'Rename row carries an unsafe path — ignored.');
        continue;
      }
      const prior = dest.get(from);
      if (prior && prior !== to) {
        diag(from, `Rename log maps this path to both "${prior}" and "${to}" — not applied.`);
        continue;
      }
      if (prior === to) continue;
      dest.set(from, to);
      renames.push({ from, to });
    }
    renames.sort((a, b) => cmp(a.from, b.from));
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
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
    if (!entry.isDirectory()) continue;
    if (!parseSessionFolderName(entry.name)) continue; // root folders out of scope
    const dir = join(base, entry.name);
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.name.startsWith('.') || IGNORED_DIRS.has(f.name)) continue;
      const full = join(dir, f.name);
      const st = lstatSync(full);
      if (st.isSymbolicLink() || !st.isFile()) continue;
      if (!full.startsWith(base + sep)) continue;
      inventory.push({ path: `${entry.name}/${f.name}`, size: st.size });
      if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);
    }
  }
  inventory.sort((a, b) => cmp(a.path, b.path));
  return inventory;
}

/** Write via a temp file + rename, so a reader never sees a half-written index. */
export function writeIndexAtomically(outPath, text, root) {
  const out = resolve(outPath);
  if (root && (out === resolve(root) || out.startsWith(resolve(root) + sep))) {
    throw new Error('Refusing to write the index inside the archive it describes.');
  }
  const tmp = `${out}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, out);
  return out;
}

/**
 * EVERY input this scanner reads, in one place — so "read it twice and compare"
 * below covers all of them by construction, including one added later.
 */
export function readSource(base) {
  const registryText = readFileSync(join(base, 'PIECES.csv'), 'utf8');
  let renameLogText = '';
  try {
    renameLogText = readFileSync(join(base, 'RENAME-LOG.csv'), 'utf8');
  } catch {
    renameLogText = '';
  }
  return { registryText, renameLogText, inventory: scanArchive(base) };
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
  const base = resolve(root);
  const before = readSource(base);
  const after = readSource(base);
  if (canonicalJson(before) !== canonicalJson(after)) {
    throw new Error('The archive changed during the scan; no index was produced.');
  }
  return buildIndex(before);
}

function main() {
  const { values } = parseArgs({
    options: { root: { type: 'string' }, out: { type: 'string' } },
  });
  if (!values.root) {
    console.error('Usage: scan-setar-classes.mjs --root <archive> [--out <file>]');
    process.exit(2);
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
    const written = writeIndexAtomically(values.out, text, values.root);
    const files = index.sessions.reduce((n, s) => n + s.resources.length, 0);
    console.error(`${index.sessions.length} sessions, ${index.pieces.length} pieces, ${files} useful resources, ${index.diagnostics.length} needing attention.`);
    console.error(`Wrote ${written} (${index.contentHash.slice(0, 12)}).`);
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
