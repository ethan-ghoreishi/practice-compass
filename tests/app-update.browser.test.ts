import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type BrowserContext, type Page } from 'playwright';
import { afterAll, describe, expect, it } from 'vitest';
import { openSettings, quietWindow, type Engine, type PracticeApp } from './practiceBrowser';
// @ts-expect-error — no type declarations for the .mjs build module.
import * as stampModule from '../scripts/app-version.mjs';

// ---------------------------------------------------------------------------
// Taking a new version, on REAL production builds served by a local server:
// A and V2 built from this repository with different stamps (the explicit
// override), each served from its own directory, so A's chunks are gone the
// moment V2 is served; V3, a byte-variant of V2's sw.js; and B, built from a
// tree holding ONLY the stamp module's listed inputs, with A's stamp. No
// network beyond localhost; dist/ is never touched.
//
// What this proves: the service-worker lifecycle the app drives, in Chromium
// and WebKit. What it cannot: GitHub Pages' CDN, or the installed iPhone app —
// those are the owner's checks.
// ---------------------------------------------------------------------------

const { BUILD_INPUTS, VERSION_OVERRIDE } = stampModule as { BUILD_INPUTS: string[]; VERSION_OVERRIDE: string };
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASE = '/practice-compass/';
const OFFER = 'A new version is ready.';
const ENGINES = { chromium, webkit };
const temps: string[] = [];

function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temps.push(dir);
  return dir;
}

/**
 * The environment `npm run build` sees on CI — never this test runner's. Vitest
 * sets NODE_ENV=test, and a build inheriting it compiles JSX with the
 * DEVELOPMENT runtime, which bakes each source file's absolute path into the
 * output: two trees could then never build alike.
 */
function productionEnv(stamp: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: 'production', [VERSION_OVERRIDE]: stamp };
  for (const key of Object.keys(env)) if (key.startsWith('VITEST') || key === 'TEST') delete env[key];
  return env;
}

function viteBuild(root: string, stamp: string): string {
  const out = tempDir('pc-build-');
  execFileSync(process.execPath, [join(ROOT, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', out, '--emptyOutDir', '--logLevel', 'error'], {
    cwd: root,
    env: productionEnv(stamp),
    stdio: 'pipe',
  });
  return out;
}

/** Every file under `dir`, relative, sorted. */
function filesIn(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(dir, p));
    }
  };
  walk(dir);
  return out.sort();
}

interface Builds {
  A: string;
  V2: string;
  V3: string;
  B: string;
}
let built: Builds | null = null;
/** The builds both checks share, made once. */
function builds(): Builds {
  if (built) return built;
  const A = viteBuild(ROOT, 'stamp-A');
  const V2 = viteBuild(ROOT, 'stamp-V2');
  // V3: the same app as V2, its worker script a different byte sequence.
  const V3 = tempDir('pc-build-v3-');
  cpSync(V2, V3, { recursive: true });
  writeFileSync(join(V3, 'sw.js'), `${readFileSync(join(V2, 'sw.js'), 'utf8')}\n// V3\n`);
  // B: a tree holding only what the stamp module says the build reads.
  const tree = tempDir('pc-inputs-');
  for (const spec of BUILD_INPUTS) {
    const names = spec.includes('*') ? readdirSync(ROOT).filter((n) => new RegExp(`^${spec.replace('.', '\\.').replace('*', '.*')}$`).test(n)) : [spec];
    for (const name of names) cpSync(join(ROOT, name), join(tree, name), { recursive: true });
  }
  symlinkSync(join(ROOT, 'node_modules'), join(tree, 'node_modules'), 'dir');
  const B = viteBuild(tree, 'stamp-A');
  built = { A, V2, V3, B };
  return built;
}

