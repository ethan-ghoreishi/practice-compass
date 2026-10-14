---
id: install-the-app-and-keep-it-current
createdAt: 2026-08-28T13:27:39.539Z
status: works
presentation:
  title: Install the app and keep it current
  journey: Your data
  order: 14
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
        at: 2026-10-14T17:52:27.551Z
        commit: a7fda0bf6a01931c7cc37d4f1a35675924ea5dbf
    - actor: The musician
      action: Practises with no network at all.
      shows: Everything works — recommendations, blocks, reviews, notes.
      changes: Nothing is special-cased for being offline; only syncing and opening
        NAS files need a network.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-14T17:52:27.551Z
        commit: a7fda0bf6a01931c7cc37d4f1a35675924ea5dbf
    - actor: Practice Compass
      action: Registers its worker once per page and checks for a new build every
        hour, whenever the app returns to the foreground and on reconnect.
      shows: A calm 'A new version is ready.' banner with a Reload button only when
        this window runs older code than the newest build found — never for the
        first install of the build it already runs, never an automatic reload,
        and not while a close is unsaved (it appears right after Save or
        Discard). A route whose code an update removed shows the banner in its
        place.
      changes: Nothing until the musician chooses to reload. A push that changes no
        file the build reads publishes byte-identical files, so no banner
        appears.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-14T17:52:27.551Z
        commit: a7fda0bf6a01931c7cc37d4f1a35675924ea5dbf
    - actor: The musician
      action: Taps Reload when it suits them.
      shows: This window — only this one — restarts once on the newest build found;
        Settings shows that build's stamp (the last commit that changed what
        ships). Other open windows keep their offer until their own tap.
      changes: Nothing in the practice data — an update replaces code, never data.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-14T17:52:27.551Z
        commit: a7fda0bf6a01931c7cc37d4f1a35675924ea5dbf
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
    - The musician
mechanics:
  touchpoints:
    - src/components/Layout.tsx
    - src/pages/Settings.tsx
    - vite.config.ts
  routes:
    - /settings
  components:
    - Layout
    - Settings
  entities: []
  tests: []
approval:
  hash: 7a858934f7458dcbd4ffae16c4650740661a980dbd01c19aa26b800cebdbeddb
  at: 2026-10-14T17:50:32.228Z
  by: owner
  signature: U6jBMN+ZUiqEXtOkwtbWFvvdwGLAQB/EVeLBf0lTl239Q0wjyWm7Dl9zNyMz5gykhzWH10V0vqTVE+9etpNtBQ==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Install the app and keep it current

_Works now · approved 2026-10-14T17:50:32.228Z by owner (signed)_

## Goal

Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.

## Starts when

The musician opens the app's web address on a device and installs it to the home screen or dock.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Installs the app from its web address.
   - Shows: It opens like an app, full screen, with the navigation bar reaching the bottom of the phone.
   - Changes: The app's files are cached on the device; practice data stays in the device's own database.

2. **The musician** Practises with no network at all.
   - Shows: Everything works — recommendations, blocks, reviews, notes.
   - Changes: Nothing is special-cased for being offline; only syncing and opening NAS files need a network.

3. **Practice Compass** Registers its worker once per page and checks for a new build every hour, whenever the app returns to the foreground and on reconnect.
   - Shows: A calm 'A new version is ready.' banner with a Reload button only when this window runs older code than the newest build found — never for the first install of the build it already runs, never an automatic reload, and not while a close is unsaved (it appears right after Save or Discard). A route whose code an update removed shows the banner in its place.
   - Changes: Nothing until the musician chooses to reload. A push that changes no file the build reads publishes byte-identical files, so no banner appears.

4. **The musician** Taps Reload when it suits them.
   - Shows: This window — only this one — restarts once on the newest build found; Settings shows that build's stamp (the last commit that changed what ships). Other open windows keep their offer until their own tap.
   - Changes: Nothing in the practice data — an update replaces code, never data.

## Ends with

Both devices run the current version, neither needed reinstalling, and neither needs a network to practise.

## Variations

- **Offline when a check is due** — The check simply does nothing and tries again later — no error, no interruption. _(Works now)_
- **Not now** — Ignoring the banner keeps the current version running for as long as the musician likes; the offer comes back. _(Works now)_

## Rules

- Reinstalling is never the update path.
- An update never interrupts a running block — the reload is always the musician's choice.
- Every core flow works with no network.

## Involves

- The musician
