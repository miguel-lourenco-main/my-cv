#!/usr/bin/env node
/**
 * Record the project walkthrough videos shown in the project dialog and the
 * Featured viewer (issue #19).
 *
 * Usage
 *   pnpm record-videos                          # every flow in scripts/video-flows/
 *   pnpm record-videos sonora cash-register     # only these ids
 *   pnpm record-videos sonora --headed          # watch the run in a window
 *   pnpm record-videos sonora --keep-raw        # also keep the raw Playwright .webm
 *   pnpm record-videos sonora --frames <dir>    # also export review frames (see below)
 *   pnpm record-videos sonora --out <dir>       # write demo.* to <dir>/<id>/ instead of public/
 *   pnpm record-videos sonora --port-base 5100  # base for locally served apps (default 4100)
 *   pnpm record-videos sonora --frames <dir> --reframe  # frames from the existing demo.mp4, no recording
 *   pnpm record-videos --list                   # print the known ids and their ports
 *
 * Needs: ffmpeg + ffprobe on PATH (libx264, libvpx-vp9, drawtext) and a
 * Playwright Chromium in the local cache (`pnpm exec playwright-core install chromium`).
 *
 * Flows
 *   Each project's walkthrough lives in its own module, scripts/video-flows/<id>.mjs,
 *   loaded dynamically: adding a project never needs an edit here. Files whose
 *   name starts with "_" are shared code, not flows. A flow module default-exports:
 *
 *     url        string, or ({ port }) => string. The page the recording opens.
 *     run(h)     the scripted walkthrough; `h` is the helper set from makeHelpers().
 *     posterAt   seconds into the clip for poster.jpg (negative: from the end). Default 1.
 *     prepare(page, ctx)  optional. Runs in a separate, UNRECORDED context (e.g. a
 *                demo sign-in); its storage state (cookies + localStorage) is handed
 *                to the recorded context, so no login screen is ever on tape.
 *     server({ port })    optional, for an app that must run locally. Returns
 *                { command, args, cwd, env, url, readyTimeoutMs }; the recorder spawns
 *                it, waits until `url` answers, records, then kills the process group.
 *                `port` is unique per id (see Ports) so parallel recorders never clash.
 *     pacing     optional overrides of PACING below, for this flow only.
 *     colorScheme / locale  optional context overrides ("light", "en-US" by default).
 *
 * Pacing (the defaults every flow inherits; the reason this exists is a video that
 * scrolled past the hero before anyone could read it)
 *   - After the first load the recorder waits for the page to settle (intro
 *     animations, splash screens, typed-in text; at most `settleMax`), then holds
 *     it still for `heroDwell` (3.5 s) before the flow's run() starts, so the
 *     final hero is always readable. h.waitForStill() is available to flows too.
 *   - h.scrollTo() / h.scrollBy() never jump: each step moves at most ~0.75
 *     viewport (preferring to stop at a section or heading start), no faster than
 *     `maxScrollSpeed` px/s, and pauses `sectionPause` on every intermediate stop
 *     whose viewport shows content (text, images, canvases).
 *   - h.click() on an off-screen element brings it in with the same paced scroll.
 *   - Any click that changes the page path (a navigation, full or client-side)
 *     waits for the load and then holds `navDwell` (3 s) so the new page's hero is
 *     readable too. h.goto(url) does the same.
 *
 * Output, per id, in public/projects_videos/<id>/ (or --out <dir>/<id>/):
 *   demo.mp4   H.264, yuv420p, +faststart, no audio, <= 3 MB
 *   demo.webm  VP9, no audio, smaller than the mp4
 *   poster.jpg a frame `posterAt` seconds into the clip
 *
 * --frames <dir>  (for review / jury agents) after encoding, writes into <dir>
 *   (into <dir>/<id>/ when several ids are recorded in one run):
 *   t0000s.png, t0001s.png, ...  one frame per second of demo.mp4, 640 px wide,
 *                                named by its timestamp in seconds
 *   contact-sheet.png            all of those, tiled, each labelled with its time
 *   stats.json                   duration, mp4/webm/poster bytes, resolution, fps, url
 *
 * Ports
 *   An app that has to be run locally gets port = portBase + index of its id in
 *   PORT_ORDER (portBase 4100 by default, --port-base to change it), e.g.
 *   oflat 4100, edgen-chat 4101, ... job-ai-hub 4109. An id not in the list gets
 *   portBase + 20 + its position in the sorted flow list.
 *
 * Parallel use: one process per id is safe in a single checkout. Each run has its
 * own browser, its own temp dir, its own output folder and its own port.
 *
 * Flows use demo data only. When an app's UI changes, update its selectors in
 * its flow module and re-run.
 */
