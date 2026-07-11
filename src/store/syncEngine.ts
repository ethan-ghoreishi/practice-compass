import { decideSync, hashState, type SyncDirection } from '../domain';

// ---------------------------------------------------------------------------
// Transport-agnostic sync engine. All I/O goes through injected ports so the
// whole protocol — first sync, push, pull, conflicts, races, partial
// failures, legacy migration — is unit-testable without GitHub.
//
// Remote layout (format 2, one git commit per snapshot — atomic by
// construction: blobs → tree → commit → fast-forward ref update; a ref that
// moved in between is a race, surfaced as a conflict):
//   manifest.json — { formatVersion, hash, rev, deviceName, savedAt,
//                     attachments: [{ id, ownerId, name, mime, size, blobSha }] }
//   state.json    — the full backup JSON without file payloads
//   files/{id}    — raw attachment bytes (immutable git blobs, uploaded once)
//
// Legacy remotes (format 1: contents-API state.json + files/{id} JSON
// entries, no manifest) remain readable; the first new push simply commits
// the new format on top — the old snapshot stays in git history, nothing is
// lost.
// ---------------------------------------------------------------------------

export interface SnapshotFile {
  id: string;
  ownerId: string;
  name: string;
  mime: string;
  /** base64 payload */
  data: string;
}

export interface LocalSnapshot {
  /** Backup JSON text WITHOUT file payloads (files: []). */
  stateText: string;
  files: SnapshotFile[];
  /** Content hash of the data state (domain/canonical). */
  hash: string;
  rev: number;
  deviceName: string;
}

export interface ManifestAttachment {
  id: string;
  ownerId: string;
  name: string;
  mime: string;
  size: number;
  blobSha: string;
}

export interface RemoteManifest {
  formatVersion: 2;
  hash: string;
  rev: number;
  deviceName?: string;
  savedAt: string;
  attachments: ManifestAttachment[];
}

export interface TreeEntry {
  path: string;
  sha: string;
}

export interface RemotePort {
  /** Head commit sha of the data branch, or null when the repo/branch is empty. */
  getHead(): Promise<string | null>;
  /** Text content of a path at a commit; null when the path doesn't exist. */
  readText(path: string, ref: string): Promise<string | null>;
  /** Directory listing at a commit (legacy format only); [] when missing. */
  listDir(path: string, ref: string): Promise<{ name: string }[]>;
  /** Raw base64 of a git blob. */
  readBlobBase64(sha: string): Promise<string>;
  /** Upload a blob (base64); returns its sha. */
  createBlobBase64(b64: string): Promise<string>;
  /** Upload a text blob; returns its sha. */
  createTextBlob(text: string): Promise<string>;
  /** Create a FULL tree (no base — deletions are implicit); returns tree sha. */
  createTree(entries: TreeEntry[]): Promise<string>;
  createCommit(message: string, treeSha: string, parents: string[]): Promise<string>;
  /**
   * Move the branch to `sha`. `expectedParent` is the head we based our
   * commit on (null = branch must not exist yet). Non-fast-forward → 'race'.
   */
  advanceHead(sha: string, expectedParent: string | null): Promise<'ok' | 'race'>;
  /** Create a side branch (conflict archive); never moves main. */
  createArchiveBranch(name: string, sha: string): Promise<void>;
}

export interface LocalPort {
  buildSnapshot(): Promise<LocalSnapshot>;
  /** Replace ALL local data with the given snapshot. */
  applySnapshot(stateText: string, files: SnapshotFile[]): Promise<void>;
  /** Preserve the current local copy where the user can restore it. */
  archivePreSync(reason: string): Promise<void>;
}

export interface SyncBook {
  lastSyncedHash: string | null;
  lastRemoteCommit: string | null;
  lastSyncAt: string | null;
}

export interface BookPort {
  load(): SyncBook;
  save(book: SyncBook): void;
}

export interface SyncPorts {
  remote: RemotePort;
  local: LocalPort;
  book: BookPort;
  now(): Date;
}

export interface RemoteSideMeta {
  hash: string;
  rev?: number;
  deviceName?: string;
  savedAt?: string;
  legacy: boolean;
}

export type SyncOutcome =
  | { kind: 'in-sync' }
  | { kind: 'pushed'; direction: SyncDirection; commit: string }
  | { kind: 'pulled'; remote: RemoteSideMeta }
  | { kind: 'conflict'; reason: string; local: LocalSnapshot; remote: RemoteSideMeta | null }
  | { kind: 'error'; message: string };

// ---- Remote snapshot reading ------------------------------------------------

