# Decisions

Durable record of non-obvious choices. Newest first.

## Serving NAS class recordings over HTTPS (Task 3, 2026-07)

**Problem.** The app runs on an HTTPS origin (GitHub Pages). Class videos live on
the Synology NAS under `homes/ethan/SNDK/video-courses` (on disk:
`/volume1/homes/ethan/SNDK/video-courses`). A lesson recording stores a *relative*
path (e.g. `setar-classes/session-1-…/video.mp4`); the app joins it under a
**NAS base URL** set in Settings. Two things must be true for playback:

1. The base URL must be a real `https://` origin. (A scheme-less value like
   `ds220plus.taild1d1f7.ts.net` was previously concatenated raw and treated as a
   *relative* URL against the Pages origin — so every recording opened the same
   in-app 404. Fixed in `normalizeBaseUrl` / `resolveRecording`,
   `src/domain/recordings.ts`.)
2. The folder must be served over HTTPS. DSM on `:5000` does **not** serve raw
   files, and plain `http://` links are mixed content that iOS blocks.

**Chosen: Tailscale Serve on the Synology.** Gives a valid `ts.net` certificate and
tailnet-only access with no extra software; Go's file server supports Range
requests, so video seeking works.

Runbook (the user applies this once — SSH is disabled by default so the assistant
cannot run it):

1. DSM → Control Panel → Terminal & SNMP → **enable SSH** (temporary is fine).
2. `ssh <admin>@192.168.0.20` and verify the path:
   `ls /volume1/homes/ethan/SNDK/video-courses/setar-classes`
3. Serve the folder under a `/media` path (leaves the ts.net root free):
   `sudo tailscale serve --bg --set-path /media /volume1/homes/ethan/SNDK/video-courses`
   (CLI, if `tailscale` isn't on PATH:
   `/var/packages/Tailscale/target/bin/tailscale serve --bg --set-path /media /volume1/homes/ethan/SNDK/video-courses`)
4. In the app: **Settings → NAS recordings base URL** =
   `https://ds220plus.taild1d1f7.ts.net/media`, then **Test link** (opens session 1).
5. Devices need **Tailscale ON** to play. Disable SSH again afterwards if preferred.

To undo: `tailscale serve --https=443 off` (or `tailscale serve reset`).

**Rejected alternatives.** WebDAV (auth prompts break iOS inline video);
per-file File Station share links (unmaintainable — one link per file). A Synology
Web Station static vhost with the Tailscale cert is a viable fallback if Serve is
unavailable, but Serve needs no DSM vhost config and is simpler.

**Never modify the recordings themselves** — the app only stores references.

---

## Session Plan — algorithm & evidence (2026-07-18)

The Session Plan (`src/domain/plan.ts`) lays out a time-budgeted session as ordered
segments in five buckets (warm-up · lesson · review · deep · cool-down). It reuses the
recommendation engine's `scoreItems` — no second ranking — and is pure and deterministic.

**Decisions.**
- **Minutes always sum to the budget.** A largest-remainder split by bucket weight, each
  segment ≥ 2 min; when the budget can't seat every segment, the lowest-priority ones are
  dropped before allocation. This is the one load-bearing invariant and is tested across
  15/20/30/45/60 and the edge cases.
- **The plan runs REAL blocks, not a countdown.** The runner drives the existing
  start→active→close flow; `closeSession` advances the plan only when the closed block was
  the current segment. `RoutineRunner` (the warm-up timer) is deliberately left untouched.
- **The running plan is ephemeral** (store-only, never in `PracticeDB`) so it never syncs
  or lands in a backup as data.
- **Shares are sane defaults, adjustable, never "optimal".** Bucket minute shares come from
  `SchedulingParams` (Settings) — the app makes no claim of an ideal ratio.

**Evidence (used as rationale for the SHAPE, not as precise prescriptions).**
- Spacing effect → short, spaced segments + SM-2 (Cepeda et al. 2006; Simmons 2012).
- Contextual interference / interleaving → the no-adjacent-same-item mix and the "it feels
  harder; that's the point" framing (Shea & Morgan 1979; Carter & Grahn 2016; Stambaugh 2011).
- Retrieval practice → short review slots (Roediger & Karpicke 2006).
- Deliberate, goal-directed practice → one focus per segment (Ericsson et al. 1993;
  Duke, Simmons & Cash 2009).
- Sleep consolidation → cool-down / end-on-stability (Simmons & Duke 2006).

No claim of an optimal minute ratio is made; the shares are defaults the user can adjust.
