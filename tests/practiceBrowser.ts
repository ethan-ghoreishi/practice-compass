import { mkdtempSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, webkit, type Browser, type BrowserContext, type BrowserType, type Page, type Request } from 'playwright';

const GITHUB_API = 'https://api.github.com/';

// ---------------------------------------------------------------------------
// A small harness for driving the REAL app in a real browser from an ordinary
// Vitest test.
//
// Deliberately a LIBRARY, not a second test runner: the installed check engine
// traces acceptance through the Vitest report, so a standalone Playwright exit
// code would prove nothing to it. Each journey gets its own Vite dev server and
// its own browser CONTEXT, which means its own origin-scoped IndexedDB and
// localStorage — no fixture from one journey can reach the other, and neither
// can touch the owner's real data, GitHub or NAS.
//
// A missing browser is a FAILURE with a setup message, never a skip: a check
// that quietly passes because it did not run is worse than no check at all.
// ---------------------------------------------------------------------------

/** The two engines this app is actually used in: Chrome on the Mac, Safari on the iPhone. */
export type Engine = 'chromium' | 'webkit';

const ENGINES: Record<Engine, BrowserType> = { chromium, webkit };

const installHint = (engine: Engine) =>
  `The Playwright ${engine} browser is not installed. Run \`npx playwright install ${engine}\` ` +
  '(CI does this before `npm test`). This check never skips: an unverified journey is not a passing one, ' +
  'and an engine quietly missed is the same thing as an engine never checked.';

/**
 * ONE recorded outcome of a network request the harness watched, whatever the
 * browser's own words for it were. It is EVIDENCE and nothing else: no page
 * error is ever withheld because of what is in this log.
 *
 * WHY THERE IS NO LONGER AN EXCUSE. A CI run produced `Fetch API cannot load
 * https://api.github.com/repos/owner/practice-data/contents/README.md due to
 * access control checks.` on two of three runners at a commit that passed on
 * the third — a WebKit-only, CORS-shaped page error, while every other run
 * fulfils that same request with the right CORS headers. A request the browser
 * CANCELS because the test drove on while it was in flight was the standing
 * explanation, and successive versions of this harness tried to act on it: a
 * permanent URL set, a consuming time window, a nearest-wins ranking, then
 * full-URL identity plus a veto. Every one of them could still withhold a
 * genuine failure, because every one rested on a pairing that has never been
 * OBSERVED.
 *
 * Measured, driving a real WebKit: five cancellation shapes — navigating away
 * mid-flight, reloading mid-flight, `AbortController`, a same-tick
 * `location.href`, a cancelled CORS preflight — each produced a `requestfailed`
 * with `errorText: 'cancelled'` and NO page error whatsoever. And the CI
 * failure itself arrives with no `request`, no route hit and no `requestfailed`
 * at all. So a cancellation has never been seen to CAUSE this page error, and a
 * `pageerror` hands a test an `Error` carrying no request identity — there is
 * nothing to prove ownership with, at any window or resolution.
 *
 * An unprovable correlation is therefore resolved the only safe way: the error
 * is KEPT. The last shape of the excuse still let an earlier, unconsumed
 * cancellation to the same URL swallow a genuine diagnosis that emitted no
 * `requestfailed` of its own — exactly the CI failure's own shape — which is
 * the sealed finding that closed this line of work for good. The remaining fix
 * is to remove the RACE (see the `git/ref/heads/main` route in
 * `installFakeGitHub`), never to hide its symptom.
 *
 * `errorText` is kept verbatim because it is what a kept error REPORTS
 * (`requestFailureEvidence`): a bare CORS-shaped message with nothing to
 * distinguish a cancellation from a real refusal is exactly what made the
 * original CI-only failure unreadable.
 */
export interface TrackedRequestFailure {
  url: string;
  /** Node's clock. `page.clock` is installed and frozen; this is not page time. */
  at: number;
  /** The browser's own words — `'cancelled'`, an Access-Control refusal, anything. */
  errorText: string;
}

/**
 * How far from a page error a tracked request failure may sit and still be
 * worth PRINTING beside it. It bounds a REPORT, never a suppression: nothing
 * in this file drops an error, so no safety claim rests on this number.
 *
 * It is generous because Node's delivery can lag under the contention several
 * concurrent dev servers create — and small enough that the evidence line
 * stays about this error rather than the whole journey.
 */
