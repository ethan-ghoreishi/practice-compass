import type {
  ID,
  Instrument,
  Material,
  PracticeBlock,
  PracticeDB,
  PracticeItem,
} from '../domain';

// Plain lookup helpers (not hooks) for use inside memoised component logic.

export function getInstrument(db: PracticeDB, id?: ID): Instrument | undefined {
  return id ? db.instruments.find((i) => i.id === id) : undefined;
}

export function instrumentName(db: PracticeDB, id?: ID): string {
  return getInstrument(db, id)?.name ?? '—';
}

export function getItem(db: PracticeDB, id?: ID): PracticeItem | undefined {
  return id ? db.items.find((i) => i.id === id) : undefined;
}

export function getMaterial(db: PracticeDB, id?: ID): Material | undefined {
  return id ? db.materials.find((m) => m.id === id) : undefined;
}

export function materialLabel(material?: Material): string | undefined {
  if (!material) return undefined;
  const parts = [material.sourceName, material.parentTitle, material.section, material.title].filter(
    Boolean,
  );
  // De-duplicate while preserving order (title often repeats the section).
  return [...new Set(parts)].join(' · ');
}

export function itemBlocks(db: PracticeDB, itemId: ID): PracticeBlock[] {
  return db.blocks
    .filter((b) => b.practiceItemId === itemId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function materialsForInstrument(db: PracticeDB, instrumentId?: ID): Material[] {
  return db.materials.filter((m) => !instrumentId || m.instrumentId === instrumentId);
}

export function itemsForInstrument(db: PracticeDB, instrumentId?: ID): PracticeItem[] {
  return db.items.filter((i) => !instrumentId || i.instrumentId === instrumentId);
}
