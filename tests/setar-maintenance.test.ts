import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, appendFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — untyped operator tools; these are the real ones.
import { applyMaintenance, planMaintenance, retryMaintenance, rollbackMaintenance, Interrupted } from '../scripts/setar-archive-maintenance.mjs';
// @ts-expect-error — see above.
import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
// @ts-expect-error — see above.
import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
import { followRenames } from '../src/domain/sourceReconcile';
import SOURCE from './fixtures/setar-lifecycle-source.json' with { type: 'json' };
import EXPECTED from './fixtures/setar-lifecycle-expected.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// The operator family: the guided route edits the declarations, keeps a
// private rollback copy, validates, scans and publishes — on scratch trees and
// a fake Git boundary only. The live NAS operation is recorded separately
// (docs/nas-topology.md); nothing here proves it.
// ---------------------------------------------------------------------------

const run = promisify(execFile);
const TOOL = join(process.cwd(), 'scripts', 'setar-archive-maintenance.mjs');
const S39 = 'session-39-01-09-2026';
const S40 = 'session-40-29-09-2026';
const S41 = 'session-41-27-10-2026';
const NEW_PIECE = 'پیش-درامد-ابوعطا-لطفی';
const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');

function scratch() {
  const base = mkdtempSync(join(tmpdir(), 'setar-maint-'));
  const root = join(base, 'setar-classes');
  const state = join(base, 'private-state');
  mkdirSync(root);
  mkdirSync(state);
  writeFileSync(join(root, 'PIECES.csv'), SOURCE.registryBefore);
  writeFileSync(join(root, 'RENAME-LOG.csv'), SOURCE.renameLogBefore);
  for (const [path, size] of Object.entries(SOURCE.filesBefore)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), Buffer.alloc(size, path.length % 251));
  }
  for (const f of SOURCE.emptyFolders) mkdirSync(join(root, f), { recursive: true });
  return { base, root, state };
}

/** Every media byte, by path — what "without altering media" is checked against. */
function media(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of readdirSync(root).filter((n) => n.startsWith('session-'))) {
    for (const f of readdirSync(join(root, d))) out[`${d}/${f}`] = sha(readFileSync(join(root, d, f)));
  }
  return out;
}
const declarations = (root: string) => ({ pieces: readFileSync(join(root, 'PIECES.csv'), 'utf8'), log: readFileSync(join(root, 'RENAME-LOG.csv'), 'utf8') });

function fakeGit() {
  const refs = new Map<string, string>([['main', 'c-main']]);
  const commits = new Map<string, Record<string, string>>([['c-main', { 'state.json': 'practice data' }]]);
  let n = 0;
  let failing = false;
  const transport = {
    getRef: async (b: string) => (refs.has(b) ? { sha: refs.get(b)! } : null),
    getCommit: async (s: string) => ({ treeSha: s }),
    getFile: async (s: string, p: string) => (commits.get(s)?.[p] === undefined ? null : { text: commits.get(s)![p]! }),
    createBlob: async (t: string) => {
      if (failing) throw new Error('GitHub refused the blob (HTTP 401)');
      return t;
    },
    createTree: async ({ baseTreeSha, path, blobSha }: { baseTreeSha: string | null; path: string; blobSha: string }) =>
      JSON.stringify({ ...(baseTreeSha ? commits.get(baseTreeSha) : {}), [path]: blobSha }),
    createCommit: async ({ treeSha }: { treeSha: string }) => {
      const s = `c-${(n += 1)}`;
      commits.set(s, JSON.parse(treeSha));
      return s;
    },
    updateRef: async (b: string, s: string, e: string) => (refs.get(b) === e ? (refs.set(b, s), 'ok') : 'HTTP 422'),
    createRef: async (b: string, s: string) => (refs.has(b) ? 'HTTP 422' : (refs.set(b, s), 'ok')),
  };
  const calls: string[] = [];
  return {
    publish: async (text: string, hash: string) => {
      calls.push(hash);
      return publishIndex({ transport, indexText: text });
    },
    published: () => commits.get(refs.get(SOURCE_INDEX_BRANCH) ?? '')?.[INDEX_PATH] ?? null,
    commits: () => n,
    main: () => [refs.get('main'), commits.get('c-main')],
    fail: (on: boolean) => (failing = on),
    calls,
  };
}

