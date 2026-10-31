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

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
    const src = lstatOrNull(join(root, from));
    const dst = lstatOrNull(join(root, to));
    if (logged && !src && dst?.isFile()) {
      plan.noop = true;
      plan.lines.push(`"${from}" was already renamed to "${to}" and logged. Nothing to do.`);
      return finish(plan, registryText, logText);
    }
    if (!src) throw new Refusal(`"${from}" is not in the archive.`);
    if (!src.isFile()) throw new Refusal(`"${from}" is not a regular file (a link is never renamed).`);
    if (dst) throw new Refusal(`"${to}" already exists; nothing is ever overwritten.`);
    const folder = lstatOrNull(join(root, to.split('/')[0]));
    if (!folder?.isDirectory()) throw new Refusal(`The folder of "${to}" is not a real folder in the archive.`);
    // The log stays a function: never a fork, never a loop, never two names into one.
    if (rows.some((r) => r.from === from && r.to !== to)) throw new Refusal(`The log already renames "${from}" to another name; a second destination would make it unreadable.`);
    if (rows.some((r) => r.from === to)) throw new Refusal(`The log already renames "${to}" onward; this would make a loop.`);
    if (rows.some((r) => r.to === to && r.from !== from)) throw new Refusal(`The log already names another file as "${to}".`);
    const bytes = readFileSync(join(root, from));
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

function lock(state) {
  try {
    writeFileSync(join(state, 'lock'), String(process.pid), { flag: 'wx' });
  } catch (err) {
    if (err?.code === 'EEXIST') {
      throw new Refusal('Another maintenance run holds the lock, or one was interrupted. Run `rollback` to put the last change back (or `retry` if it was applied), then try again.');
    }
    throw err;
  }
}
const unlock = (state) => rmSync(join(state, 'lock'), { force: true });

/** Replace a declaration through an exclusive temp and a rename — never through a link. */
function writeDeclaration(root, name, text) {
  const p = join(root, name);
  const st = lstatOrNull(p);
  if (st && !st.isFile()) throw new Refusal(`${name} is not a regular file.`);
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

async function publishStep(state, journal, scanned, publish) {
  try {
    const result = await publish(scanned.text, scanned.index.contentHash);
    writeJournal(state, { ...journal, status: 'published', contentHash: scanned.index.contentHash, publication: result?.status ?? 'published' });
    return { ok: true, status: 'published', contentHash: scanned.index.contentHash, publication: result };
  } catch (err) {
    writeJournal(state, { ...journal, status: 'publish-failed', contentHash: scanned.index.contentHash });
    return {
      ok: false,
      status: 'publish-failed',
      contentHash: scanned.index.contentHash,
      message: `The archive is changed and valid, but publication failed (${err?.message ?? 'unknown'}). The last good index is still the published one. Run \`retry\` to publish again.`,
    };
  }
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
  lock(state);
  let interrupted = false;
  try {
    const prior = readJournal(state);
    if (prior && (prior.status === 'prepared' || prior.status === 'publish-failed')) {
      throw new Refusal(
        prior.status === 'prepared'
          ? 'An earlier apply did not finish. Run `rollback` first; nothing else was changed.'
          : 'An earlier change is applied but not yet published. Run `retry` first.',
      );
    }
    const plan = planMaintenance(root, action);
    if (plan.id !== previewId) throw new Refusal('The archive changed since that preview (or the preview is for something else). Preview again; nothing was changed.');
    if (plan.noop) return { ok: true, status: 'unchanged', lines: plan.lines };

    // 1. The private rollback copy, BEFORE any edit.
    const copy = join(state, `${new Date().toISOString().replace(/[:.]/g, '-')}-${plan.id}`);
    mkdirSync(copy);
    // BOTH declarations, whatever this action edits: a rollback restores the pair as it was.
    const logWasPresent = readDeclaration(root, LOG, false) !== null;
    copyFileSync(join(root, REGISTRY), join(copy, REGISTRY));
    if (logWasPresent) copyFileSync(join(root, LOG), join(copy, LOG));
    const journal = { id: plan.id, action, copy, logWasPresent, rename: plan.rename, status: 'prepared' };
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
      if (plan.registry) writeDeclaration(root, REGISTRY, plan.registry.after);
      step('registry');
      if (plan.log) writeDeclaration(root, LOG, plan.log.after);
      step('log');
      if (plan.rename) {
        renameSync(join(root, plan.rename.from), join(root, plan.rename.to));
        const moved = readFileSync(join(root, plan.rename.to));
        if (moved.length !== plan.rename.size || sha(moved) !== plan.rename.sha256) throw new Error('The renamed file does not hold the same bytes.');
      }
      step('rename');
      scanned = validateAndScan(root, state, action);
    } catch (err) {
      if (err instanceof Interrupted) throw err;
      restore(root, journal);
      writeJournal(state, { ...journal, status: 'rolled-back' });
      throw new Refusal(`The change did not validate (${err.message}); everything was put back from the private copy.`);
    }
    const applied = { ...journal, status: 'applied' };
    writeJournal(state, applied);
    // 3. Publication, through the existing job.
    return { ...(await publishStep(state, applied, scanned, publish)), lines: plan.lines };
  } finally {
    if (!interrupted) unlock(state);
  }
}