export const FAILURE_EVIDENCE_MS = 2_000;

/**
 * WebKit's one diagnosis, in the two spellings it uses (a `fetch` and an
 * `XMLHttpRequest`), anchored end to end.
 *
 * The whole point of parsing into a real `URL` and comparing its parts by
 * EQUALITY (`sameResource`), rather than testing whether the message merely
 * CONTAINS a candidate's host/path as substrings, is that a substring test
 * cannot tell `api.github.com` from `evil-api.github.com` (host extended on
 * the left) or `api.github.com.evil.test` (extended on the right), nor
 * `/state.json` from `/state.json.bak` — every one of which contains the
 * genuine value as a substring. Anchoring the match to the exact text between
 * the fixed "cannot load " / " due to access control checks" phrases — the
 * only text WebKit ever puts there — removes the ambiguity outright instead
 * of trying to out-guess it with boundary characters.
 *
 * There is deliberately no tolerance for whitespace between the scheme and
 * the host. An earlier version of this regex allowed it, describing a space
 * WebKit was said to insert; measured — macOS WebKit locally and Linux WebKit
 * in CI — no such space exists, and the apparent one was an artefact of how
 * the two halves below are put back together.
 */
const DIAGNOSIS = /^(?:Fetch API|XMLHttpRequest) cannot load (https?):\/\/(\S+) due to access control checks\.?$/;

/**
 * Extract the URL a diagnosed WebKit access-control page error names, or
 * `null` if it is not that shape at all (a render crash, a thrown TypeError —
 * never excused).
 *
 * THE ERROR ARRIVES IN TWO HALVES, AND NEITHER HALF ALONE IS THE DIAGNOSIS.
 * Playwright splits every page error into `name`/`message` at the FIRST colon,
 * dropping one character after it (`splitErrorMessage`). The first colon in
 * this diagnosis is the URL's own scheme colon, so the text WebKit emitted
 *
 *     Fetch API cannot load https://api.github.com/… due to access control checks.
 *
 * reaches a test as
 *
 *     name:    'Fetch API cannot load https'
 *     message: '/api.github.com/… due to access control checks.'
 *
 * — MEASURED, identically, on macOS WebKit here and on Linux WebKit in CI.
 * Matching `message` alone (which is what this used to do) can therefore never
 * succeed against a real error, on any platform: the excuse was dead code, and
 * the first CI run that actually produced the error is what exposed it.
 * Rejoining with the dropped `:/` recovers the original text. The unsplit
 * form is tried as well, so a representation that ever stops being split is
 * still understood; both go through the same anchored regex, so a wrong
 * reconstruction simply fails to match rather than matching something loosely.
 */
