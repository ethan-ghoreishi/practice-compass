// ---------------------------------------------------------------------------
// Farsi text helpers — normalization, sorting, and Latin search aliases.
// Pure and deterministic. Persian free text arrives with inconsistent Unicode
// (Arabic vs Persian yeh/kaf, assorted spaces, ZWNJ placement), so anything
// that compares, sorts, or searches Persian text normalizes first.
// ---------------------------------------------------------------------------

/** Collator for Persian display sorting (letters, then digits, case/diacritic-insensitive). */
export const faCollator = new Intl.Collator('fa', { numeric: true, sensitivity: 'base' });

const ZWNJ = '‌';

/**
 * Canonicalize Persian text for storage/comparison WITHOUT changing how it
 * reads: fold Arabic characters to their Persian equivalents, normalize
 * digits and assorted spaces, collapse runs of whitespace, and trim. ZWNJ is
 * preserved (it is meaningful in Persian) but de-duplicated and stripped at
 * word edges.
 */
export function normalizePersian(input: string): string {
  if (!input) return '';
  let s = input.normalize('NFC');

  // Arabic → Persian letter folding. NOTE: آ (alef madda, U+0622) is a proper
  // Persian letter and is preserved; only the hamza-carrying alef variants fold.
  s = s
    .replace(/ي/g, 'ی') // Arabic yeh → Persian yeh
    .replace(/ى/g, 'ی') // alef maqsura → Persian yeh
    .replace(/ك/g, 'ک') // Arabic kaf → Persian keheh
    .replace(/ة/g, 'ه') // teh marbuta → heh
    .replace(/ؤ/g, 'و') // waw with hamza → waw
    .replace(/[أإ]/g, 'ا'); // hamza-alef variants → bare alef

  // Arabic-Indic and Persian digits → ASCII (search/compare only; display data
  // is authored directly so this mostly guards pasted text).
  const digitMap: Record<string, string> = {};
  '٠١٢٣٤٥٦٧٨٩'.split('').forEach((d, i) => (digitMap[d] = String(i)));
  '۰۱۲۳۴۵۶۷۸۹'.split('').forEach((d, i) => (digitMap[d] = String(i)));
  s = s.replace(/[٠-٩۰-۹]/g, (d) => digitMap[d] ?? d);

  // Normalize spaces: NBSP / narrow-NBSP / tabs → plain space; strip harakat
  // (short-vowel diacritics) which are optional and inconsistent.
  s = s.replace(/[\u00a0\u202f\t]/g, ' ').replace(/[\u064b-\u0652\u0670]/g, '');

  // Tidy ZWNJ: collapse repeats, drop at word/space edges.
  s = s
    .replace(new RegExp(`${ZWNJ}{2,}`, 'g'), ZWNJ)
    .replace(new RegExp(`(^|\\s)${ZWNJ}`, 'g'), '$1')
    .replace(new RegExp(`${ZWNJ}(\\s|$)`, 'g'), '$1');

  // Collapse whitespace runs and trim.
  return s.replace(/\s+/g, ' ').trim();
}

/** True when a string contains any Persian/Arabic-script character. */
export function hasPersianScript(s: string): boolean {
  return /[؀-ۿ]/.test(s);
}

// Latin transliteration aliases: map common Persian repertoire terms to their
// Latin spellings so a user typing "shur" or "chahar mezrab" finds Farsi data.
// This is a SEARCH aid only — the canonical display value stays Persian.
const TRANSLIT_ALIASES: Record<string, string[]> = {
  شور: ['shur', 'shour'],
  ابوعطا: ['abuata', 'abu ata', "abu'ata"],
  'بیات ترک': ['bayat tork', 'bayate tork'],
  افشاری: ['afshari', 'afshar'],
  'آواز افشاری': ['avaz afshari', 'afshari'],
  دشتی: ['dashti'],
  نوا: ['nava', 'nova'],
  همایون: ['homayun', 'homayoun'],
  'بیات اصفهان': ['bayat esfahan', 'esfahan', 'isfahan'],
  سه‌گاه: ['segah', 'se gah'],
  چهارگاه: ['chahargah', 'chahar gah'],
  ماهور: ['mahur', 'mahoor'],
  'راست‌پنجگاه': ['rast panjgah', 'rastpanjgah'],
  چهارمضراب: ['chahar mezrab', 'chaharmezrab', 'chaharmizrab'],
  'پیش‌درآمد': ['pish daramad', 'pishdaramad'],
  درآمد: ['daramad', 'dar amad'],
  تصنیف: ['tasnif', 'tasnef'],
  رنگ: ['reng', 'rang'],
  ضربی: ['zarbi'],
  'ابوالحسن صبا': ['saba', 'abolhasan saba'],
  'درویش خان': ['darvish khan', 'darvishkhan'],
  'ردیف میرزا عبدالله': ['radif mirza abdollah', 'mirza abdollah'],
};

/** Latin alias strings for a Persian term (normalized), or [] if none known. */
export function translitAliases(persian: string): string[] {
  const norm = normalizePersian(persian);
  for (const [key, aliases] of Object.entries(TRANSLIT_ALIASES)) {
    if (normalizePersian(key) === norm) return aliases;
  }
  return [];
}

/**
 * Does `haystack` match `query`? Matches on the normalized Persian text OR any
 * Latin transliteration alias of a known term appearing anywhere in the
 * haystack, so "shur" finds "درآمد شور" and "کرشمه" finds "كرشمه".
 */
export function persianSearchMatch(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const normHay = normalizePersian(haystack).toLowerCase();
  if (normHay.includes(normalizePersian(query).toLowerCase())) return true;
  for (const [key, aliases] of Object.entries(TRANSLIT_ALIASES)) {
    const normKey = normalizePersian(key).toLowerCase();
    if (normHay.includes(normKey) && aliases.some((a) => a.includes(q) || q.includes(a))) return true;
  }
  return false;
}
