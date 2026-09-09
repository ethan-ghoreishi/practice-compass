---
id: 20260909-update-prismatica-ci-gate-to-0-7-2-7da7
title: Update Prismatica CI gate to 0.7.2
issue: update/0.7.2
tier: light
stage: prove
baseline:
  commit: fcec5010bd14b61ce85b82f451f1f4e6a00d5e38
  branch: main
branch: change/20260909-update-prismatica-ci-gate-to-0-7-2-7da7
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260909-update-prismatica-ci-gate-to-0-7-2-7da7
updateVersion: 0.7.2
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.7.2
    test: manual:owner
docsDelta: []
createdAt: 2026-09-09T18:41:20.690Z
amendments: []
---

# Update Prismatica CI gate to 0.7.2

- **Issue:** update/0.7.2
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** fcec5010bd14b61ce85b82f451f1f4e6a00d5e38 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.7.2 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

