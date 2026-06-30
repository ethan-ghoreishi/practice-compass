import { dayDiff, parseISODate } from '../domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateTimeISO(iso: string): string {
  return formatShortDate(new Date(iso));
}

/** Friendly relative day from an ISODate (calendar) string. */
export function relativeDay(dateISO: string, now: Date = new Date()): string {
  const diff = dayDiff(now, parseISODate(dateISO)); // +future, -past
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 1) return `in ${diff} days`;
  return `${-diff} days ago`;
}

/** Friendly relative day from a full ISO datetime. */
export function relativeFromDateTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return 'never';
  const diff = dayDiff(new Date(iso), now); // days since
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
