#!/usr/bin/env node
// The ONE guided route for maintaining the Setar archive's declarations.
//
//   node setar-archive-maintenance.mjs --root <archive> --state <private dir> status
//   node setar-archive-maintenance.mjs --root <archive> --state <dir> register --piece <key> [--session N] [--form F] [--dastgah D] [--composer C]
//   node setar-archive-maintenance.mjs --root <archive> --state <dir> roster --session N --pieces <key>[,<key>…]
//   node setar-archive-maintenance.mjs --root <archive> --state <dir> rename --from <path> --to <path>
//     … each prints a PREVIEW and its id; run the same command again with --apply <id> to do it.
//   node setar-archive-maintenance.mjs --root <archive> --state <dir> retry      # validate, scan and publish again
//   node setar-archive-maintenance.mjs --root <archive> --state <dir> rollback   # put the last change back, then publish
//   node setar-archive-maintenance.mjs --root <archive> release-lock [--record <id>]  # show, then release, a lock no run holds
//
// PIECES.csv and RENAME-LOG.csv beside the archive stay the ONLY declarations
// (docs/setar-lesson-lifecycle.md, D9). This tool asks for the facts a
// filename cannot give, shows exactly what it will change, and only on an
// --apply carrying the preview's id: takes a PRIVATE rollback copy into
// --state (outside the archive), makes the edit, re-validates with the
// scanner's own grammar, scans to a scratch file and publishes through the
// existing job. Nothing is ever deleted; a media file is only ever renamed,
// its bytes checked unchanged. Every refusal changes nothing.
//
// The scanner stays read-only; this is the only writer, and it writes only
// PIECES.csv, RENAME-LOG.csv, the one file a `rename` names, its own dotfiles
// in the archive root (the archive's lock, a write's temp and capture) and in
// that file's folder, and its own --state folder. A name it takes away stays
// as a hidden `.<name>.superseded-<id>` (the same file, no bytes copied), and
// a private name is removed only while another of its names holds the same
// file, so nothing anyone has open loses its file. Every write is proved against the exact state it expects
// at the moment it is made, under the archive's one lock. Node stdlib only.

import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  ROLES,
  buildIndex,
  csvCell,
  fileExt,
  formatAttention,
  attentionReport,
  isSafeRelativePath,
  parseAssetStem,
  parseCsvCells,
  parseRegistry,
  parseSessionFolderName,
  readStableSource,
  readTable,
  writeIndexAtomically,
} from './scan-setar-classes.mjs';
import { ARCHIVE_LOCK, lockEntryDigest, lockHolder, readArchiveLock } from './publish-setar-index.mjs';

const REGISTRY = 'PIECES.csv';
const LOG = 'RENAME-LOG.csv';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
/** The test seams' default: `at(point, name)` is called just before each archive write. */
const noSeam = () => {};

/** A refusal: nothing was changed. */
export class Refusal extends Error {}

// --- reading the declarations, exactly -------------------------------------

