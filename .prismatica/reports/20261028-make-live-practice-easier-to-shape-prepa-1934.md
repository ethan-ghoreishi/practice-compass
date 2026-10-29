---
contractId: 20261028-make-live-practice-easier-to-shape-prepa-1934
at: 2026-10-29T01:40:36.850Z
by: agent
none: false
entries:
  - flowId: back-up-and-restore
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx
      matched changed file(s) src/pages/Settings.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 0ec576d7c25b79efb580481021a0d46b3870781626f4bf4bcae0a10eaeca4e59
  - flowId: install-the-app-and-keep-it-current
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx
      matched changed file(s) src/pages/Settings.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 7a858934f7458dcbd4ffae16c4650740661a980dbd01c19aa26b800cebdbeddb
  - flowId: point-this-device-at-the-nas
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx
      matched changed file(s) src/pages/Settings.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: cb9001b5d4e576d1bbd3b51d2b1793714c248e451b263c84ea3ca8b3d4fdc655
  - flowId: sync-devices-via-github
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx
      matched changed file(s) src/pages/Settings.tsx. Derived from the diff
      alone — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
    truthHash: 1daeee8d1caa83a783184683bf72e73009118fe586b674a184f098d351510b5d
  - flowId: browse-my-repertoire
    status: unchanged
    reason: Repertoire browsing, search and item opening are untouched; only the
      class-preparation sentence on an item's Next practice line changed, which
      belongs to practise-todays-recommendation.
    steps: []
    reverify: []
    truthHash: 6dcacf73222002da377340a3771d81526322e55ffc5ee2bfc012ce9c0e6ac7d2
  - flowId: capture-a-practice-item
    status: unchanged
    reason: "No creation path changed: Quick add and Add practice item are
      untouched; a mid-practice question is a lesson-agenda entry, never an
      item."
    steps: []
    reverify: []
    truthHash: 42cd58fd38634a08a6c2d111247fee85e986e3336ed840b9582a88c16a8a679c
  - flowId: clear-a-due-review
    status: unchanged
    reason: Due reviews, Not now and Snooze are untouched; class reservation and
      freed-time choices never write a review row, a date or spacing state
      (proved in ac-2 and ac-4).
    steps: []
    reverify: []
    truthHash: 6987beaf5ea09a55a7a52bd8ba6e9269ee9d5bad1a38f05198bab85a810a220c
  - flowId: log-a-class
    status: unchanged
    reason: Recording a lesson and turning it into preparations is unchanged;
      questions asked mid-practice land in the same agenda the lesson page
      already lists (prepare-for-the-next-class carries that change).
    steps: []
    reverify: []
    truthHash: 41ced7594e689bba9ced5062e8979a0c236a66e5173db812c4726381534a9762
  - flowId: see-practice-patterns
    status: unchanged
    reason: Insights reads results and lastResult as before; clearing a routine
      result now leaves lastResult following the remaining history, so a cleared
      result is no longer announced (ac-4) — the read itself is unchanged.
    steps: []
    reverify: []
    truthHash: d1952a7f00f8a54077b28d8a52507c21f54c07712aed4e99bc01e4d17d9c9946
  - flowId: practise-todays-recommendation
    status: truth-proposed
    reason: "Behaviour changed as approved for issue #58; the update is proposed in
      .prismatica/flows/proposals/practise-todays-recommendation.md for the
      owner's review."
    steps: []
    reverify: []
    truthHash: 6341a19ffe71e39ca792b8f6b304fd2e5908db6b2ef18880609cb84cb699e547
  - flowId: run-a-session-plan
    status: truth-proposed
    reason: "Behaviour changed as approved for issue #58; the update is proposed in
      .prismatica/flows/proposals/run-a-session-plan.md for the owner's review."
    steps: []
    reverify: []
    truthHash: a2473dc271e91978f4d4fcf2ed94c4b98c7c4a47f6160f46b4b6722c3a9532ea
  - flowId: work-a-pathway-stage
    status: truth-proposed
    reason: "Behaviour changed as approved for issue #58; the update is proposed in
      .prismatica/flows/proposals/work-a-pathway-stage.md for the owner's
      review."
    steps: []
    reverify: []
    truthHash: 6a75a0ed6b51ad9a22794fba93056132d6db8d5f3f1087a187ea19965614a73f
  - flowId: prepare-for-the-next-class
    status: truth-proposed
    reason: "Behaviour changed as approved for issue #58; the update is proposed in
      .prismatica/flows/proposals/prepare-for-the-next-class.md for the owner's
      review."
    steps: []
    reverify: []
    truthHash: 79d3ebee5b9e5cf7e13e6d61ac17e1154a9e3a662b882229ef3fd17c120b64dc
  - flowId: adjust-how-scheduling-works
    status: truth-proposed
    reason: "Behaviour changed as approved for issue #58; the update is proposed in
      .prismatica/flows/proposals/adjust-how-scheduling-works.md for the owner's
      review."
    steps: []
    reverify: []
    truthHash: 472e56a8d2f5adcd2f5b2d85e543ca707c052983246239d8b7042439d2246aec
---

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

Repertoire browsing, search and item opening are untouched; only the class-preparation sentence on an item's Next practice line changed, which belongs to practise-todays-recommendation.

## capture-a-practice-item — unchanged

No creation path changed: Quick add and Add practice item are untouched; a mid-practice question is a lesson-agenda entry, never an item.

## clear-a-due-review — unchanged

Due reviews, Not now and Snooze are untouched; class reservation and freed-time choices never write a review row, a date or spacing state (proved in ac-2 and ac-4).

## log-a-class — unchanged

Recording a lesson and turning it into preparations is unchanged; questions asked mid-practice land in the same agenda the lesson page already lists (prepare-for-the-next-class carries that change).

## see-practice-patterns — unchanged

Insights reads results and lastResult as before; clearing a routine result now leaves lastResult following the remaining history, so a cleared result is no longer announced (ac-4) — the read itself is unchanged.

## practise-todays-recommendation — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/practise-todays-recommendation.md for the owner's review.

## run-a-session-plan — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/run-a-session-plan.md for the owner's review.

## work-a-pathway-stage — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/work-a-pathway-stage.md for the owner's review.

## prepare-for-the-next-class — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/prepare-for-the-next-class.md for the owner's review.

## adjust-how-scheduling-works — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/adjust-how-scheduling-works.md for the owner's review.

