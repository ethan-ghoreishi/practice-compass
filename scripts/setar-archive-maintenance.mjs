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
// that file's folder, and its own --state folder. A name it takes away is
// never unlinked: it is kept as a hidden `.<name>.superseded-<id>` (the same
// file, no bytes copied), so nothing anyone has open loses its file. Every write is proved against the exact state it expects
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
import { ARCHIVE_LOCK, readArchiveLock } from './publish-setar-index.mjs';

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

function stateDir(rootArg, stateArg) {
  if (!stateArg) throw new Refusal('Give a private --state folder outside the archive; it holds the rollback copies.');
  const st = lstatOrNull(stateArg);
  if (!st?.isDirectory()) throw new Refusal('The --state folder must already exist as a real folder (a link is never written through).');
  const state = realpathSync.native(stateArg).normalize('NFC');
  const root = realpathSync.native(resolve(rootArg)).normalize('NFC');
  if (state === root || state.startsWith(root + sep)) throw new Refusal('The --state folder must be OUTSIDE the archive: rollback copies are private.');
  return state;
}

const journalPath = (state) => join(state, 'journal.json');
const readJournal = (state) => (existsSync(journalPath(state)) ? JSON.parse(readFileSync(journalPath(state), 'utf8')) : null);
const writeJournal = (state, j) => {
  writeFileSync(`${journalPath(state)}.tmp`, `${JSON.stringify(j, null, 2)}\n`);
  renameSync(`${journalPath(state)}.tmp`, journalPath(state));
};

