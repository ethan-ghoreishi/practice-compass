import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSyncStatus } from '../store/githubSync';
import { useRegisterSW } from 'virtual:pwa-register/react';
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
  const mainRef = useRef<HTMLElement>(null);

  // Only <main> scrolls (the shell is fixed-height) — reset it so every
  // route opens at the top.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

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
          and keyboard users reach it first); CSS places it at the visual
          bottom on phones and under the header on wide screens. Five equal,
          stable targets — Today carries the primary Start action, so the bar
          needs no raised centre button. */}
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
            <NavLink to="/start" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <PlayIcon />
              <span>Start</span>
            </NavLink>
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

      <main className="main" ref={mainRef}>
        <div className={`main-inner${pageWidthClass(location.pathname)}`}>
          <UpdateBanner />
          <SyncNotice pathname={location.pathname} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Per-route page widths: focused practice stays narrow, Today comfortable,
 * browsing/notes screens use real desktop room (CSS caps them on phones).
 */
function pageWidthClass(pathname: string): string {
  if (pathname === '/active' || pathname === '/close' || pathname.startsWith('/routine')) return ' main-inner--narrow';
  if (
    pathname.startsWith('/repertoire') ||
    pathname.startsWith('/items') ||
    pathname.startsWith('/pathway') ||
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/materials') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/insights') ||
    pathname.startsWith('/report')
  )
    return ' main-inner--wide';
  return '';
}

/**
 * Honest PWA updates: the service worker is registered in prompt mode, a new
 * build shows this banner, and one tap reloads into it — no reinstalling.
 * Updates are also checked hourly and whenever the app becomes visible
 * (installed iOS apps otherwise only check on cold launch).
 */
function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => void registration.update(), 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update();
      });
    },
  });
  if (!needRefresh) return null;
  return (
    <div className="card card-accent row between small" style={{ marginBottom: 'var(--space-4)' }}>
      <span>A new version is ready.</span>
      <button className="btn btn-primary btn-sm" style={{ flex: 'none' }} onClick={() => void updateServiceWorker(true)}>
        Reload
      </button>
    </div>
  );
}

/** Calm, non-blocking notice when sync needs a decision or hit an error. */
function SyncNotice({ pathname }: { pathname: string }) {
  const phase = useSyncStatus((s) => s.phase);
  const message = useSyncStatus((s) => s.message);
  if (pathname === '/settings') return null; // Settings shows the full panel.
  if (phase !== 'conflict' && phase !== 'error') return null;
  return (
    <div className="card card-quiet row between small" style={{ marginBottom: 'var(--space-4)' }}>
      <span className="dim">
        {phase === 'conflict' ? 'Sync needs a decision.' : `Sync problem: ${message}`}
      </span>
      <NavLink to="/settings" className="link" style={{ flex: 'none' }}>
        Open Settings
      </NavLink>
    </div>
  );
}
