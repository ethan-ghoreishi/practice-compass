import { readFile } from 'node:fs/promises';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, webkit, type Browser, type BrowserContext, type BrowserType, type Page } from 'playwright';

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

export interface PracticeApp {
  page: Page;
  /** The dev server origin this journey is isolated on. */
  origin: string;
  /** Which engine this journey is actually running in. */
  engine: Engine;
  /** Uncaught page errors, so a broken render cannot pass as a quiet one. */
  pageErrors: Error[];
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
  const server: ViteDevServer = await createServer({
    ...(options.root ? { root: options.root, configFile: `${options.root}/vite.config.ts` } : { configFile: 'vite.config.ts' }),
    logLevel: 'error',
    server: { port: 0, strictPort: false },
  });
  await server.listen();
  const origin = server.resolvedUrls?.local[0];
  if (!origin) {
    await server.close();
    throw new Error('The dev server started but reported no local URL.');
  }

  let browser: Browser;
  try {
    browser = await ENGINES[engine].launch();
  } catch (e) {
    await server.close();
    throw new Error(installHint(engine), { cause: e });
  }

  let context: BrowserContext;
  let page: Page;
  const pageErrors: Error[] = [];
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
    // Surface a page-level error instead of letting it become a silently
    // wrong assertion later.
    page.on('pageerror', (e) => pageErrors.push(e));
    await page.clock.install({ time: options.now });
    await page.goto(origin);
    // The store hydrates from IndexedDB before anything renders.
    await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });
  } catch (e) {
    await browser.close();
    await server.close();
    throw e;
  }

  return {
    page,
    origin,
    engine,
    pageErrors,
    async close() {
      await browser.close();
      await server.close();
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
