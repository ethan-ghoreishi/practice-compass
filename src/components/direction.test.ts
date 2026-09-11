import { describe, expect, it } from 'vitest';

/**
 * Layout follows the direction of the content it shows.
 *
 * A title and the details that belong to it sit in ONE group that carries
 * `dir="auto"`, so a Persian item reads as one right-aligned block instead of
 * splitting across the card — the title hugging one edge while its own caption
 * hugs the other. Direction is resolved natively by the browser from the first
 * strong character; nothing here detects or reorders text in JavaScript.
 *
 * The completion boundary is mechanical, not a matter of care. After this lane
 * `dir="auto"` appears on GROUPS and on free-text FIELDS — never bare on a
 * title element. This test asserts BOTH halves, so a missed title fails and a
 * whole skipped file fails; "fixing" a file by DELETING the attribute fails
 * too, which is important because that would break Farsi rendering outright.
 *
 * jsdom cannot evaluate any of this — it resolves no `dir=auto` and computes no
 * `text-align` — so this reads the source instead, and the owner's device check
 * (ac-6) is what proves the rendering. This test proves COMPLETENESS.
 */

/**
 * Every page and shared component, as source text. Read through Vite's raw
 * loader rather than node:fs: `src` is compiled without node types, and a glob
 * means a NEW file is swept in automatically rather than needing to be
 * remembered.
 */
const under = (dir: string, modules: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(modules).map(([path, source]) => [`${dir}/${path.split('/').pop()}`, source as string]),
  );

const SOURCES: Record<string, string> = {
  ...under('pages', import.meta.glob('../pages/*.tsx', { query: '?raw', import: 'default', eager: true })),
  ...under('components', import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true })),
};

/** Classes that mark an element as a TITLE — direction may not sit on these. */
const TITLE_CLASSES = ['truncate', 'title-md', 'page-title', 'stage-unit-title'];

/** Native controls own their own text; direction on them is a FIELD, not a group. */
const FIELD_TAGS = ['input', 'textarea', 'select'];

/**
 * Every surface that renders user-authored text and must therefore carry
 * direction on at least one group. Recorded here (and in AGENTS.md) so the next
 * lane inherits the list rather than re-deriving it.
 */
const SURFACES = [
  'pages/Today.tsx',
  'pages/StartBlock.tsx',
  'pages/ActiveBlock.tsx',
  'pages/CloseBlock.tsx',
  'pages/Repertoire.tsx',
  'pages/ItemDetail.tsx',
  'pages/Lessons.tsx',
  'pages/PathwayDetail.tsx',
  'pages/StageDetail.tsx',
  'pages/SessionPlan.tsx',
  'pages/RoutineRunner.tsx',
  'pages/Materials.tsx',
  'pages/Insights.tsx',
  'pages/TeacherReport.tsx',
  'components/ItemCard.tsx',
  'components/ItemMaterial.tsx',
  'components/ClassQuestions.tsx',
  'components/Attachments.tsx',
];

/**
 * Titles that genuinely have no group to join, listed so the exception is
 * VISIBLE to a reviewer rather than silently left behind. Each entry must still
 * match a real site — a stale entry fails the test below.
 */
const ALLOWED_TITLE_SITES: { file: string; snippet: string; why: string }[] = [
  // EMPTY, and that is the finding: every title on every surface turned out to
  // have a group it could join — the catalogue row's own text column, the row a
  // lone title shares with its badge, or a wrapper drawn around the title and
  // the caption beneath it. An entry here would be a title the sweep could not
  // reach; the list is kept (and asserted below) so the next one is visible
  // rather than silent.
];

// --- reading the source -----------------------------------------------------

function sourceFiles(): string[] {
  return Object.keys(SOURCES).sort();
}

interface Site {
  file: string;
  line: number;
  tagName: string;
  classValue: string;
  text: string;
}

/** The opening tag that an index sits inside, brace- and quote-aware. */
function enclosingTag(src: string, at: number): string {
  const start = src.lastIndexOf('<', at);
  let depth = 0;
  let i = start + 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '"' || c === "'") {
      const end = src.indexOf(c, i + 1);
      if (end < 0) break;
      i = end;
    } else if (c === '>' && depth === 0) break;
    i += 1;
  }
  return src.slice(start, i + 1);
}

/** The raw text of a tag's className attribute (string or expression). */
function classNameOf(tag: string): string {
  const at = tag.indexOf('className=');
  if (at < 0) return '';
  const from = at + 'className='.length;
  const opener = tag[from];
  if (opener === '"' || opener === "'") {
    const end = tag.indexOf(opener, from + 1);
    return end < 0 ? tag.slice(from + 1) : tag.slice(from + 1, end);
  }
  if (opener !== '{') return '';
  let depth = 0;
  for (let i = from; i < tag.length; i += 1) {
    if (tag[i] === '{') depth += 1;
    else if (tag[i] === '}') {
      depth -= 1;
      if (depth === 0) return tag.slice(from + 1, i);
    }
  }
  return tag.slice(from + 1);
}

function directionSites(file: string): Site[] {
  const src = SOURCES[file];
  const sites: Site[] = [];
  for (const match of src.matchAll(/dir="auto"/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tagName: (/^<\s*([A-Za-z][\w.]*)/.exec(tag)?.[1] ?? '').toLowerCase(),
      classValue: classNameOf(tag),
      text: tag,
    });
  }
  return sites;
}

const isTitle = (site: Site) => TITLE_CLASSES.some((c) => new RegExp(`\\b${c}\\b`).test(site.classValue));
const isField = (site: Site) => FIELD_TAGS.includes(site.tagName);
const isGroup = (site: Site) => !isTitle(site) && !isField(site);

const allowed = (site: Site) =>
  ALLOWED_TITLE_SITES.some((e) => e.file === site.file && site.text.includes(e.snippet));

// --- the check --------------------------------------------------------------

describe('direction lives on the group', () => {
  it('direction lives on the group: no title element carries dir="auto", and every listed surface has one', () => {
    const all = sourceFiles().flatMap(directionSites);

    // (a) A title that still carries direction is a site the sweep missed: its
    //     own caption still aligns to the opposite edge.
    const onTitles = all
      .filter((s) => isTitle(s) && !allowed(s))
      .map((s) => `${s.file}:${s.line} — dir="auto" on a title (class "${s.classValue.trim()}")`);
    expect(onTitles).toEqual([]);

    // (b) A surface with no group at all is a whole file the sweep skipped —
    //     and deleting the attribute instead of moving it fails here too.
    const withoutGroup = SURFACES.filter(
      (file) => !all.some((s) => s.file === file && isGroup(s)),
    ).map((file) => `${file} — renders user text but carries direction on no group`);
    expect(withoutGroup).toEqual([]);
  });

  it('keeps every listed exception real, so the allowlist cannot rot', () => {
    const all = sourceFiles().flatMap(directionSites);
    for (const entry of ALLOWED_TITLE_SITES) {
      const hit = all.some((s) => s.file === entry.file && s.text.includes(entry.snippet) && isTitle(s));
      expect(hit, `allowlisted exception no longer exists: ${entry.file} (${entry.snippet})`).toBe(true);
    }
  });
});
