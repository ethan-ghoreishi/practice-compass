---
id: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
title: Make browser tests, CI and the Prismatica Gate fast, deterministic and
  trustworthy
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/49
intent: 20261007-make-browser-tests-ci-and-the-prismatica-0e6c
tier: normal
stage: ship
baseline:
  commit: fc87f8d8d64315d46bd800cffd561c979a8c64e0
  branch: main
branch: change/20261007-make-browser-tests-ci-and-the-prismatica-0e6c
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261007-make-browser-tests-ci-and-the-prismatica-0e6c
builder: claude
planHash: 7833ed7d9c874023d3c2c72f5feaab1603c0740c82210f72f7f8b5d2425f8b98
allowedPaths:
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
forbiddenPaths:
  - src/**
  - package.json
  - package-lock.json
  - vite.config.ts
  - .prismatica/**
  - tests/fixtures/**
nonGoals:
  - "Product code and behaviour: nothing under src/ changes, and no app debug
    hook, data attribute or test-only signal is added. If a family genuinely
    cannot be closed from the harness, stop and ask for an amend."
  - "Test strength: an exact assertion stays exact (`toBe(1)` never becomes `>
    0` or 'defined'), every engine and viewport loop stays, no assertion is
    skipped or deleted, Vitest retry stays 0, and timeouts are never raised as a
    fix."
  - "Harness rules in AGENTS.md and DECISIONS 2026-09-29 stay: every page error
    is kept, never goTo the current route, connectSync waits for Sync now, one
    private Vite cache per server, the fake GitHub remembers main, and a missing
    browser fails rather than skipping."
  - "Gate integrity: the `npx --yes prismatica@0.10.0 gate` command and pin, its
    pull_request trigger to main, `.prismatica/` config and checks, both engines
    installed before the suite, and the lockfile-pinned unversioned Playwright
    install."
  - >-
    Review focus, so it is settled up front:

    - every changed assertion keeps or strengthens its matcher and its engine
    and viewport coverage;

    - the Gate-integrity items above hold;

    - for each discriminating test, the commit message names the pre-fix command
    or commit that showed it failing, so the reviewer can re-run it.
  - Product fixes, including the open gaps listed in AGENTS.md.
  - A container image or a browser cache for CI (an independent version pin,
    font and geometry drift, small gain).
  - Sharding or matrix jobs (the Gate runs the suite as one Prismatica check).
  - "A shared dev server: measured cold launch 0.6–0.9 s per app locally, a
    small gain against the isolation and rollback-root complexity."
  - Splitting or rewriting journeys for speed, new dependencies, the Playwright
    test runner, README edits, and other unrelated cleanup.
acceptanceChecks:
  - id: ac-1
    description: "N4: every workflow that runs the suite (discovered, never listed)
      has a job time bound, a bounded browser-install step, and apt mirror
      failover configured before `playwright install --with-deps`; CI offers the
      dispatch-only dead-mirror drill. Synthetic workflows missing any of these
      are reported."
    test: every workflow that runs the test suite bounds its time and fails over
      from a dead package mirror
  - id: ac-2
    description: "N4: every workflow that runs the suite sets up the same Node
      major, 24; a synthetic workflow on another major is reported."
    test: every workflow that runs the test suite uses one Node major
  - id: ac-3
    description: "N4: on pull_request only the Gate runs the suite, CI runs on
      branch pushes and dispatch, and every suite workflow cancels superseded
      runs with a concurrency group keyed by its own workflow; synthetic
      duplicates and an unkeyed group are reported."
    test: the suite runs once per ref kind and superseded runs are cancelled
  - id: ac-4
    description: "N4: deploy.yml's check job runs the same setup and check steps, in
      the same order, as ci.yml's check job (deploy adds only its upload and
      deploy steps); a synthetic divergence is reported."
    test: the deploy check runs exactly the steps CI proves on every push
  - id: ac-5
    description: "N1: in Chromium and WebKit, with slow page modules, goTo returns
      only after the destination has committed and the outgoing heading is gone.
      Covers a first-load lazy page, a cached page, the same page with new
      params, a focused route and a redirecting URL; a shared-heading pair
      passed an explicit arrival works, and one without it fails loudly. Fails
      on the pre-fix goTo."
    test: navigation returns only once the destination page has rendered, in
      Chromium and WebKit, even when page modules load slowly
  - id: ac-6
    description: "N2: in Chromium and WebKit, with `delayStorageMs` 1500, an action
      followed by reload() keeps the write and later reads observe it. The
      pre-fix 400 ms sleep loses it."
    test: persisted reads and reload are ordered after every write the app has
      already issued, in Chromium and WebKit
  - id: ac-7
    description: "N3: the static guard rejects synthetic offenders of all four rules
      (a sleep, a local poller, a positive point-in-time existence assertion, an
      unledgered polled negative) and finds none in the real journeys and
      harness."
    test: browser journeys wait on events, never on fixed sleeps, hand-rolled
      pollers or positive point-in-time reads
  - id: ac-8
    description: "N2 applied: every read of the effect-claimed signal marker waits
      for it to land and still asserts exactly one claim."
    test: practice sound reuses one gesture primed context across all start and
      resume doors
  - id: ac-9
    description: "N2 applied to routine boundaries, pause and save: persisted reads
      wait for effect-issued writes, and minutes stay exact."
    test: practice cues preserve wall clock boundaries and every recorded minute
  - id: ac-10
    description: "N1 applied: the WebKit 1280px failure path (Working notes count
      after reaching the active page) is deterministic."
    test: practice information controls render accessible directional text at phone
      and desktop widths
  - id: ac-11
    description: "N1/N3 applied: the repertoire navigation journey that failed four
      times is deterministic."
    test: repertoire navigation restores browse context without changing session
      scope
  - id: ac-12
    description: "N3 applied: the transition-held select read stays polled and exact
      under 20× CPU slowdown."
    test: repertoire search keeps every typed character under heavy cpu slowdown
docsDelta:
  - DECISIONS.md
  - AGENTS.md
createdAt: 2026-10-07T23:54:46.669Z
amendments: []
---

# Make browser tests, CI and the Prismatica Gate fast, deterministic and trustworthy

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/49
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Baseline:** fc87f8d8d64315d46bd800cffd561c979a8c64e0 on main _(never re-baselined)_
- **Intent:** 20261007-make-browser-tests-ci-and-the-prismatica-0e6c

## You may only change

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

## Never touch

- src/**
- package.json
- package-lock.json
- vite.config.ts
- .prismatica/**
- tests/fixtures/**

## Non-goals

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

## Acceptance checks (definition of done)

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

## Docs to update

- DECISIONS.md
- AGENTS.md

## Amendments

_none_

