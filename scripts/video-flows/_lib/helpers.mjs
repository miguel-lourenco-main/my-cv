/**
 * The helper set (`h`) handed to every segment of a video flow, plus the fast
 * pacing defaults every flow inherits.
 *
 * Pacing rules (binding, from the user): the video exists to SHOW the app's
 * features, the viewer can pause / rewind, so everything runs faster than a
 * live demo would. Hero ~1.5 s, other beats ~0.8-1.2 s, fast cursor and typing,
 * fast single-glide scrolls, no dead time, no spinners on camera. A flow may
 * override any value via its `pacing` export, but should only ever go faster.
 */

export const VIEWPORT = { width: 1280, height: 800 };

export const PACING = {
  heroDwell: 1500,      // ms the marketing hero is held (start of the marketing clip)
  featureLead: 400,     // ms the first frame of each feature clip is held before its run()
  beat: 1000,           // ms of a normal "read this" hold: h.beat()
  slideHold: 1100,      // ms each marketing slide is held by h.slides()
  settleMax: 2500,      // max ms to wait for intro animations / splash screens (off camera where possible)
  navDwell: 1000,       // ms held after an on-camera navigation, once the new page has loaded
  navHold: 500,         // ms held after h.nav()/h.navLink() (continuous takes: the next feature's run() reads on)
  navSettleMax: 700,    // max ms h.nav() waits for the destination to stop moving after it is visible
  maxScrollSpeed: 2400, // px/s for paced scrolls and glides
  glideMinMs: 280,      // a glide never takes less than this...
  glideMaxMs: 750,      // ...nor more than this, however far it goes
  scrollStep: 1.0,      // h.scrollTo/scrollBy: max fraction of the viewport per step
  minStepMs: 300,       // a scroll step never takes less than this
  sectionPause: 700,    // ms paused on an intermediate scroll stop that shows content
  arrivePause: 350,     // ms paused once h.scrollTo() reaches its target
  scroller: null,       // CSS selector of the page's scroll container for numeric glides (null = document)
  moveMs: 280,          // default cursor glide
  clickPause: 150,      // ms after a click (before the next action)
  typeDelay: 28,        // ms per typed character
};

/** A visible cursor: headless recordings have none, which makes clicks unreadable. */
export const CURSOR_SCRIPT = () => {
  const install = () => {
    if (document.getElementById("__rec_cursor")) return;
    const c = document.createElement("div");
    c.id = "__rec_cursor";
    c.style.cssText =
      "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;" +
      "background:rgba(20,20,20,.35);border:2px solid rgba(255,255,255,.95);box-shadow:0 1px 6px rgba(0,0,0,.35);" +
      "pointer-events:none;z-index:2147483647;transition:transform .08s ease,background .08s ease;" +
      "transform:translate(-100px,-100px)";
    document.documentElement.appendChild(c);
    let x = -100;
    let y = -100;
    let down = false;
    const paint = () => {
      c.style.transform = `translate(${x}px,${y}px) scale(${down ? 0.7 : 1})`;
      c.style.background = down ? "rgba(255,180,0,.75)" : "rgba(20,20,20,.35)";
    };
    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; paint(); }, true);
    window.addEventListener("mousedown", () => { down = true; paint(); }, true);
    window.addEventListener("mouseup", () => { down = false; paint(); }, true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
};

/** Path + search of a URL: a hash-only change is not a navigation. */
const pageKey = (u) => {
  try {
    const x = new URL(u);
    return x.origin + x.pathname + x.search;
  } catch {
    return u;
  }
};

const isLocator = (x) => x && typeof x === "object" && typeof x.first === "function" && typeof x.evaluate === "function";

