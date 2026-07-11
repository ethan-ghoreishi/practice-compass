import { beforeEach, describe, expect, it } from 'vitest';
import { hashState } from '../domain';
import {
  resolveSyncConflict,
  runSync,
  type LocalSnapshot,
  type RemotePort,
  type SnapshotFile,
  type SyncBook,
  type SyncPorts,
} from './syncEngine';

// ---------------------------------------------------------------------------
// In-memory fake of the Git Data API with real git semantics: content-
// addressed objects, full trees, parent chains, fast-forward-only ref
// updates, and injectable failures. Lets us test the whole protocol.
// ---------------------------------------------------------------------------

interface FakeCommit {
  tree: Map<string, string>; // path → blob key
  parents: string[];
  message: string;
}

class FakeGit implements RemotePort {
  blobs = new Map<string, string>(); // sha → base64
  trees = new Map<string, Map<string, string>>();
  commits = new Map<string, FakeCommit>();
  refs = new Map<string, string>(); // branch → sha
  failNextCreateBlob = 0;
  raceOnAdvance = false;
  private seq = 0;

  private sha(prefix: string) {
    return `${prefix}-${++this.seq}`;
  }

  async getHead() {
    return this.refs.get('main') ?? null;
  }
  async readText(path: string, ref: string) {
    const commit = this.commits.get(ref);
    if (!commit) return null;
    const blobSha = commit.tree.get(path);
    if (!blobSha) return null;
    return decodeB64(this.blobs.get(blobSha)!);
  }
  async listDir(path: string, ref: string) {
    const commit = this.commits.get(ref);
    if (!commit) return [];
    const names: { name: string }[] = [];
    for (const p of commit.tree.keys()) {
      if (p.startsWith(`${path}/`)) names.push({ name: p.slice(path.length + 1) });
    }
    return names;
  }
  async readBlobBase64(sha: string) {
    const b = this.blobs.get(sha);
    if (b === undefined) throw new Error(`no blob ${sha}`);
    return b;
  }
  async createBlobBase64(b64: string) {
    if (this.failNextCreateBlob > 0 && --this.failNextCreateBlob === 0) throw new Error('network died mid-upload');
    const sha = this.sha('blob');
    this.blobs.set(sha, b64);
    return sha;
  }
  async createTextBlob(text: string) {
    return this.createBlobBase64(encodeB64(text));
  }
  async createTree(entries: { path: string; sha: string }[]) {
    const sha = this.sha('tree');
    this.trees.set(sha, new Map(entries.map((e) => [e.path, e.sha])));
    return sha;
  }
  async createCommit(message: string, treeSha: string, parents: string[]) {
    const sha = this.sha('commit');
    this.commits.set(sha, { tree: this.trees.get(treeSha)!, parents, message });
    return sha;
  }
  async advanceHead(sha: string, expectedParent: string | null): Promise<'ok' | 'race'> {
    if (this.raceOnAdvance) return 'race';
    const current = this.refs.get('main') ?? null;
    if (current !== expectedParent) return 'race'; // fast-forward check
    this.refs.set('main', sha);
    return 'ok';
  }
  async createArchiveBranch(name: string, sha: string) {
    this.refs.set(name, sha);
  }
}