function reportedUrl(error: { name?: string; message: string }): URL | null {
  for (const text of [error.message, `${error.name ?? ''}:/${error.message}`]) {
    const m = DIAGNOSIS.exec(text.trim());
    if (!m) continue;
    try {
      return new URL(`${m[1]}://${m[2]}`);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Do a tracked request's URL and the one a page error NAMES address the same
 * resource? Host, path AND QUERY, all three by structural equality.
 *
 * THE QUERY IS THE PART THIS USED TO THROW AWAY, and a sealed finding is what
 * it cost: matching host+path alone makes
 * `contents/setar/index.json?ref=<commit A>` and `?ref=<commit B>` — two
 * different requests the app really does make, one after the other — the same
 * resource, so a cancellation of one stood ready to excuse a genuine failure
 * of the other. WebKit names the FULL url in the diagnosis, query included
 * (measured, macOS WebKit: `…/state.json?ref=main&x=1 due to access control
 * checks.`), so this identity is available and there is no reason to discard
 * it.
 *
 * THE FRAGMENT IS THE ONE PART THAT MUST BE IGNORED, and comparing `href`
 * would get that wrong: a fragment never reaches the network, so
 * `request.url()` drops it — while WebKit's message keeps it verbatim
 * (measured: message `…/state.json#frag`, request url `…/state.json`). Naming
 * `host`/`pathname`/`search` explicitly is what keeps a later tidy-up to
 * `href` from silently killing the excuse for every fragment-bearing URL.
 */
function sameResource(trackedUrl: string, reported: URL): boolean {
  let url: URL;
  try {
    url = new URL(trackedUrl);
  } catch {
    return false;
  }
  return url.host === reported.host && url.pathname === reported.pathname && url.search === reported.search;
}

/**
 * What the harness saw around a diagnosed page error, in one sentence, so the
 * assertion that KEEPS it says why.
 *
 * `expect(app.pageErrors).toEqual([])` on its own reports a WebKit message
 * that reads like a CORS misconfiguration whatever actually happened — which
 * is exactly how a CI-only failure became unreadable. Naming the browser's own
 * `errorText` for every tracked request to that same resource, and how far
 * each sat from the error, turns the next one into evidence instead of a
 * guess.
 *
 * It only DESCRIBES. It consumes nothing, decides nothing and cannot cause an
 * error to be dropped; a message that is not the diagnosis at all (a render
 * crash, a thrown TypeError) simply gets no annotation.
 */
export function requestFailureEvidence(
  events: TrackedRequestFailure[],
  error: { name?: string; message: string },
  at: number,
): string {
  const reported = reportedUrl(error);
  if (!reported) return '';
  const where = `${reported.host}${reported.pathname}${reported.search}`;
  // DELIBERATELY BROADER THAN THE ERROR'S OWN IDENTITY: same host and path,
  // whatever the query. A failure to the same path under a DIFFERENT query is
  // exactly what the reader of a CI-only failure needs to see, so each row
  // prints its own full url and says whether it was the resource the error
  // named.
  const near = events
    .filter((e) => Math.abs(at - e.at) <= FAILURE_EVIDENCE_MS)
    .filter((e) => {
      try {
        const url = new URL(e.url);
        return url.host === reported.host && url.pathname === reported.pathname;
      } catch {
        return false;
      }
    })
    .map(
      (e) =>
        `${e.url} — ${e.errorText || '(no errorText)'} at ${e.at >= at ? '+' : ''}${e.at - at}ms` +
        `${sameResource(e.url, reported) ? '' : ' (different query — not the resource this error names)'}`,
    );
  return near.length
    ? `tracked request failures for ${where}: ${near.join('; ')}`
    : `no tracked request failure for ${where} within ${FAILURE_EVIDENCE_MS}ms`;
}

export interface PracticeApp {
  page: Page;
  /** The dev server origin this journey is isolated on. */
  origin: string;
  /** Which engine this journey is actually running in. */
  engine: Engine;
  /**
   * Uncaught page errors, so a broken render cannot pass as a quiet one.
   *
   * NOTHING IS EVER WITHHELD FROM THIS LIST. Each error is ANNOTATED on read
   * rather than at arrival, because WebKit delivers a page error about a
   * request BEFORE that request's own `requestfailed` (measured: 74–359µs
   * ahead, six times out of six), so annotating on arrival would print against
   * a log that has not been written yet. Reading this at the end of a journey
   * — which is when a journey asserts on it — has every event in hand.
   */
  readonly pageErrors: Error[];
  /**
   * Wait until nothing is in flight to the GitHub API, so a navigation cannot
   * tear the document down around a request the app is still making.
   *
   * THIS IS THE RACE ITSELF, not a symptom of it. Every `goTo`/`reload` below
   * is a full document load, so each one re-runs the app's own on-open sync;
   * WebKit refuses a `fetch()` issued while the document is being destroyed
   * and reports it as an uncaught page error reading
   * `Fetch API cannot load … due to access control checks.` — with no
   * `request`, no route hit and no `requestfailed` to explain it. A real
   * person navigating mid-sync produces the same thing, and the harness used
   * to try to EXCUSE it; it cannot be excused safely (see
   * `TrackedRequestFailure`), so it is prevented instead, at the one boundary
   * that creates it.
   *
   * Bounded and best-effort: a request that never settles is abandoned rather
   * than hanging a journey, because this is a scheduling courtesy, not an
   * assertion.
   */
  settleSync(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Start the app and open it in a fresh, isolated browser context.
 *
 * `now` fixes the browser's clock before any script runs, so every date the
 * app derives — due reviews, lesson deadlines, the local calendar day a block
 * belongs to — is deterministic. `page.clock` can then move it forward within
 * a journey (across local midnight, for instance) exactly as a real device
 * left open overnight would experience it.
 */
export async function openPracticeApp(options: {
  now: Date;
  viewport?: { width: number; height: number };
  /** Which engine to drive. Defaults to Chromium; ac-14 drives both. */
  engine?: Engine;
  /**
   * Serve a DIFFERENT checkout of this app — used to stand up a disposable
   * copy of an older release (a git worktree at an earlier commit) so a
   * rollback can be tested against the app that actually wrote the backup,
   * rather than against a description of it. Defaults to this checkout.
   */
  root?: string;
}): Promise<PracticeApp> {
  const engine = options.engine ?? 'chromium';
  // EVERY SERVER GETS ITS OWN DEPENDENCY CACHE. Vite's default cache directory
  // is `node_modules/.vite`, and this suite runs ten test files at once, each
  // starting its own dev server on the same checkout — plus the rollback
  // journeys, whose baseline worktree SYMLINKS this very `node_modules`. They
  // all ran the dependency optimizer against one directory and raced to commit
  // it: `ENOTEMPTY: rename '…/.vite/deps_temp_xxxx' -> '…/.vite/deps'`.
  // The loser then cannot serve its modules at all, so its page never paints
  // and the journey fails on the cold-start wait below — which reads as
  // contention and is really one shared directory. Measured: that rename error
  // appears in the same run as every one of those failures. A private cache
  // costs one extra optimizer pass per server and removes the race outright.
  const cacheDir = mkdtempSync(join(tmpdir(), 'practice-vite-'));
  const server: ViteDevServer = await createServer({
    ...(options.root ? { root: options.root, configFile: `${options.root}/vite.config.ts` } : { configFile: 'vite.config.ts' }),
    cacheDir,
    logLevel: 'error',
    server: { port: 0, strictPort: false },
  });
  const closeServer = async () => {
    await server.close();
    rmSync(cacheDir, { recursive: true, force: true });
  };
  await server.listen();
  const origin = server.resolvedUrls?.local[0];
  if (!origin) {
    await closeServer();
    throw new Error('The dev server started but reported no local URL.');
  }

  let browser: Browser;
  try {
    browser = await ENGINES[engine].launch();
  } catch (e) {
    await closeServer();
    throw new Error(installHint(engine), { cause: e });
  }

  let context: BrowserContext;
  let page: Page;
  const pending: { error: Error; at: number }[] = [];
  const pageErrors: Error[] = [];
  // EVERY requestfailed is tracked, cancelled or not: a kept page error has to
  // be able to say what the browser actually reported about that resource.
  const requestFailures: TrackedRequestFailure[] = [];
  // Requests the app currently has open to the GitHub API. Emptied by
  // `settleSync` before any navigation, so nothing is in flight when the
  // document is torn down.
  const inFlight = new Set<Request>();
  // Has this journey ever talked to GitHub at all? Until it has, there is no
  // sync to wait for and `settleSync` costs nothing.
  let syncConfigured = false;
  try {
    context = await browser.newContext({
      viewport: options.viewport ?? { width: 390, height: 844 },
      // The owner's phone. Deliberately the constraint the product is held to.
      deviceScaleFactor: 2,
    });
    page = await context.newPage();
    // ONE handler for the whole journey. The app's destructive actions ask
    // first with confirm(); an unanswered dialog blocks every later command,
    // and registering a second handler makes the first one's accept() throw.
    page.on('dialog', (d) => {
      void d.accept().catch(() => {});
    });
    page.on('request', (r) => {
      if (!r.url().startsWith(GITHUB_API)) return;
      inFlight.add(r);
      syncConfigured = true;
    });
    page.on('requestfinished', (r) => inFlight.delete(r));
    // A request belonging to a document that has just been replaced will never
    // report finished or failed, so without this it would sit in the set for
    // ever and make every later `settleSync` burn its whole ceiling.
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) inFlight.clear();
    });
    page.on('requestfailed', (r) => {
      inFlight.delete(r);
      requestFailures.push({ url: r.url(), at: Date.now(), errorText: r.failure()?.errorText ?? '' });
    });
    // Surface a page-level error instead of letting it become a silently
    // wrong assertion later. RECORDED here, ANNOTATED in `resolve()` below —
    // WebKit delivers a page error about a request BEFORE that request's own
    // `requestfailed` (measured: 74–359µs ahead, six of six), so the evidence
    // a kept error prints has not been delivered yet at this point.
    page.on('pageerror', (e) => {
      pending.push({ error: e, at: Date.now() });
    });
    await page.clock.install({ time: options.now });
    await page.goto(origin);
    // The store hydrates from IndexedDB before anything renders. The ceiling is
    // generous because this is the COLD start: every journey runs concurrently,
    // each starting its own dev server and browser, so the first paint of the
    // last one to launch competes with the rest compiling modules. A longer
    // wait cannot hide a real failure — it only refuses to call contention one.
    //
    // RAISING IT IS NOT THE ANSWER WHEN IT FIRES, and this lane proved that:
    // three separate full-suite failures landed here, and raising 60s to 120s
    // only bought one more run before the next. The cause was the shared
    // dependency cache above, not a page that needed longer.
    await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 60_000 });
  } catch (e) {
    await browser.close();
    await closeServer();
    throw e;
  }

  /**
   * Drain everything that arrived since the last read. EVERY page error is
   * kept — nothing here may drop one — annotated with what the harness
   * actually saw around it, so a CORS-shaped message arrives as evidence
   * rather than a guess. Idempotent: a drained error stays resolved, so
   * reading twice reports the same list.
   */
  const resolve = (): Error[] => {
    for (const { error, at } of pending.splice(0)) {
      const evidence = requestFailureEvidence(requestFailures, error, at);
      if (evidence) error.message = `${error.message} [harness: ${evidence}]`;
      pageErrors.push(error);
    }
    return pageErrors;
  };

  return {
    page,
    origin,
    engine,
    get pageErrors() {
      return resolve();
    },
    async settleSync() {
      if (!syncConfigured) return;
      // EMPTY IS NOT ENOUGH: the app starts its on-open sync from an effect and
      // reads IndexedDB before its first fetch, so a check taken the instant a
      // page becomes interactive can see an empty set and still be followed by
      // a request a moment later. Wait for a QUIET period instead.
      const until = Date.now() + 10_000;
      let quietSince = Date.now();
      while (Date.now() < until) {
        if (inFlight.size > 0) quietSince = Date.now();
        else if (Date.now() - quietSince >= 200) return;
        await new Promise((r) => setTimeout(r, 25));
      }
      // A request that never settles belongs to a document that is about to go
      // anyway, and must not hang the journey waiting on it.
      inFlight.clear();
    },
    async close() {
      await browser.close();
      await closeServer();
    },
  };
}

