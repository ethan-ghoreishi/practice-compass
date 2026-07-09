import type { ItemStatus, PracticeBlock, PracticeItem } from './types';
import {
  groupBlocksByItem,
  neglectedScore,
  overdueScore,
  scoreItems,
  type ItemScore,
} from './scoring';

// ---------------------------------------------------------------------------
// Recommendation engine: three calm, explained cards.
//   1. Best Next Focus  — the highest-priority thing to work on now
//   2. Quick Win        — achievable, worthwhile, not over-drilled
//   3. Maintenance      — keep something solid from quietly slipping
// ---------------------------------------------------------------------------

export type RecommendationKind = 'best' | 'quick_win' | 'maintenance';

export interface Recommendation {
  kind: RecommendationKind;
  score: ItemScore;
  reason: string;
}

export interface Recommendations {
  best: Recommendation | null;
  quickWin: Recommendation | null;
  maintenance: Recommendation | null;
}

const QUICK_WIN_STATUSES: ItemStatus[] = ['usable', 'fragile', 'repairing'];
const MAINTENANCE_STATUSES: ItemStatus[] = [
  'maintenance',
  'integrated',
  'performable',
  'dormant',
];

const STATUS_PHRASE: Partial<Record<ItemStatus, string>> = {
  new: 'still new',
  fragile: 'fragile',
  repairing: 'under repair',
  usable: 'usable but not yet solid',
  integrated: 'integrated',
  performable: 'performance-ready',
  maintenance: 'in maintenance',
  dormant: 'dormant',
};

/** Build a single neutral sentence explaining why an item surfaced. */
export function buildReason(score: ItemScore, kind: RecommendationKind): string {
  const { item, parts, overdueDays, daysSincePractised, daysToLesson } = score;
  const drivers: string[] = [];

  if (parts.lesson > 0 && daysToLesson != null) {
    drivers.push(
      daysToLesson <= 0 ? 'due for your class' : `for your class in ${daysToLesson}d`,
    );
  }
  if (item.importance >= 4) drivers.push('important');
  if (STATUS_PHRASE[item.status] && (parts.fragility >= 3 || item.status === 'dormant')) {
    drivers.push(STATUS_PHRASE[item.status]!);
  }
  if (overdueDays === 0) drivers.push('due today');
  else if (overdueDays !== null && overdueDays > 0) drivers.push(`${overdueDays}d overdue`);
  if (parts.teacher > 0) drivers.push('linked to a teacher question');
  if (parts.neglected >= 2 && daysSincePractised != null) {
    drivers.push(`untouched for ${daysSincePractised} days`);
  } else if (parts.neglected >= 2) {
    drivers.push('neglected');
  }

  const lead =
    kind === 'quick_win'
      ? 'A quick win'
      : kind === 'maintenance'
        ? 'Worth keeping fresh'
        : 'Top priority';

  if (drivers.length === 0) {
    return `${lead} — a good place to put your attention next.`;
  }
  return `${lead} — ${joinNicely(drivers)}.`;
}

function joinNicely(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

/**
 * Compute the three recommendation cards. Cards never repeat an item when an
 * alternative exists; saturated items are avoided unless nothing else is left.
 */
export function recommend(
  items: PracticeItem[],
  blocks: PracticeBlock[],
  now: Date,
  lessonDates?: Map<string, string>,
): Recommendations {
  const blocksByItem = groupBlocksByItem(blocks);
  const scored = scoreItems(items, blocksByItem, now, lessonDates); // already sorted desc
  const used = new Set<string>();

  const take = (s: ItemScore | undefined, kind: RecommendationKind): Recommendation | null => {
    if (!s) return null;
    used.add(s.item.id);
    return { kind, score: s, reason: buildReason(s, kind) };
  };

  // 1. Best Next Focus — highest score, prefer non-saturated.
  const best =
    scored.find((s) => !s.saturated && !used.has(s.item.id)) ??
    scored.find((s) => !used.has(s.item.id));

  const bestRec = take(best, 'best');

  // 2. Quick Win — achievable and worthwhile, not over-drilled.
  const quickWin = scored.find(
    (s) =>
      !used.has(s.item.id) &&
      !s.saturated &&
      s.item.difficulty <= 3 &&
      s.item.importance >= 3 &&
      QUICK_WIN_STATUSES.includes(s.item.status),
  );
  const quickWinRec = take(quickWin, 'quick_win');

  // 3. Maintenance — something solid that is due or has been neglected.
  const maintenance = scored.find(
    (s) =>
      !used.has(s.item.id) &&
      MAINTENANCE_STATUSES.includes(s.item.status) &&
      (overdueScore(s.item, now) > 0 || neglectedScore(s.item, now) >= 1),
  );
  const maintenanceRec = take(maintenance, 'maintenance');

  return { best: bestRec, quickWin: quickWinRec, maintenance: maintenanceRec };
}
