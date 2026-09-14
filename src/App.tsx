import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CompassIcon, UploadIcon } from './components/icons';
import { hasUnfinishedPractice, deferredSyncRetry } from './domain';
import { useStore, useHydrationStatus } from './store/useStore';
import { getSyncConfig, syncNow, useSyncStatus } from './store/githubSync';
import { recoverFromRefusedHydration } from './store/backup';
// Today stays in the entry chunk (it is always the first screen); every other
// route loads on demand — smaller initial JS, and the PWA precaches all
// chunks anyway so offline still has everything.
import Today from './pages/Today';
const StartBlock = lazy(() => import('./pages/StartBlock'));
const ActiveBlock = lazy(() => import('./pages/ActiveBlock'));
const CloseBlock = lazy(() => import('./pages/CloseBlock'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const NewItem = lazy(() => import('./pages/NewItem'));
const Materials = lazy(() => import('./pages/Materials'));
const Insights = lazy(() => import('./pages/Insights'));
const Repertoire = lazy(() => import('./pages/Repertoire'));
const PathwayDetail = lazy(() => import('./pages/PathwayDetail'));
const StageDetail = lazy(() => import('./pages/StageDetail'));
const Lessons = lazy(() => import('./pages/Lessons'));
const RoutineRunner = lazy(() => import('./pages/RoutineRunner'));
const RoutineEdit = lazy(() => import('./pages/RoutineEdit'));
const SessionPlan = lazy(() => import('./pages/SessionPlan'));
const TeacherReport = lazy(() => import('./pages/TeacherReport'));
const Settings = lazy(() => import('./pages/Settings'));
const More = lazy(() => import('./pages/More'));

/**
 * The one recovery action reachable from a refused COLD-START hydration
 * (§C7): Settings' own Import control never mounts, since the whole routed
 * app — Settings included — is gated behind `hydrated`, and this refusal is
 * exactly what keeps it false. Narrowly scoped to this one screen: it reuses
 * `recoverFromRefusedHydration` (itself a thin wrapper over the SAME
 * `importFullBackup` validation/install path every other inbound door
 * already uses), never a second import implementation. The caller never
 * renders this for a too-new refusal — there is no safe import/downgrade for
 * that case, only "update the app".
 */
function ColdStartRecovery() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const result = await recoverFromRefusedHydration(text);
      // A rejection leaves the refused bytes exactly as they were (§C7's own
      // validated install path never writes on failure) — surface it and let
      // the owner try a different file. Success needs no message here: it
      // flips `hydrated` and this whole screen unmounts immediately.
      if (!result.ok) setError(result.error);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="stack-sm" style={{ alignItems: 'center' }}>
      <button className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
        <UploadIcon /> {busy ? 'Restoring…' : 'Restore from backup'}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        aria-label="Restore backup file"
        hidden
        onChange={onFile}
      />
      {error && (
        <p className="tiny" style={{ margin: 0, color: 'var(--tone-alert)' }}>
          Import failed: {error}
        </p>
      )}
    </div>
  );
}

function useThemeAttribute() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}

/**
 * Opportunistic GitHub sync: once when the app opens, 30 quiet seconds after
 * the last data change (the revision counter bumps on every mutation), and
 * again the moment the device comes back online. Sync configured after
 * startup joins in automatically — every trigger re-checks the config.
 * Unconfigured or offline, each trigger is a no-op.
 */
