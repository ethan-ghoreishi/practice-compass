---
id: 20261001-make-nas-deployment-and-media-tooling-fa-3d7b
contractId: 20261001-make-nas-deployment-and-media-tooling-fa-3d7b
patchId: 9599b39b8963691744ed80ece35a83b6572ccffe
reviewer: claude
state: sealed
verdict: approve
createdAt: 2026-10-01T01:53:39.699Z
sealedAt: 2026-10-01T15:08:23.443Z
---

# Review: Make NAS deployment and media tooling fail closed, map the real NAS topology, and settle last lane's residue

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261001-make-nas-deployment-and-media-tooling-fa-3d7b
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/41
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `9599b39b8963691744ed80ece35a83b6572ccffe`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

````yaml
# Approved intent: Make NAS deployment and media tooling fail closed, map the real NAS topology, and settle last lane's residue

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** technical
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Review the current Practice Compass repo from first principles and produce one import-ready HEAVY lane for the remaining issues and any closely related improvements genuinely required after the recently completed repertoire/UI work.
> 
> Treat these mainly as observed symptoms, not prescribed solutions:
> 
> - `scripts/deploy-nas.sh` caused serious data loss when deploying the app: its target appeared to be `/Volumes/web/practice-compass`, but that path ultimately exposed the real Setar/Tar media tree (`home/SNDK/video-courses`). Deployment deleted files that were not part of `dist/`, and Synology Drive propagated those deletions to the Sandisk mirror. Most data has since been recovered manually. The deployment path remains unsafe and should not be used as-is.
> - The relationship between the app build, NAS-served app, NAS media, Synology Drive/Sandisk mirrors, indexers and any filesystem links/aliases is evidently easier to misunderstand than it should be. Investigate the actual topology and failure modes rather than assuming paths are independent.
> - Review whether any temporary diagnostics, workarounds, warnings, viewport tracing, compatibility code, stale documentation or other residue from the previous lane should now be retained, simplified or removed.
> - Review the current repo for other unfinished, inconsistent or fragile behaviour exposed by the recent work, including data integrity, persistence/migrations, repertoire/pathway identity, Study Sources, musical vocabulary, Setar/Tar media access, mobile/PWA behaviour, navigation/context preservation and recovery/failure paths. Include something only where investigation shows a real remaining need.
> - Verify that recovered/restored media and existing owner data are never modified, renamed, deleted or silently reclassified by maintenance, deployment, indexing or application flows.
> 
> Do not assume my suggested direction is optimal. Inspect the code, scripts, docs, configuration and relevant history and choose the smallest coherent design that fixes the underlying problems rather than individual examples.
> 
> Plan defensively so this does not become another long builder/reviewer loop (the followings are suggestions only. feel free to disregard the following if not optimal):
> - identify the underlying invariant/failure family behind each issue;
> - trace every writer, reader, migration, command and UI entry point that can violate it;
> - include counterexamples, negative cases, retries/interruption cases and cross-feature interactions in acceptance;
> - make destructive operations fail closed and prove their safety before they can touch real data;
> - distinguish what automation can prove from what requires OWNER/device/NAS verification;
> - make manual acceptance steps precise and executable before review;
> - require tests to cover the invariant family rather than only the originally reported example;
> - account for symlinks/aliases/mounts, sync propagation, stale state, partially restored data and unexpected environment configuration where relevant;
> - preserve all owner data and existing working behaviour;
> - avoid speculative architecture and unrelated refactors.
> 
> Before finalising the plan, actively look for scope holes or plausible reviewer counterexamples and revise the plan to close them.

## Why

THESIS — one invariant, every writer near the media. On this setup a path's name says nothing about what it reaches: `/Volumes/web/practice-compass` reached the media tree through the NAS side; SMB presents a server-side link as an ordinary folder, so no check on the Mac can see it; and Synology Drive carries any deletion between the NAS and `/Volumes/Sandisk`. `deploy-nas.sh` trusted a path with `rsync --delete`. The scanners, the NAS runner and the operator scripts' start-up check trust paths in milder ways. So every repository tool may change only what it can prove it wrote — proven by content it wrote, never by a path — never deletes, never writes inside what it reads, and never fails silently. Only the owner writes media.

KEY CHOICES. Keep a mirror rather than retire it: it is the only HTTPS route that puts an unmerged build on the phone, and this lane's owner check uses it to complete the installed-app half of ac-24. No deletion at all, and every write an atomic replacement of a path the tool owns: deletion and write-through are the only ways a tool here can destroy something, and stale hashed assets cost nothing. Positive ownership (a folder the tool created, or its marker plus a claims journal); realpath is defence in depth only. Scanner guards stay inline, because the NAS job is installed by copying exactly three files. App flows get proofs, not changes: the injected CSP gives them no channel to a NAS origin, and an index from a partial restore is already reversible.

RESIDUE REVIEW. Retained: Keyboard trace (the fallback diagnostic if that check fails), viewport guard, standalone 100vh shell, interactive-widget meta (the owner-passed configuration). Removed: `removeCatalogItem` (no production caller). Replaced by one measured topology doc: every recommendation of, or warning about, `deploy-nas.sh`, and the stale topology and filename-normalisation claims. Left out as different families with no new evidence of owner impact: Sync's raw plain-http error, QuickAdd/insights instrument-name direction, the unwired `readIndexFile`.

## Today

Read-only measurements while planning, 2026-10-01 at 25d6767. Baseline is the unit suite only (`npx vitest run src`: 41 files, 423 tests green); browser journeys were not run.

DEPLOY. `npm run deploy` runs `scripts/deploy-nas.sh`. DEST defaults to `/Volumes/web/practice-compass` (or `PC_DEPLOY_DIR`), and only the parent's existence is checked. It then builds and runs `rsync -rv --delete dist/ DEST/`. On 2026-09-30 that DEST exposed `homes/ethan/SNDK/video-courses`, and the deletions reached `/Volumes/Sandisk` through Synology Drive (`.SynologyWorkingDirectory` sits at the drive root). `https://192.168.0.20/practice-compass/` answers 403, as it did on 2026-09-18, so the mirror was never seen serving the app. docs/setar-archive.md §5 still recommends `npm run deploy` as the phone HTTPS route. README, AGENTS.md and docs/repertoire-experience.md only warn, and AGENTS.md says guarding it 'needs its own lane'.

