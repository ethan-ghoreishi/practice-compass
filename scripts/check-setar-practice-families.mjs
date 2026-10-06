#!/usr/bin/env node
// ---------------------------------------------------------------------------
// The ONE reproducible route for the Setar practice reliability family proof.
//
//   node scripts/check-setar-practice-families.mjs              # every family, both engines
//   node scripts/check-setar-practice-families.mjs --unit       # the Node families only
//   node scripts/check-setar-practice-families.mjs --list       # the manifest, as JSON; runs nothing
//   node scripts/check-setar-practice-families.mjs --mutations  # each targeted mutation must FAIL its check
//
// It uses nothing but the repository's own Vitest — the browser families drive
// the same Playwright harness every other journey uses (tests/practiceBrowser.ts:
// a missing browser FAILS, every page error is kept, each server has a private
// Vite cache). It:
//
//  1. checks that every acceptance title names EXACTLY ONE `it()` in the repo,
//     in the file the contract names;
//  2. runs the family files with a JSON report;
//  3. prints each acceptance check with the one test that proves it, and fails
//     unless every one of them ran and passed.
//
// With --mutations it applies each mutation below to a COPY-RESTORED source
// file, runs only the named test that must catch it, and fails unless that
// test fails — then restores the file byte for byte and checks it is unchanged.
// Fixtures, seeds and clocks are committed or fixed inside the tests, so a rerun
// proves the same thing. docs/setar-practice-reliability.md records the matrix.
// ---------------------------------------------------------------------------

import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** [acceptance id, exact test title, file that holds it]. */
export const ACCEPTANCE = [
  ['ac-1', 'setar durable intake preserves registry authority and exact rename evidence without changing media', 'tests/setar-practice-source.test.ts'],
  ['ac-2', 'setar study provenance survives compatible indexes and every saved data boundary', 'tests/setar-practice-inbound.browser.test.ts'],
  ['ac-3', 'setar recovery restores only the selected suppression through owner controls', 'tests/setar-practice.browser.test.ts'],
  ['ac-4', 'setar publish fetch and refresh carry source corrections to lessons and item material', 'tests/setar-practice.browser.test.ts'],
  ['ac-5', 'setar rename consumers preserve authored metadata and never infer missing provenance', 'src/domain/sourceReconcile.test.ts'],
  ['ac-6', 'setar association readers agree without copying source membership into owner history', 'tests/setar-practice-relations.test.ts'],
  ['ac-7', 'setar metadata refresh offers only new meaningful source proposals', 'src/domain/sourceReconcile.test.ts'],
  ['ac-8', 'setar metadata choices refuse every changed identity and premise before a write', 'src/store/archiveIndex.test.ts'],
  ['ac-9', 'setar setup proposals distinguish learning organisation and source evidence', 'src/domain/setarSetup.test.ts'],
  ['ac-10', 'setar setup commits selected rows atomically idempotently and without collateral changes', 'src/domain/setarSetup.test.ts'],
  ['ac-11', 'setar setup review is usable through controls and survives interruption', 'tests/setar-practice.browser.test.ts'],
  ['ac-12', 'musical term suggestions can be found and selected while typing in both engines', 'tests/musical-term-suggestions.browser.test.ts'],
  ['ac-13', 'portable term and recovery controls preserve direction focus and scroll ownership', 'tests/setar-practice.browser.test.ts'],
  ['ac-14', 'practice sound reuses one gesture primed context across all start and resume doors', 'tests/practice-cues.browser.test.ts'],
  ['ac-15', 'practice cues preserve wall clock boundaries and every recorded minute', 'tests/practice-cues.browser.test.ts'],
  ['ac-16', 'pathway removal and restoration visibly retain the existing owned item', 'tests/setar-practice.browser.test.ts'],
  ['ac-17', 'setar practice family proof rejects targeted partial fixes before review', 'tests/setar-practice-proof.test.ts'],
];

