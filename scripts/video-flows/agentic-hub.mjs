// Fast-paced: short marketing slides, then invest / hire / browse / token-activity / api.
// Live: GitLab Pages static export (no local repo). Hero -> "one agent, two
// sides" -> category floor -> Development results -> CodeAssist Pro's page:
// invest in it (share dialog), its agent token + live activity, the API docs
// tab and the API playground.
// The Agent Interface tab embeds a placeholder site (example.com), so its panel
// is never brought into view: API Documentation is selected while the panel is
// still below the fold.
// The hero is held for pacing.heroDwell before run() starts; scrolls are paced.

const BASE = "https://agentichub-64abdc.gitlab.io";
const NAV_H = 64; // sticky header height

/** Wait until `fn` (evaluated in the page) returns true, or give up after `ms`. */
const until = (page, fn, arg, ms = 6000) =>
  page.waitForFunction(fn, arg, { timeout: ms, polling: 150 }).catch(() => {});

/**
 * One continuous eased scroll of the window to `top` over `ms` (kept under
 * ~700 px/s). Used where the recorder's 0.75-viewport step cap would add an
 * intermediate stop on a frame that shows nothing new.
 */
const glide = (page, top, ms) =>
  page.evaluate(({ top, ms }) => new Promise((resolve) => {
    const s = document.scrollingElement;
    const top0 = s.scrollTop, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      s.scrollTo({ top: top0 + (top - top0) * e, behavior: "instant" });
      if (t < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  }), { top, ms });

/** Like glide, but eases out (fast start, ~200 ms settle) for long scrolls. */
const glideOut = (page, top, ms) =>
  page.evaluate(({ top, ms }) => new Promise((resolve) => {
    const s = document.scrollingElement;
    const top0 = s.scrollTop, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.35 ? (t / 0.35) * (t / 0.35) * 0.35 : 1 - Math.pow(1 - t, 3) * (0.65 / Math.pow(0.65, 3));
      s.scrollTo({ top: top0 + (top - top0) * Math.min(1, e), behavior: "instant" });
      if (t < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  }), { top, ms });

/** Document Y that puts `locator`'s top `offset` px below the viewport top. */
const yFor = (locator, offset) =>
  locator.first().evaluate((el, off) => Math.round(el.getBoundingClientRect().top + scrollY - off), offset);

/** Wait until every element matched in `sel` (inside the page) is fully revealed. */
const revealed = (page, sel, min) =>
  until(page, ({ sel, min }) => {
    const els = [...document.querySelectorAll(sel)];
    return els.length >= min && els.every((r) => {
      for (let n = r; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (Number(s.opacity) < 0.99) return false;
      }
      return true;
    });
  }, { sel, min });

/**
 * A cross-dissolve curtain for route changes: the app morphs its header and
 * fades the new page in, and mid-morph frames read as a broken layout.
 */
async function installCurtain(h) {
  await h.page.evaluate(() => {
    // The header's wallet-balance pill fades in only once the page is scrolled,
    // so it would pop in and out between clips and suggest a connected wallet.
    // Hide it on every clip so the header looks the same across cuts.
    const st = document.createElement("style");
    st.textContent = "header div.rounded-full:has(> span.text-gold), header div.rounded-full:has(span.text-gold){display:none!important}";
    document.head.appendChild(st);
    const c = document.createElement("div");
    c.id = "__rec_curtain";
    c.style.cssText = "position:fixed;inset:0;background:#07070a;opacity:0;pointer-events:none;" +
      "z-index:2147483646;transition:opacity .12s ease";
    document.documentElement.appendChild(c);
  });
}
/**
 * A partial dim (never full black: the outgoing page stays visible through it),
 * so a route change reads as a quick cross-fade rather than a dip to black.
 */
const curtain = async (h, on, { level = 0.5, ms = 130 } = {}) => {
  await h.page.evaluate(({ on, level }) => {
    const c = document.getElementById("__rec_curtain");
    if (c) c.style.opacity = on ? String(level) : "0";
  }, { on, level });
  await h.wait(ms);
};
/** Click under the curtain (agent pages stream live activity: no networkidle). */
async function nav(h, locator, url, ready) {
  const { page } = h;
  await locator.first().waitFor({ state: "visible" });
  await h.wait(80);
  await page.mouse.down();
  await curtain(h, true);
  await page.mouse.up();
  await h.moveTo(1250, 150, 150);
  await page.waitForURL(url, { waitUntil: "commit" });
  await page.waitForLoadState("domcontentloaded");
  await ready();
  await h.wait(250);
  await curtain(h, false);
}
const agentReady = (page) =>
  page.getByRole("button", { name: "Invest", exact: true }).waitFor({ state: "visible" }).catch(() => {});

const hd = (page, name) => page.getByRole("heading", { name });

// ---------------------------------------------------------------------------
// Continuous take (v4): the v3 features in the v3 order, joined by using the
// app on camera, no cuts:
//   landing (hero + typed search -> "one agent, two sides" -> "from query to
//   ownership" -> "list your agent" -> one glide back up to the category
//   floor) --click the "Development" category--> search results (rating filter, sort) --"Try
//   agent" on CodeAssist Pro--> agent page: hire dialog (Cancel) -> invest
//   dialog (close) -> glide to metrics / token chart / live activity -> glide
//   to the API docs tab -> API playground request.
// The two route changes (category -> results, Try agent -> agent page) run
// under freeze()/thaw(): the outgoing view is held as a static clone until the
// new page has settled, then dissolves (no blank or mid-morph frame).
// Invisible-only tweaks happen on the live page (style pins, timer shortening,
// selecting API Documentation while the tab bar is below the fold).
// ---------------------------------------------------------------------------

/** Styles that only pin animations / hide the scroll-dependent wallet pill. */
const addStyle = (page, id, css) =>
  page.evaluate(({ id, css }) => {
    if (document.getElementById(id)) return;
    const st = document.createElement("style");
    st.id = id;
    st.textContent = css;
    document.head.appendChild(st);
  }, { id, css });
const dropStyle = (page, id) => page.evaluate((id) => document.getElementById(id)?.remove(), id);

/**
 * Cursor glide timed by the wall clock (h.moveTo counts steps, so it stretches
 * when the machine is busy): the take keeps its pace under load.
 */
let cur = { x: 640, y: 400 };
async function mv(h, x, y, ms = 200) {
  const { page } = h;
  const from = { ...cur };
  const t0 = Date.now();
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / Math.max(1, ms));
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    if (t >= 1) break;
    await page.waitForTimeout(16);
  }
  cur = { x, y };
}
async function hov(h, locator, ms = 200) {
  const b = await locator.first().boundingBox();
  if (b) await mv(h, b.x + b.width / 2, b.y + b.height / 2, ms);
}

