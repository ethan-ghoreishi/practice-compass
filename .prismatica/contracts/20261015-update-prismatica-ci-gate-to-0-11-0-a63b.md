---
id: 20261015-update-prismatica-ci-gate-to-0-11-0-a63b
title: Update Prismatica CI gate to 0.11.0
issue: update/0.11.0
tier: light
stage: ship
baseline:
  commit: 727e58533798803ca12bb20571a4d487f07e8dac
  branch: main
branch: change/20261015-update-prismatica-ci-gate-to-0-11-0-a63b
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261015-update-prismatica-ci-gate-to-0-11-0-a63b
updateVersion: 0.11.0
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.11.0
    test: manual:owner
docsDelta: []
createdAt: 2026-10-15T15:21:15.677Z
amendments: []
---

# Update Prismatica CI gate to 0.11.0

- **Issue:** update/0.11.0
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** 727e58533798803ca12bb20571a4d487f07e8dac on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.11.0 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

