import { useEffect } from 'react';
import { startViewportGuard } from './viewport';

// ---------------------------------------------------------------------------
// The thin browser adapter for `viewport.ts`: supplies the real visual
// viewport, document scroll and visibility events, starts the guard once for
// the shell, and tears every listener down on unmount. No decision lives here
// — see `decideViewport` for when the document scroll is put back, and why a
// focused field no longer blocks it.
// ---------------------------------------------------------------------------

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
        geometry: () => ({
          layoutHeight: window.innerHeight,
          visualHeight: window.visualViewport?.height ?? window.innerHeight,
          scale: window.visualViewport?.scale ?? 1,
          documentScroll: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop,
        }),
        restoreDocument: () => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        },
      }),
    [],
  );
}
