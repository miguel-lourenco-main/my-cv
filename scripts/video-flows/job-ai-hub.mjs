// Live: the Vercel landing mounts the app's real components on in-memory demo
// records (no account): inheritance map, resume editor, rehearsal scoring, the
// job inbox. The signed-in app needs Supabase + a login, so the pipeline (Kanban)
// and the AI chat are shown as captioned stills from the CV gallery
// (public/projects_images/job-ai-hub/).
//
// The page scrolls inside <main> (html/body are overflow:hidden). The hero is a
// pinned, scroll-driven section: the first screen is only the "Job AI Hub"
// wordmark, and the headline, copy and CTAs build in over the first ~1000 px.
//
// Segments: marketing (hero build-in + 3 quick slides, CTA hover) then one clip
// per live component. Every feature opens already framed on its section
// (before() jumps there off camera).
import fs from "node:fs";

const IMG_DIR = new URL("../../public/projects_images/job-ai-hub/", import.meta.url);
const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(new URL(f, IMG_DIR)).toString("base64")}`;

// Stills of the signed-in app (2560x1266 captures); each still is one or more crops
// [x, y, w, h] in image px laid out side by side. Every crop starts right of the sidebar
// (x > 260), whose footer shows the account owner's name.
// `blur` boxes [x, y, w, h] in image px hide the real company name / dates of the capture
// (the stills show the owner's real application; the video must carry demo data only).
const STILLS = {
  pipeline: {
    file: "job_applications_L.png",
    crops: [[430, 60, 1180, 340]],
    blur: [[836, 222, 98, 24], [850, 270, 50, 20]],
    label: "The applications pipeline",
    ms: 1400,
  },
  interview: {
    file: "interview_L.png",
    crops: [[590, 60, 1030, 640]],
    blur: [],
    label: "Practice interviews",
    ms: 1400,
  },
  chat: {
    file: "ai_chat_L.png",
    // chat column (from the first "Thought process" chip down) + the whole result panel
    crops: [[920, 286, 690, 866], [2130, 54, 420, 540]],
    blur: [[985, 606, 110, 23], [1065, 747, 95, 18], [1126, 792, 98, 18], [1018, 370, 262, 17], [2163, 219, 124, 20], [2437, 360, 82, 18]],
    label: "AI chat files the application",
    ms: 1600,
  },
  application: {
    file: "id_job_application_L.png",
    crops: [[430, 70, 1960, 780]],
    blur: [[474, 112, 98, 22], [452, 457, 100, 22]],
    label: "Application: job post scraped into fields",
    ms: 1500,
  },
};

const NAV = 56; // <main> runs under the fixed 56 px nav.

/**
 * The landing snaps <main> to the nearest section when scrolling stops (its own
 * Element.scrollTo calls). Ignore the page's scrollTo on <main> (the helpers set
 * scrollTop directly) and turn off CSS smooth scrolling.
 */
const freezeSnap = (page) =>
  page.evaluate(() => {
    const m = document.querySelector("main");
    if (!m || window.__recSnapFrozen) return;
    window.__recSnapFrozen = true;
    m.style.scrollBehavior = "auto";
    for (const k of ["scrollTo", "scroll", "scrollBy"]) {
      const orig = Element.prototype[k];
      Element.prototype[k] = function (...a) {
        if (this === m) return;
        return orig.apply(this, a);
      };
    }
  });

/** The editor's "Full screen" puts a div in the top layer, above the cursor overlay: follow it. */
const cursorIntoFullscreen = (page) =>
  page.evaluate(() => {
    const host = document.fullscreenElement || document.documentElement;
    for (const id of ["__rec_caption", "__rec_cursor"]) {
      const c = document.getElementById(id);
      if (c && c.parentElement !== host) host.appendChild(c);
    }
  });

/**
 * Film a landing widget as a feature, not as a page section: after the section has
 * scrolled in (so its reveal ran), lift it into a full-frame opaque layer, hide the
 * landing nav, section numeral, headline and illustration footers, and optionally zoom
 * the widget. Runs off camera (in before()).
 */
const spotlight = async (h, { id, self = false, widget, hide = "", hideText = [], zoom = 1, fit = false, isolate = false, caption }) => {
  await h.jump(`#${id}`, { offset: NAV });
  await h.wait(1500);
  await h.page.evaluate(({ id, self, widget, hide, hideText, zoom, isolate }) => {
    const a = document.getElementById(id);
    const sec = self ? a : a.nextElementSibling;
    const bg = getComputedStyle(sec).backgroundColor;
    const st = document.createElement("style");
    st.textContent = ".ft-collar{display:none!important}";
    document.head.append(st);
    if (hide) for (const e of sec.querySelectorAll(hide)) e.style.display = "none";
    for (const re of hideText)
      for (const e of sec.querySelectorAll("p,div,span")) if (new RegExp(re, "i").test(e.textContent) && e.children.length < 3 && e.textContent.length < 160) e.style.display = "none";
    sec.style.cssText +=
      ";position:fixed;inset:0;z-index:2147483000;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:0;" +
      `background:${bg === "rgba(0, 0, 0, 0)" ? "#e8e5da" : bg}`;
    const w = sec.querySelector(widget);
    w.style.margin = "0 auto";
    if (zoom !== 1) { w.style.transform = `scale(${zoom})`; w.style.transformOrigin = "center center"; }
    if (isolate) for (let n = w; n && n !== sec; n = n.parentElement) for (const sib of n.parentElement.children) if (sib !== n) sib.style.display = "none";
    window.__recWidget = w;
  }, { id, self, widget, hide, hideText, zoom, isolate });
  if (fit) await fitWidget(h.page);
  await h.wait(250);
  if (caption) await h.caption(caption);
};

