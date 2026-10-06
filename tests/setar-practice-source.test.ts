import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import CORPUS from './fixtures/setar-practice-source-v1.json';
import EXPECT from './fixtures/setar-practice-source-expectations.json';
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as scannerModule from '../scripts/scan-setar-classes.mjs';

// ---------------------------------------------------------------------------
// ac-1 — the archive's ongoing intake, end to end on TEMPORARY corpora.
//
// The corpus (`setar-practice-source-v1.json`) and every expected outcome
// (`setar-practice-source-expectations.json`) are written by hand: nothing a
// scope, a draft or an owner edit is checked against comes from the scanner
// under test. Real media is never touched — each corpus lives under tmpdir(),
// and the only writes to it are the OWNER steps below, which edit PIECES.csv
// and RENAME-LOG.csv exactly as an owner would.
// ---------------------------------------------------------------------------

interface Index {
  contentHash: string;
  pieces: { key: string; sessions: number[]; studySource?: string }[];
  sessions: {
    n: number;
    roster: string[];
    rosterTrusted: boolean;
    resources: { path: string; pieces: string[]; group: string | null; part: number | null; role: string }[];
    members: { key: string; roles: string[] }[];
  }[];
  renames: { from: string; to: string }[];
  diagnostics: { path: string; reason: string }[];
}
interface Report {
  contentHash: string;
  newIdentities: { key: string; seen: { session: number; roles: string[] }[]; files: string[]; draft: string }[];
  rosterCandidates: { key: string; missing: number[]; draft: string }[];
  unattributedDemos: { session: number; path: string; why: 'empty' | 'inconsistent' }[];
  renameGaps: { folder: string; missing: { path: string; from: string[] }[]; unlogged: string[] }[];
  other: { path: string; reason: string }[];
}
interface Scanner {
  attentionReport(source: unknown): Report;
  readStableSource(root: string, reread?: (root: string) => unknown): unknown;
  readSource(root: string): unknown;
}
const scanner = scannerModule as Scanner;
const SCRIPT = join(process.cwd(), 'scripts', 'scan-setar-classes.mjs');

type Variant = keyof typeof EXPECT.variants;
const VARIANTS = Object.keys(EXPECT.variants) as Variant[];

function registryRows(variant: Variant): string[] {
  const v = EXPECT.variants[variant];
  return Array.isArray(v.rows) ? v.rows : CORPUS.registry.rows;
}

/** A file's bytes are its own path, so "unchanged media" is checked by content. */
const bytesOf = (path: string, edition = 0) => `media:${path}:${edition}`;

function writeCorpus(variant: Variant, extra: { folder: string; files: string[] }[] = []): string {
  const root = mkdtempSync(join(tmpdir(), 'setar-intake-'));
  const v = EXPECT.variants[variant];
  writeFileSync(join(root, 'PIECES.csv'), `${[v.header, ...registryRows(variant)].join('\n')}\n`);
  writeFileSync(join(root, 'RENAME-LOG.csv'), `${[CORPUS.renameLog.header, ...CORPUS.renameLog.rows].join('\n')}\n`);
  const sessions = [...Object.entries(CORPUS.sessions), ...extra.map((e) => [e.folder, e.files] as const)];
  for (const [folder, files] of sessions) {
    mkdirSync(join(root, folder), { recursive: true });
    for (const f of files) writeFileSync(join(root, folder, f), bytesOf(`${folder}/${f}`));
  }
  return root;
}

/** Every media byte, hashed: what "the scanner and the report changed nothing" means. */
function mediaDigest(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const folder of readdirSync(root).sort()) {
    if (!statSync(join(root, folder)).isDirectory()) continue;
    for (const f of readdirSync(join(root, folder)).sort()) {
      out[`${folder}/${f}`] = createHash('sha256').update(readFileSync(join(root, folder, f))).digest('hex');
    }
  }
  return out;
}