/**
 * Import a backup through the REAL Settings control — the same path the owner
 * uses, file picker and confirmation included. No debug hook, no direct store
 * access: a journey that seeded itself through a back door would prove nothing
 * about the door the owner actually walks through.
 */
export async function importBackup(app: PracticeApp, name: string, json: string): Promise<void> {
  const { page } = app;
  await openSettings(app);
  await page.getByLabel('Import backup file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(json, 'utf8'),
  });
  await page.getByText(/Imported \(|Import failed:/).waitFor({ timeout: 20_000 });
}

/**
 * Reach Settings the way the owner does — More → Settings. The practice
 * screens hide the tab bar (they are the one place the app asks for undivided
 * attention), so from one of those this takes the route directly instead of
 * waiting forever for a nav that is deliberately not there.
 */
export async function openSettings(app: PracticeApp): Promise<void> {
  const { page } = app;
  if (await page.getByRole('navigation', { name: 'Primary' }).isVisible()) {
    await page.getByRole('link', { name: 'More' }).click();
    // "Settings" also names a link inside Settings' own copy once the page is
    // open, so take the one on the More menu — the first in the document.
    await page.getByRole('link', { name: 'Settings' }).first().click();
  } else {
    await goTo(app, '/settings');
  }
  await page.getByLabel('Import backup file').waitFor({ state: 'attached', timeout: 20_000 });
}