/** The companions each named acceptance leans on — never a replacement for it. */
export const COMPANIONS = [
  ['ac-2', 'study provenance decodes the same way at every reader', 'src/domain/io.test.ts'],
  ['ac-6', 'archive associations unlink and relink through every reader and survive a reload', 'tests/setar-practice.browser.test.ts'],
  ['ac-8', 'archive metadata controls send the typed premise and re-preview a stale choice', 'tests/setar-practice.browser.test.ts'],
  ['ac-13', 'term suggestion controls keep direction focus and scroll on new and edit forms', 'tests/musical-term-suggestions.browser.test.ts'],
  ['ac-14', 'practice sound keeps one context primed only by taps and never queues a cue', 'src/components/practiceCue.test.ts'],
  ['ac-15', 'a boundary claim is granted once and only for the still-running clock', 'src/components/practiceCue.test.ts'],
];

/**
 * Each targeted partial fix: a source file, an exact text to replace and its
 * replacement, and the ONE named test that must fail with it in place. The
 * `find` must occur exactly once — a mutation that no longer applies is itself
 * a failure, never a silent pass.
 */
export const MUTATIONS = [
  {
    name: 'scanner drops studySource',
    file: 'scripts/scan-setar-classes.mjs',
    find: "...(r.source !== undefined ? { studySource: r.source } : {}),",
    replace: '',
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'decoder drops studySource',
    file: 'src/domain/sourceArchive.ts',
    find: "...(typeof raw.studySource === 'string' ? { studySource: raw.studySource } : {}),",
    replace: '',
    test: 'study provenance decodes the same way at every reader',
  },
  {
    name: 'inbound drops studySource (validateDB rebuilds the graph without it)',
    file: 'src/domain/io.ts',
    find: '    archiveSources: migrated.archiveSources ?? [],',
    replace:
      '    archiveSources: (migrated.archiveSources ?? []).map((g) => ({ ...g, pieces: g.pieces.map((p) => { const { studySource: _s, ...rest } = p as typeof p & { studySource?: string }; void _s; return rest; }) })),',
    test: 'study provenance decodes the same way at every reader',
  },
  {
    name: 'adoption drops studySource (index -> graph)',
    file: 'src/domain/sourceReconcile.ts',
    find: '  if (!previous) return { pieces: index.pieces, sessions: index.sessions };',
    replace:
      '  if (!previous) return { pieces: index.pieces.map((p) => { const { studySource: _s, ...rest } = p; void _s; return rest; }), sessions: index.sessions };',
    test: 'study provenance decodes the same way at every reader',
  },
  {
    name: 'a fix hard-coded to Session 40\'s keys',
    file: 'scripts/scan-setar-classes.mjs',
    find: '    if (parsedName.piece) session.named.add(parsedName.piece);',
    replace: "    if (['پیش-درامد-چهارگاه-فروتن', 'چهارمضراب-چهارگاه-عبادی'].includes(parsedName.piece)) session.named.add(parsedName.piece);",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'an auto-confirmed draft (an unregistered named piece indexed)',
    file: 'scripts/scan-setar-classes.mjs',
    find: '    if (parsedName.piece && !byKey.has(parsedName.piece)) {\n      diag(',
    replace:
      "    if (parsedName.piece && !byKey.has(parsedName.piece)) {\n      const draft = { key: parsedName.piece, form: '', piece: parsedName.piece, dastgah: '', composer: '', aliases: [], sessions: [], notes: '' };\n      pieces.push(draft);\n      byKey.set(draft.key, draft);\n    }\n    if (false) {\n      diag(",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'roster disagreement counted only after filtering',
    file: 'scripts/scan-setar-classes.mjs',
    find: '    if (parsedName.piece) session.named.add(parsedName.piece);\n    if (!kind) {',
    replace: '    if (!kind) {',
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'draft row appended positionally (eight columns)',
    file: 'scripts/scan-setar-classes.mjs',
    find: "draft: header.map((h) => (h === 'canonical_fa' ? csvCell(key) : '')).join(','),",
    replace: "draft: [csvCell(key), '', '', '', '', '', '', ''].join(','),",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'roster amendment rebuilt from parsed cells (quoting lost)',
    file: 'scripts/scan-setar-classes.mjs',
    find: "rosterCandidates.push({ key, missing, files: o.files.filter((f) => missing.includes(parseSessionFolderName(f.split('/')[0]).n)).sort(cmp), draft: raws.join(',') });",
    replace: "rosterCandidates.push({ key, missing, files: [], draft: row.values.map((v, i) => (i === col('sessions') ? csvCell(`${current},${missing.join(',')}`) : v)).join(',') });",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'a hard-coded session ceiling',
    file: 'scripts/scan-setar-classes.mjs',
    find: "  const m = /^session-(\\d+)-(\\d{2})-(\\d{2})-(\\d{4})$/.exec(name);\n  if (!m) return null;",
    replace: "  const m = /^session-(\\d+)-(\\d{2})-(\\d{2})-(\\d{4})$/.exec(name);\n  if (!m || Number(m[1]) > 42) return null;",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'an inferred roster (demo spread over every named piece)',
    file: 'scripts/scan-setar-classes.mjs',
    find: '    const rosterTrusted = strays.length === 0;',
    replace: '    const rosterTrusted = true;',
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'an unlogged rename guessed by part number',
    file: 'src/domain/sourceReconcile.ts',
    find: '  const renames = new Map(index.renames.map((r) => [r.from, r.to]));',
    replace:
      "  const renames = new Map(index.renames.map((r) => [r.from, r.to]));\n  for (const s of index.sessions) for (const r of s.resources) { const m = /-(\\d+)\\.mp4$/.exec(r.path); if (m) renames.set(`${s.folder}/ضبط-کلاس-${m[1]}.mp4`, r.path); }",
    test: 'setar rename consumers preserve authored metadata and never infer missing provenance',
  },
  {
    name: 'restore widened to kind and target (sibling hides lifted)',
    file: 'src/store/useStore.ts',
    find: '(x) => x.kind === target.kind && x.ref === target.ref && x.itemId === target.itemId,',
    replace: '(x) => x.kind === target.kind && x.ref === target.ref,',
    test: 'setar recovery restores only the selected suppression through owner controls',
  },
  {
    name: 'a relation reader bypasses the selector (Connected to reads itemIds)',
    file: 'src/pages/ItemDetail.tsx',
    find: '  const lessons = associationsForItem(db, item.id).map((a) => a.lesson);',
    replace: '  const lessons = db.lessons.filter((l) => (l.itemIds ?? []).includes(item.id));',
    test: 'archive associations unlink and relink through every reader and survive a reload',
  },
  {
    name: 'a same-label premise accepted',
    file: 'src/domain/sourceReconcile.ts',
    find: '    sameTyped(d.from, s.current) &&\n    d.fromTermId === s.currentTermId &&',
    replace: '    (d.from === s.from || sameTyped(d.from, s.current)) &&',
    test: 'setar metadata choices refuse every changed identity and premise before a write',
  },
  {
    name: 'unchanged metadata re-offered every refresh',
    file: 'src/domain/sourceReconcile.ts',
    find: '          fresh: !sameMeaning(before, proposed, field, vocab),',
    replace: '          fresh: true,',
    test: 'setar metadata refresh offers only new meaningful source proposals',
  },
  {
    name: 'the selected-patch guard bypassed',
    file: 'src/domain/setarSetup.ts',
    find: "    if (!p || !same(p.before, sel.before) || !offered.some((a) => same(a, sel.after))) {",
    replace: '    if (!p) {',
    test: 'setar setup commits selected rows atomically idempotently and without collateral changes',
  },
  {
    name: 'an omitted gesture door (Resume does not ready the sound)',
    file: 'src/store/useStore.ts',
    find: '        primePracticeSound(); // Resume is a tap too — on the practice screen and on Close\n',
    replace: '',
    test: 'practice sound reuses one gesture primed context across all start and resume doors',
  },
  {
    name: 'a context created per boundary',
    file: 'src/components/practiceCue.ts',
    find: '  const c = context;\n  if (!c || c.state !== \'running\') return;\n  try {\n    const t0 = c.currentTime;',
    replace: '  const Ctx = audioCtor();\n  if (!Ctx) return;\n  const c = new Ctx();\n  try {\n    const t0 = c.currentTime;',
    test: 'practice sound reuses one gesture primed context across all start and resume doors',
  },
  {
    name: 'no resume or state gate in the prime',
    file: 'src/components/practiceCue.ts',
    find: "    if (context.state !== 'running') {\n      // INVOKED now, inside the gesture; its promise is only observed.\n      resumed = Promise.resolve(context.resume()).then(update, update);\n    }",
    replace: '',
    test: 'practice sound reuses one gesture primed context across all start and resume doors',
  },
  {
    name: 'an unconditional marker claim (effect replay cues twice)',
    file: 'src/store/useStore.ts',
    find: '        if ((active.signalledThrough ?? 0) >= marker) return false;\n        set({ active: { ...active, signalledThrough: marker } });',
    replace: '        set({ active: { ...active, signalledThrough: marker } });',
    test: 'practice cues preserve wall clock boundaries and every recorded minute',
  },
  {
    name: 'a delayed cue queued for a context that is not running',
    file: 'src/components/practiceCue.ts',
    find: "  const c = context;\n  if (!c || c.state !== 'running') return;\n  try {\n    const t0 = c.currentTime;",
    replace:
      "  const c = context;\n  if (!c) return;\n  if (c.state !== 'running') { c.addEventListener?.('statechange', () => c.state === 'running' && playPracticeCue()); return; }\n  try {\n    const t0 = c.currentTime;",
    test: 'practice sound keeps one context primed only by taps and never queues a cue',
  },
  {
    name: 'routine Start moved back into an effect',
    file: 'src/pages/RoutineRunner.tsx',
    find: '  const begin = () => {\n    if (routine && routineId) startRoutineRun(routineId, shortOnTime, segmentsForRun(routine.segments, shortOnTime));\n  };',
    replace:
      '  const begin = () => {\n    if (routine && routineId) startRoutineRun(routineId, shortOnTime, segmentsForRun(routine.segments, shortOnTime));\n  };\n  useEffect(() => {\n    if (routine && routineId && !active && !activeRoutine && !result) begin();\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [routine, routineId]);',
    test: 'practice sound reuses one gesture primed context across all start and resume doors',
  },
  {
    name: 'term suggestions back to a datalist only',
    file: 'src/components/MusicalTermField.tsx',
    find: '        {options.length > 0 && (\n          <div id={listId} className="term-suggestions"',
    replace: '        {false && options.length > 0 && (\n          <div id={listId} className="term-suggestions"',
    test: 'musical term suggestions can be found and selected while typing in both engines',
  },
  {
    name: 'removal from a pathway that also unbinds the item',
    file: 'src/store/useStore.ts',
    find: '          set((s) => ({ db: { ...s.db, items: plan.items, pathways: plan.pathways } }));',
    replace:
      '          set((s) => ({ db: { ...s.db, items: plan.items.map((i) => (i.id === itemId ? { ...i, catalogRefs: undefined } : i)), pathways: plan.pathways } }));',
    test: 'pathway removal and restoration visibly retain the existing owned item',
  },
  {
    name: 'removal from a pathway by deleting the item',
    file: 'src/store/useStore.ts',
    find: '      removeFromPathway: (itemId, pathwayId) => {',
    replace: '      removeFromPathway: (itemId, pathwayId) => {\n        if (pathwayId) { get().deleteItem(itemId); return null; }',
    test: 'pathway removal and restoration visibly retain the existing owned item',
  },
  {
    name: 'a Test sound request that plays after a later tap',
    file: 'src/components/practiceCue.ts',
    find: "    if (mine === gesture && c === context && c.state === 'running') playPracticeCue();",
    replace: "    if (c === context && c.state === 'running') playPracticeCue();",
    test: 'practice sound keeps one context primed only by taps and never queues a cue',
  },
  {
    name: 'a setup choice re-premised from the live plan',
    file: 'src/components/SetarSetupReview.tsx',
    find: '    const sent = selectionsOf(draftRef.current);',
    replace: '    const sent = selectionsOf(draftRef.current).map((x) => ({ ...x, before: plan.proposals.find((p) => p.id === x.id)?.before ?? x.before }));',
    test: 'setar setup review is usable through controls and survives interruption',
  },
  {
    name: 'a created study source forgotten once it exists (replay turns stale)',
    file: 'src/domain/setarSetup.ts',
    find: '  return db.materials.some((m) => m.id === made) ? { materialId: made } : v;',
    replace: '  return v;',
    test: 'setar setup commits selected rows atomically idempotently and without collateral changes',
  },
  {
    name: 'a rename template that ignores the log header',
    file: 'scripts/scan-setar-classes.mjs',
    find: "    line(`       ${logCols.map((h) => (h === 'old_path' ? '<the missing path>' : h === 'new_path' ? '<its current path>' : '')).join(',')}`);",
    replace: "    line('       <the missing path>,<its current path>');",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'a registry draft header printed without its CSV quoting',
    file: 'scripts/scan-setar-classes.mjs',
    find: "${r.registryHeader.map(csvCell).join(',')}",
    replace: "${r.registryHeader.join(',')}",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'a rename-log header printed without its CSV quoting',
    file: 'scripts/scan-setar-classes.mjs',
    find: "    line(`       ${logCols.map(csvCell).join(',')}`);",
    replace: "    line(`       ${logCols.join(',')}`);",
    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
  },
  {
    name: 'every created study source finalised to the first group\'s',
    file: 'src/components/SetarSetupReview.tsx',
    find: 'const id = setupSourceId(instrumentId, key);',
    replace: 'const id = setupSourceId(instrumentId, Object.keys(cur)[0]!);',
    test: 'setar setup review is usable through controls and survives interruption',
  },
  {
    name: 'a created study source never finalised on the screen',
    file: 'src/components/SetarSetupReview.tsx',
    find: "return [key, 'create' in v && made.some((m) => m.id === id) ? { materialId: id } : v];",
    replace: 'return [key, v];',
    test: 'setar setup review is usable through controls and survives interruption',
  },
  {
    name: 'a retry of an already-applied creation that writes nothing',
    file: 'src/store/useStore.ts',
    find: '        set({ db: outcome.db });\n        return null;',
    replace: '        if (outcome.db !== get().db) set({ db: outcome.db });\n        return null;',
    test: 'setar setup commits selected rows atomically idempotently and without collateral changes',
  },
];