import { chromium } from "playwright-core";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FLOWS_DIR = path.join(ROOT, "scripts", "video-flows");
const DEFAULT_OUT_DIR = path.join(ROOT, "public", "projects_videos");
const VIEWPORT = { width: 1280, height: 800 };
const MAX_MP4_BYTES = 3 * 1024 * 1024;

export const PORT_ORDER = [
  "oflat", "edgen-chat", "edgen-code", "edgen-translate", "sonora",
  "agentic-hub", "o-guardanapo", "ui-components", "cash-register", "job-ai-hub",
];

/** Defaults every flow inherits; a flow may override any of them via `pacing`. */
export const PACING = {
  heroDwell: 3500,      // ms the first screen is held still before run(), after it settles
  settleMax: 8000,      // max ms to wait for intro animations / splash screens to finish
  navDwell: 3000,       // ms held after any navigation, once the new page has loaded
  maxScrollSpeed: 900,  // px/s cap for h.scrollTo()
  scrollStep: 0.75,     // max fraction of the viewport moved per scroll step
  minStepMs: 650,       // a scroll step never takes less than this
  sectionPause: 1300,   // ms paused on each intermediate step that shows content
  arrivePause: 700,     // ms paused once h.scrollTo() reaches its target
};

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

/** Path + search of a URL: a hash-only change is not a navigation. */
const pageKey = (u) => {
  try {
    const x = new URL(u);
    return x.origin + x.pathname + x.search;
  } catch {
    return u;
  }
};

