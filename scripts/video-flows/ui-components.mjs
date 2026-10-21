// v3: plan target 40 s, lowered to 36 s in round 3 (all features in, real total ~36 s). Demo data = the static site's own sample data
// (data/requests, data/library, built-in themes); nothing personal is shown.
// Live: GitLab Pages static export (dark by default). Editorial hero -> the
// "Most libraries..." headline -> the live specimens, operated (type, drag,
// toggle) -> the six themes -> one theme (Neon) applied to real components,
// light then dark -> the playground (pre-warmed so no spinner): pick Button,
// edit its JSX and props live, open the generated code and copy it.
// The hero is held for pacing.heroDwell before run() starts; scrolls are paced.
// Privacy (round 2): the owner's name (masthead byline, "Typeset ·" colophon,
// footer credit) is hidden on every page off camera by hideOwnerName().
import { CURSOR_SCRIPT } from "./_lib/helpers.mjs";
const BASE = "https://ui-components-5218c2.gitlab.io";

// The recorder's cursor is too small to read at review size; make it bolder.
const CURSOR_CSS = `#__rec_cursor{width:30px!important;height:30px!important;margin:-15px 0 0 -15px!important;
border:3px solid #fff!important;box-shadow:0 0 0 2px rgba(0,0,0,.9),0 2px 12px rgba(0,0,0,.6)!important;
transition:background .08s ease!important}
[data-rec-shown] > *{opacity:1!important;transform:none!important}
[data-theme-row]{opacity:1!important;transform:none!important;translate:none!important}
.monaco-editor .suggest-widget,.monaco-editor .parameter-hints-widget,.monaco-hover{display:none!important}
[data-tx-line],[data-tx-worktable],[data-tx-swatch]{opacity:1!important;transform:none!important;translate:none!important;scale:none!important}
[data-testid="rendered-component-button"]{zoom:1.6}`;

/**
 * The deployed build mounts every Monaco editor with the light "vs" theme inside
 * the dark UI (the repo already has a dark editor theme, not yet deployed), and
 * the editors pop IntelliSense over the edit. Keep every editor dark and quiet:
 * poll for new editors and restyle them before they paint more than a frame.
 */
const quietDarkMonaco = () => {
  if (window.__recMonaco) return;
  window.__recMonaco = setInterval(() => {
    const m = window.monaco;
    if (!m?.editor) return;
    if (!window.__recTheme) {
      m.editor.defineTheme("rec-dark", {
        base: "vs-dark", inherit: true, rules: [],
        colors: { "editor.background": "#0b0f19", "editor.lineHighlightBackground": "#111827", "editorLineNumber.foreground": "#6b7280" },
      });
      window.__recTheme = true;
      const setTheme = m.editor.setTheme.bind(m.editor);
      try {
        // Remounted editors must never paint the light theme, not even for a frame.
        m.editor.setTheme = () => setTheme("rec-dark");
        const create = m.editor.create.bind(m.editor);
        m.editor.create = (el, opts = {}, ov) => create(el, { ...opts, theme: "rec-dark" }, ov);
      } catch {}
      // No red squiggles: the JSX field accepts plain text, the TS checker does not.
      for (const d of [m.languages?.typescript?.typescriptDefaults, m.languages?.typescript?.javascriptDefaults]) {
        d?.setDiagnosticsOptions?.({ noSemanticValidation: true, noSyntaxValidation: true, noSuggestionDiagnostics: true });
      }
      setTheme("rec-dark");
    }
    if (document.querySelector(".monaco-editor.vs")) m.editor.setTheme("rec-dark");
    for (const e of m.editor.getEditors?.() ?? []) {
      // React re-applies its options on every render, so check each tick.
      const ro = e.getRawOptions?.() ?? {};
      if (ro.quickSuggestions !== false) {
        e.updateOptions({ quickSuggestions: false, suggestOnTriggerCharacters: false, wordBasedSuggestions: "off", parameterHints: { enabled: false }, hover: { enabled: false } });
      }
      // The generated-code panel is capped at 40% height: a slightly smaller font
      // lets the whole component (export ... </Button>) fit.
      if (ro.fontSize !== 12.5 && /export default function/.test(e.getValue())) e.updateOptions({ fontSize: 12.5, lineHeight: 17 });
    }
  }, 30);
};

