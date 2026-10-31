import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error — untyped operator tools; these are the real ones.
import { applyMaintenance, Interrupted, planMaintenance, releaseLock, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
// @ts-expect-error — see above.
import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
// @ts-expect-error — see above.
import { archiveConfirmation, ARCHIVE_LOCK, DEFAULT_SEAT_PORT, makeGitHubIndexTransport, publishIndex, readArchiveLock, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
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

/** A fake Git boundary; its `publish` is the real publisher, confirming against `root` before every ref write. */
function fakeGit(root: string) {
  const refs = new Map<string, string>([['main', 'c-main']]);
  const commits = new Map<string, Record<string, string>>([['c-main', { 'state.json': 'practice data' }]]);
  let n = 0;
  let failing = false;
  let refusing = 0;
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
    // GitHub may answer 422 WITHOUT the ref having moved (validation, endpoint spam): `refuse(n)` models that.
    updateRef: async (b: string, s: string, e: string) => (refusing > 0 ? ((refusing -= 1), 'HTTP 422') : refs.get(b) === e ? (refs.set(b, s), 'ok') : 'HTTP 422'),
    createRef: async (b: string, s: string) => (refs.has(b) ? 'HTTP 422' : (refs.set(b, s), 'ok')),
  };
  const calls: string[] = [];
  /** What every publisher on this "NAS" shares, as the CLI wires it: the seat and the unanswered-write record. */
  const shared = { seat: { port: DEFAULT_SEAT_PORT, wait: 0, onBusy: undefined as (() => void) | undefined }, intent: join(dirname(root), 'setar-publish-intent.json') };
  return {
    publish: async (text: string, hash: string, holder?: string) => {
      calls.push(hash);
      // A maintenance publication waits for the seat, as the CLI's --holder route does.
      return publishIndex({ transport, indexText: text, expectedContentHash: hash, confirm: archiveConfirmation(root, holder), ...shared, seat: { ...shared.seat, wait: holder ? 10_000 : 0 } });
    },
    shared,
    transport,
    requests: () => requests,
    published: () => commits.get(refs.get(SOURCE_INDEX_BRANCH) ?? '')?.[INDEX_PATH] ?? null,
    commits: () => n,
    main: () => [refs.get('main'), commits.get('c-main')],
    fail: (on: boolean) => (failing = on),
    refuse: (n: number) => (refusing = n),
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
    const git = fakeGit(root);
    const lockFile = join(root, ARCHIVE_LOCK);
    /** The operator's route for a lock no run will take: see the record, then release exactly it. */
    const release = () => {
      const id = /--record ([0-9a-f]{16})/.exec(releaseLock({ root }).lines.join('\n'))?.[1];
      expect(id).toMatch(/^[0-9a-f]{16}$/);
      expect(releaseLock({ root, record: id })).toMatchObject({ released: true });
      expect(existsSync(lockFile)).toBe(false);
    };
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
        // A move stays in one folder: every write is then made inside that ONE bound folder.
        [{ kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S39}/نمونه-2.mp4` }, /stays inside its session folder/],
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
      expect(() => planMaintenance(root, { kind: 'rename', from: `${S39}/نمونه.mp4`, to: `${S39}/نمونه-2.mp4` })).toThrow(/not a real folder/);
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
      // A held ARCHIVE lock is never taken or removed by a rollback.
      writeFileSync(lockFile, `live-token ${process.pid}`);
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/maintenance lock is held/);
      expect(readFileSync(lockFile, 'utf8')).toBe(`live-token ${process.pid}`);
      rmSync(lockFile);
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
      writeFileSync(lockFile, 'another run');
      await expect(apply({ kind: 'roster', session: 41, pieces: [z] })).rejects.toThrow(/maintenance lock is held by a record not in this tool’s form/);
      rmSync(lockFile);

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
      expect(existsSync(lockFile)).toBe(true);
      expect(declarations(root).pieces).not.toBe(pre.pieces);
      expect(git.published()).toBe(good);
      // Its lock stays: no run adopts it on a guess. The operator releases that exact record.
      await expect(apply({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/maintenance lock is held by run .*release-lock --record/);
      release();
      await expect(apply({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/did not finish/);
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      expect(declarations(root)).toEqual(pre);
      expect([git.published(), git.commits()]).toEqual([good, commitsBefore]); // nothing new to say: no commit

      // --- A FAILED PUBLICATION: archive valid, old index stays, safe retry -
      git.fail(true);
      const failed = await apply({ kind: 'roster', session: 41, pieces: [z] });
      expect(failed).toMatchObject({ ok: false, status: 'publish-failed' });
      expect(failed.message).toMatch(/This attempt published nothing, so the source-index branch is as it was.*retry/s);
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

      // --- A RUN KILLED IN ANY PHASE: refused until its exact lock is released -
      // A REAL child process dies at each phase of apply, rollback and retry.
      // Its lock stays behind and EVERY entry point refuses it unchanged; the
      // operator releases that record, and the route the journal names finishes.
      const journal = () => JSON.parse(readFileSync(join(state, 'journal.json'), 'utf8'));
      const killed = (fn: string, args: object, interruptAfter?: string) =>
        run(
          'node',
          ['--input-type=module', '-e', `const m = await import(${JSON.stringify(TOOL)}); const a = JSON.parse(process.env.RUN); await m.${fn}({ ...a, publish: async () => { process.kill(process.pid, 'SIGKILL'); await new Promise(() => {}); } }).catch((e) => { process.exitCode = e instanceof m.Interrupted ? 7 : 1; });`],
          { env: { ...process.env, RUN: JSON.stringify({ root, state, ...args, ...(interruptAfter ? { interruptAfter } : {}) }) } },
        ).then(() => 0, (e: { code: number | null; signal?: string }) => e.signal ?? e.code);
      const c2 = `${S39}/نمونه-ضربی-سه-گاه-لطفی-5.mp4`;
      const move = { kind: 'rename', from: c, to: c2 };
      const moveArgs = () => ({ action: move, previewId: planMaintenance(root, move).id });
      const another = { kind: 'register', piece: 'یکی-دیگر' };
      /** Every entry point refuses the dead run's lock and changes nothing; then the operator releases it. */
      const lockedOut = async (phase: string) => {
        const held = readArchiveLock(root)?.digest;
        const journalNow = readFileSync(join(state, 'journal.json'), 'utf8');
        const archiveNow = [declarations(root), media(root)];
        for (const entry of [() => apply(another), () => retryMaintenance({ root, state, publish: git.publish }), () => rollbackMaintenance({ root, state, publish: git.publish })]) {
          await expect(entry(), phase).rejects.toThrow(/maintenance lock is held by run/);
        }
        expect([readArchiveLock(root)?.digest, readFileSync(join(state, 'journal.json'), 'utf8'), declarations(root), media(root)], phase).toEqual([held, journalNow, ...archiveNow]);
        release();
      };
      const settled = { decl: declarations(root), media: media(root), index: git.published(), commits: git.commits() };
      const isSettled = () => expect([declarations(root), media(root), git.published(), git.commits()]).toEqual([settled.decl, settled.media, settled.index, settled.commits]);

      // Apply killed before publication: the archive half-written, `prepared`.
      for (const phase of ['copy', 'registry', 'log', 'rename']) {
        expect(await killed('applyMaintenance', moveArgs(), phase), phase).toBe(7);
        expect(journal().status, phase).toBe('prepared');
        await lockedOut(phase);
        await expect(apply(another), phase).rejects.toThrow(/apply did not finish. Run `rollback`/);
        expect(existsSync(lockFile), phase).toBe(false); // its own lock, released
        await expect(retryMaintenance({ root, state, publish: git.publish }), phase).rejects.toThrow(/did not finish; run `rollback`/);
        expect(await rollbackMaintenance({ root, state, publish: git.publish }), phase).toMatchObject({ ok: true });
        isSettled(); // put back exactly; the unchanged index made no commit
      }
      // Apply killed DURING publication: applied, publication pending FOR ITS HASH. Both routes work.
      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
      expect(journal()).toMatchObject({ status: 'applied', publication: 'pending', contentHash: scanToIndex(root).contentHash, unresolved: [scanToIndex(root).contentHash] });
      await lockedOut('apply publishing');
      await expect(apply(another)).rejects.toThrow(/not yet published .*Run `retry`/);
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
      expect(journal()).toMatchObject({ publication: 'published', unresolved: [] });
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      settled.index = git.published();
      settled.commits = git.commits();
      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
      release();
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      isSettled();
      // Rollback killed after marking itself, before its first write.
      expect(await killed('applyMaintenance', moveArgs(), 'log')).toBe(7);
      release();
      expect(await killed('rollbackMaintenance', {}, 'mark')).toBe(7);
      expect(journal()).toMatchObject({ status: 'rolling-back', lockToken: readArchiveLock(root).token });
      await lockedOut('rollback mark');
      await expect(apply(another)).rejects.toThrow(/rollback did not finish. Run `rollback`/);
      await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/rollback did not finish; run `rollback`/);
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      isSettled();
      // Rollback killed DURING its publication: restored, pending for the RESTORED hash.
      expect(await killed('applyMaintenance', moveArgs(), 'rename')).toBe(7);
      release();
      expect(await killed('rollbackMaintenance', {})).toBe('SIGKILL');
      expect(journal()).toMatchObject({ status: 'rolled-back', publication: 'pending', contentHash: scanToIndex(root).contentHash });
      expect([declarations(root), media(root)]).toEqual([settled.decl, settled.media]);
      await lockedOut('rollback publishing');
      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/already rolled back but not yet published; run `retry`/);
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      isSettled();
      // Retry killed during ITS publication.
      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
      release();
      expect(await killed('retryMaintenance', {})).toBe('SIGKILL');
      await lockedOut('retry publishing');
      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
      settled.index = git.published();
      settled.commits = git.commits();

      // --- AMBIGUOUS OR PARTIAL LOCK RECORDS: refused, never adopted, released only by exact record -
      const gone = Number(await run('node', ['-e', 'console.log(process.pid)']).then((o) => o.stdout.trim()));
      const deadRun = ['0f0f0f0f', '0000', '4000', '8000', '000000000000'].join('-');
      const records = [
        '',
        deadRun,
        `${deadRun} ${gone}`,
        JSON.stringify({ token: deadRun, pid: 'abc', host: 'h', since: 's' }),
        JSON.stringify({ token: deadRun, pid: 0, host: 'h', since: 's' }),
        JSON.stringify({ token: deadRun, pid: -4, host: 'h', since: 's' }),
        JSON.stringify({ token: deadRun, pid: 1.5, host: 'h', since: 's' }),
        JSON.stringify({ token: deadRun, pid: gone, host: 'h', since: 's' }).slice(0, -12), // truncated
      ];
      const journalNow = readFileSync(join(state, 'journal.json'), 'utf8');
      /** A record as an earlier version (a file at the lock's name) or as this one (the lock's folder) would hold it. */
      const plant = (record: string, asFolder: boolean) => {
        if (!asFolder) return writeFileSync(lockFile, record);
        mkdirSync(lockFile);
        writeFileSync(join(lockFile, `${deadRun}.json`), record);
      };
      const planted = (asFolder: boolean) => readFileSync(asFolder ? join(lockFile, `${deadRun}.json`) : lockFile, 'utf8');
      for (const [record, asFolder] of records.flatMap((r) => [[r, false], [r, true]] as const)) {
        plant(record, asFolder);
        for (const entry of [() => apply(another), () => retryMaintenance({ root, state, publish: git.publish }), () => rollbackMaintenance({ root, state, publish: git.publish })]) {
          await expect(entry(), record).rejects.toThrow(/maintenance lock is held by a record not in this tool’s form.*release-lock --record/);
        }
        // The scheduled job refuses too.
        await expect(publishIndex({ transport: git.transport, indexText: `${git.published()} `, confirm: archiveConfirmation(root) }), record).rejects.toMatchObject({
          nothingPublished: true,
          message: expect.stringMatching(/A maintenance run holds the archive; nothing was published/),
        });
        expect([planted(asFolder), readFileSync(join(state, 'journal.json'), 'utf8')], record).toEqual([record, journalNow]);
        // A record other than the one shown is never released.
        expect(() => releaseLock({ root, record: '0'.repeat(16) }), record).toThrow(/not the record you saw/);
        expect(planted(asFolder)).toBe(record);
        release();
      }
      // A COMPLETE record of a dead run is no different: shown, then released by hand, never adopted.
      plant(JSON.stringify({ token: deadRun, pid: gone, host: 'h', since: 's' }), true);
      await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(new RegExp(`held by run ${deadRun.slice(0, 8)} \\(pid ${gone}`));
      release();
      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      expect(existsSync(lockFile)).toBe(false);
      expect(releaseLock({ root }).lines).toEqual(['The archive holds no maintenance lock. Nothing to do.']);
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
        expect(lost.message).not.toMatch(/branch is as it was/);
        expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
        expect(journal().publication).toBe('unknown');
        await expect(apply(another)).rejects.toThrow(/unconfirmed\)\. Run `retry`/);
        const landed = git.commits();
        expect(await retryMaintenance({ root, state, publish: viaGitHub })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
        expect(git.commits()).toBe(landed);
        // createRef likewise, on a repository with no source-index branch yet —
        // through ROLLBACK's publication this time.
        const fresh = fakeGit(root);
        vi.stubGlobal('fetch', githubFetch(fresh.transport, lose));
        lose.add('POST git/refs');
        const lostCreate = await rollbackMaintenance({ root, state, publish: viaGitHub });
        expect(lostCreate).toMatchObject({ ok: false, status: 'publish-failed' });
        expect(lostCreate.message).toMatch(/could not be confirmed.*may already be published/s);
        expect(lostCreate.message).not.toMatch(/branch is as it was/);
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
      const thenBlockJournal = async (text: string, hash: string, holder: string) => {
        const out = await git.publish(text, hash, holder);
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
      expect(silent.out).not.toMatch(/branch is as it was/);
      // Evidence naming another index is refused too.
      const stub = join(base, 'stub-job.mjs');
      writeFileSync(stub, `console.log('published-index published ' + (process.env.WRONG ? '0'.repeat(64) : process.argv[2]));`);
      const wrong = await via(`node ${JSON.stringify(stub)}`, { WRONG: '1' });
      expect([wrong.code, wrong.out]).toEqual([1, expect.stringMatching(/reports index 000000000000, not the validated/)]);
      // Only the job's own refusals (exit 2, 3, 4) prove nothing was published.
      // Any other exit, or a job killed by a signal, may have come after GitHub
      // accepted the ref: unconfirmed, never "the branch is as it was".
      const exits = join(base, 'exit-job.mjs');
      writeFileSync(exits, `process.stderr.write('stopped\\n'); process.exit(Number(process.env.EXIT));`);
      for (const [code, says] of [
        ['1', /could not be confirmed \(the NAS job exited 1: stopped\).*may already be published/s],
        ['137', /could not be confirmed \(the NAS job exited 137/],
        // The job's exit 4 proves only THIS attempt: the earlier unconfirmed ones stay unconfirmed.
        ['4', /could not be confirmed \(the NAS job exited 4 before publishing: stopped\); this attempt published nothing, but an earlier attempt is still unconfirmed/s],
      ] as const) {
        const r = await via(`node ${JSON.stringify(exits)}`, { EXIT: code });
        expect([r.code, r.out], code).toEqual([1, expect.stringMatching(says)]);
        expect(r.out, code).not.toMatch(/branch is as it was/);
      }
      const signalled = await via('kill -9 $$;:');
      expect([signalled.code, signalled.out]).toEqual([1, expect.stringMatching(/could not be confirmed \(the NAS job was stopped \(SIGKILL\)/)]);
      // The REAL runner whose scan fails stops before publishing: exit 4, proved.
      const noArchive = join(base, 'scan-fails');
      mkdirSync(noArchive);
      writeFileSync(join(noArchive, 'config.env'), `PC_ARCHIVE_ROOT=${join(noArchive, 'missing')}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${noArchive}\n`);
      const scanFailed = await via(undefined, { PC_INDEX_CONFIG: join(noArchive, 'config.env') });
      expect([scanFailed.code, scanFailed.out]).toEqual([1, expect.stringMatching(/exited 4 before publishing: The scan failed; nothing was published.*an earlier attempt is still unconfirmed/s)]);
      // The REAL runner, configured for ANOTHER archive root, refuses before
      // any request — the published index is untouched, and it says so.
      const otherArchive = scratch();
      const work = join(otherArchive.base, 'work');
      mkdirSync(work);
      const config = join(otherArchive.base, 'config.env');
      writeFileSync(config, `PC_ARCHIVE_ROOT=${otherArchive.root}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${work}\n`);
      const misrouted = await via(undefined, { PC_INDEX_CONFIG: config });
      expect(misrouted.code).toBe(1);
      expect(misrouted.out).toMatch(/scanned a different index than the validated .*Refused: This index is .*nothing was published.*an earlier attempt is still unconfirmed/s);
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

    // =======================================================================
    // THE CUT-POINT AND OVERLAPPING-WRITER MATRIX. Each case on its own scratch
    // archive. `at(point, name)` runs just before each archive write — forward
    // and recovery alike — and another writer acts there: its edit is kept,
    // never overwritten, recreated or moved away, and the run refuses.
    // =======================================================================
    const boxes: string[] = [];
    try {
      const A = `${S39}/نمونه-ضربی-سه-گاه-لطفی.mp4`;
      const B = `${S39}/نمونه-ضربی-سه-گاه-لطفی-1.mp4`;
      const REG = { kind: 'register', piece: NEW_PIECE, session: 41 };
      const MOVE = { kind: 'rename', from: A, to: B };
      const box = (withLog = true) => {
        const sc = scratch();
        boxes.push(sc.base);
        if (!withLog) rmSync(join(sc.root, 'RENAME-LOG.csv'));
        const g = fakeGit(sc.root);
        const at = (p: string) => join(sc.root, p);
        const j = () => JSON.parse(readFileSync(join(sc.state, 'journal.json'), 'utf8'));
        const go = (action: object, extra: object = {}) =>
          applyMaintenance({ root: sc.root, state: sc.state, action, previewId: planMaintenance(sc.root, action).id, publish: g.publish, ...extra });
        const back = (extra: object = {}) => rollbackMaintenance({ root: sc.root, state: sc.state, publish: g.publish, ...extra });
        const again = (extra: object = {}) => retryMaintenance({ root: sc.root, state: sc.state, publish: g.publish, ...extra });
        return { ...sc, g, at, j, go, back, again, lock: at(ARCHIVE_LOCK) };
      };
      /** Run `fn` the `nth` time the tool reaches `point` for `name`. */
      const when = (...rules: [string, string, () => void, number?][]) => {
        const seen = new Map<string, number>();
        return (point: string, name: string) => {
          for (const [p, n, fn, nth = 1] of rules) {
            if (p !== point || n !== name) continue;
            const k = `${p} ${n}`;
            seen.set(k, (seen.get(k) ?? 0) + 1);
            if (seen.get(k) === nth) fn();
          }
        };
      };
      const replaceWith = (path: string, text: string) => () => {
        writeFileSync(`${path}.editor`, text);
        renameSync(`${path}.editor`, path); // another editor's atomic save
      };
      const hidden = (root: string, prefix: string) => readdirSync(root).filter((f) => f.startsWith(prefix));

      // --- FORWARD declaration writes: replaced, deleted, created, at both instants -
      for (const [action, name, withLog] of [
        [REG, 'PIECES.csv', true],
        [MOVE, 'RENAME-LOG.csv', true],
      ] as const) {
        for (const edit of ['replace', 'delete'] as const) {
          const k = box(withLog);
          const pre = { media: media(k.root), index: k.g.published() };
          const theirs = `theirs,${edit}\n`;
          const out = k.go(action, { at: when(['capture', name, edit === 'replace' ? replaceWith(k.at(name), theirs) : () => rmSync(k.at(name))]) });
          await expect(out, `${name} ${edit}`).rejects.toThrow(edit === 'replace' ? /changed while this ran; it was left as the other edit made it.*it had changed nothing in the archive/s : /was removed while this ran.*it had changed nothing in the archive/s);
          expect(edit === 'replace' ? readFileSync(k.at(name), 'utf8') : existsSync(k.at(name)), `${name} ${edit}`).toBe(edit === 'replace' ? theirs : false);
          expect([media(k.root), k.g.published(), k.g.calls, existsSync(k.lock)], `${name} ${edit}`).toEqual([pre.media, pre.index, [], false]);
          expect(k.j(), `${name} ${edit}`).toMatchObject({ status: 'rolled-back', publication: 'not-needed' });
          expect(hidden(k.root, `.${name}`), `${name} ${edit}`).toEqual([]);
        }
      }
      {
        // The log was ABSENT and another writer creates it at the write: theirs stands.
        const k = box(false);
        await expect(k.go(MOVE, { at: when(['capture', 'RENAME-LOG.csv', () => writeFileSync(k.at('RENAME-LOG.csv'), 'old_path,new_path\n')]) })).rejects.toThrow(/appeared while this ran/);
        expect([readFileSync(k.at('RENAME-LOG.csv'), 'utf8'), existsSync(k.at(A)), existsSync(k.at(B))]).toEqual(['old_path,new_path\n', true, false]);
        // Someone saves a NEW file in the instant ours was set aside: theirs stands, the one it replaced is kept.
        const r = box();
        const decl = declarations(r.root);
        await expect(r.go(REG, { at: when(['install', 'PIECES.csv', () => writeFileSync(r.at('PIECES.csv'), 'saved meanwhile\n')]) })).rejects.toThrow(/written by someone else while this ran; theirs stands/);
        expect(readFileSync(r.at('PIECES.csv'), 'utf8')).toBe('saved meanwhile\n');
        const kept = hidden(r.root, '.PIECES.csv.superseded-');
        expect([kept.map((f) => readFileSync(r.at(f), 'utf8')), hidden(r.root, '.PIECES.csv.captured-')]).toEqual([[decl.pieces], []]);
        // The next run never takes that kept copy for the declaration: it stays kept —
        // beside the one this run replaces, which is kept too (never unlinked).
        writeFileSync(r.at('PIECES.csv'), decl.pieces);
        expect(await r.go(REG)).toMatchObject({ ok: true, status: 'published' });
        expect([hidden(r.root, '.PIECES.csv.captured-'), hidden(r.root, '.PIECES.csv.superseded-').map((f) => readFileSync(r.at(f), 'utf8'))]).toEqual([[], [decl.pieces, decl.pieces]]);
      }
      // A program holding a declaration OPEN writes through that handle — after the run judged
      // the file, and again after the run is over: every byte it writes is kept, never unlinked.
      for (const [action, name] of [
        [REG, 'PIECES.csv'],
        [MOVE, 'RENAME-LOG.csv'],
      ] as const) {
        const k = box();
        const before = readFileSync(k.at(name), 'utf8');
        const fd = openSync(k.at(name), 'r+');
        try {
          const out = await k.go(action, { at: when(['install', name, () => writeSync(fd, 'held,', Buffer.byteLength(before))]) });
          expect(out, name).toMatchObject({ ok: true, status: 'published' });
          writeSync(fd, 'later\n', Buffer.byteLength(before) + 5);
        } finally {
          closeSync(fd);
        }
        expect(hidden(k.root, `.${name}.superseded-`).map((f) => readFileSync(k.at(f), 'utf8')), name).toEqual([`${before}held,later\n`]);
        expect(JSON.parse(k.g.published()!).contentHash, name).toBe(scanToIndex(k.root).contentHash);
      }

      // --- TWO LIVE RUNS through two --state folders: ONE archive lock ------
      {
        const k = box();
        const otherState = join(k.base, 'other-state');
        mkdirSync(otherState);
        const later = { kind: 'register', piece: 'ردیف-بعدی' };
        let second: Promise<unknown> | undefined;
        const first = await k.go(REG, {
          at: when(['capture', 'PIECES.csv', () => {
            second = applyMaintenance({ root: k.root, state: otherState, action: later, previewId: planMaintenance(k.root, later).id, publish: k.g.publish });
          }]),
        });
        await expect(second).rejects.toThrow(/maintenance lock is held by run/);
        expect(first).toMatchObject({ ok: true, status: 'published' });
        expect(declarations(k.root).pieces).not.toContain('ردیف-بعدی');
        expect(k.g.calls).toHaveLength(1);
      }

      // --- RECOVERY writes (explicit rollback): replaced, deleted, at both instants -
      for (const edit of ['replace', 'delete', 'create'] as const) {
        const k = box();
        expect(await k.go(REG)).toMatchObject({ ok: true });
        const calls = k.g.calls.length;
        const point = edit === 'create' ? 'install' : 'capture';
        const hit = edit === 'replace' ? replaceWith(k.at('PIECES.csv'), 'theirs\n') : edit === 'delete' ? () => rmSync(k.at('PIECES.csv')) : () => writeFileSync(k.at('PIECES.csv'), 'theirs\n');
        await expect(k.back({ at: when([point, 'PIECES.csv', hit]) }), edit).rejects.toThrow(/changed while this ran|was removed while this ran|written by someone else/);
        expect(edit === 'delete' ? existsSync(k.at('PIECES.csv')) : readFileSync(k.at('PIECES.csv'), 'utf8'), edit).toBe(edit === 'delete' ? false : 'theirs\n');
        expect([k.j().status, k.g.calls.length], edit).toEqual(['rolling-back', calls]);
        // …and a later rollback still refuses rather than overwrite (or recreate) theirs.
        if (edit !== 'delete') await expect(k.back(), edit).rejects.toThrow(/has changed since this change was made/);
      }
      {
        // Another writer acts AFTER rollback judged the files and BEFORE it reaches the log
        // (while it moves the media back): the log write still proves what THIS change wrote.
        const k = box();
        expect(await k.go(MOVE)).toMatchObject({ ok: true });
        const theirs = `${readFileSync(k.at('RENAME-LOG.csv'), 'utf8')}x,y,\n`;
        await expect(k.back({ at: when(['link', A, replaceWith(k.at('RENAME-LOG.csv'), theirs)]) })).rejects.toThrow(/RENAME-LOG.csv changed while this ran/);
        expect(readFileSync(k.at('RENAME-LOG.csv'), 'utf8')).toBe(theirs);
      }
      {
        // The log was ABSENT before: rollback takes it out of the archive only while it holds what this change wrote.
        const k = box(false);
        expect(await k.go(MOVE)).toMatchObject({ ok: true });
        const written = readFileSync(k.at('RENAME-LOG.csv'), 'utf8');
        await expect(k.back({ at: when(['capture', 'RENAME-LOG.csv', replaceWith(k.at('RENAME-LOG.csv'), `${written}x,y\n`)]) })).rejects.toThrow(/changed while this ran/);
        expect(readFileSync(k.at('RENAME-LOG.csv'), 'utf8')).toBe(`${written}x,y\n`); // never moved out
        // Unedited, it is taken out and what this change wrote is kept beside the private copy.
        const k2 = box(false);
        expect(await k2.go(MOVE)).toMatchObject({ ok: true });
        const w2 = readFileSync(k2.at('RENAME-LOG.csv'), 'utf8');
        expect(await k2.back()).toMatchObject({ ok: true });
        expect(existsSync(k2.at('RENAME-LOG.csv'))).toBe(false);
        const copyDir = join(k2.state, readdirSync(k2.state).find((d) => d.endsWith(planMaintenance(k2.root, MOVE).id))!);
        expect(readdirSync(copyDir).filter((f) => f.startsWith('RENAME-LOG.csv.written-')).map((f) => readFileSync(join(copyDir, f), 'utf8'))).toEqual([w2]);
        // …and the file itself is never unlinked: a handle still open on it keeps writing into a kept copy.
        expect(hidden(k2.root, '.RENAME-LOG.csv.superseded-').map((f) => readFileSync(k2.at(f), 'utf8'))).toEqual([w2]);
      }

      // --- AUTOMATIC recovery meets another writer: refused, theirs kept, `rollback` still offered -
      {
        const k = box();
        const theirLog = 'old_path,new_path,when\nx,y,\n';
        const out = k.go(MOVE, {
          at: when(['link', B, () => writeFileSync(k.at(B), 'a new file at the destination')], ['capture', 'RENAME-LOG.csv', replaceWith(k.at('RENAME-LOG.csv'), theirLog), 2]),
        });
        await expect(out).rejects.toThrow(/appeared while this ran.*could not be put back automatically \(RENAME-LOG.csv changed while this ran/s);
        expect([readFileSync(k.at(B), 'utf8'), readFileSync(k.at('RENAME-LOG.csv'), 'utf8'), existsSync(k.at(A)), k.j().status]).toEqual(['a new file at the destination', theirLog, true, 'prepared']);
      }

      // --- MEDIA, both directions ------------------------------------------
      {
        // Forward: the source changed after the preview — nothing moves.
        const k = box();
        await expect(k.go(MOVE, { at: when(['link', B, () => writeFileSync(k.at(A), Buffer.alloc(500, 7))]) })).rejects.toThrow(/does not hold the bytes this change recorded.*nothing was moved.*put back/s);
        expect([sha(readFileSync(k.at(A))), existsSync(k.at(B)), k.j().status]).toEqual([sha(Buffer.alloc(500, 7)), false, 'rolled-back']);
        // Rollback: a new file at the ORIGINAL name — both kept; the renamed bytes changed — nothing moves.
        const r = box();
        const bytes = readFileSync(r.at(A));
        expect(await r.go(MOVE)).toMatchObject({ ok: true });
        await expect(r.back({ at: when(['link', A, () => writeFileSync(r.at(A), 'new at the old name')]) })).rejects.toThrow(/appeared while this ran; nothing is ever overwritten/);
        expect([readFileSync(r.at(A), 'utf8'), sha(readFileSync(r.at(B)))]).toEqual(['new at the old name', sha(bytes)]);
        rmSync(r.at(A));
        await expect(r.back({ at: when(['link', A, () => writeFileSync(r.at(B), 'changed after the check')]) })).rejects.toThrow(/does not hold the bytes this change recorded/);
        expect([existsSync(r.at(A)), readFileSync(r.at(B), 'utf8')]).toEqual([false, 'changed after the check']);
        // A run stopped BETWEEN a move's two names: the next rollback drops the new name, bytes kept.
        const s = box();
        const sBytes = sha(readFileSync(s.at(A)));
        const stop = when(['unlink', A, () => {
          throw new Interrupted('power cut between the names');
        }]);
        await expect(s.go(MOVE, { at: stop })).rejects.toThrow(/power cut/);
        expect([existsSync(s.at(A)), existsSync(s.at(B)), s.j().status]).toEqual([true, true, 'prepared']);
        expect(await s.back()).toMatchObject({ ok: true });
        expect([sha(readFileSync(s.at(A))), existsSync(s.at(B))]).toEqual([sBytes, false]);
        // A name is dropped only while it still names the moved file, judged on a private name it was
        // first moved to: a file renamed onto that name in the instant before the drop keeps its name —
        // the final unlink of a move, its judged-failure undo, and a stopped move's recovery alike.
        const swapIn = (path: string, text: string) => () => {
          writeFileSync(`${path}.saved`, text);
          renameSync(`${path}.saved`, path);
        };
        const f = box();
        const fBytes = sha(readFileSync(f.at(A)));
        await expect(f.go(MOVE, { at: when(['judge-drop', f.at(A), swapIn(f.at(A), 'swapped in at the old name')]) })).resolves.toMatchObject({ ok: true });
        expect([readFileSync(f.at(A), 'utf8'), sha(readFileSync(f.at(B)))]).toEqual(['swapped in at the old name', fBytes]);
        const u = box();
        const undo = when(['link', B, () => writeFileSync(u.at(A), Buffer.alloc(500, 7))], ['judge-drop', u.at(B), swapIn(u.at(B), 'swapped in at the new name')]);
        await expect(u.go(MOVE, { at: undo })).rejects.toThrow(/does not hold the bytes this change recorded/);
        expect([sha(readFileSync(u.at(A))), readFileSync(u.at(B), 'utf8')]).toEqual([sha(Buffer.alloc(500, 7)), 'swapped in at the new name']);
        const v = box();
        const vBytes = sha(readFileSync(v.at(A)));
        await expect(v.go(MOVE, { at: when(['unlink', A, () => {
          throw new Interrupted('power cut between the names');
        }]) })).rejects.toThrow(/power cut/);
        expect(await v.back({ at: when(['judge-drop', v.at(B), swapIn(v.at(B), 'swapped in at the new name')]) })).toMatchObject({ ok: true });
        expect([sha(readFileSync(v.at(A))), readFileSync(v.at(B), 'utf8')]).toEqual([vBytes, 'swapped in at the new name']);
        // A run STOPPED at that judgement leaves a name on its private aside. Nothing recovers it
        // automatically (a name proves nothing about whose file it is): every entry point refuses,
        // naming it, and the operator renames it back — never over anything; then `rollback` judges.
        const cut = () => {
          throw new Interrupted('power cut at the drop');
        };
        const leftovers = (x: { root: string }) => [
          ...hidden(x.root, '.PIECES.csv.captured-'),
          ...hidden(x.root, '.RENAME-LOG.csv.captured-'),
          ...readdirSync(join(x.root, S39)).filter((n) => n.includes('.dropping-')).map((n) => `${S39}/${n}`),
        ];
        /** Every entry point refuses while a private name is left, changing nothing; then the operator renames each back. */
        const handBack = async (x: ReturnType<typeof box>) => {
          const left = leftovers(x);
          expect(left.length).toBeGreaterThan(0);
          const now = [declarations(x.root), media(x.root), readFileSync(join(x.state, 'journal.json'), 'utf8')];
          for (const entry of [() => x.back(), () => x.again(), () => x.go({ kind: 'register', piece: 'یکی-دیگر' })]) {
            await expect(entry()).rejects.toThrow(/stopped in the middle of a write and left a file under a private name; nothing was changed/);
          }
          await expect(x.back()).rejects.toThrow(new RegExp(left.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')));
          expect([declarations(x.root), media(x.root), readFileSync(join(x.state, 'journal.json'), 'utf8'), existsSync(x.lock)]).toEqual([...now, false]);
          for (const f of left) {
            const name = f.replace(/^(.*\/)?\.(.+)\.(captured|dropping)-.*$/, '$1$2');
            if (existsSync(x.at(name))) renameSync(x.at(f), x.at(f.replace('.captured-', '.superseded-')));
            else renameSync(x.at(f), x.at(name));
          }
          expect(leftovers(x)).toEqual([]);
        };
        // Someone else's file renamed onto the old name in that instant — and it has ANOTHER hard
        // link elsewhere: it is never deleted for being "a second name"; it keeps its public name.
        const g = box();
        const gBytes = sha(readFileSync(g.at(A)));
        const alias = join(g.base, 'their-alias.mp4');
        writeFileSync(alias, 'theirs at the old name');
        await expect(g.go(MOVE, { at: when(['unlink', A, () => {
          linkSync(alias, `${g.at(A)}.saved`);
          renameSync(`${g.at(A)}.saved`, g.at(A));
        }], ['judge-drop', g.at(A), cut]) })).rejects.toThrow(/power cut/);
        const theirAside = leftovers(g)[0]!;
        expect([readFileSync(g.at(theirAside), 'utf8'), lstatSync(g.at(theirAside)).nlink]).toEqual(['theirs at the old name', 2]);
        await handBack(g);
        await expect(g.back()).rejects.toThrow(/neither as this change left them nor as they were/);
        expect([readFileSync(g.at(A), 'utf8'), lstatSync(g.at(A)).ino, sha(readFileSync(g.at(B)))]).toEqual(['theirs at the old name', lstatSync(alias).ino, gBytes]);
        const h = box();
        const hBytes = sha(readFileSync(h.at(A)));
        await expect(h.go(MOVE, { at: when(['judge-drop', h.at(A), cut]) })).rejects.toThrow(/power cut/);
        await handBack(h);
        expect(await h.back()).toMatchObject({ ok: true });
        expect([sha(readFileSync(h.at(A))), existsSync(h.at(B))]).toEqual([hBytes, false]);
        const w = box();
        await expect(w.go(MOVE, { at: when(['link', B, () => writeFileSync(w.at(A), Buffer.alloc(500, 7))], ['judge-drop', w.at(B), cut]) })).rejects.toThrow(/power cut/);
        await handBack(w);
        expect(await w.back()).toMatchObject({ ok: true });
        expect([sha(readFileSync(w.at(A))), existsSync(w.at(B))]).toEqual([sha(Buffer.alloc(500, 7)), false]);
        const y = box();
        const yBytes = sha(readFileSync(y.at(A)));
        await expect(y.go(MOVE, { at: when(['unlink', A, cut]) })).rejects.toThrow(/power cut/);
        await expect(y.back({ at: when(['judge-drop', y.at(B), cut]) })).rejects.toThrow(/power cut/);
        await handBack(y);
        expect(await y.back()).toMatchObject({ ok: true });
        expect([sha(readFileSync(y.at(A))), existsSync(y.at(B))]).toEqual([yBytes, false]);
        for (const x of [f, u, v, g, h, w, y]) expect(leftovers(x)).toEqual([]);
        // A run stopped with a declaration SET ASIDE: refused, named, put back by hand, then rolled back exactly.
        const t = box();
        const tDecl = declarations(t.root);
        await expect(t.go(REG, { at: when(['install', 'PIECES.csv', () => {
          throw new Interrupted('power cut with the registry set aside');
        }]) })).rejects.toThrow(/power cut/);
        expect([existsSync(t.at('PIECES.csv')), hidden(t.root, '.PIECES.csv.captured-').length]).toEqual([false, 1]);
        const tSet = hidden(t.root, '.PIECES.csv.captured-')[0]!;
        await expect(t.back()).rejects.toThrow(/stopped in the middle of a write/);
        renameSync(t.at(tSet), t.at('PIECES.csv'));
        expect(await t.back()).toMatchObject({ ok: true });
        expect([declarations(t.root), leftovers(t)]).toEqual([tDecl, []]);
        // A file under a private name that THIS tool never wrote is never taken for the
        // declaration — not even with the declaration missing: refused, kept, nothing installed.
        for (const missing of [true, false]) {
          const n = box();
          const nDecl = declarations(n.root);
          if (missing) renameSync(n.at('PIECES.csv'), join(n.base, 'PIECES.csv.away'));
          writeFileSync(n.at('.PIECES.csv.captured-unrelated'), 'not this tool’s\n');
          await expect(n.again()).rejects.toThrow(/\.PIECES\.csv\.captured-unrelated/);
          await expect(n.back()).rejects.toThrow(/\.PIECES\.csv\.captured-unrelated/);
          expect([existsSync(n.at('PIECES.csv')), readFileSync(n.at('.PIECES.csv.captured-unrelated'), 'utf8')]).toEqual([!missing, 'not this tool’s\n']);
          if (!missing) expect(declarations(n.root)).toEqual(nDecl);
        }
      }

      // --- FAILURES AFTER A WRITE: put back exactly, said only when true, nothing kept is ever lost -
      {
        // An I/O error AFTER the new registry is in place (keeping the replaced one fails): the
        // write is already recorded, so the automatic put-back judges it — never "nothing needed".
        const k = box();
        const decl = declarations(k.root);
        const eio = Object.assign(new Error('EIO: i/o error (injected)'), { code: 'EIO' });
        await expect(k.go(REG, { at: when(['keep', 'PIECES.csv', () => {
          throw eio;
        }]) })).rejects.toThrow(/did not validate \(EIO.*everything it changed was put back from the private copy/s);
        expect([declarations(k.root), k.j().status, k.g.calls]).toEqual([decl, 'rolled-back', []]);
        // The registry that write replaced is still under its private name: the next run names it.
        await expect(k.go(REG)).rejects.toThrow(/\.PIECES\.csv\.captured-/);
        renameSync(k.at(hidden(k.root, '.PIECES.csv.captured-')[0]!), k.at(hidden(k.root, '.PIECES.csv.captured-')[0]!.replace('.captured-', '.superseded-')));
        expect(await k.go(REG)).toMatchObject({ ok: true, status: 'published' });
        // A program holding the ORIGINAL registry open while apply writes AND its automatic
        // put-back writes again (a scan failure): each replaced file keeps its own name, so the
        // program's later save is kept — never displaced by the put-back's own kept copy.
        const o = box();
        const before = readFileSync(o.at('PIECES.csv'), 'utf8');
        const fd = openSync(o.at('PIECES.csv'), 'r+');
        try {
          await expect(o.go(REG, { at: when(['scan', 'archive', () => {
            throw new Error('the scan failed (injected)');
          }]) })).rejects.toThrow(/did not validate \(the scan failed.*everything it changed was put back/s);
          writeSync(fd, 'saved through the open file\n', Buffer.byteLength(before));
        } finally {
          closeSync(fd);
        }
        expect([readFileSync(o.at('PIECES.csv'), 'utf8'), o.j().status]).toEqual([before, 'rolled-back']);
        expect(hidden(o.root, '.PIECES.csv.superseded-').map((f) => readFileSync(o.at(f), 'utf8')).sort()).toEqual(
          [`${before}saved through the open file\n`, `${before}${NEW_PIECE},,,,,,,41,,\n`].sort(),
        );
      }

      // --- A SESSION FOLDER SWAPPED FOR A LINK mid-move: nothing is written outside the archive -
      {
        const k = box();
        const moved = join(k.base, 'moved-39');
        const decoy = join(k.base, 'decoy');
        mkdirSync(decoy);
        writeFileSync(join(decoy, A.split('/')[1]!), 'an unrelated folder');
        await expect(k.go(MOVE, { at: when(['link', B, () => {
          renameSync(k.at(S39), moved);
          symlinkSync(decoy, k.at(S39));
        }]) })).rejects.toThrow(/moved or replaced while this ran/);
        // The unrelated folder is exactly as it was; the real folder, wherever it went, holds only what it held.
        expect(readdirSync(decoy)).toEqual([A.split('/')[1]]);
        expect(readdirSync(moved).filter((n) => n === B.split('/')[1] || n.includes('.dropping-'))).toEqual([]);
        expect(existsSync(join(moved, A.split('/')[1]!))).toBe(true);
        expect(k.j().status).toBe('prepared'); // its put-back refused the link too: `rollback` once the folder is back
        rmSync(k.at(S39));
        renameSync(moved, k.at(S39));
        expect(await k.back()).toMatchObject({ ok: true });
      }

      // --- RELEASES never take a NEWER run's lock --------------------------
      {
        // Two operators release the same dead record; between the first's release and the
        // second's removal, run C takes the archive (and D tries): C's lock is never moved.
        const k = box();
        const dead = ['2f2f2f2f', '0000', '4000', '8000', '000000000000'].join('-');
        mkdirSync(k.lock);
        writeFileSync(join(k.lock, `${dead}.json`), JSON.stringify({ token: dead, pid: 1, host: 'h', since: 's' }));
        const id = readArchiveLock(k.root).digest.slice(0, 16);
        let resume!: () => void;
        const gate = new Promise<void>((r) => (resume = r));
        let c: Promise<unknown> | undefined;
        let d: Promise<unknown> | undefined;
        let cHolder = '';
        const cPublish = async (text: string, hash: string, h: string) => {
          cHolder = h;
          await gate;
          return k.g.publish(text, hash, h);
        };
        expect(() =>
          releaseLock({
            root: k.root,
            record: id,
            at: when(['release', ARCHIVE_LOCK, () => {
              expect(releaseLock({ root: k.root, record: id })).toMatchObject({ released: true });
              c = k.go(REG, { publish: cPublish });
              d = k.go({ kind: 'register', piece: 'یکی-دیگر' });
            }]),
          }),
        ).toThrow(/not the record you saw/);
        await expect(d).rejects.toThrow(/maintenance lock is held by run/);
        expect(readArchiveLock(k.root).token).toBe(cHolder);
        resume();
        expect(await c).toMatchObject({ ok: true, status: 'published' });
        expect(existsSync(k.lock)).toBe(false);
        // A run whose lock was released by hand, while ANOTHER run now holds the archive: its own
        // release at the end removes only its own record — the newer run's lock stands.
        const k2 = box();
        const otherState = join(k2.base, 'other-state');
        mkdirSync(otherState);
        let resumeC!: () => void;
        const gateC = new Promise<void>((r) => (resumeC = r));
        let resumeD!: () => void;
        const gateD = new Promise<void>((r) => (resumeD = r));
        let dHolder = '';
        const c2 = k2.go(REG, { publish: async (text: string, hash: string, h: string) => (await gateC, k2.g.publish(text, hash, h)) });
        const shown = /--record ([0-9a-f]{16})/.exec(releaseLock({ root: k2.root }).lines.join('\n'))![1];
        expect(releaseLock({ root: k2.root, record: shown })).toMatchObject({ released: true });
        const later = { kind: 'register', piece: 'ردیف-بعدی' };
        const d2 = applyMaintenance({ root: k2.root, state: otherState, action: later, previewId: planMaintenance(k2.root, later).id, publish: async (text: string, hash: string, h: string) => ((dHolder = h), await gateD, k2.g.publish(text, hash, h)) });
        resumeC();
        expect(await c2).toMatchObject({ ok: false, message: expect.stringMatching(/no longer holds the archive/) });
        expect(readArchiveLock(k2.root).token).toBe(dHolder);
        resumeD();
        expect(await d2).toMatchObject({ ok: true, status: 'published' });
        expect(existsSync(k2.lock)).toBe(false);
      }

      // --- PUBLISHERS answer to the archive's owner, the scheduled job included -
      {
        const k = box();
        let holder = '';
        const during = await k.go(REG, {
          publish: async (text: string, hash: string, h: string) => {
            holder = h;
            // The scheduled job, mid-maintenance: refused before it writes anything.
            await expect(publishIndex({ transport: k.g.transport, indexText: text, confirm: archiveConfirmation(k.root) })).rejects.toMatchObject({
              nothingPublished: true,
              message: expect.stringMatching(/A maintenance run holds the archive/),
            });
            expect(k.g.published()).toBeNull();
            return k.g.publish(text, hash, h);
          },
        });
        expect(during).toMatchObject({ ok: true, status: 'published' });
        // An orphaned publisher of that run, once its lock is gone (or another run's): refused.
        const later = `${JSON.stringify(scanToIndex(k.root), null, 2)} \n`;
        await expect(publishIndex({ transport: k.g.transport, indexText: later, confirm: archiveConfirmation(k.root, holder) })).rejects.toThrow(/no longer holds the archive/);
        const another = ['1f1f1f1f', '0000', '4000', '8000', '000000000000'].join('-');
        mkdirSync(k.lock);
        writeFileSync(join(k.lock, `${another}.json`), JSON.stringify({ token: another, pid: process.pid, host: 'h', since: 's' }));
        await expect(publishIndex({ transport: k.g.transport, indexText: later, confirm: archiveConfirmation(k.root, holder) })).rejects.toThrow(/no longer holds the archive/);
        rmSync(k.lock, { recursive: true });
      }
      // An OLDER validated index never lands over a newer one, wherever the old (scheduled) publisher
      // stalls — at its ref read, before its commit, or with its ref write already asked for (after
      // its last archive check) — and whatever the newer decision is: an apply that moves the ref, a
      // retry or a rollback that decides "unchanged" and moves none. The newer publisher waits for
      // the older one's seat, so it decides after that write is answered.
      const added = `${S39}/نمونه-ضربی-سه-گاه-لطفی-9.mp4`;
      for (const pauseAt of ['getRef', 'createCommit', 'lastCheck', 'updateRef'] as const) {
        for (const newer of ['apply', 'retry', 'rollback'] as const) {
          const cell = `${pauseAt} / ${newer}`;
          const k = box();
          expect(await k.go({ kind: 'roster', session: 40, pieces: ['ضربی-سه-گاه-لطفی'] })).toMatchObject({ ok: true }); // the branch holds X
          if (newer === 'rollback') {
            // An apply whose publication failed BEFORE its ref write: the archive is H1, the branch still X.
            const failing = async (text: string, hash: string, h: string) =>
              publishIndex({ transport: { ...k.g.transport, getRef: async () => Promise.reject(new Error('GitHub refused getRef (HTTP 500)')) }, indexText: text, expectedContentHash: hash, confirm: archiveConfirmation(k.root, h) });
            expect(await k.go(REG, { publish: failing }), cell).toMatchObject({ ok: false });
          } else {
            writeFileSync(k.at(added), 'a file added by hand'); // the archive moves to H1
          }
          const h1 = `${JSON.stringify(scanToIndex(k.root), null, 2)}\n`;
          let reached!: () => void;
          let resume!: () => void;
          const isPaused = new Promise<void>((r) => (reached = r));
          const gate = new Promise<void>((r) => (resume = r));
          let paused = false;
          const t = k.g.transport as Record<string, (...a: unknown[]) => Promise<unknown>>;
          const hold = async () => {
            if (!paused) {
              paused = true;
              reached();
              await gate;
            }
          };
          // 'lastCheck': stalled the instant AFTER its last archive check passed, before its ref write is recorded or asked for.
          let checks = 0;
          const check = archiveConfirmation(k.root);
          const confirm = async () => {
            const now = check();
            if (pauseAt === 'lastCheck' && (checks += 1) === 2) await hold();
            return now;
          };
          const slow = pauseAt === 'lastCheck' ? t : {
            ...t,
            [pauseAt]: async (...args: unknown[]) => {
              await hold();
              return t[pauseAt]!(...args);
            },
          };
          const old = publishIndex({ transport: slow, indexText: h1, confirm, ...k.g.shared }).then(
            (r) => r,
            (e) => e,
          );
          await isPaused;
          // The scheduled job meanwhile finds the seat taken: refused, nothing published.
          await expect(publishIndex({ transport: t, indexText: h1, confirm: archiveConfirmation(k.root), ...k.g.shared }), cell).rejects.toMatchObject({ nothingPublished: true, message: expect.stringMatching(/publisher seat/) });
          const waiting = new Promise<void>((r) => (k.g.shared.seat.onBusy = r));
          if (newer === 'retry') rmSync(k.at(added)); // the archive is X again
          const decided = newer === 'apply' ? k.go(REG) : newer === 'retry' ? k.again() : k.back();
          // Resumed once the newer publisher is waiting for the seat — or, if it never waits, once it has decided.
          await Promise.race([waiting, decided]);
          resume();
          expect(await decided, cell).toMatchObject({ ok: true });
          const was = await old;
          if (pauseAt === 'updateRef' || pauseAt === 'lastCheck') expect(was, cell).toMatchObject({ status: 'published' }); // answered before the newer decision
          else expect(was, cell).toMatchObject({ nothingPublished: true, message: expect.stringMatching(/maintenance run holds the archive/) });
          expect(JSON.parse(k.g.published()!).contentHash, cell).toBe(scanToIndex(k.root).contentHash);
          k.g.shared.seat.onBusy = undefined;
        }
      }
      // A ref write ASKED FOR and never answered (its publisher died, or lost the answer) may land
      // later: the next publisher moves the ref even for unchanged content, so it never can; a write
      // that did land is seen, and nothing more is committed. Then no further run commits anything.
      for (const lands of ['after', 'before'] as const) {
        const k = box();
        expect(await k.go({ kind: 'roster', session: 40, pieces: ['ضربی-سه-گاه-لطفی'] })).toMatchObject({ ok: true });
        const x = k.g.published();
        writeFileSync(k.at(added), 'a file added by hand');
        const h1 = `${JSON.stringify(scanToIndex(k.root), null, 2)}\n`;
        const t = k.g.transport;
        let late!: () => Promise<string>;
        const dying = { ...t, updateRef: async (b: string, s: string, e: string) => ((late = () => t.updateRef(b, s, e)), Promise.reject(new TypeError('fetch failed: the publisher died'))) };
        await expect(publishIndex({ transport: dying, indexText: h1, confirm: archiveConfirmation(k.root), ...k.g.shared }), lands).rejects.not.toHaveProperty('nothingPublished');
        expect(existsSync(k.g.shared.intent), lands).toBe(true);
        rmSync(k.at(added)); // the newer decision: the archive is X again, which the branch holds
        if (lands === 'before') expect(await late(), lands).toBe('ok');
        const commits = k.g.commits();
        expect(await k.again(), lands).toMatchObject({ ok: true, publication: { status: 'published' } });
        expect(k.g.commits(), lands).toBe(commits + 1);
        if (lands === 'after') expect(await late(), lands).toBe('HTTP 422');
        expect([k.g.published(), existsSync(k.g.shared.intent)], lands).toEqual([x, false]);
        expect(await k.again(), lands).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
        expect(await publishIndex({ transport: t, indexText: x!, confirm: archiveConfirmation(k.root), ...k.g.shared }), lands).toMatchObject({ status: 'unchanged' });
        expect(k.g.commits(), lands).toBe(commits + 1);
      }
      // GitHub REFUSES the protective write without the ref having moved (a 422 that is not a
      // conflict): the older unanswered write is still guarded — never "unchanged" while it can
      // land. Refused once, the next attempt moves the ref; refused every time, the outcome stays
      // unconfirmed, and once the old write lands the next run publishes over it.
      for (const refusals of [1, 4]) {
        const k = box();
        expect(await k.go({ kind: 'roster', session: 40, pieces: ['ضربی-سه-گاه-لطفی'] })).toMatchObject({ ok: true });
        const x = k.g.published();
        writeFileSync(k.at(added), 'a file added by hand');
        const h1 = `${JSON.stringify(scanToIndex(k.root), null, 2)}\n`;
        const t = k.g.transport;
        let late!: () => Promise<string>;
        const dying = { ...t, updateRef: async (b: string, s: string, e: string) => ((late = () => t.updateRef(b, s, e)), Promise.reject(new TypeError('fetch failed: the publisher died'))) };
        await expect(publishIndex({ transport: dying, indexText: h1, confirm: archiveConfirmation(k.root), ...k.g.shared })).rejects.not.toHaveProperty('nothingPublished');
        rmSync(k.at(added)); // the archive is X again, which the branch still holds
        k.g.refuse(refusals);
        const settledNow = await k.again();
        if (refusals === 1) {
          expect(settledNow, 'refused once').toMatchObject({ ok: true, publication: { status: 'published' } });
          expect([await late(), k.g.published(), existsSync(k.g.shared.intent)], 'refused once').toEqual(['HTTP 422', x, false]);
        } else {
          expect(settledNow, 'refused always').toMatchObject({ ok: false, message: expect.stringMatching(/could not be confirmed.*may already be published/s) });
          expect([existsSync(k.g.shared.intent), k.j().publication], 'refused always').toEqual([true, 'unknown']);
          expect(await late(), 'refused always').toBe('ok'); // the old write lands after all
          expect(JSON.parse(k.g.published()!).contentHash).toBe(JSON.parse(h1).contentHash);
          expect(await k.again(), 'refused always').toMatchObject({ ok: true, publication: { status: 'published' } });
          expect([k.g.published(), existsSync(k.g.shared.intent)], 'refused always').toEqual([x, false]);
        }
        expect(await k.again()).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
      }

      // --- PUBLICATION STATE: open until a positive observation; every attempt bound to its index -
      {
        const k = box();
        const t = k.g.transport as Record<string, (...a: unknown[]) => Promise<unknown>>;
        const via = (overrides: Record<string, (...a: unknown[]) => Promise<unknown>>) => async (text: string, hash: string, holder: string) =>
          publishIndex({ transport: { ...t, ...overrides }, indexText: text, expectedContentHash: hash, confirm: archiveConfirmation(k.root, holder) });
        const failing = (method: string) => via({ [method]: async () => Promise.reject(new Error(`GitHub refused ${method} (HTTP 500)`)) });
        const lossy = via({
          createRef: async (...a: unknown[]) => (await t.createRef!(...a), Promise.reject(new TypeError('fetch failed: the response was lost'))),
          updateRef: async (...a: unknown[]) => (await t.updateRef!(...a), Promise.reject(new TypeError('fetch failed: the response was lost'))),
        });
        /** The journal AT the publisher's call: it already names this attempt's index and says it is open. */
        const seen: object[] = [];
        const spy = (inner: (text: string, hash: string, holder: string) => Promise<unknown>) => async (text: string, hash: string, holder: string) => {
          const j = k.j();
          seen.push({ status: j.status, publication: j.publication, intended: j.contentHash === hash && j.unresolved.includes(hash), scanned: hash === scanToIndex(k.root).contentHash });
          return inner(text, hash, holder);
        };
        const hashNow = () => scanToIndex(k.root).contentHash as string;

        // A FIRST publication failing before its branch read: "as it was" — no promise that any index exists.
        const first = await k.go(REG, { publish: spy(failing('getRef')) });
        expect(first.message).toMatch(/This attempt published nothing, so the source-index branch is as it was/);
        expect(first.message).not.toMatch(/last good|previous|still the published/);
        expect([k.j().publication, k.j().unresolved, k.g.published()]).toEqual(['failed', [], null]);
        // Accepted, response lost: unknown, bound to H.
        const H = hashNow();
        expect(await k.again({ publish: spy(lossy) })).toMatchObject({ ok: false, message: expect.stringMatching(/may already be published/) });
        expect([k.j().publication, k.j().unresolved, JSON.parse(k.g.published()!).contentHash]).toEqual(['unknown', [H], H]);
        // The archive moves on, so every later stage is reachable; a failure at ANY of them proves only its own attempt.
        writeFileSync(k.at(`${S39}/نمونه-ضربی-سه-گاه-لطفی-9.mp4`), 'added by hand');
        const H2 = hashNow();
        for (const method of ['getRef', 'getFile', 'createBlob', 'getCommit', 'createTree', 'createCommit']) {
          const r = await k.again({ publish: spy(failing(method)) });
          expect(r.message, method).toMatch(/could not be confirmed .*this attempt published nothing, but an earlier attempt is still unconfirmed/s);
          expect([k.j().publication, k.j().contentHash, k.j().unresolved], method).toEqual(['unknown', H2, [H]]);
        }
        // Rollback from that unknown: its pre-read failure leaves the applied attempt open, and says so.
        rmSync(k.at(`${S39}/نمونه-ضربی-سه-گاه-لطفی-9.mp4`));
        const rolled = await k.back({ publish: spy(failing('getRef')) });
        expect(rolled.message).toMatch(/earlier attempt is still unconfirmed/);
        const H0 = hashNow();
        expect(H0).not.toBe(H);
        expect([k.j().status, k.j().publication, k.j().contentHash, k.j().unresolved]).toEqual(['rolled-back', 'unknown', H0, [H]]);
        await expect(k.go({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/Run `retry`/);
        // A lost response whose unknown-journal write then fails: still pending (open), Apply still refused.
        const blocked = k.again({
          publish: async (text: string, hash: string, h: string) => {
            try {
              return await lossy(text, hash, h);
            } finally {
              mkdirSync(join(k.state, 'journal.json.tmp'));
            }
          },
        });
        await expect(blocked).rejects.toThrow(/could not be confirmed .*could not record that.*still says pending/s);
        rmSync(join(k.state, 'journal.json.tmp'), { recursive: true });
        expect([k.j().publication, k.j().unresolved]).toEqual(['pending', [H, H0]]);
        await expect(k.go({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/Run `retry`/);
        // A journal that cannot even say "pending" stops before any remote work.
        mkdirSync(join(k.state, 'journal.json.tmp'));
        const calls = k.g.calls.length;
        await expect(k.again({ publish: spy(k.g.publish) })).rejects.toThrow();
        expect(k.g.calls.length).toBe(calls);
        rmSync(join(k.state, 'journal.json.tmp'), { recursive: true });
        // Only a POSITIVE observation closes every open attempt.
        expect(await k.again({ publish: spy(k.g.publish) })).toMatchObject({ ok: true });
        expect([k.j().publication, k.j().unresolved, JSON.parse(k.g.published()!).contentHash]).toEqual(['published', [], H0]);
        // Every call above saw its own index already written down as open, before any remote work.
        expect(seen.every((x) => (x as { intended: boolean; scanned: boolean; publication: string }).intended && (x as { scanned: boolean }).scanned && (x as { publication: string }).publication === 'pending')).toBe(true);
        expect(seen.map((x) => (x as { status: string }).status)).toEqual(['applied', 'applied', ...Array(6).fill('applied'), 'rolled-back', 'rolled-back']);
      }
    } finally {
      for (const b of boxes) rmSync(b, { recursive: true, force: true });
    }
  });
});

function S42() {
  return SOURCE.emptyFolders[0]!;
}
