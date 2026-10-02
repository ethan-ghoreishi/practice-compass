---
id: 20261001-condense-agents-md-into-an-always-loaded-39ca
contractId: 20261001-condense-agents-md-into-an-always-loaded-39ca
contractHash: 6c878cc0fbb7c0a6daf72990d3b35251dc79b95be8d673d44bf4d60ff9f61699
createdAt: 2026-10-01T20:20:10.910Z
skills:
  - build
---

# Build brief: Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/43
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261001-condense-agents-md-into-an-always-loaded-39ca

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** technical
- **Risk tier:** normal
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan one focused lane to fix excessive agent-context usage in Practice Compass.
> 
> Observed symptom:
> `AGENTS.md is over the 150.0k-char limit (242.9k chars) · /memory to free up context`
> 
> This is now interfering with normal builder/reviewer use. A recent Prismatica change was intended to control large instruction/Markdown files, so investigate why that is not preventing the problem here rather than assuming the cause.
> 
> Review AGENTS.md and any other files that materially enter agent context. Find the smallest durable way to:
> - preserve important project rules and knowledge;
> - remove duplication, stale/generated material and unnecessary history;
> - keep frequently loaded context concise;
> - use one clear source of truth where practical;
> - prevent future context growth.
> 
> Also determine whether an existing Prismatica size-control mechanism should already apply to this repo and whether it is missing, misconfigured or ineffective.
> 
> Do not broaden this into general documentation cleanup.
> 
> Plan defensively so this does not become another long builder/reviewer loop.
> 
> Claude as builder and acceptance checks proving both meaningful context reduction and preservation of required guidance.
> 
> Consider advising using Claude commands such as /doctor if optimal/necessary

## Why

Root cause, measured. Every Claude session loads CLAUDE.md + @AGENTS.md whole (245,540 bytes): Claude Code 2.1.286 warns above max(40,000 chars, a share of the context window) but does not truncate. Codex reads AGENTS.md natively but only its first 32 KiB by default, so a Codex session never reaches the hard do-nots at byte 42,708. The file grew from 10,838 bytes (2026-07-10) to 244,675 because 13 of 21 contracts listed AGENTS.md as a required docsDelta and each lane appended how its rules were found. Prismatica's control is present and correctly wired (policy prismatica-instructions/2: 32,768 bytes per provider profile, run by every Check and by the 0.10.0 gate pinned in CI, recorded in every lane's evidence) but is ineffective here by design: it is a ratchet against each lane's own baseline, not a ceiling. It arrived on 2026-09-27 with the file at ~246 KB, so it grandfathered the debt; it lets a lane regrow up to its baseline (the repertoire lane fell to 241,858 and regrew to 244,675, passing against 246,313); `prismatica doctor` only warns; and with no branch protection a direct push to main is never checked. Nothing is missing or misconfigured. Landing at <= 32,768 bytes turns the same ratchet into a hard ceiling for every later lane with no Prismatica change, and a repository test puts the same cap on npm test, which deploy.yml runs on every push to main.

## Today

AGENTS.md is 244,675 bytes in 25 sections, imported by CLAUDE.md (865 bytes). It interleaves current rules with how each was found - sealed-review findings, counterexamples, measurements, rejected attempts - and its largest sections (direction-aware text 50.8 KB, Setar archive 37.4 KB, course data 29.6 KB, pathways 18.3 KB) restate mechanisms that the enforcing code's comments, the docs/*.md runbooks and 30 dated DECISIONS.md entries already explain. `prismatica doctor` warns for both profiles (claude 245,540, codex 244,675 of 32,768) and Check passes both as "over budget, but no larger than at the baseline".

## Instead