async function readRemoteMeta(remote: RemotePort, head: string): Promise<RemoteSideMeta | null> {
  const manifestText = await remote.readText('manifest.json', head);
  if (manifestText) {
    const m = JSON.parse(manifestText) as RemoteManifest;
    return { hash: m.hash, rev: m.rev, deviceName: m.deviceName, savedAt: m.savedAt, legacy: false };
  }
  // Legacy format: no manifest — derive the content hash from state.json.
  const stateText = await remote.readText('state.json', head);
  if (!stateText) return null; // repo has commits but no snapshot
  const parsed = JSON.parse(stateText) as { data?: unknown; deviceName?: string; exportedAt?: string };
  return {
    hash: await hashState(parsed.data ?? {}),
    deviceName: parsed.deviceName,
    savedAt: parsed.exportedAt,
    legacy: true,
  };
}

async function readRemoteFiles(remote: RemotePort, head: string, meta: RemoteSideMeta): Promise<SnapshotFile[]> {
  if (!meta.legacy) {
    const manifest = JSON.parse((await remote.readText('manifest.json', head))!) as RemoteManifest;
    return Promise.all(
      manifest.attachments.map(async (a) => ({
        id: a.id,
        ownerId: a.ownerId,
        name: a.name,
        mime: a.mime,
        data: await remote.readBlobBase64(a.blobSha),
      })),
    );
  }
  // Legacy: files/{id} are JSON-wrapped entries.
  const entries = await remote.listDir('files', head);
  const files: SnapshotFile[] = [];
  for (const e of entries) {
    const text = await remote.readText(`files/${e.name}`, head);
    if (text) files.push(JSON.parse(text) as SnapshotFile);
  }
  return files;
}

// ---- Publication (atomic) ---------------------------------------------------

async function publish(
  ports: SyncPorts,
  snapshot: LocalSnapshot,
  parent: string | null,
  message: string,
): Promise<'race' | string> {
  const { remote } = ports;

  // Reuse blob shas for attachments the previous manifest already holds —
  // attachments are immutable (added/deleted, never edited).
  const known = new Map<string, ManifestAttachment>();
  if (parent) {
    const prevText = await remote.readText('manifest.json', parent);
    if (prevText) {
      for (const a of (JSON.parse(prevText) as RemoteManifest).attachments) known.set(a.id, a);
    }
  }

  const attachments: ManifestAttachment[] = [];
  for (const f of snapshot.files) {
    const prev = known.get(f.id);
    const blobSha = prev ? prev.blobSha : await remote.createBlobBase64(f.data);
    attachments.push({
      id: f.id,
      ownerId: f.ownerId,
      name: f.name,
      mime: f.mime,
      size: Math.floor((f.data.length * 3) / 4),
      blobSha,
    });
  }

  const manifest: RemoteManifest = {
    formatVersion: 2,
    hash: snapshot.hash,
    rev: snapshot.rev,
    deviceName: snapshot.deviceName || undefined,
    savedAt: ports.now().toISOString(),
    attachments,
  };

  const entries: TreeEntry[] = [
    { path: 'manifest.json', sha: await remote.createTextBlob(JSON.stringify(manifest, null, 2)) },
    { path: 'state.json', sha: await remote.createTextBlob(snapshot.stateText) },
    ...attachments.map((a) => ({ path: `files/${a.id}`, sha: a.blobSha })),
  ];

  const tree = await remote.createTree(entries);
  const commit = await remote.createCommit(message, tree, parent ? [parent] : []);
  const result = await remote.advanceHead(commit, parent);
  return result === 'race' ? 'race' : commit;
}

// ---- Orchestration ----------------------------------------------------------

export async function runSync(ports: SyncPorts): Promise<SyncOutcome> {
  try {
    const local = await ports.local.buildSnapshot();
    const head = await ports.remote.getHead();
    const remoteMeta = head ? await readRemoteMeta(ports.remote, head) : null;
    const book = ports.book.load();

    const decision = decideSync({
      localHash: local.hash,
      remoteHash: remoteMeta ? remoteMeta.hash : null,
      lastSyncedHash: book.lastSyncedHash,
    });

    switch (decision.direction) {
      case 'in-sync': {
        ports.book.save({ lastSyncedHash: local.hash, lastRemoteCommit: head, lastSyncAt: ports.now().toISOString() });
        return { kind: 'in-sync' };
      }
      case 'first-push':
      case 'push': {
        const message = `sync r${local.rev} from ${local.deviceName || 'unnamed device'}`;
        const result = await publish(ports, local, head, message);
        if (result === 'race') {
          return { kind: 'conflict', reason: 'The GitHub copy changed while syncing — check and choose again.', local, remote: remoteMeta };
        }
        ports.book.save({ lastSyncedHash: local.hash, lastRemoteCommit: result, lastSyncAt: ports.now().toISOString() });
        return { kind: 'pushed', direction: decision.direction, commit: result };
      }
      case 'pull': {
        const files = await readRemoteFiles(ports.remote, head!, remoteMeta!);
        const stateText = (await ports.remote.readText('state.json', head!))!;
        // Everything fetched and valid — preserve the current copy, THEN replace.
        await ports.local.archivePreSync('before pulling the GitHub copy');
        await ports.local.applySnapshot(stateText, files);
        ports.book.save({ lastSyncedHash: remoteMeta!.hash, lastRemoteCommit: head, lastSyncAt: ports.now().toISOString() });
        return { kind: 'pulled', remote: remoteMeta! };
      }
      case 'conflict': {
        return { kind: 'conflict', reason: decision.reason, local, remote: remoteMeta };
      }
    }
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : 'Sync failed.' };
  }
}

