#!/usr/bin/env node
// ---------------------------------------------------------------------------
// scan-khonyagar-course.mjs — turn the offline Khonyagar (آزاد میرزاپور) Tar
// course folder into `src/domain/khonyagarData.ts`, the committed reference
// literal the app reads.
//
// BUILD-TIME ONLY. Node stdlib only, no dependencies, DRY-RUN BY DEFAULT
// (`--write` to actually emit). Nothing in `src/` imports this file and nothing
// in it is reachable from any runtime path.
//
// The GRAMMAR of this course lives HERE and nowhere else. The app never parses
// a filename, an index heading or a lesson title — it consumes the generated
// data. What the source does NOT state mechanically (stage boundaries, which
// lessons teach which WORK, a work's title and its lesson type) is AUTHORED in
// the three literal tables below, and `docs/khonyagar-course.md` records the
// evidence for each decision.
//
// A SCAN THAT CANNOT RECONCILE THE DISK, THE INDEX AND ITS OWN TABLES WRITES
// NOTHING. Every check below throws before a byte is emitted.
//
// Two facts about the real source decide the shape of every path:
//   • THE NAS SERVES NFC; THIS DISK HOLDS NFD. 78 of the 259 lesson filenames
//     are decomposed on the local volume, and the decomposed name 404s from the
//     NAS while the composed one plays. Every stored path is the real filename
//     NFC-normalised — never the form a local listing happens to show.
//   • THE INDEX IS THE TITLE; THE DISK IS THE PATH. Three index titles carry
//     stray whitespace (030 a leading space, 077 and 148 a double space). The
//     displayed title is the index title with whitespace collapsed, and after
//     NFC plus that collapse every filename must match its title exactly.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ROOT = '/Volumes/Sandisk/video-courses/tar-classes/khonyagar-mirzapour';
const DEFAULT_MEDIA_PATH = 'tar-classes/khonyagar-mirzapour';
const DEFAULT_OUT = 'src/domain/khonyagarData.ts';

const INDEX_FILE = '_فهرست — Index.md';
const GUIDE_FILE = '_راهنمای تمرین روزانه — Daily Practice Guide.md';

// --- authored table 1: stages ------------------------------------------------
//
// Ten runs of consecutive index sections. The KEY is the stage's slug and its
// id part (`tar-khonyagar-<key>`), anchored in the index's own section numbers
// — so it is pure ascii and a later retitling changes nothing. `band` is the
// course's own three-band naming (the score books state it in their titles).
// Every multi-section work stays inside one stage.
const STAGES = [
  { key: 's001-s005', from: 1, to: 5, band: 1, title: 'ساز، مضراب، کشش‌ها و کوک' },
  { key: 's006-s013', from: 6, to: 13, band: 1, title: 'پرده‌ها، انگشت‌گذاری و پوزیسیون‌های اول تا ششم' },
  { key: 's014-s023', from: 14, to: 23, band: 1, title: 'میزان ۶/۸، نخستین قطعه‌ها، پیش‌درآمد و رنگ' },
  { key: 's024-s028', from: 24, to: 28, band: 2, title: 'ماهور' },
  { key: 's029-s035', from: 29, to: 35, band: 2, title: 'شور' },
  { key: 's036-s045', from: 36, to: 45, band: 2, title: 'افشاری، سه‌گاه، اصفهان و دشتی' },
  { key: 's046-s059', from: 46, to: 59, band: 3, title: 'ردیف ماهور: زیرافکن تا کرشمه' },
  { key: 's060-s074', from: 60, to: 74, band: 3, title: 'ردیف ماهور: ز من نگارم تا دلکش' },
  { key: 's075-s092', from: 75, to: 92, band: 3, title: 'ردیف ماهور: رنگ قهر و آشتی تا رنگ کوراغلی' },
  { key: 's093-s106', from: 93, to: 106, band: 3, title: 'ردیف ماهور: نیشابورک تا زنگوله' },
];

const BANDS = { 1: 'تار مقدماتی', 2: 'تار متوسطه', 3: 'تار ۳' };

