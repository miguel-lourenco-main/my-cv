#!/usr/bin/env node
/**
 * Record and compose the project walkthrough videos shown in the project dialog
 * and the Featured viewer (issue #19).
 *
 * The point of a video is to SHOW the app's features so the viewer does not have
 * to explore it. So each project is recorded as separate clips — one short
 * marketing clip (the landing page as a few quick "slides", <= 20% of runtime)
 * and one clip per feature — and the compositor joins them in priority order,
 * dropping the lowest-priority features until the total fits the target length.
 *
 * Usage
 *   pnpm record-videos list                                   # ids, ports, targets, segments
 *   pnpm record-videos record <id>                            # every clip of <id>
 *   pnpm record-videos record <id> marketing editor kanban    # only these clips (re-record)
 *   pnpm record-videos compose <id>                           # target = flow.target (default 45 s)
 *   pnpm record-videos compose <id> --target 60 --tolerance 0.1 --xfade 0.15
 *   pnpm record-videos compose <id> --frames <dir>            # + review frames, contact sheet, stats
 *   pnpm record-videos frames <id> --frames <dir>             # frames of the existing demo.mp4 only
 *
 *   Common options
 *     --out <dir>        base dir instead of public/projects_videos (clips and demo
 *                        go to <dir>/<id>/clips/ and <dir>/<id>/)
 *     --headed           record in a visible browser window
 *     --keep-raw         keep each raw Playwright .webm next to its clip
 *     --port-base <n>    base for locally served apps (default 4100)
 *
 * Needs: ffmpeg + ffprobe on PATH (libx264, libvpx-vp9, drawtext, xfade) and a
 * Playwright Chromium in the local cache (`pnpm exec playwright-core install chromium`).
 *
 * Flows: scripts/video-flows/<id>.mjs (files starting with "_" are shared code)
 *   export default {
 *     url,             string or ({ port }) => string. Where every segment starts.
 *     target?,         seconds; default video length for `compose` (30..75, default 45)
 *     server?,         ({ port }) => { command, args, cwd, env, url, readyTimeoutMs }
 *                      for an app that runs locally; started once per `record`.
 *     setup?,          async (page, { url, port }) in an UNRECORDED context (demo
 *                      login, seeding). Its cookies + localStorage are handed to
 *                      every recorded segment, so no login screen is ever filmed.
 *     beforeEach?,     async (h, segment) on the recorded page before every segment
 *                      (style tweaks etc.). Off camera: trimmed away.
 *     marketing: {     the landing page, <= 20% of runtime. Optional for apps with
 *       url?, before?, run(h)        no landing (cash-register, oflat).
 *     },
 *     features: [{     each its own clip, composed in priority order
 *       key,           kebab-case, the clip's filename (clips/<key>.mp4)
 *       title,         short human label (compose.json, contact sheet)
 *       priority,      1 = most important. Lowest priority (highest number) is dropped first.
 *       url?,          string or ({ base, port }) => string. Defaults to the flow url.
 *       before?(h),    gets the page to the feature's opening state. Runs on the
 *                      recorded page but is TRIMMED (off camera): use h.jump(), direct
 *                      DOM setup, off-camera clicks, waits for spinners.
 *       run(h),        the on-camera part.
 *     }],
 *     posterFrom?,     { segment: "marketing" | <feature key>, at: seconds (negative = from its end) }
 *     pacing?, colorScheme?, locale?   overrides ("light", "en-US" by default)
 *   }
 *
 *   `h` is the helper set from scripts/video-flows/_lib/helpers.mjs (fast pacing:
 *   hero ~1.5 s, beats ~1 s, fast cursor/typing/glides; h.slides(sections) for
 *   the marketing beats). Each clip starts when the segment's run() starts; the
 *   page load, settle and before() are cut automatically. The marketing clip
 *   opens on a heroDwell hold, each feature clip on a short featureLead hold.
 *
 * Outputs, per id, in public/projects_videos/<id>/ (or --out <dir>/<id>/)
 *   clips/<key>.mp4    one per segment (git-ignored, stripped from the build)
 *   clips/clips.json   per clip: kind, title, priority, duration, recordedAt
 *   demo.mp4           H.264 yuv420p +faststart, no audio, 1280x800, <= 3 MB
 *   demo.webm          VP9, no audio
 *   poster.jpg         from posterFrom
 *   compose.json       target, tolerance, included/dropped features, durations, total
 *
 * --frames <dir> (compose / frames): 2 fps PNGs, 480 px wide, named by timestamp
 *   (t0012.5s.png), contact-sheet.png (time + segment labels) and stats.json
 *   (duration, sizes, resolution + compose.json with segment start/end times).
 *
 * Ports: an app run locally gets portBase + index in PORT_ORDER (oflat 4100 ...
 * job-ai-hub 4109). Parallel use: one process per id is safe in one checkout
 * (own browser, temp dir, output folder, port). Demo data only, no login on camera.
 */
