import type {
  BlockMode,
  BlockResult,
  CatalogEntry,
  FocusArea,
  GuitarFields,
  ID,
  Instrument,
  ISODate,
  ItemStatus,
  ItemType,
  Material,
  MaterialSourceType,
  MaterialStatus,
  PersianFields,
  PracticeBlock,
  PracticeItem,
  Lesson,
  Rating,
  Review,
  ReviewMode,
  ReviewType,
  StepStrand,
} from './types';
import { STRAND_TO_FOCUS, STRAND_TO_ITEM_TYPE } from './labels';
import { newId, nowISO } from './util';

// ---------------------------------------------------------------------------
// Factories that fill in defaults so callers (forms, seed, store) only supply
// what matters. Timestamps default to "now" but can be injected for tests.
// ---------------------------------------------------------------------------

export function createInstrument(
  input: { name: string; family?: string; active?: boolean },
  now: Date = new Date(),
): Instrument {
  const ts = nowISO(now);
  return {
    id: newId(),
    name: input.name.trim(),
    family: input.family?.trim() || undefined,
    active: input.active ?? true,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createMaterial(
  input: {
    instrumentId: ID;
    title: string;
    sourceType?: MaterialSourceType;
    sourceName?: string;
    parentTitle?: string;
    section?: string;
    teacherOrSource?: string;
    notes?: string;
    status?: MaterialStatus;
  },
  now: Date = new Date(),
): Material {
  const ts = nowISO(now);
  return {
    id: newId(),
    instrumentId: input.instrumentId,
    title: input.title.trim(),
    sourceType: input.sourceType ?? 'other',
    sourceName: input.sourceName?.trim() || undefined,
    parentTitle: input.parentTitle?.trim() || undefined,
    section: input.section?.trim() || undefined,
    teacherOrSource: input.teacherOrSource?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    status: input.status ?? 'active',
    createdAt: ts,
    updatedAt: ts,
  };
}

export interface CreateItemInput {
  instrumentId: ID;
  title: string;
  itemType?: ItemType;
  materialId?: ID;
  stageId?: ID;
  strand?: StepStrand;
  catalogKey?: string;
  assignedForLesson?: boolean;
  parentItemId?: ID;
  status?: ItemStatus;
  importance?: Rating;
  difficulty?: Rating;
  currentProblem?: string;
  primaryFocus?: FocusArea;
  bestStrategy?: string;
  teacherQuestion?: string;
  notes?: string;
  tags?: string[];
  nextReviewDate?: ISODate;
  reviewMode?: ReviewMode;
  reviewIntervalDays?: number;
  persian?: PersianFields;
  guitar?: GuitarFields;
}

export function createItem(input: CreateItemInput, now: Date = new Date()): PracticeItem {
  const ts = nowISO(now);
  return {
    id: newId(),
    instrumentId: input.instrumentId,
    materialId: input.materialId,
    stageId: input.stageId,
    strand: input.strand,
    catalogKey: input.catalogKey,
    assignedForLesson: input.assignedForLesson,
    parentItemId: input.parentItemId,
    title: input.title.trim(),
    itemType: input.itemType ?? 'other',
    status: input.status ?? 'new',
    importance: input.importance ?? 3,
    difficulty: input.difficulty ?? 3,
    currentProblem: input.currentProblem?.trim() || undefined,
    primaryFocus: input.primaryFocus,
    bestStrategy: input.bestStrategy?.trim() || undefined,
    teacherQuestion: input.teacherQuestion?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    tags: input.tags ?? [],
    nextReviewDate: input.nextReviewDate,
    reviewMode: input.reviewMode,
    reviewIntervalDays: input.reviewIntervalDays,
    lastPractisedAt: undefined,
    timesPractised: 0,
    totalMinutes: 0,
    lastResult: undefined,
    lastObservation: undefined,
    saturationWarning: false,
    persian: input.persian,
    guitar: input.guitar,
    createdAt: ts,
    updatedAt: ts,
  };
}

export interface CreateBlockInput {
  practiceItemId: ID;
  instrumentId: ID;
  materialId?: ID;
  startedAt?: string;
  endedAt?: string;
  durationMinutes: number;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  result?: BlockResult;
  observation?: string;
  nextAction?: string;
  bodyNote?: string;
  createdReview?: boolean;
}

export function createBlock(input: CreateBlockInput, now: Date = new Date()): PracticeBlock {
  const ts = nowISO(now);
  return {
    id: newId(),
    practiceItemId: input.practiceItemId,
    instrumentId: input.instrumentId,
    materialId: input.materialId,
    startedAt: input.startedAt ?? ts,
    endedAt: input.endedAt,
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    focus: input.focus,
    constraint: input.constraint?.trim() || undefined,
    result: input.result ?? 'not_logged',
    observation: input.observation?.trim() || undefined,
    nextAction: input.nextAction?.trim() || undefined,
    bodyNote: input.bodyNote?.trim() || undefined,
    createdReview: input.createdReview ?? false,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createReview(
  input: {
    practiceItemId: ID;
    dueDate: ISODate;
    reviewType: ReviewType;
    reason?: string;
  },
  now: Date = new Date(),
): Review {
  const ts = nowISO(now);
  return {
    id: newId(),
    practiceItemId: input.practiceItemId,
    dueDate: input.dueDate,
    reviewType: input.reviewType,
    reason: input.reason?.trim() || undefined,
    completedAt: undefined,
    result: undefined,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function createLesson(
  input: { instrumentId: ID; date: ISODate; notes?: string },
  now: Date = new Date(),
): Lesson {
  const ts = nowISO(now);
  return {
    id: newId(),
    instrumentId: input.instrumentId,
    date: input.date,
    notes: input.notes?.trim() || undefined,
    itemIds: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

/**
 * Turn a stage's reference-catalog suggestion into a real practice item.
 * Deliberately starts as "Not practised yet" (`status: 'new'`, zero stats):
 * adding a suggestion is organisation, not practice.
 */
export function itemFromCatalogEntry(
  entry: CatalogEntry,
  instrumentId: ID,
  now: Date = new Date(),
): PracticeItem {
  return createItem(
    {
      instrumentId,
      title: entry.title,
      stageId: entry.stageId,
      strand: entry.strand,
      catalogKey: entry.key,
      itemType: STRAND_TO_ITEM_TYPE[entry.strand],
      primaryFocus: STRAND_TO_FOCUS[entry.strand],
      currentProblem: entry.notes,
      notes: entry.about,
      persian: entry.persian,
      guitar: entry.guitar,
      status: 'new',
    },
    now,
  );
}