// --- authored table 2: works -------------------------------------------------
//
// WORK IDENTITY LIVES AT THE LESSON, NOT THE SECTION. Works are taught inside
// sections that are about something else (پیش‌درآمد ابوعطا is lessons 124 and
// 125, in two exercise sections), and one section can teach two (section 17).
// So each work is recorded by the LESSON NUMBERS that teach it, and the rest is
// derived mechanically below.
//
// THE KEY IS `w` PLUS THE ANCHOR LESSON — the lowest lesson that taught the
// work when it first shipped — WRITTEN AS A LITERAL, NEVER COMPUTED. Reordering
// this table, correcting it or inserting a newly recognised work cannot move an
// existing identity. A correction may ADD lessons to a work; it may never
// remove the anchor, and a key is never re-pointed at a different work.
//
// THE RULE for membership: a lesson belongs to a work only when its OWN index
// title names that piece or gusheh (teaching it, continuing it or performing
// it). Context and technique lessons in the same session — an introduction to
// the dastgāh, a mezrab pattern, an unnamed Honarestān درس — stay section
// material. Two works that share a name stay two works: nothing here is ever
// joined on title similarity.
//
// `type` is the course guide's own lesson-type vocabulary: radif (a gusheh),
// rhythmic (chahārmezrāb / reng) or composed (pish-daramad / tasnif / a named
// piece).
const WORKS = [
  { key: 'w036', title: 'کاروان', type: 'composed', lessons: [36] },
  { key: 'w043', title: 'په‌پو سلیمانی', type: 'composed', lessons: [43] },
  { key: 'w044', title: 'مجنون نبودم (آهنگ محلی خراسانی)', type: 'composed', lessons: [44, 46] },
  { key: 'w048', title: 'ای ملک ایران (درس ۲۲ کتاب هنرستان)', type: 'composed', lessons: [48] },
  { key: 'w063', title: 'سرای امید', type: 'composed', lessons: [63, 74] },
  { key: 'w080', title: 'گل سایه کمر', type: 'composed', lessons: [80] },
  { key: 'w087', title: 'نوایی', type: 'composed', lessons: [87] },
  { key: 'w093', title: 'تصنیف مرغ سحر', type: 'composed', lessons: [93] },
  { key: 'w101', title: 'رنگ ناز', type: 'rhythmic', lessons: [101] },
  { key: 'w104', title: 'رنگ دشتی (درس ۶۹ کتاب هنرستان)', type: 'rhythmic', lessons: [104] },
  { key: 'w109', title: 'پیش‌درآمد ماهور (درس ۵۷ کتاب هنرستان)', type: 'composed', lessons: [109] },
  { key: 'w110', title: 'رنگ ماهور (درس ۵۸ کتاب هنرستان)', type: 'rhythmic', lessons: [110] },
  { key: 'w113', title: 'زرد ملیجه (درس ۶۲ کتاب هنرستان)', type: 'composed', lessons: [113] },
  { key: 'w118', title: 'پیش‌درآمد دشتی (درس ۶۴ کتاب هنرستان)', type: 'composed', lessons: [118] },
  { key: 'w121', title: 'نغمه دشتی (درس ۷۸ کتاب هنرستان)', type: 'composed', lessons: [121] },
  { key: 'w124', title: 'پیش‌درآمد ابوعطا', type: 'composed', lessons: [124, 125] },
  { key: 'w128', title: 'رنگ ابوعطا', type: 'rhythmic', lessons: [128] },
  { key: 'w135', title: 'گوشه کرشمه', type: 'radif', lessons: [135] },
  { key: 'w136', title: 'پیش‌درآمد ماهور از رکن‌الدین مختاری', type: 'composed', lessons: [136] },
  { key: 'w138', title: 'چهارمضراب ماهور از موسی معروفی', type: 'rhythmic', lessons: [138, 139] },
  { key: 'w140', title: 'چهارپاره در ماهور', type: 'radif', lessons: [140] },
  { key: 'w142', title: 'تصنیف «ز دست محبوب»', type: 'composed', lessons: [142, 143] },
  { key: 'w146', title: 'پیش‌درآمد شور از روح‌الله خالقی', type: 'composed', lessons: [146, 147] },
  { key: 'w148', title: 'رنگ شور از موسی معروفی', type: 'rhythmic', lessons: [148, 149] },
  { key: 'w153', title: 'رنگ شور', type: 'rhythmic', lessons: [153, 154] },
  { key: 'w155', title: 'چهارمضراب از علینقی وزیری', type: 'rhythmic', lessons: [155, 156] },
  { key: 'w157', title: 'چهارمضراب شور از موسی معروفی', type: 'rhythmic', lessons: [157, 158] },
  { key: 'w159', title: 'تصنیف «پرند شوشتری»', type: 'composed', lessons: [159, 160, 161] },
  { key: 'w163', title: 'پیش‌درآمد افشاری از موسی معروفی', type: 'composed', lessons: [163, 164] },
  { key: 'w165', title: 'رنگ افشاری از اکبر محسنی', type: 'rhythmic', lessons: [165] },
  { key: 'w167', title: 'پیش‌درآمد سه‌گاه از حسین هنگ‌آفرین', type: 'composed', lessons: [167, 168] },
  { key: 'w169', title: 'رنگ سه‌گاه از موسی معروفی', type: 'rhythmic', lessons: [169, 170] },
  { key: 'w171', title: 'تصنیف «از غم عشق تو»', type: 'composed', lessons: [171, 172] },
  { key: 'w174', title: 'پیش‌درآمد اصفهان از مرتضی نی‌داوود', type: 'composed', lessons: [174, 175] },
  { key: 'w177', title: 'رنگ غنی و فقیر از درویش‌خان', type: 'rhythmic', lessons: [177, 178] },
  { key: 'w179', title: 'تصنیف «خوشه‌چین»', type: 'composed', lessons: [179, 180] },
  { key: 'w181', title: 'قطعه «به یاد گذشته» از استاد صبا', type: 'composed', lessons: [181, 182, 183] },
  { key: 'w184', title: 'تمرین دشتی از استاد صبا', type: 'composed', lessons: [184, 185] },
  { key: 'w186', title: 'تمرین دشتی از نصرالله زرین‌پنجه', type: 'composed', lessons: [186, 187] },
  { key: 'w188', title: 'تصنیف «ای ایران»', type: 'composed', lessons: [188, 189] },
  { key: 'w190', title: 'گوشه زیرافکن', type: 'radif', lessons: [190] },
  { key: 'w191', title: 'گوشه نغمه', type: 'radif', lessons: [191] },
  { key: 'w192', title: 'رنگ دوم ماهور از درویش‌خان', type: 'rhythmic', lessons: [192, 193, 194, 195, 196] },
  { key: 'w197', title: 'پیش‌درآمد ماهور درویش‌خان', type: 'composed', lessons: [197, 198, 199, 200, 201, 202, 203] },
  { key: 'w204', title: 'گوشه درآمد ماهور', type: 'radif', lessons: [204] },
  { key: 'w205', title: 'گوشه کرشمه', type: 'radif', lessons: [205] },
  { key: 'w206', title: 'تصنیف ز من نگارم', type: 'composed', lessons: [206, 207, 208, 209, 210] },
  { key: 'w211', title: 'گوشه خاوران', type: 'radif', lessons: [211] },
  { key: 'w212', title: 'گوشه طرب‌انگیز', type: 'radif', lessons: [212] },
  { key: 'w213', title: 'گوشه فیلی', type: 'radif', lessons: [213] },
  { key: 'w214', title: 'پیش‌درآمد سعید هرمزی', type: 'composed', lessons: [214, 215, 216, 217, 218] },
  { key: 'w219', title: 'گوشه آواز (گشایش)', type: 'radif', lessons: [219] },
  { key: 'w220', title: 'گوشه مقدمه داد', type: 'radif', lessons: [220] },
  { key: 'w221', title: 'گوشه داد', type: 'radif', lessons: [221] },
  { key: 'w222', title: 'گوشه دلکش', type: 'radif', lessons: [222] },
  { key: 'w223', title: 'رنگ قهر و آشتی', type: 'rhythmic', lessons: [223, 224, 225, 226] },
  { key: 'w227', title: 'رنگ ماهور شماره ۳', type: 'rhythmic', lessons: [227, 228] },
  { key: 'w229', title: 'گوشه مجلس‌افروز', type: 'radif', lessons: [229] },
  { key: 'w230', title: 'گوشه خسروانی', type: 'radif', lessons: [230] },
  { key: 'w231', title: 'تصنیف عشق تو آتش', type: 'composed', lessons: [231, 232, 233, 234] },
  { key: 'w235', title: 'چهارمضراب از ردیف ماهور', type: 'rhythmic', lessons: [235] },
  { key: 'w236', title: 'گوشه کرشمه و تحریر', type: 'radif', lessons: [236, 237] },
  { key: 'w238', title: 'رنگ قدیمی', type: 'rhythmic', lessons: [238, 239, 240, 241] },
  { key: 'w242', title: 'رنگ کوراغلی', type: 'rhythmic', lessons: [242, 243] },
  { key: 'w244', title: 'گوشه نیشابورک', type: 'radif', lessons: [244] },
  { key: 'w245', title: 'گوشه نصیرخانی', type: 'radif', lessons: [245] },
  {
    key: 'w246',
    title: 'چهارمضراب ماهور',
    type: 'rhythmic',
    lessons: [246, 247, 248, 249, 253, 254, 255, 256, 257],
  },
  { key: 'w250', title: 'گوشه چهارپاره (مرادخانی)', type: 'radif', lessons: [250] },
  { key: 'w251', title: 'گوشه ماهور صغیر', type: 'radif', lessons: [251] },
  { key: 'w252', title: 'گوشه آذربایجانی', type: 'radif', lessons: [252] },
  { key: 'w258', title: 'گوشه حصار ماهور', type: 'radif', lessons: [258] },
  { key: 'w259', title: 'گوشه زنگوله', type: 'radif', lessons: [259] },
];

