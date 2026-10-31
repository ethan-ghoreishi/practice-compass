# NAS topology: what reaches what

The one map of the owner's devices, shares, links and the tools that write near
the media. Read it before any repository tool is pointed at a NAS path.

**The lesson it exists for.** On 2026‑09‑30 `scripts/deploy-nas.sh` ran
`rsync --delete` into `/Volumes/web/practice-compass`. That path's name says
"app folder"; what it reached was the owner's media tree, and Synology Drive then
carried the deletions to the other copy. On this setup **a path's name says
nothing about what it reaches**: SMB shows a server-side link as an ordinary
folder, so nothing on the Mac can see one. Every repository tool therefore changes
only what it can prove it wrote — proven by content it wrote, never by a path —
never deletes, and never fails silently. Only the owner writes media — and,
since 2026‑10‑30, the guided maintenance route, which renames one file the owner
confirmed and nothing else.

Every fact below carries its date and source. "Planning" means the read-only
measurements taken while planning the 2026‑10‑01 lane at `25d6767`. A DSM-side
fact that could not be measured from the Mac is marked **owner to confirm
(ac‑11)** and is not asserted. No credential appears here, ever.

## Devices, copies and links

| What | Where | Source |
|---|---|---|
| NAS | Synology DSM at `192.168.0.20` | measured 2026‑09‑18 |
| Media, Mac copy | `/Volumes/Sandisk/video-courses/{setar-classes,tar-classes,classical-guitar}` | planning 2026‑10‑01 |
| Media, NAS copy | `homes/ethan/SNDK/video-courses/…` | owner report 2026‑09‑30 |
| Drive pairing | Synology Drive pairs `/Volumes/Sandisk` with NAS `homes/ethan/SNDK`, both ways; `.SynologyWorkingDirectory` sits at the drive root | owner statement; `.SynologyWorkingDirectory` measured, planning 2026‑10‑01. Exact pair: **owner to confirm (ac‑11)** |
| `web` share | mounted on the Mac at `/Volumes/web` (DSM `/volume1/web`) | planning 2026‑10‑01 |
| `/Volumes/web/practice-compass` | shows the media tree `homes/ethan/SNDK/video-courses`. Symlink, shared-folder mapping or Web Station root: **owner to confirm (ac‑11)**. Left exactly as it is. | owner report 2026‑09‑30 |
| Media over HTTPS | `https://192.168.0.20:5010/setar-classes/` is the Mac's media base (self-signed, a secure context) | measured 2026‑09‑18 |
| `https://192.168.0.20/practice-compass/` | answers **403** — no mirror is being served there | measured 2026‑09‑18 and planning 2026‑10‑01 |
| Web Station roots (what `:443` and `:5010` serve) | **owner to confirm (ac‑11)** | — |

## Who writes where

| Writer | Reads | May write | Propagates to |
|---|---|---|---|
| The owner | — | the media, either copy | the other copy, through Drive — deletions and renames included |
| Synology Drive | both copies | both copies | — it IS the propagation |
| NAS indexer (`run-setar-index.sh`, DSM task id 3, as `setar-indexer`; intended every 15 min ALL day — on 2026‑10‑30 its repetition ended at 00:45, so it ran four times around midnight; four copied files) | `PC_ARCHIVE_ROOT` | `setar-index.json` in its own work directory, which it never creates; one file on the `source-index` branch | GitHub only. Task, runtime directory and that `config.env` sits outside every served or synced share: **owner to confirm (ac‑11)** |
| Setar scanner by hand on the Mac | an archive root | its own previous index, or a new file, outside that root | nothing |
| Setar scanner `--attention` (Mac or NAS, by hand) | an archive root, read twice and compared | nothing — a report on stdout only, archive-relative paths; `--out` is refused before anything is read | nothing |
| `setar-archive-maintenance.mjs` (NAS, by hand, as an account that may write the archive; publishes through the job as `setar-indexer`, `PC_MAINT_PUBLISH`) | the archive root; its own `--state` folder | after an owner-confirmed preview only: `PIECES.csv`, `RENAME-LOG.csv` (temp + rename, never through a link), one renamed media file (bytes checked), and its private `--state` folder (outside the archive) | GitHub, through `run-setar-index.sh`; the archive edits travel to the Mac copy through Drive |
| Course scanners (Mac, by hand) | `/Volumes/Sandisk/…` | `src/domain/courseData.ts` / `khonyagarData.ts` (default resolved from the script, never the CWD) | a commit, if the owner makes one |
| `scripts/nas-mirror.mjs` | the repo's `dist/` | only inside a folder it created, or one holding its marker | the mirror's own origin |
| The app | GitHub API; media only by opening a link | its own IndexedDB; the GitHub data repo through sync | other devices, through sync |
| GitHub Actions | `main` | GitHub Pages | everyone's installed PWA |

The app has **no write channel to the NAS**. The CSP the build injects allows
network access only to its own origin and `https://api.github.com`
(`tests/owned-writes.test.ts` holds this). Media is opened by link, never fetched
or stored.

Every scanner refuses an output it cannot prove is its own. It checks the output
before reading the source and again before writing. An output reached inside its
own root, through any real path, is refused. So is an existing file it did not
generate, and so is a link. Each scanner replaces only its own output, by an
exclusive temp and a rename. The operator scripts detect a direct run by REAL
path, so DSM's symlinked `/var/services/…` paths still run them. They never
report success without having run.

GitHub: the app repository's `main` deploys Pages. The private data repository
holds sync snapshots on `main`, recovery copies on `archive/…` branches, and the
Setar index on `source-index` (`setar/index.json`, written only by the NAS
publisher).

## Things sitting inside a served, synced media tree

