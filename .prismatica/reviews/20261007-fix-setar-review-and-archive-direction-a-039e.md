---
id: 20261007-fix-setar-review-and-archive-direction-a-039e
contractId: 20261007-fix-setar-review-and-archive-direction-a-039e
patchId: 6f95bc4369dfbe2107344d56c1b77939873cea8b
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: archive-answer-visibility-through-repreview
    summary: "P1: Decisions that Apply will execute must remain visible, selected,
      switchable and clearable until Apply, even when candidate counts change.
      answer() discards reporting when the fresh question is undefined, while
      every decision branch still executes."
    counterexample: "Select Link, Create separately or Skip for piece عراق with one
      unbound exact-title candidate. Rename that candidate through a sync pull,
      then answer another row to re-preview. The row vanishes, but the retained
      decision still adopts the renamed item, creates an item or writes a
      suppression, with no stale decision. All three class answers fail likewise
      when two matching classes become one. Verified all six branches and
      applyArchiveImport in memory. Instances:
      sourceReconcile.ts:647,659,675,762,773,779 through answer():612-615 and
      thresholds:638-641,753-756. Consumers: ArchiveRefresh.tsx:100-104,166-171
      hides them; store preview/commit and apply retain their effects. Checked
      clean: six stable answers, six clears with unchanged candidates, and six
      deleted/bound/other-instrument links with sufficient remaining ambiguity."
  - family: generated-line-direction-proof-matrix
    summary: "P2: ac-1 requires geometric order proof crossing English/Farsi titles
      with English/Farsi/mixed values. The named test lacks
      English-title/Farsi-value and English-title/mixed-value cases."
    counterexample: "tests/fixtures/setar-review-ui.json:40-44 and 70-74 are the
      only English-title groups; all four measured lines contain exclusively
      English values. tests/setar-review-ui.browser.test.ts:219-225 measures
      only those fixture rows. Swept
      tests/setar-practice.browser.test.ts:1460-1500: its English-title check
      allows zero authored values and checks computed direction, not token
      order. practice-information-layout.browser.test.ts covers notes. Checked
      clean: geometric coverage for Farsi-title setup rows, both archive
      DifferenceRow sections and attention rows across Chromium/WebKit and
      phone/desktop. Complete the missing combinations in the contracted named
      fixture route."
createdAt: 2026-10-07T00:52:34.489Z
sealedAt: 2026-10-07T01:04:15.466Z
---

# Review: Fix Setar review and archive direction and choice state, and Repertoire search typing

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261007-fix-setar-review-and-archive-direction-a-039e
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/47
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `6f95bc4369dfbe2107344d56c1b77939873cea8b`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

````yaml
# Approved intent: Fix Setar review and archive direction and choice state, and Repertoire search typing

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan a coherent heavy lane that fixes the remaining issues properly.
> 
> 1. Mixed Farsi/English direction is wrong in some newly added UI, especially `Review Setar setup`. Example: `اتود-وزيرى` / `exercise / étude → composed pieceKind:` — `Kind:` can appear at the wrong end of the line, mixed Persian/English ordering is awkward, and arrows sometimes point the wrong way. Check the wider new Setar review/archive UI for the same bidi/arrow problem, not only this exact row.
> 
> 2. In `Refresh Setar archive`, when metadata choices are shown, the controls such as `Keep your choice` / `Keep archive` (exact wording may differ) do not become selected/active when clicked. Reproduce the real behaviour and determine the scope. That section also has mixed Persian/English direction problems and arrows that can point the wrong way.
> 
> 3. A previous review found a remaining Repertoire search issue under extreme artificial slowdown: very rapid typing can lose characters while URL/search state is updating. Reassess it from first principles and decide whether it is a real product issue worth fixing in this lane. Do not regress the already-fixed filter lost-update bug from corrective commit `c4506c6`.
> 
> 4. A reviewer also noted a possible latent navigation/test race around `tests/repertoire-experience.browser.test.ts` near the pathway-card interaction around line ~441. Investigate whether this is a real product issue, a test race, or not worth changing.
> 
> 5. CI warnings about the Node.js 20 deprecation for GitHub Actions and `ubuntu-latest` moving to Ubuntu 26: assess whether either needs action now. Do not add unrelated maintenance merely to silence warnings.
> 
> Treat the symptoms as evidence, not prescribed solutions; look for closely related variants; design strong, specific automated acceptance checks up front, including mixed RTL/LTR cases and the interaction/state cases that can be reproduced; preserve owner data and existing Setar/archive behaviour; do not reopen problems the previous lane solved.
> 
> Agreed while planning: in Refresh Setar archive, an answered "Needs a decision" question (Link / Create separately / Skip) stays visible with the chosen answer shown as selected and can be changed or cleared until Apply.

