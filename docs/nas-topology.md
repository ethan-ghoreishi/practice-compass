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
| Drive pairing | Synology Drive pairs `/Volumes/Sandisk` with NAS `homes/ethan/SNDK`, both ways; `.SynologyWorkingDirectory` sits at the drive root | measured 2026‑10‑31 in the Mac client's session table: share `home`, remote `/SNDK/` ↔ `/Volumes/Sandisk/`, bidirectional, local removals propagate. The only other pair (`/Image Warehouse/` ↔ `/Volumes/Warehouse/`) touches nothing here |
| `web` share | mounted on the Mac at `/Volumes/web` (DSM `/volume1/web`) | planning 2026‑10‑01 |
| `/Volumes/web/practice-compass` | a btrfs **bind mount** of `homes/ethan/SNDK/video-courses` (same inode; `/proc/mounts`), so writing through it writes the media. Left exactly as it is. | measured 2026‑10‑31 |
| Media over HTTPS | `https://192.168.0.20:5010/setar-classes/` is the Mac's media base (self-signed, a secure context) | measured 2026‑09‑18 |
| `https://192.168.0.20/practice-compass/` | answers **403** — no mirror is being served there | measured 2026‑09‑18 and planning 2026‑10‑01 |
| Web Station roots (what `:443` and `:5010` serve) | `:443`/`:80` serve `/volume1/web`; `:5010` proxies to Apache on `127.0.0.1:915`, `DocumentRoot /volume1/web/practice-compass` (the bind mount above) | measured 2026‑10‑31 |

## Who writes where