/** Which archive a --state folder serves: a digest, never the path itself. */
const rootIdOf = (root) => sha(realpathSync.native(root).normalize('NFC'));

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
function journalFor(state, root, recovering) {
  let j = readJournal(state);
  if (!j) return null;
  if (!j.rootId) {
    if (recovering || j.status === 'prepared' || j.status === 'publish-failed') {
      throw new Refusal('The last change here was made by an earlier version of this tool, which did not record what it wrote; nothing was changed. Put its private copy back by hand (docs/nas-topology.md, rollback manifest).');
    }
    return null;
  }
  if (j.rootId !== rootIdOf(root)) throw new Refusal('This --state folder belongs to another archive; nothing was changed. Use that archive’s own --state folder.');
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

// --- who owns the archive ----------------------------------------------------
//
// ONE lock per ARCHIVE (`ARCHIVE_LOCK` in its root, which the scanner skips),
// never per --state folder: every route that writes the archive takes it, and
// every publisher checks it before its ref write (`archiveConfirmation`), the
// scheduled job included. A record is written whole in a private folder that
// is RENAMED into place, so it is never partial, and removed only by its own
// unique name, so no release ever takes a newer run's lock. A lock is never adopted on a guess about a process
// (a pid can be reused, a publishing child outlives its parent): a run that
// finds one refuses, and the operator — having seen no maintenance or
// publication process is running, the indexer's sudo'd job included —
// releases that exact record (`release-lock`).

const same = (a, b) => Boolean(a && b && a.ino === b.ino && a.dev === b.dev);
const holderLine = (h) => (h.unreadable ? 'a record not in this tool’s form' : `run ${h.token.slice(0, 8)} (pid ${h.pid} on ${h.host}, since ${h.since})`);

function lockRefusal(root) {
  const held = readArchiveLock(root);
  if (!held) return new Refusal('Another maintenance run was just releasing the archive’s lock; nothing was changed. Try again.');
  return new Refusal(
    `The archive’s maintenance lock is held by ${holderLine(held)}; nothing was changed. If that run is still going, wait for it. ` +
      `If no maintenance run or publication is running — no setar-archive-maintenance.mjs, run-setar-index.sh or publish-setar-index.mjs process, including one run as setar-indexer through sudo (ps -ef) — release it with: release-lock --record ${held.digest.slice(0, 16)}; then the next run says what to finish.`,
  );
}

/**
 * Take the archive's lock, or refuse. The record is written whole in a private
 * folder that is then RENAMED into place — which fails while any lock stands,
 * and replaces only the empty folder a release leaves. Returns the token that
 * proves ownership. A run that stopped mid-write left a file under one of this
 * tool's private names: it is never recovered from automatically (a name proves
 * nothing about whose file it is); the run refuses and names it.
 */
function lock(root) {
  const token = randomUUID();
  const tmp = join(root, `${ARCHIVE_LOCK}.${token}`);
  mkdirSync(tmp);
  try {
    writeFileSync(join(tmp, `${token}.json`), `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
    renameSync(tmp, join(root, ARCHIVE_LOCK));
  } catch (err) {
    rmSync(tmp, { recursive: true, force: true }); // this run's own private folder
    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal(root);
    throw err;
  }
  try {
    refuseLeftovers(root);
  } catch (err) {
    unlock(root, token);
    throw err;
  }
  return token;
}

/** Every archive write first proves this run still holds the lock (an operator may have released it). */
function assertOwner(root, owner) {
  if (!lstatOrNull(join(root, ARCHIVE_LOCK, `${owner}.json`))?.isFile()) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand); it stopped before its next write.');
}

/** Remove the lock's folder once empty — never one holding anyone's record. */
function dropEmptyLock(root) {
  try {
    rmdirSync(join(root, ARCHIVE_LOCK));
  } catch {
    // not empty (a newer run holds it), already gone, or not a folder: left as it is
  }
}

/** Release THIS run's lock: only its own record, by its unique name; a newer run's is never touched. */
function unlock(root, token) {
  try {
    unlinkSync(join(root, ARCHIVE_LOCK, `${token}.json`));
  } catch (err) {
    if (err?.code === 'ENOENT') return; // released by hand already
    throw err;
  }
  dropEmptyLock(root);
}

/**
 * The operator's explicit route for a lock no run will take: shown first, then
 * released only by its exact record (a digest prefix of what is there), whatever
 * form it is in — a dead run's, a partial or foreign one. Only the entries that
 * record named are removed, each by its own name, so a lock taken since is never
 * touched. `at` is the test seam.
 */
export function releaseLock({ root: rootArg, record, at = noSeam }) {
  const root = resolve(rootArg);
  const held = readArchiveLock(root);
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
  let removed = 0;
  // Something at the lock's name that is not a folder is never this version's lock: unlink removes only it.
  for (const p of held.names ? held.names.map((n) => join(root, ARCHIVE_LOCK, n)) : [join(root, ARCHIVE_LOCK)]) {
    try {
      unlinkSync(p);
      removed += 1;
    } catch (err) {
      if (err?.code !== 'ENOENT') throw err;
    }
  }
  dropEmptyLock(root);
  if (!removed) throw stale();
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
function refuseLeftovers(root) {
  const found = [];
  for (const d of readdirSync(root, { withFileTypes: true })) {
    if (d.isFile() || d.isSymbolicLink()) {
      const m = /^\.(PIECES\.csv|RENAME-LOG\.csv)\.captured-/.exec(d.name);
      if (m) found.push(`  mv -n '${d.name}' '${m[1]}'   (if ${m[1]} is there, it is the copy a write replaced: mv -n '${d.name}' '${d.name.replace('.captured-', '.superseded-')}')`);
    } else if (d.isDirectory() && parseSessionFolderName(d.name)) {
      for (const f of readdirSync(join(root, d.name))) {
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
 * THE ONE PLACE a private name of this tool is retired — NEVER unlinked, and
 * its bytes never copied: it is RENAMED to a retained `.superseded-` name (the
 * scanner skips dotfiles; a rename never drops a file's last name), and only
 * then is `kept` judged to still name the same file (a link: the same
 * target). If it does not, the retained name is renamed back to `aside` and
 * false is returned: the private name still holds the very file. So no
 * failure, interruption or concurrent replacement can leave the file without
 * a name, and a program holding it open keeps writing into a named file.
 * `at(point, label)` is the seam, between the rename and the judgement.
 */
function retireKeeping(aside, kept, at, label) {
  const st = lstatSync(aside);
  const target = st.isSymbolicLink() ? readlinkSync(aside) : null;
  const retained = keep(aside);
  at('retain-aside', label);
  const k = lstatOrNull(kept);
  if (target === null ? same(k, st) : Boolean(k?.isSymbolicLink()) && readlinkSync(kept) === target) return true;
  renameSync(retained, aside);
  return false;
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

/** A private name RETIRED: the file is kept, never unlinked, under a name no other write uses. */
function keep(aside) {
  const kept = aside.replace(/\.(captured|dropping)-/, '.superseded-');
  renameSync(aside, kept);
  return kept;
}

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
function replaceDeclaration({ root, owner, at, written }, name, text, expected, keepDir) {
  assertOwner(root, owner);
  const p = join(root, name);
  const tmp = text === null ? null : join(root, `.${name}.maintenance-${randomUUID()}`);
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
    const aside = capture(root, name);
    if (!aside) throw new Refusal(`${name} was removed while this ran; nothing was put in its place.`);
    const st = lstatSync(aside);
    if (!st.isFile() || sha(readFileSync(aside)) !== expected) {
      putBack(root, name, aside, at);
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
      putBack(root, name, aside, at);
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
 * Run `fn(stillBound)` INSIDE one session folder, bound by its inode: it must
 * be a real folder directly in the archive at the instant this starts (never a
 * link), and every name `fn` touches is a bare leaf resolved against that
 * bound folder — never the folder's path again, so swapping the folder for a
 * link cannot carry a write outside. `stillBound()` says whether the folder
 * still stands at its name; `fn` asks before each step that commits anything.
 */
// ponytail: process-wide cwd, the only stdlib way to resolve names against a
// bound directory (Node has no linkat/openat); the tool is single-threaded.
function inFolder(root, folder, fn) {
  const st = lstatOrNull(join(root, folder));
  if (!st?.isDirectory()) throw new Refusal(`The folder "${folder}" is not a real folder in the archive (a link is never followed); nothing was moved.`);
  const back = process.cwd();
  process.chdir(join(root, folder));
  try {
    if (!same(statSync('.'), st)) throw new Refusal(`The folder "${folder}" changed while this ran; nothing was moved.`);
    return fn(() => same(lstatOrNull(join(root, folder)), st));
  } finally {
    process.chdir(back);
  }
}

/**
 * Give one media file a new name in its folder, never overwriting and never
 * moving bytes other than the recorded ones: the new name is LINKED (fails if
 * anything is there), what it names is judged (same file, recorded size and
 * SHA-256, the folder still at its name), and only then is the old name
 * retired to a hidden `.superseded-` name, never unlinked — while the new name still holds the file. A judged failure removes
 * only the name this call made, while the old name still holds the file —
 * inside the bound folder, wherever it now is; nothing has moved. Whichever
 * name another writer replaces meanwhile, the file keeps the other, and the
 * refusal says which.
 */
function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
  assertOwner(root, owner);
  const [from, to] = [fromRel, toRel].map((rel) => rel.split('/')[1]);
  inFolder(root, fromRel.split('/')[0], (stillBound) => {
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
 * Take the leaf name `name` away (inside a bound folder; kept hidden, never
 * unlinked: `retireKeeping`) only while it names the
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
function validateAndScan(root, state, action) {
  const index = buildIndex(readStableSource(root));
  if (action?.kind === 'register' && !index.pieces.some((p) => p.key === action.piece)) throw new Error('The registry does not show the new piece after the edit.');
  if (action?.kind === 'roster' && !action.pieces.every((k) => index.pieces.find((p) => p.key === k)?.sessions.includes(action.session))) {
    throw new Error('The registry does not show the roster after the edit.');
  }
  const text = `${JSON.stringify(index, null, 2)}\n`;
  writeIndexAtomically(join(state, 'scratch-index.json'), text, root);
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
async function publishStep(state, base, scanned, publish, token) {
  const contentHash = scanned.index.contentHash;
  const before = base.unresolved ?? [];
  const attempt = { ...base, publication: 'pending', contentHash, unresolved: [...new Set([...before, contentHash])] };
  writeJournal(state, attempt);
  let result;
  try {
    result = await publish(scanned.text, contentHash, token);
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
 * against the archive as it is now. `publish(text, contentHash, lockToken)` is
 * the existing job (CLI) or a fake Git boundary (tests). `interruptAfter` is a
 * test seam: 'copy' | 'registry' | 'log' | 'rename'; `at(point, name)` another,
 * called just before each archive write.
 */
export async function applyMaintenance({ root: rootArg, state: stateArg, action, previewId, publish, interruptAfter, at = noSeam }) {
  const root = resolve(rootArg);
  const state = stateDir(root, stateArg);
  const token = lock(root);
  // What THIS run has changed in the archive, recorded at the instant of each change: its automatic put-back judges only those.
  const ctx = { root, owner: token, at, written: new Set() };
  let interrupted = false;
  try {
    const prior = journalFor(state, root);
    if (prior?.status === 'prepared' || prior?.status === 'rolling-back') {
      throw new Refusal(`An earlier ${prior.status === 'prepared' ? 'apply' : 'rollback'} did not finish. Run \`rollback\` first; nothing else was changed.`);
    }
    if (prior && !['published', 'not-needed'].includes(prior.publication)) {
      throw new Refusal('An earlier change is not yet published (or its publication is unconfirmed). Run `retry` first; nothing else was changed.');
    }
    const plan = planMaintenance(root, action);
    if (plan.id !== previewId) throw new Refusal('The archive changed since that preview (or the preview is for something else). Preview again; nothing was changed.');
    if (plan.noop) return { ok: true, status: 'unchanged', lines: plan.lines };

    // 1. The private rollback copy, BEFORE any edit.
    const copy = join(state, `${new Date().toISOString().replace(/[:.]/g, '-')}-${plan.id}`);
    mkdirSync(copy);
    // BOTH declarations, whatever this action edits: a rollback restores the pair as it was.
    const registryBefore = readDeclaration(root, REGISTRY, true);
    const logBefore = readDeclaration(root, LOG, false);
    const logWasPresent = logBefore !== null;
    writeFileSync(join(copy, REGISTRY), registryBefore, { flag: 'wx' });
    if (logWasPresent) writeFileSync(join(copy, LOG), logBefore, { flag: 'wx' });
    // What this change WROTE, by digest: the only state a restore may undo.
    const digest = (t) => (t === null ? null : sha(t));
    const wrote = {
      registry: { before: digest(registryBefore), after: digest(plan.registry ? plan.registry.after : registryBefore) },
      log: { before: digest(logBefore), after: digest(plan.log ? plan.log.after : logBefore) },
    };
    const journal = { id: plan.id, action, copy, rootId: rootIdOf(root), logWasPresent, wrote, rename: plan.rename, lockToken: token, status: 'prepared' };
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
    let scanned;
    try {
      if (plan.registry) replaceDeclaration(ctx, REGISTRY, plan.registry.after, digest(plan.registry.before));
      step('registry');
      if (plan.log) replaceDeclaration(ctx, LOG, plan.log.after, digest(plan.log.before));
      step('log');
      if (plan.rename) moveExact(ctx, plan.rename.from, plan.rename.to, plan.rename);
      step('rename');
      at('scan', 'archive');
      scanned = validateAndScan(root, state, action);
    } catch (err) {
      if (err instanceof Interrupted) throw err;
      try {
        restore({ ...ctx, written: null }, journal, undefined, ctx.written);
      } catch (why) {
        // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
        throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
      }
      // This run published nothing, and the archive is as it was before it.
      writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed', unresolved: [] });
      throw new Refusal(`The change did not validate (${err.message}); ${ctx.written.size ? 'everything it changed was put back from the private copy' : 'it had changed nothing in the archive'}.`);
    }
    // 3. Publication, through the existing job.
    return { ...(await publishStep(state, { ...journal, status: 'applied', unresolved: [] }, scanned, publish, token)), lines: plan.lines };
  } finally {
    if (!interrupted) unlock(root, token);
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
  const { root } = ctx;
  const current = (name) => {
    const t = readDeclaration(root, name, false);
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
    const fromSt = lstatOrNull(mediaPath(root, r.from));
    const toSt = lstatOrNull(mediaPath(root, r.to));
    const holds = (rel) => {
      const bytes = readFileSync(mediaPath(root, rel));
      return bytes.length === r.size && sha(bytes) === r.sha256;
    };
    if (!fromSt && toSt?.isFile()) {
      if (!holds(r.to)) throw new Refusal(`"${r.to}" no longer holds the renamed bytes; it is left as it is.`);
      steps.unshift(() => moveExact(ctx, r.to, r.from, r));
    } else if (same(fromSt, toSt) && toSt.isFile()) {
      // A move stopped between its two names: the new name is the one to drop — the bytes stay at the old one, whatever they are.
      steps.unshift(() => {
        assertOwner(root, ctx.owner);
        const [from, to] = [r.from, r.to].map((rel) => rel.split('/')[1]);
        inFolder(root, r.from.split('/')[0], (stillBound) => {
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
  const root = resolve(rootArg);
  const state = stateDir(root, stateArg);
  const token = lock(root);
  try {
    const journal = journalFor(state, root, true);
    if (!journal) throw new Refusal('Nothing has been applied here yet.');
    if (journal.status === 'prepared' || journal.status === 'rolling-back') {
      throw new Refusal(`The last ${journal.status === 'prepared' ? 'apply' : 'rollback'} did not finish; run \`rollback\`.`);
    }
    return await publishStep(state, { ...journal, lockToken: token }, validateAndScan(root, state, null), publish, token);
  } finally {
    unlock(root, token);
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
  const state = stateDir(root, stateArg);
  const token = lock(root);
  let interrupted = false;
  try {
    const journal = journalFor(state, root, true);
    if (!journal || journal.status === 'rolled-back') {
      throw new Refusal(
        journal && !['published', 'not-needed'].includes(journal.publication)
          ? 'The last change is already rolled back but not yet published; run `retry`.'
          : 'There is no change here to roll back.',
      );
    }
    restore({ root, owner: token, at }, journal, () => {
      writeJournal(state, { ...journal, status: 'rolling-back', lockToken: token });
      if (interruptAfter === 'mark') {
        interrupted = true;
        throw new Interrupted('interrupted after mark');
      }
    });
    const scanned = validateAndScan(root, state, null);
    return await publishStep(state, { ...journal, status: 'rolled-back', lockToken: token }, scanned, publish, token);
  } finally {
    if (!interrupted) unlock(root, token);
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
 * The validated contentHash and this run's lock token go to the job as its two
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
