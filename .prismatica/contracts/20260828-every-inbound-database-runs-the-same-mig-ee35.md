---
id: 20260828-every-inbound-database-runs-the-same-mig-ee35
title: Every inbound database runs the same migration chain
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/3
intent: 20260828-every-inbound-database-runs-the-same-mig-ee35
tier: heavy
stage: ship
baseline:
  commit: 7b8e2d8fe3b192626a971d756f5fc016f37f62ba
  branch: main
branch: change/20260828-every-inbound-database-runs-the-same-mig-ee35
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260828-every-inbound-database-runs-the-same-mig-ee35
builder: claude
planHash: 5ac36f2c58c0dc3af41a0fb87bce3e6433ae325ea5ea6c0b80eabab03cc2c35c
allowedPaths:
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/io.ts
  - src/domain/io.test.ts
  - src/domain/index.ts
  - src/store/useStore.ts
  - CLAUDE.md
  - AGENTS.md
forbiddenPaths: []
nonGoals:
  - SCHEMA_VERSION stays 10. This lane does NOT bump the schema — it makes the
    next bump safe.
  - "No user-visible behaviour change on any path that works today: the same
    database in must produce the same database out."
  - importFullBackup's 'files key absent is not the same as zero attachments'
    distinction must survive untouched — that was a deliberate earlier fix
    (commit 7372305) and it is a data-loss trap.
  - The sync engine's content-hash comparison, conflict semantics and
    archive-before-replace behaviour are not touched.
  - "Rehydration keeps working for every existing device: a device sitting at
    any version from v3 onward must still come up correct on reload."
  - The review-date coupling landed by the previous lane stays green — all of
    its named tests must still pass.
  - No change to what a fresh install seeds. Whether the app should manufacture
    practice history at all is finding §3.5 and belongs to its own lane.
  - CLAUDE.md and AGENTS.md must come out byte-identical apart from their first
    line, as they are today. Both are in docsDelta and BOTH must be edited —
    updating only CLAUDE.md leaves AGENTS.md stale and fails the docs check on a
    file the builder may think changes by side effect.
  - No schema bump. SCHEMA_VERSION stays 10 and no migrateToV11 is written —
    this lane exists to make that bump safe, not to take it.
  - Finding §3.5 — fresh-install seeding and the false conflict on a second
    device. Belongs to sync-devices-via-github and gets its own existing-flow
    lane with a proper Delta.
  - Build advisory §3 routines, §4 item categories, §1 NAS folder picker, §2
    lesson materials view. All downstream of this lane; two of them need the
    schema bump this lane is clearing the way for.
  - Review §3.2 persian search wiring, §3.1 touch targets, §2.1 class-work
    fallback, §2.2 attachment silent failure, §2.4 RoutineRunner wall clock,
    §4.3 dead surface.
  - No change to the sync engine's hashing, conflict decisions, or archive
    behaviour — only to what happens to a database after it has been fetched and
    validated.
  - No new dependency, and no store test harness (no fake-indexeddb, no jsdom).
    If the store wiring feels untestable, that is the signal to move more of the
    decision into the pure module — exactly as the previous lane did.
  - "Nothing is hard-forbidden: the frame is the eight files in `allow`, and
    anything genuinely needed beyond them should be added by `prismatica amend`
    rather than worked around."
