import { describe, expect, it } from 'vitest';
import { catalogForStage, getCatalog, SEED_PATHWAY_IDS, seedPathways, stageIdFor } from './pathwaySeed';
import { createSeedDB } from './seed';
import { hasPersianScript } from './farsi';

const NOW = new Date('2026-07-11T12:00:00Z');

// Converting the Setar/Tar seeds to Farsi must NOT move any stable identifier:
// stage ids, catalog keys, pathway ids and catalogKey links on seeded items
// are all persisted and referenced, so they have to stay byte-for-byte stable.

describe('Farsi seed migration safety', () => {
  const { pathwayStages } = seedPathways({ guitar: 'g', setar: 's', tar: 't' }, NOW);

  it('stage ids are the SAME ascii slugs as before the Farsi conversion', () => {
    const setarIds = pathwayStages.filter((s) => s.pathwayId === SEED_PATHWAY_IDS.setar).map((s) => s.id);
    // A representative, stable subset that existing data may reference.
    expect(setarIds).toContain('setar-radif-afshari');
    expect(setarIds).toContain('setar-radif-shur');
    expect(setarIds).toContain('setar-radif-mahur');
    expect(setarIds).toContain('setar-radif-setup');

    const tarIds = pathwayStages.filter((s) => s.pathwayId === SEED_PATHWAY_IDS.tar).map((s) => s.id);
    expect(tarIds).toContain('tar-honarestan-rh-basics');
    expect(tarIds).toContain('tar-honarestan-dastgah-pieces');
  });

  it('every stage id and catalog key is pure ascii (never Farsi)', () => {
    for (const s of pathwayStages) {
      expect(hasPersianScript(s.id)).toBe(false);
    }
    for (const entries of Object.values(getCatalog())) {
      for (const e of entries) expect(hasPersianScript(e.key)).toBe(false);
    }
  });

  it('the Afshārī stage keeps its catalog keys (daramad, iraq, forud…)', () => {
    const keys = catalogForStage(stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari')).map((e) => e.key);
    expect(keys).toEqual(['daramad', 'jamedaran', 'iraq', 'forud']);
  });

  it('displayed stage codes and titles ARE Farsi for Setar', () => {
    const shur = pathwayStages.find((s) => s.id === 'setar-radif-shur')!;
    expect(hasPersianScript(shur.code)).toBe(true);
    expect(hasPersianScript(shur.title)).toBe(true);
  });

  it('seeded Setar items still resolve to their stage and catalog entry', () => {
    const db = createSeedDB(NOW);
    const afshariStage = stageIdFor(SEED_PATHWAY_IDS.setar, 'afshari');
    const iraq = db.items.find((i) => i.catalogKey === 'iraq');
    expect(iraq).toBeDefined();
    expect(iraq!.stageId).toBe(afshariStage);
    // Its catalog key matches a real entry in that stage.
    expect(catalogForStage(afshariStage).some((e) => e.key === 'iraq')).toBe(true);
  });

  it('seeded Setar/Tar items carry Farsi titles', () => {
    const db = createSeedDB(NOW);
    const setar = db.instruments.find((i) => i.name === 'Setar')!;
    const setarItems = db.items.filter((i) => i.instrumentId === setar.id);
    expect(setarItems.length).toBeGreaterThan(0);
    for (const it of setarItems) expect(hasPersianScript(it.title)).toBe(true);
  });
});