/** The message the Settings import flashed — "Imported (1 file)." or a refusal. */
export async function importOutcome(app: PracticeApp): Promise<string> {
  return (await app.page.getByText(/Imported \(|Import failed:/).first().textContent()) ?? '';
}

/**
 * Go to a route the way the owner does, then wait for the app to settle.
 *
 * The practice screens (`/active`, `/close`, `/routine/…`) deliberately hide
 * the tab bar — they are the one place the app asks for undivided attention —
 * so those routes wait on their own first control instead.
 */
const FOCUSED_ROUTES = /^\/(active|close|routine)/;

export async function goTo(app: PracticeApp, hashPath: string): Promise<void> {
  await app.settleSync();
  await app.page.goto(`${app.origin}#${hashPath}`.replace('##', '#'));
  if (FOCUSED_ROUTES.test(hashPath)) {
    await app.page.locator('main').waitFor({ timeout: 20_000 });
    await app.page.waitForFunction(() => (document.querySelector('main')?.textContent ?? '').length > 0);
    return;
  }
  await app.page.getByRole('navigation', { name: 'Primary' }).waitFor();
}

/** Reload, proving a claim survived in IndexedDB rather than in React state. */
export async function reload(app: PracticeApp): Promise<void> {
  // The store persists to IndexedDB asynchronously (that is the whole reason
  // App gates render on `hydrated`), so a reload fired in the same tick as the
  // click can outrun the write. This wait is about the storage platform, not
  // about the app: it is real wall-clock time in Node, unaffected by the
  // page's faked clock.
  await app.page.waitForTimeout(400);
  await app.settleSync();
  await app.page.reload();
  await app.page.locator('main, nav[aria-label="Primary"]').first().waitFor({ timeout: 20_000 });
}

const KV_KEY = 'practice-compass';

/**
 * Read the raw bytes the app's own persist middleware would read on the next
 * open — straight out of IndexedDB's `kv` store, not a JSON export shaped for
 * the Settings importer. `{ state, version }` is exactly the shape Zustand's
 * persist middleware writes and reads (`middleware.mjs`'s `setItem`/`hydrate`).
 */
export async function readPersistedState(app: PracticeApp): Promise<{ state: unknown; version: number }> {
  return app.page.evaluate(
    (key) =>
      new Promise<{ state: unknown; version: number }>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readonly');
          const get = tx.objectStore('kv').get(key);
          get.onsuccess = () => {
            db.close();
            resolve(JSON.parse((get.result as { value: string }).value));
          };
          get.onerror = () => reject(get.error);
        };
      }),
    KV_KEY,
  );
}

