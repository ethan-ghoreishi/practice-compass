---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractHash: f34ee61aca4ae7286e34503de1b265fa637792eea28e5319274227519d9c13d4
createdAt: 2026-10-07T23:54:51.971Z
skills:
  - ui-work
  - build
---

# Build brief: Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/49
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261007-make-browser-tests-ci-and-the-prismatica-0e6c

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** technical
- **Risk tier:** normal
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Design one coherent, durable lane to make browser tests, CI and Prismatica Gate fast, deterministic and trustworthy, so future lanes do not experience the issues that have been happening (e.g. not blocked by unrelated flakes, timing races, long installs or runner/network problems). Known areas: practice-cues persistence timing; WebKit/browser journey flakes; UI/URL/render timing races; Playwright/system dependency install stalls; CI/Gate duplication and runtime; missing time bounds and poor failure isolation; Node/runtime differences between CI and Gate. Solve these together as one reliability problem. Validate rather than assume the known remedies, including persisted-state waits, workflow timeouts/package-source strategy and Node 24 alignment. Fix root causes, preserve test strength and product behaviour, and improve both reliability and runtime. Avoid sleeps, blind retries, skipped/weakened assertions and unrelated cleanup. Agreed while planning: Claude builds; CI keeps its push trigger and the Gate stays the single pull-request check (CI's pull_request trigger is dropped — verified: main has no branch protection, rulesets or required checks, and `prismatica merge` requires only a passing prismatica-gate check and a CLEAN merge state).

## Why

Since 2026-09-16, 18 CI and 17 Gate runs failed. Setup defects (missing WebKit, shallow clone, shared Vite cache, sync left in flight) are already fixed. Four root-cause families remain open, and each has hit a lane that did not touch it:
(1) PERSISTENCE ORDERING. A persisted read sees a write only if the write's IndexedDB transaction was created first. Writes created synchronously in the store action behind a UI cue are ordered. Writes created later — the effect-claimed `signalledThrough` marker (ActiveBlock.tsx:37, RoutineRunner effects), async continuations (import, sync, refresh, restore) — are not. That is the practice-sound Gate failure (practice-cues.browser.test.ts reads at 456/523/566/594/599/610). `reload()` hides the same race behind `waitForTimeout(400)` on every call (~130 call sites); three journeys add 300 ms sleeps; two files hand-roll their own pollers.
(2) NAVIGATION SETTLE. `goTo` (218 calls) waits for `nav[Primary]` or non-empty `<main>`. The OUTGOING page satisfies both while the lazy destination is still pending in the router's transition, so `goTo` returns before the destination exists. Point-in-time reads then hit the old page: the layout WebKit failure (`count()` of Working notes = 0) and the repertoire navigation failures. `arrive` fixes this only at the 22 sites that call it.
(3) TRANSITION-HELD CONTROLS. While a URL render is pending, React holds a controlled input or select at its last rendered value (the ac-7 Composer failure, fixed by polling). The family is any positive point-in-time read of transition-rendered state: ~115 `count()`/`isVisible()` reads, unclassified.
(4) RUNNER EXPOSURE.
- No `timeout-minutes` anywhere, so a dead Azure apt mirror stalled `playwright install --with-deps` for 50+ minutes against GitHub's 6-hour default, twice on one PR.
- Every lane push runs the full suite three times on identical code (CI push, CI pull_request, Gate), tripling flake and infrastructure exposure.
- Node 22 in CI and deploy, Node 24 in the Gate, Node 26 locally.
These are one problem: the proof a lane depends on fails for reasons the lane did not cause.

## Today

- Gate ~7–8 min, of which the suite takes 5.5–6 min on a 4-vCPU runner; locally the full suite takes 143 s in parallel and 733 s single-threaded.
- A dead package mirror hangs the job until it is cancelled by hand.
- The suite runs three times per PR push, with no cancelling of superseded runs.
- Several helpers report success before what they claim ("went to", "reloaded after the write", "read the persisted marker") has happened. Most runs pass, and an unlucky runner fails a lane that touched none of it.

## Instead

Every family is closed by an invariant enforced in one shared place and proven by a discriminating test. New tests live in exactly these files:
- N1 and N2 self-tests: `tests/journey-harness.browser.test.ts`.
- The N3 guard: `tests/journey-waits.test.ts`.
- N4: `tests/ci-browser-setup.test.ts`.
Scope lists each touchable test file explicitly, because Prismatica's secret check refuses a wildcard filename.
- N1 — navigation settles: `goTo` returns only after the destination has committed.
  - Mechanism, probed in both engines with `delayPagesMs` = 1500: before navigating, tag the outgoing `main h1` element; then wait until `main h1` is a different element or the same element with different text.
  - Probe result: during the pending window the old h1 stayed for ~1.5 s. A different lazy page (first load or cached), a redirect (`/items`), a focused route (`/active`) and the same component with new params (`/items/X` → `/items/Y`, committed synchronously inside the popstate) all resolved.
  - `goTo` takes an optional explicit arrival (a heading or locator) for the documented exception, where two pages share a heading. On timeout it throws naming that cause, never hangs. The never-goTo-the-current-route rule stays.
  - If the self-test refutes the heading signal, fall back to a required arrival on every call, enforced by the N3 guard.
- N2 — persistence is ordered:
  - `reload()` replaces its 400 ms sleep with an IndexedDB barrier: a readwrite `kv` transaction, awaited to completion, which is ordered after every write already issued.
  - Every read of an effect-issued or async write waits for its exact expected value (`persistedUntil` is the one poller; the local `until` copies fold into it), or for a UI acknowledgement that itself awaits storage.
  - A negative claim first waits for a positive "action finished" signal, then reads at a point in time.
  - New harness option, mirroring `delayPagesMs`: `delayStorageMs` (also settable by env for a proof run). An init script keeps the app's readwrite transactions open that long by chaining no-op requests, so writes complete late as on a slow device.
- N3 — journeys wait on events. A static guard over `tests/*.ts`, with a visible ledger as in `direction.test.ts`, enforces:
  1. No `waitForTimeout` or promise-wrapped `setTimeout`, except ledgered entries, each with its reason: the harness fixtures (`delayPagesMs`, `delayStorageMs`), page-side fakes (the AudioContext fake's `onended`), and one harness helper for bounded negative windows.
  2. No hand-rolled persistence pollers.
  3. No positive point-in-time existence or state assertion: `expect(await X.count())` compared ≥ 1, or `expect(await X.isVisible|isChecked|isEnabled|isDisabled()).toBe(true)`. These become `expect.poll` (about 34 sites).
  4. Every polled negative (`expect.poll(...)` with `.not`, `toBe(0)`, `toBe(false)` or `toEqual([])`; 7 sites today) is a ledgered disappearance-after-presence wait. Its test has already waited for the same thing to be present, so the poll cannot pass vacuously.
  Value reads (`inputValue`, `innerText`, …) after an N1-settled destination stay as they are. A transition-rendered control read straight after a URL-only wait is polled, as ac-7 already is.
- N4 — workflows are bounded and aligned:
  - Each suite workflow has a job `timeout-minutes` (about 2.5× the normal run) and a bounded browser-install step.
  - apt fails over from a dead mirror in seconds before `playwright install --with-deps`; the mirror experiment picks the mechanism.
  - All suite workflows use Node 24.
  - CI runs on branch pushes and manual dispatch only; the Gate is the only pull-request run.
  - Superseded runs cancel, with concurrency keyed `${{ github.workflow }}` plus the ref or PR (groups are repo-wide).
  - `deploy.yml`'s check job runs the same setup and check steps as `ci.yml`'s, so CI on push proves deploy's check by construction. Parity ignores only deploy's upload and deploy steps and CI's drill step.
  - CI offers a dispatch-only dead-mirror drill (an input, default off, that blackholes the Azure mirror host before the install), so failover is proven on the real runner image rather than assumed.
  - The install-step bound exceeds the drill's measured failover time.
  - `ci-browser-setup.test.ts` discovers all of this from the workflow files, with synthetic negatives.
Expected result:
- Suite runs per PR push go from 3 to 2.
- Worst-case infrastructure hang goes from 6 h to the step bound, and a dead mirror passes via failover.
- The ≥52 s serial reload sleep and the other sleeps go, saving roughly 15–25 s of runner suite time. Record real before/after numbers.
- The main gain is zero reruns from these families.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Dexie creates the IDB transaction synchronously inside the store action once the DB is open, and the IDB spec orders a later transaction with an overlapping scope after it across connections. N2's barrier relies on both. A transaction still open at unload is aborted, which is why a reload that beats a slow write loses it. The `delayStorageMs` self-test proves all of this in both engines rather than assuming it.
- The ubuntu-latest apt mirror list falls back between mirrors (the stalled logs show Azure http `Ign`, then archive.ubuntu.com `Hit`); the stall was per-file network timeouts. This Mac has no container runtime, so failover cannot be reproduced before review. The N4 drill proves it on GitHub after ship. Before review, the timeout and fallback settings are chosen from apt's documented `Acquire::*` behaviour, and the step bound is the guarantee if the drill disagrees.
- Proofs run Gate-equivalent: Node 24 via `npx -y -p node@24`, `npx vitest run --reporter=json`. The local default is Node 26.
- Lifecycle and proof — what is proven where.
BEFORE REVIEW, local and Gate-equivalent, by the builder:
(a) Each new discriminating test fails on the pre-fix harness:
  - N1: from a page to a lazy destination under `delayPagesMs` 1500, both engines.
  - N2: with `delayStorageMs` 1500, an action then `reload()` loses the write with the old 400 ms sleep and keeps it with the barrier.
  - N3 and N4: synthetic snippets.
(b) Then the fix; affected journeys ×10, Chromium also under CDP 20× throttle.
(c) Full suite: plain ×2, `--sequence.shuffle` seeds ×3, under host CPU load ×1, `--no-file-parallelism` ×1, and ×1 with `delayStorageMs` set globally.
(d) lint, tsc, build, actionlint over the workflows (a binary or `npx`, never a dependency), `prismatica check`. Local before/after suite timings go in DECISIONS now, never after ship.
AFTER SHIP, before merge — observed, never committed:
- CI(push) and the Gate must pass on the exact head on their first run (the first real run of the edited workflows), and the builder dispatches the mirror drill on the lane branch.
- Any failure is diagnosed. A code fix goes back through check → review → seal → ship.
- At most one rerun, and only for a diagnosed infrastructure fault outside this lane's remedies.
- GitHub step timings go in the final report.
AFTER MERGE: the first deploy run on main is watched; parity with CI makes it low-risk.
Limit: CPU throttling exists only in Chromium; WebKit gets host load and slow storage.

**Possible conflicts**

- AGENTS.md has 8 bytes of always-loaded budget left (claude 32760/32768). The Harness sentence must be rewritten in place at net ≤ 0 bytes (N1–N3 replace clauses, never append).
- `prismatica update` edits only the Gate pin, byte-preserving, but refuses while an open lane's scope allows prismatica-gate.yml. Do not upgrade Prismatica during this lane.
- Some `goTo` callers may rely on it returning early, or navigate to a URL that redirects. N1 must treat the redirect target as the destination, and the full suite is the arbiter.
- `Acquire::Retries` is a bounded transport retry for a package download, not a test retry. Reviewers should judge it against the no-blind-retries rule on that basis.
- Tier stays normal: Prismatica 0.10.0 derives it from honest risk answers, and heavy (which adds a Gate-enforced signed owner decision) is for auth, payments, saved data and schema. Integrity is carried instead by the review focus, the discovery tests and the lane's own Gate run. If the owner wants a signed decision anyway, `prismatica amend <id> --tier heavy` before building starts is the supported route; after an approved seal it can no longer be amended.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Design one coherent, durable lane to make browser tests, CI and Prismatica Gate fast, deterministic and trustworthy, so future lanes do not experience the issues that have been happening (e.g. not blocked by unrelated flakes, timing races, long installs or runner/network problems). Known areas: practice-cues persistence timing; WebKit/browser journey flakes; UI/URL/render timing races; Playwright/system dependency install stalls; CI/Gate duplication and runtime; missing time bounds and poor failure isolation; Node/runtime differences between CI and Gate. Solve these together as one reliability problem. Validate rather than assume the known remedies, including persisted-state waits, workflow timeouts/package-source strategy and Node 24 alignment. Fix root causes, preserve test strength and product behaviour, and improve both reliability and runtime. Avoid sleeps, blind retries, skipped/weakened assertions and unrelated cleanup. Agreed while planning: Claude builds; CI keeps its push trigger and the Gate stays the single pull-request check (CI's pull_request trigger is dropped — verified: main has no branch protection, rulesets or required checks, and `prismatica merge` requires only a passing prismatica-gate check and a CLEAN merge state).",
  "builder": "claude",
  "summary": "Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy",
  "rationale": "Since 2026-09-16, 18 CI and 17 Gate runs failed. Setup defects (missing WebKit, shallow clone, shared Vite cache, sync left in flight) are already fixed. Four root-cause families remain open, and each has hit a lane that did not touch it:\n(1) PERSISTENCE ORDERING. A persisted read sees a write only if the write's IndexedDB transaction was created first. Writes created synchronously in the store action behind a UI cue are ordered. Writes created later — the effect-claimed `signalledThrough` marker (ActiveBlock.tsx:37, RoutineRunner effects), async continuations (import, sync, refresh, restore) — are not. That is the practice-sound Gate failure (practice-cues.browser.test.ts reads at 456/523/566/594/599/610). `reload()` hides the same race behind `waitForTimeout(400)` on every call (~130 call sites); three journeys add 300 ms sleeps; two files hand-roll their own pollers.\n(2) NAVIGATION SETTLE. `goTo` (218 calls) waits for `nav[Primary]` or non-empty `<main>`. The OUTGOING page satisfies both while the lazy destination is still pending in the router's transition, so `goTo` returns before the destination exists. Point-in-time reads then hit the old page: the layout WebKit failure (`count()` of Working notes = 0) and the repertoire navigation failures. `arrive` fixes this only at the 22 sites that call it.\n(3) TRANSITION-HELD CONTROLS. While a URL render is pending, React holds a controlled input or select at its last rendered value (the ac-7 Composer failure, fixed by polling). The family is any positive point-in-time read of transition-rendered state: ~115 `count()`/`isVisible()` reads, unclassified.\n(4) RUNNER EXPOSURE.\n- No `timeout-minutes` anywhere, so a dead Azure apt mirror stalled `playwright install --with-deps` for 50+ minutes against GitHub's 6-hour default, twice on one PR.\n- Every lane push runs the full suite three times on identical code (CI push, CI pull_request, Gate), tripling flake and infrastructure exposure.\n- Node 22 in CI and deploy, Node 24 in the Gate, Node 26 locally.\nThese are one problem: the proof a lane depends on fails for reasons the lane did not cause.",
  "kind": "technical",
  "currentBehaviour": "- Gate ~7–8 min, of which the suite takes 5.5–6 min on a 4-vCPU runner; locally the full suite takes 143 s in parallel and 733 s single-threaded.\n- A dead package mirror hangs the job until it is cancelled by hand.\n- The suite runs three times per PR push, with no cancelling of superseded runs.\n- Several helpers report success before what they claim (\"went to\", \"reloaded after the write\", \"read the persisted marker\") has happened. Most runs pass, and an unlucky runner fails a lane that touched none of it.",
  "desiredBehaviour": "Every family is closed by an invariant enforced in one shared place and proven by a discriminating test. New tests live in exactly these files:\n- N1 and N2 self-tests: `tests/journey-harness.browser.test.ts`.\n- The N3 guard: `tests/journey-waits.test.ts`.\n- N4: `tests/ci-browser-setup.test.ts`.\nScope lists each touchable test file explicitly, because Prismatica's secret check refuses a wildcard filename.\n- N1 — navigation settles: `goTo` returns only after the destination has committed.\n  - Mechanism, probed in both engines with `delayPagesMs` = 1500: before navigating, tag the outgoing `main h1` element; then wait until `main h1` is a different element or the same element with different text.\n  - Probe result: during the pending window the old h1 stayed for ~1.5 s. A different lazy page (first load or cached), a redirect (`/items`), a focused route (`/active`) and the same component with new params (`/items/X` → `/items/Y`, committed synchronously inside the popstate) all resolved.\n  - `goTo` takes an optional explicit arrival (a heading or locator) for the documented exception, where two pages share a heading. On timeout it throws naming that cause, never hangs. The never-goTo-the-current-route rule stays.\n  - If the self-test refutes the heading signal, fall back to a required arrival on every call, enforced by the N3 guard.\n- N2 — persistence is ordered:\n  - `reload()` replaces its 400 ms sleep with an IndexedDB barrier: a readwrite `kv` transaction, awaited to completion, which is ordered after every write already issued.\n  - Every read of an effect-issued or async write waits for its exact expected value (`persistedUntil` is the one poller; the local `until` copies fold into it), or for a UI acknowledgement that itself awaits storage.\n  - A negative claim first waits for a positive \"action finished\" signal, then reads at a point in time.\n  - New harness option, mirroring `delayPagesMs`: `delayStorageMs` (also settable by env for a proof run). An init script keeps the app's readwrite transactions open that long by chaining no-op requests, so writes complete late as on a slow device.\n- N3 — journeys wait on events. A static guard over `tests/*.ts`, with a visible ledger as in `direction.test.ts`, enforces:\n  1. No `waitForTimeout` or promise-wrapped `setTimeout`, except ledgered entries, each with its reason: the harness fixtures (`delayPagesMs`, `delayStorageMs`), page-side fakes (the AudioContext fake's `onended`), and one harness helper for bounded negative windows.\n  2. No hand-rolled persistence pollers.\n  3. No positive point-in-time existence or state assertion: `expect(await X.count())` compared ≥ 1, or `expect(await X.isVisible|isChecked|isEnabled|isDisabled()).toBe(true)`. These become `expect.poll` (about 34 sites).\n  4. Every polled negative (`expect.poll(...)` with `.not`, `toBe(0)`, `toBe(false)` or `toEqual([])`; 7 sites today) is a ledgered disappearance-after-presence wait. Its test has already waited for the same thing to be present, so the poll cannot pass vacuously.\n  Value reads (`inputValue`, `innerText`, …) after an N1-settled destination stay as they are. A transition-rendered control read straight after a URL-only wait is polled, as ac-7 already is.\n- N4 — workflows are bounded and aligned:\n  - Each suite workflow has a job `timeout-minutes` (about 2.5× the normal run) and a bounded browser-install step.\n  - apt fails over from a dead mirror in seconds before `playwright install --with-deps`; the mirror experiment picks the mechanism.\n  - All suite workflows use Node 24.\n  - CI runs on branch pushes and manual dispatch only; the Gate is the only pull-request run.\n  - Superseded runs cancel, with concurrency keyed `${{ github.workflow }}` plus the ref or PR (groups are repo-wide).\n  - `deploy.yml`'s check job runs the same setup and check steps as `ci.yml`'s, so CI on push proves deploy's check by construction. Parity ignores only deploy's upload and deploy steps and CI's drill step.\n  - CI offers a dispatch-only dead-mirror drill (an input, default off, that blackholes the Azure mirror host before the install), so failover is proven on the real runner image rather than assumed.\n  - The install-step bound exceeds the drill's measured failover time.\n  - `ci-browser-setup.test.ts` discovers all of this from the workflow files, with synthetic negatives.\nExpected result:\n- Suite runs per PR push go from 3 to 2.\n- Worst-case infrastructure hang goes from 6 h to the step bound, and a dead mirror passes via failover.\n- The ≥52 s serial reload sleep and the other sleeps go, saving roughly 15–25 s of runner suite time. Record real before/after numbers.\n- The main gain is zero reruns from these families.",
  "mustNotChange": [
    "Product code and behaviour: nothing under src/ changes, and no app debug hook, data attribute or test-only signal is added. If a family genuinely cannot be closed from the harness, stop and ask for an amend.",
    "Test strength: an exact assertion stays exact (`toBe(1)` never becomes `> 0` or 'defined'), every engine and viewport loop stays, no assertion is skipped or deleted, Vitest retry stays 0, and timeouts are never raised as a fix.",
    "Harness rules in AGENTS.md and DECISIONS 2026-09-29 stay: every page error is kept, never goTo the current route, connectSync waits for Sync now, one private Vite cache per server, the fake GitHub remembers main, and a missing browser fails rather than skipping.",
    "Gate integrity: the `npx --yes prismatica@0.10.0 gate` command and pin, its pull_request trigger to main, `.prismatica/` config and checks, both engines installed before the suite, and the lockfile-pinned unversioned Playwright install.",
    "Review focus, so it is settled up front:\n- every changed assertion keeps or strengthens its matcher and its engine and viewport coverage;\n- the Gate-integrity items above hold;\n- for each discriminating test, the commit message names the pre-fix command or commit that showed it failing, so the reviewer can re-run it."
  ],
  "assumptions": [
    "Dexie creates the IDB transaction synchronously inside the store action once the DB is open, and the IDB spec orders a later transaction with an overlapping scope after it across connections. N2's barrier relies on both. A transaction still open at unload is aborted, which is why a reload that beats a slow write loses it. The `delayStorageMs` self-test proves all of this in both engines rather than assuming it.",
    "The ubuntu-latest apt mirror list falls back between mirrors (the stalled logs show Azure http `Ign`, then archive.ubuntu.com `Hit`); the stall was per-file network timeouts. This Mac has no container runtime, so failover cannot be reproduced before review. The N4 drill proves it on GitHub after ship. Before review, the timeout and fallback settings are chosen from apt's documented `Acquire::*` behaviour, and the step bound is the guarantee if the drill disagrees.",
    "Proofs run Gate-equivalent: Node 24 via `npx -y -p node@24`, `npx vitest run --reporter=json`. The local default is Node 26.",
    "Lifecycle and proof — what is proven where.\nBEFORE REVIEW, local and Gate-equivalent, by the builder:\n(a) Each new discriminating test fails on the pre-fix harness:\n  - N1: from a page to a lazy destination under `delayPagesMs` 1500, both engines.\n  - N2: with `delayStorageMs` 1500, an action then `reload()` loses the write with the old 400 ms sleep and keeps it with the barrier.\n  - N3 and N4: synthetic snippets.\n(b) Then the fix; affected journeys ×10, Chromium also under CDP 20× throttle.\n(c) Full suite: plain ×2, `--sequence.shuffle` seeds ×3, under host CPU load ×1, `--no-file-parallelism` ×1, and ×1 with `delayStorageMs` set globally.\n(d) lint, tsc, build, actionlint over the workflows (a binary or `npx`, never a dependency), `prismatica check`. Local before/after suite timings go in DECISIONS now, never after ship.\nAFTER SHIP, before merge — observed, never committed:\n- CI(push) and the Gate must pass on the exact head on their first run (the first real run of the edited workflows), and the builder dispatches the mirror drill on the lane branch.\n- Any failure is diagnosed. A code fix goes back through check → review → seal → ship.\n- At most one rerun, and only for a diagnosed infrastructure fault outside this lane's remedies.\n- GitHub step timings go in the final report.\nAFTER MERGE: the first deploy run on main is watched; parity with CI makes it low-risk.\nLimit: CPU throttling exists only in Chromium; WebKit gets host load and slow storage."
  ],
  "possibleConflicts": [
    "AGENTS.md has 8 bytes of always-loaded budget left (claude 32760/32768). The Harness sentence must be rewritten in place at net ≤ 0 bytes (N1–N3 replace clauses, never append).",
    "`prismatica update` edits only the Gate pin, byte-preserving, but refuses while an open lane's scope allows prismatica-gate.yml. Do not upgrade Prismatica during this lane.",
    "Some `goTo` callers may rely on it returning early, or navigate to a URL that redirects. N1 must treat the redirect target as the destination, and the full suite is the arbiter.",
    "`Acquire::Retries` is a bounded transport retry for a package download, not a test retry. Reviewers should judge it against the no-blind-retries rule on that basis.",
    "Tier stays normal: Prismatica 0.10.0 derives it from honest risk answers, and heavy (which adds a Gate-enforced signed owner decision) is for auth, payments, saved data and schema. Integrity is carried instead by the review focus, the discovery tests and the lane's own Gate run. If the owner wants a signed decision anyway, `prismatica amend <id> --tier heavy` before building starts is the supported route; after an approved seal it can no longer be amended."
  ],
  "scope": {
    "allow": [
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
      ".github/workflows/prismatica-gate.yml",
      "tests/practiceBrowser.ts",
      "tests/ci-browser-setup.test.ts",
      "tests/journey-harness.browser.test.ts",
      "tests/journey-waits.test.ts",
      "tests/daily-practice.browser.test.ts",
      "tests/lesson-agenda.browser.test.ts",
      "tests/lessonNotes.browser.test.ts",
      "tests/musical-term-suggestions.browser.test.ts",
      "tests/practice-cues.browser.test.ts",
      "tests/practice-information-inbound.browser.test.ts",
      "tests/practice-information-layout.browser.test.ts",
      "tests/practice-information.browser.test.ts",
      "tests/repertoire-experience.browser.test.ts",
      "tests/repertoire-inbound.browser.test.ts",
      "tests/repertoire-viewport.browser.test.ts",
      "tests/review-ownership.browser.test.ts",
      "tests/setar-practice-inbound.browser.test.ts",
      "tests/setar-practice.browser.test.ts",
      "tests/setar-review-ui.browser.test.ts",
      "tests/setarArchive.browser.test.ts",
      "tests/setarInbound.browser.test.ts",
      "DECISIONS.md",
      "AGENTS.md"
    ],
    "forbid": [
      "src/**",
      "package.json",
      "package-lock.json",
      "vite.config.ts",
      ".prismatica/**",
      "tests/fixtures/**"
    ]
  },
  "exclusions": [
    "Product fixes, including the open gaps listed in AGENTS.md.",
    "A container image or a browser cache for CI (an independent version pin, font and geometry drift, small gain).",
    "Sharding or matrix jobs (the Gate runs the suite as one Prismatica check).",
    "A shared dev server: measured cold launch 0.6–0.9 s per app locally, a small gain against the isolation and rollback-root complexity.",
    "Splitting or rewriting journeys for speed, new dependencies, the Playwright test runner, README edits, and other unrelated cleanup."
  ],
  "acceptance": [
    {
      "description": "N4: every workflow that runs the suite (discovered, never listed) has a job time bound, a bounded browser-install step, and apt mirror failover configured before `playwright install --with-deps`; CI offers the dispatch-only dead-mirror drill. Synthetic workflows missing any of these are reported.",
      "test": "every workflow that runs the test suite bounds its time and fails over from a dead package mirror"
    },
    {
      "description": "N4: every workflow that runs the suite sets up the same Node major, 24; a synthetic workflow on another major is reported.",
      "test": "every workflow that runs the test suite uses one Node major"
    },
    {
      "description": "N4: on pull_request only the Gate runs the suite, CI runs on branch pushes and dispatch, and every suite workflow cancels superseded runs with a concurrency group keyed by its own workflow; synthetic duplicates and an unkeyed group are reported.",
      "test": "the suite runs once per ref kind and superseded runs are cancelled"
    },
    {
      "description": "N4: deploy.yml's check job runs the same setup and check steps, in the same order, as ci.yml's check job (deploy adds only its upload and deploy steps); a synthetic divergence is reported.",
      "test": "the deploy check runs exactly the steps CI proves on every push"
    },
    {
      "description": "N1: in Chromium and WebKit, with slow page modules, goTo returns only after the destination has committed and the outgoing heading is gone. Covers a first-load lazy page, a cached page, the same page with new params, a focused route and a redirecting URL; a shared-heading pair passed an explicit arrival works, and one without it fails loudly. Fails on the pre-fix goTo.",
      "test": "navigation returns only once the destination page has rendered, in Chromium and WebKit, even when page modules load slowly"
    },
    {
      "description": "N2: in Chromium and WebKit, with `delayStorageMs` 1500, an action followed by reload() keeps the write and later reads observe it. The pre-fix 400 ms sleep loses it.",
      "test": "persisted reads and reload are ordered after every write the app has already issued, in Chromium and WebKit"
    },
    {
      "description": "N3: the static guard rejects synthetic offenders of all four rules (a sleep, a local poller, a positive point-in-time existence assertion, an unledgered polled negative) and finds none in the real journeys and harness.",
      "test": "browser journeys wait on events, never on fixed sleeps, hand-rolled pollers or positive point-in-time reads"
    },
    {
      "description": "N2 applied: every read of the effect-claimed signal marker waits for it to land and still asserts exactly one claim.",
      "test": "practice sound reuses one gesture primed context across all start and resume doors"
    },
    {
      "description": "N2 applied to routine boundaries, pause and save: persisted reads wait for effect-issued writes, and minutes stay exact.",
      "test": "practice cues preserve wall clock boundaries and every recorded minute"
    },
    {
      "description": "N1 applied: the WebKit 1280px failure path (Working notes count after reaching the active page) is deterministic.",
      "test": "practice information controls render accessible directional text at phone and desktop widths"
    },
    {
      "description": "N1/N3 applied: the repertoire navigation journey that failed four times is deterministic.",
      "test": "repertoire navigation restores browse context without changing session scope"
    },
    {
      "description": "N3 applied: the transition-held select read stays polled and exact under 20× CPU slowdown.",
      "test": "repertoire search keeps every typed character under heavy cpu slowdown"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": false,
    "copyOnly": false,
    "rationale": "Tests, the harness and CI workflows only; no product code, schema or stored data, so tier normal (a sealed fresh-eyes review gates the merge). The Gate workflow is the merge choke point: its command, pin and engine install are pinned by mustNotChange and the discovery tests, the review focus is fixed up front, and the lane's own Gate run executes the edited workflow before merge."
  },
  "desiredRules": [],
  "docsDelta": [
    "DECISIONS.md",
    "AGENTS.md"
  ]
}
```
````

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

Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy

## Stay in scope — you may ONLY change

- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- tests/practiceBrowser.ts
- tests/ci-browser-setup.test.ts
- tests/journey-harness.browser.test.ts
- tests/journey-waits.test.ts
- tests/daily-practice.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/musical-term-suggestions.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-review-ui.browser.test.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- DECISIONS.md
- AGENTS.md

Never touch:

- src/**
- package.json
- package-lock.json
- vite.config.ts
- .prismatica/**
- tests/fixtures/**
- Product code and behaviour: nothing under src/ changes, and no app debug hook, data attribute or test-only signal is added. If a family genuinely cannot be closed from the harness, stop and ask for an amend.
- Test strength: an exact assertion stays exact (`toBe(1)` never becomes `> 0` or 'defined'), every engine and viewport loop stays, no assertion is skipped or deleted, Vitest retry stays 0, and timeouts are never raised as a fix.
- Harness rules in AGENTS.md and DECISIONS 2026-09-29 stay: every page error is kept, never goTo the current route, connectSync waits for Sync now, one private Vite cache per server, the fake GitHub remembers main, and a missing browser fails rather than skipping.
- Gate integrity: the `npx --yes prismatica@0.10.0 gate` command and pin, its pull_request trigger to main, `.prismatica/` config and checks, both engines installed before the suite, and the lockfile-pinned unversioned Playwright install.
- Review focus, so it is settled up front:
- every changed assertion keeps or strengthens its matcher and its engine and viewport coverage;
- the Gate-integrity items above hold;
- for each discriminating test, the commit message names the pre-fix command or commit that showed it failing, so the reviewer can re-run it.
- Product fixes, including the open gaps listed in AGENTS.md.
- A container image or a browser cache for CI (an independent version pin, font and geometry drift, small gain).
- Sharding or matrix jobs (the Gate runs the suite as one Prismatica check).
- A shared dev server: measured cold launch 0.6–0.9 s per app locally, a small gain against the isolation and rollback-root complexity.
- Splitting or rewriting journeys for speed, new dependencies, the Playwright test runner, README edits, and other unrelated cleanup.

## Definition of done

- **ac-1** — N4: every workflow that runs the suite (discovered, never listed) has a job time bound, a bounded browser-install step, and apt mirror failover configured before `playwright install --with-deps`; CI offers the dispatch-only dead-mirror drill. Synthetic workflows missing any of these are reported. → proven by `every workflow that runs the test suite bounds its time and fails over from a dead package mirror`
- **ac-2** — N4: every workflow that runs the suite sets up the same Node major, 24; a synthetic workflow on another major is reported. → proven by `every workflow that runs the test suite uses one Node major`
- **ac-3** — N4: on pull_request only the Gate runs the suite, CI runs on branch pushes and dispatch, and every suite workflow cancels superseded runs with a concurrency group keyed by its own workflow; synthetic duplicates and an unkeyed group are reported. → proven by `the suite runs once per ref kind and superseded runs are cancelled`
- **ac-4** — N4: deploy.yml's check job runs the same setup and check steps, in the same order, as ci.yml's check job (deploy adds only its upload and deploy steps); a synthetic divergence is reported. → proven by `the deploy check runs exactly the steps CI proves on every push`
- **ac-5** — N1: in Chromium and WebKit, with slow page modules, goTo returns only after the destination has committed and the outgoing heading is gone. Covers a first-load lazy page, a cached page, the same page with new params, a focused route and a redirecting URL; a shared-heading pair passed an explicit arrival works, and one without it fails loudly. Fails on the pre-fix goTo. → proven by `navigation returns only once the destination page has rendered, in Chromium and WebKit, even when page modules load slowly`
- **ac-6** — N2: in Chromium and WebKit, with `delayStorageMs` 1500, an action followed by reload() keeps the write and later reads observe it. The pre-fix 400 ms sleep loses it. → proven by `persisted reads and reload are ordered after every write the app has already issued, in Chromium and WebKit`
- **ac-7** — N3: the static guard rejects synthetic offenders of all four rules (a sleep, a local poller, a positive point-in-time existence assertion, an unledgered polled negative) and finds none in the real journeys and harness. → proven by `browser journeys wait on events, never on fixed sleeps, hand-rolled pollers or positive point-in-time reads`
- **ac-8** — N2 applied: every read of the effect-claimed signal marker waits for it to land and still asserts exactly one claim. → proven by `practice sound reuses one gesture primed context across all start and resume doors`
- **ac-9** — N2 applied to routine boundaries, pause and save: persisted reads wait for effect-issued writes, and minutes stay exact. → proven by `practice cues preserve wall clock boundaries and every recorded minute`
- **ac-10** — N1 applied: the WebKit 1280px failure path (Working notes count after reaching the active page) is deterministic. → proven by `practice information controls render accessible directional text at phone and desktop widths`
- **ac-11** — N1/N3 applied: the repertoire navigation journey that failed four times is deterministic. → proven by `repertoire navigation restores browse context without changing session scope`
- **ac-12** — N3 applied: the transition-held select read stays polled and exact under 20× CPU slowdown. → proven by `repertoire search keeps every typed character under heavy cpu slowdown`

## Docs to update as part of this change

- DECISIONS.md
- AGENTS.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before the first review

Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Say in your commit message where it lives.

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
docs must be updated, a sealed review must match your exact diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.

