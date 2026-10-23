---
contractId: 20261023-make-practice-records-dependable-and-kee-34cc
at: 2026-10-23T22:14:20.838Z
by: agent
none: false
entries:
  - flowId: back-up-and-restore
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/domain/io.ts,
      src/store/useStore.ts matched changed file(s) src/domain/io.ts,
      src/store/useStore.ts. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: 0ec576d7c25b79efb580481021a0d46b3870781626f4bf4bcae0a10eaeca4e59
  - flowId: browse-my-repertoire
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx,
      src/domain/repertoire.ts matched changed file(s) src/domain/repertoire.ts,
      src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: 6dcacf73222002da377340a3771d81526322e55ffc5ee2bfc012ce9c0e6ac7d2
  - flowId: prepare-for-the-next-class
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx
      matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 79d3ebee5b9e5cf7e13e6d61ac17e1154a9e3a662b882229ef3fd17c120b64dc
  - flowId: see-practice-patterns
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Today.tsx,
      src/domain/io.ts matched changed file(s) src/domain/io.ts,
      src/pages/Today.tsx. Derived from the diff alone — this says nothing about
      whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: d1952a7f00f8a54077b28d8a52507c21f54c07712aed4e99bc01e4d17d9c9946
  - flowId: install-the-app-and-keep-it-current
    status: unchanged
    reason: Settings.tsx, the service worker, Layout and app-update code are
      untouched; the shared /settings route is only where the scheduling
      explanation also renders.
    steps: []
    reverify: []
    truthHash: 7a858934f7458dcbd4ffae16c4650740661a980dbd01c19aa26b800cebdbeddb
  - flowId: point-this-device-at-the-nas
    status: unchanged
    reason: No NAS base, reference or recording code changed; the shared /settings
      route is incidental.
    steps: []
    reverify: []
    truthHash: cb9001b5d4e576d1bbd3b51d2b1793714c248e451b263c84ea3ca8b3d4fdc655
  - flowId: sync-devices-via-github
    status: unchanged
    reason: syncEngine, githubSync and gitRemote are untouched; a pulled snapshot
      goes through the same validateDB, which now also checks the v17 fields
      (proved by session model inbound doors preserve live practice and fail
      before replacing data). As with every schema bump, both devices update
      before syncing; an older build refuses a v17 snapshot whole.
    steps: []
    reverify: []
    truthHash: 1daeee8d1caa83a783184683bf72e73009118fe586b674a184f098d351510b5d
  - flowId: practise-todays-recommendation
    status: truth-proposed
    reason: Scoped results (focused/whole), Working/Keep-fresh returns, the shared
      candidate pool and autosaving notes change steps 2, 4, 6 and 7; update
      proposal in this lane.
    steps: []
    reverify: []
    truthHash: 0f29a0f3566877c91c8628a651298fbf4a36d21606dad57c1b3650a3f2848166
  - flowId: run-a-session-plan
    status: truth-proposed
    reason: Preview Move earlier/later, removal without redistribution, skipping any
      pending or the running segment, and separate time figures change steps 2,
      3, 5, 6 and the budget rule; update proposal in this lane.
    steps: []
    reverify: []
    truthHash: a8a7fc54ecce8312867d5235737937a1f5c6b4aee12a9a685b7c71326dae50b6
  - flowId: work-a-pathway-stage
    status: truth-proposed
    reason: Routine contents preview before Start, running list with Move on / Skip
      / Remove, and unlabelled bound segments kept change the Guided routine
      variation; update proposal in this lane.
    steps: []
    reverify: []
    truthHash: c5c9b29a884edb845999d8299cbcc8e6879587c05f3b8e82ec0fc0ce53d2d970
  - flowId: adjust-how-scheduling-works
    status: truth-proposed
    reason: The explanation now states Working returns, Keep-fresh whole checks and
      class preparation (step 1); update proposal in this lane.
    steps: []
    reverify: []
    truthHash: afa1699c9add3be9b8e2ffd3927383c32b80b5fde17abce91620b3c39edfa74f
  - flowId: clear-a-due-review
    status: truth-proposed
    reason: Which close completes a due review now depends on return intention and
      block scope (step 2, endsWith); update proposal in this lane.
    steps: []
    reverify: []
    truthHash: c27230bdffa873db6ce0efd7a258cd0d87837e1a34ad7cd4c75792bc979552a2
  - flowId: capture-a-practice-item
    status: truth-proposed
    reason: Theory / listening study joins the kind-first form and study ideas
      pre-fill it (step 2, new variation); update proposal in this lane.
    steps: []
    reverify: []
    truthHash: 64e9b2c017f17127e2dae4d4104855d8b8061e93832b45396d1d574f8421ab8b
  - flowId: log-a-class
    status: truth-proposed
    reason: Class notes autosave and replay after reload instead of saving on blur
      (step 2); update proposal in this lane.
    steps: []
    reverify: []
    truthHash: ffcf00fa4940c4336c39d75bfd6cd22b1914165ddf19068e470bf833154b0c6c
---

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx, src/domain/repertoire.ts matched changed file(s) src/domain/repertoire.ts, src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/io.ts matched changed file(s) src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, the service worker, Layout and app-update code are untouched; the shared /settings route is only where the scheduling explanation also renders.

## point-this-device-at-the-nas — unchanged

No NAS base, reference or recording code changed; the shared /settings route is incidental.

## sync-devices-via-github — unchanged

syncEngine, githubSync and gitRemote are untouched; a pulled snapshot goes through the same validateDB, which now also checks the v17 fields (proved by session model inbound doors preserve live practice and fail before replacing data). As with every schema bump, both devices update before syncing; an older build refuses a v17 snapshot whole.

## practise-todays-recommendation — truth-proposed

Scoped results (focused/whole), Working/Keep-fresh returns, the shared candidate pool and autosaving notes change steps 2, 4, 6 and 7; update proposal in this lane.

## run-a-session-plan — truth-proposed

Preview Move earlier/later, removal without redistribution, skipping any pending or the running segment, and separate time figures change steps 2, 3, 5, 6 and the budget rule; update proposal in this lane.

## work-a-pathway-stage — truth-proposed

Routine contents preview before Start, running list with Move on / Skip / Remove, and unlabelled bound segments kept change the Guided routine variation; update proposal in this lane.

## adjust-how-scheduling-works — truth-proposed

The explanation now states Working returns, Keep-fresh whole checks and class preparation (step 1); update proposal in this lane.

## clear-a-due-review — truth-proposed

Which close completes a due review now depends on return intention and block scope (step 2, endsWith); update proposal in this lane.

## capture-a-practice-item — truth-proposed

Theory / listening study joins the kind-first form and study ideas pre-fill it (step 2, new variation); update proposal in this lane.

## log-a-class — truth-proposed

Class notes autosave and replay after reload instead of saving on blur (step 2); update proposal in this lane.

