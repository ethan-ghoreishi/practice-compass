---
id: 20261005-make-setar-archive-recovery-repertoire-c-e964
title: Make Setar archive recovery, repertoire corrections and iPhone practice
  reliable
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/45
intent: 20261005-make-setar-archive-recovery-repertoire-c-e964
tier: heavy
stage: build
baseline:
  commit: 93dadcb10cbda2650a53829b76538bcd6b25e133
  branch: main
branch: change/20261005-make-setar-archive-recovery-repertoire-c-e964
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261005-make-setar-archive-recovery-repertoire-c-e964
builder: claude
planHash: b5e609c16834ff8bf1d79e149c10a974c685b4ce9252dbd9e4fa262b3d1e2380
allowedPaths:
  - AGENTS.md
  - DECISIONS.md
  - docs/setar-archive.md
  - docs/nas-topology.md
  - docs/repertoire-experience.md
  - docs/setar-practice-reliability.md
  - scripts/scan-setar-classes.mjs
  - scripts/check-setar-practice-families.mjs
  - src/domain/sourceArchive.ts
  - src/domain/sourceReconcile.ts
  - src/domain/setarSetup.ts
  - src/domain/itemFiles.ts
  - src/domain/musicTerms.ts
  - src/domain/types.ts
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/index.ts
  - src/store/useStore.ts
  - src/store/archiveIndex.ts
  - src/components/ArchiveRefresh.tsx
  - src/components/SetarSetupReview.tsx
  - src/components/MusicalTermField.tsx
  - src/components/ItemMaterial.tsx
  - src/components/practiceCue.ts
  - src/components/useScreenAwake.ts
  - src/components/RoutineDuration.tsx
  - src/pages/Lessons.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/StageDetail.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/Today.tsx
  - src/pages/StartBlock.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/Settings.tsx
  - src/styles/global.css
  - src/domain/sourceReconcile.test.ts
  - src/domain/setarSetup.test.ts
  - src/domain/io.test.ts
  - src/domain/migrations.test.ts
  - src/domain/musicTerms.test.ts
  - src/domain/practiceSignal.test.ts
  - src/domain/referenceCatalog.test.ts
  - src/domain/itemFiles.test.ts
  - src/store/archiveIndex.test.ts
  - src/components/practiceCue.test.ts
  - src/components/screenAwake.test.ts
  - src/components/direction.test.ts
  - tests/setar-practice-source.test.ts
  - tests/setar-practice-inbound.browser.test.ts
  - tests/setar-practice.browser.test.ts
  - tests/setar-practice-relations.test.ts
  - tests/setar-practice-proof.test.ts
  - tests/musical-term-suggestions.browser.test.ts
  - tests/practice-cues.browser.test.ts
  - tests/setarArchive.browser.test.ts
  - tests/setarInbound.browser.test.ts
  - tests/repertoire-experience.browser.test.ts
  - tests/repertoire-inbound.browser.test.ts
  - tests/agent-context.test.ts
  - tests/owned-writes.test.ts
  - tests/fixtures/setar-practice-source-v1.json
  - tests/fixtures/setar-practice-source-expectations.json
  - tests/fixtures/setar-practice-owner-v15.json
  - tests/fixtures/setar-practice-owner-v16.json
  - tests/fixtures/setar-practice-setup-expectations.json
  - tests/practice-information.browser.test.ts
