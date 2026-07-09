import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CompassIcon } from './components/icons';
import { useStore } from './store/useStore';
import Today from './pages/Today';
import StartBlock from './pages/StartBlock';
import ActiveBlock from './pages/ActiveBlock';
import CloseBlock from './pages/CloseBlock';
import ItemDetail from './pages/ItemDetail';
import Materials from './pages/Materials';
import Insights from './pages/Insights';
import Repertoire from './pages/Repertoire';
import PathwayDetail from './pages/PathwayDetail';
import StageDetail from './pages/StageDetail';
import Lessons from './pages/Lessons';
import RoutineRunner from './pages/RoutineRunner';
import TeacherReport from './pages/TeacherReport';
import Settings from './pages/Settings';
import More from './pages/More';

function useThemeAttribute() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}

export default function App() {
  useThemeAttribute();
  const hydrated = useStore((s) => s.hydrated);

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
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="start" element={<StartBlock />} />
        <Route path="active" element={<ActiveBlock />} />
        <Route path="close" element={<CloseBlock />} />
        <Route path="repertoire" element={<Repertoire />} />
        <Route path="items" element={<Navigate to="/repertoire" replace />} />
        <Route path="items/:id" element={<ItemDetail />} />
        <Route path="pathway" element={<Navigate to="/repertoire" replace />} />
        <Route path="pathway/:pathwayId" element={<PathwayDetail />} />
        <Route path="pathway/:pathwayId/:stageId" element={<StageDetail />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="routine/:routineId" element={<RoutineRunner />} />
        <Route path="materials" element={<Materials />} />
        <Route path="insights" element={<Insights />} />
        <Route path="report" element={<TeacherReport />} />
        <Route path="settings" element={<Settings />} />
        <Route path="more" element={<More />} />
        <Route path="*" element={<Today />} />
      </Route>
    </Routes>
  );
}