Recorded, never acted on by any tool; each is the owner's call (planning
2026‑10‑01):

- `setar-classes/undo-rename.sh` is an executable `mv` script. Run, it would
  rename about 180 media files and break stored references.
- `tar-classes/_recovered-2026-09-30-unnamed/` is left over from the recovery.
- `setar-classes/session-40-29-09-2026` exists and is **empty** on both sides.
- Six fixture-era Setar resource names, in sessions 23, 28 and 38, resolve
  through no logged rename. Fuller names sit beside them on disk, so they look
  like unlogged manual renames, not losses.

## The mirror

`node scripts/nas-mirror.mjs --dest <folder> [--base /<path>/] [--apply]`

Without `--apply` it is a dry run. It still builds into the repo's own `dist/`,
then prints the destination, its parent's entries and what it would create or
replace. It writes nothing at the destination.

- **Use a NEW folder.** For example `/Volumes/web/pc-mirror`, served at
  `https://192.168.0.20/pc-mirror/` if Web Station serves the `web` share there
  (**owner to confirm (ac‑11)**). The base is derived from the folder name
  (`/pc-mirror/`); `--base` overrides it.
- **It refuses** a folder it did not create, even an empty one. It also refuses
  a destination that is itself a link, anything it finds there that it never
  claimed, and creating a folder beside `setar-classes`, `tar-classes`,
  `classical-guitar`, `PIECES.csv` or `.SynologyWorkingDirectory`.
  `--dest /Volumes/web/practice-compass` is refused, and the refusal names the
  media it holds.
- **It never deletes.** Files from older builds stay. To clear them, delete the
  folder you created yourself and publish again. The same applies to a first
  publish interrupted before its marker existed. An interruption after that
  finishes on a re-run.
- **It is a separate origin with its own IndexedDB.** Practice entered there
  stays there. **Never connect it to the real data repository while it runs an
  unmerged branch**: a newer schema would publish a snapshot production refuses.

## Which testing route proves what

| Route | Secure context | Proves | Does not prove |
|---|---|---|---|
| `http://<Mac LAN IP>:4173` | no (measured 2026‑09‑18) | phone layout and geometry (ac‑24's traces) | wake lock, `crypto.subtle` (so neither Sync nor archive Refresh), service worker, offline |
| `http://localhost:4173` | yes | every feature, on the Mac | anything about the phone |
| HTTPS mirror (`nas-mirror.mjs`) | yes: HTTPS is a secure context even with a self-signed certificate (measured on `:5010`, 2026‑09‑18) | an unmerged build on the phone over HTTPS | **service worker and installed-app support from a self-signed origin: unverified until observed** |
| GitHub Pages | yes | production and the installed PWA | only `main`; there is no branch preview |

## When something looks wrong: four read-only commands

Each writes only into a fresh temp folder. Compare the results with the dated
values here and in `docs/setar-archive.md`.

```sh
T=$(mktemp -d)

# 1. Regenerate both courses to temp files and compare with what is committed.
node scripts/scan-cgs-course.mjs --write --out "$T/courseData.ts" && cmp "$T/courseData.ts" src/domain/courseData.ts
node scripts/scan-khonyagar-course.mjs --write --out "$T/khonyagarData.ts" && cmp "$T/khonyagarData.ts" src/domain/khonyagarData.ts

# 2. Scan the Setar archive to stdout; read its counts and content hash.
node scripts/scan-setar-classes.mjs --root /Volumes/Sandisk/video-courses/setar-classes > "$T/setar.json"
grep '"contentHash"' "$T/setar.json"

# 2b. What needs the owner: missing registry rows, rosters, unlogged renames
#     (docs/setar-archive.md §7). Prints only; writes nothing.
node scripts/scan-setar-classes.mjs --root /Volumes/Sandisk/video-courses/setar-classes --attention > "$T/attention.txt"

# 3. Fingerprint the media: every file's size and path, sorted, then hashed.
(cd /Volumes/Sandisk/video-courses && find . -type f ! -name .DS_Store ! -path '*/@eaDir/*' -exec stat -f '%z %N' {} + | LC_ALL=C sort) > "$T/media.txt"
wc -l < "$T/media.txt"; shasum -a 256 "$T/media.txt"
```

## Live NAS repair of 2026‑10‑30 (issue #60)

What the lane established read-only from the Mac, against the Drive copy of the
archive (`/Volumes/Sandisk/video-courses/setar-classes`): the declarations and
the scanned index match the runtime's last published one; a read-only scan
publishes 41 sessions and 106 pieces with three diagnostics — the Session 40
stacked-role personal take (`unregistered`), its held-back `نمونه.mp4`
(`demo-unattributed`) and the unregistered Session 41 demonstration. The real
inventory holds only `.mp4`, `.pdf` and `.jpg` in session folders. The rename
log has an extra, sometimes non-empty `timestamp` column, which the maintenance
route preserves.

**Not yet done, and not claimed:** the task-schedule correction, the narrowing of
the runtime/config permissions, the real-account run, the corrected scan hash on
the NAS, the commit-pinned publication and its second-run no-commit result. Each
needs the NAS itself (DSM or a shell as the owner's admin and as
`setar-indexer`), which this session did not have; the archive declarations
were deliberately NOT edited from the Mac, because Drive would carry a half-done
repair to the NAS ahead of a job that could publish it. The redacted
pre/post record and the rollback manifest belong here once that access is
granted. What it needs: DSM Task Scheduler (task 3's schedule and next
trigger); an admin shell to read real paths, modes and ACLs and to narrow only
the runtime/config files; running the job as `setar-indexer`; and an
archive-writing account for the two declaration edits and the one rename, with
`PC_MAINT_PUBLISH` pointing the publish step at the job's own account.

