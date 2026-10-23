import type { ISODate, ISODateTime } from './types';

// ---------------------------------------------------------------------------
// Small, dependency-free helpers for ids and dates.
//
// Domain logic never calls `new Date()` implicitly: callers pass an explicit
// `now` so scoring, scheduling and insights are deterministic and testable.
// ---------------------------------------------------------------------------

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for very old runtimes / SSR.
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function nowISO(now: Date = new Date()): ISODateTime {
  return now.toISOString();
}

/** Calendar date (no time) in the host's local timezone, as `YYYY-MM-DD`. */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISODate(now: Date = new Date()): ISODate {
  return toISODate(now);
}

/** Parse a `YYYY-MM-DD` string as a local midnight Date. */
export function parseISODate(d: ISODate): Date {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addDaysISODate(date: ISODate, days: number): ISODate {
  return toISODate(addDays(parseISODate(date), days));
}

/**
 * Whole calendar days between two dates (b - a), comparing local midnights.
 * Positive when `b` is later than `a`.
 */
export function dayDiff(a: Date, b: Date): number {
  const am = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bm = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bm - am) / 86_400_000);
}

/** Days elapsed since an ISO datetime up to `now` (>= 0, calendar-day based). */
export function daysSince(iso: ISODateTime | undefined, now: Date): number | undefined {
  if (!iso) return undefined;
  return dayDiff(new Date(iso), now);
}

export function hoursSince(iso: ISODateTime, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / 3_600_000;
}

/**
 * An owner value inside generated text, as a first-strong BIDI ISOLATE
 * (U+2068…U+2069): the plain-text counterpart of `dir="auto"`, so a Farsi
 * title followed by digits resolves its own direction instead of reordering
 * the English words around it — on screen, and in copied, downloaded and
 * printed text alike. It detects no script and reorders nothing. Each line is
 * isolated on its own, because a newline ends every isolate; a line the owner
 * already isolated whole is left exactly as it is. Stored values never carry
 * these marks: only generated text does.
 */
export function isolate(value: string): string {
  return value
    .split('\n')
    .map((line) => (line === '' || isolatedWhole(line) ? line : `⁨${line}⁩`))
    .join('\n');
}

/** True when the line's first character opens an isolate that its last character closes. */
function isolatedWhole(line: string): boolean {
  if (!/^[⁦-⁨]/.test(line)) return false;
  let depth = 0;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c >= '⁦' && c <= '⁨') depth += 1;
    else if (c === '⁩') {
      depth -= 1;
      if (depth === 0) return i === line.length - 1;
    }
  }
  return false;
}

export function clampRating(n: number): 1 | 2 | 3 | 4 | 5 {
  const r = Math.max(1, Math.min(5, Math.round(n)));
  return r as 1 | 2 | 3 | 4 | 5;
}
