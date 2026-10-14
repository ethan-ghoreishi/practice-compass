import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// Taking a new version: ONE controller per page, started with the page
// (main.tsx), never with a component — one registration, one set of
// listeners, one hourly, foreground and reconnect check.
//
// It offers "A new version is ready." exactly when THIS window runs older code
// than the newest build the device has found:
//   • a worker waiting to take over, or one activated since this page loaded,
//     that is not this page's own build — never the first install of the
//     build this page is already running;
//   • a route whose code an update removed (`routeCodeMissing`): its import
//     failed AND the app now serves a build whose entry is not this page's.
//     Any other failure — the page's own bug, the dev server, the network —
//     is not an update and surfaces as itself.
// Only the Reload tap reloads, only its own window, exactly once: a waiting
// worker is told to SKIP_WAITING first, and the reload follows once it
// controls or activates; otherwise the reload is direct. Nothing else ever
// reloads a window — not another window's update, not a missing route.
//
// Identity: a CONTROLLED page runs its controller's build, so any other worker
// is newer. An UNCONTROLLED page (first launch, a hard reload) runs what the
// network served it, so a worker is this page's build when its script
// precaches this page's own entry chunk — a content-hashed name that changes
// whenever any shipped code does.
//
// Inert outside a production build, and a failed registration is absorbed:
// the dev server registers nothing and shows nothing.
// ---------------------------------------------------------------------------

export interface UpdateState {
  /** This window runs older code than the newest build found. */
  offer: boolean;
  /** Routes whose code an update removed: the offer stands in for each. */
  missingRoutes: readonly string[];
}

type Identity = 'mine' | 'newer' | 'pending';

const HOURLY_MS = 60 * 60 * 1000;
const INITIAL: UpdateState = { offer: false, missingRoutes: [] };

let state: UpdateState = INITIAL;
const listeners = new Set<() => void>();
let started = false;
let reloading = false;
let registration: ServiceWorkerRegistration | null = null;
let loadController: ServiceWorker | null = null;
let entry: string | null = null;
const identities = new WeakMap<ServiceWorker, Identity>();

function publish(next: Partial<UpdateState>): void {
  const merged = { ...state, ...next };
  if (merged.offer === state.offer && merged.missingRoutes === state.missingRoutes) return;
  state = merged;
  for (const fn of listeners) fn();
}

/** An entry script's name relative to the app's base — the name a worker precaches it under. */
function entryName(src: string | null | undefined, base: string): string | null {
  if (!src) return null;
  const path = new URL(src, location.href).pathname;
  const basePath = new URL(base, location.href).pathname;
  return path.startsWith(basePath) ? path.slice(basePath.length) : null;
}

function evaluate(): void {
  const reg = registration;
  if (!reg) return;
  const newest = reg.waiting ?? reg.active;
  publish({ offer: state.missingRoutes.length > 0 || (!!newest && identities.get(newest) === 'newer') });
}

function identify(worker: ServiceWorker): void {
  if (identities.has(worker)) return;
  worker.addEventListener('statechange', evaluate);
  if (worker === loadController) {
    identities.set(worker, 'mine');
    return;
  }
  if (loadController) {
    // This page runs its controller's build: every other worker came later.
    identities.set(worker, 'newer');
    return;
  }
  identities.set(worker, 'pending');
  const mine = entry;
  fetch(worker.scriptURL, { cache: 'no-store' })
    .then((r) => r.text())
    .then(
      (text) => (mine !== null && text.includes(`"${mine}"`) ? 'mine' : 'newer'),
      // Unreadable: rather offer a Reload that lands on the same build than miss a new one.
      () => 'newer' as const,
    )
    .then((found) => {
      identities.set(worker, found);
      evaluate();
    });
}

function wire(reg: ServiceWorkerRegistration): void {
  registration = reg;
  for (const w of [reg.active, reg.waiting, reg.installing]) if (w) identify(w);
  reg.addEventListener('updatefound', () => {
    if (reg.installing) identify(reg.installing);
    evaluate();
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const now = navigator.serviceWorker.controller;
    if (now) identify(now);
    evaluate();
  });
  const check = () => {
    reg.update().catch(() => undefined);
  };
  setInterval(check, HOURLY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
  window.addEventListener('online', check);
  evaluate();
}

/**
 * Start the page's update controller, once. Call it from main.tsx at load:
 * the controller this page was loaded under is the build it runs.
 */
export function startAppUpdates(options: { production?: boolean } = {}): void {
  if (started || !(options.production ?? import.meta.env.PROD)) return;
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  started = true;
  const base = import.meta.env.BASE_URL;
  entry = entryName(document.querySelector('script[type="module"][src]')?.getAttribute('src'), base);
  loadController = navigator.serviceWorker.controller;
  try {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).then(wire, () => undefined);
  } catch {
    // No registration on this page: nothing to offer, nothing broken.
  }
}

/** The Reload tap: once, in this window only, onto the newest build found. */
export function reloadToUpdate(): void {
  if (reloading) return;
  reloading = true;
  const waiting = registration?.waiting;
  if (!waiting) {
    location.reload();
    return;
  }
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', go);
  waiting.addEventListener('statechange', () => {
    if (waiting.state === 'activated') go();
    // Superseded before it took over: the tap is free to try the newer one.
    else if (waiting.state === 'redundant' && !done) reloading = false;
  });
  waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * `route`'s code failed to load. True — and the update offered in its place,
 * never a reload — only when an update removed it: this production page's
 * controller runs, and the app now serves an entry that is not this page's
 * (a controlled page asks its worker's precache, an uncontrolled one the
 * network). False otherwise, so the caller rethrows the original error.
 * Never throws.
 */
export async function routeCodeMissing(route: string): Promise<boolean> {
  if (!started || !entry) return false;
  const base = import.meta.env.BASE_URL;
  let served: string | null = null;
  try {
    const r = await fetch(`${base}index.html`, { cache: 'no-store' });
    if (r.ok) served = entryName(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/.exec(await r.text())?.[1], base);
  } catch {
    // Unreachable: nothing proves an update.
  }
  if (served === null || served === entry) return false;
  if (!state.missingRoutes.includes(route)) publish({ missingRoutes: [...state.missingRoutes, route], offer: true });
  return true;
}

/**
 * Whether the banner shows on this route. It waits while a close is unsaved
 * (/close) and appears the moment Save or Discard leaves it — unless the close
 * screen's own code is missing, when the offer stands in for it.
 */
export function offerShownOn(s: UpdateState, pathname: string): boolean {
  return s.offer && (pathname !== '/close' || s.missingRoutes.includes('/close'));
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The page's update offer as it stands. */
export function readAppUpdate(): UpdateState {
  return state;
}

/** The page's update offer, for the banner. */
export function useAppUpdate(): UpdateState {
  return useSyncExternalStore(subscribe, readAppUpdate, () => INITIAL);
}
