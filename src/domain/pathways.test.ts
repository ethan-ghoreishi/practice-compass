import { describe, expect, it } from 'vitest';
import { catalogForStage, SEED_PATHWAY_IDS, seedPathways, stageIdFor } from './pathwaySeed';
import {
  currentStage,
  groupStages,
  itemStageState,
  nextUnitInStage,
  pathwayProgress,
  stageProgress,
  stagesOfPathway,
  stageUnits,
} from './pathways';
import { createItem } from './factories';
import type { PracticeItem } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const seed = seedPathways({ guitar: 'g', setar: 's', tar: 't' }, NOW);

const AFSHARI = stageIdFor(SEED_PATHWAY_IDS.setar, 'Afshārī');

function itemIn(stageId: string, catalogKey: string | undefined, o: Partial<PracticeItem> = {}): PracticeItem {
  const base = createItem(
    { instrumentId: 's', title: o.title ?? 'x', stageId, catalogKey, status: o.status ?? 'new' },
    NOW,
  );
  return { ...base, ...o };
}

describe('seeded pathways & catalog', () => {
  it('seeds Guitar, Setar and Tar with stages and routines (no persisted steps)', () => {
    expect(seed.pathways).toHaveLength(3);
    expect(seed.pathwayStages.length).toBeGreaterThan(30);
    expect(seed.pathwayRoutines.length).toBeGreaterThan(0);
  });

  it('provides a reference catalog per stage with stable keys', () => {
    const entries = catalogForStage(AFSHARI);
    expect(entries.map((e) => e.key)).toContain('iraq');
    expect(entries.map((e) => e.key)).toContain('daramad');
  });
});

describe('itemStageState', () => {
  it('maps mastery status onto todo / in-progress / done', () => {
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'new' }))).toBe('todo');
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'repairing' }))).toBe('in_progress');
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'integrated' }))).toBe('done');
    expect(itemStageState(itemIn(AFSHARI, 'iraq', { status: 'new', timesPractised: 2 }))).toBe('in_progress');
  });
});

describe('stageUnits', () => {
  const stage = seed.pathwayStages.find((s) => s.id === AFSHARI)!;

  it('lays your items over the catalog and appends off-catalog items', () => {
    const mine = [
      itemIn(AFSHARI, 'iraq', { title: 'Iraq phrase 4', status: 'repairing' }),
      itemIn(AFSHARI, undefined, { title: 'Teacher qet‘e in Afshārī' }),
    ];
    const units = stageUnits(stage, mine);
    const iraq = units.find((u) => u.key === 'iraq')!;
    expect(iraq.item?.title).toBe('Iraq phrase 4');
    expect(iraq.state).toBe('in_progress');
    // catalog-only entry stays a suggestion
    expect(units.find((u) => u.key === 'daramad')?.item).toBeUndefined();
    // the custom item is appended as its own unit
    expect(units.some((u) => u.title === 'Teacher qet‘e in Afshārī')).toBe(true);
    expect(units.length).toBe(catalogForStage(AFSHARI).length + 1);
  });

  it('ignores items placed in other stages', () => {
    const other = [itemIn(stageIdFor(SEED_PATHWAY_IDS.setar, 'Shur'), 'kereshmeh')];
    const units = stageUnits(stage, other);
    expect(units.every((u) => !u.item)).toBe(true);
  });
});

describe('progress & navigation', () => {
  const stages = stagesOfPathway(seed.pathwayStages, SEED_PATHWAY_IDS.setar);
  const first = stages[0];

  it('stageProgress counts done/in-progress from item mastery', () => {
    const stage = seed.pathwayStages.find((s) => s.id === AFSHARI)!;
    const catalogSize = catalogForStage(AFSHARI).length;
    const mine = [
      itemIn(AFSHARI, 'iraq', { status: 'integrated' }),
      itemIn(AFSHARI, 'daramad', { status: 'repairing' }),
    ];
    const sp = stageProgress(stageUnits(stage, mine));
    expect(sp.total).toBe(catalogSize);
    expect(sp.done).toBe(1);
    expect(sp.inProgress).toBe(1);
    expect(sp.addedItems).toBe(2);
    expect(sp.complete).toBe(false);
  });

  it('currentStage is the first incomplete stage', () => {
    expect(currentStage(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar)?.id).toBe(first.id);

    // Complete every catalog unit of the first stage → current advances.
    const done = catalogForStage(first.id).map((e) =>
      itemIn(first.id, e.key, { status: 'integrated' }),
    );
    expect(currentStage(seed.pathwayStages, done, SEED_PATHWAY_IDS.setar)?.id).toBe(stages[1].id);
  });

  it('nextUnitInStage prefers in-progress, else first to-do', () => {
    const stage = seed.pathwayStages.find((s) => s.id === AFSHARI)!;
    expect(nextUnitInStage(stage, [])?.key).toBe(catalogForStage(AFSHARI)[0].key);
    const mine = [itemIn(AFSHARI, 'iraq', { status: 'fragile' })];
    expect(nextUnitInStage(stage, mine)?.key).toBe('iraq');
  });

  it('pathwayProgress aggregates across stages', () => {
    const p = pathwayProgress(seed.pathwayStages, [], SEED_PATHWAY_IDS.setar);
    expect(p.stagesTotal).toBe(stages.length);
    expect(p.total).toBeGreaterThan(stages.length);
    expect(p.done).toBe(0);
  });

  it('groupStages keeps order and groups by heading', () => {
    const groups = groupStages(stages);
    expect(groups[0].group).toBe('Foundations');
    expect(groups.some((g) => g.group === 'Dastgāh-e Shur & its āvāz-hā')).toBe(true);
  });
});
