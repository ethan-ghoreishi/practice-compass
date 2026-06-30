import type { PathwayRoutine, PathwayStage, PathwayStep } from './types';

// ---------------------------------------------------------------------------
// Pure derivations over the editable pathway data (stages + steps live in the
// store now; progress is each step's `status`). Power the "where do I stand /
// what's next" experience for any pathway, any instrument.
// ---------------------------------------------------------------------------

export function stagesOfPathway(stages: PathwayStage[], pathwayId: string): PathwayStage[] {
  return stages.filter((s) => s.pathwayId === pathwayId).sort((a, b) => a.order - b.order);
}

export function stepsOfStage(steps: PathwayStep[], stageId: string): PathwayStep[] {
  return steps.filter((s) => s.stageId === stageId).sort((a, b) => a.order - b.order);
}

export function stepsOfPathway(steps: PathwayStep[], pathwayId: string): PathwayStep[] {
  return steps.filter((s) => s.pathwayId === pathwayId);
}

export interface StageProgress {
  done: number;
  inProgress: number;
  total: number;
  complete: boolean;
  started: boolean;
  percent: number;
}

export function stageProgress(steps: PathwayStep[]): StageProgress {
  const total = steps.length;
  let done = 0;
  let inProgress = 0;
  for (const s of steps) {
    if (s.status === 'done') done += 1;
    else if (s.status === 'in_progress') inProgress += 1;
  }
  return {
    done,
    inProgress,
    total,
    complete: total > 0 && done === total,
    started: done + inProgress > 0,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

/** The first stage that isn't fully complete (or the last stage if all done). */
export function currentStage(
  stages: PathwayStage[],
  steps: PathwayStep[],
  pathwayId: string,
): PathwayStage | null {
  const ordered = stagesOfPathway(stages, pathwayId);
  for (const stage of ordered) {
    if (!stageProgress(stepsOfStage(steps, stage.id)).complete) return stage;
  }
  return ordered[ordered.length - 1] ?? null;
}

/** The next step to work on within a stage: an in-progress one, else first to-do. */
export function nextStepInStage(steps: PathwayStep[], stageId: string): PathwayStep | null {
  const ordered = stepsOfStage(steps, stageId);
  return (
    ordered.find((s) => s.status === 'in_progress') ??
    ordered.find((s) => s.status === 'todo') ??
    null
  );
}

export interface PathwayProgress {
  stagesComplete: number;
  stagesTotal: number;
  stepsDone: number;
  stepsTotal: number;
}

export function pathwayProgress(
  stages: PathwayStage[],
  steps: PathwayStep[],
  pathwayId: string,
): PathwayProgress {
  const ordered = stagesOfPathway(stages, pathwayId);
  let stagesComplete = 0;
  let stepsDone = 0;
  let stepsTotal = 0;
  for (const stage of ordered) {
    const ss = stepsOfStage(steps, stage.id);
    const sp = stageProgress(ss);
    stepsDone += sp.done;
    stepsTotal += sp.total;
    if (sp.complete) stagesComplete += 1;
  }
  return { stagesComplete, stagesTotal: ordered.length, stepsDone, stepsTotal };
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
