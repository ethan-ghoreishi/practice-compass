import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// iOS keyboard viewport guard.
//
// The shell is a fixed-height flex column where only <main> scrolls (see
// global.css). On iOS, focusing an input inside a non-scrollable page makes
// WebKit scroll the LAYOUT viewport itself to reveal the field — leaving
// `window.scrollY` / `visualViewport.offsetTop` non-zero. Nothing resets that,
// so after the keyboard dismisses the whole shell stays displaced: the tab bar
// looks raised and the page rubber-bands, until the app is relaunched.
//
// This guard keeps the architecture intact and only undoes the displacement:
//  1. When nothing editable is focused and the layout viewport is offset,
//     scroll it back to 0.
//  2. When an editable inside <main> gains focus, scroll IT into view within
//     <main> after the keyboard animation, so iOS has no reason to shove the
//     layout viewport in the first place.
// It is pure browser glue (no state, no domain) and a no-op where
// `visualViewport` is unavailable.
// ---------------------------------------------------------------------------

function isEditable(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function useViewportGuard(): void {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let debounce: ReturnType<typeof setTimeout> | undefined;

    const resetIfIdle = () => {
      // Only correct when the user isn't actively editing — otherwise we'd
      // fight iOS while it's revealing the focused field.
      if (isEditable(document.activeElement)) return;
      const offset = window.scrollY || vv.offsetTop || document.documentElement.scrollTop || document.body.scrollTop;
      if (offset > 0) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    const onViewportChange = () => {
      clearTimeout(debounce);
      debounce = setTimeout(resetIfIdle, 80);
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!isEditable(target as Element)) return;
      const el = target as HTMLElement;
      // Wait out the keyboard animation, then bring the field into <main>'s
      // own scroll — not the layout viewport's.
      window.setTimeout(() => {
        if (document.activeElement === el) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 300);
    };

    const onFocusOut = () => {
      // After blur the keyboard collapses; give it a beat, then straighten up.
      clearTimeout(debounce);
      debounce = setTimeout(resetIfIdle, 80);
    };

    vv.addEventListener('resize', onViewportChange);
    vv.addEventListener('scroll', onViewportChange);
    window.addEventListener('focusin', onFocusIn);
    window.addEventListener('focusout', onFocusOut);

    return () => {
      clearTimeout(debounce);
      vv.removeEventListener('resize', onViewportChange);
      vv.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('focusout', onFocusOut);
    };
  }, []);
}
