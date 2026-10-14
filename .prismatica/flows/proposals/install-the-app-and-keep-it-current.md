---
id: install-the-app-and-keep-it-current
proposalType: update
reason: "An app-owned update controller: only the tapping window reloads, once, onto the newest build; the build stamp names the last commit that changed what ships."
proposedBy: agent
createdAt: "2026-10-14T12:00:00.000Z"
status: works
truth:
  goal: Run the app installed on each device, practise with no network at all, and
    take new versions without ever reinstalling.
  startsWhen: The musician opens the app's web address on a device and installs it
    to the home screen or dock.
  needs: []
  steps:
    - actor: The musician
      action: Installs the app from its web address.
      shows: It opens like an app, full screen, with the navigation bar reaching the
        bottom of the phone.
      changes: The app's files are cached on the device; practice data stays in the
        device's own database.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-06T21:39:14.578Z
        commit: b8c76fe14e12a11ab83b73e3480c9f275f9b4053
    - actor: The musician
      action: Practises with no network at all.
      shows: Everything works — recommendations, blocks, reviews, notes.
      changes: Nothing is special-cased for being offline; only syncing and opening
        NAS files need a network.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-06T21:39:14.578Z
        commit: b8c76fe14e12a11ab83b73e3480c9f275f9b4053
    - actor: "Practice Compass"
      action: "Registers its worker once per page and checks for a new build every hour, whenever the app returns to the foreground and on reconnect."
      shows: "A calm 'A new version is ready.' banner with a Reload button only when this window runs older code than the newest build found — never for the first install of the build it already runs, never an automatic reload, and not while a close is unsaved (it appears right after Save or Discard). A route whose code an update removed shows the banner in its place."
      changes: "Nothing until the musician chooses to reload. A push that changes no file the build reads publishes byte-identical files, so no banner appears."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-14T12:00:00.000Z
    - actor: "The musician"
      action: "Taps Reload when it suits them."
      shows: "This window — only this one — restarts once on the newest build found; Settings shows that build's stamp (the last commit that changed what ships). Other open windows keep their offer until their own tap."
      changes: "Nothing in the practice data — an update replaces code, never data."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-14T12:00:00.000Z
  endsWith: Both devices run the current version, neither needed reinstalling, and
    neither needs a network to practise.
  variations:
    - name: Offline when a check is due
      differs: The check simply does nothing and tries again later — no error, no
        interruption.
      status: works
    - name: Not now
      differs: Ignoring the banner keeps the current version running for as long as
        the musician likes; the offer comes back.
      status: works
  rules:
    - Reinstalling is never the update path.
    - An update never interrupts a running block — the reload is always the
      musician's choice.
    - Every core flow works with no network.
  involves:
    - The musician---

Update proposed by change 20261014-give-works-real-plan-time-make-sound-and-d492; mechanics unchanged.