/** Raw press at the element's centre after a cursor glide (no actionability hold). */
async function press(h, locator, { move = 200, hold = 60 } = {}) {
  const { page } = h;
  const el = locator.first();
  await el.waitFor({ state: "visible" });
  const b = await el.boundingBox();
  await mv(h, b.x + b.width / 2, b.y + b.height / 2, move);
  await h.wait(40);
  await page.mouse.down();
  await h.wait(hold);
  await page.mouse.up();
}

/**
 * Freeze the current view: a fixed, inert overlay holding clones of the
 * background layer, the header and <main> at their on-screen rects (hovered
 * nodes get their computed style inlined, so the hover state survives). The
 * route change then happens underneath, and thaw() lifts it only when the new
 * view has settled: the old view stays on screen until the new one is ready,
 * so no blank or mid-morph frame is filmed.
 */
const freeze = (page) =>
  page.evaluate(() => {
    document.getElementById("__rec_freeze")?.remove();
    const o = document.createElement("div");
    o.id = "__rec_freeze";
    o.setAttribute("aria-hidden", "true");
    o.inert = true;
    // Body carries the next/font variables and base text classes.
    o.className = document.body.className;
    o.style.cssText = `position:fixed;inset:0;z-index:2147483640;pointer-events:none;overflow:hidden;opacity:1;` +
      `background:${getComputedStyle(document.body).backgroundColor};transition:opacity 140ms ease`;
    // ...and text styles from the `body` rule itself (color, font).
    const bcs = getComputedStyle(document.body);
    for (const p of ["color", "font-feature-settings",
      "-webkit-font-smoothing", "text-rendering"]) o.style.setProperty(p, bcs.getPropertyValue(p));
    const st = document.createElement("style");
    st.textContent = "#__rec_freeze *{pointer-events:none!important}";
    o.appendChild(st);
    const copy = (src, abs) => {
      const c = src.cloneNode(true);
      // Inline the computed style of hovered nodes and their subtrees.
      const a = [src, ...src.querySelectorAll("*")], b = [c, ...c.querySelectorAll("*")];
      // Hovered nodes smaller than a third of the viewport (a row, a card, a
      // button; not main/section wrappers that merely contain the pointer).
      const hov = [...src.querySelectorAll(":hover")].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width * r.height < innerWidth * innerHeight / 3;
      });
      a.forEach((n, i) => {
        const cs = getComputedStyle(n);
        if (hov.some((h) => h === n || h.contains(n))) {
          let txt = "";
          for (const p of cs) txt += `${p}:${cs.getPropertyValue(p)};`;
          b[i].style.cssText = txt;
        } else if (n.getAnimations && n.getAnimations().length) {
          // A cloned CSS animation would restart from its first frame: pin
          // the animated properties at their current values instead.
          for (const p of ["opacity", "transform", "color", "background-image", "background-position",
            "background-size", "-webkit-text-fill-color", "filter", "clip-path", "translate", "scale"]) {
            b[i].style.setProperty(p, cs.getPropertyValue(p));
          }
        }
        if (b[i].style) { b[i].style.animation = "none"; b[i].style.transition = "none"; }
      });
      c.removeAttribute("id");
      b.forEach((n) => n.removeAttribute && n.removeAttribute("id"));
      if (abs) {
        const r = src.getBoundingClientRect();
        Object.assign(c.style, { position: "absolute", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, margin: "0" });
      }
      o.appendChild(c);
    };
    const bgl = document.querySelector("body > div.fixed.-z-10, body div.pointer-events-none.fixed.inset-0.-z-10");
    if (bgl) copy(bgl, false);
    const main = document.querySelector("main");
    if (main) copy(main, true);
    const header = document.querySelector("header");
    if (header) { copy(header, true); o.lastChild.style.zIndex = "5"; }
    // Other fixed layers: the scroll-progress bar is frozen with the view; the
    // app's own cursor layer is lifted above the overlay so the cursor ring stays.
    for (const el of document.body.querySelectorAll("div.fixed")) {
      if (el === bgl || el.closest("header") || getComputedStyle(el).position !== "fixed") continue;
      if (el.parentElement?.closest("div.fixed")) continue;
      if (el.classList.contains("inset-0") || el.className.includes("rounded-full")) {
        el.dataset.recZ = el.style.zIndex || "-";
        el.style.zIndex = "2147483642";
      } else {
        copy(el, false);
        o.lastChild.style.zIndex = "6";
      }
    }
    document.documentElement.appendChild(o);
  });

