import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { startAppUpdates } from './components/appUpdate';
import './styles/global.css';

// With the page, never with a component: one registration and one set of
// update checks however often React mounts.
startAppUpdates();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
