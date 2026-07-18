# FUTURE.md — deferred ideas for Practice Compass

Things intentionally NOT built yet. Each is compatible with the philosophy in
`CLAUDE.md`; none is a commitment. Delete an entry when it ships or is abandoned.

## Classical-guitar scanner profile (`scan:setar` → generic)

`scripts/scan-setar-classes.mjs` regenerates `SETAR_CLASS_SESSIONS` from a NAS folder of
`session-N-DD-MM-YYYY/` directories. A `--profile cgs` variant was **deliberately skipped**:
Classical Guitar maps to Materials / study sources, a different model from the Setar class
history, so a folder scan would need a different parser and a different target. If/when the
guitar workflow accumulates a comparable folder tree, generalise the scanner (profile →
folder-name parser + target array + main-video heuristic) rather than forking the script.

## iOS keyboard-open hardening (held in reserve)

`useViewportGuard` resets WebKit's layout-viewport displacement after the software keyboard
dismisses. If real-device testing still shows the tab bar drifting *while the keyboard is
open*, add a `keyboard-open` class (toggled when `visualViewport.height ≪ innerHeight`) that
hides the bottom nav for the duration — recorded here rather than implemented, because on
current iOS the guard alone suffices and hiding the bar has its own trade-offs.

## Session Plan — possible extensions

- Remember and reuse a preferred bucket mix per instrument (beyond just the duration).
- A "why these minutes?" breakdown in the preview, mirroring "Why this date?" for reviews.
Both must stay honest (no fabricated optimum) and keep the sum==budget invariant.