/**
 * Write directly into the app's own IndexedDB `kv` store — the way an
 * ALREADY-hydrated device holds its persisted state — bypassing every
 * import/migration door entirely. The one way to reach the "persisted
 * version already matches the current schema" hydration path: Zustand's
 * persist middleware only calls `migrate` when the persisted version differs
 * from the current one, and every JSON-import door runs `validateDB`
 * regardless of what version a FILE claims.
 */
export async function writePersistedState(app: PracticeApp, state: unknown, version: number): Promise<void> {
  await app.page.evaluate(
    ({ key, state, version }) =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').put({ key, value: JSON.stringify({ state, version }) });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { key: KV_KEY, state, version },
  );
}

/**
 * Export a full backup through the REAL Settings control and return its text.
 * Same button the owner presses, same file the browser would save — the point
 * of a rollback test is the artefact the app actually produces, not one a test
 * rebuilt from the store.
 */
export async function exportBackup(app: PracticeApp): Promise<string> {
  const { page } = app;
  await openSettings(app);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.getByRole('button', { name: /Export backup/ }).click(),
  ]);
  const path = await download.path();
  return readFile(path, 'utf8');
}

/**
 * Wait until the app's OWN persisted bytes satisfy a predicate — a real
 * IndexedDB acknowledgement of a write, never a sleep. A timeout fails with
 * the state actually found, so a slow write and a missing write look different.
 */
export async function persistedUntil<T>(
  app: PracticeApp,
  read: (state: { state: unknown; version: number }) => T,
  predicate: (value: T) => boolean,
  timeoutMs = 10_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T | undefined;
  for (;;) {
    last = read(await readPersistedState(app));
    if (predicate(last)) return last;
    if (Date.now() > deadline) {
      throw new Error(`Persisted state never satisfied the check. Last value: ${JSON.stringify(last)}`);
    }
    await app.page.waitForTimeout(50);
  }
}

/** The database as the app has actually PERSISTED it, not as it is rendering it. */
export async function persistedDb(app: PracticeApp): Promise<{
  items: Record<string, unknown>[];
  blocks: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  lessonAgenda: Record<string, unknown>[];
  schemaVersion: number;
}> {
  const { state } = await readPersistedState(app);
  return (state as { db: never }).db;
}

// ---------------------------------------------------------------------------
// A GitHub data repo that lives in this test process.
//
// It is installed at the REAL transport boundary — the `fetch` calls
// `gitRemote.ts` makes to api.github.com — so everything above it runs for
// real: `syncNow`, `resolveConflict`, `runSync`, `decideSync`, the pre-sync
// archive, and `importFullBackup`'s own guards. Nothing in the app is stubbed
// or bypassed, and no request ever leaves the machine.
// ---------------------------------------------------------------------------