export function makeHelpers(page, pacing = PACING, extra = {}) {
  let mouse = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };
  const wait = (ms) => page.waitForTimeout(ms);

  /** Hold the frame still (no cursor, no scroll) for `ms`. */
  const dwell = (ms) => wait(ms);

  /**
   * Wait until the page stops changing on its own (intro animations, splash
   * screens, typewriter text): no finite CSS/Web animation running and the
   * visible text unchanged across two polls. Gives up after `maxMs` (pages with
   * endless background motion never settle). Returns the ms waited.
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
      await wait(250);
    }
    return Date.now() - t0;
  }

  /** Wait for a freshly navigated page to settle, then hold it for navDwell. */
  async function settleNavigation(ms = pacing.navDwell) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await waitForStill();
    await dwell(ms);
  }

  /** Navigate the recorded page (on camera) and hold the new page's hero. */
  async function goto(url, { dwellMs = pacing.navDwell } = {}) {
    await page.goto(url, { waitUntil: "networkidle" });
    await waitForStill();
    await dwell(dwellMs);
  }

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

  /**
   * Find the element's nearest scrollable ancestor (or the window), park it on
   * window.__recScroller and return { from, to, viewport }.
   */
  const resolveScroll = (locator, offset) =>
    locator.first().evaluate((el, offset) => {
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

  /** Ease the parked scroller to `top` over `duration` ms. */
  const animateScroll = (top, duration) =>
    page.evaluate(
      ({ top, duration }) =>
        new Promise((resolve) => {
          const s = window.__recScroller || document.scrollingElement;
          const top0 = s.scrollTop;
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            s.scrollTo({ top: top0 + (top - top0) * e, behavior: "instant" });
            if (t < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        }),
      { top, duration }
    );

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

  /**
   * Next intermediate stop between `cur` and `to`: the furthest section or
   * heading top that is at most `maxStep` away (so a pause lands on a section's
   * start, not mid-paragraph), else a plain `maxStep` move.
   */
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
  async function stepScroll(from, to, viewport, { duration = 0, pause = pacing.arrivePause } = {}) {
    const dist = Math.abs(to - from);
    if (dist >= 2) {
      const maxStep = Math.max(120, viewport * pacing.scrollStep);
      const dir = Math.sign(to - from);
      const floorMs = duration / Math.max(1, Math.ceil(dist / maxStep));
      let cur = from;
      for (let guard = 0; guard < 60; guard++) {
        const last = Math.abs(to - cur) <= maxStep;
        const stop = last ? to : await nextStop(cur, to, maxStep);
        const d = Math.abs(stop - cur);
        await animateScroll(stop, Math.max(pacing.minStepMs, (d / pacing.maxScrollSpeed) * 1000, floorMs));
        cur = stop;
        if (last || (to - cur) * dir <= 0) break;
        if (await viewportHasContent()) await wait(pacing.sectionPause);
      }
    }
    await wait(pause);
  }

  /**
   * Scroll the element's scroller to it without ever jumping past a section:
   * steps of at most `scrollStep` viewports, speed capped at `maxScrollSpeed`,
   * a `sectionPause` on every intermediate step that shows content.
   * `duration` is a floor for the whole move (kept for old flows), not a ceiling.
   */
  async function scrollTo(locator, { offset = 80, duration = 0, pause = pacing.arrivePause } = {}) {
    const { from, to, viewport } = await resolveScroll(locator, offset);
    await stepScroll(from, to, viewport, { duration, pause });
  }

  /** Scroll the window by `dy` px with the same step/speed/pause rules. */
  async function scrollBy(dy, { duration = 0, pause = pacing.arrivePause } = {}) {
    const { from, to, viewport } = await page.evaluate((dy) => {
      const s = document.scrollingElement;
      window.__recScroller = s;
      const max = s.scrollHeight - s.clientHeight;
      return { from: s.scrollTop, to: Math.max(0, Math.min(max, s.scrollTop + dy)), viewport: window.innerHeight };
    }, dy);
    await stepScroll(from, to, viewport, { duration, pause });
  }

  /**
   * Move the cursor onto the element, then click it. If the click changes the
   * page (path or query), wait for the new page and hold it for navDwell.
   */
  async function click(locator, { pause = 250, move = 450, navDwell = pacing.navDwell } = {}) {
    const el = locator.first();
    await el.waitFor({ state: "visible" });
    let box = await el.boundingBox();
    // Off screen: bring it in with the paced scroll, never a jump.
    if (box && (box.y < 0 || box.y + box.height > VIEWPORT.height)) {
      await scrollTo(el, { offset: Math.max(80, (VIEWPORT.height - box.height) / 2), pause: 300 });
      box = await el.boundingBox();
    }
    if (!box) throw new Error(`no box for ${el}`);
    await moveTo(box.x + box.width / 2, box.y + box.height / 2, move);
    await wait(120);
    const before = pageKey(page.url());
    // Playwright's own click: it re-checks actionability and lands on the same point.
    await el.click({ delay: 90 });
    await wait(pause);
    if (pageKey(page.url()) !== before) await settleNavigation(navDwell);
  }

  async function hover(locator, ms = 450) {
    const box = await locator.first().boundingBox();
    if (box) await moveTo(box.x + box.width / 2, box.y + box.height / 2, ms);
  }

  async function type(locator, text, delay = 85) {
    await click(locator);
    await locator.first().pressSequentially(text, { delay });
  }

  return {
    page, pacing, viewport: VIEWPORT, ...extra,
    wait, dwell, waitForStill, goto, settleNavigation, moveTo, scrollTo, scrollBy, click, hover, type,
  };
}

// ---------------------------------------------------------------------------
// Flow discovery
// ---------------------------------------------------------------------------

function flowIds() {
  return fs
    .readdirSync(FLOWS_DIR)
    .filter((f) => f.endsWith(".mjs") && !f.startsWith("_"))
    .map((f) => f.slice(0, -4))
    .sort();
}

async function loadFlow(id) {
  const mod = await import(pathToFileURL(path.join(FLOWS_DIR, `${id}.mjs`)).href);
  const flow = mod.default;
  if (!flow || typeof flow.run !== "function") throw new Error(`${id}.mjs must default-export { url, run }`);
  return flow;
}

export function portFor(id, portBase = 4100) {
  const i = PORT_ORDER.indexOf(id);
  if (i >= 0) return portBase + i;
  return portBase + 20 + flowIds().indexOf(id);
}

// ---------------------------------------------------------------------------
// Local app servers (flows with `server`)
// ---------------------------------------------------------------------------

async function startServer(id, spec) {
  const { command, args = [], cwd, env = {}, url, readyTimeoutMs = 180000 } = spec;
  console.log(`${id}: starting ${command} ${args.join(" ")} in ${cwd}`);
  const child = spawn(command, args, {
    cwd, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"], detached: true,
  });
  let log = "";
  const keep = (b) => { log = (log + b.toString()).slice(-8000); };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);
  const stop = () => {
    try { process.kill(-child.pid, "SIGTERM"); } catch {}
  };
  const deadline = Date.now() + readyTimeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) break;
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return { stop };
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  stop();
  throw new Error(`${id}: server never answered at ${url}\n--- last output ---\n${log}`);
}