import { chromium } from "playwright-core";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CURSOR_SCRIPT, PACING, VIEWPORT, makeHelpers } from "./video-flows/_lib/helpers.mjs";

export { PACING, makeHelpers };

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FLOWS_DIR = path.join(ROOT, "scripts", "video-flows");
const DEFAULT_OUT_DIR = path.join(ROOT, "public", "projects_videos");
const MAX_MP4_BYTES = 3 * 1024 * 1024;
const FPS = 25;
const DEFAULT_TARGET = 45;
const DEFAULT_TOLERANCE = 0.1;
const MAX_MARKETING_SHARE = 0.2;

export const PORT_ORDER = [
  "oflat", "edgen-chat", "edgen-code", "edgen-translate", "sonora",
  "agentic-hub", "o-guardanapo", "ui-components", "cash-register", "job-ai-hub",
];

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
  const problems = [];
  if (!flow) problems.push("no default export");
  else {
    if (flow.marketing && typeof flow.marketing.run !== "function") problems.push("marketing.run must be a function");
    if (!Array.isArray(flow.features)) problems.push("features must be an array");
    const seen = new Set(["marketing"]);
    for (const f of flow.features || []) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(f.key || "")) problems.push(`bad feature key ${JSON.stringify(f.key)}`);
      if (seen.has(f.key)) problems.push(`duplicate key ${f.key}`);
      seen.add(f.key);
      if (typeof f.run !== "function") problems.push(`${f.key}: run must be a function`);
      if (!Number.isFinite(f.priority)) problems.push(`${f.key}: priority must be a number`);
    }
  }
  if (problems.length) throw new Error(`${id}.mjs: ${problems.join("; ")}`);
  return flow;
}

/** Segments in declaration order: marketing first (if any), then features. */
function segmentsOf(flow) {
  const segs = [];
  if (flow.marketing) segs.push({ kind: "marketing", key: "marketing", title: flow.marketing.title || "Landing page", priority: 0, ...flow.marketing });
  (flow.features || []).forEach((f, i) => segs.push({ kind: "feature", order: i, title: f.key, ...f }));
  return segs;
}

export function portFor(id, portBase = 4100) {
  const i = PORT_ORDER.indexOf(id);
  if (i >= 0) return portBase + i;
  return portBase + 20 + flowIds().indexOf(id);
}

const resolveUrl = (u, ctx) => (typeof u === "function" ? u(ctx) : u);

// ---------------------------------------------------------------------------
// Local app servers (flows with `server`)
// ---------------------------------------------------------------------------

async function startServer(id, spec) {
  const { command, args = [], cwd, env = {}, url, readyTimeoutMs = 180000 } = spec;
  console.log(`${id}: starting ${command} ${args.join(" ")}${cwd ? ` in ${cwd}` : ""}`);
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
// ffmpeg
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

const SCALE = `scale=${VIEWPORT.width}:${VIEWPORT.height}:flags=lanczos,setsar=1,fps=${FPS}`;
const r2 = (x) => Math.round(x * 100) / 100;

/** Raw Playwright webm -> trimmed, near-lossless constant-fps clip. */
function encodeClip(raw, start, duration, file) {
  ffmpeg(["-ss", start.toFixed(3), "-i", raw, "-t", duration.toFixed(3), "-vf", SCALE, "-an",
    "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-pix_fmt", "yuv420p", file]);
}

// ---------------------------------------------------------------------------
// record
// ---------------------------------------------------------------------------

const clipsDirFor = (outDir, id) => path.join(outDir, id, "clips");

function readClipsJson(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "clips.json"), "utf8"));
  } catch {
    return { clips: {} };
  }
}

