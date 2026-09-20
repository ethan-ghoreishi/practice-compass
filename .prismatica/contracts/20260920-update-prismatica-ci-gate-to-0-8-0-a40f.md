---
id: 20260920-update-prismatica-ci-gate-to-0-8-0-a40f
title: Update Prismatica CI gate to 0.8.0
issue: update/0.8.0
tier: light
stage: ship
baseline:
  commit: a9ec37878832beb6ee37870c31b4afbeb7581480
  branch: main
branch: change/20260920-update-prismatica-ci-gate-to-0-8-0-a40f
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260920-update-prismatica-ci-gate-to-0-8-0-a40f
updateVersion: 0.8.0
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.8.0
    test: manual:owner
docsDelta: []
createdAt: 2026-09-20T00:09:00.676Z
amendments: []
---

# Update Prismatica CI gate to 0.8.0

- **Issue:** update/0.8.0
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** a9ec37878832beb6ee37870c31b4afbeb7581480 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.8.0 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

