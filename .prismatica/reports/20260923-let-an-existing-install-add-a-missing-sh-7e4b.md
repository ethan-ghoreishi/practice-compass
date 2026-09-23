---
contractId: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
at: 2026-09-23T17:25:30.956Z
by: agent
none: false
entries:
  - flowId: adjust-how-scheduling-works
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: afa1699c9add3be9b8e2ffd3927383c32b80b5fde17abce91620b3c39edfa74f
  - flowId: back-up-and-restore
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 0ec576d7c25b79efb580481021a0d46b3870781626f4bf4bcae0a10eaeca4e59
  - flowId: browse-my-repertoire
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx
      matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: cb9d8394744e5713b7d083e940a3f3756ceac2bcb59990e1782be80083cf8b8c
  - flowId: capture-a-practice-item
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 54132080907d546ed32720a72d5030b83e16ed5df3b3827b5448c3df3fd035c2
  - flowId: clear-a-due-review
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: c27230bdffa873db6ce0efd7a258cd0d87837e1a34ad7cd4c75792bc979552a2
  - flowId: log-a-class
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 5c72d856396414a95ce41b59cea9b33c3feeba7ea4e005b5dc75dce5ee0e9322
  - flowId: practise-todays-recommendation
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: bc5c4e206274e53121421504716b0da028206611df3238e4d7dcae3d16e04ef0
  - flowId: run-a-session-plan
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 320d7c620942ce36a5864d5164593de288a9db7489abc20fda3e2e29fa34cec3
  - flowId: install-the-app-and-keep-it-current
    status: unchanged
    reason: Shares only the /settings route by inference. Nothing in this change
      touches Settings, a PracticeItem, or any collection other than
      pathways/stages/routines; the only store action changed is
      reseedDefaultPathways, reached solely from Repertoire → Pathways.
    steps: []
    reverify: []
    truthHash: 6bc9b34fdedf4f7c76dad9cf707b9d8ed31664754db174dd1b4b5479eb4b10f3
  - flowId: point-this-device-at-the-nas
    status: unchanged
    reason: Shares only the /settings route by inference. Nothing in this change
      touches Settings, a PracticeItem, or any collection other than
      pathways/stages/routines; the only store action changed is
      reseedDefaultPathways, reached solely from Repertoire → Pathways.
    steps: []
    reverify: []
    truthHash: cb9001b5d4e576d1bbd3b51d2b1793714c248e451b263c84ea3ca8b3d4fdc655
  - flowId: prepare-for-the-next-class
    status: unchanged
    reason: Shares only the PracticeItem entity by inference. Nothing in this change
      touches Settings, a PracticeItem, or any collection other than
      pathways/stages/routines; the only store action changed is
      reseedDefaultPathways, reached solely from Repertoire → Pathways.
    steps: []
    reverify: []
    truthHash: 79d3ebee5b9e5cf7e13e6d61ac17e1154a9e3a662b882229ef3fd17c120b64dc
  - flowId: see-practice-patterns
    status: unchanged
    reason: Shares only the PracticeItem entity by inference. Nothing in this change
      touches Settings, a PracticeItem, or any collection other than
      pathways/stages/routines; the only store action changed is
      reseedDefaultPathways, reached solely from Repertoire → Pathways.
    steps: []
    reverify: []
    truthHash: d1952a7f00f8a54077b28d8a52507c21f54c07712aed4e99bc01e4d17d9c9946
  - flowId: sync-devices-via-github
    status: unchanged
    reason: Shares only the /settings route by inference. Nothing in this change
      touches Settings, a PracticeItem, or any collection other than
      pathways/stages/routines; the only store action changed is
      reseedDefaultPathways, reached solely from Repertoire → Pathways. Adding a
      default pathway replaces db once and bumps rev like any edit, so it syncs
      through the unchanged engine; a no-op tap now writes nothing, so it no
      longer schedules a needless sync.
    steps: []
    reverify: []
    truthHash: 1daeee8d1caa83a783184683bf72e73009118fe586b674a184f098d351510b5d
  - flowId: work-a-pathway-stage
    status: truth-proposed
    reason: "Repertoire → Pathways now offers each shipped default pathway this
      install lacks as its own 'Add default pathway: <name>' button (approved
      Delta 20260923-before-step-1-repertoire-pathways-offers-8b03). Steps 1-5
      are unchanged; the lane's update proposal adds that variation and the
      Repertoire touchpoint. Proven by the six named tests in
      src/domain/pathways.test.ts; the rendered wiring is ac-7, the owner's
      manual check."
    steps: []
    reverify: []
    truthHash: 57dc3293be5068d38c9b0f5f06702b222f63e92f850f9f078a9c2efbbe01d874
---

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Shares only the /settings route by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## point-this-device-at-the-nas — unchanged

Shares only the /settings route by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## prepare-for-the-next-class — unchanged

Shares only the PracticeItem entity by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## see-practice-patterns — unchanged

Shares only the PracticeItem entity by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## sync-devices-via-github — unchanged

Shares only the /settings route by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways. Adding a default pathway replaces db once and bumps rev like any edit, so it syncs through the unchanged engine; a no-op tap now writes nothing, so it no longer schedules a needless sync.

## work-a-pathway-stage — truth-proposed

Repertoire → Pathways now offers each shipped default pathway this install lacks as its own 'Add default pathway: <name>' button (approved Delta 20260923-before-step-1-repertoire-pathways-offers-8b03). Steps 1-5 are unchanged; the lane's update proposal adds that variation and the Repertoire touchpoint. Proven by the six named tests in src/domain/pathways.test.ts; the rendered wiring is ac-7, the owner's manual check.