forbiddenPaths:
  - .github/**
  - src/domain/courseData.ts
  - src/domain/khonyagarData.ts
  - scripts/deploy-nas.sh
  - scripts/nas-mirror.mjs
  - scripts/publish-setar-index.mjs
  - scripts/run-setar-index.sh
  - package.json
  - package-lock.json
nonGoals:
  - One item, one mode, one focus, one result, one next action; two ordinary
    creation doors; optional low-admin metadata.
  - Byte-exact source keys, deterministic source ids, stable catalogue refs,
    legacy text, and distinct placement/binding/owned work.
  - Archive facts never fabricate learning, recorded practice, results, reviews,
    progress or deadlines; imported classes remain history.
  - Review scheduling authority, only-close review advancement,
    unfinished-practice replacement guards and attachment-byte safety.
  - IndexedDB truth, explicit whole-snapshot GitHub conflicts, independent
    backups, device-local secrets/base, free/offline operation and current CSP.
  - Shared pure domain decisions, acknowledged saves, existing
    wall-clock/marker/skip rules and single wake-lock ownership.
  - Real-media read-only investigation/testing, no symlink following, fabricated
    filename identity, destructive archive operations, retired deployment or
    rsync --delete.
  - No backend/push service/auth/native app/paid service/dependency, second
    timer, audio analysis or background alarm guarantee.
  - No fingerprinting, fuzzy relocation, archive identity/protocol redesign, app
    NAS crawler, branch/path changes, sync redesign or second importer. Optional
    studySource is the only saved shape extension.
  - No automatic bulk repair, title merge/source deduplication, deletion as an
    inverse, overwrite of unrelated fields or interpretation of source prose as
    authority.
  - No live media/registry/log/browser-data/GitHub writes by the planner or
    automated builder investigation; only the owner applies reviewed generic
    source metadata drafts and selected private-data changes.
  - No general cleanup, viewport redesign, canon expansion, course regeneration,
    infrastructure redesign or unrelated AGENTS open-gap fixes.
  - No unwired readIndexFile UI, generalized registry administration,
    metadata-decision ledger or new recovery-history collection.
acceptanceChecks:
  - id: ac-1
    description: "tests/setar-practice-source.test.ts: run the scanner's generic
      --attention CLI on temporary corpora, stdout-only versus refused --out,
      checking a normal unchanged scan has identical source semantics. Use
      real/reordered/quoted ten-column headers with extra columns and existing
      notes/roster cells. Report new key/observed session/role, clearly
      unconfirmed drafts and minimal actionable next step; apply independently
      authored OWNER-confirmed metadata patches on temp fixtures only, then
      rescan. Session 40's two keys and Session 1's three continuations remain
      regressions. Add parameterised 41/42/non-consecutive future numbers and
      wholly new identities; known piece/new session requires no redundant
      registration for named files, whereas unnamed demos require a confirmed
      roster. No developer-generated per-session worksheet, hard-coded future
      key or inferred roster may pass. Cross unknown/registered keys,
      absent/correct/inconsistent rosters, numeric demo parts, personal takes,
      duplicate keys, quoted commas, cycle/fork/cross-session moves, same-path
      role-compatible byte replacement, additions/omissions and interrupted
      reads. Independently authored expectations prove scopes and unchanged
      fixture media bytes under report/scan; only fixture owner steps change
      source metadata. Unknown recognised named files with empty/non-empty
      registry rosters block inferred demo attribution even if filtered earlier;
      correct registration plus confirmed roster restores it. Invalid inputs
      explain or fail safely without publishing a partial draft as confirmed.
      Repeating a correct report/scan/owner patch is idempotent. Removing
      disagreement checks or substituting positional CSV append must fail this
      named test."
    test: setar durable intake preserves registry authority and exact rename
      evidence without changing media
  - id: ac-2
    description: One named acceptance in
      tests/setar-practice-inbound.browser.test.ts owns the matrix, with
      uniquely named supporting domain tests. Missing/empty/known/unknown versus
      null/number/object studySource runs through scanner/digest,
      parseSourceIndex, fetch/file decoder, checkSourceGraph, validateDB, both
      persist migrate/merge, state/full import, pull, Keep remote, archive
      restore and cold recovery. Base-HEAD reader accepts the additive v1 index
      without changed old meanings and safely refuses v16 DB. Clock-free
      idempotent migration retains missing evidence. Compare canonical
      export/hash and attachment bytes, malformed refusal before blob
      replacement, too-new refusal and unfinished-practice guards. Chromium
      blobs; WebKit state-only.
    test: setar study provenance survives compatible indexes and every saved data
      boundary
  - id: ac-3
    description: "tests/setar-practice.browser.test.ts: Chromium/WebKit ×
      phone/desktop × piece/session/link/global-resource/item-scoped-resource ×
      current/missing entity. Include one shared path hidden on two different
      items, deletion versus manual class, stale preview and
      failed-save/retry/reload/reinstall. Only selected tuple clears; Class 40
      source facts return once without claiming recovery of deleted notes/files.
      Normal Refresh never resurrects suppressed data, and no-op UI still shows
      attention counts. Include future sessions and simultaneous source changes;
      generic restoration is never special-cased to 40."
    test: setar recovery restores only the selected suppression through owner
      controls
  - id: ac-4
    description: "tests/setar-practice.browser.test.ts: actual scanner-built fixture
      → injected publisher → fake GitHub SHA-pinned fetch → digest/graph →
      controls/commit → Lessons and both pieces. Cross
      unchanged/interrupted/racing publication, intentionally stale publication,
      refused digest and Skip/link/hide. Each PDF scopes to its piece, demo to
      confirmed roster, class recording to lesson, personal takes to no material
      list. Verify commit/hash displayed and unrelated practice preserved. No
      live credential/network/NAS request. Repeat the full control journey with
      independently constructed Session 41/42/non-consecutive folders and new
      keys: attention → generic report/draft → explicit fixture owner
      confirmation → scanner → injected existing publisher → SHA-pinned refresh
      → source-bound item/lesson material. Add registered PDFs/videos, unnamed
      demos, role change, multi-hop exact rename, omissions and same-path byte
      replacement. A unchanged semantic hash on same-size replacement is
      intentional: the reference still targets current NAS bytes, with no
      fingerprint/cache identity invention. Temporary fake media
      endpoints/targets may prove resolver mechanics, never live NAS
      audibility/reachability. Unresolved keys/rosters/renames show the minimal
      safe action and import only the independently supported facts; no fresh
      code lane is needed. Future-dated imported lessons remain archive history,
      new items remain dormant with zero practice, and neither roster nor
      catalogue placement implies a preparation deadline or review progress."
    test: setar publish fetch and refresh carry source corrections to lessons and
      item material
  - id: ac-5
    description: "src/domain/sourceReconcile.test.ts: source-generated
      resources/authored refs/legacy prefixes/verified and foreign URLs ×
      single/multi-hop/cross-session/unlogged/cyclic/forked renames ×
      absent/present destination × global/item-scoped hide. Independently assert
      adoption, retainMissing, path repair, suppression re-key,
      lessonFiles/itemFiles. Generated Class 1 names/roles/scopes change only on
      exact evidence; authored ids/titles/notes survive. Unlogged rows remain
      labelled not described. Repeat is a no-op; degraded→full source recovers
      without owner loss. Cross future session numbers/new keys and
      namespace-compatible role changes; app parsing a filename or silently
      matching disappeared/added paths cannot pass."
    test: setar rename consumers preserve authored metadata and never infer missing
      provenance
  - id: ac-6
    description: "tests/setar-practice-relations.test.ts:
      explicit/derived/both/unresolved membership × same title/different
      id/instrument × unavailable/deleted entities × suppression scopes. One
      selector serves Lessons, Connected to, lesson summary, Connections and
      linkable choices without duplicate ids. Browser companion drives
      Unlink/Relink/reload: derived relink clears only its link suppression,
      never copies source membership into itemIds/agenda. Independently scoped
      material and authored manual associations remain."
    test: setar association readers agree without copying source membership into
      owner history
  - id: ac-7
    description: "src/domain/sourceReconcile.test.ts: every field ×
      unchanged/changed relevant source/unrelated hash churn/first
      adoption/disappearance/reappearance × empty/literal/ref/unique
      alias/ambiguous/composite × generic (قطعه)/gusheh hyphen-ZWNJ/provisional
      confidence. Keep reported بسته‌نگار and ضربی exactly. Keep mine settles
      through repeat/reload/reinstall using accepted graph; Review differences
      stays opt-in. Assert summaries/write agreement, object identity and rev on
      no-op."
    test: setar metadata refresh offers only new meaningful source proposals
  - id: ac-8
    description: "src/store/archiveIndex.test.ts with uniquely named control
      companion: all four fields × typed empty/literal/ref × term rename/meaning
      change/same-label different-id × deleted/rebound/moved item/proposal
      drift/unrelated notes. UI passes typed premise/proposal; stale choices
      cause fresh preview and zero overwrite. Correct the existing test
      endorsing label identity. Chosen fields write once, untouched fields
      survive and failed persistence retries durably."
    test: setar metadata choices refuse every changed identity and premise before a
      write
  - id: ac-9
    description: "src/domain/setarSetup.test.ts: independently declared ordinary
      gushehs/six daramads/two chaharpareh contexts/etude/exercise/personal-only
      improv/parts/technique/unknown/provisional/composite ×
      missing/custom/conflicting stages × partial/missing/shared Setar-Tar refs
      × duplicate/other-recension materials. Status, kind, placement, reference,
      source and class proposals stay separate. Radif provenance alone cannot
      classify kind and form-category refs never identify works. New import
      defaults preserve dormant/zero practice; pre-existing exceptions are
      reviewed, never deleted."
    test: setar setup proposals distinguish learning organisation and source evidence
  - id: ac-10
    description: "src/domain/setarSetup.test.ts plus store support:
      correct/selected/excluded/later-arriving rows ×
      instrument/pathway/rev/typed-premise drift × conflicting legacy/live refs
      × validation/save failure and retry. Apply exact displayed ids/fields in
      one set. Compare ALL untouched
      notes/history/reviews/dates/provenance/ratings/counts/clocks/routines/pla\
      ns/attachments and bytes. Create selected source once, never
      cross-instrument/title-deduplicate. Written states pass validateDB
      round-trip; completed repeat has same object/rev."
    test: setar setup commits selected rows atomically idempotently and without
      collateral changes
  - id: ac-11
    description: "tests/setar-practice.browser.test.ts: synthetic owner-shaped
      fixtures, actual review controls, distinct Keeping fresh batch/exclusions
      and duplicate-source/ambiguous-stage choices. Change unrelated data during
      preview, fail/retry save, reload and repeat in both engines.
      Evidence/before/after visible; Saved waits for acknowledgement. No private
      owner dump, debug hook or source-regex journey; no unseen row joins
      selection."
    test: setar setup review is usable through controls and survives interruption
  - id: ac-12
    description: "tests/musical-term-suggestions.browser.test.ts: new/edit × three
      fields × phone/desktop × Chromium/WebKit. Type partial
      Farsi/Latin/name/alias; select VISIBLE matches by touch/click/keyboard;
      browse all/clear/unknown/composite/ambiguous/composition input. Include
      custom/renamed/archived terms, preserved other literals, focus/blur and no
      premature submit, reload/offline. Finished-name fill or option-markup
      existence cannot pass."
    test: musical term suggestions can be found and selected while typing in both
      engines
  - id: ac-13
    description: "One exact test in tests/setar-practice.browser.test.ts with
      uniquely named term companion: both engines/light-dark/390x844/long
      mismatched-language text/large text/keyboard focus/44px actions. Extend
      literal-dir ledgers; verify independently directed values and start
      alignment. Only main scrolls; no fixed/sticky/guessed viewport workaround;
      drafts remain usable. Existing contrast and instruction budget gates stay
      green."
    test: portable term and recovery controls preserve direction focus and scroll
      ownership
  - id: ac-14
    description: "One acceptance in tests/practice-cues.browser.test.ts, supported
      by src/components/practiceCue.test.ts: BEFORE behaviour edits, drive
      current mounted Start/Resume and natural target controls and record the
      evidenced marker→cue→new context/no resume failure, rather than inferring
      integration from a pure signal test. Corrected entry matrix covers Today
      recommendation/review/direct, StartBlock, item/next, stage, routine
      cards/duration/essentials, pending-plan creation versus each initial/later
      Begin, ActiveBlock/CloseBlock/RoutineRunner Resume, Settings Test sound
      and practice-screen sound recovery. Inject AudioContext/vibration/wake
      ports and observe constructor/resume invocation synchronously inside the
      click before awaits/navigation; later boundaries reuse the same context.
      Observe oscillator→gain→destination, bounded two-pulse start/stop/envelope
      and node cleanup. Bare routine URL requires Start; card Start remains one
      tap; existing clock routes never replace/restart work. Update and rerun
      the existing routine Working-notes journey without dropping ownership
      assertions. Running/suspended/interrupted/closed/unsupported/constructor
      throw/resume throw/reject/never-settle/concurrent repeated gestures and
      refused-dual-clock cases cannot leak/stack contexts, block practice,
      falsely claim audible output, queue old tones or change saved data.
      Test/recovery cue changes neither clocks/markers/wake lock nor history.
      Add one smoke route using the real browser WebAudio engine with normal
      policy, observing running state and scheduled completion; no forced
      autoplay flag or hardware-audibility assertion. Real PWA speaker/mute
      behaviour remains OWNER."
    test: practice sound reuses one gesture primed context across all start and
      resume doors
  - id: ac-15
    description: "tests/practice-cues.browser.test.ts: fixed-clock
      block/plan/routine × natural
      target/intermediate/final/pause-resume/zero-time repeated
      skips/multi-boundary background catch-up/reload/absent marker. Drive
      actual mounted screens and record marker claim, visual state, cue attempt
      and saved outcome in order. Normal foreground reached boundaries produce
      exactly one claim/cue attempt; jump across multiple boundaries produces
      ONE catch-up attempt, not one per missed boundary. Replay the same
      captured effect, development StrictMode setup/remount, navigation,
      concurrent observation, stale/replaced/paused clock, final-save/cancel
      interleavings and a failed/pending/interrupted audio path. Only an atomic
      still-current-clock claim may attempt sound; consumed boundaries never
      replay on audio recovery or Resume, and Skip never cues. Persistent visual
      target/overtime/window survives unsupported sound. Independent wall-clock
      expectations match ALL saved minutes/results/reviews; blocks never
      auto-finish and existing routine completion/working-note ownership remains
      unchanged. Include actual store-marker methods, not an in-test model or
      source regex. Pure nextSignal/wake checks support mechanics; they cannot
      certify mounted effect exactly-once or hardware audibility."
    test: practice cues preserve wall clock boundaries and every recorded minute
  - id: ac-16
    description: "tests/setar-practice.browser.test.ts: Add→visible Remove→hidden
      Restore→Play, fresh/enriched/practised × ordinary/shared radif/course ×
      second pathway × placed-unlinked/ambiguous legacy. Same id,
      notes/history/reviews/files/source/class/routine links survive. Only
      selected pathway visibility/placement changes; bindings stay; repeat
      Add/Restore cannot duplicate. Sweep
      stage/progress/next/currentStage/Today/plan/routine visibility.
      Unlink/Delete remain distinct."
    test: pathway removal and restoration visibly retain the existing owned item
  - id: ac-17
    description: tests/setar-practice-proof.test.ts checks the focused runner's
      list/manifest mode without recursively running itself. node
      scripts/check-setar-practice-families.mjs resolves titles one-to-one and
      runs committed fixtures/fixed seeds/clocks and both-engine control
      companions through practiceBrowser; missing browsers fail, all page errors
      remain, private Vite caches. Before first review record named failure for
      individually dropping provenance at scanner/decoder/inbound sites,
      widening restoration scope, missing relation consumer, same-label
      premises, reoffering unchanged metadata, bypassing selected-patch guard,
      omitted gesture door, datalist-only selection and delete/unbind removal.
      Restore each temporary mutation; source scans/documentation alone cannot
      prove behaviour. Extend mutations to a hard-coded session ceiling/key,
      auto-confirmed roster/draft, malformed header-preservation, unlogged
      rename guess, per-boundary context recreation, missing resume/state gate,
      unconditional marker claim or effect replay, queued delayed sound, and
      moving routine Start back into an effect. Each targeted mutation must fail
      the corresponding focused behavioural check and leave unrelated tests out
      of the proof argument. Include the future-intake report and actual pre-fix
      cue trace in the reader/writer matrix before implementation.
    test: setar practice family proof rejects targeted partial fixes before review
  - id: ac-18
    description: "Preserve one bounded real-device session: Mac normal browser plus
      iPhone Safari and installed PWA over verified secure context, recording
      build/browser/iOS/keyboard/output route and volume. iPhone checks partial
      Farsi/Latin term selection/draft retention/native keyboard dismissal. On
      each platform use Test sound, then short foreground block and routine
      boundaries, Pause/Resume and one background/lock-return interruption.
      Compare actual audibility/clear two-pulse recognition at normal media
      volume with the visual cue; record observed mute/output/interruption
      behaviour and recovery gesture with context state, never a locked-screen
      deadline guarantee. Starting a routine from its card stays one tap.
      Hardware/OS policy/native keyboard are the only reasons this is OWNER: all
      entry wiring, waveform scheduling, boundaries, persistence and
      interruption mechanics are automated. Unmerged v16 preview uses isolated
      data/origin with no real sync; retain native Safari versus installed PWA
      evidence separately."
    test: manual:OWNER
  - id: ac-19
    description: "Preserve one bounded live recovery/intent check: owner uses the
      SAME generic intake report/runbook that future sessions use,
      reviews/applies the two confirmed Session 40 registry declarations/roster
      and three Session 1 exact log continuations, updates all three NAS runtime
      files after compatible app deployment, runs the existing job and compares
      publication/commit/hash with Refresh. Explicitly restore Class 40 and open
      both PDFs/three ordered demos from Lessons and intended source-bound items
      on Mac/iPhone. Review actual private-data exceptions before selected Setar
      correction. No additional real future class is required for OWNER:
      synthetic future numbers/new identities/changed files and report/actions
      are automated. Builder supplies generic read-only comparison/reporting
      rather than a bespoke repair worksheet; real DSM/Drive/media reachability,
      genuine old→new declarations and musical intent remain OWNER. Re-import
      cannot recover deleted notes/bytes; independent backup is needed. No
      automated media/registry/log writes, retired deployment, deletion or
      credential logging."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - docs/setar-archive.md
  - docs/nas-topology.md
  - docs/repertoire-experience.md
  - docs/setar-practice-reliability.md
createdAt: 2026-10-05T17:25:58.132Z
amendments: []
---

# Make Setar archive recovery, repertoire corrections and iPhone practice reliable

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/45
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 93dadcb10cbda2650a53829b76538bcd6b25e133 on main _(never re-baselined)_
- **Intent:** 20261005-make-setar-archive-recovery-repertoire-c-e964

## You may only change

- AGENTS.md
- DECISIONS.md
- docs/setar-archive.md
- docs/nas-topology.md
- docs/repertoire-experience.md
- docs/setar-practice-reliability.md
- scripts/scan-setar-classes.mjs
- scripts/check-setar-practice-families.mjs
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.ts
- src/domain/setarSetup.ts
- src/domain/itemFiles.ts
- src/domain/musicTerms.ts
- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/index.ts
- src/store/useStore.ts
- src/store/archiveIndex.ts
- src/components/ArchiveRefresh.tsx
- src/components/SetarSetupReview.tsx
- src/components/MusicalTermField.tsx
- src/components/ItemMaterial.tsx
- src/components/practiceCue.ts
- src/components/useScreenAwake.ts
- src/components/RoutineDuration.tsx
- src/pages/Lessons.tsx
- src/pages/ItemDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/PathwayDetail.tsx
- src/pages/Today.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/SessionPlan.tsx
- src/pages/Settings.tsx
- src/styles/global.css
- src/domain/sourceReconcile.test.ts
- src/domain/setarSetup.test.ts
- src/domain/io.test.ts
- src/domain/migrations.test.ts
- src/domain/musicTerms.test.ts
- src/domain/practiceSignal.test.ts
- src/domain/referenceCatalog.test.ts
- src/domain/itemFiles.test.ts
- src/store/archiveIndex.test.ts
- src/components/practiceCue.test.ts
- src/components/screenAwake.test.ts
- src/components/direction.test.ts
- tests/setar-practice-source.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-practice-relations.test.ts
- tests/setar-practice-proof.test.ts
- tests/musical-term-suggestions.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/agent-context.test.ts
- tests/owned-writes.test.ts
- tests/fixtures/setar-practice-source-v1.json
- tests/fixtures/setar-practice-source-expectations.json
- tests/fixtures/setar-practice-owner-v15.json
- tests/fixtures/setar-practice-owner-v16.json
- tests/fixtures/setar-practice-setup-expectations.json
- tests/practice-information.browser.test.ts

## Never touch

- .github/**
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- scripts/deploy-nas.sh
- scripts/nas-mirror.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- package.json
- package-lock.json

## Non-goals

- One item, one mode, one focus, one result, one next action; two ordinary creation doors; optional low-admin metadata.
- Byte-exact source keys, deterministic source ids, stable catalogue refs, legacy text, and distinct placement/binding/owned work.
- Archive facts never fabricate learning, recorded practice, results, reviews, progress or deadlines; imported classes remain history.
- Review scheduling authority, only-close review advancement, unfinished-practice replacement guards and attachment-byte safety.
- IndexedDB truth, explicit whole-snapshot GitHub conflicts, independent backups, device-local secrets/base, free/offline operation and current CSP.
- Shared pure domain decisions, acknowledged saves, existing wall-clock/marker/skip rules and single wake-lock ownership.
- Real-media read-only investigation/testing, no symlink following, fabricated filename identity, destructive archive operations, retired deployment or rsync --delete.
- No backend/push service/auth/native app/paid service/dependency, second timer, audio analysis or background alarm guarantee.
- No fingerprinting, fuzzy relocation, archive identity/protocol redesign, app NAS crawler, branch/path changes, sync redesign or second importer. Optional studySource is the only saved shape extension.
- No automatic bulk repair, title merge/source deduplication, deletion as an inverse, overwrite of unrelated fields or interpretation of source prose as authority.
- No live media/registry/log/browser-data/GitHub writes by the planner or automated builder investigation; only the owner applies reviewed generic source metadata drafts and selected private-data changes.
- No general cleanup, viewport redesign, canon expansion, course regeneration, infrastructure redesign or unrelated AGENTS open-gap fixes.
- No unwired readIndexFile UI, generalized registry administration, metadata-decision ledger or new recovery-history collection.

## Acceptance checks (definition of done)

- [ ] **ac-1** — tests/setar-practice-source.test.ts: run the scanner's generic --attention CLI on temporary corpora, stdout-only versus refused --out, checking a normal unchanged scan has identical source semantics. Use real/reordered/quoted ten-column headers with extra columns and existing notes/roster cells. Report new key/observed session/role, clearly unconfirmed drafts and minimal actionable next step; apply independently authored OWNER-confirmed metadata patches on temp fixtures only, then rescan. Session 40's two keys and Session 1's three continuations remain regressions. Add parameterised 41/42/non-consecutive future numbers and wholly new identities; known piece/new session requires no redundant registration for named files, whereas unnamed demos require a confirmed roster. No developer-generated per-session worksheet, hard-coded future key or inferred roster may pass. Cross unknown/registered keys, absent/correct/inconsistent rosters, numeric demo parts, personal takes, duplicate keys, quoted commas, cycle/fork/cross-session moves, same-path role-compatible byte replacement, additions/omissions and interrupted reads. Independently authored expectations prove scopes and unchanged fixture media bytes under report/scan; only fixture owner steps change source metadata. Unknown recognised named files with empty/non-empty registry rosters block inferred demo attribution even if filtered earlier; correct registration plus confirmed roster restores it. Invalid inputs explain or fail safely without publishing a partial draft as confirmed. Repeating a correct report/scan/owner patch is idempotent. Removing disagreement checks or substituting positional CSV append must fail this named test. _(proof: setar durable intake preserves registry authority and exact rename evidence without changing media)_
- [ ] **ac-2** — One named acceptance in tests/setar-practice-inbound.browser.test.ts owns the matrix, with uniquely named supporting domain tests. Missing/empty/known/unknown versus null/number/object studySource runs through scanner/digest, parseSourceIndex, fetch/file decoder, checkSourceGraph, validateDB, both persist migrate/merge, state/full import, pull, Keep remote, archive restore and cold recovery. Base-HEAD reader accepts the additive v1 index without changed old meanings and safely refuses v16 DB. Clock-free idempotent migration retains missing evidence. Compare canonical export/hash and attachment bytes, malformed refusal before blob replacement, too-new refusal and unfinished-practice guards. Chromium blobs; WebKit state-only. _(proof: setar study provenance survives compatible indexes and every saved data boundary)_
- [ ] **ac-3** — tests/setar-practice.browser.test.ts: Chromium/WebKit × phone/desktop × piece/session/link/global-resource/item-scoped-resource × current/missing entity. Include one shared path hidden on two different items, deletion versus manual class, stale preview and failed-save/retry/reload/reinstall. Only selected tuple clears; Class 40 source facts return once without claiming recovery of deleted notes/files. Normal Refresh never resurrects suppressed data, and no-op UI still shows attention counts. Include future sessions and simultaneous source changes; generic restoration is never special-cased to 40. _(proof: setar recovery restores only the selected suppression through owner controls)_
- [ ] **ac-4** — tests/setar-practice.browser.test.ts: actual scanner-built fixture → injected publisher → fake GitHub SHA-pinned fetch → digest/graph → controls/commit → Lessons and both pieces. Cross unchanged/interrupted/racing publication, intentionally stale publication, refused digest and Skip/link/hide. Each PDF scopes to its piece, demo to confirmed roster, class recording to lesson, personal takes to no material list. Verify commit/hash displayed and unrelated practice preserved. No live credential/network/NAS request. Repeat the full control journey with independently constructed Session 41/42/non-consecutive folders and new keys: attention → generic report/draft → explicit fixture owner confirmation → scanner → injected existing publisher → SHA-pinned refresh → source-bound item/lesson material. Add registered PDFs/videos, unnamed demos, role change, multi-hop exact rename, omissions and same-path byte replacement. A unchanged semantic hash on same-size replacement is intentional: the reference still targets current NAS bytes, with no fingerprint/cache identity invention. Temporary fake media endpoints/targets may prove resolver mechanics, never live NAS audibility/reachability. Unresolved keys/rosters/renames show the minimal safe action and import only the independently supported facts; no fresh code lane is needed. Future-dated imported lessons remain archive history, new items remain dormant with zero practice, and neither roster nor catalogue placement implies a preparation deadline or review progress. _(proof: setar publish fetch and refresh carry source corrections to lessons and item material)_
- [ ] **ac-5** — src/domain/sourceReconcile.test.ts: source-generated resources/authored refs/legacy prefixes/verified and foreign URLs × single/multi-hop/cross-session/unlogged/cyclic/forked renames × absent/present destination × global/item-scoped hide. Independently assert adoption, retainMissing, path repair, suppression re-key, lessonFiles/itemFiles. Generated Class 1 names/roles/scopes change only on exact evidence; authored ids/titles/notes survive. Unlogged rows remain labelled not described. Repeat is a no-op; degraded→full source recovers without owner loss. Cross future session numbers/new keys and namespace-compatible role changes; app parsing a filename or silently matching disappeared/added paths cannot pass. _(proof: setar rename consumers preserve authored metadata and never infer missing provenance)_
- [ ] **ac-6** — tests/setar-practice-relations.test.ts: explicit/derived/both/unresolved membership × same title/different id/instrument × unavailable/deleted entities × suppression scopes. One selector serves Lessons, Connected to, lesson summary, Connections and linkable choices without duplicate ids. Browser companion drives Unlink/Relink/reload: derived relink clears only its link suppression, never copies source membership into itemIds/agenda. Independently scoped material and authored manual associations remain. _(proof: setar association readers agree without copying source membership into owner history)_
- [ ] **ac-7** — src/domain/sourceReconcile.test.ts: every field × unchanged/changed relevant source/unrelated hash churn/first adoption/disappearance/reappearance × empty/literal/ref/unique alias/ambiguous/composite × generic (قطعه)/gusheh hyphen-ZWNJ/provisional confidence. Keep reported بسته‌نگار and ضربی exactly. Keep mine settles through repeat/reload/reinstall using accepted graph; Review differences stays opt-in. Assert summaries/write agreement, object identity and rev on no-op. _(proof: setar metadata refresh offers only new meaningful source proposals)_
- [ ] **ac-8** — src/store/archiveIndex.test.ts with uniquely named control companion: all four fields × typed empty/literal/ref × term rename/meaning change/same-label different-id × deleted/rebound/moved item/proposal drift/unrelated notes. UI passes typed premise/proposal; stale choices cause fresh preview and zero overwrite. Correct the existing test endorsing label identity. Chosen fields write once, untouched fields survive and failed persistence retries durably. _(proof: setar metadata choices refuse every changed identity and premise before a write)_
- [ ] **ac-9** — src/domain/setarSetup.test.ts: independently declared ordinary gushehs/six daramads/two chaharpareh contexts/etude/exercise/personal-only improv/parts/technique/unknown/provisional/composite × missing/custom/conflicting stages × partial/missing/shared Setar-Tar refs × duplicate/other-recension materials. Status, kind, placement, reference, source and class proposals stay separate. Radif provenance alone cannot classify kind and form-category refs never identify works. New import defaults preserve dormant/zero practice; pre-existing exceptions are reviewed, never deleted. _(proof: setar setup proposals distinguish learning organisation and source evidence)_
- [ ] **ac-10** — src/domain/setarSetup.test.ts plus store support: correct/selected/excluded/later-arriving rows × instrument/pathway/rev/typed-premise drift × conflicting legacy/live refs × validation/save failure and retry. Apply exact displayed ids/fields in one set. Compare ALL untouched notes/history/reviews/dates/provenance/ratings/counts/clocks/routines/plans/attachments and bytes. Create selected source once, never cross-instrument/title-deduplicate. Written states pass validateDB round-trip; completed repeat has same object/rev. _(proof: setar setup commits selected rows atomically idempotently and without collateral changes)_
- [ ] **ac-11** — tests/setar-practice.browser.test.ts: synthetic owner-shaped fixtures, actual review controls, distinct Keeping fresh batch/exclusions and duplicate-source/ambiguous-stage choices. Change unrelated data during preview, fail/retry save, reload and repeat in both engines. Evidence/before/after visible; Saved waits for acknowledgement. No private owner dump, debug hook or source-regex journey; no unseen row joins selection. _(proof: setar setup review is usable through controls and survives interruption)_
- [ ] **ac-12** — tests/musical-term-suggestions.browser.test.ts: new/edit × three fields × phone/desktop × Chromium/WebKit. Type partial Farsi/Latin/name/alias; select VISIBLE matches by touch/click/keyboard; browse all/clear/unknown/composite/ambiguous/composition input. Include custom/renamed/archived terms, preserved other literals, focus/blur and no premature submit, reload/offline. Finished-name fill or option-markup existence cannot pass. _(proof: musical term suggestions can be found and selected while typing in both engines)_
- [ ] **ac-13** — One exact test in tests/setar-practice.browser.test.ts with uniquely named term companion: both engines/light-dark/390x844/long mismatched-language text/large text/keyboard focus/44px actions. Extend literal-dir ledgers; verify independently directed values and start alignment. Only main scrolls; no fixed/sticky/guessed viewport workaround; drafts remain usable. Existing contrast and instruction budget gates stay green. _(proof: portable term and recovery controls preserve direction focus and scroll ownership)_
- [ ] **ac-14** — One acceptance in tests/practice-cues.browser.test.ts, supported by src/components/practiceCue.test.ts: BEFORE behaviour edits, drive current mounted Start/Resume and natural target controls and record the evidenced marker→cue→new context/no resume failure, rather than inferring integration from a pure signal test. Corrected entry matrix covers Today recommendation/review/direct, StartBlock, item/next, stage, routine cards/duration/essentials, pending-plan creation versus each initial/later Begin, ActiveBlock/CloseBlock/RoutineRunner Resume, Settings Test sound and practice-screen sound recovery. Inject AudioContext/vibration/wake ports and observe constructor/resume invocation synchronously inside the click before awaits/navigation; later boundaries reuse the same context. Observe oscillator→gain→destination, bounded two-pulse start/stop/envelope and node cleanup. Bare routine URL requires Start; card Start remains one tap; existing clock routes never replace/restart work. Update and rerun the existing routine Working-notes journey without dropping ownership assertions. Running/suspended/interrupted/closed/unsupported/constructor throw/resume throw/reject/never-settle/concurrent repeated gestures and refused-dual-clock cases cannot leak/stack contexts, block practice, falsely claim audible output, queue old tones or change saved data. Test/recovery cue changes neither clocks/markers/wake lock nor history. Add one smoke route using the real browser WebAudio engine with normal policy, observing running state and scheduled completion; no forced autoplay flag or hardware-audibility assertion. Real PWA speaker/mute behaviour remains OWNER. _(proof: practice sound reuses one gesture primed context across all start and resume doors)_
- [ ] **ac-15** — tests/practice-cues.browser.test.ts: fixed-clock block/plan/routine × natural target/intermediate/final/pause-resume/zero-time repeated skips/multi-boundary background catch-up/reload/absent marker. Drive actual mounted screens and record marker claim, visual state, cue attempt and saved outcome in order. Normal foreground reached boundaries produce exactly one claim/cue attempt; jump across multiple boundaries produces ONE catch-up attempt, not one per missed boundary. Replay the same captured effect, development StrictMode setup/remount, navigation, concurrent observation, stale/replaced/paused clock, final-save/cancel interleavings and a failed/pending/interrupted audio path. Only an atomic still-current-clock claim may attempt sound; consumed boundaries never replay on audio recovery or Resume, and Skip never cues. Persistent visual target/overtime/window survives unsupported sound. Independent wall-clock expectations match ALL saved minutes/results/reviews; blocks never auto-finish and existing routine completion/working-note ownership remains unchanged. Include actual store-marker methods, not an in-test model or source regex. Pure nextSignal/wake checks support mechanics; they cannot certify mounted effect exactly-once or hardware audibility. _(proof: practice cues preserve wall clock boundaries and every recorded minute)_
- [ ] **ac-16** — tests/setar-practice.browser.test.ts: Add→visible Remove→hidden Restore→Play, fresh/enriched/practised × ordinary/shared radif/course × second pathway × placed-unlinked/ambiguous legacy. Same id, notes/history/reviews/files/source/class/routine links survive. Only selected pathway visibility/placement changes; bindings stay; repeat Add/Restore cannot duplicate. Sweep stage/progress/next/currentStage/Today/plan/routine visibility. Unlink/Delete remain distinct. _(proof: pathway removal and restoration visibly retain the existing owned item)_
- [ ] **ac-17** — tests/setar-practice-proof.test.ts checks the focused runner's list/manifest mode without recursively running itself. node scripts/check-setar-practice-families.mjs resolves titles one-to-one and runs committed fixtures/fixed seeds/clocks and both-engine control companions through practiceBrowser; missing browsers fail, all page errors remain, private Vite caches. Before first review record named failure for individually dropping provenance at scanner/decoder/inbound sites, widening restoration scope, missing relation consumer, same-label premises, reoffering unchanged metadata, bypassing selected-patch guard, omitted gesture door, datalist-only selection and delete/unbind removal. Restore each temporary mutation; source scans/documentation alone cannot prove behaviour. Extend mutations to a hard-coded session ceiling/key, auto-confirmed roster/draft, malformed header-preservation, unlogged rename guess, per-boundary context recreation, missing resume/state gate, unconditional marker claim or effect replay, queued delayed sound, and moving routine Start back into an effect. Each targeted mutation must fail the corresponding focused behavioural check and leave unrelated tests out of the proof argument. Include the future-intake report and actual pre-fix cue trace in the reader/writer matrix before implementation. _(proof: setar practice family proof rejects targeted partial fixes before review)_
- [ ] **ac-18** — Preserve one bounded real-device session: Mac normal browser plus iPhone Safari and installed PWA over verified secure context, recording build/browser/iOS/keyboard/output route and volume. iPhone checks partial Farsi/Latin term selection/draft retention/native keyboard dismissal. On each platform use Test sound, then short foreground block and routine boundaries, Pause/Resume and one background/lock-return interruption. Compare actual audibility/clear two-pulse recognition at normal media volume with the visual cue; record observed mute/output/interruption behaviour and recovery gesture with context state, never a locked-screen deadline guarantee. Starting a routine from its card stays one tap. Hardware/OS policy/native keyboard are the only reasons this is OWNER: all entry wiring, waveform scheduling, boundaries, persistence and interruption mechanics are automated. Unmerged v16 preview uses isolated data/origin with no real sync; retain native Safari versus installed PWA evidence separately. _(proof: manual:OWNER)_
- [ ] **ac-19** — Preserve one bounded live recovery/intent check: owner uses the SAME generic intake report/runbook that future sessions use, reviews/applies the two confirmed Session 40 registry declarations/roster and three Session 1 exact log continuations, updates all three NAS runtime files after compatible app deployment, runs the existing job and compares publication/commit/hash with Refresh. Explicitly restore Class 40 and open both PDFs/three ordered demos from Lessons and intended source-bound items on Mac/iPhone. Review actual private-data exceptions before selected Setar correction. No additional real future class is required for OWNER: synthetic future numbers/new identities/changed files and report/actions are automated. Builder supplies generic read-only comparison/reporting rather than a bespoke repair worksheet; real DSM/Drive/media reachability, genuine old→new declarations and musical intent remain OWNER. Re-import cannot recover deleted notes/bytes; independent backup is needed. No automated media/registry/log writes, retired deployment, deletion or credential logging. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- docs/setar-archive.md
- docs/nas-topology.md
- docs/repertoire-experience.md
- docs/setar-practice-reliability.md

## Amendments

_none_

