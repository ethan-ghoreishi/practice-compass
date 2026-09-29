import { describe, expect, it } from 'vitest';
import { decideViewport, startViewportGuard, type ViewportGeometry, type ViewportPort } from './viewport';

// Geometry written BY HAND from what a 390×844 phone reports in each state —
// never read back from the implementation.
const PHONE = { layoutHeight: 844, scale: 1 };
const CASES: { name: string; g: ViewportGeometry; want: 'none' | 'restore' }[] = [
  { name: 'nothing displaced', g: { ...PHONE, visualHeight: 844, documentScroll: 0 }, want: 'none' },
  { name: 'keyboard up, WebKit revealing the field', g: { ...PHONE, visualHeight: 508, documentScroll: 214 }, want: 'none' },
  { name: 'keyboard dismissed by Done, focus RETAINED', g: { ...PHONE, visualHeight: 844, documentScroll: 214 }, want: 'restore' },
  { name: 'keyboard dismissed by blur', g: { ...PHONE, visualHeight: 844, documentScroll: 96 }, want: 'restore' },
  { name: 'fractional visual height at rest', g: { ...PHONE, visualHeight: 843.5, documentScroll: 40 }, want: 'restore' },
  { name: 'accessory bar only (still short)', g: { ...PHONE, visualHeight: 800, documentScroll: 44 }, want: 'none' },
  { name: 'pinch-zoomed in', g: { layoutHeight: 844, scale: 2, visualHeight: 422, documentScroll: 300 }, want: 'none' },
  { name: 'zoomed with a full-height window', g: { layoutHeight: 844, scale: 1.5, visualHeight: 562.7, documentScroll: 120 }, want: 'none' },
  { name: 'hardware keyboard: no visual change, no displacement', g: { ...PHONE, visualHeight: 844, documentScroll: 0 }, want: 'none' },
  { name: 'rotated to landscape, displaced', g: { layoutHeight: 390, scale: 1, visualHeight: 390, documentScroll: 60 }, want: 'restore' },
];

describe('the layout viewport restore', () => {
  it('decides from geometry alone — never from focus, never against zoom', () => {
    for (const c of CASES) expect(decideViewport(c.g), c.name).toBe(c.want);
  });

  it('acts once per event, stops by itself once restored, and tears every listener down', () => {
    const listeners = new Map<string, Set<() => void>>();
    const on = (type: string, fn: () => void) => listeners.set(type, (listeners.get(type) ?? new Set()).add(fn));
    const off = (type: string, fn: () => void) => listeners.get(type)?.delete(fn);
    let g: ViewportGeometry = { ...PHONE, visualHeight: 844, documentScroll: 0 };
    let restores = 0;
    const port: ViewportPort = {
      visualViewport: { addEventListener: on, removeEventListener: off },
      onVisible: (fn) => {
        on('visible', fn);
        return () => off('visible', fn);
      },
      geometry: () => g,
      restoreDocument: () => {
        restores += 1;
        g = { ...g, documentScroll: 0 };
      },
    };
    const fire = (type: string) => [...(listeners.get(type) ?? [])].forEach((fn) => fn());
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);

    const stop = startViewportGuard(port);
    expect(count()).toBe(3);
    // Keyboard shows: no action. Done with focus retained: exactly one restore.
    g = { ...PHONE, visualHeight: 508, documentScroll: 214 };
    fire('resize');
    expect(restores).toBe(0);
    g = { ...PHONE, visualHeight: 844, documentScroll: 214 };
    fire('resize');
    expect(restores).toBe(1);
    // Repeated events after the restore find nothing to do — no loop.
    fire('resize');
    fire('scroll');
    expect(restores).toBe(1);
    // Back from the background, still displaced: one restore.
    g = { ...PHONE, visualHeight: 844, documentScroll: 50 };
    fire('visible');
    expect(restores).toBe(2);
    // Zoomed: never fought.
    g = { layoutHeight: 844, scale: 2, visualHeight: 422, documentScroll: 300 };
    fire('scroll');
    expect(restores).toBe(2);
    // Teardown removes everything it added.
    stop();
    expect(count()).toBe(0);
    g = { ...PHONE, visualHeight: 844, documentScroll: 214 };
    fire('resize');
    expect(restores).toBe(2);
  });

  it('is a no-op where the browser has no visual viewport', () => {
    let touched = false;
    const stop = startViewportGuard({
      visualViewport: null,
      onVisible: () => {
        touched = true;
        return () => {};
      },
      geometry: () => {
        touched = true;
        return { ...PHONE, visualHeight: 844, documentScroll: 99 };
      },
      restoreDocument: () => {
        touched = true;
      },
    });
    stop();
    expect(touched).toBe(false);
  });
});