/**
 * Scale the spotlighted widget so its bounding box (and every text leaf inside) sits at
 * least 32 px inside the 1280x800 frame, centred, using the band above the caption pill.
 * Throws when something still crosses the margin.
 */
const fitWidget = async (page) => {
  const res = await page.evaluate(() => {
    const w = window.__recWidget;
    const M = 32, W = 1280, H = 800, CAP = 84;
    w.style.transform = "none";
    const r = w.getBoundingClientRect();
    const cs = Math.min(1.7, (W - 2 * M) / r.width, (H - M - CAP) / r.height);
    const cy = M + (H - M - CAP) / 2;
    const dy = cy - (r.top + r.height / 2);
    w.style.transformOrigin = "center center";
    w.style.transform = `translateY(${dy}px) scale(${cs})`;
    const bad = [];
    for (const e of [w, ...w.querySelectorAll("*")]) {
      const q = e.getBoundingClientRect();
      if (!q.width || !q.height || getComputedStyle(e).visibility === "hidden") continue;
      if (e !== w && e.children.length) continue;
      if (q.left < M - 1 || q.right > W - M + 1 || q.top < M - 1 || q.bottom > H - CAP + 8)
        bad.push(`${e.tagName}:${(e.textContent || "").slice(0, 20)} ${Math.round(q.left)},${Math.round(q.top)},${Math.round(q.right)},${Math.round(q.bottom)}`);
    }
    return { cs, bad };
  });
  if (res.bad.length) throw new Error(`zoomed widget crosses the 32 px margin (scale ${res.cs.toFixed(2)}): ${res.bad.slice(0, 4).join(" | ")}`);
};

