#!/usr/bin/env node
/**
 * Record the project walkthrough videos shown in the project dialog and the
 * Featured viewer (issue #19).
 *
 * Usage
 *   pnpm record-videos                      # every project in FLOWS
 *   pnpm record-videos sonora cash-register # only these ids
 *   pnpm record-videos sonora --headed      # watch the run in a window
 *   pnpm record-videos sonora --keep-raw    # also keep the raw Playwright .webm
 *
 * Needs: ffmpeg on PATH (libx264 + libvpx-vp9) and a Playwright Chromium in the
 * local cache (`pnpm exec playwright-core install chromium` if it is missing).
 *
 * For each project it opens the app (the live deployment in FLOWS[id].url),
 * runs the scripted walkthrough in FLOWS[id].run with Playwright `recordVideo`
 * at 1280x800, trims the page-load lead-in, and writes to
 * public/projects_videos/<id>/:
 *   demo.mp4   H.264, yuv420p, +faststart, no audio, <= 3 MB
 *   demo.webm  VP9, no audio, smaller than the mp4
 *   poster.jpg a frame FLOWS[id].posterAt seconds into the clip (negative: from the end)
 *
 * A flow may define `prepare(page)`: it runs in a separate, unrecorded browser
 * context (e.g. a demo-account sign-in) and its storage state (cookies +
 * localStorage) is handed to the recorded context, so no login screen is ever
 * on tape. Flows use demo data only. When the app's UI changes, update its
 * selectors here and re-run.
 */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT_DIR = path.join(ROOT, "public", "projects_videos");
const VIEWPORT = { width: 1280, height: 800 };
const MAX_MP4_BYTES = 3 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Helpers handed to every flow
// ---------------------------------------------------------------------------

/** A visible cursor: headless recordings have none, which makes clicks unreadable. */
const CURSOR_SCRIPT = () => {
  const install = () => {
    if (document.getElementById("__rec_cursor")) return;
    const c = document.createElement("div");
    c.id = "__rec_cursor";
    c.style.cssText =
      "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;" +
      "background:rgba(20,20,20,.35);border:2px solid rgba(255,255,255,.95);box-shadow:0 1px 6px rgba(0,0,0,.35);" +
      "pointer-events:none;z-index:2147483647;transition:transform .12s ease,background .12s ease;" +
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

function makeHelpers(page) {
  let mouse = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };
  const wait = (ms) => page.waitForTimeout(ms);

  /** Glide the cursor to (x, y) so the viewer can follow it. */
  async function moveTo(x, y, ms = 450) {
    const steps = Math.max(8, Math.round(ms / 16));
    const from = { ...mouse };
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
      await page.waitForTimeout(ms / steps);
    }
    mouse = { x, y };
  }

  /** Smoothly scroll the element's nearest scrollable ancestor (or the window) to it. */
  async function scrollTo(locator, { offset = 80, duration = 900 } = {}) {
    await locator.first().evaluate(
      (el, { offset, duration }) =>
        new Promise((resolve) => {
          const scroller = (() => {
            for (let n = el.parentElement; n; n = n.parentElement) {
              const oy = getComputedStyle(n).overflowY;
              if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight + 4) return n;
            }
            return document.scrollingElement;
          })();
          const isDoc = scroller === document.scrollingElement;
          const top0 = scroller.scrollTop;
          const base = isDoc ? 0 : scroller.getBoundingClientRect().top;
          const max = scroller.scrollHeight - scroller.clientHeight;
          const target = Math.max(0, Math.min(max, top0 + el.getBoundingClientRect().top - base - offset));
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            scroller.scrollTo({ top: top0 + (target - top0) * e, behavior: "instant" });
            if (t < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        }),
      { offset, duration }
    );
    await wait(200);
  }

  /** Move the cursor onto the element, then click it. */
  async function click(locator, { pause = 250, move = 450 } = {}) {
    const el = locator.first();
    await el.waitFor({ state: "visible" });
    const box = await el.boundingBox();
    if (!box) throw new Error(`no box for ${el}`);
    await moveTo(box.x + box.width / 2, box.y + box.height / 2, move);
    await wait(120);
    // Playwright's own click: it re-checks actionability and lands on the same point.
    await el.click({ delay: 90 });
    await wait(pause);
  }

  async function hover(locator, ms = 450) {
    const box = await locator.first().boundingBox();
    if (box) await moveTo(box.x + box.width / 2, box.y + box.height / 2, ms);
  }

  async function type(locator, text, delay = 85) {
    await click(locator);
    await locator.first().pressSequentially(text, { delay });
  }

  return { page, wait, moveTo, scrollTo, click, hover, type };
}

// ---------------------------------------------------------------------------
// Per-project flows: the one main flow of each app, 20–40 s, demo data only
// ---------------------------------------------------------------------------