/**
 * Wait (per animation frame) until `ready` holds and the rects of `stable`
 * selectors match on consecutive frames, then fade the freeze overlay out.
 */
async function thaw(h, ready, { stable = [], timeout = 4000, fade = 140 } = {}) {
  const { page } = h;
  await page.evaluate(() => { window.__recRects = null; window.__recOk = 0; });
  await page.waitForFunction(({ ready, stable }) => {
    const out = (e) => e && !e.closest("#__rec_freeze");
    // eslint-disable-next-line no-new-func
    if (!new Function("out", `return (${ready})(out)`)(out)) { window.__recOk = 0; return false; }
    const rects = stable.map((s) => {
      const e = [...document.querySelectorAll(s)].find(out);
      if (!e) return "none";
      const r = e.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height];
    });
    const same = (a, b) => a === b || (Array.isArray(a) && Array.isArray(b) && a.every((v, i) => Math.abs(v - b[i]) <= 2));
    const prev = window.__recRects;
    window.__recOk = prev && rects.every((r, i) => same(r, prev[i])) ? window.__recOk + 1 : 0;
    window.__recRects = rects;
    return window.__recOk >= 2;
  }, { ready: ready.toString(), stable }, { polling: "raf", timeout }).catch(() => {});
  await page.evaluate(() => { const o = document.getElementById("__rec_freeze"); if (o) o.style.opacity = "0"; });
  await h.wait(fade);
  await page.evaluate(() => {
    document.getElementById("__rec_freeze")?.remove();
    for (const el of document.querySelectorAll("[data-rec-z]")) {
      el.style.zIndex = el.dataset.recZ === "-" ? "" : el.dataset.recZ;
      delete el.dataset.recZ;
    }
  });
}

/** True when `el` and all its ancestors are fully opaque. */
const OPAQUE = "(el) => { for (let n = el; n && n !== document.body; n = n.parentElement) if (Number(getComputedStyle(n).opacity) < 0.99) return false; return !!el; }";

