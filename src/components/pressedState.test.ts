import { describe, expect, it } from 'vitest';

// The shipped stylesheet, read from disk the way contrast.test.ts reads it:
// Vitest blanks every `.css` module, `?raw` included.
const NODE_FS = 'node:fs';
const { readFileSync } = (await import(/* @vite-ignore */ NODE_FS)) as {
  readFileSync: (path: URL, encoding: string) => string;
};
const CSS = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

/**
 * A toggle's chosen state is SEEN, not only announced.
 *
 * `aria-pressed` tells a screen reader which option is chosen; nothing in the
 * stylesheet styles a pressed `.btn`, so a control carrying only the attribute
 * looks the same pressed or not. "Keep my value" / "Use archive value" did
 * exactly that: the attribute flipped (tests proved it), the screen never
 * changed. So every `aria-pressed={expr}` in a page or component must pair
 * with a selected CLASS driven by the same expression — `.option.selected`
 * and `.btn-primary` change weight as well as colour; a tone class marks a
 * filter chip — or with an equivalent recorded, with its reason, in the
 * ledger below.
 *
 * Read from source (jsdom computes no style); the browser journeys measure
 * the computed difference on the archive choices.
 */
const SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries({
    ...import.meta.glob('../pages/*.tsx', { query: '?raw', import: 'default', eager: true }),
    ...import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true }),
  }).map(([path, source]) => [path.replace(/^\.\.\//, '').replace(/^\.\//, 'components/'), source as string]),
);

/** The stylesheet's selected treatments. */
const TREATMENTS = ['selected', 'btn-primary', 'tone-progress'];

/** Controls whose selected state is visible some other way — each with why. */
const LEDGER: { file: string; pressed: string; why: string }[] = [
  {
    file: 'components/ui.tsx',
    pressed: 'n === value',
    why: 'a rating: aria-pressed marks the chosen value, the cumulative fill (`.rating button.on`, every star up to it) is its visible counterpart',
  },
];

/** The opening tag an index sits inside, brace- and quote-aware. */
function enclosingTag(src: string, at: number): string {
  const start = src.lastIndexOf('<', at);
  let depth = 0;
  for (let i = start + 1; i < src.length; i += 1) {
    const c = src[i];
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '>' && depth === 0) return src.slice(start, i + 1);
  }
  return src.slice(start);
}

/** The balanced `{…}` expression starting at `at`. */
function expressionAt(src: string, at: number): string {
  let depth = 0;
  for (let i = at; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}' && --depth === 0) return src.slice(at + 1, i);
  }
  return src.slice(at + 1);
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('pressed state is visible', () => {
  it('every aria-pressed control renders a visible selected state', () => {
    const violations: string[] = [];
    let seen = 0;
    for (const [file, src] of Object.entries(SOURCES)) {
      for (const m of src.matchAll(/aria-pressed=\{/g)) {
        seen += 1;
        const pressed = squash(expressionAt(src, m.index! + 'aria-pressed='.length));
        const tag = squash(enclosingTag(src, m.index!));
        const className = /className=(\{`[^`]*`\}|"[^"]*")/.exec(tag)?.[1] ?? '';
        const paired = className.includes(pressed) && TREATMENTS.some((t) => new RegExp(`['\\s]${t}\\b`).test(className));
        const recorded = LEDGER.some((e) => e.file === file && e.pressed === pressed);
        if (!paired && !recorded) {
          const line = src.slice(0, m.index).split('\n').length;
          violations.push(`${file}:${line} — aria-pressed={${pressed}} with no selected class driven by it (className ${className || 'none'})`);
        }
      }
    }
    expect(violations).toEqual([]);
    expect(seen).toBeGreaterThan(0);
    // Every ledger entry is still a real site, so the ledger cannot rot.
    for (const e of LEDGER) expect(squash(SOURCES[e.file] ?? '').includes(`aria-pressed={${e.pressed}}`), e.file).toBe(true);
    // The option and primary treatments change weight, not colour alone.
    const rule = (selector: string) => new RegExp(`${selector.replace(/\./g, '\\.')}\\s*\\{([^}]*)\\}`).exec(CSS)?.[1] ?? '';
    expect(rule('.option.selected')).toMatch(/font-weight:\s*600/);
    expect(rule('.btn-primary')).toMatch(/font-weight:\s*600/);
    expect(rule('.tone-progress')).not.toBe('');
  });
});
