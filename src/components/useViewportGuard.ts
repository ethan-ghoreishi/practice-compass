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
// Hidden fixed-position probes: what each viewport unit and safe-area inset
// actually RESOLVES to on this device, read per line (clientHeight is not a
// measurement of 100vh). Present only while recording.
const PROBES = ['100vh', '100svh', '100lvh', '100dvh', '100%'] as const;
let probes: HTMLElement[] = [];
let insetProbe: HTMLElement | null = null;

function addProbes(): void {
  const make = (css: string) => {
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;${css}`;
    document.body.append(el);
    return el;
  };
  probes = PROBES.map((h) => make(`height:${h}`));
  insetProbe = make('height:0;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)');
}

function removeProbes(): void {
  probes.forEach((el) => el.remove());
  insetProbe?.remove();
  probes = [];
  insetProbe = null;
}

function probeReadings(): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  PROBES.forEach((h, i) => {
    out[h.replace('100', '').replace('%', 'pct')] = probes[i] ? Math.round(probes[i].getBoundingClientRect().height * 10) / 10 : null;
  });
  const cs = insetProbe ? getComputedStyle(insetProbe) : null;
  out.insetTop = cs ? parseFloat(cs.paddingTop) : null;
  out.insetBottom = cs ? parseFloat(cs.paddingBottom) : null;
  out.screenH = screen.height;
  return out;
}
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
    ...probeReadings(),
    ...(extra ? { decision: decideViewport(extra as ViewportGeometry) } : {}),
  });
}

/** Append one line; at the cap, say so ONCE rather than silently dropping the rest. */
function record(line: () => string): void {
  if (trace.length < TRACE_LIMIT) trace.push(line());
  else if (trace.length === TRACE_LIMIT) trace.push(JSON.stringify({ ev: 'trace-full', limit: TRACE_LIMIT }));
}

function traceNote(event: string, g?: ViewportGeometry): void {
  if (stopTrace) record(() => snapshot(event, g));
}

export function isTracingViewport(): boolean {
  return stopTrace !== null;
}

export function isViewportTraceFull(): boolean {
  return trace.length > TRACE_LIMIT;
}

/**
 * Start recording (clears any earlier trace). The header names the device, the
 * mode, the build and whether this is a secure context, so a pasted trace says
 * which app produced it. Each line's `ev` names its SOURCE (`vv:resize`,
 * `window:scroll`, `root:scroll`…). `<main>`'s own scrolling is not an event
 * here — it is the owner's, and its offset is in every line anyway.
 */
export function startViewportTrace(): void {
  if (stopTrace) return;
  t0 = performance.now();
  trace = [
    JSON.stringify({
      ua: navigator.userAgent,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      secure: window.isSecureContext,
      build: typeof __APP_VERSION__ === 'undefined' ? null : __APP_VERSION__,
      screen: `${screen.width}x${screen.height}`,
      dpr: window.devicePixelRatio,
      at: new Date().toISOString(),
    }),
  ];
  const on = (target: EventTarget | null | undefined, source: string, type: string) => {
    const fn = () => record(() => snapshot(`${source}:${type}`));
    target?.addEventListener(type, fn, { passive: true });
    return () => target?.removeEventListener(type, fn);
  };
  const vv = window.visualViewport;
  const offs = [
    on(vv, 'vv', 'resize'),
    on(vv, 'vv', 'scroll'),
    on(window, 'window', 'resize'),
    on(window, 'window', 'scroll'),
    on(window, 'window', 'orientationchange'),
    on(document.body, 'body', 'scroll'),
    on(root(), 'root', 'scroll'),
    on(document, 'document', 'focusin'),
    on(document, 'document', 'focusout'),
    on(document, 'document', 'visibilitychange'),
  ];
  addProbes();
  stopTrace = () => {
    offs.forEach((off) => off());
    removeProbes();
  };
  trace.push(snapshot('start'));
}

export function stopViewportTrace(): void {
  if (!stopTrace) return;
  record(() => snapshot('stop'));
  stopTrace();
  stopTrace = null;
}

/** The recorded trace, one JSON object per line. */
export function viewportTraceText(): string {
  return trace.join('\n');
}
