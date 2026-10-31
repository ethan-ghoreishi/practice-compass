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
// PIECES.csv, RENAME-LOG.csv, the one file a `rename` names, and its own
// --state folder. Node stdlib only.

import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
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

const REGISTRY = 'PIECES.csv';
const LOG = 'RENAME-LOG.csv';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

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
 */
function journalFor(state, root, recovering) {
  const j = readJournal(state);
  if (!j) return null;
  if (!j.rootId) {
    if (recovering || j.status === 'prepared' || j.status === 'publish-failed') {
      throw new Refusal('The last change here was made by an earlier version of this tool, which did not record what it wrote; nothing was changed. Put its private copy back by hand (docs/nas-topology.md, rollback manifest).');
    }
    return null;
  }
  if (j.rootId !== rootIdOf(root)) throw new Refusal('This --state folder belongs to another archive; nothing was changed. Use that archive’s own --state folder.');
  // `status` says what the ARCHIVE holds (prepared | applied | rolling-back |
  // rolled-back), `publication` whether the source-index branch says it
  // (pending | published | failed | unknown | not-needed). An earlier version
  // of this lane folded the two into one status; read it conservatively.
  if (j.status === 'published') return { ...j, status: 'applied', publication: 'published' };
  if (j.status === 'publish-failed') return { ...j, status: 'applied', publication: 'unknown' };
  if (j.status === 'applied' || j.status === 'rolled-back') {
    if (!j.publication) return { ...j, publication: 'pending' };
    if (j.publication === 'unchanged' || j.publication === 'created') return { ...j, publication: 'published' };
    if (j.publication === 'publish-failed') return { ...j, publication: 'unknown' };
  }
  return j;
}

const lockPath = (state) => join(state, 'lock');
const readLock = (state) => {
  try {
    const [token, pid] = readFileSync(lockPath(state), 'utf8').split(' ');
    return { token, pid: Number(pid) };
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
};
const alive = (pid) => {
  // A lock not in this tool's form names no process that could be judged gone.
  if (!Number.isInteger(pid) || pid < 1) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err?.code === 'EPERM';
  }
};

/**
 * Take the --state folder's lock; returns the token that proves ownership.
 * A lock whose process is gone is ADOPTED by any run: every run that writes
 * the archive first records in the journal what it is doing (apply:
 * `prepared`, rollback: `rolling-back`), so the journal — read under the
 * lock, never the dead token — decides what may happen next. A live holder's
 * lock is never taken, and never removed.
 */
function lock(state) {
  const token = randomUUID();
  try {
    writeFileSync(lockPath(state), `${token} ${process.pid}`, { flag: 'wx' });
    return token;
  } catch (err) {
    if (err?.code !== 'EEXIST') throw err;
  }
  const held = readLock(state);
  if (held && !alive(held.pid)) {
    // ONE adopter per dead token: the claim is exclusive, and the lock is
    // re-read under it, so a second adopter (or a slow one that read the lock
    // before another adopted it) refuses instead of renaming over a live lock.
    const claim = `${lockPath(state)}.adopt.${held.token}`;
    try {
      writeFileSync(claim, `${token} ${process.pid}`, { flag: 'wx' });
    } catch (err) {
      if (err?.code !== 'EEXIST') throw err;
      const by = Number(readFileSync(claim, 'utf8').split(' ')[1]);
      // ponytail: a claimer killed mid-adoption is cleared here and this run
      // refuses; the next run adopts. A per-claim lease if that ever recurs.
      if (!alive(by)) rmSync(claim, { force: true });
      throw new Refusal('Another run is taking over an interrupted run’s lock; nothing was changed. Try again.');
    }
    try {
      const again = readLock(state);
      if (again?.token === held.token && !alive(again.pid)) {
        writeFileSync(`${lockPath(state)}.${token}`, `${token} ${process.pid}`, { flag: 'wx' });
        renameSync(`${lockPath(state)}.${token}`, lockPath(state));
        return token;
      }
    } finally {
      rmSync(claim, { force: true });
    }
  }
  throw new Refusal('Another maintenance run holds the lock; nothing was changed. Try again when it has finished.');
}
/** Remove the lock only if it is still OURS. */
const unlock = (state, token) => {
  if (readLock(state)?.token === token) rmSync(lockPath(state), { force: true });
};

/**
 * Replace a declaration through an exclusive temp and a rename — never
 * through a link, and only while it still holds `expected` (`null`: absent).
 * Another writer's edit since is never overwritten.
 */
