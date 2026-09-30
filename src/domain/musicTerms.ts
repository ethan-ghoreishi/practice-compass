import type {
  ID,
  MusicalValue,
  MusicTerm,
  MusicTermKind,
  MusicTermRef,
  PersianFields,
  PracticeDB,
  PracticeItem,
} from './types';
import {
  faCollator,
  hasPersianScript,
  normalizePersian,
  persianSearchMatch,
  prepareAliasTable,
  TITLE_SEARCH_ALIASES,
  type SearchAliasTable,
} from './farsi';
import { nowISO } from './util';

// ---------------------------------------------------------------------------
// The shared musical vocabulary: Dastgāh/Āvāz, Form, Composer/Maestro.
//
// IDENTITY IS EXACT; SEARCH IS BROAD. A value belongs to a term only when it
// IS a reference to it, or its text equals exactly ONE term's name or curated
// alias (after the existing Farsi normaliser, case and Latin diacritics). A
// substring, a composite ("دشتی/شور"), an unknown spelling or a spelling two
// terms both claim stays LITERAL — searchable, groupable by its own text, and
// never assigned. Transliteration matching belongs to search (`farsi.ts`),
// never here.
//
// Built-in terms live in code under namespaced ids that never derive from a
// label. `PracticeDB.musicTerms` holds only the owner's custom terms and their
// edits of built-ins (same id), so an empty collection means "the shipped
// vocabulary, untouched" and nothing is ever reseeded.
// ---------------------------------------------------------------------------

export const MUSIC_TERM_KINDS: MusicTermKind[] = ['dastgah', 'form', 'composer'];

export const MUSIC_TERM_KIND_LABELS: Record<MusicTermKind, string> = {
  dastgah: 'Dastgāh / Āvāz',
  form: 'Form',
  composer: 'Composer / maestro',
};

/** The item fields a term may classify, and the one kind each accepts. */
export type TermField = 'dastgahAvaz' | 'form' | 'composer';
export const TERM_FIELD_KIND: Record<TermField, MusicTermKind> = {
  dastgahAvaz: 'dastgah',
  form: 'form',
  composer: 'composer',
};
export const TERM_FIELDS: TermField[] = ['dastgahAvaz', 'form', 'composer'];

/** A fixed, documented timestamp for code-defined records — never a clock. */
const BUILT_IN_AT = '2026-06-30T00:00:00.000Z';

const builtIn = (id: string, kind: MusicTermKind, name: string, aliases: string[]): MusicTerm => ({
  id,
  kind,
  name,
  aliases,
  createdAt: BUILT_IN_AT,
  updatedAt: BUILT_IN_AT,
});

/**
 * The shipped vocabulary. ORDER IS MEANINGFUL for dastgāh: it is the standard
 * concert order of the seven dastgāh and five āvāz, which is how groups sort.
 * Aliases are the spellings actually met — the app's old suggestion lists, the
 * transliterations search already knew, and the Setar archive's own
 * hyphenated registry spellings — never a guessed variant.
 */
