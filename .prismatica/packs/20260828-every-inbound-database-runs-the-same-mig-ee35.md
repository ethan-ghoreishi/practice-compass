---
id: 20260828-every-inbound-database-runs-the-same-mig-ee35
contractId: 20260828-every-inbound-database-runs-the-same-mig-ee35
contractHash: 70c9b1275edaa40cd4e7ffe645838316627ed5e1a58eb354bffc09ddcb68482b
createdAt: 2026-08-28T16:41:53.688Z
skills:
  - build
  - simplify
---

# Build brief: Every inbound database runs the same migration chain

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/3
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260828-every-inbound-database-runs-the-same-mig-ee35

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Every inbound database runs the same migration chain

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** technical
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Now that the review-date lane is merged, take the next most critical lane — and it is fine for this one to be heavier and wider. That is review finding §2.3: importDB skips the migration chain. Every way data enters this device — manual import, sync pull, keeping the GitHub copy in a conflict, and restoring the pre-sync archive — funnels through importDB, which stamps the data as current instead of migrating it. Collapse the overlapping migration paths into one tested function that all of them call, and make a missing schemaVersion mean 'oldest, migrate fully' rather than 'assume current'. Do this before anything that needs a schema bump. Leave the fresh-install seeding problem (§3.5) out — it belongs to a different flow and gets its own lane straight after.

## Why

This is the explicit blocker in front of everything else, and it is the last remaining way this app can silently corrupt the user's practice history.

1. It gates the feature backlog. The build advisory's own sequencing puts it at #1 because two of the four feature requests — practice routines and item categories — need a schema bump, and the review's wording is exact: 'worth doing before the next schema bump, not after'. The next lane after this one is routines at v11. Landing a bump on four disagreeing migration paths is precisely the thing being warned about.

2. It is the only remaining finding that can destroy data rather than merely mislead. Everything else on the list is a wrong date, a small tap target or an unwired helper. This one silently mislabels inbound data as current so it can never be migrated again.

3. It is the same shape as the lane just completed, and the review's closing observation named it: a rule enforced in one place and forgotten in the others. Last lane routed every review-date write through one tested function. This one routes every migration through one tested function. Same cure, higher stakes.

It is honestly heavier than the last lane — not in line count but in blast radius. It matches the **/*migration* and **/*schema* tier rules and touches saved data, so it is heavy tier by the config's own deterministic rules, not by opinion.

## Today

There are FOUR overlapping paths that decide what shape a database is in, and they do not agree.

(a) src/store/useStore.ts:1168 — importDB does `validateDB(raw)` then `set({ db: { ...db, schemaVersion: SCHEMA_VERSION } })`. It STAMPS the current version without running a single migration. Verified as the single funnel for every inbound path: importDB has exactly one call site (src/store/backup.ts:197, importFullBackup), and githubSync.ts:161 applySnapshot calls importFullBackup — so manual import, sync pull, keeping the GitHub copy in a conflict, and restoring the pre-sync archive ALL land here. Once stamped, persist.migrate is gated on `version < N` and will never touch that data again.

(b) useStore.ts:1197 — persist.migrate runs a properly gated v3→v10 chain, but only on rehydration.

(c) useStore.ts:1212 — merge re-runs v6→v10 UNCONDITIONALLY on every rehydration, plus ad-hoc `delete db.pathwaySteps` and `delete db.curriculum`. This is what currently masks (a): unmigrated data gets fixed by luck on the next reload, and v9's change (recordings[].kind) happens to be optional.

(d) src/domain/io.ts — validateDB does its OWN legacy fixes for pathwaySteps→stageId and attachments.itemId→ownerId. These duplicate migrateToV5 and migrateToV6 — and v5 and validateDB DISAGREE: migrateToV5 overwrites item.stageId unconditionally, validateDB only fills it when empty.

Underneath all of it is io.ts:84: `schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : SCHEMA_VERSION`. A file with NO version is assumed to be current. That is the root reason validateDB needed ad-hoc legacy fixes at all — it was compensating for data it had just declared up to date.

The migrations themselves are fine: migrateToV3–migrateToV10 (useStore.ts:318-410) are pure PracticeDB→PracticeDB functions whose only external dependency is seedPathways. They are simply unreachable from tests, because they live inside the store file.

## Instead

One pure, tested function decides what version a database is and brings it to current. Every path calls it, and it runs BEFORE the data is normalised to the current schema.

