// Live: the Vercel landing mounts the app's real components on in-memory
// demo records (no account): inheritance map, the resume editor, rehearsal,
// the job inbox. The signed-in app needs Supabase + a login, so the pipeline
// (dashboard, applications Kanban) and the AI chat close the clip as captioned
// stills from the CV gallery (public/projects_images/job-ai-hub/).
//
// The page scrolls inside <main> (html/body are overflow:hidden) and the hero is
// a pinned, scroll-driven section: the first screen is only the "Job AI Hub"
// wordmark, and the headline, copy and CTAs build in over the first ~1000 px.
// So the flow does its own hero: hold the wordmark, glide through the build-up,
// then hold the complete hero. Section moves are single paced glides (never
// faster than ~800 px/s) so no frame is spent parked between two sections.
import fs from "node:fs";

const IMG_DIR = new URL("../../public/projects_images/job-ai-hub/", import.meta.url);
const dataUrl = (f) => `data:image/png;base64,${fs.readFileSync(new URL(f, IMG_DIR)).toString("base64")}`;

// Stills of the signed-in app (2560x1266 captures); crop = [x, y, w, h] in image px.
// The Kanban is cropped to its first three stages (title, Saved, Applied, Interviewing) so the card text stays legible;
// the chat is cropped below the (already cut) user bubble, reply + result panel.
const STILLS = [
  { file: "job_applications_L.png", crop: [420, 60, 1190, 255], label: "Applications pipeline", ms: 2400 },
  { file: "ai_chat_L.png", crop: [935, 290, 1610, 860], label: "AI chat: a reply that files the application", ms: 2700 },
];

// <main> runs under the fixed 56 px nav.
const NAV = 56;

/**
 * The landing snaps <main> to the nearest section/anchor when scrolling stops
 * (its own Element.scrollTo calls), which drags a tall section like Job search
 * back to its heading and crops the inbox. Ignore the page's scrollTo on <main>
 * for the recording (glide() sets scrollTop directly), and turn off CSS smooth
 * scrolling so scrollTop writes land immediately.
 */
const freezeSnap = (page) =>
  page.evaluate(() => {
    const m = document.querySelector("main");
    m.style.scrollBehavior = "auto";
    for (const k of ["scrollTo", "scroll", "scrollBy"]) {
      const orig = Element.prototype[k];
      Element.prototype[k] = function (...a) {
        if (this === m) return;
        return orig.apply(this, a);
      };
    }
  });

const setCursor = (page, visible) =>
  page.evaluate((v) => {
    const c = document.getElementById("__rec_cursor");
    if (c) c.style.opacity = v ? "1" : "0";
  }, visible);

/**
 * The editor's "Full screen" uses the Fullscreen API on a div, which puts it in
 * the top layer above the cursor overlay. Move the cursor into the fullscreen
 * element while it is up, and back to <html> when it closes.
 */
const cursorIntoFullscreen = (page) =>
  page.evaluate(() => {
    const c = document.getElementById("__rec_cursor");
    if (!c) return;
    const host = document.fullscreenElement || document.documentElement;
    if (c.parentElement !== host) host.appendChild(c);
  });

/** scrollTop of <main> that puts `locator`'s top `offset` px below main's top edge. */
const topFor = (locator, offset) =>
  locator.first().evaluate((el, offset) => {
    const m = document.querySelector("main");
    return m.scrollTop + el.getBoundingClientRect().top - m.getBoundingClientRect().top - offset;
  }, offset);

/** One continuous eased scroll of <main> to `top`, at most `speed` px/s. */
async function glide(page, top, { speed = 800, minMs = 700 } = {}) {
  const from = await page.evaluate(() => document.querySelector("main").scrollTop);
  const ms = Math.max(minMs, (Math.abs(top - from) / speed) * 1000);
  await page.evaluate(
    ({ top, ms }) =>
      new Promise((resolve) => {
        const s = document.querySelector("main");
        const max = s.scrollHeight - s.clientHeight;
        const to = Math.max(0, Math.min(max, top));
        const top0 = s.scrollTop;
        const t0 = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - t0) / ms);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          s.scrollTop = top0 + (to - top0) * e;
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    { top, ms }
  );
}

/** Glide to a section, let its reveal animation finish, then hold it. */
async function section(h, locator, { offset = NAV, hold = 2500 } = {}) {
  await glide(h.page, await topFor(locator, offset));
  await h.wait(400);
  await h.waitForStill(1000);
  await h.dwell(hold);
}

