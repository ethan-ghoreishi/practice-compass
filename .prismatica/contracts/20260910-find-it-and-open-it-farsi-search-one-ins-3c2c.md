---
id: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
title: "Find it and open it: Farsi search, one instrument in view, and every
  file already linked to a piece"
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/18
intent: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
tier: heavy
stage: accept
baseline:
  commit: 5325ce31dc5c93996ed26d4be991916c2eaa9eb0
  branch: main
branch: change/20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
builder: claude
planHash: 3ffd34b86449df5f63443b5b96e4d56c27bb4b7cd2eecc8b23acc5f1895bc47e
allowedPaths:
  - AGENTS.md
  - CLAUDE.md
  - DECISIONS.md
  - FUTURE.md
  - README.md
  - src/components/ItemMaterial.tsx
  - src/domain/index.ts
  - src/domain/itemFiles.test.ts
  - src/domain/itemFiles.ts
  - src/domain/recordings.test.ts
  - src/domain/recordings.ts
  - src/domain/selectors.test.ts
  - src/domain/selectors.ts
  - src/pages/ActiveBlock.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/Lessons.tsx
  - src/pages/Repertoire.tsx
  - src/pages/Settings.tsx
  - src/pages/StartBlock.tsx
  - src/store/lookups.ts
  - src/store/useStore.ts
  - src/components/Attachments.tsx
  - src/components/ItemCard.tsx
forbiddenPaths:
  - src/domain/types.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/farsi.ts
  - src/domain/farsi.test.ts
  - src/domain/scheduling.ts
  - src/domain/scoring.ts
  - src/domain/recommend.ts
  - src/domain/practiceSignal.ts
  - src/domain/practiceSignal.test.ts
  - src/components/useScreenAwake.ts
  - src/components/screenAwake.ts
  - src/domain/routines.ts
  - src/pages/RoutineRunner.tsx
  - src/store/syncEngine.ts
  - src/store/gitRemote.ts
  - src/domain/sync.ts
  - vite.config.ts
  - package.json
  - scripts/scan-setar-classes.mjs