/** Full-frame captioned stills (cropped screenshots), hard cuts between them. */
async function stills(page, list) {
  const items = list.map((s) => ({ ...s, src: dataUrl(s.file) }));
  await page.evaluate((items) => {
    const o = document.createElement("div");
    o.id = "__rec_stills";
    o.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;background:#e8e5da;opacity:0;" +
      "font-family:ui-sans-serif,system-ui,sans-serif;color:#22211d";
    const head = document.createElement("div");
    head.style.cssText = "position:absolute;left:40px;top:26px;right:40px;display:flex;align-items:baseline;gap:16px;white-space:nowrap";
    head.innerHTML =
      '<span style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#6b675c">Inside the signed-in app · screenshot</span>' +
      '<span id="__rec_still_label" style="font-size:24px;font-weight:600"></span>';
    o.appendChild(head);
    const MAXW = 1220, MAXH = 690, TOP = 70, GAP = 28;
    items.forEach((it, i) => {
      const sumW = it.crops.reduce((t, c) => t + c[2], 0);
      const maxH = Math.max(...it.crops.map((c) => c[3]));
      const s = Math.min(MAXH / maxH, (MAXW - GAP * (it.crops.length - 1)) / sumW);
      const total = sumW * s + GAP * (it.crops.length - 1);
      let x = (1280 - total) / 2;
      const group = document.createElement("div");
      group.dataset.i = String(i);
      group.style.cssText = "position:absolute;inset:0;opacity:0";
      for (const [cx, cy, cw, ch] of it.crops) {
        const w = cw * s, hgt = ch * s;
        const box = document.createElement("div");
        box.style.cssText =
          `position:absolute;left:${x}px;top:${TOP + (MAXH - maxH * s) / 2 + 10}px;width:${w}px;height:${hgt}px;` +
          "overflow:hidden;background:#fff;border:1px solid #c9c4b5;box-shadow:0 10px 30px rgba(0,0,0,.12)";
        const img = new Image();
        img.src = it.src;
        img.style.cssText = `position:absolute;left:${-cx * s}px;top:${-cy * s}px;width:${2560 * s}px;max-width:none`;
        box.appendChild(img);
        for (const [bx, by, bw, bh] of it.blur || []) {
          if (bx + bw < cx || bx > cx + cw || by + bh < cy || by > cy + ch) continue;
          const m = document.createElement("div");
          m.style.cssText =
            `position:absolute;left:${(bx - cx) * s}px;top:${(by - cy) * s}px;width:${bw * s}px;height:${bh * s}px;` +
            "backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);background:rgba(200,198,190,.75);border-radius:3px";
          box.appendChild(m);
        }
        group.appendChild(box);
        x += w + GAP;
      }
      o.appendChild(group);
    });
    document.body.appendChild(o);
    window.__recShow = (i, label) => {
      for (const b of o.querySelectorAll(":scope > [data-i]")) b.style.opacity = b.dataset.i === String(i) ? "1" : "0";
      document.getElementById("__rec_still_label").textContent = label;
      o.style.opacity = "1";
    };
  }, items.map(({ crops, src, blur }) => ({ crops, src, blur })));
  await page.waitForFunction(() => [...document.querySelectorAll("#__rec_stills img")].every((i) => i.complete));
  return items;
}

export default {
  url: "https://v0-job-hunting-platform-two.vercel.app/",
  target: 30,
  pacing: { scroller: "main", heroDwell: 900, moveMs: 200, featureLead: 100 },
  posterFrom: { segment: "marketing", at: 1.6 }, // the complete hero

  async beforeEach(h) {
    await h.cursor(false);
    await freezeSnap(h.page);
  },

  marketing: {
    title: "Landing page",
    async run(h) {
      const { page } = h;
      // Wordmark -> headline builds in (scroll-driven) -> the complete hero.
      await h.glide(1000, { ms: 600 });
      await page.getByRole("link", { name: /create an account/i }).first().waitFor({ state: "visible" });
      await h.waitForStill(300);
      await h.dwell(800);
      // Make the sections' scroll reveals instant so a cut never lands on a half-drawn frame.
      await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent =
          "[data-ft-part],.ft-line,[data-ft-room],[data-ft-group]{opacity:1!important;transform:none!important;transition:none!important;animation:none!important;clip-path:none!important;filter:none!important}" +
          ".ft-collar,.ft-collar *{opacity:1!important;transition:none!important}";
        document.head.append(st);
      });
      await h.slides([
        { at: page.getByText(/is what\s*every product says/i).first(), offset: NAV + 90, cut: true, settle: 150, hold: 700 },
        {
          at: "#request",
          offset: NAV,
          cut: true,
          settle: 150,
          hold: 100,
          async interact(h) {
            const cta = page.locator("#request").getByRole("link").first();
            if (await cta.count()) {
              const b = await cta.boundingBox();
              if (b) await h.moveTo(b.x + b.width / 2, b.y + b.height + 70, 16);
              await h.cursor(true);
              await h.hover(cta, 260);
              await h.beat(300);
            }
          },
        },
      ], { hold: 900, settle: 150 });
    },
  },


  get features() {
    return FEATURES;
  },
};

/** Cursor glide + a plain mouse click. h.click waits on Playwright actionability checks (~1 s on these pages). */
async function tap(h, locator, { pause = 120, move = 200 } = {}) {
  const el = (typeof locator === "string" ? h.page.locator(locator) : locator).first();
  await el.waitFor({ state: "visible" });
  const b = await el.boundingBox();
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, move);
  await h.page.mouse.down();
  await h.wait(40);
  await h.page.mouse.up();
  if (pause) await h.wait(pause);
}

