// Live: GitLab Pages static export of PolyDoc (EdgenTranslate). No backend: the
// landing page previews pre-translated sample PDFs, and its uploader hands the
// file to /app, which fakes a run that succeeds after a short timer.
// The demo's Chinese/German/Dutch/Portuguese previews are Italian text (mismatched), and no
// other non-Latin sample exists: Spanish then French are the working, correct swaps.
// Flow: hero -> pick Spanish (the side-by-side preview swaps to the translated
// PDF, layout intact) -> upload a PDF, choose French -> Translate -> the run
// lands in the app's translations table, Translating, then Succeeded.
//
// Only the financial_report sample is shown: the demo data's other tabs do not
// match their labels (legal_contract.pdf is a marketing plan, source_code.pdf a
// Smallpdf flyer). The table's "view" action is not opened: the static demo's
// "translated" output is a copy of the input, so it would show English twice.
import os from "node:os";
import path from "node:path";

const SAMPLE = path.join(
  os.homedir(),
  "Desktop/workspace/personal/projects/edgentranslate/public/files/financial_report/financial_report.pdf"
);

// Presentation-only CSS. Everything it touches is below the fold or on /app,
// so injecting it after the hero hold changes nothing on screen.
const STYLE = `
  /* Larger, higher-contrast recorder cursor. */
  #__rec_cursor { width:24px!important; height:24px!important; margin:-12px 0 0 -12px!important;
    background:rgba(15,15,15,.78)!important; border:3px solid #fff!important;
    box-shadow:0 0 0 1px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.4)!important; }
  /* Landing uploader: 50rem tall -> 28rem, so language, file and button share one frame. */
  .h-\\[50rem\\] { height:28rem!important; }
  /* /app table: fit Filename..Actions in the 1280 px frame without sideways scroll. */
  table .w-\\[22rem\\] { width:9.5rem!important; }
  table div.w-12 { width:1.75rem!important; min-width:0!important; }
  table .min-w-\\[8rem\\] { min-width:6rem!important; }
  table .w-\\[12rem\\] { width:10rem!important; }
`;

const option = (page, name) => page.locator("[role=option]:visible").filter({ hasText: name }).first();
const previewsReady = (page) =>
  page.waitForFunction(() => {
    const c = [...document.querySelectorAll(".react-pdf__Page__canvas")].filter((n) => n.width > 0);
    const loading = [...document.querySelectorAll("body *")].some(
      (n) => n.childElementCount === 0 && /Loading Document|Fetching Files/.test(n.textContent || ""));
    return c.length >= 2 && !loading;
  }, null, { timeout: 15000, polling: 100 }).catch(() => {});
/** Pickers keep a "Select target language" tooltip while focused. */
const blur = async (page) => {
  await page.waitForTimeout(250);
  await page.evaluate(() => document.activeElement?.blur?.()).catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
};

/** Upload the sample, pick French, Translate (used off camera by app-workspace). */
async function runTranslation(h, { fast = false } = {}) {
  const { page } = h;
  const chooser = page.waitForEvent("filechooser");
  await h.click(page.getByText("Click to add").first(), { pause: 60 });
  await (await chooser).setFiles(SAMPLE);
  const attachedAt = Date.now();
  await h.click(page.locator("button").filter({ hasText: "English" }).nth(1), { pause: 200, move: 200 });
  await h.click(option(page, /French/), { pause: 60, move: 200 });
  await blur(page);
  await h.moveTo(1210, 300, 250);
  // The demo "uploads" for 3 s; Translate before that only raises an error toast.
  await page.waitForTimeout(Math.max(0, 3300 - (Date.now() - attachedAt)));
  await h.click(page.locator("button:visible").filter({ hasText: "Translate Files" }).last(), { pause: 0, navDwell: 0 });
  await page.waitForURL(/\/app\/?$/, { timeout: 20000 });
  await page.addStyleTag({ content: "[data-sonner-toaster]{opacity:0!important;transition:opacity .3s ease!important}" });
  await page.locator("table td").filter({ hasText: "financial_report.pdf" }).first().waitFor({ timeout: 10000 });
}