// ---------------------------------------------------------------------------
// Recording + encoding
// ---------------------------------------------------------------------------

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function probe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,r_frame_rate,codec_name:format=duration",
    "-of", "json", file]).toString();
  const j = JSON.parse(out);
  const s = j.streams[0];
  const [n, d] = s.r_frame_rate.split("/").map(Number);
  return { width: s.width, height: s.height, fps: d ? n / d : n, codec: s.codec_name, duration: Number(j.format.duration) };
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

/** One PNG per second (640 px wide), a labelled contact sheet and stats.json. */
function exportFrames(id, files, framesDir, meta) {
  fs.mkdirSync(framesDir, { recursive: true });
  for (const f of fs.readdirSync(framesDir)) {
    if (/^t\d+s\.png$/.test(f) || f === "contact-sheet.png" || f === "stats.json") fs.rmSync(path.join(framesDir, f));
  }
  const info = probe(files.mp4);
  const tmp = fs.mkdtempSync(path.join(framesDir, ".tmp-frames-")); // same device: rename works
  // fps=1 with round=down: output frame n is the source frame at t = n seconds.
  ffmpeg(["-i", files.mp4, "-vf", "fps=1:round=down,scale=640:-2:flags=lanczos", "-start_number", "0",
    path.join(tmp, "%d.png")]);
  const shots = fs.readdirSync(tmp).map((f) => Number(f.slice(0, -4))).sort((a, b) => a - b);
  for (const n of shots) {
    fs.renameSync(path.join(tmp, `${n}.png`), path.join(framesDir, `t${String(n).padStart(4, "0")}s.png`));
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  const cols = 5;
  const rows = Math.max(1, Math.ceil(shots.length / cols));
  const label = (withText) =>
    "scale=320:-2:flags=lanczos" +
    (withText
      ? ",drawtext=text='%{eif\\:n\\:d}s':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=4"
      : "") +
    `,tile=${cols}x${rows}:padding=6:margin=6:color=0x202020`;
  const sheet = path.join(framesDir, "contact-sheet.png");
  const sheetArgs = (vf) => ["-framerate", "1", "-start_number", "0", "-i", path.join(framesDir, "t%04ds.png"),
    "-vf", vf, "-frames:v", "1", sheet];
  try {
    ffmpeg(sheetArgs(label(true)));
  } catch {
    ffmpeg(sheetArgs(label(false)));
  }

  const bytes = (f) => fs.statSync(f).size;
  const stats = {
    id,
    url: meta.url,
    recordedAt: new Date().toISOString(),
    duration: Number(info.duration.toFixed(2)),
    resolution: `${info.width}x${info.height}`,
    width: info.width,
    height: info.height,
    fps: info.fps,
    mp4Bytes: bytes(files.mp4),
    webmBytes: bytes(files.webm),
    posterBytes: bytes(files.poster),
    mp4LimitBytes: MAX_MP4_BYTES,
    frames: shots.length,
    frameWidth: 640,
    pacing: meta.pacing,
    files: { mp4: files.mp4, webm: files.webm, poster: files.poster },
  };
  fs.writeFileSync(path.join(framesDir, "stats.json"), JSON.stringify(stats, null, 2) + "\n");
  console.log(`${id}: ${shots.length} frames + contact-sheet.png + stats.json -> ${framesDir}`);
}

async function record(browser, id, flow, opts) {
  const port = portFor(id, opts.portBase);
  const pacing = { ...PACING, ...(flow.pacing || {}) };
  const rawDir = fs.mkdtempSync(path.join(os.tmpdir(), `rec-${id}-`));
  let server;
  try {
    let url = typeof flow.url === "function" ? flow.url({ port }) : flow.url;
    if (flow.server) {
      const spec = flow.server({ port });
      server = await startServer(id, spec);
      url = url || spec.url;
    }
    if (!url) throw new Error(`${id}: flow has no url`);

    let storageState;
    if (flow.prepare) {
      const ctx = await browser.newContext({ viewport: VIEWPORT });
      await flow.prepare(await ctx.newPage(), { url, port });
      storageState = await ctx.storageState();
      await ctx.close();
    }

    const ctx = await browser.newContext({
      viewport: VIEWPORT,
      screen: VIEWPORT, // so an element's requestFullscreen() fills the recorded frame
      deviceScaleFactor: 1,
      colorScheme: flow.colorScheme || "light",
      locale: flow.locale || "en-US",
      timezoneId: "Europe/Lisbon",
      storageState,
      recordVideo: { dir: rawDir, size: VIEWPORT },
    });
    await ctx.addInitScript(CURSOR_SCRIPT);
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const start = (Date.now() - t0) / 1000;
    const h = makeHelpers(page, pacing, { url, port, id });
    try {
      // The hero: let intro animations finish, then hold it still and readable.
      await h.waitForStill();
      await h.dwell(pacing.heroDwell);
      await flow.run(h);
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

    const dir = path.join(opts.outDir, id);
    fs.mkdirSync(dir, { recursive: true });
    const duration = end - start;
    const files = encode(raw, start, duration, dir, flow.posterAt ?? 1);
    if (opts.keepRaw) fs.copyFileSync(raw, path.join(dir, "raw.webm"));
    fs.rmSync(rawDir, { recursive: true, force: true });

    const kb = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;
    console.log(`${id}: ${duration.toFixed(1)} s  mp4 ${kb(files.mp4)}  webm ${kb(files.webm)}  poster ${kb(files.poster)}  -> ${dir}`);
    if (duration < 20 || duration > 40) console.warn(`  ! ${id} runs ${duration.toFixed(1)} s, outside 20–40 s`);
    if (opts.framesDir) {
      const fd = opts.multi ? path.join(opts.framesDir, id) : opts.framesDir;
      exportFrames(id, files, fd, { url, pacing });
    }
  } finally {
    server?.stop();
  }
}

function parseArgs(argv) {
  const valued = new Set(["--frames", "--out", "--port-base"]);
  const flags = new Set();
  const values = {};
  const ids = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const [k, inline] = a.split("=", 2);
    if (valued.has(k)) {
      const v = inline ?? argv[++i];
      if (!v || v.startsWith("--")) throw new Error(`${k} needs a value`);
      values[k] = v;
    } else if (a.startsWith("--")) flags.add(a);
    else ids.push(a);
  }
  return { flags, values, ids };
}

async function main() {
  const { flags, values, ids } = parseArgs(process.argv.slice(2));
  const portBase = values["--port-base"] ? Number(values["--port-base"]) : 4100;
  const known = flowIds();
  if (flags.has("--list")) {
    for (const id of [...new Set([...PORT_ORDER, ...known])]) {
      console.log(`${id.padEnd(16)} port ${portFor(id, portBase)}  ${known.includes(id) ? "flow" : "(no flow yet)"}`);
    }
    return;
  }
  const unknown = ids.filter((id) => !known.includes(id));
  if (unknown.length) {
    console.error(`No flow for: ${unknown.join(", ")}. Known: ${known.join(", ")} (scripts/video-flows/<id>.mjs)`);
    process.exit(1);
  }
  const todo = ids.length ? ids : known;
  const opts = {
    keepRaw: flags.has("--keep-raw"),
    outDir: values["--out"] ? path.resolve(values["--out"]) : DEFAULT_OUT_DIR,
    framesDir: values["--frames"] ? path.resolve(values["--frames"]) : null,
    multi: todo.length > 1,
    portBase,
  };
  if (flags.has("--reframe")) {
    if (!opts.framesDir) throw new Error("--reframe needs --frames <dir>");
    for (const id of todo) {
      const dir = path.join(opts.outDir, id);
      const files = { mp4: path.join(dir, "demo.mp4"), webm: path.join(dir, "demo.webm"), poster: path.join(dir, "poster.jpg") };
      const flow = await loadFlow(id);
      const url = typeof flow.url === "function" ? flow.url({ port: portFor(id, portBase) }) : flow.url;
      exportFrames(id, files, opts.multi ? path.join(opts.framesDir, id) : opts.framesDir, { url, pacing: { ...PACING, ...(flow.pacing || {}) } });
    }
    return;
  }
  const browser = await chromium.launch({
    headless: !flags.has("--headed"),
    args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", `--window-size=${VIEWPORT.width},${VIEWPORT.height}`],
  });
  try {
    for (const id of todo) await record(browser, id, await loadFlow(id), opts);
  } finally {
    await browser.close();
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
