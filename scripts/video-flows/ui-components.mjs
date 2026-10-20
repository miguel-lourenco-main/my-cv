// MIGRATED MECHANICALLY to the segment shape; the recorder for this project
// should re-check timing and opening states.
// Live: GitLab Pages static export (dark by default). Editorial hero -> the
// "Most libraries..." headline -> the live specimens, operated (type, drag,
// toggle) -> the six themes -> one theme (Neon) applied to real components,
// light then dark -> the playground (pre-warmed so no spinner): pick Button,
// edit its JSX and props live, open the generated code and copy it.
// The hero is held for pacing.heroDwell before run() starts; scrolls are paced.
import { CURSOR_SCRIPT } from "./_lib/helpers.mjs";
const BASE = "https://ui-components-5218c2.gitlab.io";

// The recorder's cursor is too small to read at review size; make it bolder.
const CURSOR_CSS = `#__rec_cursor{width:30px!important;height:30px!important;margin:-15px 0 0 -15px!important;
border:3px solid #fff!important;box-shadow:0 0 0 2px rgba(0,0,0,.9),0 2px 12px rgba(0,0,0,.6)!important}
[data-rec-shown] > *{opacity:1!important;transform:none!important}
[data-theme-row]{opacity:1!important;transform:none!important;translate:none!important}
.monaco-editor .suggest-widget,.monaco-editor .parameter-hints-widget,.monaco-hover{display:none!important}`;

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

/** Operate the live specimens: type, then one quick slider drag. */
async function specimens(h) {
  const { page } = h;
  const input = page.getByPlaceholder("Type to typeset");
  await h.type(input, "Hi", 40);
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
    await h.moveTo(tb.x + tb.width / 2, tb.y + tb.height / 2, 100);
    await page.mouse.down();
    await h.moveTo(track.x + track.width * 0.8, tb.y + tb.height / 2, 220);
    await page.mouse.up();
  }
  await h.beat(60);
}

