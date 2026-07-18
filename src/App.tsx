import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CompassIcon } from './components/icons';
import { useStore } from './store/useStore';
import { getSyncConfig, syncNow } from './store/githubSync';
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
const SessionPlan = lazy(() => import('./pages/SessionPlan'));
const TeacherReport = lazy(() => import('./pages/TeacherReport'));
const Settings = lazy(() => import('./pages/Settings'));
const More = lazy(() => import('./pages/More'));

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
}

export default function App() {
  useThemeAttribute();
  const hydrated = useStore((s) => s.hydrated);
  useAutoSync(hydrated);

  // Wait for the async IndexedDB store before rendering (avoids a flash of
  // empty/seed data on load).
  if (!hydrated) {
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
        <Route path="routine/:routineId" element={<RoutineRunner />} />
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