acceptanceChecks:
  - id: ac-1
    description: "The core unification: a database arriving at an older version is
      brought fully to current, rather than being stamped as current. This is
      the §2.3 defect itself."
    test: migrates an older database through to the current version instead of
      stamping it
  - id: ac-2
    description: A file with no schemaVersion at all is treated as the OLDEST and
      run through the whole chain, rather than assumed current as io.ts:84 does
      today.
    test: treats a missing schemaVersion as the oldest and runs the whole chain
  - id: ac-3
    description: "The discriminating partner to the check above, and what makes
      'assume oldest' safe: running the chain over an already-current database
      leaves it unchanged. Idempotency of v4 through v10."
    test: leaves an already-current database unchanged through the chain
  - id: ac-4
    description: "The v5-vs-validateDB precedence disagreement is resolved in one
      direction and only one: a legacy pathwaySteps entry places its item into
      the right stage, with the same result whichever path the data arrived by."
    test: places a legacy pathwaySteps item into its stage on every path
  - id: ac-5
    description: "The v6-vs-validateDB duplication is resolved: legacy attachment
      metadata carrying itemId is folded into ownerType/ownerId exactly once,
      losslessly."
    test: folds a legacy attachment itemId into ownerType and ownerId
  - id: ac-6
    description: "validateDB no longer needs to compensate for data it has just
      declared current: a legacy backup with no version field comes back fully
      migrated through the shared chain rather than through io.ts's own ad-hoc
      fixes."
    test: returns a legacy backup with no schemaVersion fully migrated
  - id: ac-7
    description: "Whole-chain idempotency, which is the property that made the old
      migrate-then-merge double run safe only by luck and must now be
      guaranteed: applying migrateToCurrent to its own output changes nothing.
      This is what makes it safe to remove merge's unconditional v6-to-v10
      re-run, and it is provable at the function boundary rather than requiring
      the store wiring that is out of scope."
    test: applying the chain twice produces the same result as applying it once
  - id: ac-8
    description: "The v3 guard itself, not version gating. A CURRENT-SHAPED database
      with `pathways: []` and NO schemaVersion is treated as oldest and run
      through the whole chain, yet comes out unchanged apart from the current
      schemaVersion being restored. A version-stamped fixture cannot prove this,
      because v3 is skipped on version alone regardless of its guard."
    test: does not seed pathways into an unversioned current-shaped database
  - id: ac-9
    description: "The discriminating opposite, which stops the guard being tightened
      into uselessness: a genuine pre-v3-shaped unversioned database — no
      `pathways` key at all — still receives the legitimate v3 pathway seeding.
      Together with the check above this proves the discriminator is
      key-presence, not emptiness and not the version stamp."
    test: still seeds pathways for a genuine pre-v3 database with no pathways key
  - id: ac-10
    description: "Fail closed on the future. An inbound database whose schemaVersion
      is greater than SCHEMA_VERSION is rejected with a clear message rather
      than silently stamped down to current and stripped of its newer fields by
      the validation allowlist. This is the two-device corruption path: the
      phone updates first and pushes v11, and the laptop must refuse it rather
      than quietly destroy it."
    test: rejects a database from a newer schema version instead of downgrading it
  - id: ac-11
    description: "Exercises the REAL inbound boundary rather than migrateToCurrent
      in isolation, which is what proves the migrate-before-normalise ordering:
      a legacy backup carrying pathwaySteps, taken in through the actual
      parse/import entry point, comes out with its item-to-stage placements
      intact. Validating first would drop pathwaySteps before any migration
      could read it, and this test is what fails if that regresses."
    test: keeps legacy pathwaySteps placements when imported through the real entry
      point
  - id: ac-12
    description: End to end in the running app, on the real data. Export a full
      backup from Settings, re-import it, and confirm the item count, block
      count, review dates and pathway stages are all unchanged — the round trip
      must be a no-op. Then open the app on the second device and confirm sync
      still reports in-sync rather than a conflict, and that the
      restore-archived-copy action still works.
    test: manual:OWNER
docsDelta:
  - CLAUDE.md
  - AGENTS.md
createdAt: 2026-08-28T16:41:49.040Z
amendments: []
---

# Every inbound database runs the same migration chain

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/3
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 7b8e2d8fe3b192626a971d756f5fc016f37f62ba on main _(never re-baselined)_
- **Intent:** 20260828-every-inbound-database-runs-the-same-mig-ee35

## You may only change

- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/index.ts
- src/store/useStore.ts
- CLAUDE.md
- AGENTS.md

## Never touch

_nothing explicitly forbidden_

## Non-goals

- SCHEMA_VERSION stays 10. This lane does NOT bump the schema — it makes the next bump safe.
- No user-visible behaviour change on any path that works today: the same database in must produce the same database out.
- importFullBackup's 'files key absent is not the same as zero attachments' distinction must survive untouched — that was a deliberate earlier fix (commit 7372305) and it is a data-loss trap.
- The sync engine's content-hash comparison, conflict semantics and archive-before-replace behaviour are not touched.
- Rehydration keeps working for every existing device: a device sitting at any version from v3 onward must still come up correct on reload.
- The review-date coupling landed by the previous lane stays green — all of its named tests must still pass.
- No change to what a fresh install seeds. Whether the app should manufacture practice history at all is finding §3.5 and belongs to its own lane.
- CLAUDE.md and AGENTS.md must come out byte-identical apart from their first line, as they are today. Both are in docsDelta and BOTH must be edited — updating only CLAUDE.md leaves AGENTS.md stale and fails the docs check on a file the builder may think changes by side effect.
- No schema bump. SCHEMA_VERSION stays 10 and no migrateToV11 is written — this lane exists to make that bump safe, not to take it.
- Finding §3.5 — fresh-install seeding and the false conflict on a second device. Belongs to sync-devices-via-github and gets its own existing-flow lane with a proper Delta.
- Build advisory §3 routines, §4 item categories, §1 NAS folder picker, §2 lesson materials view. All downstream of this lane; two of them need the schema bump this lane is clearing the way for.
- Review §3.2 persian search wiring, §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §2.4 RoutineRunner wall clock, §4.3 dead surface.
- No change to the sync engine's hashing, conflict decisions, or archive behaviour — only to what happens to a database after it has been fetched and validated.
- No new dependency, and no store test harness (no fake-indexeddb, no jsdom). If the store wiring feels untestable, that is the signal to move more of the decision into the pure module — exactly as the previous lane did.
- Nothing is hard-forbidden: the frame is the eight files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around.

