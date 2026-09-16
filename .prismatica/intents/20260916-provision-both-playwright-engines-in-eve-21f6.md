---
id: 20260916-provision-both-playwright-engines-in-eve-21f6
title: Provision both Playwright engines in every CI path that runs the suite
state: open
checks:
  - id: ac-1
    description: "The invariant, not the command string: a scanner over every file
      in .github/workflows/ finds each workflow that runs the test suite (a step
      running `npm test`) and asserts that a Playwright install step earlier in
      the same file provides BOTH engines the suite can drive, chromium and
      webkit. It discovers the workflows itself rather than reading a list of
      three, so a future fourth workflow that runs the suite is covered without
      editing the test, and it asserts it found a non-zero number of such
      workflows so a scanner that silently matches nothing cannot pass as a
      clean result."
    status: unproven
  - id: ac-2
    description: "The discriminating case, so the scanner above is not vacuous: the
      same check function, run against a synthetic workflow that runs the suite
      but installs only chromium, must REPORT it as missing webkit; run against
      one installing both, it must report nothing. Valid versus invalid, proving
      the check can actually fail — this is what distinguishes the invariant
      from a test that passes no matter what the workflows say."
    status: unproven
  - id: ac-3
    description: "Pinning is preserved and is checked, not assumed: every Playwright
      install invocation in those workflows must be unversioned — `playwright
      install`, never `playwright@<version> install` — so it resolves the
      Playwright that `npm ci` installed from package-lock.json (1.63.0) and the
      browser revisions move only when that dependency does. Empirically the
      pinned revisions are chromium-headless-shell v1243 and webkit v2359 under
      1.63.0."
    status: unproven
  - id: ac-4
    description: "End-to-end sufficiency for the exact failure that blocked PR #25,
      which only the owner can perform and only after this lane is on main.
      Trigger a FRESH `pull_request` event on PR #25 — for example close and
      reopen it — and verify the NEWLY GENERATED checks pass, ac-14 included.
      Re-running the existing Actions run is NOT sufficient and must not be used
      as the evidence here: a re-run replays the original run's merge commit
      (f385713) and the workflow file as it stood there, so it would still
      execute the Chromium-only setup and fail identically no matter what landed
      on main. Only a new event makes GitHub recompute refs/pull/25/merge
      against the updated base and pick up the fixed workflow. PR #25's head
      must be UNCHANGED throughout (still
      eec06c018bcf58052a96bed4e57b07f6ae9da105) — close/reopen moves no commit,
      so its sealed review and signed decision over patchId 3252f40a survive;
      confirm the head SHA before and after. Also confirm this lane's own PR
      gate is green, which proves ci.yml and prismatica-gate.yml provision
      WebKit successfully on ubuntu-latest, and that the push to main after
      merge completes the deploy job, which proves the same for deploy.yml."
    status: unproven
createdAt: 2026-09-16T20:30:34.240Z
---

# Approved intent: Provision both Playwright engines in every CI path that runs the suite

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** technical
- **Risk tier:** normal
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> PR #25's remote Prismatica gate fails because the repository's required browser test now runs in both Chromium and WebKit, while every GitHub Actions path that runs the test suite installs Chromium only. Plan the smallest correct lane that ensures every CI path which executes the repository's browser-dependent test suite installs every Playwright browser binary that suite requires, currently Chromium and WebKit, while preserving the repository's existing Playwright version pinning through the installed package/lockfile. This is a CI/test-environment portability defect, not an application/product defect. Do not change application code, browser tests, acceptance coverage, package.json/lockfile unless investigation proves genuinely necessary, the current heavy lane, Playwright test logic to install browsers dynamically, browser coverage to skip WebKit, Node/action versions merely because of the unrelated Node 20 deprecation warning, or unrelated CI architecture. Design focused acceptance evidence proving the underlying CI invariant, not merely the literal command string. Keep tests/checks proportionate to a tiny CI-only lane; do not invent a large framework or heavyweight test project. This lane exists specifically so it can be merged to main first; afterwards PR #25 should be triggered again against the updated base without changing PR #25's feature-branch HEAD, preserving its existing sealed review and signed owner evidence. Do not plan to merge main into the heavy branch as part of this lane.

