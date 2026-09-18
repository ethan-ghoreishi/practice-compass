---
id: 20260917-turn-the-setar-archive-into-trusted-less-5614
title: Turn the Setar archive into trusted lessons and useful practice material
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/29
intent: 20260917-turn-the-setar-archive-into-trusted-less-5614
tier: heavy
stage: ship
baseline:
  commit: b649bd09d0ffbd8bbc5955c3c891cfe01a7fa417
  branch: main
branch: change/20260917-turn-the-setar-archive-into-trusted-less-5614
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260917-turn-the-setar-archive-into-trusted-less-5614
builder: claude
planHash: c50970d61ed46b19b43aa13535d620a4429477d69d0e395a25d604d8be7bd4cd
allowedPaths:
  - scripts/scan-setar-classes.mjs
  - scripts/publish-setar-index.mjs
  - scripts/run-setar-index.sh
  - scripts/setar-index.test.mjs
  - src/domain/types.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/io.ts
  - src/domain/io.test.ts
  - src/domain/seed.ts
  - src/domain/seedMigration.test.ts
  - src/domain/index.ts
  - src/domain/factories.ts
  - src/domain/setarClasses.ts
  - src/domain/setarClasses.test.ts
  - src/domain/scanSetarClasses.test.ts
  - src/domain/recordings.ts
  - src/domain/recordings.test.ts
  - src/domain/itemFiles.ts
  - src/domain/itemFiles.test.ts
  - src/domain/selectors.ts
  - src/domain/selectors.test.ts
  - src/domain/lessonAgenda.ts
  - src/domain/lessonAgenda.test.ts
  - src/domain/repertoire.ts
  - src/domain/repertoire.test.ts
  - src/domain/sourceArchive.ts
  - src/domain/sourceArchive.test.ts
  - src/domain/sourceReconcile.ts
  - src/domain/sourceReconcile.test.ts
  - src/store/useStore.ts
  - src/store/backup.ts
  - src/store/archiveIndex.ts
  - src/store/archiveIndex.test.ts
  - src/components/ItemMaterial.tsx
  - src/components/ItemNotes.tsx
  - src/components/LessonNotes.tsx
  - src/components/ArchiveRefresh.tsx
  - src/components/ReferenceEditor.tsx
  - src/components/direction.test.ts
  - src/pages/Settings.tsx
  - src/pages/Lessons.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/Repertoire.tsx
  - src/pages/StartBlock.tsx
  - src/styles/global.css
  - tests/practiceBrowser.ts
  - tests/setarArchive.browser.test.ts
  - tests/setarInbound.browser.test.ts
  - tests/lessonNotes.browser.test.ts
  - tests/fixtures/setar-archive.json
  - tests/fixtures/setar-legacy-v13.json
  - package.json
  - AGENTS.md
  - DECISIONS.md
  - FUTURE.md
  - README.md
  - docs/product-spec.md
  - docs/setar-archive.md
