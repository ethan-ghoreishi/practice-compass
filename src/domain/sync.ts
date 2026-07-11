/**
 * Sync decision logic — pure and deterministic. The transport (GitHub) lives
 * in the store layer; this module only answers: given what the data LOOKS
 * LIKE on each side, which way should it flow?
 *
 * Decisions compare whole-state content hashes (see canonical.ts), three-way
 * against the hash both sides agreed on at the last sync — like git, and
 * immune to device clocks. Whole snapshots move; any ambiguity is an explicit
 * conflict for the user — never a silent merge, and "newest" is only ever a
 * recommendation, never an automatic winner.
 */

export type SyncDirection = 'first-push' | 'push' | 'pull' | 'in-sync' | 'conflict';

export interface SyncComparison {
  /** Content hash of this device's data. */
  localHash: string;
  /** Content hash of the remote copy, or null when nothing exists remotely. */
  remoteHash: string | null;
  /** The hash both sides agreed on at this device's last successful sync. */
  lastSyncedHash: string | null;
}

export interface SyncDecision {
  direction: SyncDirection;
  reason: string;
}

export function decideSync(c: SyncComparison): SyncDecision {
  if (c.remoteHash === null) {
    return { direction: 'first-push', reason: 'Nothing on GitHub yet — this device’s copy becomes the first snapshot.' };
  }
  if (c.remoteHash === c.localHash) {
    return { direction: 'in-sync', reason: 'Both copies hold identical data.' };
  }

  // Never synced on this device but a different remote copy exists: don't
  // guess which copy the user wants — ask once, showing both.
  if (!c.lastSyncedHash) {
    return {
      direction: 'conflict',
      reason: 'First sync on this device and a different copy already exists on GitHub — choose which one to keep.',
    };
  }

  const localChanged = c.localHash !== c.lastSyncedHash;
  const remoteChanged = c.remoteHash !== c.lastSyncedHash;

  if (localChanged && remoteChanged) {
    return {
      direction: 'conflict',
      reason: 'Both this device and the GitHub copy changed since the last sync — choose which one to keep.',
    };
  }
  if (localChanged) return { direction: 'push', reason: 'This device has changes the GitHub copy lacks — sending them.' };
  return { direction: 'pull', reason: 'The GitHub copy has changes this device lacks — bringing them in.' };
}
