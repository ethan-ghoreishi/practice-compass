import { describe, expect, it } from 'vitest';
import { seedPathways, SEED_PATHWAY_IDS } from './pathwaySeed';
import {
  currentStage,
  nextStepInStage,
  pathwayProgress,
  stageProgress,
  stagesOfPathway,
  stepsOfStage,
  groupStages,
} from './pathways';
import type { PathwayStep } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const seed = seedPathways({ guitar: 'g', setar: 's', tar: 't' }, NOW);

function markDone(steps: PathwayStep[], ids: Set<string>): PathwayStep[] {
  return steps.map((s) => (ids.has(s.id) ? { ...s, status: 'done' as const } : s));
}

describe('seeded pathways', () => {
  it('seeds Guitar, Setar and Tar with stable ids', () => {
    expect(seed.pathways).toHaveLength(3);
    expect(seed.pathways.map((p) => p.id).sort()).toEqual([SEED_PATHWAY_IDS.guitar, SEED_PATHWAY_IDS.setar, SEED_PATHWAY_IDS.tar].sort());
    // CGS step ids stay stable so older progress migrates onto them.
    expect(seed.pathwaySteps.some((s) => s.id === 'cgs-1a-warm-up-stretches')).toBe(true);
  });

  it('attaches each pathway to its instrument', () => {
    const setar = seed.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar)!;
    expect(setar.instrumentId).toBe('s');
  });

  it('gives the CGS 1A stage its two guided routines', () => {
    const stage1a = seed.pathwayStages.find((s) => s.pathwayId === 'cgs' && s.code === '1A')!;
    expect(seed.pathwayRoutines.filter((r) => r.stageId === stage1a.id)).toHaveLength(2);
  });
});

describe('progress derivations', () => {
  const guitarStages = stagesOfPathway(seed.pathwayStages, 'cgs');
  const stage1a = guitarStages[0];

  it('currentStage starts at the first stage and advances when complete', () => {
    expect(currentStage(seed.pathwayStages, seed.pathwaySteps, 'cgs')?.code).toBe('1A');

    const stepsOf1a = stepsOfStage(seed.pathwaySteps, stage1a.id);
    const allDone = markDone(seed.pathwaySteps, new Set(stepsOf1a.map((s) => s.id)));
    expect(currentStage(seed.pathwayStages, allDone, 'cgs')?.code).toBe('1B');
  });

  it('stageProgress counts and completes', () => {
    const steps = stepsOfStage(seed.pathwaySteps, stage1a.id);
    expect(stageProgress(steps).complete).toBe(false);
    const done = markDone(steps, new Set([steps[0].id]));
    expect(stageProgress(done).done).toBe(1);
  });

  it('nextStepInStage prefers in-progress then first to-do', () => {
    const steps = stepsOfStage(seed.pathwaySteps, stage1a.id);
    expect(nextStepInStage(steps, stage1a.id)?.id).toBe(steps[0].id);
  });

  it('pathwayProgress aggregates the whole path', () => {
    const p = pathwayProgress(seed.pathwayStages, seed.pathwaySteps, 'cgs');
    expect(p.stagesTotal).toBe(18);
    expect(p.stepsTotal).toBeGreaterThan(18);
  });

  it('groupStages keeps order and groups by heading', () => {
    const groups = groupStages(guitarStages);
    expect(groups[0].group).toBe('Level 1 · Foundations');
    expect(groups[0].stages[0].code).toBe('1A');
  });
});
