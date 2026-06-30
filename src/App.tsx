import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useStore } from './store/useStore';
import Today from './pages/Today';
import StartBlock from './pages/StartBlock';
import ActiveBlock from './pages/ActiveBlock';
import CloseBlock from './pages/CloseBlock';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import Materials from './pages/Materials';
import Insights from './pages/Insights';
import Pathway from './pages/Pathway';
import PathwayDetail from './pages/PathwayDetail';
import StageDetail from './pages/StageDetail';
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

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="start" element={<StartBlock />} />
        <Route path="active" element={<ActiveBlock />} />
        <Route path="close" element={<CloseBlock />} />
        <Route path="items" element={<Items />} />
        <Route path="items/:id" element={<ItemDetail />} />
        <Route path="pathway" element={<Pathway />} />
        <Route path="pathway/:pathwayId" element={<PathwayDetail />} />
        <Route path="pathway/:pathwayId/:stageId" element={<StageDetail />} />
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
