---
id: 20261001-make-nas-deployment-and-media-tooling-fa-3d7b
title: Make NAS deployment and media tooling fail closed, map the real NAS
  topology, and settle last lane's residue
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/41
intent: 20261001-make-nas-deployment-and-media-tooling-fa-3d7b
tier: heavy
stage: ship
baseline:
  commit: 25d6767e8138593a9995ae16710cfaed35e380a6
  branch: main
branch: change/20261001-make-nas-deployment-and-media-tooling-fa-3d7b
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261001-make-nas-deployment-and-media-tooling-fa-3d7b
builder: claude
planHash: d0d52259e41c2906b7ec76fe07ba760e285b10a7c30d87da94c50168a0e51a54
allowedPaths:
  - scripts/deploy-nas.sh
  - scripts/nas-mirror.mjs
  - scripts/scan-setar-classes.mjs
  - scripts/scan-cgs-course.mjs
  - scripts/scan-khonyagar-course.mjs
  - scripts/publish-setar-index.mjs
  - scripts/run-setar-index.sh
  - package.json
  - tests/owned-writes.test.ts
  - src/domain/scanSetarClasses.test.ts
  - src/domain/sourceReconcile.test.ts
  - src/store/useStore.ts
  - src/store/archiveIndex.test.ts
  - tests/repertoire-families.test.ts
  - AGENTS.md
  - README.md
  - DECISIONS.md
  - docs/nas-topology.md
  - docs/setar-archive.md
  - docs/repertoire-experience.md
  - docs/khonyagar-course.md
