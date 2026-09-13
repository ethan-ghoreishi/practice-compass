import type { ISODate, PracticeBlock, PracticeDB, PracticeItem } from './types';
import { RESULT_RANK } from './labels';
import { groupBlocksByItem, lastResultsAllSame, scoreItems } from './scoring';
import { preparationDatesByItem } from './lessonAgenda';
import { openQuestionsForInstrument, openQuestionsForLessonId, questionsForLessonId, type ClassQuestion } from './questions';
import { parseISODate } from './util';

// ---------------------------------------------------------------------------
// Copyable practice report for a lesson, scoped to one instrument and a date
// range. Output is plain text (markdown-friendly) so it pastes anywhere.
// ---------------------------------------------------------------------------

export interface ReportOptions {
  instrumentId: string;
  from: ISODate;
  to: ISODate;
  now: Date;
  /**
   * The class this report is FOR, when the owner chose one. Its agenda and
   * history are then reported as that class's own — never mixed in with
   * today's open questions as if they had been events inside the report range.
   */
  lessonId?: string;
}

function inRange(block: PracticeBlock, from: ISODate, to: ISODate): boolean {
  const t = new Date(block.startedAt).getTime();
  const lo = parseISODate(from).getTime();
  // include the whole "to" day
  const hi = parseISODate(to).getTime() + 86_400_000 - 1;
  return t >= lo && t <= hi;
}

export interface ReportData {
  instrumentName: string;
  worked: { item: PracticeItem; blocks: number; minutes: number }[];
  improved: PracticeItem[];
  fragile: PracticeItem[];
  /** Still-open questions on this instrument, whatever class they name. */
  openQuestions: ClassQuestion[];
  /** The chosen class's own agenda, when one was chosen. */
  lessonQuestions: ClassQuestion[];
  /** Of those, the ones already asked — history, labelled as such. */
  lessonHistory: ClassQuestion[];
  repeated: PracticeItem[];
  suggestedFocus: PracticeItem[];
  from: ISODate;
  to: ISODate;
}

export function buildReportData(db: PracticeDB, opts: ReportOptions): ReportData {
  const { instrumentId, from, to, now } = opts;
  const instrumentName =
    db.instruments.find((i) => i.id === instrumentId)?.name ?? 'Instrument';
  const items = db.items.filter((i) => i.instrumentId === instrumentId);
  const itemIds = new Set(items.map((i) => i.id));
  const rangeBlocks = db.blocks.filter(
    (b) => itemIds.has(b.practiceItemId) && inRange(b, from, to),
  );

  // Worked-on aggregation
  const agg = new Map<string, { blocks: number; minutes: number }>();
  for (const b of rangeBlocks) {
    const cur = agg.get(b.practiceItemId) ?? { blocks: 0, minutes: 0 };
    cur.blocks += 1;
    cur.minutes += b.durationMinutes;
    agg.set(b.practiceItemId, cur);
  }
  const worked = [...agg.entries()]
    .map(([id, v]) => ({ item: items.find((i) => i.id === id)!, ...v }))
    .filter((w) => w.item)
    .sort((a, b) => b.minutes - a.minutes);

  const workedIds = new Set(worked.map((w) => w.item.id));

  const improved = items
    .filter((i) => workedIds.has(i.id))
    .filter((i) => i.lastResult && RESULT_RANK[i.lastResult] >= RESULT_RANK.stable_alone);

  const fragile = items.filter((i) => i.status === 'fragile' || i.status === 'repairing');

  // Open questions are CURRENT state, not events inside the range — they are
  // labelled that way rather than presented as part of the period's history.
  const openQuestions = openQuestionsForInstrument(db.lessonAgenda, items, instrumentId);
  const lessonQuestions = opts.lessonId
    ? openQuestionsForLessonId(db.lessonAgenda, items, opts.lessonId)
    : [];
  const lessonHistory = opts.lessonId
    ? questionsForLessonId(db.lessonAgenda, items, opts.lessonId).filter((q) => !!q.askedAt)
    : [];

  const byItem = groupBlocksByItem(db.blocks);
  const repeated = items.filter((i) => lastResultsAllSame(byItem.get(i.id) ?? []));

  const suggestedFocus = scoreItems(items, byItem, now, preparationDatesByItem(db.lessonAgenda, db.lessons, now))
    .slice(0, 3)
    .map((s) => s.item);

  return {
    instrumentName,
    worked,
    improved,
    fragile,
    openQuestions,
    lessonQuestions,
    lessonHistory,
    repeated,
    suggestedFocus,
    from,
    to,
  };
}

export function renderReportText(data: ReportData): string {
  const lines: string[] = [];
  const push = (s = '') => lines.push(s);

  push(`Practice report: ${data.instrumentName}`);
  push(`(${data.from} → ${data.to})`);
  push();

  push('Worked on:');
  if (data.worked.length === 0) push('- (no logged practice in this range)');
  for (const w of data.worked) {
    push(`- ${w.item.title}: ${w.blocks} block${w.blocks === 1 ? '' : 's'}, ${w.minutes} minutes`);
  }
  push();

  push('Improved:');
  if (data.improved.length === 0) push('- (nothing marked as improved yet)');
  for (const i of data.improved) {
    push(`- ${i.title} is now ${labelResult(i)}.`);
  }
  push();

  push('Still fragile:');
  if (data.fragile.length === 0) push('- (nothing currently fragile)');
  for (const i of data.fragile) {
    const problem = i.currentProblem ? ` — ${i.currentProblem}` : '';
    push(`- ${i.title}${problem}`);
  }
  push();

  push('Open questions for teacher (current, not part of the period above):');
  if (data.openQuestions.length === 0) push('- (none recorded)');
  data.openQuestions.forEach((q, idx) => {
    const where = q.unassigned ? ' [unassigned]' : '';
    push(`${idx + 1}. ${q.question}${q.title ? ` (${q.title})` : ''}${where}`);
  });
  push();

  if (data.lessonQuestions.length > 0) {
    push('To ask at the class this report is for:');
    data.lessonQuestions.forEach((q, idx) => {
      push(`${idx + 1}. ${q.question}${q.title ? ` (${q.title})` : ''}`);
    });
    push();
  }

  if (data.lessonHistory.length > 0) {
    push('Already asked at that class:');
    data.lessonHistory.forEach((q, idx) => {
      push(`${idx + 1}. ${q.question}${q.answer ? ` — answer: ${q.answer}` : ''}`);
    });
    push();
  }

  if (data.repeated.length > 0) {
    push('Repeated problems (same result several times):');
    for (const i of data.repeated) {
      push(`- ${i.title}${i.currentProblem ? ` — ${i.currentProblem}` : ''}`);
    }
    push();
  }

  push('Suggested lesson focus:');
  if (data.suggestedFocus.length === 0) push('- (no items yet)');
  data.suggestedFocus.forEach((i, idx) => {
    push(`${idx + 1}. ${i.title}${i.currentProblem ? ` — ${i.currentProblem}` : ''}`);
  });

  return lines.join('\n');
}

function labelResult(item: PracticeItem): string {
  switch (item.lastResult) {
    case 'stable_alone':
      return 'stable on its own';
    case 'stable_in_context':
      return 'stable in context';
    case 'performable':
      return 'performance-ready';
    default:
      return 'improving';
  }
}

export function buildTeacherReport(db: PracticeDB, opts: ReportOptions): string {
  return renderReportText(buildReportData(db, opts));
}