async function recordSegment(browser, id, flow, seg, env) {
  const { url: baseUrl, port, storageState, pacing, rawDir, clipsDir, keepRaw } = env;
  const url = seg.url ? resolveUrl(seg.url, { base: baseUrl, port }) : baseUrl;
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    screen: VIEWPORT, // so requestFullscreen() fills the recorded frame
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
  const h = makeHelpers(page, pacing, { url, base: baseUrl, port, id, segment: seg.key });
  let start;
  try {
    await page.goto(url, { waitUntil: seg.waitUntil || flow.waitUntil || "networkidle", timeout: 60000 })
      .catch(async (e) => {
        // networkidle can time out on pages that stream; the DOM is usually there.
        if (!/Timeout/i.test(String(e))) throw e;
      });
    await h.waitForStill();
    // Park the cursor off-frame so it does not appear mid-screen at the cut.
    await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2).catch(() => {});
    if (flow.beforeEach) await flow.beforeEach(h, seg);
    if (seg.before) await seg.before(h);
    start = (Date.now() - t0) / 1000;
    await h.dwell(seg.kind === "marketing" ? pacing.heroDwell : pacing.featureLead);
    await seg.run(h);
  } catch (err) {
    const shot = path.join(clipsDir, `${seg.key}.failure.png`);
    await page.screenshot({ path: shot }).catch(() => {});
    await ctx.close().catch(() => {});
    err.message = `${id}/${seg.key}: ${err.message} (at ${page.url()}, screenshot ${shot})`;
    throw err;
  }
  const end = (Date.now() - t0) / 1000;
  const video = page.video();
  await ctx.close();
  const raw = await video.path();
  const file = path.join(clipsDir, `${seg.key}.mp4`);
  encodeClip(raw, start, end - start, file);
  if (keepRaw) fs.copyFileSync(raw, path.join(clipsDir, `${seg.key}.raw.webm`));
  fs.rmSync(raw, { force: true });
  fs.rmSync(path.join(clipsDir, `${seg.key}.failure.png`), { force: true });
  const duration = r2(probe(file).duration);
  console.log(`${id}/${seg.key}: ${duration.toFixed(2)} s (lead-in trimmed ${start.toFixed(1)} s) -> ${path.relative(ROOT, file)}`);
  return { file: path.basename(file), duration, trimmedLeadIn: r2(start), url, recordedAt: new Date().toISOString() };
}

async function recordCmd(id, keys, opts) {
  const flow = await loadFlow(id);
  const segs = segmentsOf(flow);
  const unknown = keys.filter((k) => !segs.some((s) => s.key === k));
  if (unknown.length) throw new Error(`${id}: no segment ${unknown.join(", ")}. Known: ${segs.map((s) => s.key).join(", ")}`);
  const todo = keys.length ? segs.filter((s) => keys.includes(s.key)) : segs;
  const port = portFor(id, opts.portBase);
  const pacing = { ...PACING, ...(flow.pacing || {}) };
  const clipsDir = clipsDirFor(opts.outDir, id);
  fs.mkdirSync(clipsDir, { recursive: true });
  const rawDir = fs.mkdtempSync(path.join(os.tmpdir(), `rec-${id}-`));

  let server;
  const browser = await chromium.launch({
    headless: !opts.headed,
    args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", `--window-size=${VIEWPORT.width},${VIEWPORT.height}`],
  });
  const failures = [];
  try {
    let url = resolveUrl(flow.url, { port });
    if (flow.server) {
      const spec = flow.server({ port });
      server = await startServer(id, spec);
      url = url || spec.url;
    }
    if (!url) throw new Error(`${id}: flow has no url`);

    let storageState;
    const setup = flow.setup || flow.prepare;
    if (setup) {
      const ctx = await browser.newContext({ viewport: VIEWPORT, locale: flow.locale || "en-US", colorScheme: flow.colorScheme || "light" });
      await setup(await ctx.newPage(), { url, port });
      storageState = await ctx.storageState();
      await ctx.close();
    }

    const env = { url, port, storageState, pacing, rawDir, clipsDir, keepRaw: opts.keepRaw };
    for (const seg of todo) {
      try {
        const res = await recordSegment(browser, id, flow, seg, env);
        // Re-read before writing so a parallel `record <id> <other-key>` is not clobbered.
        const json = readClipsJson(clipsDir);
        json.id = id;
        json.viewport = VIEWPORT;
        json.fps = FPS;
        json.updatedAt = new Date().toISOString();
        json.clips[seg.key] = { kind: seg.kind, title: seg.title, priority: seg.priority, ...res };
        fs.writeFileSync(path.join(clipsDir, "clips.json"), JSON.stringify(json, null, 2) + "\n");
      } catch (err) {
        console.error(String(err.stack || err));
        failures.push(seg.key);
      }
    }
  } finally {
    await browser.close().catch(() => {});
    server?.stop();
    fs.rmSync(rawDir, { recursive: true, force: true });
  }
  if (failures.length) throw new Error(`${id}: failed segments: ${failures.join(", ")}`);
}