• ORDERING IS THE CRUX. validateDB today builds a fresh PracticeDB from a fixed allowlist of keys (src/domain/io.ts), so `curriculum` is never copied across and `pathwaySteps` is read inline and then dropped. Validating first would therefore destroy the very evidence the migrations need, and legacy item-to-stage placements would be silently lost. The canonical inbound path must migrate on the source shape first — or run a lossless pre-migration validation that preserves unknown/legacy fields — and only normalise to the current schema afterwards. importDB already receives the raw parsed object (src/store/backup.ts passes `parsed`, not the validated copy), so this is achievable without widening the frame.

• migrateToV4–migrateToV10 move VERBATIM into a new pure module src/domain/migrations.ts, which also exports `migrateToCurrent(db, fromVersion)`. They are already pure and free of store imports. migrateToV3 moves with ONE deliberate change, described next — it is the only function in the chain that is not a straight lift.

• migrateToV3's guard changes discriminator. Today it seeds pathways whenever `db.pathways.length === 0`, which under the new 'assume oldest' rule would inject seed pathways into a current-shaped database that legitimately has none. It must instead key on the PRESENCE OF THE `pathways` KEY: absent means genuinely pre-v3 and the seed is correct; present-but-empty means v3-or-later and nothing should be seeded. Do NOT key it on `curriculum` — that field is dropped by any normalisation that runs first, which makes it unreliable exactly when it would be needed.

• importDB migrates instead of stamping. persist.migrate and merge call the same function rather than each maintaining their own chain. merge stops re-running v6-to-v10 unconditionally and stops doing ad-hoc field deletion.

• A missing schemaVersion means OLDEST — which is 2, the earliest version this app ever shipped — so the whole chain runs. This is safe because v4-v10 are idempotent by construction and v3's new guard discriminates on shape rather than on emptiness.

• A schemaVersion GREATER than SCHEMA_VERSION is REJECTED with a clear message, not stamped down to current. Today such a file is silently downgraded and validateDB's allowlist drops every field the newer version added. The rejection surfaces through machinery that already exists: parseImport catches a validateDB throw and returns { ok: false, error }, importFullBackup returns that, and applySnapshot turns it into an error the sync UI reports.

• No schema bump. SCHEMA_VERSION stays 10. This lane makes the NEXT bump safe; it does not take one.

Apart from the future-version rejection, nothing user-visible changes: same data in, same data out, on every path that works today.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- migrateToV3–migrateToV10 (useStore.ts:318-410) are pure PracticeDB→PracticeDB functions; their only external dependencies are seedPathways (already a domain module) and type imports. Verified by reading all eight — the extraction is a move, not a rewrite.
- Only migrateToV3 is non-idempotent. v4 (attachments ?? []), v5 (no-op without pathwaySteps), v6 (only touches attachments lacking ownerId), v7 (recordings ?? []), v8 (identity), v9 (kind ?? 'video') and v10 (identity) are all safe to re-run on current-shaped data — which is what makes 'assume oldest' safe.
- validateDB's legacy handling duplicates migrateToV5 and migrateToV6, but disagrees with v5 on stageId precedence (v5 overwrites, validateDB only fills when empty). The builder must pick one and say which — the chain's behaviour is the one to keep.
- importDB has exactly one call site: src/store/backup.ts:197 inside importFullBackup. githubSync.ts:161 applySnapshot calls importFullBackup, so sync pull, conflict-keep-remote and archive restore all route through it too.
- vitest runs with environment: 'node' and no IndexedDB shim (unchanged since the last lane), so useStore.ts is still not unit-testable without a new dependency. The chain must therefore be pure domain and tested there, with the store reduced to a thin call site — the same shape that worked last lane.
- emptyDB() (src/domain/seed.ts:307) and createSeedDB() (seed.ts:293) both write schemaVersion: SCHEMA_VERSION — verified, not inferred — so a fresh install is unaffected by the 'missing version means oldest' rule. Note that emptyDB() is also the store's initial state and has ZERO pathways at the current version, which is precisely the shape migrateToV3 would wrongly seed: that is why tightening its guard is a hard requirement of this lane and not a tidy-up.
- CLAUDE.md's 'Persistence changes must keep the migrate + merge paths working' genuinely goes stale, since after this lane there is one function rather than two named paths. AGENTS.md is a byte-identical copy of it (review §4.1), so both are in scope and must be updated identically to avoid drift.
- Verified in history, not assumed: the initial commit shipped SCHEMA_VERSION = 2 with `curriculum` as a REQUIRED field on PracticeDB and no `pathways` key at all, and no migrateToV2 has ever existed in this repo. So 2 is the true floor for 'oldest', and the presence of the `pathways` KEY — absent at v2, always present from v3 — is a sound shape discriminator that does not depend on `curriculum` surviving normalisation.
- validateDB constructs a fresh PracticeDB from a fixed key allowlist, so `curriculum` is dropped and `pathwaySteps` is consumed inline. This is why migration must run before normalisation, and why any acceptance check for legacy handling has to go through the real import entry point rather than calling migrateToCurrent directly.
- Rejecting a future schemaVersion needs no new error plumbing: parseImport already wraps validateDB in try/catch and returns { ok: false, error }, importFullBackup returns that result, and githubSync's applySnapshot throws on !ok. src/store/backup.ts therefore stays out of the frame.

