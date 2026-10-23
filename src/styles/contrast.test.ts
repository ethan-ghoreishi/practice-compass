import { describe, expect, it } from 'vitest';

/**
 * The SHIPPED stylesheet, read from disk.
 *
 * Through a dynamic import whose specifier the compiler cannot resolve
 * statically, for two reasons that both live in files this lane may not touch:
 * `src` is typechecked by tsconfig.app.json, which does not enable node types,
 * and Vitest blanks every `.css` module — `?raw` included — unless `test.css`
 * is turned on in vite.config.ts. Reading the REAL file is the whole point: a
 * table of colours copied into this test would keep passing while the app
 * shipped something else.
 */
const NODE_FS = 'node:fs';
const { readFileSync } = (await import(/* @vite-ignore */ NODE_FS)) as {
  readFileSync: (path: URL, encoding: string) => string;
};
const CSS = readFileSync(new URL('./global.css', import.meta.url), 'utf8');

/**
 * Colour is checked by a test, not by eye.
 *
 * The pairs below are written out in full so a reviewer can see exactly what is
 * and is not covered: a token missing from this list is a VISIBLE omission, not
 * a silent one. The claim is bounded to these pairs — it is not a claim about
 * every theoretically possible foreground/background combination.
 *
 * Ratios come from the SHIPPED stylesheet, and each pair is asserted in EVERY
 * block where its tokens are declared. global.css declares the light palette
 * TWICE — once at `:root[data-theme='light']` and again inside
 * `@media (prefers-color-scheme: light) { :root:not([data-theme]) }` — and the
 * duplicate is what an owner who has never picked a theme actually sees, so a
 * regression in either block fails the suite.
 */

const AA_SMALL_TEXT = 4.5;

/** The three palette blocks the app ships, by the selector that opens each. */
const BLOCKS = [
  { name: "dark — :root, :root[data-theme='dark']", selector: ":root[data-theme='dark']" },
  { name: "light — :root[data-theme='light']", selector: ":root[data-theme='light']" },
  { name: 'light duplicate — @media (prefers-color-scheme: light) :root:not([data-theme])', selector: ':root:not([data-theme])' },
];

/**
 * Every (foreground, background) pair the app renders SMALL TEXT in.
 *
 * `over` names the opaque token a TRANSLUCENT background is composited on:
 * `.badge`/`.chip` paint a `--tone-*-soft` fill over the card they sit in, so
 * the honest background is that composite, not the card alone. Badges are the
 * only place `--tone-rest` renders at all — listing it against an opaque card
 * it never actually sits on would be a fiction.
 */
