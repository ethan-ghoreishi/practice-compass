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