1. Budget: CLAUDE.md plus every file it @-imports totals <= 32,768 bytes, and AGENTS.md alone <= 32,768; leave a few KiB of headroom so the next rule fits. CLAUDE.md keeps `@AGENTS.md`; AGENTS.md stays the one cross-provider rulebook at the root.
2. Order: the core loop, the hard do-nots and a short "How to change this file" rule come first - current rules only, each stated once and condensed in place; a lane edits this file only when a current rule changes; the why goes to DECISIONS.md and subsystem detail to that subsystem's doc or the enforcing code's comment; the cap is enforced by tests/agent-context.test.ts and Prismatica's instruction-budget check. Domain rules follow.
3. Each kept rule is an imperative statement plus where it is enforced (module, function or test), not a re-explanation of the mechanism. The text elaborating each owner-approved app rule carries that rule's id.
4. Delete, don't relocate: how a rule was found (sealed findings, counterexamples, measurements, rejected attempts, superseded wording) is deleted, not copied - the lane's baseline commit is its archive. A subsystem's current rule may move into its existing doc (docs/setar-archive.md, docs/cgs-course.md, docs/khonyagar-course.md, docs/scheduling-evidence.md, docs/repertoire-experience.md) only where that doc does not already state it. No new docs file.
5. Must survive in AGENTS.md (the reviewer judges against this list): every prohibition aimed at agents; every dated owner decision with its bounds (GitHub-repo sync 2026-07-11, the public repo, Plan/Routines doorways above the recommendation - changed only by the owner, the v13 retirement waiver's limits); the hard do-nots; the named open gaps (QuickAdd.tsx instrument picker, insights.ts fused instrument name, Sync's raw error over plain http, unwired readIndexFile, legacy-namespace references on lessons the archive does not own); the NAS-tooling safety rule as it stands at the lane's baseline; and every fact code or docs cite AGENTS.md for - direction.test.ts's empty allowlist and QuickAdd exclusion, Today.tsx's insights.ts gap, plan.ts's "subordinate to real needs", scoring.test.ts's published priority formula, mediaRoots.ts's single base with no resolver fallback, the WebKit Blob-in-IndexedDB limit repertoire-viewport.browser.test.ts cites, docs/cgs-course.md's refusal of fuzzy title matching, and DECISIONS.md's Active-screen text-align note and "Practice list" canonical name.
6. DECISIONS.md gains one dated entry of at most 8 KiB: this diagnosis, the authoring rule, and a disposition table - one row per baseline `##` section with its baseline line range, where its rules now live (AGENTS.md heading, doc section or enforcing code), and anything dropped as stale with the reason. Existing entries are untouched except pointers into removed AGENTS.md text (e.g. "A FIFTH REJECTION..." near line 1125), which are repointed to the baseline commit.
7. New tests/agent-context.test.ts holds the three named tests below; before the first review each is shown failing on a mutation (the baseline AGENTS.md, one anchor removed, one dangling path). CLAUDE.md may change only to keep its description of where rules live accurate, and may not grow.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Claude Code 2.1.286's notice is a warning, not truncation: its bundled code sets the per-file threshold at max(40,000 chars, a share of the context window) - 150k on a 1M-context model - and still loads the whole file. <= 32,768 bytes clears both.
- Codex's default project_doc_max_bytes is 32 KiB, the figure Prismatica's budget derives from; today a Codex session stops inside "Practice totals are calendar figures".
- User-level context is immaterial: ~/.claude/CLAUDE.md is empty and the auto-memory index is 729 bytes; Prismatica briefs (90-150 KB) embed the plan, rules and flows, not AGENTS.md.
- The rationale for most kept rules already lives in the enforcing code's comments or in DECISIONS.md, so deleting narrative loses no reasoning; where neither holds it, one clause stays with the rule.

**Possible conflicts**

