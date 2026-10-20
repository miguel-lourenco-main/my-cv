// Live: GitLab Pages static export (dark by default). Editorial hero -> the
// "Most libraries..." headline -> the live specimens, operated (type, drag,
// toggle) -> the six themes -> one theme (Neon) applied to real components,
// light then dark -> the playground (pre-warmed so no spinner): pick Button,
// edit its JSX and props live, open the generated code and copy it.
// The hero is held for pacing.heroDwell before run() starts; scrolls are paced.
const BASE = "https://ui-components-5218c2.gitlab.io";

// The recorder's cursor is too small to read at review size; make it bolder.
const CURSOR_CSS = `#__rec_cursor{width:30px!important;height:30px!important;margin:-15px 0 0 -15px!important;
border:3px solid #fff!important;box-shadow:0 0 0 2px rgba(0,0,0,.9),0 2px 12px rgba(0,0,0,.6)!important}
[data-rec-shown] > *{opacity:1!important;transform:none!important}
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

export default {
  url: `${BASE}/`,
  posterAt: 2,
  pacing: { navDwell: 1400 },
  async run(h) {
    const { page } = h;

    // Off camera (nothing visible changes while the hero holds): clipboard access
    // so Copy shows its toast, a bolder cursor, the specimen cards shown as rendered
    // (they fade in on view), the playground pre-warm and quiet dark editors.
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE }).catch(() => {});
    await setup(page);

    // One paced move straight to the "Most libraries..." headline (the stats row
    // passes on the way), instead of an intermediate stop that crops a headline.
    const step = h.pacing.scrollStep;
    h.pacing.scrollStep = 1.6;
    await h.scrollTo(page.getByRole("heading", { name: /Most libraries hand/ }), { offset: 110, pause: 1500 });
    h.pacing.scrollStep = step;

    // Live specimens, centred under the sticky header; operate them briskly.
    const input = page.getByPlaceholder("Type to typeset");
    const grid = input.locator("xpath=ancestor::div[contains(@class,'grid')][1]");
    h.pacing.scrollStep = 1.6;
    await h.scrollTo(grid, { offset: 185, pause: 300 });
    h.pacing.scrollStep = step;
    await h.type(input, "Hi", 130);
    await h.wait(300);
    const thumb = page.locator("main [role=slider]").first();
    const tb = await thumb.boundingBox();
    // The thumb's parent is a thumb-sized wrapper; the track is the first wide ancestor.
    const track = await thumb.evaluate((el) => {
      for (let n = el.parentElement; n; n = n.parentElement) {
        const r = n.getBoundingClientRect();
        if (r.width > 200) return { x: r.x, y: r.y, width: r.width, height: r.height };
      }
      return null;
    });
    if (tb && track) {
      await h.moveTo(tb.x + tb.width / 2, tb.y + tb.height / 2, 400);
      await page.mouse.down();
      await h.moveTo(track.x + track.width * 0.8, tb.y + tb.height / 2, 650);
      await page.mouse.up();
      await h.wait(300);
    }
    await h.click(page.locator("main [role=switch]").first(), { pause: 300 });

    // Six themes: heading + the first rows, then one short move to Dark/Neon/Bring your own.
    h.pacing.scrollStep = 1.6;
    await h.scrollTo(page.getByRole("heading", { name: "6 themes, one source." }), { offset: 90, pause: 1800 });
    await h.scrollTo(page.getByRole("heading", { name: "Dark", exact: true }), { offset: 215, pause: 900 });
    h.pacing.scrollStep = step;

    // One theme applied to real components: open Neon, then flip it to dark mode.
    // The page opens on its light palette with the Buttons preview below it.
    await h.click(page.locator('a[href="/themes/?theme=neon"]'), { pause: 150, navDwell: 1000 });
    await setup(page);
    await h.click(page.getByText("Dark Mode", { exact: true }).first(), { pause: 1000 });

    // Playground via the sticky header link (client-side route). Clicked by hand:
    // h.click()'s navigation settle waits on networkidle/stillness, which this
    // page (Monaco workers) never reaches, so it froze the hero for ~18 s.
    const nav = page.locator('header a[href*="playground"]').first();
    const nb = await nav.boundingBox();
    await h.moveTo(nb.x + nb.width / 2, nb.y + nb.height / 2, 450);
    await h.wait(150);
    await nav.click({ delay: 90 });
    await page.getByRole("button", { name: /^Button v1/ }).waitFor({ state: "visible", timeout: 15000 });
    await page.evaluate(quietDarkMonaco).catch(() => {});
    await h.dwell(1000);
    await page.evaluate(() => document.getElementById("__rec_warm")?.remove());

    // Down to the workspace and straight onto the centred "Button" chip.
    await h.scrollBy(400, { pause: 150 });
    await h.click(page.locator("main button", { hasText: /^Button$/ }), { pause: 450, move: 380 });

    // Edit it live: its JSX children, then variant and size.
    // The cursor heads for the children editor while it initialises.
    await h.click(page.getByRole("button", { name: "Properties", exact: true }), { pause: 0, move: 380 });
    await h.moveTo(1080, 300, 500);
    const word = page.locator(".monaco-editor .view-line", { hasText: "Primary" }).first();
    await word.waitFor({ state: "visible" });
    await page.getByText(/Valid - will appear/).first().waitFor({ timeout: 8000 }).catch(() => {});
    await h.wait(200);
    const wb = await word.boundingBox();
    const wordBox = await word.locator("span", { hasText: "Primary" }).last().boundingBox().catch(() => null);
    const tx = wordBox ? wordBox.x + wordBox.width / 2 : wb.x + 30;
    await h.moveTo(tx, wb.y + wb.height / 2, 400);
    await h.wait(150);
    await page.mouse.dblclick(tx, wb.y + wb.height / 2);
    // insertText, not per-key typing; suggestions are already off (quietDarkMonaco).
    await page.keyboard.insertText("Get started");
    await page.keyboard.press("Escape");
    await h.moveTo(tx + 60, wb.y + 150, 300); // off the edited text
    await page.getByText(/Applied as plain text|Valid - will appear/).first().waitFor({ timeout: 8000 }).catch(() => {});
    await h.dwell(600);

    const variant = page.locator("main select").first();
    const size = page.locator("main select").nth(1);
    await h.scrollTo(variant, { offset: 60, pause: 300 }); // inside the Properties panel
    await h.hover(variant, 350);
    await h.wait(200);
    await variant.selectOption("outline");
    await h.wait(700);
    await h.hover(size, 350);
    await h.wait(200);
    await size.selectOption("lg");
    await h.wait(800);

    // Generated code (its panel is capped at 40% height): open it, then scroll it
    // past the validation comment so export ... <Button variant="outline" size="lg">
    // Get started </Button> is on screen whole before Copy.
    await h.click(page.getByRole("button", { name: "Code", exact: true }), { pause: 100 });
    const code = page.locator(".monaco-editor").filter({ has: page.locator(".view-line", { hasText: "export default" }) }).first();
    await code.waitFor({ timeout: 6000 }).catch(() => {});
    await h.wait(400);
    const dy = await page.evaluate(() => {
      const e = window.monaco?.editor.getEditors().find((x) => /export default function/.test(x.getValue()));
      if (!e) return 0;
      const lines = e.getValue().split("\n");
      const first = lines.findIndex((l) => /export default function/.test(l)) + 1;
      return Math.max(0, e.getTopForLineNumber(first) - 4 - e.getScrollTop());
    });
    const cb = await code.boundingBox();
    if (cb && dy > 0) {
      await h.moveTo(cb.x + cb.width / 2, Math.min(cb.y + 60, 760), 400);
      await page.mouse.wheel(0, dy);
      await h.wait(150);
      await h.moveTo(cb.x + cb.width - 70, cb.y + cb.height / 2, 350); // off the code, onto blank editor space
    }
    await h.wait(1000);
    const copy = page.getByRole("button", { name: "Copy", exact: true });
    const cp = await copy.first().boundingBox().catch(() => null);
    await h.click(copy, { pause: 100 });
    if (cp) await h.moveTo(cp.x - 45, cp.y + cp.height / 2, 300); // off the label, onto the empty header gap before "Edit Live"
    await page.getByText("Code copied to clipboard").first().waitFor({ timeout: 4000 }).catch(() => {});
    await h.dwell(1500);
  },
};