const take = {
  target: 26,
  url: `${BASE}/`,
  pacing: { heroDwell: 900 },
  posterFrom: { feature: "marketing", at: 0.9 },
  async before(h) {
    const { page } = h;
    // Warm the HTTP cache for the pages the take visits (no pop-in on camera).
    for (const u of [`${BASE}/agents/?query=Development`, `${BASE}/agents/1/`]) {
      await page.goto(u, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    }
    // ...and the client-side route payloads of the two filmed navigations
    // (category -> results -> agent), which a plain page load does not fetch.
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await page.locator('#categories a[href="/agents/?query=Development"]').evaluate((el) => el.click());
    await until(page, () => /Found 9 results/.test(document.body.innerText));
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.locator('a[href="/agents/1/"]').filter({ hasText: "Try agent" }).first().evaluate((el) => el.click());
    await agentReady(page);
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await addStyle(page, "__rec_wallet", "header div.rounded-full:has(span.text-gold){display:none!important}");
  },
  route: [
    {
      key: "marketing",
      kind: "marketing",
      title: "Landing: hero, two-sided market, category floor",
      priority: 0,
      async before(h) {
        // Lead-in (not a cut): trigger every scroll-reveal so each section is legible.
        const { page } = h;
        const H = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < H; y += 500) {
          await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
          await h.wait(120);
        }
        await h.wait(700);
        await addStyle(page, "__rec_noscroll", "*{scroll-behavior:auto!important}");
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await h.wait(400);
        await mv(h, 900, 520, 16);
      },
      async run(h) {
        const { page } = h;
        // Hero (pacing.heroDwell + the typing beat): search as the entry point.
        const box = page.getByLabel("Search agents");
        await press(h, box, { move: 200, hold: 30 });
        await box.pressSequentially("Development", { delay: 20 });
        await h.beat(160);
        // One agent, two sides (one hover), then straight down to the core flow.
        await h.glide("#two-sided", { offset: NAV_H + 10, ms: 400 });
        await hov(h, page.locator("#two-sided h3").first(), 160);
        await h.beat(80);
        await Promise.all([
          glide(page, await yFor(page.locator("#how-it-works"), NAV_H + 10), 580),
          mv(h, 1180, 420, 200),
        ]);
        await h.beat(580);
        // The builders' side, then ONE eased glide back up to the category floor.
        await glide(page, await yFor(page.locator("#list-agent"), NAV_H + 10), 340);
        await h.beat(420);
        await glide(page, await yFor(page.locator("#categories"), NAV_H + 20), 480);
      },
    },
    {
      key: "browse",
      title: "Search results, rating filter, sort, open an agent",
      priority: 1,
      async transitionIn(h) {
        const { page } = h;
        // Raw press: Playwright's actionability check waits out the row's hover
        // expansion. The app morphs its header into the search bar on this route
        // change (mid-morph frames read as a broken layout), so the change happens
        // under a quick on-camera cross-dissolve, as in v3.
        const dev = page.locator('#categories a[href="/agents/?query=Development"]');
        await hov(h, dev, 180);
        await h.wait(160);
        // The old view stays on screen (frozen clone) until the results page,
        // its header search input and the grid have all settled.
        await freeze(page);
        await page.mouse.down();
        await h.wait(40);
        await page.mouse.up();
        await page.waitForURL(/\/agents\/\?query=Development/, { timeout: 4000 }).catch(() => {});
        // The grid shrink animates scale/transform (renders stretched): disable it here only.
        await addStyle(page, "__rec_grid", "main *{animation:none!important;transition-property:opacity,background-color,border-color,color!important;transform:none!important}");
        await thaw(h, `(out) => {
          const main = [...document.querySelectorAll("main")].find(out);
          if (!main || !/Found 9 results/.test(main.innerText)) return false;
          const op = ${OPAQUE};
          const head = [...main.querySelectorAll("h1,h2")].find((e) => /Search Results/.test(e.textContent));
          if (!op(head)) return false;
          const cards = [...main.querySelectorAll('a[href^="/agents/"]')].filter((a) => /Try agent/.test(a.textContent));
          return cards.length >= 6 && cards.slice(0, 6).every(op);
        }`, { stable: ["header input", "header a", "main h1, main h2", 'main a[href="/agents/1/"]'] });
        await h.beat(450);
      },
      async run(h) {
        const { page } = h;
        const count = await page.getByText(/Found \d+ results/).first().boundingBox();
        const chip = page.getByText("4.5+", { exact: true });
        await press(h, chip, { move: 220 });
        if (count) await mv(h, count.x + count.width * 0.6, count.y + count.height / 2, 380);
        const six = () => page.waitForFunction(() => /Found 6 results/.test(document.body.innerText), undefined, { polling: "raf", timeout: 700 }).then(() => true, () => false);
        // Under heavy load the first press can be dropped: press once more.
        if (!(await six())) {
          await press(h, chip, { move: 200 });
          if (count) await mv(h, count.x + count.width * 0.6, count.y + count.height / 2, 300);
          await six();
        }
        await h.beat(750);
        const sort = page.locator("select").filter({ has: page.locator('option[value="rating"]') }).first();
        await hov(h, sort, 200);
        await sort.selectOption("rating");
        await h.beat(700);
      },
    },
    {
      key: "hire",
      title: "Hire an agent: buy credits with a live total",
      priority: 2,
      async transitionIn(h) {
        const { page } = h;
        const tryAgent = page.locator('a[href="/agents/1/"]').filter({ hasText: "Try agent" });
        const tb = await tryAgent.first().boundingBox();
        await mv(h, tb.x + tb.width / 2, tb.y + tb.height / 2, 240);
        await h.wait(120);
        // The agent page fades in from a near-empty frame: keep the results on
        // screen (frozen) until its heading and header are fully drawn.
        await freeze(page);
        await page.mouse.down();
        await h.wait(50);
        await page.mouse.up();
        await page.waitForURL(/\/agents\/1\/?$/, { timeout: 4000 }).catch(() => {});
        await dropStyle(page, "__rec_grid");
        await agentReady(page);
        // Head for where "Hire agent" lands while the overlay lifts.
        await Promise.all([
          thaw(h, `(out) => {
            const main = [...document.querySelectorAll("main")].find(out);
            const head = main && [...main.querySelectorAll("h1")].find((e) => /CodeAssist Pro/.test(e.textContent));
            const btn = main && [...main.querySelectorAll("button")].find((b) => b.textContent.trim() === "Hire agent");
            const op = ${OPAQUE};
            return op(head) && op(btn);
          }`, { stable: ["main h1", "header a"] }),
          mv(h, 300, 500, 380),
        ]);
        // The Agent Interface tab embeds a placeholder site: select API
        // Documentation now, while the tab bar is far below the fold.
        // Radix tabs activate on mouse/pointer down, not on a synthetic click.
        await page.getByRole("tab", { name: "API Documentation" }).evaluate((el) => {
          const o = { bubbles: true, cancelable: true, button: 0, pointerType: "mouse", isPrimary: true };
          el.dispatchEvent(new PointerEvent("pointerdown", o));
          el.dispatchEvent(new MouseEvent("mousedown", o));
          el.dispatchEvent(new PointerEvent("pointerup", o));
          el.dispatchEvent(new MouseEvent("mouseup", o));
          el.dispatchEvent(new MouseEvent("click", o));
        });
        await until(page, () => document.querySelector('[role=tab][aria-selected=true]')?.textContent.includes("API Documentation"), undefined, 1500);
        // Step changes in the invest dialog fade to a blank panel: pin contents.
        await addStyle(page, "__rec_dialog", "[role=dialog] [style*=opacity]{opacity:1!important;transform:none!important}");
        await h.beat(350);
      },
      async run(h) {
        const { page } = h;
        await press(h, page.getByRole("button", { name: "Hire agent" }), { move: 200 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(350);
        const input = dialog.locator('input[type="number"]').first();
        await press(h, input, { move: 120, hold: 30 });
        await page.keyboard.press("ControlOrMeta+A");
        await input.pressSequentially("45", { delay: 30 });
        await h.beat(200);
        const total = await dialog.getByText(/^0\.450000 SOL$/).first().boundingBox().catch(() => null);
        if (total) await mv(h, total.x + total.width + 24, total.y + total.height / 2, 200);
        await h.beat(950);
      },
    },
    {
      key: "invest",
      title: "Invest in an agent: two-step share purchase",
      priority: 3,
      async transitionIn(h) {
        const { page } = h;
        // Paying needs a wallet: close the hire dialog on camera.
        const dialog = page.getByRole("dialog");
        await press(h, dialog.getByRole("button", { name: "Cancel" }), { move: 180 });
        await dialog.waitFor({ state: "hidden" }).catch(() => {});
      },
      async run(h) {
        const { page } = h;
        await press(h, page.getByRole("button", { name: "Invest", exact: true }), { move: 200 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(600);
        const cont = await dialog.getByRole("button", { name: /Continue to Investment/i }).boundingBox();
        await mv(h, cont.x + cont.width / 2, cont.y + cont.height / 2, 200);
        await page.mouse.click(cont.x + cont.width / 2, cont.y + cont.height / 2, { delay: 50 });
        const amount = page.getByLabel(/Investment Amount/i);
        await Promise.all([
          page.waitForFunction(() => {
            const i = document.querySelector("[role=dialog] input[type=number]");
            return i && i.getBoundingClientRect().width > 0;
          }, undefined, { polling: "raf", timeout: 5000 }),
          mv(h, cont.x + 110, cont.y - 30, 260),
        ]);
        const ab = await amount.boundingBox();
        await mv(h, ab.x + Math.min(120, ab.width / 2), ab.y + ab.height / 2, 90);
        await page.mouse.click(ab.x + Math.min(120, ab.width / 2), ab.y + ab.height / 2);
        await amount.fill("");
        await amount.pressSequentially("250", { delay: 35 });
        const shares = await dialog.getByText(/approximately/i).first().boundingBox().catch(() => null);
        if (shares) await mv(h, shares.x + shares.width + 24, shares.y + shares.height / 2, 200);
        await h.beat(950);
      },
    },
    {
      key: "token-activity",
      title: "Performance metrics, agent token chart, live activity",
      priority: 4,
      async transitionIn(h) {
        const { page } = h;
        // Investing needs a wallet too: close the dialog (its X) and scroll down.
        // The scroll starts with the dialog's close animation (overlapped).
        const dialog = page.getByRole("dialog");
        // (the page is aria-hidden behind the dialog: a CSS locator, not a role)
        const y = await yFor(page.locator(":is(h1,h2,h3)", { hasText: /Performance Metrics/i }), NAV_H + 10);
        // The page's smooth-scroll is stopped while the dialog is open, so the
        // glide can only start once it unmounts: shorten the close animation
        // and start the glide (and the cursor move) right as it ends.
        await addStyle(page, "__rec_close", "[data-state=closed]{animation-duration:90ms!important}");
        await press(h, dialog.getByRole("button", { name: "Close" }), { move: 160, hold: 40 });
        // Wait for the unmount inside the page (no round-trip), then glide at once.
        await Promise.all([
          page.evaluate(() => new Promise((res) => {
            const t0 = performance.now();
            const chk = () => (document.querySelector("[role=dialog]") && performance.now() - t0 < 1500
              ? requestAnimationFrame(chk) : requestAnimationFrame(res));
            chk();
          })).then(() => glide(page, y, 460)),
          mv(h, 1240, 420, 360),
        ]);
        const now = await page.evaluate(() => scrollY);
        if (Math.abs(now - y) > 4) await glide(page, y, 150);
      },
      async run(h) {
        const { page } = h;
        await h.beat(600);
        const tokenCard = page.locator("h3", { hasText: /^Agent Token$/ }).locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
        await h.glide(tokenCard, { offset: 200, ms: 350 });
        const chart = tokenCard.locator('svg[viewBox="0 0 100 100"]').first();
        const svg = await chart.boundingBox();
        const pts = await chart.locator("path").first().evaluate((p) => {
          const xy = [...p.getAttribute("d").matchAll(/[ML]\s*([\d.]+),([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
          const line = xy.filter((q, i) => i === 0 || q[0] > xy[i - 1][0]);
          const step = Math.max(1, Math.ceil(line.length / 9));
          return line.filter((_, i) => i % step === 0 || i === line.length - 1);
        }).catch(() => null);
        if (svg && pts) {
          await mv(h, svg.x + 4, svg.y + (svg.height * pts[0][1]) / 100, 160);
          for (const [x, y] of pts.slice(1)) await mv(h, svg.x + (svg.width * x) / 100, svg.y + (svg.height * y) / 100, 45);
        }
        const feed = page.locator("h3", { hasText: /^Live Activity$/ });
        const fb = await feed.boundingBox();
        if (fb) {
          await mv(h, fb.x + 60, fb.y + 70, 200);
          await mv(h, fb.x + 60, fb.y + 240, 360);
        }
        await h.beat(200);
      },
    },
    {
      key: "api",
      title: "API docs and playground: send a request",
      priority: 5,
      async transitionIn(h) {
        const { page } = h;
        // The playground fakes ~1.8 s of latency with a timer: shorten one-shot
        // timers of 0.8-3 s so no spinner is filmed (intervals untouched).
        await page.evaluate(() => {
          const st = window.setTimeout;
          window.setTimeout = (fn, ms, ...a) => st(fn, ms >= 800 && ms <= 3000 ? 120 : ms, ...a);
        });
        await addStyle(page, "__rec_tabs", "[role=tabpanel] > *{opacity:1!important;transform:none!important}");
        await mv(h, 1240, 300, 140);
        // Long scroll past the activity feed: ease-out so the tab bar settles.
        await glideOut(page, await yFor(page.getByRole("tab", { name: "API Documentation" }), NAV_H + 12), 650);
      },
      async run(h) {
        const { page } = h;
        await h.beat(550);
        await press(h, page.getByRole("tab", { name: "API Playground" }), { move: 200, hold: 50 });
        await h.wait(60);
        const ta = page.locator("textarea").first();
        await press(h, ta, { move: 180, hold: 30 });
        await ta.fill("");
        await ta.pressSequentially('{"input":"refactor auth module"}', { delay: 14 });
        await press(h, page.getByRole("button", { name: /Send request/i }), { move: 200 });
        await page.getByText(/taskId/).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
        await h.beat(1300);
      },
    },
  ],
};

// Narrative order is encoded in priority (compose sorts by it): browse -> hire
// -> invest -> token-activity -> api. Lowest-priority (api) is dropped first.
export default {
  take,
  url: `${BASE}/`,
  target: 26,
  waitUntil: "domcontentloaded",
  pacing: { featureLead: 150, heroDwell: 1100 },
  posterFrom: { segment: "marketing", at: 1 },
  beforeEach: installCurtain,
  marketing: {
    async before(h) {
      // Trigger every scroll-reveal off camera so each slide is fully legible.
      const { page } = h;
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 500) {
        await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
        await h.wait(120);
      }
      await h.wait(700);
      await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "*{scroll-behavior:auto!important}";
        document.head.appendChild(st);
        scrollTo({ top: 0, behavior: "instant" });
      });
      await h.wait(400);
    },
    async run(h) {
      const { page } = h;
      // Hero is held by pacing.heroDwell; type the query the browse clip opens on.
      const box = page.getByLabel("Search agents");
      await box.focus();
      await box.pressSequentially("Development", { delay: 22 });
      await h.beat(150);
      await h.slides([
        {
          at: "#two-sided", offset: NAV_H + 10, hold: 150, cut: true, settle: 200,
          async interact() {
            const cards = page.locator("#two-sided h3");
            await h.hover(cards.first(), 100);
            await h.hover(cards.nth(1), 130);
          },
        },
        { at: "#categories", offset: NAV_H + 20, hold: 450 },
        { at: "#how-it-works", offset: NAV_H + 10, hold: 430 },
        // A cut, not a glide: gliding showed the builders card before its reveal.
        { at: "#list-agent", offset: NAV_H + 10, hold: 600, cut: true, settle: 250 },
      ].map((x) => ({ ms: 260, ...x })), { settle: 150 });
    },
  },
  features: [
    {
      key: "browse",
      title: "Search results, rating filter, sort, open an agent",
      priority: 1,
      url: `${BASE}/agents/?query=Development`,
      async before(h) {
        await until(h.page, () => /Found 9 results/.test(document.body.innerText));
        // The grid shrink animates scale/transform (renders stretched): disable it.
        await h.page.addStyleTag({ content: "main *{animation:none!important;transition-property:opacity,background-color,border-color,color!important;transform:none!important}" });
        // The 'Try agent' click is filmed but its navigation is cancelled (capture
        // phase, before the app's link handler): the clip ends on the click frame
        // and never records the unrendered agent route. Hire opens on that page.
        await h.page.evaluate(() => document.addEventListener("click", (e) => {
          if (e.target.closest && e.target.closest('a[href="/agents/1/"]')) { e.preventDefault(); e.stopPropagation(); }
        }, true));
        await h.moveTo(1250, 150, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(250);
        // One rating filter (9 -> 6 results), then sort the filtered set: no
        // redundant second filter and no clear-filters re-layout on camera.
        // Raw mouse click: Playwright's actionability checks on the chip held the
        // frame ~0.7 s. The list updates ~0.3 s later; point at the count meanwhile.
        const count = await page.getByText(/Found \d+ results/).first().boundingBox();
        await h.hover(page.getByText("4.5+", { exact: true }), 220);
        await page.mouse.down();
        await h.wait(60);
        await page.mouse.up();
        if (count) await h.moveTo(count.x + count.width * 0.6, count.y + count.height / 2, 380);
        await until(page, () => /Found 6 results/.test(document.body.innerText), undefined, 2000);
        await h.beat(650);
        const sort = page.locator("select").filter({ has: page.locator('option[value="rating"]') }).first();
        await h.hover(sort, 200);
        await sort.selectOption("rating");
        await h.beat(750);
        const tryAgent = page.locator('a[href="/agents/1/"]').filter({ hasText: "Try agent" });
        await h.hover(tryAgent, 260);
        await h.wait(80);
        await page.mouse.down();
        await h.wait(90);
        await page.mouse.up();
        // Navigation is cancelled in before(): end just after the press registers.
        await h.wait(100);
      },
    },
    {
      key: "hire",
      title: "Hire an agent: buy credits with a live total",
      priority: 2,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        const b = await h.page.getByRole("button", { name: "Hire agent" }).boundingBox();
        await h.moveTo(b.x + b.width + 120, b.y + b.height / 2, 16);
      },
      async run(h) {
        const { page } = h;
        // Landing beat on the agent header (name, price, rating, Hire/Invest).
        await h.beat(400);
        await h.click(page.getByRole("button", { name: "Hire agent" }), { pause: 0 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(450);
        const input = dialog.locator('input[type="number"]').first();
        await input.click({ clickCount: 3 });
        await input.pressSequentially("45", { delay: 30 });
        // Paying needs a wallet (the static demo spins forever), so the clip ends
        // on the computed result: the cursor points at the updated total and Pay label.
        await h.beat(250);
        // Park the cursor just right of the updated total (not over the text).
        const total = await dialog.getByText(/^0\.450000 SOL$/).first().boundingBox().catch(() => null);
        if (total) await h.moveTo(total.x + total.width + 24, total.y + total.height / 2, 200);
        await h.beat(800);
      },
    },
    {
      key: "invest",
      title: "Invest in an agent: two-step share purchase",
      priority: 3,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        // The dialog's step change fades the old step out to a blank panel, then
        // fades step 2 in: pin step contents to full opacity so no blank frame shows.
        await h.page.addStyleTag({ content: "[role=dialog] [style*=opacity]{opacity:1!important;transform:none!important}" });
        const b = await h.page.getByRole("button", { name: "Invest", exact: true }).boundingBox();
        await h.moveTo(b.x + b.width / 2 - 40, b.y + b.height / 2, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: "Invest", exact: true }), { pause: 0, move: 90 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(650);
        // Raw click as soon as the cursor lands (Playwright's click held ~0.5 s).
        const cont = await dialog.getByRole("button", { name: /Continue to Investment/i }).boundingBox();
        await h.moveTo(cont.x + cont.width / 2, cont.y + cont.height / 2, 200);
        await page.mouse.click(cont.x + cont.width / 2, cont.y + cont.height / 2, { delay: 50 });
        const amount = page.getByLabel(/Investment Amount/i);
        // Head for where the amount field appears while step 1 hands over, then
        // click it as soon as it renders: raw click, no actionability hold.
        await Promise.all([
          page.waitForFunction(() => {
            const i = document.querySelector('[role=dialog] input[type=number]');
            return i && i.getBoundingClientRect().width > 0;
          }, undefined, { polling: "raf", timeout: 5000 }),
          h.moveTo(cont.x + 110, cont.y - 30, 260),
        ]);
        const ab = await amount.boundingBox();
        await h.moveTo(ab.x + Math.min(120, ab.width / 2), ab.y + ab.height / 2, 90);
        await page.mouse.click(ab.x + Math.min(120, ab.width / 2), ab.y + ab.height / 2);
        await amount.fill("");
        await amount.pressSequentially("250", { delay: 35 });
        // Investing needs a wallet; end on the computed "approximately 25.00 shares".
        const shares = await dialog.getByText(/approximately/i).first().boundingBox().catch(() => null);
        if (shares) await h.moveTo(shares.x + shares.width + 24, shares.y + shares.height / 2, 200);
        await h.beat(800);
      },
    },
    {
      key: "token-activity",
      title: "Performance metrics, agent token chart, live activity",
      priority: 4,
      url: `${BASE}/agents/1/`,
      async before(h) {
        const { page } = h;
        await agentReady(page);
        // Same tab state as the api clip: never show Agent Interface selected.
        await page.getByRole("tab", { name: "API Documentation" }).click();
        await h.jump(hd(page, /Performance Metrics/i), { offset: NAV_H + 10 });
        await until(page, () => {
          const head = [...document.querySelectorAll("h3")].find((e) => e.textContent.trim() === "Live Activity");
          const li = [...(head?.closest(".rounded-lg")?.querySelectorAll("li") || [])];
          return li.length >= 8 && li.every((r) => Number(getComputedStyle(r).opacity) >= 0.99);
        }, undefined, 4000);
        await h.moveTo(1240, 420, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(600);
        const tokenCard = page.locator("h3", { hasText: /^Agent Token$/ }).locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
        await h.glide(tokenCard, { offset: 200, ms: 350 });
        // Trace the price line (the chart has no tooltip), then point at the feed.
        const chart = tokenCard.locator('svg[viewBox="0 0 100 100"]').first();
        const svg = await chart.boundingBox();
        // Points of the price line, read from its path (x 0..100 in viewBox units).
        const pts = await chart.locator("path").first().evaluate((p) => {
          const xy = [...p.getAttribute("d").matchAll(/[ML]\s*([\d.]+),([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
          const line = xy.filter((q, i) => i === 0 || q[0] > xy[i - 1][0]);
          return line.filter((_, i) => i % 4 === 0 || i === line.length - 1);
        }).catch(() => null);
        if (svg && pts) {
          await h.moveTo(svg.x + 4, svg.y + (svg.height * pts[0][1]) / 100, 160);
          for (const [x, y] of pts.slice(1)) await h.moveTo(svg.x + (svg.width * x) / 100, svg.y + (svg.height * y) / 100, 55);
        }
        const feed = page.locator("h3", { hasText: /^Live Activity$/ });
        const fb = await feed.boundingBox();
        if (fb) {
          await h.moveTo(fb.x + 60, fb.y + 70, 220);
          await h.moveTo(fb.x + 60, fb.y + 260, 450);
        }
        await h.beat(250);
      },
    },
    {
      key: "api",
      title: "API docs and playground: send a request",
      priority: 5,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        // The playground fakes ~1.8 s of latency with a timer: shorten one-shot
        // timers of 0.8-3 s so the spinner is not filmed (intervals untouched).
        await h.page.evaluate(() => {
          const st = window.setTimeout;
          window.setTimeout = (fn, ms, ...a) => st(fn, ms >= 800 && ms <= 3000 ? 120 : ms, ...a);
        });
        // Tab panels slide/fade in (framer-motion inline opacity + translateX):
        // pin them to their final state so the playground appears at once.
        await h.page.addStyleTag({ content: "[role=tabpanel] > *{opacity:1!important;transform:none!important}" });
        await h.page.getByRole("tab", { name: "API Documentation" }).click();
        await h.jump(h.page.getByRole("tab", { name: "API Documentation" }), { offset: NAV_H + 12 });
        await h.waitForStill(800);
        await h.moveTo(1240, 300, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(650);
        const pg = await page.getByRole("tab", { name: "API Playground" }).boundingBox();
        await h.moveTo(pg.x + pg.width / 2, pg.y + pg.height / 2, 200);
        await page.mouse.click(pg.x + pg.width / 2, pg.y + pg.height / 2, { delay: 50 });
        await h.wait(60);
        const ta = page.locator("textarea").first();
        await h.click(ta, { pause: 0, move: 180 });
        await ta.fill("");
        await ta.pressSequentially('{"input":"refactor auth module"}', { delay: 14 });
        await h.click(page.getByRole("button", { name: /Send request/i }), { pause: 0 });
        await page.getByText(/taskId/).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
        await h.beat(1100);
      },
    },
  ],
};