const FLOWS = {
  // Live: GitLab Pages static export. Hero choice → library → story → player.
  sonora: {
    url: "https://sonora-d09e63.gitlab.io/",
    posterAt: -1.5,
    async run(h) {
      const { page } = h;
      await h.wait(1200);
      await h.hover(page.getByRole("link", { name: "Start your first story" }), 600);
      await h.wait(400);
      await h.scrollTo(page.getByRole("button", { name: "Choose the sunlit path" }), { offset: 330, duration: 1300 });
      await h.wait(500);
      await h.click(page.getByRole("button", { name: "Take the shadowy path" }), { pause: 1200 });
      await h.click(page.getByRole("button", { name: "Choose the sunlit path" }), { pause: 1400 });
      await h.scrollTo(page.getByPlaceholder("Search stories..."), { offset: 140, duration: 1300 });
      await h.click(page.getByRole("button", { name: "Fantasy", exact: true }), { pause: 1000 });
      await h.click(page.getByRole("button", { name: "Fairy Tale", exact: true }), { pause: 1000 });
      await h.click(page.locator('a[href$="/story/1/"]').filter({ hasText: "Pre-Recorded" }), { pause: 300 });
      await page.waitForURL(/\/story\/1\/?$/);
      await page.waitForLoadState("networkidle");
      await h.wait(1200);
      await h.scrollTo(page.getByText("Every choice writes a different tale"), { offset: 120, duration: 1400 });
      await h.wait(1300);
      await h.scrollTo(page.getByRole("link", { name: "Start listening" }), { offset: 300, duration: 1100 });
      await h.click(page.getByRole("link", { name: "Start listening" }), { pause: 300 });
      await page.waitForURL(/\/player\/1\/?$/);
      await page.waitForLoadState("networkidle");
      await h.wait(900);
      await h.click(page.getByRole("button", { name: "Play" }), { pause: 300 });
      await h.moveTo(900, 470, 700);
      await h.wait(5000);
    },
  },

  // Live: GitLab Pages static export in demo mode (data in localStorage).
  // The demo operator signs in during `prepare`, off camera.
  "cash-register": {
    url: "https://cash-register-a85839.gitlab.io/",
    posterAt: 6,
    async prepare(page) {
      await page.goto("https://cash-register-a85839.gitlab.io/", { waitUntil: "networkidle" });
      await page.selectOption("select", "demo-op-carlos");
      await page.getByRole("button", { name: /Vendedores/ }).click();
      await page.getByRole("button", { name: /iniciar turno/i }).click();
      await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
    },
    async run(h) {
      const { page } = h;
      const product = (name) =>
        page.getByRole("button").filter({ has: page.getByText(name, { exact: true }) });
      await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
      await h.wait(1000);
      await h.click(product("Cerveja"), { pause: 500 });
      await h.click(product("Cerveja"), { pause: 500 });
      await h.click(product("Sidra"), { pause: 600 });
      await h.click(product("Água 33cl"), { pause: 700 });
      await h.click(page.getByRole("button", { name: /comida/i }), { pause: 900 });
      await h.click(product("Bifanas"), { pause: 500 });
      await h.click(product("Bifanas"), { pause: 500 });
      await h.click(product("Batata Fritas"), { pause: 700 });
      await h.type(page.getByPlaceholder(/Procurar produto/), "gin");
      await h.wait(700);
      await h.click(product("Gin tónico"), { pause: 1100 });
      await h.click(page.getByRole("button", { name: /confirmar pedido/i }), { pause: 1100 });
      await h.click(page.getByRole("button", { name: /^\+20€$/ }), { pause: 900 });
      await h.click(page.getByRole("button", { name: /confirmar pagamento/i }), { pause: 2200 });
      await h.click(page.getByRole("link", { name: /pedidos/i }).first(), { pause: 300 });
      await page.waitForURL(/\/orders\/?$/);
      await h.wait(1800);
      await h.click(page.locator("main").getByRole("button").filter({ hasText: /€/ }).first(), { pause: 2400 });
    },
  },

  // Live: the Vercel landing mounts the app's real components on in-memory
  // demo records (no account): inheritance map, the resume editor, the job inbox.
  // The signed-in app itself needs Supabase + a login, so it is not used here.
  "job-ai-hub": {
    url: "https://v0-job-hunting-platform-two.vercel.app/",
    posterAt: 15,
    async run(h) {
      const { page } = h;
      await h.wait(1500);
      await h.scrollTo(page.locator("#inheritance"), { offset: 60, duration: 1300 });
      await h.wait(500);
      for (const name of [/^Halden Systems/, /^Corvid Labs/, /^Tenring/]) {
        await h.click(page.getByRole("button", { name }), { pause: 1000 });
      }
      await h.scrollTo(page.locator("#documents"), { offset: 60, duration: 1300 });
      await h.wait(900);
      await h.click(page.getByRole("button", { name: /full screen/i }), { pause: 1200 });
      const visible = (sel) => page.locator(sel.split(",").map((x) => `${x.trim()}:visible`).join(", "));
      await h.click(visible("button, [role=combobox]").filter({ hasText: "Classic serif" }), { pause: 700 });
      await h.click(visible("[role=option]").filter({ hasText: "Teal sidebar" }), { pause: 1600 });
      await h.click(visible("button").filter({ hasText: /^\s*style\s*$/i }), { pause: 1700 });
      await h.click(visible("button").filter({ hasText: /^\s*parts\s*$/i }), { pause: 900 });
      await h.click(page.getByRole("button", { name: /exit full screen/i }), { pause: 800 });
      await h.scrollTo(page.locator("#agent"), { offset: 60, duration: 1500 });
      await h.wait(700);
      await h.click(page.locator("#agent").getByRole("button").filter({ hasText: "CORVID" }), { pause: 1500 });
      await h.click(page.locator("#agent").getByRole("button").filter({ hasText: "TENRING" }), { pause: 1500 });
      await h.click(page.locator("#agent").getByRole("button").filter({ hasText: "HALDEN" }), { pause: 1500 });
    },
  },
};