## Why

The defect is in CI setup, not in the app. All three workflows on this exact commit (d014293c) install one engine: ci.yml:26 and deploy.yml:33 run `npx playwright install --with-deps chromium`, and prismatica-gate.yml:47 runs `npx --yes playwright install --with-deps chromium`. All three then run `npm test`, which is `vitest run` over `include: ['src/**/*.test.ts','tests/**/*.test.ts']` (vite.config.ts:97) — so every one of them executes the whole browser-journey suite. The harness refuses to skip a missing engine by design (tests/practiceBrowser.ts), so an engine CI does not provide is a hard failure rather than a silent pass. That is what job 104925317703 reported: `ac-14 … the test named exactly this did not pass` / `Error: The Playwright webkit browser is not installed`, with every setup step before it green and the identical suite passing locally where WebKit is installed.

Landing this on main first is what makes it repairable without touching PR #25. That gate ran on merge commit f385713, logged as `Merge eec06c018bcf58052a96bed4e57b07f6ae9da105 into d014293c205958f45e4393ebf6ae56901db83a1c` — a `pull_request` event builds the merge of head into base, so a workflow fixed on the base is picked up once GitHub recomputes that merge ref, while the PR's head SHA stays eec06c0. Recomputation needs a fresh `pull_request` event (close/reopen); replaying the existing run would reuse f385713 and the Chromium-only workflow baked into it. PR #25's sealed review and Ed25519-signed owner decision are both bound to patchId 3252f40a over that head, and merging main into the heavy branch would move it and destroy both. This lane therefore changes the base and nothing else.

One fact found by reading main rather than trusting the description, and it narrows the plan: on this commit nothing in the suite drives WebKit at all. tests/practiceBrowser.ts imports `chromium` only, and the two journeys present (daily-practice, lesson-agenda) are Chromium-only. The WebKit engine and the layout journey that drives it arrive with PR #25. So this lane is deliberately a base-side precondition: it provisions the engine before the suite that needs it lands, which is exactly why its proof has to be an invariant about CI setup rather than a WebKit journey that does not yet exist here.

## Today

On d014293c, three workflows run the repository's full test suite and each installs Chromium alone: .github/workflows/ci.yml (line 26), .github/workflows/deploy.yml (line 33) and .github/workflows/prismatica-gate.yml (line 47). Each runs `npm test` afterwards, and `npm test` is `vitest run` across both `src/**/*.test.ts` and `tests/**/*.test.ts`, so all three run every browser journey in the repository. The suite on main happens to need only Chromium today, so all three are green here; the moment a journey drives a second engine, all three fail with a setup error rather than skipping, and PR #25's gate already does exactly that. deploy.yml is the same code path, so the same failure would stop the GitHub Pages deployment on the next push to main, not just a PR check.

## Instead

Every GitHub Actions job that runs this repository's test suite installs every Playwright browser engine that suite can drive — Chromium and WebKit — before the tests execute, from the Playwright already installed by `npm ci` so the browser revisions stay pinned by package-lock.json. The substantive change is expected to be `npx playwright install --with-deps chromium webkit` in each of the three install steps (keeping prismatica-gate.yml's existing `--yes` and lock-file guard exactly as they are), plus a short comment on the block being edited saying why both engines are provisioned. No workflow that does not run the suite is touched, no Node or action version moves, no application code, test logic or dependency changes, and WebKit coverage is provisioned rather than skipped or weakened.

The comment on each edited block is part of the change, not optional tidying: the block gains a `webkit` that no test on this commit drives, so without a reason stated there a later reader removes it as dead weight and silently reopens this exact defect. Rewriting that comment also drops its "two real-browser journeys" count, which is accurate on this commit but becomes wrong the moment PR #25 lands; the replacement states why both engines are provisioned and counts nothing.

