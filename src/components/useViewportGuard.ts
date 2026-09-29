import { useEffect } from 'react';
import { decideViewport, startViewportGuard, type ViewportGeometry } from './viewport';

// ---------------------------------------------------------------------------
// The thin browser adapter for `viewport.ts`: supplies the real visual
// viewport, document and shell scroll offsets and visibility events, starts
// the guard once for the shell, and tears every listener down on unmount. No
// decision lives here — see `decideViewport` for when the offsets are put
// back, and why a focused field no longer blocks it.
// ---------------------------------------------------------------------------

const root = () => document.getElementById('root');

function geometry(): ViewportGeometry {
  return {
    layoutHeight: window.innerHeight,
    visualHeight: window.visualViewport?.height ?? window.innerHeight,
    scale: window.visualViewport?.scale ?? 1,
    documentScroll: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop,
    shellScroll: Math.max(document.body.scrollTop, root()?.scrollTop ?? 0),
  };
}

export function useViewportGuard(): void {
  useEffect(
    () =>
      startViewportGuard({
        visualViewport: window.visualViewport ?? null,
        onVisible: (fn) => {
          const handler = () => {
            if (document.visibilityState === 'visible') fn();
          };
          document.addEventListener('visibilitychange', handler);
          return () => document.removeEventListener('visibilitychange', handler);
        },
        geometry: () => {
          const g = geometry();
          traceNote('guard', g);
          return g;
        },
        restoreDocument: () => {
          traceNote('restore');
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const r = root();
          if (r) r.scrollTop = 0;
        },
      }),
    [],
  );
}

// ---------------------------------------------------------------------------
// KEYBOARD TRACE — an opt-in recorder for the owner's own iPhone (More →
// Keyboard trace). The lifted-bar report is a NATIVE behaviour no browser
// fixture reproduces, so this writes down what the device actually reports at
// every event that can move it: both viewports, every scroll offset in the
// shell, the bar's position and the focused element. Memory only — never in
// the database, a backup or sync — and nothing here changes what the guard
// does. Recording outlives route changes and backgrounding (module scope);
// a relaunch of the app ends it.
// ---------------------------------------------------------------------------

let trace: string[] = [];
let stopTrace: (() => void) | null = null;
let t0 = 0;
// ponytail: fixed cap so a forgotten recording cannot grow without bound; raise if a real capture needs more.
const TRACE_LIMIT = 5000;

function snapshot(event: string, extra?: unknown): string {
  const vv = window.visualViewport;
  const main = document.querySelector('main');
  const bar = document.querySelector('.tabbar')?.getBoundingClientRect();
  const active = document.activeElement as HTMLElement | null;
  const r = (n: number | undefined) => (n === undefined ? null : Math.round(n * 10) / 10);
  return JSON.stringify({
    t: Math.round(performance.now() - t0),
    ev: event,
    innerH: window.innerHeight,
    clientH: document.documentElement.clientHeight,
    vvH: r(vv?.height),
    vvTop: r(vv?.offsetTop),
    vvPageTop: r(vv?.pageTop),
    scale: r(vv?.scale),
    scrollY: r(window.scrollY),
    html: document.documentElement.scrollTop,
    body: document.body.scrollTop,
    root: root()?.scrollTop ?? null,
    main: main?.scrollTop ?? null,
    htmlH: r(document.documentElement.getBoundingClientRect().height),
    barTop: r(bar?.top),
    barBottom: r(bar?.bottom),
    focus: active && active !== document.body ? `${active.tagName.toLowerCase()}:${active.getAttribute('aria-label') ?? active.getAttribute('name') ?? ''}` : null,
    vis: document.visibilityState,
    ...(extra ? { decision: decideViewport(extra as ViewportGeometry) } : {}),
  });
}

function traceNote(event: string, g?: ViewportGeometry): void {
  if (stopTrace && trace.length < TRACE_LIMIT) trace.push(snapshot(event, g));
}

export function isTracingViewport(): boolean {
  return stopTrace !== null;
}

/** Start recording (clears any earlier trace). The header names the device and mode. */
export function startViewportTrace(): void {
  if (stopTrace) return;
  t0 = performance.now();
  trace = [
    JSON.stringify({
      ua: navigator.userAgent,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      screen: `${screen.width}x${screen.height}`,
      dpr: window.devicePixelRatio,
      at: new Date().toISOString(),
    }),
  ];
  const vv = window.visualViewport;
  const on = (target: EventTarget | null | undefined, type: string) => {
    const fn = () => {
      if (trace.length < TRACE_LIMIT) trace.push(snapshot(type));
    };
    target?.addEventListener(type, fn, { passive: true, capture: type === 'scroll' });
    return () => target?.removeEventListener(type, fn, { capture: type === 'scroll' });
  };
  const offs = [
    on(vv, 'resize'),
    on(vv, 'scroll'),
    on(window, 'resize'),
    on(window, 'scroll'),
    on(window, 'orientationchange'),
    on(document, 'focusin'),
    on(document, 'focusout'),
    on(document, 'visibilitychange'),
  ];
  stopTrace = () => offs.forEach((off) => off());
  trace.push(snapshot('start'));
}

export function stopViewportTrace(): void {
  if (!stopTrace) return;
  trace.push(snapshot('stop'));
  stopTrace();
  stopTrace = null;
}

/** The recorded trace, one JSON object per line. */
export function viewportTraceText(): string {
  return trace.join('\n');
}