const sessionsOf = (text: string, ns: number[]) =>
  (JSON.parse(text) as { sessions: { n: number; roster: string[]; rosterTrusted: boolean; resources: { path: string; role: string; pieces: string[] }[] }[] }).sessions
    .filter((s) => ns.includes(s.n))
    .map((s) => ({ n: s.n, roster: s.roster, rosterTrusted: s.rosterTrusted, resources: s.resources.map((r) => ({ path: r.path, role: r.role, pieces: r.pieces })) }));
const oracle = (ns: number[]) =>
  EXPECTED.after.sessions.filter((s) => ns.includes(s.n)).map((s) => ({ n: s.n, roster: s.roster, rosterTrusted: s.rosterTrusted, resources: s.resources }));

describe('maintaining the Setar archive', () => {
  it('setar guided maintenance is reversible stale safe and idempotent without altering media', async () => {
    const { base, root, state } = scratch();
    const git = fakeGit();
    const apply = (action: object, extra: object = {}) => {
      const plan = planMaintenance(root, action);
      return applyMaintenance({ root, state, action, previewId: plan.id, publish: git.publish, ...extra });
    };
    try {
      const media0 = media(root);
      const decl0 = declarations(root);

      // --- INVALID OR AMBIGUOUS INPUT: refused, nothing changed -------------
      const refusals: [object, RegExp][] = [
        [{ kind: 'register', piece: `نت-چهارمضراب-چهارگاه-عبادی` }, /filename mistake.*rename the file/is],
        [{ kind: 'register', piece: `تمرین-من-${NEW_PIECE}` }, /starts with the role/],
        [{ kind: 'register', piece: 'a,b' }, /exactly as the files spell it/],
        [{ kind: 'register', piece: 'چهارمضراب-چهارگاه-عبادی', session: 41 }, /use: roster --session 41/],
        [{ kind: 'roster', session: 41, pieces: [NEW_PIECE] }, /not registered/],
        [{ kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S40}/ضبط-کلاس.mp4` }, /already exists/],
        [{ kind: 'rename', from: `${S40}/نمونه.mp4`, to: `elsewhere/نمونه.mp4` }, /session-N-DD-MM-YYYY/],
        [{ kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S40}/video.mp4` }, /no known role/],
        [{ kind: 'rename', from: `${S41}/نمونه-${NEW_PIECE}.mp4`, to: `${S41}/نمونه-نامعلوم.mp4` }, /not registered/],
        [{ kind: 'rename', from: `${S40}/missing.mp4`, to: `${S40}/نمونه-2.mp4` }, /not in the archive/],
      ];
      for (const [action, why] of refusals) expect(() => planMaintenance(root, action), JSON.stringify(action)).toThrow(why);
      expect([media(root), declarations(root), git.calls]).toEqual([media0, decl0, []]);

      // --- SYMLINKS are never written through ------------------------------
      symlinkSync(join(root, `${S40}/نمونه.mp4`), join(root, `${S40}/نمونه-1.mp4`));
      expect(() => planMaintenance(root, { kind: 'rename', from: `${S40}/نمونه-1.mp4`, to: `${S40}/نمونه-3.mp4` })).toThrow(/not a regular file/);
      rmSync(join(root, `${S40}/نمونه-1.mp4`));
      const linkedState = join(base, 'linked-state');
      symlinkSync(state, linkedState);
      await expect(applyMaintenance({ root, state: linkedState, action: { kind: 'register', piece: NEW_PIECE }, previewId: 'x', publish: git.publish })).rejects.toThrow(/real folder/);
      await expect(applyMaintenance({ root, state: join(root, S42()), action: { kind: 'register', piece: NEW_PIECE }, previewId: 'x', publish: git.publish })).rejects.toThrow(/OUTSIDE the archive/);
      renameSync(join(root, 'PIECES.csv'), join(base, 'PIECES.real'));
      symlinkSync(join(base, 'PIECES.real'), join(root, 'PIECES.csv'));
      expect(() => planMaintenance(root, { kind: 'register', piece: NEW_PIECE })).toThrow(/link is never written through/);
      rmSync(join(root, 'PIECES.csv'));
      renameSync(join(base, 'PIECES.real'), join(root, 'PIECES.csv'));
      expect([media(root), declarations(root), git.calls]).toEqual([media0, decl0, []]);

      // --- A GENUINE NEW PIECE: preview, then the tool does the rest -------
      const register = { kind: 'register', piece: NEW_PIECE, session: 41 };
      const preview = planMaintenance(root, register);
      expect(preview.lines.join('\n')).toContain(`${S41}/نمونه-${NEW_PIECE}.mp4`);
      const registered = await applyMaintenance({ root, state, action: register, previewId: preview.id, publish: git.publish });
      expect(registered).toMatchObject({ ok: true, status: 'published' });
      // Exactly one row appended; every existing byte and the extra columns kept.
      expect(declarations(root).pieces).toBe(`${decl0.pieces}${NEW_PIECE},,,,,,,41,,\n`);
      // The private rollback copy holds the original, outside the archive.
      const copies = readdirSync(state).filter((d) => d.includes(preview.id));
      expect(copies).toHaveLength(1);
      expect(readFileSync(join(state, copies[0]!, 'PIECES.csv'), 'utf8')).toBe(decl0.pieces);
      // Publication invoked once, with what the archive now says; practice data untouched.
      expect(git.calls).toEqual([scanToIndex(root).contentHash]);
      expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
      expect(git.main()).toEqual(['c-main', { 'state.json': 'practice data' }]);

      // --- REPEAT: no duplicate row, no commit -----------------------------
      const commits1 = git.commits();
      expect(await apply(register)).toMatchObject({ ok: true, status: 'unchanged' });
      expect([declarations(root).pieces.split(NEW_PIECE).length, git.commits()]).toEqual([2, commits1]);

      // --- THE MALFORMED NAME: an exact rename, bytes unchanged ------------
      const { from, to } = SOURCE.correction.rename;
      const before = readFileSync(join(root, from));
      expect(await apply({ kind: 'rename', from, to })).toMatchObject({ ok: true, status: 'published' });
      expect(existsSync(join(root, from))).toBe(false);
      expect(sha(readFileSync(join(root, to)))).toBe(sha(before));
      // One row appended under the log's own header; nonempty timestamps kept.
      expect(declarations(root).log).toBe(`${decl0.log}${from},${to},\n`);
      // The SOURCE family's own oracle for sessions 40 and 41, reused rather than re-derived.
      expect(sessionsOf(git.published()!, [40, 41])).toEqual(oracle([40, 41]));
      expect(await apply({ kind: 'rename', from, to })).toMatchObject({ ok: true, status: 'unchanged' });
      const unmoved = Object.fromEntries(Object.entries(media0).filter(([path]) => path !== from));
      expect(media(root)).toEqual({ ...unmoved, [to]: media0[from] });

      // --- AN EXACT CONTINUATION, and no fork or loop ever -----------------
      const a = `${S39}/نمونه-ضربی-سه-گاه-لطفی.mp4`;
      const b = `${S39}/نمونه-ضربی-سه-گاه-لطفی-1.mp4`;
      const c = `${S39}/نمونه-ضربی-سه-گاه-لطفی-3.mp4`;
      expect(await apply({ kind: 'rename', from: a, to: b })).toMatchObject({ ok: true });
      expect(await apply({ kind: 'rename', from: b, to: c })).toMatchObject({ ok: true });
      const log = new Map((JSON.parse(git.published()!) as { renames: { from: string; to: string }[] }).renames.map((r) => [r.from, r.to]));
      expect(followRenames(a, log)).toBe(c);
      expect(() => planMaintenance(root, { kind: 'rename', from: c, to: a })).toThrow(/make a loop/);
      writeFileSync(join(root, b), 'a new file at the old name');
      expect(() => planMaintenance(root, { kind: 'rename', from: b, to: `${S39}/نمونه-ضربی-سه-گاه-لطفی-4.mp4` })).toThrow(/another name/);
      rmSync(join(root, b));

      // --- A CONFIRMED ROSTER: one cell, quoting and extra columns intact --
      const z = 'ضربی-سه-گاه-لطفی';
      const zRow = decl0.pieces.split('\n').find((l) => l.startsWith(`${z},`))!;
      expect(await apply({ kind: 'roster', session: 40, pieces: [z] })).toMatchObject({ ok: true });
      expect(declarations(root).pieces.split('\n').find((l) => l.startsWith(`${z},`))).toBe(zRow.replace(',39,"', ',"39,40","'));

      // --- A STALE PREVIEW or a concurrent edit is refused -----------------
      const stalePlan = planMaintenance(root, { kind: 'roster', session: 41, pieces: [z] });
      const beforeEdit = declarations(root);
      appendFileSync(join(root, 'PIECES.csv'), 'دیگر,,,,,,,,,\n'); // someone else's edit, meanwhile
      const edited = declarations(root);
      await expect(applyMaintenance({ root, state, action: { kind: 'roster', session: 41, pieces: [z] }, previewId: stalePlan.id, publish: git.publish })).rejects.toThrow(/changed since that preview/);
      expect(declarations(root)).toEqual(edited);
      writeFileSync(join(root, 'PIECES.csv'), beforeEdit.pieces); // the other editor withdraws theirs
      writeFileSync(join(state, 'lock'), 'another run');
      await expect(apply({ kind: 'roster', session: 41, pieces: [z] })).rejects.toThrow(/holds the lock/);
      rmSync(join(state, 'lock'));

      // --- AN INTERRUPTED APPLY: recoverable, last good index kept ---------
      const good = git.published();
      const commitsBefore = git.commits();
      const pre = declarations(root);
      await expect(apply({ kind: 'roster', session: 41, pieces: [z] }, { interruptAfter: 'registry' })).rejects.toBeInstanceOf(Interrupted);
      expect(declarations(root).pieces).not.toBe(pre.pieces);
      expect(git.published()).toBe(good);
      await expect(apply({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/interrupted|did not finish/);
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      expect(declarations(root)).toEqual(pre);
      expect([git.published(), git.commits()]).toEqual([good, commitsBefore]); // nothing new to say: no commit

      // --- A FAILED PUBLICATION: archive valid, old index stays, safe retry -
      git.fail(true);
      const failed = await apply({ kind: 'roster', session: 41, pieces: [z] });
      expect(failed).toMatchObject({ ok: false, status: 'publish-failed' });
      expect(failed.message).toMatch(/last good index is still the published one.*retry/s);
      expect(git.published()).toBe(good);
      await expect(apply({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/retry/);
      git.fail(false);
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      const afterRetry = git.commits();
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      expect(git.commits()).toBe(afterRetry);

      // --- ROLLBACK of a published change: a NEW commit, never a rewrite ---
      const beforeRoster = git.published();
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      expect(git.commits()).toBe(afterRetry + 1);
      expect(git.published()).not.toBe(beforeRoster);
      expect(JSON.parse(git.published()!).contentHash).toBe(JSON.parse(good!).contentHash);
      expect(git.main()).toEqual(['c-main', { 'state.json': 'practice data' }]);

      // --- THE CLI asks, then publishes through the existing job itself ----
      const cli = (args: string[]) =>
        run('node', [TOOL, '--root', root, '--state', state, ...args], { env: { ...process.env, PC_INDEX_CONFIG: join(base, 'no-config.env') } }).then(
          (o) => ({ code: 0, out: o.stdout + o.stderr }),
          (e: { code: number; stdout: string; stderr: string }) => ({ code: e.code, out: e.stdout + e.stderr }),
        );
      const shown = await cli(['register', '--piece', 'یکی-دیگر']);
      const id = /--apply ([0-9a-f]{16})/.exec(shown.out)?.[1];
      expect([shown.code, id && id.length]).toEqual([0, 16]);
      const done = await cli(['register', '--piece', 'یکی-دیگر', '--apply', id!]);
      // No config here, so the job itself refuses: the change stands, validated, with a retry.
      expect(done.code).toBe(1);
      expect(done.out).toMatch(/publication failed .*NAS job exited 2.*retry/s);
      expect(declarations(root).pieces).toContain('یکی-دیگر,');
      // And media were never altered by any of it — only the two exact renames moved bytes.
      const after = media(root);
      expect(Object.values(after).sort()).toEqual(Object.values(media0).sort());
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});

function S42() {
  return SOURCE.emptyFolders[0]!;
}
