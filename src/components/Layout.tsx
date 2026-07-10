import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  CompassIcon,
  ItemsIcon,
  MoonIcon,
  MoreIcon,
  PathIcon,
  PlayIcon,
  SunIcon,
  TodayIcon,
} from './icons';

export default function Layout() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const location = useLocation();

  // Hide chrome during focused practice to keep attention on the timer.
  const focused =
    location.pathname === '/active' ||
    location.pathname === '/close' ||
    location.pathname.startsWith('/routine');

  const isDark = theme === 'dark';
  const ThemeIcon = isDark ? SunIcon : MoonIcon;

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="wordmark">
          <CompassIcon className="mark" />
          <span>Practice Compass</span>
        </NavLink>
        <button
          className="btn btn-ghost btn-sm"
          aria-label="Toggle light or dark theme"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <ThemeIcon width={18} height={18} />
        </button>
      </header>

      {/* Navigation sits BEFORE the page content in the DOM (screen readers
          and keyboard users reach it first); CSS pins it to the bottom on
          phones and keeps it at the top on wide screens. */}
      {!focused && (
        <nav className="tabbar" aria-label="Primary">
          <div className="tabbar-inner">
            <NavLink to="/" end className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <TodayIcon />
              <span>Today</span>
            </NavLink>
            <NavLink to="/repertoire" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <PathIcon />
              <span>Repertoire</span>
            </NavLink>

            <div className="tab tab-start">
              <NavLink to="/start" className="tab-start-btn" aria-label="Start a practice block">
                <PlayIcon />
              </NavLink>
              <span className="tab-start-label">Start</span>
            </div>

            <NavLink to="/lessons" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <ItemsIcon />
              <span>Lessons</span>
            </NavLink>
            <NavLink to="/more" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <MoreIcon />
              <span>More</span>
            </NavLink>
          </div>
        </nav>
      )}

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