## Why

Reproduced, not assumed. (1) Direction: in Review Setar setup each Organisation card is a dir="auto" group whose first strong text is the item title; a Farsi title makes the card RTL, and each change line is a run of SIBLING inline isolates (`Kind: `, before, ` → `, after) that the RTL paragraph orders right-to-left. Measured in Chromium and WebKit with the exact markup: on screen it reads `composed piece → exercise / étude Kind:` — label at the far edge, arrow pointing at the OLD value. Refresh Setar archive's DifferenceRow (`composer — yours: X · archive: Y`) reverses the same way, and the attention list (`path — reason`) strands its separator. Wrapping the whole generated line in ONE dir="ltr" isolate with each value nested in its own dir="auto" reads `Kind: before → after` in both engines. The existing checks missed it because they assert each fragment's own computed direction (all correct), never the order on screen. (2) Choice state: Keep my value / Use archive value toggle aria-pressed correctly (existing tests prove it) but no CSS styles a pressed .btn, so nothing visibly changes; ReferenceChoices has the same gap. Answering a question (Link / Create separately / Skip) removes it from the plan, so the row vanishes with no visible answer and no way to change it short of Cancel. (3) Repertoire search is a real, if rare, product defect: the input is controlled by URL state that React Router 7 renders in a transition, and React restores a controlled input to its last rendered value while that transition is pending, so keystrokes arriving before it commits are lost (reproduced at 20x CPU throttle and 100 ms/key: "pishdaramad" became "iharamad"; none at 4-6x). It is the documented React anti-pattern, the same root as c4506c6, cheap to fix, and the iPhone is a target device. (4) The line-441 shape is a test race, not a product bug: after the pathway-card click, `/مبانی دست راست/.first()` can resolve to the OUTGOING Repertoire card (its caption contains "now: مبانی دست راست") until the lazy destination commits; it can only fail loudly, never pass falsely, but it is the same family that already broke CI once (/New/ vs "New pathway"). (5) No CI action: the Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Playwright 1.63 officially supports ubuntu26.04 with a dedicated WebKit build and dependency table.

## Today

Review Setar setup and Refresh Setar archive render change and difference lines beside a Farsi title in reversed order with the arrow pointing at the old value; the attention list separator sits at the wrong end. Keep my value / Use archive value and ReferenceChoices show no visible selected state. An answered archive question disappears. Typing quickly in the Repertoire search on a slow device can drop characters. Repertoire browser journeys can act on the outgoing page after a navigation.

## Instead

Every generated line that embeds values (setup change rows for kind, place, study source, suggestion and class; archive metadata differences in both Archive metadata differs and Review differences; the attention list) reads in its logical order — label, current value, arrow or separator, new value — whatever the title or value languages, with each owner/registry value still resolving its own direction and the line start-aligned in its group. The arrow always points from the current value to the proposed one. Every aria-pressed toggle in scope (both archive difference buttons, the answered-question buttons, ReferenceChoices) shows its selected state visibly and not by colour alone, reusing the existing .option.selected treatment where it fits. An answered question stays listed with its answer selected and can be switched or cleared until Apply; Apply writes exactly the answers then selected, an unanswered or cleared one writes nothing, and "N to decide" counts only open questions. The Repertoire search box never shows or writes a value older than the latest keystroke, at any render speed, while back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query. Repertoire journeys act only once the destination page they navigated to is on screen.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The owner's screenshot did not reach the planner (it arrived as a placeholder icon); the plan works from the quoted text and the reproduced rendering.
- CLAUDE.md plus AGENTS.md sit at 32,526 of 32,768 bytes, so the one direction-rule refinement must be condensed in place (net growth well under 242 bytes).
- Reusing .option.selected keeps colour contrast inside pairs contrast.test.ts already checks (accent on accent-soft).
- Answered questions are carried by the plan itself (pure domain, sourceReconcile.ts) rather than remembered by the component, so preview, stale re-preview and commit read one source.