// ---------------------------------------------------------------------------
// compose
// ---------------------------------------------------------------------------

/**
 * Pick the segments: marketing (always, if recorded) + features in priority
 * order, dropping the lowest priority until total <= hi. When dropping the
 * lowest would fall below lo, drop instead the lowest-priority feature whose
 * removal lands inside [lo, hi], if there is one.
 */
export function planComposition(segs, { target, tolerance, xfade }) {
  const lo = target * (1 - tolerance);
  const hi = target * (1 + tolerance);
  const total = (list) => list.reduce((s, x) => s + x.duration, 0) - Math.max(0, list.length - 1) * xfade;
  const marketing = segs.filter((s) => s.kind === "marketing");
  let features = segs.filter((s) => s.kind === "feature")
    .sort((a, b) => a.priority - b.priority || a.order - b.order);
  const dropped = [];
  while (features.length && total([...marketing, ...features]) > hi) {
    const byLowest = [...features].reverse(); // lowest priority first
    let victim = byLowest[0];
    const t0 = total([...marketing, ...features]);
    if (t0 - victim.duration + xfade < lo) {
      const fit = byLowest.find((f) => {
        const t = t0 - f.duration + xfade;
        return t >= lo && t <= hi;
      });
      if (fit) victim = fit;
    }
    features = features.filter((f) => f !== victim);
    dropped.push({ ...victim, reason: `over ${hi.toFixed(1)} s` });
  }
  const included = [...marketing, ...features];
  const t = total(included);
  const status = t > hi ? "over" : t < lo ? "under" : "ok";
  return { included, dropped, total: t, lo, hi, status };
}

function timeline(included, xfade) {
  let at = 0;
  return included.map((s, i) => {
    const start = i === 0 ? 0 : at - xfade;
    const end = start + s.duration;
    at = end;
    return { ...s, start: r2(start), end: r2(end) };
  });
}

function concatClips(files, durations, xfade, outFile) {
  const inputs = files.flatMap((f) => ["-i", f]);
  let graph;
  if (files.length === 1) graph = `[0:v]${SCALE},format=yuv420p[v]`;
  else if (xfade > 0) {
    const parts = files.map((_, i) => `[${i}:v]${SCALE},format=yuv420p,settb=AVTB[s${i}]`);
    let prev = "s0";
    let offset = 0;
    for (let i = 1; i < files.length; i++) {
      offset += durations[i - 1] - xfade;
      const out = i === files.length - 1 ? "v" : `x${i}`;
      parts.push(`[${prev}][s${i}]xfade=transition=fade:duration=${xfade}:offset=${offset.toFixed(3)}[${out}]`);
      prev = out;
    }
    graph = parts.join(";");
  } else {
    const parts = files.map((_, i) => `[${i}:v]${SCALE},format=yuv420p[s${i}]`);
    graph = `${parts.join(";")};${files.map((_, i) => `[s${i}]`).join("")}concat=n=${files.length}:v=1:a=0[v]`;
  }
  ffmpeg([...inputs, "-filter_complex", graph, "-map", "[v]", "-an",
    "-c:v", "libx264", "-preset", "fast", "-crf", "12", "-pix_fmt", "yuv420p", outFile]);
}

