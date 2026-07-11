import type {
  FocusArea,
  GuitarFields,
  ItemStatus,
  ItemType,
  PersianFields,
  PracticeItem,
  Rating,
  ReviewMode,
} from '../domain';

export interface ItemFormValues {
  instrumentId: string;
  title: string;
  materialId: string;
  stageId: string;
  /** Link to a lesson at creation time (create flow only). */
  lessonId: string;
  /** Parent work for passages/parts. */
  parentItemId: string;
  itemType: ItemType;
  status: ItemStatus;
  importance: Rating;
  difficulty: Rating;
  primaryFocus: FocusArea | '';
  currentProblem: string;
  bestStrategy: string;
  teacherQuestion: string;
  tags: string;
  reviewMode: ReviewMode;
  reviewIntervalDays: string;
  persian: PersianFields;
  guitar: GuitarFields;
}

export function emptyItemValues(instrumentId: string): ItemFormValues {
  return {
    instrumentId,
    title: '',
    materialId: '',
    stageId: '',
    lessonId: '',
    parentItemId: '',
    itemType: 'phrase',
    status: 'new',
    importance: 3,
    difficulty: 3,
    primaryFocus: '',
    currentProblem: '',
    bestStrategy: '',
    teacherQuestion: '',
    tags: '',
    reviewMode: 'auto',
    reviewIntervalDays: '',
    persian: {},
    guitar: {},
  };
}

export function itemToValues(item: PracticeItem): ItemFormValues {
  return {
    instrumentId: item.instrumentId,
    title: item.title,
    materialId: item.materialId ?? '',
    stageId: item.stageId ?? '',
    lessonId: '',
    parentItemId: item.parentItemId ?? '',
    itemType: item.itemType,
    status: item.status,
    importance: item.importance,
    difficulty: item.difficulty,
    primaryFocus: item.primaryFocus ?? '',
    currentProblem: item.currentProblem ?? '',
    bestStrategy: item.bestStrategy ?? '',
    teacherQuestion: item.teacherQuestion ?? '',
    tags: item.tags.join(', '),
    reviewMode: item.reviewMode ?? 'auto',
    reviewIntervalDays: item.reviewIntervalDays ? String(item.reviewIntervalDays) : '',
    persian: item.persian ?? {},
    guitar: item.guitar ?? {},
  };
}

function cleanRecord<T extends object>(obj: T): T | undefined {
  const entries = Object.entries(obj).filter(([, val]) => val && String(val).trim());
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries.map(([k, val]) => [k, String(val).trim()])) as T;
}

export function valuesToCreateInput(v: ItemFormValues) {
  return {
    instrumentId: v.instrumentId,
    title: v.title.trim(),
    materialId: v.materialId && v.materialId !== '__new__' ? v.materialId : undefined,
    stageId: v.stageId || undefined,
    parentItemId: v.parentItemId || undefined,
    itemType: v.itemType,
    status: v.status,
    importance: v.importance,
    difficulty: v.difficulty,
    primaryFocus: v.primaryFocus || undefined,
    currentProblem: v.currentProblem.trim() || undefined,
    bestStrategy: v.bestStrategy.trim() || undefined,
    teacherQuestion: v.teacherQuestion.trim() || undefined,
    tags: v.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    reviewMode: v.reviewMode,
    reviewIntervalDays: v.reviewMode === 'interval' ? Math.max(1, Number(v.reviewIntervalDays) || 7) : undefined,
    persian: cleanRecord(v.persian),
    guitar: cleanRecord(v.guitar),
  };
}
