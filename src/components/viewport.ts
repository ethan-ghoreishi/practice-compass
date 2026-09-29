// ---------------------------------------------------------------------------
// The layout-viewport restore, as a pure decision and a port-injected
// coordinator (the `screenAwake.ts` shape): no `window`, no `document`, so all
// of it runs in an ordinary Node test with fixture geometry.
//
// THE SHELL NEVER SCROLLS THE DOCUMENT. `html`, `body` and `#root` are one
// viewport tall with `overflow: hidden`, and `<main>` is the only scroll owner
// (global.css). So a non-zero document scroll offset is never the owner's
// scrolling — it is WebKit moving the LAYOUT viewport to reveal a focused
// field above the software keyboard. While the keyboard is up that is
// intentional accommodation and must be left alone; once the visual viewport
// is back to the full layout height it is RESIDUAL displacement — the lifted
// tab bar — and is put back to zero.
//
// Keyboard presence is read from GEOMETRY, never from focus: "Done" on the
// iOS keyboard hides it and leaves the field focused, which is exactly the
// case a focus-gated guard never corrected. There is no timer, no forced
// blur, no zoom lock, and `<main>`'s own scroll position is never touched.
// Browser fixtures prove this mechanism; they cannot prove the native iPhone
// keyboard, which stays an owner-device check.
// ---------------------------------------------------------------------------

export interface ViewportGeometry {
  /** The layout viewport's height (`window.innerHeight`). */
  layoutHeight: number;
  /** `visualViewport.height`, in CSS pixels at the current scale. */
  visualHeight: number;
  /** `visualViewport.scale` — 1 unless the owner pinch-zoomed. */
  scale: number;
  /** How far the DOCUMENT is scrolled (`window.scrollY`). */
  documentScroll: number;
}

/**
 * Sub-pixel slack only: WebKit reports fractional visual heights (e.g. 843.5
 * for 844). This is rounding, not a guess at a keyboard's size — any real
 * keyboard, accessory bar or split view is many pixels taller than this.
 */
const ROUNDING_PX = 1;

export type ViewportAction = 'none' | 'restore';

/**
 * What to do about the document's scroll offset, from geometry alone.
 *
 *  - no offset             → nothing to correct
 *  - zoomed (scale ≠ 1)    → the owner's zoom; never fought
 *  - visual viewport short → the keyboard (or any panel) is still up; WebKit's
 *                            reveal is intentional, leave it
 *  - otherwise             → residual displacement: restore to zero
 */
export function decideViewport(g: ViewportGeometry): ViewportAction {
  if (!(g.documentScroll > 0)) return 'none';
  if (Math.abs(g.scale - 1) > 0.001) return 'none';
  if (g.visualHeight * g.scale < g.layoutHeight - ROUNDING_PX) return 'none';
  return 'restore';
}

/** Everything the coordinator needs from a browser — injected, so tests supply fixtures. */
export interface ViewportPort {
  /** Null where `window.visualViewport` does not exist: then the guard is a no-op. */
  visualViewport: {
    addEventListener(type: 'resize' | 'scroll', fn: () => void): void;
    removeEventListener(type: 'resize' | 'scroll', fn: () => void): void;
  } | null;
  /** Subscribe to the page becoming visible again; returns the unsubscribe. */
  onVisible(fn: () => void): () => void;
  geometry(): ViewportGeometry;
  /** Put the DOCUMENT scroll back to zero. Never `<main>`. */
  restoreDocument(): void;
}

/**
 * Wire the decision to the events that can end a keyboard's life: the visual
 * viewport changing size or position, and the page returning from the
 * background. Each event evaluates ONCE and acts at most once; restoring the
 * document scroll changes no visual-viewport size, so it cannot feed itself.
 * Returns the teardown, which removes every listener it added.
 */
export function startViewportGuard(port: ViewportPort): () => void {
  const vv = port.visualViewport;
  if (!vv) return () => {};
  const evaluate = () => {
    if (decideViewport(port.geometry()) === 'restore') port.restoreDocument();
  };
  vv.addEventListener('resize', evaluate);
  vv.addEventListener('scroll', evaluate);
  const offVisible = port.onVisible(evaluate);
  return () => {
    vv.removeEventListener('resize', evaluate);
    vv.removeEventListener('scroll', evaluate);
    offVisible();
  };
}
