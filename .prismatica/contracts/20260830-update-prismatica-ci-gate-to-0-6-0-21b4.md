---
id: 20260830-update-prismatica-ci-gate-to-0-6-0-21b4
title: Update Prismatica CI gate to 0.6.0
issue: update/0.6.0
tier: light
stage: prove
baseline:
  commit: cad4d3bc8b45110733f189d9b280b8c8a39587b2
  branch: main
branch: change/20260830-update-prismatica-ci-gate-to-0-6-0-21b4
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260830-update-prismatica-ci-gate-to-0-6-0-21b4
updateVersion: 0.6.0
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.6.0
    test: manual:owner
docsDelta: []
createdAt: 2026-08-30T23:02:59.211Z
amendments: []
---

# Update Prismatica CI gate to 0.6.0

- **Issue:** update/0.6.0
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** cad4d3bc8b45110733f189d9b280b8c8a39587b2 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.6.0 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