/** Right-hand preview canvas as a data URL (identifies which document is rendered). */
const rightSig = (page) =>
  page.evaluate(() => {
    const cs = [...document.querySelectorAll(".react-pdf__Page__canvas")].filter((c) => c.width > 0);
    if (cs.length < 2) return "";
    cs.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    return cs[cs.length - 1].toDataURL();
  });

/** Wait until the right pane renders a document other than `prev` (both panes drawn, no loader). */
async function paneChangedFrom(page, prev) {
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    const sig = await rightSig(page);
    if (sig && sig !== prev) {
      await page.waitForTimeout(250);
      if ((await rightSig(page)) === sig) return sig;
    }
    await page.waitForTimeout(100);
  }
  return "";
}

/**
 * Off camera: render one language, keep a pixel copy of both panes. On camera, the
 * copy is laid over the panes in the same task as the option click, so the swap is
 * a straight cut to the matching translated document (no wait, no wrong language).
 */
const captureSnap = (page, key) =>
  page.evaluate((key) => {
    const cs = [...document.querySelectorAll(".react-pdf__Page__canvas")].filter((c) => c.width > 0);
    const rs = cs.map((c) => c.getBoundingClientRect());
    const box = { l: Math.min(...rs.map((r) => r.left)), t: Math.min(...rs.map((r) => r.top)), r: Math.max(...rs.map((r) => r.right)), b: Math.max(...rs.map((r) => r.bottom)) };
    window.__snaps = window.__snaps || {};
    window.__snaps[key] = { box, imgs: cs.map((c, i) => ({ src: c.toDataURL(), r: rs[i] })) };
  }, key);
const armSnaps = (page) =>
  page.evaluate(() => {
    document.addEventListener("click", (e) => {
      const o = e.target instanceof Element && e.target.closest("[role=option]");
      if (!o) return;
      const key = /Spanish/.test(o.textContent) ? "es" : /French/.test(o.textContent) ? "fr" : null;
      const sn = key && window.__snaps?.[key];
      if (!sn) return;
      document.getElementById("__freeze")?.remove();
      const d = document.createElement("div");
      d.id = "__freeze";
      d.style.cssText = `position:fixed;left:${sn.box.l}px;top:${sn.box.t}px;width:${sn.box.r - sn.box.l}px;height:${sn.box.b - sn.box.t}px;background:#fff;z-index:40;pointer-events:none`;
      sn.imgs.forEach((i) => {
        const im = new Image();
        im.src = i.src;
        im.style.cssText = `position:absolute;left:${i.r.left - sn.box.l}px;top:${i.r.top - sn.box.t}px;width:${i.r.width}px;height:${i.r.height}px`;
        d.appendChild(im);
      });
      document.body.appendChild(d);
    }, true);
  });
const unfreezePreview = (page) => page.evaluate(() => document.getElementById("__freeze")?.remove());

const priceSlider = (page) => page.locator("[role=slider]").first();

/** Select a target language in the preview picker, off camera or on. */
async function pickPreview(page, from, to) {
  await page.locator("button").filter({ hasText: from }).first().click();
  await option(page, to).click();
  await blur(page);
}

