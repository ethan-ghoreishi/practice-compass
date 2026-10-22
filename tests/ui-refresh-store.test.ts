import { describe, expect, it, vi } from 'vitest';
import { validateDB, type PracticeDB } from '../src/domain';
import FIXTURE_TEXT from './fixtures/ui-refresh.json?raw';

// ---------------------------------------------------------------------------
// The UI-refresh lane's store-level guards, beside the committed
// mixed-language fixture every browser journey of this lane imports. Dexie
// has no IndexedDB in Node, so storage is the same in-memory stand-in
// tests/repertoire-families.test.ts uses.
// ---------------------------------------------------------------------------

vi.mock('../src/store/idb', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/store/idb')>()),
  clearBlobs: async () => undefined,
  deleteBlob: async () => undefined,
  allBlobs: async () => [],
  heldBlobIds: async () => new Set<string>(),
  storageSettled: () => Promise.resolve(),
  idbStorage: { getItem: async () => null, setItem: async () => undefined, removeItem: async () => undefined },
}));
const { useStore } = await import('../src/store/useStore');

const fixtureDb = (): PracticeDB => validateDB(JSON.parse(FIXTURE_TEXT).data);

describe('the ui-refresh fixture', () => {
  it('is a current database every inbound door accepts', () => {
    const db = fixtureDb();
    expect(db.instruments.map((i) => i.name)).toEqual(['سه‌تار', 'Tar']);
    // A Farsi title followed by digits, the shape that garbled fused lines.
    expect(db.items.some((i) => i.title === 'عراق 3')).toBe(true);
    // Imported history dated in the future: never an upcoming class.
    expect(db.lessons.find((l) => l.id === 'les-archive')?.origin).toBe('archive');
  });
});

describe('renaming an instrument', () => {
  it('refuses an empty name in the store and changes nothing', () => {
    useStore.getState().importDB(fixtureDb());
    const before = useStore.getState();
    for (const name of ['', '   ']) {
      expect(useStore.getState().updateInstrument('inst-tar', { name })).toMatch(/name/i);
    }
    const after = useStore.getState();
    expect(after.db).toBe(before.db);
    expect(after.rev).toBe(before.rev);
  });

  it('saves a trimmed name and leaves every other field alone', () => {
    useStore.getState().importDB(fixtureDb());
    const before = useStore.getState().db.instruments.find((i) => i.id === 'inst-tar')!;
    expect(useStore.getState().updateInstrument('inst-tar', { name: '  Tar 2  ' })).toBeNull();
    const after = useStore.getState().db.instruments.find((i) => i.id === 'inst-tar')!;
    expect({ ...after, updatedAt: before.updatedAt }).toEqual({ ...before, name: 'Tar 2' });
    // Hiding an instrument is not a rename and is never refused for its name.
    expect(useStore.getState().updateInstrument('inst-tar', { active: false })).toBeNull();
  });
});
