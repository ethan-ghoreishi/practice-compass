import type { BlockResult, ISODate, PracticeBlock, PracticeDB, PracticeItem } from './types';
import { RESULT_LABELS, RESULT_RANK } from './labels';
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
  /**
   * What the blocks INSIDE the selected period actually recorded, per item —
   * the best result reached in range, and the final one recorded in range.
   * The item's own `lastResult` is CURRENT state and may have moved on since;
   * attributing it to an earlier period is how this report used to announce an
   * improvement that the period's own blocks never showed.
   */
  periodResults: { item: PracticeItem; best: BlockResult; last: BlockResult }[];
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

  // Everything below reads the IN-RANGE blocks. `RESULT_RANK` orders them; a
  // `not_logged` block is time recorded with no judgement, so it is not
  // evidence of anything and is excluded from both figures.
  const periodResults = worked
    .map((w) => {
      const judged = rangeBlocks
        .filter((b) => b.practiceItemId === w.item.id && b.result !== 'not_logged')
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
      if (judged.length === 0) return null;
      const best = judged.reduce((acc, b) => (RESULT_RANK[b.result] > RESULT_RANK[acc] ? b.result : acc), judged[0].result);
      return { item: w.item, best, last: judged[judged.length - 1].result };
    })
    .filter((r): r is { item: PracticeItem; best: BlockResult; last: BlockResult } => r !== null);

  const fragile = items.filter((i) => i.status === 'fragile' || i.status === 'repairing');

  // Open questions are CURRENT state, not events inside the range — they are
  // labelled that way rather than presented as part of the period's history.
  const openQuestions = openQuestionsForInstrument(db.lessonAgenda, items, instrumentId, db.blocks);
  const lessonQuestions = opts.lessonId
    ? openQuestionsForLessonId(db.lessonAgenda, items, opts.lessonId, db.blocks)
    : [];
  const lessonHistory = opts.lessonId
    ? questionsForLessonId(db.lessonAgenda, items, opts.lessonId, db.blocks).filter((q) => !!q.askedAt)
    : [];

  const byItem = groupBlocksByItem(db.blocks);
  const repeated = items.filter((i) => lastResultsAllSame(byItem.get(i.id) ?? []));

  const suggestedFocus = scoreItems(items, byItem, now, preparationDatesByItem(db.lessonAgenda, db.lessons, now))
    .slice(0, 3)
    .map((s) => s.item);

  return {
    instrumentName,
    worked,
    periodResults,
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

  // What the period's OWN blocks recorded. Never "is now X" — that would be
  // the item's current state, which later practice may already have changed —
  // and never "improved" merely because an absolute result ranks highly.
  push('Results recorded in this period:');
  if (data.periodResults.length === 0) push('- (no results recorded in this range)');
  for (const r of data.periodResults) {
    const best = RESULT_LABELS[r.best].toLowerCase();
    const ended = RESULT_LABELS[r.last].toLowerCase();
    push(`- ${r.item.title}: best ${best}; last recorded ${ended}.`);
  }
  push();

  push('Currently shaky or being repaired (current status, not this period):');
  if (data.fragile.length === 0) push('- (nothing currently shaky)');
  for (const i of data.fragile) {
    push(`- ${i.title}`);
  }
  push();

  // `openQuestions` is every open question on the instrument and
  // `lessonQuestions` the chosen class's own, so the two OVERLAP by
  // construction — every question aimed at that class is in both. The DATA
  // keeps them whole (each answers its own question honestly); the rendered
  // sheet is what goes into the room, and printing the same question under two
  // headings is exactly the duplicated next-class agenda this model exists to
  // end. So the class's own questions are listed once, under the class, and the
  // general list keeps only what is left — labelled for what it then is.
  const forThisClass = new Set(data.lessonQuestions.map((q) => q.id));
  const otherOpen = data.openQuestions.filter((q) => !forThisClass.has(q.id));

  if (data.lessonQuestions.length > 0) {
    push('To ask at the class this report is for:');
    data.lessonQuestions.forEach((q, idx) => {
      push(`${idx + 1}. ${q.question}${q.title ? ` (${q.title})` : ''}`);
    });
    push();
  }

  push(
    forThisClass.size > 0
      ? 'Other open questions (not for that class):'
      : 'Open questions for teacher (current, not part of the period above):',
  );
  if (otherOpen.length === 0) push('- (none recorded)');
  otherOpen.forEach((q, idx) => {
    const where = q.unassigned ? ' [unassigned]' : '';
    push(`${idx + 1}. ${q.question}${q.title ? ` (${q.title})` : ''}${where}`);
  });
  push();

  if (data.lessonHistory.length > 0) {
    push('Already asked at that class:');
    data.lessonHistory.forEach((q, idx) => {
      push(`${idx + 1}. ${q.question}${q.answer ? ` — answer: ${q.answer}` : ''}`);
    });
    push();
  }

  if (data.repeated.length > 0) {
    push('Currently repeating the same result (current pattern, not this period):');
    for (const i of data.repeated) {
      push(`- ${i.title}`);
    }
    push();
  }

  push('Suggested lesson focus (current):');
  if (data.suggestedFocus.length === 0) push('- (no items yet)');
  data.suggestedFocus.forEach((i, idx) => {
    push(`${idx + 1}. ${i.title}`);
  });

  return lines.join('\n');
}

export function buildTeacherReport(db: PracticeDB, opts: ReportOptions): string {
  return renderReportText(buildReportData(db, opts));
}