## Acceptance checks (definition of done)

- [ ] **ac-1** — The core unification: a database arriving at an older version is brought fully to current, rather than being stamped as current. This is the §2.3 defect itself. _(proof: migrates an older database through to the current version instead of stamping it)_
- [ ] **ac-2** — A file with no schemaVersion at all is treated as the OLDEST and run through the whole chain, rather than assumed current as io.ts:84 does today. _(proof: treats a missing schemaVersion as the oldest and runs the whole chain)_
- [ ] **ac-3** — The discriminating partner to the check above, and what makes 'assume oldest' safe: running the chain over an already-current database leaves it unchanged. Idempotency of v4 through v10. _(proof: leaves an already-current database unchanged through the chain)_
- [ ] **ac-4** — The v5-vs-validateDB precedence disagreement is resolved in one direction and only one: a legacy pathwaySteps entry places its item into the right stage, with the same result whichever path the data arrived by. _(proof: places a legacy pathwaySteps item into its stage on every path)_
- [ ] **ac-5** — The v6-vs-validateDB duplication is resolved: legacy attachment metadata carrying itemId is folded into ownerType/ownerId exactly once, losslessly. _(proof: folds a legacy attachment itemId into ownerType and ownerId)_
- [ ] **ac-6** — validateDB no longer needs to compensate for data it has just declared current: a legacy backup with no version field comes back fully migrated through the shared chain rather than through io.ts's own ad-hoc fixes. _(proof: returns a legacy backup with no schemaVersion fully migrated)_
- [ ] **ac-7** — Whole-chain idempotency, which is the property that made the old migrate-then-merge double run safe only by luck and must now be guaranteed: applying migrateToCurrent to its own output changes nothing. This is what makes it safe to remove merge's unconditional v6-to-v10 re-run, and it is provable at the function boundary rather than requiring the store wiring that is out of scope. _(proof: applying the chain twice produces the same result as applying it once)_
- [ ] **ac-8** — The v3 guard itself, not version gating. A CURRENT-SHAPED database with `pathways: []` and NO schemaVersion is treated as oldest and run through the whole chain, yet comes out unchanged apart from the current schemaVersion being restored. A version-stamped fixture cannot prove this, because v3 is skipped on version alone regardless of its guard. _(proof: does not seed pathways into an unversioned current-shaped database)_
- [ ] **ac-9** — The discriminating opposite, which stops the guard being tightened into uselessness: a genuine pre-v3-shaped unversioned database — no `pathways` key at all — still receives the legitimate v3 pathway seeding. Together with the check above this proves the discriminator is key-presence, not emptiness and not the version stamp. _(proof: still seeds pathways for a genuine pre-v3 database with no pathways key)_
- [ ] **ac-10** — Fail closed on the future. An inbound database whose schemaVersion is greater than SCHEMA_VERSION is rejected with a clear message rather than silently stamped down to current and stripped of its newer fields by the validation allowlist. This is the two-device corruption path: the phone updates first and pushes v11, and the laptop must refuse it rather than quietly destroy it. _(proof: rejects a database from a newer schema version instead of downgrading it)_
- [ ] **ac-11** — Exercises the REAL inbound boundary rather than migrateToCurrent in isolation, which is what proves the migrate-before-normalise ordering: a legacy backup carrying pathwaySteps, taken in through the actual parse/import entry point, comes out with its item-to-stage placements intact. Validating first would drop pathwaySteps before any migration could read it, and this test is what fails if that regresses. _(proof: keeps legacy pathwaySteps placements when imported through the real entry point)_
- [ ] **ac-12** — End to end in the running app, on the real data. Export a full backup from Settings, re-import it, and confirm the item count, block count, review dates and pathway stages are all unchanged — the round trip must be a no-op. Then open the app on the second device and confirm sync still reports in-sync rather than a conflict, and that the restore-archived-copy action still works. _(proof: manual:OWNER)_

## Docs to update

- CLAUDE.md
- AGENTS.md

## Amendments

_none_

