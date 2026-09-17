# The Setar archive: scanner, index and refresh

How the normalised Setar class archive becomes historical lessons, canonical
repertoire items and useful practice material — and exactly how the unattended
part of it is installed, run and rolled back.

Nothing here writes to the archive. Ever.

---

## 1. The shape of it

```
NAS (read-only)                     GitHub (private data repo)        App
┌────────────────────────┐          ┌───────────────────────┐        ┌──────────────┐
│ setar-classes/         │  scan    │ branch: source-index  │  GET   │ Refresh      │
│   session-N-DD-MM-YYYY │ ───────▶ │   setar/index.json    │ ─────▶ │ Setar archive│
│   PIECES.csv           │ publish  └───────────────────────┘        └──────────────┘
│   RENAME-LOG.csv       │                     ▲                            │
└────────────────────────┘                     │                            ▼
         ▲                            branch: main (app data)     one validated
         │ media, opened directly              UNTOUCHED           store mutation
         └──────────────────────────────────────────────────────────────┘
```

Three separations do the work:

- **The app never parses a filename.** The grammar lives once, in the scanner.
- **The index is on its OWN branch.** The app's sync writes `main`'s whole tree
  with no `base_tree`, so a sidecar next to `state.json` would disappear on the
  next sync. `source-index` is outside that, and outside `archive/…` recovery
  branches too.
- **Media never travels.** Only paths do. Each device resolves them through its
  own base URL, so changing the transport rewrites no stored record.

---

## 2. The scanner

`scripts/scan-setar-classes.mjs` — Node stdlib only, no dependencies, read-only
over the archive.

```sh
node scripts/scan-setar-classes.mjs --root /volume1/media/setar-classes --out /volume1/practice-compass-index/setar-index.json
node scripts/scan-setar-classes.mjs --root <archive>            # to stdout
```

It reads `PIECES.csv` (the canonical registry) with a real quoting-aware CSV
parser, walks the `session-N-DD-MM-YYYY` folders, applies the filename grammar
from the archive's own `CRAWLER-BRIEF.md`, and emits a **clock-free** JSON index
with a `contentHash` over its semantic body. The same archive always produces
byte-identical output: no mtimes, no directory-order luck, no `generatedAt`.

What it refuses outright (and produces no index for): a malformed or ambiguous
registry, a duplicate canonical key, two folders claiming one session number, an
unsafe path, more than 5000 files, a registry that changed during the scan.
What it reports and skips: a file with no known role, an unknown piece, an
unsupported extension, a class recording claiming a piece, an unnamed demo in a
session whose roster and filenames disagree.

The output is written **outside the archive** via a temp file + rename, and the
scanner refuses an `--out` path inside `--root`.

### Corpus baseline

Verified directly against the real archive on 2026‑09‑17:

| | |
|---|---|
| sessions | 39 |
| files in session folders | 258 |
| parseable | 257 |
| known exception | 1 (`session-16-26-11-2024/video-2024-10-29-15-32-35.mp4`) |
| canonical pieces | 94 |
| personal recordings (`تمرین-من`) | 125 |
| useful resources | 132 (45 class · 57 demo clips · 24 notation · 6 corrections) |
| logical demonstrations | 37 |
| rename-log rows | 257 |

Source hashes (sha256), so a changed input is visible rather than assumed:

```
PIECES.csv        1f68366e32f0f5ddc8b8db0c1027893b724e16d496f0dca0502fa0a0cd133524
RENAME-PLAN.csv   795faf11c1538e69905e245e9c45d0b13ebcd3469a1b18a2db097786e576b39c
RENAME-LOG.csv    0c276d5e50fc93904ecfb76c71b1c78dca1cda2610f1569f28c9828013278373
CRAWLER-BRIEF.md  ee76dbc17351fdcc33662b7c467652f5b90728005ef48071bdb35bcf8843a9bc
sorted path inventory (LF-joined, trailing newline)
                  0286b07549ad55b0f84166dc2c7b8c2d5949f96a282f03ebaa5837ebf5b22ae7
```

These are evidence of one corpus, not a limit: sessions 40+ need no code change.

---

## 3. The publisher

`scripts/publish-setar-index.mjs` writes **one file on one branch**:
`source-index` / `setar/index.json`. Both are fixed in the code, and every other
target is refused before a request is made.

- **Unchanged content makes no commit.** The index is clock-free, so identical
  bytes mean an identical archive.
- The branch ref advances **non-force** from the commit that was read, with
  `expected_head_sha`, so a racing publisher loses the update rather than
  overwriting it; the retry re-reads before deciding anything.
- An interruption before the ref advances leaves the previous index published —
  a blob and a commit nothing points at are invisible.
- Error messages are built from the HTTP status and the endpoint name only.
  **No token, no repository URL and no archive path ever reaches a log.**

### The credential