const PAIRS: { fg: string; bg: string; over?: string; where: string }[] = [
  // Body and metadata text, on the page ground and on both card surfaces.
  { fg: '--text', bg: '--bg', where: 'body text on the page' },
  { fg: '--text', bg: '--surface', where: 'body text in a .card' },
  { fg: '--text', bg: '--surface-2', where: 'body text in a .card-quiet' },
  { fg: '--text-dim', bg: '--bg', where: '.dim / .page-sub / .reason on the page' },
  { fg: '--text-dim', bg: '--surface', where: '.dim in a .card' },
  { fg: '--text-dim', bg: '--surface-2', where: '.dim / .option / .chip in a .card-quiet' },
  { fg: '--text-faint', bg: '--bg', where: '.faint / .tiny faint on the page' },
  { fg: '--text-faint', bg: '--surface', where: '.faint / .stat-label / .tab in a .card' },
  { fg: '--text-faint', bg: '--surface-2', where: '.faint / .field-hint in a .card-quiet' },

  // The accent: links, eyebrows, the active tab, the selected option pill.
  { fg: '--accent', bg: '--bg', where: '.link / .eyebrow on the page' },
  { fg: '--accent', bg: '--surface', where: '.link / .eyebrow in a .card' },
  { fg: '--accent', bg: '--surface-2', where: '.link in a .card-quiet' },
  { fg: '--accent', bg: '--accent-soft', over: '--surface-2', where: '.option.selected' },
  // The primary Start button's own label — the single most important control.
  { fg: '--accent-contrast', bg: '--accent', where: '.btn-primary label' },

  // Gold: the "keep asking" prompt and the "essential" segment marker.
  { fg: '--gold', bg: '--surface', where: 'gold note in a .card' },
  { fg: '--gold', bg: '--surface-2', where: 'gold note in a .card-quiet' },

  // Tone tokens as PLAIN text (no badge fill behind them).
  { fg: '--tone-alert', bg: '--surface-2', where: '.btn-danger label' },
  { fg: '--tone-warn', bg: '--surface', where: '.warn-flag in a .card' },
  { fg: '--tone-warn', bg: '--surface-2', where: 'the "three same results" note in a .card-quiet' },
  { fg: '--tone-good', bg: '--surface', where: '.timer-target-reached' },
  { fg: '--tone-progress', bg: '--bg', where: '.segment-arrived in the routine runner header' },

  // Tone tokens as .badge / .chip text, over their own translucent fill.
  { fg: '--tone-alert', bg: '--tone-alert-soft', over: '--surface', where: '.badge.tone-alert in a .card' },
  { fg: '--tone-alert', bg: '--tone-alert-soft', over: '--surface-2', where: '.badge.tone-alert in a .card-quiet' },
  { fg: '--tone-warn', bg: '--tone-warn-soft', over: '--surface', where: '.badge.tone-warn in a .card' },
  { fg: '--tone-warn', bg: '--tone-warn-soft', over: '--surface-2', where: '.badge.tone-warn in a .card-quiet' },
  { fg: '--tone-progress', bg: '--tone-progress-soft', over: '--surface', where: '.badge.tone-progress in a .card' },
  { fg: '--tone-progress', bg: '--tone-progress-soft', over: '--surface-2', where: '.badge.tone-progress in a .card-quiet' },
  { fg: '--tone-good', bg: '--tone-good-soft', over: '--surface', where: '.badge.tone-good in a .card' },
  { fg: '--tone-good', bg: '--tone-good-soft', over: '--surface-2', where: '.badge.tone-good in a .card-quiet' },
  { fg: '--tone-rest', bg: '--tone-rest-soft', over: '--surface', where: '.badge.tone-rest in a .card' },
  { fg: '--tone-rest', bg: '--tone-rest-soft', over: '--surface-2', where: '.badge.tone-rest in a .card-quiet' },
];

// --- reading the shipped stylesheet ----------------------------------------

/** The custom properties declared directly inside one selector's block. */
function declarationsIn(css: string, selector: string): Record<string, string> {
  const at = css.indexOf(selector);
  if (at < 0) throw new Error(`global.css no longer declares ${selector}`);
  if (css.indexOf(selector, at + 1) >= 0) throw new Error(`${selector} appears more than once in global.css`);
  const open = css.indexOf('{', at);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

type RGB = [number, number, number];

function parseColour(value: string): { rgb: RGB; alpha: number } {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = hex[1];
    return { rgb: [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as RGB, alpha: 1 };
  }
  const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/i.exec(value);
  if (rgba) {
    return {
      rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])] as RGB,
      alpha: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }
  throw new Error(`not a flat colour: ${value}`);
}

function composite(fg: { rgb: RGB; alpha: number }, base: RGB): RGB {
  return fg.rgb.map((c, i) => fg.alpha * c + (1 - fg.alpha) * base[i]) as RGB;
}