/** Hide every element whose own text carries the owner's name; re-checked so hydration cannot bring it back. */
const hideOwnerName = () => {
  const scrub = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (/Miguel|Louren/i.test(n.nodeValue) && n.parentElement && n.parentElement.style.visibility !== "hidden") {
        n.parentElement.style.visibility = "hidden";
      }
    }
  };
  scrub();
  if (!window.__recScrub) window.__recScrub = setInterval(scrub, 30);
};

/** Click without Playwright's actionability waits (they cost ~0.5 s each in a slow headless render). */
async function fast(h, locator, ms = 220) {
  const el = locator.first();
  await el.waitFor({ state: "visible" });
  const b = await el.boundingBox();
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, ms);
  await h.page.mouse.down();
  await h.page.mouse.up();
}

/** Off-camera setup; re-run after any full page load (the theme rows are plain links). */
async function setup(page) {
  await page.addStyleTag({ content: CURSOR_CSS });
  await page.evaluate(hideOwnerName);
  // A hidden iframe pre-loads /playground and opens Button's Properties there, so
  // the route, Monaco and its TS worker are cached before the camera gets there.
  await page.evaluate(() => {
    document.querySelector("main input")?.closest(".grid")?.setAttribute("data-rec-shown", "");
    if (document.getElementById("__rec_warm")) return;
    const f = document.createElement("iframe");
    f.id = "__rec_warm";
    f.src = "/playground/";
    f.setAttribute("aria-hidden", "true");
    f.style.cssText = "position:fixed;left:-20000px;top:0;width:1280px;height:800px;border:0;opacity:0;pointer-events:none";
    document.body.appendChild(f);
    f.addEventListener("load", () => {
      const d = f.contentDocument;
      const find = (re) => [...d.querySelectorAll("button")].find((b) => re.test(b.textContent.trim()));
      let n = 0;
      const t = setInterval(() => {
        if (++n > 200) return clearInterval(t);
        const btn = find(/^Button\s*v1/);
        if (!btn) return;
        btn.click();
        setTimeout(() => find(/^Properties$/)?.click(), 600);
        clearInterval(t);
      }, 100);
    });
  });
  await page.evaluate(quietDarkMonaco);
}

/**
 * Radix sliders preventDefault() their pointerdown, which suppresses the mouse
 * events the recorder cursor listens to, so during a drag the drawn cursor stayed
 * put while the thumb moved. Follow pointer events too.
 */
const followPointer = () => {
  if (window.__recPointer) return;
  window.__recPointer = true;
  const paint = (e) => {
    const c = document.getElementById("__rec_cursor");
    if (!c) return;
    const down = (e.buttons & 1) === 1;
    c.style.transform = `translate(${e.clientX}px,${e.clientY}px) scale(${down ? 0.7 : 1})`;
    c.style.background = down ? "rgba(255,180,0,.75)" : "rgba(20,20,20,.35)";
  };
  window.addEventListener("pointermove", paint, true);
  window.addEventListener("pointerdown", paint, true);
  window.addEventListener("pointerup", paint, true);
};

/** Operate the live specimens: type, then one quick slider drag. */
async function specimens(h) {
  const { page } = h;
  const input = page.getByPlaceholder("Type to typeset");
  await fast(h, input, 240);
  await page.keyboard.type("Hi", { delay: 40 });
  const thumb = page.locator("main [role=slider]").first();
  const tb = await thumb.boundingBox();
  const track = await thumb.evaluate((el) => {
    for (let n = el.parentElement; n; n = n.parentElement) {
      const r = n.getBoundingClientRect();
      if (r.width > 200) return { x: r.x, y: r.y, width: r.width, height: r.height };
    }
    return null;
  });
  if (tb && track) {
    await page.evaluate(followPointer);
    await h.moveTo(tb.x + tb.width / 2, tb.y + tb.height / 2, 100);
    await page.mouse.down();
    await h.moveTo(track.x + tb.width / 2 + 0.81 * (track.width - tb.width), tb.y + tb.height / 2, 320);
    await page.mouse.up();
  }
  // Land the interaction: the final value stays on screen before the next slide.
  await h.beat(420);
}

/**
 * A click that lands as a hard cut: freeze the current frame (a static clone of
 * the page on top), click, wait until `ready` is visible and the page is still,
 * then drop the freeze. Hides route-loading frames ("Loading component...") and
 * half-faded entrance animations that would otherwise flash between two pages.
 */
