---
id: 20260908-update-prismatica-ci-gate-to-0-7-1-64bd
title: Update Prismatica CI gate to 0.7.1
issue: update/0.7.1
tier: light
stage: frame
baseline:
  commit: 75e81dbca233d30212fbcc42a9db00a110b61387
  branch: main
branch: change/20260908-update-prismatica-ci-gate-to-0-7-1-64bd
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260908-update-prismatica-ci-gate-to-0-7-1-64bd
updateVersion: 0.7.1
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.7.1
    test: manual:owner
docsDelta: []
createdAt: 2026-09-08T11:02:39.069Z
amendments: []
---

# Update Prismatica CI gate to 0.7.1

- **Issue:** update/0.7.1
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** 75e81dbca233d30212fbcc42a9db00a110b61387 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.7.1 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

