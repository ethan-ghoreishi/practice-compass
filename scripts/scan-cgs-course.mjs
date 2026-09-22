#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scan-cgs-course.mjs — turn the offline Classical Guitar Shed course tree into
// `src/domain/courseData.ts`, the committed reference literal the app reads.
//
// BUILD-TIME ONLY. Node stdlib only, no dependencies, DRY-RUN BY DEFAULT
// (`--write` to actually emit). Nothing in `src/` imports this file and nothing
// in it is reachable from any runtime path — the app consumes the generated
// data, never a directory.
//
// The GRAMMAR of the course lives HERE and nowhere else, exactly as the Setar
// scanner owns its filename grammar. The app never parses a folder name, a
// `notes.md` heading or a syllabus table.
//
// What it reads, and why that is the honest source:
//   • `LEVEL_GUIDE.md` — the level's own Core (⭐, every session) / Rotation A /
//     Rotation B / Reference split with its time budgets. This is where the
//     course states its own daily routine. NOTE: the `***`-marked routine the
//     plan expected in the syllabus PDF DOES NOT EXIST in this corpus (grep for
//     `***` across every markdown file returns nothing); the LEVEL_GUIDE tables
//     are the real, uniform, machine-readable source, and every level including
//     Level 3 has one. Core → `essential: true`, Rotation → not essential,
//     Reference → not in the routine at all.
//   • each section's `notes.md` — its own title, practice guidance, image /
//     sheet-music / video lists (already in order, by name) and checklist.
//   • the level syllabus PDF — the target-BPM column of its page-1 practice
//     table. A BPM is emitted ONLY when it falls inside a band whose own header
//     row matches a real section of that level; anything else is reported as a
//     diagnostic rather than guessed onto a section, because a wrong tempo
//     attached to a real section is worse than no tempo at all.
//
// It DISCOVERS the levels present — nothing is bound to eighteen of them, to
// `Level_*` naming or to a section-per-folder layout — and reports anything it
// could not read instead of silently emitting less.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DEFAULT_ROOT = '/Volumes/Sandisk/video-courses/classical-guitar/classical-guitar-shed';
const DEFAULT_MEDIA_PATH = 'classical-guitar/classical-guitar-shed';
const DEFAULT_OUT = 'src/domain/courseData.ts';

// --- the course's own vocabulary -------------------------------------------

/**
 * Folder base name → the catalogue key that stage ALREADY uses today.
 *
 * KEYS ARE ADDED, NEVER RENAMED. Every one of these is a key `cgsOutline()`
 * currently produces, so an item the owner has already added from the generic
 * suggestion stays attached to the real section that replaces it. Where a level
 * has two folders of one family (2E's two Scales sections, 3A's two Arpeggios
 * sections), ONE keeps the base key and the other gets its own new key, so
 * nothing is ever displaced — see `baseOwner` for which, and why it is not
 * simply the first.
 */
const BASE_KEYS = [
  ['chords', 'chords', 'chords'],
  ['arpeggios', 'arpeggios', 'arpeggios'],
  ['scales', 'scales', 'scales'],
  ['exercises', 'exercises', 'exercise'],
  ['rhythm_study', 'rhythm-study', 'rhythm'],
  ['sight_reading', 'sight-reading', 'sight_reading'],
  ['fretboard_mastery', 'fretboard-mastery', 'fretboard'],
  ['phrasing', 'phrasing', 'phrasing'],
  ['piece', 'piece', 'piece'],
  ['practice_skills', 'practice-skills', 'practice_skills'],
  ['other_study', 'other-study', 'other'],
  // No generic counterpart — new keys, added not renamed.
  ['contrast_cards', 'contrast-cards', 'warmup'],
  ['welcome', 'welcome', 'other'],
  ['syllabus_materials', 'syllabus-materials', 'other'],
  ['first_things_first', 'first-things-first', 'other'],
  ['warm_up', 'warm-up', 'warmup'],
  ['left_hand_exercises', 'left-hand-exercises', 'left_hand'],
  ['right_hand_technique', 'right-hand-technique', 'right_hand'],
  ['background_knowledge', 'background-knowledge', 'reading_theory'],
  ['ready_for', 'ready-for', 'practice_skills'],
];