/** Full-frame captioned stills (cropped screenshots), cross-faded. */
async function stills(page) {
  const items = STILLS.map((s) => ({ ...s, src: dataUrl(s.file) }));
  await page.evaluate((items) => {
    const o = document.createElement("div");
    o.id = "__rec_stills";
    o.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;background:#e8e5da;opacity:0;transition:opacity .25s ease;" +
      "font-family:ui-sans-serif,system-ui,sans-serif;color:#22211d";
    const head = document.createElement("div");
    head.style.cssText = "position:absolute;left:40px;top:26px;right:40px;display:flex;align-items:baseline;gap:16px";
    head.innerHTML =
      '<span style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#6b675c">Inside the signed-in app · screenshot</span>' +
      '<span id="__rec_still_label" style="font-size:24px;font-weight:600;transition:opacity .3s"></span>';
    o.appendChild(head);
    const MAXW = 1220, MAXH = 680, TOP = 80;
    items.forEach((it, i) => {
      const [cx, cy, cw, ch] = it.crop;
      const s = Math.min(MAXW / cw, MAXH / ch);
      const w = cw * s, hgt = ch * s;
      const box = document.createElement("div");
      box.dataset.i = String(i);
      box.style.cssText =
        `position:absolute;left:${(1280 - w) / 2}px;top:${TOP + (MAXH - hgt) / 2 + 10}px;width:${w}px;height:${hgt}px;` +
        "overflow:hidden;background:#fff;border:1px solid #c9c4b5;box-shadow:0 10px 30px rgba(0,0,0,.12);" +
        "opacity:0;transition:opacity .25s ease";
      const img = new Image();
      img.src = it.src;
      img.style.cssText = `position:absolute;left:${-cx * s}px;top:${-cy * s}px;width:${2560 * s}px;max-width:none`;
      box.appendChild(img);
      o.appendChild(box);
    });
    document.body.appendChild(o);
    window.__recShow = (i, label) => {
      // Hard cut between stills (no two blended screenshots on screen).
    for (const b of o.querySelectorAll("[data-i]")) {
      b.style.transition = "none";
      b.style.opacity = b.dataset.i === String(i) ? "1" : "0";
    }
      document.getElementById("__rec_still_label").textContent = label;
    };
  }, items.map(({ crop, src }) => ({ crop, src })));
  await page.waitForFunction(() => [...document.querySelectorAll("#__rec_stills img")].every((i) => i.complete));
  for (let i = 0; i < items.length; i++) {
    await page.evaluate(({ i, label }) => {
      window.__recShow(i, label);
      document.getElementById("__rec_stills").style.opacity = "1";
    }, { i, label: items[i].label });
    await page.waitForTimeout(250 + items[i].ms);
  }
}

export default {
  url: "https://v0-job-hunting-platform-two.vercel.app/",
  // The complete hero (headline, copy, CTAs).
  posterAt: 5,
  // run() does its own hero hold (the first screen is only the wordmark), and the
  // recorder's settle is kept short so the cursor can be hidden right away.
  pacing: { heroDwell: 0, settleMax: 300 },
  async run(h) {
    const { page } = h;
    const main = page.locator("main");
    await setCursor(page, false);
    await freezeSnap(page);

    // Hero: a short beat on the wordmark, the headline building in, then the full hero.
    await h.waitForStill(1200);
    await h.dwell(400);
    await glide(page, 1000, { speed: 520 });
    await page.getByRole("link", { name: /create an account/i }).first().waitFor({ state: "visible" });
    await h.wait(300);
    await h.waitForStill(1200);
    await h.dwell(3000);

    // How it works: one quick glide past the claim, straight to the map.
    await glide(page, await topFor(page.locator("#inheritance"), NAV), { speed: 3200, minMs: 550 });
    await h.wait(300);
    await h.waitForStill(1000);
    await h.dwell(600);
    const corvid = main.getByRole("button", { name: /^Corvid Labs/ }).first();
    const cb = await corvid.boundingBox();
    // Come in from the left on Corvid's row so the cursor never crosses Halden.
    await h.moveTo(cb.x - 120, cb.y + cb.height / 2, 16);
    await setCursor(page, true);
    await h.moveTo(cb.x + 12, cb.y + cb.height / 2, 400);
    await h.click(corvid, { pause: 200, move: 180 });
    await h.dwell(3500);

    // Documents: the real resume editor, full screen, template switch.
    await setCursor(page, false);
    await glide(page, await topFor(page.locator("#documents"), NAV), { speed: 1600, minMs: 650 });
    await h.wait(300);
    await h.waitForStill(600);
    await h.dwell(200);
    await setCursor(page, true);
    await h.click(page.getByRole("button", { name: /full screen/i }), { pause: 500 });
    await cursorIntoFullscreen(page);
    const visible = (sel) => page.locator(sel.split(",").map((x) => `${x.trim()}:visible`).join(", "));
    const template = visible("button, [role=combobox]").filter({ hasText: "Classic serif" });
    await h.hover(template, 450);
    await h.wait(300);
    await h.click(template, { pause: 1000, move: 100 });
    await h.click(visible("[role=option]").filter({ hasText: "Teal sidebar" }), { pause: 1800, move: 450 });
    await h.click(page.getByRole("button", { name: /exit full screen/i }), { pause: 250, move: 500 });
    await cursorIntoFullscreen(page);
    await setCursor(page, false);

    // Rehearsal, straight from the editor (no second stop on Documents).
    await glide(page, await topFor(page.locator("#rehearsal"), NAV), { speed: 1600, minMs: 650 });
    await h.wait(300);
    await h.waitForStill(1000);
    await h.dwell(2300);

    // Job search: eyebrow clear of the nav, inbox + the "Read against your profile" panel.
    const eyebrow = page.locator("#agent").getByText(/^job search$/i).first();
    const agentTop = (await eyebrow.count())
      ? await topFor(eyebrow, NAV + 36)
      : (await topFor(page.locator("#agent"), NAV)) - 4;
    await glide(page, agentTop, { speed: 2400, minMs: 550 });
    await h.wait(300);
    await h.waitForStill(800);
    await h.dwell(500);
    const corvidRow = page.locator("#agent").getByRole("button").filter({ hasText: /corvid/i }).first();
    const rb = await corvidRow.boundingBox();
    await h.moveTo(rb.x + rb.width / 2, Math.min(780, rb.y + rb.height + 60), 16);
    await setCursor(page, true);
    await h.click(corvidRow, { pause: 300 });
    await h.waitForStill(1000);
    await h.dwell(2300);

    // The signed-in app, as captioned screenshots.
    await setCursor(page, false);
    await stills(page);
  },
};