const DOCS = {
  id: "documents",
  widget: ".ft-docs-plate",
  hide: ".ft-docs-side,.ft-ch-no",
  zoom: 1.6,
};

/** Open the resume editor's full screen (cursor glides onto the button first). */
async function openFullscreen(h) {
  const btn = h.page.getByRole("button", { name: /full screen/i }).first();
  const b = await btn.boundingBox();
  await h.moveTo(b.x + b.width / 2 - 30, b.y + b.height / 2 + 24, 16);
  await h.cursor(true);
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 120);
  await btn.click({ delay: 40 });
  await h.wait(250);
  await cursorIntoFullscreen(h.page);
}

const visible = (page, sel) => page.locator(sel.split(",").map((x) => `${x.trim()}:visible`).join(", "));

/** Pick a resume template in the (full screen) editor. */
async function pickTemplate(h, from, to, opts = {}) {
  const { page } = h;
  await tap(h, visible(page, "button, [role=combobox]").filter({ hasText: from }), { pause: opts.pause ?? 350, move: opts.move ?? 140 });
  await tap(h, visible(page, "[role=option]").filter({ hasText: to }), { pause: opts.pickPause ?? 900, move: opts.move ?? 120 });
}

/** One still as its own clip: a full-frame screenshot with a caption, held. */
const stillClip = (key, title, priority, still) => ({
  key,
  title,
  priority,
  async before(h) {
    h.items = await stills(h.page, [STILLS[still]]);
    await h.page.evaluate((label) => window.__recShow(0, label), h.items[0].label);
  },
  async run(h) {
    await h.wait(h.items[0].ms);
  },
});

