---
id: 20260928-unify-repertoire-discovery-musical-metad-1516
title: Unify repertoire discovery, musical metadata and pathways around a calmer
  practice interface
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/39
intent: 20260928-unify-repertoire-discovery-musical-metad-1516
tier: heavy
stage: ship
baseline:
  commit: b6bef3418572340c22e93deed79204878d45dc6d
  branch: main
branch: change/20260928-unify-repertoire-discovery-musical-metad-1516
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260928-unify-repertoire-discovery-musical-metad-1516
builder: claude
planHash: d91382382cb2bcc5b64db8257826c4e2675b672306b0853186b044e647ebc2c5
allowedPaths:
  - src/App.tsx
  - index.html
  - src/styles/global.css
  - src/styles/contrast.test.ts
  - src/domain/types.ts
  - src/domain/index.ts
  - src/domain/factories.ts
  - src/domain/labels.ts
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/seed.ts
  - src/domain/pathwaySeed.ts
  - src/domain/pathways.ts
  - src/domain/courseSeed.ts
  - src/domain/repertoire.ts
  - src/domain/persian.ts
  - src/domain/farsi.ts
  - src/domain/selectors.ts
  - src/domain/itemFiles.ts
  - src/domain/sourceReconcile.ts
  - src/domain/migrations.test.ts
  - src/domain/io.test.ts
  - src/domain/seedMigration.test.ts
  - src/domain/pathways.test.ts
  - src/domain/courseSeed.test.ts
  - src/domain/repertoire.test.ts
  - src/domain/persian.test.ts
  - src/domain/farsi.test.ts
  - src/domain/selectors.test.ts
  - src/domain/itemFiles.test.ts
  - src/domain/sourceReconcile.test.ts
  - src/store/useStore.ts
  - src/store/lookups.ts
  - src/components/Layout.tsx
  - src/components/ui.tsx
  - src/components/ItemForm.tsx
  - src/components/ItemCard.tsx
  - src/components/ItemMaterial.tsx
  - src/components/QuickAdd.tsx
  - src/components/useViewportGuard.ts
  - src/components/itemFields.ts
  - src/components/itemFormValues.ts
  - src/components/itemKinds.ts
  - src/components/format.ts
  - src/components/itemKinds.test.ts
  - src/components/format.test.ts
  - src/components/direction.test.ts
  - src/pages/Repertoire.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/NewItem.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/StageDetail.tsx
  - src/pages/Materials.tsx
  - src/pages/More.tsx
  - src/pages/Today.tsx
  - src/pages/StartBlock.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/Lessons.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/RoutineEdit.tsx
  - src/domain/musicTerms.ts
  - src/domain/musicTerms.test.ts
  - src/domain/referenceCatalog.ts
  - src/domain/referenceCatalog.test.ts
  - src/domain/studySources.ts
  - src/domain/studySources.test.ts
  - src/pages/MusicTerms.tsx
  - src/components/MusicalTermField.tsx
  - src/components/ReferenceChoices.tsx
  - src/components/viewport.ts
  - src/components/viewport.test.ts
  - tests/practiceBrowser.ts
  - tests/repertoire-experience.browser.test.ts
  - tests/repertoire-inbound.browser.test.ts
  - tests/repertoire-viewport.browser.test.ts
  - tests/repertoire-families.test.ts
  - tests/fixtures/repertoire-legacy-v14.json
  - tests/fixtures/repertoire-current-v15.json
  - tests/fixtures/repertoire-family-expectations.json
  - scripts/check-repertoire-families.mjs
  - AGENTS.md
  - DECISIONS.md
  - docs/product-spec.md
  - docs/repertoire-experience.md
  - README.md
