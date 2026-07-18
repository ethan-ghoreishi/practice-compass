#!/usr/bin/env node
// Regenerate SETAR_CLASS_SESSIONS in src/domain/setarClasses.ts from the real
// NAS folder. References only — paths stay relative to the recordings base URL,
// no bytes are copied. Node stdlib only.
//
//   node scripts/scan-setar-classes.mjs                 # dry-run: show the diff
//   node scripts/scan-setar-classes.mjs --write         # apply
//   node scripts/scan-setar-classes.mjs --root /path    # different folder
//
// The generated array lives between `// [scan:begin]` and `// [scan:end]` in
// src/domain/setarClasses.ts; everything else in that file is preserved.

import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const DEFAULT_ROOT = '/Volumes/Sandisk/video-courses/setar-classes';
const TARGET = fileURLToPath(new URL('../src/domain/setarClasses.ts', import.meta.url));
const VIDEO_EXT = ['.mp4', '.mov', '.m4v', '.webm', '.mkv'];
const DOC_EXT = ['.docx', '.doc', '.jpg', '.jpeg', '.png', '.heic', '.txt', '.rtf'];

const ext = (f) => {
  const i = f.lastIndexOf('.');
  return i < 0 ? '' : f.slice(i).toLowerCase();
};

/** "session-12-06-08-2024" → { n: 12, date: "2024-08-06" }, or null if it doesn't match. */
export function parseSessionFolderName(name) {
  const m = /^session-(\d+)-(\d{2})-(\d{2})-(\d{4})$/.exec(name);
  if (!m) return null;
  const [, n, dd, mm, yyyy] = m;
  return { n: Number(n), date: `${yyyy}-${mm}-${dd}` };
}

/** Pick the main class video: the largest video file (mp4/mov/…). */
export function pickMainVideo(files) {
  const vids = files.filter((f) => VIDEO_EXT.includes(ext(f.name)));
  if (vids.length === 0) return undefined;
  return vids.reduce((best, f) => (f.size > best.size ? f : best)).name;
}

/** Scan the root folder into an ordered SetarClassSession[] (relative paths). */
export function scanSessions(root) {
  const rootName = root.replace(/\/+$/, '').split('/').pop();
  const sessions = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const parsed = parseSessionFolderName(entry.name);
    if (!parsed) continue;
    const dir = join(root, entry.name);
    const files = readdirSync(dir, { withFileTypes: true })
      .filter((f) => f.isFile() && !f.name.startsWith('.'))
      .map((f) => ({ name: f.name, size: statSync(join(dir, f.name)).size }));

    const rel = (name) => `${rootName}/${entry.name}/${name}`;
    const video = pickMainVideo(files);
    const pdfs = files.filter((f) => ext(f.name) === '.pdf').map((f) => rel(f.name)).sort();
    const docs = files.filter((f) => DOC_EXT.includes(ext(f.name))).map((f) => rel(f.name)).sort();

    sessions.push({
      n: parsed.n,
      date: parsed.date,
      video: video ? rel(video) : '',
      sizeBytes: video ? files.find((f) => f.name === video).size : 0,
      pdfs,
      docs,
    });
  }
  sessions.sort((a, b) => a.n - b.n);
  return sessions;
}

/** Render one session as a source line, matching the existing file's style. */
function renderSession(s) {
  const parts = [
    `n: ${s.n}`,
    `date: ${JSON.stringify(s.date)}`,
    `video: ${JSON.stringify(s.video)}`,
    `sizeBytes: ${s.sizeBytes}`,
    `pdfs: ${JSON.stringify(s.pdfs)}`,
  ];
  if (s.docs && s.docs.length > 0) parts.push(`docs: ${JSON.stringify(s.docs)}`);
  return `  { ${parts.join(', ')} },`;
}

export function renderBlock(sessions) {
  return [
    'export const SETAR_CLASS_SESSIONS: SetarClassSession[] = [',
    ...sessions.map(renderSession),
    '];',
  ].join('\n');
}

/** Replace the marked block in the target file's text. */
export function spliceBlock(fileText, blockText) {
  const begin = '// [scan:begin]';
  const end = '// [scan:end]';
  const b = fileText.indexOf(begin);
  const e = fileText.indexOf(end);
  if (b < 0 || e < 0 || e < b) throw new Error('scan markers not found in setarClasses.ts');
  return fileText.slice(0, b + begin.length) + '\n' + blockText + '\n' + fileText.slice(e);
}

function main() {
  const { values } = parseArgs({
    options: { root: { type: 'string' }, write: { type: 'boolean', default: false } },
  });
  const root = values.root ?? DEFAULT_ROOT;

  let sessions;
  try {
    sessions = scanSessions(root);
  } catch (err) {
    console.error(`Could not scan "${root}": ${err.message}`);
    console.error('Pass --root <folder> if the drive is mounted elsewhere.');
    process.exit(1);
  }

  if (sessions.length === 0) {
    console.error(`No session-N-DD-MM-YYYY folders found under "${root}".`);
    process.exit(1);
  }

  const current = readFileSync(TARGET, 'utf8');
  const next = spliceBlock(current, renderBlock(sessions));

  const withPdfs = sessions.filter((s) => s.pdfs.length > 0).length;
  const withDocs = sessions.filter((s) => s.docs && s.docs.length > 0).length;
  console.log(`Scanned ${sessions.length} sessions (${withPdfs} with PDFs, ${withDocs} with docs).`);

  if (next === current) {
    console.log('No changes — setarClasses.ts is already up to date.');
    return;
  }

  if (!values.write) {
    // Show a compact per-session diff summary in dry-run.
    const oldBlock = current.slice(current.indexOf('// [scan:begin]'), current.indexOf('// [scan:end]'));
    for (const s of sessions) {
      const line = renderSession(s).trim();
      if (!oldBlock.includes(`n: ${s.n},`) || !oldBlock.includes(JSON.stringify(s.video))) {
        console.log(`  ~ session ${s.n} (${s.date})`);
      }
    }
    console.log('\nDry run — re-run with --write to apply.');
    return;
  }

  writeFileSync(TARGET, next);
  console.log(`Wrote ${TARGET}. Run npm test to verify.`);
}

// Only run when invoked directly (not when imported by tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