async function cutClick(h, locator, ready, ms = 240) {
  const { page } = h;
  const el = locator.first();
  await el.waitFor({ state: "visible" });
  const b = await el.boundingBox();
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, ms);
  await page.evaluate(() => {
    const f = document.createElement("div");
    f.id = "__rec_freeze";
    const bg = getComputedStyle(document.body).backgroundColor;
    // Inside <body> and with its class + typography, or the frozen frame falls
    // back to the browser's default font (the next/font class lives on <body>).
    const bs = getComputedStyle(document.body);
    f.className = document.body.className;
    f.style.cssText = `position:fixed;inset:0;overflow:hidden;z-index:2147483640;pointer-events:none;background:${bg}`;
    f.style.fontFamily = bs.fontFamily;
    f.style.color = bs.color;
    f.style.lineHeight = bs.lineHeight;
    const inner = document.createElement("div");
    inner.style.cssText = `position:absolute;left:0;top:${-window.scrollY}px;width:100%`;
    for (const n of [...document.body.children]) {
      if (n.id === "__rec_cursor" || n.id === "__rec_freeze" || n.tagName === "SCRIPT" || n.id === "__rec_warm") continue;
      inner.appendChild(n.cloneNode(true));
    }
    f.appendChild(inner);
    document.body.appendChild(f);
  });
  await page.mouse.down();
  await page.mouse.up();
  await ready.first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await h.waitForStill(700);
  await page.evaluate(() => document.getElementById("__rec_freeze")?.remove());
}

/** Like cutClick, but runs `act` (DOM clicks, no cursor travel) behind the frozen frame. */
async function cutTo(h, act, ready) {
  const { page } = h;
  await page.evaluate(() => {
    const f = document.createElement("div");
    f.id = "__rec_freeze";
    const bg = getComputedStyle(document.body).backgroundColor;
    // Inside <body> and with its class + typography, or the frozen frame falls
    // back to the browser's default font (the next/font class lives on <body>).
    const bs = getComputedStyle(document.body);
    f.className = document.body.className;
    f.style.cssText = `position:fixed;inset:0;overflow:hidden;z-index:2147483640;pointer-events:none;background:${bg}`;
    f.style.fontFamily = bs.fontFamily;
    f.style.color = bs.color;
    f.style.lineHeight = bs.lineHeight;
    const inner = document.createElement("div");
    inner.style.cssText = `position:absolute;left:0;top:${-window.scrollY}px;width:100%`;
    for (const n of [...document.body.children]) {
      if (n.id === "__rec_cursor" || n.id === "__rec_freeze" || n.tagName === "SCRIPT" || n.id === "__rec_warm") continue;
      inner.appendChild(n.cloneNode(true));
    }
    f.appendChild(inner);
    document.body.appendChild(f);
  });
  await act();
  await ready.first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await h.waitForStill(700);
  await page.evaluate(() => document.getElementById("__rec_freeze")?.remove());
}

/** Features: no entrance/cross-fade animations, so no half-faded frames on camera. */
const calm = (h) => h.page.emulateMedia({ reducedMotion: "reduce" }).catch(() => {});

/** Same as quietDarkMonaco/hideOwnerName/followPointer + CURSOR_CSS, as one init script (every full load of the take). */
const TAKE_INIT = `(() => {
  const css = ${JSON.stringify(CURSOR_CSS)};
  const boot = () => {
    if (!document.getElementById("__rec_css")) {
      const st = document.createElement("style");
      st.id = "__rec_css";
      st.textContent = css;
      document.head.appendChild(st);
    }
    (${hideOwnerName.toString()})();
    (${quietDarkMonaco.toString()})();
    (${followPointer.toString()})();
    // Monaco's mount placeholder reads as a spinner: hide it (the panel is empty for a moment instead).
    if (!window.__recInit) window.__recInit = setInterval(() => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!/^\\s*(Initializing|Loading) editor/i.test(n.nodeValue)) continue;
        let el = n.parentElement;
        if (el?.parentElement && el.parentElement.textContent.trim().length < 40) el = el.parentElement;
        if (el && el.style.visibility !== "hidden") el.style.visibility = "hidden";
      }
    }, 30);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();`;

/** Lock the playground framing (opening the code panel reflows the page); release() before leaving. */
const lockScroll = (h) => h.page.evaluate(() => {
  window.__lockY = window.scrollY;
  const fix = () => { if (Math.abs(window.scrollY - window.__lockY) > 1) window.scrollTo(0, window.__lockY); };
  window.addEventListener("scroll", fix, true);
  const t = setInterval(fix, 16);
  window.__unlock = () => { window.removeEventListener("scroll", fix, true); clearInterval(t); };
});
const unlockScroll = (h) => h.page.evaluate(() => window.__unlock?.()).catch(() => {});
const NAV_SETTLE = 250;
const recursor = (h) => h.page.evaluate(CURSOR_SCRIPT).catch(() => {});
const headerLink = (page, name) => page.locator("header a").filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first();