nonGoals:
  - No schema change and no migration. SCHEMA_VERSION stays 11 and no persisted
    shape changes -- src/domain/types.ts and src/domain/migrations.ts are
    forbidden so this is mechanical rather than asserted. The only field this
    lane writes differently is the TEXT of an existing LessonRecording.path,
    normalised to relative; its type and meaning are unchanged.
  - "No CSP change. src/vite.config.ts is forbidden. Images render from blob:
    which the production CSP already allows; nothing is embedded in a frame and
    no new origin is added, so the build-only CSP cannot diverge from dev in
    this lane."
  - No timer, wake-lock or practice-signal behaviour changes. practiceSignal.ts,
    useScreenAwake.ts and screenAwake.ts are forbidden, and no material or
    viewer concern may influence a recorded minute, the wake lock, or a boundary
    announcement.
  - Active practice stays calm. The material list is ONE collapsed disclosure,
    closed by default, in the same shape as the existing 'About this piece' --
    not a panel, not a viewer, not a dashboard, and never above the timer.
  - Large media stays on the NAS. This lane adds no way for a NAS file's bytes
    to enter attachments, IndexedDB, sync or a backup; NAS files are opened,
    never embedded or downloaded into the app.
  - The Farsi matcher itself is not retuned. persianSearchMatch,
    normalizePersian, faCollator and the transliteration aliases keep their
    current behaviour exactly -- farsi.ts is forbidden; only the two screens
    that never called it change.
  - The cross-instrument view survives. Repertoire and Lessons DEFAULT to the
    session instrument but keep a visible override, so browse-my-repertoire's
    recorded step 3 stays true and the Overview remains a deliberate secondary
    choice rather than something removed.
  - No new persisted state of any kind. Every file shown on an item is composed
    from links that already exist -- lesson.itemIds, lesson.recordings and
    attachments -- and nothing is written to make that view work.
  - The NAS base URL and the GitHub token stay per-device in localStorage, out
    of exports, backups and synced data.
  - Everything still works fully offline and local-first. A missing or
    unreachable NAS base degrades to a disabled or absent action with a plain
    explanation, never an error state, and never blocks practising.
  - "Scheduling, scoring and recommendation behaviour are untouched:
    scheduling.ts, scoring.ts and recommend.ts are forbidden."
  - The documentation compaction must stay a COMPACTION. AGENTS.md remains the
    single canonical normative file and must keep every product rule, invariant,
    safety constraint and architecture rule it holds today -- in particular the
    schema/migration rule under 'Storage is async', 'Domain logic stays pure',
    'Tests are not optional', and every Hard do-not. The only content removed
    anywhere is the ten-line 'When you add a feature' section, whose four rules
    were each verified to survive in AGENTS.md, in the signed
    .prismatica/rules.md, or as a mechanical gate check. Nothing normative may
    be dropped beyond that, and no rule may be reworded while being moved.
  - CLAUDE.md stays a pointer. After the compaction it imports `@AGENTS.md` and
    holds only Claude-specific operational notes; no product rule, invariant or
    architecture rule may be written back into it. Anything a non-Claude agent
    also needs belongs in AGENTS.md. The previous instruction to keep the two
    byte-identical is obsolete and must not be revived.
  - Prismatica's own records are immutable history. .prismatica/contracts,
    packs, intents and reviews reference CLAUDE.md as it stood when they were
    written; they are NOT rewritten to match the compaction, and nothing in
    .prismatica is in this lane's scope.
  - "The scan:nas index and in-app picker (review B2). Re-assessed on fresh
    evidence and deliberately deferred: the NAS already serves browsable
    directory listings, so browse-copy-paste closes most of the gap, while a
    scanner would add a build script, a generated reference module, a staleness
    story and a Mac-only dependency -- and it CREATES new reference data, which
    is exactly what this lane's thesis excludes. Revisit only if browsing and
    pasting proves insufficient in real use."
  - First-class item-level NAS references (review B3 in full). Needs a new
    persisted field on PracticeItem, therefore a SCHEMA_VERSION bump and heavy
    tier under the repo's own tierRules. The cheap route in this lane covers
    items linked to a lesson, which is most of the owner's Setar material; an
    item with no lesson link is the honest gap and is the follow-on's reason to
    exist.
  - "Embedding local PDFs in a frame (part of review B4). Would need frame-src
    blob: in the build-only CSP, verifiable only via npm run preview, and iOS
    Safari is unreliable at rendering PDFs in frames -- so the most fragile part
    would sit on the device that needs it most. Excluding it keeps
    vite.config.ts forbidden and removes dev-versus-production CSP divergence
    from this lane entirely."
  - Choosing the NAS transport (LAN IP versus Tailscale or a reverse proxy) and
    anything about the self-signed certificate. Infrastructure, not app code.
    This lane makes the choice REVERSIBLE by storing references relative to the
    configured base, and records what is actually running in DECISIONS.md, but
    does not make the decision.
  - Review A3 -- SM-2 advancing reps on every closed block rather than once per
    due date. Still open and still valuable, but it changes what
    r-practice-completes-reviews means and needs its own owner decision.
    scheduling.ts is forbidden here.
  - Review A5 -- dormant/'Resting' items still scored and still eligible for the
    Maintenance card. Verified still open (scoring.ts:22, recommend.ts:37). One
    predicate fixes it, but it is about which item is RECOMMENDED, not about
    finding and opening material. scoring.ts and recommend.ts are forbidden
    here.
  - Review A12 -- eight remaining frozen-`now` sites (CloseBlock, SessionPlan,
    Repertoire x2, ItemDetail, Lessons x2, TeacherReport) and SessionPlan's
    reseed key, which still uses build.generatedAt derived from the frozen now
    and therefore can still never fire. Today and Insights were fixed by the
    previous lane. A shared useCurrentDay belongs in its own lane rather than
    being half-done inside this one.
  - Review A11 (an item can still be made its own parent -- ItemForm.tsx:75 does
    not exclude the edited id), A13 (a malformed backup attachment entry is
    still skipped at backup.ts:274 then destroyed by the blob replacement), A14
    (insights and the Teacher Report still mix 'during this period' with 'right
    now'), A15 and A18 (remaining truthful-copy and spec drift beyond
    DECISIONS.md).
  - Review B5 -- the iPhone bottom bar after keyboard dismissal.
    Device-specific, unrelated to this lane's files, and needs its own
    manual:OWNER evidence.
  - Adding jsdom, fake-indexeddb, Playwright or any component/browser test
    harness (review E1). vitest stays environment:'node'; decisions move into
    pure functions instead. Enabling the .prismatica journeys check is its own
    lane.
  - "Rewriting .prismatica records (contracts, packs, intents, reviews) that
    mention CLAUDE.md. They are immutable history describing what the contract
    said at the time, and nothing in .prismatica is in scope. Also excluded:
    filling .prismatica/product-map.md, which is still unfilled placeholders,
    and refreshing docs/product-spec.md, which predates pathways, routines, the
    Session Plan and sync -- both are real documentation debt but neither is
    what this lane is about."
