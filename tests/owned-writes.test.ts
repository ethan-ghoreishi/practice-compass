// Every repository tool that can write near the owner's media changes only
// what it can prove it wrote. This is the family route for that invariant:
//
//   I1  the NAS mirror changes nothing it did not write          (ac-1, ac-2, ac-3)
//   I2  scanners replace only their own output, never inside
//       what they read                                           (ac-4)
//   I3  operator scripts never exit 0 without running            (ac-5)
//   I4  the app has no write channel to a NAS origin             (ac-8)
//
// I5 (a transient narrower archive changes no owner record) lives beside the
// reconciler, in src/domain/sourceReconcile.test.ts.
//
// Every tree here is a fresh mkdtemp. Nothing reads or writes /Volumes or a
// share, no scanner is spawned without an explicit mkdtemp --root, no scanner
// gets --write without an explicit mkdtemp --out, and every spawned process
// runs with an environment stripped of PC_*. The mirror is driven in-process
// with an injected build, so Vite never runs. What none of this can reach —
// SMB server-side links, Synology Drive, DSM's Node, the real NAS and the
// iPhone — is the owner's (ac-10, ac-11).

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { ConfigEnv, UserConfig, UserConfigFnObject } from 'vite';
import viteConfig from '../vite.config';

interface MirrorDeps {
  build?: (args: { base: string; buildDir: string }) => void | Promise<void>;
  buildDir?: string;
  log?: (s: string) => void;
  err?: (s: string) => void;
  onTemp?: (args: { rel: string; temp: string }) => void;
}
interface Mirror {
  run(argv: string[], deps?: MirrorDeps): Promise<number>;
  MARKER: string;
  MARKER_TEMP: string;
  TEMP: string;
  TOOL: string;
}
type Writer = (out: string, text: string, root: string) => string;

// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as mirrorModule from '../scripts/nas-mirror.mjs';
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as setarModule from '../scripts/scan-setar-classes.mjs';
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as cgsModule from '../scripts/scan-cgs-course.mjs';
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as khonyagarModule from '../scripts/scan-khonyagar-course.mjs';

const mirror = mirrorModule as Mirror;
const { MARKER, MARKER_TEMP, TEMP, TOOL } = mirror;
const setar = setarModule as { writeIndexAtomically: Writer };
const cgs = cgsModule as { writeOutputAtomically: Writer; DEFAULT_OUT: string; GENERATED_HEADER: string };
const khonyagar = khonyagarModule as { writeOutputAtomically: Writer; DEFAULT_OUT: string; GENERATED_HEADER: string };

const REPO = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const SCRIPTS = join(REPO, 'scripts');

// ---------------------------------------------------------------------------
// The test's OWN walker: path, type, size, mtime, sha256, link target. It
// never follows a link and never opens anything but a regular file.
// ---------------------------------------------------------------------------

function inventory(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const visit = (rel: string) => {
    for (const name of readdirSync(join(dir, rel)).sort()) {
      const r = rel ? `${rel}/${name}` : name;
      const p = join(dir, r);
      const st = lstatSync(p);
      if (st.isSymbolicLink()) out[r] = `link -> ${readlinkSync(p)}`;
      else if (st.isDirectory()) {
        out[r] = `dir ${st.mtimeMs}`;
        visit(r);
      } else if (st.isFile()) {
        out[r] = `file ${st.size} ${st.mtimeMs} ${createHash('sha256').update(readFileSync(p)).digest('hex')}`;
      } else out[r] = `${st.isFIFO() ? 'fifo' : 'other'} ${st.mtimeMs}`;
    }
  };
  visit('');
  return out;
}

const under = (inv: Record<string, string>, prefix: string) =>
  Object.fromEntries(Object.entries(inv).filter(([k]) => k === prefix || k.startsWith(`${prefix}/`)));
const outside = (inv: Record<string, string>, ...prefixes: string[]) =>
  Object.fromEntries(Object.entries(inv).filter(([k]) => !prefixes.some((p) => k === p || k.startsWith(`${p}/`))));

