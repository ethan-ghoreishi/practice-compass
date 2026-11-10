---
id: 20261110-update-prismatica-ci-gate-to-0-12-0-f8e9
title: Update Prismatica CI gate to 0.12.0
issue: update/0.12.0
tier: light
stage: frame
baseline:
  commit: fecaec1a4dc5aaf84b78a2e9b1c63dfa7d685349
  branch: main
branch: change/20261110-update-prismatica-ci-gate-to-0-12-0-f8e9
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261110-update-prismatica-ci-gate-to-0-12-0-f8e9
updateVersion: 0.12.0
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.12.0
    test: manual:owner
docsDelta: []
createdAt: 2026-11-10T13:07:55.679Z
amendments: []
---

# Update Prismatica CI gate to 0.12.0

- **Issue:** update/0.12.0
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** fecaec1a4dc5aaf84b78a2e9b1c63dfa7d685349 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.12.0 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

