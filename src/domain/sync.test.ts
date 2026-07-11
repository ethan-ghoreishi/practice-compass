import { describe, expect, it } from 'vitest';
import { decideSync } from './sync';

const T1 = '2026-07-10T09:00:00.000Z';
const T2 = '2026-07-11T09:00:00.000Z';
const T3 = '2026-07-11T18:00:00.000Z';

describe('decideSync', () => {
  it('first ever sync pushes the local copy', () => {
    expect(
      decideSync({ localLastModified: T1, remoteLastModified: null, lastSyncedLocal: null, lastSyncedRemote: null })
        .direction,
    ).toBe('first-push');
  });

  it('first sync on a NEW device with an existing remote is an explicit choice, never a guess', () => {
    expect(
      decideSync({ localLastModified: T1, remoteLastModified: T2, lastSyncedLocal: null, lastSyncedRemote: null })
        .direction,
    ).toBe('conflict');
  });

  it('pushes when only this device changed', () => {
    expect(
      decideSync({ localLastModified: T3, remoteLastModified: T2, lastSyncedLocal: T2, lastSyncedRemote: T2 })
        .direction,
    ).toBe('push');
  });

  it('pulls when only the remote changed', () => {
    expect(
      decideSync({ localLastModified: T2, remoteLastModified: T3, lastSyncedLocal: T2, lastSyncedRemote: T2 })
        .direction,
    ).toBe('pull');
  });

  it('reports a conflict when both sides changed — no silent merge or overwrite', () => {
    expect(
      decideSync({ localLastModified: T3, remoteLastModified: T3, lastSyncedLocal: T1, lastSyncedRemote: T1 })
        .direction,
    ).toBe('conflict');
  });

  it('is in sync when nothing moved', () => {
    expect(
      decideSync({ localLastModified: T2, remoteLastModified: T2, lastSyncedLocal: T2, lastSyncedRemote: T2 })
        .direction,
    ).toBe('in-sync');
  });

  it('every decision carries a plain-language reason', () => {
    const d = decideSync({ localLastModified: T2, remoteLastModified: T3, lastSyncedLocal: T2, lastSyncedRemote: T2 });
    expect(d.reason.length).toBeGreaterThan(10);
  });
});