acceptanceChecks:
  - id: ac-1
    description: "The Farsi failure that actually bites on the owner's phone, with
      its counterexample: a query typed with an ARABIC kaf matches a title
      stored with a PERSIAN kaf, while a genuinely unrelated Persian query still
      does not match. Proves the search screens now fold variants without
      becoming a match-everything filter."
    test: matches a Persian title when the query uses the Arabic kaf and still
      rejects an unrelated query
  - id: ac-2
    description: "Latin transliteration, with its counterexample: searching
      'daramad' finds درآمد, and an unrelated Latin word finds nothing. Verified
      failing against the current toLowerCase().includes() predicate before the
      change."
    test: finds a Persian title from its Latin transliteration and rejects an
      unrelated Latin query
  - id: ac-3
    description: "The instrument default is a pure choice, discriminating all three
      states: a real session instrument seeds the filter, the explicit
      cross-instrument 'all' sentinel seeds the every-instrument view, and a
      session instrument that no longer resolves in the database falls back to
      every-instrument rather than to an empty screen."
    test: seeds the filter from a resolvable session instrument, widens for all, and
      falls back when it no longer exists
  - id: ac-4
    description: "An item's material is composed from links that already exist: the
      NAS references of every lesson the item is linked to, plus the item's own
      attachments, in a deterministic order. References are deduplicated BY
      PATH, so the same file referenced from two different lessons the item is
      linked to appears once, not twice."
    test: lists a linked lesson's references with the item's attachments,
      deduplicating references by path
  - id: ac-5
    description: "The counterexample that makes the composition meaningful rather
      than a broad sweep: references belonging to a lesson the item is NOT
      linked to never appear, and an item with no lessons and no attachments
      yields an empty list rather than an empty frame."
    test: excludes references from lessons the item is not linked to and returns
      nothing when it has none
  - id: ac-6
    description: "The two kinds of material open by completely different mechanisms
      -- a NAS reference resolves through the configured base URL, a local
      attachment through a blob -- so each composed entry carries which one it
      is. This is what stops a NAS reference being opened as a blob, or an
      attachment being pushed through the base URL and 404ing. Note the two
      types share no identity field (LessonRecording has path, AttachmentMeta
      has name), so they are never merged: deduplication is within a kind, never
      across them."
    test: tags every entry with how it opens so a reference is never treated as an
      attachment
  - id: ac-7
    description: "THE TRANSPORT-INDEPENDENCE RULE, three-way discriminating: a
      pasted URL that sits UNDER the configured base is stored RELATIVE, a
      pasted URL on a DIFFERENT origin is kept absolute rather than rewritten or
      rejected, and an already-relative path is stored unchanged. This is what
      keeps every reference working when the base URL changes."
    test: stores a pasted URL under the base as relative, keeps a foreign origin
      absolute, and leaves a relative path alone
  - id: ac-8
    description: "The same normalisation must never mangle input it cannot reason
      about: with no base URL configured, a pasted absolute URL is stored
      exactly as given, and a blank or unparseable base changes nothing."
    test: stores a pasted URL unchanged when no usable base URL is configured
  - id: ac-9
    description: "A stored reference survives a change of transport, which is the
      whole point: the same relative path resolves correctly under the LAN base
      and under a completely different base, proving no reference is pinned to
      one device's route to the NAS."
    test: resolves the same relative reference correctly under two different base
      URLs
  - id: ac-10
    description: "The Browse action is offered only when it can actually work,
      discriminating both directions: a valid configured base yields a browsable
      URL, while a blank or unparseable base yields none rather than a dead link
      or a same-origin request."
    test: offers a browse target for a valid base and none for a blank or
      unparseable one
  - id: ac-11
    description: "What may be shown inline during practice, decided as a pure
      property of each composed entry in itemFiles.ts rather than inline in the
      component, with its counterexample: a local image attachment is
      inline-renderable, while a PDF, an audio file and every NAS reference are
      open-only. This is the rule that keeps the practice screen from becoming a
      viewer and keeps the whole lane inside the existing production CSP -- a
      NAS image could not render inline under a static CSP in any case, because
      the NAS origin is not knowable at build time."
    test: treats a local image as inline-renderable and every PDF, audio file and
      NAS reference as open-only
  - id: ac-12
    description: "On the owner's own devices and against the PRODUCTION build,
      because none of this can be proven in Node. FIRST, the documentation
      compaction: open a fresh Claude Code session in this repo and confirm the
      `@AGENTS.md` import in the trimmed CLAUDE.md actually resolves, so the
      normative rules are still in context -- if that import silently fails, a
      builder would be left with an 865-byte file and no product rules at all,
      which is the one way this compaction could do harm. Run npm run preview
      (never dev -- the CSP is injected at build only) and confirm: (a) On the
      MacBook, an item that came from a class lists that class's video and
      score, and each opens on the NAS. (b) Settings' Browse link opens a real
      directory listing at the NAS base. (c) Copy a file URL from that listing,
      paste it as a lesson reference, save, and confirm the stored value is
      RELATIVE -- then change the base URL to a different form of the same host
      and confirm the reference still resolves. (d) Start a block on an item
      with a photo attached: the photo shows inline behind one closed
      disclosure, the timer keeps running while it is open, and the target
      signal still fires. (e) On the iPhone, Repertoire and Lessons open on the
      instrument you are practising and both still widen to all; search for a
      gusheh using the Persian keyboard and find it. (f) Also on the iPhone, tap
      a NAS link: if it is blocked, confirm whether the cause is the self-signed
      certificate prompt rather than the app, and record which -- a certificate
      prompt is infrastructure, not a defect in this lane."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - CLAUDE.md
  - DECISIONS.md
  - FUTURE.md
  - README.md