/**
 * Explicit conflict resolution. NEVER destructive:
 * - keep 'local'  → the GitHub copy becomes the parent commit of ours, so it
 *   stays recoverable in git history.
 * - keep 'remote' → the local copy is archived to an in-app restore slot AND
 *   pushed to an `archive/…` branch on GitHub before anything is replaced.
 */
export async function resolveSyncConflict(ports: SyncPorts, keep: 'local' | 'remote'): Promise<SyncOutcome> {
  try {
    const local = await ports.local.buildSnapshot();
    const head = await ports.remote.getHead();

    if (keep === 'local') {
      const message = `sync r${local.rev} from ${local.deviceName || 'unnamed device'} (conflict: kept this device)`;
      const result = await publish(ports, local, head, message);
      if (result === 'race') {
        return { kind: 'conflict', reason: 'The GitHub copy changed again while resolving — check and choose again.', local, remote: head ? await readRemoteMeta(ports.remote, head) : null };
      }
      ports.book.save({ lastSyncedHash: local.hash, lastRemoteCommit: result, lastSyncAt: ports.now().toISOString() });
      return { kind: 'pushed', direction: 'push', commit: result };
    }

    // keep === 'remote'
    if (!head) return { kind: 'error', message: 'There is no GitHub copy to take.' };
    const remoteMeta = await readRemoteMeta(ports.remote, head);
    if (!remoteMeta) return { kind: 'error', message: 'The GitHub copy could not be read.' };

    // Archive the local copy remotely (side branch — main never moves) and
    // locally (restore slot) BEFORE replacing anything. If archiving fails,
    // resolution aborts and local data is untouched.
    const stamp = ports.now().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const device = (local.deviceName || 'device').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const archiveMessage = `archive r${local.rev} from ${local.deviceName || 'unnamed device'} (conflict: took GitHub copy)`;
    const archTree = await (async () => {
      // Build the archive commit with main's head as parent so history stays connected.
      const result = await publishToArchive(ports, local, head, archiveMessage, `archive/${device}-${stamp}`);
      return result;
    })();
    if (archTree !== 'ok') return { kind: 'error', message: 'Could not archive the local copy — nothing was replaced.' };

    await ports.local.archivePreSync('before taking the GitHub copy');
    const files = await readRemoteFiles(ports.remote, head, remoteMeta);
    const stateText = (await ports.remote.readText('state.json', head))!;
    await ports.local.applySnapshot(stateText, files);
    ports.book.save({ lastSyncedHash: remoteMeta.hash, lastRemoteCommit: head, lastSyncAt: ports.now().toISOString() });
    return { kind: 'pulled', remote: remoteMeta };
  } catch (e) {
    return { kind: 'error', message: e instanceof Error ? e.message : 'Sync failed.' };
  }
}

async function publishToArchive(
  ports: SyncPorts,
  snapshot: LocalSnapshot,
  parent: string,
  message: string,
  branch: string,
): Promise<'ok' | 'failed'> {
  try {
    const { remote } = ports;
    const known = new Map<string, ManifestAttachment>();
    const prevText = await remote.readText('manifest.json', parent);
    if (prevText) for (const a of (JSON.parse(prevText) as RemoteManifest).attachments) known.set(a.id, a);

    const attachments: ManifestAttachment[] = [];
    for (const f of snapshot.files) {
      const prev = known.get(f.id);
      const blobSha = prev ? prev.blobSha : await remote.createBlobBase64(f.data);
      attachments.push({ id: f.id, ownerId: f.ownerId, name: f.name, mime: f.mime, size: Math.floor((f.data.length * 3) / 4), blobSha });
    }
    const manifest: RemoteManifest = {
      formatVersion: 2,
      hash: snapshot.hash,
      rev: snapshot.rev,
      deviceName: snapshot.deviceName || undefined,
      savedAt: ports.now().toISOString(),
      attachments,
    };
    const entries: TreeEntry[] = [
      { path: 'manifest.json', sha: await remote.createTextBlob(JSON.stringify(manifest, null, 2)) },
      { path: 'state.json', sha: await remote.createTextBlob(snapshot.stateText) },
      ...attachments.map((a) => ({ path: `files/${a.id}`, sha: a.blobSha })),
    ];
    const tree = await remote.createTree(entries);
    const commit = await remote.createCommit(message, tree, [parent]);
    await remote.createArchiveBranch(branch, commit);
    return 'ok';
  } catch {
    return 'failed';
  }
}
