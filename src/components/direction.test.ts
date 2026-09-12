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

/**
 * Genuine exceptions to `unexemptedPhrase`'s 2+-token rule, visible for the
 * same reason `ALLOWED_TITLE_SITES` is: a stale entry (its `tagSnippet` no
 * longer found on the named group) fails the test below, so an exception
 * can't quietly outlive the code it was written for. Both entries here are
 * TWO+ opaque data expressions that read as a single compound VALUE, not a
 * title split from a foreign caption — the shape this whole family exists to
 * catch:
 * - `{sp.done}/{sp.total}` (PathwayDetail's stage progress) is a numeric
 *   counter ("3/5") — digits carry no bidi risk on their own, unlike an
 *   English WORD dropped into an RTL run.
 * - `` `${pathway.name} — ` `` followed by `{stage.code}` (ItemDetail's
 *   breadcrumb) is one continuous "Pathway — Stage" label built from two
 *   fields, exactly the same kind of compound anchor a lone title already
 *   forms with the badge it sits next to elsewhere in this file — there is
 *   no separate "caption" here to have its own opinion about direction.
 */
const UNEXEMPTED_PHRASE_ALLOWLIST: { file: string; tagSnippet: string; why: string }[] = [
  {
    file: 'pages/PathwayDetail.tsx',
    tagSnippet: '<button className="grow" dir="auto"',
    why: '{sp.done}/{sp.total} is a numeric progress counter, not English words',
  },
  {
    file: 'pages/ItemDetail.tsx',
    tagSnippet: 'stage.pathwayId',
    why: 'pathway name + stage code is one compound breadcrumb label, not a title plus a foreign caption',
  },
];

/**
 * Every group-level `dir="auto"` site, recorded in source order — duplicates
 * included, because three bare `<div dir="auto">` in the same file (Today.tsx
 * has several) are three separate SITES, not one collapsed entry. This is
 * what "every listed surface has A group" (below) cannot see: a file keeps
 * passing that check as long as ONE of its groups survives, so deleting the
 * Practise-now card's own `dir="auto"` — the exact regression a rejected
 * review found — left Today.tsx's other, unrelated groups to vouch for it.
 * Comparing the WHOLE ordered inventory instead means removing any one of
 * these sites — anywhere in any file — shrinks or reorders the array and
 * fails here, whether or not that file has other groups left.
 *
 * Same visibility contract as ALLOWED_TITLE_SITES: this is a recorded ledger,
 * not a derivation, so a legitimate new group site must be added here (the
 * "keeps every recorded group site current" test below fails until it is),
 * exactly as a title exception must be added to the allowlist above.
 */