const entryOf = (dir: string) => /src="[^"]*\/(assets\/index-[^"]+\.js)"/.exec(readFileSync(join(dir, 'index.html'), 'utf8'))![1];

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/** A static host for one build directory at a time, like Pages after a deploy. */
interface Host {
  origin: string;
  serve(dir: string): void;
  /** Hold the next sw.js request until `release()`; resolves when it arrives. */
  holdWorker(): { arrived: Promise<void>; release: () => void };
  close(): Promise<void>;
}

async function host(dir: string): Promise<Host> {
  let current = dir;
  let hold: { arrive: () => void; released: Promise<void> } | null = null;
  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const respond = () => {
      if (!url.pathname.startsWith(BASE)) {
        res.writeHead(404).end();
        return;
      }
      const rel = url.pathname.slice(BASE.length) || 'index.html';
      const file = join(current, rel);
      let body: Buffer;
      try {
        body = readFileSync(file);
      } catch {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(body);
    };
    if (url.pathname === `${BASE}sw.js` && hold) {
      const h = hold;
      hold = null;
      h.arrive();
      void h.released.then(respond);
      return;
    }
    respond();
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const port = (server.address() as { port: number }).port;
  return {
    origin: `http://127.0.0.1:${port}`,
    serve(d) {
      current = d;
    },
    holdWorker() {
      let arrive!: () => void;
      let release!: () => void;
      const arrived = new Promise<void>((r) => (arrive = r));
      const released = new Promise<void>((r) => (release = r));
      hold = { arrive, released };
      return { arrived, release };
    },
    close: () => new Promise<void>((done) => server.close(() => done())),
  };
}

/** One window of the app, counting its document loads and keeping its page errors. */
interface Win {
  page: Page;
  loads: () => number;
  errors: Error[];
  app: PracticeApp;
}

async function openWindow(context: BrowserContext, h: Host, route = ''): Promise<Win> {
  const page = await context.newPage();
  let loads = 0;
  const errors: Error[] = [];
  page.on('pageerror', (e) => errors.push(e));
  await page.goto(`${h.origin}${BASE}${route}`);
  await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 30_000 });
  page.on('load', () => (loads += 1));
  return { page, loads: () => loads, errors, app: { page } as PracticeApp };
}

/** Wait for this page's registration to have an active worker. */
const untilActive = (w: Win) => w.page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
/** Wait until a worker sits waiting in this page's registration. */
const untilWaiting = (w: Win) =>
  w.page.evaluate(
    () =>
      new Promise<boolean>((resolveWaiting) => {
        void navigator.serviceWorker.getRegistration().then((reg) => {
          if (!reg) return;
          const watch = (worker: ServiceWorker | null) =>
            worker?.addEventListener('statechange', () => {
              if (worker.state === 'installed') resolveWaiting(true);
            });
          if (reg.waiting) resolveWaiting(true);
          watch(reg.installing);
          reg.addEventListener('updatefound', () => watch(reg.installing));
        });
      }),
  );
/** The app's own foreground check, as returning to the window makes it. */
const foreground = (w: Win) => w.page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
/** Is this page controlled, and which build does it run? */
const runs = (w: Win) =>
  w.page.evaluate(() => ({
    controlled: !!navigator.serviceWorker.controller,
    entry: /assets\/index-[^"]+\.js/.exec(document.querySelector('script[type="module"][src]')?.getAttribute('src') ?? '')?.[0] ?? '',
  }));
/** Tap Reload — `times` taps in one burst, as fast as a finger — and wait for the window's reload to land. */
async function tapReload(w: Win, times = 1): Promise<void> {
  await w.page.getByRole('button', { name: 'Reload' }).waitFor();
  const loaded = w.page.waitForEvent('load', { timeout: 30_000 });
  await w.page.evaluate((n) => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent === 'Reload')!;
    for (let i = 0; i < n; i += 1) button.click();
  }, times);
  await loaded;
  await w.page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 30_000 });
}

async function withBrowser(engine: Engine, run: (browser: Browser) => Promise<void>): Promise<void> {
  const browser = await ENGINES[engine].launch();
  try {
    await run(browser);
  } finally {
    await browser.close();
  }
}

