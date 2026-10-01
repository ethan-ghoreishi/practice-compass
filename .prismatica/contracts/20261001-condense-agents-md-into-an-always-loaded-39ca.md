---
id: 20261001-condense-agents-md-into-an-always-loaded-39ca
title: Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep
  it from growing back
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/43
intent: 20261001-condense-agents-md-into-an-always-loaded-39ca
tier: normal
stage: review
baseline:
  commit: 56789a868c82e6bfd52b451cead11d071bf19252
  branch: main
branch: change/20261001-condense-agents-md-into-an-always-loaded-39ca
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261001-condense-agents-md-into-an-always-loaded-39ca
builder: claude
planHash: fc786e56bc3b780c7824666ba3fd5736c0835e434bfe908184f657c9169a7b71
allowedPaths:
  - AGENTS.md
  - CLAUDE.md
  - DECISIONS.md
  - docs/setar-archive.md
  - docs/cgs-course.md
  - docs/khonyagar-course.md
  - docs/scheduling-evidence.md
  - docs/repertoire-experience.md
  - tests/agent-context.test.ts
forbiddenPaths:
  - src/**
  - .claude/**
  - .prismatica/**
  - .github/**
  - scripts/**
  - tests/fixtures/**
  - package.json
  - package-lock.json
nonGoals:
  - "No application code, schema, persisted data or UI changes: src/** is
    untouched and every existing test passes unchanged."
  - No rule's meaning changes, and dated owner decisions keep their force.
  - .prismatica/rules.md and every Prismatica record stay untouched.
  - "General documentation cleanup: README.md, FUTURE.md, docs/product-spec.md
    and the existing content of DECISIONS.md and the subsystem docs are not
    rewritten or condensed."
  - "Claude-only or nested instruction files (.claude/rules, CLAUDE.local.md, a
    nested AGENTS.md): a Codex session at the root never sees them."
  - Any change to Prismatica (its budget, ratchet, CI pin, briefs or packs),
    GitHub branch protection, or user-level context (memory, plugins, hooks,
    MCP).
acceptanceChecks:
  - id: ac-1
    description: "Meaningful reduction that holds: the Claude profile (CLAUDE.md
      plus every file it @-imports) and the Codex profile (AGENTS.md alone) each
      total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the
      baseline tree and runs in npm test on every push, main included via
      deploy.yml. Limit: it measures the working tree and @path tokens only;
      Prismatica's instruction-budget check stays the authority on other import
      shapes and committed bytes."
    test: the instructions every agent session loads at the repository root fit in
      32768 bytes
  - id: ac-2
    description: "Required guidance stays in the always-loaded file: AGENTS.md
      contains the core-loop line (one item · one mode · one focus · one result
      · one next action), the four hard do-nots (No gamification, No backend, No
      AI or audio analysis, No guilt) and the 11 owner-approved rule ids,
      hardcoded in the test rather than read from .prismatica/rules.md so a
      later rules approval on main cannot break deploy. Deleting any anchor
      fails it."
    test: AGENTS.md states the core loop, every hard do-not and each owner-approved
      app rule
  - id: ac-3
    description: "Moved guidance stays reachable: every path AGENTS.md names in
      backticks or a link target under src/, tests/, scripts/, docs/, public/ or
      .github/ exists (anchor and line suffixes stripped, globs skipped); a
      pointer to a missing file fails it."
    test: every repository path AGENTS.md names exists
  - id: ac-4
    description: In a new Claude Code session started in the lane worktree there is
      no "...-char limit" notice, /doctor shows no large instruction-file
      warning, /context shows the memory-files figure far below main's (note
      both), and `prismatica doctor` lists both profiles at or under 32,768
      bytes with no warning. The owner then picks any two baseline sections and
      finds each rule in the home the DECISIONS.md disposition table names, or
      listed there as dropped with a reason.
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
createdAt: 2026-10-01T20:20:02.724Z
amendments: []
---

# Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/43
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Baseline:** 56789a868c82e6bfd52b451cead11d071bf19252 on main _(never re-baselined)_
- **Intent:** 20261001-condense-agents-md-into-an-always-loaded-39ca

## You may only change

- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- docs/setar-archive.md
- docs/cgs-course.md
- docs/khonyagar-course.md
- docs/scheduling-evidence.md
- docs/repertoire-experience.md
- tests/agent-context.test.ts

## Never touch

- src/**
- .claude/**
- .prismatica/**
- .github/**
- scripts/**
- tests/fixtures/**
- package.json
- package-lock.json

## Non-goals

- No application code, schema, persisted data or UI changes: src/** is untouched and every existing test passes unchanged.
- No rule's meaning changes, and dated owner decisions keep their force.
- .prismatica/rules.md and every Prismatica record stay untouched.
- General documentation cleanup: README.md, FUTURE.md, docs/product-spec.md and the existing content of DECISIONS.md and the subsystem docs are not rewritten or condensed.
- Claude-only or nested instruction files (.claude/rules, CLAUDE.local.md, a nested AGENTS.md): a Codex session at the root never sees them.
- Any change to Prismatica (its budget, ratchet, CI pin, briefs or packs), GitHub branch protection, or user-level context (memory, plugins, hooks, MCP).

## Acceptance checks (definition of done)

- [ ] **ac-1** — Meaningful reduction that holds: the Claude profile (CLAUDE.md plus every file it @-imports) and the Codex profile (AGENTS.md alone) each total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the baseline tree and runs in npm test on every push, main included via deploy.yml. Limit: it measures the working tree and @path tokens only; Prismatica's instruction-budget check stays the authority on other import shapes and committed bytes. _(proof: the instructions every agent session loads at the repository root fit in 32768 bytes)_
- [ ] **ac-2** — Required guidance stays in the always-loaded file: AGENTS.md contains the core-loop line (one item · one mode · one focus · one result · one next action), the four hard do-nots (No gamification, No backend, No AI or audio analysis, No guilt) and the 11 owner-approved rule ids, hardcoded in the test rather than read from .prismatica/rules.md so a later rules approval on main cannot break deploy. Deleting any anchor fails it. _(proof: AGENTS.md states the core loop, every hard do-not and each owner-approved app rule)_
- [ ] **ac-3** — Moved guidance stays reachable: every path AGENTS.md names in backticks or a link target under src/, tests/, scripts/, docs/, public/ or .github/ exists (anchor and line suffixes stripped, globs skipped); a pointer to a missing file fails it. _(proof: every repository path AGENTS.md names exists)_
- [ ] **ac-4** — In a new Claude Code session started in the lane worktree there is no "...-char limit" notice, /doctor shows no large instruction-file warning, /context shows the memory-files figure far below main's (note both), and `prismatica doctor` lists both profiles at or under 32,768 bytes with no warning. The owner then picks any two baseline sections and finds each rule in the home the DECISIONS.md disposition table names, or listed there as dropped with a reason. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md

## Amendments

_none_