function encodeFinal(master, dir, posterAt) {
  const mp4 = path.join(dir, "demo.mp4");
  const webm = path.join(dir, "demo.webm");
  const poster = path.join(dir, "poster.jpg");
  const base = ["-i", master, "-an", "-vf", `scale=${VIEWPORT.width}:${VIEWPORT.height}:flags=lanczos,setsar=1`];
  let crf = 23;
  for (; ; crf += 2) {
    ffmpeg([...base, "-c:v", "libx264", "-preset", "slow", "-crf", String(crf),
      "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
    if (fs.statSync(mp4).size <= MAX_MP4_BYTES || crf >= 39) break;
  }
  let wcrf = 38;
  for (; ; wcrf += 3) {
    ffmpeg([...base, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(wcrf),
      "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", webm]);
    if (fs.statSync(webm).size < fs.statSync(mp4).size || wcrf >= 50) break;
  }
  ffmpeg(["-ss", posterAt.toFixed(2), "-i", mp4, "-frames:v", "1", "-q:v", "3", poster]);
  return { mp4, webm, poster, crf, webmCrf: wcrf };
}

async function composeCmd(id, opts) {
  const flow = await loadFlow(id);
  const clipsDir = clipsDirFor(opts.outDir, id);
  const json = readClipsJson(clipsDir);
  const target = opts.target ?? flow.target ?? DEFAULT_TARGET;
  const tolerance = opts.tolerance ?? DEFAULT_TOLERANCE;
  const xfade = Math.min(0.2, Math.max(0, opts.xfade ?? 0));
  if (!(target > 0)) throw new Error("--target must be > 0");

  const missing = [];
  const segs = [];
  for (const s of segmentsOf(flow)) {
    const c = json.clips[s.key];
    const file = path.join(clipsDir, `${s.key}.mp4`);
    if (!c || !fs.existsSync(file)) {
      missing.push(s.key);
      continue;
    }
    segs.push({ key: s.key, kind: s.kind, title: s.title, priority: s.priority, order: s.order ?? -1, duration: probe(file).duration, file });
  }
  if (!segs.length) throw new Error(`${id}: no clips in ${clipsDir}; run \`record ${id}\` first`);
  if (missing.length) console.warn(`${id}: no clip for ${missing.join(", ")} (skipped)`);

  const plan = planComposition(segs, { target, tolerance, xfade });
  const tl = timeline(plan.included, xfade);
  const dir = path.join(opts.outDir, id);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `compose-${id}-`));
  try {
    const master = path.join(tmp, "master.mp4");
    concatClips(tl.map((s) => s.file), tl.map((s) => s.duration), xfade, master);
    const realTotal = probe(master).duration;

    const pf = flow.posterFrom || { segment: tl[0].key, at: 1 };
    const ps = tl.find((s) => s.key === pf.segment) || tl[0];
    const posterAt = Math.max(0, Math.min(realTotal - 0.2, pf.at < 0 ? ps.end + pf.at : ps.start + (pf.at ?? 1)));
    const files = encodeFinal(master, dir, posterAt);

    const mk = tl.find((s) => s.kind === "marketing");
    const marketingShare = mk ? mk.duration / realTotal : 0;
    const bytes = (f) => fs.statSync(f).size;
    const compose = {
      id,
      composedAt: new Date().toISOString(),
      target,
      tolerance,
      bounds: [r2(plan.lo), r2(plan.hi)],
      xfade,
      total: r2(realTotal),
      status: plan.status,
      marketingShare: r2(marketingShare),
      included: tl.map(({ key, kind, title, priority, duration, start, end }) =>
        ({ key, kind, title, priority, duration: r2(duration), start, end })),
      dropped: plan.dropped.map(({ key, title, priority, duration, reason }) => ({ key, title, priority, duration: r2(duration), reason })),
      missing,
      clips: Object.fromEntries(segs.map((s) => [s.key, r2(s.duration)])),
      poster: { segment: ps.key, at: r2(posterAt) },
      files: { mp4: bytes(files.mp4), webm: bytes(files.webm), poster: bytes(files.poster), mp4Crf: files.crf, webmCrf: files.webmCrf },
    };
    fs.writeFileSync(path.join(dir, "compose.json"), JSON.stringify(compose, null, 2) + "\n");

    const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
    console.log(`${id}: ${realTotal.toFixed(1)} s (target ${target} s +/-${Math.round(tolerance * 100)}%: ${plan.status})` +
      `  mp4 ${kb(compose.files.mp4)}  webm ${kb(compose.files.webm)} -> ${path.relative(ROOT, dir) || dir}`);
    console.log(`  included: ${tl.map((s) => `${s.key} ${s.duration.toFixed(1)}s`).join(", ")}`);
    if (plan.dropped.length) console.log(`  dropped:  ${plan.dropped.map((s) => `${s.key} (p${s.priority}, ${s.duration.toFixed(1)}s)`).join(", ")}`);
    if (plan.status === "under") console.warn(`  ! ${id}: ${realTotal.toFixed(1)} s is UNDER ${plan.lo.toFixed(1)} s: record more features or lower --target`);
    if (plan.status === "over") console.warn(`  ! ${id}: ${realTotal.toFixed(1)} s is still OVER ${plan.hi.toFixed(1)} s (marketing alone too long?)`);
    if (marketingShare > MAX_MARKETING_SHARE) console.warn(`  ! ${id}: marketing is ${(marketingShare * 100).toFixed(0)}% of the video (max ${MAX_MARKETING_SHARE * 100}%)`);
    if (compose.files.mp4 > MAX_MP4_BYTES) console.warn(`  ! ${id}: demo.mp4 is over 3 MB even at crf ${files.crf}`);

    if (opts.framesDir) exportFrames(id, dir, opts.framesDir, compose);
    return compose;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// frames
// ---------------------------------------------------------------------------

const FRAME_FPS = 2;
const FRAME_W = 480;

/** Escape text for an ffmpeg drawtext text='...' inside a filtergraph. */
const dtEscape = (s) => String(s).replace(/[^A-Za-z0-9 _.+-]/g, "").slice(0, 40);

function exportFrames(id, dir, framesDir, compose) {
  const mp4 = path.join(dir, "demo.mp4");
  fs.mkdirSync(framesDir, { recursive: true });
  for (const f of fs.readdirSync(framesDir)) {
    if (/^t\d+(\.\d)?s\.png$/.test(f) || f === "contact-sheet.png" || f === "stats.json") fs.rmSync(path.join(framesDir, f));
  }
  const info = probe(mp4);
  const tmp = fs.mkdtempSync(path.join(framesDir, ".tmp-frames-"));
  ffmpeg(["-i", mp4, "-vf", `fps=${FRAME_FPS}:round=down,scale=${FRAME_W}:-2:flags=lanczos`, "-start_number", "0",
    path.join(tmp, "%05d.png")]);
  const shots = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).map((f) => Number(f.slice(0, -4))).sort((a, b) => a - b);
  const names = [];
  for (const n of shots) {
    const t = n / FRAME_FPS;
    const name = `t${String(Math.floor(t)).padStart(4, "0")}.${Math.round((t % 1) * 10)}s.png`;
    fs.renameSync(path.join(tmp, `${String(n).padStart(5, "0")}.png`), path.join(framesDir, name));
    names.push(name);
  }

  // Contact sheet: from a numbered copy of the sequence so pts = frame time.
  const seq = path.join(tmp, "seq");
  fs.mkdirSync(seq);
  names.forEach((f, i) => fs.linkSync(path.join(framesDir, f), path.join(seq, `${String(i).padStart(5, "0")}.png`)));
  const cols = 6;
  const rows = Math.max(1, Math.ceil(names.length / cols));
  const segLabels = (compose?.included || []).map((s) =>
    `drawtext=text='${dtEscape(s.key)}':x=w-tw-6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=0x1d4ed8@0.8:boxborderw=4` +
    `:enable='between(t\\,${s.start}\\,${Math.max(s.start, s.end - 0.01)})'`);
  const timeLabel = "drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=4";
  const sheet = path.join(framesDir, "contact-sheet.png");
  const run = (labels) => ffmpeg(["-framerate", String(FRAME_FPS), "-start_number", "0", "-i", path.join(seq, "%05d.png"),
    "-vf", ["scale=320:-2:flags=lanczos", ...labels, `tile=${cols}x${rows}:padding=6:margin=6:color=0x202020`].join(","),
    "-frames:v", "1", sheet]);
  try {
    run([timeLabel, ...segLabels]);
  } catch {
    run([]); // ffmpeg without fontconfig/drawtext: unlabelled sheet
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  const bytes = (f) => fs.statSync(path.join(dir, f)).size;
  const stats = {
    id,
    statsAt: new Date().toISOString(),
    duration: r2(info.duration),
    resolution: `${info.width}x${info.height}`,
    width: info.width,
    height: info.height,
    fps: info.fps,
    codec: info.codec,
    mp4Bytes: bytes("demo.mp4"),
    webmBytes: bytes("demo.webm"),
    posterBytes: bytes("poster.jpg"),
    mp4LimitBytes: MAX_MP4_BYTES,
    frames: names.length,
    frameFps: FRAME_FPS,
    frameWidth: FRAME_W,
    files: { mp4: path.join(dir, "demo.mp4"), webm: path.join(dir, "demo.webm"), poster: path.join(dir, "poster.jpg") },
    compose,
  };
  fs.writeFileSync(path.join(framesDir, "stats.json"), JSON.stringify(stats, null, 2) + "\n");
  console.log(`${id}: ${names.length} frames + contact-sheet.png + stats.json -> ${framesDir}`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const valued = new Set(["--frames", "--out", "--port-base", "--target", "--tolerance", "--xfade"]);
  const flags = new Set();
  const values = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const [k, inline] = a.split("=", 2);
    if (valued.has(k)) {
      const v = inline ?? argv[++i];
      if (v === undefined || v.startsWith("--")) throw new Error(`${k} needs a value`);
      values[k] = v;
    } else if (a.startsWith("--")) flags.add(a);
    else rest.push(a);
  }
  return { flags, values, rest };
}

const USAGE = `usage:
  pnpm record-videos list
  pnpm record-videos record <id> [segment-key...] [--headed] [--keep-raw] [--out <dir>] [--port-base <n>]
  pnpm record-videos compose <id> [--target <s>] [--tolerance 0.1] [--xfade <=0.2] [--frames <dir>] [--out <dir>]
  pnpm record-videos frames <id> --frames <dir> [--out <dir>]`;

async function main() {
  const { flags, values, rest } = parseArgs(process.argv.slice(2));
  const portBase = values["--port-base"] ? Number(values["--port-base"]) : 4100;
  const outDir = values["--out"] ? path.resolve(values["--out"]) : DEFAULT_OUT_DIR;
  const framesDir = values["--frames"] ? path.resolve(values["--frames"]) : null;
  const known = flowIds();
  const [cmd, id, ...keys] = rest;

  if (cmd === "list" || flags.has("--list")) {
    for (const fid of [...new Set([...PORT_ORDER, ...known])]) {
      if (!known.includes(fid)) {
        console.log(`${fid.padEnd(16)} port ${portFor(fid, portBase)}  (no flow yet)`);
        continue;
      }
      try {
        const flow = await loadFlow(fid);
        const segs = segmentsOf(flow).map((s) => (s.kind === "marketing" ? "marketing" : `${s.key}(p${s.priority})`));
        console.log(`${fid.padEnd(16)} port ${portFor(fid, portBase)}  target ${flow.target ?? DEFAULT_TARGET}s  ${segs.join(" ")}`);
      } catch (e) {
        console.log(`${fid.padEnd(16)} port ${portFor(fid, portBase)}  BROKEN: ${e.message}`);
      }
    }
    return;
  }
  if (!["record", "compose", "frames"].includes(cmd) || !id) {
    console.error(USAGE);
    process.exit(2);
  }
  if (!known.includes(id)) {
    console.error(`No flow for ${id}. Known: ${known.join(", ")} (scripts/video-flows/<id>.mjs)`);
    process.exit(1);
  }
  if (cmd === "record") {
    await recordCmd(id, keys, { portBase, outDir, headed: flags.has("--headed"), keepRaw: flags.has("--keep-raw") });
  } else if (cmd === "compose") {
    await composeCmd(id, {
      outDir, framesDir,
      target: values["--target"] ? Number(values["--target"]) : undefined,
      tolerance: values["--tolerance"] ? Number(values["--tolerance"]) : undefined,
      xfade: values["--xfade"] ? Number(values["--xfade"]) : undefined,
    });
  } else {
    if (!framesDir) throw new Error("frames needs --frames <dir>");
    let compose = null;
    try { compose = JSON.parse(fs.readFileSync(path.join(outDir, id, "compose.json"), "utf8")); } catch {}
    exportFrames(id, path.join(outDir, id), framesDir, compose);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  main().catch((err) => {
    console.error(err?.stack || err);
    process.exit(1);
  });
}
