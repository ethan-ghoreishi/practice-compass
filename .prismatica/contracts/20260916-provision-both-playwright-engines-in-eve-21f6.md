---
id: 20260916-provision-both-playwright-engines-in-eve-21f6
title: Provision both Playwright engines in every CI path that runs the suite
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/26
intent: 20260916-provision-both-playwright-engines-in-eve-21f6
tier: normal
stage: review
baseline:
  commit: d014293c205958f45e4393ebf6ae56901db83a1c
  branch: main
branch: change/20260916-provision-both-playwright-engines-in-eve-21f6
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260916-provision-both-playwright-engines-in-eve-21f6
builder: claude
planHash: 3bf53256bff543e47e349fdcc268392915aba66448ba75be2d1d7b5e40ed62c8
allowedPaths:
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - .github/workflows/prismatica-gate.yml
  - tests/ci-browser-setup.test.ts
forbiddenPaths:
  - src/**
  - tests/practiceBrowser.ts
  - tests/**/*.browser.test.ts
  - tests/fixtures/**
  - package.json
  - package-lock.json
  - vite.config.ts
  - AGENTS.md
  - docs/**
nonGoals:
  - "Application and runtime behaviour: no file under src/ is touched, so
    nothing the app does at runtime can change."
  - "The browser journeys and the harness: tests/practiceBrowser.ts and every
    tests/*.browser.test.ts stay exactly as they are — browsers are installed by
    CI setup, never dynamically from inside a test."
  - WebKit coverage stays required. No engine may be skipped, made conditional,
    wrapped in a try, or downgraded to a warning to make CI green.
  - Existing Chromium coverage stays exactly as it is.
  - "Playwright version pinning: package.json and package-lock.json are
    untouched, and the install invocation must stay unversioned (`playwright
    install`, never `playwright@x.y.z install`) so it resolves the
    lockfile-pinned Playwright that `npm ci` just installed."
  - "PR #25's feature branch: no commit, merge, rebase or base update on
    change/20260916-keep-useful-practice-information-clear-f-2e1e. Its head must
    stay eec06c018bcf58052a96bed4e57b07f6ae9da105 so its sealed review and
    signed owner decision over patchId 3252f40a remain valid."
  - Node versions (22 in ci.yml and deploy.yml, 24 in prismatica-gate.yml),
    action versions, job structure, triggers, permissions and concurrency in
    every workflow.
  - The pinned gate version `prismatica@0.7.2` in prismatica-gate.yml, and its
    lock-file guard and `--yes` behaviour.
  - The deploy job of deploy.yml and its single lint+test+build dependency chain.
  - "AGENTS.md is deliberately forbidden, not merely out of scope. Its
    CI/browser paragraph is already rewritten by PR #25, which is allowed to
    edit AGENTS.md; editing the same prose here would create a merge conflict
    when PR #25 lands, and resolving it would move that branch's head and
    destroy the sealed review and signed decision this lane exists to preserve.
    docsDelta is therefore empty on purpose — PR #25 already carries the
    documentation for the two-engine suite."
  - "vite.config.ts carries the same journey-count comment and is left
    untouched: it is not a CI path, and it is on PR #25’s forbidden list, so
    touching it here risks the same conflict for no benefit."
  - The Node 20 deprecation warnings in the Actions logs are unrelated to this
    failure and are not addressed.
  - No caching of the Playwright browser download, no matrix, no workflow
    consolidation, no other CI architecture change.
  - "No new dependency: the acceptance scanner reads the workflow files as text,
    the way src/components/direction.test.ts already scans source, rather than
    adding a YAML parser for four assertions."
acceptanceChecks:
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
    test: every workflow that runs the test suite installs both browser engines
      before it
  - id: ac-2
    description: "The discriminating case, so the scanner above is not vacuous: the
      same check function, run against a synthetic workflow that runs the suite
      but installs only chromium, must REPORT it as missing webkit; run against
      one installing both, it must report nothing. Valid versus invalid, proving
      the check can actually fail — this is what distinguishes the invariant
      from a test that passes no matter what the workflows say."
    test: a workflow that runs the suite without every engine is reported, not
      passed over
  - id: ac-3
    description: "Pinning is preserved and is checked, not assumed: every Playwright
      install invocation in those workflows must be unversioned — `playwright
      install`, never `playwright@<version> install` — so it resolves the
      Playwright that `npm ci` installed from package-lock.json (1.63.0) and the
      browser revisions move only when that dependency does. Empirically the
      pinned revisions are chromium-headless-shell v1243 and webkit v2359 under
      1.63.0."
    test: the install resolves the repository's own pinned Playwright, never an
      independently versioned one
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
    test: manual:OWNER
docsDelta: []
createdAt: 2026-09-16T20:30:34.240Z
amendments: []
---

# Provision both Playwright engines in every CI path that runs the suite

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/26
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Baseline:** d014293c205958f45e4393ebf6ae56901db83a1c on main _(never re-baselined)_
- **Intent:** 20260916-provision-both-playwright-engines-in-eve-21f6

## You may only change

- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- tests/ci-browser-setup.test.ts

## Never touch

- src/**
- tests/practiceBrowser.ts
- tests/**/*.browser.test.ts
- tests/fixtures/**
- package.json
- package-lock.json
- vite.config.ts
- AGENTS.md
- docs/**

## Non-goals

- Application and runtime behaviour: no file under src/ is touched, so nothing the app does at runtime can change.
- The browser journeys and the harness: tests/practiceBrowser.ts and every tests/*.browser.test.ts stay exactly as they are — browsers are installed by CI setup, never dynamically from inside a test.
- WebKit coverage stays required. No engine may be skipped, made conditional, wrapped in a try, or downgraded to a warning to make CI green.
- Existing Chromium coverage stays exactly as it is.
- Playwright version pinning: package.json and package-lock.json are untouched, and the install invocation must stay unversioned (`playwright install`, never `playwright@x.y.z install`) so it resolves the lockfile-pinned Playwright that `npm ci` just installed.
- PR #25's feature branch: no commit, merge, rebase or base update on change/20260916-keep-useful-practice-information-clear-f-2e1e. Its head must stay eec06c018bcf58052a96bed4e57b07f6ae9da105 so its sealed review and signed owner decision over patchId 3252f40a remain valid.
- Node versions (22 in ci.yml and deploy.yml, 24 in prismatica-gate.yml), action versions, job structure, triggers, permissions and concurrency in every workflow.
- The pinned gate version `prismatica@0.7.2` in prismatica-gate.yml, and its lock-file guard and `--yes` behaviour.
- The deploy job of deploy.yml and its single lint+test+build dependency chain.
- AGENTS.md is deliberately forbidden, not merely out of scope. Its CI/browser paragraph is already rewritten by PR #25, which is allowed to edit AGENTS.md; editing the same prose here would create a merge conflict when PR #25 lands, and resolving it would move that branch's head and destroy the sealed review and signed decision this lane exists to preserve. docsDelta is therefore empty on purpose — PR #25 already carries the documentation for the two-engine suite.
- vite.config.ts carries the same journey-count comment and is left untouched: it is not a CI path, and it is on PR #25’s forbidden list, so touching it here risks the same conflict for no benefit.
- The Node 20 deprecation warnings in the Actions logs are unrelated to this failure and are not addressed.
- No caching of the Playwright browser download, no matrix, no workflow consolidation, no other CI architecture change.
- No new dependency: the acceptance scanner reads the workflow files as text, the way src/components/direction.test.ts already scans source, rather than adding a YAML parser for four assertions.

## Acceptance checks (definition of done)

- [ ] **ac-1** — The invariant, not the command string: a scanner over every file in .github/workflows/ finds each workflow that runs the test suite (a step running `npm test`) and asserts that a Playwright install step earlier in the same file provides BOTH engines the suite can drive, chromium and webkit. It discovers the workflows itself rather than reading a list of three, so a future fourth workflow that runs the suite is covered without editing the test, and it asserts it found a non-zero number of such workflows so a scanner that silently matches nothing cannot pass as a clean result. _(proof: every workflow that runs the test suite installs both browser engines before it)_
- [ ] **ac-2** — The discriminating case, so the scanner above is not vacuous: the same check function, run against a synthetic workflow that runs the suite but installs only chromium, must REPORT it as missing webkit; run against one installing both, it must report nothing. Valid versus invalid, proving the check can actually fail — this is what distinguishes the invariant from a test that passes no matter what the workflows say. _(proof: a workflow that runs the suite without every engine is reported, not passed over)_
- [ ] **ac-3** — Pinning is preserved and is checked, not assumed: every Playwright install invocation in those workflows must be unversioned — `playwright install`, never `playwright@<version> install` — so it resolves the Playwright that `npm ci` installed from package-lock.json (1.63.0) and the browser revisions move only when that dependency does. Empirically the pinned revisions are chromium-headless-shell v1243 and webkit v2359 under 1.63.0. _(proof: the install resolves the repository's own pinned Playwright, never an independently versioned one)_
- [ ] **ac-4** — End-to-end sufficiency for the exact failure that blocked PR #25, which only the owner can perform and only after this lane is on main. Trigger a FRESH `pull_request` event on PR #25 — for example close and reopen it — and verify the NEWLY GENERATED checks pass, ac-14 included. Re-running the existing Actions run is NOT sufficient and must not be used as the evidence here: a re-run replays the original run's merge commit (f385713) and the workflow file as it stood there, so it would still execute the Chromium-only setup and fail identically no matter what landed on main. Only a new event makes GitHub recompute refs/pull/25/merge against the updated base and pick up the fixed workflow. PR #25's head must be UNCHANGED throughout (still eec06c018bcf58052a96bed4e57b07f6ae9da105) — close/reopen moves no commit, so its sealed review and signed decision over patchId 3252f40a survive; confirm the head SHA before and after. Also confirm this lane's own PR gate is green, which proves ci.yml and prismatica-gate.yml provision WebKit successfully on ubuntu-latest, and that the push to main after merge completes the deploy job, which proves the same for deploy.yml. _(proof: manual:OWNER)_

## Docs to update

_none_

## Amendments

_none_