createdAt: 2026-09-10T22:24:52.985Z
amendments:
  - at: 2026-09-11T10:58:01.390Z
    reason: "Close the sealed review's ownership-family finding: Attachments.tsx:24
      and ItemCard.tsx:16 filter attachments by ownerId alone; the fix requires
      editing them directly, and neither file is in allowedPaths"
    description: "allow: +src/components/Attachments.tsx, src/components/ItemCard.tsx"
---

# Find it and open it: Farsi search, one instrument in view, and every file already linked to a piece

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/18
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 5325ce31dc5c93996ed26d4be991916c2eaa9eb0 on main _(never re-baselined)_
- **Intent:** 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c

## You may only change

- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- FUTURE.md
- README.md
- src/components/ItemMaterial.tsx
- src/domain/index.ts
- src/domain/itemFiles.test.ts
- src/domain/itemFiles.ts
- src/domain/recordings.test.ts
- src/domain/recordings.ts
- src/domain/selectors.test.ts
- src/domain/selectors.ts
- src/pages/ActiveBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Repertoire.tsx
- src/pages/Settings.tsx
- src/pages/StartBlock.tsx
- src/store/lookups.ts
- src/store/useStore.ts
- src/components/Attachments.tsx
- src/components/ItemCard.tsx

## Never touch

- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/farsi.ts
- src/domain/farsi.test.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/practiceSignal.ts
- src/domain/practiceSignal.test.ts
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/domain/routines.ts
- src/pages/RoutineRunner.tsx
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/domain/sync.ts
- vite.config.ts
- package.json
- scripts/scan-setar-classes.mjs