| Writer | Reads | May write | Propagates to |
|---|---|---|---|
| The owner | — | the media, either copy | the other copy, through Drive — deletions and renames included |
| Synology Drive | both copies | both copies | — it IS the propagation |
| NAS indexer (`run-setar-index.sh`, DSM task id 3, as `setar-indexer`; every 15 min 00:00–23:45 since 2026‑10‑31 — before that its repetition ended at 00:45; it runs only while the NAS is powered, and DSM's power schedule is on 09:00, off 20:00) | `PC_ARCHIVE_ROOT` | `setar-index.json` in its own work directory, which it never creates; one file on the `source-index` branch | GitHub only. The runtime folder `/volume1/practice-compass-index` is its own SMB share (ACL-only), outside every Drive pair and Web Station root; since 2026‑10‑31 only `ethan`, `setar-indexer`, `administrators` and the built-in `admin` hold ACEs on it, and `setar-indexer` only READS the archive |
| Setar scanner by hand on the Mac | an archive root | its own previous index, or a new file, outside that root | nothing |
| Setar scanner `--attention` (Mac or NAS, by hand) | an archive root, read twice and compared | nothing — a report on stdout only, archive-relative paths; `--out` is refused before anything is read | nothing |
| `setar-archive-maintenance.mjs` (NAS, by hand, as `ethan`, who owns the archive; publishes through the job as `setar-indexer`, `PC_MAINT_PUBLISH`, by the one-command sudo rule of 2026‑10‑31) | the archive root; its own `--state` folder | after an owner-confirmed preview only: `PIECES.csv`, `RENAME-LOG.csv` (temp + rename, never through a link), one renamed media file (bytes checked), and its private `--state` folder (outside the archive) | GitHub, through `run-setar-index.sh`; the archive edits travel to the Mac copy through Drive |
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
  `https://192.168.0.20/pc-mirror/`: Web Station's `:443` root is `/volume1/web`
  (measured 2026‑10‑31). The base is derived from the folder name
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

## Live NAS repair of 2026‑10‑30/31 (issue #60)

Done on the NAS itself on 2026‑10‑31 (00:14–01:00 NAS time, GMT) over SSH as
`ethan` with a root shell. Archive paths below are relative to `PC_ARCHIVE_ROOT`.
No credential appears here. The private rollback copies sit in a root-only
folder on the NAS outside every share; they are not reproduced here.

**Found (pre-state).**

- Task 3 ("Practice Compass Setar Index", run as `setar-indexer`, `sh …/run-setar-index.sh`):
  daily, every 15 min, `last work hour=0`, so it stopped at 00:45. The crontab
  line was `0,15,30,45 0 * * *`. Last run 00:00 Success.
- The runtime held the 2026‑10‑06 scripts, not this lane's.
- `PC_ARCHIVE_ROOT` resolves to itself (no link) under the `homes` share, inside
  the Drive pair above.
- Published head `c23e808`: index `0e268c044106`, 41 sessions, 106 pieces, three
  diagnostics:
  - Session 40's stacked-role take `تمرین-من-نت-چهارمضراب-چهارگاه-عبادی.mp4`
  - its held-back `نمونه.mp4`
  - Session 41's unregistered `نمونه-پیش-درامد-ابوعطا-لطفی.mp4`
- `session-42-24-11-2026` is empty.
- Permissions were broader than the design:
  - `group:http` (Web Station) had full control of the runtime share, token-bearing
    `config.env` included.
  - `setar-indexer` held full control on the `homes` share root, so it could
    WRITE the archive and read every home.
  - It also belongs to `http`, which reads the media.

**Changed, in order.** Each change was checked right after it.

1. **Task 3.** Set through DSM's own API (`SYNO.Core.TaskScheduler` `set`, v4),
   changing only `last_work_hour` 0 → 23, then `synoschedtask --sync`.
   - It now shows "Repeat every 15 min until 23:45".
   - The crontab line is `0,15,30,45 0,1,…,23`.
   - The scheduled 01:00 run fired (Success): the first run past hour 0 since
     the repetition broke.
   - DSM's power schedule (on 09:00, off 20:00) is unchanged, so "all day" means
     while powered.
2. **Runtime share.** Removed the `group:http` ACE. `http` can no longer read
   `config.env`; `setar-indexer` still can.
3. **Archive access.** Added `user:setar-indexer:allow:r-x---a-R-c--:fd--` on
   `PC_ARCHIVE_ROOT`, then removed the indexer's full-control ACE from the `homes`
   root (DSM's share permissions for `homes` ARE that ACL; it has no RW/RO lists).
   - Measured as `setar-indexer`: reads the archive and media; cannot write a
     declaration or the folder; cannot list another home folder; its own home
     still works.
   - `ethan` still writes the archive.
4. **Runtime files.** Copied the four runtime files from lane commit `a4036a9`
   (SHA‑256 prefixes: scanner `e00454df`, publisher `b136e940`, runner `d48f32eb`,
   maintenance `5e297716`).
   - On DSM, `chmod` drops a file's ACL, so the copies were put back under the
     folder's inherited ACL with `synoacltool -enforce-inherit`.
5. **`config.env`.** Appended `PC_NODE=/usr/local/bin/node` in place; the token
   was untouched. Under `sudo` the secure path has no `/usr/local/bin`, so the
   job failed `node: command not found` (exit 127) and published nothing. DSM's
   task environment has it.
6. **Owner-approved hand-off.** Added `/etc/sudoers.d/practice-compass-maint`
   (root, 0440), parsed by `sudo -l` (DSM ships no `visudo`):
   `ethan ALL=(setar-indexer) NOPASSWD: /bin/sh /volume1/practice-compass-index/run-setar-index.sh`.
   Any other command as `setar-indexer` still asks for a password.
   - Maintenance runs as `ethan` (who owns the archive) with
     `PC_MAINT_PUBLISH="sudo -n -u setar-indexer /bin/sh /volume1/practice-compass-index/run-setar-index.sh"`
     and `--state` in a private 0700 folder in ethan's home, outside both Drive
     pairs.

**Publications** (`source-index`, every file read back at its commit and decoded
by this lane's `parseSourceIndex` AND by production's, `main` `7c9e8e4`; both
accepted all three).

| Commit | Index | What | Sessions / pieces / diagnostics |
|---|---|---|---|
| `e1ba1f9` | `8fc585617d09` | intended-account run with the new scanner, archive unchanged (adds `code` to each diagnostic) | 41 / 106 / 3 |
| `dcb9586` | `38413b3c0e9a` | `rename` of Session 40's take to `تمرین-من-چهارمضراب-چهارگاه-عبادی.mp4` (preview `c8c77a84974c2484`) | 41 / 106 / 1 |
| `4d570c6` | `153200303541` | `register --piece پیش-درامد-ابوعطا-لطفی --session 41`, no musical fields (preview `4d119eaafd510e4d`) | 41 / 107 / 0 |

- **Session 40:** roster trusted, `پیش-درامد-چهارگاه-فروتن` and
  `چهارمضراب-چهارگاه-عبادی`; `نمونه.mp4` is attributed to both; each score PDF is
  attributed to its own piece; personal takes are membership roles only, never
  resources.
- **Session 41:** roster is `پیش-درامد-ابوعطا-لطفی`, its demonstration is scoped
  to it, and the class recording is kept.
- **Session 42:** absent. No `نت-…` piece exists.

**Unchanged reruns made no commit:**

- the scheduled 00:45 run (new scripts, before the repair);
- a manual intended-account run after the repair ("Index unchanged — no commit");
- the scheduled 01:00 run (Success; next trigger 01:15).

The head stayed `4d570c6` throughout. The NAS clock ran about ten minutes
behind the Mac's.

**Bytes.**

- All eight Session 40/41 media files hash the same before and after, the
  renamed take included (`0839ec841c82…`).
- The whole-archive size+path fingerprint (296 files) differs only by that one
  name and the two CSVs.
- Both CSVs are append-only: the old bytes are an exact prefix, plus one row
  each.
- The Mac's Drive copy converged: both CSVs are byte-identical, the renamed file
  has the same hash, the old name is gone, and there are no conflict copies.

**Not touched:** the 83 older rename-log names not on disk (§"Things sitting
inside…"), the power schedule, the `web` bind mount, `http`'s read on the media
(Web Station serves it), and the empty Session 42 folder.

**Deployed versus the repository.** The NAS runs the four runtime files of
`a4036a9` (hashes above). The repository's later versions add: the runner's
optional validated-hash and lock-token arguments, the publisher's `--expect`
refusal, `published-index` evidence line and pre-write check (`--root`
rescan, archive lock), the publisher seat (a localhost port, optional `PC_INDEX_SEAT_PORT` in
`config.env`, default 47391; one publisher at a time) and its unanswered-write
record `setar-publish-intent.json` in the work folder; the archive-wide lock (`.setar-maintenance.lock` in
the archive root, released by hand only with `release-lock --record`),
writes proved at the write, open-until-observed publication state, restore
preconditions, archive binding and session-folder link refusal in the
maintenance tool. All four files go together: the new runner passes `--root`,
which the new publisher requires. Until the
owner redeploys them, the NAS route has none of these. Redeploying needs, in
the same step, the sudo rule to allow its arguments (the hash and the lock holder) —
`ethan ALL=(setar-indexer) NOPASSWD: /bin/sh /volume1/practice-compass-index/run-setar-index.sh, /bin/sh /volume1/practice-compass-index/run-setar-index.sh *`
— or every apply ends `publish-failed`, reported as unconfirmed (sudo's
refusal is exit 1, no proof by itself; in fact nothing ran), and `retry`
after fixing the rule. After a
redeploy the journal of 2026‑10‑31 is an earlier version's, so `rollback`
refuses it; undo the Session 41 registration by hand like the Session 40
rename below.

**Rollback manifest** (root shell on the NAS; private copies under
`/volume1/@practice-compass-rollback/20261031/`, root-only):

- **Archive declarations.**
  - **Session 41 registration** (the last change): with the deployed
    `a4036a9` tool, run `… rollback` as `ethan` with the same `--state` and
    `PC_MAINT_PUBLISH`. It restores both CSVs from that apply's private copy
    and publishes. With a later tool, restore by hand (steps 1 and 4 below,
    from that apply's own private copy).
  - **Session 40 rename** (`rollback` only undoes the last journaled change, and
    a reverse `rename` is refused as a loop): as `ethan`, in this order.
    1. Put both CSVs back from the private copy in
       `--state/2026-10-31T00-45-36-512Z-c8c77a84974c2484/` by writing a temp
       file beside each and renaming it, never through the Mac.
    2. `mv` the take back to its old name in the same folder.
    3. Check SHA‑256 `0839ec841c82…`.
    4. Run the job through `PC_MAINT_PUBLISH`.

    The same original CSVs also sit in the root-only rollback folder, under
    `archive/`.
- **Index.** Disable task 3 first, or roll the archive back first. Otherwise
  the next tick republishes what the archive says within 15 minutes. Then
  commit an earlier `setar/index.json` forward on `source-index` (for example
  the blob at `c23e808`); never force-push.
- **Task 3.** The same API `set` with `last_work_hour=0` (saved as
  `task3-api-before.json`), then `synoschedtask --sync`. DSM also keeps
  `3.task` copies in `…/synoschedule.d/root/3.backup/`.
- **ACLs.**
  - `synoacltool -add /volume1/homes user:setar-indexer:allow:rwxpdDaARWc--:fd--`
  - `synoacltool -del <PC_ARCHIVE_ROOT> <index of the indexer's read ACE>`
  - `synoacltool -add /volume1/practice-compass-index group:http:allow:rwxpdDaARWc--:fd--`

  The pre-state of each is in `acl-before.txt`.
- **Runtime.** Copy `runtime/*` from the rollback folder back, keeping
  `config.env` as is unless reverting `PC_NODE` too, then run
  `synoacltool -enforce-inherit` on each file.
- **Sudo.** Delete `/etc/sudoers.d/practice-compass-maint`.
  - A DSM update may remove it too. The failure is safe: the job never runs,
    so that attempt publishes nothing, and an apply ends `publish-failed`
    (reported as unconfirmed — an earlier or scheduled write may still land,
    so the branch is not known to be unchanged). Reinstall the one line and
    run `… retry`.

**Still broader than needed (recorded, not changed):** through the runtime
share's inherited ACE, `setar-indexer` can write its own scripts and
`config.env`; it needs write only on `setar-index.json` and the folder. The
root-only rollback folder holds a second copy of `config.env` (the token):
delete `/volume1/@practice-compass-rollback/20261031/` once this repair is
accepted.