forbiddenPaths:
  - .prismatica/**
  - .agents/**
  - .codex/**
  - .github/**
  - src/domain/scheduling.ts
  - src/domain/scoring.ts
  - src/domain/recommend.ts
  - src/domain/plan.ts
  - src/domain/practiceSignal.ts
  - src/domain/practiceSession.ts
  - src/domain/routines.ts
  - src/domain/courseData.ts
  - src/domain/khonyagarData.ts
  - src/domain/setarClasses.ts
  - src/domain/sourceArchive.ts
  - src/domain/recordings.ts
  - src/store/archiveIndex.ts
  - src/store/gitRemote.ts
  - src/store/syncEngine.ts
  - src/store/githubSync.ts
  - src/store/idb.ts
  - src/store/backup.ts
  - scripts/scan-setar-classes.mjs
  - scripts/publish-setar-index.mjs
  - scripts/run-setar-index.sh
  - package.json
  - package-lock.json
  - vite.config.ts
  - public/**
nonGoals:
  - The core loop remains one item, one mode, one focus, one result, one next
    action. Working notes stay in their existing canonical home and use the
    acknowledged, item-tagged editor.
  - No scheduling/scoring/SM-2, review-completion, snooze, session-plan or
    routine timing changes. Administration is not practice evidence.
  - One instrument per Today session, peer Plan/Routines doorways above the
    recommendation, title-only Quick add and progressive one-step full creation;
    no newly required metadata. Start under 30 seconds, close under 60 seconds.
  - Local-first/offline, no gamification/backend/account, NAS media remains
    references only, device secrets never enter saved data. Existing sync,
    revision, attachment and unfinished-session protections remain intact.
  - No mutation of real owner data during investigation/tests and no widening
    the v13 retired-text waiver.
  - NAS fingerprinting, archive-v2, relocation maps, scanner/publisher
    deployment, polling changes, media-file renames and refresh-transaction
    redesign. A genuinely new archive defect needs a separately scoped decision,
    not opportunistic expansion here.
  - Generic metadata ontology, biographies/credits graph, term merge wizard,
    fuzzy identity inference, many-layer provenance framework, destructive bulk
    normalisation and automated deduplication of owner items.
  - New preferred-pathway settings, dedicated Forms taxonomy/pathway,
    foundation-pathway product, legacy reorganisation wizard or automatic
    replacement of existing Setar organisation.
  - Scheduling/practice-engine changes, analytics/report feature redesign, new
    sync/backup architecture, new dependencies, and whole-repo component
    rewrites.
  - No implementation, imported lane, issue, branch or PR is created by this
    planning session.
acceptanceChecks:
  - id: ac-1
    description: Legacy/current/partial v15 fixtures migrate identically across
      clocks and repeated runs, preserve authored strings and IDs, leave
      deliberately empty collections empty and handle pre-v3 seeding
      deterministically. No new deletion waiver.
    test: repertoire v15 migration is deterministic idempotent and lossless
  - id: ac-2
    description: Wrong types, duplicate new IDs, wrong-kind/dangling term refs and
      invalid binding/suppression records refuse installation, while
      unknown/ambiguous legacy strings remain exact and usable.
    test: repertoire identity validation refuses malformed state without discarding
      legacy evidence
  - id: ac-3
    description: Curated unique aliases group Shur and شور; ambiguous names,
      composites and substrings never establish identity. Renamed and archived
      terms retain stable references; broader search matching does not change
      ownership.
    test: musical term resolution separates exact identity from broad search
  - id: ac-4
    description: Real add/rename/alias/archive/restore/delete controls preserve
      references across reload, refuse referenced/built-in deletion and alias
      collisions, and retain drafts through failed acknowledged saves and retry.
    test: musical term management preserves identities and reports durable saves
      honestly
  - id: ac-5
    description: Combined query/facets find terms, maestros, sources, raw text and
      existing archive aliases; title-only Persian full pieces remain visible,
      parents occur once, matching parts expose their parent and empty results
      are clear.
    test: repertoire discovery includes every eligible work without duplicate parents
  - id: ac-6
    description: Rendered My repertoire, All practice items and Start share text
      matching but retain eligibility differences; switching views and
      back/forward preserve browse state without changing Today's session
      instrument.
    test: repertoire navigation restores browse context without changing session
      scope
  - id: ac-7
    description: Reference Add/Start/row/progress/course-file consumers agree after
      detach, move, stage/path deletion and reload; repeat stale Add reuses one
      item; same generic keys across distinct contexts never conflate.
    test: catalogue identity survives placement changes across every consumer
  - id: ac-8
    description: Link existing preserves all owner fields; ambiguous legacy matches
      and duplicates require an explicit choice, never first-match/title
      merging. Several references can deliberately reuse one item;
      cross-instrument reuse refuses.
    test: catalogue linking preserves owner records and refuses ambiguous automatic
      reuse
  - id: ac-9
    description: Hiding/restoring survives reload and backup round trip, affects
      only reference visibility in its context, preserves explicitly placed and
      owned work, and keeps progress/next suggestion consistent without treating
      hidden work as done.
    test: hidden reference suggestions never delete or complete owned practice
  - id: ac-10
    description: Existing additive installation restores only missing selected
      defaults/stages, preserves edited rows and routines and never auto-reseeds
      on load. Archive/restore and repeated no-op actions are idempotent.
    test: pathway restoration remains explicit additive and lossless
  - id: ac-11
    description: Unlink reference and Remove from pathway retain notes, attachments,
      lesson/agenda/routine links, children, reviews and all history, even for a
      new never-practised item. No catalogue shortcut calls automatic item
      deletion.
    test: pathway removal keeps enriched and never practised owner items
  - id: ac-12
    description: One shared contextual Persian catalogue yields independent
      Setar/Tar instances; duplicate gusheh names stay scoped, new gusheh items
      receive modal metadata, and existing Guitar/Honarestan/Khonyagar
      work/material identities remain intact.
    test: Setar and Tar share reference definitions without sharing practice state
  - id: ac-13
    description: Upgrade leaves the old mixed Setar path, generic-form items, text,
      pins and routines unchanged. Explicitly adding the new radif view reuses
      proven bindings; Forms derives actual works from the term vocabulary and
      creates no generic form item.
    test: new Persian reference views preserve existing Setar organisation
  - id: ac-14
    description: Today, both SessionPlan derivations, Repertoire and PathwayDetail
      use the same visible ordered pathway and pinned stage, including
      archived/deleted pins and equal-order tie cases, without changing
      scheduling decisions.
    test: pathway context readers agree on visible routes and pinned stages
  - id: ac-15
    description: New source choices describe collections/materials; legacy kinds and
      hidden fields survive edit/export, session instrument defaults correctly,
      and known course-source renames reuse stable provenance while ambiguous
      candidates require choice.
    test: study sources clarify new choices without rewriting legacy meaning
  - id: ac-16
    description: "Every inbound door installs valid v15 and legacy fixtures
      consistently and refuses malformed/unsupported state before replacement:
      full/state-only import, fake-remote pull, Keep remote, archive restore,
      cold recovery and both hydration paths. Preserve existing
      byte/session/revision guards."
    test: every inbound door enforces the repertoire v15 boundary
  - id: ac-17
    description: Export/import and content hashing preserve terms/bindings/hides and
      custom strings. A disposable baseline v14 reader refuses a v15 backup
      without replacing state/blobs; current reader accepts prior backups.
    test: repertoire backups round trip and older readers refuse v15 safely
  - id: ac-18
    description: Source metadata adoption understands term-backed and literal fields
      while retaining raw source facts, owner edits and stale-premise refusals;
      archive identity/location/refresh outcomes remain unchanged for existing
      fixtures.
    test: musical metadata integration preserves archive reconciliation boundaries
  - id: ac-19
    description: Actual rendered Chromium/WebKit phone and desktop journeys exercise
      browse/edit/add/link/hide/restore/Tar/source/term flows plus
      Today/Start/Active/Close, reload/offline/failure states and all
      pageerrors. Assert real saved state as well as UI.
    test: the unified repertoire journey works in Chromium and WebKit
  - id: ac-20
    description: Chosen viewport mechanism handles retained focus, blur, repeated
      geometry changes, zoom, absent VisualViewport, route teardown and
      hardware-keyboard geometry without timer guesses, forced blur or scrolling
      loops. Expected geometry is fixture-authored, not copied from
      implementation.
    test: viewport recovery respects focus zoom and scroll ownership
  - id: ac-21
    description: Both engines demonstrate mixed-script wrapping, labelled controls,
      keyboard access, focus visibility, theme contrast, reflow and accessible
      empty/error states at phone/desktop widths; Today preserves the owner's
      ordering and visible recommendation.
    test: the shared practice shell remains accessible and readable across layouts
  - id: ac-22
    description: Before/after projections for term/source/reference/pathway
      administration leave practice history, item status/ratings/SM-2/dates,
      notes, reviews, agenda and unfinished block/routine/plan untouched apart
      from explicitly chosen organisation fields.
    test: repertoire administration never fabricates or resets practice evidence
  - id: ac-23
    description: Before first review, inspect the committed consumer/invariant
      matrix, independent fixture expectations and reproducible focused runner;
      every acceptance title maps to exactly one test, both engines actually
      ran, and proof limits are explicit.
    test: manual:OWNER
  - id: ac-24
    description: On the owner's actual iPhone Safari and installed PWA, record
      device/iOS version and before/after viewport traces, keyboard Done with
      retained focus, repeated opening/dismissal, scroll, rotation, route
      change, background/resume and zoom. Verify no residual lifted bar,
      occluded editing or lost text. Without device evidence this remains
      outstanding.
    test: manual:OWNER
  - id: ac-25
    description: Review the coherent phone/desktop journey and partial radif labels
      against source evidence. Confirm useful Forms browsing, maestro discovery,
      screen-reader/keyboard operation, Plan then Routines ordering and
      start/close budgets. Keep a pre-upgrade full backup; approve migration on
      a disposable copy before any real upgrade.
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - docs/product-spec.md
  - docs/repertoire-experience.md
  - README.md
createdAt: 2026-09-28T23:16:22.555Z
amendments: []
---

# Unify repertoire discovery, musical metadata and pathways around a calmer practice interface

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/39
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** b6bef3418572340c22e93deed79204878d45dc6d on main _(never re-baselined)_
- **Intent:** 20260928-unify-repertoire-discovery-musical-metad-1516

## You may only change

- src/App.tsx
- index.html
- src/styles/global.css
- src/styles/contrast.test.ts
- src/domain/types.ts
- src/domain/index.ts
- src/domain/factories.ts
- src/domain/labels.ts
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/seed.ts
- src/domain/pathwaySeed.ts
- src/domain/pathways.ts
- src/domain/courseSeed.ts
- src/domain/repertoire.ts
- src/domain/persian.ts
- src/domain/farsi.ts
- src/domain/selectors.ts
- src/domain/itemFiles.ts
- src/domain/sourceReconcile.ts
- src/domain/migrations.test.ts
- src/domain/io.test.ts
- src/domain/seedMigration.test.ts
- src/domain/pathways.test.ts
- src/domain/courseSeed.test.ts
- src/domain/repertoire.test.ts
- src/domain/persian.test.ts
- src/domain/farsi.test.ts
- src/domain/selectors.test.ts
- src/domain/itemFiles.test.ts
- src/domain/sourceReconcile.test.ts
- src/store/useStore.ts
- src/store/lookups.ts
- src/components/Layout.tsx
- src/components/ui.tsx
- src/components/ItemForm.tsx
- src/components/ItemCard.tsx
- src/components/ItemMaterial.tsx
- src/components/QuickAdd.tsx
- src/components/useViewportGuard.ts
- src/components/itemFields.ts
- src/components/itemFormValues.ts
- src/components/itemKinds.ts
- src/components/format.ts
- src/components/itemKinds.test.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/pages/Repertoire.tsx
- src/pages/ItemDetail.tsx
- src/pages/NewItem.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/Materials.tsx
- src/pages/More.tsx
- src/pages/Today.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/SessionPlan.tsx
- src/pages/Lessons.tsx
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/domain/musicTerms.ts
- src/domain/musicTerms.test.ts
- src/domain/referenceCatalog.ts
- src/domain/referenceCatalog.test.ts
- src/domain/studySources.ts
- src/domain/studySources.test.ts
- src/pages/MusicTerms.tsx
- src/components/MusicalTermField.tsx
- src/components/ReferenceChoices.tsx
- src/components/viewport.ts
- src/components/viewport.test.ts
- tests/practiceBrowser.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/repertoire-families.test.ts
- tests/fixtures/repertoire-legacy-v14.json
- tests/fixtures/repertoire-current-v15.json
- tests/fixtures/repertoire-family-expectations.json
- scripts/check-repertoire-families.mjs
- AGENTS.md
- DECISIONS.md
- docs/product-spec.md
- docs/repertoire-experience.md
- README.md

## Never touch

- .prismatica/**
- .agents/**
- .codex/**
- .github/**
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/plan.ts
- src/domain/practiceSignal.ts
- src/domain/practiceSession.ts
- src/domain/routines.ts
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- src/domain/setarClasses.ts
- src/domain/sourceArchive.ts
- src/domain/recordings.ts
- src/store/archiveIndex.ts
- src/store/gitRemote.ts
- src/store/syncEngine.ts
- src/store/githubSync.ts
- src/store/idb.ts
- src/store/backup.ts
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- package.json
- package-lock.json
- vite.config.ts
- public/**

## Non-goals

- The core loop remains one item, one mode, one focus, one result, one next action. Working notes stay in their existing canonical home and use the acknowledged, item-tagged editor.
- No scheduling/scoring/SM-2, review-completion, snooze, session-plan or routine timing changes. Administration is not practice evidence.
- One instrument per Today session, peer Plan/Routines doorways above the recommendation, title-only Quick add and progressive one-step full creation; no newly required metadata. Start under 30 seconds, close under 60 seconds.
- Local-first/offline, no gamification/backend/account, NAS media remains references only, device secrets never enter saved data. Existing sync, revision, attachment and unfinished-session protections remain intact.
- No mutation of real owner data during investigation/tests and no widening the v13 retired-text waiver.
- NAS fingerprinting, archive-v2, relocation maps, scanner/publisher deployment, polling changes, media-file renames and refresh-transaction redesign. A genuinely new archive defect needs a separately scoped decision, not opportunistic expansion here.
- Generic metadata ontology, biographies/credits graph, term merge wizard, fuzzy identity inference, many-layer provenance framework, destructive bulk normalisation and automated deduplication of owner items.
- New preferred-pathway settings, dedicated Forms taxonomy/pathway, foundation-pathway product, legacy reorganisation wizard or automatic replacement of existing Setar organisation.
- Scheduling/practice-engine changes, analytics/report feature redesign, new sync/backup architecture, new dependencies, and whole-repo component rewrites.
- No implementation, imported lane, issue, branch or PR is created by this planning session.

## Acceptance checks (definition of done)

- [ ] **ac-1** — Legacy/current/partial v15 fixtures migrate identically across clocks and repeated runs, preserve authored strings and IDs, leave deliberately empty collections empty and handle pre-v3 seeding deterministically. No new deletion waiver. _(proof: repertoire v15 migration is deterministic idempotent and lossless)_
- [ ] **ac-2** — Wrong types, duplicate new IDs, wrong-kind/dangling term refs and invalid binding/suppression records refuse installation, while unknown/ambiguous legacy strings remain exact and usable. _(proof: repertoire identity validation refuses malformed state without discarding legacy evidence)_
- [ ] **ac-3** — Curated unique aliases group Shur and شور; ambiguous names, composites and substrings never establish identity. Renamed and archived terms retain stable references; broader search matching does not change ownership. _(proof: musical term resolution separates exact identity from broad search)_
- [ ] **ac-4** — Real add/rename/alias/archive/restore/delete controls preserve references across reload, refuse referenced/built-in deletion and alias collisions, and retain drafts through failed acknowledged saves and retry. _(proof: musical term management preserves identities and reports durable saves honestly)_
- [ ] **ac-5** — Combined query/facets find terms, maestros, sources, raw text and existing archive aliases; title-only Persian full pieces remain visible, parents occur once, matching parts expose their parent and empty results are clear. _(proof: repertoire discovery includes every eligible work without duplicate parents)_
- [ ] **ac-6** — Rendered My repertoire, All practice items and Start share text matching but retain eligibility differences; switching views and back/forward preserve browse state without changing Today's session instrument. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-7** — Reference Add/Start/row/progress/course-file consumers agree after detach, move, stage/path deletion and reload; repeat stale Add reuses one item; same generic keys across distinct contexts never conflate. _(proof: catalogue identity survives placement changes across every consumer)_
- [ ] **ac-8** — Link existing preserves all owner fields; ambiguous legacy matches and duplicates require an explicit choice, never first-match/title merging. Several references can deliberately reuse one item; cross-instrument reuse refuses. _(proof: catalogue linking preserves owner records and refuses ambiguous automatic reuse)_
- [ ] **ac-9** — Hiding/restoring survives reload and backup round trip, affects only reference visibility in its context, preserves explicitly placed and owned work, and keeps progress/next suggestion consistent without treating hidden work as done. _(proof: hidden reference suggestions never delete or complete owned practice)_
- [ ] **ac-10** — Existing additive installation restores only missing selected defaults/stages, preserves edited rows and routines and never auto-reseeds on load. Archive/restore and repeated no-op actions are idempotent. _(proof: pathway restoration remains explicit additive and lossless)_
- [ ] **ac-11** — Unlink reference and Remove from pathway retain notes, attachments, lesson/agenda/routine links, children, reviews and all history, even for a new never-practised item. No catalogue shortcut calls automatic item deletion. _(proof: pathway removal keeps enriched and never practised owner items)_
- [ ] **ac-12** — One shared contextual Persian catalogue yields independent Setar/Tar instances; duplicate gusheh names stay scoped, new gusheh items receive modal metadata, and existing Guitar/Honarestan/Khonyagar work/material identities remain intact. _(proof: Setar and Tar share reference definitions without sharing practice state)_
- [ ] **ac-13** — Upgrade leaves the old mixed Setar path, generic-form items, text, pins and routines unchanged. Explicitly adding the new radif view reuses proven bindings; Forms derives actual works from the term vocabulary and creates no generic form item. _(proof: new Persian reference views preserve existing Setar organisation)_
- [ ] **ac-14** — Today, both SessionPlan derivations, Repertoire and PathwayDetail use the same visible ordered pathway and pinned stage, including archived/deleted pins and equal-order tie cases, without changing scheduling decisions. _(proof: pathway context readers agree on visible routes and pinned stages)_
- [ ] **ac-15** — New source choices describe collections/materials; legacy kinds and hidden fields survive edit/export, session instrument defaults correctly, and known course-source renames reuse stable provenance while ambiguous candidates require choice. _(proof: study sources clarify new choices without rewriting legacy meaning)_
- [ ] **ac-16** — Every inbound door installs valid v15 and legacy fixtures consistently and refuses malformed/unsupported state before replacement: full/state-only import, fake-remote pull, Keep remote, archive restore, cold recovery and both hydration paths. Preserve existing byte/session/revision guards. _(proof: every inbound door enforces the repertoire v15 boundary)_
- [ ] **ac-17** — Export/import and content hashing preserve terms/bindings/hides and custom strings. A disposable baseline v14 reader refuses a v15 backup without replacing state/blobs; current reader accepts prior backups. _(proof: repertoire backups round trip and older readers refuse v15 safely)_
- [ ] **ac-18** — Source metadata adoption understands term-backed and literal fields while retaining raw source facts, owner edits and stale-premise refusals; archive identity/location/refresh outcomes remain unchanged for existing fixtures. _(proof: musical metadata integration preserves archive reconciliation boundaries)_
- [ ] **ac-19** — Actual rendered Chromium/WebKit phone and desktop journeys exercise browse/edit/add/link/hide/restore/Tar/source/term flows plus Today/Start/Active/Close, reload/offline/failure states and all pageerrors. Assert real saved state as well as UI. _(proof: the unified repertoire journey works in Chromium and WebKit)_
- [ ] **ac-20** — Chosen viewport mechanism handles retained focus, blur, repeated geometry changes, zoom, absent VisualViewport, route teardown and hardware-keyboard geometry without timer guesses, forced blur or scrolling loops. Expected geometry is fixture-authored, not copied from implementation. _(proof: viewport recovery respects focus zoom and scroll ownership)_
- [ ] **ac-21** — Both engines demonstrate mixed-script wrapping, labelled controls, keyboard access, focus visibility, theme contrast, reflow and accessible empty/error states at phone/desktop widths; Today preserves the owner's ordering and visible recommendation. _(proof: the shared practice shell remains accessible and readable across layouts)_
- [ ] **ac-22** — Before/after projections for term/source/reference/pathway administration leave practice history, item status/ratings/SM-2/dates, notes, reviews, agenda and unfinished block/routine/plan untouched apart from explicitly chosen organisation fields. _(proof: repertoire administration never fabricates or resets practice evidence)_
- [ ] **ac-23** — Before first review, inspect the committed consumer/invariant matrix, independent fixture expectations and reproducible focused runner; every acceptance title maps to exactly one test, both engines actually ran, and proof limits are explicit. _(proof: manual:OWNER)_
- [ ] **ac-24** — On the owner's actual iPhone Safari and installed PWA, record device/iOS version and before/after viewport traces, keyboard Done with retained focus, repeated opening/dismissal, scroll, rotation, route change, background/resume and zoom. Verify no residual lifted bar, occluded editing or lost text. Without device evidence this remains outstanding. _(proof: manual:OWNER)_
- [ ] **ac-25** — Review the coherent phone/desktop journey and partial radif labels against source evidence. Confirm useful Forms browsing, maestro discovery, screen-reader/keyboard operation, Plan then Routines ordering and start/close budgets. Keep a pre-upgrade full backup; approve migration on a disposable copy before any real upgrade. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- docs/product-spec.md
- docs/repertoire-experience.md
- README.md

## Amendments

_none_

