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
        method: inferred
        at: 2026-08-28T12:21:58.723Z
    - actor: The musician
      action: Practises with no network at all.
      shows: Everything works — recommendations, blocks, reviews, notes.
      changes: Nothing is special-cased for being offline; only syncing and opening
        NAS files need a network.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-28T12:21:58.723Z
    - actor: Practice Compass
      action: Checks for a new build every hour and whenever the app is brought back
        to the foreground.
      shows: A calm 'A new version is ready.' banner with a Reload button — never an
        automatic reload in the middle of a session.
      changes: Nothing until the musician chooses to reload.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-28T12:21:58.723Z
    - actor: The musician
      action: Taps Reload when it suits them.
      shows: The app restarts on the new version; Settings shows the build it is
        running.
      changes: Nothing in the practice data — an update replaces code, never data.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-28T12:21:58.723Z
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
  hash: 6bc9b34fdedf4f7c76dad9cf707b9d8ed31664754db174dd1b4b5479eb4b10f3
  at: 2026-08-28T13:30:17.892Z
  by: Ethan
  signature: laDU0XCP8OPZTT+OFrKepVKZFnRiWVK92IOV4xZm2A4VgWU4uvz+Ok2kMtJEyDYOjZCS8iW0g33xxJfYTYGACw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Install the app and keep it current

_Works now · approved 2026-08-28T13:30:17.892Z by Ethan (signed)_

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

3. **Practice Compass** Checks for a new build every hour and whenever the app is brought back to the foreground.
   - Shows: A calm 'A new version is ready.' banner with a Reload button — never an automatic reload in the middle of a session.
   - Changes: Nothing until the musician chooses to reload.

4. **The musician** Taps Reload when it suits them.
   - Shows: The app restarts on the new version; Settings shows the build it is running.
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