export interface FakeRemote {
  /** The snapshot the repo currently holds, or null for an empty repo. */
  snapshot: { stateText: string; hash: string; rev: number; deviceName?: string; savedAt: string } | null;
  /** Every ref this repo has, so an archive branch is observable. */
  refs: string[];
  /** How many times each endpoint was called, so "it really went there" is checkable. */
  calls: string[];
  /**
   * The published Setar source index — the ONE file on the source-index
   * branch that the NAS scanner writes and the app only ever GETs. Null until
   * something publishes it.
   */
  sourceIndex: { text: string; commit: string } | null;
}

export function newFakeRemote(): FakeRemote {
  return { snapshot: null, refs: [], calls: [], sourceIndex: null };
}

/** Put a snapshot in the repo as if another device had pushed it. */
export function publishRemote(remote: FakeRemote, stateText: string, hash: string, rev: number, deviceName = 'the other device'): void {
  remote.snapshot = { stateText, hash, rev, deviceName, savedAt: new Date().toISOString() };
  if (!remote.refs.includes('main')) remote.refs.push('main');
}

/**
 * Re-stamp an index with the digest the SCANNER would have written for it.
 *
 * The app recomputes this digest at its reader boundary and refuses an index
 * whose content and hash disagree, so a journey that edits a fixture index must
 * publish a genuinely re-scanned one — exactly what the NAS publisher does.
 * ONE implementation, here beside `publishSourceIndex`, so no journey can
 * quietly hand-edit a hash instead.
 */