// --- authored table 3: section types the grammar gets wrong ------------------
//
// A section that is NOT wholly one work is typed by the grammar in
// `sectionType` — Honarestān-درس majority → etude, otherwise technique. Where
// that proposal is wrong, the correction is written here and nowhere else.
// Empty today: every proposal was checked against the index and stands.
const SECTION_TYPE_OVERRIDES = {};

// --- what the source leaves open, stated for the owner ---------------------
//
// Same title is not same work, and a call the source does not settle is
// reported rather than decided silently. Each line is emitted into the data's
// `diagnostics`.
const OPEN_QUESTIONS = [
  'w138 (Ma\'rufi\'s چهارمضراب ماهور, section 26), w246 (the radif\'s, sections 95–97 and 101–104) and w235 (section 85, «چهارمضراب از ردیف ماهور») are kept as three works; the source does not establish that any two are one.',
  'w148 (section 30, Ma\'rufi\'s رنگ شور) and w153 (section 32, «رنگ شور», unattributed) are kept as two works; they may be one.',
  'w135 (section 25), w205 (section 59) and w236 (sections 86–87, «کرشمه و تحریر») are kept as three گوشه کرشمه works; they may be one gusheh taught three times.',
  'w087 «آموزش نوایی» (section 13) is recorded as a named piece; it could instead be the Navā gusheh.',
  'Section 20 is titled «دو قطعه» but names only one piece (درس ۷۸, نغمه دشتی, w121); درس ۶۵ stays section material.',
  'Lesson 141 «درس ۲۴ از کتاب دوم هنرستان» in section 27 names no piece and stays section material beside w140 «چهارپاره در ماهور».',
  'The radif\'s چهارمضراب (w235, w246) carry the rhythmic-pieces book (نت ۴) by the band rule; the score may instead be in the radif book (نت ۳).',
];