SCANNERS AND OPERATOR SCRIPTS. `writeIndexAtomically` (scan-setar-classes.mjs) refuses an `--out` only when it is lexically under `--root`, and renames over any existing file. scan-cgs-course.mjs and scan-khonyagar-course.mjs `--write` call `fs.writeFileSync(out)` with no guard: a symlink is followed, any file replaced, the default `--out` resolves against the CWD, and `main()` runs on import. run-setar-index.sh runs `mkdir -p "$WORK"` before anything checks it. scan-setar-classes.mjs and publish-setar-index.mjs start `main()` only when `import.meta.url` equals `pathToFileURL(process.argv[1])`. Invoked through a symlinked directory (DSM's `/var/services/homes` and `/var/services/web` are symlinks), that comparison fails and the script exits 0 having done nothing. A scratch script using that same check reproduced the skip while planning (the real scripts were not run that way), and on the NAS it would turn the unattended indexer into a silent no-op.

APP. The app has no write path to the NAS: media is opened by link, and the injected CSP allows connect-src only 'self' and https://api.github.com. Nothing tests that. A narrower archive index flags missing rows `unavailable` and the full one clears them; only the piece case is tested. A scratch run while planning showed resources and sessions round-trip exactly too.

RESIDUE. `removeCatalogItem` is a non-deleting store alias with no production caller, kept only for tests/repertoire-families.test.ts and src/store/archiveIndex.test.ts. More → Keyboard trace is opt-in and memory-only; ac-24 passed on one iPhone over plain http only.

RESTORED MEDIA. The CGS and Khonyagar scanners regenerate courseData.ts and khonyagarData.ts byte-identically from `/Volumes/Sandisk` (to a scratch `--out`). Khonyagar on the NAS lists 259 mp4, 4 pdf and 2 md, all NFC. The Sandisk copy now has 0 NFD names, where docs/khonyagar-course.md says 78. A fresh Setar scan gives 39 sessions with files, 104 pieces, 133 useful resources, 270 renames, 0 diagnostics, contentHash 5f303d4db445. `session-40-29-09-2026` exists and is EMPTY on both sides. Six fixture-era Setar resource names (sessions 23, 28, 38) resolve through no logged rename. `tar-classes/_recovered-2026-09-30-unnamed/` exists. `setar-classes/undo-rename.sh`, an executable `mv` script, sits inside the served, Drive-synced archive.

## Instead

1. NAS MIRROR. A Node-stdlib `scripts/nas-mirror.mjs` replaces `scripts/deploy-nas.sh`, and the `deploy` npm script is removed.
- Usage: `node scripts/nas-mirror.mjs --dest <folder> [--base /<path>/] [--apply]`. There is no default destination, and `PC_DEPLOY_DIR` is not read. Without `--apply` it writes nothing and prints the absolute destination, its parent's first entries, and what it would create or replace.
- OWNERSHIP is positive and proven by content. A destination is the tool's only if the tool created it, or it holds the tool's marker `.practice-compass-mirror.json`, whose claims journal lists every path the tool ever claimed. "Created" means it was absent and was made non-recursively under an existing parent. An existing folder without a valid marker is refused, even when it is empty.
- FAIL-CLOSED INSPECTION. A walk that never follows links may find only: the marker and its own temp files, claimed files, directories holding claimed files, and housekeeping it never touches (`.DS_Store`, `._*`, `@eaDir/`, `#recycle/`). Anything else refuses and is named: an unclaimed file; any entry that is neither a regular file nor a directory (symlink, FIFO, socket, device); a claimed path of the wrong type; an entry it cannot read.
- A malformed marker also refuses: bad JSON, the wrong tool, or a claim that is not a string, is absolute, has an empty, `.` or `..` segment, or would resolve outside the destination.
- The build output gets the same sweep before anything is written. It may contain only regular files and directories with safe relative names, and nothing using the marker or temp names. Housekeeping in it is skipped.
- It refuses a destination that is itself a symlink. This is `lstat` on the destination entry only; ancestors are not inspected, so macOS `/var` → `/private/var` and DSM's `/var/services` still work. It also refuses a destination nested in, or containing, the build folder.
- Defence in depth, never the proof: it refuses to CREATE a folder whose parent holds a media marker (`setar-classes`, `tar-classes`, `classical-guitar`, `PIECES.csv`, `.SynologyWorkingDirectory`).
- WRITES ARE ATOMIC REPLACEMENTS OF PATHS IT OWNS. Before creating anything, the tool journals every path it will create, including each uniquely named temp file. The marker's own temp uses a fixed name prefix and is the only unjournaled name. Each write:
  1. creates its temp exclusively (`wx`), so it can never open an existing entry or follow a link;
  2. checks with `lstat` that every component between the destination and the target is a real directory;
  3. renames the temp onto the owned path. A rename replaces the entry itself, so neither a symlink nor a hard link is ever written through.
- It never deletes anything, and never renames, moves or overwrites a path it does not own. Temp files left by an interruption are its own and are simply left.
- Order:
  1. Check ownership.
  2. Build: `npm run build` with `PC_BASE` set to `--base`, or to `/<folder name>/` when `--base` is absent. A folder name outside `[A-Za-z0-9._-]` requires `--base`.
  3. Sweep the build.
  4. Check ownership again.
  5. Create the folder if it is absent.
  6. Write the marker (the journal), then the build files.
- A failed build, a refusal or a dry-run writes nothing anywhere. Re-running completes a publish interrupted after its journal. A first publish interrupted before its marker exists is refused, with a message naming that folder as the mirror's own unfinished one for the owner to delete and publish again.
- Stale files from older builds stay; to clear them, the owner deletes the folder they created and publishes again. One run at a time; a lost claim surfaces as a refusal.
- The decision, the writer and the build step are exported and injectable, so tests never run Vite or touch a real share.

2. SCANNERS AND OPERATOR SCRIPTS. Each guard is inline in its own file, so the NAS job still copies exactly three files.
- scan-setar-classes, scan-cgs-course and scan-khonyagar-course check their output before reading the source, and again before writing. The output's parent must exist. The NFC-normalised realpaths of that parent and of `--root` must not place the output at or under the root. An existing output must be a regular file, not a link, that is recognisably that scanner's own previous output: a JSON index whose `format` is `setar-archive-index`, or a file opening with that scanner's `// GENERATED BY scripts/scan-….mjs` header. Otherwise the scanner refuses, exits non-zero and changes nothing. A write atomically replaces the scanner's own output: an exclusively created (`wx`) temp file in the same directory, renamed onto the output, so a link or hard link there is never written through. A scanner never deletes, renames or overwrites any other file.
- The course scanners resolve their default `--out` from the script's own location, never the CWD.
- All operator scripts (the three scanners, publish-setar-index.mjs, nas-mirror.mjs) detect a direct run by REAL path. Run through a symlinked path, they still run; never a silent exit 0. The course scanners run `main()` only when executed directly. publish-setar-index.mjs changes in that line only.
- run-setar-index.sh no longer creates directories; a missing work directory fails before anything is written.
- Scanner output for the same input stays byte-identical.

3. APP FLOWS. No code change; two tests pin them. The CSP the build actually injects has no NAS origin. A degraded archive index followed by the full one restores the graph exactly and leaves owner records untouched.

4. RESIDUE.
- Remove `removeCatalogItem` and its two test callers; use `removeFromPathway`, and keep the test titles byte-identical.
- Keep the Keyboard trace, the viewport guard, the standalone 100vh shell and the interactive-widget meta.
- Record the review outcome and its reasons in DECISIONS.md.

5. DOCS.
- New docs/nas-topology.md is the one short map: devices, shares, links, served origins, the Drive pairing, the indexer runtime, GitHub branches, who writes where, and what propagates.
- It also covers which testing route proves what: plain-http LAN, localhost, the HTTPS mirror, and Pages. Service-worker support from a self-signed origin is stated as unverified unless observed.
- It says the mirror is a separate origin and database that must not be connected to the real data repo while it runs an unmerged branch.
- It gives three read-only commands for when something looks wrong: course regeneration to a temp `--out`, a Setar scan to stdout, and a media fingerprint.
- Facts carry their date and source. A DSM-side fact the builder cannot measure is marked "owner to confirm (ac-11)", never asserted. No credential appears.
- README, AGENTS.md and DECISIONS.md point to it. In AGENTS.md, the deploy paragraph and the removeCatalogItem sentence are replaced in place, and the file gets smaller overall.
- docs/setar-archive.md gets the §5 route and §4's re-copy note (still three files). It also gets a DATED post-recovery observation, taken from the planning measurements above and placed beside the 2026-09-17 baseline, not replacing it. That observation notes the empty session-40 folder and the six unexplained names as owner follow-ups.
- docs/repertoire-experience.md: the ac-24 route note. docs/khonyagar-course.md: the dated NFD re-measurement.

6. BUILDER CONSTRAINTS.
- Tests use mkdtemp trees only and never read or write /Volumes or any share. Every spawned scanner gets an explicit mkdtemp `--root`, and no test passes `--write` without an explicit mkdtemp `--out`. Spawned scripts run with an environment stripped of `PC_INDEX_*`.
- Never run the mirror, a scanner with `--write`, or run-setar-index.sh against real paths.
- Never regenerate courseData.ts, khonyagarData.ts or any fixture.
- The builder does not inspect /Volumes; the doc's observations come from the planning measurements above, and real-path checks are the owner's.

7. PROOF ROUTE (family plan). Run `npx vitest run tests/owned-writes.test.ts src/domain/scanSetarClasses.test.ts src/domain/sourceReconcile.test.ts tests/repertoire-families.test.ts`.
- Invariants:
  - I1: the mirror changes nothing it did not write.
  - I2: scanners replace only their own output and never write inside what they read.
  - I3: operator scripts never exit 0 without running.
  - I4: the app has no write channel to the NAS.
  - I5: a transient narrower archive changes no owner record.
- Expected outcomes are hand-authored per scenario. Inventories (path, type, size, mtime, sha256, link target) come from the test's own walker, over the destination, its parent and a sibling media fixture.
- Limits: no SMB server-side links, Drive propagation, DSM Node, real NAS or iPhone. Those are the owner checks.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Owner report: `/Volumes/web/practice-compass` exposes `homes/ethan/SNDK/video-courses`. Whether that is a DSM symlink, a shared-folder mapping or a Web Station root is the owner's to confirm (ac-11); the design does not depend on it.
- Synology Drive pairs `/Volumes/Sandisk` with NAS `homes/ethan/SNDK` two-way, and the NAS Setar indexer runs about every 15 minutes from three copied files (the previous lane's owner statement).
- The six unexplained Setar names look like unlogged manual renames, not losses: fuller names sit beside them on disk, and the logged renames end 2026-09-20/21. They are recorded as owner follow-ups; this lane decides nothing about them.
- iOS may refuse to open a self-signed mirror as an installed app. If so, the production install stands in for the keyboard check, since this lane cannot change layout code.

**Possible conflicts**

- Removing `npm run deploy` breaks muscle memory and any note telling an agent to run it; that is intended.
- The NAS keeps running its old copies until the owner re-copies the three files. A valid config behaves identically; a custom `PC_INDEX_WORKDIR` that does not exist now fails instead of being created.
- `setar-classes/undo-rename.sh` would rename about 180 media files if run, breaking stored references. This lane records it and never runs, moves or deletes it.
- A mirror is a separate origin with its own IndexedDB: practice entered there stays there. Connecting it to the real data repo while it runs an unmerged schema could publish a snapshot production refuses.
- AGENTS.md has a byte budget, so its edits must leave it smaller overall.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Review the current Practice Compass repo from first principles and produce one import-ready HEAVY lane for the remaining issues and any closely related improvements genuinely required after the recently completed repertoire/UI work.\n\nTreat these mainly as observed symptoms, not prescribed solutions:\n\n- `scripts/deploy-nas.sh` caused serious data loss when deploying the app: its target appeared to be `/Volumes/web/practice-compass`, but that path ultimately exposed the real Setar/Tar media tree (`home/SNDK/video-courses`). Deployment deleted files that were not part of `dist/`, and Synology Drive propagated those deletions to the Sandisk mirror. Most data has since been recovered manually. The deployment path remains unsafe and should not be used as-is.\n- The relationship between the app build, NAS-served app, NAS media, Synology Drive/Sandisk mirrors, indexers and any filesystem links/aliases is evidently easier to misunderstand than it should be. Investigate the actual topology and failure modes rather than assuming paths are independent.\n- Review whether any temporary diagnostics, workarounds, warnings, viewport tracing, compatibility code, stale documentation or other residue from the previous lane should now be retained, simplified or removed.\n- Review the current repo for other unfinished, inconsistent or fragile behaviour exposed by the recent work, including data integrity, persistence/migrations, repertoire/pathway identity, Study Sources, musical vocabulary, Setar/Tar media access, mobile/PWA behaviour, navigation/context preservation and recovery/failure paths. Include something only where investigation shows a real remaining need.\n- Verify that recovered/restored media and existing owner data are never modified, renamed, deleted or silently reclassified by maintenance, deployment, indexing or application flows.\n\nDo not assume my suggested direction is optimal. Inspect the code, scripts, docs, configuration and relevant history and choose the smallest coherent design that fixes the underlying problems rather than individual examples.\n\nPlan defensively so this does not become another long builder/reviewer loop (the followings are suggestions only. feel free to disregard the following if not optimal):\n- identify the underlying invariant/failure family behind each issue;\n- trace every writer, reader, migration, command and UI entry point that can violate it;\n- include counterexamples, negative cases, retries/interruption cases and cross-feature interactions in acceptance;\n- make destructive operations fail closed and prove their safety before they can touch real data;\n- distinguish what automation can prove from what requires OWNER/device/NAS verification;\n- make manual acceptance steps precise and executable before review;\n- require tests to cover the invariant family rather than only the originally reported example;\n- account for symlinks/aliases/mounts, sync propagation, stale state, partially restored data and unexpected environment configuration where relevant;\n- preserve all owner data and existing working behaviour;\n- avoid speculative architecture and unrelated refactors.\n\nBefore finalising the plan, actively look for scope holes or plausible reviewer counterexamples and revise the plan to close them.",
  "builder": "claude",
  "summary": "Make NAS deployment and media tooling fail closed, map the real NAS topology, and settle last lane's residue",
  "rationale": "THESIS — one invariant, every writer near the media. On this setup a path's name says nothing about what it reaches: `/Volumes/web/practice-compass` reached the media tree through the NAS side; SMB presents a server-side link as an ordinary folder, so no check on the Mac can see it; and Synology Drive carries any deletion between the NAS and `/Volumes/Sandisk`. `deploy-nas.sh` trusted a path with `rsync --delete`. The scanners, the NAS runner and the operator scripts' start-up check trust paths in milder ways. So every repository tool may change only what it can prove it wrote — proven by content it wrote, never by a path — never deletes, never writes inside what it reads, and never fails silently. Only the owner writes media.\n\nKEY CHOICES. Keep a mirror rather than retire it: it is the only HTTPS route that puts an unmerged build on the phone, and this lane's owner check uses it to complete the installed-app half of ac-24. No deletion at all, and every write an atomic replacement of a path the tool owns: deletion and write-through are the only ways a tool here can destroy something, and stale hashed assets cost nothing. Positive ownership (a folder the tool created, or its marker plus a claims journal); realpath is defence in depth only. Scanner guards stay inline, because the NAS job is installed by copying exactly three files. App flows get proofs, not changes: the injected CSP gives them no channel to a NAS origin, and an index from a partial restore is already reversible.\n\nRESIDUE REVIEW. Retained: Keyboard trace (the fallback diagnostic if that check fails), viewport guard, standalone 100vh shell, interactive-widget meta (the owner-passed configuration). Removed: `removeCatalogItem` (no production caller). Replaced by one measured topology doc: every recommendation of, or warning about, `deploy-nas.sh`, and the stale topology and filename-normalisation claims. Left out as different families with no new evidence of owner impact: Sync's raw plain-http error, QuickAdd/insights instrument-name direction, the unwired `readIndexFile`.",
  "kind": "technical",
  "currentBehaviour": "Read-only measurements while planning, 2026-10-01 at 25d6767. Baseline is the unit suite only (`npx vitest run src`: 41 files, 423 tests green); browser journeys were not run.\n\nDEPLOY. `npm run deploy` runs `scripts/deploy-nas.sh`. DEST defaults to `/Volumes/web/practice-compass` (or `PC_DEPLOY_DIR`), and only the parent's existence is checked. It then builds and runs `rsync -rv --delete dist/ DEST/`. On 2026-09-30 that DEST exposed `homes/ethan/SNDK/video-courses`, and the deletions reached `/Volumes/Sandisk` through Synology Drive (`.SynologyWorkingDirectory` sits at the drive root). `https://192.168.0.20/practice-compass/` answers 403, as it did on 2026-09-18, so the mirror was never seen serving the app. docs/setar-archive.md §5 still recommends `npm run deploy` as the phone HTTPS route. README, AGENTS.md and docs/repertoire-experience.md only warn, and AGENTS.md says guarding it 'needs its own lane'.\n\nSCANNERS AND OPERATOR SCRIPTS. `writeIndexAtomically` (scan-setar-classes.mjs) refuses an `--out` only when it is lexically under `--root`, and renames over any existing file. scan-cgs-course.mjs and scan-khonyagar-course.mjs `--write` call `fs.writeFileSync(out)` with no guard: a symlink is followed, any file replaced, the default `--out` resolves against the CWD, and `main()` runs on import. run-setar-index.sh runs `mkdir -p \"$WORK\"` before anything checks it. scan-setar-classes.mjs and publish-setar-index.mjs start `main()` only when `import.meta.url` equals `pathToFileURL(process.argv[1])`. Invoked through a symlinked directory (DSM's `/var/services/homes` and `/var/services/web` are symlinks), that comparison fails and the script exits 0 having done nothing. A scratch script using that same check reproduced the skip while planning (the real scripts were not run that way), and on the NAS it would turn the unattended indexer into a silent no-op.\n\nAPP. The app has no write path to the NAS: media is opened by link, and the injected CSP allows connect-src only 'self' and https://api.github.com. Nothing tests that. A narrower archive index flags missing rows `unavailable` and the full one clears them; only the piece case is tested. A scratch run while planning showed resources and sessions round-trip exactly too.\n\nRESIDUE. `removeCatalogItem` is a non-deleting store alias with no production caller, kept only for tests/repertoire-families.test.ts and src/store/archiveIndex.test.ts. More → Keyboard trace is opt-in and memory-only; ac-24 passed on one iPhone over plain http only.\n\nRESTORED MEDIA. The CGS and Khonyagar scanners regenerate courseData.ts and khonyagarData.ts byte-identically from `/Volumes/Sandisk` (to a scratch `--out`). Khonyagar on the NAS lists 259 mp4, 4 pdf and 2 md, all NFC. The Sandisk copy now has 0 NFD names, where docs/khonyagar-course.md says 78. A fresh Setar scan gives 39 sessions with files, 104 pieces, 133 useful resources, 270 renames, 0 diagnostics, contentHash 5f303d4db445. `session-40-29-09-2026` exists and is EMPTY on both sides. Six fixture-era Setar resource names (sessions 23, 28, 38) resolve through no logged rename. `tar-classes/_recovered-2026-09-30-unnamed/` exists. `setar-classes/undo-rename.sh`, an executable `mv` script, sits inside the served, Drive-synced archive.",
  "desiredBehaviour": "1. NAS MIRROR. A Node-stdlib `scripts/nas-mirror.mjs` replaces `scripts/deploy-nas.sh`, and the `deploy` npm script is removed.\n- Usage: `node scripts/nas-mirror.mjs --dest <folder> [--base /<path>/] [--apply]`. There is no default destination, and `PC_DEPLOY_DIR` is not read. Without `--apply` it writes nothing and prints the absolute destination, its parent's first entries, and what it would create or replace.\n- OWNERSHIP is positive and proven by content. A destination is the tool's only if the tool created it, or it holds the tool's marker `.practice-compass-mirror.json`, whose claims journal lists every path the tool ever claimed. \"Created\" means it was absent and was made non-recursively under an existing parent. An existing folder without a valid marker is refused, even when it is empty.\n- FAIL-CLOSED INSPECTION. A walk that never follows links may find only: the marker and its own temp files, claimed files, directories holding claimed files, and housekeeping it never touches (`.DS_Store`, `._*`, `@eaDir/`, `#recycle/`). Anything else refuses and is named: an unclaimed file; any entry that is neither a regular file nor a directory (symlink, FIFO, socket, device); a claimed path of the wrong type; an entry it cannot read.\n- A malformed marker also refuses: bad JSON, the wrong tool, or a claim that is not a string, is absolute, has an empty, `.` or `..` segment, or would resolve outside the destination.\n- The build output gets the same sweep before anything is written. It may contain only regular files and directories with safe relative names, and nothing using the marker or temp names. Housekeeping in it is skipped.\n- It refuses a destination that is itself a symlink. This is `lstat` on the destination entry only; ancestors are not inspected, so macOS `/var` → `/private/var` and DSM's `/var/services` still work. It also refuses a destination nested in, or containing, the build folder.\n- Defence in depth, never the proof: it refuses to CREATE a folder whose parent holds a media marker (`setar-classes`, `tar-classes`, `classical-guitar`, `PIECES.csv`, `.SynologyWorkingDirectory`).\n- WRITES ARE ATOMIC REPLACEMENTS OF PATHS IT OWNS. Before creating anything, the tool journals every path it will create, including each uniquely named temp file. The marker's own temp uses a fixed name prefix and is the only unjournaled name. Each write:\n  1. creates its temp exclusively (`wx`), so it can never open an existing entry or follow a link;\n  2. checks with `lstat` that every component between the destination and the target is a real directory;\n  3. renames the temp onto the owned path. A rename replaces the entry itself, so neither a symlink nor a hard link is ever written through.\n- It never deletes anything, and never renames, moves or overwrites a path it does not own. Temp files left by an interruption are its own and are simply left.\n- Order:\n  1. Check ownership.\n  2. Build: `npm run build` with `PC_BASE` set to `--base`, or to `/<folder name>/` when `--base` is absent. A folder name outside `[A-Za-z0-9._-]` requires `--base`.\n  3. Sweep the build.\n  4. Check ownership again.\n  5. Create the folder if it is absent.\n  6. Write the marker (the journal), then the build files.\n- A failed build, a refusal or a dry-run writes nothing anywhere. Re-running completes a publish interrupted after its journal. A first publish interrupted before its marker exists is refused, with a message naming that folder as the mirror's own unfinished one for the owner to delete and publish again.\n- Stale files from older builds stay; to clear them, the owner deletes the folder they created and publishes again. One run at a time; a lost claim surfaces as a refusal.\n- The decision, the writer and the build step are exported and injectable, so tests never run Vite or touch a real share.\n\n2. SCANNERS AND OPERATOR SCRIPTS. Each guard is inline in its own file, so the NAS job still copies exactly three files.\n- scan-setar-classes, scan-cgs-course and scan-khonyagar-course check their output before reading the source, and again before writing. The output's parent must exist. The NFC-normalised realpaths of that parent and of `--root` must not place the output at or under the root. An existing output must be a regular file, not a link, that is recognisably that scanner's own previous output: a JSON index whose `format` is `setar-archive-index`, or a file opening with that scanner's `// GENERATED BY scripts/scan-….mjs` header. Otherwise the scanner refuses, exits non-zero and changes nothing. A write atomically replaces the scanner's own output: an exclusively created (`wx`) temp file in the same directory, renamed onto the output, so a link or hard link there is never written through. A scanner never deletes, renames or overwrites any other file.\n- The course scanners resolve their default `--out` from the script's own location, never the CWD.\n- All operator scripts (the three scanners, publish-setar-index.mjs, nas-mirror.mjs) detect a direct run by REAL path. Run through a symlinked path, they still run; never a silent exit 0. The course scanners run `main()` only when executed directly. publish-setar-index.mjs changes in that line only.\n- run-setar-index.sh no longer creates directories; a missing work directory fails before anything is written.\n- Scanner output for the same input stays byte-identical.\n\n3. APP FLOWS. No code change; two tests pin them. The CSP the build actually injects has no NAS origin. A degraded archive index followed by the full one restores the graph exactly and leaves owner records untouched.\n\n4. RESIDUE.\n- Remove `removeCatalogItem` and its two test callers; use `removeFromPathway`, and keep the test titles byte-identical.\n- Keep the Keyboard trace, the viewport guard, the standalone 100vh shell and the interactive-widget meta.\n- Record the review outcome and its reasons in DECISIONS.md.\n\n5. DOCS.\n- New docs/nas-topology.md is the one short map: devices, shares, links, served origins, the Drive pairing, the indexer runtime, GitHub branches, who writes where, and what propagates.\n- It also covers which testing route proves what: plain-http LAN, localhost, the HTTPS mirror, and Pages. Service-worker support from a self-signed origin is stated as unverified unless observed.\n- It says the mirror is a separate origin and database that must not be connected to the real data repo while it runs an unmerged branch.\n- It gives three read-only commands for when something looks wrong: course regeneration to a temp `--out`, a Setar scan to stdout, and a media fingerprint.\n- Facts carry their date and source. A DSM-side fact the builder cannot measure is marked \"owner to confirm (ac-11)\", never asserted. No credential appears.\n- README, AGENTS.md and DECISIONS.md point to it. In AGENTS.md, the deploy paragraph and the removeCatalogItem sentence are replaced in place, and the file gets smaller overall.\n- docs/setar-archive.md gets the §5 route and §4's re-copy note (still three files). It also gets a DATED post-recovery observation, taken from the planning measurements above and placed beside the 2026-09-17 baseline, not replacing it. That observation notes the empty session-40 folder and the six unexplained names as owner follow-ups.\n- docs/repertoire-experience.md: the ac-24 route note. docs/khonyagar-course.md: the dated NFD re-measurement.\n\n6. BUILDER CONSTRAINTS.\n- Tests use mkdtemp trees only and never read or write /Volumes or any share. Every spawned scanner gets an explicit mkdtemp `--root`, and no test passes `--write` without an explicit mkdtemp `--out`. Spawned scripts run with an environment stripped of `PC_INDEX_*`.\n- Never run the mirror, a scanner with `--write`, or run-setar-index.sh against real paths.\n- Never regenerate courseData.ts, khonyagarData.ts or any fixture.\n- The builder does not inspect /Volumes; the doc's observations come from the planning measurements above, and real-path checks are the owner's.\n\n7. PROOF ROUTE (family plan). Run `npx vitest run tests/owned-writes.test.ts src/domain/scanSetarClasses.test.ts src/domain/sourceReconcile.test.ts tests/repertoire-families.test.ts`.\n- Invariants:\n  - I1: the mirror changes nothing it did not write.\n  - I2: scanners replace only their own output and never write inside what they read.\n  - I3: operator scripts never exit 0 without running.\n  - I4: the app has no write channel to the NAS.\n  - I5: a transient narrower archive changes no owner record.\n- Expected outcomes are hand-authored per scenario. Inventories (path, type, size, mtime, sha256, link target) come from the test's own walker, over the destination, its parent and a sibling media fixture.\n- Limits: no SMB server-side links, Drive propagation, DSM Node, real NAS or iPhone. Those are the owner checks.",
  "mustNotChange": [
    "No file or folder in any media tree (NAS `homes/ethan/SNDK/video-courses`, `/Volumes/Sandisk`) is written, renamed, moved or deleted by anything in this lane, including `undo-rename.sh`, `_recovered-2026-09-30-unnamed/` and the existing `/volume1/web/practice-compass` link.",
    "Scanner output for the same input: courseData.ts, khonyagarData.ts and the Setar index bytes and contentHash.",
    "publish-setar-index.mjs publishing logic and its one-branch, one-path restriction; only its direct-run check changes.",
    "App data model and behaviour: schema v15, migrations, every inbound validation door, sync, backup, archive refresh, the Settings media base and the CSP.",
    "The owner-passed shell: Keyboard trace, viewport guard, standalone 100vh CSS, interactive-widget meta.",
    "GitHub Pages deployment, and every existing test title (including the previous lane's mapping in scripts/check-repertoire-families.mjs)."
  ],
  "assumptions": [
    "Owner report: `/Volumes/web/practice-compass` exposes `homes/ethan/SNDK/video-courses`. Whether that is a DSM symlink, a shared-folder mapping or a Web Station root is the owner's to confirm (ac-11); the design does not depend on it.",
    "Synology Drive pairs `/Volumes/Sandisk` with NAS `homes/ethan/SNDK` two-way, and the NAS Setar indexer runs about every 15 minutes from three copied files (the previous lane's owner statement).",
    "The six unexplained Setar names look like unlogged manual renames, not losses: fuller names sit beside them on disk, and the logged renames end 2026-09-20/21. They are recorded as owner follow-ups; this lane decides nothing about them.",
    "iOS may refuse to open a self-signed mirror as an installed app. If so, the production install stands in for the keyboard check, since this lane cannot change layout code."
  ],
  "possibleConflicts": [
    "Removing `npm run deploy` breaks muscle memory and any note telling an agent to run it; that is intended.",
    "The NAS keeps running its old copies until the owner re-copies the three files. A valid config behaves identically; a custom `PC_INDEX_WORKDIR` that does not exist now fails instead of being created.",
    "`setar-classes/undo-rename.sh` would rename about 180 media files if run, breaking stored references. This lane records it and never runs, moves or deletes it.",
    "A mirror is a separate origin with its own IndexedDB: practice entered there stays there. Connecting it to the real data repo while it runs an unmerged schema could publish a snapshot production refuses.",
    "AGENTS.md has a byte budget, so its edits must leave it smaller overall."
  ],
  "scope": {
    "allow": [
      "scripts/deploy-nas.sh",
      "scripts/nas-mirror.mjs",
      "scripts/scan-setar-classes.mjs",
      "scripts/scan-cgs-course.mjs",
      "scripts/scan-khonyagar-course.mjs",
      "scripts/publish-setar-index.mjs",
      "scripts/run-setar-index.sh",
      "package.json",
      "tests/owned-writes.test.ts",
      "src/domain/scanSetarClasses.test.ts",
      "src/domain/sourceReconcile.test.ts",
      "src/store/useStore.ts",
      "src/store/archiveIndex.test.ts",
      "tests/repertoire-families.test.ts",
      "AGENTS.md",
      "README.md",
      "DECISIONS.md",
      "docs/nas-topology.md",
      "docs/setar-archive.md",
      "docs/repertoire-experience.md",
      "docs/khonyagar-course.md"
    ],
    "forbid": [
      ".prismatica/**",
      ".github/**",
      ".agents/**",
      ".codex/**",
      "tests/fixtures/**",
      "src/domain/courseData.ts",
      "src/domain/khonyagarData.ts",
      "vite.config.ts",
      "index.html",
      "src/styles/global.css",
      "src/components/useViewportGuard.ts",
      "src/components/viewport.ts",
      "src/pages/More.tsx",
      "src/domain/sourceArchive.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/recordings.ts",
      "src/domain/mediaRoots.ts",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/types.ts",
      "src/domain/canonical.ts",
      "src/store/githubSync.ts",
      "src/store/syncEngine.ts",
      "src/store/backup.ts",
      "src/store/archiveIndex.ts"
    ]
  },
  "exclusions": [
    "Any NAS/DSM infrastructure or configuration change is excluded: Web Station, Tailscale, Synology Drive, Task Scheduler, shares, permissions or links, including removing or repointing `/volume1/web/practice-compass`. The lane only documents it. Allowed during the owner checks: publishing the mirror into one new app-only folder, and copying the updated lane-owned indexer files (scan-setar-classes.mjs, publish-setar-index.mjs, run-setar-index.sh) into their existing NAS runtime directory.",
    "Any write, rename, move, restore or delete inside a media tree, including `undo-rename.sh` and recovering the six unexplained Setar names or session 40. Those are recorded as owner follow-ups only.",
    "Automatic cleanup of old mirror files; the mirror never deletes.",
    "Changing or removing the Keyboard trace, the viewport guard, the standalone shell height or the interactive-widget meta.",
    "Sync's raw error over plain http, QuickAdd and insights.ts instrument-name direction, and the unwired `readIndexFile` fallback. These are separate families for their own lanes.",
    "In-app media verification, or any NAS origin in the CSP.",
    "Branch-preview hosting, or any change to GitHub Pages deployment.",
    "Re-baselining the 2026-09-17 Setar corpus table."
  ],
  "acceptance": [
    {
      "description": "A hand-authored scenario table runs each case in a fresh mkdtemp tree beside a sibling 'media' fixture. Destination cases are refused before building: no --dest; a missing parent; an existing EMPTY folder with no marker (the shape of the empty session-40 folder), or one holding only the marker's temp; an unmarked folder holding media; a destination whose own entry is a symlink (lstat) to the media fixture or to an empty folder; a marked folder plus one unclaimed file, a symlink, a FIFO, or a claimed path that is now a directory; a marker that is malformed JSON, names another tool, or claims an absolute, `..` or outside-resolving path; a destination nested in, or containing, the build folder; creating a folder beside `setar-classes`, `PIECES.csv` or `.SynologyWorkingDirectory`. Build cases are refused after building but before any write: an injected build containing a symlink, a FIFO, or the marker's name. Each refuses, names the offending entry and exits non-zero. With and without --apply, the destination, its parent and the media fixture keep an identical inventory (path, type, size, mtime, sha256, link target).",
      "test": "the NAS mirror refuses every destination it cannot prove it owns"
    },
    {
      "description": "With an injected build: a dry-run writes nothing and reports the destination, the parent's entries and the plan. --apply creates the folder, journals every path (temps included) before writing, and leaves the build byte-identical under the derived base. A second publish of a changed build replaces only claimed files, by exclusive temp + rename. It keeps every earlier file and leaves `.DS_Store`, `._*`, `@eaDir/` and `#recycle/` untouched. A third identical publish changes nothing. A claimed file that is a hard link to a media-fixture file is replaced without changing the media file. A claimed file swapped for a symlink after the final check is replaced, never written through. A failing build creates and writes nothing. `--base` overrides the derived base, and an unsafe folder name without it is refused. Nothing outside the destination changes.",
      "test": "the NAS mirror writes only inside a folder it created and never deletes"
    },
    {
      "description": "A copy step fails after the journal and part of the files, leaving temp files behind. Re-running with the same build finishes byte-identical to an uninterrupted publish and adopts no unclaimed file; a publish interrupted after its journal never locks the owner out. A first publish interrupted before its marker exists is refused, with a message naming the folder as the mirror's own unfinished one.",
      "test": "an interrupted NAS mirror publish completes when run again"
    },
    {
      "description": "Refusals go through each real CLI (scan-setar-classes, scan-cgs-course, scan-khonyagar-course) with mkdtemp roots only. These all exit non-zero before the source is read and leave every byte identical: an --out inside --root reached through a symlinked parent, an existing foreign file, and a symlink to a foreign file. Through the exported writer, a new file and the scanner's own previous output are accepted and replaced by exclusive temp + rename, so the other name of a hard-linked output keeps its old bytes. The course scanners' default target is observed without `--write` (through an exported resolver, or the path printed before scanning) to resolve from the script, never the CWD. A run whose CWD is a media fixture leaves a foreign file planted under that CWD untouched. No test passes `--write` without an explicit mkdtemp `--out`.",
      "test": "every scanner refuses an output it cannot prove is its own"
    },
    {
      "description": "Each of scan-setar-classes.mjs, publish-setar-index.mjs, scan-cgs-course.mjs, scan-khonyagar-course.mjs and nas-mirror.mjs is spawned through a symlinked directory with missing or invalid arguments, with every scanner given an explicit mkdtemp `--root` and an environment stripped of `PC_INDEX_*`. Each actually runs, printing its usage or refusal and exiting non-zero, instead of exiting 0 having done nothing; importing a course scanner does not run it.",
      "test": "every operator script runs when invoked through a symlinked path"
    },
    {
      "description": "The existing Setar scanner family still holds after the guard. The same archive yields byte-identical index text and contentHash, the archive is untouched, and the in-archive output refusal now holds through realpath. The test is adapted, with its title unchanged.",
      "test": "setar scanning is bounded read-only and produces stable complete indexes"
    },
    {
      "description": "The degraded index is missing resources, a whole session and a piece, as after a partial restore; the full index is then applied again. Sessions, resources and pieces end deep-equal to the never-degraded graph, with no `unavailable` flags. Items, lessons (recordings included), blocks, reviews, agenda and suppressions stay unchanged throughout, and no item is created.",
      "test": "a degraded archive index followed by the full one restores the source graph exactly"
    },
    {
      "description": "This checks the CSP the build actually injects (the cspPlugin output, not a copied string): connect-src allows only 'self' and https://api.github.com, form-action only 'self', and no frames. So no application flow has a channel that could write to a NAS origin.",
      "test": "the production build can reach only its own origin and the GitHub API"
    },
    {
      "description": "With `removeCatalogItem` gone from the store, the same lossless removal holds through `removeFromPathway`. 'archive deletions and unlinking remain respected after refresh and reload' stays green, tsc finds no remaining caller, and the test titles are unchanged.",
      "test": "pathway removal keeps enriched and never practised owner items"
    },
    {
      "description": "Mac and iPhone, about ten minutes, with no fingerprints or traces unless a step fails. (1) With the `web` share mounted, run `node scripts/nas-mirror.mjs --dest /Volumes/web/practice-compass` without --apply: it refuses, naming a media entry. (2) Publish this final build to a new app-only folder, dry-run first and then --apply. It opens over https on the Mac with this commit's build stamp in Settings. (3) On the iPhone, install it from that URL (Safari, accept the certificate, Add to Home Screen) and open the installed app. Type in a field, dismiss the keyboard, and rotate once and back: the bottom bar stays flush and the typed text is retained. If iOS will not open the self-signed mirror as an installed app, the production install stands in, since this lane cannot change layout code. Only if a step fails, capture More → Keyboard trace (step 3) or the doc's fingerprint command (steps 1-2). The mirror is never connected to the real data repo.",
      "test": "manual:OWNER"
    },
    {
      "description": "DSM, about five minutes. Copy the three updated lane-owned files (scan-setar-classes.mjs, publish-setar-index.mjs, run-setar-index.sh) into the existing NAS runtime directory and run the Setar task once by hand. It must finish without error, reporting 'Index unchanged — no commit.' or one publish. In the same session, confirm or have corrected the few 'owner to confirm' lines in docs/nas-topology.md: the Web Station roots, the Drive pairing, the task and its runtime directory, and that `config.env` sits outside every served or synced share. Nothing else on the NAS changes.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "HEAVY. The lane changes the only tools that can write next to the owner's media: the NAS publisher, three scanners, the Setar publisher's start-up check and the unattended NAS runner. It also removes a store action. The hazards are destroying or polluting media or owner data, silently disabling or breaking the indexer, changing scanner output, and docs that assert unmeasured topology. Proof is a temp-dir family route with independent inventories, plus two short owner checks on the real NAS and iPhone. Nothing is exercised against real media except a read-only dry-run."
  },
  "desiredRules": [
    "Repository tools change only paths they can prove they own, proven by content they wrote and never by a path's name. They may atomically replace their own files, but never delete anything and never rename, move or overwrite an owner's or unclaimed file, wherever a path resolves. An operator script never reports success without having run."
  ],
  "docsDelta": [
    "AGENTS.md",
    "README.md",
    "DECISIONS.md",
    "docs/nas-topology.md",
    "docs/setar-archive.md",
    "docs/repertoire-experience.md",
    "docs/khonyagar-course.md"
  ]
}
```
````


## Files in this diff

- AGENTS.md
- DECISIONS.md
- README.md
- docs/khonyagar-course.md
- docs/nas-topology.md
- docs/repertoire-experience.md
- docs/setar-archive.md
- package.json
- scripts/deploy-nas.sh
- scripts/nas-mirror.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- scripts/scan-cgs-course.mjs
- scripts/scan-khonyagar-course.mjs
- scripts/scan-setar-classes.mjs
- src/domain/scanSetarClasses.test.ts
- src/domain/sourceReconcile.test.ts
- src/store/archiveIndex.test.ts
- src/store/useStore.ts
- tests/owned-writes.test.ts
- tests/repertoire-families.test.ts

## Check against the contract

- [ ] **ac-1** — A hand-authored scenario table runs each case in a fresh mkdtemp tree beside a sibling 'media' fixture. Destination cases are refused before building: no --dest; a missing parent; an existing EMPTY folder with no marker (the shape of the empty session-40 folder), or one holding only the marker's temp; an unmarked folder holding media; a destination whose own entry is a symlink (lstat) to the media fixture or to an empty folder; a marked folder plus one unclaimed file, a symlink, a FIFO, or a claimed path that is now a directory; a marker that is malformed JSON, names another tool, or claims an absolute, `..` or outside-resolving path; a destination nested in, or containing, the build folder; creating a folder beside `setar-classes`, `PIECES.csv` or `.SynologyWorkingDirectory`. Build cases are refused after building but before any write: an injected build containing a symlink, a FIFO, or the marker's name. Each refuses, names the offending entry and exits non-zero. With and without --apply, the destination, its parent and the media fixture keep an identical inventory (path, type, size, mtime, sha256, link target). _(proof: the NAS mirror refuses every destination it cannot prove it owns)_
- [ ] **ac-2** — With an injected build: a dry-run writes nothing and reports the destination, the parent's entries and the plan. --apply creates the folder, journals every path (temps included) before writing, and leaves the build byte-identical under the derived base. A second publish of a changed build replaces only claimed files, by exclusive temp + rename. It keeps every earlier file and leaves `.DS_Store`, `._*`, `@eaDir/` and `#recycle/` untouched. A third identical publish changes nothing. A claimed file that is a hard link to a media-fixture file is replaced without changing the media file. A claimed file swapped for a symlink after the final check is replaced, never written through. A failing build creates and writes nothing. `--base` overrides the derived base, and an unsafe folder name without it is refused. Nothing outside the destination changes. _(proof: the NAS mirror writes only inside a folder it created and never deletes)_
- [ ] **ac-3** — A copy step fails after the journal and part of the files, leaving temp files behind. Re-running with the same build finishes byte-identical to an uninterrupted publish and adopts no unclaimed file; a publish interrupted after its journal never locks the owner out. A first publish interrupted before its marker exists is refused, with a message naming the folder as the mirror's own unfinished one. _(proof: an interrupted NAS mirror publish completes when run again)_
- [ ] **ac-4** — Refusals go through each real CLI (scan-setar-classes, scan-cgs-course, scan-khonyagar-course) with mkdtemp roots only. These all exit non-zero before the source is read and leave every byte identical: an --out inside --root reached through a symlinked parent, an existing foreign file, and a symlink to a foreign file. Through the exported writer, a new file and the scanner's own previous output are accepted and replaced by exclusive temp + rename, so the other name of a hard-linked output keeps its old bytes. The course scanners' default target is observed without `--write` (through an exported resolver, or the path printed before scanning) to resolve from the script, never the CWD. A run whose CWD is a media fixture leaves a foreign file planted under that CWD untouched. No test passes `--write` without an explicit mkdtemp `--out`. _(proof: every scanner refuses an output it cannot prove is its own)_
- [ ] **ac-5** — Each of scan-setar-classes.mjs, publish-setar-index.mjs, scan-cgs-course.mjs, scan-khonyagar-course.mjs and nas-mirror.mjs is spawned through a symlinked directory with missing or invalid arguments, with every scanner given an explicit mkdtemp `--root` and an environment stripped of `PC_INDEX_*`. Each actually runs, printing its usage or refusal and exiting non-zero, instead of exiting 0 having done nothing; importing a course scanner does not run it. _(proof: every operator script runs when invoked through a symlinked path)_
- [ ] **ac-6** — The existing Setar scanner family still holds after the guard. The same archive yields byte-identical index text and contentHash, the archive is untouched, and the in-archive output refusal now holds through realpath. The test is adapted, with its title unchanged. _(proof: setar scanning is bounded read-only and produces stable complete indexes)_
- [ ] **ac-7** — The degraded index is missing resources, a whole session and a piece, as after a partial restore; the full index is then applied again. Sessions, resources and pieces end deep-equal to the never-degraded graph, with no `unavailable` flags. Items, lessons (recordings included), blocks, reviews, agenda and suppressions stay unchanged throughout, and no item is created. _(proof: a degraded archive index followed by the full one restores the source graph exactly)_
- [ ] **ac-8** — This checks the CSP the build actually injects (the cspPlugin output, not a copied string): connect-src allows only 'self' and https://api.github.com, form-action only 'self', and no frames. So no application flow has a channel that could write to a NAS origin. _(proof: the production build can reach only its own origin and the GitHub API)_
- [ ] **ac-9** — With `removeCatalogItem` gone from the store, the same lossless removal holds through `removeFromPathway`. 'archive deletions and unlinking remain respected after refresh and reload' stays green, tsc finds no remaining caller, and the test titles are unchanged. _(proof: pathway removal keeps enriched and never practised owner items)_
- [ ] **ac-10** — Mac and iPhone, about ten minutes, with no fingerprints or traces unless a step fails. (1) With the `web` share mounted, run `node scripts/nas-mirror.mjs --dest /Volumes/web/practice-compass` without --apply: it refuses, naming a media entry. (2) Publish this final build to a new app-only folder, dry-run first and then --apply. It opens over https on the Mac with this commit's build stamp in Settings. (3) On the iPhone, install it from that URL (Safari, accept the certificate, Add to Home Screen) and open the installed app. Type in a field, dismiss the keyboard, and rotate once and back: the bottom bar stays flush and the typed text is retained. If iOS will not open the self-signed mirror as an installed app, the production install stands in, since this lane cannot change layout code. Only if a step fails, capture More → Keyboard trace (step 3) or the doc's fingerprint command (steps 1-2). The mirror is never connected to the real data repo. _(proof: manual:OWNER)_
- [ ] **ac-11** — DSM, about five minutes. Copy the three updated lane-owned files (scan-setar-classes.mjs, publish-setar-index.mjs, run-setar-index.sh) into the existing NAS runtime directory and run the Setar task once by hand. It must finish without error, reporting 'Index unchanged — no commit.' or one publish. In the same session, confirm or have corrected the few 'owner to confirm' lines in docs/nas-topology.md: the Web Station roots, the Drive pairing, the task and its runtime directory, and that `config.env` sits outside every served or synced share. Nothing else on the NAS changes. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/store/useStore.ts
- **run-a-session-plan** — touched via src/store/useStore.ts
- **work-a-pathway-stage** — touched via src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

The only app-code change removes the unused store alias removeCatalogItem (no production caller; tsc finds none). No screen, route, entity field or behaviour changes; the rest of the diff is operator scripts, tests and docs.

## prepare-for-the-next-class — unchanged

The only app-code change removes the unused store alias removeCatalogItem (no production caller; tsc finds none). No screen, route, entity field or behaviour changes; the rest of the diff is operator scripts, tests and docs.

## see-practice-patterns — unchanged

The only app-code change removes the unused store alias removeCatalogItem (no production caller; tsc finds none). No screen, route, entity field or behaviour changes; the rest of the diff is operator scripts, tests and docs.

## install-the-app-and-keep-it-current — unchanged

The only app-code change removes the unused store alias removeCatalogItem (no production caller; tsc finds none). No screen, route, entity field or behaviour changes; the rest of the diff is operator scripts, tests and docs. GitHub Pages deployment, the CSP and the service worker are untouched; the new nas-mirror.mjs is an optional operator route for unmerged builds, not how the app is installed or updated.

## point-this-device-at-the-nas — unchanged

The only app-code change removes the unused store alias removeCatalogItem (no production caller; tsc finds none). No screen, route, entity field or behaviour changes; the rest of the diff is operator scripts, tests and docs. The Settings media base, its normalisation and every resolver are untouched; docs/nas-topology.md only documents the NAS paths.

## sync-devices-via-github — unchanged

The only app-code change removes the unused store alias removeCatalogItem (no production caller; tsc finds none). No screen, route, entity field or behaviour changes; the rest of the diff is operator scripts, tests and docs. Sync, its engine and the data repo layout are untouched; the Setar publisher changed only its direct-run check.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## The builder's family proof plan

The builder was asked for one before this review: Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Find
where its commit messages say it lives; subtle work without one, or a plan
whose expected results come only from the implementation under test, is a
finding.

## Close each family in this round

A counterexample is one instance of an invariant. For every finding: name the
invariant it breaks (its family), sweep the repository for every instance of
that invariant — each consumer, sibling function and caller, not only this
diff — and list every instance you found plus the consumers you checked and
found clean. One round that names the whole family saves a round per instance.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, make the hand-off self-contained: save your findings as ONE JSON array to EXACTLY this reserved file — if you are a Claude Code session, this lane's own scope hook allows writing only this one path outside the lane, so it is also the only place you CAN write it (a reviewer on a different provider's own sandbox is not covered by this):

`/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-make-nas-deployment-and-media-tooling-fa-3d7b/findings.json`

with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Then report two things verbatim: the exact temporary file path, and the exact command, using this change's own contract id (shown above as **Contract**): `prismatica seal <id> --request-changes --findings <that path>`. The owner should never have to reconstruct that JSON from your prose by hand.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
