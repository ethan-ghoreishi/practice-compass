import { useEffect, useRef, useState } from 'react';
import { normalizeBaseUrl, resolveRecording, SETAR_CLASS_SESSIONS } from '../domain';
import { useStore, type ThemePref } from '../store/useStore';
import {
  buildFullBackup,
  getDeviceName,
  getNasBaseUrl,
  importFullBackup,
  lastModifiedOf,
  readBackupMeta,
  setDeviceName,
  setNasBaseUrl,
} from '../store/backup';
import {
  getSyncConfig,
  refreshArchiveStatus,
  resolveConflict,
  restorePreSyncArchive,
  setSyncConfig,
  syncNow,
  useSyncStatus,
} from '../store/githubSync';
import { Field } from '../components/ui';
import { DownloadIcon, PlusIcon, UploadIcon } from '../components/icons';

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const LAST_EXPORT_KEY = 'pc-last-export';

export default function Settings() {
  const db = useStore((s) => s.db);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const addInstrument = useStore((s) => s.addInstrument);
  const updateInstrument = useStore((s) => s.updateInstrument);
  const resetDemo = useStore((s) => s.resetDemo);
  const clearAll = useStore((s) => s.clearAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [newInstrument, setNewInstrument] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deviceName, setDeviceNameState] = useState(getDeviceName());
  const [lastExport, setLastExport] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_EXPORT_KEY);
    } catch {
      return null;
    }
  });

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  async function exportFile() {
    setBusy(true);
    try {
      const json = await buildFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const device = getDeviceName() ? `-${getDeviceName().toLowerCase().replace(/\s+/g, '-')}` : '';
      a.download = `practice-compass${device}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const ts = new Date().toISOString();
      try {
        localStorage.setItem(LAST_EXPORT_KEY, ts);
      } catch {
        /* ignore */
      }
      setLastExport(ts);
      flash('Backup exported (data + files).');
    } finally {
      setBusy(false);
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();

      // Warn when the backup looks OLDER than what's on this device.
      const meta = readBackupMeta(text);
      const localLatest = lastModifiedOf(db);
      const backupLatest = meta?.lastModified ?? meta?.exportedAt ?? '';
      let ok: boolean;
      if (backupLatest && localLatest && backupLatest < localLatest) {
        ok = confirm(
          `⚠️ This backup looks OLDER than the data on this device.\n\nBackup${meta?.deviceName ? ` (from “${meta.deviceName}”)` : ''}: last change ${backupLatest.slice(0, 16).replace('T', ' ')}\nThis device: last change ${localLatest.slice(0, 16).replace('T', ' ')}\n\nImporting replaces EVERYTHING here with the older copy. Continue?`,
        );
      } else {
        ok = confirm(
          `Importing replaces all data and files on this device${meta?.deviceName ? ` with the backup from “${meta.deviceName}”` : ''}. Continue?`,
        );
      }
      if (ok) {
        const result = await importFullBackup(text);
        flash(result.ok ? `Imported (${result.fileCount} file${result.fileCount === 1 ? '' : 's'}).` : `Import failed: ${result.error}`);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Settings &amp; backup</h1>
        <p className="page-sub">Your practice lives on this device; the rest is on your terms.</p>
      </header>

      <section className="stack-sm">
        <div className="section-label">How your data is stored</div>
        <div className="card stack-sm small">
          <StorageRole
            title="On this device"
            body="The source of truth. Everything works fully offline; nothing here needs the internet."
          />
          <StorageRole
            title="GitHub sync (optional)"
            body="Keeps the MacBook and iPhone on the same data — small, versioned snapshots through one private repo you own. Use it only for apps you actually use on more than one device; a phone-only app doesn’t need it."
          />
          <StorageRole
            title="NAS backup (optional)"
            body="Your own full export (data + files) kept independently on the NAS. Sync history is convenient, but keep a real backup too — don’t rely on the sync repo as your only copy."
          />
          <StorageRole
            title="NAS recordings & scores"
            body="Large class videos — and score PDFs/docs — stay on the NAS; the app only stores small links to them. They never enter local storage, sync, or backups. Small ad-hoc photos and snippets can still be attached to a lesson directly."
          />
        </div>
      </section>

      <section className="stack-sm">
        <div className="section-label">Appearance</div>
        <div className="options">
          {THEME_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`option${theme === o.value ? ' selected' : ''}`}
              onClick={() => setTheme(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="stack-sm">
        <div className="section-label">Install as an app</div>
        <div className="card stack-sm small dim">
          <div>
            <strong style={{ color: 'var(--text)' }}>iPhone / iPad (Safari):</strong> tap the Share button, then{' '}
            <strong style={{ color: 'var(--text)' }}>“Add to Home Screen.”</strong>
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Android (Chrome):</strong> menu (⋮) →{' '}
            <strong style={{ color: 'var(--text)' }}>“Install app.”</strong>
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Desktop (Chrome / Edge):</strong> the install icon in the address bar.
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Mac (Safari):</strong> File →{' '}
            <strong style={{ color: 'var(--text)' }}>“Add to Dock.”</strong>
          </div>
          <div className="tiny faint">
            It opens full-screen as its own app, works offline, and keeps all data on the device. With sync (below)
            turned on, the MacBook and iPhone apps stay on the same data.
          </div>
        </div>
      </section>

      <SyncSection />

      <section className="stack-sm">
        <div className="section-label">Instruments</div>
        <div className="card stack-sm">
          {db.instruments.map((inst) => (
            <div key={inst.id} className="row" style={{ gap: 8 }}>
              <input
                className="input grow"
                value={inst.name}
                onChange={(e) => updateInstrument(inst.id, { name: e.target.value })}
              />
              <button
                className={`btn btn-sm${inst.active ? ' btn-primary' : ''}`}
                onClick={() => updateInstrument(inst.id, { active: !inst.active })}
                title={inst.active ? 'Active — tap to hide from quick start' : 'Hidden — tap to activate'}
              >
                {inst.active ? 'Active' : 'Hidden'}
              </button>
            </div>
          ))}
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input grow"
              placeholder="Add an instrument…"
              value={newInstrument}
              onChange={(e) => setNewInstrument(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newInstrument.trim()) {
                  addInstrument({ name: newInstrument });
                  setNewInstrument('');
                }
              }}
            />
            <button
              className="btn btn-sm"
              disabled={!newInstrument.trim()}
              onClick={() => {
                addInstrument({ name: newInstrument });
                setNewInstrument('');
              }}
            >
              <PlusIcon /> Add
            </button>
          </div>
        </div>
      </section>

      <section className="stack-sm">
        <div className="section-label">Device &amp; handoff</div>
        <div className="card stack-sm">
          <div className="small dim">
            Each device keeps its own local copy (everything works offline). With{' '}
            <strong style={{ color: 'var(--text)' }}>sync</strong> on, devices exchange whole snapshots through your
            GitHub repo — newest copy wins, and if both changed you choose. Without sync, moving data is a manual
            export → import.
          </div>
          <Field label="This device's name" hint="Stamped into backups and sync commits so you can tell devices apart (e.g. iPhone, MacBook).">
            <input
              className="input"
              placeholder="e.g. MacBook"
              value={deviceName}
              onChange={(e) => setDeviceNameState(e.target.value)}
              onBlur={() => setDeviceName(deviceName)}
              style={{ maxWidth: 240 }}
            />
          </Field>
          <div className="tiny faint">
            Last export from this device: {lastExport ? lastExport.slice(0, 16).replace('T', ' ') : 'never'} · latest
            change here: {lastModifiedOf(db) ? lastModifiedOf(db).slice(0, 16).replace('T', ' ') : '—'}
          </div>
        </div>
      </section>

      <NasRecordingsSection onFlash={flash} />

      <section className="stack-sm">
        <div className="section-label">Data &amp; backup</div>
        <div className="card stack-sm">
          <div className="row-wrap small dim">
            {db.items.length} items · {db.blocks.length} blocks · {db.pathways.length} pathways ·{' '}
            {db.attachments.length} file{db.attachments.length === 1 ? '' : 's'}
          </div>
          <div className="grid-2">
            <button className="btn" onClick={exportFile} disabled={busy}>
              <DownloadIcon /> {busy ? 'Working…' : 'Export backup'}
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
              <UploadIcon /> Import backup
            </button>
          </div>
          <div className="tiny faint">A backup is one file with all your data and attached files — save it to your NAS or iCloud.</div>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
          <Field hint="Replaces all data with the original demo dataset.">
            <button
              className="btn btn-sm"
              onClick={() => {
                if (confirm('Reset to demo data? This replaces everything.')) {
                  resetDemo();
                  flash('Demo data restored.');
                }
              }}
            >
              Reset demo data
            </button>
          </Field>
          <Field hint="Removes all instruments, items and history.">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm('Erase ALL data? This cannot be undone.')) {
                  clearAll();
                  flash('All data cleared.');
                }
              }}
            >
              Clear all data
            </button>
          </Field>
        </div>
      </section>

      <div className="tiny faint" style={{ textAlign: 'center' }}>
        Practice Compass · build {__APP_VERSION__}
      </div>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}

/**
 * Mac ↔ iPhone sync through a GitHub repo the user owns. Free, no server of
 * ours, and honest: whole snapshots compared by content hash, an explicit
 * two-button choice when both changed (the newer side is only a
 * recommendation), and both copies preserved before anything is replaced.
 * The token stays in this browser's localStorage only.
 */
function SyncSection() {
  const status = useSyncStatus();
  const [cfg, setCfg] = useState(() => getSyncConfig());
  const [repo, setRepo] = useState(cfg?.repo ?? 'ethan-ghoreishi/practice-compass-data');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshArchiveStatus();
  }, []);

  async function connectAndSync() {
    const next = { repo: repo.trim().replace(/^https?:\/\/github\.com\//, ''), token: token.trim() };
    setSyncConfig(next);
    setCfg(next);
    setToken('');
    setBusy(true);
    await syncNow();
    setBusy(false);
  }

  async function manualSync() {
    setBusy(true);
    await syncNow();
    setBusy(false);
  }

  async function resolve(keep: 'local' | 'remote') {
    setBusy(true);
    await resolveConflict(keep);
    setBusy(false);
  }

  async function restoreArchive() {
    if (!confirm('Restore the archived copy? It replaces the data currently on this device (the current data is what sync last wrote here).')) return;
    setBusy(true);
    const result = await restorePreSyncArchive();
    setBusy(false);
    if (!result.ok) alert(result.error);
  }

  const fmt = (iso?: string | null) => (iso ? iso.slice(0, 16).replace('T', ' ') : '—');
  const remoteNewer =
    status.conflict?.remote?.savedAt && status.lastSyncAt ? status.conflict.remote.savedAt > status.lastSyncAt : false;

  return (
    <section className="stack-sm">
      <div className="section-label">Sync (GitHub)</div>
      <div className="card stack-sm">
        {!cfg ? (
          <>
            <div className="small dim">
              Keep the MacBook and iPhone on the same data through a private GitHub repo you own — free, works from
              anywhere, no server. The app stays fully offline-capable; sync happens when you're online.
            </div>
            <Field label="Repository" hint="owner/name of a repo dedicated to this app's data.">
              <input className="input" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="you/practice-compass-data" />
            </Field>
            <Field
              label="Access token"
              hint="GitHub → Settings → Developer settings → Fine-grained tokens → New: select ONLY that repo, permission “Contents: Read and write”. Stored in this browser only — never in backups or synced data."
            >
              <input
                className="input"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_…"
                autoComplete="off"
              />
            </Field>
            <button className="btn btn-primary" disabled={!repo.trim() || !token.trim() || busy} onClick={connectAndSync}>
              Connect &amp; sync
            </button>
          </>
        ) : (
          <>
            <div className="row between small">
              <span className="dim">
                Repo: <strong style={{ color: 'var(--text)' }}>{cfg.repo}</strong>
              </span>
              <span className="tiny faint">
                {getDeviceName() || 'unnamed device'} · last sync {fmt(status.lastSyncAt)} · data {status.localHash}
              </span>
            </div>

            <div className="small" style={{ color: status.phase === 'error' ? 'var(--tone-alert)' : undefined }}>
              {status.phase === 'syncing' ? 'Syncing…' : status.message}
            </div>

            {status.phase === 'error' && (
              <div className="tiny dim">
                Nothing was replaced — an interrupted sync never leaves a half-written copy on either side. Check the
                connection or token, then “Sync now”.
              </div>
            )}

            {status.phase === 'conflict' && status.conflict && (
              <div className="card card-quiet stack-sm">
                <div className="small">
                  Both copies have changes. Choose which one to continue from — the other is <strong>archived, not
                  destroyed</strong> (restorable below / from the repo's archive branches).
                </div>
                <div className="tiny dim">
                  This device ({status.conflict.local.deviceName || 'unnamed'}) · revision r{status.conflict.local.rev ?? '—'}
                  <br />
                  GitHub copy{status.conflict.remote?.deviceName ? ` (from ${status.conflict.remote.deviceName})` : ''} · saved{' '}
                  {fmt(status.conflict.remote?.savedAt)}
                  {remoteNewer && ' · more recent'}
                </div>
                <div className="grid-2">
                  <button className="btn" disabled={busy} onClick={() => resolve('local')}>
                    Keep this device's copy
                  </button>
                  <button className="btn" disabled={busy} onClick={() => resolve('remote')}>
                    Take the GitHub copy
                  </button>
                </div>
              </div>
            )}

            <div className="row" style={{ gap: 8 }}>
              <button className="btn" disabled={busy || status.phase === 'syncing'} onClick={manualSync}>
                Sync now
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (confirm('Turn sync off on this device? Data stays put; only the connection is removed.')) {
                    setSyncConfig(null);
                    setCfg(null);
                  }
                }}
              >
                Disconnect
              </button>
            </div>

            {status.archiveAvailable && (
              <div className="row between tiny dim" style={{ gap: 8 }}>
                <span>
                  Archived copy from {fmt(status.archiveMeta?.savedAt)} ({status.archiveMeta?.reason ?? 'pre-sync'}) is
                  kept on this device.
                </span>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={restoreArchive} style={{ flex: 'none' }}>
                  Restore it
                </button>
              </div>
            )}

            <div className="tiny faint">
              Syncs when the app opens, after a quiet moment following changes, when you come back online, and on “Sync
              now”. Attachments upload once; only new or deleted files transfer.
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * NAS recordings: the base URL that resolves relative class-recording paths,
 * plus a one-tap importer for the Setar class history. Full videos never enter
 * the app — only these references do.
 */
function NasRecordingsSection({ onFlash }: { onFlash: (msg: string) => void }) {
  const db = useStore((s) => s.db);
  const importSetarClasses = useStore((s) => s.importSetarClasses);
  const [baseUrl, setBaseUrlState] = useState(getNasBaseUrl());

  const setar = db.instruments.find((i) => i.family === 'Persian' && /setar|سه‌تار|سه تار/i.test(i.name));
  const trimmed = baseUrl.trim();
  const normalized = trimmed ? normalizeBaseUrl(trimmed) : null;
  const invalid = trimmed.length > 0 && normalized === null;

  function commitBaseUrl() {
    // Normalise on blur so a scheme-less host (the reported bug) becomes a real
    // https URL, and echo the cleaned value back into the field.
    const clean = normalizeBaseUrl(baseUrl);
    const next = clean ?? baseUrl.trim();
    setBaseUrlState(next);
    setNasBaseUrl(next);
  }

  function runImport() {
    if (!setar) {
      onFlash('Add a Setar instrument first.');
      return;
    }
    const count = importSetarClasses(setar.id);
    onFlash(count > 0 ? `Imported ${count} Setar class${count === 1 ? '' : 'es'}.` : 'All Setar classes are already imported.');
  }

  function testLink() {
    const first = SETAR_CLASS_SESSIONS[0];
    const r = resolveRecording(normalizeBaseUrl(baseUrl) ?? baseUrl, { path: first.video });
    if (r.status === 'ok') {
      window.open(r.url, '_blank', 'noopener,noreferrer');
    } else if (r.status === 'bad-base') {
      onFlash('That base URL isn’t valid — check it and try again.');
    } else {
      onFlash('Enter a base URL first.');
    }
  }

  const testUrl = resolveRecording(normalized ?? undefined, { path: SETAR_CLASS_SESSIONS[0].video });

  return (
    <section className="stack-sm">
      <div className="section-label">NAS recordings</div>
      <div className="card stack-sm">
        <div className="small dim">
          Full class videos stay on your NAS. Lessons hold a small <strong style={{ color: 'var(--text)' }}>link</strong>{' '}
          to each recording; set the base URL that serves your recording folders and the links resolve against it.
        </div>
        <Field
          label="NAS recordings base URL"
          hint="e.g. https://ds220plus.taild1d1f7.ts.net/media — relative recording paths are joined onto this. Stored on this device only; never synced, never a password. See DECISIONS.md to serve the folder over HTTPS."
        >
          <input
            className="input"
            type="url"
            inputMode="url"
            enterKeyHint="done"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://ds220plus.taild1d1f7.ts.net/media"
            value={baseUrl}
            onChange={(e) => setBaseUrlState(e.target.value)}
            onBlur={commitBaseUrl}
          />
        </Field>
        {invalid ? (
          <div className="tiny" style={{ color: 'var(--tone-alert)' }}>
            That doesn’t look like a valid web address.
          </div>
        ) : normalized ? (
          <div className="tiny faint">Resolves to: {normalized}/…</div>
        ) : null}

        <div className="row between" style={{ gap: 8 }}>
          <div className="tiny faint">Open session 1’s recording to check the base URL works.</div>
          <button className="btn btn-sm" style={{ flex: 'none' }} disabled={!normalized || testUrl.status !== 'ok'} onClick={testLink}>
            Test link
          </button>
        </div>

        <div className="row between" style={{ gap: 8 }}>
          <div className="tiny faint">Import your logged Setar classes as lessons (recording links, no video).</div>
          <button className="btn btn-sm" style={{ flex: 'none' }} onClick={runImport}>
            Import Setar classes
          </button>
        </div>
      </div>
    </section>
  );
}

/** One row of the storage-model explainer. */
function StorageRole({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div className="dim">{body}</div>
    </div>
  );
}
