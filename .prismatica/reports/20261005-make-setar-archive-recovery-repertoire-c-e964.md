---
contractId: 20261005-make-setar-archive-recovery-repertoire-c-e964
at: 2026-10-05T23:20:31.766Z
by: agent
none: false
entries:
  - flowId: adjust-how-scheduling-works
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx,
      src/domain/types.ts, src/store/useStore.ts matched changed file(s)
      src/domain/types.ts, src/pages/Settings.tsx, src/store/useStore.ts.
      Derived from the diff alone — this says nothing about whether any test ran
      or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: afa1699c9add3be9b8e2ffd3927383c32b80b5fde17abce91620b3c39edfa74f
  - flowId: back-up-and-restore
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx,
      src/store/useStore.ts matched changed file(s) src/pages/Settings.tsx,
      src/store/useStore.ts. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: 0ec576d7c25b79efb580481021a0d46b3870781626f4bf4bcae0a10eaeca4e59
  - flowId: browse-my-repertoire
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx
      matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 6dcacf73222002da377340a3771d81526322e55ffc5ee2bfc012ce9c0e6ac7d2
  - flowId: clear-a-due-review
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Today.tsx,
      src/store/useStore.ts matched changed file(s) src/pages/Today.tsx,
      src/store/useStore.ts. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: c27230bdffa873db6ce0efd7a258cd0d87837e1a34ad7cd4c75792bc979552a2
  - flowId: install-the-app-and-keep-it-current
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx
      matched changed file(s) src/pages/Settings.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 6bc9b34fdedf4f7c76dad9cf707b9d8ed31664754db174dd1b4b5479eb4b10f3
  - flowId: point-this-device-at-the-nas
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx,
      src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx,
      src/pages/Settings.tsx. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
    truthHash: cb9001b5d4e576d1bbd3b51d2b1793714c248e451b263c84ea3ca8b3d4fdc655
  - flowId: prepare-for-the-next-class
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx
      matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 79d3ebee5b9e5cf7e13e6d61ac17e1154a9e3a662b882229ef3fd17c120b64dc
  - flowId: run-a-session-plan
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Today.tsx,
      src/pages/ActiveBlock.tsx, src/components/useScreenAwake.ts,
      src/store/useStore.ts matched changed file(s)
      src/components/useScreenAwake.ts, src/pages/ActiveBlock.tsx,
      src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone —
      this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 320d7c620942ce36a5864d5164593de288a9db7489abc20fda3e2e29fa34cec3
  - flowId: see-practice-patterns
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Today.tsx
      matched changed file(s) src/pages/Today.tsx. Derived from the diff alone —
      this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: d1952a7f00f8a54077b28d8a52507c21f54c07712aed4e99bc01e4d17d9c9946
  - flowId: sync-devices-via-github
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx
      matched changed file(s) src/pages/Settings.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 1daeee8d1caa83a783184683bf72e73009118fe586b674a184f098d351510b5d
  - flowId: capture-a-practice-item
    status: truth-proposed
    reason: Dastgāh, form and composer now show the app's own suggestion buttons
      while typing (no native datalist); proposal updates step 3.
    steps:
      - 3
    reverify: []
    truthHash: 54132080907d546ed32720a72d5030b83e16ed5df3b3827b5448c3df3fd035c2
  - flowId: work-a-pathway-stage
    status: truth-proposed
    reason: Remove from pathway is offered in the notice right after Add and first
      in the row menu; Restore says the same item answers; a routine starts from
      the card tap. Proposal updates steps 2-3 and the Guided routine variation.
    steps:
      - 2
      - 3
    reverify: []
    truthHash: b26e276ebfb07186ab1e3b338d2222a02dc2e980532efe4301348044d2494799
  - flowId: practise-todays-recommendation
    status: truth-proposed
    reason: Start and Resume taps ready one page-lifetime practice sound; the cue is
      two pulses, claimed once per boundary, never queued; Turn on sound and
      Test practice sound recover it. Proposal updates steps 3-4 and the Target
      reached variation, adds Test practice sound.
    steps:
      - 3
      - 4
    reverify: []
    truthHash: bc5c4e206274e53121421504716b0da028206611df3238e4d7dcae3d16e04ef0
  - flowId: log-a-class
    status: truth-proposed
    reason: A class lists the pieces its Setar archive names beside the owner's
      links, through one association relation; unlink/relink of an
      archive-listed piece is one reversible decision. Proposal updates step 5.
    steps:
      - 5
    reverify: []
    truthHash: 5c72d856396414a95ce41b59cea9b33c3feeba7ea4e005b5dc75dce5ee0e9322
---

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/components/useScreenAwake.ts, src/store/useStore.ts matched changed file(s) src/components/useScreenAwake.ts, src/pages/ActiveBlock.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — truth-proposed

Dastgāh, form and composer now show the app's own suggestion buttons while typing (no native datalist); proposal updates step 3.

Steps: 3

## work-a-pathway-stage — truth-proposed

Remove from pathway is offered in the notice right after Add and first in the row menu; Restore says the same item answers; a routine starts from the card tap. Proposal updates steps 2-3 and the Guided routine variation.

Steps: 2, 3

## practise-todays-recommendation — truth-proposed

Start and Resume taps ready one page-lifetime practice sound; the cue is two pulses, claimed once per boundary, never queued; Turn on sound and Test practice sound recover it. Proposal updates steps 3-4 and the Target reached variation, adds Test practice sound.

Steps: 3, 4

## log-a-class — truth-proposed

A class lists the pieces its Setar archive names beside the owner's links, through one association relation; unlink/relink of an archive-listed piece is one reversible decision. Proposal updates step 5.

Steps: 5

