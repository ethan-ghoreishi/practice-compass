import { describe, expect, it } from 'vitest';
import { decideSync } from './sync';
import { canonicalStringify, hashState } from './canonical';

const A = 'hash-a';
const B = 'hash-b';
const C = 'hash-c';

describe('decideSync (three-way, content-hash based)', () => {
  it('first ever sync pushes the local copy', () => {
    expect(decideSync({ localHash: A, remoteHash: null, lastSyncedHash: null }).direction).toBe('first-push');
  });

  it('identical content is in sync regardless of history', () => {
    expect(decideSync({ localHash: A, remoteHash: A, lastSyncedHash: null }).direction).toBe('in-sync');
    expect(decideSync({ localHash: A, remoteHash: A, lastSyncedHash: B }).direction).toBe('in-sync');
  });

  it('first sync on a NEW device with a different existing remote is an explicit choice, never a guess', () => {
    expect(decideSync({ localHash: A, remoteHash: B, lastSyncedHash: null }).direction).toBe('conflict');
  });

  it('pushes when only this device changed (covers edits AND deletions — any content change)', () => {
    expect(decideSync({ localHash: B, remoteHash: A, lastSyncedHash: A }).direction).toBe('push');
  });

  it('pulls when only the remote changed', () => {
    expect(decideSync({ localHash: A, remoteHash: B, lastSyncedHash: A }).direction).toBe('pull');
  });

  it('reports a conflict when both sides changed — newest never silently wins', () => {
    expect(decideSync({ localHash: B, remoteHash: C, lastSyncedHash: A }).direction).toBe('conflict');
  });

  it('every decision carries a plain-language reason', () => {
    const d = decideSync({ localHash: A, remoteHash: B, lastSyncedHash: A });
    expect(d.reason.length).toBeGreaterThan(10);
  });
});

describe('canonical hashing', () => {
  it('is independent of object key order', async () => {
    const h1 = await hashState({ items: [{ id: '1', title: 'x' }], pathways: [] });
    const h2 = await hashState({ pathways: [], items: [{ title: 'x', id: '1' }] });
    expect(h1).toBe(h2);
  });

  it('changes for every mutation category — add, edit, delete, across collections', async () => {
    const base = {
      items: [{ id: 'i1', title: 'Darāmad' }],
      instruments: [{ id: 'setar', name: 'Setar' }],
      pathways: [{ id: 'p1', name: 'Radif' }],
      pathwayStages: [{ id: 's1', code: 'Shur' }],
      pathwayRoutines: [] as unknown[],
      lessons: [{ id: 'l1', itemIds: ['i1'] }],
      materials: [] as unknown[],
      attachments: [{ id: 'a1', ownerId: 'i1' }],
      blocks: [{ id: 'b1' }],
    };
    const h = await hashState(base);
    const variants: Array<Record<string, unknown>> = [
      { ...base, items: [{ id: 'i1', title: 'Darāmad (edited)' }] }, // edit
      { ...base, items: [] }, // deletion
      { ...base, instruments: [...base.instruments, { id: 'tar', name: 'Tar' }] }, // instrument add
      { ...base, pathways: [] }, // pathway-only deletion
      { ...base, pathwayStages: [{ id: 's1', code: 'Navā' }] }, // stage-only edit
      { ...base, pathwayRoutines: [{ id: 'r1' }] }, // routine add
      { ...base, lessons: [{ id: 'l1', itemIds: [] }] }, // review/lesson link change
      { ...base, attachments: [] }, // attachment deletion
    ];
    for (const v of variants) expect(await hashState(v)).not.toBe(h);
  });

  it('ignores undefined values consistently', () => {
    expect(canonicalStringify({ a: 1, b: undefined })).toBe(canonicalStringify({ a: 1 }));
  });
});