/** The regular files under `dir`, as rel → bytes, housekeeping and the mirror's own names left out. */
function published(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [rel, entry] of Object.entries(inventory(dir))) {
    const name = rel.split('/').pop()!;
    if (!entry.startsWith('file ') || name === MARKER || name.startsWith(MARKER_TEMP) || name.startsWith(TEMP)) continue;
    if (name === '.DS_Store' || name.startsWith('._') || /(^|\/)(@eaDir|#recycle)\//.test(rel)) continue;
    files[rel] = readFileSync(join(dir, rel), 'utf8');
  }
  return files;
}

const claimsOf = (dest: string): string[] => (JSON.parse(readFileSync(join(dest, MARKER), 'utf8')) as { claims: string[] }).claims;
const mkfifo = (p: string) => {
  const r = spawnSync('mkfifo', [p]);
  expect(r.status, 'mkfifo').toBe(0);
};

/**
 * A fresh world: `web/` is the share the mirror publishes into (with a
 * neighbour it must never touch), `media/` the owner's media tree beside it,
 * and `drive/` a Synology Drive root. The build lives in its own mkdtemp, so
 * nothing the injected build writes is part of these inventories.
 */
function world() {
  const top = realpathSync(mkdtempSync(join(tmpdir(), 'owned-writes-')));
  const web = join(top, 'web');
  mkdirSync(join(web, 'other-site'), { recursive: true });
  writeFileSync(join(web, 'other-site', 'index.html'), '<p>someone else</p>');
  const media = join(top, 'media');
  const session = join(media, 'setar-classes', 'session-1-26-09-2023');
  mkdirSync(session, { recursive: true });
  writeFileSync(join(session, 'ضبط-کلاس.mp4'), 'class recording bytes');
  writeFileSync(join(media, 'setar-classes', 'PIECES.csv'), 'canonical_fa,form\nعراق,گوشه\n');
  writeFileSync(join(media, 'setar-classes', 'undo-rename.sh'), '#!/bin/sh\nmv a b\n');
  mkdirSync(join(media, 'setar-classes', 'session-40-29-09-2026'));
  mkdirSync(join(media, 'tar-classes', '_recovered-2026-09-30-unnamed'), { recursive: true });
  writeFileSync(join(media, 'tar-classes', '_recovered-2026-09-30-unnamed', 'lesson.mp4'), 'tar bytes');
  mkdirSync(join(media, 'classical-guitar'));
  mkdirSync(join(top, 'drive', '.SynologyWorkingDirectory'), { recursive: true });
  return { top, web, media, mediaFile: join(session, 'ضبط-کلاس.mp4') };
}

type Files = Record<string, string>;
const BUILD_A: Files = {
  'index.html': '<!doctype html><title>A</title>',
  'sw.js': 'self.addEventListener("fetch", () => {})',
  'manifest.webmanifest': '{"name":"Practice Compass"}',
  'assets/index-aaa.js': 'console.log("a")',
  'assets/index-aaa.css': 'body{color:red}',
};

/** An injected build: records the base it was given and writes `files` (plus `extra`) into a fresh folder. */
function builder(files: Files, extra?: (dir: string) => void, fail?: boolean) {
  const buildDir = realpathSync(mkdtempSync(join(tmpdir(), 'owned-writes-build-')));
  const bases: string[] = [];
  const lines: string[] = [];
  const deps: MirrorDeps = {
    buildDir,
    build: ({ base }) => {
      bases.push(base);
      if (fail) throw new Error('vite exploded');
      for (const [rel, text] of Object.entries(files)) {
        mkdirSync(join(buildDir, rel, '..'), { recursive: true });
        writeFileSync(join(buildDir, rel), text);
      }
      extra?.(buildDir);
    },
    log: (s) => lines.push(s),
    err: (s) => lines.push(s),
  };
  return { deps, bases, lines, text: () => lines.join('\n') };
}

/** One successful publish of `files` into `dest`, for scenarios that start from an owned folder. */
async function publishOnce(dest: string, files: Files = BUILD_A) {
  const b = builder(files);
  expect(await mirror.run(['--dest', dest, '--apply'], b.deps), b.text()).toBe(0);
}

/** A process environment with nothing of the operator's in it. */
function cleanEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('PC_')) env[k] = v;
  return { ...env, ...extra };
}
const node = (args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) =>
  spawnSync(process.execPath, args, { cwd: opts.cwd ?? REPO, env: opts.env ?? cleanEnv(), encoding: 'utf8' });

// ===========================================================================
// I1 — the NAS mirror
// ===========================================================================