// --- the course's own vocabulary ---------------------------------------------

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const toInt = (s) => Number(String(s).replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d))));
const faNum = (n) => String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
const collapse = (s) => s.normalize('NFC').replace(/\s+/g, ' ').trim();
const pad3 = (n) => String(n).padStart(3, '0');

/** An unnamed Honarestān lesson: «درس ۶», «تمرین درس ۶۶ کتاب هنرستان». */
const HONARESTAN_LESSON = /درس\s*[0-9۰-۹]/;

/** The guide's own lesson-type paragraph each type carries, by its bullet's heading. */
const GUIDE_TYPE_HEADINGS = {
  technique: 'Technique lessons',
  etude: 'Etudes / Honarestan',
  rhythmic: 'Chahārmezrāb & reng',
  radif: 'Radif / gusheh / āvāz',
  composed: 'Pish-daramad / tasnif',
};

/** Which strand an entry of a type carries. Only a WORK may carry a repertoire strand. */
function strandFor(type, isWork) {
  if (isWork) return type === 'radif' ? 'radif' : 'repertoire';
  return type === 'etude' ? 'exercise' : 'technique';
}

// --- reading the index -------------------------------------------------------

function parseIndex(text) {
  const lines = text.split('\n');
  const h1 = lines.find((l) => l.startsWith('# '));
  const totalMatch = text.match(/\*\*([0-9۰-۹]+)\s+گفتار\*\*/);
  if (!h1 || !totalMatch) throw new Error('index: no title or no declared lesson total');
  const description = lines.find((l, i) => i > lines.indexOf(h1) + 2 && l.trim() && !l.startsWith('#') && !l.startsWith('**'));

  const books = [];
  const sections = [];
  let mode = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      mode = line.includes('Sheet music') ? 'books' : line.includes('Lessons by session') ? 'lessons' : null;
      continue;
    }
    if (mode === 'books' && line.startsWith('- ')) books.push(line.slice(2).trim().normalize('NFC'));
    if (mode === 'lessons') {
      const sec = line.match(/^### (\d+)\. (.+)$/);
      if (sec) {
        sections.push({ number: Number(sec[1]), title: collapse(sec[2]), lessons: [] });
        continue;
      }
      const les = line.match(/^- `(\d{3})` (.*?)\s*\((\d\d:\d\d)\)\s*$/);
      if (les) {
        if (!sections.length) throw new Error(`index: lesson ${les[1]} listed before any section`);
        sections[sections.length - 1].lessons.push({ number: Number(les[1]), title: collapse(les[2]) });
      } else if (line.startsWith('- ')) {
        throw new Error(`index: unreadable lesson line ${JSON.stringify(line)}`);
      }
    }
  }
  return { name: collapse(h1.slice(2)), description: collapse(description ?? ''), declared: toInt(totalMatch[1]), books, sections };
}