const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string }[] = [
  { file: 'components/Attachments.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'components/ClassQuestions.tsx', tagName: 'li', classValue: '' },
  { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'small' },
  { file: 'components/ClassQuestions.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ClassQuestions.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'components/ItemCard.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'stack-sm' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/CloseBlock.tsx', tagName: 'div', classValue: 'stack-sm' },
  { file: 'pages/Insights.tsx', tagName: 'th', classValue: 'dim' },
  { file: 'pages/Insights.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'list-row card-link' },
  { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: 'list-row' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'link' },
  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: 'dim' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'link' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'tiny dim' },
  { file: 'pages/Lessons.tsx', tagName: 'link', classValue: 'grow' },
  { file: 'pages/Materials.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Materials.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'p', classValue: 'page-sub' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'card card-quiet small dim' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Repertoire.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Repertoire.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'link', classValue: 'row between small card-link' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'tiny faint' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/StageDetail.tsx', tagName: 'div', classValue: 'card card-quiet row between small' },
  { file: 'pages/StageDetail.tsx', tagName: 'button', classValue: 'stage-unit-text' },
  { file: 'pages/StageDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/StartBlock.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/TeacherReport.tsx', tagName: 'pre', classValue: 'pre' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'link', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'link', classValue: 'list-row card-link' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: 'grow' },
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
  at: number;
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

/**
 * Blank out `//` and `/* *\/` comments before scanning — a prose comment that
 * mentions `dir="auto"` (this file is full of them, and rightly so) is not an
 * attribute, and matching it anyway produces a phantom site: at best one with
 * no enclosing tag, at worst `enclosingTag` walking backward out of the
 * comment and mis-picking an unrelated real tag from earlier in the file.
 * String and template literals are copied through verbatim — that is where a
 * REAL `dir="auto"` attribute value lives — and every character removed is
 * replaced with a space (newlines kept as newlines) so line numbers and
 * offsets into the rest of the source are unaffected.
 *
 * A `'`/`"` is treated as a real string delimiter only if its MATCHING quote
 * shows up before the next newline. A genuine JS string/JSX attribute value
 * in this codebase is always single-line, so this is a safe bound — and it
 * is a NECESSARY one: plain JSX text containing an apostrophe ("That stage
 * doesn't exist.") is not a string at all, and treating it as one made the
 * scanner consume every real comment and tag after it — including this
 * file's OWN prose, once a comment happened to quote `dir="ltr"` inside that
 * unterminated span — as literal, unstripped text. A backtick template
 * literal has no such single-line guarantee in general (this codebase's
 * few multi-line ones are template literals), so it keeps the unbounded
 * scan.
 */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const two = src.slice(i, i + 2);
    if (two === '//') {
      while (i < src.length && src[i] !== '\n') {
        out += ' ';
        i += 1;
      }
    } else if (two === '/*') {
      out += '  ';
      i += 2;
      while (i < src.length && src.slice(i, i + 2) !== '*/') {
        out += src[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      out += '  ';
      i += 2;
    } else if (src[i] === '"' || src[i] === "'") {
      const quote = src[i];
      const lineEnd = src.indexOf('\n', i + 1);
      const searchEnd = lineEnd < 0 ? src.length : lineEnd;
      const close = src.indexOf(quote, i + 1);
      if (close < 0 || close > searchEnd) {
        // No same-line match — an apostrophe/quote in plain text, not a
        // real string. Pass it through and keep scanning normally right
        // after it, so a later quote on the same or a later line gets its
        // own fresh (and likely correct) chance to pair up.
        out += src[i];
        i += 1;
        continue;
      }
      out += quote;
      i += 1;
      while (i < close) {
        if (src[i] === '\\' && i + 1 < close) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      out += src[i];
      i += 1;
    } else if (src[i] === '`') {
      const quote = src[i];
      out += quote;
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < src.length) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      if (i < src.length) {
        out += src[i];
        i += 1;
      }
    } else {
      out += src[i];
      i += 1;
    }
  }
  return out;
}

function directionSites(file: string): Site[] {
  const src = stripComments(SOURCES[file]);
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
      at,
    });
  }
  return sites;
}

const isTitle = (site: Site) => TITLE_CLASSES.some((c) => new RegExp(`\\b${c}\\b`).test(site.classValue));
const isField = (site: Site) => FIELD_TAGS.includes(site.tagName);
const isGroup = (site: Site) => !isTitle(site) && !isField(site);

const allowed = (site: Site) =>
  ALLOWED_TITLE_SITES.some((e) => e.file === site.file && site.text.includes(e.snippet));

// --- mixed-content groups: a child's OWN bidi base, not just the group's ---
//
// A rejected review found that the inventory above proves a GROUP carries
// direction, but nothing proved that a fixed English sentence or an
// independently-authored value sitting INSIDE that group has a bidi base of
// its own. A Farsi title makes the whole group resolve RTL; anything else in
// that subtree with no `dir` of its own is exposed to that same RTL base —
// which is exactly right for a caption that belongs to the title (that is
// the whole point of grouping), but wrong for fixed page copy or a separately
// authored value that could be a different script entirely.
//
// This can't be reduced to "no bare Latin text in a group": a short fixed
// label immediately followed by its own isolate — `Constraint: ` before
// `<span dir="auto">{value}</span>`, the established shape ActiveBlock set —
// is deliberately left bare, and flagging it would force changes to an
// already-correct, already-reviewed pattern. What actually breaks is a real
// PHRASE (2+ words) that reaches the end of the group with nothing to isolate
// it: `unexemptedPhrase` walks a group's body in source order, accumulating
// exposed literal text (skipping `{…}` expressions, whose content is opaque
// from source) into a run, and clears that run the moment it is immediately
// followed by an element carrying its own `dir=` — the run is exempted
// regardless of length, because whatever risk existed is now the isolate's
// to own. Only a run that survives to the end of the group's body, and that
// reads as a real phrase, is flagged.