function writeDeclaration(root, name, text, expected) {
  const p = join(root, name);
  const st = lstatOrNull(p);
  if (st && !st.isFile()) throw new Refusal(`${name} is not a regular file.`);
  if (readDeclaration(root, name, false) !== expected) throw new Refusal(`${name} changed while this ran; it was left as the other edit made it.`);
  const tmp = join(root, `.${name}.maintenance-${process.pid}`);
  writeFileSync(tmp, text, { flag: 'wx' });
  renameSync(tmp, p);
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
 * Publication failed. `nothingPublished` is a CLAIM, made only when the job
 * proved it (it refused or failed before its ref write); every other failure —
 * a non-zero or signalled exit, a lost response, an ordinary exception — is
 * UNKNOWN and said so, never promised.
 */
export class PublishFailed extends Error {
  constructor(message, nothingPublished) {
    super(message);
    this.nothingPublished = nothingPublished;
  }
}
const PUBLISHED = new Set(['unchanged', 'published', 'created']);

async function publishStep(state, journal, scanned, publish) {
  const contentHash = scanned.index.contentHash;
  let result;
  try {
    result = await publish(scanned.text, contentHash);
    // POSITIVE EVIDENCE or it did not happen: a publisher that returns no
    // status has proved nothing.
    if (!PUBLISHED.has(result?.status)) throw new PublishFailed('the publisher reported no publication', false);
  } catch (err) {
    const known = err?.nothingPublished === true;
    writeJournal(state, { ...journal, publication: known ? 'failed' : 'unknown', contentHash });
    return {
      ok: false,
      status: 'publish-failed',
      contentHash,
      message: known
        ? `The archive is changed and valid, but publication failed (${err?.message ?? 'unknown'}). The last good index is still the published one. Run \`retry\` to publish again.`
        : `The archive is changed and valid, but publication could not be confirmed (${err?.message ?? 'unknown'}); it may already be published. Run \`retry\`: it makes no new commit if the source-index branch already holds this index.`,
    };
  }
  // Published: a failure to RECORD it is never reported as a failure to publish.
  try {
    writeJournal(state, { ...journal, publication: 'published', contentHash });
  } catch (err) {
    throw new Error(`Index ${contentHash.slice(0, 12)} was published, but the private journal could not record it (${err.message}). Run \`retry\` to record it; it makes no new commit.`);
  }
  return { ok: true, status: 'published', contentHash, publication: result };
}

// --- applying ---------------------------------------------------------------

/**
 * Apply a previewed action. `previewId` must be the id the preview printed
 * against the archive as it is now. `publish(text, contentHash)` is the
 * existing job (CLI) or a fake Git boundary (tests). `interruptAfter` is a
 * test seam: 'copy' | 'registry' | 'log' | 'rename'.
 */
export async function applyMaintenance({ root: rootArg, state: stateArg, action, previewId, publish, interruptAfter }) {
  const root = resolve(rootArg);
  const state = stateDir(root, stateArg);
  const token = lock(state);
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

    // 2. The edit. Any failure here is put back from the copy, automatically.
    let scanned;
    try {
      if (plan.registry) writeDeclaration(root, REGISTRY, plan.registry.after, plan.registry.before);
      step('registry');
      if (plan.log) writeDeclaration(root, LOG, plan.log.after, plan.log.before);
      step('log');
      if (plan.rename) {
        const from = mediaPath(root, plan.rename.from);
        const to = mediaPath(root, plan.rename.to);
        if (lstatOrNull(to)) throw new Refusal(`"${plan.rename.to}" appeared while this ran; nothing is ever overwritten.`);
        renameSync(from, to);
        const moved = readFileSync(mediaPath(root, plan.rename.to));
        if (moved.length !== plan.rename.size || sha(moved) !== plan.rename.sha256) throw new Error('The renamed file does not hold the same bytes.');
      }
      step('rename');
      scanned = validateAndScan(root, state, action);
    } catch (err) {
      if (err instanceof Interrupted) throw err;
      try {
        restore(root, journal);
      } catch (why) {
        // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
        throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
      }
      // Back as it was before, which the last good index already says.
      writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed' });
      throw new Refusal(`The change did not validate (${err.message}); everything was put back from the private copy.`);
    }
    const applied = { ...journal, status: 'applied', publication: 'pending' };
    writeJournal(state, applied);
    // 3. Publication, through the existing job.
    return { ...(await publishStep(state, applied, scanned, publish)), lines: plan.lines };
  } finally {
    if (!interrupted) unlock(state, token);
  }
}