/** Put the declarations and the one renamed file back exactly as the copy holds them. */
function restore(root, journal) {
  const reg = readFileSync(join(journal.copy, REGISTRY), 'utf8');
  if (readDeclaration(root, REGISTRY, true) !== reg) writeDeclaration(root, REGISTRY, reg);
  if (journal.logWasPresent) {
    const log = readFileSync(join(journal.copy, LOG), 'utf8');
    if (readDeclaration(root, LOG, false) !== log) writeDeclaration(root, LOG, log);
  } else if (lstatOrNull(join(root, LOG))?.isFile()) {
    // The log did not exist before: keep what was written beside the copy, never delete it.
    renameSync(join(root, LOG), join(journal.copy, `${LOG}.written`));
  }
  const r = journal.rename;
  if (r && !lstatOrNull(join(root, r.from)) && lstatOrNull(join(root, r.to))?.isFile()) {
    const bytes = readFileSync(join(root, r.to));
    if (bytes.length !== r.size || sha(bytes) !== r.sha256) throw new Refusal(`"${r.to}" no longer holds the renamed bytes; it is left as it is.`);
    renameSync(join(root, r.to), join(root, r.from));
  }
}

/** Validate, scan and publish again from the retained state — after a failed publication. */
export async function retryMaintenance({ root: rootArg, state: stateArg, publish }) {
  const root = resolve(rootArg);
  const state = stateDir(root, stateArg);
  const journal = readJournal(state);
  if (!journal || journal.status === 'prepared') throw new Refusal(journal ? 'The last apply did not finish; run `rollback`.' : 'Nothing has been applied here yet.');
  lock(state);
  try {
    return await publishStep(state, journal, validateAndScan(root, state, null), publish);
  } finally {
    unlock(state);
  }
}

/** Put the last change back from its private copy, then publish the restored archive. */
export async function rollbackMaintenance({ root: rootArg, state: stateArg, publish }) {
  const root = resolve(rootArg);
  const state = stateDir(root, stateArg);
  const journal = readJournal(state);
  if (!journal || journal.status === 'rolled-back') throw new Refusal('There is no change here to roll back.');
  restore(root, journal);
  const back = { ...journal, status: 'rolled-back' };
  writeJournal(state, back);
  unlock(state);
  const scanned = validateAndScan(root, state, null);
  const out = await publishStep(state, back, scanned, publish);
  writeJournal(state, { ...back, publication: out.status });
  return out;
}

// --- the CLI ----------------------------------------------------------------

/**
 * Publish through the EXISTING job beside this script — the same scan, the
 * same token, the same branch. The account that may WRITE the archive is not
 * the one that may read the job's token-bearing config, so `PC_MAINT_PUBLISH`
 * names the command that runs the job as its own account (for example
 * `sudo -n -u setar-indexer sh /volume1/practice-compass-index/run-setar-index.sh`);
 * without it, the runner beside this script runs as the caller.
 */
function publishWithRunner(expectedRoot) {
  return async (_text, contentHash) => {
    const runner = join(dirname(fileURLToPath(import.meta.url)), 'run-setar-index.sh');
    const custom = process.env.PC_MAINT_PUBLISH;
    const out = spawnSync('sh', custom ? ['-c', custom] : [runner], { encoding: 'utf8', env: process.env });
    if (out.status !== 0) throw new Error(`the NAS job exited ${out.status}: ${(out.stderr || '').trim().split('\n').pop()}`);
    // The job scans ITS configured root: it must have published what this run validated.
    const printed = /\(([0-9a-f]{12})\)/.exec(out.stderr ?? '')?.[1];
    if (printed && printed !== contentHash.slice(0, 12)) {
      throw new Error(`the job published index ${printed}, not the repaired ${contentHash.slice(0, 12)} — is its archive root ${expectedRoot}?`);
    }
    return { status: /unchanged/i.test(out.stdout + out.stderr) ? 'unchanged' : 'published' };
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