export async function stampSourceIndex(index: Record<string, unknown>): Promise<string> {
  const body = { ...index };
  delete body.contentHash;
  delete body.generatedAt;
  const sorted = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sorted);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(value as Record<string, unknown>).sort()) {
        const v = (value as Record<string, unknown>)[k];
        if (v !== undefined) out[k] = sorted(v);
      }
      return out;
    }
    return value;
  };
  const bytes = new TextEncoder().encode(JSON.stringify(sorted(body)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const contentHash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return JSON.stringify({ ...index, contentHash });
}

/** Put a source index on the source-index branch, as the NAS publisher would. */
export function publishSourceIndex(remote: FakeRemote, text: string, commit = 'source-index-commit-1'): void {
  remote.sourceIndex = { text, commit };
  if (!remote.refs.includes('source-index')) remote.refs.push('source-index');
}

export async function installFakeGitHub(page: Page, remote: FakeRemote): Promise<void> {
  let headCounter = 0;
  const blobs = new Map<string, string>();
  await page.route('https://api.github.com/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    // /repos/<owner>/<name>/<rest…>
    const rest = url.pathname.split('/').slice(4).join('/');
    const method = req.method();
    remote.calls.push(`${method} ${rest}`);
    // A FULFILLED response is still subject to the browser's own CORS check.
    // Chromium lets a routed cross-origin request through; WebKit does not, and
    // an unadorned reply surfaces as "Fetch API cannot load … due to access
    // control checks" — a harness artefact that looks exactly like an app bug.
    // The real api.github.com sends these headers, so sending them here is the
    // fake behaving like the thing it stands in for.
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept,X-GitHub-Api-Version',
    };
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS, body: '' });
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });
    const raw = (body: string) => route.fulfill({ status: 200, contentType: 'text/plain', headers: CORS, body });
    const head = () => `head-${headCounter}`;

    // The source index: a branch ref, then the file AT THAT COMMIT. Reading
    // the file "on the branch" instead would be a second, later state.
    if (method === 'GET' && rest === 'git/ref/heads/source-index') {
      if (!remote.sourceIndex) return json({}, 404);
      return json({ object: { sha: remote.sourceIndex.commit } });
    }
    if (method === 'GET' && rest.startsWith('contents/setar/index.json')) {
      const ref = url.searchParams.get('ref');
      if (!remote.sourceIndex || ref !== remote.sourceIndex.commit) return json({}, 404);
      return json({
        content: Buffer.from(remote.sourceIndex.text, 'utf8').toString('base64'),
        encoding: 'base64',
        size: remote.sourceIndex.text.length,
      });
    }
    // A BRANCH EXISTING AND A SNAPSHOT EXISTING ARE TWO DIFFERENT FACTS, and
    // reading the first off the second is what made this fake behave unlike
    // GitHub. `initialize()` bootstraps an empty repo with a Contents-API
    // `PUT contents/README.md`, after which real GitHub resolves
    // `git/ref/heads/main` — the branch is there; only `manifest.json` and
    // `state.json` are still absent. This route answered 404 until a SNAPSHOT
    // existed, so `getHead()` kept returning null and EVERY later sync
    // re-entered `initialize()` and issued another README PUT. Each journey
    // navigation is a full document load that re-triggers the app's on-open
    // sync, so those extra PUTs were repeatedly issued into a document
    // `page.goto` was tearing down — the measured amplifier behind the
    // intermittent WebKit access-control page error in the archive journey.
    //
    // Gating on the REF alone fixes that without touching what `decideSync`
    // sees: the manifest and state routes below still 404 until something
    // publishes a snapshot, so `readRemoteMeta` still returns null, the
    // decision is still `first-push`, and the pull/conflict journeys are
    // unchanged. Making the fake REMEMBER the pushed snapshot would change
    // that decision, which is why it is deliberately not done here.
    if (method === 'GET' && rest === 'git/ref/heads/main') {
      if (!remote.refs.includes('main')) return json({}, 404);
      return json({ object: { sha: head() } });
    }
    if (method === 'GET' && rest.startsWith('contents/manifest.json')) {
      if (!remote.snapshot) return json({}, 404);
      return raw(
        JSON.stringify({
          formatVersion: 2,
          hash: remote.snapshot.hash,
          rev: remote.snapshot.rev,
          deviceName: remote.snapshot.deviceName,
          savedAt: remote.snapshot.savedAt,
          attachments: [],
        }),
      );
    }
    if (method === 'GET' && rest.startsWith('contents/state.json')) {
      if (!remote.snapshot) return json({}, 404);
      return raw(remote.snapshot.stateText);
    }
    if (method === 'GET' && rest.startsWith('contents/files')) return json([]);
    if (method === 'GET' && rest.startsWith('git/blobs/')) {
      return json({ content: blobs.get(rest.slice('git/blobs/'.length)) ?? '' });
    }
    if (method === 'PUT' && rest.startsWith('contents/README.md')) {
      headCounter += 1;
      if (!remote.refs.includes('main')) remote.refs.push('main');
      return json({ commit: { sha: head() } });
    }
    if (method === 'POST' && rest === 'git/blobs') {
      const body = req.postDataJSON() as { content: string };
      const sha = `blob-${blobs.size}`;
      blobs.set(sha, body.content);
      return json({ sha });
    }
    if (method === 'POST' && rest === 'git/trees') return json({ sha: 'tree-1' });
    if (method === 'POST' && rest === 'git/commits') {
      headCounter += 1;
      return json({ sha: head() });
    }
    if (method === 'POST' && rest === 'git/refs') {
      const body = req.postDataJSON() as { ref: string };
      remote.refs.push(body.ref.replace('refs/heads/', ''));
      return json({});
    }
    if (method === 'PATCH' && rest === 'git/refs/heads/main') return json({});
    return json({ message: 'not routed' }, 404);
  });
}

/**
 * Wrap a database in the shape `state.json` holds: a full backup with NO file
 * payloads (attachments travel as separate git blobs).
 */
export function remoteStateText(db: unknown, deviceName = 'the other device'): string {
  return JSON.stringify({
    app: 'practice-compass',
    schemaVersion: (db as { schemaVersion?: number }).schemaVersion ?? 13,
    exportedAt: new Date().toISOString(),
    deviceName,
    data: db,
    files: [],
  });
}

/** Connect sync through the REAL Settings form and run the first sync. */
export async function connectSync(app: PracticeApp): Promise<void> {
  const { page } = app;
  await goTo(app, '/settings');
  // The sync form's fields sit inside a labelled group rather than carrying
  // their own accessible names. That is pre-existing Settings markup this lane
  // is explicitly not reshaping, so this reaches them the way they actually
  // are rather than pretending otherwise.
  await page.getByRole('group', { name: 'Repository' }).locator('input').fill('owner/practice-data');
  await page.getByRole('group', { name: 'Access token' }).locator('input').fill('github_pat_fake');
  await page.getByRole('button', { name: 'Connect & sync' }).click();
  await page.getByRole('button', { name: 'Sync now' }).waitFor({ timeout: 20_000 });
}

/** The sync section's own status line, whatever it currently says. */
export async function syncMessage(page: Page): Promise<string> {
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}
