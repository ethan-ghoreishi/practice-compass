import { describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { withRevision } from './revision';

/**
 * The revision middleware must bump `rev` for EVERY category of db mutation —
 * additions, edits, deletions, imports — across every persisted collection,
 * and must NOT bump for non-db state (theme, session UI state).
 */

interface Db {
  items: { id: string; title: string }[];
  instruments: { id: string }[];
  pathways: { id: string }[];
  pathwayStages: { id: string }[];
  pathwayRoutines: { id: string }[];
  lessons: { id: string; itemIds: string[] }[];
  materials: { id: string }[];
  attachments: { id: string }[];
  blocks: { id: string }[];
}

interface S {
  db: Db;
  rev: number;
  theme: string;
  setTheme: (t: string) => void;
  mutate: (fn: (db: Db) => Db) => void;
  importDb: (db: Db) => void;
}

const emptyDb = (): Db => ({
  items: [],
  instruments: [],
  pathways: [],
  pathwayStages: [],
  pathwayRoutines: [],
  lessons: [],
  materials: [],
  attachments: [],
  blocks: [],
});

function makeStore() {
  return create<S>()(
    withRevision((set) => ({
      db: emptyDb(),
      rev: 0,
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      mutate: (fn) => set((s) => ({ db: fn(s.db) })),
      importDb: (db) => set({ db }),
    })),
  );
}

describe('withRevision middleware', () => {
  it('bumps rev for additions, edits and deletions in every collection', () => {
    const store = makeStore();
    const collections: (keyof Db)[] = [
      'items',
      'instruments',
      'pathways',
      'pathwayStages',
      'pathwayRoutines',
      'lessons',
      'materials',
      'attachments',
      'blocks',
    ];
    let expected = 0;
    for (const col of collections) {
      // add
      store.getState().mutate((db) => ({ ...db, [col]: [{ id: 'x', title: 't', itemIds: [] }] }));
      expect(store.getState().rev).toBe(++expected);
      // edit
      store.getState().mutate((db) => ({ ...db, [col]: [{ id: 'x', title: 'edited', itemIds: ['a'] }] }));
      expect(store.getState().rev).toBe(++expected);
      // delete
      store.getState().mutate((db) => ({ ...db, [col]: [] }));
      expect(store.getState().rev).toBe(++expected);
    }
  });

  it('bumps rev on whole-db import (restore/pull)', () => {
    const store = makeStore();
    store.getState().importDb({ ...emptyDb(), items: [{ id: 'i', title: 'imported' }] });
    expect(store.getState().rev).toBe(1);
  });

  it('does NOT bump rev for non-db state changes', () => {
    const store = makeStore();
    store.getState().setTheme('dark');
    expect(store.getState().rev).toBe(0);
  });

  it('bumps rev for direct setState calls that replace db', () => {
    const store = makeStore();
    store.setState({ db: { ...emptyDb(), items: [{ id: 'z', title: 'direct' }] } });
    expect(store.getState().rev).toBe(1);
    store.setState({ theme: 'light' });
    expect(store.getState().rev).toBe(1);
  });
});