/**
 * Put back exactly what THIS change wrote — and nothing anyone wrote since.
 * Every file is judged BEFORE any is touched: a declaration still as it was
 * is left; one holding exactly what this change wrote is restored; anything
 * else (another run's row, a hand edit) refuses the whole restore. The renamed
 * file moves back only from its recorded name with its recorded bytes.
 */
function restore(root, journal, beforeWriting = () => {}) {
  const current = (name) => {
    const t = readDeclaration(root, name, false);
    return t === null ? null : sha(t);
  };
  const steps = [];
  for (const [name, w] of [
    [REGISTRY, journal.wrote.registry],
    [LOG, journal.wrote.log],
  ]) {
    const now = current(name);
    if (now === w.before) continue;
    if (now !== w.after) throw new Refusal(`${name} has changed since this change was made; it is left exactly as it is.`);
    steps.push(() => {
      const after = readDeclaration(root, name, false);
      if (w.before === null) {
        // The log did not exist before: keep what was written beside the copy, never delete it.
        renameSync(join(root, name), join(journal.copy, `${name}.written`));
      } else writeDeclaration(root, name, readFileSync(join(journal.copy, name), 'utf8'), after);
    });
  }
  const r = journal.rename;
  if (r) {
    const from = lstatOrNull(mediaPath(root, r.from));
    const to = lstatOrNull(mediaPath(root, r.to));
    if (!from && to?.isFile()) {
      const bytes = readFileSync(mediaPath(root, r.to));
      if (bytes.length !== r.size || sha(bytes) !== r.sha256) throw new Refusal(`"${r.to}" no longer holds the renamed bytes; it is left as it is.`);
      steps.unshift(() => renameSync(mediaPath(root, r.to), mediaPath(root, r.from)));
    } else if (!(from?.isFile() && !to)) {
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
  const token = lock(state);
  try {
    const journal = journalFor(state, root, true);
    if (!journal) throw new Refusal('Nothing has been applied here yet.');
    if (journal.status === 'prepared' || journal.status === 'rolling-back') {
      throw new Refusal(`The last ${journal.status === 'prepared' ? 'apply' : 'rollback'} did not finish; run \`rollback\`.`);
    }
    return await publishStep(state, { ...journal, lockToken: token }, validateAndScan(root, state, null), publish);
  } finally {
    unlock(state, token);
  }
}

/**
 * Put the last change back from its private copy, then publish the restored
 * archive. The lock comes FIRST and the journal is read under it; the journal
 * says `rolling-back`, with this run's token, before the first write, so an
 * interruption anywhere leaves a state the next `rollback` finishes.
 * `interruptAfter: 'mark'` is the test seam for that.
 */
export async function rollbackMaintenance({ root: rootArg, state: stateArg, publish, interruptAfter }) {
  const root = resolve(rootArg);
  const state = stateDir(root, stateArg);
  const token = lock(state);
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
    restore(root, journal, () => {
      writeJournal(state, { ...journal, status: 'rolling-back', lockToken: token });
      if (interruptAfter === 'mark') {
        interrupted = true;
        throw new Interrupted('interrupted after mark');
      }
    });
    const back = { ...journal, status: 'rolled-back', publication: 'pending', lockToken: token };
    writeJournal(state, back);
    return await publishStep(state, back, validateAndScan(root, state, null), publish);
  } finally {
    if (!interrupted) unlock(state, token);
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
 * The validated contentHash goes to the job as its ONE argument (sudo keeps
 * arguments, not environment): the job's own scan is refused before any
 * request unless it is that index. Success needs the publisher's evidence line
 * naming that hash; anything less is a failure, never "published".
 */
export function publishWithRunner(expectedRoot) {
  return async (_text, contentHash) => {
    const runner = join(dirname(fileURLToPath(import.meta.url)), 'run-setar-index.sh');
    const custom = process.env.PC_MAINT_PUBLISH;
    const out = spawnSync('sh', custom ? ['-c', `${custom} "$@"`, 'sh', contentHash] : [runner, contentHash], { encoding: 'utf8', env: process.env });
    const last = (t) => (t || '').trim().split('\n').pop();
    // Only the job's own refusals PROVE nothing was published: 2 (its
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
    console.error('Usage: setar-archive-maintenance.mjs --root <archive> --state <private dir> status|register|roster|rename|retry|rollback …');
    process.exit(2);
  }
  const publish = publishWithRunner(values.root);
  try {
    if (kind === 'status') {
      process.stdout.write(formatAttention(attentionReport(readStableSource(values.root))));
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
