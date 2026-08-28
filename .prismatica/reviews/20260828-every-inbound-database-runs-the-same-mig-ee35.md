---
id: 20260828-every-inbound-database-runs-the-same-mig-ee35
contractId: 20260828-every-inbound-database-runs-the-same-mig-ee35
patchId: bfac7e080c048aedb2628e5dc622d004f33e58c3
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-08-28T18:37:40.692Z
sealedAt: 2026-08-28T18:41:12.152Z
---

# Review: Every inbound database runs the same migration chain

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260828-every-inbound-database-runs-the-same-mig-ee35
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/3
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `bfac7e080c048aedb2628e5dc622d004f33e58c3`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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


## Files in this diff

- AGENTS.md
- CLAUDE.md
- src/domain/index.ts
- src/domain/io.test.ts
- src/domain/io.ts
- src/domain/migrations.test.ts
- src/domain/migrations.ts
- src/store/useStore.ts

## Check against the contract

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

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/store/useStore.ts
- **run-a-session-plan** — touched via src/store/useStore.ts
- **see-practice-patterns** — touched via src/domain/io.ts
- **work-a-pathway-stage** — touched via src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

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

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts matched changed file(s) src/domain/io.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Every device that lands here (archive restore, conflict keep-remote, pull) already routed through importFullBackup -> useStore's importDB, which this change rewires from 'validateDB then stamp schemaVersion=SCHEMA_VERSION' to 'validateDB, which now migrates on the source shape via the shared migrateToCurrent chain before normalising'. The mechanism changed; the described behaviour (same data in, same data out; archive-before-replace; explicit conflict choice) is unchanged and is exactly what the contract's acceptance checks and non-goals require.

Steps: 4, 5

## browse-my-repertoire — unchanged

This change only touches how an inbound database's schema version is migrated (src/domain/migrations.ts, io.ts) and the store's import/rehydration wiring (useStore.ts). It does not touch PracticeItem scoring, grouping, or repertoire-view logic, so browsing repertoire is unaffected; the shared 'PracticeItem' entity is incidental.

## install-the-app-and-keep-it-current — unchanged

This change touches only the migration chain and the store's persist migrate/merge/importDB wiring; it does not touch the Settings route, PWA install/update banner, or service-worker logic. The shared '/settings' route is incidental.

## point-this-device-at-the-nas — unchanged

This change touches only database migration/import; it does not touch NAS base URL configuration or recording resolution. The shared '/settings' route is incidental.

## prepare-for-the-next-class — unchanged

This change touches only database migration/import; it does not touch lesson urgency scoring or questionsForNextClass. The shared 'PracticeItem' entity is incidental.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 code inferred

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 code inferred

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 code inferred

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 code inferred

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 code inferred

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-every-inbound-database-runs-the-same-mig-ee35/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260828-every-inbound-database-runs-the-same-mig-ee35' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-every-inbound-database-runs-the-same-mig-ee35/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-every-inbound-database-runs-the-same-mig-ee35/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
