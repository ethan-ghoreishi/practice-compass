import { useEffect, useRef, useState } from 'react';
import {
  clampSchedulingParams,
  ITEM_STATUS_DESCRIPTIONS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  describeMediaRoot,
  mediaRoot,
  normalizeBaseUrl,
  RATING_ANCHORS,
  RATING_EFFECT_NOTE,
  RATING_HINTS,
  RATING_LABELS,
  RESULT_BUTTONS,
  RESULT_DESCRIPTIONS,
  RESULT_LABELS,
  SCHEDULING_BOUNDS,
  type SchedulingParams,
} from '../domain';
import { useStore, type ThemePref } from '../store/useStore';
import {
  buildFullBackup,
  getDeviceName,
  getMediaRootOverride,
  getNasBaseUrl,
  importFullBackup,
  lastModifiedOf,
  readBackupMeta,
  setDeviceName,
  setMediaRootOverride,
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
import ArchiveRefresh from '../components/ArchiveRefresh';
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

      <NasRecordingsSection />

      <SchedulingSection />

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
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            aria-label="Import backup file"
            hidden
            onChange={onImportFile}
          />
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
 * plus the Setar archive refresh. Full videos never enter the app — only these
 * references do.
 *
 * THE BASE IS THE ARCHIVE FOLDER ITSELF, not the media root above it. Every
 * reference the app stores is relative to the ARCHIVE root (`session-39-…/…`),
 * so a base of `https://nas:5010` resolves a class recording to
 * `https://nas:5010/session-39-…/…` — a URL that addresses no file. This label
 * used to name the media root, and to promise that changing the base broke
 * nothing; it is the one setting a device carries from before the archive
 * existed, and correcting it is a one-off the copy here has to ask for.
 */
function NasRecordingsSection() {
  const [baseUrl, setBaseUrlState] = useState(getNasBaseUrl());

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

  return (
    <section className="stack-sm">
      <div className="section-label">NAS recordings</div>
      <div className="card stack-sm">
        <div className="small dim">
          Full class videos stay on your NAS. Lessons hold a small <strong style={{ color: 'var(--text)' }}>link</strong>{' '}
          to each recording; set the address of the <strong style={{ color: 'var(--text)' }}>archive folder itself</strong>{' '}
          and the links resolve against it.
        </div>
        <Field
          label="Setar archive base URL"
          hint="The archive FOLDER, not the media root above it — e.g. https://192.168.0.20:5010/setar-classes. References are stored relative to this (session-39-…/…), so a base one folder too high resolves every file to a URL that addresses nothing. Stored on this device only; never synced, never a password. Each device sets its own route to the same archive."
        >
          <input
            className="input"
            type="url"
            inputMode="url"
            enterKeyHint="done"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://192.168.0.20:5010/setar-classes"
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
          <div className="tiny faint">
            Browse opens the archive folder itself — if it does not list the session folders, the base is wrong. Copy a
            file's URL from there and paste it into a lesson: a URL under this base is stored as a relative path, so it
            keeps working whatever route a device takes to the NAS.
          </div>
          <button
            className="btn btn-sm"
            style={{ flex: 'none' }}
            disabled={!normalized}
            onClick={() => normalized && window.open(`${normalized}/`, '_blank', 'noopener,noreferrer')}
          >
            Browse
          </button>
        </div>

        {/* A single clip proved nothing: it fails for a file that was renamed
            and passes for a base whose other thousand files are unreachable.
            The ARCHIVE ROOT is what was configured, so it is what opens. */}
        <div className="row between" style={{ gap: 8 }}>
          <div className="tiny faint">
            Opening a file is a direct request from this device. The app cannot check from here whether the NAS is
            reachable — a certificate, a blocked cross-origin request and an outage all look the same to it.
          </div>
        </div>
      </div>

      <MediaRootSection archiveBase={normalized ?? ''} />

      <ArchiveRefresh />
    </section>
  );
}

/**
 * THE SHARED MEDIA ROOT — DERIVED, SHOWN, AND OVERRIDABLE.
 *
 * The NAS serves one tree with `setar-classes/`, `classical-guitar/` and
 * `tar-classes/` side by side, so the archive base above is exactly
 * `<media root>/setar-classes`. The root is therefore the folder ABOVE it and
 * needs no asking for — this panel SHOWS what was derived rather than
 * requesting it again, with Browse to confirm and an override for a device
 * whose tree genuinely is not laid out this way.
 *
 * This is not a second base for the archive and not a resolver fallback:
 * nothing resolves against two bases in turn, the archive base keeps its exact
 * value and meaning, and a course file that cannot resolve says so rather than
 * being retried somewhere else.
 */
function MediaRootSection({ archiveBase }: { archiveBase: string }) {
  const [override, setOverride] = useState(getMediaRootOverride());
  const trimmed = override.trim();
  const root = mediaRoot({ archiveBase, override: trimmed });
  const explanation = describeMediaRoot({ archiveBase, override: trimmed });

  function commit() {
    const clean = normalizeBaseUrl(override);
    const next = trimmed ? (clean ?? trimmed) : '';
    setOverride(next);
    setMediaRootOverride(next);
  }

  return (
    <div className="card stack-sm">
      <div className="small dim">
        Course material — videos, scores and contrast cards — sits in other folders beside the Setar archive under
        one shared media root. The root is worked out from the archive base above, so there is nothing to set here
        unless your tree is laid out differently.
      </div>
      <div className="tiny faint" style={{ textAlign: 'start' }}>
        {/* Generated English page copy, never user text — inline LTR isolate. */}
        <span dir="ltr">{explanation}</span>
      </div>
      <div className="row between" style={{ gap: 8 }}>
        <div className="tiny faint">
          Browse opens the media root itself — if it does not list your course folders beside the archive folder, set
          one explicitly below.
        </div>
        <button
          className="btn btn-sm"
          style={{ flex: 'none' }}
          disabled={!root}
          onClick={() => root && window.open(`${root}/`, '_blank', 'noopener,noreferrer')}
        >
          Browse
        </button>
      </div>
      <Field
        label="Media root (optional)"
        hint="Leave blank to use the one derived from your archive base. Stored on this device only; never synced, never a password."
      >
        <input
          className="input"
          type="url"
          inputMode="url"
          enterKeyHint="done"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://192.168.0.20:5010"
          value={override}
          onChange={(e) => setOverride(e.target.value)}
          onBlur={commit}
        />
      </Field>
    </div>
  );
}

// --- Scheduling explainer + knobs -------------------------------------------

const PARAM_ROWS: {
  key: keyof SchedulingParams;
  label: string;
  hint: string;
  /** 'percent' shows/edits the value ×100 (shares are stored as 0–1 fractions). */
  unit?: 'percent';
}[] = [
  { key: 'sm2FirstIntervalDays', label: 'First review gap (days)', hint: 'How long after the first good review before it comes back.' },
  { key: 'sm2SecondIntervalDays', label: 'Second review gap (days)', hint: 'The gap after the second good review; it keeps expanding from there.' },
  { key: 'sm2SlipResetDays', label: 'Relearn gap after a slip (days)', hint: 'When something slips, it returns this soon to relearn.' },
  { key: 'warmupShare', label: 'Warm-up share of a plan (%)', hint: 'Share of a Session Plan’s minutes set aside for warm-up.', unit: 'percent' },
  { key: 'deepWorkShare', label: 'Deep-work share of a plan (%)', hint: 'Share of a Session Plan’s minutes set aside for the focus block.', unit: 'percent' },
  { key: 'reviewSlotMinMinutes', label: 'Shortest review slot (min)', hint: 'A review segment in the Session Plan never gets less than this.' },
  { key: 'reviewSlotMaxMinutes', label: 'Longest review slot (min)', hint: 'A review segment in the Session Plan never gets more than this.' },
];

function SchedulingSection() {
  const settings = useStore((s) => s.db.settings);
  const update = useStore((s) => s.updateSchedulingParams);
  const p = clampSchedulingParams(settings);
  const customised = settings !== undefined;

  return (
    <section className="stack-sm">
      <div className="section-label" id="how-scheduling-works">How scheduling works</div>
      <div className="card stack-sm small">
        <div className="dim">
          Every item gets a plain priority score, then the review date comes from spaced repetition. Nothing here is a
          black box — these are the exact numbers.
        </div>

        <div>
          <div style={{ fontWeight: 600 }}>What to practise (priority)</div>
          <div className="dim">
            <code>
              importance×2 + difficulty + fragility + overdue + neglected + class-deadline − recent-minutes
            </code>
            . Work you committed to a specific class climbs as THAT class nears, and stops counting once it has
            passed. A question for your teacher adds nothing — it is something to ask, not a reason to practise.
            Material you have given a lot of minutes to this week is gently set aside; the effect decays over a week
            and is capped, so nothing is ever hidden for good.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600 }}>When to revisit (spaced repetition)</div>
          <div className="dim">
            Practising early is real practice, but it is not the review: before the date, a good session records the
            minutes and leaves the date alone. AT the review, “stable” results widen the gap
            (≈ {p.sm2FirstIntervalDays} → {p.sm2SecondIntervalDays} days → gap × ease), at most once a day; “same” and
            “slightly better” hold the same gap again without counting as a slip; only “worse” brings the date
            forward — to{' '}
            {p.sm2SlipResetDays === 1 ? 'the next day' : `${p.sm2SlipResetDays} days`} — and never pushes it back.
            Important or hard material is pulled a little sooner. A date you chose yourself stands until it is due.
            You can override any item to a fixed cadence or manual.
          </div>
        </div>

        <div id="what-the-choices-mean">
          <div style={{ fontWeight: 600 }}>What each choice means</div>
          <div className="dim">
            <strong>Status</strong> says how the item currently stands and how you are working on it — not how the
            last ten minutes went. The eight are not rungs of a ladder you must climb: neighbours overlap on purpose,
            you can move backwards, and “{ITEM_STATUS_LABELS.new}” means new material still being established, not
            that you have never practised it.
            <ul style={{ margin: '4px 0 0', paddingInlineStart: 18 }}>
              {ITEM_STATUS_ORDER.map((st) => (
                <li key={st}>
                  <strong>{ITEM_STATUS_LABELS[st]}</strong> — {ITEM_STATUS_DESCRIPTIONS[st]}
                </li>
              ))}
            </ul>
          </div>
          <div className="dim" style={{ marginTop: 6 }}>
            <strong>Result</strong>, at the close of a block, is the most concrete thing that block actually showed.
            The last three are evidence of stability at a named scope; the first three describe change short of such a
            claim.
            <ul style={{ margin: '4px 0 0', paddingInlineStart: 18 }}>
              {RESULT_BUTTONS.map((r) => (
                <li key={r}>
                  <strong>{RESULT_LABELS[r]}</strong> — {RESULT_DESCRIPTIONS[r]}
                </li>
              ))}
            </ul>
            “{RESULT_LABELS.same}” is never read as failed recall, and neither fatigue, a blank field nor a missing
            rating becomes one. “Save without a result” records the minutes and changes no schedule.
          </div>
          <div className="dim" style={{ marginTop: 6 }}>
            <strong>{RATING_LABELS.importance}</strong> ({RATING_HINTS.importance.toLowerCase()})
            — 1 “{RATING_ANCHORS.importance[1]}”, 3 “{RATING_ANCHORS.importance[3]}”, 5 “
            {RATING_ANCHORS.importance[5]}”. <strong>{RATING_LABELS.difficulty}</strong> (
            {RATING_HINTS.difficulty.toLowerCase()}) — 1 “{RATING_ANCHORS.difficulty[1]}”, 3 “
            {RATING_ANCHORS.difficulty[3]}”, 5 “{RATING_ANCHORS.difficulty[5]}”. Both default to 3.{' '}
            {RATING_EFFECT_NOTE} They are stored as <code>importance</code> and <code>difficulty</code>, and every
            number above uses them exactly as it always has.
          </div>
        </div>

        <div id="review-ownership">
          <div style={{ fontWeight: 600 }}>Who manages a review date</div>
          <div className="dim">
            A date you typed, snoozed or re-armed is YOURS: the app leaves it alone until it comes due. “Use automatic
            scheduling” on an item hands that management back — it KEEPS the date exactly as it is, records no
            practice and calculates no new date. Automatic means the app has authority over the date from then on, not
            that the date shown was worked out by the engine or that a review happened. If the item and its pending
            review disagree about the date, the transfer is refused and asks you which one you meant rather than
            guessing. With no date at all, automatic simply leaves it unscheduled; “Review today” puts it on today&apos;s
            list — administration, not evidence.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 600 }}>Class commitments and questions</div>
          <div className="dim">
            Each one names a specific class. Anything carried over from an older version of the app is listed as
            “Unassigned” on the Lessons screen with a button to move it to the class it was actually for — the old
            data never recorded which class it meant, so nothing was guessed for you.
          </div>
        </div>

        <div className="stack-sm" style={{ marginTop: 4 }}>
          {PARAM_ROWS.map((row) => {
            const [loRaw, hiRaw] = SCHEDULING_BOUNDS[row.key];
            const scale = row.unit === 'percent' ? 100 : 1;
            const lo = Math.round(loRaw * scale);
            const hi = Math.round(hiRaw * scale);
            return (
              <Field key={row.key} label={`${row.label} (${lo}–${hi})`} hint={row.hint}>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  enterKeyHint="done"
                  min={lo}
                  max={hi}
                  step={1}
                  value={Math.round(p[row.key] * scale)}
                  style={{ maxWidth: 120 }}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) update({ [row.key]: n / scale });
                  }}
                />
              </Field>
            );
          })}
        </div>

        <div className="row between" style={{ gap: 8 }}>
          <div className="tiny faint">
            {customised ? 'Using your adjusted values.' : 'Using the recommended defaults.'}
          </div>
          <button
            className="btn btn-sm"
            style={{ flex: 'none' }}
            disabled={!customised}
            onClick={() => update(null)}
          >
            Reset to recommended
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