export function makeHelpers(page, pacing = PACING, extra = {}) {
  let mouse = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };
  const wait = (ms) => page.waitForTimeout(ms);
  const loc = (x) => (typeof x === "string" ? page.locator(x) : x);

  /** Hold the frame still (no cursor, no scroll) for `ms`. */
  const dwell = (ms) => wait(ms);
  /** A normal reading beat (~1 s). */
  const beat = (ms = pacing.beat) => wait(ms);

  /**
   * Wait until the page stops changing on its own (finite CSS/Web animations
   * done, visible text unchanged across two polls). Gives up after `maxMs`.
   */
  async function waitForStill(maxMs = pacing.settleMax) {
    const t0 = Date.now();
    let prev = null;
    let stable = 0;
    while (Date.now() - t0 < maxMs) {
      const sig = await page.evaluate(() => {
        const busy = document.getAnimations().filter((a) => {
          const t = a.effect?.getComputedTiming?.();
          return a.playState === "running" && t && Number.isFinite(t.endTime);
        }).length;
        const H = window.innerHeight;
        let text = "";
        for (const el of document.querySelectorAll("h1, h2, h3, p, a, button, span, li")) {
          const r = el.getBoundingClientRect();
          if (r.bottom > 0 && r.top < H && el.childElementCount === 0) text += el.textContent;
          if (text.length > 4000) break;
        }
        return { busy, text: `${text.length}:${text.slice(0, 400)}` };
      }).catch(() => ({ busy: 1, text: "" }));
      if (!sig.busy && sig.text === prev) {
        if (++stable >= 2) break;
      } else stable = 0;
      prev = sig.text;
      await wait(150);
    }
    return Date.now() - t0;
  }

  /** Wait for a freshly navigated page to settle, then hold it for navDwell. */
  async function settleNavigation(ms = pacing.navDwell) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await waitForStill(Math.min(pacing.settleMax, 1500));
    await dwell(ms);
  }

  /** Navigate the recorded page (on camera) and hold the new page briefly. */
  async function goto(url, { dwellMs = pacing.navDwell, waitUntil = "networkidle" } = {}) {
    await page.goto(url, { waitUntil, timeout: 30000 }).catch(() => {});
    await waitForStill(Math.min(pacing.settleMax, 1500));
    await dwell(dwellMs);
  }

  /** Glide the cursor to (x, y) so the viewer can follow it. */
  async function moveTo(x, y, ms = pacing.moveMs) {
    const steps = Math.max(4, Math.round(ms / 16));
    const from = { ...mouse };
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
      await page.waitForTimeout(ms / steps);
    }
    mouse = { x, y };
  }

  /**
   * Find the element's nearest scrollable ancestor (or the window), park it on
   * window.__recScroller and return { from, to, viewport }.
   */
  const resolveScroll = (locator, offset) =>
    loc(locator).first().evaluate((el, offset) => {
      const scroller = (() => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          const oy = getComputedStyle(n).overflowY;
          if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight + 4) return n;
        }
        return document.scrollingElement;
      })();
      window.__recScroller = scroller;
      const isDoc = scroller === document.scrollingElement;
      const from = scroller.scrollTop;
      const base = isDoc ? 0 : scroller.getBoundingClientRect().top;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const to = Math.max(0, Math.min(max, from + el.getBoundingClientRect().top - base - offset));
      return { from, to, viewport: isDoc ? window.innerHeight : scroller.clientHeight };
    }, offset);

  /**
   * Park a scroller for numeric targets: the document, or the element matching
   * `pacing.scroller` / the `scroller` option (a CSS selector, e.g. "main" for
   * apps whose body does not scroll).
   */
  const docScroller = (dy = 0, absolute = null, scroller = pacing.scroller) =>
    page.evaluate(({ dy, absolute, scroller }) => {
      const s = (scroller && document.querySelector(scroller)) || document.scrollingElement;
      window.__recScroller = s;
      const max = s.scrollHeight - s.clientHeight;
      const to = absolute === null ? s.scrollTop + dy : absolute;
      return { from: s.scrollTop, to: Math.max(0, Math.min(max, to)), viewport: s === document.scrollingElement ? window.innerHeight : s.clientHeight };
    }, { dy, absolute, scroller: scroller || null });

  /**
   * Ease the parked scroller to `top` over `duration` ms. Writes scrollTop
   * directly with CSS smooth scrolling switched off for the move, so pages that
   * override Element.scrollTo (snap scripts) cannot fight it.
   */
  const animateScroll = (top, duration) =>
    page.evaluate(
      ({ top, duration }) =>
        new Promise((resolve) => {
          const s = window.__recScroller || document.scrollingElement;
          const styled = s === document.scrollingElement ? document.documentElement : s;
          const prevBehavior = styled.style.scrollBehavior;
          styled.style.scrollBehavior = "auto";
          const top0 = s.scrollTop;
          if (duration <= 0) {
            s.scrollTop = top;
            styled.style.scrollBehavior = prevBehavior;
            return resolve();
          }
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            s.scrollTop = top0 + (top - top0) * e;
            if (t < 1) requestAnimationFrame(step);
            else {
              styled.style.scrollBehavior = prevBehavior;
              resolve();
            }
          };
          requestAnimationFrame(step);
        }),
      { top, duration }
    );

  const glideMs = (dist) =>
    Math.round(Math.min(pacing.glideMaxMs, Math.max(pacing.glideMinMs, (dist / pacing.maxScrollSpeed) * 1000)));

  /** Does the current viewport show something worth pausing on? */
  const viewportHasContent = () =>
    page.evaluate(() => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const onScreen = (r) => r.bottom > 40 && r.top < H - 40 && r.right > 0 && r.left < W && r.width > 0;
      let chars = 0;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n && chars < 60; n = walker.nextNode()) {
        const t = n.textContent.trim();
        if (!t || !n.parentElement) continue;
        const r = n.parentElement.getBoundingClientRect();
        if (onScreen(r) && getComputedStyle(n.parentElement).visibility !== "hidden") chars += t.length;
      }
      if (chars >= 60) return true;
      for (const m of document.querySelectorAll("img, svg, canvas, video, picture, iframe")) {
        const r = m.getBoundingClientRect();
        if (onScreen(r) && r.width * r.height > 120 * 120) return true;
      }
      return false;
    });

  /** Next intermediate stop: the furthest section/heading top within `maxStep`, else a plain step. */
  const nextStop = (cur, to, maxStep) =>
    page.evaluate(({ cur, to, maxStep }) => {
      const s = window.__recScroller || document.scrollingElement;
      const isDoc = s === document.scrollingElement;
      const base = isDoc ? 0 : s.getBoundingClientRect().top;
      const dir = Math.sign(to - cur);
      const lo = 0.35 * maxStep;
      let best = null;
      for (const el of document.querySelectorAll("section, [id], h1, h2, h3")) {
        const r = el.getBoundingClientRect();
        if (r.height < 40 && !/^H[1-3]$/.test(el.tagName)) continue;
        const top = s.scrollTop + r.top - base - (/^H[1-3]$/.test(el.tagName) ? 90 : 0);
        const d = (top - cur) * dir;
        if (d >= lo && d <= maxStep && (top - to) * dir < 0 && (best === null || d > (best - cur) * dir)) best = top;
      }
      return best ?? cur + dir * maxStep;
    }, { cur, to, maxStep });

  /** Step the parked scroller from `from` to `to` under the pacing rules. */
  async function stepScroll(from, to, viewport, { pause = pacing.arrivePause } = {}) {
    const dist = Math.abs(to - from);
    if (dist >= 2) {
      const maxStep = Math.max(120, viewport * pacing.scrollStep);
      const dir = Math.sign(to - from);
      let cur = from;
      for (let guard = 0; guard < 60; guard++) {
        const last = Math.abs(to - cur) <= maxStep;
        const stop = last ? to : await nextStop(cur, to, maxStep);
        const d = Math.abs(stop - cur);
        await animateScroll(stop, Math.max(pacing.minStepMs, (d / pacing.maxScrollSpeed) * 1000));
        cur = stop;
        if (last || (to - cur) * dir <= 0) break;
        if (await viewportHasContent()) await wait(pacing.sectionPause);
      }
    }
    if (pause) await wait(pause);
  }

  /** Paced scroll to an element: steps of <= scrollStep viewports, a short pause on content stops. */
  async function scrollTo(locator, { offset = 80, pause = pacing.arrivePause } = {}) {
    const { from, to, viewport } = await resolveScroll(locator, offset);
    await stepScroll(from, to, viewport, { pause });
  }

  /** Paced scroll of the window by `dy` px. */
  async function scrollBy(dy, { pause = pacing.arrivePause, scroller } = {}) {
    const { from, to, viewport } = await docScroller(dy, null, scroller);
    await stepScroll(from, to, viewport, { pause });
  }

  /**
   * ONE continuous fast scroll (no intermediate stops) to an element, a CSS
   * selector, or an absolute Y (number; of the document, or of `scroller`).
   * Duration is distance-based, clamped to [glideMinMs, glideMaxMs]. `ms`
   * forces a duration; 0 is a cut.
   */
  async function glide(target, { offset = 80, ms, pause = 0, scroller } = {}) {
    const { from, to } = typeof target === "number" ? await docScroller(0, target, scroller) : await resolveScroll(target, offset);
    const d = Math.abs(to - from);
    if (d >= 2) await animateScroll(to, ms ?? glideMs(d));
    if (pause) await wait(pause);
  }

  /** Instant scroll (a cut). Use in a segment's before() to set up the opening frame. */
  const jump = (target, { offset = 80, scroller } = {}) => glide(target, { offset, ms: 0, scroller });

  /**
   * The marketing helper: a few quick "slides", one per landing section.
   * `sections` items are a selector string, a Locator, a document Y, or
   * { at, offset?, hold?, cut?, settle?, interact?(h) }. Each one: fast glide (or a cut
   * with `cut: true`), a short settle for its reveal animation, a hold of
   * `slideHold` ms, then its optional quick interaction.
   */
  async function slides(sections, { hold = pacing.slideHold, offset = 80, cut = false, settle = 500 } = {}) {
    for (const raw of sections) {
      const s = typeof raw === "string" || typeof raw === "number" || isLocator(raw) ? { at: raw } : raw;
      const target = s.at;
      if (target !== undefined && target !== null) {
        const isCut = s.cut ?? cut;
        await glide(target, { offset: s.offset ?? offset, ms: isCut ? 0 : s.ms });
        await waitForStill(s.settle ?? settle);
      }
      await dwell(s.hold ?? hold);
      if (s.interact) await s.interact(api);
    }
  }

  /**
   * Move the cursor onto the element, then click it. If the click changes the
   * page (path or query), wait for the new page and hold it for navDwell.
   */
  async function click(locator, { pause = pacing.clickPause, move = pacing.moveMs, navDwell = pacing.navDwell, settle = true } = {}) {
    const el = loc(locator).first();
    await el.waitFor({ state: "visible" });
    let box = await el.boundingBox();
    if (box && (box.y < 0 || box.y + box.height > VIEWPORT.height)) {
      await glide(el, { offset: Math.max(80, (VIEWPORT.height - box.height) / 2), pause: 120 });
      box = await el.boundingBox();
    }
    if (!box) throw new Error(`no box for ${el}`);
    await moveTo(box.x + box.width / 2, box.y + box.height / 2, move);
    await wait(60);
    const before = pageKey(page.url());
    await el.click({ delay: 60 });
    if (pause) await wait(pause);
    if (settle && pageKey(page.url()) !== before) await settleNavigation(navDwell);
  }

  /**
   * Wait until the destination of an on-camera navigation is there. `arrive` is a
   * CSS selector, a Locator, a RegExp for the URL, a function (page) => Promise,
   * or an array of these (all must hold).
   */
  async function arrived(arrive, timeout = 15000) {
    if (!arrive) return page.waitForLoadState("domcontentloaded").catch(() => {});
    if (Array.isArray(arrive)) {
      for (const a of arrive) await arrived(a, timeout);
      return;
    }
    if (arrive instanceof RegExp) return page.waitForURL(arrive, { timeout, waitUntil: "commit" });
    if (typeof arrive === "function") return arrive(page);
    return loc(arrive).first().waitFor({ state: "visible", timeout });
  }

  /**
   * Quick ON-CAMERA navigation for continuous takes: glide to `target`, click
   * it, wait only until `arrive` is visible (never for networkidle), let the new
   * view settle for at most navSettleMax ms, then hold navHold ms. The click and
   * the arrival are filmed, like a person using the app; nothing is trimmed.
   */
  async function nav(target, { arrive, hold = pacing.navHold, move = pacing.moveMs, timeout = 15000, settleMax = pacing.navSettleMax } = {}) {
    await click(target, { pause: 0, move, settle: false });
    await arrived(arrive, timeout);
    if (settleMax) await waitForStill(settleMax);
    if (hold) await dwell(hold);
  }

  /**
   * h.nav() on the app's own navigation: the first link (or button) named `name`
   * (string = substring, case-insensitive; or RegExp) inside nav/header/aside,
   * falling back to anywhere on the page. `within` narrows the search (selector).
   */
  async function navLink(name, { within, ...opts } = {}) {
    const rx = name instanceof RegExp ? name : new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const scopes = within ? [page.locator(within)] : [page.locator("nav, header, aside, [role=navigation]"), page.locator("body")];
    for (const scope of scopes) {
      const cand = scope.getByRole("link", { name: rx }).or(scope.getByRole("button", { name: rx }).or(scope.getByRole("tab", { name: rx })));
      const n = await cand.count();
      for (let i = 0; i < n; i++) {
        const el = cand.nth(i);
        if (await el.isVisible()) return nav(el, opts);
      }
    }
    throw new Error(`navLink: nothing visible named ${rx}`);
  }

  async function hover(locator, ms = pacing.moveMs) {
    const box = await loc(locator).first().boundingBox();
    if (box) await moveTo(box.x + box.width / 2, box.y + box.height / 2, ms);
  }

  async function type(locator, text, delay = pacing.typeDelay) {
    await click(locator, { pause: 60 });
    await loc(locator).first().pressSequentially(text, { delay });
  }

  /** Show/hide the recorder cursor (e.g. while a section only scrolls). */
  const cursor = (visible) =>
    page.evaluate((v) => {
      const c = document.getElementById("__rec_cursor");
      if (c) c.style.opacity = v ? "1" : "0";
    }, visible).catch(() => {});

  /** A caption pill at the bottom centre (recorder narration, not app UI). "" hides it. */
  const caption = (text, { bottom = 36 } = {}) =>
    page.evaluate(({ text, bottom }) => {
      let c = document.getElementById("__rec_caption");
      if (!c) {
        c = document.createElement("div");
        c.id = "__rec_caption";
        c.style.cssText =
          `position:fixed;left:50%;bottom:${bottom}px;transform:translateX(-50%);padding:9px 18px;border-radius:999px;` +
          "background:rgba(15,23,42,.88);color:#fff;font:600 17px/1.3 system-ui,sans-serif;" +
          "box-shadow:0 6px 24px rgba(0,0,0,.25);z-index:2147483646;pointer-events:none;transition:opacity .2s;opacity:0";
        document.documentElement.appendChild(c);
      }
      c.textContent = text;
      c.style.opacity = text ? "1" : "0";
    }, { text, bottom }).catch(() => {});

  const api = {
    page, pacing, viewport: VIEWPORT,
    // Continuous takes replace this with a version that trims fn's span out of the
    // video (a counted cut). In clip mode it simply runs fn.
    offCamera: async (fn) => fn?.(),
    ...extra,
    wait, dwell, beat, waitForStill, goto, settleNavigation, moveTo, scrollTo, scrollBy, glide, jump, slides,
    click, hover, type, cursor, caption, arrived, nav, navLink,
    get mouse() { return { ...mouse }; },
  };
  return api;
}