// --- reading the guide -------------------------------------------------------

/** One `## heading` block of the guide, verbatim, heading line excluded. */
function guideSection(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start < 0) throw new Error(`guide: no section "${heading}"`);
  const body = text.slice(text.indexOf('\n', start) + 1);
  const end = body.search(/\n(## |---\n)/);
  return (end < 0 ? body : body.slice(0, end)).trim();
}

/** Markdown emphasis and quote markers off — the pathway note is plain text. */
const plain = (s) => s.replace(/\*/g, '').replace(/^>\s*/gm, '').trim();

/**
 * The daily template as plain lines, in the guide's own words. The pathway
 * note renders as plain text, so the table's rows become one line each
 * (block — purpose, then its two columns) rather than a grid of pipes.
 */
function flattenTemplate(template) {
  const out = [];
  let header = null;
  for (const line of template.split('\n')) {
    if (!line.startsWith('|')) {
      if (line.trim()) out.push(plain(line));
      continue;
    }
    const cells = line.split('|').slice(1, -1).map((c) => plain(c));
    if (cells.every((c) => /^-+$/.test(c))) continue;
    if (!header) {
      header = cells;
      continue;
    }
    out.push(`${cells[0]} — ${cells[1]} (${header[2]}: ${cells[2]}; ${header[3]}: ${cells[3]})`);
  }
  if (!header || header.length !== 4) throw new Error('guide: the daily template table is not four columns');
  return out.join('\n');
}

function parseGuide(text) {
  const template = flattenTemplate(guideSection(text, 'The daily template'));
  const quickWin = plain(guideSection(text, 'Quick win'));
  const applying = guideSection(text, 'Applying the routine to each lesson type');
  const bullets = applying.split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
  const types = {};
  for (const [type, heading] of Object.entries(GUIDE_TYPE_HEADINGS)) {
    const hits = bullets.filter((b) => b.startsWith(`**${heading}`));
    if (hits.length !== 1) throw new Error(`guide: expected one "${heading}" paragraph, found ${hits.length}`);
    types[type] = hits[0];
  }
  return { template, quickWin, types };
}

// --- the scan ----------------------------------------------------------------

function scan(root, mediaPath) {
  const entries = fs
    .readdirSync(root)
    .filter((n) => !n.startsWith('.') && n !== '@eaDir')
    // THE NAS SERVES NFC. Every name becomes NFC before it can become a path.
    .map((n) => n.normalize('NFC'));

  const videos = new Map();
  const pdfs = [];
  const mds = [];
  const unknown = [];
  for (const n of entries) {
    const v = n.match(/^(\d{3}) - (.+)\.mp4$/);
    if (v) {
      const num = Number(v[1]);
      if (videos.has(num)) throw new Error(`disk: two videos for lesson ${v[1]}`);
      videos.set(num, { file: n, title: collapse(v[2]) });
    } else if (n.endsWith('.pdf')) pdfs.push(n);
    else if (n.endsWith('.md')) mds.push(n);
    else unknown.push(n);
  }
  if (unknown.length) throw new Error(`disk: unexpected entries ${JSON.stringify(unknown)}`);
  if (mds.length !== 2 || !mds.includes(INDEX_FILE) || !mds.includes(GUIDE_FILE)) {
    throw new Error(`disk: expected exactly the index and the guide, found ${JSON.stringify(mds)}`);
  }

  const index = parseIndex(fs.readFileSync(path.join(root, INDEX_FILE), 'utf8').normalize('NFC'));
  const guide = parseGuide(fs.readFileSync(path.join(root, GUIDE_FILE), 'utf8').normalize('NFC'));

  // The index's declared total, the lessons it lists and the files on disk agree.
  const listed = index.sections.flatMap((s) => s.lessons);
  if (index.declared !== 259 || listed.length !== index.declared || videos.size !== index.declared) {
    throw new Error(`count: declared ${index.declared}, listed ${listed.length}, on disk ${videos.size}; expected 259`);
  }
  const seen = new Set();
  for (const l of listed) {
    if (seen.has(l.number)) throw new Error(`index: lesson ${pad3(l.number)} listed twice`);
    seen.add(l.number);
    const v = videos.get(l.number);
    if (!v) throw new Error(`disk: no video for lesson ${pad3(l.number)}`);
    if (v.title !== l.title) throw new Error(`title: ${pad3(l.number)} file ${JSON.stringify(v.title)} ≠ index ${JSON.stringify(l.title)}`);
  }
  for (let n = 1; n <= 259; n++) if (!seen.has(n)) throw new Error(`index: lesson ${pad3(n)} missing`);

  // Sections 1–106, contiguous, each section's lessons contiguous and in order.
  if (index.sections.length !== 106) throw new Error(`index: ${index.sections.length} sections, expected 106`);
  let expectLesson = 1;
  index.sections.forEach((s, i) => {
    if (s.number !== i + 1) throw new Error(`index: section ${s.number} out of order at position ${i + 1}`);
    if (!s.lessons.length) throw new Error(`index: section ${s.number} lists no lesson`);
    for (const l of s.lessons) {
      if (l.number !== expectLesson) throw new Error(`index: section ${s.number} lesson ${pad3(l.number)} out of order`);
      expectLesson++;
    }
  });

  // Exactly the four listed score books, and nothing else.
  const books = index.books;
  if (books.length !== 4 || pdfs.length !== 4 || !books.every((b) => pdfs.includes(b))) {
    throw new Error(`books: index ${JSON.stringify(books)} vs disk ${JSON.stringify(pdfs)}`);
  }
  const bookNumbered = (n) => {
    const hits = books.filter((b) => b.startsWith(`نت ${faNum(n)} - `));
    if (hits.length !== 1) throw new Error(`books: no single book numbered ${n}`);
    return hits[0];
  };

  // The stage table partitions 1–106 into contiguous runs.
  let expectSection = 1;
  for (const st of STAGES) {
    if (st.from !== expectSection || st.to < st.from) throw new Error(`stages: ${st.key} does not continue at ${expectSection}`);
    if (st.key !== `s${pad3(st.from)}-s${pad3(st.to)}`) throw new Error(`stages: key ${st.key} does not name its run`);
    expectSection = st.to + 1;
  }
  if (expectSection !== 107) throw new Error('stages: the runs do not end at section 106');

  // The work table: literal anchored keys, every lesson real and in one work.
  const workOfLesson = new Map();
  const workKeys = new Set();
  for (const w of WORKS) {
    if (workKeys.has(w.key)) throw new Error(`works: duplicate key ${w.key}`);
    workKeys.add(w.key);
    if (!/^w\d{3}$/.test(w.key)) throw new Error(`works: key ${w.key} is not w + a lesson number`);
    if (!w.lessons.includes(Number(w.key.slice(1)))) throw new Error(`works: ${w.key} does not teach its own anchor lesson`);
    if (!GUIDE_TYPE_HEADINGS[w.type] || w.type === 'technique' || w.type === 'etude') throw new Error(`works: ${w.key} has type ${w.type}`);
    for (const n of w.lessons) {
      if (!seen.has(n)) throw new Error(`works: ${w.key} names lesson ${n}, which does not exist`);
      if (workOfLesson.has(n)) throw new Error(`works: lesson ${n} is in ${workOfLesson.get(n).key} and ${w.key}`);
      workOfLesson.set(n, w);
    }
  }
  for (const k of Object.keys(SECTION_TYPE_OVERRIDES)) {
    if (!/^s\d{3}$/.test(k)) throw new Error(`overrides: ${k} is not a section key`);
  }

  const stageOfSection = (n) => STAGES.find((s) => n >= s.from && n <= s.to);
  const bookFor = (stage, type) => {
    if (stage.band === 1) return bookNumbered(1);
    if (stage.band === 2) return bookNumbered(2);
    if (type === 'radif') return bookNumbered(3);
    if (type === 'rhythmic' || type === 'composed') return bookNumbered(4);
    throw new Error(`books: a ${type} entry in تار ۳ has no band book`);
  };
  const fileFor = (rel) => `${mediaPath}/${rel}`;
  const videoFile = (n) => ({ path: fileFor(videos.get(n).file), kind: 'video', title: index.sections.flatMap((s) => s.lessons).find((l) => l.number === n).title });
  const bookFile = (b) => ({ path: fileFor(b), kind: 'pdf', title: b.replace(/\.pdf$/, '') });

  /** A section not wholly one work: Honarestān-درس majority → etude, else technique. */
  function sectionType(key, lessons) {
    if (SECTION_TYPE_OVERRIDES[key]) return SECTION_TYPE_OVERRIDES[key];
    const own = lessons.filter((l) => !workOfLesson.has(l.number));
    // Every lesson teaches a work, but not ONE work (section 43 teaches two):
    // it is still no work itself, and it carries its first work's guidance.
    if (!own.length) return workOfLesson.get(lessons[0].number).type;
    const etudes = own.filter((l) => HONARESTAN_LESSON.test(l.title)).length;
    return etudes * 2 > own.length ? 'etude' : 'technique';
  }

  const groups = STAGES.map((st) => ({
    key: st.key,
    code: `جلسه ${faNum(st.from)}–${faNum(st.to)}`,
    title: st.title,
    group: BANDS[st.band],
    mediaPath,
    units: [],
    works: [],
    routine: [],
  }));
  const groupOf = (st) => groups[STAGES.indexOf(st)];

  // Sections → units. A section ALL of whose lessons belong to one work IS that
  // work; any other section is practice material and never a repertoire piece.
  const mixedLessonsOf = new Map();
  for (const s of index.sections) {
    const key = `s${pad3(s.number)}`;
    const stage = stageOfSection(s.number);
    const owners = new Set(s.lessons.map((l) => workOfLesson.get(l.number)));
    const whole = owners.size === 1 && [...owners][0] ? [...owners][0] : undefined;
    const type = whole ? whole.type : sectionType(key, s.lessons);
    const unit = {
      key,
      title: s.title,
      strand: strandFor(type, !!whole),
      ...(whole ? { workKey: whole.key, workTitle: whole.title } : {}),
      mediaPath,
      files: [...s.lessons.map((l) => videoFile(l.number)), bookFile(bookFor(stage, type))],
      guidance: guide.types[type],
    };
    groupOf(stage).units.push(unit);
    if (!whole) {
      for (const l of s.lessons) {
        const w = workOfLesson.get(l.number);
        if (!w) continue;
        if (!mixedLessonsOf.has(w)) mixedLessonsOf.set(w, []);
        mixedLessonsOf.get(w).push({ lesson: l.number, section: s.number, sectionType: type });
      }
    }
  }

  // Works taught in lessons of a mixed section → their own row, in the stage of
  // their first such lesson, carrying exactly those lessons' videos.
  for (const w of WORKS) {
    const taught = mixedLessonsOf.get(w);
    if (!taught) continue;
    const stage = stageOfSection(taught[0].section);
    if (taught.some((t) => stageOfSection(t.section) !== stage)) throw new Error(`works: ${w.key} crosses a stage boundary`);
    groupOf(stage).works.push({
      key: w.key,
      title: w.title,
      strand: strandFor(w.type, true),
      files: [...taught.map((t) => videoFile(t.lesson)), bookFile(bookFor(stage, w.type))],
      guidance: guide.types[w.type],
    });
  }

  // Every multi-section work stays inside one stage, and every work is emitted.
  for (const w of WORKS) {
    const sections = index.sections.filter((s) => s.lessons.some((l) => w.lessons.includes(l.number)));
    const stages = new Set(sections.map((s) => stageOfSection(s.number)));
    if (stages.size !== 1) throw new Error(`works: ${w.key} crosses a stage boundary`);
    const asUnit = groups.some((g) => g.units.some((u) => u.workKey === w.key));
    const asRow = groups.some((g) => g.works.some((r) => r.key === w.key));
    if (!asUnit && !asRow) throw new Error(`works: ${w.key} reached no entry`);
  }

  // Every work row's files are files some section already carries.
  const sectionPaths = new Set(groups.flatMap((g) => g.units.flatMap((u) => u.files.map((f) => f.path))));
  for (const g of groups) for (const r of g.works) for (const f of r.files) {
    if (!sectionPaths.has(f.path)) throw new Error(`works: ${r.key} carries ${f.path}, which no section carries`);
  }

  return {
    index,
    guide,
    groups,
    diagnostics: [...OPEN_QUESTIONS],
  };
}

// --- emitting ----------------------------------------------------------------

const j = (v) => JSON.stringify(v);

function emit(course, guide, pathway) {
  const lines = [];
  lines.push('// GENERATED BY scripts/scan-khonyagar-course.mjs — DO NOT EDIT BY HAND.');
  lines.push('//');
  lines.push('// A course change is answered by re-running the scanner and committing the new');
  lines.push('// data, never by editing this file. Reference data in code: nothing here is');
  lines.push('// persisted. Every path is the real filename NFC-normalised, the form the NAS');
  lines.push('// serves.');
  lines.push('//');
  lines.push(`// Scanned ${course.groups.length} stage(s), ${course.groups.reduce((n, g) => n + g.units.length, 0)} section(s), ${course.groups.reduce((n, g) => n + g.works.length, 0)} work row(s).`);
  lines.push('');
  lines.push("import type { CourseData } from './courseSeed';");
  lines.push('');
  lines.push('/** The course guide, quoted as written: the pathway carries its template and Quick Win. */');
  lines.push('export const KHONYAGAR_PATHWAY = {');
  lines.push(`  name: ${j(pathway.name)},`);
  lines.push(`  description: ${j(pathway.description)},`);
  lines.push(`  note: ${j(pathway.note)},`);
  lines.push('};');
  lines.push('');
  lines.push('/** The guide\'s own paragraph for each lesson type, quoted as written. */');
  lines.push(`export const KHONYAGAR_LESSON_TYPES: Record<string, string> = ${j(guide.types)};`);
  lines.push('');
  lines.push('export const KHONYAGAR_COURSE: CourseData = {');
  lines.push(`  id: ${j(course.id)},`);
  lines.push(`  pathwayId: ${j(course.pathwayId)},`);
  lines.push(`  name: ${j(course.name)},`);
  lines.push(`  sourceName: ${j(course.sourceName)},`);
  lines.push(`  mediaPath: ${j(course.mediaPath)},`);
  lines.push('  diagnostics: [');
  for (const d of course.diagnostics) lines.push(`    ${j(d)},`);
  lines.push('  ],');
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
    lines.push('      routine: [],');
    lines.push('    },');
  }
  lines.push('  ],');
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

// --- main --------------------------------------------------------------------

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function main() {
  const root = arg('root', DEFAULT_ROOT);
  const mediaPath = arg('media-path', DEFAULT_MEDIA_PATH).normalize('NFC');
  const out = arg('out', DEFAULT_OUT);
  const write = process.argv.includes('--write');

  const { index, guide, groups, diagnostics } = scan(root, mediaPath);
  const course = {
    id: 'khonyagar',
    pathwayId: 'tar-khonyagar',
    name: index.name,
    sourceName: 'خنیاگر',
    mediaPath,
    diagnostics,
    groups,
  };
  const pathway = {
    name: index.name,
    description: index.description,
    note: `The course's daily template (${GUIDE_FILE.replace(/\.md$/, '')}):\n${guide.template}\n\nQuick win: ${guide.quickWin}`,
  };
  const text = emit(course, guide, pathway);

  for (const d of diagnostics) console.error(`  ? ${d}`);
  console.error(
    `\n${groups.length} stage(s), ${groups.reduce((n, g) => n + g.units.length, 0)} section(s), ` +
      `${groups.reduce((n, g) => n + g.units.filter((u) => u.workKey).length, 0)} section(s) that are works, ` +
      `${groups.reduce((n, g) => n + g.works.length, 0)} work row(s), ${WORKS.length} work(s), ${diagnostics.length} open question(s).`,
  );
  if (!write) {
    console.error(`DRY RUN — pass --write to update ${out} (${(text.length / 1024).toFixed(0)} KB).`);
    return;
  }
  fs.writeFileSync(out, text);
  console.error(`Wrote ${out} (${(text.length / 1024).toFixed(0)} KB).`);
}

main();