/** The playground's edit sequence (shared by clip mode and the take). */
async function playgroundEdit(h) {
  const { page } = h;
  const edit = page.locator(".monaco-editor .view-line", { hasText: "Primary" }).first();
  await edit.waitFor({ state: "visible" });
  const wb = await edit.boundingBox();
  const wordBox = await edit.locator("span", { hasText: "Primary" }).last().boundingBox().catch(() => null);
  const tx = wordBox ? wordBox.x + wordBox.width / 2 : wb.x + 30;
  await h.moveTo(tx, wb.y + wb.height / 2, 200);
  await page.mouse.dblclick(tx, wb.y + wb.height / 2);
  await page.keyboard.type("Get started", { delay: 45 });
  await page.keyboard.press("Escape");
  await h.beat(550);
  const variant = page.locator("main select").first();
  const size = page.locator("main select").nth(1);
  await h.hover(variant, 200);
  await variant.selectOption("secondary");
  await h.wait(600);
  await h.hover(size, 180);
  await size.selectOption("lg");
  await h.wait(600);
  await fast(h, page.getByRole("button", { name: "Code", exact: true }), 200);
  const code = page.locator(".monaco-editor").filter({ has: page.locator(".view-line", { hasText: "export default" }) }).first();
  await code.waitFor({ timeout: 6000 }).catch(() => {});
  const dy = await page.evaluate(() => {
    const e = window.monaco?.editor.getEditors().find((x) => /export default function/.test(x.getValue()));
    if (!e) return 0;
    const lines = e.getValue().split("\n");
    const first = lines.findIndex((l) => /export default function/.test(l)) + 1;
    return Math.max(0, e.getTopForLineNumber(first) - 4 - e.getScrollTop());
  });
  const cb = await code.boundingBox();
  if (cb && dy > 0) {
    await h.moveTo(cb.x + cb.width / 2, Math.min(cb.y + 60, 760), 180);
    await page.mouse.wheel(0, dy);
  }
  await h.beat(900);
  await fast(h, page.getByRole("button", { name: "Copy", exact: true }), 200);
  await page.getByText("Code copied to clipboard").first().waitFor({ timeout: 4000 }).catch(() => {});
  await h.beat(600);
}

/**
 * Continuous take (v4): one shot, the v3 content joined by the site's own
 * navigation. The order swaps theme and playground (v3: playground, theme) so the
 * landing page hands over with one natural click: its "6 themes" list -> Neon.
 *
 * landing (hero, specimens operated, the 6 themes) --click "Neon"--> Neon theme
 * (light -> dark -> CSS) --header Playground--> playground (Button: JSX, props,
 * code, copy) --header Requests--> failed proposal -> back -> passing proposal ->
 * history --header Library--> search, BaseButton, code --header Components-->
 * Slider: drag, code.
 */