/** Left-column header words in the syllabus table, mapped to a folder base. */
const SYLLABUS_HEADERS = [
  [/^w\/?u/, 'warm_up'],
  [/^chords?$/, 'chords'],
  [/^arpeggios?/, 'arpeggios'],
  [/^scales?/, 'scales'],
  [/^exercises?$/, 'exercises'],
  [/^righthandskills?$/, 'right_hand_technique'],
  [/^lefthand/, 'left_hand_exercises'],
  [/^rhythmstudy$/, 'rhythm_study'],
  [/^sightreading$/, 'sight_reading'],
  [/^fretboard/, 'fretboard_mastery'],
  [/^phrasing$/, 'phrasing'],
  [/^piece$/, 'piece'],
  [/^other$/, 'other_study'],
];

const GROUP_TITLES = {
  1: 'Level 1 · Foundations',
  2: 'Level 2 · Coordination',
  3: 'Level 3 · Musicianship',
};

// --- tiny helpers -----------------------------------------------------------

function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** HTML entities the course's own `notes.md` files contain verbatim. */
function decodeEntities(s) {
  return s
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

/** Resolve a `notes.md` link (possibly `../x.pdf`) to a COURSE-relative path.
 *  Never leaves `..` in the result — a stored reference carrying one is refused
 *  by `isSafeRelativeReference` at open time. */
function courseRelative(sectionRel, href) {
  const joined = path.posix.normalize(path.posix.join(sectionRel, href.replace(/^\.\//, '')));
  return joined.startsWith('..') ? null : joined;
}

function fileKind(name) {
  const ext = path.extname(name).toLowerCase();
  if (ext === '.mp4' || ext === '.mov' || ext === '.m4v') return 'video';
  if (ext === '.pdf') return 'pdf';
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif' || ext === '.webp') return 'image';
  if (ext === '.mp3' || ext === '.m4a' || ext === '.wav') return 'audio';
  return 'doc';
}

// --- notes.md ---------------------------------------------------------------

/**
 * One section's `notes.md`, as the course wrote it: its own title, the prose
 * guidance above the file lists, the lists themselves and the checklist.
 */
function readNotes(text) {
  const lines = text.split('\n');
  const title = (lines.find((l) => l.startsWith('# ')) ?? '').slice(2).trim();

  // Guidance: everything after the "View online" link and before the first
  // `---` rule or `## ` heading. That is exactly the part the course wrote for
  // this section rather than a repeated list.
  const start = lines.findIndex((l) => /^🔗/.test(l));
  const body = [];
  for (let i = (start >= 0 ? start : lines.findIndex((l) => l.startsWith('# '))) + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim() === '---' || l.startsWith('## ')) break;
    body.push(l);
  }

  const sections = new Map();
  let current = null;
  for (const l of lines) {
    const h = /^## (.+)$/.exec(l);
    if (h) {
      current = h[1].trim();
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }
    if (current) sections.get(current).push(l);
  }
  const under = (name) => (sections.get(name) ?? []).join('\n');

  const links = (block) =>
    [...block.matchAll(/(!?)\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({
      title: decodeEntities(m[2]).trim(),
      href: m[3].trim(),
    }));

  const videos = [...under('Videos').matchAll(/^-\s+`([^`]+)`/gm)].map((m) => m[1]);
  const checklist = [...under('Practice Checklist').matchAll(/^-\s+\[ \]\s+(.+)$/gm)].map((m) => m[1].trim());

  const sheet = [];
  for (const name of sections.keys()) {
    if (/^Sheet Music/.test(name)) sheet.push(...links(under(name)));
  }

  return {
    title,
    guidance: body.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    images: links(under('Images')),
    sheet,
    videos,
    checklist: checklist.join('\n'),
  };
}

// --- LEVEL_GUIDE.md ---------------------------------------------------------

const TIME_RE = /(\d+)\s*[–-]\s*(\d+)\s*min/;

/** Midpoint of the guide's own "8–12 min" range, rounded — its authored length. */
function minutesFrom(text, fallback) {
  const m = TIME_RE.exec(text);
  return m ? Math.round((Number(m[1]) + Number(m[2])) / 2) : fallback;
}

/**
 * The level's Core / Rotation A / Rotation B split, in the guide's own order.
 * Core sections are ESSENTIAL — the guide says they get time every session —
 * and the rotations are not, so "Short on time — essentials only" keeps
 * meaning exactly what the syllabus means by it.
 */
function readLevelGuide(text) {
  const rows = [];
  const focus = (/^\*\*Focus:\*\*\s*(.+)$/m.exec(text) ?? [])[1]?.trim();

  const core = /### Core[^\n]*\n([\s\S]*?)(?=\n### |\n## |$)/.exec(text);
  if (core) {
    for (const m of core[1].matchAll(/^\|\s*`([^`]+)`[^|]*\|\s*([^|]+?)\s*\|/gm)) {
      rows.push({ folder: m[1].replace(/\/$/, ''), minutes: minutesFrom(m[2], 10), essential: true });
    }
  }
  for (const rot of text.matchAll(/### Rotation [AB][^\n]*\n([\s\S]*?)(?=\n### |\n## |$)/g)) {
    for (const m of rot[1].matchAll(/^-\s+`([^`]+)`\s+—\s*(.+)$/gm)) {
      rows.push({ folder: m[1].replace(/\/$/, ''), minutes: minutesFrom(m[2], 6), essential: false });
    }
  }
  const reference = new Set();
  const ref = /### Reference sections[^\n]*\n([\s\S]*?)(?=\n### |\n## |$)/.exec(text);
  if (ref) for (const m of ref[1].matchAll(/^-\s+`([^`]+)`/gm)) reference.add(m[1].replace(/\/$/, ''));

  return { focus, rows, reference };
}

// --- the syllabus PDF's target-BPM column -----------------------------------

/** Text runs of a PDF's first content stream, with their page coordinates. */
function pdfFirstPageItems(buf) {
  let i = 0;
  while (true) {
    const s = buf.indexOf('stream', i);
    if (s < 0) return null;
    let p = s + 6;
    if (buf[p] === 13) p++;
    if (buf[p] === 10) p++;
    const e = buf.indexOf('endstream', p);
    if (e < 0) return null;
    let t = null;
    try {
      t = zlib.inflateSync(buf.subarray(p, e)).toString('latin1');
    } catch {
      /* not a flate stream */
    }
    i = e + 9;
    if (!t || !/\)\s*Tj/.test(t)) continue;

    const items = [];
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    const re =
      /1\s+0\s+0\s+1\s+([\d.-]+)\s+([\d.-]+)\s+cm|[\d.-]+\s+0\s+0\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s+Tm|\(((?:\\.|[^)\\])*)\)\s*Tj/g;
    let m;
    while ((m = re.exec(t))) {
      if (m[1] !== undefined) {
        cx = +m[1];
        cy = +m[2];
      } else if (m[3] !== undefined) {
        tx = +m[3];
        ty = +m[4];
      } else {
        const s2 = m[5].replace(/\\(\d{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8))).replace(/\\(.)/g, '$1');
        if (s2.trim()) items.push({ x: cx + tx, y: cy + ty, s: s2 });
      }
    }
    return items;
  }
}

/**
 * Target BPM per section folder, read off the syllabus's page-1 practice table.
 *
 * The table's left column carries the section headers and its right column the
 * BPM. A number is attributed to the NEAREST header row at or above it whose
 * text matches one of that level's real sections — never to a row merely
 * closest on the page, and never at all when no header matches. A level whose
 * table cannot be read this way (a shifted font subset, a missing file) yields
 * nothing and is REPORTED, because an invented tempo on a real section is
 * worse than an absent one.
 */
function readSyllabusBpm(buf, foldersByBase) {
  const items = pdfFirstPageItems(buf);
  if (!items) return { bpm: {}, problem: 'no readable text stream on the syllabus PDF' };

  const byRow = new Map();
  for (const it of items) {
    const k = Math.round(it.y / 3) * 3;
    if (!byRow.has(k)) byRow.set(k, []);
    byRow.get(k).push(it);
  }
  const rows = [...byRow.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([y, arr]) => ({ y, items: arr.sort((a, b) => a.x - b.x) }));

  // The BPM column: the x of the "bpm" header cells on the title row.
  const bpmX = items.filter((it) => /^bpm$/i.test(it.s.trim())).map((it) => it.x);
  if (bpmX.length === 0) return { bpm: {}, problem: 'no bpm column header on the syllabus PDF' };
  const lo = Math.min(...bpmX) - 12;
  const hi = Math.max(...bpmX) + 30;

  const bpm = {};
  let currentBase = null;
  let found = 0;
  for (const row of rows) {
    const left = row.items
      .filter((it) => it.x < lo - 120)
      .map((it) => it.s)
      .join('')
      .toLowerCase()
      .replace(/[^a-z/]/g, '');
    if (left) {
      const hit = SYLLABUS_HEADERS.find(([re]) => re.test(left));
      if (hit) currentBase = hit[1];
    }
    for (const it of row.items) {
      if (it.x < lo || it.x > hi) continue;
      const n = Number(it.s.trim());
      if (!Number.isInteger(n) || n < 30 || n > 240) continue;
      found += 1;
      const folder = currentBase ? foldersByBase.get(currentBase) : undefined;
      if (folder && bpm[folder] === undefined) bpm[folder] = n;
    }
  }
  const attributed = Object.keys(bpm).length;
  return {
    bpm,
    problem:
      found === 0
        ? 'no target BPM values found in the syllabus table'
        : attributed === 0
          ? `found ${found} BPM value(s) on the syllabus but none fell under a recognisable section header`
          : null,
  };
}

// --- works ------------------------------------------------------------------

/** Not a specific work: a list, or a page about repertoire in general. */
const NOT_A_WORK = /repertoire|video review|excerpt|,/i;

/** A download in a Sheet Music list that is an aid, not a piece. */
const NOT_A_PACKET_WORK = /syllabus|materials|course notes|checklist/i;

/**
 * The level's OWN study, named by the course itself — "2C Piece: Study #8"
 * after the colon, else the first line of the Piece section's own text
 * ("The Forest Glade", "Study #1").
 *
 * A name the course does not state as a specific work (3C's comma list, 3F's
 * "Repertoire + Video Review") yields NOTHING and is reported. `A + B` is two
 * works, because that is what the course means by it.
 */
function studiesFrom(notes) {
  const afterColon = /:\s*(.+)$/.exec(notes.title);
  const raw = (afterColon ? afterColon[1] : (notes.guidance.split('\n').find((l) => l.trim()) ?? '')).trim();
  const cleaned = raw.replace(/^Full courses? (on pieces)?:?\s*/i, '').trim();
  if (!cleaned || NOT_A_WORK.test(cleaned)) return { studies: [], skipped: cleaned || null };
  return { studies: cleaned.split(' + ').map((s) => s.trim()).filter(Boolean), skipped: null };
}

const COMPOSER_SPLIT = /\s+[–—-]\s+/;

/**
 * The packet works the section's own Sheet Music lists name, with their
 * composers, deduplicated BY FILE so the same work listed under both the
 * online and the local-files heading is one work.
 *
 * The key is derived from the WORK, not from the level — that is what makes a
 * work carried forward across levels (Ferrer Ejercicio runs 2C–2F) one entry
 * the owner adds once, rather than four.
 */
function packetWorks(notes, sectionRel) {
  const out = [];
  const seen = new Set();
  for (const link of notes.sheet) {
    const file = courseRelative(sectionRel, link.href);
    if (!file || fileKind(file) !== 'pdf') continue;
    if (seen.has(file)) continue;
    seen.add(file);
    let title = link.title.replace(/\s*complete course packet\s*/i, ' ').replace(/\s+/g, ' ').trim();
    // A DOWNLOAD IN THIS LIST IS NOT AUTOMATICALLY A WORK. The same rule the
    // Piece section itself is held to: repertoire only where the course NAMES a
    // work. 3F's list carries "Here's the video review checklist" beside four
    // real pieces, and it became a repertoire work called exactly that. It is
    // still reachable — it is one of that section's own files — just not a
    // piece in My repertoire.
    if (NOT_A_PACKET_WORK.test(title)) continue;
    const parts = title.split(COMPOSER_SPLIT);
    if (parts.length === 2) title = `${parts[0].trim()} — ${parts[1].trim()}`;
    out.push({ key: `work-${slug(title)}`, title, file });
  }
  return out;
}

// --- scanning ---------------------------------------------------------------

function listDirs(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== '@eaDir')
    .map((d) => d.name)
    .sort();
}

function scan(root, mediaPath, diagnostics) {
  const levels = listDirs(root).filter((n) => /^Level_/i.test(n));
  if (levels.length === 0) throw new Error(`no Level_* folders under ${root}`);
  const groups = [];
  const checklists = new Map();

  for (const levelDir of levels) {
    const code = levelDir.replace(/^Level_/i, '');
    const levelAbs = path.join(root, levelDir);
    const levelRel = path.posix.join(mediaPath, levelDir);

    const guidePath = path.join(levelAbs, 'LEVEL_GUIDE.md');
    if (!fs.existsSync(guidePath)) {
      diagnostics.push(`${code}: no LEVEL_GUIDE.md — level skipped`);
      continue;
    }
    const guide = readLevelGuide(fs.readFileSync(guidePath, 'utf8'));

    // Section folders, in the course's own order. A folder with no notes.md is
    // still a real section — it is reported, and its files still reach the app.
    const folders = listDirs(levelAbs);
    const hasNotes = (folder) => fs.existsSync(path.join(levelAbs, folder, 'notes.md'));
    const baseOf = (folder) => {
      const bare = folder.replace(/^\d+_/, '').toLowerCase();
      return BASE_KEYS.find(([b]) => bare === b || bare.startsWith(`${b}_`));
    };

    // WHICH folder of a family KEEPS THE EXISTING CATALOGUE KEY. The key an
    // already-added item carries must land on the section that item is
    // actually about, so ordinal order alone is not the rule: 2E ships an
    // empty `08_Sight_Reading` stub beside the real `09_Sight_Reading`, and
    // first-wins gave `sight-reading` to the stub — the owner's item would
    // have stayed attached to a titleless folder while the level's routine
    // named the other one. Substance decides: a folder WITH a `notes.md`
    // takes the base key, and ordinal order breaks the tie.
    const baseOwner = new Map();
    for (const folder of folders) {
      const base = baseOf(folder);
      if (!base) continue;
      const current = baseOwner.get(base[0]);
      if (current === undefined || (!hasNotes(current) && hasNotes(folder))) baseOwner.set(base[0], folder);
    }
    // Every base key an owner is going to claim, RESERVED up front — kept apart
    // from the keys actually assigned so far, so a non-owner reached earlier in
    // folder order cannot take one by slug before its owner gets there.
    const reserved = new Set([...baseOwner.keys()].map((b) => BASE_KEYS.find(([x]) => x === b)[1]));
    const usedKeys = new Set();
    const foldersByBase = baseOwner;
    const units = [];

    for (const folder of folders) {
      const bare = folder.replace(/^\d+_/, '');
      const base = baseOf(folder);

      // Only the family's OWNER takes the base key; everyone else takes its own
      // slug, and a slug that lands on a key already spoken for is suffixed with
      // its folder's ordinal. The collision check must cover a non-owner whose
      // slug happens to EQUAL the base key (`08_Sight_Reading` → `sight-reading`,
      // which 09 owns) — skipping it there is how one level ended up with two
      // units under one key, and a duplicate key means two sections claiming one
      // item.
      const isOwner = !!base && baseOwner.get(base[0]) === folder;
      let key = isOwner ? base[1] : slug(bare);
      if (!isOwner && (reserved.has(key) || usedKeys.has(key))) key = `${key}-${folder.slice(0, 2)}`;
      if (usedKeys.has(key)) throw new Error(`${code}: two sections claim the catalogue key "${key}"`);
      usedKeys.add(key);

      const sectionAbs = path.join(levelAbs, folder);
      const sectionRel = path.posix.join(levelRel, folder);
      const notesPath = path.join(sectionAbs, 'notes.md');
      const notes = fs.existsSync(notesPath)
        ? readNotes(fs.readFileSync(notesPath, 'utf8'))
        : (diagnostics.push(`${code}/${folder}: no notes.md — title and guidance unavailable`),
          { title: bare.replace(/_/g, ' '), guidance: '', images: [], sheet: [], videos: [], checklist: '' });

      const onDisk = fs.readdirSync(sectionAbs, { withFileTypes: true });
      const diskFiles = onDisk.filter((d) => d.isFile() && !d.name.startsWith('.') && d.name !== 'notes.md').map((d) => d.name);
      const subFolders = onDisk.filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== '@eaDir').map((d) => d.name);

      const files = [];
      const pushed = new Set();
      const push = (name, title) => {
        const rel = courseRelative(sectionRel, name);
        if (!rel || pushed.has(rel)) return;
        pushed.add(rel);
        files.push({ path: rel, kind: fileKind(rel), title: title || path.posix.basename(rel) });
      };
      // notes.md lists videos IN ORDER and names its sheet music and images, so
      // it leads; anything on disk it does not mention still follows, because a
      // file the app cannot see is a file the owner has to leave the app for.
      for (const v of notes.videos) {
        if (!diskFiles.includes(v)) {
          diagnostics.push(`${code}/${folder}: notes.md lists ${v} but it is not on disk`);
          continue;
        }
        push(v, `${notes.title} · video ${notes.videos.indexOf(v) + 1}`);
      }
      for (const l of [...notes.sheet, ...notes.images]) push(l.href, l.title);
      for (const f of diskFiles.slice().sort()) push(f, null);
      // A section holding its own sub-folders (the contrast-card decks: 1663
      // images) is ONE folder reference to the section itself, opened where it
      // lives — never a deck-by-deck list, never a viewer, never bytes in the
      // app.
      if (subFolders.length > 0) {
        files.push({ path: `${sectionRel}/`, kind: 'folder', title: notes.title || bare.replace(/_/g, ' ') });
      }

      let checklistKey;
      if (notes.checklist) {
        const found = [...checklists.entries()].find(([, v]) => v === notes.checklist);
        checklistKey = found ? found[0] : `cl${checklists.size + 1}`;
        checklists.set(checklistKey, notes.checklist);
      }

      const row = guide.rows.find((r) => r.folder === folder);
      const unit = {
        key,
        title: notes.title || bare.replace(/_/g, ' '),
        strand: base ? base[2] : 'other',
        mediaPath: sectionRel,
        files,
        ...(notes.guidance ? { guidance: notes.guidance } : {}),
        ...(checklistKey ? { checklistKey } : {}),
        ...(guide.reference.has(folder) ? { reference: true } : {}),
        ...(row ? { routineMinutes: row.minutes, ...(row.essential ? { essential: true } : {}) } : {}),
      };
      units.push({ unit, folder });
    }

    // The level's own works, and the packet works its Piece section names.
    const pieceEntry = units.find((u) => u.unit.key === 'piece');
    const works = [];
    if (pieceEntry) {
      const notesPath = path.join(levelAbs, pieceEntry.folder, 'notes.md');
      if (fs.existsSync(notesPath)) {
        const notes = readNotes(fs.readFileSync(notesPath, 'utf8'));
        // THE LEVEL'S OWN STUDY IS THE PIECE SECTION ITSELF, not a second entry
        // beside it: the section keeps its `piece` key and `piece` strand (so
        // it is a repertoire work, which the generic "Piece" placeholder always
        // claimed to be and never was) and simply gains the real name the
        // course gives it. Emitting a separate study entry would put the same
        // study in My repertoire twice.
        const { studies, skipped } = studiesFrom(notes);
        if (skipped) {
          // A COURSE ENTRY BECOMES REPERTOIRE ONLY WHERE THE COURSE NAMES A
          // WORK. `strand: 'piece'` is exactly what makes an entry a full_piece
          // and therefore a repertoire work, so a Piece section the course does
          // not state a single work for may not keep it: it is practice on
          // material named elsewhere, and its real works reach My repertoire as
          // the packet works below. The KEY stays `piece` — keys are added,
          // never renamed — and the section keeps its own title.
          pieceEntry.unit.strand = 'other';
          diagnostics.push(
            `${code}: the Piece section names no single work ("${skipped}") — its own title is kept and it is practice material, not a repertoire work`,
          );
        }
        for (const w of packetWorks(notes, pieceEntry.unit.mediaPath)) works.push(w);
        if (studies.length) pieceEntry.unit.title = `${code} Piece — ${studies.join(' + ')}`;
      }
    } else {
      diagnostics.push(`${code}: no Piece section — no study or packet works`);
    }

    // Target BPMs, or an honest report that the syllabus could not be read.
    const pdf = fs.readdirSync(levelAbs).find((n) => /syllabus.*\.pdf$/i.test(n));
    if (!pdf) diagnostics.push(`${code}: no syllabus PDF — no target BPMs`);
    else {
      const { bpm, problem } = readSyllabusBpm(fs.readFileSync(path.join(levelAbs, pdf)), foldersByBase);
      if (problem) diagnostics.push(`${code}: ${problem}`);
      for (const u of units) {
        const n = bpm[u.folder];
        if (n !== undefined) u.unit.bpm = n;
      }
    }

    // The routine, in the guide's own order: core first, then the rotations.
    const byFolder = new Map(units.map((u) => [u.folder, u.unit]));
    const routine = [];
    for (const r of guide.rows) {
      const unit = byFolder.get(r.folder);
      if (!unit) {
        diagnostics.push(`${code}: LEVEL_GUIDE names ${r.folder} but there is no such section`);
        continue;
      }
      routine.push({ unitKey: unit.key, label: unit.title, minutes: r.minutes, ...(r.essential ? { essential: true } : {}) });
    }
    if (routine.length === 0) diagnostics.push(`${code}: LEVEL_GUIDE has no Core or Rotation sections — no routine`);

    groups.push({
      key: code.toLowerCase(),
      code,
      title: guide.focus ?? code,
      group: GROUP_TITLES[Number(code[0])] ?? `Level ${code[0]}`,
      mediaPath: levelRel,
      units: units.map((u) => u.unit),
      works,
      routine,
    });
  }

  return { groups, checklists };
}

// --- emitting ---------------------------------------------------------------

const j = (v) => JSON.stringify(v);

function emit(course, checklists, diagnostics) {
  const lines = [];
  lines.push('// GENERATED BY scripts/scan-cgs-course.mjs — DO NOT EDIT BY HAND.');
  lines.push('//');
  lines.push('// A course change is answered by re-running the scanner and committing the new');
  lines.push('// data, never by editing this file. Everything here is reference data in code:');
  lines.push('// nothing is persisted, so regenerating it reaches every item that already');
  lines.push('// exists, because course material is derived from the catalogue rather than');
  lines.push('// copied onto items.');
  lines.push('//');
  lines.push(`// Scanned ${course.groups.length} level(s), ${course.groups.reduce((n, g) => n + g.units.length, 0)} section(s).`);
  lines.push('');
  lines.push("import type { CourseData } from './courseSeed';");
  lines.push('');
  lines.push('/** Practice checklists, deduplicated — the course repeats one per strand. */');
  lines.push('export const CGS_CHECKLISTS: Record<string, string> = {');
  for (const [k, v] of checklists) lines.push(`  ${k}: ${j(v)},`);
  lines.push('};');
  lines.push('');
  lines.push('export const CGS_COURSE: CourseData = {');
  lines.push(`  id: ${j(course.id)},`);
  lines.push(`  pathwayId: ${j(course.pathwayId)},`);
  lines.push(`  name: ${j(course.name)},`);
  lines.push(`  sourceName: ${j(course.sourceName)},`);
  lines.push(`  mediaPath: ${j(course.mediaPath)},`);
  lines.push(`  diagnostics: ${j(diagnostics)},`);
  lines.push('  groups: [');
  for (const g of course.groups) {
    lines.push('    {');
    lines.push(`      key: ${j(g.key)},`);
    lines.push(`      code: ${j(g.code)},`);
    lines.push(`      title: ${j(g.title)},`);
    lines.push(`      group: ${j(g.group)},`);
    lines.push(`      mediaPath: ${j(g.mediaPath)},`);
    lines.push('      units: [');
    for (const u of g.units) lines.push(`        ${j(u)},`);
    lines.push('      ],');
    lines.push('      works: [');
    for (const w of g.works) lines.push(`        ${j(w)},`);
    lines.push('      ],');
    lines.push('      routine: [');
    for (const s of g.routine) lines.push(`        ${j(s)},`);
    lines.push('      ],');
    lines.push('    },');
  }
  lines.push('  ],');
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

// --- main -------------------------------------------------------------------

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function main() {
  const root = arg('root', DEFAULT_ROOT);
  const mediaPath = arg('media-path', DEFAULT_MEDIA_PATH);
  const out = arg('out', DEFAULT_OUT);
  const write = process.argv.includes('--write');

  const diagnostics = [];
  const { groups, checklists } = scan(root, mediaPath, diagnostics);
  const course = {
    id: 'cgs',
    pathwayId: 'cgs',
    name: 'Classical Guitar Shed · The Woodshed',
    sourceName: 'Classical Guitar Shed',
    mediaPath,
    groups,
  };
  const text = emit(course, checklists, diagnostics);

  for (const d of diagnostics) console.error(`  ! ${d}`);
  console.error(
    `\n${groups.length} level(s), ${groups.reduce((n, g) => n + g.units.length, 0)} section(s), ` +
      `${groups.reduce((n, g) => n + g.units.reduce((k, u) => k + u.files.length, 0), 0)} file(s), ` +
      `${groups.reduce((n, g) => n + g.works.length, 0)} work(s), ${diagnostics.length} diagnostic(s).`,
  );
  if (!write) {
    console.error(`DRY RUN — pass --write to update ${out} (${(text.length / 1024).toFixed(0)} KB).`);
    return;
  }
  fs.writeFileSync(out, text);
  console.error(`Wrote ${out} (${(text.length / 1024).toFixed(0)} KB).`);
}

main();