/**
 * The element's body span: from just after its own opening tag's `>` to just
 * after its matching closing tag (empty for a self-closing tag). Depth
 * tracking is generic — any opened tag increases it, any closed tag
 * decreases it — since well-formed JSX nests properly regardless of name.
 *
 * A React Fragment shorthand (`<>…</>`) is EVERY bit as much an opening/
 * closing pair as a named tag, and must be counted as one: `</>` starts with
 * `/` so the CLOSING branch below already matched it (correctly decrementing
 * depth), but `<>` starts with neither `/` nor a letter, so it fell through
 * unmatched and never incremented depth. Every `<>…</>` pair inside a body
 * therefore decremented depth ONE MORE TIME than it was ever incremented —
 * on a group whose conditional content used a fragment (`{cond && (<>…
 * </>)}`, the shape `{stage && (<><span>…</span><Link>…</Link></>)}` already
 * uses in this codebase), depth hit zero several tags before the group's
 * REAL close, silently truncating the body `unexemptedPhrase` scans and
 * hiding every violation after that point — exactly the kind of gap a
 * "detectable, not enumerated" claim must not have.
 */
function elementBody(src: string, tag: string, openAt: number): { start: number; end: number } {
  const start = openAt + tag.length;
  if (tag.endsWith('/>')) return { start, end: start };
  let depth = 1;
  let i = start;
  while (i < src.length && depth > 0) {
    if (src[i] === '<') {
      if (src[i + 1] === '/') {
        const close = src.indexOf('>', i);
        i = close < 0 ? src.length : close + 1;
        depth -= 1;
        continue;
      }
      if (src[i + 1] === '>') {
        // Fragment shorthand open, <>. Its close, </>, is matched by the
        // ordinary closing-tag branch above, so this one must increment.
        i += 2;
        depth += 1;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const inner = enclosingTag(src, i);
        i += inner.length;
        if (!inner.endsWith('/>')) depth += 1;
        continue;
      }
    }
    i += 1;
  }
  return { start, end: i };
}

/**
 * The first exposed, unexempted 2+-token run in a group's body, or null when
 * everything either belongs to an isolate or never accumulates a real phrase.
 * See the block comment above for what "exempted" means.
 *
 * A DATA expression (`{item.title}`, `{ITEM_TYPE_LABELS[item.itemType]}`,
 * `{formatBytes(a.size)}`) counts as ONE opaque token — its actual rendered
 * text is invisible from source, but its mere PRESENCE, unisolated, next to
 * other content is exactly the shape a rejected review found live in the
 * app: `{MATERIAL_SOURCE_LABELS[...]} · {MATERIAL_STATUS_LABELS[...]} ·{' '}
 * {itemCount(...)} item{...}` reads as zero words to a scanner that only
 * counts literal text, yet renders three always-English fragments in a row.
 * Treating each such expression as a token turns that invisible run into a
 * 3+-token hit without ever needing to know what the labels actually say.
 * An expression that contains its own nested JSX (`{cond && <div dir="auto">
 * …</div>}`) is left fully opaque (zero contribution) as before — its
 * children are independent elements, already reachable by the outer scan
 * over the whole file, and forcing them through this same linear buffer
 * would require a real JSX parser this file deliberately doesn't have.
 */
function unexemptedPhrase(src: string, bodyStart: number, bodyEnd: number): string | null {
  let buffer = '';
  // A run is judged at each TAG boundary (open or close) — two adjacent but
  // unrelated elements (e.g. two one-word buttons, "Edit" and "Delete") must
  // never concatenate into a false 2-word phrase. An EXPRESSION boundary does
  // NOT judge the run: `{n} segments · {m} min` is one generated phrase split
  // across two expressions, and judging at each `{` would fragment it into
  // single, individually-innocent words, hiding the real violation.
  const flush = (): string | null => {
    const words = buffer.trim().match(/[A-Za-z]+/g) ?? [];
    buffer = '';
    return words.length >= 2 ? words.join(' ') : null;
  };
  let i = bodyStart;
  while (i < bodyEnd) {
    const c = src[i];
    if (c === '{') {
      const exprStart = i + 1;
      let depth = 1;
      i += 1;
      while (i < bodyEnd && depth > 0) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') depth -= 1;
        i += 1;
      }
      const exprText = src.slice(exprStart, i - 1);
      if (!/<[A-Za-z]/.test(exprText)) buffer += ' X ';
      continue;
    }
    if (c === '<') {
      if (src[i + 1] === '/') {
        const hit = flush();
        if (hit) return hit;
        const close = src.indexOf('>', i);
        i = close < 0 ? bodyEnd : close + 1;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const hit = flush();
        if (hit) return hit;
        const tag = enclosingTag(src, i);
        if (/\sdir="(auto|ltr|rtl)"/.test(tag)) {
          const body = elementBody(src, tag, i);
          i = body.end; // exempted: leads into its own isolate, whatever its length
        } else {
          i += tag.length; // transparent: its children are scanned in the same pass
        }
        continue;
      }
    }
    buffer += c;
    i += 1;
  }
  return flush();
}