forbiddenPaths:
  - src/domain/scheduling.ts
  - src/domain/scoring.ts
  - src/domain/recommend.ts
  - src/domain/plan.ts
  - src/domain/practiceSession.ts
  - src/domain/practiceSignal.ts
  - src/components/screenAwake.ts
  - src/components/useScreenAwake.ts
  - src/components/useViewportGuard.ts
  - src/components/Layout.tsx
  - src/pages/CloseBlock.tsx
  - src/store/githubSync.ts
  - src/store/syncEngine.ts
  - src/store/gitRemote.ts
  - src/store/revision.ts
  - src/store/idb.ts
  - vite.config.ts
  - package-lock.json
  - .github/**
  - public/**
  - src/domain/persian.ts
  - src/domain/farsi.ts
  - src/domain/pathwaySeed.ts
nonGoals:
  - Never write, rename, move or delete Setar/Tar/Guitar source files, including
    CSVs; fixtures and outputs live outside archives. No source or NAS
    configuration is changed during this planning turn.
  - Preserve blocks, minutes, Results, all scheduling/SM2/review evidence,
    counts and streak semantics. Archive appearances are not recorded Practice
    Compass practice.
  - Preserve core loop, quick Start/Close, Active timer/wake-lock,
    running/paused practice, session plans/routines, instrument scoping,
    working-text homes, manual review dates and lesson-agenda/question
    semantics.
  - Preserve existing local attachments, full/state backup byte guarantees,
    refused hydration recovery, snapshot sync conflicts/archives and revision
    guards. No live owner-data writes in automated tests.
  - Keep practice core usable offline with last accepted metadata. Source
    refresh and external media may need their respective networks without
    blocking practice.
  - No fuzzy matching/transliteration, automatic piece splitting, AI/audio
    judgement, gamification, paid service, speculative plugin system or public
    full archive index.
  - Full Tar/Guitar import, archive normalisation/renaming, generic
    adapters/plugins and media segmentation.
  - iPhone keyboard/bottom-nav changes without a reproduced diagnosis; no
    heuristic hide/delay workaround.
  - Scheduling/session planning/routine redesign, broader duplicate sweep
    unrelated to source graph, sync engine rewrite, all-purpose library
    migration or UI redesign.
  - Public index publication, NAS browser HTML crawler, permanent TLS bypass,
    new backend/API or bulk NAS attachment imports.
  - Already-shipped working-text retirement, attachment integrity,
    manual-date/SM2, current session recovery and browser CI fixes.
  - "Desired rule (not yet truth): Archive evidence may establish repertoire
    membership, historical lesson provenance and source material, never recorded
    practice, results, exposure, review completion or scheduling progress."
  - "Desired rule (not yet truth): Source identity is archive-relative and
    independent of transport; refresh preserves owner-authored data and explicit
    reconciliation/suppression decisions across every inbound boundary."
  - "Desired rule (not yet truth): Browser GitHub credentials and media bases
    stay device-local; the separately scoped archive publisher credential stays
    in protected NAS operator configuration. No credential or device base enters
    source archives, committed files, manifests, app data, logs, sync or
    backups."
acceptanceChecks:
  - id: ac-1
    description: Use real PIECES.csv rows including quoted commas, doubled quotes,
      aliases, provisional and MEDIUM caveats. Preserve canonical_fa byte
      identity, embedded digits and -و-. Reject duplicate/empty canonical keys,
      malformed quoting, missing headers, invalid session numbers and unknown
      manifest versions. aliases_seen is literal search data, never a wildcard
      or reconciliation heuristic; real forms هفت-ضربی and چهارپاره are
      supported without inventing categorical facts.
    test: setar registry keeps exact Farsi keys and rejects ambiguous CSV input
  - id: ac-2
    description: Assert all seven real brief examples exactly, role boundary longest
      match, parts numeric, the embedded دشتی-1-علیزاده digit and
      پریچهر-و-پریزاد stay inside one canonical name. Known session16 video
      exception produces actionable diagnostic and no guessed role. Unknown
      piece/role/ext and named class recordings are surfaced, not relabelled. No
      largest-file heuristic.
    test: setar filenames preserve compound roles and report unhandled assets
  - id: ac-3
    description: Session13 unnamed two-part demo belongs to all eight canonical
      pieces; session28 named demo only به-زندان-شوشتری and no fabricated class
      recording; session27 class parts ordered numerically. Folder membership
      rather than mtime. Provisional session7 and34/35 preserved. Six-session
      personal repeat chain22..27 is provenance, never six weeks or practice
      evidence. On roster disagreement do not expand unnamed demos to a guessed
      set.
    test: setar session material follows exact roster and demonstration attribution
  - id: ac-4
    description: Deterministic filesystem inventory fixture, shuffled directory
      order and altered mtimes yield same semantic index. Numeric session order9
      before10. Ignore dotfiles/root out-of-scope folders/NAS @eaDir; do not
      follow symlinks or unsafe relative paths. Reject traversal, escaped
      separators, URL schemes, duplicate asset/session identities and oversize
      inputs. Missing root or changed registry/inventory during scan does not
      replace last good output. Output is atomically published outside archive;
      no source write API.
    test: setar scanning is bounded read-only and produces stable complete indexes
  - id: ac-5
    description: Transport stub exercises first index publish, identical scan no
      commit, changed scan, interruption before ref advance, race with second
      publisher. All writes confined to designated source-index branch; never
      state.json, manifest.json or files/ on data main or archive/ recovery
      branches. Reader pins file fetch to the read branch commit.
      Authentication/network errors leave old index and app data intact; no
      token/root URL in payloads or logs. Publisher target branch is fixed
      source-index and path setar/index.json. Token is scoped to this private
      repository with only required Contents write and metadata read, no
      workflow/admin permission; GitHub does not make such a token
      branch-scoped, so code target restrictions and optional repository rules
      must not be described as credential isolation. App reuses its existing
      local GitHub connection only for GETs; no publisher token reaches the
      browser. Unchanged content means no commit; UI says index last
      changed/fetched, never falsely last scanned.
    test: source index publication cannot replace practice data or lose a concurrent
      update
  - id: ac-6
    description: First empty import produces39 historical lessons94 canonical items;
      repeat no duplicates. Existing source bindings win across edited
      titles/dates. Unique legacy lesson with exact source-reference
      evidence/date+number can be adopted; date-only, number-only or title-only
      equivalence cannot auto-merge. Exact manual title/alias candidates require
      owner Link/Create/Skip; multiple candidates do not pick first. Existing
      upcoming class38 on2026-09-27 survives separate from archive38
      on2026-08-04. catalogKey iraq never equals Setar canonical key عراق.
      Source/instrument binding explicit and persistent. Deterministic
      namespaced IDs on new records ensure two devices importing the same source
      separately identify the same logical entities, while existing owner
      records retain their IDs after explicit binding. Whole-snapshot GitHub
      conflicts still require the existing owner choice; no automatic merge of
      divergent practice databases.
    test: setar reconciliation binds exact identities without merging owner records
  - id: ac-7
    description: Exercise one newlesson40, added score existinglesson, changed
      registry metadata, exact logged path rename, missing file, missing
      registry row, unresolved previous candidates and same manifest with a new
      owner decision. Source metadata/availability updates; item/lesson authored
      fields seeded once then preserved including deliberate empty values. Later
      metadata improvement shown for explicit selective apply, never notes
      overwrite. Missing source retains provenance and flags unavailable, never
      deletes owner data. Unchanged refresh does not bump db revision or churn
      timestamps. A canonical key change is a new identity requiring owner
      decision, never inferred from metadata; exact asset rename chains alone
      may preserve an asset identity. Missing files only follow a validated
      complete scan, not timeout, partially copied input or unreachable mount.
    test: archive refresh preserves owner edits and applies only the new source delta
  - id: ac-8
    description: Actual mutation actions deleteItem, removeCatalogItem,
      deleteLesson, unlinkItemFromLesson, remove manual ref and hide imported
      material update only applicable suppression/binding in same store
      mutation. Retry identical source after reload/sync cannot resurrect
      deliberately suppressed record/link. Shared demo hidden for one item
      remains available to others. Moving an archive-bound item to another
      instrument refuses or explicitly detaches before mutation; no invalid
      graph emitted. Clear/reset remove source state with DB. Partial/imported
      dangling bindings refused instead of duplicate healing.
    test: archive deletions and unlinking remain respected after refresh and reload
  - id: ac-9
    description: Compare complete pre/post blocks,reviews,lessonAgenda,existing item
      counters/results/all scheduling fields,active+routine+plan,notNow and
      sessionInstrument. New items have zero totals,no
      lastPractice/result/review/SM2; source personal files create only
      membership/roles/repeat provenance. No new material/agenda/pathway
      commitments inferred. New library items start resting by explicit import
      policy so Today/plan pools are not flooded, yet direct Start works. No
      personal recordings in item/active material.
    test: archive import cannot fabricate practice or next-class urgency
  - id: ac-10
    description: One shared upcoming predicate used by
      nextLessonFor,nextLessonDates,defaultTargetLesson,preparationDatesByItem
      and wide/mobile Lessons badges/default selection/question sheet. Test
      source historical lesson dated past/today/future versus ordinary real
      upcoming lesson on same dates; imported historical records never create
      urgency/default question target. Preserve existing manually authored
      agenda and normal upcoming lesson semantics.
    test: historical source lessons never become upcoming through sibling selectors
  - id: ac-11
    description: "Real store action with controlled persistence: validate and
      prepare before a single db set; no per-file app commits/no blob copying.
      Revision change, source change, owner-choice change, active session
      starting and finishing during fetch cause rebase/repreview or refusal
      without lost edits. IndexedDB failed save reports unsaved and retry
      persists complete current state even if in-memory index hash already
      matches; no false Already current. Reload before/after acknowledgement
      yields previous complete or new complete state. Refresh never calls
      whole-DB import/reset."
    test: archive commits survive interruption and never apply a stale preview
  - id: ac-12
    description: All67 legacy seed paths map through exact257-row RENAME-LOG, no
      fuzzy URL/title/mtime matching. Full URL converts only under explicitly
      verified current device prefix with segment-wise decode;
      foreign/query/fragment links remain untouched. Old/current pairs for
      session1 classpart1 and firstDashti score show one physical resource
      without deleting either authored row/notes. Existing3 personal references
      remain retained historical links outside item/active list. Missing
      targets/cycles/multiple destinations diagnose, never guess.
    test: exact Setar rename repair preserves saved references and their metadata
  - id: ac-13
    description: One shared composition for ItemDetail/Active and new direct item
      links plus lesson composition. Corrections prominent but clean scores
      retained; logical demo ordered parts one group; resources from earlier
      repeat-chain lessons remain reachable; named scores/demo never bleed to
      sibling pieces; whole class video stays lesson-only. Existing manual
      unclassified lesson references remain accessible without inventing scope.
      Direct NAS link works without any lesson and uses same resolver as
      legacy/source refs. External links never go through attachment blob APIs.
    test: practice material shows only useful correctly scoped archive resources
  - id: ac-14
    description: Same sourceId+relative asset resolves via independently configured
      Mac/iPhone roots and a changed future base; stored data/export/hash
      unchanged. Config device-local, never synced. Preserve base path prefixes;
      reject unsafe path/scheme/traversal/credentials and double-encoded
      separators; encode each raw Farsi segment once. Root/index capability
      check never relies on a media filename. Distinguish readable published
      index from unverified media reachability; do not claim CORS/cert/network
      failures are absence.
    test: source transport changes preserve archive identity and encode Farsi once
  - id: ac-15
    description: v13->v14 additive empty-source migration with source keys/manual
      refs/history marker as chosen representation; legacy baseline fields
      unchanged apart from schema. Run whole oldest-supported chain, repeated
      migration and current-declared inbound. validateDB retains/validates every
      new persisted field with duplicate source keys, wrong types,
      dangling/mismatched refs,wrong instrument,unsafe paths,unknown
      format/newer schema refused before mutation. Missing source file is valid
      unavailable state, not dangling graph. Successful output revalidates and
      roundtrips export unchanged. New collection is included in validateDB's
      reconstructed return value, not merely accepted on input. Legacy
      current-version stray fields do not bypass validation. Reject duplicate
      bindings and resource graph cycles/invalid part group membership. Preserve
      surviving practice text and attachment guarantees.
    test: archive schema migration and validation preserve the whole source graph
  - id: ac-16
    description: Use existing browser/fakeGitHub harness to drive Settings
      full/state import, automatic pull, Keep remote, archive restore, both
      hydration branches and cold-start recovery. Same malformed source relation
      rejected with pre/post persisted DB+blobs checked; valid source
      bindings/suppressions/user fields survive. Existing active/revision guards
      retained. Full export includes metadata only for NAS refs and only real
      local attachment bytes. Real baseline v13 checkout refuses v14 file
      without writes; retained v13 backup restores there. No format2 sync-engine
      rewrite.
    test: archive state crosses all real inbound doors without partial installation
  - id: ac-17
    description: "Reproduce current empty-save bug through real editor and store
      then verify fixed reload. Reuse current ItemNotes durability model:
      explicit Done, preserved unsaved draft on refresh, tagged lesson ID,
      storage acknowledgement before Saved, failed-write retry/copy, typing
      during pending write, latest-save ownership, item/lesson switch and route
      unmount. Existing Working notes/Observation/Next time and timers remain
      unchanged."
    test: lesson notes can be cleared and saved durably without cross-lesson drafts
  - id: ac-18
    description: Rendered controls with frozen time and checked-in corpus-derived
      metadata fixture. Refresh -> historical lesson -> proper class/score/demo
      -> canonical item -> useful material -> direct Start -> open material with
      practice context unchanged. Historical phone rows initially
      compact/collapsed, Farsi wraps and mixed labels isolate correctly,
      keyboard controls and accessible names present. Alias search works in
      Repertoire and Start through existing Farsi matcher; identity matching
      never uses it. Repeat refresh then add fixturelesson40 only delta; invalid
      file actionable; persisted reload verifies no duplicates/history
      fabrication. Both engines mandatory; missing engine fails, not skip.
    test: setar archive journey works on phone and desktop in Chromium and WebKit
  - id: ac-19
    description: "Actual corpus read-only: baseline39/258/257/1/94 with125personal
      and132useful files, 37logical demos; all CSV+inventory hashes recorded.
      Verify known exception/session28/provisional rows and full rename
      coverage. Future lesson delta tested with disposable fixture outside
      Sandisk, not a mutation of source archive. Publisher runtime/location and
      scheduling must be installed and exercised, not left as a runbook-only
      hidden prerequisite. Primary production host is the NAS, explicitly
      approved by OWNER: install supported Node runtime and a DSM scheduled task
      (default every15 minutes), read-only source permissions and restricted
      separate runtime/output directory. Provision publisher-only
      repository-scoped credentials outside app data and verify unattended run
      with Mac off. Verify main branch unchanged after index publication;
      revocation and failed scan retain last good index. Record actual NAS
      filesystem mapping/runtime rather than assuming /Volumes paths work
      there."
    test: manual:OWNER
  - id: ac-20
    description: Real Mac and iPhone journey using archive bases
      https://192.168.0.20:5010/setar-classes/ and OWNER-provided
      https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Verify same
      Farsi demo and score open, video range/seek works, changing base changes
      no source IDs or backup data. iPhone path is owner-confirmed mapping
      awaiting device playback verification, not a Mac-probed fact. Mac requires
      no Tailscale. Do not disable certificate validation in shipped code. Show
      published-index retrieval separately from media access; unavailable NAS or
      GitHub preserves imported material metadata. Never mark iPhone passed from
      LAN-only/emulated tests.
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - FUTURE.md
  - README.md
  - docs/product-spec.md
  - docs/setar-archive.md
createdAt: 2026-09-17T00:51:16.586Z
amendments: []
---

# Turn the Setar archive into trusted lessons and useful practice material

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/29
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** b649bd09d0ffbd8bbc5955c3c891cfe01a7fa417 on main _(never re-baselined)_
- **Intent:** 20260917-turn-the-setar-archive-into-trusted-less-5614

## You may only change

- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- scripts/setar-index.test.mjs
- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/seed.ts
- src/domain/seedMigration.test.ts
- src/domain/index.ts
- src/domain/factories.ts
- src/domain/setarClasses.ts
- src/domain/setarClasses.test.ts
- src/domain/scanSetarClasses.test.ts
- src/domain/recordings.ts
- src/domain/recordings.test.ts
- src/domain/itemFiles.ts
- src/domain/itemFiles.test.ts
- src/domain/selectors.ts
- src/domain/selectors.test.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/repertoire.ts
- src/domain/repertoire.test.ts
- src/domain/sourceArchive.ts
- src/domain/sourceArchive.test.ts
- src/domain/sourceReconcile.ts
- src/domain/sourceReconcile.test.ts
- src/store/useStore.ts
- src/store/backup.ts
- src/store/archiveIndex.ts
- src/store/archiveIndex.test.ts
- src/components/ItemMaterial.tsx
- src/components/ItemNotes.tsx
- src/components/LessonNotes.tsx
- src/components/ArchiveRefresh.tsx
- src/components/ReferenceEditor.tsx
- src/components/direction.test.ts
- src/pages/Settings.tsx
- src/pages/Lessons.tsx
- src/pages/ItemDetail.tsx
- src/pages/ActiveBlock.tsx
- src/pages/Repertoire.tsx
- src/pages/StartBlock.tsx
- src/styles/global.css
- tests/practiceBrowser.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/fixtures/setar-archive.json
- tests/fixtures/setar-legacy-v13.json
- package.json
- AGENTS.md
- DECISIONS.md
- FUTURE.md
- README.md
- docs/product-spec.md
- docs/setar-archive.md

## Never touch

- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/plan.ts
- src/domain/practiceSession.ts
- src/domain/practiceSignal.ts
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/components/useViewportGuard.ts
- src/components/Layout.tsx
- src/pages/CloseBlock.tsx
- src/store/githubSync.ts
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/store/revision.ts
- src/store/idb.ts
- vite.config.ts
- package-lock.json
- .github/**
- public/**
- src/domain/persian.ts
- src/domain/farsi.ts
- src/domain/pathwaySeed.ts

## Non-goals

- Never write, rename, move or delete Setar/Tar/Guitar source files, including CSVs; fixtures and outputs live outside archives. No source or NAS configuration is changed during this planning turn.
- Preserve blocks, minutes, Results, all scheduling/SM2/review evidence, counts and streak semantics. Archive appearances are not recorded Practice Compass practice.
- Preserve core loop, quick Start/Close, Active timer/wake-lock, running/paused practice, session plans/routines, instrument scoping, working-text homes, manual review dates and lesson-agenda/question semantics.
- Preserve existing local attachments, full/state backup byte guarantees, refused hydration recovery, snapshot sync conflicts/archives and revision guards. No live owner-data writes in automated tests.
- Keep practice core usable offline with last accepted metadata. Source refresh and external media may need their respective networks without blocking practice.
- No fuzzy matching/transliteration, automatic piece splitting, AI/audio judgement, gamification, paid service, speculative plugin system or public full archive index.
- Full Tar/Guitar import, archive normalisation/renaming, generic adapters/plugins and media segmentation.
- iPhone keyboard/bottom-nav changes without a reproduced diagnosis; no heuristic hide/delay workaround.
- Scheduling/session planning/routine redesign, broader duplicate sweep unrelated to source graph, sync engine rewrite, all-purpose library migration or UI redesign.
- Public index publication, NAS browser HTML crawler, permanent TLS bypass, new backend/API or bulk NAS attachment imports.
- Already-shipped working-text retirement, attachment integrity, manual-date/SM2, current session recovery and browser CI fixes.
- Desired rule (not yet truth): Archive evidence may establish repertoire membership, historical lesson provenance and source material, never recorded practice, results, exposure, review completion or scheduling progress.
- Desired rule (not yet truth): Source identity is archive-relative and independent of transport; refresh preserves owner-authored data and explicit reconciliation/suppression decisions across every inbound boundary.
- Desired rule (not yet truth): Browser GitHub credentials and media bases stay device-local; the separately scoped archive publisher credential stays in protected NAS operator configuration. No credential or device base enters source archives, committed files, manifests, app data, logs, sync or backups.

## Acceptance checks (definition of done)

- [ ] **ac-1** — Use real PIECES.csv rows including quoted commas, doubled quotes, aliases, provisional and MEDIUM caveats. Preserve canonical_fa byte identity, embedded digits and -و-. Reject duplicate/empty canonical keys, malformed quoting, missing headers, invalid session numbers and unknown manifest versions. aliases_seen is literal search data, never a wildcard or reconciliation heuristic; real forms هفت-ضربی and چهارپاره are supported without inventing categorical facts. _(proof: setar registry keeps exact Farsi keys and rejects ambiguous CSV input)_
- [ ] **ac-2** — Assert all seven real brief examples exactly, role boundary longest match, parts numeric, the embedded دشتی-1-علیزاده digit and پریچهر-و-پریزاد stay inside one canonical name. Known session16 video exception produces actionable diagnostic and no guessed role. Unknown piece/role/ext and named class recordings are surfaced, not relabelled. No largest-file heuristic. _(proof: setar filenames preserve compound roles and report unhandled assets)_
- [ ] **ac-3** — Session13 unnamed two-part demo belongs to all eight canonical pieces; session28 named demo only به-زندان-شوشتری and no fabricated class recording; session27 class parts ordered numerically. Folder membership rather than mtime. Provisional session7 and34/35 preserved. Six-session personal repeat chain22..27 is provenance, never six weeks or practice evidence. On roster disagreement do not expand unnamed demos to a guessed set. _(proof: setar session material follows exact roster and demonstration attribution)_
- [ ] **ac-4** — Deterministic filesystem inventory fixture, shuffled directory order and altered mtimes yield same semantic index. Numeric session order9 before10. Ignore dotfiles/root out-of-scope folders/NAS @eaDir; do not follow symlinks or unsafe relative paths. Reject traversal, escaped separators, URL schemes, duplicate asset/session identities and oversize inputs. Missing root or changed registry/inventory during scan does not replace last good output. Output is atomically published outside archive; no source write API. _(proof: setar scanning is bounded read-only and produces stable complete indexes)_
- [ ] **ac-5** — Transport stub exercises first index publish, identical scan no commit, changed scan, interruption before ref advance, race with second publisher. All writes confined to designated source-index branch; never state.json, manifest.json or files/ on data main or archive/ recovery branches. Reader pins file fetch to the read branch commit. Authentication/network errors leave old index and app data intact; no token/root URL in payloads or logs. Publisher target branch is fixed source-index and path setar/index.json. Token is scoped to this private repository with only required Contents write and metadata read, no workflow/admin permission; GitHub does not make such a token branch-scoped, so code target restrictions and optional repository rules must not be described as credential isolation. App reuses its existing local GitHub connection only for GETs; no publisher token reaches the browser. Unchanged content means no commit; UI says index last changed/fetched, never falsely last scanned. _(proof: source index publication cannot replace practice data or lose a concurrent update)_
- [ ] **ac-6** — First empty import produces39 historical lessons94 canonical items; repeat no duplicates. Existing source bindings win across edited titles/dates. Unique legacy lesson with exact source-reference evidence/date+number can be adopted; date-only, number-only or title-only equivalence cannot auto-merge. Exact manual title/alias candidates require owner Link/Create/Skip; multiple candidates do not pick first. Existing upcoming class38 on2026-09-27 survives separate from archive38 on2026-08-04. catalogKey iraq never equals Setar canonical key عراق. Source/instrument binding explicit and persistent. Deterministic namespaced IDs on new records ensure two devices importing the same source separately identify the same logical entities, while existing owner records retain their IDs after explicit binding. Whole-snapshot GitHub conflicts still require the existing owner choice; no automatic merge of divergent practice databases. _(proof: setar reconciliation binds exact identities without merging owner records)_
- [ ] **ac-7** — Exercise one newlesson40, added score existinglesson, changed registry metadata, exact logged path rename, missing file, missing registry row, unresolved previous candidates and same manifest with a new owner decision. Source metadata/availability updates; item/lesson authored fields seeded once then preserved including deliberate empty values. Later metadata improvement shown for explicit selective apply, never notes overwrite. Missing source retains provenance and flags unavailable, never deletes owner data. Unchanged refresh does not bump db revision or churn timestamps. A canonical key change is a new identity requiring owner decision, never inferred from metadata; exact asset rename chains alone may preserve an asset identity. Missing files only follow a validated complete scan, not timeout, partially copied input or unreachable mount. _(proof: archive refresh preserves owner edits and applies only the new source delta)_
- [ ] **ac-8** — Actual mutation actions deleteItem, removeCatalogItem, deleteLesson, unlinkItemFromLesson, remove manual ref and hide imported material update only applicable suppression/binding in same store mutation. Retry identical source after reload/sync cannot resurrect deliberately suppressed record/link. Shared demo hidden for one item remains available to others. Moving an archive-bound item to another instrument refuses or explicitly detaches before mutation; no invalid graph emitted. Clear/reset remove source state with DB. Partial/imported dangling bindings refused instead of duplicate healing. _(proof: archive deletions and unlinking remain respected after refresh and reload)_
- [ ] **ac-9** — Compare complete pre/post blocks,reviews,lessonAgenda,existing item counters/results/all scheduling fields,active+routine+plan,notNow and sessionInstrument. New items have zero totals,no lastPractice/result/review/SM2; source personal files create only membership/roles/repeat provenance. No new material/agenda/pathway commitments inferred. New library items start resting by explicit import policy so Today/plan pools are not flooded, yet direct Start works. No personal recordings in item/active material. _(proof: archive import cannot fabricate practice or next-class urgency)_
- [ ] **ac-10** — One shared upcoming predicate used by nextLessonFor,nextLessonDates,defaultTargetLesson,preparationDatesByItem and wide/mobile Lessons badges/default selection/question sheet. Test source historical lesson dated past/today/future versus ordinary real upcoming lesson on same dates; imported historical records never create urgency/default question target. Preserve existing manually authored agenda and normal upcoming lesson semantics. _(proof: historical source lessons never become upcoming through sibling selectors)_
- [ ] **ac-11** — Real store action with controlled persistence: validate and prepare before a single db set; no per-file app commits/no blob copying. Revision change, source change, owner-choice change, active session starting and finishing during fetch cause rebase/repreview or refusal without lost edits. IndexedDB failed save reports unsaved and retry persists complete current state even if in-memory index hash already matches; no false Already current. Reload before/after acknowledgement yields previous complete or new complete state. Refresh never calls whole-DB import/reset. _(proof: archive commits survive interruption and never apply a stale preview)_
- [ ] **ac-12** — All67 legacy seed paths map through exact257-row RENAME-LOG, no fuzzy URL/title/mtime matching. Full URL converts only under explicitly verified current device prefix with segment-wise decode; foreign/query/fragment links remain untouched. Old/current pairs for session1 classpart1 and firstDashti score show one physical resource without deleting either authored row/notes. Existing3 personal references remain retained historical links outside item/active list. Missing targets/cycles/multiple destinations diagnose, never guess. _(proof: exact Setar rename repair preserves saved references and their metadata)_
- [ ] **ac-13** — One shared composition for ItemDetail/Active and new direct item links plus lesson composition. Corrections prominent but clean scores retained; logical demo ordered parts one group; resources from earlier repeat-chain lessons remain reachable; named scores/demo never bleed to sibling pieces; whole class video stays lesson-only. Existing manual unclassified lesson references remain accessible without inventing scope. Direct NAS link works without any lesson and uses same resolver as legacy/source refs. External links never go through attachment blob APIs. _(proof: practice material shows only useful correctly scoped archive resources)_
- [ ] **ac-14** — Same sourceId+relative asset resolves via independently configured Mac/iPhone roots and a changed future base; stored data/export/hash unchanged. Config device-local, never synced. Preserve base path prefixes; reject unsafe path/scheme/traversal/credentials and double-encoded separators; encode each raw Farsi segment once. Root/index capability check never relies on a media filename. Distinguish readable published index from unverified media reachability; do not claim CORS/cert/network failures are absence. _(proof: source transport changes preserve archive identity and encode Farsi once)_
- [ ] **ac-15** — v13->v14 additive empty-source migration with source keys/manual refs/history marker as chosen representation; legacy baseline fields unchanged apart from schema. Run whole oldest-supported chain, repeated migration and current-declared inbound. validateDB retains/validates every new persisted field with duplicate source keys, wrong types, dangling/mismatched refs,wrong instrument,unsafe paths,unknown format/newer schema refused before mutation. Missing source file is valid unavailable state, not dangling graph. Successful output revalidates and roundtrips export unchanged. New collection is included in validateDB's reconstructed return value, not merely accepted on input. Legacy current-version stray fields do not bypass validation. Reject duplicate bindings and resource graph cycles/invalid part group membership. Preserve surviving practice text and attachment guarantees. _(proof: archive schema migration and validation preserve the whole source graph)_
- [ ] **ac-16** — Use existing browser/fakeGitHub harness to drive Settings full/state import, automatic pull, Keep remote, archive restore, both hydration branches and cold-start recovery. Same malformed source relation rejected with pre/post persisted DB+blobs checked; valid source bindings/suppressions/user fields survive. Existing active/revision guards retained. Full export includes metadata only for NAS refs and only real local attachment bytes. Real baseline v13 checkout refuses v14 file without writes; retained v13 backup restores there. No format2 sync-engine rewrite. _(proof: archive state crosses all real inbound doors without partial installation)_
- [ ] **ac-17** — Reproduce current empty-save bug through real editor and store then verify fixed reload. Reuse current ItemNotes durability model: explicit Done, preserved unsaved draft on refresh, tagged lesson ID, storage acknowledgement before Saved, failed-write retry/copy, typing during pending write, latest-save ownership, item/lesson switch and route unmount. Existing Working notes/Observation/Next time and timers remain unchanged. _(proof: lesson notes can be cleared and saved durably without cross-lesson drafts)_
- [ ] **ac-18** — Rendered controls with frozen time and checked-in corpus-derived metadata fixture. Refresh -> historical lesson -> proper class/score/demo -> canonical item -> useful material -> direct Start -> open material with practice context unchanged. Historical phone rows initially compact/collapsed, Farsi wraps and mixed labels isolate correctly, keyboard controls and accessible names present. Alias search works in Repertoire and Start through existing Farsi matcher; identity matching never uses it. Repeat refresh then add fixturelesson40 only delta; invalid file actionable; persisted reload verifies no duplicates/history fabrication. Both engines mandatory; missing engine fails, not skip. _(proof: setar archive journey works on phone and desktop in Chromium and WebKit)_
- [ ] **ac-19** — Actual corpus read-only: baseline39/258/257/1/94 with125personal and132useful files, 37logical demos; all CSV+inventory hashes recorded. Verify known exception/session28/provisional rows and full rename coverage. Future lesson delta tested with disposable fixture outside Sandisk, not a mutation of source archive. Publisher runtime/location and scheduling must be installed and exercised, not left as a runbook-only hidden prerequisite. Primary production host is the NAS, explicitly approved by OWNER: install supported Node runtime and a DSM scheduled task (default every15 minutes), read-only source permissions and restricted separate runtime/output directory. Provision publisher-only repository-scoped credentials outside app data and verify unattended run with Mac off. Verify main branch unchanged after index publication; revocation and failed scan retain last good index. Record actual NAS filesystem mapping/runtime rather than assuming /Volumes paths work there. _(proof: manual:OWNER)_
- [ ] **ac-20** — Real Mac and iPhone journey using archive bases https://192.168.0.20:5010/setar-classes/ and OWNER-provided https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Verify same Farsi demo and score open, video range/seek works, changing base changes no source IDs or backup data. iPhone path is owner-confirmed mapping awaiting device playback verification, not a Mac-probed fact. Mac requires no Tailscale. Do not disable certificate validation in shipped code. Show published-index retrieval separately from media access; unavailable NAS or GitHub preserves imported material metadata. Never mark iPhone passed from LAN-only/emulated tests. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- FUTURE.md
- README.md
- docs/product-spec.md
- docs/setar-archive.md

## Amendments

_none_