- In-flight lane 20261001-make-nas-deployment-and-media-tooling-fa-3d7b (at review) changes AGENTS.md rules (deploy-nas.sh -> nas-mirror.mjs with "change only what they can prove they wrote", the NFC wording, removeCatalogItem) and also edits DECISIONS.md, README.md, docs/setar-archive.md, docs/khonyagar-course.md and docs/repertoire-experience.md. Import this plan only after that lane merges, and merge no other AGENTS.md-editing lane while this one is open: Prismatica never re-baselines a lane, so merging main in mid-flight would put another lane's src/ and scripts/ changes inside this lane's diff and fail scope.
- Once this lands, Check fails any lane that grows the loaded set past 32,768 bytes, so feature lanes must condense in place instead of appending - intended.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan one focused lane to fix excessive agent-context usage in Practice Compass.\n\nObserved symptom:\n`AGENTS.md is over the 150.0k-char limit (242.9k chars) · /memory to free up context`\n\nThis is now interfering with normal builder/reviewer use. A recent Prismatica change was intended to control large instruction/Markdown files, so investigate why that is not preventing the problem here rather than assuming the cause.\n\nReview AGENTS.md and any other files that materially enter agent context. Find the smallest durable way to:\n- preserve important project rules and knowledge;\n- remove duplication, stale/generated material and unnecessary history;\n- keep frequently loaded context concise;\n- use one clear source of truth where practical;\n- prevent future context growth.\n\nAlso determine whether an existing Prismatica size-control mechanism should already apply to this repo and whether it is missing, misconfigured or ineffective.\n\nDo not broaden this into general documentation cleanup.\n\nPlan defensively so this does not become another long builder/reviewer loop.\n\nClaude as builder and acceptance checks proving both meaningful context reduction and preservation of required guidance.\n\nConsider advising using Claude commands such as /doctor if optimal/necessary",
  "builder": "claude",
  "summary": "Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back",
  "rationale": "Root cause, measured. Every Claude session loads CLAUDE.md + @AGENTS.md whole (245,540 bytes): Claude Code 2.1.286 warns above max(40,000 chars, a share of the context window) but does not truncate. Codex reads AGENTS.md natively but only its first 32 KiB by default, so a Codex session never reaches the hard do-nots at byte 42,708. The file grew from 10,838 bytes (2026-07-10) to 244,675 because 13 of 21 contracts listed AGENTS.md as a required docsDelta and each lane appended how its rules were found. Prismatica's control is present and correctly wired (policy prismatica-instructions/2: 32,768 bytes per provider profile, run by every Check and by the 0.10.0 gate pinned in CI, recorded in every lane's evidence) but is ineffective here by design: it is a ratchet against each lane's own baseline, not a ceiling. It arrived on 2026-09-27 with the file at ~246 KB, so it grandfathered the debt; it lets a lane regrow up to its baseline (the repertoire lane fell to 241,858 and regrew to 244,675, passing against 246,313); `prismatica doctor` only warns; and with no branch protection a direct push to main is never checked. Nothing is missing or misconfigured. Landing at <= 32,768 bytes turns the same ratchet into a hard ceiling for every later lane with no Prismatica change, and a repository test puts the same cap on npm test, which deploy.yml runs on every push to main.",
  "kind": "technical",
  "currentBehaviour": "AGENTS.md is 244,675 bytes in 25 sections, imported by CLAUDE.md (865 bytes). It interleaves current rules with how each was found - sealed-review findings, counterexamples, measurements, rejected attempts - and its largest sections (direction-aware text 50.8 KB, Setar archive 37.4 KB, course data 29.6 KB, pathways 18.3 KB) restate mechanisms that the enforcing code's comments, the docs/*.md runbooks and 30 dated DECISIONS.md entries already explain. `prismatica doctor` warns for both profiles (claude 245,540, codex 244,675 of 32,768) and Check passes both as \"over budget, but no larger than at the baseline\".",
  "desiredBehaviour": "1. Budget: CLAUDE.md plus every file it @-imports totals <= 32,768 bytes, and AGENTS.md alone <= 32,768; leave a few KiB of headroom so the next rule fits. CLAUDE.md keeps `@AGENTS.md`; AGENTS.md stays the one cross-provider rulebook at the root.\n2. Order: the core loop, the hard do-nots and a short \"How to change this file\" rule come first - current rules only, each stated once and condensed in place; a lane edits this file only when a current rule changes; the why goes to DECISIONS.md and subsystem detail to that subsystem's doc or the enforcing code's comment; the cap is enforced by tests/agent-context.test.ts and Prismatica's instruction-budget check. Domain rules follow.\n3. Each kept rule is an imperative statement plus where it is enforced (module, function or test), not a re-explanation of the mechanism. The text elaborating each owner-approved app rule carries that rule's id.\n4. Delete, don't relocate: how a rule was found (sealed findings, counterexamples, measurements, rejected attempts, superseded wording) is deleted, not copied - the lane's baseline commit is its archive. A subsystem's current rule may move into its existing doc (docs/setar-archive.md, docs/cgs-course.md, docs/khonyagar-course.md, docs/scheduling-evidence.md, docs/repertoire-experience.md) only where that doc does not already state it. No new docs file.\n5. Must survive in AGENTS.md (the reviewer judges against this list): every prohibition aimed at agents; every dated owner decision with its bounds (GitHub-repo sync 2026-07-11, the public repo, Plan/Routines doorways above the recommendation - changed only by the owner, the v13 retirement waiver's limits); the hard do-nots; the named open gaps (QuickAdd.tsx instrument picker, insights.ts fused instrument name, Sync's raw error over plain http, unwired readIndexFile, legacy-namespace references on lessons the archive does not own); the NAS-tooling safety rule as it stands at the lane's baseline; and every fact code or docs cite AGENTS.md for - direction.test.ts's empty allowlist and QuickAdd exclusion, Today.tsx's insights.ts gap, plan.ts's \"subordinate to real needs\", scoring.test.ts's published priority formula, mediaRoots.ts's single base with no resolver fallback, the WebKit Blob-in-IndexedDB limit repertoire-viewport.browser.test.ts cites, docs/cgs-course.md's refusal of fuzzy title matching, and DECISIONS.md's Active-screen text-align note and \"Practice list\" canonical name.\n6. DECISIONS.md gains one dated entry of at most 8 KiB: this diagnosis, the authoring rule, and a disposition table - one row per baseline `##` section with its baseline line range, where its rules now live (AGENTS.md heading, doc section or enforcing code), and anything dropped as stale with the reason. Existing entries are untouched except pointers into removed AGENTS.md text (e.g. \"A FIFTH REJECTION...\" near line 1125), which are repointed to the baseline commit.\n7. New tests/agent-context.test.ts holds the three named tests below; before the first review each is shown failing on a mutation (the baseline AGENTS.md, one anchor removed, one dangling path). CLAUDE.md may change only to keep its description of where rules live accurate, and may not grow.",
  "mustNotChange": [
    "No application code, schema, persisted data or UI changes: src/** is untouched and every existing test passes unchanged.",
    "No rule's meaning changes, and dated owner decisions keep their force.",
    ".prismatica/rules.md and every Prismatica record stay untouched."
  ],
  "assumptions": [
    "Claude Code 2.1.286's notice is a warning, not truncation: its bundled code sets the per-file threshold at max(40,000 chars, a share of the context window) - 150k on a 1M-context model - and still loads the whole file. <= 32,768 bytes clears both.",
    "Codex's default project_doc_max_bytes is 32 KiB, the figure Prismatica's budget derives from; today a Codex session stops inside \"Practice totals are calendar figures\".",
    "User-level context is immaterial: ~/.claude/CLAUDE.md is empty and the auto-memory index is 729 bytes; Prismatica briefs (90-150 KB) embed the plan, rules and flows, not AGENTS.md.",
    "The rationale for most kept rules already lives in the enforcing code's comments or in DECISIONS.md, so deleting narrative loses no reasoning; where neither holds it, one clause stays with the rule."
  ],
  "possibleConflicts": [
    "In-flight lane 20261001-make-nas-deployment-and-media-tooling-fa-3d7b (at review) changes AGENTS.md rules (deploy-nas.sh -> nas-mirror.mjs with \"change only what they can prove they wrote\", the NFC wording, removeCatalogItem) and also edits DECISIONS.md, README.md, docs/setar-archive.md, docs/khonyagar-course.md and docs/repertoire-experience.md. Import this plan only after that lane merges, and merge no other AGENTS.md-editing lane while this one is open: Prismatica never re-baselines a lane, so merging main in mid-flight would put another lane's src/ and scripts/ changes inside this lane's diff and fail scope.",
    "Once this lands, Check fails any lane that grows the loaded set past 32,768 bytes, so feature lanes must condense in place instead of appending - intended."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "CLAUDE.md",
      "DECISIONS.md",
      "docs/setar-archive.md",
      "docs/cgs-course.md",
      "docs/khonyagar-course.md",
      "docs/scheduling-evidence.md",
      "docs/repertoire-experience.md",
      "tests/agent-context.test.ts"
    ],
    "forbid": [
      "src/**",
      ".claude/**",
      ".prismatica/**",
      ".github/**",
      "scripts/**",
      "tests/fixtures/**",
      "package.json",
      "package-lock.json"
    ]
  },
  "exclusions": [
    "General documentation cleanup: README.md, FUTURE.md, docs/product-spec.md and the existing content of DECISIONS.md and the subsystem docs are not rewritten or condensed.",
    "Claude-only or nested instruction files (.claude/rules, CLAUDE.local.md, a nested AGENTS.md): a Codex session at the root never sees them.",
    "Any change to Prismatica (its budget, ratchet, CI pin, briefs or packs), GitHub branch protection, or user-level context (memory, plugins, hooks, MCP)."
  ],
  "acceptance": [
    {
      "description": "Meaningful reduction that holds: the Claude profile (CLAUDE.md plus every file it @-imports) and the Codex profile (AGENTS.md alone) each total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the baseline tree and runs in npm test on every push, main included via deploy.yml. Limit: it measures the working tree and @path tokens only; Prismatica's instruction-budget check stays the authority on other import shapes and committed bytes.",
      "test": "the instructions every agent session loads at the repository root fit in 32768 bytes"
    },
    {
      "description": "Required guidance stays in the always-loaded file: AGENTS.md contains the core-loop line (one item · one mode · one focus · one result · one next action), the four hard do-nots (No gamification, No backend, No AI or audio analysis, No guilt) and the 11 owner-approved rule ids, hardcoded in the test rather than read from .prismatica/rules.md so a later rules approval on main cannot break deploy. Deleting any anchor fails it.",
      "test": "AGENTS.md states the core loop, every hard do-not and each owner-approved app rule"
    },
    {
      "description": "Moved guidance stays reachable: every path AGENTS.md names in backticks or a link target under src/, tests/, scripts/, docs/, public/ or .github/ exists (anchor and line suffixes stripped, globs skipped); a pointer to a missing file fails it.",
      "test": "every repository path AGENTS.md names exists"
    },
    {
      "description": "In a new Claude Code session started in the lane worktree there is no \"...-char limit\" notice, /doctor shows no large instruction-file warning, /context shows the memory-files figure far below main's (note both), and `prismatica doctor` lists both profiles at or under 32,768 bytes with no warning. The owner then picks any two baseline sections and finds each rule in the home the DECISIONS.md disposition table names, or listed there as dropped with a reason.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": false,
    "copyOnly": false,
    "rationale": "Documentation plus one Node test that reads repository files; no application code, schema, persisted data, authentication or payments."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md"
  ]
}
```
````

## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

## Stay in scope — you may ONLY change

- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- docs/setar-archive.md
- docs/cgs-course.md
- docs/khonyagar-course.md
- docs/scheduling-evidence.md
- docs/repertoire-experience.md
- tests/agent-context.test.ts

Never touch:

- src/**
- .claude/**
- .prismatica/**
- .github/**
- scripts/**
- tests/fixtures/**
- package.json
- package-lock.json
- No application code, schema, persisted data or UI changes: src/** is untouched and every existing test passes unchanged.
- No rule's meaning changes, and dated owner decisions keep their force.
- .prismatica/rules.md and every Prismatica record stay untouched.
- General documentation cleanup: README.md, FUTURE.md, docs/product-spec.md and the existing content of DECISIONS.md and the subsystem docs are not rewritten or condensed.
- Claude-only or nested instruction files (.claude/rules, CLAUDE.local.md, a nested AGENTS.md): a Codex session at the root never sees them.
- Any change to Prismatica (its budget, ratchet, CI pin, briefs or packs), GitHub branch protection, or user-level context (memory, plugins, hooks, MCP).

## Definition of done

- **ac-1** — Meaningful reduction that holds: the Claude profile (CLAUDE.md plus every file it @-imports) and the Codex profile (AGENTS.md alone) each total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the baseline tree and runs in npm test on every push, main included via deploy.yml. Limit: it measures the working tree and @path tokens only; Prismatica's instruction-budget check stays the authority on other import shapes and committed bytes. → proven by `the instructions every agent session loads at the repository root fit in 32768 bytes`
- **ac-2** — Required guidance stays in the always-loaded file: AGENTS.md contains the core-loop line (one item · one mode · one focus · one result · one next action), the four hard do-nots (No gamification, No backend, No AI or audio analysis, No guilt) and the 11 owner-approved rule ids, hardcoded in the test rather than read from .prismatica/rules.md so a later rules approval on main cannot break deploy. Deleting any anchor fails it. → proven by `AGENTS.md states the core loop, every hard do-not and each owner-approved app rule`
- **ac-3** — Moved guidance stays reachable: every path AGENTS.md names in backticks or a link target under src/, tests/, scripts/, docs/, public/ or .github/ exists (anchor and line suffixes stripped, globs skipped); a pointer to a missing file fails it. → proven by `every repository path AGENTS.md names exists`
- **ac-4** — In a new Claude Code session started in the lane worktree there is no "...-char limit" notice, /doctor shows no large instruction-file warning, /context shows the memory-files figure far below main's (note both), and `prismatica doctor` lists both profiles at or under 32,768 bytes with no warning. The owner then picks any two baseline sections and finds each rule in the home the DECISIONS.md disposition table names, or listed there as dropped with a reason. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md

## Recommended skills (quality only — never gates)

- **build** — implementing the change against the contract — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before the first review

Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Say in your commit message where it lives.

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.