**Possible conflicts**

- importDB is shared by two approved flows: back-up-and-restore (manual import) and sync-devices-via-github (pull, conflict, archive restore). This lane changes their shared MECHANISM while intending no change to either flow's described behaviour — which is why it is kind: technical with no Delta. If the reviewer finds any observable behaviour change on either journey, that judgement was wrong and the affected flow needs a Delta.
- Removing merge's unconditional v6→v10 re-run removes the luck that currently masks the bug. That is the point, but it means any latent unmigrated data already sitting on a device surfaces during this lane rather than later — which is the safest possible moment for it to surface, but worth expecting.
- Tightening migrateToV3's guard changes behaviour for genuine v1/v2 data. No live device should still be at v1/v2, but an old exported backup file could be, and it is the one place where 'assume oldest' could do something the user did not ask for.
- Finding §3.5 (a fresh install seeds fabricated practice history, and seeds it before the first sync, so device #2 opens with a false both-changed conflict) is deliberately excluded. It is the natural next lane and is not blocked by this one.
- Rejecting a future schemaVersion is the one externally visible change in this lane: importing a file from a newer build now shows an error where it previously appeared to succeed. It is kept under kind: technical because the previous behaviour silently dropped the newer version's fields — a data-loss bug, not intended behaviour. If the reviewer judges it a genuine behaviour change to back-up-and-restore, that flow needs a Delta and this lane's kind was wrong.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Now that the review-date lane is merged, take the next most critical lane — and it is fine for this one to be heavier and wider. That is review finding §2.3: importDB skips the migration chain. Every way data enters this device — manual import, sync pull, keeping the GitHub copy in a conflict, and restoring the pre-sync archive — funnels through importDB, which stamps the data as current instead of migrating it. Collapse the overlapping migration paths into one tested function that all of them call, and make a missing schemaVersion mean 'oldest, migrate fully' rather than 'assume current'. Do this before anything that needs a schema bump. Leave the fresh-install seeding problem (§3.5) out — it belongs to a different flow and gets its own lane straight after.",
  "builder": "claude",
  "summary": "Every inbound database runs the same migration chain",
  "rationale": "This is the explicit blocker in front of everything else, and it is the last remaining way this app can silently corrupt the user's practice history.\n\n1. It gates the feature backlog. The build advisory's own sequencing puts it at #1 because two of the four feature requests — practice routines and item categories — need a schema bump, and the review's wording is exact: 'worth doing before the next schema bump, not after'. The next lane after this one is routines at v11. Landing a bump on four disagreeing migration paths is precisely the thing being warned about.\n\n2. It is the only remaining finding that can destroy data rather than merely mislead. Everything else on the list is a wrong date, a small tap target or an unwired helper. This one silently mislabels inbound data as current so it can never be migrated again.\n\n3. It is the same shape as the lane just completed, and the review's closing observation named it: a rule enforced in one place and forgotten in the others. Last lane routed every review-date write through one tested function. This one routes every migration through one tested function. Same cure, higher stakes.\n\nIt is honestly heavier than the last lane — not in line count but in blast radius. It matches the **/*migration* and **/*schema* tier rules and touches saved data, so it is heavy tier by the config's own deterministic rules, not by opinion.",
  "kind": "technical",
  "currentBehaviour": "There are FOUR overlapping paths that decide what shape a database is in, and they do not agree.\n\n(a) src/store/useStore.ts:1168 — importDB does `validateDB(raw)` then `set({ db: { ...db, schemaVersion: SCHEMA_VERSION } })`. It STAMPS the current version without running a single migration. Verified as the single funnel for every inbound path: importDB has exactly one call site (src/store/backup.ts:197, importFullBackup), and githubSync.ts:161 applySnapshot calls importFullBackup — so manual import, sync pull, keeping the GitHub copy in a conflict, and restoring the pre-sync archive ALL land here. Once stamped, persist.migrate is gated on `version < N` and will never touch that data again.\n\n(b) useStore.ts:1197 — persist.migrate runs a properly gated v3→v10 chain, but only on rehydration.\n\n(c) useStore.ts:1212 — merge re-runs v6→v10 UNCONDITIONALLY on every rehydration, plus ad-hoc `delete db.pathwaySteps` and `delete db.curriculum`. This is what currently masks (a): unmigrated data gets fixed by luck on the next reload, and v9's change (recordings[].kind) happens to be optional.\n\n(d) src/domain/io.ts — validateDB does its OWN legacy fixes for pathwaySteps→stageId and attachments.itemId→ownerId. These duplicate migrateToV5 and migrateToV6 — and v5 and validateDB DISAGREE: migrateToV5 overwrites item.stageId unconditionally, validateDB only fills it when empty.\n\nUnderneath all of it is io.ts:84: `schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : SCHEMA_VERSION`. A file with NO version is assumed to be current. That is the root reason validateDB needed ad-hoc legacy fixes at all — it was compensating for data it had just declared up to date.\n\nThe migrations themselves are fine: migrateToV3–migrateToV10 (useStore.ts:318-410) are pure PracticeDB→PracticeDB functions whose only external dependency is seedPathways. They are simply unreachable from tests, because they live inside the store file.",
  "desiredBehaviour": "One pure, tested function decides what version a database is and brings it to current. Every path calls it, and it runs BEFORE the data is normalised to the current schema.\n\n• ORDERING IS THE CRUX. validateDB today builds a fresh PracticeDB from a fixed allowlist of keys (src/domain/io.ts), so `curriculum` is never copied across and `pathwaySteps` is read inline and then dropped. Validating first would therefore destroy the very evidence the migrations need, and legacy item-to-stage placements would be silently lost. The canonical inbound path must migrate on the source shape first — or run a lossless pre-migration validation that preserves unknown/legacy fields — and only normalise to the current schema afterwards. importDB already receives the raw parsed object (src/store/backup.ts passes `parsed`, not the validated copy), so this is achievable without widening the frame.\n\n• migrateToV4–migrateToV10 move VERBATIM into a new pure module src/domain/migrations.ts, which also exports `migrateToCurrent(db, fromVersion)`. They are already pure and free of store imports. migrateToV3 moves with ONE deliberate change, described next — it is the only function in the chain that is not a straight lift.\n\n• migrateToV3's guard changes discriminator. Today it seeds pathways whenever `db.pathways.length === 0`, which under the new 'assume oldest' rule would inject seed pathways into a current-shaped database that legitimately has none. It must instead key on the PRESENCE OF THE `pathways` KEY: absent means genuinely pre-v3 and the seed is correct; present-but-empty means v3-or-later and nothing should be seeded. Do NOT key it on `curriculum` — that field is dropped by any normalisation that runs first, which makes it unreliable exactly when it would be needed.\n\n• importDB migrates instead of stamping. persist.migrate and merge call the same function rather than each maintaining their own chain. merge stops re-running v6-to-v10 unconditionally and stops doing ad-hoc field deletion.\n\n• A missing schemaVersion means OLDEST — which is 2, the earliest version this app ever shipped — so the whole chain runs. This is safe because v4-v10 are idempotent by construction and v3's new guard discriminates on shape rather than on emptiness.\n\n• A schemaVersion GREATER than SCHEMA_VERSION is REJECTED with a clear message, not stamped down to current. Today such a file is silently downgraded and validateDB's allowlist drops every field the newer version added. The rejection surfaces through machinery that already exists: parseImport catches a validateDB throw and returns { ok: false, error }, importFullBackup returns that, and applySnapshot turns it into an error the sync UI reports.\n\n• No schema bump. SCHEMA_VERSION stays 10. This lane makes the NEXT bump safe; it does not take one.\n\nApart from the future-version rejection, nothing user-visible changes: same data in, same data out, on every path that works today.",
  "mustNotChange": [
    "SCHEMA_VERSION stays 10. This lane does NOT bump the schema — it makes the next bump safe.",
    "No user-visible behaviour change on any path that works today: the same database in must produce the same database out.",
    "importFullBackup's 'files key absent is not the same as zero attachments' distinction must survive untouched — that was a deliberate earlier fix (commit 7372305) and it is a data-loss trap.",
    "The sync engine's content-hash comparison, conflict semantics and archive-before-replace behaviour are not touched.",
    "Rehydration keeps working for every existing device: a device sitting at any version from v3 onward must still come up correct on reload.",
    "The review-date coupling landed by the previous lane stays green — all of its named tests must still pass.",
    "No change to what a fresh install seeds. Whether the app should manufacture practice history at all is finding §3.5 and belongs to its own lane.",
    "CLAUDE.md and AGENTS.md must come out byte-identical apart from their first line, as they are today. Both are in docsDelta and BOTH must be edited — updating only CLAUDE.md leaves AGENTS.md stale and fails the docs check on a file the builder may think changes by side effect."
  ],
  "assumptions": [
    "migrateToV3–migrateToV10 (useStore.ts:318-410) are pure PracticeDB→PracticeDB functions; their only external dependencies are seedPathways (already a domain module) and type imports. Verified by reading all eight — the extraction is a move, not a rewrite.",
    "Only migrateToV3 is non-idempotent. v4 (attachments ?? []), v5 (no-op without pathwaySteps), v6 (only touches attachments lacking ownerId), v7 (recordings ?? []), v8 (identity), v9 (kind ?? 'video') and v10 (identity) are all safe to re-run on current-shaped data — which is what makes 'assume oldest' safe.",
    "validateDB's legacy handling duplicates migrateToV5 and migrateToV6, but disagrees with v5 on stageId precedence (v5 overwrites, validateDB only fills when empty). The builder must pick one and say which — the chain's behaviour is the one to keep.",
    "importDB has exactly one call site: src/store/backup.ts:197 inside importFullBackup. githubSync.ts:161 applySnapshot calls importFullBackup, so sync pull, conflict-keep-remote and archive restore all route through it too.",
    "vitest runs with environment: 'node' and no IndexedDB shim (unchanged since the last lane), so useStore.ts is still not unit-testable without a new dependency. The chain must therefore be pure domain and tested there, with the store reduced to a thin call site — the same shape that worked last lane.",
    "emptyDB() (src/domain/seed.ts:307) and createSeedDB() (seed.ts:293) both write schemaVersion: SCHEMA_VERSION — verified, not inferred — so a fresh install is unaffected by the 'missing version means oldest' rule. Note that emptyDB() is also the store's initial state and has ZERO pathways at the current version, which is precisely the shape migrateToV3 would wrongly seed: that is why tightening its guard is a hard requirement of this lane and not a tidy-up.",
    "CLAUDE.md's 'Persistence changes must keep the migrate + merge paths working' genuinely goes stale, since after this lane there is one function rather than two named paths. AGENTS.md is a byte-identical copy of it (review §4.1), so both are in scope and must be updated identically to avoid drift.",
    "Verified in history, not assumed: the initial commit shipped SCHEMA_VERSION = 2 with `curriculum` as a REQUIRED field on PracticeDB and no `pathways` key at all, and no migrateToV2 has ever existed in this repo. So 2 is the true floor for 'oldest', and the presence of the `pathways` KEY — absent at v2, always present from v3 — is a sound shape discriminator that does not depend on `curriculum` surviving normalisation.",
    "validateDB constructs a fresh PracticeDB from a fixed key allowlist, so `curriculum` is dropped and `pathwaySteps` is consumed inline. This is why migration must run before normalisation, and why any acceptance check for legacy handling has to go through the real import entry point rather than calling migrateToCurrent directly.",
    "Rejecting a future schemaVersion needs no new error plumbing: parseImport already wraps validateDB in try/catch and returns { ok: false, error }, importFullBackup returns that result, and githubSync's applySnapshot throws on !ok. src/store/backup.ts therefore stays out of the frame."
  ],
  "possibleConflicts": [
    "importDB is shared by two approved flows: back-up-and-restore (manual import) and sync-devices-via-github (pull, conflict, archive restore). This lane changes their shared MECHANISM while intending no change to either flow's described behaviour — which is why it is kind: technical with no Delta. If the reviewer finds any observable behaviour change on either journey, that judgement was wrong and the affected flow needs a Delta.",
    "Removing merge's unconditional v6→v10 re-run removes the luck that currently masks the bug. That is the point, but it means any latent unmigrated data already sitting on a device surfaces during this lane rather than later — which is the safest possible moment for it to surface, but worth expecting.",
    "Tightening migrateToV3's guard changes behaviour for genuine v1/v2 data. No live device should still be at v1/v2, but an old exported backup file could be, and it is the one place where 'assume oldest' could do something the user did not ask for.",
    "Finding §3.5 (a fresh install seeds fabricated practice history, and seeds it before the first sync, so device #2 opens with a false both-changed conflict) is deliberately excluded. It is the natural next lane and is not blocked by this one.",
    "Rejecting a future schemaVersion is the one externally visible change in this lane: importing a file from a newer build now shows an error where it previously appeared to succeed. It is kept under kind: technical because the previous behaviour silently dropped the newer version's fields — a data-loss bug, not intended behaviour. If the reviewer judges it a genuine behaviour change to back-up-and-restore, that flow needs a Delta and this lane's kind was wrong."
  ],
  "scope": {
    "allow": [
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/io.ts",
      "src/domain/io.test.ts",
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "CLAUDE.md",
      "AGENTS.md"
    ],
    "forbid": []
  },
  "exclusions": [
    "No schema bump. SCHEMA_VERSION stays 10 and no migrateToV11 is written — this lane exists to make that bump safe, not to take it.",
    "Finding §3.5 — fresh-install seeding and the false conflict on a second device. Belongs to sync-devices-via-github and gets its own existing-flow lane with a proper Delta.",
    "Build advisory §3 routines, §4 item categories, §1 NAS folder picker, §2 lesson materials view. All downstream of this lane; two of them need the schema bump this lane is clearing the way for.",
    "Review §3.2 persian search wiring, §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §2.4 RoutineRunner wall clock, §4.3 dead surface.",
    "No change to the sync engine's hashing, conflict decisions, or archive behaviour — only to what happens to a database after it has been fetched and validated.",
    "No new dependency, and no store test harness (no fake-indexeddb, no jsdom). If the store wiring feels untestable, that is the signal to move more of the decision into the pure module — exactly as the previous lane did.",
    "Nothing is hard-forbidden: the frame is the eight files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around."
  ],
  "acceptance": [
    {
      "description": "The core unification: a database arriving at an older version is brought fully to current, rather than being stamped as current. This is the §2.3 defect itself.",
      "test": "migrates an older database through to the current version instead of stamping it"
    },
    {
      "description": "A file with no schemaVersion at all is treated as the OLDEST and run through the whole chain, rather than assumed current as io.ts:84 does today.",
      "test": "treats a missing schemaVersion as the oldest and runs the whole chain"
    },
    {
      "description": "The discriminating partner to the check above, and what makes 'assume oldest' safe: running the chain over an already-current database leaves it unchanged. Idempotency of v4 through v10.",
      "test": "leaves an already-current database unchanged through the chain"
    },
    {
      "description": "The v5-vs-validateDB precedence disagreement is resolved in one direction and only one: a legacy pathwaySteps entry places its item into the right stage, with the same result whichever path the data arrived by.",
      "test": "places a legacy pathwaySteps item into its stage on every path"
    },
    {
      "description": "The v6-vs-validateDB duplication is resolved: legacy attachment metadata carrying itemId is folded into ownerType/ownerId exactly once, losslessly.",
      "test": "folds a legacy attachment itemId into ownerType and ownerId"
    },
    {
      "description": "validateDB no longer needs to compensate for data it has just declared current: a legacy backup with no version field comes back fully migrated through the shared chain rather than through io.ts's own ad-hoc fixes.",
      "test": "returns a legacy backup with no schemaVersion fully migrated"
    },
    {
      "description": "Whole-chain idempotency, which is the property that made the old migrate-then-merge double run safe only by luck and must now be guaranteed: applying migrateToCurrent to its own output changes nothing. This is what makes it safe to remove merge's unconditional v6-to-v10 re-run, and it is provable at the function boundary rather than requiring the store wiring that is out of scope.",
      "test": "applying the chain twice produces the same result as applying it once"
    },
    {
      "description": "The v3 guard itself, not version gating. A CURRENT-SHAPED database with `pathways: []` and NO schemaVersion is treated as oldest and run through the whole chain, yet comes out unchanged apart from the current schemaVersion being restored. A version-stamped fixture cannot prove this, because v3 is skipped on version alone regardless of its guard.",
      "test": "does not seed pathways into an unversioned current-shaped database"
    },
    {
      "description": "The discriminating opposite, which stops the guard being tightened into uselessness: a genuine pre-v3-shaped unversioned database — no `pathways` key at all — still receives the legitimate v3 pathway seeding. Together with the check above this proves the discriminator is key-presence, not emptiness and not the version stamp.",
      "test": "still seeds pathways for a genuine pre-v3 database with no pathways key"
    },
    {
      "description": "Fail closed on the future. An inbound database whose schemaVersion is greater than SCHEMA_VERSION is rejected with a clear message rather than silently stamped down to current and stripped of its newer fields by the validation allowlist. This is the two-device corruption path: the phone updates first and pushes v11, and the laptop must refuse it rather than quietly destroy it.",
      "test": "rejects a database from a newer schema version instead of downgrading it"
    },
    {
      "description": "Exercises the REAL inbound boundary rather than migrateToCurrent in isolation, which is what proves the migrate-before-normalise ordering: a legacy backup carrying pathwaySteps, taken in through the actual parse/import entry point, comes out with its item-to-stage placements intact. Validating first would drop pathwaySteps before any migration could read it, and this test is what fails if that regresses.",
      "test": "keeps legacy pathwaySteps placements when imported through the real entry point"
    },
    {
      "description": "End to end in the running app, on the real data. Export a full backup from Settings, re-import it, and confirm the item count, block count, review dates and pathway stages are all unchanged — the round trip must be a no-op. Then open the app on the second device and confirm sync still reports in-sync rather than a conflict, and that the restore-archived-copy action still works.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "No auth and no payments exist in this app. It touches saved data at the highest-stakes point in the system: the code that decides what shape a database is in as it arrives from a manual import, a sync pull, a conflict resolution, or an archive restore. It also matches the configured heavy-tier path rules (**/*migration*, **/*schema*). Getting it wrong does not show a wrong date — it can mangle the user's entire practice history at the moment it lands, and the pre-sync archive is the only thing standing behind it. That is why the acceptance checks pair every migrating case against a non-migrating one (older-version vs already-current, missing-version vs present, empty-pathways-legacy vs empty-pathways-current) rather than only proving that migration happens: on this path, over-migrating is as damaging as under-migrating. No schema bump is taken, no existing data is rewritten in place, and the change is a pure-function extraction whose eight moved functions were verified pure before scoping."
  },
  "desiredRules": [],
  "docsDelta": [
    "CLAUDE.md",
    "AGENTS.md"
  ]
}
```
````

## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

---

# Back up and restore everything

_Works now · approved 2026-08-28T13:30:17.770Z by Ethan (signed)_

## Goal

Keep an independent copy of all practice data and files, and put it back on any device.

## Starts when

In Settings → Data & backup the musician taps 'Export backup'.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Export backup'.
   - Shows: A single downloaded file named for this device and today's date, and 'Backup exported (data + files)'.
   - Changes: One JSON file holding the whole database plus every attachment, stamped with the device name and the latest change; the export time is remembered locally.

2. **The musician** Saves it wherever they keep backups — NAS, iCloud, anywhere.
   - Shows: Settings shows the last export from this device and the latest change made here.

3. **The musician** Taps 'Import backup' on any device and picks a file.
   - Shows: A confirmation naming the device the backup came from — and an explicit warning if the backup is older than what is on this device.

4. **Practice Compass** Decodes every attachment before touching anything.
   - Shows: A corrupt file aborts the whole import with a clear message and nothing changed.
   - Changes: Only once everything decodes do the files get replaced in one transaction, and only then the data — attachment records can never end up pointing at missing files.

5. **Practice Compass** Leaves existing files alone when the file has no attachments section at all.
   - Changes: A state-only export is never mistaken for 'zero attachments' and never wipes the device's files.

## Ends with

There is an independent full copy of everything, and restoring it is a single, clearly-confirmed step.

## Variations

- **Older backup** — Importing a backup older than the local data requires confirming a spelled-out warning that shows both dates. _(Works now)_
- **Legacy backups** — Older exports import unchanged; legacy attachment records are normalised to the current shape on the way in. _(Works now)_
- **Start over** — 'Reset demo data' and 'Clear all data' both replace everything and both ask first. _(Works now)_

## Rules

- The NAS backup is the user's own independent copy — sync history is never treated as the only backup.
- Nothing is replaced without an explicit confirmation.
- Large videos never enter a backup.

## Involves

- The musician
- The NAS or other storage

---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

---

# Practise what the app suggests

_Works now · approved 2026-08-28T13:30:17.983Z by Ethan (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Run a time-budgeted session

_Works now · approved 2026-08-28T13:30:18.043Z by Ethan (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# See how practice is actually going

_Works now · approved 2026-08-28T13:30:18.074Z by Ethan (signed)_

## Goal

Get a calm, neutral read on the last week or month across everything you play.

## Starts when

The musician taps 'Overview' on Today, or opens More → Insights.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Overview' in the instrument switcher.
   - Shows: Each instrument with its next suggestion and next class, one insight of the day, and a balance bar for the last 7 days.
   - Changes: The session instrument is set to 'all' — a deliberate, secondary choice, never the default.

2. **The musician** Taps an instrument to drop back into a real session for it.
   - Shows: Today, scoped to that instrument again.
   - Changes: The session instrument is set.

3. **The musician** Opens Insights and switches the window between 7 and 30 days.
   - Shows: Neutral observations generated from the logged blocks — patterns, not a scoreboard, and an honest empty state when there is not enough history.

## Ends with

The musician knows where their time actually went, with no streaks, scores or judgement attached.

## Variations

_none_

## Rules

- No gamification: no streaks, points, badges or fabricated mastery percentages.
- Insights are neutral observations, never nags.
- Future-dated blocks never leak into a window that looks backwards.

## Involves

- The musician

---

# Work through a pathway stage

_Works now · approved 2026-08-28T13:30:18.134Z by Ethan (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown that is explicitly not logged as practice. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.

## Involves

- The musician
- The pathway catalogue


## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Every inbound database runs the same migration chain

## Stay in scope — you may ONLY change

- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/index.ts
- src/store/useStore.ts
- CLAUDE.md
- AGENTS.md

Never touch:

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

## Definition of done

- **ac-1** — The core unification: a database arriving at an older version is brought fully to current, rather than being stamped as current. This is the §2.3 defect itself. → proven by `migrates an older database through to the current version instead of stamping it`
- **ac-2** — A file with no schemaVersion at all is treated as the OLDEST and run through the whole chain, rather than assumed current as io.ts:84 does today. → proven by `treats a missing schemaVersion as the oldest and runs the whole chain`
- **ac-3** — The discriminating partner to the check above, and what makes 'assume oldest' safe: running the chain over an already-current database leaves it unchanged. Idempotency of v4 through v10. → proven by `leaves an already-current database unchanged through the chain`
- **ac-4** — The v5-vs-validateDB precedence disagreement is resolved in one direction and only one: a legacy pathwaySteps entry places its item into the right stage, with the same result whichever path the data arrived by. → proven by `places a legacy pathwaySteps item into its stage on every path`
- **ac-5** — The v6-vs-validateDB duplication is resolved: legacy attachment metadata carrying itemId is folded into ownerType/ownerId exactly once, losslessly. → proven by `folds a legacy attachment itemId into ownerType and ownerId`
- **ac-6** — validateDB no longer needs to compensate for data it has just declared current: a legacy backup with no version field comes back fully migrated through the shared chain rather than through io.ts's own ad-hoc fixes. → proven by `returns a legacy backup with no schemaVersion fully migrated`
- **ac-7** — Whole-chain idempotency, which is the property that made the old migrate-then-merge double run safe only by luck and must now be guaranteed: applying migrateToCurrent to its own output changes nothing. This is what makes it safe to remove merge's unconditional v6-to-v10 re-run, and it is provable at the function boundary rather than requiring the store wiring that is out of scope. → proven by `applying the chain twice produces the same result as applying it once`
- **ac-8** — The v3 guard itself, not version gating. A CURRENT-SHAPED database with `pathways: []` and NO schemaVersion is treated as oldest and run through the whole chain, yet comes out unchanged apart from the current schemaVersion being restored. A version-stamped fixture cannot prove this, because v3 is skipped on version alone regardless of its guard. → proven by `does not seed pathways into an unversioned current-shaped database`
- **ac-9** — The discriminating opposite, which stops the guard being tightened into uselessness: a genuine pre-v3-shaped unversioned database — no `pathways` key at all — still receives the legitimate v3 pathway seeding. Together with the check above this proves the discriminator is key-presence, not emptiness and not the version stamp. → proven by `still seeds pathways for a genuine pre-v3 database with no pathways key`
- **ac-10** — Fail closed on the future. An inbound database whose schemaVersion is greater than SCHEMA_VERSION is rejected with a clear message rather than silently stamped down to current and stripped of its newer fields by the validation allowlist. This is the two-device corruption path: the phone updates first and pushes v11, and the laptop must refuse it rather than quietly destroy it. → proven by `rejects a database from a newer schema version instead of downgrading it`
- **ac-11** — Exercises the REAL inbound boundary rather than migrateToCurrent in isolation, which is what proves the migrate-before-normalise ordering: a legacy backup carrying pathwaySteps, taken in through the actual parse/import entry point, comes out with its item-to-stage placements intact. Validating first would drop pathwaySteps before any migration could read it, and this test is what fails if that regresses. → proven by `keeps legacy pathwaySteps placements when imported through the real entry point`
- **ac-12** — End to end in the running app, on the real data. Export a full backup from Settings, re-import it, and confirm the item count, block count, review dates and pathway stages are all unchanged — the round trip must be a no-op. Then open the app on the second device and confirm sync still reports in-sync rather than a conflict, and that the restore-archived-copy action still works. → proven by `manual:OWNER`

## Docs to update as part of this change

- CLAUDE.md
- AGENTS.md

## Recommended skills (quality only — never gates)

- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

