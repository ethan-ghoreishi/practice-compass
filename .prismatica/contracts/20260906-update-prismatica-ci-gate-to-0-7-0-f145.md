---
id: 20260906-update-prismatica-ci-gate-to-0-7-0-f145
title: Update Prismatica CI gate to 0.7.0
issue: update/0.7.0
tier: light
stage: prove
baseline:
  commit: 8f5a95e45975071a0da774020b5a2cb9a55cba55
  branch: main
branch: change/20260906-update-prismatica-ci-gate-to-0-7-0-f145
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260906-update-prismatica-ci-gate-to-0-7-0-f145
updateVersion: 0.7.0
updateWorkflow: .github/workflows/prismatica-gate.yml
allowedPaths:
  - .github/workflows/prismatica-gate.yml
forbiddenPaths: []
nonGoals: []
acceptanceChecks:
  - id: ac-1
    description: CI gate reads prismatica@0.7.0
    test: manual:owner
docsDelta: []
createdAt: 2026-09-06T21:50:54.690Z
amendments: []
---

# Update Prismatica CI gate to 0.7.0

- **Issue:** update/0.7.0
- **Risk tier:** light — copy, colours, spacing — checks plus one screenshot
- **Baseline:** 8f5a95e45975071a0da774020b5a2cb9a55cba55 on main _(never re-baselined)_

## You may only change

- .github/workflows/prismatica-gate.yml

## Never touch

_nothing explicitly forbidden_

## Non-goals

_none stated_

## Acceptance checks (definition of done)

- [ ] **ac-1** — CI gate reads prismatica@0.7.0 _(proof: manual:owner)_

## Docs to update

_none_

## Amendments

_none_

