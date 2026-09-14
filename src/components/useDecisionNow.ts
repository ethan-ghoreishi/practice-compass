import { useEffect, useState } from 'react';
import { todayISODate } from '../domain';

/**
 * The `now` a DECISION screen should reason from.
 *
 * Every pure decision in this app takes an explicit `now`, which means a
 * screen that froze one at mount keeps deciding with yesterday's date after
 * midnight — a plan that still calls a passed class "tomorrow", a close screen
 * that would write a date a day out from the one it is showing.
 *
 * It changes only when the LOCAL CALENDAR DAY changes, or when the page comes
 * back into view (a phone that slept through midnight gets no timer ticks).
 * Not once a minute: these screens hold a draft — half-typed observations,
 * swapped plan segments — and re-rendering them every minute for a value that
 * did not change is churn the practice screens deliberately avoid. Today and
 * Insights keep their own per-minute clocks; those show elapsed figures, which
 * genuinely change every minute.
 *
 * The returned Date is a NEW object only when the day actually rolled, so it
 * is safe as a `useMemo`/`useEffect` dependency.
 */
export function useDecisionNow(checkMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refreshIfDayChanged = () => {
      setNow((prev) => (todayISODate(prev) === todayISODate(new Date()) ? prev : new Date()));
    };
    const id = setInterval(refreshIfDayChanged, checkMs);
    document.addEventListener('visibilitychange', refreshIfDayChanged);
    window.addEventListener('focus', refreshIfDayChanged);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refreshIfDayChanged);
      window.removeEventListener('focus', refreshIfDayChanged);
    };
  }, [checkMs]);

  return now;
}