export default {
  url: `${BASE}/`,
  target: 32,
  colorScheme: "dark",
  posterFrom: { segment: "marketing", at: 1 },
  async beforeEach(h) {
    await h.page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE }).catch(() => {});
    await setup(h.page);
  },
  marketing: {
    async run(h) {
      const { page } = h;
      const input = page.getByPlaceholder("Type to typeset");
      await h.slides([
        { at: input.locator("xpath=ancestor::div[contains(@class,'grid')][1]"), offset: 185, cut: true, settle: 200, hold: 100, interact: specimens },
        { at: page.getByRole("heading", { name: "6 themes, one source." }), offset: 90, settle: 120, hold: 500 },
        { at: page.getByRole("heading", { name: /Components arrive by agent/ }), offset: 90, settle: 120, hold: 450 },
      ]);
    },
  },
  pacing: { featureLead: 0 },
  features: [
    {
      key: "theme",
      title: "One theme (Neon) on real components, light then dark",
      priority: 2,
      url: `${BASE}/themes/?theme=neon`,
      async before(h) {
        const { page } = h;
        await page.getByText("Light Mode", { exact: true }).first().click().catch(() => {});
        // Hydration can drop the recorder cursor: put it back, parked mid-page.
        await page.evaluate(CURSOR_SCRIPT);
        await page.mouse.move(640, 380);
      },
      async run(h) {
        const { page } = h;
        // One framing, no scrolling: palettes and the Buttons preview share the frame.
        await h.beat(800);
        await h.click(page.getByText("Dark Mode", { exact: true }).first(), { pause: 100 });
        await h.beat(800);
        await fast(h, page.getByText("CSS", { exact: true }), 220);
        await h.beat(800);
      },
    },
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
        // Hydration drops the recorder cursor on this route: put it back (it follows the mouse again).
        await page.evaluate(CURSOR_SCRIPT);
        await page.mouse.move(640, 400);
        await page.evaluate(() => window.scrollBy(0, 400));
        await h.wait(300);
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
        await fast(h, page.locator("main button", { hasText: /^Button$/ }), 140);
        await fast(h, page.getByRole("button", { name: "Properties", exact: true }), 160);
        await Promise.all([edit.waitFor({ state: "visible" }), h.moveTo(900, 330, 250)]);
        const wb = await edit.boundingBox();
        const wordBox = await edit.locator("span", { hasText: "Primary" }).last().boundingBox().catch(() => null);
        const tx = wordBox ? wordBox.x + wordBox.width / 2 : wb.x + 30;
        await h.moveTo(tx, wb.y + wb.height / 2, 160);
        await page.mouse.dblclick(tx, wb.y + wb.height / 2);
        await page.keyboard.insertText("Get started");
        await page.keyboard.press("Escape");
        await h.beat(250);
        const variant = page.locator("main select").first();
        const size = page.locator("main select").nth(1);
        await h.hover(variant, 160);
        await variant.selectOption("outline");
        await h.wait(400);
        await h.hover(size, 160);
        await size.selectOption("lg");
        await h.wait(450);
        await fast(h, page.getByRole("button", { name: "Code", exact: true }), 180);
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
          await h.moveTo(cb.x + cb.width / 2, Math.min(cb.y + 60, 760), 150);
          await page.mouse.wheel(0, dy);
        }
        await h.beat(350);
        const copy = page.getByRole("button", { name: "Copy", exact: true });
        await fast(h, copy, 180);
        await page.getByText("Code copied to clipboard").first().waitFor({ timeout: 4000 }).catch(() => {});
        await h.beat(500);
        // A second component: switch to Card and show its live props.
        await fast(h, page.getByRole("button", { name: /^Card v1/ }), 200);
        await h.beat(900);
      },
    },
    {
      key: "requests",
      title: "Agent request queue with validation and source review",
      priority: 3,
      url: `${BASE}/requests/`,
      async run(h) {
        const { page } = h;
        // Rejection is the point: show the failed filter first, then a passing proposal.
        await fast(h, page.getByText(/^Validation failed \(/), 260);
        await h.beat(650);
        await fast(h, page.getByText(/^All \(/), 200);
        await fast(h, page.getByText("Add ThemeToggle").first(), 300);
        await page.getByText(/Validation passed/).first().waitFor({ timeout: 5000 }).catch(() => {});
        await h.beat(700);
        await fast(h, page.getByRole("tab", { name: /History/ }).or(page.getByText(/^History \(/)).first(), 200);
        await h.beat(950);
      },
    },
    {
      key: "library",
      title: "Library: imported components with props contracts",
      priority: 4,
      url: `${BASE}/library/`,
      async run(h) {
        const { page } = h;
        await h.type(page.getByPlaceholder(/Search name, prop/), "button", 28);
        await fast(h, page.getByText("BaseButton", { exact: true }).first(), 200);
        await h.beat(800);
        await fast(h, page.getByRole("tab", { name: "Code" }).or(page.getByRole("button", { name: "Code", exact: true })).first(), 200);
        await h.beat(650);
      },
    },
    {
      key: "components",
      title: "Component gallery with preview and code",
      priority: 5,
      url: `${BASE}/components/?component=button`,
      async before(h) {
        // Let the navigation and any page transition settle before the cut.
        await h.page.waitForLoadState("networkidle").catch(() => {});
        await h.wait(300);
        await h.page.evaluate(CURSOR_SCRIPT);
        await h.page.mouse.move(640, 420);
      },
      async run(h) {
        const { page } = h;
        await fast(h, page.getByText("Slider", { exact: true }).first(), 200);
        // The gallery's slider/switch previews do not react to input on the static site, so they are not driven.
        await h.beat(500);
        await fast(h, page.getByRole("tab", { name: "Code" }).or(page.getByRole("button", { name: "Code", exact: true })).first(), 200);
        await h.beat(600);
        await h.hover(page.getByText("Open in Playground").first(), 220);
        await h.beat(300);
      },
    },
  ],
};