/**
 * Independently-authored values (case ii: a question, a note, an observation
 * — content whose own language cannot be assumed from the title next to it)
 * that carry their own `dir=` isolate, so they resolve from their OWN content
 * rather than the group's. Unlike the fixed-copy phrases above, these are
 * plain expressions (`{q.currentProblem}`, `{pathway.note}`) — their value is
 * opaque from source, so completeness here is a recorded ledger, not a
 * derivation, exactly like ALLOWED_TITLE_SITES and GROUP_SITE_INVENTORY: a
 * legitimate new one must be added, visibly, rather than left silent.
 */
const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{active.constraint}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{previousNextAction}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{problem}</span>' },
  { file: 'components/ClassQuestions.tsx', snippet: '<div className="small" dir="auto">' },
  { file: 'components/ClassQuestions.tsx', snippet: '<span dir="auto">{q.currentProblem}</span>' },
  { file: 'components/ClassQuestions.tsx', snippet: '<span dir="auto">{q.lastObservation}</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<p className="page-sub" dir="auto">' },
  { file: 'pages/PathwayDetail.tsx', snippet: 'card-quiet small dim" dir="auto" style={{ marginTop: 4 }}' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="auto">{pathway.source}</span>' },
  { file: 'pages/RoutineRunner.tsx', snippet: '<div className="tiny faint" dir="auto">' },
  { file: 'pages/RoutineRunner.tsx', snippet: 'Next: <span dir="auto">{next.label}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.form}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.composer}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.gusheh}</span>' },
  // Instrument names are the OWNER'S OWN editable text (renameable in
  // Settings, Farsi included), never generated copy — a sealed review found
  // four sites forcing them to dir="ltr" as if they were generated metadata,
  // and this file's own audit of every remaining LTR_ISOLATE_SITES entry
  // found a fifth (Today.tsx's "routine running" row) with the identical
  // defect. All five now isolate the instrument name on its own dir="auto".
  { file: 'components/ItemCard.tsx', snippet: '<span dir="auto">{inst}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="auto">{instrumentName(db, item.instrumentId)}</span>' },
  {
    file: 'pages/PathwayDetail.tsx',
    snippet: "<span dir=\"auto\">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>",
  },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{instrumentName(db, work.instrumentId)}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{instrumentName(db, running?.instrumentId)}</span>' },
];

/**
 * Fixed English copy or generated metadata (case i: `buildReason`,
 * `relativeDay`, a hardcoded sentence) that is ALWAYS English by
 * construction, wrapped in its own `dir="ltr"` isolate so a Farsi title's RTL
 * base can't drag its trailing punctuation to the visual start. Recorded for
 * the same reason as ISOLATED_VALUE_SITES: a call like `StaleNote` renders
 * from a different function than its call site, so no source scan at the
 * call site can see whether its OWN return value is isolated.
 */
