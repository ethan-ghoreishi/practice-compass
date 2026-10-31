import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, appendFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error — untyped operator tools; these are the real ones.
import { applyMaintenance, planMaintenance, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
// @ts-expect-error — see above.
import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
// @ts-expect-error — see above.
import { makeGitHubIndexTransport, publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
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
  let requests = 0;
  const transport = {
    getRef: async (b: string) => ((requests += 1), refs.has(b) ? { sha: refs.get(b)! } : null),
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
      return publishIndex({ transport, indexText: text, expectedContentHash: hash });
    },
    transport,
    requests: () => requests,
    published: () => commits.get(refs.get(SOURCE_INDEX_BRANCH) ?? '')?.[INDEX_PATH] ?? null,
    commits: () => n,
    main: () => [refs.get('main'), commits.get('c-main')],
    fail: (on: boolean) => (failing = on),
    calls,
  };
}

type Transport = ReturnType<typeof fakeGit>['transport'];
/**
 * GitHub's REST surface over a fake store, for the REAL transport. A request
 * named in `lose` is carried out and then its response is lost — GitHub
 * accepted it, this process never hears so.
 */
function githubFetch(t: Transport, lose: Set<string>) {
  return async (url: string, init: { method?: string; body?: string } = {}) => {
    const method = init.method ?? 'GET';
    const ep = url.split('/repos/o/r/')[1]!;
    const body = init.body ? JSON.parse(init.body) : {};
    const reply = (status: number, json: unknown = {}) => ({ ok: status < 300, status, json: async () => json });
    let res;
    if (method === 'GET' && ep.startsWith('git/ref/heads/')) {
      const r = await t.getRef(ep.slice(14));
      res = r ? reply(200, { object: { sha: r.sha } }) : reply(404);
    } else if (method === 'GET' && ep.startsWith('contents/')) {
      const [path, ref] = ep.slice(9).split('?ref=');
      const f = await t.getFile(ref!, path!);
      res = f ? reply(200, { content: Buffer.from(f.text).toString('base64') }) : reply(404);
    } else if (method === 'GET' && ep.startsWith('git/commits/')) res = reply(200, { tree: { sha: (await t.getCommit(ep.slice(12))).treeSha } });
    else if (ep === 'git/blobs') res = reply(201, { sha: await t.createBlob(body.content) });
    else if (ep === 'git/trees') res = reply(201, { sha: await t.createTree({ baseTreeSha: body.base_tree ?? null, path: body.tree[0].path, blobSha: body.tree[0].sha }) });
    else if (ep === 'git/commits') res = reply(201, { sha: await t.createCommit({ treeSha: body.tree }) });
    else if (method === 'PATCH') res = reply((await t.updateRef(ep.slice(15), body.sha, body.expected_head_sha)) === 'ok' ? 200 : 422);
    else if (ep === 'git/refs') res = reply((await t.createRef(body.ref.slice(11), body.sha)) === 'ok' ? 201 : 422);
    else throw new Error(`unexpected ${method} ${ep}`);
    if (lose.delete(method === 'PATCH' ? 'PATCH' : `${method} ${ep}`)) throw new TypeError('fetch failed: the response was lost');
    return res;
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
      // A SESSION FOLDER that is a link leads outside the archive: refused at
      // planning, before any read or hash, as a source and as a destination.
      const outside = join(base, 'outside-39');
      renameSync(join(root, S39), outside);
      writeFileSync(join(outside, 'نمونه.mp4'), 'outside bytes');
      symlinkSync(outside, join(root, S39));
      expect(() => planMaintenance(root, { kind: 'rename', from: `${S39}/نمونه.mp4`, to: `${S40}/نمونه-2.mp4` })).toThrow(/not a real folder/);
      expect(() => planMaintenance(root, { kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S39}/نمونه-2.mp4` })).toThrow(/not a real folder/);
      expect(readFileSync(join(outside, 'نمونه.mp4'), 'utf8')).toBe('outside bytes');
      rmSync(join(root, S39));
      rmSync(join(outside, 'نمونه.mp4'));
      renameSync(outside, join(root, S39));
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
      // RESTORE judges every file before touching any: renamed bytes changed,
      // or the session folder swapped for a link, refuse the whole rollback —
      // the declarations are NOT put back first, nothing is published.
      const renamed = declarations(root);
      const callsAtRename = git.calls.length;
      writeFileSync(join(root, to), 'changed meanwhile');
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/no longer holds the renamed bytes/);
      expect([declarations(root), readFileSync(join(root, to), 'utf8'), git.calls.length]).toEqual([renamed, 'changed meanwhile', callsAtRename]);
      writeFileSync(join(root, to), before);
      const folder40 = join(base, 'outside-40');
      renameSync(join(root, S40), folder40);
      symlinkSync(folder40, join(root, S40));
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/not a real folder/);
      expect([existsSync(join(folder40, to.split('/')[1]!)), declarations(root), git.calls.length]).toEqual([true, renamed, callsAtRename]);
      rmSync(join(root, S40));
      renameSync(folder40, join(root, S40));
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

      // --- RECOVERY NEVER UNDOES SOMEONE ELSE'S LATER CHANGE --------------
      // A row added through ANOTHER --state folder after this roster: rolling
      // the roster back is refused, the later row kept, nothing published.
      const other = join(base, 'other-state');
      mkdirSync(other);
      const later = { kind: 'register', piece: 'ردیف-بعدی' };
      expect(await applyMaintenance({ root, state: other, action: later, previewId: planMaintenance(root, later).id, publish: git.publish })).toMatchObject({ ok: true });
      const withLater = declarations(root);
      const callsLater = git.calls.length;
      const journalBefore = readFileSync(join(state, 'journal.json'), 'utf8');
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/PIECES.csv has changed since/);
      expect([declarations(root), git.calls.length, readFileSync(join(state, 'journal.json'), 'utf8')]).toEqual([withLater, callsLater, journalBefore]);
      // A LIVE run's lock is never taken or removed by a rollback.
      writeFileSync(join(state, 'lock'), `live-token ${process.pid}`);
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/holds the lock/);
      expect(readFileSync(join(state, 'lock'), 'utf8')).toBe(`live-token ${process.pid}`);
      rmSync(join(state, 'lock'));
      // A --state folder answers only for its own archive.
      const elsewhere = scratch();
      await expect(rollbackMaintenance({ root: elsewhere.root, state, publish: git.publish })).rejects.toThrow(/another archive/);
      await expect(retryMaintenance({ root: elsewhere.root, state, publish: git.publish })).rejects.toThrow(/another archive/);
      expect(declarations(elsewhere.root)).toEqual(decl0);
      rmSync(elsewhere.base, { recursive: true, force: true });
      // The later change's OWN folder may put it back, and that leaves the roster.
      expect(await rollbackMaintenance({ root, state: other, publish: git.publish })).toMatchObject({ ok: true });
      expect(declarations(root).pieces).not.toContain('ردیف-بعدی');
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
      // A REAL process, gone mid-apply: its lock and `prepared` journal remain.
      const interruptedRun = { root, state, action: { kind: 'roster', session: 41, pieces: [z] }, previewId: planMaintenance(root, { kind: 'roster', session: 41, pieces: [z] }).id };
      const child = await run(
        'node',
        ['--input-type=module', '-e', `const m = await import(${JSON.stringify(TOOL)}); await m.applyMaintenance({ ...JSON.parse(process.env.RUN), publish: async () => { throw new Error('unreached'); }, interruptAfter: 'registry' }).catch((e) => { process.exitCode = e instanceof m.Interrupted ? 7 : 1; });`],
        { env: { ...process.env, RUN: JSON.stringify(interruptedRun) } },
      ).then(() => 0, (e: { code: number }) => e.code);
      expect(child).toBe(7);
      expect(existsSync(join(state, 'lock'))).toBe(true);
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

      // --- A RUN KILLED IN ANY PHASE: every entry point recovers its dead lock -
      // A REAL child process dies at each phase of apply, rollback and retry.
      // Its lock stays behind; each entry point adopts it (the journal, not the
      // dead token, decides), refuses only what the journal forbids, and the
      // route the refusal names finishes the job.
      const lockFile = join(state, 'lock');
      const journal = () => JSON.parse(readFileSync(join(state, 'journal.json'), 'utf8'));
      const killed = (fn: string, args: object, interruptAfter?: string) =>
        run(
          'node',
          ['--input-type=module', '-e', `const m = await import(${JSON.stringify(TOOL)}); const a = JSON.parse(process.env.RUN); await m.${fn}({ ...a, publish: async () => { process.kill(process.pid, 'SIGKILL'); await new Promise(() => {}); } }).catch((e) => { process.exitCode = e instanceof m.Interrupted ? 7 : 1; });`],
          { env: { ...process.env, RUN: JSON.stringify({ root, state, ...args, ...(interruptAfter ? { interruptAfter } : {}) }) } },
        ).then(() => 0, (e: { code: number | null; signal?: string }) => e.signal ?? e.code);
      /** The dead run's lock, put back before each entry point so each must adopt it itself. */
      const deadLock = () => {
        const text = readFileSync(lockFile, 'utf8');
        expect(Number(text.split(' ')[1])).not.toBe(process.pid);
        return () => (existsSync(lockFile) ? undefined : writeFileSync(lockFile, text));
      };
      const c2 = `${S39}/نمونه-ضربی-سه-گاه-لطفی-5.mp4`;
      const move = { kind: 'rename', from: c, to: c2 };
      const moveArgs = () => ({ action: move, previewId: planMaintenance(root, move).id });
      const another = { kind: 'register', piece: 'یکی-دیگر' };
      const settled = { decl: declarations(root), media: media(root), index: git.published(), commits: git.commits() };
      const isSettled = () => expect([declarations(root), media(root), git.published(), git.commits()]).toEqual([settled.decl, settled.media, settled.index, settled.commits]);

      // Apply killed before publication: the archive half-written, `prepared`.
      for (const phase of ['copy', 'registry', 'log', 'rename']) {
        expect(await killed('applyMaintenance', moveArgs(), phase), phase).toBe(7);
        expect(journal().status, phase).toBe('prepared');
        const plant = deadLock();
        await expect(apply(another), phase).rejects.toThrow(/apply did not finish. Run `rollback`/);
        expect(existsSync(lockFile), phase).toBe(false); // adopted, then released: it was ours
        plant();
        await expect(retryMaintenance({ root, state, publish: git.publish }), phase).rejects.toThrow(/did not finish; run `rollback`/);
        plant();
        expect(await rollbackMaintenance({ root, state, publish: git.publish }), phase).toMatchObject({ ok: true });
        isSettled(); // put back exactly; the unchanged index made no commit
      }
      // Apply killed DURING publication: applied, publication pending. Both routes work.
      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
      expect(journal()).toMatchObject({ status: 'applied', publication: 'pending' });
      let plant = deadLock();
      await expect(apply(another)).rejects.toThrow(/not yet published .*Run `retry`/);
      plant();
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      settled.index = git.published();
      settled.commits = git.commits();
      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
      deadLock()();
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      isSettled();
      // Rollback killed after marking itself, before its first write: the mark
      // carries ITS token, and the next rollback adopts it.
      expect(await killed('applyMaintenance', moveArgs(), 'log')).toBe(7);
      expect(await killed('rollbackMaintenance', {}, 'mark')).toBe(7);
      expect(journal()).toMatchObject({ status: 'rolling-back', lockToken: readFileSync(lockFile, 'utf8').split(' ')[0] });
      plant = deadLock();
      await expect(apply(another)).rejects.toThrow(/rollback did not finish. Run `rollback`/);
      plant();
      await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/rollback did not finish; run `rollback`/);
      plant();
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      isSettled();
      // Rollback killed DURING its publication: restored, not yet published.
      expect(await killed('applyMaintenance', moveArgs(), 'rename')).toBe(7);
      expect(await killed('rollbackMaintenance', {})).toBe('SIGKILL');
      expect(journal()).toMatchObject({ status: 'rolled-back', publication: 'pending' });
      expect([declarations(root), media(root)]).toEqual([settled.decl, settled.media]);
      plant = deadLock();
      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
      plant();
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/already rolled back but not yet published; run `retry`/);
      plant();
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      isSettled();
      // Retry killed during ITS publication, after adopting apply's dead lock.
      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
      expect(await killed('retryMaintenance', {})).toBe('SIGKILL');
      plant = deadLock();
      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
      plant();
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      settled.index = git.published();
      settled.commits = git.commits();
      // A run killed before it wrote any journal left only its lock: the
      // finished journal stands, and the next run proceeds.
      const gone = await run('node', ['-e', 'console.log(process.pid)']).then((o) => o.stdout.trim());
      writeFileSync(lockFile, `never-journaled ${gone}`);
      // ONE adopter at a time: while another live run holds the claim on that
      // dead lock, every entry point refuses and writes nothing; a claim left
      // by a dead claimer is cleared by the refusal, and the next run adopts.
      const claim = join(state, 'lock.adopt.never-journaled');
      writeFileSync(claim, `live-claimer ${process.pid}`);
      const journalNow = readFileSync(join(state, 'journal.json'), 'utf8');
      for (const entry of [() => apply(another), () => retryMaintenance({ root, state, publish: git.publish }), () => rollbackMaintenance({ root, state, publish: git.publish })]) {
        await expect(entry()).rejects.toThrow(/taking over an interrupted run’s lock/);
      }
      expect([readFileSync(lockFile, 'utf8'), readFileSync(join(state, 'journal.json'), 'utf8'), existsSync(claim)]).toEqual([`never-journaled ${gone}`, journalNow, true]);
      isSettled();
      writeFileSync(claim, `dead-claimer ${gone}`);
      await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/taking over/);
      expect(existsSync(claim)).toBe(false);
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      expect(existsSync(lockFile)).toBe(false);
      isSettled();

      // --- GITHUB ACCEPTED THE WRITE, THE RESPONSE WAS LOST: unknown, never "nothing" -
      // The REAL transport over a fake GitHub. updateRef lands, its answer is
      // lost: publication is unconfirmed (the branch DOES hold the new index),
      // and `retry` settles it without a second commit.
      const lose = new Set<string>();
      const viaGitHub = (text: string, hash: string) => publishIndex({ transport: makeGitHubIndexTransport({ repo: 'o/r', token: 't' }), indexText: text, expectedContentHash: hash });
      try {
        vi.stubGlobal('fetch', githubFetch(git.transport, lose));
        lose.add('PATCH');
        const lost = await applyMaintenance({ root, state, ...moveArgs(), publish: viaGitHub });
        expect(lost).toMatchObject({ ok: false, status: 'publish-failed' });
        expect(lost.message).toMatch(/could not be confirmed \(fetch failed.*may already be published.*Run `retry`/s);
        expect(lost.message).not.toMatch(/last good index/);
        expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
        expect(journal().publication).toBe('unknown');
        await expect(apply(another)).rejects.toThrow(/unconfirmed\)\. Run `retry`/);
        const landed = git.commits();
        expect(await retryMaintenance({ root, state, publish: viaGitHub })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
        expect(git.commits()).toBe(landed);
        // createRef likewise, on a repository with no source-index branch yet —
        // through ROLLBACK's publication this time.
        const fresh = fakeGit();
        vi.stubGlobal('fetch', githubFetch(fresh.transport, lose));
        lose.add('POST git/refs');
        const lostCreate = await rollbackMaintenance({ root, state, publish: viaGitHub });
        expect(lostCreate).toMatchObject({ ok: false, status: 'publish-failed' });
        expect(lostCreate.message).toMatch(/could not be confirmed.*may already be published/s);
        expect(lostCreate.message).not.toMatch(/last good index/);
        expect(JSON.parse(fresh.published()!).contentHash).toBe(scanToIndex(root).contentHash);
        expect(await retryMaintenance({ root, state, publish: viaGitHub })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
        expect(fresh.commits()).toBe(1);
        // A failure BEFORE the ref write is proved: the last good index stands.
        fresh.fail(true);
        await expect(viaGitHub(fresh.published()!, JSON.parse(fresh.published()!).contentHash.replace(/./, 'x'))).rejects.toMatchObject({ nothingPublished: true });
        await expect(publishIndex({ transport: makeGitHubIndexTransport({ repo: 'o/r', token: 't' }), indexText: `${fresh.published()} ` })).rejects.toMatchObject({ nothingPublished: true });
        fresh.fail(false);
      } finally {
        vi.unstubAllGlobals();
      }
      // The rollback above went to `fresh`; say it to `git` too.
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      settled.index = git.published();
      settled.commits = git.commits();
      isSettled();

      // --- PUBLISHED, BUT THE JOURNAL COULD NOT RECORD IT: said as published --
      const thenBlockJournal = async (text: string, hash: string) => {
        const out = await git.publish(text, hash);
        mkdirSync(join(state, 'journal.json.tmp')); // the journal's next write fails
        return out;
      };
      const unrecorded = applyMaintenance({ root, state, ...moveArgs(), publish: thenBlockJournal });
      await expect(unrecorded).rejects.toThrow(/was published, but the private journal could not record it .*Run `retry` to record it/s);
      rmSync(join(state, 'journal.json.tmp'), { recursive: true });
      expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
      expect(journal()).toMatchObject({ status: 'applied', publication: 'pending' });
      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
      const recorded = git.commits();
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      expect([git.commits(), journal().publication]).toEqual([recorded, 'published']);
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      expect([declarations(root), media(root)]).toEqual([settled.decl, settled.media]);

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

      // --- THE REAL WRAPPER publishes only the validated index, on evidence -
      const validated = scanToIndex(root).contentHash as string;
      const via = (cmd: string | undefined, extra: Record<string, string> = {}) =>
        run('node', [TOOL, '--root', root, '--state', state, 'retry'], {
          env: { ...process.env, PC_INDEX_CONFIG: join(base, 'no-config.env'), ...(cmd ? { PC_MAINT_PUBLISH: cmd } : {}), ...extra },
        }).then(
          (o) => ({ code: 0, out: o.stdout + o.stderr }),
          (e: { code: number; stdout: string; stderr: string }) => ({ code: e.code, out: e.stdout + e.stderr }),
        );
      // A job that does nothing and says nothing has not published.
      const silent = await via('true');
      expect(silent.code).toBe(1);
      expect(silent.out).toMatch(/could not be confirmed.*without its publication evidence/s);
      expect(silent.out).not.toMatch(/last good index is still/);
      // Evidence naming another index is refused too.
      const stub = join(base, 'stub-job.mjs');
      writeFileSync(stub, `console.log('published-index published ' + (process.env.WRONG ? '0'.repeat(64) : process.argv[2]));`);
      const wrong = await via(`node ${JSON.stringify(stub)}`, { WRONG: '1' });
      expect([wrong.code, wrong.out]).toEqual([1, expect.stringMatching(/reports index 000000000000, not the validated/)]);
      // Only the job's own refusals (exit 2, 3, 4) prove nothing was published.
      // Any other exit, or a job killed by a signal, may have come after GitHub
      // accepted the ref: unconfirmed, never "the last good index is still".
      const exits = join(base, 'exit-job.mjs');
      writeFileSync(exits, `process.stderr.write('stopped\\n'); process.exit(Number(process.env.EXIT));`);
      for (const [code, says] of [
        ['1', /could not be confirmed \(the NAS job exited 1: stopped\).*may already be published/s],
        ['137', /could not be confirmed \(the NAS job exited 137/],
        ['4', /publication failed \(the NAS job exited 4 before publishing: stopped\).*last good index is still the published one/s],
      ] as const) {
        const r = await via(`node ${JSON.stringify(exits)}`, { EXIT: code });
        expect([r.code, r.out], code).toEqual([1, expect.stringMatching(says)]);
        if (code !== '4') expect(r.out, code).not.toMatch(/last good index/);
      }
      const signalled = await via('kill -9 $$;:');
      expect([signalled.code, signalled.out]).toEqual([1, expect.stringMatching(/could not be confirmed \(the NAS job was stopped \(SIGKILL\)/)]);
      // The REAL runner whose scan fails stops before publishing: exit 4, proved.
      const noArchive = join(base, 'scan-fails');
      mkdirSync(noArchive);
      writeFileSync(join(noArchive, 'config.env'), `PC_ARCHIVE_ROOT=${join(noArchive, 'missing')}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${noArchive}\n`);
      const scanFailed = await via(undefined, { PC_INDEX_CONFIG: join(noArchive, 'config.env') });
      expect([scanFailed.code, scanFailed.out]).toEqual([1, expect.stringMatching(/exited 4 before publishing: The scan failed; nothing was published.*last good index is still the published one/s)]);
      // The REAL runner, configured for ANOTHER archive root, refuses before
      // any request — the published index is untouched, and it says so.
      const otherArchive = scratch();
      const work = join(otherArchive.base, 'work');
      mkdirSync(work);
      const config = join(otherArchive.base, 'config.env');
      writeFileSync(config, `PC_ARCHIVE_ROOT=${otherArchive.root}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${work}\n`);
      const misrouted = await via(undefined, { PC_INDEX_CONFIG: config });
      expect(misrouted.code).toBe(1);
      expect(misrouted.out).toMatch(/scanned a different index than the validated .*Refused: This index is .*nothing was published.*last good index is still the published one/s);
      rmSync(otherArchive.base, { recursive: true, force: true });
      // And the publisher itself refuses an unvalidated index before ANY request.
      const requestsBefore = git.requests();
      await expect(publishIndex({ transport: git.transport, indexText: git.published()!, expectedContentHash: validated })).rejects.toThrow(/nothing was published/);
      expect(git.requests()).toBe(requestsBefore);
      // The job's evidence for exactly the validated hash: published.
      const ok = await via(`node ${JSON.stringify(stub)}`);
      expect([ok.code, ok.out]).toEqual([0, expect.stringContaining(`Published index ${validated.slice(0, 12)} (published)`)]);
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
