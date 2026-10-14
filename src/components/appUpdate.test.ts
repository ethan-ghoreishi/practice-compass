import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// The update controller against a fake service-worker container: workers
// install, wait, activate (by this window's tap, another window's, or as a
// first install), get superseded, and a route's code goes missing. `fetch`
// answers with the server's current sw.js, which precaches that build's entry
// chunk — the identity an uncontrolled page checks — and its index.html, which
// names that entry: the evidence that a route's failed code was an update's.
// ---------------------------------------------------------------------------

type Build = string;
const indexHtml = (b: Build) => `<!doctype html><script type="module" crossorigin src="/assets/index-${b}.js"></script>`;
const swText = (b: Build) => `define(["./workbox"],function(s){s.precacheAndRoute([{url:"index.html",revision:"${b}"},{url:"assets/index-${b}.js",revision:null}])});`;

class FakeWorker extends EventTarget {
  state = 'installing';
  readonly scriptURL = 'https://app.test/sw.js';
  readonly posted: unknown[] = [];
  readonly build: Build;
  private readonly world: World;
  constructor(build: Build, world: World) {
    super();
    this.build = build;
    this.world = world;
  }
  postMessage(message: { type?: string }) {
    this.posted.push(message);
    if (message?.type === 'SKIP_WAITING' && this.world.reg.waiting === this) this.world.activate(this);
  }
  setState(s: string) {
    this.state = s;
    this.dispatchEvent(new Event('statechange'));
  }
}

class World {
  server: Build;
  registerFails = false;
  offline = false;
  fetched = 0;
  reloads = 0;
  listeners = 0;
  intervals = 0;
  reg = Object.assign(new EventTarget(), {
    installing: null as FakeWorker | null,
    waiting: null as FakeWorker | null,
    active: null as FakeWorker | null,
    updates: 0,
    update() {
      this.updates += 1;
      return Promise.resolve();
    },
  });
  container = Object.assign(new EventTarget(), {
    controller: null as FakeWorker | null,
    registered: 0,
    register: () => {
      this.container.registered += 1;
      return this.registerFails ? Promise.reject(new Error('refused')) : Promise.resolve(this.reg);
    },
  });
  readonly page: Build;
  constructor(page: Build) {
    this.page = page;
    this.server = page;
  }
  /** The browser finds `build` on the server and starts installing it. */
  find(build: Build): FakeWorker {
    const w = new FakeWorker(build, this);
    this.server = build;
    this.reg.installing = w;
    this.reg.dispatchEvent(new Event('updatefound'));
    return w;
  }
  /** It finishes installing: it waits behind an active worker (superseding one already waiting), or activates. */
  installed(w: FakeWorker) {
    this.reg.installing = null;
    if (!this.reg.active) return this.activate(w);
    const old = this.reg.waiting;
    this.reg.waiting = w;
    w.setState('installed');
    old?.setState('redundant');
  }
  /** Activation — a SKIP_WAITING, another window's, or a first install. Controlled windows move to it. */
  activate(w: FakeWorker) {
    const old = this.reg.active;
    if (this.reg.waiting === w) this.reg.waiting = null;
    this.reg.active = w;
    w.setState('activated');
    old?.setState('redundant');
    if (this.container.controller) {
      this.container.controller = w;
      this.container.dispatchEvent(new Event('controllerchange'));
    }
  }
}

const flush = async () => {
  for (let i = 0; i < 5; i += 1) await new Promise((r) => setTimeout(r, 0));
};

type Page = Awaited<ReturnType<typeof openPage>>;

/** A fresh page running `world.page`'s code, loaded under `controller` (or none). */
async function openPage(world: World, opts: { controller?: FakeWorker | null; production?: boolean; noServiceWorker?: boolean } = {}) {
  vi.resetModules();
  world.container.controller = opts.controller ?? null;
  const counted = <T extends EventTarget>(t: T): T => {
    const add = t.addEventListener.bind(t);
    t.addEventListener = ((type: string, fn: EventListenerOrEventListenerObject | null, o?: AddEventListenerOptions | boolean) => {
      world.listeners += 1;
      add(type, fn, o);
    }) as T['addEventListener'];
    return t;
  };
  const doc = counted(new EventTarget());
  const win = counted(new EventTarget());
  counted(world.container);
  counted(world.reg);
  vi.stubGlobal('navigator', opts.noServiceWorker ? {} : { serviceWorker: world.container });
  vi.stubGlobal('window', win);
  vi.stubGlobal(
    'document',
    Object.assign(doc, { visibilityState: 'visible', querySelector: () => ({ getAttribute: () => `/assets/index-${world.page}.js` }) }),
  );
  vi.stubGlobal('location', { href: 'https://app.test/#/', reload: () => (world.reloads += 1) });
  vi.stubGlobal('fetch', async (url: string) => {
    world.fetched += 1;
    if (world.offline) throw new TypeError('Failed to fetch');
    return { ok: true, text: async () => (String(url).endsWith('sw.js') ? swText(world.server) : indexHtml(world.server)) };
  });
  vi.stubGlobal('setInterval', () => (world.intervals += 1));
  const m = await import('./appUpdate');
  m.startAppUpdates({ production: opts.production ?? true });
  await flush();
  const offer = () => m.readAppUpdate().offer;
  return { m, doc, win, offer };
}

