# FUTURE.md — deferred ideas for Practice Compass

Things intentionally NOT built yet. Each is compatible with the philosophy in
`AGENTS.md`; none is a commitment. Delete an entry when it ships or is abandoned.

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

## Item-level NAS references (the honest gap in composed material)

`itemFiles(db, itemId)` composes a piece's material from links that already exist — the
NAS references of the lessons it is linked to, plus its own attachments — with nothing
new persisted. That covers most Setar material, which arrives through classes. It does
NOT cover an item with **no lesson link**: there is nowhere to hang a NAS reference on a
`PracticeItem`. Closing that needs a new persisted field, therefore a `SCHEMA_VERSION`
bump, a migration and heavy tier — deliberately its own lane, not smuggled into a lane
whose whole thesis is that it stores nothing new. Reuse `LessonRecording`'s shape and
`relativizeReference`/`resolveRecording` rather than inventing a second reference model.

## A NAS file index and in-app picker (`scan:nas`)

Re-assessed on evidence 2026-09-10 and **deliberately deferred**: the NAS already serves
browsable directory listings (nginx, see `DECISIONS.md`), so Browse → copy → paste closes
most of the friction for a fraction of the surface. A scanner would add a build script, a
generated reference module, a staleness story and a Mac-only dependency — and it CREATES
new reference data. Revisit only if browsing and pasting proves insufficient in real use.