## Non-goals

- No schema change and no migration. SCHEMA_VERSION stays 11 and no persisted shape changes -- src/domain/types.ts and src/domain/migrations.ts are forbidden so this is mechanical rather than asserted. The only field this lane writes differently is the TEXT of an existing LessonRecording.path, normalised to relative; its type and meaning are unchanged.
- No CSP change. src/vite.config.ts is forbidden. Images render from blob: which the production CSP already allows; nothing is embedded in a frame and no new origin is added, so the build-only CSP cannot diverge from dev in this lane.
- No timer, wake-lock or practice-signal behaviour changes. practiceSignal.ts, useScreenAwake.ts and screenAwake.ts are forbidden, and no material or viewer concern may influence a recorded minute, the wake lock, or a boundary announcement.
- Active practice stays calm. The material list is ONE collapsed disclosure, closed by default, in the same shape as the existing 'About this piece' -- not a panel, not a viewer, not a dashboard, and never above the timer.
- Large media stays on the NAS. This lane adds no way for a NAS file's bytes to enter attachments, IndexedDB, sync or a backup; NAS files are opened, never embedded or downloaded into the app.
- The Farsi matcher itself is not retuned. persianSearchMatch, normalizePersian, faCollator and the transliteration aliases keep their current behaviour exactly -- farsi.ts is forbidden; only the two screens that never called it change.
- The cross-instrument view survives. Repertoire and Lessons DEFAULT to the session instrument but keep a visible override, so browse-my-repertoire's recorded step 3 stays true and the Overview remains a deliberate secondary choice rather than something removed.
- No new persisted state of any kind. Every file shown on an item is composed from links that already exist -- lesson.itemIds, lesson.recordings and attachments -- and nothing is written to make that view work.
- The NAS base URL and the GitHub token stay per-device in localStorage, out of exports, backups and synced data.
- Everything still works fully offline and local-first. A missing or unreachable NAS base degrades to a disabled or absent action with a plain explanation, never an error state, and never blocks practising.
- Scheduling, scoring and recommendation behaviour are untouched: scheduling.ts, scoring.ts and recommend.ts are forbidden.
- The documentation compaction must stay a COMPACTION. AGENTS.md remains the single canonical normative file and must keep every product rule, invariant, safety constraint and architecture rule it holds today -- in particular the schema/migration rule under 'Storage is async', 'Domain logic stays pure', 'Tests are not optional', and every Hard do-not. The only content removed anywhere is the ten-line 'When you add a feature' section, whose four rules were each verified to survive in AGENTS.md, in the signed .prismatica/rules.md, or as a mechanical gate check. Nothing normative may be dropped beyond that, and no rule may be reworded while being moved.
- CLAUDE.md stays a pointer. After the compaction it imports `@AGENTS.md` and holds only Claude-specific operational notes; no product rule, invariant or architecture rule may be written back into it. Anything a non-Claude agent also needs belongs in AGENTS.md. The previous instruction to keep the two byte-identical is obsolete and must not be revived.
- Prismatica's own records are immutable history. .prismatica/contracts, packs, intents and reviews reference CLAUDE.md as it stood when they were written; they are NOT rewritten to match the compaction, and nothing in .prismatica is in this lane's scope.
- The scan:nas index and in-app picker (review B2). Re-assessed on fresh evidence and deliberately deferred: the NAS already serves browsable directory listings, so browse-copy-paste closes most of the gap, while a scanner would add a build script, a generated reference module, a staleness story and a Mac-only dependency -- and it CREATES new reference data, which is exactly what this lane's thesis excludes. Revisit only if browsing and pasting proves insufficient in real use.
- First-class item-level NAS references (review B3 in full). Needs a new persisted field on PracticeItem, therefore a SCHEMA_VERSION bump and heavy tier under the repo's own tierRules. The cheap route in this lane covers items linked to a lesson, which is most of the owner's Setar material; an item with no lesson link is the honest gap and is the follow-on's reason to exist.
- Embedding local PDFs in a frame (part of review B4). Would need frame-src blob: in the build-only CSP, verifiable only via npm run preview, and iOS Safari is unreliable at rendering PDFs in frames -- so the most fragile part would sit on the device that needs it most. Excluding it keeps vite.config.ts forbidden and removes dev-versus-production CSP divergence from this lane entirely.
- Choosing the NAS transport (LAN IP versus Tailscale or a reverse proxy) and anything about the self-signed certificate. Infrastructure, not app code. This lane makes the choice REVERSIBLE by storing references relative to the configured base, and records what is actually running in DECISIONS.md, but does not make the decision.
- Review A3 -- SM-2 advancing reps on every closed block rather than once per due date. Still open and still valuable, but it changes what r-practice-completes-reviews means and needs its own owner decision. scheduling.ts is forbidden here.
- Review A5 -- dormant/'Resting' items still scored and still eligible for the Maintenance card. Verified still open (scoring.ts:22, recommend.ts:37). One predicate fixes it, but it is about which item is RECOMMENDED, not about finding and opening material. scoring.ts and recommend.ts are forbidden here.
- Review A12 -- eight remaining frozen-`now` sites (CloseBlock, SessionPlan, Repertoire x2, ItemDetail, Lessons x2, TeacherReport) and SessionPlan's reseed key, which still uses build.generatedAt derived from the frozen now and therefore can still never fire. Today and Insights were fixed by the previous lane. A shared useCurrentDay belongs in its own lane rather than being half-done inside this one.
- Review A11 (an item can still be made its own parent -- ItemForm.tsx:75 does not exclude the edited id), A13 (a malformed backup attachment entry is still skipped at backup.ts:274 then destroyed by the blob replacement), A14 (insights and the Teacher Report still mix 'during this period' with 'right now'), A15 and A18 (remaining truthful-copy and spec drift beyond DECISIONS.md).
- Review B5 -- the iPhone bottom bar after keyboard dismissal. Device-specific, unrelated to this lane's files, and needs its own manual:OWNER evidence.
- Adding jsdom, fake-indexeddb, Playwright or any component/browser test harness (review E1). vitest stays environment:'node'; decisions move into pure functions instead. Enabling the .prismatica journeys check is its own lane.
- Rewriting .prismatica records (contracts, packs, intents, reviews) that mention CLAUDE.md. They are immutable history describing what the contract said at the time, and nothing in .prismatica is in scope. Also excluded: filling .prismatica/product-map.md, which is still unfilled placeholders, and refreshing docs/product-spec.md, which predates pathways, routines, the Session Plan and sync -- both are real documentation debt but neither is what this lane is about.

