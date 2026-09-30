import { describe, expect, it } from 'vitest';
import { faCollator, hasPersianScript, normalizePersian, persianSearchMatch, translitAliases } from './farsi';
import { searchAliasTable } from './musicTerms';

describe('normalizePersian', () => {
  it('folds Arabic yeh and kaf to Persian forms', () => {
    // Arabic yeh (ي U+064A) and kaf (ك U+0643) → Persian ی / ک
    expect(normalizePersian('كرشمه')).toBe('کرشمه');
    expect(normalizePersian('افشاري')).toBe('افشاری');
  });

  it('collapses assorted spaces and trims', () => {
    expect(normalizePersian('  درآمد  شور  ')).toBe('درآمد شور');
  });

  it('normalizes Persian and Arabic-Indic digits to ASCII', () => {
    expect(normalizePersian('کتاب ۲')).toBe('کتاب 2');
    expect(normalizePersian('صفحه ٥')).toBe('صفحه 5');
  });

  it('tidies ZWNJ (dedupe, strip at edges) but keeps meaningful ones', () => {
    const zwnj = '‌';
    expect(normalizePersian(`پیش${zwnj}${zwnj}درآمد`)).toBe(`پیش${zwnj}درآمد`);
    expect(normalizePersian(`${zwnj}سه‌گاه${zwnj}`)).toBe('سه‌گاه');
  });

  it('is idempotent', () => {
    const once = normalizePersian('آواز افشاري ۳');
    expect(normalizePersian(once)).toBe(once);
  });

  it('leaves plain English untouched', () => {
    expect(normalizePersian('Classical Guitar')).toBe('Classical Guitar');
  });
});

describe('faCollator sorting', () => {
  it('sorts Persian titles in a stable, deterministic order', () => {
    const titles = ['ماهور', 'آواز افشاری', 'درآمد شور', 'چهارگاه'];
    const sorted = [...titles].sort((a, b) => faCollator.compare(a, b));
    // The exact order is locale-defined but must be stable across runs.
    expect([...titles].sort((a, b) => faCollator.compare(a, b))).toEqual(sorted);
    expect(sorted).toHaveLength(4);
  });

  it('orders digits numerically', () => {
    const items = ['کتاب 10', 'کتاب 2', 'کتاب 1'];
    expect([...items].sort((a, b) => faCollator.compare(a, b))).toEqual(['کتاب 1', 'کتاب 2', 'کتاب 10']);
  });
});

// Term spellings come from the ONE vocabulary (`musicTerms.ts`), which hands
// its table to these helpers; only title aliases unrelated to a term live here.
const TERMS = searchAliasTable();

describe('transliteration search aliases', () => {
  it('maps canonical Persian terms to Latin aliases — from the vocabulary', () => {
    expect(translitAliases('شور', TERMS)).toContain('shur');
    expect(translitAliases('چهارمضراب', TERMS)).toContain('chaharmezrab');
    expect(translitAliases('ابوالحسن صبا', TERMS)).toContain('saba');
  });

  it('keeps only the title aliases unrelated to a term in its own table', () => {
    expect(translitAliases('درآمد')).toContain('daramad');
    expect(translitAliases('شور')).toEqual([]);
  });

  it('folds spelling variants before lookup (Arabic yeh)', () => {
    expect(translitAliases('افشاري', TERMS)).toContain('afshari');
  });

  it('persianSearchMatch finds Farsi data by Latin query', () => {
    expect(persianSearchMatch('شور', 'shur', TERMS)).toBe(true);
    expect(persianSearchMatch('چهارمضراب صبا', 'chahar mezrab', TERMS)).toBe(true);
    expect(persianSearchMatch('درآمد شور', 'nava', TERMS)).toBe(false);
    expect(persianSearchMatch('بیات ترک', 'bayate tork', TERMS)).toBe(true);
  });

  it('persianSearchMatch finds Farsi data by Farsi query (variant-insensitive)', () => {
    expect(persianSearchMatch('كرشمه', 'کرشمه')).toBe(true); // Arabic vs Persian kaf
  });

  it('empty query matches everything', () => {
    expect(persianSearchMatch('anything', '')).toBe(true);
  });
});

describe('hasPersianScript', () => {
  it('detects Persian/Arabic script', () => {
    expect(hasPersianScript('شور')).toBe(true);
    expect(hasPersianScript('Shur')).toBe(false);
  });
});