**Possible conflicts**

- Keeping answered questions on screen changes existing archive journeys that click Skip / Link and then Apply; those tests are in scope and must keep their assertions about what Apply writes.
- A controlled-input fix for search interacts with c4506c6's live-URL update path; the builder must prove both in one journey.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan a coherent heavy lane that fixes the remaining issues properly.\n\n1. Mixed Farsi/English direction is wrong in some newly added UI, especially `Review Setar setup`. Example: `اتود-وزيرى` / `exercise / étude → composed pieceKind:` — `Kind:` can appear at the wrong end of the line, mixed Persian/English ordering is awkward, and arrows sometimes point the wrong way. Check the wider new Setar review/archive UI for the same bidi/arrow problem, not only this exact row.\n\n2. In `Refresh Setar archive`, when metadata choices are shown, the controls such as `Keep your choice` / `Keep archive` (exact wording may differ) do not become selected/active when clicked. Reproduce the real behaviour and determine the scope. That section also has mixed Persian/English direction problems and arrows that can point the wrong way.\n\n3. A previous review found a remaining Repertoire search issue under extreme artificial slowdown: very rapid typing can lose characters while URL/search state is updating. Reassess it from first principles and decide whether it is a real product issue worth fixing in this lane. Do not regress the already-fixed filter lost-update bug from corrective commit `c4506c6`.\n\n4. A reviewer also noted a possible latent navigation/test race around `tests/repertoire-experience.browser.test.ts` near the pathway-card interaction around line ~441. Investigate whether this is a real product issue, a test race, or not worth changing.\n\n5. CI warnings about the Node.js 20 deprecation for GitHub Actions and `ubuntu-latest` moving to Ubuntu 26: assess whether either needs action now. Do not add unrelated maintenance merely to silence warnings.\n\nTreat the symptoms as evidence, not prescribed solutions; look for closely related variants; design strong, specific automated acceptance checks up front, including mixed RTL/LTR cases and the interaction/state cases that can be reproduced; preserve owner data and existing Setar/archive behaviour; do not reopen problems the previous lane solved.\n\nAgreed while planning: in Refresh Setar archive, an answered \"Needs a decision\" question (Link / Create separately / Skip) stays visible with the chosen answer shown as selected and can be changed or cleared until Apply.",
  "builder": "claude",
  "summary": "Fix Setar review and archive direction and choice state, and Repertoire search typing",
  "rationale": "Reproduced, not assumed. (1) Direction: in Review Setar setup each Organisation card is a dir=\"auto\" group whose first strong text is the item title; a Farsi title makes the card RTL, and each change line is a run of SIBLING inline isolates (`Kind: `, before, ` → `, after) that the RTL paragraph orders right-to-left. Measured in Chromium and WebKit with the exact markup: on screen it reads `composed piece → exercise / étude Kind:` — label at the far edge, arrow pointing at the OLD value. Refresh Setar archive's DifferenceRow (`composer — yours: X · archive: Y`) reverses the same way, and the attention list (`path — reason`) strands its separator. Wrapping the whole generated line in ONE dir=\"ltr\" isolate with each value nested in its own dir=\"auto\" reads `Kind: before → after` in both engines. The existing checks missed it because they assert each fragment's own computed direction (all correct), never the order on screen. (2) Choice state: Keep my value / Use archive value toggle aria-pressed correctly (existing tests prove it) but no CSS styles a pressed .btn, so nothing visibly changes; ReferenceChoices has the same gap. Answering a question (Link / Create separately / Skip) removes it from the plan, so the row vanishes with no visible answer and no way to change it short of Cancel. (3) Repertoire search is a real, if rare, product defect: the input is controlled by URL state that React Router 7 renders in a transition, and React restores a controlled input to its last rendered value while that transition is pending, so keystrokes arriving before it commits are lost (reproduced at 20x CPU throttle and 100 ms/key: \"pishdaramad\" became \"iharamad\"; none at 4-6x). It is the documented React anti-pattern, the same root as c4506c6, cheap to fix, and the iPhone is a target device. (4) The line-441 shape is a test race, not a product bug: after the pathway-card click, `/مبانی دست راست/.first()` can resolve to the OUTGOING Repertoire card (its caption contains \"now: مبانی دست راست\") until the lazy destination commits; it can only fail loudly, never pass falsely, but it is the same family that already broke CI once (/New/ vs \"New pathway\"). (5) No CI action: the Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Playwright 1.63 officially supports ubuntu26.04 with a dedicated WebKit build and dependency table.",
  "kind": "existing-flow",
  "flowId": "browse-my-repertoire",
  "currentBehaviour": "Review Setar setup and Refresh Setar archive render change and difference lines beside a Farsi title in reversed order with the arrow pointing at the old value; the attention list separator sits at the wrong end. Keep my value / Use archive value and ReferenceChoices show no visible selected state. An answered archive question disappears. Typing quickly in the Repertoire search on a slow device can drop characters. Repertoire browser journeys can act on the outgoing page after a navigation.",
  "desiredBehaviour": "Every generated line that embeds values (setup change rows for kind, place, study source, suggestion and class; archive metadata differences in both Archive metadata differs and Review differences; the attention list) reads in its logical order — label, current value, arrow or separator, new value — whatever the title or value languages, with each owner/registry value still resolving its own direction and the line start-aligned in its group. The arrow always points from the current value to the proposed one. Every aria-pressed toggle in scope (both archive difference buttons, the answered-question buttons, ReferenceChoices) shows its selected state visibly and not by colour alone, reusing the existing .option.selected treatment where it fits. An answered question stays listed with its answer selected and can be switched or cleared until Apply; Apply writes exactly the answers then selected, an unanswered or cleared one writes nothing, and \"N to decide\" counts only open questions. The Repertoire search box never shows or writes a value older than the latest keystroke, at any render speed, while back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query. Repertoire journeys act only once the destination page they navigated to is on screen.",
  "mustNotChange": [
    "c4506c6: every Repertoire browse change applies to the live URL, never render-captured state; the throttled composer step in \"repertoire navigation restores browse context without changing session scope\" stays as it is and passes.",
    "Browse URL contract: view, instrument, query, facets and grouping live in the URL; back/forward restore them; browsing never writes sessionInstrumentId.",
    "Archive decision semantics: exact bindings win, weak equivalences ask, decisions match on identity + typed premise + exact proposal (decisionMatchesSuggestion), a moved premise is refused as stale and re-previewed, Keep my value is the default, an unanswered offer writes nothing, suppressions persist, the commit re-plans, validates and waits for IndexedDB.",
    "Review Setar setup writes only selected rows, never on load, import, sync or Refresh; its default selections are unchanged.",
    "Existing direction rules and ledgers: dir=\"auto\" on groups, isolates inline (span/bdi only), instrument names resolve their own direction, English-only surfaces keep their layout, option text and confirm/toast strings stay out of scope.",
    "No schema change (SCHEMA_VERSION 16), no new dependency, no workflow change, no owner fixture rewritten, no NAS/Setar media or source metadata touched."
  ],
  "assumptions": [
    "The owner's screenshot did not reach the planner (it arrived as a placeholder icon); the plan works from the quoted text and the reproduced rendering.",
    "CLAUDE.md plus AGENTS.md sit at 32,526 of 32,768 bytes, so the one direction-rule refinement must be condensed in place (net growth well under 242 bytes).",
    "Reusing .option.selected keeps colour contrast inside pairs contrast.test.ts already checks (accent on accent-soft).",
    "Answered questions are carried by the plan itself (pure domain, sourceReconcile.ts) rather than remembered by the component, so preview, stale re-preview and commit read one source."
  ],
  "possibleConflicts": [
    "Keeping answered questions on screen changes existing archive journeys that click Skip / Link and then Apply; those tests are in scope and must keep their assertions about what Apply writes.",
    "A controlled-input fix for search interacts with c4506c6's live-URL update path; the builder must prove both in one journey."
  ],
  "scope": {
    "allow": [
      "src/components/SetarSetupReview.tsx",
      "src/components/ArchiveRefresh.tsx",
      "src/components/ReferenceChoices.tsx",
      "src/components/direction.test.ts",
      "src/components/pressedState.test.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/sourceReconcile.test.ts",
      "src/domain/index.ts",
      "src/pages/Repertoire.tsx",
      "src/styles/global.css",
      "tests/setar-review-ui.browser.test.ts",
      "tests/fixtures/setar-review-ui.json",
      "tests/setar-practice.browser.test.ts",
      "tests/setarArchive.browser.test.ts",
      "tests/repertoire-experience.browser.test.ts",
      "tests/practiceBrowser.ts",
      "AGENTS.md",
      "DECISIONS.md",
      "docs/setar-archive.md",
      "docs/repertoire-experience.md"
    ],
    "forbid": [
      ".github/**",
      "scripts/**",
      "package.json",
      "package-lock.json",
      "src/main.tsx",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/types.ts",
      "src/domain/courseData.ts",
      "src/domain/khonyagarData.ts",
      "tests/fixtures/setar-practice-*.json"
    ]
  },
  "exclusions": [
    "GitHub Actions changes: Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Ubuntu 26 is supported by the installed Playwright 1.63 (ubuntu26.04 deps and WebKit build). Revisit only if a run on the new image actually fails.",
    "A router-wide `useTransitions={false}`: it would change Suspense behaviour for every lazy route.",
    "Bidi of <option> text and confirm()/toast strings (out of scope by rule), and the QuickAdd / insights direction open gaps.",
    "Mapping Refresh Setar archive or Review Setar setup as a new Flow."
  ],
  "acceptance": [
    {
      "description": "Family proof, one committed fixture (tests/fixtures/setar-review-ui.json) and independently derived expected order: every generated line that embeds values reads label, current value, arrow/separator, new value from the inline-start edge, measured by on-screen geometry (not computed direction), and the arrow points from current to proposed. Classes crossed: title fa/en x values fa/en/mixed; setup fields kind, place, study source, suggestion, class in proposed and exception states; archive differences in Archive metadata differs and Review differences; attention list; 390x844 and desktop; Chromium and WebKit. Fails on the current markup.",
      "test": "setar review and archive lines read in order beside a farsi title"
    },
    {
      "description": "Static guard: inside a dir=\"auto\" group no line renders as a run of sibling dir=\"ltr\"/dir=\"auto\" isolates; a generated line is one inline dir=\"ltr\" isolate with each value nested in its own dir=\"auto\".",
      "test": "a generated line inside a group is one ltr isolate with its values nested"
    },
    {
      "description": "Keep my value / Use archive value: the pressed option looks different from the unpressed one (computed style differs, not colour alone), swaps on click and keyboard, survives a stale re-preview with Keep shown, and Apply writes the archive value only when Use archive value is selected and leaves the owner value otherwise (IndexedDB read back), in Chromium and WebKit.",
      "test": "archive metadata choices show the selected option and apply exactly it"
    },
    {
      "description": "An answered Link / Create separately / Skip question stays listed with its answer visibly selected; switching or clearing it before Apply changes what is written; Apply writes only the final answers; a cleared one writes nothing; \"N to decide\" counts only open questions.",
      "test": "answered archive questions stay visible and apply only the final answer"
    },
    {
      "description": "Domain: the plan reports each answered question with its answer and excludes it from the open count; a link answer whose target no longer qualifies is stale and the question is open again; no other plan output changes.",
      "test": "an answered question is reported with its answer and is not counted as open"
    },
    {
      "description": "Every aria-pressed control in src/components and src/pages pairs with a visible selected treatment (.option.selected, btn-primary, a tone class or an equivalent recorded in the test ledger).",
      "test": "every aria-pressed control renders a visible selected state"
    },
    {
      "description": "Repertoire search under 20x CPU throttle at ~100 ms per key keeps every character in the box and the URL (fails before the fix); a facet chosen mid-typing loses neither; back/forward, Clear filters, an instrument switch and the Practice list still show the URL query.",
      "test": "repertoire search keeps every typed character under heavy cpu slowdown"
    },
    {
      "description": "Regression guard for c4506c6: the existing browse-context journey, including its throttled query + composer step, still passes unchanged.",
      "test": "repertoire navigation restores browse context without changing session scope"
    },
    {
      "description": "With each destination page module delayed on its first visit (a harness option, no debug hook), the Repertoire journeys reproduce the line-441 shape before the fix and afterwards act only once the page they navigated to is on screen.",
      "test": "repertoire journeys act only on the page they navigated to"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "The controls being fixed decide what Apply writes to IndexedDB (archive field decisions, link/create/skip answers and their suppressions, setup selections); a wrong selected-state binding or answered-question carry-over writes the wrong owner data. No schema, migration, sync or backup format change."
  },
  "delta": {
    "step": 3,
    "today": "Typing quickly in the search box on a slow device can lose characters, because the box shows the URL's query and the router renders a URL change in a transition.",
    "instead": "The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).",
    "keep": [
      "Query, facets and grouping live in the URL and survive opening a work and coming back.",
      "Browsing never changes the session instrument."
    ],
    "assumptions": [],
    "showMe": "Under heavy CPU slowdown type \"pishdaramad\" into Search my repertoire one key at a time, then pick a composer: both the box and the URL hold the whole word and the composer."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/setar-archive.md",
    "docs/repertoire-experience.md"
  ]
}
```
````

## The Delta this change was framed from

# The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).

_approved · about "browse-my-repertoire" step 3_

## Today

Typing quickly in the search box on a slow device can lose characters, because the box shows the URL's query and the router renders a URL change in a transition.

## Instead

The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).

## Keep

- Query, facets and grouping live in the URL and survive opening a work and coming back.
- Browsing never changes the session instrument.

## New assumptions

_none_

## Show me

Under heavy CPU slowdown type "pishdaramad" into Search my repertoire one key at a time, then pick a composer: both the box and the URL hold the whole word and the composer.



## Files in this diff

- AGENTS.md
- DECISIONS.md
- docs/repertoire-experience.md
- docs/setar-archive.md
- src/components/ArchiveRefresh.tsx
- src/components/ReferenceChoices.tsx
- src/components/SetarSetupReview.tsx
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/domain/sourceReconcile.test.ts
- src/domain/sourceReconcile.ts
- src/pages/Repertoire.tsx
- tests/fixtures/setar-review-ui.json
- tests/practiceBrowser.ts
- tests/repertoire-experience.browser.test.ts
- tests/setar-review-ui.browser.test.ts

## Check against the contract

- [ ] **ac-1** — Family proof, one committed fixture (tests/fixtures/setar-review-ui.json) and independently derived expected order: every generated line that embeds values reads label, current value, arrow/separator, new value from the inline-start edge, measured by on-screen geometry (not computed direction), and the arrow points from current to proposed. Classes crossed: title fa/en x values fa/en/mixed; setup fields kind, place, study source, suggestion, class in proposed and exception states; archive differences in Archive metadata differs and Review differences; attention list; 390x844 and desktop; Chromium and WebKit. Fails on the current markup. _(proof: setar review and archive lines read in order beside a farsi title)_
- [ ] **ac-2** — Static guard: inside a dir="auto" group no line renders as a run of sibling dir="ltr"/dir="auto" isolates; a generated line is one inline dir="ltr" isolate with each value nested in its own dir="auto". _(proof: a generated line inside a group is one ltr isolate with its values nested)_
- [ ] **ac-3** — Keep my value / Use archive value: the pressed option looks different from the unpressed one (computed style differs, not colour alone), swaps on click and keyboard, survives a stale re-preview with Keep shown, and Apply writes the archive value only when Use archive value is selected and leaves the owner value otherwise (IndexedDB read back), in Chromium and WebKit. _(proof: archive metadata choices show the selected option and apply exactly it)_
- [ ] **ac-4** — An answered Link / Create separately / Skip question stays listed with its answer visibly selected; switching or clearing it before Apply changes what is written; Apply writes only the final answers; a cleared one writes nothing; "N to decide" counts only open questions. _(proof: answered archive questions stay visible and apply only the final answer)_
- [ ] **ac-5** — Domain: the plan reports each answered question with its answer and excludes it from the open count; a link answer whose target no longer qualifies is stale and the question is open again; no other plan output changes. _(proof: an answered question is reported with its answer and is not counted as open)_
- [ ] **ac-6** — Every aria-pressed control in src/components and src/pages pairs with a visible selected treatment (.option.selected, btn-primary, a tone class or an equivalent recorded in the test ledger). _(proof: every aria-pressed control renders a visible selected state)_
- [ ] **ac-7** — Repertoire search under 20x CPU throttle at ~100 ms per key keeps every character in the box and the URL (fails before the fix); a facet chosen mid-typing loses neither; back/forward, Clear filters, an instrument switch and the Practice list still show the URL query. _(proof: repertoire search keeps every typed character under heavy cpu slowdown)_
- [ ] **ac-8** — Regression guard for c4506c6: the existing browse-context journey, including its throttled query + composer step, still passes unchanged. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-9** — With each destination page module delayed on its first visit (a harness option, no debug hook), the Repertoire journeys reproduce the line-441 shape before the fix and afterwards act only once the page they navigated to is on screen. _(proof: repertoire journeys act only on the page they navigated to)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx
- **work-a-pathway-stage** — touched via src/pages/Repertoire.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **adjust-how-scheduling-works** — shares entity "PracticeItem" with "browse-my-repertoire"
- **capture-a-practice-item** — shares entity "PracticeItem" with "browse-my-repertoire"
- **clear-a-due-review** — shares entity "PracticeItem" with "browse-my-repertoire"
- **log-a-class** — shares entity "PracticeItem" with "browse-my-repertoire"
- **practise-todays-recommendation** — shares entity "PracticeItem" with "browse-my-repertoire"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "browse-my-repertoire"
- **run-a-session-plan** — shares entity "PracticeItem" with "browse-my-repertoire"
- **see-practice-patterns** — shares entity "PracticeItem" with "browse-my-repertoire"

**What the agent reported:**

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## adjust-how-scheduling-works — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## capture-a-practice-item — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## clear-a-due-review — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## log-a-class — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## practise-todays-recommendation — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## prepare-for-the-next-class — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## run-a-session-plan — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## see-practice-patterns — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 code inferred

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## The builder's family proof plan

The builder was asked for one before this review: Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Find
where its commit messages say it lives; subtle work without one, or a plan
whose expected results come only from the implementation under test, is a
finding.

## Close each family in this round

A counterexample is one instance of an invariant. For every finding: name the
invariant it breaks (its family), sweep the repository for every instance of
that invariant — each consumer, sibling function and caller, not only this
diff — and list every instance you found plus the consumers you checked and
found clean. One round that names the whole family saves a round per instance.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-fix-setar-review-and-archive-direction-a-039e/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261007-fix-setar-review-and-archive-direction-a-039e' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-fix-setar-review-and-archive-direction-a-039e/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-fix-setar-review-and-archive-direction-a-039e/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