const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{recs.best.reason}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{rec.reason}</span>' },
  { file: 'pages/Today.tsx', snippet: 'due <span dir="ltr">{relativeDay(r.dueDate, now)}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">Running far past its target' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> routine running ▸</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
  {
    file: 'pages/Today.tsx',
    snippet: '<span dir="ltr">\n                        {recs.best ? `next: ${recs.best.score.item.title}`',
  },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{next.reason}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">Study source: </span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">\n                  {a.kind} · {formatBytes(a.size)}' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">difficulty {item.difficulty}/5</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny warn-flag" dir="ltr">saturated — consider resting</span>' },
  { file: 'pages/SessionPlan.tsx', snippet: '<span dir="ltr">{seg.reason}</span>' },
  { file: 'pages/CloseBlock.tsx', snippet: '<span dir="ltr">A few seconds to capture what happened.</span>' },
  { file: 'pages/StageDetail.tsx', snippet: '<span className="truncate" dir="ltr">' },
  { file: 'pages/StageDetail.tsx', snippet: '{routine.segments.length} segments · {total} min{bound' },
  { file: 'pages/StageDetail.tsx', snippet: '<span dir="ltr">{meta.join(\' · \')}</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: "<span className=\"badge tone-progress\" dir=\"ltr\">{isPinned ? 'Current · pinned' : 'Current'}</span>" },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span className="badge tone-good" dir="ltr">Done</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">{sp.addedItems} item{sp.addedItems' },
  { file: 'pages/PathwayDetail.tsx', snippet: "<span dir=\"ltr\">{sp.total} piece{sp.total === 1 ? '' : 's'}</span>" },
  { file: 'pages/Lessons.tsx', snippet: '<span className="badge tone-progress" dir="ltr">' },
  { file: 'pages/Lessons.tsx', snippet: '<span className="tiny faint" dir="ltr">no class planned</span>' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">{meta}</span>' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">\n                    Set your NAS base URL in' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">\n                    Your NAS base URL isn’t a valid web address' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
  { file: 'pages/RoutineRunner.tsx', snippet: '<span className="tiny faint" dir="ltr">{minutes} min</span>' },
  { file: 'pages/StartBlock.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'pages/Insights.tsx', snippet: '<span dir="ltr">{insight.body}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span className="chip" dir="ltr">{BLOCK_MODE_LABELS[active.mode]}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span className="chip" dir="ltr">{FOCUS_LABELS[active.focus]}</span>' },
  {
    file: 'pages/Repertoire.tsx',
    snippet: '<span className="tiny faint" dir="ltr">\n              {g.works.length} work',
  },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="ltr">\n                {work.lastPractisedAt' },
  { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n            On your NAS' },
  { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n              On this device' },
  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{FOCUS_LABELS[item.primaryFocus]}</span>' },
  { file: 'components/Attachments.tsx', snippet: '<span dir="ltr">\n            {att.kind} · {formatBytes(att.size)}' },
  {
    file: 'pages/Materials.tsx',
    snippet: '<span dir="ltr">\n                          {MATERIAL_SOURCE_LABELS[m.sourceType]}',
  },
];

// --- an isolate must be INLINE, never a block that resolves its own align --
//
// A rejected review found `ItemMaterial.tsx` fixing a Farsi title's detail
// line with `<div className="tiny faint" dir="ltr">…</div>` — a BLOCK
// carrying the isolate directly. `text-align: start`, inherited from the
// group, is a per-BOX computed value: it resolves against that box's OWN
// `direction`, not the group's. Give the block its own `dir="ltr"` and its
// `text-align: start` resolves LEFT regardless of the group's (possibly RTL)
// resolved direction — splitting the detail from a right-aligned Farsi title
// exactly as before, just relocated. An INLINE isolate (`<span dir="ltr">`)
// never has this problem: `text-align` is a block-level concept, so a span's
// own `dir` only isolates the Unicode bidi algorithm's treatment of the text
// inside it and never touches which edge the enclosing block aligns to. This
// is therefore not a location to enumerate but a SHAPE to ban outright: no
// `dir="ltr"`/`dir="rtl"` may ever sit on a tag other than `span`/`bdi`,
// full stop, so this class of bug cannot come back in any file, named here
// or not.
const INLINE_ISOLATE_TAGS = ['span', 'bdi'];

function isolateSites(file: string): Site[] {
  const src = stripComments(SOURCES[file]);
  const sites: Site[] = [];
  for (const match of src.matchAll(/dir="(?:ltr|rtl)"/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tagName: (/^<\s*([A-Za-z][\w.]*)/.exec(tag)?.[1] ?? '').toLowerCase(),
      classValue: classNameOf(tag),
      text: tag,
      at,
    });
  }
  return sites;
}

// --- a native list marker must stay inside the card on EITHER side ---------
//
// A rejected review found `ClassQuestions.tsx`'s `<ol>` reserving gutter
// space with `paddingInlineStart` alone while its `<li>`s each resolve their
// OWN direction via `dir="auto"`: the browser positions each `<li>`'s
// outside `::marker` on ITS OWN start edge, not the `<ol>`'s, so a Farsi
// item's marker lands on the right — the side the `<ol>` reserved no room
// for — and gets pressed against or past the content border. This scans
// every `<ol>`/`<ul>` in the recorded surfaces (not just the one known
// today) and requires symmetric room on both sides whenever a directionally
// variable `<li>` could put the marker on either one.
function listSites(file: string): { file: string; line: number; tag: string; hasAutoLi: boolean }[] {
  const src = stripComments(SOURCES[file]);
  const sites: { file: string; line: number; tag: string; hasAutoLi: boolean }[] = [];
  for (const match of src.matchAll(/<(ol|ul)\b/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    if (tag.endsWith('/>')) continue;
    const body = elementBody(src, tag, at);
    const bodyText = src.slice(body.start, body.end);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tag,
      hasAutoLi: /<li\b[^>]*\sdir="auto"/.test(bodyText),
    });
  }
  return sites;
}

/** True when the list's own inline style leaves room for a marker on either
 *  side: explicit `paddingInline`, an equal start+end pair, or a marker that
 *  never sits in a separate gutter at all (`listStylePosition: 'inside'`). */
function reservesRoomOnBothSides(tag: string): boolean {
  const style = tag.match(/style=\{\{([^}]*)\}\}/)?.[1] ?? '';
  if (/listStylePosition\s*:\s*['"]inside['"]/.test(style)) return true;
  if (/\bpaddingInline\s*:/.test(style)) return true;
  const hasStart = /paddingInlineStart\s*:|paddingLeft\s*:/.test(style);
  const hasEnd = /paddingInlineEnd\s*:|paddingRight\s*:/.test(style);
  return hasStart === hasEnd; // both set, or neither — never start-only
}

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

  it('keeps every recorded group site current — removing any ONE of them fails, even when its file has others', () => {
    const inventory = sourceFiles()
      .flatMap(directionSites)
      .filter(isGroup)
      .map(({ file, tagName, classValue }) => ({ file, tagName, classValue }));
    expect(inventory).toEqual(GROUP_SITE_INVENTORY);
  });

  it('no fixed English phrase in a group inherits the title\'s bidi base unisolated', () => {
    const exempt = (file: string, tagText: string) =>
      UNEXEMPTED_PHRASE_ALLOWLIST.some((e) => e.file === file && tagText.includes(e.tagSnippet));
    const violations: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      for (const site of directionSites(file).filter(isGroup)) {
        if (exempt(file, site.text)) continue;
        const openAt = src.lastIndexOf('<', site.at);
        const body = elementBody(src, site.text, openAt);
        const phrase = unexemptedPhrase(src, body.start, body.end);
        if (phrase) violations.push(`${file}:${site.line} — "${phrase}" is exposed to the group's bidi base`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keeps every listed unexempted-phrase exception real, so it cannot rot', () => {
    for (const entry of UNEXEMPTED_PHRASE_ALLOWLIST) {
      const hit = sourceFiles()
        .filter((f) => f === entry.file)
        .flatMap(directionSites)
        .filter(isGroup)
        .some((s) => s.text.includes(entry.tagSnippet));
      expect(hit, `allowlisted exception no longer exists: ${entry.file} (${entry.tagSnippet})`).toBe(true);
    }
  });

  it('keeps every independently-authored value isolated from the group it sits in', () => {
    for (const entry of ISOLATED_VALUE_SITES) {
      const hit = SOURCES[entry.file]?.includes(entry.snippet);
      expect(hit, `missing or moved: ${entry.file} — ${entry.snippet}`).toBe(true);
    }
  });

  it('keeps every fixed-English / generated-metadata site isolated from the group it sits in', () => {
    for (const entry of LTR_ISOLATE_SITES) {
      const hit = SOURCES[entry.file]?.includes(entry.snippet);
      expect(hit, `missing or moved: ${entry.file} — ${entry.snippet}`).toBe(true);
    }
  });

  it('a bidi isolate is always inline (span/bdi), never a block that resolves its own alignment', () => {
    const violations = sourceFiles()
      .flatMap(isolateSites)
      .filter((s) => !INLINE_ISOLATE_TAGS.includes(s.tagName))
      .map((s) => `${s.file}:${s.line} — dir="ltr"/"rtl" on a <${s.tagName}>, not an inline span`);
    expect(violations).toEqual([]);
  });

  it('a list containing a direction-variable item reserves marker room on both sides', () => {
    const violations = sourceFiles()
      .flatMap(listSites)
      .filter((s) => s.hasAutoLi && !reservesRoomOnBothSides(s.tag))
      .map((s) => `${s.file}:${s.line} — <ol>/<ul> reserves gutter on only one side for a marker that can land on either`);
    expect(violations).toEqual([]);
  });
});