/** Tap Reload `times` times, as fast as a finger can; let every consequence land. */
async function tap(page: Page, times: number) {
  for (let i = 0; i < times; i += 1) page.m.reloadToUpdate();
  await flush();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the update controller', () => {
  it('the update offer follows the live registration and only the tapping window reloads', async () => {
    // --- OUTSIDE A PRODUCTION BUILD: nothing registers, nothing throws ------
    {
      const world = new World('A');
      const page = await openPage(world, { production: false });
      expect([world.container.registered, world.listeners, world.intervals, page.offer()]).toEqual([0, 0, 0, false]);
      // A route that fails to load in development is its own error, never an update.
      world.server = 'V2';
      expect([await page.m.routeCodeMissing('/more'), page.m.readAppUpdate(), world.fetched]).toEqual([false, { offer: false, missingRoutes: [] }, 0]);
      const bare = await openPage(new World('A'), { noServiceWorker: true });
      expect(bare.offer()).toBe(false);
      const refusing = new World('A');
      refusing.registerFails = true;
      const refused = await openPage(refusing);
      expect([refusing.container.registered, refused.offer()]).toEqual([1, false]);
    }

    for (const taps of [1, 3]) {
      // --- UNCONTROLLED: the first install of THIS page's build is no offer --
      {
        const world = new World('A');
        const first = world.find('A'); // found at registration
        const page = await openPage(world);
        world.installed(first);
        await flush();
        expect(page.offer(), 'own first install').toBe(false);
        // …and a later build waits behind it: offered, never applied by itself.
        const v2 = world.find('V2');
        world.installed(v2);
        await flush();
        expect(page.offer(), 'later update, uncontrolled').toBe(true);
        expect(page.m.offerShownOn(page.m.readAppUpdate(), '/close'), 'waits on /close').toBe(false);
        expect(page.m.offerShownOn(page.m.readAppUpdate(), '/'), 'shown after Save or Discard').toBe(true);
        expect(world.reloads).toBe(0);
        await tap(page, taps);
        // SKIP_WAITING once; the reload follows its activation, exactly once.
        expect([v2.posted, world.reg.active?.build, world.reloads], `taps ${taps}`).toEqual([[{ type: 'SKIP_WAITING' }], 'V2', 1]);
      }
      // The same first install, found only after registration resolved.
      {
        const world = new World('A');
        const page = await openPage(world);
        world.installed(world.find('A'));
        await flush();
        expect(page.offer(), 'own first install, found later').toBe(false);
      }

      // --- UNCONTROLLED: a NEWER build is the first install (found early) ---
      // The network served this page A, but the server already had V2 when the
      // page registered; it activates at once, with nothing waiting.
      {
        const world = new World('A');
        const v2 = world.find('V2');
        const page = await openPage(world);
        world.installed(v2);
        await flush();
        expect([page.offer(), world.reg.waiting, world.reloads], 'found early').toEqual([true, null, 0]);
        await tap(page, taps);
        expect(world.reloads, `found early, taps ${taps}`).toBe(1);
      }
      // …or found later and activated without waiting.
      {
        const world = new World('A');
        const page = await openPage(world);
        world.installed(world.find('V2'));
        await flush();
        expect([page.offer(), world.reloads], 'activated without waiting').toEqual([true, 0]);
        await tap(page, taps);
        expect(world.reloads).toBe(1);
      }
      // An older worker that was active before this uncontrolled page loaded is not newer.
      {
        const world = new World('S');
        world.reg.active = new FakeWorker('W0', world);
        world.reg.active.state = 'activated';
        const page = await openPage(world);
        expect(page.offer(), 'older active').toBe(false);
      }

      // --- CONTROLLED: waiting at registration, and found later --------------
      for (const when of ['at registration', 'later'] as const) {
        const world = new World('A');
        const a = new FakeWorker('A', world);
        world.installed(a);
        const pending = when === 'at registration' ? world.find('V2') : null;
        if (pending) world.installed(pending);
        const page = await openPage(world, { controller: a });
        const v2 = pending ?? world.find('V2');
        if (!pending) {
          expect(page.offer(), 'installing is not yet an offer').toBe(false);
          world.installed(v2);
          await flush();
        }
        expect([page.offer(), world.reloads], when).toEqual([true, 0]);
        await tap(page, taps);
        expect([v2.posted.length, world.container.controller?.build, world.reloads], `${when}, taps ${taps}`).toEqual([1, 'V2', 1]);
      }

      // --- CONTROLLED: a newer waiting worker supersedes the waiting one -----
      {
        const world = new World('A');
        const a = new FakeWorker('A', world);
        world.installed(a);
        const page = await openPage(world, { controller: a });
        const v2 = world.find('V2');
        world.installed(v2);
        const v3 = world.find('V3');
        world.installed(v3);
        await flush();
        expect([page.offer(), v2.state, world.reloads], 'superseded').toEqual([true, 'redundant', 0]);
        await tap(page, taps);
        expect([v2.posted, v3.posted.length, world.reg.active?.build, world.reloads]).toEqual([[], 1, 'V3', 1]);
      }

      // --- CONTROLLED: another window takes the update — this one never reloads by itself
      {
        const world = new World('A');
        const a = new FakeWorker('A', world);
        world.installed(a);
        const page = await openPage(world, { controller: a });
        const v2 = world.find('V2');
        world.installed(v2);
        world.activate(v2); // the OTHER window's Reload
        await flush();
        expect([page.offer(), world.container.controller?.build, world.reloads], 'other window').toEqual([true, 'V2', 0]);
        await tap(page, taps);
        // Nothing waits now: this window's own tap reloads it directly, once.
        expect([v2.posted, world.reloads]).toEqual([[], 1]);
      }

      // --- A ROUTE WHOSE CODE IS GONE: only an update's removal is the offer,
      // never a reload by itself, and never over an unsaved close for another route's code
      for (const controlled of [true, false]) {
        const world = new World('A');
        const a = new FakeWorker('A', world);
        world.installed(a);
        const page = await openPage(world, { controller: controlled ? a : null });
        const now = () => page.m.readAppUpdate();
        expect(page.offer()).toBe(false);
        // The app still serves this page's build: the failure is the page's own.
        expect(await page.m.routeCodeMissing('/more')).toBe(false);
        // Unreachable: nothing proves an update either.
        world.server = 'V2';
        world.offline = true;
        expect(await page.m.routeCodeMissing('/more')).toBe(false);
        expect([now(), world.reloads]).toEqual([{ offer: false, missingRoutes: [] }, 0]);
        // Another build is served: More's code was removed by an update.
        world.offline = false;
        expect(await page.m.routeCodeMissing('/more')).toBe(true);
        expect([now(), world.reloads]).toEqual([{ offer: true, missingRoutes: ['/more'] }, 0]);
        expect(page.m.offerShownOn(now(), '/more'), 'in place of the missing route').toBe(true);
        // The close screen's code still loaded: the offer waits until Save or Discard.
        expect(page.m.offerShownOn(now(), '/close'), "another route's code over /close").toBe(false);
        expect(page.m.offerShownOn(now(), '/'), 'after Save or Discard').toBe(true);
        // The close screen's OWN code gone: the offer stands in for it.
        expect(await page.m.routeCodeMissing('/close')).toBe(true);
        expect(page.m.offerShownOn(now(), '/close'), "the close screen's own code").toBe(true);
        expect(world.reloads).toBe(0);
        await tap(page, taps);
        expect(world.reloads).toBe(1);
      }
    }

    // --- THE NEWEST BUILD LANDED: the reloaded page has nothing to offer ----
    {
      const world = new World('V2');
      const v2 = new FakeWorker('V2', world);
      world.installed(v2);
      const page = await openPage(world, { controller: v2 });
      expect(page.offer()).toBe(false);
      // ONE registration, one set of listeners and one hourly check per page,
      // however often it is started again (React remounts, StrictMode).
      const before = [world.container.registered, world.listeners, world.intervals];
      expect(before).toEqual([1, 4, 1]); // updatefound, controllerchange, visibilitychange, online
      page.m.startAppUpdates({ production: true });
      page.m.startAppUpdates({ production: true });
      await flush();
      expect([world.container.registered, world.listeners, world.intervals]).toEqual(before);
      // The foreground and reconnect checks ask the registration, nothing else.
      page.doc.dispatchEvent(new Event('visibilitychange'));
      page.win.dispatchEvent(new Event('online'));
      expect(world.reg.updates).toBe(2);
      expect(world.reloads).toBe(0);
    }
  });
});
