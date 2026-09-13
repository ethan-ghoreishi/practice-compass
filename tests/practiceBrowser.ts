import { createServer, type ViteDevServer } from 'vite';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

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

const INSTALL_HINT =
  'The Playwright browser is not installed. Run `npx playwright install chromium` ' +
  '(CI does this before `npm test`). This check never skips: an unverified journey is not a passing one.';

export interface PracticeApp {
  page: Page;
  /** The dev server origin this journey is isolated on. */
  origin: string;
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
export async function openPracticeApp(options: { now: Date; viewport?: { width: number; height: number } }): Promise<PracticeApp> {
  const server: ViteDevServer = await createServer({
    configFile: 'vite.config.ts',
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
    browser = await chromium.launch();
  } catch (e) {
    await server.close();
    throw new Error(INSTALL_HINT, { cause: e });
  }

  let context: BrowserContext;
  let page: Page;
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
  await page.getByRole('link', { name: 'More' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByLabel('Import backup file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(json, 'utf8'),
  });
  await page.getByText(/Imported \(|Import failed:/).waitFor({ timeout: 20_000 });
}

/** The message the Settings import flashed — "Imported (1 file)." or a refusal. */
export async function importOutcome(app: PracticeApp): Promise<string> {
  return (await app.page.getByText(/Imported \(|Import failed:/).first().textContent()) ?? '';
}

/** Go to a route the way the owner does, then wait for the app to settle. */
export async function goTo(app: PracticeApp, hashPath: string): Promise<void> {
  await app.page.goto(`${app.origin}#${hashPath}`.replace('##', '#'));
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
  await app.page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });
}