// ---------------------------------------------------------------------------
// Recording + encoding
// ---------------------------------------------------------------------------

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function encode(raw, start, duration, dir, posterAt) {
  const mp4 = path.join(dir, "demo.mp4");
  const webm = path.join(dir, "demo.webm");
  const poster = path.join(dir, "poster.jpg");
  const trim = ["-ss", start.toFixed(2), "-t", duration.toFixed(2), "-i", raw];
  const vf = ["-vf", "scale=1280:-2:flags=lanczos,fps=25"];

  for (let crf = 23; ; crf += 2) {
    ffmpeg([...trim, ...vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf),
      "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
    if (fs.statSync(mp4).size <= MAX_MP4_BYTES || crf >= 35) break;
  }
  for (let crf = 38; ; crf += 3) {
    ffmpeg([...trim, ...vf, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf),
      "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", webm]);
    if (fs.statSync(webm).size < fs.statSync(mp4).size || crf >= 50) break;
  }
  const at = posterAt < 0 ? duration + posterAt : posterAt;
  ffmpeg(["-ss", Math.max(0, Math.min(at, duration - 0.5)).toFixed(2), "-i", mp4,
    "-frames:v", "1", "-q:v", "3", poster]);
  return { mp4, webm, poster };
}

async function record(browser, id, flow, { keepRaw }) {
  const rawDir = fs.mkdtempSync(path.join(os.tmpdir(), `rec-${id}-`));
  let storageState;
  if (flow.prepare) {
    const ctx = await browser.newContext({ viewport: VIEWPORT });
    await flow.prepare(await ctx.newPage());
    storageState = await ctx.storageState();
    await ctx.close();
  }

  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    screen: VIEWPORT, // so an element's requestFullscreen() fills the recorded frame
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "Europe/Lisbon",
    storageState,
    recordVideo: { dir: rawDir, size: VIEWPORT },
  });
  await ctx.addInitScript(CURSOR_SCRIPT);
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto(flow.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const start = (Date.now() - t0) / 1000;
  try {
    await flow.run(makeHelpers(page));
  } catch (err) {
    const shot = path.join(rawDir, "failure.png");
    await page.screenshot({ path: shot }).catch(() => {});
    console.error(`${id}: flow failed at ${page.url()} (screenshot: ${shot})`);
    await ctx.close();
    throw err;
  }
  const end = (Date.now() - t0) / 1000;
  const video = page.video();
  await ctx.close();
  const raw = await video.path();

  const dir = path.join(OUT_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  const duration = end - start;
  const files = encode(raw, start, duration, dir, flow.posterAt ?? 1);
  if (keepRaw) fs.copyFileSync(raw, path.join(dir, "raw.webm"));
  fs.rmSync(rawDir, { recursive: true, force: true });

  const kb = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;
  console.log(`${id}: ${duration.toFixed(1)} s  mp4 ${kb(files.mp4)}  webm ${kb(files.webm)}  poster ${kb(files.poster)}`);
  if (duration < 20 || duration > 40) console.warn(`  ! ${id} runs ${duration.toFixed(1)} s, outside 20–40 s`);
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const ids = args.filter((a) => !a.startsWith("--"));
  const unknown = ids.filter((id) => !FLOWS[id]);
  if (unknown.length) {
    console.error(`No flow for: ${unknown.join(", ")}. Known: ${Object.keys(FLOWS).join(", ")}`);
    process.exit(1);
  }
  const browser = await chromium.launch({
    headless: !flags.has("--headed"),
    args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", `--window-size=${VIEWPORT.width},${VIEWPORT.height}`],
  });
  try {
    for (const id of ids.length ? ids : Object.keys(FLOWS)) {
      await record(browser, id, FLOWS[id], { keepRaw: flags.has("--keep-raw") });
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