## Acceptance checks (definition of done)

- [ ] **ac-1** — The Farsi failure that actually bites on the owner's phone, with its counterexample: a query typed with an ARABIC kaf matches a title stored with a PERSIAN kaf, while a genuinely unrelated Persian query still does not match. Proves the search screens now fold variants without becoming a match-everything filter. _(proof: matches a Persian title when the query uses the Arabic kaf and still rejects an unrelated query)_
- [ ] **ac-2** — Latin transliteration, with its counterexample: searching 'daramad' finds درآمد, and an unrelated Latin word finds nothing. Verified failing against the current toLowerCase().includes() predicate before the change. _(proof: finds a Persian title from its Latin transliteration and rejects an unrelated Latin query)_
- [ ] **ac-3** — The instrument default is a pure choice, discriminating all three states: a real session instrument seeds the filter, the explicit cross-instrument 'all' sentinel seeds the every-instrument view, and a session instrument that no longer resolves in the database falls back to every-instrument rather than to an empty screen. _(proof: seeds the filter from a resolvable session instrument, widens for all, and falls back when it no longer exists)_
- [ ] **ac-4** — An item's material is composed from links that already exist: the NAS references of every lesson the item is linked to, plus the item's own attachments, in a deterministic order. References are deduplicated BY PATH, so the same file referenced from two different lessons the item is linked to appears once, not twice. _(proof: lists a linked lesson's references with the item's attachments, deduplicating references by path)_
- [ ] **ac-5** — The counterexample that makes the composition meaningful rather than a broad sweep: references belonging to a lesson the item is NOT linked to never appear, and an item with no lessons and no attachments yields an empty list rather than an empty frame. _(proof: excludes references from lessons the item is not linked to and returns nothing when it has none)_
- [ ] **ac-6** — The two kinds of material open by completely different mechanisms -- a NAS reference resolves through the configured base URL, a local attachment through a blob -- so each composed entry carries which one it is. This is what stops a NAS reference being opened as a blob, or an attachment being pushed through the base URL and 404ing. Note the two types share no identity field (LessonRecording has path, AttachmentMeta has name), so they are never merged: deduplication is within a kind, never across them. _(proof: tags every entry with how it opens so a reference is never treated as an attachment)_
- [ ] **ac-7** — THE TRANSPORT-INDEPENDENCE RULE, three-way discriminating: a pasted URL that sits UNDER the configured base is stored RELATIVE, a pasted URL on a DIFFERENT origin is kept absolute rather than rewritten or rejected, and an already-relative path is stored unchanged. This is what keeps every reference working when the base URL changes. _(proof: stores a pasted URL under the base as relative, keeps a foreign origin absolute, and leaves a relative path alone)_
- [ ] **ac-8** — The same normalisation must never mangle input it cannot reason about: with no base URL configured, a pasted absolute URL is stored exactly as given, and a blank or unparseable base changes nothing. _(proof: stores a pasted URL unchanged when no usable base URL is configured)_
- [ ] **ac-9** — A stored reference survives a change of transport, which is the whole point: the same relative path resolves correctly under the LAN base and under a completely different base, proving no reference is pinned to one device's route to the NAS. _(proof: resolves the same relative reference correctly under two different base URLs)_
- [ ] **ac-10** — The Browse action is offered only when it can actually work, discriminating both directions: a valid configured base yields a browsable URL, while a blank or unparseable base yields none rather than a dead link or a same-origin request. _(proof: offers a browse target for a valid base and none for a blank or unparseable one)_
- [ ] **ac-11** — What may be shown inline during practice, decided as a pure property of each composed entry in itemFiles.ts rather than inline in the component, with its counterexample: a local image attachment is inline-renderable, while a PDF, an audio file and every NAS reference are open-only. This is the rule that keeps the practice screen from becoming a viewer and keeps the whole lane inside the existing production CSP -- a NAS image could not render inline under a static CSP in any case, because the NAS origin is not knowable at build time. _(proof: treats a local image as inline-renderable and every PDF, audio file and NAS reference as open-only)_
- [ ] **ac-12** — On the owner's own devices and against the PRODUCTION build, because none of this can be proven in Node. FIRST, the documentation compaction: open a fresh Claude Code session in this repo and confirm the `@AGENTS.md` import in the trimmed CLAUDE.md actually resolves, so the normative rules are still in context -- if that import silently fails, a builder would be left with an 865-byte file and no product rules at all, which is the one way this compaction could do harm. Run npm run preview (never dev -- the CSP is injected at build only) and confirm: (a) On the MacBook, an item that came from a class lists that class's video and score, and each opens on the NAS. (b) Settings' Browse link opens a real directory listing at the NAS base. (c) Copy a file URL from that listing, paste it as a lesson reference, save, and confirm the stored value is RELATIVE -- then change the base URL to a different form of the same host and confirm the reference still resolves. (d) Start a block on an item with a photo attached: the photo shows inline behind one closed disclosure, the timer keeps running while it is open, and the target signal still fires. (e) On the iPhone, Repertoire and Lessons open on the instrument you are practising and both still widen to all; search for a gusheh using the Persian keyboard and find it. (f) Also on the iPhone, tap a NAS link: if it is blocked, confirm whether the cause is the self-signed certificate prompt rather than the app, and record which -- a certificate prompt is infrastructure, not a defect in this lane. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- FUTURE.md
- README.md

## Amendments

- 2026-09-11T10:58:01.390Z — Close the sealed review's ownership-family finding: Attachments.tsx:24 and ItemCard.tsx:16 filter attachments by ownerId alone; the fix requires editing them directly, and neither file is in allowedPaths: allow: +src/components/Attachments.tsx, src/components/ItemCard.tsx

