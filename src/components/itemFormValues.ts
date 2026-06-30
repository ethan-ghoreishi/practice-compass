import type {
  FocusArea,
  GuitarFields,
  ItemStatus,
  ItemType,
  PersianFields,
  PracticeItem,
  Rating,
} from '../domain';

export interface ItemFormValues {
  instrumentId: string;
  title: string;
  materialId: string;
  itemType: ItemType;
  status: ItemStatus;
  importance: Rating;
  difficulty: Rating;
  primaryFocus: FocusArea | '';
  currentProblem: string;
  bestStrategy: string;
  teacherQuestion: string;
  tags: string;
  persian: PersianFields;
  guitar: GuitarFields;
}

export function emptyItemValues(instrumentId: string): ItemFormValues {
  return {
    instrumentId,
    title: '',
    materialId: '',
    itemType: 'phrase',
    status: 'new',
    importance: 3,
    difficulty: 3,
    primaryFocus: '',
    currentProblem: '',
    bestStrategy: '',
    teacherQuestion: '',
    tags: '',
    persian: {},
    guitar: {},
  };
}

export function itemToValues(item: PracticeItem): ItemFormValues {
  return {
    instrumentId: item.instrumentId,
    title: item.title,
    materialId: item.materialId ?? '',
    itemType: item.itemType,
    status: item.status,
    importance: item.importance,
    difficulty: item.difficulty,
    primaryFocus: item.primaryFocus ?? '',
    currentProblem: item.currentProblem ?? '',
    bestStrategy: item.bestStrategy ?? '',
    teacherQuestion: item.teacherQuestion ?? '',
    tags: item.tags.join(', '),
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
    materialId: v.materialId || undefined,
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
    persian: cleanRecord(v.persian),
    guitar: cleanRecord(v.guitar),
  };
}