The scanner's predicate must be an exported function taking workflow text (or a name/text pair) and returning what is missing, not logic inlined in a test body — the discriminating check below runs it against a synthetic workflow, which is only possible if it is callable independently of the real files.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Verified from the failing run, not assumed: a `pull_request` workflow runs against the merge of head into base. Job 104925317703 logged `HEAD is now at f385713 Merge eec06c018bcf58052a96bed4e57b07f6ae9da105 into d014293c205958f45e4393ebf6ae56901db83a1c`. This is what lets a base-side fix repair PR #25 with its head untouched, and it is the single assumption the whole lifecycle plan rests on. If a fresh `pull_request` event on PR #25 still fails after this lands, the merge ref did not refresh — and the fallback is the owner’s decision, never a merge of main into that branch.
- Verified locally, not assumed: `npx playwright install` resolves the Playwright that `npm ci` installed. Under 1.63.0 `--dry-run webkit` resolves webkit v2359, and CI’s current chromium step logged chromium-headless-shell v1243. Adding `webkit` to the same invocation inherits that pinning with no new mechanism.
- Assumed, and proved only by this lane’s own green gate: WebKit runs on ubuntu-latest with `--with-deps`, which installs its system libraries. If it turns out not to, that surfaces as a red check on this lane before anything merges — never as a silent skip.
- The added install adds roughly a minute of download to each of the three workflows. Accepted as the cost of an engine the suite genuinely requires; no caching is proposed because it is not needed to make the suite correct.
- wipLimit is 2 and one change (PR #25) is in flight, so framing a second lane is within the configured limit.

**Possible conflicts**

- PR #25 edits AGENTS.md and vite.config.ts; this lane deliberately touches neither, so the two changes have no overlapping file at all and should merge cleanly in either order. That disjointness is the point — it is what keeps PR #25’s head, sealed review and signed decision intact.
- Ordering matters: this lane must merge to main BEFORE PR #25. Merged after, it would not repair PR #25’s gate, and PR #25 would have no route to green that does not move its head.
- The repository default tier is `normal` and no path rule here raises it, so this will be framed `normal` rather than `light`. The import has no way to request a lower tier. If the owner wants it light, the route is `prismatica amend <id> --tier light --reason "…"`, and it must be run BEFORE any review is sealed or any decision signed: assertAmendable (commands/amend.js:79) refuses an amendment outright once either exists — the same refusal that closed the amend route on PR #25.
- This lane adds tests/ci-browser-setup.test.ts, a new file in a directory PR #25 also adds files to — a new path on each side, not a shared one, so no conflict is expected.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "PR #25's remote Prismatica gate fails because the repository's required browser test now runs in both Chromium and WebKit, while every GitHub Actions path that runs the test suite installs Chromium only. Plan the smallest correct lane that ensures every CI path which executes the repository's browser-dependent test suite installs every Playwright browser binary that suite requires, currently Chromium and WebKit, while preserving the repository's existing Playwright version pinning through the installed package/lockfile. This is a CI/test-environment portability defect, not an application/product defect. Do not change application code, browser tests, acceptance coverage, package.json/lockfile unless investigation proves genuinely necessary, the current heavy lane, Playwright test logic to install browsers dynamically, browser coverage to skip WebKit, Node/action versions merely because of the unrelated Node 20 deprecation warning, or unrelated CI architecture. Design focused acceptance evidence proving the underlying CI invariant, not merely the literal command string. Keep tests/checks proportionate to a tiny CI-only lane; do not invent a large framework or heavyweight test project. This lane exists specifically so it can be merged to main first; afterwards PR #25 should be triggered again against the updated base without changing PR #25's feature-branch HEAD, preserving its existing sealed review and signed owner evidence. Do not plan to merge main into the heavy branch as part of this lane.",
  "builder": "claude",
  "summary": "Provision both Playwright engines in every CI path that runs the suite",
  "rationale": "The defect is in CI setup, not in the app. All three workflows on this exact commit (d014293c) install one engine: ci.yml:26 and deploy.yml:33 run `npx playwright install --with-deps chromium`, and prismatica-gate.yml:47 runs `npx --yes playwright install --with-deps chromium`. All three then run `npm test`, which is `vitest run` over `include: ['src/**/*.test.ts','tests/**/*.test.ts']` (vite.config.ts:97) — so every one of them executes the whole browser-journey suite. The harness refuses to skip a missing engine by design (tests/practiceBrowser.ts), so an engine CI does not provide is a hard failure rather than a silent pass. That is what job 104925317703 reported: `ac-14 … the test named exactly this did not pass` / `Error: The Playwright webkit browser is not installed`, with every setup step before it green and the identical suite passing locally where WebKit is installed.\n\nLanding this on main first is what makes it repairable without touching PR #25. That gate ran on merge commit f385713, logged as `Merge eec06c018bcf58052a96bed4e57b07f6ae9da105 into d014293c205958f45e4393ebf6ae56901db83a1c` — a `pull_request` event builds the merge of head into base, so a workflow fixed on the base is picked up once GitHub recomputes that merge ref, while the PR's head SHA stays eec06c0. Recomputation needs a fresh `pull_request` event (close/reopen); replaying the existing run would reuse f385713 and the Chromium-only workflow baked into it. PR #25's sealed review and Ed25519-signed owner decision are both bound to patchId 3252f40a over that head, and merging main into the heavy branch would move it and destroy both. This lane therefore changes the base and nothing else.\n\nOne fact found by reading main rather than trusting the description, and it narrows the plan: on this commit nothing in the suite drives WebKit at all. tests/practiceBrowser.ts imports `chromium` only, and the two journeys present (daily-practice, lesson-agenda) are Chromium-only. The WebKit engine and the layout journey that drives it arrive with PR #25. So this lane is deliberately a base-side precondition: it provisions the engine before the suite that needs it lands, which is exactly why its proof has to be an invariant about CI setup rather than a WebKit journey that does not yet exist here.",
  "kind": "technical",
  "currentBehaviour": "On d014293c, three workflows run the repository's full test suite and each installs Chromium alone: .github/workflows/ci.yml (line 26), .github/workflows/deploy.yml (line 33) and .github/workflows/prismatica-gate.yml (line 47). Each runs `npm test` afterwards, and `npm test` is `vitest run` across both `src/**/*.test.ts` and `tests/**/*.test.ts`, so all three run every browser journey in the repository. The suite on main happens to need only Chromium today, so all three are green here; the moment a journey drives a second engine, all three fail with a setup error rather than skipping, and PR #25's gate already does exactly that. deploy.yml is the same code path, so the same failure would stop the GitHub Pages deployment on the next push to main, not just a PR check.",
  "desiredBehaviour": "Every GitHub Actions job that runs this repository's test suite installs every Playwright browser engine that suite can drive — Chromium and WebKit — before the tests execute, from the Playwright already installed by `npm ci` so the browser revisions stay pinned by package-lock.json. The substantive change is expected to be `npx playwright install --with-deps chromium webkit` in each of the three install steps (keeping prismatica-gate.yml's existing `--yes` and lock-file guard exactly as they are), plus a short comment on the block being edited saying why both engines are provisioned. No workflow that does not run the suite is touched, no Node or action version moves, no application code, test logic or dependency changes, and WebKit coverage is provisioned rather than skipped or weakened.\n\nThe comment on each edited block is part of the change, not optional tidying: the block gains a `webkit` that no test on this commit drives, so without a reason stated there a later reader removes it as dead weight and silently reopens this exact defect. Rewriting that comment also drops its \"two real-browser journeys\" count, which is accurate on this commit but becomes wrong the moment PR #25 lands; the replacement states why both engines are provisioned and counts nothing.\n\nThe scanner's predicate must be an exported function taking workflow text (or a name/text pair) and returning what is missing, not logic inlined in a test body — the discriminating check below runs it against a synthetic workflow, which is only possible if it is callable independently of the real files.",
  "mustNotChange": [
    "Application and runtime behaviour: no file under src/ is touched, so nothing the app does at runtime can change.",
    "The browser journeys and the harness: tests/practiceBrowser.ts and every tests/*.browser.test.ts stay exactly as they are — browsers are installed by CI setup, never dynamically from inside a test.",
    "WebKit coverage stays required. No engine may be skipped, made conditional, wrapped in a try, or downgraded to a warning to make CI green.",
    "Existing Chromium coverage stays exactly as it is.",
    "Playwright version pinning: package.json and package-lock.json are untouched, and the install invocation must stay unversioned (`playwright install`, never `playwright@x.y.z install`) so it resolves the lockfile-pinned Playwright that `npm ci` just installed.",
    "PR #25's feature branch: no commit, merge, rebase or base update on change/20260916-keep-useful-practice-information-clear-f-2e1e. Its head must stay eec06c018bcf58052a96bed4e57b07f6ae9da105 so its sealed review and signed owner decision over patchId 3252f40a remain valid.",
    "Node versions (22 in ci.yml and deploy.yml, 24 in prismatica-gate.yml), action versions, job structure, triggers, permissions and concurrency in every workflow.",
    "The pinned gate version `prismatica@0.7.2` in prismatica-gate.yml, and its lock-file guard and `--yes` behaviour.",
    "The deploy job of deploy.yml and its single lint+test+build dependency chain."
  ],
  "assumptions": [
    "Verified from the failing run, not assumed: a `pull_request` workflow runs against the merge of head into base. Job 104925317703 logged `HEAD is now at f385713 Merge eec06c018bcf58052a96bed4e57b07f6ae9da105 into d014293c205958f45e4393ebf6ae56901db83a1c`. This is what lets a base-side fix repair PR #25 with its head untouched, and it is the single assumption the whole lifecycle plan rests on. If a fresh `pull_request` event on PR #25 still fails after this lands, the merge ref did not refresh — and the fallback is the owner’s decision, never a merge of main into that branch.",
    "Verified locally, not assumed: `npx playwright install` resolves the Playwright that `npm ci` installed. Under 1.63.0 `--dry-run webkit` resolves webkit v2359, and CI’s current chromium step logged chromium-headless-shell v1243. Adding `webkit` to the same invocation inherits that pinning with no new mechanism.",
    "Assumed, and proved only by this lane’s own green gate: WebKit runs on ubuntu-latest with `--with-deps`, which installs its system libraries. If it turns out not to, that surfaces as a red check on this lane before anything merges — never as a silent skip.",
    "The added install adds roughly a minute of download to each of the three workflows. Accepted as the cost of an engine the suite genuinely requires; no caching is proposed because it is not needed to make the suite correct.",
    "wipLimit is 2 and one change (PR #25) is in flight, so framing a second lane is within the configured limit."
  ],
  "possibleConflicts": [
    "PR #25 edits AGENTS.md and vite.config.ts; this lane deliberately touches neither, so the two changes have no overlapping file at all and should merge cleanly in either order. That disjointness is the point — it is what keeps PR #25’s head, sealed review and signed decision intact.",
    "Ordering matters: this lane must merge to main BEFORE PR #25. Merged after, it would not repair PR #25’s gate, and PR #25 would have no route to green that does not move its head.",
    "The repository default tier is `normal` and no path rule here raises it, so this will be framed `normal` rather than `light`. The import has no way to request a lower tier. If the owner wants it light, the route is `prismatica amend <id> --tier light --reason \"…\"`, and it must be run BEFORE any review is sealed or any decision signed: assertAmendable (commands/amend.js:79) refuses an amendment outright once either exists — the same refusal that closed the amend route on PR #25.",
    "This lane adds tests/ci-browser-setup.test.ts, a new file in a directory PR #25 also adds files to — a new path on each side, not a shared one, so no conflict is expected."
  ],
  "scope": {
    "allow": [
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
      ".github/workflows/prismatica-gate.yml",
      "tests/ci-browser-setup.test.ts"
    ],
    "forbid": [
      "src/**",
      "tests/practiceBrowser.ts",
      "tests/**/*.browser.test.ts",
      "tests/fixtures/**",
      "package.json",
      "package-lock.json",
      "vite.config.ts",
      "AGENTS.md",
      "docs/**"
    ]
  },
  "exclusions": [
    "AGENTS.md is deliberately forbidden, not merely out of scope. Its CI/browser paragraph is already rewritten by PR #25, which is allowed to edit AGENTS.md; editing the same prose here would create a merge conflict when PR #25 lands, and resolving it would move that branch's head and destroy the sealed review and signed decision this lane exists to preserve. docsDelta is therefore empty on purpose — PR #25 already carries the documentation for the two-engine suite.",
    "vite.config.ts carries the same journey-count comment and is left untouched: it is not a CI path, and it is on PR #25’s forbidden list, so touching it here risks the same conflict for no benefit.",
    "The Node 20 deprecation warnings in the Actions logs are unrelated to this failure and are not addressed.",
    "No caching of the Playwright browser download, no matrix, no workflow consolidation, no other CI architecture change.",
    "No new dependency: the acceptance scanner reads the workflow files as text, the way src/components/direction.test.ts already scans source, rather than adding a YAML parser for four assertions."
  ],
  "acceptance": [
    {
      "description": "The invariant, not the command string: a scanner over every file in .github/workflows/ finds each workflow that runs the test suite (a step running `npm test`) and asserts that a Playwright install step earlier in the same file provides BOTH engines the suite can drive, chromium and webkit. It discovers the workflows itself rather than reading a list of three, so a future fourth workflow that runs the suite is covered without editing the test, and it asserts it found a non-zero number of such workflows so a scanner that silently matches nothing cannot pass as a clean result.",
      "test": "every workflow that runs the test suite installs both browser engines before it"
    },
    {
      "description": "The discriminating case, so the scanner above is not vacuous: the same check function, run against a synthetic workflow that runs the suite but installs only chromium, must REPORT it as missing webkit; run against one installing both, it must report nothing. Valid versus invalid, proving the check can actually fail — this is what distinguishes the invariant from a test that passes no matter what the workflows say.",
      "test": "a workflow that runs the suite without every engine is reported, not passed over"
    },
    {
      "description": "Pinning is preserved and is checked, not assumed: every Playwright install invocation in those workflows must be unversioned — `playwright install`, never `playwright@<version> install` — so it resolves the Playwright that `npm ci` installed from package-lock.json (1.63.0) and the browser revisions move only when that dependency does. Empirically the pinned revisions are chromium-headless-shell v1243 and webkit v2359 under 1.63.0.",
      "test": "the install resolves the repository's own pinned Playwright, never an independently versioned one"
    },
    {
      "description": "End-to-end sufficiency for the exact failure that blocked PR #25, which only the owner can perform and only after this lane is on main. Trigger a FRESH `pull_request` event on PR #25 — for example close and reopen it — and verify the NEWLY GENERATED checks pass, ac-14 included. Re-running the existing Actions run is NOT sufficient and must not be used as the evidence here: a re-run replays the original run's merge commit (f385713) and the workflow file as it stood there, so it would still execute the Chromium-only setup and fail identically no matter what landed on main. Only a new event makes GitHub recompute refs/pull/25/merge against the updated base and pick up the fixed workflow. PR #25's head must be UNCHANGED throughout (still eec06c018bcf58052a96bed4e57b07f6ae9da105) — close/reopen moves no commit, so its sealed review and signed decision over patchId 3252f40a survive; confirm the head SHA before and after. Also confirm this lane's own PR gate is green, which proves ci.yml and prismatica-gate.yml provision WebKit successfully on ubuntu-latest, and that the push to main after merge completes the deploy job, which proves the same for deploy.yml.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": false,
    "copyOnly": false,
    "rationale": "CI configuration only. No file under src/ is in scope, so no runtime, storage, schema, migration, sync or secret-handling path is reachable from this change; no saved practice data, IndexedDB shape or backup format is involved. It is not copy-only either: workflow YAML is executable build configuration, and a mistake in it breaks the merge gate or the Pages deployment rather than merely reading badly. The realistic failure modes are a YAML syntax error, an install step that silently no-ops, and an engine that will not run on ubuntu-latest — the first two are covered by the scanner checks above and the third by the owner check, which requires this lane’s own green gate before anything merges."
  },
  "desiredRules": [],
  "docsDelta": []
}
```