function lstatOrNull(p) {
  try {
    return lstatSync(p);
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

/** A declaration file as bytes — refused when it is a link (never written through). */
function readDeclaration(root, name, required) {
  const p = join(root, name);
  const st = lstatOrNull(p);
  if (!st) {
    if (required) throw new Refusal(`${name} is missing from the archive.`);
    return null;
  }
  if (!st.isFile()) throw new Refusal(`${name} is not a regular file (a link is never written through).`);
  return readFileSync(p, 'utf8');
}

const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
/** Append ONE line, every existing byte kept exactly. */
const appendLine = (text, line) => `${text}${text.length && !text.endsWith('\n') ? eolOf(text) : ''}${line}${eolOf(text)}`;

/**
 * A media path the tool may touch: `<session folder>/<leaf>` where the session
 * folder is a REAL directory directly in the archive — never a link, which
 * would carry a read, a hash or a rename outside it. Checked at every use
 * (planning, apply, restore), never once and trusted.
 */
function mediaPath(root, rel) {
  const folder = rel.split('/')[0];
  const st = lstatOrNull(join(root, folder));
  if (!st?.isDirectory()) throw new Refusal(`The folder of "${rel}" is not a real folder in the archive (a link is never followed).`);
  return join(root, rel);
}

function stemOf(path) {
  const name = path.split('/').pop();
  const ext = fileExt(name);
  return ext ? name.slice(0, -ext.length) : name;
}

// --- planning: what an action WOULD change ---------------------------------

/**
 * The plan for one action against the archive as it is NOW. Pure apart from
 * reading; its `id` covers every byte it depends on, so an --apply against a
 * changed archive is refused as a stale preview.
 */
export function planMaintenance(rootArg, action) {
  const root = resolve(rootArg);
  const registryText = readDeclaration(root, REGISTRY, true);
  const logText = readDeclaration(root, LOG, false);
  const pieces = parseRegistry(registryText);
  const byKey = new Map(pieces.map((p) => [p.key, p]));
  const table = parseCsvCells(registryText);
  const header = table[0].values.map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const plan = { action, registry: null, log: null, rename: null, lines: [], noop: false };

  if (action.kind === 'register') {
    const key = action.piece;
    if (!key || key !== key.trim() || /[/\\,"\r\n]/.test(key)) throw new Refusal('Give the piece name exactly as the files spell it (no slash, comma or quote).');
    // A piece name never starts with a role: such a "name" is a filename
    // mistake (Session 40's تمرین-من-نت-چهارمضراب-…), and registering it would
    // invent an identity. Said as the different action it is.
    const role = ROLES.find((r) => key === r || key.startsWith(`${r}-`));
    if (role) {
      const rest = key.slice(role.length + 1);
      throw new Refusal(
        byKey.has(rest)
          ? `"${key}" is the registered piece "${rest}" with an extra "${role}" in front — a filename mistake, not a new piece. Rename the file instead (rename --from … --to …).`
          : `"${key}" starts with the role "${role}"; a piece name never does. Check the filename and rename the file instead.`,
      );
    }
    const existing = byKey.get(key);
    if (existing) {
      if (action.session === undefined || existing.sessions.includes(action.session)) {
        plan.noop = true;
        plan.lines.push(`"${key}" is already registered${action.session ? ` for session ${action.session}` : ''}. Nothing to do.`);
        return finish(plan, registryText, logText);
      }
      throw new Refusal(`"${key}" is already registered. To say class ${action.session} taught it, use: roster --session ${action.session} --pieces ${key}`);
    }
    const cells = header.map((h) => {
      if (h === 'canonical_fa') return csvCell(key);
      if (h === 'sessions') return action.session ? String(action.session) : '';
      if (h in (action.fields ?? {})) return csvCell(action.fields[h]);
      return '';
    });
    const row = cells.join(',');
    plan.registry = { before: registryText, after: appendLine(registryText, row) };
    plan.lines.push(`Register a NEW piece "${key}" (it becomes canonical_fa byte for byte). Row appended:`, `  ${row}`);
    const named = readStableSource(root).inventory.filter((e) => parseAssetStem(stemOf(e.path))?.piece === key);
    plan.lines.push(named.length ? `Files that name it: ${named.map((e) => e.path).join(', ')}` : 'No file names it yet.');
  } else if (action.kind === 'roster') {
    if (!Number.isInteger(action.session) || action.session < 1) throw new Refusal('Give the class number (--session N).');
    if (!action.pieces?.length) throw new Refusal('Name the pieces this class taught (--pieces a,b).');
    const raws = table.map((r) => r.raws);
    let after = registryText;
    let changed = 0;
    for (const key of action.pieces) {
      const p = byKey.get(key);
      if (!p) throw new Refusal(`"${key}" is not registered. Register it first (register --piece …).`);
      if (p.sessions.includes(action.session)) continue;
      const i = table.findIndex((r, idx) => idx > 0 && r.values[col('canonical_fa')] === key);
      const before = raws[i].join(',');
      const row = [...raws[i]];
      const current = table[i].values[col('sessions')].trim();
      // ONE cell changes; every other cell keeps the exact text it had.
      row[col('sessions')] = csvCell(current ? `${current},${action.session}` : String(action.session));
      const line = row.join(',');
      if (after.split(before).length !== 2) throw new Refusal(`The row for "${key}" cannot be located exactly once; nothing was changed.`);
      after = after.replace(before, line);
      changed += 1;
      plan.lines.push(`Class ${action.session} taught "${key}":`, `  ${before}`, `→ ${line}`);
    }
    if (!changed) {
      plan.noop = true;
      plan.lines.push(`Every named piece already lists session ${action.session}. Nothing to do.`);
    } else {
      plan.registry = { before: registryText, after };
    }
  } else if (action.kind === 'rename') {
    const { from, to } = action;
    for (const p of [from, to]) {
      if (!isSafeRelativePath(p) || p.split('/').length !== 2 || !parseSessionFolderName(p.split('/')[0])) {
        throw new Refusal(`"${p}" is not a file directly inside a session-N-DD-MM-YYYY folder.`);
      }
    }
    if (from === to) throw new Refusal('The old and new names are the same.');
    if (from.split('/')[0] !== to.split('/')[0]) throw new Refusal('A rename stays inside its session folder (both names in the same session-N-DD-MM-YYYY folder).');
    const parsed = parseAssetStem(stemOf(to));
    if (!parsed) throw new Refusal(`"${to}" carries no known role; name it <role>-<piece>.<ext>.`);
    if (parsed.piece && !byKey.has(parsed.piece)) {
      throw new Refusal(`"${to}" names the piece "${parsed.piece}", which is not registered. Register it first, or correct the name.`);
    }
    const rows = logText === null ? [] : readTable(logText, ['old_path', 'new_path']).map((r) => ({ from: r.old_path.trim(), to: r.new_path.trim() }));
    const logged = rows.some((r) => r.from === from && r.to === to);
    const src = lstatOrNull(mediaPath(root, from));
    const dst = lstatOrNull(mediaPath(root, to));
    if (logged && !src && dst?.isFile()) {
      plan.noop = true;
      plan.lines.push(`"${from}" was already renamed to "${to}" and logged. Nothing to do.`);
      return finish(plan, registryText, logText);
    }
    if (!src) throw new Refusal(`"${from}" is not in the archive.`);
    if (!src.isFile()) throw new Refusal(`"${from}" is not a regular file (a link is never renamed).`);
    if (dst) throw new Refusal(`"${to}" already exists; nothing is ever overwritten.`);
    // The log stays a function: never a fork, never a loop, never two names into one.
    if (rows.some((r) => r.from === from && r.to !== to)) throw new Refusal(`The log already renames "${from}" to another name; a second destination would make it unreadable.`);
    if (rows.some((r) => r.from === to)) throw new Refusal(`The log already renames "${to}" onward; this would make a loop.`);
    if (rows.some((r) => r.to === to && r.from !== from)) throw new Refusal(`The log already names another file as "${to}".`);
    const bytes = readFileSync(mediaPath(root, from));
    plan.rename = { from, to, size: bytes.length, sha256: sha(bytes) };
    const logHeader = logText === null ? ['old_path', 'new_path'] : parseCsvCells(logText)[0].values.map((h) => h.trim());
    const row = logHeader.map((h) => (h === 'old_path' ? csvCell(from) : h === 'new_path' ? csvCell(to) : '')).join(',');
    const base = logText ?? `${logHeader.map(csvCell).join(',')}\n`;
    plan.log = { before: logText, after: logged ? base : appendLine(base, row) };
    plan.lines.push(`Rename one file (bytes unchanged, ${bytes.length} bytes, sha256 ${plan.rename.sha256.slice(0, 12)}):`, `  ${from}`, `→ ${to}`);
    plan.lines.push(logged ? 'The log already records it.' : `And append to ${LOG}: ${row}`);
  } else {
    throw new Refusal(`Unknown action "${action.kind}".`);
  }
  return finish(plan, registryText, logText);
}

function finish(plan, registryText, logText) {
  const premise = { action: plan.action, registry: sha(registryText), log: logText === null ? null : sha(logText), rename: plan.rename };
  plan.id = sha(JSON.stringify(premise)).slice(0, 16);
  return plan;
}

// --- the private state folder -----------------------------------------------

function stateDir(arc, stateArg) {
  if (!stateArg) throw new Refusal('Give a private --state folder outside the archive; it holds the rollback copies.');
  const st = lstatOrNull(stateArg);
  if (!st?.isDirectory()) throw new Refusal('The --state folder must already exist as a real folder (a link is never written through).');
  const state = realpathSync.native(stateArg).normalize('NFC');
  const root = arc.path.normalize('NFC');
  if (state === root || state.startsWith(root + sep)) throw new Refusal('The --state folder must be OUTSIDE the archive: rollback copies are private.');
  return state;
}

const journalPath = (state) => join(state, 'journal.json');
const readJournal = (state) => (existsSync(journalPath(state)) ? JSON.parse(readFileSync(journalPath(state), 'utf8')) : null);
const writeJournal = (state, j) => {
  writeFileSync(`${journalPath(state)}.tmp`, `${JSON.stringify(j, null, 2)}\n`);
  renameSync(`${journalPath(state)}.tmp`, journalPath(state));
};

/** Which archive a --state folder serves: a digest of the BOUND archive's real path (`bindArchive`), never the path itself. */
const rootIdOf = (arc) => sha(arc.path.normalize('NFC'));

/**
 * The journal, refused when it was written for another archive. One from an
 * earlier version of this tool recorded neither its archive nor what it wrote,
 * so nothing may be recovered from it automatically; a finished one is simply
 * superseded by the next apply.
 *
 * `status` says what the ARCHIVE holds (prepared | applied | rolling-back |
 * rolled-back), `publication` what is known of the source-index branch
 * (pending | published | unknown | not-needed; an older journal's `failed` reads
 * as unknown), and `unresolved` the
 * validated hashes of every attempt whose remote outcome is NOT known — kept
 * until a positive observation of the branch, never reset by a later failure.
 */
function journalFor(state, arc, recovering) {
  let j = readJournal(state);
  if (!j) return null;
  if (!j.rootId) {
    if (recovering || j.status === 'prepared' || j.status === 'publish-failed') {
      throw new Refusal('The last change here was made by an earlier version of this tool, which did not record what it wrote; nothing was changed. Put its private copy back by hand (docs/nas-topology.md, rollback manifest).');
    }
    return null;
  }
  if (j.rootId !== rootIdOf(arc)) throw new Refusal('This --state folder belongs to another archive; nothing was changed. Use that archive’s own --state folder.');
  // Across runs too, the archive is the DIRECTORY the change was made in, never whatever now stands at its path.
  if (j.rootIno !== undefined && j.rootIno !== arc.ino) {
    throw new Refusal('The folder at this archive’s path is not the one this change was made in (it was moved, or another folder put there); nothing was changed. Put the archive back where it was, then run this again.');
  }
  // Earlier versions of this lane folded status and publication together; read them conservatively.
  if (j.status === 'published') j = { ...j, status: 'applied', publication: 'published' };
  else if (j.status === 'publish-failed') j = { ...j, status: 'applied', publication: 'unknown' };
  else if (j.status === 'applied' || j.status === 'rolled-back') {
    if (!j.publication) j = { ...j, publication: 'pending' };
    else if (j.publication === 'unchanged' || j.publication === 'created') j = { ...j, publication: 'published' };
    else if (j.publication === 'publish-failed' || j.publication === 'failed') j = { ...j, publication: 'unknown' };
  }
  // An open attempt from before `unresolved` existed stays open, under its hash if it recorded one.
  const open = ['pending', 'unknown'].includes(j.publication) ? [j.contentHash ?? 'unrecorded'] : [];
  return { ...j, unresolved: j.unresolved ?? open };
}

// --- the archive, bound -------------------------------------------------------
//
// Node has no openat/linkat, and a pathname can be replaced at any instant: an
// archive renamed away, another folder (an external copy) put at its path. So
// the tool never writes THROUGH the archive's path. `bindArchive` records the
// directory `--root` names when the run starts — its device and inode, and the
// real path it had — and every read-then-write runs inside `inArchive`, with the
// process's working directory ON that directory and every name a bare relative
// one, resolved by the kernel against the directory itself. Entering is proved
// by inode, never assumed: a path that names another folder now is refused, and
// nothing more is done. A section never spans an `await` (another run in the
// same process may move the working directory meanwhile).

const statOrNull = (p) => {
  try {
    return statSync(p);
  } catch {
    return null;
  }
};

/** THE authorised archive: what `root` names at this instant, by inode, with its real path. */
export function bindArchive(root) {
  const back = process.cwd();
  process.chdir(root);
  try {
    // `ino` (exact, as text) is what a journal records across runs; never the device, which a remount may renumber.
    return { path: realpathSync.native('.'), home: statSync('.'), ino: statSync('.', { bigint: true }).ino.toString() };
  } finally {
    process.chdir(back);
  }
}

const movedRefusal = () => new Refusal('The archive folder was moved, or another folder put at its path, while this ran; nothing more was done in it. Put it back where it was, then run `rollback`.');

/** The working directory IS the bound archive, and its recorded path still names it (the scanner reads through a path). */
function ensureHome(arc) {
  if (!same(statSync('.'), arc.home) || !same(statOrNull(arc.path), arc.home)) throw movedRefusal();
}

/** Into the bound archive by its recorded path, proved by inode, or refused. */
function enter(arc) {
  try {
    process.chdir(arc.path);
  } catch {
    throw movedRefusal();
  }
  ensureHome(arc);
}

/** Run `fn` with the working directory on the bound archive; the caller's is restored after. */
export function inArchive(arc, fn) {
  const back = process.cwd();
  try {
    enter(arc);
    return fn();
  } finally {
    process.chdir(back);
  }
}

/** A test seam may start a nested run, which restores the working directory by path: it is proved unchanged after, or this run stops. */
const guarded = (at) => (point, name) => {
  const here = statSync('.');
  at(point, name);
  if (!same(statSync('.'), here)) throw new Refusal('The folder this run works in changed under it; nothing more was done.');
};

// --- who owns the archive ----------------------------------------------------
//
// ONE lock per ARCHIVE (`ARCHIVE_LOCK` in its root, which the scanner skips),
// never per --state folder: every route that writes the archive takes it, and
// every publisher checks it before its ref write (`archiveConfirmation`), the
// scheduled job included. A record is written whole in a private folder that
// is RENAMED into place, so it is never partial. A run's ownership is the exact
// folder and record file it made (`owner`, by inode), never a name inside a
// path that could be swapped: every check reads the lock as objects
// (`readArchiveLock`), and every removal happens INSIDE a folder entered and
// proved by inode, of an entry judged after it is set aside — so no release
// ever takes a newer run's lock, or anything outside the archive. A lock is
// never adopted on a guess about a process (a pid can be reused, a publishing
// child outlives its parent): a run that finds one refuses, and the operator —
// having seen no maintenance or publication process is running, the indexer's
// sudo'd job included — releases that exact record (`release-lock`).

const same = (a, b) => Boolean(a && b && a.ino === b.ino && a.dev === b.dev);
const holderLine = (h) => (h.unreadable ? 'a record not in this tool’s form' : `run ${h.token.slice(0, 8)} (pid ${h.pid} on ${h.host}, since ${h.since})`);

function lockRefusal() {
  const held = readArchiveLock('.');
  if (!held) return new Refusal('Another maintenance run was just releasing the archive’s lock; nothing was changed. Try again.');
  return new Refusal(
    `The archive’s maintenance lock is held by ${holderLine(held)}; nothing was changed. If that run is still going, wait for it. ` +
      `If no maintenance run or publication is running — no setar-archive-maintenance.mjs, run-setar-index.sh or publish-setar-index.mjs process, including one run as setar-indexer through sudo (ps -ef) — release it with: release-lock --record ${held.digest.slice(0, 16)}; then the next run says what to finish.`,
  );
}

/**
 * Take the archive's lock, or refuse. The record is written whole, by bare
 * name, INSIDE the private folder this run made (entered and proved by inode,
 * so a link put at its name is never written through), and the folder is then
 * RENAMED into place — which fails while any lock stands, and replaces only
 * the empty folder a release leaves. Returns the `owner`: the token and the
 * exact folder and record, as objects. A failure removes only this run's own
 * record, judged by inode, and then its folder only if empty — never anything
 * another writer put there. A run that stopped mid-write left a file under one
 * of this tool's private names: it is never recovered from automatically (a
 * name proves nothing about whose file it is); the run refuses and names it.
 * `at` is the test seam: before the record's write and before the rename.
 */
function lock(arc, at = noSeam) {
  const token = randomUUID();
  const tmp = `${ARCHIVE_LOCK}.${token}`;
  const name = `${token}.json`;
  mkdirSync(tmp);
  const folder = lstatSync(tmp, { bigint: true });
  let record = null;
  try {
    at('lock-record', tmp);
    record = inFolder(arc, tmp, () => {
      if (!same(statSync('.', { bigint: true }), folder)) throw new Refusal('The lock folder this run made was replaced before its record was written; nothing was changed.');
      writeFileSync(name, `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
      return lstatSync(name, { bigint: true });
    });
    at('lock-take', tmp);
    renameSync(tmp, ARCHIVE_LOCK);
  } catch (err) {
    try {
      if (record) inFolder(arc, tmp, (stillBound) => same(statSync('.', { bigint: true }), folder) && removeLockEntry(name, (st) => same(st, record) && stillBound(), at, join(tmp, name)));
    } catch {
      // not this run's folder any more: whatever stands there is left
    }
    try {
      rmdirSync(tmp); // only ever an empty folder
    } catch {
      // holds something, or gone: left as it is
    }
    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal();
    throw err;
  }
  const owner = { token, folder, record, holder: lockHolder(token, folder, record), at };
  try {
    if (!holds(owner)) throw new Refusal('The archive’s lock was replaced as this run took it; nothing was changed. Run release-lock to see it.');
    refuseLeftovers();
  } catch (err) {
    unlock(arc, owner);
    throw err;
  }
  return owner;
}

/** The lock in the archive is exactly the one `owner` made: its token, folder and record, read as objects. Any doubt is "no". */
function holds(owner) {
  try {
    return readArchiveLock('.')?.holder === owner.holder;
  } catch {
    return false;
  }
}

/**
 * Every archive write first proves it is IN the bound archive and this run
 * still holds its lock (an operator may have released it, or anyone replaced
 * the folder or its record). What follows works by bare names in that
 * archive, so nothing done to its path after this check reaches the write.
 * `owned` is the test seam, just after the check.
 */
function assertOwner({ arc, owner, at }, label) {
  ensureHome(arc);
  if (!holds(owner)) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand, or replaced); it stopped before its next write.');
  at('owned', label);
}

/** Remove the lock's folder once empty — never one holding anyone's record. */
function dropEmptyLock() {
  try {
    rmdirSync(ARCHIVE_LOCK);
  } catch {
    // not empty (a newer run holds it), already gone, or not a folder: left as it is
  }
}

/**
 * Release THIS run's lock: only its own record — the very file, judged by
 * inode — inside its own folder, entered and proved by inode. A replaced
 * folder or record, a newer run's or anyone's, is never touched.
 */
function unlock(arc, owner) {
  try {
    ensureHome(arc);
    inFolder(arc, ARCHIVE_LOCK, (stillBound) => same(statSync('.', { bigint: true }), owner.folder) && removeLockEntry(`${owner.token}.json`, (st) => same(st, owner.record) && stillBound(), owner.at, join(ARCHIVE_LOCK, `${owner.token}.json`)));
    dropEmptyLock(); // only from the proved archive
  } catch (err) {
    if (!(err instanceof Refusal)) throw err; // not in the archive, or no real folder at the name: nothing of this run's to remove there
  }
}

/**
 * A run's end: its own record released INSIDE the bound archive. When the
 * archive can no longer be entered, the lock is left where it is — never
 * removed through another folder — and the next run names it (release-lock).
 */
function release(arc, owner) {
  try {
    inArchive(arc, () => unlock(arc, owner));
  } catch (err) {
    if (!(err instanceof Refusal)) throw err;
  }
}

/**
 * THE ONE PLACE a lock entry is removed: `name`, a bare name in the folder the
 * caller entered and proved, only while what stands there is exactly what may
 * go (`isIt(lstat, path)`: the operator's digest, or a run's own record by
 * inode), judged on a private name it was first moved to — atomic: whatever
 * held the name at that instant — so an entry put at that name since, or
 * replacing it in the judgement's instant, is never removed. Returns whether
 * it removed the entry. A refused file or link is NEVER unlinked from its
 * private name — no call removes a name only while another still stands, so
 * that name is what keeps its very inode (and an open handle's later writes)
 * through any cut or failure. It is linked back at `name` as well (never over
 * anything: the lock stays held for the publisher, which reads only that
 * name), and said. A refused folder is one atomic move back, or kept. `at` is
 * the test seam: after the move (`judge-release`) and before the link back
 * (`restore`).
 */
function removeLockEntry(name, isIt, at = noSeam, label = name) {
  const aside = `${name}.releasing-${randomUUID()}`;
  try {
    renameSync(name, aside);
  } catch (err) {
    if (err?.code === 'ENOENT') return false;
    throw err;
  }
  at('judge-release', label);
  const st = lstatSync(aside, { bigint: true });
  if (isIt(st, aside)) {
    unlinkSync(aside);
    return true;
  }
  at('restore', label);
  let back = true;
  try {
    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), name);
    else if (st.isFile()) linkSync(aside, name);
    else {
      renameSync(aside, name); // a folder: replaces only an empty one, never anyone's record
      return false;
    }
  } catch (err) {
    if (!['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) throw err;
    back = false;
  }
  throw new Refusal(
    `The lock changed while it was being released${back ? '' : ', and a newer one now stands'}; what had replaced the record you saw is kept as ${label.replace(/[^/]*$/, aside)}${back ? `, and again at ${label}` : ''}. Nothing was removed.`,
  );
}

/**
 * The operator's explicit route for a lock no run will take: shown first, then
 * released only by its exact record (a digest prefix of what is there, its
 * folder included), whatever form it is in — a dead run's, a partial or
 * foreign one. Only the entries that record named are removed, each by its own
 * name INSIDE the very folder shown (entered and proved by inode, never through
 * a link put at the lock's name), so a lock taken since, or anything outside
 * the archive, is never touched. `at` is the test seam.
 */
export function releaseLock({ root: rootArg, record, at = noSeam }) {
  const arc = bindArchive(resolve(rootArg));
  return inArchive(arc, () => releaseBound(arc, record, guarded(at)));
}

function releaseBound(arc, record, at) {
  const held = readArchiveLock('.');
  if (!held) return { released: false, lines: ['The archive holds no maintenance lock. Nothing to do.'] };
  const id = held.digest.slice(0, 16);
  if (!record) {
    return {
      released: false,
      lines: [
        `The archive’s maintenance lock is held by ${holderLine(held)}.`,
        'Release it ONLY if no setar-archive-maintenance.mjs, run-setar-index.sh or publish-setar-index.mjs process is running, including one run as setar-indexer through sudo (ps -ef):',
        `release-lock --record ${id}`,
      ],
    };
  }
  const stale = () => new Refusal('The lock is not the record you saw (it changed or was released since); nothing was changed. Run release-lock again to see it.');
  if (record !== id) throw stale();
  at('release', ARCHIVE_LOCK);
  // Only a file or a link can be judged again; anything else is the operator's to remove by hand.
  if (held.entries.some(([, d]) => d === null)) {
    throw new Refusal(`The lock holds something that is not a file (${held.entries.filter(([, d]) => d === null).map(([p]) => p).join(', ')}); nothing was changed. Once no run holds it, remove it by hand.`);
  }
  const judged = (digest, stillBound) => (st, aside) => (st.isFile() || st.isSymbolicLink()) && lockEntryDigest(aside) === digest && stillBound();
  let removed = 0;
  if (!held.folder) {
    // An earlier version's lock FILE: its one name, in the bound archive itself.
    const [[p, digest]] = held.entries;
    if (removeLockEntry(p, judged(digest, () => true), at)) removed += 1;
  } else {
    try {
      removed = inFolder(arc, ARCHIVE_LOCK, (stillBound) => {
        if (!same(statSync('.', { bigint: true }), held.folder)) return 0; // another folder at the name now: not the one shown
        let n = 0;
        for (const [p, digest] of held.entries) if (removeLockEntry(basename(p), judged(digest, stillBound), at, p)) n += 1;
        return n;
      });
    } catch (err) {
      if (!(err instanceof Refusal) || /lock changed while it was being released/.test(err.message)) throw err;
      throw stale(); // no real folder at the lock's name any more
    }
  }
  dropEmptyLock();
  if (removed < held.entries.length) {
    if (!removed) throw stale();
    throw new Refusal(`Part of the lock changed since you saw it: ${removed} of its ${held.entries.length} entries, still exactly as shown, were removed; the rest is left as it is. Run release-lock again to see it.`);
  }
  return { released: true, lines: [`Released the lock of ${holderLine(held)}. The next run says what, if anything, it left to finish.`] };
}

/**
 * A run stopped in the middle of a write leaves a file under one of this
 * tool's private names: a declaration set aside (`.<name>.captured-…`, root)
 * or a media name being dropped (`.<leaf>.dropping-…`, a session folder).
 * Nothing guesses whose it is. The run refuses, naming each, and the operator
 * renames it back — never over anything — before running again; the journal's
 * own exact judgement (`rollback`) then finishes.
 */
function refuseLeftovers() {
  const found = [];
  for (const d of readdirSync('.', { withFileTypes: true })) {
    // A lock a release-lock set aside and stopped before judging — a file, a link or a newer run's folder alike.
    if (d.name.startsWith(`${ARCHIVE_LOCK}.releasing-`)) found.push(`  mv -n '${d.name}' '${ARCHIVE_LOCK}'   (a lock record a release set aside; if ${ARCHIVE_LOCK} is that very file again — ls -li shows one inode — rm only this name instead; then run release-lock to see it)`);
    if (d.isFile() || d.isSymbolicLink()) {
      const m = /^\.(PIECES\.csv|RENAME-LOG\.csv)\.captured-/.exec(d.name);
      if (m) found.push(`  mv -n '${d.name}' '${m[1]}'   (if ${m[1]} is there, it is the copy a write replaced: mv -n '${d.name}' '${d.name.replace('.captured-', '.superseded-')}')`);
    } else if (d.isDirectory() && parseSessionFolderName(d.name)) {
      for (const f of readdirSync(d.name)) {
        const m = /^\.(.+)\.dropping-/.exec(f);
        if (m) found.push(`  mv -n '${d.name}/${f}' '${d.name}/${m[1]}'   (if that name is taken, keep both and compare them)`);
      }
    }
  }
  if (found.length) {
    throw new Refusal(`A run stopped in the middle of a write and left a file under a private name; nothing was changed. Put each back by hand, never over anything, then run again:\n${found.join('\n')}`);
  }
}

// --- writing the archive, exactly --------------------------------------------

/** Move whatever is at `name` aside — atomic: exactly what was there at that instant — or null when nothing was. A fresh name every time. */
function capture(dir, name) {
  const aside = join(dir, `.${name}.captured-${randomUUID()}`);
  try {
    renameSync(join(dir, name), aside);
    return aside;
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * THE ONE PLACE a private name of this tool is retired, its bytes never
 * copied: the file first gets a SECOND private name, a hidden `.superseded-`
 * one (the scanner skips dotfiles; a fresh id, never the `mv -n` target a
 * refusal suggests), then `kept` is judged to still name the same file (a
 * link: the same target), and only then is ONE of the two removed — `aside`
 * when `kept` holds it (the hidden name stays), else the hidden one (false:
 * `aside` still holds the very file). A name is removed only while another
 * private name of this tool holds the same file, so no failure, kill or
 * concurrent replacement leaves it without a name — killed anywhere, `aside`
 * is still there for the next run to refuse on and name — and a program
 * holding it open keeps writing into a named file. `at` is the seam, between
 * the second name and the judgement.
 */
function retireKeeping(aside, kept, at, label) {
  const st = lstatSync(aside);
  const target = st.isSymbolicLink() ? readlinkSync(aside) : null;
  const retained = aside.replace(/\.(captured|dropping)-[^/]*$/, `.superseded-${randomUUID()}`);
  // A link is re-made, never hard-linked: link(2) follows a symlink on macOS.
  if (target === null) linkSync(aside, retained);
  else symlinkSync(target, retained);
  at('retain-aside', label);
  const k = lstatOrNull(kept);
  const holds = target === null ? same(k, st) : Boolean(k?.isSymbolicLink()) && readlinkSync(kept) === target;
  rmSync(holds ? aside : retained);
  return holds;
}

/** Put a captured file back, never over anything that appeared meanwhile, nor losing it if its name is replaced again — then both are kept, and said. */
function putBack(dir, name, aside, at, label = name) {
  const st = lstatSync(aside);
  const both = `${name} was replaced or removed while this ran; whatever stands there now is left, and the one before is kept beside it as ${basename(aside)}.`;
  try {
    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), join(dir, name));
    else if (st.isFile()) linkSync(aside, join(dir, name));
    else throw new Refusal(`${name} was replaced by something that is not a file while this ran; it is kept as ${basename(aside)}. Put it back by hand.`);
  } catch (err) {
    if (err?.code === 'EEXIST') throw new Refusal(both);
    throw err;
  }
  at('put-back', label);
  if (!retireKeeping(aside, join(dir, name), at, label)) throw new Refusal(both);
}

/** A replaced declaration is KEPT, never unlinked, under a name no other write uses. */
const keep = (aside) => {
  const kept = aside.replace('.captured-', '.superseded-');
  renameSync(aside, kept);
  return kept;
};

/**
 * Replace a declaration (or, with `text` null, take it out of the archive) only
 * while it holds exactly `expected` — a SHA-256, or null for absent — PROVED AT
 * THE WRITE: the file is first moved aside (what was there at that instant;
 * a later save makes a new file), its bytes judged, and the new one LINKED into
 * place, which never overwrites. Replaced, deleted, created or a link: put
 * back and refused, nothing anyone wrote lost. The instant the archive changes
 * it is recorded in `written`, so a later failure is judged, never skipped.
 * `at` is the test seam.
 */
function replaceDeclaration(ctx, name, text, expected, keepDir) {
  const { at, written } = ctx;
  assertOwner(ctx, name);
  // Bare names, inside the bound archive (`inArchive`): never its path again.
  const p = name;
  const tmp = text === null ? null : `.${name}.maintenance-${randomUUID()}`;
  if (tmp) writeFileSync(tmp, text, { flag: 'wx' });
  try {
    at('capture', name);
    if (expected === null) {
      // Planned absent: create, never overwrite.
      try {
        linkSync(tmp, p);
      } catch (err) {
        if (err?.code === 'EEXIST') throw new Refusal(`${name} appeared while this ran; it was left as the other edit made it.`);
        throw err;
      }
      written?.add(name);
      return;
    }
    const aside = capture('.', name);
    if (!aside) throw new Refusal(`${name} was removed while this ran; nothing was put in its place.`);
    const st = lstatSync(aside);
    if (!st.isFile() || sha(readFileSync(aside)) !== expected) {
      putBack('.', name, aside, at);
      throw new Refusal(`${name} changed while this ran; it was left as the other edit made it.`);
    }
    at('install', name);
    try {
      if (tmp) linkSync(tmp, p);
      else copyFileSync(aside, join(keepDir, `${name}.written-${randomUUID()}`), constants.COPYFILE_EXCL);
    } catch (err) {
      if (tmp && err?.code === 'EEXIST') {
        throw new Refusal(`${name} was written by someone else while this ran; theirs stands, and the one it replaced is kept beside it as ${basename(keep(aside))}.`);
      }
      putBack('.', name, aside, at);
      throw err;
    }
    written?.add(name);
    at('keep', name);
    // The replaced file is KEPT, never unlinked: a program still holding it
    // open writes into this inode whenever it writes, so nothing it saves is
    // ever lost — it lands in the kept copy, beside the declaration.
    keep(aside);
  } finally {
    if (tmp) rmSync(tmp, { force: true });
  }
}

/**
 * Run `fn(stillBound)` INSIDE one session folder of the BOUND archive
 * (`inArchive`), bound by its inode: it must be a real folder directly in that
 * archive at the instant this starts (never a link), selected by its bare name
 * against the archive itself, and every name `fn` touches is a bare leaf
 * resolved against that bound folder — never a path again, so swapping the
 * folder for a link, or the archive's path for another folder, cannot carry a
 * write outside. `stillBound()` says whether the folder still stands at its
 * name in the bound archive, judged through its own `..`; `fn` asks before
 * each step that commits anything. Back in the archive by `..`, proved, or by
 * its recorded path, proved, or refused.
 */
// ponytail: process-wide cwd, the only stdlib way to resolve names against a
// bound directory (Node has no linkat/openat); the tool is single-threaded.
function inFolder(arc, folder, fn) {
  const st = lstatOrNull(folder);
  if (!st?.isDirectory()) throw new Refusal(`The folder "${folder}" is not a real folder in the archive (a link is never followed); nothing was moved.`);
  process.chdir(folder);
  try {
    if (!same(statSync('.'), st)) throw new Refusal(`The folder "${folder}" changed while this ran; nothing was moved.`);
    // The entry first, then its parent: a folder moved out between the two is caught by the second.
    return fn(() => same(lstatOrNull(join('..', folder)), st) && same(statSync('..'), arc.home));
  } finally {
    try {
      process.chdir('..');
    } catch {
      // the folder is gone: back by the archive's path below
    }
    if (!same(statSync('.'), arc.home)) enter(arc);
  }
}

/**
 * Give one media file a new name in its folder, never overwriting and never
 * moving bytes other than the recorded ones: the new name is LINKED (fails if
 * anything is there), what it names is judged (same file, recorded size and
 * SHA-256, the folder still at its name), and only then is the old name
 * retired to a hidden `.superseded-` name of the same file — while the new name still holds it. A judged failure removes
 * only the name this call made, while the old name still holds the file —
 * inside the bound folder, wherever it now is; nothing has moved. Whichever
 * name another writer replaces meanwhile, the file keeps the other, and the
 * refusal says which.
 */
function moveExact(ctx, fromRel, toRel, expect) {
  // `root` is the archive's given path, ONLY for what the test seam is told.
  const { root, arc, at, written } = ctx;
  assertOwner(ctx, fromRel);
  const [from, to] = [fromRel, toRel].map((rel) => rel.split('/')[1]);
  inFolder(arc, fromRel.split('/')[0], (stillBound) => {
    if (!lstatOrNull(from)?.isFile()) throw new Refusal(`"${fromRel}" is not a regular file in the archive any more; nothing was moved.`);
    at('link', toRel);
    try {
      linkSync(from, to);
    } catch (err) {
      if (err?.code === 'EEXIST') throw new Refusal(`"${toRel}" appeared while this ran; nothing is ever overwritten, and nothing was moved.`);
      if (err?.code === 'ENOENT') throw new Refusal(`"${fromRel}" went away while this ran; nothing was moved.`);
      throw err;
    }
    written?.add('rename');
    const a = lstatOrNull(from);
    const b = lstatOrNull(to);
    const bound = stillBound();
    const bytes = bound && same(a, b) && b.isFile() ? readFileSync(to) : null;
    if (!bytes || bytes.length !== expect.size || sha(bytes) !== expect.sha256) {
      const why = bound ? `"${fromRel}" does not hold the bytes this change recorded (it changed since the preview)` : `The folder of "${fromRel}" was moved or replaced while this ran`;
      const undo = same(a, b) ? dropName(to, a, from, at, join(root, toRel), join(root, fromRel)) : 'dropped';
      if (undo === 'kept-changed') throw new Refusal(`${why}, and "${fromRel}" was then replaced or removed; the file it named is kept as "${toRel}", and nothing was moved back.`);
      if (undo === 'changed') {
        written?.delete('rename');
        throw new Refusal(`${why}, and "${toRel}" was then replaced or removed; whatever stands there is left, and nothing was moved.`);
      }
      throw new Refusal(bound ? `${why}; nothing was moved.` : `${why}; the name this run made there was taken out again (kept hidden beside it), and nothing outside it was touched.`);
    }
    at('unlink', fromRel);
    const drop = dropName(from, b, to, at, join(root, fromRel), join(root, toRel));
    if (drop === 'changed') throw new Refusal(`"${fromRel}" was replaced or removed while this ran; whatever stands there is left, and the moved file is kept as "${toRel}".`);
    if (drop === 'kept-changed') {
      written?.delete('rename');
      throw new Refusal(`"${toRel}" was replaced or removed while this ran; whatever stands there is left, and "${fromRel}" was put back — nothing was moved.`);
    }
  });
}

/**
 * Take the leaf name `name` away (inside a bound folder; kept hidden:
 * `retireKeeping`) only while it names the
 * file `inode` (an lstat) AND its other name `kept` still does — judged on a
 * PRIVATE name it was first moved to (atomic: whatever held the name at that
 * instant), so no file renamed onto either name meanwhile, nor the file
 * itself, can lose its last name. Anything else is put back, never over a
 * newer file. Returns 'dropped'; 'changed' (`name` held another file, put
 * back); or 'kept-changed' (`kept` was replaced or removed: the file is put
 * back at `name`). `label`/`keptLabel` are what the test seam is told.
 */
function dropName(name, inode, kept, at, label, keptLabel) {
  const aside = `.${name}.dropping-${randomUUID()}`;
  try {
    renameSync(name, aside);
  } catch (err) {
    if (err?.code === 'ENOENT') return 'changed';
    throw err;
  }
  at('judge-drop', label);
  if (!same(lstatSync(aside), inode)) {
    putBack('.', name, aside, at, label);
    return 'changed';
  }
  if (retireKeeping(aside, kept, at, keptLabel)) return 'dropped';
  putBack('.', name, aside, at, label);
  return 'kept-changed';
}

/** Thrown by the test seam to stand in for a process killed mid-apply. */
export class Interrupted extends Error {}

// --- validation, scan and publication ---------------------------------------

/** Scan the archive now (the scanner's two-read rule), check the action took, write the scratch index. */
function validateAndScan(arc, state, action) {
  // The scanner reads through a path (the working directory's): proved to be the bound archive before and after.
  ensureHome(arc);
  const index = buildIndex(readStableSource('.'));
  ensureHome(arc);
  if (action?.kind === 'register' && !index.pieces.some((p) => p.key === action.piece)) throw new Error('The registry does not show the new piece after the edit.');
  if (action?.kind === 'roster' && !action.pieces.every((k) => index.pieces.find((p) => p.key === k)?.sessions.includes(action.session))) {
    throw new Error('The registry does not show the roster after the edit.');
  }
  const text = `${JSON.stringify(index, null, 2)}\n`;
  writeIndexAtomically(join(state, 'scratch-index.json'), text, '.');
  return { index, text };
}

/**
 * Publication failed. `nothingPublished` is a CLAIM about THIS attempt only,
 * made when the job proved it (it refused or failed before its ref write) —
 * never about the branch, which another publisher may still change; every
 * other failure — a non-zero or signalled exit, a lost response, an ordinary
 * exception — leaves this attempt itself open too.
 */
export class PublishFailed extends Error {
  constructor(message, nothingPublished) {
    super(message);
    this.nothingPublished = nothingPublished;
  }
}
const PUBLISHED = new Set(['unchanged', 'published', 'created']);

/**
 * Publish `scanned` for the archive state `base` describes. The journal says
 * which validated index this attempt intends, and that its outcome is open,
 * BEFORE any remote work. Only positive evidence that the branch holds it
 * closes every open attempt; a failure this attempt proved leaves the earlier
 * open ones open, and a failure it did not prove adds itself to them.
 */
async function publishStep(state, base, scanned, publish, holder) {
  const contentHash = scanned.index.contentHash;
  const before = base.unresolved ?? [];
  const attempt = { ...base, publication: 'pending', contentHash, unresolved: [...new Set([...before, contentHash])] };
  writeJournal(state, attempt);
  let result;
  try {
    result = await publish(scanned.text, contentHash, holder);
    // POSITIVE EVIDENCE or it did not happen: a publisher that returns no status has proved nothing.
    if (!PUBLISHED.has(result?.status)) throw new PublishFailed('the publisher reported no publication', false);
  } catch (err) {
    // A proof covers THIS attempt only, never the branch: another publisher's
    // unanswered write (the scheduled job's, recorded where this run cannot
    // read) may still land. So a failure is always `unknown` until a positive
    // observation of the branch.
    const proved = err?.nothingPublished === true;
    const unresolved = proved ? before : attempt.unresolved;
    const why = err?.message ?? 'unknown';
    try {
      writeJournal(state, { ...attempt, publication: 'unknown', unresolved });
    } catch (e) {
      throw new Error(`Publication could not be confirmed (${why}), and the private journal could not record that (${e.message}); it still says pending, which counts as unconfirmed. Run \`retry\`.`);
    }
    const earlier = before.length ? 'an earlier attempt is still unconfirmed and may have been published' : 'what the source-index branch holds is not confirmed (an earlier or scheduled publication may still land)';
    return {
      ok: false,
      status: 'publish-failed',
      contentHash,
      message: `The archive is valid, but publication could not be confirmed (${why}); ${proved ? `this attempt published nothing, but ${earlier}` : 'it may already be published'}. Run \`retry\`: it publishes this index, and makes no new commit if the source-index branch already holds it.`,
    };
  }
  // Published: a failure to RECORD it is never reported as a failure to publish.
  try {
    writeJournal(state, { ...attempt, publication: 'published', unresolved: [] });
  } catch (err) {
    throw new Error(`Index ${contentHash.slice(0, 12)} was published, but the private journal could not record it (${err.message}). Run \`retry\` to record it; it makes no new commit.`);
  }
  return { ok: true, status: 'published', contentHash, publication: result };
}

// --- applying ---------------------------------------------------------------


/**
 * Apply a previewed action. `previewId` must be the id the preview printed
 * against the archive as it is now. `publish(text, contentHash, holder)` is
 * the existing job (CLI) or a fake Git boundary (tests). `interruptAfter` is a
 * test seam: 'copy' | 'registry' | 'log' | 'rename'; `at(point, name)` another,
 * called just before each archive write.
 */
export async function applyMaintenance({ root: rootArg, state: stateArg, action, previewId, publish, interruptAfter, at = noSeam }) {
  const root = resolve(rootArg);
  const arc = bindArchive(root);
  const state = stateDir(arc, stateArg);
  const owner = inArchive(arc, () => lock(arc, guarded(at)));
  // What THIS run has changed in the archive, recorded at the instant of each change: its automatic put-back judges only those.
  const ctx = { root, arc, owner, at: guarded(at), written: new Set() };
  let interrupted = false;
  try {
    // Everything up to publication, in ONE bound section (no await inside).
    const ready = inArchive(arc, () => {
      const prior = journalFor(state, arc);
      if (prior?.status === 'prepared' || prior?.status === 'rolling-back') {
        throw new Refusal(`An earlier ${prior.status === 'prepared' ? 'apply' : 'rollback'} did not finish. Run \`rollback\` first; nothing else was changed.`);
      }
      if (prior && !['published', 'not-needed'].includes(prior.publication)) {
        throw new Refusal('An earlier change is not yet published (or its publication is unconfirmed). Run `retry` first; nothing else was changed.');
      }
      const plan = planMaintenance('.', action);
      if (plan.id !== previewId) throw new Refusal('The archive changed since that preview (or the preview is for something else). Preview again; nothing was changed.');
      if (plan.noop) return { done: { ok: true, status: 'unchanged', lines: plan.lines } };

      // 1. The private rollback copy, BEFORE any edit.
      const copy = join(state, `${new Date().toISOString().replace(/[:.]/g, '-')}-${plan.id}`);
      mkdirSync(copy);
      // BOTH declarations, whatever this action edits: a rollback restores the pair as it was.
      const registryBefore = readDeclaration('.', REGISTRY, true);
      const logBefore = readDeclaration('.', LOG, false);
      const logWasPresent = logBefore !== null;
      writeFileSync(join(copy, REGISTRY), registryBefore, { flag: 'wx' });
      if (logWasPresent) writeFileSync(join(copy, LOG), logBefore, { flag: 'wx' });
      // What this change WROTE, by digest: the only state a restore may undo.
      const digest = (t) => (t === null ? null : sha(t));
      const wrote = {
        registry: { before: digest(registryBefore), after: digest(plan.registry ? plan.registry.after : registryBefore) },
        log: { before: digest(logBefore), after: digest(plan.log ? plan.log.after : logBefore) },
      };
      const journal = { id: plan.id, action, copy, rootId: rootIdOf(arc), rootIno: arc.ino, logWasPresent, wrote, rename: plan.rename, lockToken: owner.token, status: 'prepared' };
      writeFileSync(join(copy, 'manifest.json'), `${JSON.stringify(journal, null, 2)}\n`);
      writeJournal(state, journal);
      const step = (name) => {
        if (interruptAfter === name) {
          interrupted = true;
          throw new Interrupted(`interrupted after ${name}`);
        }
      };
      step('copy');

      // 2. The edit, each write proved against what the plan saw. Any failure is put back, automatically.
      try {
        if (plan.registry) replaceDeclaration(ctx, REGISTRY, plan.registry.after, digest(plan.registry.before));
        step('registry');
        if (plan.log) replaceDeclaration(ctx, LOG, plan.log.after, digest(plan.log.before));
        step('log');
        if (plan.rename) moveExact(ctx, plan.rename.from, plan.rename.to, plan.rename);
        step('rename');
        ctx.at('scan', 'archive');
        return { journal, scanned: validateAndScan(arc, state, action), lines: plan.lines };
      } catch (err) {
        if (err instanceof Interrupted) throw err;
        try {
          // Back in the bound archive first: a failure inside a session folder may have left the working directory anywhere.
          enter(arc);
          restore({ ...ctx, written: null }, journal, undefined, ctx.written);
        } catch (why) {
          // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
          throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
        }
        // This run published nothing, and the archive is as it was before it.
        writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed', unresolved: [] });
        throw new Refusal(`The change did not validate (${err.message}); ${ctx.written.size ? 'everything it changed was put back from the private copy' : 'it had changed nothing in the archive'}.`);
      }
    });
    if (ready.done) return ready.done;
    // 3. Publication, through the existing job.
    return { ...(await publishStep(state, { ...ready.journal, status: 'applied', unresolved: [] }, ready.scanned, publish, owner.holder)), lines: ready.lines };
  } finally {
    if (!interrupted) release(arc, owner);
  }
}

/**
 * Put back exactly what THIS change wrote — and nothing anyone wrote since.
 * Every file is judged BEFORE any is touched: a declaration still as it was
 * is left; one holding exactly what this change wrote is restored, the write
 * itself proving it still does; anything else (another run's row, a hand
 * edit) refuses the whole restore. The renamed file moves back only from its
 * recorded name with its recorded bytes. `only` (apply's automatic put-back)
 * limits the judgement to what that run is known to have written.
 */
function restore(ctx, journal, beforeWriting = () => {}, only = null) {
  // Inside the bound archive (`inArchive`): every read and write by bare name; `root` only labels the test seam.
  const { root } = ctx;
  const current = (name) => {
    const t = readDeclaration('.', name, false);
    return t === null ? null : sha(t);
  };
  const steps = [];
  for (const [name, w] of [
    [REGISTRY, journal.wrote.registry],
    [LOG, journal.wrote.log],
  ]) {
    if (only && !only.has(name)) continue;
    const now = current(name);
    if (now === w.before) continue;
    if (now !== w.after) throw new Refusal(`${name} has changed since this change was made; it is left exactly as it is.`);
    let back = null;
    if (w.before !== null) {
      back = readFileSync(join(journal.copy, name), 'utf8');
      if (sha(back) !== w.before) throw new Refusal(`The private copy of ${name} is not what this change recorded; nothing was put back.`);
    }
    // The log did not exist before: what was written is kept beside the copy, never deleted.
    steps.push(() => replaceDeclaration(ctx, name, back, w.after, journal.copy));
  }
  const r = only && !only.has('rename') ? null : journal.rename;
  if (r) {
    const fromSt = lstatOrNull(mediaPath('.', r.from));
    const toSt = lstatOrNull(mediaPath('.', r.to));
    const holds = (rel) => {
      const bytes = readFileSync(mediaPath('.', rel));
      return bytes.length === r.size && sha(bytes) === r.sha256;
    };
    if (!fromSt && toSt?.isFile()) {
      if (!holds(r.to)) throw new Refusal(`"${r.to}" no longer holds the renamed bytes; it is left as it is.`);
      steps.unshift(() => moveExact(ctx, r.to, r.from, r));
    } else if (same(fromSt, toSt) && toSt.isFile()) {
      // A move stopped between its two names: the new name is the one to drop — the bytes stay at the old one, whatever they are.
      steps.unshift(() => {
        assertOwner(ctx, r.to);
        const [from, to] = [r.from, r.to].map((rel) => rel.split('/')[1]);
        inFolder(ctx.arc, r.from.split('/')[0], (stillBound) => {
          const kept = lstatOrNull(from);
          const drop = stillBound() && same(kept, lstatOrNull(to)) ? dropName(to, kept, from, ctx.at, join(root, r.to), join(root, r.from)) : 'changed';
          if (drop === 'kept-changed') throw new Refusal(`"${r.from}" was replaced or removed while this ran; the bytes stay as "${r.to}", and nothing was put back.`);
          if (drop !== 'dropped') throw new Refusal(`"${r.to}" changed while this ran; it is left as it is, and nothing was put back there.`);
        });
      });
    } else if (!(fromSt?.isFile() && !toSt)) {
      throw new Refusal(`"${r.from}" and "${r.to}" are neither as this change left them nor as they were; they are left as they are.`);
    }
  }
  beforeWriting();
  for (const s of steps) s();
}

/** Validate, scan and publish again from the retained state — after a failed, unconfirmed or interrupted publication. */
export async function retryMaintenance({ root: rootArg, state: stateArg, publish }) {
  const arc = bindArchive(resolve(rootArg));
  const state = stateDir(arc, stateArg);
  const owner = inArchive(arc, () => lock(arc));
  try {
    const [journal, scanned] = inArchive(arc, () => {
      const j = journalFor(state, arc, true);
      if (!j) throw new Refusal('Nothing has been applied here yet.');
      if (j.status === 'prepared' || j.status === 'rolling-back') {
        throw new Refusal(`The last ${j.status === 'prepared' ? 'apply' : 'rollback'} did not finish; run \`rollback\`.`);
      }
      return [j, validateAndScan(arc, state, null)];
    });
    return await publishStep(state, { ...journal, lockToken: owner.token }, scanned, publish, owner.holder);
  } finally {
    release(arc, owner);
  }
}

/**
 * Put the last change back from its private copy, then publish the restored
 * archive. The lock comes FIRST and the journal is read under it; the journal
 * says `rolling-back`, with this run's token, before the first write, so an
 * interruption anywhere leaves a state the next `rollback` finishes. Open
 * publication attempts stay open through it. `interruptAfter: 'mark'` is the
 * test seam for that; `at` as in apply.
 */
export async function rollbackMaintenance({ root: rootArg, state: stateArg, publish, interruptAfter, at = noSeam }) {
  const root = resolve(rootArg);
  const arc = bindArchive(root);
  const state = stateDir(arc, stateArg);
  const owner = inArchive(arc, () => lock(arc, guarded(at)));
  let interrupted = false;
  try {
    const [journal, scanned] = inArchive(arc, () => {
      const j = journalFor(state, arc, true);
      if (!j || j.status === 'rolled-back') {
        throw new Refusal(
          j && !['published', 'not-needed'].includes(j.publication)
            ? 'The last change is already rolled back but not yet published; run `retry`.'
            : 'There is no change here to roll back.',
        );
      }
      restore({ root, arc, owner, at: guarded(at) }, j, () => {
        writeJournal(state, { ...j, status: 'rolling-back', lockToken: owner.token });
        if (interruptAfter === 'mark') {
          interrupted = true;
          throw new Interrupted('interrupted after mark');
        }
      });
      return [j, validateAndScan(arc, state, null)];
    });
    return await publishStep(state, { ...journal, status: 'rolled-back', lockToken: owner.token }, scanned, publish, owner.holder);
  } finally {
    if (!interrupted) release(arc, owner);
  }
}

// --- the CLI ----------------------------------------------------------------

/**
 * Publish through the EXISTING job beside this script — the same scan, the
 * same token, the same branch. The account that may WRITE the archive is not
 * the one that may read the job's token-bearing config, so `PC_MAINT_PUBLISH`
 * names the command that runs the job as its own account (for example
 * `sudo -n -u setar-indexer sh /volume1/practice-compass-index/run-setar-index.sh`);
 * without it, the runner beside this script runs as the caller.
 *
 * The validated contentHash and this run's lock holder go to the job as its two
 * arguments (sudo keeps arguments, not environment): the job's own scan is
 * refused before any request unless it is that index, and its ref write
 * unless this run still holds the archive. Success needs the publisher's
 * evidence line naming that hash; anything less is a failure, never "published".
 */
export function publishWithRunner(expectedRoot) {
  return async (_text, contentHash, holder) => {
    const runner = join(dirname(fileURLToPath(import.meta.url)), 'run-setar-index.sh');
    const custom = process.env.PC_MAINT_PUBLISH;
    const args = [contentHash, holder];
    const out = spawnSync('sh', custom ? ['-c', `${custom} "$@"`, 'sh', ...args] : [runner, ...args], { encoding: 'utf8', env: process.env });
    const last = (t) => (t || '').trim().split('\n').pop();
    // Only the job's own refusals PROVE this attempt published nothing: 2 (its
    // configuration refused, nothing ran), 3 (the scan is not the validated
    // index, refused before any request) and 4 (the scan, or the publisher
    // before its ref write, failed). Any other exit, a signal or a failed
    // spawn may have come after GitHub accepted the ref: unknown.
    if (out.status === 3) throw new PublishFailed(`the job scanned a different index than the validated ${contentHash.slice(0, 12)} — is its archive root ${expectedRoot}? (${last(out.stderr)})`, true);
    if (out.status === 2 || out.status === 4) throw new PublishFailed(`the NAS job exited ${out.status} before publishing: ${last(out.stderr)}`, true);
    if (out.status !== 0) throw new PublishFailed(`the NAS job ${out.status === null ? `was stopped (${out.signal ?? out.error?.message ?? 'no exit status'})` : `exited ${out.status}`}: ${last(out.stderr)}`, false);
    const evidence = /^published-index (unchanged|published|created) ([0-9a-f]{64})$/.exec(last(out.stdout));
    if (!evidence) throw new PublishFailed('the job exited 0 without its publication evidence line', false);
    if (evidence[2] !== contentHash) throw new PublishFailed(`the job reports index ${evidence[2].slice(0, 12)}, not the validated ${contentHash.slice(0, 12)}`, false);
    return { status: evidence[1] };
  };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: 'string' },
      state: { type: 'string' },
      apply: { type: 'string' },
      record: { type: 'string' },
      piece: { type: 'string' },
      session: { type: 'string' },
      pieces: { type: 'string' },
      from: { type: 'string' },
      to: { type: 'string' },
      form: { type: 'string' },
      dastgah: { type: 'string' },
      composer: { type: 'string' },
    },
  });
  const [kind] = positionals;
  if (!values.root || !kind) {
    console.error('Usage: setar-archive-maintenance.mjs --root <archive> --state <private dir> status|register|roster|rename|retry|rollback|release-lock …');
    process.exit(2);
  }
  const publish = publishWithRunner(values.root);
  try {
    if (kind === 'status') {
      process.stdout.write(formatAttention(attentionReport(readStableSource(values.root))));
      return;
    }
    if (kind === 'release-lock') {
      console.log(releaseLock({ root: values.root, record: values.record }).lines.join('\n'));
      return;
    }
    if (kind === 'retry' || kind === 'rollback') {
      const out = await (kind === 'retry' ? retryMaintenance : rollbackMaintenance)({ root: values.root, state: values.state, publish });
      console.log(out.ok ? `Published index ${out.contentHash.slice(0, 12)} (${out.publication?.status ?? out.status}).` : out.message);
      process.exit(out.ok ? 0 : 1);
    }
    const session = values.session === undefined ? undefined : Number(values.session);
    const fields = Object.fromEntries(['form', 'dastgah', 'composer'].filter((f) => values[f] !== undefined).map((f) => [f, values[f]]));
    const action =
      kind === 'register'
        ? { kind, piece: values.piece, ...(session ? { session } : {}), ...(Object.keys(fields).length ? { fields } : {}) }
        : kind === 'roster'
          ? { kind, session, pieces: (values.pieces ?? '').split(',').map((p) => p.trim()).filter(Boolean) }
          : { kind, from: values.from, to: values.to };
    if (!values.apply) {
      const plan = planMaintenance(values.root, action);
      console.log(plan.lines.join('\n'));
      if (!plan.noop) console.log(`\nPreview ${plan.id}. Nothing was changed. To do exactly this, run the same command with --apply ${plan.id}`);
      return;
    }
    const out = await applyMaintenance({ root: values.root, state: values.state, action, previewId: values.apply, publish });
    console.log([...(out.lines ?? []), out.ok ? `Done. Published index ${out.contentHash?.slice(0, 12) ?? '(unchanged)'}; Refresh in the app.` : out.message].join('\n'));
    process.exit(out.ok ? 0 : 1);
  } catch (err) {
    console.error(err instanceof Refusal ? `Refused: ${err.message}` : `Failed: ${err.message}`);
    process.exit(1);
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

if (isDirectRun()) void main();
