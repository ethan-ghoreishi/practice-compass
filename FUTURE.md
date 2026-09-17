# FUTURE.md — deferred ideas for Practice Compass

Things intentionally NOT built yet. Each is compatible with the philosophy in
`AGENTS.md`; none is a commitment. Delete an entry when it ships or is abandoned.

## Tar and Guitar archives (no shared grammar yet)

The Setar scanner is deliberately Setar-shaped: `session-N-DD-MM-YYYY` folders, a
`PIECES.csv` registry and a seven-word role vocabulary. Tar is a flat run of numbered Farsi
course videos; Guitar is eighteen levels with course sections, notes and PDFs. Neither
shares that grammar, so there is no adapter to write yet and none was invented — what IS
shared (the normalised source description, path validation, reconciliation and resource
resolution in `sourceArchive.ts`/`sourceReconcile.ts`) is already generic. When one of them
accumulates a comparable tree, give it its own scanner that emits the same index shape;
do not build a plugin registry for two cases.

## Archive follow-ups the first lane deliberately left open

- **Splitting a PROVISIONAL piece.** Sessions 7, 34 and 35 use dastgāh-level names because
  the individual gushehs were never labelled. The flag reaches the app; a "needs labelling"
  affordance that splits one into several, carrying the material across, does not.
- **Media segmentation.** A two-part `نمونه` is ONE logical demonstration and is shown as
  one ordered group. Concatenating or seeking within it needs a player this app does not
  have and does not want.
- **A published index for anything public.** The index describes a private archive and is
  published to a private branch. It must not become a public bundle.

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

## A NAS file index and in-app picker (`scan:nas`)

Re-assessed on evidence 2026-09-10 and **deliberately deferred**: the NAS already serves
browsable directory listings (nginx, see `DECISIONS.md`), so Browse → copy → paste closes
most of the friction for a fraction of the surface. A scanner would add a build script, a
generated reference module, a staleness story and a Mac-only dependency — and it CREATES
new reference data. Revisit only if browsing and pasting proves insufficient in real use.
