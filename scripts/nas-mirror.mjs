#!/usr/bin/env node
// Publish this repository's build as an OPTIONAL HTTPS mirror on a NAS share.
//
//   node scripts/nas-mirror.mjs --dest <folder> [--base /<path>/]           # dry run
//   node scripts/nas-mirror.mjs --dest <folder> [--base /<path>/] --apply   # publish
//
// It replaces `deploy-nas.sh`, whose `rsync --delete` emptied a folder that was
// really the owner's media tree (2026-09-30) — and Synology Drive then carried
// the deletions to the other copy. On this setup a path's NAME says nothing
// about what it reaches: SMB shows a server-side link as an ordinary folder. So
// this tool trusts no path. A folder is its own only if it CREATED it, or the
// folder holds this tool's marker, whose claims journal lists every path the
// tool ever created there. It never deletes anything, and every write is an
// atomic replacement of a path it claims. docs/nas-topology.md is the map.
//
// A dry run still runs the build (into the repository's own `dist/`) so it can
// say what it would create or replace; it writes nothing at the destination.
//
// Node stdlib only.

import { randomBytes } from 'node:crypto';
import { lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const TOOL = 'practice-compass/nas-mirror';
/** The marker, and with it the claims journal. */
export const MARKER = '.practice-compass-mirror.json';
/** The marker's own temp: a fixed prefix, and the only name never journaled. */
export const MARKER_TEMP = `${MARKER}.tmp-`;
/** Every other temp is uniquely named AND journaled before it is created. */
export const TEMP = '.practice-compass-mirror-tmp-';
/** Defence in depth only — never the proof of ownership. */
export const MEDIA_MARKERS = ['setar-classes', 'tar-classes', 'classical-guitar', 'PIECES.csv', '.SynologyWorkingDirectory'];

const REPO = dirname(dirname(realpathSync(fileURLToPath(import.meta.url))));
const USAGE = 'Usage: node scripts/nas-mirror.mjs --dest <folder> [--base /<path>/] [--apply]';

/** Never touched, never claimed, never refused: macOS and DSM write these on their own. */
const isHousekeeping = (name) => name === '.DS_Store' || name.startsWith('._') || name === '@eaDir' || name === '#recycle';

class Refusal extends Error {}
const refuse = (message) => {
  throw new Refusal(message);
};

const kindOf = (st) =>
  st.isSymbolicLink() ? 'a symbolic link' : st.isFIFO() ? 'a FIFO' : st.isSocket() ? 'a socket' : st.isBlockDevice() || st.isCharacterDevice() ? 'a device' : 'not a regular file or folder';

/** Why a relative path is not one this tool may claim, or null. */
function unsafeName(dest, rel) {
  if (typeof rel !== 'string') return 'is not a string';
  if (!rel || isAbsolute(rel)) return 'is absolute or empty';
  if (!resolve(dest, rel).startsWith(dest + sep)) return 'resolves outside the destination';
  if (rel.includes('\\')) return 'contains a backslash';
  const segs = rel.split('/');
  if (segs.some((s) => s === '' || s === '.' || s === '..')) return 'has an empty, "." or ".." segment';
  if (segs.some((s) => s === MARKER || s.startsWith(MARKER_TEMP))) return "uses the mirror's own marker name";
  return null;
}

/** Real path where it exists; the real path of the nearest existing ancestor otherwise. */
function realOrResolved(p) {
  try {
    return realpathSync.native(p);
  } catch {
    const up = dirname(p);
    return up === p ? p : join(realOrResolved(up), basename(p));
  }
}

function checkNesting(dest, buildDir) {
  const d = realOrResolved(dest);
  const b = realOrResolved(buildDir);
  if (d === b || d.startsWith(b + sep)) refuse(`${dest} is inside the build folder ${buildDir}.`);
  if (b.startsWith(d + sep)) refuse(`${dest} contains the build folder ${buildDir}.`);
}

function listDir(dir) {
  try {
    return readdirSync(dir).sort();
  } catch (err) {
    return refuse(`${dir} cannot be read (${err.code ?? err.message}).`);
  }
}

function readMarker(dest) {
  const p = join(dest, MARKER);
  let st;
  try {
    st = lstatSync(p);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    return refuse(`${p} cannot be read (${err.code}).`);
  }
  if (!st.isFile()) refuse(`${p} is ${kindOf(st)}, not the mirror's marker.`);
  let data;
  try {
    data = JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    refuse(`${p} is not valid JSON, so ${dest} cannot be proved to be the mirror's.`);
  }
  if (!data || data.tool !== TOOL) refuse(`${p} names another tool (${JSON.stringify(data?.tool)}), not ${TOOL}.`);
  if (!Array.isArray(data.claims)) refuse(`${p} has no claims list.`);
  for (const claim of data.claims) {
    const why = unsafeName(dest, claim);
    if (why) refuse(`${p} claims ${JSON.stringify(claim)}, which ${why}.`);
  }
  return new Set(data.claims);
}

/**
 * The ownership decision. Returns `{ state: 'absent' }` for a folder this run
 * may create, or `{ state: 'owned', claims, entries }` for one holding a valid
 * marker and nothing it cannot account for. Everything else REFUSES, naming
 * the entry: a walk that never follows a link may find only the marker and its
 * temps, claimed files, folders holding claimed files, and housekeeping.
 */
export function inspectDestination(dest) {
  const parent = dirname(dest);
  let parentStat;
  try {
    parentStat = statSync(parent);
  } catch {
    refuse(`The parent folder ${parent} does not exist — is the share mounted?`);
  }
  if (!parentStat.isDirectory()) refuse(`${parent} is not a folder.`);

  let st;
  try {
    st = lstatSync(dest);
  } catch (err) {
    if (err.code !== 'ENOENT') refuse(`${dest} cannot be read (${err.code}).`);
    const media = listDir(parent).filter((n) => MEDIA_MARKERS.some((m) => m.toLowerCase() === n.toLowerCase()));
    if (media.length) refuse(`Will not create ${dest}: its parent holds ${media.join(', ')}, which marks a media tree.`);
    return { state: 'absent', claims: new Set(), entries: new Map() };
  }
  if (st.isSymbolicLink()) refuse(`${dest} is a symbolic link; the mirror never writes through one.`);
  if (!st.isDirectory()) refuse(`${dest} exists and is ${kindOf(st)}.`);

  const claims = readMarker(dest);
  if (!claims) {
    const held = listDir(dest).filter((n) => !isHousekeeping(n));
    if (held.length && held.every((n) => n.startsWith(MARKER_TEMP))) {
      refuse(
        `${dest} is the mirror's own unfinished first publish: it holds only ${held.join(', ')} and no ${MARKER}. ` +
          'Delete that folder yourself and publish again.',
      );
    }
    if (!held.length) {
      refuse(
        `${dest} is empty and has no ${MARKER}, so nothing proves it is the mirror's. ` +
          "If it is the mirror's own unfinished first publish, delete it yourself and publish again; otherwise choose a new folder.",
      );
    }
    const media = held.filter((n) => MEDIA_MARKERS.some((m) => m.toLowerCase() === n.toLowerCase()));
    const shown = held.slice(0, 8).join(', ') + (held.length > 8 ? `, … (${held.length} entries)` : '');
    refuse(
      `${dest} exists and has no ${MARKER}, so it is not the mirror's. It holds: ${shown}.` +
        (media.length ? ` ${media.join(', ')} marks a media tree.` : ''),
    );
  }

  const holding = new Set();
  for (const c of claims) {
    const segs = c.split('/');
    for (let i = 1; i < segs.length; i += 1) holding.add(segs.slice(0, i).join('/'));
  }
  const entries = new Map();
  const visit = (relDir) => {
    for (const name of listDir(relDir ? join(dest, relDir) : dest)) {
      if (isHousekeeping(name)) continue;
      const rel = relDir ? `${relDir}/${name}` : name;
      let e;
      try {
        e = lstatSync(join(dest, rel));
      } catch (err) {
        refuse(`${rel} cannot be read (${err.code}).`);
      }
      if (!relDir && (name === MARKER || name.startsWith(MARKER_TEMP))) {
        if (!e.isFile()) refuse(`${rel} is ${kindOf(e)}.`);
        continue;
      }
      if (e.isDirectory()) {
        if (claims.has(rel)) refuse(`${rel} is claimed as a file but is now a folder.`);
        if (!holding.has(rel)) refuse(`${rel} is a folder the mirror never claimed.`);
        entries.set(rel, { type: 'dir' });
        visit(rel);
      } else if (e.isFile()) {
        if (!claims.has(rel)) refuse(`${rel} is a file the mirror never claimed.`);
        entries.set(rel, { type: 'file', size: e.size });
      } else {
        refuse(`${rel} is ${kindOf(e)}; the mirror only ever writes regular files and folders.`);
      }
    }
  };
  visit('');
  return { state: 'owned', claims, entries };
}

/** The build gets the same sweep before anything is written. Returns its files. */
export function sweepBuild(buildDir) {
  let st;
  try {
    st = lstatSync(buildDir);
  } catch {
    refuse(`The build produced no ${buildDir}.`);
  }
  if (!st.isDirectory()) refuse(`The build folder ${buildDir} is ${kindOf(st)}.`);
  const files = [];
  const visit = (relDir) => {
    for (const name of listDir(relDir ? join(buildDir, relDir) : buildDir)) {
      if (isHousekeeping(name)) continue;
      const rel = relDir ? `${relDir}/${name}` : name;
      const why = name.startsWith(TEMP) ? "uses the mirror's own temp name" : unsafeName(buildDir, rel);
      if (why) refuse(`The build contains ${rel}, which ${why}.`);
      const e = lstatSync(join(buildDir, rel));
      if (e.isDirectory()) visit(rel);
      else if (e.isFile()) files.push(rel);
      else refuse(`The build contains ${rel}, which is ${kindOf(e)}.`);
    }
  };
  visit('');
  if (!files.length) refuse(`The build folder ${buildDir} is empty.`);
  return files;
}

/** The plan is fixed at the final check: only files that are absent or differ. */
function planWrites(dest, inspected, buildDir, files) {
  const dirs = [];
  const writes = [];
  for (const rel of files) {
    const segs = rel.split('/');
    for (let i = 1; i < segs.length; i += 1) {
      const d = segs.slice(0, i).join('/');
      const held = inspected.entries.get(d);
      if (held?.type === 'file') refuse(`The build needs ${d} as a folder, but the mirror holds a file there.`);
      if (!held && !dirs.includes(d)) dirs.push(d);
    }
    const held = inspected.entries.get(rel);
    if (held?.type === 'dir') refuse(`The build file ${rel} would replace a folder.`);
    const bytes = readFileSync(join(buildDir, rel));
    if (held && held.size === bytes.length && readFileSync(join(dest, rel)).equals(bytes)) continue;
    writes.push({ rel, bytes, action: held ? 'replace' : 'create' });
  }
  return { dirs, writes };
}

/** Every component between the destination and `rel`'s folder is a real directory. */
function assertRealDirs(dest, rel) {
  const segs = rel.split('/').slice(0, -1);
  for (let i = 0; i <= segs.length; i += 1) {
    const p = join(dest, ...segs.slice(0, i));
    const st = lstatSync(p);
    if (st.isSymbolicLink() || !st.isDirectory()) throw new Error(`${p} is no longer a real folder; stopped before writing through it.`);
  }
}

/**
 * THE WRITER. An exclusively created temp (`wx` never opens an existing entry
 * and never follows a link), the folders checked with lstat, then a rename onto
 * the claimed path — which replaces the ENTRY, so neither a symlink nor a hard
 * link standing there is ever written through. `onTemp` is a test seam.
 */
export function replaceAtomically(dest, rel, temp, bytes, onTemp) {
  assertRealDirs(dest, rel);
  writeFileSync(join(dest, temp), bytes, { flag: 'wx' });
  onTemp?.({ rel, temp });
  assertRealDirs(dest, rel);
  renameSync(join(dest, temp), join(dest, rel));
}

function npmBuild({ base }) {
  const r = spawnSync('npm', ['run', 'build'], { cwd: REPO, env: { ...process.env, PC_BASE: base }, stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`The build failed (${r.error?.message ?? `exit ${r.status ?? r.signal}`}).`);
}

/**
 * The whole command. Returns an exit code; never calls `process.exit`. `deps`
 * injects the build (`build({ base, buildDir })`), the build folder, the
 * output sinks and the writer's `onTemp` seam, so tests never run Vite.
 */
export async function run(argv, deps = {}) {
  const out = deps.log ?? ((s) => console.log(s));
  const err = deps.err ?? ((s) => console.error(s));
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: { dest: { type: 'string' }, base: { type: 'string' }, apply: { type: 'boolean' } },
    }));
  } catch (e) {
    err(e.message);
    err(USAGE);
    return 2;
  }
  if (!values.dest) {
    err(USAGE);
    return 2;
  }
  let applying = false;
  try {
    const dest = resolve(values.dest);
    const name = basename(dest);
    if (values.base === undefined && !/^[A-Za-z0-9._-]+$/.test(name)) {
      refuse(`The folder name "${name}" is not URL-safe; pass --base /<path>/ to say where it is served.`);
    }
    const base = values.base ?? `/${name}/`;
    if (!/^\/([A-Za-z0-9._-]+\/)*$/.test(base)) refuse(`--base ${JSON.stringify(base)} must look like /<path>/.`);
    const buildDir = resolve(deps.buildDir ?? join(REPO, 'dist'));

    // 1. ownership
    checkNesting(dest, buildDir);
    const first = inspectDestination(dest);
    out(`Destination: ${dest} (${first.state === 'absent' ? 'will be created' : 'the mirror\'s own'})`);
    const siblings = listDir(dirname(dest));
    out(`Its parent holds: ${siblings.slice(0, 12).join(', ')}${siblings.length > 12 ? `, … (${siblings.length})` : ''}`);
    // 2-3. build, then sweep it
    out(`Building with PC_BASE=${base} …`);
    await (deps.build ?? npmBuild)({ base, buildDir });
    const files = sweepBuild(buildDir);
    // 4. ownership again — the share may have changed while the build ran
    checkNesting(dest, buildDir);
    const now = inspectDestination(dest);
    if (now.state !== first.state) refuse(`${dest} changed while building; run again.`);
    for (const c of first.claims) if (!now.claims.has(c)) refuse(`${MARKER} lost its claim on ${c} while building — another run?`);
    const { dirs, writes } = planWrites(dest, now, buildDir, files);

    if (now.state === 'absent') out(`create folder ${dest}`);
    for (const d of dirs) out(`create folder ${d}/`);
    for (const w of writes) out(`${w.action} ${w.rel}`);
    out(`${files.length - writes.length} of ${files.length} file(s) already current.`);
    if (!values.apply) {
      out('Dry run — nothing was written. Add --apply to publish.');
      return 0;
    }
    if (now.state === 'owned' && !writes.length) {
      out('Already current — nothing was written.');
      return 0;
    }

    // 5-6. create, journal, write
    const runId = randomBytes(6).toString('hex');
    const temps = writes.map((w, i) => {
      const at = w.rel.lastIndexOf('/');
      return `${at < 0 ? '' : w.rel.slice(0, at + 1)}${TEMP}${runId}-${i}`;
    });
    const claims = [...new Set([...now.claims, ...writes.map((w) => w.rel), ...temps])].sort();
    applying = true;
    if (now.state === 'absent') mkdirSync(dest); // non-recursive: the parent must already exist
    const journal = `${JSON.stringify({ tool: TOOL, version: 1, note: 'Every path scripts/nas-mirror.mjs has created here. Never edit by hand; to start over, delete this whole folder.', claims }, null, 2)}\n`;
    replaceAtomically(dest, MARKER, `${MARKER_TEMP}${runId}`, journal, deps.onTemp);
    for (const d of dirs) {
      assertRealDirs(dest, d);
      try {
        mkdirSync(join(dest, d));
      } catch (e) {
        if (e.code !== 'EEXIST' || !lstatSync(join(dest, d)).isDirectory()) throw e;
      }
    }
    writes.forEach((w, i) => replaceAtomically(dest, w.rel, temps[i], w.bytes, deps.onTemp));
    out(`Published ${writes.length} file(s) to ${dest}. Nothing was deleted; files from older builds stay.`);
    return 0;
  } catch (e) {
    err(applying ? `Publish interrupted: ${e.message}` : `Refused: ${e.message}`);
    err(
      applying
        ? 'Every path already written is journaled in the marker; run the same command again to finish.'
        : 'Nothing was written at the destination.',
    );
    return 1;
  }
}

function isDirectRun() {
  try {
    return realpathSync.native(process.argv[1]) === realpathSync.native(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isDirectRun()) process.exitCode = await run(process.argv.slice(2));
