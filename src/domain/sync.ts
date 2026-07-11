/**
 * Sync decision logic — pure and deterministic. The transport (GitHub) lives
 * in the store layer; this module only answers: given what changed where,
 * which way should data flow? Whole-snapshot, newest-wins, and any ambiguity
 * is surfaced as an explicit conflict — never silently merged.
 */

export type SyncDirection = 'first-push' | 'push' | 'pull' | 'in-sync' | 'conflict';

export interface SyncSnapshot {
  /** Newest change on this device (ISO datetime; '' when the DB is empty). */
  localLastModified: string;
  /** Newest change in the remote copy, or null when nothing exists remotely. */
  remoteLastModified: string | null;
  /** What this device saw at its last successful sync (null = never synced). */
  lastSyncedLocal: string | null;
  lastSyncedRemote: string | null;
}

export interface SyncDecision {
  direction: SyncDirection;
  reason: string;
}

export function decideSync(s: SyncSnapshot): SyncDecision {
  if (s.remoteLastModified === null) {
    return { direction: 'first-push', reason: 'Nothing on GitHub yet — this device’s copy becomes the first backup.' };
  }

  // Never synced on this device but a remote copy exists: don't guess which
  // copy the user wants — ask once, showing both timestamps.
  if (!s.lastSyncedLocal || !s.lastSyncedRemote) {
    if (s.remoteLastModified === s.localLastModified) {
      return { direction: 'in-sync', reason: 'Both copies show the same latest change.' };
    }
    return {
      direction: 'conflict',
      reason: 'First sync on this device and a copy already exists on GitHub — choose which one to keep.',
    };
  }

  const localChanged = s.localLastModified > s.lastSyncedLocal;
  const remoteChanged = s.remoteLastModified !== s.lastSyncedRemote;

  if (localChanged && remoteChanged) {
    return {
      direction: 'conflict',
      reason: 'Both this device and the GitHub copy changed since the last sync — choose which one to keep.',
    };
  }
  if (localChanged) return { direction: 'push', reason: 'This device has newer work — sending it to GitHub.' };
  if (remoteChanged) return { direction: 'pull', reason: 'The GitHub copy is newer — bringing it onto this device.' };
  return { direction: 'in-sync', reason: 'Nothing changed since the last sync.' };
}