/** WCAG 2.1 relative luminance. */
function luminance([r, g, b]: RGB): number {
  const [lr, lg, lb] = [r, g, b]
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolve one token to an opaque colour, compositing over `over` if needed. */
function resolve(tokens: Record<string, string>, token: string, over?: string): RGB {
  const value = tokens[token];
  if (!value) throw new Error(`token ${token} is not declared in this block`);
  const parsed = parseColour(value);
  if (parsed.alpha === 1) return parsed.rgb;
  if (!over) throw new Error(`${token} is translucent — the pair must name what it sits over`);
  return composite(parsed, resolve(tokens, over));
}

// --- the check --------------------------------------------------------------

describe('shipped colour tokens', () => {
  it('every listed colour pair meets WCAG AA in every block where its tokens are declared', () => {
    const failures: string[] = [];

    for (const block of BLOCKS) {
      const tokens = declarationsIn(CSS, block.selector);
      for (const pair of PAIRS) {
        // A block that does not declare both tokens is not making a claim here.
        if (!tokens[pair.fg] || !tokens[pair.bg]) continue;
        const ratio = contrastRatio(resolve(tokens, pair.fg), resolve(tokens, pair.bg, pair.over));
        if (ratio < AA_SMALL_TEXT) {
          const bg = pair.over ? `${pair.bg} over ${pair.over}` : pair.bg;
          failures.push(`${block.name}: ${pair.fg} on ${bg} is ${ratio.toFixed(2)}:1 (${pair.where})`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('keeps every baseline colour token at its exact value in all three palette blocks', () => {
    // Contrast alone cannot prove the palette is unchanged: two different
    // colours can both pass. These are the literal values global.css shipped
    // at 24a84be (the UI refresh's baseline; the owner chose "keep it"), as
    // [dark, light]. A new token may join a block; an existing one never moves.
    const BASELINE: Record<string, [string, string]> = {
      '--bg': ['#15171c', '#f4f1ea'],
      '--bg-grad': ['radial-gradient(1200px 600px at 50% -10%, #1c1f27 0%, #15171c 60%)', 'radial-gradient(1200px 600px at 50% -10%, #fbf9f4 0%, #f1ede4 70%)'],
      '--surface': ['#1d2027', '#fffefb'],
      '--surface-2': ['#232730', '#f4f0e8'],
      '--surface-3': ['#2b303a', '#ece7dc'],
      '--border': ['rgba(255, 255, 255, 0.08)', 'rgba(40, 35, 25, 0.10)'],
      '--border-strong': ['rgba(255, 255, 255, 0.16)', 'rgba(40, 35, 25, 0.18)'],
      '--text': ['#e8e6e0', '#2c2924'],
      '--text-dim': ['#a6a299', '#6a655b'],
      '--text-faint': ['#908e88', '#716c63'],
      '--accent': ['#74b3a6', '#316e62'],
      '--accent-dim': ['#4d7d74', '#6aa99b'],
      '--accent-contrast': ['#0e1714', '#ffffff'],
      '--accent-soft': ['rgba(116, 179, 166, 0.14)', 'rgba(63, 141, 125, 0.12)'],
      '--gold': ['#cba86a', '#876830'],
      '--tone-alert': ['#db9181', '#98503f'],
      '--tone-warn': ['#cda35f', '#845d21'],
      '--tone-progress': ['#8ca9c4', '#466686'],
      '--tone-good': ['#84bb9c', '#326f4f'],
      '--tone-rest': ['#a5a2b2', '#666175'],
      '--tone-alert-soft': ['rgba(217, 140, 124, 0.16)', 'rgba(192, 101, 79, 0.12)'],
      '--tone-warn-soft': ['rgba(205, 163, 95, 0.16)', 'rgba(169, 118, 42, 0.12)'],
      '--tone-progress-soft': ['rgba(139, 168, 196, 0.16)', 'rgba(79, 115, 150, 0.12)'],
      '--tone-good-soft': ['rgba(132, 187, 156, 0.16)', 'rgba(63, 140, 99, 0.12)'],
      '--tone-rest-soft': ['rgba(160, 156, 173, 0.16)', 'rgba(117, 111, 134, 0.12)'],
    };
    const moved: string[] = [];
    for (const [i, block] of BLOCKS.entries()) {
      const tokens = declarationsIn(CSS, block.selector);
      for (const [token, values] of Object.entries(BASELINE)) {
        const want = values[i === 0 ? 0 : 1];
        const got = tokens[token]?.replace(/\s+/g, ' ');
        if (got !== want) moved.push(`${block.name}: ${token} is ${got ?? '(missing)'}, baseline ${want}`);
      }
    }
    expect(moved).toEqual([]);
  });

  it('asserts the light palette in BOTH blocks that declare it', () => {
    // The duplicate is not decoration: it is the palette an owner who has never
    // picked a theme actually sees. Dropping it would silently halve the check.
    const explicit = declarationsIn(CSS, ":root[data-theme='light']");
    const preference = declarationsIn(CSS, ':root:not([data-theme])');
    for (const token of new Set(PAIRS.flatMap((p) => [p.fg, p.bg, p.over]).filter(Boolean) as string[])) {
      expect(preference[token], `${token} in the prefers-color-scheme block`).toBe(explicit[token]);
    }
  });
});