const FEATURES = [
  {
    key: "resume-editor",
    title: "Resume editor: full screen + template switch",
    priority: 1,
    before: (h) => spotlight(h, { ...DOCS, caption: "Resume editor: the app's own, live" }),
    async run(h) {
      await openFullscreen(h);
      await pickTemplate(h, "Classic serif", "Teal sidebar", { pickPause: 1000 });
      // Stay in full screen on the Teal sidebar: the next clip continues from this exact state.
    },
  },
  {
    key: "resume-inline-edit",
    title: "Resume editor: edit an entry, the page updates",
    priority: 2,
    async before(h) {
      const { page } = h;
      await spotlight(h, DOCS);
      await openFullscreen(h);
      await h.cursor(false);
      await pickTemplate(h, "Classic serif", "Teal sidebar", { pause: 100, pickPause: 100, move: 20 });
      await h.wait(500);
      await h.waitForStill(800);
      await h.caption("Edit an entry: the page re-renders as you type");
      await cursorIntoFullscreen(page);
    },
    async run(h) {
      const { page } = h;
      const TYPED = " Owns the nightly reconciliation.";
      await h.cursor(true);
      const contentBtn = page.locator("button:visible").filter({ hasText: /content/i }).nth(1);
      await tap(h, contentBtn, { pause: 120, move: 160 });
      const field = page.locator("[contenteditable=true]:visible").first();
      await field.waitFor({ state: "visible", timeout: 4000 });
      await field.scrollIntoViewIfNeeded();
      await tap(h, field, { pause: 40, move: 120 });
      await page.keyboard.press("Control+End");
      await page.keyboard.type(TYPED, { delay: 16 });
      // Assert the payoff: the live preview (outside the editor) must contain the typed text.
      const found = await page
        .waitForFunction(
          (t) => {
            for (const e of document.querySelectorAll("p,div,span,li")) {
              if (e.children.length || e.closest("[contenteditable]") || !e.textContent.includes(t)) continue;
              const r = e.getBoundingClientRect();
              if (r.width && r.height && r.bottom > 0 && r.top < innerHeight) {
                e.scrollIntoView({ block: "center", behavior: "instant" });
                e.style.outline = "3px solid #f59e0b";
                e.style.outlineOffset = "3px";
                e.style.borderRadius = "3px";
                return true;
              }
            }
            return false;
          },
          TYPED.trim(),
          { timeout: 8000 }
        )
        .then(() => true, () => false);
      if (!found) throw new Error("resume-inline-edit: the preview never showed the typed text");
      await h.wait(250);
      // The preview re-renders once more after the text lands: outline the settled line.
      await page.evaluate((t) => {
        for (const e of document.querySelectorAll("p,div,span,li")) {
          if (e.children.length || e.closest("[contenteditable]") || !e.textContent.includes(t)) continue;
          if (!e.getBoundingClientRect().width) continue;
          e.style.outline = "3px solid #f59e0b";
          e.style.outlineOffset = "3px";
        }
      }, TYPED.trim());
      await h.beat(900);
    },
  },
  {
    key: "inheritance",
    title: "Inheritance map: one profile, many variations",
    priority: 2,
    before: (h) =>
      spotlight(h, {
        id: "inheritance",
        widget: ".ft-flow-wrap",
        hide: ".ft-ch-no,.ft-ch-head,.ft-lede,.ft-synthetic,.ft-reh-note",
        fit: true,
        caption: "Illustrated (landing page): one profile feeds every application",
      }),
    async run(h) {
      const main = h.page.locator("main");
      const pick = async (re, caption, pause = 100, move = 180) => {
        await tap(h, main.getByRole("button", { name: re }).first(), { pause, move });
        await h.caption(caption);
      };
      const corvid = main.getByRole("button", { name: /^Corvid Labs/ }).first();
      const cb = await corvid.boundingBox();
      await h.moveTo(cb.x - 120, cb.y + cb.height / 2, 16);
      await h.cursor(true);
      await pick(/^Corvid Labs/, "Illustrated: Profile → Platform engineering → Corvid Labs → résumé + letter");
      await h.dwell(850);
      await pick(/^Tenring/, "Illustrated: Profile → Founding backend → Tenring → résumé + questions", 100, 200);
      await h.dwell(850);
    },
  },
  {
    key: "job-search",
    title: "Job inbox (landing-page illustration)",
    priority: 3,
    before: (h) =>
      spotlight(h, {
        id: "agent",
        self: true,
        widget: ".ft-agent-grid",
        hide: ".ft-room-no,.ft-ch-head,.ft-lede,.ft-band,.ft-ft-no",
        hideText: ["illustration only"],
        caption: "Illustrated (landing page): each match read against your profile",
      }),
    async run(h) {
      const row = h.page.locator("#agent").getByRole("button").filter({ hasText: /corvid/i }).first();
      const rb = await row.boundingBox();
      await h.moveTo(rb.x + rb.width / 2, Math.min(780, rb.y + rb.height + 60), 16);
      await h.cursor(true);
      await tap(h, row, { pause: 100, move: 200 });
      await h.waitForStill(500);
      await h.dwell(1100);
    },
  },
  stillClip("pipeline-still", "Signed-in app: the applications pipeline", 3, "pipeline"),
  {
    key: "rehearsal",
    title: "Interview rehearsal (landing-page illustration)",
    priority: 4,
    before: (h) =>
      spotlight(h, {
        id: "rehearsal",
        widget: ".ft-reh-wrap",
        hide: ".ft-ch-no,.ft-ch-head,.ft-lede,.ft-synthetic,.ft-reh-note",
        fit: true,
        isolate: true,
        caption: "Illustrated (landing page): answers scored against a fixed rubric",
      }),
    async run(h) {
      const r = h.page.locator("main");
      await h.cursor(true);
      await tap(h, r.getByRole("button", { name: /bank\s*·?\s*behavioral/i }), { pause: 80, move: 180 });
      await h.dwell(1250);
      await tap(h, r.getByRole("button", { name: /template\s*·?\s*this application/i }), { pause: 80, move: 180 });
      await h.dwell(1250);
    },
  },
  stillClip("interview-still", "Signed-in app: practice interviews", 4, "interview"),
  {
    key: "app-stills",
    title: "Signed-in app: AI chat, application detail (screenshots)",
    priority: 5,
    async before(h) {
      h.items = await stills(h.page, [STILLS.chat, STILLS.application]);
      await h.page.evaluate((label) => window.__recShow(0, label), h.items[0].label);
    },
    async run(h) {
      for (let i = 0; i < h.items.length; i++) {
        if (i) await h.page.evaluate(({ i, label }) => window.__recShow(i, label), { i, label: h.items[i].label });
        await h.wait(h.items[i].ms);
      }
    },
  },
];