export default {
  url: "https://edgentranslate-41c1b4.gitlab.io/",
  target: 30,
  posterFrom: { segment: "marketing", at: 1 },
  async beforeEach(h) {
    await h.page.addStyleTag({ content: STYLE });
  },
  marketing: {
    async run(h) {
      const { page } = h;
      await previewsReady(page);
      await h.slides([
        { at: page.locator("h1", { hasText: "Supported Formats and Languages" }), offset: 40, hold: 900, settle: 100, cut: true },
        { at: "#supported-languages", offset: 20, hold: 450, settle: 100, cut: true },
        {
          at: "text=Fair pricing for all types of businesses",
          offset: 60,
          hold: 100,
          settle: 150,
          async interact(h2) {
            const sl = priceSlider(page);
            const b = await sl.boundingBox();
            if (!b) return;
            const tb = await sl.evaluate((el) => {
              let n = el.parentElement;
              while (n && n.getBoundingClientRect().width < 120) n = n.parentElement;
              const r = n.getBoundingClientRect();
              return { x: r.x, y: r.y, w: r.width, h: r.height };
            });
            const y = b.y + b.height / 2;
            await h2.moveTo(b.x + b.width / 2, y, 100);
            await page.mouse.down();
            const x0 = b.x + b.width / 2;
            const x1 = tb.x + tb.w * 0.6;
            for (let i = 1; i <= 6; i++) {
              await page.mouse.move(x0 + ((x1 - x0) * i) / 6, y);
              await page.waitForTimeout(55);
            }
            await page.mouse.up();
            await h2.beat(300);
          },
        },
      ]);
    },
  },
  features: [
    {
      key: "preview-language",
      title: "Pick a language: side-by-side translated PDF, layout intact",
      priority: 1,
      async before(h) {
        const { page } = h;
        await h.jump(0);
        await previewsReady(page);
        // Frame the picker at the top with both PDF panes filling the viewport.
        await h.jump(page.locator("button").filter({ hasText: "English" }).first(), { offset: 16 });
        await h.waitForStill(800);
        // Pre-render Spanish and French off camera and keep a pixel copy of each.
        let prev = await rightSig(page);
        for (const [from, to, key] of [["English", /Spanish/, "es"], ["Spanish", /French/, "fr"]]) {
          await pickPreview(page, from, to);
          prev = await paneChangedFrom(page, prev);
          await captureSnap(page, key);
        }
        await pickPreview(page, "French", /English/);
        await paneChangedFrom(page, prev);
        await armSnaps(page);
        await h.waitForStill(600);
      },
      async run(h) {
        const { page } = h;
        const swap = async (from, to) => {
          const before = await rightSig(page);
          await h.click(page.locator("button").filter({ hasText: from }).first(), { pause: 0, move: 140 });
          await h.click(option(page, to), { pause: 0, move: 110 });
          const t = Date.now();
          await blur(page);
          // Real render finishes under the pixel copy; the cut back to it is invisible.
          await paneChangedFrom(page, before);
          await unfreezePreview(page);
          // The language is held ~1.2 s from the pick, however long the hidden render took.
          await h.beat(Math.max(0, 1200 - (Date.now() - t)));
        };
        await swap("English", /Spanish/);
        await swap("Spanish", /French/);
        await h.moveTo(960, 500, 160);
        await page.mouse.wheel(0, 300);
        await h.beat(1000);
      },
    },
    {
      key: "language-breadth",
      title: "100+ target languages in the picker",
      priority: 3,
      async before(h) {
        const { page } = h;
        await previewsReady(page);
        await h.jump(page.locator("button").filter({ hasText: "English" }).first(), { offset: 16 });
        await h.waitForStill(600);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.locator("button").filter({ hasText: "English" }).first(), { pause: 0, move: 160 });
        await page.locator("[role=option]:visible").first().waitFor();
        await h.beat(500);
        await h.moveTo(640, 300, 150);
        for (let i = 0; i < 6; i++) {
          await page.mouse.wheel(0, 380);
          await page.waitForTimeout(170);
        }
        await h.beat(500);
        for (let i = 0; i < 6; i++) {
          await page.mouse.wheel(0, 380);
          await page.waitForTimeout(170);
        }
        await h.beat(500);
      },
    },
    {
      key: "upload-translate",
      title: "Upload a PDF, choose French, translate -> Succeeded",
      priority: 2,
      async before(h) {
        const { page } = h;
        // Presentation only: the demo's fake upload/run timers run ~3x shorter.
        await page.evaluate(() => {
          const orig = window.setTimeout.bind(window);
          window.setTimeout = (fn, d, ...a) => orig(fn, d >= 1500 && d <= 4000 ? Math.round(d * 0.3) : d, ...a);
        });
        await h.jump(page.locator("button").filter({ hasText: "English" }).nth(1), { offset: 100 });
      },
      async run(h) {
        const { page } = h;
        const chooser = page.waitForEvent("filechooser");
        await h.click(page.getByText("Click to add").first(), { pause: 0, move: 150 });
        await (await chooser).setFiles(SAMPLE);
        await h.click(page.locator("button").filter({ hasText: "English" }).nth(1), { pause: 0, move: 150 });
        await h.click(option(page, /French/), { pause: 0, move: 120 });
        await blur(page);
        const btn = page.locator("button:visible").filter({ hasText: "Translate Files" }).last();
        await h.hover(btn, 400);
        await page.waitForTimeout(150);
        // Hold the pre-click frame over the page while /app loads, so the next frame
        // on camera is already the populated table (no blank page or spinner).
        const shot = (await page.screenshot()).toString("base64");
        await page.evaluate((b64) => {
          const im = new Image();
          im.id = "__navfreeze";
          im.src = "data:image/png;base64," + b64;
          im.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;pointer-events:none";
          document.documentElement.appendChild(im);
        }, shot);
        await h.click(btn, { pause: 0, navDwell: 0 });
        await page.waitForURL(/\/app\/?$/, { timeout: 20000 });
        await page.addStyleTag({ content: "[data-sonner-toaster]{opacity:0!important}" });
        await page.locator("table td").filter({ hasText: "financial_report.pdf" }).first().waitFor({ timeout: 10000 });
        await page.waitForTimeout(150);
        await page.evaluate(() => document.getElementById("__navfreeze")?.remove());
        const status = page.locator("table td").filter({ hasText: /Translating|Succeeded/ }).first();
        const sb = await status.boundingBox().catch(() => null);
        if (sb) await h.moveTo(sb.x + sb.width / 2, sb.y + sb.height + 40, 200);
        await page.locator("table td").filter({ hasText: /Succeeded/ }).first().waitFor({ timeout: 15000 });
        await h.beat(1000);
      },
    },
    {
      key: "app-workspace",
      title: "App workspace: token meter and New translation dialog",
      priority: 3,
      async before(h) {
        const { page } = h;
        await h.jump(page.locator("button").filter({ hasText: "English" }).nth(1), { offset: 100 });
        await runTranslation(h);
        await page.locator("table td").filter({ hasText: /Succeeded/ }).first().waitFor({ timeout: 15000 });
        await page.locator("table td").filter({ hasText: /Translating/ }).first().waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
        await h.waitForStill(1200);
        // Open on a clearly different framing than the upload clip: token meter already
        // highlighted and the cursor parked on it, run row already Succeeded.
        const meter = page.getByText(/tokens left/i).first();
        await meter.evaluate((el) => {
          const t = el.closest("div") || el;
          t.style.outline = "3px solid #f59e0b"; t.style.outlineOffset = "4px"; t.style.borderRadius = "10px";
        }).catch(() => {});
        await h.hover(meter, 0);
        await page.waitForTimeout(200);
      },
      async run(h) {
        const { page } = h;
        const meter = page.getByText(/tokens left/i).first();
        await h.beat(600);
        const row = page.locator("table tr").filter({ hasText: "financial_report.pdf" }).first();
        const icons = row.locator("button:visible, a:visible");
        const n = await icons.count().catch(() => 0);
        if (n > 0) {
          await h.hover(icons.nth(n - 1), 300);
          await h.beat(500);
        }
        await meter.evaluate((el) => { (el.closest("div") || el).style.outline = "none"; }).catch(() => {});
        await h.click(page.locator("button:visible").filter({ hasText: /^\s*\+?\s*New/ }).first(), { pause: 0, move: 280 });
        await page.locator("[role=dialog]").first().waitFor({ timeout: 8000 }).catch(() => {});
        await h.beat(700);
        // One quick interaction: open the dialog's target-language picker.
        const dlg = page.locator("[role=dialog]").first();
        const pick = dlg.locator("button").filter({ hasText: /language|English|Spanish|French/i }).first();
        if (await pick.count()) await h.click(pick, { pause: 0, move: 250 });
        await h.beat(1100);
      },
    },
  ],
};
