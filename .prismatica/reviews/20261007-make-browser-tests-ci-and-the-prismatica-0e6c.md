---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
contractId: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
patchId: 9ef50736dbe635d098d3c7216655780f26d5ff81
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: destination-specific-navigation-arrival
    summary: "[P2] ac-5's shared-heading proof can pass before the destination commits."
    counterexample: "tests/journey-harness.browser.test.ts:84 passes arrival:
      'Repertoire' while the outgoing view already has that heading; line 85
      asserts only the same heading. tests/practiceBrowser.ts:579-584 waits
      solely for that locator and bypasses the render-change check. A read-only
      Page-double probe of the actual goTo returned with outgoing Pathways
      content still present, and the heading assertion would pass. Rework the
      exact named test 'navigation returns only once the destination page has
      rendered, in Chromium and WebKit, even when page modules load slowly' to
      prove a destination-only view state under a pending same-heading
      navigation in both engines. Complete explicit-arrival sweep: this is the
      only non-discriminating caller;
      tests/setar-practice.browser.test.ts:148,160,163 use distinct pathway
      backlinks, and tests/repertoire-experience.browser.test.ts:481 uses the
      destination's pressed view. The seven show call sites in daily-practice,
      lesson-agenda, lessonNotes and review-ownership were checked for their
      settled-page precondition."
  - family: journey-wait-guard-complete-enforcement
    summary: "[P2] ac-7 misses existing positive state assertions and can erase
      forbidden waits inside valid quoted syntax."
    counterexample: "Swept 135 existence/state call sites. Two positive assertions
      remain unpolled and unreported:
      tests/repertoire-experience.browser.test.ts:169 reads
      freshName.isEnabled() in an array expected to contain true;
      tests/setar-practice.browser.test.ts:909 reads two isChecked() values in
      an array expected to be [true,true] immediately after Choose every item
      without a note. tests/journey-waits.test.ts:124-126 recognises scalar
      expect(await ...) assertions only. stripComments at line 104 treats quoted
      'A // B' as a comment; closing at lines 108-119 treats quoted ')' as
      syntax. Direct scan probes return [] for expect(await page.getByText('A //
      B').count()).toBe(1), for await page.getByText('A // B').click(); await
      page.waitForTimeout(300), and for await expect.poll(() =>
      page.getByText(')').count()).toBe(0). Rework the exact named test 'browser
      journeys wait on events, never on fixed sleeps, hand-rolled pollers or
      positive point-in-time reads' with these lexical and compound-assertion
      classes, then close the whole family. Clean consumers: remaining scalar
      positive assertions; daily-practice:189,279, repertoire-experience:489 and
      journey-harness:50 negative polls with prior presence; five ledgered
      sleeps, the sole persistedUntil loop and the raw-navigation control arm.
      scanAll and the synthetic rules helper are the only scan consumers; all
      top-level tests/*.ts and the harness were swept."
createdAt: 2026-10-08T13:07:39.112Z
sealedAt: 2026-10-08T13:26:56.905Z
---

# Review: Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/49
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Diff patch-id:** `9ef50736dbe635d098d3c7216655780f26d5ff81`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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


## Files in this diff

- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- AGENTS.md
- DECISIONS.md
- tests/ci-browser-setup.test.ts
- tests/daily-practice.browser.test.ts
- tests/journey-harness.browser.test.ts
- tests/journey-waits.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/musical-term-suggestions.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practiceBrowser.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-review-ui.browser.test.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts

## Check against the contract

- [ ] **ac-1** — N4: every workflow that runs the suite (discovered, never listed) has a job time bound, a bounded browser-install step, and apt mirror failover configured before `playwright install --with-deps`; CI offers the dispatch-only dead-mirror drill. Synthetic workflows missing any of these are reported. _(proof: every workflow that runs the test suite bounds its time and fails over from a dead package mirror)_
- [ ] **ac-2** — N4: every workflow that runs the suite sets up the same Node major, 24; a synthetic workflow on another major is reported. _(proof: every workflow that runs the test suite uses one Node major)_
- [ ] **ac-3** — N4: on pull_request only the Gate runs the suite, CI runs on branch pushes and dispatch, and every suite workflow cancels superseded runs with a concurrency group keyed by its own workflow; synthetic duplicates and an unkeyed group are reported. _(proof: the suite runs once per ref kind and superseded runs are cancelled)_
- [ ] **ac-4** — N4: deploy.yml's check job runs the same setup and check steps, in the same order, as ci.yml's check job (deploy adds only its upload and deploy steps); a synthetic divergence is reported. _(proof: the deploy check runs exactly the steps CI proves on every push)_
- [ ] **ac-5** — N1: in Chromium and WebKit, with slow page modules, goTo returns only after the destination has committed and the outgoing heading is gone. Covers a first-load lazy page, a cached page, the same page with new params, a focused route and a redirecting URL; a shared-heading pair passed an explicit arrival works, and one without it fails loudly. Fails on the pre-fix goTo. _(proof: navigation returns only once the destination page has rendered, in Chromium and WebKit, even when page modules load slowly)_
- [ ] **ac-6** — N2: in Chromium and WebKit, with `delayStorageMs` 1500, an action followed by reload() keeps the write and later reads observe it. The pre-fix 400 ms sleep loses it. _(proof: persisted reads and reload are ordered after every write the app has already issued, in Chromium and WebKit)_
- [ ] **ac-7** — N3: the static guard rejects synthetic offenders of all four rules (a sleep, a local poller, a positive point-in-time existence assertion, an unledgered polled negative) and finds none in the real journeys and harness. _(proof: browser journeys wait on events, never on fixed sleeps, hand-rolled pollers or positive point-in-time reads)_
- [ ] **ac-8** — N2 applied: every read of the effect-claimed signal marker waits for it to land and still asserts exactly one claim. _(proof: practice sound reuses one gesture primed context across all start and resume doors)_
- [ ] **ac-9** — N2 applied to routine boundaries, pause and save: persisted reads wait for effect-issued writes, and minutes stay exact. _(proof: practice cues preserve wall clock boundaries and every recorded minute)_
- [ ] **ac-10** — N1 applied: the WebKit 1280px failure path (Working notes count after reaching the active page) is deterministic. _(proof: practice information controls render accessible directional text at phone and desktop widths)_
- [ ] **ac-11** — N1/N3 applied: the repertoire navigation journey that failed four times is deterministic. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-12** — N3 applied: the transition-held select read stays polled and exact under 20× CPU slowdown. _(proof: repertoire search keeps every typed character under heavy cpu slowdown)_

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

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-make-browser-tests-ci-and-the-prismatica-0e6c/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261007-make-browser-tests-ci-and-the-prismatica-0e6c' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-make-browser-tests-ci-and-the-prismatica-0e6c/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-make-browser-tests-ci-and-the-prismatica-0e6c/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
