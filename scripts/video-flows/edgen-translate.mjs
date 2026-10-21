// Live: GitLab Pages static export of PolyDoc (EdgenTranslate). No backend: the
// landing page previews pre-translated sample PDFs, and its uploader hands the
// file to /app, which fakes a run that succeeds after a short timer.
//
// ONE demo data set: the financial_report sample. The landing preview swaps it
// to Spanish, then French (the only correct translated samples: the demo's
// "_zh", "_de", "_nl", "_pt" files are Italian text, so Chinese cannot be shown
// honestly). The uploaded run is financial_report.pdf -> German; inside /app the
// New dialog adds a second run of the same file -> Italian. Neither run's output
// is opened: the static demo's "translated" output is a copy of the input.
// The other sample tabs are never shown (their content does not match labels).
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
  table .w-\\[12rem\\] { width:11.25rem!important; min-width:11.25rem!important; }
`;

/** The uploader's target-language picker (2nd combobox; its label changes once picked). */
const uploaderPicker = (page) => page.locator("button[role=combobox]").nth(1);
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

/** Same, without Escape (Escape would close the in-app New dialog). */
const blurSoft = async (page) => {
  await page.waitForTimeout(200);
  await page.evaluate(() => document.activeElement?.blur?.()).catch(() => {});
};

/**
 * Presentation only: the demo's fake timers run shorter (upload 3 s -> 0.8 s,
 * run 1.8 s -> 0.6 s), so no wait is filmed while "Translating" still registers.
 */
const fastTimers = (page) =>
  page.evaluate(() => {
    if (window.__fastTimers) return;
    window.__fastTimers = true;
    const orig = window.setTimeout.bind(window);
    window.setTimeout = (fn, d, ...a) => orig(fn, d === 3000 ? 800 : d === 1800 ? 600 : d, ...a);
  });
/**
 * ONE demo data set across clips. Fixed local times and ids for the two runs, so
 * the German run the upload clip creates is the same record (id, Created at) the
 * workspace clip re-seeds off camera, and the Italian run is 74 s newer.
 */
const T_GERMAN = new Date(2026, 9, 20, 10, 42, 8).getTime();
const T_ITALIAN = T_GERMAN + 74_000;
const USAGE = { German: 1234, Italian: 1198 }; // German = the demo's own 1234
const TOKENS_START = 9000; // the demo's static meter before any run

/**
 * Off camera, once per page: a shiftable clock, a seeded uuid generator, and a
 * presentation override that keeps the token meter and the Italian row's usage
 * consistent with the table (meter = 9000 - usage of Succeeded runs).
 */
const installDemoState = (page) =>
  page.evaluate(({ usage, start }) => {
    if (window.__demo) return;
    const R = window.Date;
    const realNow = R.now.bind(R);
    const clk = { base: realNow(), anchor: realNow() };
    function D(...a) {
      if (!new.target) return new R(D.now()).toString();
      return a.length ? new R(...a) : new R(D.now());
    }
    D.prototype = R.prototype;
    D.now = () => clk.base + (realNow() - clk.anchor);
    D.parse = R.parse;
    D.UTC = R.UTC;
    Object.defineProperty(D, Symbol.hasInstance, { value: (x) => x instanceof R });
    window.Date = D;
    let seed = 7, seq = 0;
    const origUuid = crypto.randomUUID?.bind(crypto);
    crypto.randomUUID = () => {
      let x = (seed * 2654435761 + ++seq * 40503) >>> 0;
      let hex = "";
      for (let i = 0; i < 32; i++) {
        x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
        hex += ((x >>> 28) & 15).toString(16);
      }
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
    };
    window.__demo = {
      at(t, s) { clk.base = t; clk.anchor = realNow(); seed = s; seq = 0; },
      origUuid,
    };
    const setText = (el, v) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (n.nodeValue.trim()) { if (n.nodeValue !== v) n.nodeValue = v; return; }
      }
    };
    const apply = () => {
      let used = 0;
      for (const tr of document.querySelectorAll("table tbody tr")) {
        const txt = tr.textContent || "";
        if (!/Succeeded/.test(txt)) continue;
        const lang = /Italian/.test(txt) ? "Italian" : "German";
        if (lang === "Italian")
          for (const td of tr.querySelectorAll("td"))
            if ((td.textContent || "").trim() === String(usage.German)) setText(td, String(usage.Italian));
        used += usage[lang];
      }
      const left = document.querySelector("[data-test=polydoc-current-pages-left]");
      if (!left) return;
      const v = start - used;
      setText(left, String(v));
      const bar = left.closest(".flex-col")?.querySelector("[role=progressbar] > *");
      const tf = `translateX(-${100 - v / 100}%)`;
      if (bar && bar.style.transform !== tf) bar.style.transform = tf;
    };
    new MutationObserver(apply).observe(document.body, { subtree: true, childList: true, characterData: true });
    apply();
  }, { usage: USAGE, start: TOKENS_START });
/** Set the demo clock + id seed right before a run is created. */
const demoAt = (page, t, seed) => page.evaluate(([t, s]) => window.__demo?.at(t, s), [t, seed]);

const hideToasts = (page) => page.addStyleTag({ content: "[data-sonner-toaster]{display:none!important}" });

/** Off camera: upload the sample, German, Translate -> /app with the run Succeeded. */
async function seedGermanRun(h) {
  const { page } = h;
  await fastTimers(page);
  await hideToasts(page);
  await installDemoState(page);
  await h.jump(uploaderPicker(page), { offset: 100 });
  await uploaderPicker(page).click();
  await option(page, /German/).click();
  await blur(page);
  const chooser = page.waitForEvent("filechooser");
  await page.getByText("Click to add").first().click();
  await (await chooser).setFiles(SAMPLE);
  await page.waitForTimeout(1100);
  await demoAt(page, T_GERMAN, 1);
  await page.locator("button:visible").filter({ hasText: "Translate Files" }).last().click();
  await page.waitForURL(/\/app\/?$/, { timeout: 20000 });
  await page.locator("table td").filter({ hasText: /Succeeded/ }).first().waitFor({ timeout: 15000 });
}

/**
 * Glide onto the lower-right corner of a button (its label stays readable) so the
 * cursor arrives as the sped-up demo upload finishes, then press at once. No
 * navigation settle: the next frame on camera is already the result.
 */
async function pressWhenReady(h, btn, attachedAt, onPress) {
  const b = await btn.boundingBox();
  const x = b.x + b.width * 0.93;
  const y = b.y + b.height * 0.85;
  const glide = Math.max(220, Math.min(450, 900 - (Date.now() - attachedAt)));
  await h.moveTo(x, y, glide);
  await h.page.waitForTimeout(Math.max(0, 900 - (Date.now() - attachedAt)));
  await btn.waitFor({ state: "visible" });
  if (onPress) await onPress();
  await h.page.mouse.down();
  await h.page.waitForTimeout(60);
  await h.page.mouse.up();
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
 * Off camera: render one language, keep a pixel copy of each pane, CLIPPED to
 * the pane's visible (scroll-container) area so the copy never spills over the
 * card borders. On camera, the copy is laid over the panes in the same task as
 * the option click, so the swap is a straight cut to the translated document.
 */
const captureSnap = (page, key) =>
  page.evaluate((key) => {
    const cs = [...document.querySelectorAll(".react-pdf__Page__canvas")].filter((c) => c.width > 0);
    const clipOf = (el) => {
      let r = { l: 0, t: 0, r: window.innerWidth, b: window.innerHeight };
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const st = getComputedStyle(n);
        if (st.overflow !== "visible" || st.overflowY !== "visible" || st.overflowX !== "visible") {
          const q = n.getBoundingClientRect();
          r = { l: Math.max(r.l, q.left), t: Math.max(r.t, q.top), r: Math.min(r.r, q.right), b: Math.min(r.b, q.bottom) };
        }
      }
      return r;
    };
    window.__snaps = window.__snaps || {};
    window.__snaps[key] = cs.map((c) => {
      const r = c.getBoundingClientRect();
      return { src: c.toDataURL(), r: { l: r.left, t: r.top, w: r.width, h: r.height }, clip: clipOf(c) };
    });
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
      d.style.cssText = "position:fixed;inset:0;z-index:40;pointer-events:none";
      for (const i of sn) {
        const w = document.createElement("div");
        const c = i.clip;
        w.style.cssText = `position:absolute;left:${c.l}px;top:${c.t}px;width:${c.r - c.l}px;height:${c.b - c.t}px;overflow:hidden;background:#fff`;
        const im = new Image();
        im.src = i.src;
        im.style.cssText = `position:absolute;left:${i.r.l - c.l}px;top:${i.r.t - c.t}px;width:${i.r.w}px;height:${i.r.h}px;max-width:none`;
        w.appendChild(im);
        d.appendChild(w);
      }
      document.body.appendChild(d);
    }, true);
  });