function cli(args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function scan(root: string): Index {
  const r = cli(['--root', root]);
  expect(r.status, r.stderr).toBe(0);
  return JSON.parse(r.stdout) as Index;
}

function report(root: string): { text: string; data: Report } {
  const r = cli(['--root', root, '--attention']);
  expect(r.status, r.stderr).toBe(0);
  return { text: r.stdout, data: scanner.attentionReport(scanner.readStableSource(root)) };
}

/** The OWNER's edit: insert or replace ONE whole row by its key, idempotently. */
function ownerSetRow(root: string, variant: Variant, key: string, row: string) {
  const file = join(root, 'PIECES.csv');
  const lines = readFileSync(file, 'utf8').replace(/\n$/, '').split('\n');
  const keyCol = EXPECT.variants[variant].header.split(',').indexOf('canonical_fa');
  // Rows here are single-line, so the key is found by its own column. The
  // owner's row text is used VERBATIM — never rebuilt from parsed cells.
  const at = lines.findIndex((l, i) => i > 0 && splitTop(l)[keyCol] === key);
  if (at >= 0) lines[at] = row;
  else lines.push(row);
  writeFileSync(file, `${lines.join('\n')}\n`);
}
function ownerAppendLog(root: string, rows: string[]) {
  const file = join(root, 'RENAME-LOG.csv');
  const have = readFileSync(file, 'utf8');
  const missing = rows.filter((r) => !have.split('\n').includes(r));
  if (missing.length) writeFileSync(file, `${have}${missing.join('\n')}\n`);
}
/** A top-level comma split that respects quotes — only to FIND a row's key. */
function splitTop(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (const c of line) {
    if (c === '"') q = !q;
    if (c === ',' && !q) {
      out.push(cur.replace(/^"|"$/g, ''));
      cur = '';
    } else cur += c;
  }
  out.push(cur.replace(/^"|"$/g, ''));
  return out;
}

/**
 * One CSV line into its cells (a quote groups, `""` is a quote) and back. Written
 * here on purpose: what the report PRINTS is judged by a reader and a writer that
 * are not the scanner's own.
 */
function cellsOf(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]!;
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}
const csvLine = (cells: string[]) => cells.map((c) => (/[",\r\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',');

const scopes = (index: Index) =>
  Object.fromEntries(index.sessions.flatMap((s) => s.resources.map((r) => [r.path, [...r.pieces].sort()])));
const trusted = (index: Index) => Object.fromEntries(index.sessions.map((s) => [String(s.n), s.rosterTrusted]));
const terminal = (index: Index, from: string) => {
  const m = new Map(index.renames.map((r) => [r.from, r.to]));
  let cur = from;
  while (m.has(cur)) cur = m.get(cur)!;
  return cur;
};
const sorted = (xs: string[]) => [...xs].sort();

describe('the Setar archive intake, on temporary corpora', () => {
  it('setar durable intake preserves registry authority and exact rename evidence without changing media', () => {
    const future = CORPUS.future.map((f) => ({ folder: f.folder, files: f.files }));
    const roots: string[] = [];
    try {
      for (const variant of VARIANTS) {
        const v = EXPECT.variants[variant];
        const root = writeCorpus(variant, future);
        roots.push(root);
        const media = mediaDigest(root);

        // --- AS DELIVERED: what the scan publishes ------------------------
        const before = scan(root);
        // studySource travels verbatim where the registry has the column, and
        // is ABSENT — not empty — where it does not.
        for (const p of before.pieces) {
          if (v.studySource === null) expect('studySource' in p, p.key).toBe(false);
          else expect(p.studySource, p.key).toBe((v.studySource as Record<string, string>)[p.key]);
        }
        const got = scopes(before);
        for (const [path, pieces] of Object.entries(EXPECT.before.scopes)) expect(got[path], path).toEqual(sorted(pieces));
        for (const path of EXPECT.before.notIndexed) expect(got[path], path).toBeUndefined();
        expect(trusted(before)).toEqual(EXPECT.before.rosterTrusted);
        // An unregistered score that was FILTERED OUT still blocks the
        // unnamed demonstration beside it (session 40: empty roster; session
        // 42: a new identity). Removing the disagreement check spreads them.
        expect(got['session-40-29-09-2026/نمونه.mp4']).toEqual([]);
        expect(got['session-42-13-10-2026/نمونه-1.mp4']).toEqual([]);

        // --- THE REPORT: stdout only, generic, unconfirmed ---------------
        const { text, data } = report(root);
        expect(text).toMatch(/READ-ONLY/);
        expect(text).toMatch(/UNCONFIRMED/);
        // The report names the index an ordinary scan publishes, so the owner
        // can tell a stale publication from a declaration problem.
        expect(text).toContain(before.contentHash.slice(0, 12));
        expect(data.contentHash).toBe(before.contentHash);
        expect(
          Object.fromEntries(data.newIdentities.map((n) => [n.key, n.seen])),
        ).toEqual(EXPECT.before.newIdentities);
        // Drafts are against the registry's ACTUAL header — the identity and
        // nothing else. A positional eight-column append fails every variant
        // but one.
        for (const [key, draft] of Object.entries(v.drafts)) {
          expect(data.newIdentities.find((n) => n.key === key)!.draft).toBe(draft);
          expect(text).toContain(draft);
        }
        // An existing row is amended in ONE cell; every other cell, its quoting
        // and its extra columns stay exactly as written.
        expect(data.rosterCandidates.find((c) => c.key === 'چهارپاره-مرادخانی')!.draft).toBe(v.rosterDraft);
        expect(Object.fromEntries(data.rosterCandidates.map((c) => [c.key, c.missing]))).toEqual(EXPECT.before.rosterCandidates);
        expect(Object.fromEntries(data.unattributedDemos.map((d) => [d.path, d.why]))).toEqual(EXPECT.before.unattributedDemos);
        // Rename evidence: the names the log ends at that are not on disk,
        // beside the files no row names — and NO pairing between them.
        const gaps = Object.fromEntries(
          data.renameGaps.map((g) => [g.folder, { missing: g.missing.map((m) => m.path), unlogged: sorted(g.unlogged) }]),
        );
        expect(Object.keys(gaps).sort()).toEqual(Object.keys(EXPECT.before.renameGaps).sort());
        for (const [folder, gap] of Object.entries(EXPECT.before.renameGaps)) {
          expect(gaps[folder]!.missing).toEqual(gap.missing);
          expect(gaps[folder]!.unlogged).toEqual(sorted(gap.unlogged));
        }
        expect(text).toMatch(/nothing here pairs them/);
        expect(text).not.toMatch(/ضبط-کلاس-1\.mp4,session-1-26-09-2023\/نمونه-1\.mp4/);
        // A loop and a fork are diagnosed, never walked; nothing is published for them.
        expect(data.other.some((d) => /loops through this path/.test(d.reason))).toBe(true);
        expect(data.other.some((d) => /more than one destination/.test(d.reason))).toBe(true);
        // No root, no absolute path: archive-relative only.
        expect(text).not.toContain(root);
        // The report and the scan wrote NOTHING, and a repeat is identical.
        expect(mediaDigest(root)).toEqual(media);
        expect(report(root).text).toBe(text);
        expect(scan(root).contentHash).toBe(before.contentHash);

        // --- THE OWNER confirms, edits the source, and rescans ----------
        for (const [key, row] of Object.entries(v.ownerRows)) ownerSetRow(root, variant, key, row);
        ownerAppendLog(root, EXPECT.ownerLogRows);
        const after = scan(root);
        const now = scopes(after);
        for (const [path, pieces] of Object.entries(EXPECT.after.scopes)) expect(now[path], path).toEqual(sorted(pieces));
        expect(trusted(after)).toEqual(EXPECT.after.rosterTrusted);
        for (const [from, to] of Object.entries(EXPECT.after.renameChains)) expect(terminal(after, from)).toBe(to);
        const s42 = after.sessions.find((s) => s.n === 42)!;
        for (const [key, roles] of Object.entries(EXPECT.after.personalMembers['42'])) {
          expect(sorted(s42.members.find((m) => m.key === key)!.roles)).toEqual(sorted(roles));
        }
        // The owner's own take is membership, never material.
        expect(now['session-42-13-10-2026/تمرین-من-ضربی-اصفهان-نوری.mp4']).toBeUndefined();
        const afterReport = report(root).data;
        expect(afterReport.newIdentities).toEqual([]);
        expect(afterReport.unattributedDemos).toEqual([]);
        expect(afterReport.renameGaps.map((g) => g.folder)).toEqual(['session-2-24-10-2023']);
        // Still only the owner's two files changed; the media is untouched.
        expect(mediaDigest(root)).toEqual(media);
        // Idempotent: the same owner edit again changes nothing at all.
        for (const [key, row] of Object.entries(v.ownerRows)) ownerSetRow(root, variant, key, row);
        ownerAppendLog(root, EXPECT.ownerLogRows);
        expect(scan(root).contentHash).toBe(after.contentHash);
      }

      // --- FUTURE CLASSES, parameterised: any number, any new piece ----------
      // No session ceiling, no key in code, no worksheet: the same three steps
      // for each. A named score needs nothing; an unnamed demonstration needs a
      // confirmed roster, and only that.
      for (const { n, date, key } of [
        { n: 43, date: '20-10-2026', key: 'درآمد-نوا-آزمون' },
        { n: 58, date: '02-02-2027', key: 'رنگ-شور-تازه' },
        { n: 103, date: '15-03-2029', key: 'چهارمضراب-سه‌گاه-نو' },
      ]) {
        const folder = `session-${n}-${date}`;
        const root = writeCorpus('real', [{ folder, files: [`نت-${key}.pdf`, 'نمونه-1.mp4', 'نمونه-2.mp4', 'ضبط-کلاس.mp4'] }]);
        roots.push(root);
        const media = mediaDigest(root);
        const first = scan(root);
        expect(scopes(first)[`${folder}/نمونه-1.mp4`]).toEqual([]);
        expect(scopes(first)[`${folder}/نت-${key}.pdf`]).toBeUndefined();
        const r = report(root).data;
        const found = r.newIdentities.find((x) => x.key === key)!;
        expect(found.seen).toEqual([{ session: n, roles: ['نت'] }]);
        expect(found.draft).toBe(`${key},,,,,,,,,`);
        expect(r.unattributedDemos.find((d) => d.session === n)!.why).toBe('inconsistent');
        // The owner declares a roster for this class on an EXISTING piece only.
        // The unregistered score is still named in the folder, so the roster
        // and the filenames disagree and the demonstration must NOT spread
        // over the one piece the registry lists — even though that score was
        // dropped before attribution ran.
        const karashmeh = CORPUS.registry.rows[3]!.replace(',2,نت,', `,"2,${n}",نت,`);
        ownerSetRow(root, 'real', 'کرشمه-شور-ردیف-میرزاعبدالله', karashmeh);
        const partial = scan(root);
        expect(partial.sessions.find((s) => s.n === n)!.rosterTrusted).toBe(false);
        expect(scopes(partial)[`${folder}/نمونه-1.mp4`]).toEqual([]);
        ownerSetRow(root, 'real', key, EXPECT.variants.real.newKeyRow.replace('{key}', key).replace('{n}', String(n)));
        const done = scopes(scan(root));
        const both = sorted([key, 'کرشمه-شور-ردیف-میرزاعبدالله']);
        expect(done[`${folder}/نت-${key}.pdf`]).toEqual([key]);
        expect(done[`${folder}/نمونه-1.mp4`]).toEqual(both);
        expect(done[`${folder}/نمونه-2.mp4`]).toEqual(both);
        expect(done[`${folder}/ضبط-کلاس.mp4`]).toEqual([]);
        expect(mediaDigest(root)).toEqual(media);
      }

      // --- SAME PATH, NEW BYTES; ADDED AND OMITTED FILES ---------------------
      const root = writeCorpus('real');
      roots.push(root);
      const base = scan(root);
      const pdf = 'session-1-26-09-2023/نت-رنگ-ماهور-درویش-خان.pdf';
      // Same length, different bytes: the reference still names the file the
      // NAS now holds, and the index (paths, roles, scopes, sizes) is unchanged
      // — deliberately, with no fingerprint invented.
      writeFileSync(join(root, pdf), bytesOf(pdf, 1));
      expect(scan(root).contentHash).toBe(base.contentHash);
      // A replacement of a different size is the same resource with a new size.
      writeFileSync(join(root, pdf), `${bytesOf(pdf, 1)} and more`);
      const resized = scan(root);
      expect(scopes(resized)[pdf]).toEqual(['رنگ-ماهور-درویش-خان']);
      expect(resized.contentHash).not.toBe(base.contentHash);
      // An added file appears; an omitted one is simply no longer described.
      writeFileSync(join(root, 'session-2-24-10-2023', 'نت-درآمد-شور-ردیف-میرزاعبدالله-2.pdf'), 'x');
      rmSync(join(root, 'session-2-24-10-2023', 'نت-کرشمه-شور-ردیف-میرزاعبدالله.pdf'));
      const moved = scopes(scan(root));
      expect(moved['session-2-24-10-2023/نت-درآمد-شور-ردیف-میرزاعبدالله-2.pdf']).toEqual(['درآمد-شور-ردیف-میرزاعبدالله']);
      expect(moved['session-2-24-10-2023/نت-کرشمه-شور-ردیف-میرزاعبدالله.pdf']).toBeUndefined();

      // --- A REORDERED, EXTENDED RENAME LOG: the template follows the header ---
      // `new_path,timestamp,old_path` is a valid log. The same pairs mean the
      // same thing, and the printed row puts each path in ITS OWN column — the
      // old path in old_path, the current path in new_path, timestamp empty.
      const reordered = writeCorpus('real');
      roots.push(reordered);
      const inOrder = scan(reordered);
      writeFileSync(
        join(reordered, 'RENAME-LOG.csv'),
        `${['new_path,timestamp,old_path', ...CORPUS.renameLog.rows.map((r) => {
          const [oldPath, newPath, at] = r.split(',');
          return `${newPath},${at},${oldPath}`;
        })].join('\n')}\n`,
      );
      expect(scan(reordered).contentHash).toBe(inOrder.contentHash);
      const odd = report(reordered);
      expect(odd.text).toContain('new_path,timestamp,old_path');
      expect(odd.text).toContain('       <its current path>,,<the missing path>');
      expect(odd.text).not.toContain('<the missing path>,<its current path>');

      // --- A QUOTED EXTENSION HEADER: the report prints it as the file writes it ---
      // A header cell holding a comma or a quote, printed bare, splits into two
      // columns and shifts every cell after it — the printed header would no
      // longer describe the printed draft. The scanner never notices (it reads
      // the file's own header), so the PRINTED text is what is judged here.
      const registryHeader = 'canonical_fa,form,piece,dastgah,composer,source,aliases_seen,sessions,roles_present,notes,"teacher, ""comment"""';
      const registryCells = [...EXPECT.variants.real.header.split(','), 'teacher, "comment"'];
      const extension = 'handed out, then "corrected"';
      const plain = writeCorpus('real', future);
      const quotedRegistry = writeCorpus('real', future);
      roots.push(plain, quotedRegistry);
      writeFileSync(
        join(quotedRegistry, 'PIECES.csv'),
        `${[registryHeader, ...CORPUS.registry.rows.map((r) => `${r},${csvLine([extension])}`)].join('\n')}\n`,
      );
      // The extra column changes no source meaning.
      expect(scan(quotedRegistry).contentHash).toBe(scan(plain).contentHash);
      const qr = report(quotedRegistry);
      expect(qr.text).toContain(`UNCONFIRMED draft row for the header ${registryHeader}:`);
      const printedDrafts = [...qr.text.matchAll(/UNCONFIRMED draft row for the header (.+):\n {7}(.+)\n/g)];
      expect(printedDrafts.map((m) => cellsOf(m[2]!)[0]).sort()).toEqual(Object.keys(EXPECT.before.newIdentities).sort());
      for (const m of printedDrafts) {
        // Read by the PRINTED header: the same cells as the file's, and the
        // draft has one cell for each — the key in canonical_fa, nothing else.
        const header = cellsOf(m[1]!);
        const draft = cellsOf(m[2]!);
        expect(header).toEqual(registryCells);
        expect(draft).toHaveLength(registryCells.length);
        const byName = Object.fromEntries(header.map((h, i) => [h, draft[i]]));
        expect(byName.canonical_fa).toBe(draft[0]);
        expect(draft.slice(1).every((c) => c === '')).toBe(true);
      }
      // An amended row keeps its extension cell exactly as the owner wrote it.
      expect(qr.data.rosterCandidates.find((c) => c.key === 'چهارپاره-مرادخانی')!.draft).toBe(`${EXPECT.variants.real.rosterDraft},${csvLine([extension])}`);

      // The same for a rename log whose extension column holds a comma: the
      // printed header and the template beneath it are one row's worth of columns.
      const logHeader = 'new_path,"audit,note",old_path';
      const logCells = ['new_path', 'audit,note', 'old_path'];
      const quotedLog = writeCorpus('real');
      roots.push(quotedLog);
      writeFileSync(
        join(quotedLog, 'RENAME-LOG.csv'),
        `${[logHeader, ...CORPUS.renameLog.rows.map((r) => {
          const [oldPath, newPath] = cellsOf(r);
          return csvLine([newPath!, 'moved, by hand', oldPath!]);
        })].join('\n')}\n`,
      );
      expect(scan(quotedLog).contentHash).toBe(inOrder.contentHash);
      const ql = report(quotedLog).text.split('\n');
      const heads = ql.flatMap((l, i) => (l === `       ${logHeader}` ? [i] : []));
      // One printed header and template for each folder with a gap (sessions 1 and 2).
      expect(heads).toHaveLength(2);
      const MISSING = 'session-1-26-09-2023/ضبط-کلاس-1.mp4';
      const CURRENT = 'session-1-26-09-2023/نمونه-1.mp4';
      for (const i of heads) {
        const header = cellsOf(ql[i]!.trim());
        expect(header).toEqual(logCells);
        const filled = cellsOf(ql[i + 1]!.trim().replace('<the missing path>', MISSING).replace('<its current path>', CURRENT));
        expect(filled).toHaveLength(logCells.length);
        expect(Object.fromEntries(header.map((h, k) => [h, filled[k]]))).toEqual({ old_path: MISSING, new_path: CURRENT, 'audit,note': '' });
      }
      // The owner pastes that filled row; the exact chain now ends at the current name.
      ownerAppendLog(quotedLog, [ql[heads[0]! + 1]!.trim().replace('<the missing path>', MISSING).replace('<its current path>', CURRENT)]);
      expect(terminal(scan(quotedLog), 'session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4')).toBe(CURRENT);

      // --- INVALID INPUT EXPLAINS, AND NO DRAFT IS PRINTED AS CONFIRMED -------
      const bad = writeCorpus('real');
      roots.push(bad);
      writeFileSync(join(bad, 'PIECES.csv'), `${readFileSync(join(bad, 'PIECES.csv'), 'utf8')}${CORPUS.registry.rows[0]}\n`);
      const dup = cli(['--root', bad, '--attention']);
      expect(dup.status).toBe(1);
      expect(dup.stdout).toBe('');
      expect(dup.stderr).toMatch(/two rows for the canonical piece/);
      writeFileSync(join(bad, 'PIECES.csv'), `${EXPECT.variants.real.header}\n"never closed,\n`);
      const broken = cli(['--root', bad, '--attention']);
      expect(broken.status).toBe(1);
      expect(broken.stdout).toBe('');
      // --out is refused BEFORE anything is read, and nothing is written.
      const out = join(mkdtempSync(join(tmpdir(), 'setar-out-')), 'index.json');
      const refused = cli(['--root', root, '--attention', '--out', out]);
      expect(refused.status).toBe(2);
      expect(refused.stdout).toBe('');
      expect(() => statSync(out)).toThrow();
      // An archive that changes between the two readings yields no report.
      expect(() =>
        scanner.readStableSource(root, (r: string) => {
          const s = scanner.readSource(r) as { inventory: unknown[] };
          return { ...s, inventory: s.inventory.slice(1) };
        }),
      ).toThrow(/changed during the scan/);
    } finally {
      for (const r of roots) rmSync(r, { recursive: true, force: true });
    }
  });
});
