import { describe, expect, it } from 'vitest';
import { getCurriculum } from './curriculum';
import {
  currentStage,
  nextStepInStage,
  overallProgress,
  stageProgress,
  stepsForStage,
} from './curriculumProgress';
import { emptyCurriculumProgress, type CurriculumProgress } from './types';

const curriculum = getCurriculum();

function progressWith(stepStatus: CurriculumProgress['stepStatus']): CurriculumProgress {
  return { ...emptyCurriculumProgress(), stepStatus };
}

describe('curriculum content', () => {
  it('covers Levels 1–3 with 18 sub-levels and a detailed 1A', () => {
    expect(curriculum.stages.length).toBe(18);
    const a1 = curriculum.stages.find((s) => s.code === '1A')!;
    expect(a1.detailed).toBe(true);
    expect(curriculum.steps.filter((s) => s.stageId === a1.id).length).toBeGreaterThan(10);
    expect(curriculum.routines.filter((r) => r.stageId === a1.id).length).toBe(2);
  });

  it('gives every outline stage one step per practice area', () => {
    const b1 = curriculum.stages.find((s) => s.code === '1B')!;
    const steps = curriculum.steps.filter((s) => s.stageId === b1.id);
    expect(steps.length).toBe(b1.mainAreas.length);
  });
});

describe('stageProgress', () => {
  it('counts done / in-progress and detects completion', () => {
    const a1 = curriculum.stages.find((s) => s.code === '1A')!;
    const steps = stepsForStage(curriculum, emptyCurriculumProgress(), a1.id);

    const fresh = stageProgress(steps, emptyCurriculumProgress());
    expect(fresh.done).toBe(0);
    expect(fresh.complete).toBe(false);
    expect(fresh.started).toBe(false);

    const partial = progressWith({ [steps[0].id]: 'done', [steps[1].id]: 'in_progress' });
    const sp = stageProgress(steps, partial);
    expect(sp.done).toBe(1);
    expect(sp.inProgress).toBe(1);
    expect(sp.started).toBe(true);
    expect(sp.complete).toBe(false);

    const allDone = progressWith(Object.fromEntries(steps.map((s) => [s.id, 'done' as const])));
    expect(stageProgress(steps, allDone).complete).toBe(true);
  });
});

describe('currentStage', () => {
  it('starts at 1A when nothing is done', () => {
    expect(currentStage(curriculum, emptyCurriculumProgress())?.code).toBe('1A');
  });

  it('advances to 1B once 1A is fully complete', () => {
    const a1 = curriculum.stages.find((s) => s.code === '1A')!;
    const steps = stepsForStage(curriculum, emptyCurriculumProgress(), a1.id);
    const allDone = progressWith(Object.fromEntries(steps.map((s) => [s.id, 'done' as const])));
    expect(currentStage(curriculum, allDone)?.code).toBe('1B');
  });
});

describe('nextStepInStage', () => {
  it('prefers an in-progress step, else the first to-do', () => {
    const a1 = curriculum.stages.find((s) => s.code === '1A')!;
    const steps = stepsForStage(curriculum, emptyCurriculumProgress(), a1.id);

    expect(nextStepInStage(curriculum, emptyCurriculumProgress(), a1.id)?.id).toBe(steps[0].id);

    const p = progressWith({ [steps[0].id]: 'done', [steps[2].id]: 'in_progress' });
    expect(nextStepInStage(curriculum, p, a1.id)?.id).toBe(steps[2].id);
  });
});

describe('overallProgress', () => {
  it('aggregates stages and steps across the whole path', () => {
    const op = overallProgress(curriculum, emptyCurriculumProgress());
    expect(op.stagesTotal).toBe(18);
    expect(op.stagesComplete).toBe(0);
    expect(op.stepsTotal).toBeGreaterThan(18);
    expect(op.stepsDone).toBe(0);
  });
});
