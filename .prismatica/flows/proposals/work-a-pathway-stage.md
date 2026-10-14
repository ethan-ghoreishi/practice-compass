---
id: work-a-pathway-stage
proposalType: update
reason: "Routine complete can capture what each recorded item showed, on that run's own blocks."
proposedBy: agent
createdAt: "2026-10-14T12:00:00.000Z"
status: works
truth:
  goal: Follow a route you trust — see where you are, take the next suggestion
    into your own items once, and practise it
  startsWhen: From Repertoire → Pathways (or the 'Now in:' card on Today) the
    musician opens a pathway and then a stage.
  needs: []
  steps:
    - actor: Practice Compass
      action: "Shows the stage's rows: the owner's items laid over the stage's
        reference suggestions, each suggestion resolved to the owner's item by
        its reference binding on the pathway's instrument — never by where the
        item sits."
      shows: "'n/m solid' over the visible rows; suggestions hidden in this pathway
        are omitted; two legacy copies answering one suggestion show as a
        choice."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-07T22:22:40.705Z
        commit: ccbf3f7cdedc249d954aadea70c4847835bceaa1
    - actor: The musician
      action: Taps + on a suggestion.
      shows: "'Added … — not practised yet.' The row now plays that item, and the same
        notice offers 'Remove from pathway' — the item is kept."
      changes: A practice item is created bound to the suggestion's reference; tapping
        again, after a move or a reload, hands back the same item — adding is
        organisation, not progress.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-07T22:22:40.705Z
        commit: ccbf3f7cdedc249d954aadea70c4847835bceaa1
    - actor: The musician
      action: "Optionally uses a row's ⋯ menu: Remove from pathway (first, set apart
        from Unlink), Link an existing item, Unlink reference, or Hide this
        suggestion (restored from 'Hidden suggestions')."
      changes: "Only organisation: Link sets one item's binding (same instrument
        only); Unlink drops one binding; Remove from pathway clears placement
        and hides the suggestion in this pathway; Hide is visibility only.
        Nothing is deleted — Delete practice item stays on the item's own page.
        Restoring a removed suggestion answers with the same item again, and
        says so — nothing new is made."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-07T22:22:40.705Z
        commit: ccbf3f7cdedc249d954aadea70c4847835bceaa1
    - actor: The musician
      action: Taps ▶ on a row to practise it.
      shows: The ordinary active block.
      changes: A suggestion not yet added is added first, then the block opens.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-07T22:22:40.705Z
        commit: ccbf3f7cdedc249d954aadea70c4847835bceaa1
    - actor: The musician
      action: Optionally pins the stage as the current one, edits it, or
        archives/restores the pathway.
      shows: Today, the Session Plan and Repertoire follow the same visible pathway
        and pinned stage.
      changes: The pathway records the pin or its archived state; deleting a stage or
        pathway detaches items instead of deleting them.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-07T22:22:40.705Z
        commit: ccbf3f7cdedc249d954aadea70c4847835bceaa1
  endsWith: The next piece of the route is a real practice item — taken once —
    with real practice behind it, and the stage's progress reflects it honestly.
  variations:
    - name: Teacher jumps around
      differs: A pinned current stage always beats 'first incomplete stage', because
        teacher-led work does not go in order.
      status: works
    - name: Guided routine
      differs: "A stage routine runs as a segmented warm-up countdown, started by the card's own tap (a bare routine link asks for Start rather than starting itself). A segment bound to a real item creates an honest PracticeBlock when the run finishes (result 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. Routine complete then optionally records, per recorded item, one of the six results and one line, written onto that run's own blocks — real evidence for history and results, never a review, date, status or minutes. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash."
      status: works
    - name: Off-catalogue items
      differs: Anything quick-added inside the stage appears in the same list and in
        recommendations.
      status: works
    - name: A default pathway this install lacks
      differs: "Before step 1, Repertoire → Pathways offers each shipped default
        pathway this install does not have — one newly shipped since the
        database was made, such as the Khonyagar Tar course, or one the owner
        deleted — as its own 'Add default pathway: <name>' button beside 'New
        pathway', only when this device has that pathway's instrument and only
        within the current instrument filter. Tapping one adds exactly that
        pathway with its seeded stages and any seeded routine whose id is not
        already held; nothing that exists is changed, nothing is added without
        that tap, and the button then disappears."
      status: works
  rules:
    - The item is the only unit of work — a pathway is a view over items, never
      a parallel to-do list.
    - The catalogue is reference data in code, labelled as an aid, never a fixed
      syllabus.
    - Adding from the catalogue is losslessly reversible until the moment it is
      practised.
    - A routine records at most one PracticeBlock per distinct bound item per
      run, never one per segment repeat.
  involves:
    - The musician
    - The pathway catalogue---

Update proposed by change 20261014-give-works-real-plan-time-make-sound-and-d492; mechanics unchanged.