function useAutoSync(hydrated: boolean) {
  const rev = useStore((s) => s.rev);
  const openedRev = useRef<number | null>(null);

  // On open (first hydrated render).
  useEffect(() => {
    if (!hydrated || openedRev.current !== null) return;
    openedRev.current = rev;
    if (getSyncConfig()) void syncNow();
  }, [hydrated, rev]);

  // Quiet period after changes.
  useEffect(() => {
    if (!hydrated || openedRev.current === null || rev === openedRev.current) return;
    if (!getSyncConfig()) return;
    const t = setTimeout(() => void syncNow(), 30_000);
    return () => clearTimeout(t);
  }, [rev, hydrated]);

  // Returning online after offline practice.
  useEffect(() => {
    const onOnline = () => {
      if (getSyncConfig()) void syncNow();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  // A deferred sync retries on the BLOCKING CONDITION clearing, never on an
  // incidental database write: closeSession writes a block (bumping `rev`, which
  // the quiet-period effect above watches), but cancelSession is a bare
  // `set({ active: null })` that writes nothing — so watching `rev` would resume
  // after a finish and wait forever after a discard. Watching presence covers
  // finishing, discarding and closeSession's missing-item bail-out alike.
  const unfinished = useStore((s) => hasUnfinishedPractice(s));
  const deferred = useSyncStatus((s) => s.phase === 'deferred');
  // Seeded with the CURRENT presence, not false: an ordinary load with no
  // session must not read as a present→absent transition and fire a sync.
  const wasUnfinished = useRef(unfinished);
  useEffect(() => {
    const fire = deferredSyncRetry({ pending: deferred, wasUnfinished: wasUnfinished.current, isUnfinished: unfinished });
    wasUnfinished.current = unfinished;
    if (fire && getSyncConfig()) void syncNow();
  }, [unfinished, deferred]);
}

export default function App() {
  useThemeAttribute();
  const hydrated = useStore((s) => s.hydrated);
  const hydrationStatus = useHydrationStatus();
  useAutoSync(hydrated);

  // Wait for the async IndexedDB store before rendering (avoids a flash of
  // empty/seed data on load) — unless hydration was REFUSED (§C7).
  // `hydrated` never turns true on a refusal (zustand's own
  // `onFinishHydration` is wired to the success path only), so without this
  // branch a cold start with already-invalid persisted bytes stayed on
  // "Loading…" forever with no way to know why. This reads `useHydrationStatus`
  // only — it never writes to `useStore` on its own, so merely RENDERING this
  // screen touches neither the live nor the persisted database: the refused
  // bytes stay exactly as they were until the owner explicitly picks a
  // recovery file through `ColdStartRecovery` below (invalid/corrupt-data
  // case only — never offered for a too-new refusal, which has no safe
  // import/downgrade).
  if (!hydrated) {
    if (hydrationStatus.refused) {
      return (
        <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)' }}>
          <div className="stack-sm" style={{ alignItems: 'center', maxWidth: 420, textAlign: 'center' }}>
            <CompassIcon width={30} height={30} style={{ color: 'var(--accent)' }} />
            <p className="title-md" style={{ margin: 0 }}>Your saved data couldn’t be loaded safely</p>
            <p className="small dim" style={{ margin: 0 }}>
              {hydrationStatus.tooNew
                ? 'This device holds data saved by a newer version of Practice Compass than this one understands.'
                : 'This device’s saved data looks invalid or corrupted, so it was not opened automatically.'}
            </p>
            <p className="small dim" style={{ margin: 0 }}>
              Nothing has been changed, overwritten or deleted — your saved data is exactly as it was.{' '}
              {hydrationStatus.tooNew
                ? 'Update the app on this device to open it again.'
                : 'Restore a backup below, or export a fresh one from another device first if this one still has it.'}
            </p>
            {hydrationStatus.message && (
              <p className="tiny faint" style={{ margin: 0 }}>{hydrationStatus.message}</p>
            )}
            {!hydrationStatus.tooNew && <ColdStartRecovery />}
          </div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'var(--text-faint)' }}>
        <div className="stack-sm" style={{ alignItems: 'center' }}>
          <CompassIcon width={30} height={30} style={{ color: 'var(--accent)' }} />
          <span className="small dim">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="small dim" style={{ padding: 'var(--space-5)' }}>Loading…</div>}>
      <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="start" element={<StartBlock />} />
        <Route path="active" element={<ActiveBlock />} />
        <Route path="close" element={<CloseBlock />} />
        <Route path="repertoire" element={<Repertoire />} />
        <Route path="items" element={<Navigate to="/repertoire" replace />} />
        <Route path="items/new" element={<NewItem />} />
        <Route path="items/:id" element={<ItemDetail />} />
        <Route path="pathway" element={<Navigate to="/repertoire" replace />} />
        <Route path="pathway/:pathwayId" element={<PathwayDetail />} />
        <Route path="pathway/:pathwayId/:stageId" element={<StageDetail />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="routine/new" element={<RoutineEdit />} />
        <Route path="routine/:routineId" element={<RoutineRunner />} />
        <Route path="routine/:routineId/edit" element={<RoutineEdit />} />
        <Route path="plan" element={<SessionPlan />} />
        <Route path="materials" element={<Materials />} />
        <Route path="insights" element={<Insights />} />
        <Route path="report" element={<TeacherReport />} />
        <Route path="settings" element={<Settings />} />
        <Route path="more" element={<More />} />
        <Route path="*" element={<Today />} />
      </Route>
      </Routes>
    </Suspense>
  );
}