const unfreezePreview = (page) => page.evaluate(() => document.getElementById("__freeze")?.remove());

const priceSlider = (page) => page.locator("[role=slider]").first();

/** Select a target language in the preview picker, off camera. */
async function pickPreview(page, from, to) {
  await page.locator("button").filter({ hasText: from }).first().click();
  await option(page, to).click();
  await blur(page);
}

/** The pricing slider: a quick drag to ~60% (cursor shows up just for it). */
async function dragPriceSlider(h) {
  const { page } = h;
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
  await h.moveTo(b.x + b.width / 2, y + 60, 0);
  await h.cursor(true);
  await h.moveTo(b.x + b.width / 2, y, 120);
  await page.mouse.down();
  const x0 = b.x + b.width / 2;
  const x1 = tb.x + tb.w * 0.6;
  for (let i = 1; i <= 5; i++) {
    await page.mouse.move(x0 + ((x1 - x0) * i) / 5, y);
    await page.waitForTimeout(45);
  }
  await page.mouse.up();
  await h.moveTo(x1, y, 0); // keep h's cursor position in sync
  await h.beat(380);
}

const flow = {
  url: "https://edgentranslate-41c1b4.gitlab.io/",
  target: 26,
  pacing: { featureLead: 250 },
  posterFrom: { segment: "preview-language", at: 3.7 },
  async beforeEach(h, seg) {
    await h.page.addStyleTag({ content: STYLE });
    // Marketing slides only cut between sections: no cursor until the slider drag.
    if (seg.key === "marketing") await h.cursor(false);
  },
  marketing: {
    async run(h) {
      const { page } = h;
      await previewsReady(page);
      await h.beat(350); // hero ~1.5 s on screen in total (headline + live preview)
      await h.slides([
        { at: page.locator("h1", { hasText: "Supported Formats and Languages" }), offset: 40, hold: 800, settle: 100, cut: true },
        { at: "#supported-languages", offset: 20, hold: 650, settle: 100, cut: true },
        {
          at: "text=Fair pricing for all types of businesses",
          offset: 95,
          hold: 250,
          settle: 150,
          cut: true,
          interact: (h2) => dragPriceSlider(h2),
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
        await page.mouse.move(1180, 22);
      },
      async run(h) {
        const { page } = h;
        /**
         * After a pick the pixel copy of the translated pane is already on screen:
         * hold ~0.9-1 s from the click, no on-camera wait for the real render.
         */
        const settle = async (t) => {
          await blur(page);
          await h.moveTo(1180, 22, 160); // park on the blank band top right, off the content
          await h.beat(Math.max(0, 900 - (Date.now() - t)));
        };
        // 1. Open the picker, one fast pass down the 100+ languages, search, pick Spanish.
        await h.click(page.locator("button").filter({ hasText: "English" }).first(), { pause: 0, move: 160 });
        await page.locator("[role=option]:visible").first().waitFor();
        await h.moveTo(640, 300, 140);
        for (let i = 0; i < 5; i++) {
          await page.mouse.wheel(0, 420);
          await page.waitForTimeout(110);
        }
        await page.waitForTimeout(250);
        await page.keyboard.type("Spa", { delay: 45 });
        await page.waitForTimeout(250);
        await h.click(option(page, /Spanish/), { pause: 0, move: 160 });
        await settle(Date.now());
        // 2. Spanish -> French (the French copy replaces the Spanish one on click).
        await h.click(page.locator("button").filter({ hasText: "Spanish" }).first(), { pause: 0, move: 140 });
        await h.click(option(page, /French/), { pause: 0, move: 120 });
        await settle(Date.now());
        // The real French render matches the copy pixel for pixel by now; swap it in.
        await page.waitForFunction(() => {
          const cs = [...document.querySelectorAll(".react-pdf__Page__canvas")].filter((c) => c.width > 0);
          const sn = window.__snaps?.fr;
          if (cs.length < 2 || !sn) return false;
          cs.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
          const right = [...sn].sort((a, b) => a.r.l - b.r.l).at(-1).src;
          return cs.at(-1).toDataURL() === right;
        }, null, { timeout: 8000, polling: 50 }).catch(() => {});
        await unfreezePreview(page);
        // 3. Scroll the French page to its tables, next to the English ones.
        await h.moveTo(960, 520, 160);
        await page.mouse.wheel(0, 300);
        await h.beat(1000);
      },
    },
    {
      key: "upload-translate",
      title: "Upload a PDF, choose German, translate -> Succeeded, meter drops",
      priority: 2,
      async before(h) {
        const { page } = h;
        await fastTimers(page);
        await hideToasts(page);
        await installDemoState(page);
        // Load /app's route code off camera so the hand-off renders without its loader.
        await page.evaluate(() => window.next?.router?.prefetch?.("/app/")).catch(() => {});
        await page.waitForLoadState("networkidle").catch(() => {});
        // Keep the next landing band out of the shot: the uploader alone on white.
        await page.locator("h1", { hasText: "Supported Formats and Languages" }).first().evaluate((el) => {
          let n = el;
          while (n.parentElement && n.parentElement !== document.body && getComputedStyle(n).backgroundColor === "rgba(0, 0, 0, 0)") n = n.parentElement;
          n.style.visibility = "hidden";
        });
        await h.jump(uploaderPicker(page), { offset: 110 });
        await h.waitForStill(600);
        await page.mouse.move(900, 300);
      },
      async run(h) {
        const { page } = h;
        // Language first (its popover is gone before the file lands), then the file.
        await h.click(uploaderPicker(page), { pause: 0, move: 150 });
        await page.locator("[role=option]:visible").first().waitFor();
        await page.keyboard.type("Ger", { delay: 45 });
        await page.waitForTimeout(150);
        await h.click(option(page, /German/), { pause: 0, move: 120 });
        await blur(page);
        const chooser = page.waitForEvent("filechooser");
        await h.click(page.getByText("Click to add").first(), { pause: 0, move: 160 });
        await (await chooser).setFiles(SAMPLE);
        const attached = Date.now();
        const btn = page.locator("button:visible").filter({ hasText: "Translate Files" }).last();
        // The (sped-up) demo upload must finish before Translate is accepted.
        await pressWhenReady(h, btn, attached, () => demoAt(page, T_GERMAN, 1));
        await page.waitForURL(/\/app\/?$/, { timeout: 20000 });
        await page.locator("table td").filter({ hasText: "financial_report.pdf" }).first().waitFor({ timeout: 10000 });
        const status = page.locator("table td").filter({ hasText: /Translating|Succeeded/ }).first();
        const sb = await status.boundingBox().catch(() => null);
        if (sb) await h.moveTo(sb.x + sb.width / 2, sb.y + sb.height + 50, 220);
        await page.locator("table td").filter({ hasText: /Succeeded/ }).first().waitFor({ timeout: 15000 });
        await h.beat(300);
        // The run's usage comes off the sidebar meter (9000 -> 7766): point at it.
        const mb = await page.locator("[data-test=polydoc-current-pages-left]").first().boundingBox();
        if (mb) await h.moveTo(mb.x + 70, mb.y + mb.height + 16, 260);
        await h.beat(700);
        // Hand-off: end on '+ New', where the workspace clip picks up.
        const nb = await page.locator("button:visible").filter({ hasText: /^\s*\+?\s*New/ }).first().boundingBox();
        if (nb) await h.moveTo(nb.x + nb.width * 0.85, nb.y + nb.height * 0.8, 280);
        await h.beat(120);
      },
    },
    {
      key: "app-workspace",
      title: "App workspace: New dialog run -> Italian, meter drops, sort runs",
      priority: 3,
      async before(h) {
        const { page } = h;
        await seedGermanRun(h);
        await h.waitForStill(1000);
        // Same frame the upload clip ends on: German run, meter 7766, cursor on '+ New'.
        const nb = await page.locator("button:visible").filter({ hasText: /^\s*\+?\s*New/ }).first().boundingBox();
        if (nb) await h.moveTo(nb.x + nb.width * 0.85, nb.y + nb.height * 0.8, 0);
      },
      async run(h) {
        const { page } = h;
        // New -> Translate files dialog (the meter beat closes the upload clip).
        // The cursor already rests on the button's corner (label readable): press in place.
        await page.mouse.down();
        await page.waitForTimeout(60);
        await page.mouse.up();
        const dlg = page.locator("[role=dialog]").first();
        await dlg.waitFor({ timeout: 8000 });
        await blurSoft(page); // ~0.2 s after the dialog lands, straight to its picker
        // Pick Italian by search, add the same report, Translate.
        await h.click(dlg.locator("button").filter({ hasText: "English" }).first(), { pause: 0, move: 180 });
        await page.locator("[role=option]:visible").first().waitFor();
        await page.keyboard.type("Ital", { delay: 45 });
        await page.waitForTimeout(200);
        await h.click(option(page, /Italian/), { pause: 0, move: 140 });
        await blurSoft(page);
        const chooser = page.waitForEvent("filechooser");
        await h.click(dlg.getByText("Click to add").first(), { pause: 0, move: 180 });
        await (await chooser).setFiles(SAMPLE);
        const attached = Date.now();
        const go = dlg.locator("button:visible").filter({ hasText: /^\s*Translate\s*$/ }).last();
        await pressWhenReady(h, go, attached, () => demoAt(page, T_ITALIAN, 2));
        await dlg.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
        // The second run lands on top of the German one: Translating -> Succeeded.
        const row = page.locator("table tr").filter({ hasText: "Italian" }).first();
        await row.waitFor({ timeout: 8000 });
        const st = await row.locator("td").filter({ hasText: /Translating|Succeeded/ }).first().boundingBox().catch(() => null);
        if (st) await h.moveTo(st.x + st.width / 2, st.y + st.height + 70, 220);
        await row.locator("td").filter({ hasText: /Succeeded/ }).first().waitFor({ timeout: 15000 });
        await h.beat(800);
        // Two runs now: sort by Target language (ascending) -> German moves to the top.
        await h.click(page.locator("thead button").filter({ hasText: /Target language/i }).first(), { pause: 0, move: 220 });
        await page.locator("[role=menuitem]:visible").first().waitFor({ timeout: 4000 });
        await h.click(page.locator("[role=menuitem]:visible").filter({ hasText: /Asc/i }).first(), { pause: 0, move: 140 });
        await h.moveTo(820, 330, 160);
        await h.beat(1000);
      },
    },
  ],
};

export default flow;

const feature = (key) => flow.features.find((f) => f.key === key);
/**
 * Scrolling back UP the landing page brings its floating nav pill (Pricing /
 * Contact, y 15-55) back over the preview picker, so the take frames the picker
 * just below it (v3 used 16 px, but only ever scrolled down to it).
 */
const PICKER_OFFSET = 66;
const pickerTop = (page) => page.locator("button").filter({ hasText: "English" }).first();

/** The landing band right under the uploader (hidden off screen, as in v3). */
const hideFormatsBand = (page) =>
  page.locator("h1", { hasText: "Supported Formats and Languages" }).first().evaluate((el) => {
    let n = el;
    while (n.parentElement && n.parentElement !== document.body && getComputedStyle(n).backgroundColor === "rgba(0, 0, 0, 0)") n = n.parentElement;
    n.style.visibility = "hidden";
  });

/**
 * The language picker (cmdk) calls scrollIntoView on its first group heading
 * when it opens. Once the landing page has been scrolled past the preview, that
 * scrolls the DOCUMENT back to the top (the popover is not placed yet). Keep the
 * scroll inside the picker's own list: the page stays where the viewer is.
 */
const keepPageStillOnPickerOpen = (page) =>
  page.evaluate(() => {
    if (window.__sivGuard) return;
    window.__sivGuard = true;
    const orig = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (...a) {
      if (!this.closest?.("[cmdk-root]")) return orig.apply(this, a);
      let box = this.parentElement;
      while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
      if (!box || box === document.body || box === document.documentElement) return;
      const r = this.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      if (r.top < b.top) box.scrollTop -= b.top - r.top;
      else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom;
    };
  });

/**
 * Continuous take (v4): the v3 content and order in ONE shot, no cuts.
 *
 * hero --glide--> formats --glide--> languages --glide--> pricing (slider drag)
 * --glide back up--> preview picker (English -> Spanish -> French) --glide down
 * --> uploader (German + file + Translate Files) --> /app (Succeeded, meter)
 * --> "+ New" dialog (Italian run) --> sort by Target language.
 *
 * The landing -> /app hand-off is the app's own client-side navigation, so the
 * demo state (fast timers, fixed clock/ids, meter override) lives on through it.
 */
export const take = {
  target: 26,
  posterFrom: { feature: "preview-language", at: 4.6 },
  async before(h) {
    const { page } = h;
    await page.addStyleTag({ content: STYLE });
    await keepPageStillOnPickerOpen(page);
    await fastTimers(page);
    await hideToasts(page);
    await installDemoState(page);
    // Load /app's route code now so the hand-off renders without its loader.
    await page.evaluate(() => window.next?.router?.prefetch?.("/app/")).catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    await previewsReady(page);
    // Pre-render Spanish and French at the exact framing the take films them in
    // (picker 16 px from the top) and keep a pixel copy of each pane.
    await h.jump(pickerTop(page), { offset: PICKER_OFFSET });
    await h.waitForStill(800);
    let prev = await rightSig(page);
    for (const [from, to, key] of [["English", /Spanish/, "es"], ["Spanish", /French/, "fr"]]) {
      await pickPreview(page, from, to);
      prev = await paneChangedFrom(page, prev);
      await captureSnap(page, key);
    }
    await pickPreview(page, "French", /English/);
    await paneChangedFrom(page, prev);
    await armSnaps(page);
    // Warm the lower landing sections (reveal animations, flag images).
    for (const sel of ["#supported-languages", "text=Fair pricing for all types of businesses"]) {
      await h.jump(sel, { offset: 40 });
      await h.waitForStill(600);
    }
    await h.jump(0);
    await previewsReady(page);
    await h.cursor(false); // marketing glides only: no cursor until the slider drag
    await page.mouse.move(1180, 22);
    await h.moveTo(1180, 22, 0);
    await h.waitForStill(800);
  },
  route: [
    {
      key: "marketing",
      kind: "marketing",
      title: "Landing page: formats, languages, pricing slider",
      priority: 0,
      async run(h) {
        const { page } = h;
        await h.glide(page.locator("h1", { hasText: "Supported Formats and Languages" }), { offset: 40, ms: 480 });
        await h.dwell(600);
        await h.glide("#supported-languages", { offset: 20, ms: 320 });
        await h.dwell(480);
        await h.glide("text=Fair pricing for all types of businesses", { offset: 95, ms: 400 });
        await h.dwell(150);
        await dragPriceSlider(h);
      },
    },
    {
      key: "preview-language",
      title: "Pick a language: side-by-side translated PDF, layout intact",
      priority: 1,
      async transitionIn(h) {
        // Back up to the live preview in one fast glide (same framing as the snaps).
        await h.moveTo(1180, 22, 140);
        await h.glide(pickerTop(h.page), { offset: PICKER_OFFSET, ms: 650 });
        await h.wait(150);
      },
      run: (h) => feature("preview-language").run(h),
    },
    {
      key: "upload-translate",
      title: "Upload a PDF, choose German, translate -> Succeeded, meter drops",
      priority: 2,
      async transitionIn(h) {
        const { page } = h;
        await hideFormatsBand(page); // well below the fold here
        await h.moveTo(900, 300, 160);
        await h.glide(uploaderPicker(page), { offset: 110, ms: 380 });
        await h.wait(120);
      },
      run: (h) => feature("upload-translate").run(h),
    },
    {
      key: "app-workspace",
      title: "App workspace: New dialog run -> Italian, meter drops, sort runs",
      priority: 3,
      // upload-translate ends with the cursor resting on '+ New': run presses it.
      run: (h) => feature("app-workspace").run(h),
    },
  ],
};