const isBrowser = (file) => file.includes('.browser.');
/** The proof test checks THIS runner, so a family run never includes it: no recursion. */
const PROOF_FILE = 'tests/setar-practice-proof.test.ts';
const familyRows = () => [...ACCEPTANCE, ...COMPANIONS].filter(([, , file]) => file !== PROOF_FILE);
const runFiles = (unitOnly) => [...new Set(familyRows().map(([, , f]) => f))].filter((f) => !unitOnly || !isBrowser(f));
const args = new Set(process.argv.slice(2));

function testFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.test\.ts$/.test(name)) out.push(path);
    }
  };
  walk('src');
  walk('tests');
  return out;
}

/** Every title names exactly ONE `it()`, in the named file. Returns the problems. */
export function titleProblems(rows = [...ACCEPTANCE, ...COMPANIONS]) {
  const sources = testFiles().map((f) => [f, readFileSync(f, 'utf8')]);
  const problems = [];
  for (const [id, title, file] of rows) {
    const quoted = new RegExp(`\\bit\\(\\s*['"\`]${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
    const hits = sources.flatMap(([f, src]) => (src.match(quoted) ?? []).map(() => f));
    if (hits.length !== 1) problems.push(`${id}: "${title}" names ${hits.length} tests (${hits.join(', ') || 'none'})`);
    else if (hits[0] !== file) problems.push(`${id}: "${title}" lives in ${hits[0]}, not ${file}`);
  }
  return problems;
}

/** The child run in flight, so a signal can stop it. */
let child = null;

/**
 * Vitest as a child the event loop can wait on — never spawnSync, which would
 * leave a SIGINT or SIGTERM no chance to restore a mutated file.
 */
async function vitest(files, extra = []) {
  const out = mkdtempSync(join(tmpdir(), 'setar-families-'));
  const report = join(out, 'report.json');
  const status = await new Promise((resolve) => {
    child = spawn('npx', ['vitest', 'run', ...files, ...extra, '--reporter=json', `--outputFile=${report}`, '--reporter=default'], {
      stdio: 'inherit',
    });
    child.on('error', () => resolve(1));
    child.on('close', (code) => resolve(code ?? 1));
  });
  child = null;
  let results = {};
  try {
    const json = JSON.parse(readFileSync(report, 'utf8'));
    for (const f of json.testResults) for (const t of f.assertionResults) results[t.title] = t.status;
  } catch {
    results = {};
  }
  rmSync(out, { recursive: true, force: true });
  return { status, results };
}

async function main() {
  if (args.has('--list')) {
    const manifest = {
      acceptance: ACCEPTANCE,
      companions: COMPANIONS,
      mutations: MUTATIONS.map((m) => ({ name: m.name, file: m.file, test: m.test })),
      runs: runFiles(false),
    };
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    return 0;
  }
  const problems = titleProblems();
  if (problems.length) {
    console.error(`Acceptance titles are not one-to-one:\n  ${problems.join('\n  ')}`);
    return 1;
  }

  if (args.has('--mutations')) {
    const failures = [];
    const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
    const selected = MUTATIONS.filter((x) => !only || x.name === only);
    // Never exit 0 without running.
    if (selected.length === 0) {
      console.error(`No mutation is named "${only}". --list prints every name.`);
      return 2;
    }
    // Only a file with no uncommitted changes is mutated, so whatever happens
    // to this process, `git checkout -- <file>` is always a complete recovery.
    const files = [...new Set(selected.map((m) => m.file))];
    const dirty = spawnSync('git', ['status', '--porcelain', '--', ...files], { encoding: 'utf8' });
    if (dirty.status !== 0 || dirty.stdout.trim()) {
      console.error(`Refusing to mutate files with uncommitted changes (or git is unavailable):\n${dirty.stdout || dirty.stderr || ''}`);
      return 2;
    }
    // A signal mid-run restores the file under mutation before leaving.
    let pending = null;
    const stop = (signal) => {
      if (pending) writeFileSync(pending.file, pending.original);
      child?.kill(signal);
      console.error(`\nStopped by ${signal}${pending ? `; ${pending.file} restored` : ''}.`);
      process.exit(130);
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    for (const m of selected) {
      const original = readFileSync(m.file, 'utf8');
      const count = original.split(m.find).length - 1;
      if (count !== 1) {
        failures.push(`${m.name}: the mutation no longer applies (${count} matches in ${m.file})`);
        continue;
      }
      const owner = [...ACCEPTANCE, ...COMPANIONS].find(([, title]) => title === m.test);
      try {
        pending = { file: m.file, original };
        writeFileSync(m.file, original.replace(m.find, m.replace));
        const { results } = await vitest([owner[2]], ['-t', m.test]);
        const status = results[m.test] ?? 'did not run';
        console.log(`MUTATION ${status === 'failed' ? 'CAUGHT ' : 'MISSED '} ${m.name} → ${m.test} (${status})`);
        if (status !== 'failed') failures.push(`${m.name}: "${m.test}" ${status}`);
      } finally {
        writeFileSync(m.file, original);
        pending = null;
      }
      if (readFileSync(m.file, 'utf8') !== original) failures.push(`${m.name}: ${m.file} was not restored`);
    }
    if (failures.length) {
      console.error(`\nMutations not caught:\n  ${failures.join('\n  ')}`);
      return 1;
    }
    console.log('\nEvery targeted mutation failed its named check, and every file was restored.');
    return 0;
  }

  const unitOnly = args.has('--unit');
  const rows = familyRows();
  const files = runFiles(unitOnly);
  const { status, results } = await vitest(files);
  let failed = status !== 0;
  console.log('\nSetar practice reliability — acceptance checks and the one test proving each:');
  for (const [id, title, file] of rows) {
    if (unitOnly && isBrowser(file)) {
      console.log(`  ${id.padEnd(6)} (browser, not run with --unit)  ${title}`);
      continue;
    }
    const st = results[title] ?? 'did not run';
    if (st !== 'passed') failed = true;
    console.log(`  ${id.padEnd(6)} ${st.padEnd(12)} ${title}`);
  }
  console.log('  ac-17  run: node scripts/check-setar-practice-families.mjs --mutations');
  console.log('  ac-18, ac-19  manual:OWNER — see docs/setar-practice-reliability.md');
  return failed ? 1 : 0;
}

/** Run only when executed directly, so a test can import the manifest. */
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) main().then((code) => process.exit(code));
