import type {
  Curriculum,
  CurriculumProgress,
  CurriculumStage,
  CurriculumStep,
  StepStatus,
} from './types';

// ---------------------------------------------------------------------------
// Pure derivations over (static curriculum content + persisted progress).
// These power the "where do I stand / what's next" experience.
// ---------------------------------------------------------------------------

export function stepsForStage(
  curriculum: Curriculum,
  progress: CurriculumProgress,
  stageId: string,
): CurriculumStep[] {
  const fixed = curriculum.steps.filter((s) => s.stageId === stageId);
  const custom = progress.customSteps.filter((s) => s.stageId === stageId);
  return [...fixed, ...custom].sort((a, b) => a.order - b.order);
}

export function statusOf(progress: CurriculumProgress, stepId: string): StepStatus {
  return progress.stepStatus[stepId] ?? 'todo';
}

export interface StageProgress {
  done: number;
  inProgress: number;
  total: number;
  complete: boolean;
  started: boolean;
  /** Whole-number % of steps marked done (honest count, not a "mastery" score). */
  percent: number;
}

export function stageProgress(steps: CurriculumStep[], progress: CurriculumProgress): StageProgress {
  const total = steps.length;
  let done = 0;
  let inProgress = 0;
  for (const s of steps) {
    const st = statusOf(progress, s.id);
    if (st === 'done') done += 1;
    else if (st === 'in_progress') inProgress += 1;
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

export function stagesForLevel(curriculum: Curriculum, levelNumber: number): CurriculumStage[] {
  return curriculum.stages
    .filter((s) => s.levelNumber === levelNumber)
    .sort((a, b) => a.order - b.order);
}

/** The first stage that isn't fully complete (or the last stage if all done). */
export function currentStage(
  curriculum: Curriculum,
  progress: CurriculumProgress,
): CurriculumStage | null {
  const ordered = [...curriculum.stages].sort((a, b) => a.order - b.order);
  for (const stage of ordered) {
    const steps = stepsForStage(curriculum, progress, stage.id);
    if (!stageProgress(steps, progress).complete) return stage;
  }
  return ordered[ordered.length - 1] ?? null;
}

/** The next step to work on within a stage: an in-progress one, else first to-do. */
export function nextStepInStage(
  curriculum: Curriculum,
  progress: CurriculumProgress,
  stageId: string,
): CurriculumStep | null {
  const steps = stepsForStage(curriculum, progress, stageId);
  return (
    steps.find((s) => statusOf(progress, s.id) === 'in_progress') ??
    steps.find((s) => statusOf(progress, s.id) === 'todo') ??
    null
  );
}

export interface OverallProgress {
  stagesComplete: number;
  stagesTotal: number;
  stepsDone: number;
  stepsTotal: number;
}

export function overallProgress(
  curriculum: Curriculum,
  progress: CurriculumProgress,
): OverallProgress {
  let stagesComplete = 0;
  let stepsDone = 0;
  let stepsTotal = 0;
  for (const stage of curriculum.stages) {
    const steps = stepsForStage(curriculum, progress, stage.id);
    const sp = stageProgress(steps, progress);
    stepsDone += sp.done;
    stepsTotal += sp.total;
    if (sp.complete) stagesComplete += 1;
  }
  return {
    stagesComplete,
    stagesTotal: curriculum.stages.length,
    stepsDone,
    stepsTotal,
  };
}

/** Find which stage a step belongs to (static or custom). */
export function stageOfStep(
  curriculum: Curriculum,
  progress: CurriculumProgress,
  stepId: string,
): CurriculumStage | null {
  const step =
    curriculum.steps.find((s) => s.id === stepId) ??
    progress.customSteps.find((s) => s.id === stepId);
  if (!step) return null;
  return curriculum.stages.find((s) => s.id === step.stageId) ?? null;
}