export const BUILT_IN_TERMS: readonly MusicTerm[] = [
  builtIn('dastgah:shur', 'dastgah', 'شور', ['دستگاه شور', 'Shur', 'Shour']),
  builtIn('dastgah:abuata', 'dastgah', 'ابوعطا', ['آواز ابوعطا', 'Abu’atā', "Abu'ata", 'Abuata', 'Abu Ata']),
  builtIn('dastgah:bayat-tork', 'dastgah', 'بیات ترک', ['بیات‌ترک', 'بیات-ترک', 'آواز بیات ترک', 'Bayāt-e Tork', 'Bayat-e Tork', 'Bayat Tork']),
  builtIn('dastgah:afshari', 'dastgah', 'افشاری', ['آواز افشاری', 'Afshāri', 'Afshari', 'Avaz-e Afshari']),
  builtIn('dastgah:dashti', 'dastgah', 'دشتی', ['آواز دشتی', 'Dashti']),
  builtIn('dastgah:homayun', 'dastgah', 'همایون', ['دستگاه همایون', 'Homāyun', 'Homayun', 'Homayoun']),
  builtIn('dastgah:bayat-esfahan', 'dastgah', 'بیات اصفهان', ['اصفهان', 'بیات‌اصفهان', 'بیات-اصفهان', 'آواز بیات اصفهان', 'Bayāt-e Esfahān', 'Bayat-e Esfahan', 'Esfahan', 'Isfahan']),
  builtIn('dastgah:segah', 'dastgah', 'سه‌گاه', ['سه گاه', 'سهگاه', 'سه-گاه', 'دستگاه سه‌گاه', 'Segāh', 'Segah', 'Se-gāh']),
  builtIn('dastgah:chahargah', 'dastgah', 'چهارگاه', ['چهار گاه', 'چهار-گاه', 'دستگاه چهارگاه', 'Chahārgāh', 'Chahargah', 'Chahār-gāh']),
  builtIn('dastgah:mahur', 'dastgah', 'ماهور', ['دستگاه ماهور', 'Māhur', 'Mahur', 'Mahoor']),
  builtIn('dastgah:nava', 'dastgah', 'نوا', ['دستگاه نوا', 'Navā', 'Nava']),
  builtIn('dastgah:rast-panjgah', 'dastgah', 'راست‌پنجگاه', ['راست پنجگاه', 'راست-پنجگاه', 'دستگاه راست‌پنجگاه', 'Rāst-Panjgāh', 'Rast-Panjgah', 'Rast Panjgah']),

  builtIn('form:pish-daramad', 'form', 'پیش‌درآمد', ['پیش درآمد', 'پیشدرآمد', 'پیش-درامد', 'پیش‌درامد', 'Pish-darāmad', 'Pish-daramad', 'Pishdaramad']),
  builtIn('form:chahar-mezrab', 'form', 'چهارمضراب', ['چهار مضراب', 'چهار-مضراب', 'Chahār-mezrāb', 'Chahar-mezrab', 'Chaharmezrab', 'Chaharmizrab']),
  builtIn('form:tasnif', 'form', 'تصنیف', ['Tasnif']),
  builtIn('form:reng', 'form', 'رنگ', ['Reng', 'Rang']),
  builtIn('form:zarbi', 'form', 'ضربی', ['Zarbi']),
  builtIn('form:qete', 'form', 'قطعه', ['Ghet’e', "Ghet'e", 'Qet’e', 'Qete']),
  builtIn('form:gusheh', 'form', 'گوشه', ['Radif gusheh', 'Gusheh']),
  builtIn('form:avaz', 'form', 'آواز', ['Āvāz (improvisation)', 'Avaz']),
  builtIn('form:etude', 'form', 'اتود', ['Étude / exercise', 'Étude', 'Etude']),

  builtIn('composer:darvish-khan', 'composer', 'درویش‌خان', ['درویش خان', 'درویش-خان', 'Darvish Khān', 'Darvish Khan']),
  builtIn('composer:saba', 'composer', 'ابوالحسن صبا', ['صبا', 'Abolhasan Saba', 'Sabā', 'Saba']),
  builtIn('composer:vaziri', 'composer', 'علی‌نقی وزیری', ['وزیری', 'Alinaghi Vaziri', 'Vaziri']),
  builtIn('composer:shahnazi', 'composer', 'علی‌اکبر شهنازی', ['شهنازی', 'Ali-Akbar Shahnazi', 'Shahnazi']),
  builtIn('composer:mirza-hosseingholi', 'composer', 'میرزا حسینقلی', ['میرزا-حسینقلی', 'Mirza Hosseingholi']),
  builtIn('composer:boroumand', 'composer', 'نورعلی برومند', ['برومند', 'Nour-Ali Boroumand', 'Boroumand']),
  builtIn('composer:lotfi', 'composer', 'محمدرضا لطفی', ['لطفی', 'Mohammad-Reza Lotfi', 'Lotfi']),
  builtIn('composer:alizadeh', 'composer', 'حسین علیزاده', ['علیزاده', 'Hossein Alizadeh', 'Alizadeh']),
];