forbiddenPaths:
  - .prismatica/**
  - .github/**
  - .agents/**
  - .codex/**
  - tests/fixtures/**
  - src/domain/courseData.ts
  - src/domain/khonyagarData.ts
  - vite.config.ts
  - index.html
  - src/styles/global.css
  - src/components/useViewportGuard.ts
  - src/components/viewport.ts
  - src/pages/More.tsx
  - src/domain/sourceArchive.ts
  - src/domain/sourceReconcile.ts
  - src/domain/recordings.ts
  - src/domain/mediaRoots.ts
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/types.ts
  - src/domain/canonical.ts
  - src/store/githubSync.ts
  - src/store/syncEngine.ts
  - src/store/backup.ts
  - src/store/archiveIndex.ts
nonGoals:
  - No file or folder in any media tree (NAS `homes/ethan/SNDK/video-courses`,
    `/Volumes/Sandisk`) is written, renamed, moved or deleted by anything in
    this lane, including `undo-rename.sh`, `_recovered-2026-09-30-unnamed/` and
    the existing `/volume1/web/practice-compass` link.
  - "Scanner output for the same input: courseData.ts, khonyagarData.ts and the
    Setar index bytes and contentHash."
  - publish-setar-index.mjs publishing logic and its one-branch, one-path
    restriction; only its direct-run check changes.
  - "App data model and behaviour: schema v15, migrations, every inbound
    validation door, sync, backup, archive refresh, the Settings media base and
    the CSP."
  - "The owner-passed shell: Keyboard trace, viewport guard, standalone 100vh
    CSS, interactive-widget meta."
  - GitHub Pages deployment, and every existing test title (including the
    previous lane's mapping in scripts/check-repertoire-families.mjs).
  - "Any NAS/DSM infrastructure or configuration change is excluded: Web
    Station, Tailscale, Synology Drive, Task Scheduler, shares, permissions or
    links, including removing or repointing `/volume1/web/practice-compass`. The
    lane only documents it. Allowed during the owner checks: publishing the
    mirror into one new app-only folder, and copying the updated lane-owned
    indexer files (scan-setar-classes.mjs, publish-setar-index.mjs,
    run-setar-index.sh) into their existing NAS runtime directory."
  - Any write, rename, move, restore or delete inside a media tree, including
    `undo-rename.sh` and recovering the six unexplained Setar names or session
    40. Those are recorded as owner follow-ups only.
  - Automatic cleanup of old mirror files; the mirror never deletes.
  - Changing or removing the Keyboard trace, the viewport guard, the standalone
    shell height or the interactive-widget meta.
  - Sync's raw error over plain http, QuickAdd and insights.ts instrument-name
    direction, and the unwired `readIndexFile` fallback. These are separate
    families for their own lanes.
  - In-app media verification, or any NAS origin in the CSP.
  - Branch-preview hosting, or any change to GitHub Pages deployment.
  - Re-baselining the 2026-09-17 Setar corpus table.
  - "Desired rule (not yet truth): Repository tools change only paths they can
    prove they own, proven by content they wrote and never by a path's name.
    They may atomically replace their own files, but never delete anything and
    never rename, move or overwrite an owner's or unclaimed file, wherever a
    path resolves. An operator script never reports success without having run."
acceptanceChecks:
  - id: ac-1
    description: "A hand-authored scenario table runs each case in a fresh mkdtemp
      tree beside a sibling 'media' fixture. Destination cases are refused
      before building: no --dest; a missing parent; an existing EMPTY folder
      with no marker (the shape of the empty session-40 folder), or one holding
      only the marker's temp; an unmarked folder holding media; a destination
      whose own entry is a symlink (lstat) to the media fixture or to an empty
      folder; a marked folder plus one unclaimed file, a symlink, a FIFO, or a
      claimed path that is now a directory; a marker that is malformed JSON,
      names another tool, or claims an absolute, `..` or outside-resolving path;
      a destination nested in, or containing, the build folder; creating a
      folder beside `setar-classes`, `PIECES.csv` or
      `.SynologyWorkingDirectory`. Build cases are refused after building but
      before any write: an injected build containing a symlink, a FIFO, or the
      marker's name. Each refuses, names the offending entry and exits non-zero.
      With and without --apply, the destination, its parent and the media
      fixture keep an identical inventory (path, type, size, mtime, sha256, link
      target)."
    test: the NAS mirror refuses every destination it cannot prove it owns
  - id: ac-2
    description: "With an injected build: a dry-run writes nothing and reports the
      destination, the parent's entries and the plan. --apply creates the
      folder, journals every path (temps included) before writing, and leaves
      the build byte-identical under the derived base. A second publish of a
      changed build replaces only claimed files, by exclusive temp + rename. It
      keeps every earlier file and leaves `.DS_Store`, `._*`, `@eaDir/` and
      `#recycle/` untouched. A third identical publish changes nothing. A
      claimed file that is a hard link to a media-fixture file is replaced
      without changing the media file. A claimed file swapped for a symlink
      after the final check is replaced, never written through. A failing build
      creates and writes nothing. `--base` overrides the derived base, and an
      unsafe folder name without it is refused. Nothing outside the destination
      changes."
    test: the NAS mirror writes only inside a folder it created and never deletes
  - id: ac-3
    description: A copy step fails after the journal and part of the files, leaving
      temp files behind. Re-running with the same build finishes byte-identical
      to an uninterrupted publish and adopts no unclaimed file; a publish
      interrupted after its journal never locks the owner out. A first publish
      interrupted before its marker exists is refused, with a message naming the
      folder as the mirror's own unfinished one.
    test: an interrupted NAS mirror publish completes when run again
  - id: ac-4
    description: "Refusals go through each real CLI (scan-setar-classes,
      scan-cgs-course, scan-khonyagar-course) with mkdtemp roots only. These all
      exit non-zero before the source is read and leave every byte identical: an
      --out inside --root reached through a symlinked parent, an existing
      foreign file, and a symlink to a foreign file. Through the exported
      writer, a new file and the scanner's own previous output are accepted and
      replaced by exclusive temp + rename, so the other name of a hard-linked
      output keeps its old bytes. The course scanners' default target is
      observed without `--write` (through an exported resolver, or the path
      printed before scanning) to resolve from the script, never the CWD. A run
      whose CWD is a media fixture leaves a foreign file planted under that CWD
      untouched. No test passes `--write` without an explicit mkdtemp `--out`."
    test: every scanner refuses an output it cannot prove is its own
  - id: ac-5
    description: Each of scan-setar-classes.mjs, publish-setar-index.mjs,
      scan-cgs-course.mjs, scan-khonyagar-course.mjs and nas-mirror.mjs is
      spawned through a symlinked directory with missing or invalid arguments,
      with every scanner given an explicit mkdtemp `--root` and an environment
      stripped of `PC_INDEX_*`. Each actually runs, printing its usage or
      refusal and exiting non-zero, instead of exiting 0 having done nothing;
      importing a course scanner does not run it.
    test: every operator script runs when invoked through a symlinked path
  - id: ac-6
    description: The existing Setar scanner family still holds after the guard. The
      same archive yields byte-identical index text and contentHash, the archive
      is untouched, and the in-archive output refusal now holds through
      realpath. The test is adapted, with its title unchanged.
    test: setar scanning is bounded read-only and produces stable complete indexes
  - id: ac-7
    description: The degraded index is missing resources, a whole session and a
      piece, as after a partial restore; the full index is then applied again.
      Sessions, resources and pieces end deep-equal to the never-degraded graph,
      with no `unavailable` flags. Items, lessons (recordings included), blocks,
      reviews, agenda and suppressions stay unchanged throughout, and no item is
      created.
    test: a degraded archive index followed by the full one restores the source
      graph exactly
  - id: ac-8
    description: "This checks the CSP the build actually injects (the cspPlugin
      output, not a copied string): connect-src allows only 'self' and
      https://api.github.com, form-action only 'self', and no frames. So no
      application flow has a channel that could write to a NAS origin."
    test: the production build can reach only its own origin and the GitHub API
  - id: ac-9
    description: With `removeCatalogItem` gone from the store, the same lossless
      removal holds through `removeFromPathway`. 'archive deletions and
      unlinking remain respected after refresh and reload' stays green, tsc
      finds no remaining caller, and the test titles are unchanged.
    test: pathway removal keeps enriched and never practised owner items
  - id: ac-10
    description: "Mac and iPhone, about ten minutes, with no fingerprints or traces
      unless a step fails. (1) With the `web` share mounted, run `node
      scripts/nas-mirror.mjs --dest /Volumes/web/practice-compass` without
      --apply: it refuses, naming a media entry. (2) Publish this final build to
      a new app-only folder, dry-run first and then --apply. It opens over https
      on the Mac with this commit's build stamp in Settings. (3) On the iPhone,
      install it from that URL (Safari, accept the certificate, Add to Home
      Screen) and open the installed app. Type in a field, dismiss the keyboard,
      and rotate once and back: the bottom bar stays flush and the typed text is
      retained. If iOS will not open the self-signed mirror as an installed app,
      the production install stands in, since this lane cannot change layout
      code. Only if a step fails, capture More → Keyboard trace (step 3) or the
      doc's fingerprint command (steps 1-2). The mirror is never connected to
      the real data repo."
    test: manual:OWNER
  - id: ac-11
    description: "DSM, about five minutes. Copy the three updated lane-owned files
      (scan-setar-classes.mjs, publish-setar-index.mjs, run-setar-index.sh) into
      the existing NAS runtime directory and run the Setar task once by hand. It
      must finish without error, reporting 'Index unchanged — no commit.' or one
      publish. In the same session, confirm or have corrected the few 'owner to
      confirm' lines in docs/nas-topology.md: the Web Station roots, the Drive
      pairing, the task and its runtime directory, and that `config.env` sits
      outside every served or synced share. Nothing else on the NAS changes."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - README.md
  - DECISIONS.md
  - docs/nas-topology.md
  - docs/setar-archive.md
  - docs/repertoire-experience.md
  - docs/khonyagar-course.md
createdAt: 2026-10-01T00:59:48.028Z
amendments: []
---

# Make NAS deployment and media tooling fail closed, map the real NAS topology, and settle last lane's residue

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/41
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 25d6767e8138593a9995ae16710cfaed35e380a6 on main _(never re-baselined)_
- **Intent:** 20261001-make-nas-deployment-and-media-tooling-fa-3d7b

## You may only change

- scripts/deploy-nas.sh
- scripts/nas-mirror.mjs
- scripts/scan-setar-classes.mjs
- scripts/scan-cgs-course.mjs
- scripts/scan-khonyagar-course.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- package.json
- tests/owned-writes.test.ts
- src/domain/scanSetarClasses.test.ts
- src/domain/sourceReconcile.test.ts
- src/store/useStore.ts
- src/store/archiveIndex.test.ts
- tests/repertoire-families.test.ts
- AGENTS.md
- README.md
- DECISIONS.md
- docs/nas-topology.md
- docs/setar-archive.md
- docs/repertoire-experience.md
- docs/khonyagar-course.md

## Never touch

- .prismatica/**
- .github/**
- .agents/**
- .codex/**
- tests/fixtures/**
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- vite.config.ts
- index.html
- src/styles/global.css
- src/components/useViewportGuard.ts
- src/components/viewport.ts
- src/pages/More.tsx
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.ts
- src/domain/recordings.ts
- src/domain/mediaRoots.ts
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/types.ts
- src/domain/canonical.ts
- src/store/githubSync.ts
- src/store/syncEngine.ts
- src/store/backup.ts
- src/store/archiveIndex.ts

## Non-goals

- No file or folder in any media tree (NAS `homes/ethan/SNDK/video-courses`, `/Volumes/Sandisk`) is written, renamed, moved or deleted by anything in this lane, including `undo-rename.sh`, `_recovered-2026-09-30-unnamed/` and the existing `/volume1/web/practice-compass` link.
- Scanner output for the same input: courseData.ts, khonyagarData.ts and the Setar index bytes and contentHash.
- publish-setar-index.mjs publishing logic and its one-branch, one-path restriction; only its direct-run check changes.
- App data model and behaviour: schema v15, migrations, every inbound validation door, sync, backup, archive refresh, the Settings media base and the CSP.
- The owner-passed shell: Keyboard trace, viewport guard, standalone 100vh CSS, interactive-widget meta.
- GitHub Pages deployment, and every existing test title (including the previous lane's mapping in scripts/check-repertoire-families.mjs).
- Any NAS/DSM infrastructure or configuration change is excluded: Web Station, Tailscale, Synology Drive, Task Scheduler, shares, permissions or links, including removing or repointing `/volume1/web/practice-compass`. The lane only documents it. Allowed during the owner checks: publishing the mirror into one new app-only folder, and copying the updated lane-owned indexer files (scan-setar-classes.mjs, publish-setar-index.mjs, run-setar-index.sh) into their existing NAS runtime directory.
- Any write, rename, move, restore or delete inside a media tree, including `undo-rename.sh` and recovering the six unexplained Setar names or session 40. Those are recorded as owner follow-ups only.
- Automatic cleanup of old mirror files; the mirror never deletes.
- Changing or removing the Keyboard trace, the viewport guard, the standalone shell height or the interactive-widget meta.
- Sync's raw error over plain http, QuickAdd and insights.ts instrument-name direction, and the unwired `readIndexFile` fallback. These are separate families for their own lanes.
- In-app media verification, or any NAS origin in the CSP.
- Branch-preview hosting, or any change to GitHub Pages deployment.
- Re-baselining the 2026-09-17 Setar corpus table.
- Desired rule (not yet truth): Repository tools change only paths they can prove they own, proven by content they wrote and never by a path's name. They may atomically replace their own files, but never delete anything and never rename, move or overwrite an owner's or unclaimed file, wherever a path resolves. An operator script never reports success without having run.

## Acceptance checks (definition of done)

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

## Docs to update

- AGENTS.md
- README.md
- DECISIONS.md
- docs/nas-topology.md
- docs/setar-archive.md
- docs/repertoire-experience.md
- docs/khonyagar-course.md

## Amendments

_none_