afterAll(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

describe('taking a new version', () => {
  it('a published update installs on the first reload in both engines without loops or surprise reloads', async () => {
    const b = builds();
    const [entryA, entryV2] = [entryOf(b.A), entryOf(b.V2)];
    expect(entryA).not.toBe(entryV2);
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      await withBrowser(engine, async (browser) => {
        const h = await host(b.A);
        const fresh = () => browser.newContext({ viewport: { width: 390, height: 844 } });
        try {
          // --- (A) UNCONTROLLED: its own first install is no offer; V2 found late is
          let ctx = await fresh();
          let w = await openWindow(ctx, h);
          await untilActive(w);
          expect(await runs(w)).toEqual({ controlled: false, entry: entryA });
          await quietWindow(w.app, 1_500);
          expect(await w.page.getByText(OFFER).count(), `${engine} A: first install`).toBe(0);
          h.serve(b.V2);
          await foreground(w);
          await untilWaiting(w);
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          await tapReload(w, 3);
          expect(await runs(w), `${engine} A: late`).toEqual({ controlled: true, entry: entryV2 });
          await quietWindow(w.app, 1_500);
          expect(w.loads(), `${engine} A: one reload`).toBe(1);
          expect(await w.page.getByText(OFFER).count(), `${engine} A: nothing left to offer`).toBe(0);
          expect(w.errors.map((e) => e.message)).toEqual([]);
          await ctx.close();

          // …and V2 found EARLY: the page runs A, but V2 is the first worker it installs.
          h.serve(b.A);
          ctx = await fresh();
          const held = h.holdWorker();
          const page = await ctx.newPage();
          const errors: Error[] = [];
          page.on('pageerror', (e) => errors.push(e));
          await page.goto(`${h.origin}${BASE}`);
          await held.arrived;
          h.serve(b.V2);
          held.release();
          await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 30_000 });
          let loads = 0;
          page.on('load', () => (loads += 1));
          w = { page, loads: () => loads, errors, app: { page } as PracticeApp };
          await untilActive(w);
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          expect(await runs(w), `${engine} A: early`).toEqual({ controlled: false, entry: entryA });
          await tapReload(w);
          expect(await runs(w), `${engine} A: early lands on V2`).toEqual({ controlled: true, entry: entryV2 });
          await quietWindow(w.app, 1_500);
          expect(w.loads(), `${engine} A: early, one reload`).toBe(1);
          expect(await w.page.getByText(OFFER).count(), `${engine} A: early, nothing left`).toBe(0);
          expect(w.errors.map((e) => e.message)).toEqual([]);
          await ctx.close();

          // --- (B) CONTROLLED, then (E) the same build served across foreground checks
          h.serve(b.A);
          ctx = await fresh();
          w = await openWindow(ctx, h);
          await untilActive(w);
          await w.page.reload();
          await w.page.getByRole('navigation', { name: 'Primary' }).waitFor();
          expect(await runs(w)).toEqual({ controlled: true, entry: entryA });
          h.serve(b.V2);
          await foreground(w);
          await untilWaiting(w);
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          const beforeTap = w.loads();
          await tapReload(w, 3);
          expect(await runs(w), `${engine} B`).toEqual({ controlled: true, entry: entryV2 });
          // The stamp Settings names is the new build's.
          await openSettings(w.app);
          await w.page.getByText('build stamp-V2').waitFor({ timeout: 20_000 });
          await w.page.getByRole('link', { name: 'Today' }).click();
          await foreground(w);
          await foreground(w);
          await foreground(w);
          await quietWindow(w.app, 2_000);
          expect(w.loads() - beforeTap, `${engine} E: reloads`).toBe(1);
          expect(await w.page.getByText(OFFER).count(), `${engine} E: no offer`).toBe(0);
          expect(w.errors.map((e) => e.message)).toEqual([]);
          await ctx.close();

          // --- (C) TWO WINDOWS: one tap reloads only its own window
          h.serve(b.A);
          ctx = await fresh();
          const one = await openWindow(ctx, h);
          await untilActive(one);
          await one.page.reload();
          await one.page.getByRole('navigation', { name: 'Primary' }).waitFor();
          const two = await openWindow(ctx, h);
          expect((await runs(two)).controlled).toBe(true);
          const [oneLoads, twoLoads] = [one.loads(), two.loads()];
          h.serve(b.V2);
          await foreground(one);
          await untilWaiting(one);
          await one.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          await two.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          await tapReload(one);
          expect(await runs(one)).toEqual({ controlled: true, entry: entryV2 });
          await quietWindow(two.app, 2_000);
          // The other window did NOT reload; it still runs A and still offers V2.
          expect([one.loads() - oneLoads, two.loads() - twoLoads], `${engine} C: reloads`).toEqual([1, 0]);
          expect((await runs(two)).entry).toBe(entryA);
          await two.page.getByText(OFFER).waitFor();
          // A route whose A code is gone (More, never loaded in this window): the
          // offer in its place, no page error, no reload.
          await two.page.getByRole('link', { name: 'More' }).click();
          await two.page.locator('a.tab.active', { hasText: 'More' }).waitFor();
          await two.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          await quietWindow(two.app, 1_500);
          expect(await two.page.getByRole('heading', { name: 'More', exact: true }).count(), `${engine} C: missing route`).toBe(0);
          expect([two.loads() - twoLoads, two.errors.map((e) => e.message)]).toEqual([0, []]);
          // Its own tap lands it on V2, at that route.
          await tapReload(two);
          await two.page.getByRole('heading', { name: 'More', exact: true }).waitFor({ timeout: 20_000 });
          expect(await runs(two)).toEqual({ controlled: true, entry: entryV2 });
          expect([two.loads() - twoLoads, one.errors.map((e) => e.message), two.errors.map((e) => e.message)]).toEqual([1, [], []]);
          await ctx.close();

          // --- (D) V3 supersedes a waiting V2: the tap lands on V3
          h.serve(b.A);
          ctx = await fresh();
          w = await openWindow(ctx, h);
          await untilActive(w);
          await w.page.reload();
          await w.page.getByRole('navigation', { name: 'Primary' }).waitFor();
          h.serve(b.V2);
          await foreground(w);
          await untilWaiting(w);
          // Mark the waiting V2 so its fate can be read back.
          await w.page.evaluate(() =>
            navigator.serviceWorker.getRegistration().then((reg) => {
              const v2 = reg!.waiting!;
              (window as unknown as { __v2: ServiceWorker }).__v2 = v2;
            }),
          );
          const superseded = w.page.evaluate(
            () =>
              new Promise<string>((done) => {
                const v2 = (window as unknown as { __v2: ServiceWorker }).__v2;
                v2.addEventListener('statechange', () => {
                  if (v2.state === 'redundant') done(v2.state);
                });
              }),
          );
          h.serve(b.V3);
          await foreground(w);
          expect(await superseded).toBe('redundant');
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          const loadsBeforeD = w.loads();
          await tapReload(w);
          // Controlled by the worker that superseded V2 — V3 — and nothing left to offer.
          const after = await w.page.evaluate(() =>
            navigator.serviceWorker.getRegistration().then((reg) => ({ waiting: !!reg?.waiting, controlled: !!navigator.serviceWorker.controller })),
          );
          expect(after).toEqual({ waiting: false, controlled: true });
          await quietWindow(w.app, 1_500);
          expect(w.loads() - loadsBeforeD, `${engine} D: reloads`).toBe(1);
          expect(await w.page.getByText(OFFER).count(), `${engine} D: no offer`).toBe(0);
          await ctx.close();

          // --- (F) on /close the offer waits until Save or Discard
          h.serve(b.A);
          ctx = await fresh();
          w = await openWindow(ctx, h);
          await untilActive(w);
          await w.page.reload();
          await w.page.getByRole('navigation', { name: 'Primary' }).waitFor();
          const loadsBeforeF = w.loads();
          await w.page.getByRole('navigation', { name: /Which instrument/ }).getByRole('button', { name: 'Setar', exact: true }).click();
          await w.page.getByRole('button', { name: /Start · 10 min/ }).click();
          await w.page.getByRole('button', { name: 'Finish' }).click();
          await w.page.getByRole('button', { name: 'Discard without saving' }).waitFor();
          h.serve(b.V2);
          await foreground(w);
          await untilWaiting(w);
          await quietWindow(w.app, 1_500);
          expect(await w.page.getByText(OFFER).count(), `${engine} F: waits on /close`).toBe(0);
          await w.page.getByRole('button', { name: 'Discard without saving' }).click();
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          expect([w.loads() - loadsBeforeF, w.errors.map((e) => e.message)]).toEqual([0, []]);
          await ctx.close();

          // …and when ANOTHER route's code is gone. An uncontrolled window
          // fetches its code from the server: it practises once under A (the
          // practice and close screens' code now loaded), then V2 is served.
          // More's code is gone — the offer in its place — yet the close
          // screen still runs, so on /close the offer waits all the same.
          h.serve(b.A);
          ctx = await fresh();
          w = await openWindow(ctx, h);
          await untilActive(w);
          expect((await runs(w)).controlled, `${engine} F: uncontrolled`).toBe(false);
          const loadsBeforeF2 = w.loads();
          const practiseToClose = async () => {
            await w.page.getByRole('navigation', { name: /Which instrument/ }).getByRole('button', { name: 'Setar', exact: true }).click();
            await w.page.getByRole('button', { name: /Start · 10 min/ }).click();
            await w.page.getByRole('button', { name: 'Finish' }).click();
            await w.page.getByRole('button', { name: 'Discard without saving' }).waitFor();
          };
          await practiseToClose();
          await w.page.getByRole('button', { name: 'Discard without saving' }).click();
          await w.page.getByRole('navigation', { name: 'Primary' }).waitFor();
          h.serve(b.V2);
          await w.page.getByRole('link', { name: 'More' }).click();
          await w.page.locator('a.tab.active', { hasText: 'More' }).waitFor();
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          await w.page.getByRole('link', { name: 'Today' }).click();
          await w.page.locator('a.tab.active', { hasText: 'Today' }).waitFor();
          await practiseToClose();
          await quietWindow(w.app, 1_500);
          expect(await w.page.getByText(OFFER).count(), `${engine} F: another route's code over /close`).toBe(0);
          await w.page.getByRole('button', { name: 'Discard without saving' }).click();
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          expect([w.loads() - loadsBeforeF2, w.errors.map((e) => e.message)]).toEqual([0, []]);
          await ctx.close();

          // The close screen's OWN code gone (practice started under A, V2
          // served before Finish): the offer stands in for it, no page error.
          h.serve(b.A);
          ctx = await fresh();
          w = await openWindow(ctx, h);
          await untilActive(w);
          const loadsBeforeF3 = w.loads();
          await w.page.getByRole('navigation', { name: /Which instrument/ }).getByRole('button', { name: 'Setar', exact: true }).click();
          await w.page.getByRole('button', { name: /Start · 10 min/ }).click();
          await w.page.getByRole('button', { name: 'Finish' }).waitFor();
          h.serve(b.V2);
          await w.page.getByRole('button', { name: 'Finish' }).click();
          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
          await quietWindow(w.app, 1_500);
          expect(await w.page.getByRole('button', { name: 'Discard without saving' }).count(), `${engine} F: close code gone`).toBe(0);
          expect([w.loads() - loadsBeforeF3, w.errors.map((e) => e.message)]).toEqual([0, []]);
          await ctx.close();
        } finally {
          await h.close();
        }
      });
    }
  }, 900_000);

  it('an unchanged app rebuilds byte for byte and offers no update', async () => {
    const b = builds();
    // B — only the listed inputs, A's stamp — equals A, every file, sw.js and its manifest included.
    const files = filesIn(b.A);
    expect(filesIn(b.B)).toEqual(files);
    expect(files).toContain('sw.js');
    expect(files.filter((f) => !readFileSync(join(b.A, f)).equals(readFileSync(join(b.B, f))))).toEqual([]);
    // A different stamp is a different worker.
    expect(readFileSync(join(b.V2, 'sw.js')).equals(readFileSync(join(b.A, 'sw.js')))).toBe(false);

    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      await withBrowser(engine, async (browser) => {
        const h = await host(b.A);
        try {
          const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
          const w = await openWindow(ctx, h);
          await untilActive(w);
          await w.page.reload();
          await w.page.getByRole('navigation', { name: 'Primary' }).waitFor();
          const before = w.loads();
          await w.page.evaluate(() =>
            navigator.serviceWorker.getRegistration().then((reg) => {
              (window as unknown as { __found: number }).__found = 0;
              reg!.addEventListener('updatefound', () => ((window as unknown as { __found: number }).__found += 1));
            }),
          );
          h.serve(b.B);
          // Each check really asks: the registration's own update() settles each time.
          const check = async () => {
            await foreground(w);
            await w.page.evaluate(() => navigator.serviceWorker.getRegistration().then((reg) => reg!.update()));
          };
          await check();
          await check();
          await check();
          await quietWindow(w.app, 1_500);
          expect(await w.page.evaluate(() => (window as unknown as { __found: number }).__found), `${engine}: no update found`).toBe(0);
          expect(await w.page.getByText(OFFER).count(), `${engine}: no offer`).toBe(0);
          expect([w.loads() - before, w.errors.map((e) => e.message)], engine).toEqual([0, []]);
          await ctx.close();
        } finally {
          await h.close();
        }
      });
    }
  }, 900_000);
});