const take = {
  target: 36,
  posterFrom: { feature: "playground", at: -0.6 },
  async before(h) {
    const { page } = h;
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE }).catch(() => {});
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(TAKE_INIT);
    // Lead-in (trimmed, not a cut): visit every page the take uses so routes,
    // chunks, Monaco and its TS worker are in the HTTP cache.
    await page.goto(`${BASE}/playground/`, { waitUntil: "domcontentloaded" });
    await page.locator("main button", { hasText: /^Button$/ }).first().click({ timeout: 15000 });
    await page.getByRole("button", { name: "Properties", exact: true }).click();
    await page.locator(".monaco-editor .view-line", { hasText: "Primary" }).first().waitFor({ timeout: 20000 });
    await page.getByRole("button", { name: "Code", exact: true }).click().catch(() => {});
    await h.wait(1200);
    for (const p of ["/themes/?theme=neon", "/requests/?request=req-3ee6bec0c5af", "/requests/?request=req-80f75c51b822", "/library/?id=my-cv--basebutton", "/components/?component=slider", "/components/", "/library/", "/requests/"]) {
      await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" }).catch(() => {});
    }
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" }).catch(() => {});
    await h.waitForStill(2000);
    await page.evaluate(() => document.querySelector("main input")?.closest(".grid")?.setAttribute("data-rec-shown", ""));
    await page.evaluate(() => window.scrollTo(0, 0));
    await h.wait(300);
    await h.moveTo(1180, 760, 16);
  },
  route: [
    {
      key: "marketing",
      kind: "marketing",
      title: "Landing page",
      priority: 0,
      async run(h) {
        const { page } = h;
        const input = page.getByPlaceholder("Type to typeset");
        await h.glide(input.locator("xpath=ancestor::div[contains(@class,'grid')][1]"), { offset: 185, ms: 420 });
        await specimens(h);
        await h.glide(page.getByRole("heading", { name: "6 themes, one source." }), { offset: 110, ms: 450 });
        await h.beat(600);
      },
    },
    {
      key: "theme",
      title: "One theme (Neon) on real components, light then dark",
      priority: 2,
      async transitionIn(h) {
        const { page } = h;
        const neon = page.locator("main a[href='/themes/?theme=neon']").first();
        await h.glide(neon, { offset: 430, ms: 380 });
        await h.nav(neon, { arrive: page.getByText("Dark Mode", { exact: true }), hold: 0, move: 240, settleMax: NAV_SETTLE });
        await recursor(h);
      },
      async run(h) {
        const { page } = h;
        await h.beat(500);
        await fast(h, page.getByText("Dark Mode", { exact: true }).first(), 240);
        await h.beat(900);
        await fast(h, page.getByText("CSS", { exact: true }), 220);
        await h.beat(800);
      },
    },
    {
      key: "playground",
      title: "Playground: edit a Button's JSX and props, copy the code",
      priority: 1,
      async transitionIn(h) {
        const { page } = h;
        await h.nav(headerLink(page, "Playground"), { arrive: page.locator("main button", { hasText: /^Button$/ }), hold: 0, move: 240, settleMax: NAV_SETTLE });
        await recursor(h);
      },
      async run(h) {
        const { page } = h;
        await fast(h, page.locator("main button", { hasText: /^Button$/ }), 240);
        await fast(h, page.getByRole("button", { name: "Properties", exact: true }), 220);
        // The glide runs while Monaco mounts (its "Initializing editor..." placeholder is hidden by TAKE_INIT).
        await h.glide(400, { ms: 380 });
        await page.locator(".monaco-editor .view-line", { hasText: "Primary" }).first().waitFor({ timeout: 10000 });
        await lockScroll(h);
        await playgroundEdit(h);
        await unlockScroll(h);
      },
    },
    {
      key: "requests",
      title: "Agent request queue: a failed and a passing proposal",
      priority: 3,
      async transitionIn(h) {
        const { page } = h;
        await page.addStyleTag({ content: `a[href*="request="]:has(.text-danger) .h-28{display:none!important}` });
        await h.nav(headerLink(page, "Requests"), { arrive: page.getByText(/^Validation failed \(/), hold: 150, move: 260, settleMax: NAV_SETTLE });
      },
      async run(h) {
        const { page } = h;
        await fast(h, page.getByText(/^Validation failed \(/), 240);
        await page.getByText("Add loading state to Button").first().waitFor({ state: "visible" });
        await h.beat(250);
        await h.nav(page.getByText("Add loading state to Button").first(), { arrive: page.getByText(/\d+ error\(s\)/), hold: 1000, move: 200, settleMax: NAV_SETTLE });
        await h.nav(page.getByText("All requests").first(), { arrive: page.getByText("Add ThemeToggle"), hold: 0, move: 200, settleMax: NAV_SETTLE });
        await h.nav(page.getByText("Add ThemeToggle").first(), { arrive: page.getByText(/Validation passed/), hold: 700, move: 200, settleMax: NAV_SETTLE });
        await fast(h, page.getByRole("tab", { name: /History/ }).or(page.getByText(/^History \(/)).first(), 200);
        await h.beat(700);
      },
    },
    {
      key: "library",
      title: "Library: imported components with props contracts",
      priority: 4,
      async transitionIn(h) {
        const { page } = h;
        await h.nav(headerLink(page, "Library"), { arrive: page.getByPlaceholder(/Search name, prop/), hold: 100, move: 260, settleMax: NAV_SETTLE });
      },
      async run(h) {
        const { page } = h;
        await fast(h, page.getByPlaceholder(/Search name, prop/), 220);
        await page.keyboard.type("button", { delay: 30 });
        await h.beat(450);
        await h.nav(page.getByText("BaseButton", { exact: true }).first(), { arrive: page.getByText(/^Props \(/), hold: 800, move: 220, settleMax: NAV_SETTLE });
        await fast(h, page.getByRole("tab", { name: "Code" }).or(page.getByRole("button", { name: "Code", exact: true })).first(), 200);
        await h.waitForStill(500);
        await h.beat(700);
      },
    },
    {
      key: "components",
      title: "Component gallery with preview and code",
      priority: 5,
      async transitionIn(h) {
        const { page } = h;
        await h.nav(page.locator("header a[href='/components/']").first(), { arrive: page.locator("main a[href='/components/?component=slider']"), hold: 0, move: 260, settleMax: NAV_SETTLE });
        await h.nav(page.locator("main a[href='/components/?component=slider']").first(), { arrive: page.getByText("Open in Playground"), hold: 150, move: 220, settleMax: NAV_SETTLE });
      },
      async run(h) {
        const { page } = h;
        const thumb = page.locator("main [role=slider]").nth(1);
        const tb = await thumb.boundingBox();
        const track = await thumb.evaluate((el) => {
          for (let n = el.parentElement; n; n = n.parentElement) {
            const r = n.getBoundingClientRect();
            if (r.width > 150) return { x: r.x, width: r.width };
          }
          return null;
        });
        if (tb && track) {
          const y = tb.y + tb.height / 2;
          await h.moveTo(tb.x + tb.width / 2, y, 220);
          await page.mouse.down();
          await h.moveTo(track.x + tb.width / 2 + 0.8 * (track.width - tb.width), y, 300);
          await page.mouse.up();
        }
        await h.beat(350);
        await fast(h, page.getByRole("tab", { name: "Code" }).or(page.getByRole("button", { name: "Code", exact: true })).first(), 200);
        await h.waitForStill(400);
        await h.beat(400);
        await h.hover(page.getByText("Open in Playground").first(), 220);
        await h.beat(600);
      },
    },
  ],
};

export default {
  take,
  url: `${BASE}/`,
  target: 36, // plan 40; every planned feature is in and the cut runs ~36 s (round 3)
  colorScheme: "dark",
  posterFrom: { segment: "marketing", at: 1 },
  async beforeEach(h, seg) {
    await h.page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE }).catch(() => {});
    await setup(h.page);
    if (seg?.kind !== "marketing") await calm(h);
  },
  marketing: {
    async before(h) {
      const { page } = h;
      // Off camera: reload with reduced motion so every scroll-triggered reveal
      // (agent terminal lines, PASS stamps, theme rows) is at rest when the slide cuts in.
      await calm(h);
      await page.reload({ waitUntil: "networkidle" }).catch(() => {});
      await h.waitForStill(2000);
      await setup(page);
      await page.mouse.move(1180, 760);
    },
    async run(h) {
      const { page } = h;
      const input = page.getByPlaceholder("Type to typeset");
      await h.slides([
        { at: input.locator("xpath=ancestor::div[contains(@class,'grid')][1]"), offset: 185, cut: true, settle: 200, hold: 200, interact: specimens },
        { at: page.getByRole("heading", { name: "6 themes, one source." }), offset: 150, cut: true, settle: 150, hold: 1100 },
        { at: page.getByRole("heading", { name: /Components arrive by agent/ }), offset: 130, cut: true, settle: 150, hold: 850 },
      ]);
    },
  },
  pacing: { featureLead: 300 },
  features: [
    {
      key: "playground",
      title: "Playground: edit a Button's JSX and props, copy the code",
      priority: 1,
      url: `${BASE}/playground/`,
      waitUntil: "domcontentloaded", // Monaco workers: never networkidle
      async before(h) {
        const { page } = h;
        await page.getByRole("button", { name: /^Button v1/ }).waitFor({ state: "visible", timeout: 15000 });
        await page.evaluate(quietDarkMonaco).catch(() => {});
        await page.evaluate(() => document.getElementById("__rec_warm")?.remove());
        await page.evaluate(() => window.scrollBy(0, 400));
        await h.wait(300);
        // Off camera: open Button's Properties so Monaco and the TS worker are
        // loaded (no "Initializing editor..." on camera); the clip opens right here.
        await page.locator("main button", { hasText: /^Button$/ }).first().click();
        await page.getByRole("button", { name: "Properties", exact: true }).click();
        await page.locator(".monaco-editor .view-line", { hasText: "Primary" }).first().waitFor({ timeout: 20000 });
        await h.wait(1500);
        await h.waitForStill(1500);
        // Hydration drops the recorder cursor on this route: put it back (it follows the mouse again).
        await page.evaluate(CURSOR_SCRIPT);
        await page.mouse.move(640, 400);
        // Lock the framing: any reflow (opening the code panel) snaps back here.
        await page.evaluate(() => {
          window.__lockY = window.scrollY;
          const fix = () => { if (Math.abs(window.scrollY - window.__lockY) > 1) window.scrollTo(0, window.__lockY); };
          window.addEventListener("scroll", fix, true);
          setInterval(fix, 16);
        });
      },
      async run(h) {
        const { page } = h;
        const edit = page.locator(".monaco-editor .view-line", { hasText: "Primary" }).first();
        await edit.waitFor({ state: "visible" });
        const wb = await edit.boundingBox();
        const wordBox = await edit.locator("span", { hasText: "Primary" }).last().boundingBox().catch(() => null);
        const tx = wordBox ? wordBox.x + wordBox.width / 2 : wb.x + 30;
        await h.moveTo(tx, wb.y + wb.height / 2, 220);
        await page.mouse.dblclick(tx, wb.y + wb.height / 2);
        await page.keyboard.type("Get started", { delay: 55 });
        await page.keyboard.press("Escape");
        await h.beat(800);
        const variant = page.locator("main select").first();
        const size = page.locator("main select").nth(1);
        await h.hover(variant, 220);
        await variant.selectOption("secondary");
        await h.wait(900);
        await h.hover(size, 200);
        await size.selectOption("lg");
        await h.wait(900);
        await fast(h, page.getByRole("button", { name: "Code", exact: true }), 220);
        const code = page.locator(".monaco-editor").filter({ has: page.locator(".view-line", { hasText: "export default" }) }).first();
        await code.waitFor({ timeout: 6000 }).catch(() => {});
        const dy = await page.evaluate(() => {
          const e = window.monaco?.editor.getEditors().find((x) => /export default function/.test(x.getValue()));
          if (!e) return 0;
          const lines = e.getValue().split("\n");
          const first = lines.findIndex((l) => /export default function/.test(l)) + 1;
          return Math.max(0, e.getTopForLineNumber(first) - 4 - e.getScrollTop());
        });
        const cb = await code.boundingBox();
        if (cb && dy > 0) {
          await h.moveTo(cb.x + cb.width / 2, Math.min(cb.y + 60, 760), 200);
          await page.mouse.wheel(0, dy);
        }
        await h.beat(1100);
        const copy = page.getByRole("button", { name: "Copy", exact: true });
        await fast(h, copy, 220);
        await page.getByText("Code copied to clipboard").first().waitFor({ timeout: 4000 }).catch(() => {});
        await h.beat(900);
        // A second component the video shows nowhere else: Switch, its live preview and props.
        await fast(h, page.getByRole("button", { name: /^Switch v1/ }), 220);
        await page.locator(".monaco-editor .view-lines").first().waitFor({ timeout: 4000 }).catch(() => {});
        await h.beat(1000);
      },
    },
    {
      key: "theme",
      title: "One theme (Neon) on real components, light then dark",
      priority: 2,
      url: `${BASE}/themes/?theme=neon`,
      async before(h) {
        const { page } = h;
        await page.getByText("Light Mode", { exact: true }).first().click().catch(() => {});
        await h.waitForStill(1200);
        // Hydration can drop the recorder cursor: put it back, parked mid-page.
        await page.evaluate(CURSOR_SCRIPT);
        await page.mouse.move(640, 380);
      },
      async run(h) {
        const { page } = h;
        // One framing, no scrolling: palettes and the Buttons preview share the frame.
        await h.beat(800);
        await fast(h, page.getByText("Dark Mode", { exact: true }).first(), 260);
        await h.beat(1200);
        await fast(h, page.getByText("CSS", { exact: true }), 240);
        await h.beat(1000);
      },
    },
    {
      key: "requests",
      title: "Agent request queue: a failed and a passing proposal",
      priority: 3,
      url: `${BASE}/requests/`,
      async before(h) {
        // Capture-only: a failed proposal's card preview renders the proposed Button in
        // its disabled "Loading..." state, which reads as a loader on camera. Hide that
        // preview box on failed cards (the badge, description and chips stay).
        await h.page.addStyleTag({ content: `a[href*="request="]:has(.text-danger) .h-28{display:none!important}footer,footer *{opacity:0!important;visibility:hidden!important}` });
        await h.waitForStill(1500);
        await h.page.evaluate(CURSOR_SCRIPT);
        await h.page.mouse.move(640, 420);
      },
      async run(h) {
        const { page } = h;
        await h.beat(500);
        // A rejected proposal first: filter to it, open it, read what the validator says.
        await fast(h, page.getByText(/^Validation failed \(/), 260);
        await page.getByText("Add loading state to Button").first().waitFor({ state: "visible" });
        await h.beat(450);
        await cutClick(h, page.getByText("Add loading state to Button"), page.getByText(/\d+ error\(s\)/), 200);
        await h.beat(1400);
        // Hard cut to a passing proposal (back to the queue + click hidden behind a
        // frozen frame: the full grid was already shown), then its version history.
        await cutTo(h, async () => {
          await page.getByText("All requests").first().evaluate((el) => el.click());
          await page.getByText("Add ThemeToggle").first().waitFor({ state: "visible", timeout: 8000 });
          await page.getByText("Add ThemeToggle").first().evaluate((el) => el.click());
        }, page.getByText(/Validation passed/));
        await h.beat(1000);
        await fast(h, page.getByRole("tab", { name: /History/ }).or(page.getByText(/^History \(/)).first(), 220);
        await h.beat(1000);
      },
    },
    {
      key: "library",
      title: "Library: imported components with props contracts",
      priority: 4,
      url: `${BASE}/library/`,
      async before(h) {
        const { page } = h;
        // Off camera: open BaseButton once so its entry JSON is imported (module
        // cache), then come back: the on-camera click renders with no loading frame.
        await page.getByText("BaseButton", { exact: true }).first().click();
        await page.getByText(/^Props \(/).first().waitFor({ timeout: 10000 });
        await page.locator("main a[href*='library']").filter({ hasText: /^\s*Library\s*$/ }).first().click().catch(() => {});
        await page.getByPlaceholder(/Search name, prop/).waitFor({ timeout: 10000 });
        await h.waitForStill(1500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate(CURSOR_SCRIPT);
        await page.mouse.move(640, 420);
      },
      async run(h) {
        const { page } = h;
        await h.beat(300);
        await h.type(page.getByPlaceholder(/Search name, prop/), "button", 40);
        await h.beat(800);
        await cutClick(h, page.getByText("BaseButton", { exact: true }), page.getByText(/^Props \(/), 240);
        await h.beat(1100);
        await fast(h, page.getByRole("tab", { name: "Code" }).or(page.getByRole("button", { name: "Code", exact: true })).first(), 220);
        await h.waitForStill(600);
        await h.beat(900);
      },
    },
    {
      key: "components",
      title: "Component gallery with preview and code",
      priority: 5,
      // Opens straight on Slider: the carousel's page transition cross-fades two
      // detail pages (ghosted titles), so the clip does not switch components.
      url: `${BASE}/components/?component=slider`,
      async before(h) {
        await h.page.waitForLoadState("networkidle").catch(() => {});
        await h.waitForStill(1500);
        await h.page.evaluate(CURSOR_SCRIPT);
        await h.page.mouse.move(640, 420);
      },
      async run(h) {
        const { page } = h;
        await h.beat(250);
        // Preview beat: drag the live Slider from 50% to 80% (the preview's slider is
        // the one below the Preview tab, not the carousel tile's).
        const thumb = page.locator("main [role=slider]").nth(1);
        const tb = await thumb.boundingBox();
        const track = await thumb.evaluate((el) => {
          for (let n = el.parentElement; n; n = n.parentElement) {
            const r = n.getBoundingClientRect();
            if (r.width > 150) return { x: r.x, width: r.width };
          }
          return null;
        });
        if (tb && track) {
          const y = tb.y + tb.height / 2;
          await page.evaluate(followPointer);
          await h.moveTo(tb.x + tb.width / 2, y, 240);
          await page.mouse.down();
          await h.moveTo(track.x + tb.width / 2 + 0.8 * (track.width - tb.width), y, 300);
          await page.mouse.up();
        }
        await h.beat(350);
        await fast(h, page.getByRole("tab", { name: "Code" }).or(page.getByRole("button", { name: "Code", exact: true })).first(), 220);
        await h.waitForStill(400);
        await h.beat(450);
        await h.hover(page.getByText("Open in Playground").first(), 240);
        await h.beat(700);
      },
    },
  ],
};
