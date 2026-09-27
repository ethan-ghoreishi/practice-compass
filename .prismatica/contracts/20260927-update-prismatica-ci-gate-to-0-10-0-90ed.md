---
id: 20260927-update-prismatica-ci-gate-to-0-10-0-90ed
title: Update Prismatica CI gate to 0.10.0
issue: update/0.10.0
tier: light
stage: frame
baseline:
  commit: 3fc0292939020e626630b0f1e4c06c6ec06ddef0
  branch: main
branch: change/20260927-update-prismatica-ci-gate-to-0-10-0-90ed
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260927-update-prismatica-ci-gate-to-0-10-0-90ed
updateVersion: 0.10.0
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.10.0
    test: manual:owner
docsDelta: []
createdAt: 2026-09-27T22:32:30.176Z
amendments: []
---

# Update Prismatica CI gate to 0.10.0

- **Issue:** update/0.10.0
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** 3fc0292939020e626630b0f1e4c06c6ec06ddef0 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.10.0 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