A GitHub token scoped to **this one private repository**, with **Contents:
write** and **Metadata: read**, and no workflow or admin permission.

> GitHub does not issue branch-scoped tokens. The branch and path restriction is
> a property of *this code* (and, optionally, of repository rules). It must not
> be described as credential isolation.

It lives in the NAS runtime's own protected configuration file and nowhere
else — never in the archive, the app, a backup, sync, a commit or a log line.
The app's own GitHub connection (Settings → Sync) is a *different* credential and
is used here for **GETs only**.

---

## 4. Installing the unattended job on the NAS

The production host is the Synology NAS, not the Mac. The Mac can run the same
two scripts by hand; that is the development fallback, not the deployment.

1. **Runtime.** Install a supported Node runtime (Package Center → Node.js).
   Record the actual binary path — `which node` under the task's own shell — and
   set `PC_NODE` if it is not on `PATH`.
2. **Directories.** Create a runtime/output directory *outside* the archive,
   e.g. `/volume1/practice-compass-index/`, owned by a non-admin service user.
   Copy `scripts/scan-setar-classes.mjs`, `scripts/publish-setar-index.mjs` and
   `scripts/run-setar-index.sh` into it.
3. **Permissions.** Give that user **read-only** access to the archive share and
   read/write to the runtime directory only.
4. **Configuration.** Create `config.env` in the runtime directory, `chmod 600`:

   ```sh
   PC_ARCHIVE_ROOT=/volume1/<share>/setar-classes   # the REAL mount, not /Volumes/…
   PC_INDEX_REPO=<owner>/practice-compass-data
   PC_INDEX_TOKEN=<the publisher token>
   ```

   The real internal mount path is discovered during installation. **Do not
   assume the Mac's `/Volumes/...` path exists on DSM.**
5. **Schedule.** DSM → Control Panel → Task Scheduler → Create → Scheduled Task
   → User-defined script. Run as the service user, every **15 minutes**, command:

   ```sh
   sh /volume1/practice-compass-index/run-setar-index.sh
   ```

   Enable "Send run details by email" only on error: the script prints counts and
   a truncated commit id, never a secret.
6. **Verify.** Run the task once by hand and confirm: a commit on `source-index`,
   `main` unchanged (`git log --oneline main` has no new entry), and the app's
   Refresh finding the new index. Then confirm an **unattended** run with the Mac
   off.

### Rollback

Disable the scheduled task. The app keeps the source graph it last accepted and
goes on working offline from it. To go back to an earlier index,
`git push --force-with-lease` an earlier `source-index` commit. Neither touches
the app's own data on `main`. Revoking the token stops publication and leaves the
last good index exactly where it is.

---

## 5. What the app does with it

**Refresh Setar archive** (Settings, reachable from Lessons) fetches the branch
ref, then the file **at that commit**, validates it, shows what would change, and
applies the lot in one store mutation.

- **Refresh means "the latest published index", not "rescan the NAS now."** The
  UI says when the index was last *fetched* and last *changed*. It never says
  "last scanned", because nothing here can know that.
- **Exact source binding wins.** A record already bound to a source identity *is*
  that entity, whatever its title or date has since been edited to.
- A legacy class is auto-adopted only on **instrument + date + number + exact
  source-path evidence**. Date alone, number alone or title alone cannot merge.
- An exact title or literal alias match produces **Link / Create separately /
  Skip** — never an automatic merge, and never "pick the first candidate".
- New pieces arrive **resting**, by explicit import policy, so ninety-four items
  do not flood Today. They stay searchable and directly startable.
- **Nothing about practice is ever seeded**: no minutes, no result, no review
  date, no SM‑2 state. An imported class is history even when its date is in the
  future relative to this device's clock.
- Deleting, unlinking or hiding records a narrowly scoped **suppression** in the
  same mutation, so a refresh, a reload and a sync all respect it.

The owner's own `تمرین-من` recordings are evidence, not material: their
membership and role survive in the graph, the files themselves never become a
piece's material.

---

## 6. Notes for whoever changes this next

- **`scripts/setar-index.test.mjs` is deliberately absent.** Vitest's `include`
  is `src/**/*.test.ts` and `tests/**/*.test.ts` (and `vite.config.ts` is a
  forbidden path in the lane that built this), so a test file under `scripts/`
  would never run. The scanner and publisher are tested from
  `src/domain/scanSetarClasses.test.ts` and `src/store/archiveIndex.test.ts`,
  which import the `.mjs` modules directly.
- **`src/domain/setarClasses.ts` is frozen.** It is no longer a workflow; it is
  the ledger of the 67 obsolete paths the old bundled importer wrote, and the
  reference-repair check runs against all 67 of them.
- `npm test` must never need the NAS, the Sandisk drive or the network. The
  checked-in fixture `tests/fixtures/setar-archive.json` is the real corpus with
  registry notes trimmed to their first sentence.
