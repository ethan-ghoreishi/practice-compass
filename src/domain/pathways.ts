import type {
  CatalogEntry,
  PathwayRoutine,
  PathwayStage,
  PracticeItem,
  StepStrand,
} from './types';
import { catalogForStage } from './pathwaySeed';

// ---------------------------------------------------------------------------
// A pathway is now a *view over your items*: a stage contains the items you've
// placed in it, laid over a reference catalog of known gushes / lessons you can
// add with one tap. There is no separate "step" object — the item is the unit.
// ---------------------------------------------------------------------------

export type StageState = 'todo' | 'in_progress' | 'done';

const DONE_STATUSES = new Set(['integrated', 'performable', 'maintenance']);
const ACTIVE_STATUSES = new Set(['fragile', 'repairing', 'usable']);

/** Map an item's mastery status to a 3-state stage progress. */
export function itemStageState(item: PracticeItem): StageState {
  if (DONE_STATUSES.has(item.status)) return 'done';
  if (item.timesPractised > 0 || ACTIVE_STATUSES.has(item.status)) return 'in_progress';
  return 'todo';
}

/** A unit shown inside a stage: a catalog suggestion, your item, or both. */
export interface StageUnit {
  key: string;
  title: string;
  strand?: StepStrand;
  entry?: CatalogEntry; // the reference suggestion (if any)
  item?: PracticeItem; // your practice item (if added)
  state: StageState;
}

export function stagesOfPathway(stages: PathwayStage[], pathwayId: string): PathwayStage[] {
  return stages.filter((s) => s.pathwayId === pathwayId).sort((a, b) => a.order - b.order);
}

export function itemsInStage(items: PracticeItem[], stageId: string): PracticeItem[] {
  return items.filter((i) => i.stageId === stageId);
}

export function stageUnits(stage: PathwayStage, items: PracticeItem[]): StageUnit[] {
  const stageItems = itemsInStage(items, stage.id);
  const byCatalogKey = new Map<string, PracticeItem>();
  for (const it of stageItems) if (it.catalogKey) byCatalogKey.set(it.catalogKey, it);

  const catalog = catalogForStage(stage.id);
  const units: StageUnit[] = [];
  const shown = new Set<string>();

  for (const e of catalog) {
    const item = byCatalogKey.get(e.key);
    if (item) shown.add(item.id);
    units.push({
      key: e.key,
      title: item?.title ?? e.title,
      strand: e.strand,
      entry: e,
      item,
      state: item ? itemStageState(item) : 'todo',
    });
  }
  // Items the user added to this stage that aren't catalog entries.
  for (const it of stageItems) {
    if (shown.has(it.id)) continue;
    units.push({ key: it.id, title: it.title, strand: it.strand, item: it, state: itemStageState(it) });
  }
  return units;
}

export interface StageProgress {
  done: number;
  inProgress: number;
  total: number;
  addedItems: number;
  complete: boolean;
  started: boolean;
  percent: number;
}

export function stageProgress(units: StageUnit[]): StageProgress {
  const total = units.length;
  let done = 0;
  let inProgress = 0;
  let addedItems = 0;
  for (const u of units) {
    if (u.item) addedItems += 1;
    if (u.state === 'done') done += 1;
    else if (u.state === 'in_progress') inProgress += 1;
  }
  return {
    done,
    inProgress,
    total,
    addedItems,
    complete: total > 0 && done === total,
    started: done + inProgress > 0,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

/** The first stage that isn't fully complete (or the last stage if all done). */
export function currentStage(
  stages: PathwayStage[],
  items: PracticeItem[],
  pathwayId: string,
): PathwayStage | null {
  const ordered = stagesOfPathway(stages, pathwayId);
  for (const stage of ordered) {
    if (!stageProgress(stageUnits(stage, items)).complete) return stage;
  }
  return ordered[ordered.length - 1] ?? null;
}

/** The next unit to work on within a stage (an in-progress one, else first to-do). */
export function nextUnitInStage(stage: PathwayStage, items: PracticeItem[]): StageUnit | null {
  const units = stageUnits(stage, items);
  return units.find((u) => u.state === 'in_progress') ?? units.find((u) => u.state === 'todo') ?? null;
}

export interface PathwayProgress {
  stagesComplete: number;
  stagesTotal: number;
  done: number;
  total: number;
}

export function pathwayProgress(
  stages: PathwayStage[],
  items: PracticeItem[],
  pathwayId: string,
): PathwayProgress {
  const ordered = stagesOfPathway(stages, pathwayId);
  let stagesComplete = 0;
  let done = 0;
  let total = 0;
  for (const stage of ordered) {
    const sp = stageProgress(stageUnits(stage, items));
    done += sp.done;
    total += sp.total;
    if (sp.complete) stagesComplete += 1;
  }
  return { stagesComplete, stagesTotal: ordered.length, done, total };
}

export function routinesOfStage(routines: PathwayRoutine[], stageId: string): PathwayRoutine[] {
  return routines.filter((r) => r.stageId === stageId).sort((a, b) => a.order - b.order);
}

export function routinesOfPathway(routines: PathwayRoutine[], pathwayId: string): PathwayRoutine[] {
  return routines.filter((r) => r.pathwayId === pathwayId).sort((a, b) => a.order - b.order);
}

/** Group ordered stages by their optional `group` heading, preserving order. */
export function groupStages(stages: PathwayStage[]): { group: string | undefined; stages: PathwayStage[] }[] {
  const out: { group: string | undefined; stages: PathwayStage[] }[] = [];
  for (const stage of stages) {
    const last = out[out.length - 1];
    if (last && last.group === stage.group) last.stages.push(stage);
    else out.push({ group: stage.group, stages: [stage] });
  }
  return out;
}