const BUILT_IN_IDS = new Set(BUILT_IN_TERMS.map((t) => t.id));

export function isBuiltInTerm(id: ID): boolean {
  return BUILT_IN_IDS.has(id);
}

/** The value a built-in term has in code, whatever the owner has since edited. */
export function builtInTerm(id: ID): MusicTerm | undefined {
  return BUILT_IN_TERMS.find((t) => t.id === id);
}

export function isTermRef(value: unknown): value is MusicTermRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    typeof (value as { termId?: unknown }).termId === 'string'
  );
}

/**
 * The comparison key for EXACT identity: the existing Farsi normaliser (Arabic
 * yeh/kaf, digits, spaces, ZWNJ tidying), then lower case, Latin combining
 * diacritics and typographic apostrophes. It never strips a prefix, splits a
 * composite or reads a substring — that would be fuzzy assignment.
 */
export function termKey(text: string): string {
  return normalizePersian(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .replace(/[’‘ʼ`]/g, "'");
}

// --- the vocabulary ----------------------------------------------------------

export interface Vocabulary {
  /** Every term, built-ins first (in their meaningful order), then custom. */
  terms: MusicTerm[];
  byId: Map<ID, MusicTerm>;
  /** kind → exact key → the terms claiming it (more than one = ambiguous). */
  keys: Map<MusicTermKind, Map<string, MusicTerm[]>>;
}

/**
 * Built-ins overlaid by the owner's edits of them (same id), followed by the
 * owner's custom terms. Pure: the same stored terms always give the same
 * vocabulary, in the same order — custom terms sort by name, then id, and
 * nothing about identity ever depends on that order.
 */
export function vocabulary(stored: MusicTerm[] = []): Vocabulary {
  const edits = new Map(stored.map((t) => [t.id, t]));
  const builtIns = BUILT_IN_TERMS.map((t) => edits.get(t.id) ?? t);
  const custom = stored
    .filter((t) => !BUILT_IN_IDS.has(t.id))
    .sort((a, b) => faCollator.compare(a.name, b.name) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const terms = [...builtIns, ...custom];
  const byId = new Map(terms.map((t) => [t.id, t]));
  const keys = new Map<MusicTermKind, Map<string, MusicTerm[]>>(MUSIC_TERM_KINDS.map((k) => [k, new Map()]));
  for (const term of terms) {
    const own = keys.get(term.kind)!;
    for (const key of new Set(termKeys(term))) own.set(key, [...(own.get(key) ?? []), term]);
  }
  return { terms, byId, keys };
}

/** Every exact key a term answers to: its name and each alias. */
export function termKeys(term: Pick<MusicTerm, 'name' | 'aliases'>): string[] {
  return [term.name, ...term.aliases].map(termKey).filter((k) => k.length > 0);
}

export type Resolution =
  | { status: 'empty' }
  | { status: 'term'; term: MusicTerm; via: 'reference' | 'alias' }
  | { status: 'literal'; text: string }
  | { status: 'ambiguous'; text: string; candidates: MusicTerm[] }
  | { status: 'dangling'; termId: ID };

/**
 * What one stored value MEANS. A reference is its term; text is a term only
 * when exactly one term of the right kind answers to it exactly. Archived terms
 * still resolve — archiving only withdraws a term from NEW entry.
 */
export function resolveValue(value: MusicalValue | null | undefined, kind: MusicTermKind, vocab: Vocabulary): Resolution {
  if (value === undefined || value === null) return { status: 'empty' };
  if (isTermRef(value)) {
    const term = vocab.byId.get(value.termId);
    return term && term.kind === kind ? { status: 'term', term, via: 'reference' } : { status: 'dangling', termId: value.termId };
  }
  const text = value;
  const key = termKey(text);
  if (!key) return { status: 'empty' };
  const matches = vocab.keys.get(kind)?.get(key) ?? [];
  if (matches.length === 1) return { status: 'term', term: matches[0], via: 'alias' };
  if (matches.length > 1) return { status: 'ambiguous', text, candidates: matches };
  return { status: 'literal', text };
}

/** How a value reads on screen: a term's current name, or the owner's own text. */
export function valueLabel(value: MusicalValue | null | undefined, vocab: Vocabulary): string {
  if (value === undefined || value === null) return '';
  if (isTermRef(value)) return vocab.byId.get(value.termId)?.name ?? '';
  return value;
}

/** True when a field holds anything at all — the "has identity" test. */
export function hasValue(value: MusicalValue | null | undefined): boolean {
  return isTermRef(value) || (typeof value === 'string' && value.trim().length > 0);
}

/**
 * The grouping key a value falls under: its term, or its own literal text.
 * Two literals group together only when their exact keys match.
 */
export interface ValueGroup {
  key: string;
  label: string;
  termId?: ID;
}

export function valueGroup(value: MusicalValue | null | undefined, kind: MusicTermKind, vocab: Vocabulary): ValueGroup | null {
  const r = resolveValue(value, kind, vocab);
  if (r.status === 'term') return { key: `term:${r.term.id}`, label: r.term.name, termId: r.term.id };
  if (r.status === 'literal' || r.status === 'ambiguous') return { key: `literal:${termKey(r.text)}`, label: r.text.trim() };
  return null;
}

/**
 * Every string a value can be SEARCHED by: the owner's own text, and — when it
 * is a term — the term's name and aliases. Search only; nothing here decides
 * identity.
 */
export function valueSearchTexts(value: MusicalValue | null | undefined, kind: MusicTermKind, vocab: Vocabulary): string[] {
  const out: string[] = [];
  if (typeof value === 'string' && value.trim()) out.push(value);
  const r = resolveValue(value, kind, vocab);
  if (r.status === 'term') out.push(r.term.name, ...r.term.aliases);
  if (r.status === 'ambiguous') for (const t of r.candidates) out.push(t.name);
  return out;
}

/** The terms offered for NEW entry of one kind: never an archived one. */
export function termSuggestions(kind: MusicTermKind, vocab: Vocabulary): MusicTerm[] {
  return vocab.terms.filter((t) => t.kind === kind && !t.archived);
}

/**
 * What typing into a field STORES. Only the exact NAME of a live term becomes a
 * reference — picking a suggestion is choosing that term. Anything else,
 * including an alias, is kept as the owner's own text exactly as typed; it
 * still groups under the alias's term for as long as that alias means it.
 */
export function valueFromInput(text: string, kind: MusicTermKind, vocab: Vocabulary): MusicalValue | undefined {
  if (!text.trim()) return undefined;
  const key = termKey(text);
  const named = vocab.terms.filter((t) => t.kind === kind && !t.archived && termKey(t.name) === key);
  if (named.length === 1) {
    const claims = vocab.keys.get(kind)?.get(key) ?? [];
    if (claims.length === 1) return { termId: named[0].id };
  }
  return text;
}

// --- search (broad, never identity) ---------------------------------------------

/**
 * The transliteration table search uses: every term's Farsi spellings mapped
 * to its Latin ones (with and without hyphens, apostrophes and spaces), plus
 * the few title aliases unrelated to any term. SEARCH ONLY — typing "shur"
 * finds «درآمد شور» here, which says nothing about what that item IS.
 */
export function searchAliasTable(vocab: Vocabulary = vocabulary()): SearchAliasTable {
  const table: Record<string, string[]> = { ...TITLE_SEARCH_ALIASES };
  for (const term of vocab.terms) {
    const spellings = [term.name, ...term.aliases];
    const latin = spellings
      .filter((s) => !hasPersianScript(s))
      .map(termKey)
      .flatMap((k) => [k, k.replace(/-/g, ''), k.replace(/[-']/g, ' ').replace(/\s+/g, ' '), k.replace(/[-' ]/g, '')]);
    if (!latin.length) continue;
    for (const farsi of spellings.filter(hasPersianScript)) table[farsi] = [...new Set([...(table[farsi] ?? []), ...latin])];
  }
  return prepareAliasTable(table);
}

let builtInTable: SearchAliasTable | null = null;

/** Broad search over one string, with the vocabulary's spellings (built-ins by default). */
export function searchMatch(haystack: string, query: string, table?: SearchAliasTable): boolean {
  return persianSearchMatch(haystack, query, table ?? (builtInTable ??= searchAliasTable()));
}

/** Order two groups the way a musician reads them: built-in order, then name. */
export function compareGroups(a: ValueGroup, b: ValueGroup, vocab: Vocabulary): number {
  const rank = (g: ValueGroup) => {
    if (!g.termId) return Number.MAX_SAFE_INTEGER;
    const i = vocab.terms.findIndex((t) => t.id === g.termId);
    return i < 0 ? Number.MAX_SAFE_INTEGER - 1 : i;
  };
  const ra = rank(a);
  const rb = rank(b);
  return ra !== rb ? ra - rb : faCollator.compare(a.label, b.label);
}

// --- validation (every inbound door) -------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * The vocabulary records and every item field that points into it. A wrong
 * type is REFUSED with the record named, never coerced; a reference must name a
 * term of the kind its field accepts. Literal text is always legitimate —
 * unknown, ambiguous and composite spellings are the owner's evidence.
 */
export function validateMusicTerms(db: Pick<PracticeDB, 'musicTerms' | 'items'>): string | null {
  const seen = new Set<string>();
  for (const raw of db.musicTerms as unknown[]) {
    if (!isRecord(raw)) return 'A musical term is not a record.';
    const id = raw.id as string;
    if (seen.has(id)) return `Two musical terms share the id "${id}".`;
    seen.add(id);
    if (!MUSIC_TERM_KINDS.includes(raw.kind as MusicTermKind)) return `Musical term "${id}" has an unknown kind.`;
    if (typeof raw.name !== 'string' || !raw.name.trim()) return `Musical term "${id}" has no name.`;
    if (!Array.isArray(raw.aliases) || raw.aliases.some((a) => typeof a !== 'string')) {
      return `Musical term "${id}" has an unreadable alias list.`;
    }
    if (raw.archived !== undefined && typeof raw.archived !== 'boolean') return `Musical term "${id}" has an unreadable archived flag.`;
    if (typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string') return `Musical term "${id}" has unreadable timestamps.`;
    const shipped = builtInTerm(id);
    if (shipped && shipped.kind !== raw.kind) return `Musical term "${id}" changes the kind of a built-in term.`;
  }
  const vocab = vocabulary(db.musicTerms);
  for (const item of db.items) {
    const persian = (item as { persian?: unknown }).persian;
    if (persian === undefined || persian === null) continue;
    if (!isRecord(persian)) return `Item "${item.id}" has unreadable Persian metadata.`;
    const gusheh = persian.gusheh;
    if (gusheh !== undefined && gusheh !== null && typeof gusheh !== 'string') {
      return `Item "${item.id}" has an unreadable gusheh.`;
    }
    for (const field of TERM_FIELDS) {
      const value = persian[field];
      if (value === undefined || value === null || typeof value === 'string') continue;
      if (!isTermRef(value)) return `Item "${item.id}" has an unreadable ${field} (neither text nor a term reference).`;
      const term = vocab.byId.get(value.termId);
      if (!term) return `Item "${item.id}" names a musical term that does not exist ("${value.termId}").`;
      if (term.kind !== TERM_FIELD_KIND[field]) {
        return `Item "${item.id}" puts the ${term.kind} term "${term.id}" in its ${field} field.`;
      }
    }
  }
  return null;
}

// --- management (pure planners the store applies in one set()) ----------------

export type TermPlan = { ok: true; terms: MusicTerm[] } | { ok: false; reason: string };

/** Split a free-text alias list — one per line or comma — keeping each exactly. */
export function parseAliases(text: string): string[] {
  return [...new Set(text.split(/[\n,،]/).map((a) => a.trim()).filter(Boolean))];
}

/**
 * Items whose stored value DEPENDS on this term: a reference to it, text that
 * means it uniquely, or text it is one of several claimants of (ambiguous
 * text is kept literal only because more than one term answers to it, so
 * every claimant is holding that reading in place).
 */
export function itemsUsingTerm(items: PracticeItem[], termId: ID, vocab: Vocabulary): PracticeItem[] {
  const term = vocab.byId.get(termId);
  if (!term) return [];
  return items.filter((item) =>
    TERM_FIELDS.some((field) => {
      if (TERM_FIELD_KIND[field] !== term.kind) return false;
      const r = resolveValue(item.persian?.[field], term.kind, vocab);
      if (r.status === 'term') return r.term.id === termId;
      return r.status === 'ambiguous' && r.candidates.some((t) => t.id === termId);
    }),
  );
}

/** What a value MEANS, as one comparable word: a term's id, or how it reads without one. */
function meaning(value: MusicalValue | null | undefined, kind: MusicTermKind, vocab: Vocabulary): string {
  const r = resolveValue(value, kind, vocab);
  return r.status === 'term' ? `term:${r.term.id}` : r.status;
}

/**
 * THE ONE CHECK a vocabulary edit passes before it is applied: the items whose
 * stored text or reference would MEAN something different under `after` than
 * under `before`, with nothing about the item itself edited. The only change
 * allowed is literal text becoming a term — a spelling the owner has just
 * given a term, which is what adding that spelling is for. Everything else —
 * a term's text turning literal, one term becoming another, a reference left
 * dangling, or AMBIGUOUS text collapsing onto whichever claimant is left — is
 * reclassifying the owner's piece behind their back. Still-ambiguous text is
 * no change: it reads literally either way.
 */
export function reclassifiedItems(items: PracticeItem[], kind: MusicTermKind, before: Vocabulary, after: Vocabulary): PracticeItem[] {
  return items.filter((item) =>
    TERM_FIELDS.some((field) => {
      if (TERM_FIELD_KIND[field] !== kind) return false;
      const was = meaning(item.persian?.[field], kind, before);
      const now = meaning(item.persian?.[field], kind, after);
      return was !== now && !(was === 'literal' && now.startsWith('term:'));
    }),
  );
}

/**
 * Which keys of `candidate` another term of the same kind already claims —
 * only the keys this edit ADDS. A collision the term already carried (an
 * imported file may hold one; resolution keeps that text literal) is not the
 * edit's doing, and refusing on it would leave the term impossible to archive
 * or rename at all.
 */
function collisions(candidate: Pick<MusicTerm, 'id' | 'kind' | 'name' | 'aliases'>, vocab: Vocabulary, had: string[] = []): string[] {
  const own = vocab.keys.get(candidate.kind)!;
  const held = new Set(had);
  const out: string[] = [];
  for (const text of [candidate.name, ...candidate.aliases]) {
    if (held.has(termKey(text))) continue;
    const claimants = (own.get(termKey(text)) ?? []).filter((t) => t.id !== candidate.id);
    if (claimants.length) out.push(`“${text}” already means ${claimants.map((t) => `“${t.name}”`).join(', ')}`);
  }
  return out;
}

function withStored(stored: MusicTerm[], term: MusicTerm): MusicTerm[] {
  return stored.some((t) => t.id === term.id) ? stored.map((t) => (t.id === term.id ? term : t)) : [...stored, term];
}

export function planAddTerm(
  stored: MusicTerm[],
  input: { id: ID; kind: MusicTermKind; name: string; aliases: string[] },
  now: Date,
): TermPlan {
  const name = input.name.trim();
  if (!name) return { ok: false, reason: 'A term needs a name.' };
  const vocab = vocabulary(stored);
  if (vocab.byId.has(input.id)) return { ok: false, reason: 'That term already exists.' };
  const aliases = [...new Set(input.aliases.map((a) => a.trim()).filter(Boolean))];
  const clash = collisions({ id: input.id, kind: input.kind, name, aliases }, vocab);
  if (clash.length) return { ok: false, reason: `Not added: ${clash.join('; ')}. One spelling cannot mean two terms.` };
  const ts = nowISO(now);
  return { ok: true, terms: [...stored, { id: input.id, kind: input.kind, name, aliases, createdAt: ts, updatedAt: ts }] };
}

/**
 * Rename, re-alias, archive or restore one term — built-in or custom. The id
 * never changes. A former name is kept as an alias so text that meant it still
 * does; a spelling another term claims is refused rather than silently
 * re-pointed; and removing a spelling some item's text still depends on is
 * refused, because that would quietly change what the item means.
 */
export function planUpdateTerm(
  stored: MusicTerm[],
  items: PracticeItem[],
  id: ID,
  patch: { name?: string; aliases?: string[]; archived?: boolean },
  now: Date,
): TermPlan {
  const vocab = vocabulary(stored);
  const current = vocab.byId.get(id);
  if (!current) return { ok: false, reason: 'That term no longer exists.' };
  const name = patch.name === undefined ? current.name : patch.name.trim();
  if (!name) return { ok: false, reason: 'A term needs a name.' };
  let aliases = patch.aliases === undefined ? current.aliases : [...new Set(patch.aliases.map((a) => a.trim()).filter(Boolean))];
  if (termKey(name) !== termKey(current.name) && !aliases.some((a) => termKey(a) === termKey(current.name))) {
    aliases = [...aliases, current.name];
  }
  aliases = aliases.filter((a) => termKey(a) !== termKey(name));
  const archived = patch.archived ?? current.archived;
  const next: MusicTerm = { ...current, name, aliases, updatedAt: nowISO(now) };
  if (archived) next.archived = true;
  else delete next.archived;
  const clash = collisions(next, vocab, termKeys(current));
  if (clash.length) return { ok: false, reason: `Not saved: ${clash.join('; ')}. One spelling cannot mean two terms.` };
  const terms = withStored(stored, next);
  const changed = reclassifiedItems(items, current.kind, vocab, vocabulary(terms));
  if (changed.length) {
    const n = changed.length;
    return {
      ok: false,
      reason: `Not saved: ${n} item${n === 1 ? ' is' : 's are'} written with a spelling you removed, and would quietly change what ${n === 1 ? 'it means' : 'they mean'}. Keep it as an alias, or change ${n === 1 ? 'that item' : 'those items'} first.`,
    };
  }
  return { ok: true, terms };
}

/**
 * Delete: custom terms only, and only while no item's value depends on it —
 * including text it is one of several claimants of, whose other claimant it
 * would otherwise silently hand the item to.
 */
export function planDeleteTerm(stored: MusicTerm[], items: PracticeItem[], id: ID): TermPlan {
  if (isBuiltInTerm(id)) return { ok: false, reason: 'A built-in term cannot be deleted. Archive it to stop offering it.' };
  const vocab = vocabulary(stored);
  if (!vocab.byId.has(id)) return { ok: false, reason: 'That term no longer exists.' };
  const users = itemsUsingTerm(items, id, vocab);
  if (users.length) {
    return {
      ok: false,
      reason: `Not deleted: ${users.length} item${users.length === 1 ? '' : 's'} use${users.length === 1 ? 's' : ''} this term. Archive it instead, or change those items first.`,
    };
  }
  return { ok: true, terms: stored.filter((t) => t.id !== id) };
}

/** A copy of `persian` with the three classifying fields read through one resolver. */
export function persianLabels(persian: PersianFields | undefined, vocab: Vocabulary): Record<TermField | 'gusheh', string> {
  return {
    dastgahAvaz: valueLabel(persian?.dastgahAvaz, vocab),
    form: valueLabel(persian?.form, vocab),
    composer: valueLabel(persian?.composer, vocab),
    gusheh: persian?.gusheh ?? '',
  };
}
