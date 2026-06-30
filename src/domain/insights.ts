import type { FocusArea, PracticeDB, PracticeItem } from './types';
import { FOCUS_LABELS, RESULT_LABELS, RESULT_RANK } from './labels';
import {
  daysSinceTouched,
  groupBlocksByItem,
  lastResultsAllSame,
  scoreItems,
} from './scoring';
import {
  blocksInWindow,
  fragileItems,
  instrumentBalance,
  itemsWithTeacherQuestion,
  neglectedImportantItems,
} from './selectors';
import { daysSince } from './util';

// ---------------------------------------------------------------------------
// Weekly / monthly insights. Calm, neutral, never guilt-driven. Each insight
// is a small card the Insights screen renders, and one is surfaced on Today.
// ---------------------------------------------------------------------------

export type InsightTone = 'neutral' | 'positive' | 'attention';

export interface Insight {
  id: string;
  category: string;
  title: string;
  body: string;
  tone: InsightTone;
}

function nameOf(item: PracticeItem): string {
  return item.title;
}

function listNames(items: PracticeItem[], max = 3): string {
  const names = items.slice(0, max).map(nameOf);
  const extra = items.length - names.length;
  return extra > 0 ? `${names.join(', ')} and ${extra} more` : names.join(', ');
}

export function generateInsights(db: PracticeDB, now: Date, windowDays = 7): Insight[] {
  const insights: Insight[] = [];
  const window = blocksInWindow(db.blocks, now, windowDays);
  const byItem = groupBlocksByItem(db.blocks);

  // 1. Instrument balance ----------------------------------------------------
  const balance = instrumentBalance(db.instruments, db.blocks, now, windowDays).filter(
    (r) => r.minutes > 0,
  );
  if (balance.length > 0) {
    const summary = balance.map((r) => `${r.instrumentName} ${r.percent}%`).join(', ');
    const lopsided = balance[0].percent >= 60 && balance.length > 1;
    insights.push({
      id: 'instrument-balance',
      category: 'Balance',
      title: 'Instrument balance',
      body: lopsided
        ? `Over the last ${windowDays} days: ${summary}. Is that the balance you intended?`
        : `Over the last ${windowDays} days: ${summary}.`,
      tone: lopsided ? 'attention' : 'neutral',
    });
  }

  // 1b. Idle instruments (have items, no recent practice) --------------------
  for (const inst of db.instruments.filter((i) => i.active)) {
    const items = db.items.filter((it) => it.instrumentId === inst.id);
    if (items.length === 0) continue;
    const lastBlock = db.blocks
      .filter((b) => b.instrumentId === inst.id)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
    const idleDays = lastBlock ? daysSince(lastBlock.startedAt, now) ?? 0 : 999;
    if (idleDays >= 7 && idleDays < 999) {
      const fragile = items.filter((it) => it.status === 'fragile' || it.status === 'repairing');
      const tail = fragile.length > 0 ? `, and ${fragile.length} of its items are still fragile` : '';
      insights.push({
        id: `idle-${inst.id}`,
        category: 'Balance',
        title: `${inst.name} is going quiet`,
        body: `${inst.name} hasn't been practised for ${idleDays} days${tail}.`,
        tone: 'attention',
      });
    }
  }

  // 2. Most practised --------------------------------------------------------
  const minutesByItem = new Map<string, number>();
  for (const b of window) {
    minutesByItem.set(b.practiceItemId, (minutesByItem.get(b.practiceItemId) ?? 0) + b.durationMinutes);
  }
  const topItemId = [...minutesByItem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topItem = db.items.find((i) => i.id === topItemId);
  if (topItem && topItemId) {
    const mins = minutesByItem.get(topItemId) ?? 0;
    const count = window.filter((b) => b.practiceItemId === topItemId).length;
    insights.push({
      id: 'most-practised',
      category: 'Time',
      title: 'Where your time went',
      body: `Most of your time went to "${topItem.title}" — ${mins} min across ${count} block${count === 1 ? '' : 's'}.`,
      tone: 'neutral',
    });
  }

  // 3. Fragile items ---------------------------------------------------------
  const fragile = fragileItems(db.items);
  if (fragile.length > 0) {
    insights.push({
      id: 'fragile',
      category: 'Attention',
      title: 'Fragile material',
      body: `${fragile.length} item${fragile.length === 1 ? ' is' : 's are'} fragile or under repair: ${listNames(fragile)}.`,
      tone: 'attention',
    });
  }

  // 4. Neglected important ---------------------------------------------------
  const neglected = neglectedImportantItems(db.items, now);
  if (neglected.length > 0) {
    const worst = neglected[0];
    insights.push({
      id: 'neglected-important',
      category: 'Attention',
      title: 'Important but neglected',
      body: `"${worst.title}" is important but hasn't been touched for ${daysSinceTouched(worst, now)} days.`,
      tone: 'attention',
    });
  }

  // 5 & 6. Overworked / repeated "same" -------------------------------------
  for (const item of db.items) {
    const blocks = byItem.get(item.id) ?? [];
    if (lastResultsAllSame(blocks)) {
      insights.push({
        id: `same-${item.id}`,
        category: 'Strategy',
        title: 'Stuck on the same result',
        body: `"${item.title}" has produced the same result three times. Try a different strategy or ask your teacher.`,
        tone: 'attention',
      });
    }
  }

  // 7. Items that improved ---------------------------------------------------
  const improved = db.items.filter(
    (i) => i.lastResult && RESULT_RANK[i.lastResult] >= RESULT_RANK.stable_alone,
  );
  if (improved.length > 0) {
    const star = improved.sort((a, b) => RESULT_RANK[b.lastResult!] - RESULT_RANK[a.lastResult!])[0];
    insights.push({
      id: 'improved',
      category: 'Progress',
      title: 'Holding together',
      body: `"${star.title}" reached "${RESULT_LABELS[star.lastResult!]}" after ${star.timesPractised} block${star.timesPractised === 1 ? '' : 's'}.`,
      tone: 'positive',
    });
  }

  // 8. Common focus areas (with cross-instrument detection) ------------------
  const focusCount = new Map<FocusArea, Set<string>>();
  const focusTotals = new Map<FocusArea, number>();
  for (const b of window) {
    focusTotals.set(b.focus, (focusTotals.get(b.focus) ?? 0) + 1);
    const set = focusCount.get(b.focus) ?? new Set<string>();
    set.add(b.instrumentId);
    focusCount.set(b.focus, set);
  }
  const topFocus = [...focusTotals.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topFocus && topFocus[1] >= 2) {
    const [focus, count] = topFocus;
    const instruments = focusCount.get(focus)?.size ?? 1;
    const cross = instruments >= 2
      ? ' across more than one instrument — this may be a cross-instrument bottleneck'
      : '';
    insights.push({
      id: 'common-focus',
      category: 'Patterns',
      title: 'A recurring focus',
      body: `${count} blocks this week focused on ${FOCUS_LABELS[focus].toLowerCase()}${cross}.`,
      tone: cross ? 'attention' : 'neutral',
    });
  }

  // 9. Teacher questions -----------------------------------------------------
  const teacherQs = itemsWithTeacherQuestion(db.items);
  if (teacherQs.length > 0) {
    insights.push({
      id: 'teacher-questions',
      category: 'Lesson',
      title: 'Questions for your teacher',
      body: `You have ${teacherQs.length} open question${teacherQs.length === 1 ? '' : 's'} to raise: ${listNames(teacherQs)}.`,
      tone: 'neutral',
    });
  }

  // 10. Suggested next 3 priorities -----------------------------------------
  const scored = scoreItems(db.items, byItem, now).slice(0, 3);
  if (scored.length > 0) {
    insights.push({
      id: 'next-priorities',
      category: 'Plan',
      title: 'Suggested next three',
      body: scored.map((s, i) => `${i + 1}. ${s.item.title}`).join('  ·  '),
      tone: 'neutral',
    });
  }

  return insights;
}

/** Pick one insight to surface on Today, rotating gently day to day. */
export function insightOfTheDay(insights: Insight[], now: Date): Insight | null {
  if (insights.length === 0) return null;
  // Prefer something actionable, then rotate by day so it isn't always the same.
  const ranked = [...insights].sort((a, b) => toneWeight(b.tone) - toneWeight(a.tone));
  const pool = ranked.filter((i) => i.tone !== 'neutral');
  const chosen = pool.length > 0 ? pool : ranked;
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  return chosen[dayIndex % chosen.length];
}

function toneWeight(tone: InsightTone): number {
  return tone === 'attention' ? 2 : tone === 'positive' ? 1 : 0;
}