function encodeB64(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}
function decodeB64(b64: string): string {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

// ---- Fake local device -------------------------------------------------------

interface Device {
  db: Record<string, unknown>;
  files: SnapshotFile[];
  rev: number;
  name: string;
  archived: string[]; // reasons, in order
  book: SyncBook;
}

function makeDevice(name: string): Device {
  return {
    db: { items: [{ id: 'i1', title: 'Darāmad' }], pathways: [{ id: 'p1' }] },
    files: [],
    rev: 1,
    name,
    archived: [],
    book: { lastSyncedHash: null, lastRemoteCommit: null, lastSyncAt: null },
  };
}

function portsFor(device: Device, git: FakeGit): SyncPorts {
  return {
    remote: git,
    local: {
      buildSnapshot: async (): Promise<LocalSnapshot> => ({
        stateText: JSON.stringify({ app: 'practice-compass', data: device.db, deviceName: device.name, files: [] }),
        files: device.files,
        hash: await hashState(device.db),
        rev: device.rev,
        deviceName: device.name,
      }),
      applySnapshot: async (stateText, files) => {
        device.db = (JSON.parse(stateText) as { data: Record<string, unknown> }).data;
        device.files = files;
      },
      archivePreSync: async (reason) => {
        device.archived.push(reason);
      },
    },
    book: {
      load: () => ({ ...device.book }),
      save: (b) => {
        device.book = b;
      },
    },
    now: () => new Date('2026-07-11T12:00:00Z'),
  };
}

function mutate(device: Device, patch: Record<string, unknown>) {
  device.db = { ...device.db, ...patch };
  device.rev += 1;
}

// -------------------------------------------------------------------------------

let git: FakeGit;
let mac: Device;
let phone: Device;

beforeEach(() => {
  git = new FakeGit();
  mac = makeDevice('MacBook');
  phone = makeDevice('iPhone');
});

describe('sync engine protocol', () => {
  it('first sync publishes an atomic snapshot (manifest + state + head)', async () => {
    const out = await runSync(portsFor(mac, git));
    expect(out.kind).toBe('pushed');
    const head = await git.getHead();
    expect(head).not.toBeNull();
    const manifest = JSON.parse((await git.readText('manifest.json', head!))!);
    expect(manifest.hash).toBe(await hashState(mac.db));
    expect(mac.book.lastSyncedHash).toBe(manifest.hash);
  });

  it('second device with identical data lands in-sync without writing', async () => {
    await runSync(portsFor(mac, git));
    const headBefore = await git.getHead();
    const out = await runSync(portsFor(phone, git));
    expect(out.kind).toBe('in-sync');
    expect(await git.getHead()).toBe(headBefore);
    expect(phone.book.lastSyncedHash).toBe(mac.book.lastSyncedHash);
  });

  it('pathway-only changes and deletions push correctly (content hash, not timestamps)', async () => {
    await runSync(portsFor(mac, git));
    mutate(mac, { pathways: [] }); // deletion of a pathway — no item touched
    const out = await runSync(portsFor(mac, git));
    expect(out.kind).toBe('pushed');
    const state = JSON.parse((await git.readText('state.json', (await git.getHead())!))!);
    expect(state.data.pathways).toEqual([]);
  });

  it('pull archives the current copy BEFORE replacing, then applies and books', async () => {
    await runSync(portsFor(mac, git));
    await runSync(portsFor(phone, git)); // phone in sync
    mutate(mac, { items: [{ id: 'i1', title: 'Darāmad (better fingering)' }] });
    await runSync(portsFor(mac, git));

    const out = await runSync(portsFor(phone, git));
    expect(out.kind).toBe('pulled');
    expect(phone.archived).toHaveLength(1);
    expect((phone.db.items as { title: string }[])[0].title).toBe('Darāmad (better fingering)');
    expect(phone.book.lastSyncedHash).toBe(await hashState(mac.db));
  });

  it('attachments upload once, transfer on pull, and deletions drop them from the snapshot', async () => {
    await runSync(portsFor(mac, git));
    await runSync(portsFor(phone, git)); // phone in sync before the file exists

    mac.files = [{ id: 'f1', ownerId: 'i1', name: 'score.pdf', mime: 'application/pdf', data: encodeB64('PDFBYTES') }];
    mutate(mac, { attachments: [{ id: 'f1' }] });
    await runSync(portsFor(mac, git));
    const blobsAfterFirst = git.blobs.size;

    // Unchanged attachment: pushing again must NOT re-upload its blob.
    mutate(mac, { items: [{ id: 'i1', title: 'renamed' }] });
    await runSync(portsFor(mac, git));
    // (+2 new text blobs for manifest/state, no new attachment blob)
    expect(git.blobs.size).toBe(blobsAfterFirst + 2);

    // Pull onto the phone: file arrives intact.
    await runSync(portsFor(phone, git));
    expect(phone.files).toHaveLength(1);
    expect(decodeB64(phone.files[0].data)).toBe('PDFBYTES');

    // Delete the attachment: next snapshot's tree no longer contains it.
    mutate(mac, { attachments: [] });
    mac.files = [];
    await runSync(portsFor(mac, git));
    expect(await git.readText('files/f1', (await git.getHead())!)).toBeNull();
  });

  it('both-changed is an explicit conflict — nothing written, nothing replaced', async () => {
    await runSync(portsFor(mac, git));
    await runSync(portsFor(phone, git));
    mutate(mac, { items: [{ id: 'i1', title: 'mac edit' }] });
    await runSync(portsFor(mac, git));
    mutate(phone, { items: [{ id: 'i1', title: 'phone edit' }] });

    const headBefore = await git.getHead();
    const out = await runSync(portsFor(phone, git));
    expect(out.kind).toBe('conflict');
    expect(await git.getHead()).toBe(headBefore);
    expect((phone.db.items as { title: string }[])[0].title).toBe('phone edit');
    expect(phone.archived).toHaveLength(0);
  });

  it('first sync on a device with different local data + existing remote asks, never guesses', async () => {
    await runSync(portsFor(mac, git));
    mutate(phone, { items: [{ id: 'iX', title: 'unrelated phone data' }] });
    const out = await runSync(portsFor(phone, git));
    expect(out.kind).toBe('conflict');
  });

  it('conflict → keep local: pushes WITH the remote head as parent, so the remote copy stays in history', async () => {
    await runSync(portsFor(mac, git));
    await runSync(portsFor(phone, git));
    mutate(mac, { items: [{ id: 'i1', title: 'mac edit' }] });
    await runSync(portsFor(mac, git));
    const remoteHeadBefore = await git.getHead();
    mutate(phone, { items: [{ id: 'i1', title: 'phone edit' }] });

    const out = await resolveSyncConflict(portsFor(phone, git), 'local');
    expect(out.kind).toBe('pushed');
    const head = await git.getHead();
    expect(git.commits.get(head!)!.parents).toContain(remoteHeadBefore);
    // Remote (mac) copy recoverable from the parent commit:
    const oldState = JSON.parse((await git.readText('state.json', remoteHeadBefore!))!);
    expect(oldState.data.items[0].title).toBe('mac edit');
  });

  it('conflict → take remote: local copy archived to a branch AND the in-app slot BEFORE replacing', async () => {
    await runSync(portsFor(mac, git));
    await runSync(portsFor(phone, git));
    mutate(mac, { items: [{ id: 'i1', title: 'mac edit' }] });
    await runSync(portsFor(mac, git));
    mutate(phone, { items: [{ id: 'i1', title: 'phone edit' }] });

    const out = await resolveSyncConflict(portsFor(phone, git), 'remote');
    expect(out.kind).toBe('pulled');
    expect((phone.db.items as { title: string }[])[0].title).toBe('mac edit');
    expect(phone.archived).toHaveLength(1); // in-app restore slot
    const archiveBranch = [...git.refs.keys()].find((r) => r.startsWith('archive/iphone-'));
    expect(archiveBranch).toBeDefined(); // remote archive branch
    const archived = JSON.parse((await git.readText('state.json', git.refs.get(archiveBranch!)!))!);
    expect(archived.data.items[0].title).toBe('phone edit');
  });

  it('partial attachment failure aborts BEFORE the ref moves — remote snapshot stays complete', async () => {
    await runSync(portsFor(mac, git));
    const headBefore = await git.getHead();
    const bookBefore = { ...mac.book };
    mac.files = [
      { id: 'f1', ownerId: 'i1', name: 'a.pdf', mime: 'application/pdf', data: encodeB64('A') },
      { id: 'f2', ownerId: 'i1', name: 'b.pdf', mime: 'application/pdf', data: encodeB64('B') },
    ];
    mutate(mac, { attachments: [{ id: 'f1' }, { id: 'f2' }] });
    git.failNextCreateBlob = 2; // second upload dies

    const out = await runSync(portsFor(mac, git));
    expect(out.kind).toBe('error');
    expect(await git.getHead()).toBe(headBefore); // head untouched
    expect(mac.book).toEqual(bookBefore); // bookkeeping untouched

    // Reconnect after the outage: the retry completes the same push.
    const retry = await runSync(portsFor(mac, git));
    expect(retry.kind).toBe('pushed');
    expect(await git.readText('files/f2', (await git.getHead())!)).not.toBeNull();
  });

  it('a race on the ref update is surfaced as a conflict, not a clobber', async () => {
    await runSync(portsFor(mac, git));
    mutate(mac, { items: [{ id: 'i1', title: 'mac edit' }] });
    git.raceOnAdvance = true;
    const out = await runSync(portsFor(mac, git));
    expect(out.kind).toBe('conflict');
  });

  it('legacy remotes (state.json + JSON-wrapped files/, no manifest) pull losslessly', async () => {
    // Hand-craft a format-1 remote, as the previous app version wrote it.
    const legacyDb = { items: [{ id: 'L1', title: 'legacy item' }], pathways: [] };
    const legacyFile = { id: 'lf1', ownerId: 'L1', mime: 'image/png', name: 'photo.png', data: encodeB64('PNG') };
    const stateSha = await git.createTextBlob(JSON.stringify({ app: 'practice-compass', data: legacyDb, deviceName: 'old-mac', files: [] }));
    const fileSha = await git.createTextBlob(JSON.stringify(legacyFile));
    const tree = await git.createTree([
      { path: 'state.json', sha: stateSha },
      { path: 'files/lf1', sha: fileSha },
    ]);
    const commit = await git.createCommit('legacy snapshot', tree, []);
    await git.advanceHead(commit, null);

    // Phone had synced in the legacy era (book without hashes) and unchanged data.
    phone.db = legacyDb;
    const out = await runSync(portsFor(phone, git));
    expect(out.kind).toBe('in-sync'); // identical content recognised without a manifest

    // A fresh device pulls the legacy snapshot completely.
    const fresh = makeDevice('fresh');
    fresh.db = {}; // hash differs → conflict (first sync, remote exists)
    const conflictOut = await runSync(portsFor(fresh, git));
    expect(conflictOut.kind).toBe('conflict');
    const resolved = await resolveSyncConflict(portsFor(fresh, git), 'remote');
    expect(resolved.kind).toBe('pulled');
    expect((fresh.db.items as { title: string }[])[0].title).toBe('legacy item');
    expect(decodeB64(fresh.files[0].data)).toBe('PNG');

    // First push after legacy migrates the format; the legacy snapshot stays as the parent commit.
    mutate(fresh, { items: [{ id: 'L1', title: 'migrated edit' }] });
    const pushed = await runSync(portsFor(fresh, git));
    expect(pushed.kind).toBe('pushed');
    const head = (await git.getHead())!;
    expect(await git.readText('manifest.json', head)).not.toBeNull();
    expect(git.commits.get(head)!.parents).toContain(commit);
  });
});