describe('the NAS mirror', () => {
  it('the NAS mirror refuses every destination it cannot prove it owns', async () => {
    type Case = {
      name: string;
      /** Prepares the world; returns the argv and, optionally, the build folder to use. */
      setup: (w: ReturnType<typeof world>) => Promise<{ argv: string[]; buildDir?: string }> | { argv: string[]; buildDir?: string };
      /** The offending entry the refusal must name. */
      names: RegExp;
      /** Refused only after building (a build case), else before it. */
      afterBuild?: boolean;
      build?: (dir: string) => void;
      code?: number;
    };
    const owned = async (w: ReturnType<typeof world>, then: (dest: string) => void) => {
      const dest = join(w.web, 'mirror');
      await publishOnce(dest);
      then(dest);
      return { argv: ['--dest', dest] };
    };
    const marker = (w: ReturnType<typeof world>, json: string) => {
      const dest = join(w.web, 'mirror');
      mkdirSync(dest);
      writeFileSync(join(dest, MARKER), json);
      writeFileSync(join(dest, 'index.html'), 'x');
      return { argv: ['--dest', dest] };
    };
    const CASES: Case[] = [
      { name: 'no --dest', setup: () => ({ argv: [] }), names: /--dest/, code: 2 },
      { name: 'a missing parent', setup: (w) => ({ argv: ['--dest', join(w.top, 'not-mounted', 'mirror')] }), names: /not-mounted.*does not exist/ },
      {
        name: 'an existing EMPTY folder with no marker (the empty session-40 shape)',
        setup: (w) => {
          mkdirSync(join(w.web, 'session-40-29-09-2026'));
          return { argv: ['--dest', join(w.web, 'session-40-29-09-2026')] };
        },
        names: /session-40-29-09-2026 is empty and has no \.practice-compass-mirror\.json/,
      },
      {
        name: "a folder holding only the marker's temp",
        setup: (w) => {
          mkdirSync(join(w.web, 'mirror'));
          writeFileSync(join(w.web, 'mirror', `${MARKER_TEMP}abc`), '{}');
          return { argv: ['--dest', join(w.web, 'mirror')] };
        },
        names: new RegExp(`unfinished first publish: it holds only ${MARKER_TEMP.replace(/\./g, '\\.')}abc`),
      },
      {
        name: 'an unmarked folder holding media',
        setup: (w) => ({ argv: ['--dest', w.media] }),
        names: /no \.practice-compass-mirror\.json.*holds: classical-guitar, setar-classes, tar-classes\..*marks a media tree/,
      },
      {
        name: 'a destination that is a symlink to the media fixture',
        setup: (w) => {
          symlinkSync(w.media, join(w.web, 'practice-compass'));
          return { argv: ['--dest', join(w.web, 'practice-compass')] };
        },
        names: /practice-compass is a symbolic link/,
      },
      {
        name: 'a destination that is a symlink to an empty folder',
        setup: (w) => {
          mkdirSync(join(w.top, 'empty'));
          symlinkSync(join(w.top, 'empty'), join(w.web, 'mirror'));
          return { argv: ['--dest', join(w.web, 'mirror') + '/'] };
        },
        names: /mirror is a symbolic link/,
      },
      {
        name: 'a marked folder plus one unclaimed file',
        setup: (w) => owned(w, (d) => writeFileSync(join(d, 'assets', 'notes.txt'), 'mine')),
        names: /assets\/notes\.txt is a file the mirror never claimed/,
      },
      {
        name: 'a marked folder plus a symlink',
        setup: (w) => owned(w, (d) => symlinkSync(join(w.media, 'setar-classes'), join(d, 'assets', 'media'))),
        names: /assets\/media is a symbolic link/,
      },
      {
        name: 'a marked folder plus a FIFO',
        setup: (w) => owned(w, (d) => mkfifo(join(d, 'pipe'))),
        names: /pipe is a FIFO/,
      },
      {
        name: 'a marked folder whose claimed file is now a directory',
        setup: (w) =>
          owned(w, (d) => {
            unlinkSync(join(d, 'sw.js'));
            mkdirSync(join(d, 'sw.js'));
          }),
        names: /sw\.js is claimed as a file but is now a folder/,
      },
      { name: 'a malformed marker', setup: (w) => marker(w, '{"tool": '), names: /mirror\.json is not valid JSON/ },
      { name: "another tool's marker", setup: (w) => marker(w, '{"tool":"rsync","claims":["index.html"]}'), names: /names another tool \("rsync"\)/ },
      {
        name: 'a marker claiming an absolute path',
        setup: (w) => marker(w, JSON.stringify({ tool: TOOL, claims: ['index.html', '/etc/passwd'] })),
        names: /claims "\/etc\/passwd", which is absolute/,
      },
      {
        name: 'a marker claiming a ".." path',
        setup: (w) => marker(w, JSON.stringify({ tool: TOOL, claims: ['index.html', 'assets/../index.html'] })),
        names: /claims "assets\/\.\.\/index\.html", which has an empty, "\." or "\.\." segment/,
      },
      {
        name: 'a marker claiming an outside-resolving path',
        setup: (w) => marker(w, JSON.stringify({ tool: TOOL, claims: ['index.html', '../../media/setar-classes/PIECES.csv'] })),
        names: /claims "\.\.\/\.\.\/media\/setar-classes\/PIECES\.csv", which resolves outside the destination/,
      },
      {
        name: 'a destination nested in the build folder',
        setup: (w) => {
          const buildDir = join(w.top, 'build');
          mkdirSync(buildDir);
          return { argv: ['--dest', join(buildDir, 'mirror')], buildDir };
        },
        names: /mirror is inside the build folder/,
      },
      {
        name: 'a destination containing the build folder',
        setup: (w) => ({ argv: ['--dest', join(w.web, 'repo')], buildDir: join(w.web, 'repo', 'dist') }),
        names: /repo contains the build folder/,
      },
      { name: 'creating a folder beside setar-classes', setup: (w) => ({ argv: ['--dest', join(w.media, 'mirror')] }), names: /parent holds .*setar-classes/ },
      {
        name: 'creating a folder beside PIECES.csv',
        setup: (w) => ({ argv: ['--dest', join(w.media, 'setar-classes', 'mirror')] }),
        names: /parent holds PIECES\.csv/,
      },
      {
        name: 'creating a folder beside .SynologyWorkingDirectory',
        setup: (w) => ({ argv: ['--dest', join(w.top, 'drive', 'mirror')] }),
        names: /parent holds \.SynologyWorkingDirectory/,
      },
      // --- build cases: refused after building, before any write ------------
      {
        name: 'a build containing a symlink',
        setup: (w) => ({ argv: ['--dest', join(w.web, 'mirror')] }),
        build: (dir) => symlinkSync('/etc/hosts', join(dir, 'assets', 'hosts')),
        names: /build contains assets\/hosts, which is a symbolic link/,
        afterBuild: true,
      },
      {
        name: 'a build containing a FIFO',
        setup: (w) => ({ argv: ['--dest', join(w.web, 'mirror')] }),
        build: (dir) => mkfifo(join(dir, 'pipe')),
        names: /build contains pipe, which is a FIFO/,
        afterBuild: true,
      },
      {
        name: "a build containing the marker's name",
        setup: (w) => owned(w, () => {}),
        build: (dir) => writeFileSync(join(dir, 'assets', MARKER), '{}'),
        names: /build contains assets\/\.practice-compass-mirror\.json, which uses the mirror's own marker name/,
        afterBuild: true,
      },
    ];

    for (const c of CASES) {
      for (const apply of [false, true]) {
        const w = world();
        const { argv, buildDir } = await c.setup(w);
        const before = inventory(w.top);
        const b = builder(BUILD_A, c.build);
        const code = await mirror.run([...argv, ...(apply ? ['--apply'] : [])], { ...b.deps, ...(buildDir ? { buildDir } : {}) });
        const label = `${c.name}${apply ? ' (--apply)' : ''}`;
        expect(code, `${label}: ${b.text()}`).toBe(c.code ?? 1);
        expect(b.text(), label).toMatch(c.names);
        expect(b.bases, `${label}: built?`).toHaveLength(c.afterBuild ? 1 : 0);
        // The destination, its parent, its neighbours and the media fixture:
        // identical, down to every mtime.
        expect(inventory(w.top), label).toEqual(before);
      }
    }
  });

  it('the NAS mirror writes only inside a folder it created and never deletes', async () => {
    const w = world();
    const dest = join(w.web, 'practice-compass-mirror');
    const start = inventory(w.top);

    // --- a dry run writes nothing and says what it would do -----------------
    const dry = builder(BUILD_A);
    expect(await mirror.run(['--dest', dest], dry.deps), dry.text()).toBe(0);
    expect(inventory(w.top)).toEqual(start);
    expect(dry.bases).toEqual(['/practice-compass-mirror/']);
    expect(dry.text()).toContain(`Destination: ${dest}`);
    expect(dry.text()).toMatch(/Its parent holds: other-site/);
    expect(dry.text()).toContain(`create folder ${dest}`);
    for (const rel of Object.keys(BUILD_A)) expect(dry.text()).toContain(`create ${rel}`);
    expect(dry.text()).toMatch(/Dry run — nothing was written/);

    // --- --apply creates the folder and journals every path BEFORE writing --
    const first = builder(BUILD_A);
    const seen: string[] = [];
    const code = await mirror.run(['--dest', dest, '--apply'], {
      ...first.deps,
      onTemp: ({ rel, temp }) => {
        if (rel === MARKER) {
          expect(temp.startsWith(MARKER_TEMP)).toBe(true);
          return;
        }
        // At every file write the journal on disk already names this file,
        // this temp, and every file and temp still to come.
        const claims = claimsOf(dest);
        expect(claims).toContain(rel);
        expect(claims).toContain(temp);
        for (const f of Object.keys(BUILD_A)) expect(claims).toContain(f);
        expect(claims.filter((c) => c.split('/').pop()!.startsWith(TEMP))).toHaveLength(Object.keys(BUILD_A).length);
        seen.push(temp);
      },
    });
    expect(code, first.text()).toBe(0);
    expect(first.bases).toEqual(['/practice-compass-mirror/']);
    expect(published(dest)).toEqual(BUILD_A); // byte-identical, nothing else
    expect(new Set(claimsOf(dest))).toEqual(new Set([...Object.keys(BUILD_A), ...seen]));
    expect(Object.keys(inventory(dest)).filter((k) => k.split('/').pop()!.startsWith('.practice-compass-mirror'))).toEqual([MARKER]);
    // Outside the new folder, only the parent's own entry (its mtime) changed.
    const notParent = (inv: Record<string, string>) => outside(Object.fromEntries(Object.entries(inv).filter(([k]) => k !== 'web')), 'web/practice-compass-mirror');
    expect(notParent(inventory(w.top))).toEqual(notParent(start));
    expect(under(inventory(w.top), 'web/other-site')).toEqual(under(start, 'web/other-site'));

    // --- housekeeping the platform writes is never touched ------------------
    writeFileSync(join(dest, '.DS_Store'), 'finder');
    writeFileSync(join(dest, '._index.html'), 'appledouble');
    writeFileSync(join(dest, 'assets', '.DS_Store'), 'finder');
    mkdirSync(join(dest, '@eaDir'));
    writeFileSync(join(dest, '@eaDir', 'thumb.jpg'), 'dsm');
    mkdirSync(join(dest, '#recycle'));
    writeFileSync(join(dest, '#recycle', 'old.txt'), 'recycled');
    const housekeeping = (inv: Record<string, string>) =>
      Object.fromEntries(Object.entries(inv).filter(([k]) => /\.DS_Store$|\/\._|@eaDir|#recycle/.test(k)));

    // --- a CHANGED build replaces only what changed, and keeps the rest -----
    const BUILD_B: Files = {
      ...BUILD_A,
      'index.html': '<!doctype html><title>B</title>',
      'assets/index-bbb.js': 'console.log("b")',
    };
    delete BUILD_B['assets/index-aaa.js'];
    const beforeB = inventory(w.top);
    const inode = (rel: string) => lstatSync(join(dest, rel)).ino;
    const inodes = Object.fromEntries(Object.keys(BUILD_A).map((rel) => [rel, inode(rel)]));
    const claimsBefore = claimsOf(dest);
    const second = builder(BUILD_B);
    const writtenB: string[] = [];
    expect(await mirror.run(['--dest', dest, '--apply'], { ...second.deps, onTemp: ({ rel }) => void writtenB.push(rel) }), second.text()).toBe(0);
    expect(writtenB.sort()).toEqual([MARKER, 'assets/index-bbb.js', 'index.html']);
    expect(claimsBefore).toContain('index.html'); // only a CLAIMED file was replaced
    const afterB = inventory(w.top);
    expect(published(dest)).toEqual({ ...BUILD_B, 'assets/index-aaa.js': BUILD_A['assets/index-aaa.js'] }); // nothing deleted
    expect(inode('index.html')).not.toBe(inodes['index.html']); // a NEW entry, renamed into place
    for (const rel of ['sw.js', 'manifest.webmanifest', 'assets/index-aaa.js', 'assets/index-aaa.css']) {
      expect(inode(rel), rel).toBe(inodes[rel]);
      expect(afterB[`web/practice-compass-mirror/${rel}`], rel).toBe(beforeB[`web/practice-compass-mirror/${rel}`]);
    }
    expect(housekeeping(afterB)).toEqual(housekeeping(beforeB));
    expect(outside(afterB, 'web/practice-compass-mirror')).toEqual(outside(beforeB, 'web/practice-compass-mirror'));

    // --- a third, identical publish changes nothing at all ------------------
    const third = builder(BUILD_B);
    let touched = 0;
    expect(await mirror.run(['--dest', dest, '--apply'], { ...third.deps, onTemp: () => void (touched += 1) }), third.text()).toBe(0);
    expect(touched).toBe(0);
    expect(third.text()).toMatch(/Already current — nothing was written/);
    expect(inventory(w.top)).toEqual(afterB);

    // --- a claimed file hard-linked to MEDIA is replaced, the media is not ---
    const mediaBefore = under(inventory(w.top), 'media');
    unlinkSync(join(dest, 'sw.js'));
    linkSync(w.mediaFile, join(dest, 'sw.js'));
    const hard = builder({ ...BUILD_B, 'sw.js': 'self.version = 2' });
    expect(await mirror.run(['--dest', dest, '--apply'], hard.deps), hard.text()).toBe(0);
    expect(readFileSync(join(dest, 'sw.js'), 'utf8')).toBe('self.version = 2');
    expect(readFileSync(w.mediaFile, 'utf8')).toBe('class recording bytes');
    expect(under(inventory(w.top), 'media')).toEqual(mediaBefore);

    // --- a claimed file swapped for a SYMLINK after the final check ---------
    const swap = builder({ ...BUILD_B, 'sw.js': 'self.version = 2', 'index.html': '<!doctype html><title>C</title>' });
    expect(
      await mirror.run(['--dest', dest, '--apply'], {
        ...swap.deps,
        onTemp: ({ rel }) => {
          if (rel !== 'index.html') return;
          unlinkSync(join(dest, 'index.html'));
          symlinkSync(w.mediaFile, join(dest, 'index.html'));
        },
      }),
      swap.text(),
    ).toBe(0);
    expect(lstatSync(join(dest, 'index.html')).isFile()).toBe(true); // the link ENTRY was replaced…
    expect(readFileSync(join(dest, 'index.html'), 'utf8')).toBe('<!doctype html><title>C</title>');
    expect(under(inventory(w.top), 'media')).toEqual(mediaBefore); // …never written through

    // --- a failing build creates and writes nothing -------------------------
    const quiet = inventory(w.top);
    const broken = builder(BUILD_A, undefined, true);
    expect(await mirror.run(['--dest', join(w.web, 'second-mirror'), '--apply'], broken.deps)).toBe(1);
    expect(broken.text()).toMatch(/vite exploded/);
    const brokenOwned = builder(BUILD_A, undefined, true);
    expect(await mirror.run(['--dest', dest, '--apply'], brokenOwned.deps)).toBe(1);
    expect(inventory(w.top)).toEqual(quiet);

    // --- --base overrides the derived one; an unsafe name needs it ----------
    const spaced = join(w.web, 'mirror three');
    const unsafe = builder(BUILD_A);
    expect(await mirror.run(['--dest', spaced, '--apply'], unsafe.deps)).toBe(1);
    expect(unsafe.text()).toMatch(/folder name "mirror three" is not URL-safe; pass --base/);
    expect(unsafe.bases).toEqual([]);
    const badBase = builder(BUILD_A);
    expect(await mirror.run(['--dest', spaced, '--base', 'pc', '--apply'], badBase.deps)).toBe(1);
    expect(badBase.text()).toMatch(/--base "pc" must look like/);
    expect(inventory(w.top)).toEqual(quiet);
    const based = builder(BUILD_A);
    expect(await mirror.run(['--dest', spaced, '--base', '/pc/test/', '--apply'], based.deps), based.text()).toBe(0);
    expect(based.bases).toEqual(['/pc/test/']);
    expect(published(spaced)).toEqual(BUILD_A);

    // --- and, through all of it, nothing outside the destinations changed ---
    expect(under(inventory(w.top), 'media')).toEqual(under(start, 'media'));
    expect(under(inventory(w.top), 'web/other-site')).toEqual(under(start, 'web/other-site'));
    expect(under(inventory(w.top), 'drive')).toEqual(under(start, 'drive'));
  });

  it('an interrupted NAS mirror publish completes when run again', async () => {
    const w = world();
    // The reference: the same build, published without interruption.
    const reference = join(w.web, 'reference');
    await publishOnce(reference);

    // --- interrupted after the journal and two files, a temp left behind ----
    const dest = join(w.web, 'mirror');
    const cut = builder(BUILD_A);
    let n = 0;
    const code = await mirror.run(['--dest', dest, '--apply'], {
      ...cut.deps,
      onTemp: ({ rel }) => {
        if (rel !== MARKER && ++n === 3) throw new Error('the share went away');
      },
    });
    expect(code).toBe(1);
    expect(cut.text()).toMatch(/Publish interrupted: the share went away/);
    expect(cut.text()).toMatch(/run the same command again to finish/);
    expect(Object.keys(published(dest))).toHaveLength(2);
    const leftover = Object.keys(inventory(dest)).filter((k) => k.split('/').pop()!.startsWith(TEMP));
    expect(leftover).toHaveLength(1);

    // --- the re-run adopts NO unclaimed file ---------------------------------
    writeFileSync(join(dest, 'stray.txt'), 'dropped in by hand');
    const strayRun = builder(BUILD_A);
    expect(await mirror.run(['--dest', dest, '--apply'], strayRun.deps)).toBe(1);
    expect(strayRun.text()).toMatch(/stray\.txt is a file the mirror never claimed/);
    rmSync(join(dest, 'stray.txt')); // the owner's call, not the tool's

    // --- …and otherwise completes: never locked out --------------------------
    const again = builder(BUILD_A);
    expect(await mirror.run(['--dest', dest, '--apply'], again.deps), again.text()).toBe(0);
    expect(published(dest)).toEqual(published(reference));
    expect(published(dest)).toEqual(BUILD_A);
    // The interrupted temp is the tool's own and is simply left; every claim
    // is a build file or one of the tool's own temps — nothing adopted.
    for (const t of leftover) expect(lstatSync(join(dest, t)).isFile()).toBe(true);
    for (const c of claimsOf(dest)) expect(c in BUILD_A || c.split('/').pop()!.startsWith(TEMP), c).toBe(true);
    const settled = inventory(w.top);
    const once = builder(BUILD_A);
    expect(await mirror.run(['--dest', dest, '--apply'], once.deps)).toBe(0);
    expect(inventory(w.top)).toEqual(settled);

    // --- a FIRST publish interrupted before its marker exists ----------------
    const fresh = join(w.web, 'fresh');
    const early = builder(BUILD_A);
    expect(
      await mirror.run(['--dest', fresh, '--apply'], {
        ...early.deps,
        onTemp: ({ rel }) => {
          if (rel === MARKER) throw new Error('the share went away');
        },
      }),
    ).toBe(1);
    expect(readdirSync(fresh).every((n2) => n2.startsWith(MARKER_TEMP))).toBe(true);
    const frozen = inventory(w.top);
    const after = builder(BUILD_A);
    expect(await mirror.run(['--dest', fresh, '--apply'], after.deps)).toBe(1);
    expect(after.text()).toContain(`${fresh} is the mirror's own unfinished first publish`);
    expect(after.text()).toMatch(/Delete that folder yourself and publish again/);
    expect(inventory(w.top)).toEqual(frozen);
  });
});

// ===========================================================================
// I2 — scanners
// ===========================================================================

describe('the scanners', () => {
  it('every scanner refuses an output it cannot prove is its own', () => {
    const SCANNERS = [
      {
        name: 'scan-setar-classes',
        file: 'index.json',
        args: (root: string, out: string) => ['--root', root, '--out', out],
        sourceError: /Scan failed|PIECES/,
        write: setar.writeIndexAtomically,
        own: (v: number) => `${JSON.stringify({ format: 'setar-archive-index', version: v }, null, 2)}\n`,
      },
      {
        name: 'scan-cgs-course',
        file: 'courseData.ts',
        args: (root: string, out: string) => ['--root', root, '--out', out, '--write'],
        sourceError: /no Level_\* folders/,
        write: cgs.writeOutputAtomically,
        own: (v: number) => `${cgs.GENERATED_HEADER} — DO NOT EDIT BY HAND.\n// v${v}\n`,
      },
      {
        name: 'scan-khonyagar-course',
        file: 'khonyagarData.ts',
        args: (root: string, out: string) => ['--root', root, '--out', out, '--write'],
        sourceError: /ENOENT|_فهرست/,
        write: khonyagar.writeOutputAtomically,
        own: (v: number) => `${khonyagar.GENERATED_HEADER} — DO NOT EDIT BY HAND.\n// v${v}\n`,
      },
    ];

    for (const s of SCANNERS) {
      const w = world();
      // An EMPTY source: had the scanner read it, it would fail with its own
      // source error, not with the output refusal asserted below.
      const root = join(w.top, 'course');
      mkdirSync(root);
      const outDir = join(w.top, 'out');
      mkdirSync(outDir);
      writeFileSync(join(w.media, 'foreign.txt'), 'the owner\'s own file');
      symlinkSync(root, join(outDir, 'looks-outside'));
      writeFileSync(join(outDir, s.file), 'not mine');
      symlinkSync(join(w.media, 'foreign.txt'), join(outDir, `link-${s.file}`));
      const before = inventory(w.top);

      const refusals: [string, RegExp][] = [
        [join(outDir, 'looks-outside', s.file), /inside the (archive|course)/],
        [join(outDir, s.file), /exists and is not (an index|a file) this scanner/],
        [join(outDir, `link-${s.file}`), /not a regular file/],
        [join(outDir, 'missing', s.file), /folder does not exist/],
      ];
      for (const [out, why] of refusals) {
        const r = node([join(SCRIPTS, `${s.name}.mjs`), ...s.args(root, out)]);
        expect(r.status, `${s.name} ${out}\n${r.stderr}`).not.toBe(0);
        expect(r.stderr, s.name).toMatch(why);
        expect(r.stderr, `${s.name}: read the source first`).not.toMatch(s.sourceError);
      }
      expect(inventory(w.top), s.name).toEqual(before);

      // --- through the exported writer -------------------------------------
      const fresh = join(outDir, `new-${s.file}`);
      expect(s.write(fresh, s.own(1), root)).toBe(fresh);
      expect(readFileSync(fresh, 'utf8')).toBe(s.own(1));
      // Its own previous output IS replaced — by a new entry, so the other
      // name of a hard link keeps its old bytes.
      linkSync(fresh, join(w.top, 'other-name'));
      s.write(fresh, s.own(2), root);
      expect(readFileSync(fresh, 'utf8')).toBe(s.own(2));
      expect(readFileSync(join(w.top, 'other-name'), 'utf8')).toBe(s.own(1));
      expect(readdirSync(outDir).filter((n) => n.includes('.tmp-')), 'no temp left').toEqual([]);
      // The writer is also the second check.
      expect(() => s.write(join(outDir, s.file), s.own(3), root)).toThrow(/not (an index|a file) this scanner/);
      expect(() => s.write(join(outDir, 'looks-outside', s.file), s.own(3), root)).toThrow(/inside the/);
      expect(readFileSync(join(outDir, s.file), 'utf8')).toBe('not mine');
      expect(readdirSync(root)).toEqual([]);
    }

    // Each course scanner recognises only ITS OWN header.
    const w = world();
    const cross = join(w.top, 'khonyagarData.ts');
    writeFileSync(cross, `${cgs.GENERATED_HEADER} — DO NOT EDIT BY HAND.\n`);
    expect(() => khonyagar.writeOutputAtomically(cross, 'x', join(w.top, 'media'))).toThrow(/not a file this scanner generated/);
    expect(readFileSync(cross, 'utf8')).toBe(`${cgs.GENERATED_HEADER} — DO NOT EDIT BY HAND.\n`);
    // …and the committed outputs carry it, so the scanners still accept them.
    expect(readFileSync(cgs.DEFAULT_OUT, 'utf8').startsWith(cgs.GENERATED_HEADER)).toBe(true);
    expect(readFileSync(khonyagar.DEFAULT_OUT, 'utf8').startsWith(khonyagar.GENERATED_HEADER)).toBe(true);

    // --- the course scanners' DEFAULT target comes from the script, not the CWD
    expect(cgs.DEFAULT_OUT).toBe(join(REPO, 'src', 'domain', 'courseData.ts'));
    expect(khonyagar.DEFAULT_OUT).toBe(join(REPO, 'src', 'domain', 'khonyagarData.ts'));
    const cwd = w.media; // a run whose working directory is a media tree
    mkdirSync(join(cwd, 'src', 'domain'), { recursive: true });
    writeFileSync(join(cwd, 'src', 'domain', 'courseData.ts'), 'owner file');
    writeFileSync(join(cwd, 'src', 'domain', 'khonyagarData.ts'), 'owner file');
    const emptyRoot = join(w.top, 'empty-course');
    mkdirSync(emptyRoot);
    const mediaBefore = inventory(w.top);
    const committed = [cgs.DEFAULT_OUT, khonyagar.DEFAULT_OUT].map((p) => readFileSync(p, 'utf8'));
    for (const [name, target] of [
      ['scan-cgs-course', cgs.DEFAULT_OUT],
      ['scan-khonyagar-course', khonyagar.DEFAULT_OUT],
    ] as const) {
      // No --write: the default target is observed from what it prints first.
      const r = node([join(SCRIPTS, `${name}.mjs`), '--root', emptyRoot], { cwd });
      expect(r.stderr.split('\n')[0], name).toBe(`Target (dry run): ${target}`);
    }
    expect(inventory(w.top)).toEqual(mediaBefore);
    expect([cgs.DEFAULT_OUT, khonyagar.DEFAULT_OUT].map((p) => readFileSync(p, 'utf8'))).toEqual(committed);
  });
});

// ===========================================================================
// I3 — operator scripts never exit 0 without running
// ===========================================================================

describe('operator scripts', () => {
  it('every operator script runs when invoked through a symlinked path', () => {
    const top = realpathSync(mkdtempSync(join(tmpdir(), 'owned-writes-run-')));
    // DSM's /var/services/homes and /var/services/web are symlinks: the NAS
    // job is always started through one.
    const bin = join(top, 'bin');
    symlinkSync(SCRIPTS, bin);
    const root = join(top, 'root');
    mkdirSync(root);
    const CASES: [string, string[], RegExp][] = [
      ['scan-setar-classes.mjs', ['--root', root, '--bogus'], /Usage: scan-setar-classes/],
      ['scan-setar-classes.mjs', ['--root', root, '--out', join(top, 'missing', 'index.json')], /folder does not exist/],
      ['publish-setar-index.mjs', [], /Usage: publish-setar-index/],
      ['scan-cgs-course.mjs', ['--root', root, '--bogus'], /Usage: node scripts\/scan-cgs-course/],
      ['scan-khonyagar-course.mjs', ['--root', root, '--bogus'], /Usage: node scripts\/scan-khonyagar-course/],
      ['nas-mirror.mjs', [], /Usage: node scripts\/nas-mirror/],
      ['nas-mirror.mjs', ['--dest', join(top, 'missing', 'mirror')], /parent folder .* does not exist/],
    ];
    for (const [script, args, says] of CASES) {
      const viaLink = node([join(bin, script), ...args]);
      expect(viaLink.status, `${script} via a symlink\n${viaLink.stderr}`).not.toBe(0);
      expect(viaLink.stderr, script).toMatch(says);
      // …exactly as it does when run by its real path.
      const direct = node([join(SCRIPTS, script), ...args]);
      expect([direct.status, direct.stderr], script).toEqual([viaLink.status, viaLink.stderr]);
    }
    expect(readdirSync(root)).toEqual([]);

    // Importing a course scanner — even through the link — does not run it.
    // The child's argv carries an explicit --root, so a regression could only
    // ever scan this empty folder.
    for (const script of ['scan-cgs-course.mjs', 'scan-khonyagar-course.mjs']) {
      const r = node(
        ['--input-type=module', '-e', 'const m = await import(process.env.SCRIPT_URL); console.log(Object.keys(m).sort().join(","))', '--', '--root', root],
        { env: cleanEnv({ SCRIPT_URL: pathToFileURL(join(bin, script)).href }) },
      );
      expect([r.status, r.stderr], script).toEqual([0, '']);
      expect(r.stdout, script).toMatch(/DEFAULT_OUT/);
    }

    // The NAS runner creates no folder: a missing work directory fails before
    // anything runs. PC_NODE is a stub that leaves a sentinel, so a regression
    // could never reach the network with this config's dummy token.
    const config = join(top, 'config.env');
    const work = join(top, 'missing-work');
    writeFileSync(
      config,
      `PC_ARCHIVE_ROOT=${root}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${work}\n`,
    );
    const stub = join(top, 'node-stub.sh');
    writeFileSync(stub, `#!/bin/sh\necho ran > "${join(top, 'sentinel')}"\nexit 1\n`, { mode: 0o755 });
    const r = spawnSync('sh', [join(bin, 'run-setar-index.sh')], {
      cwd: top,
      env: cleanEnv({ PC_INDEX_CONFIG: config, PC_NODE: stub }),
      encoding: 'utf8',
    });
    expect(r.status, r.stderr).toBe(2);
    expect(r.stderr).toMatch(/Work directory .*missing-work does not exist; nothing was scanned or published/);
    expect(readdirSync(top).sort()).toEqual(['bin', 'config.env', 'node-stub.sh', 'root']);
  });
});

// ===========================================================================
// I4 — the app has no channel to a NAS origin
// ===========================================================================

describe('the production build', () => {
  it('the production build can reach only its own origin and the GitHub API', async () => {
    // The CSP comes from the plugin the BUILD runs (vite.config.ts's
    // cspPlugin), not from a copied string.
    const env: ConfigEnv = { command: 'build', mode: 'production', isPreview: false, isSsrBuild: false };
    const config: UserConfig = typeof viteConfig === 'function' ? await (viteConfig as UserConfigFnObject)(env) : viteConfig;
    type HtmlTag = { tag: string; attrs: Record<string, string>; injectTo: string };
    type Plugin = { name?: string; apply?: unknown; transformIndexHtml?: () => HtmlTag[] };
    const plugins = (config.plugins ?? []).flat(Infinity as 1) as Plugin[];
    const csp = plugins.find((p) => p?.name === 'inject-csp');
    expect(csp?.apply).toBe('build');
    const tags = csp!.transformIndexHtml!();
    const meta = tags.filter((t) => t.tag === 'meta' && t.attrs['http-equiv'] === 'Content-Security-Policy');
    expect(meta).toHaveLength(1);
    expect(meta[0]!.injectTo).toBe('head-prepend');
    const directives = Object.fromEntries(
      meta[0]!.attrs.content!.split(';').map((d) => {
        const [name, ...sources] = d.trim().split(/\s+/);
        return [name!, sources];
      }),
    );
    expect(directives['connect-src']).toEqual(["'self'", 'https://api.github.com']);
    expect(directives['form-action']).toEqual(["'self'"]);
    expect(directives['frame-src']).toEqual(["'none'"]);
    expect(directives['default-src']).toEqual(["'self'"]);
    // No directive names any other origin — no NAS, no wildcard, no scheme.
    const LOCAL = new Set(["'self'", "'none'", "'unsafe-inline'", 'data:', 'blob:']);
    for (const [name, sources] of Object.entries(directives)) {
      for (const source of sources) {
        expect(LOCAL.has(source) || (name === 'connect-src' && source === 'https://api.github.com'), `${name} ${source}`).toBe(true);
      }
    }
  });
});
