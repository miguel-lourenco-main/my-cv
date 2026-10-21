// Sonora (live GitLab Pages static export). Pre-Recorded story 1 only: the
// AI-Live stories need an ElevenLabs key. Target 40 s (the plan's target).
// Marketing: a few quick slides + the sunlit-path click. Features, by priority:
// narrated player, in-player choice, chapter 3 after the choice, library,
// story page, Voice Studio.
//
// Demo data: the public static site has one fixed data set (the same 10 mock
// stories, the same "Continue listening" mock rail, no voices, no API key) and
// every clip starts from a fresh browser context, so all clips show the same
// state. The one story played is The Enchanted Forest (story 1) and the one
// choice made is the sunlit path, on the landing page, in the player and on the
// story map alike.

// Word timings, /samples/enchanted-forest-start.mp3: "destiny." 5.82-6.75 s.
// Pausing inside the last word of a sentence leaves the sentence fully lit.
const NARRATION_END = 6.3;
// Take: scrub to the end of chapter 1 about 3 s after Play.
const PLAYER_SCRUB_AT = 2.8;
// /samples/enchanted-forest-sun-path.mp3: "embrace" 2.25-2.76 s.
const SUNLIT_END = 2.6;

const SITE = "https://sonora-d09e63.gitlab.io";

// Off-camera settling shared by every clip: the recorder's trim lands a few
// hundred ms early, so each clip must already be on a fully rendered, still
// frame (images decoded, entrance animations done) before run() starts.
async function settled(h, extra = 500) {
  await h.page
    .waitForFunction(() => [...document.images].filter((i) => i.getBoundingClientRect().top < innerHeight).every((i) => i.complete), null, { timeout: 2500 })
    .catch(() => {});
  await h.waitForStill(1500);
  await h.wait(extra);
}

// Keep the document at scrollY 0 while narration plays: in v2 something on
// resume scrolled the page so the lit line went under the sticky header.
const lockScrollTop = (page) =>
  page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    window.addEventListener("scroll", () => { if (window.scrollY !== 0) window.scrollTo(0, 0); }, { passive: true });
  });

// Click Play by coordinates: the button pulses, so a locator click waits
// ~1 s for it to be "stable", which read as a paused player on camera.
async function clickPlay(h) {
  const b = await h.page.getByRole("button", { name: "Play" }).boundingBox();
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  const m = h.mouse;
  // Already on it (the take parks the cursor there during the load): no glide,
  // because every mouse step is slow while the freshly loaded player animates.
  if (Math.hypot(m.x - x, m.y - y) > 12) await h.moveTo(x, y, Math.hypot(m.x - x, m.y - y) < 60 ? 50 : 120);
  await h.page.mouse.down();
  await h.wait(50);
  await h.page.mouse.up();
}

const playReady = (page) =>
  page.waitForFunction(() => {
    const b = document.querySelector('button[aria-label="Play"]');
    return b && !b.disabled;
  });

const audioAt = (page, t) =>
  page.waitForFunction((t) => {
    const a = document.querySelector("audio");
    return a && a.currentTime >= t;
  }, t, { timeout: 30000, polling: 30 });

// Off camera: play story 1 muted at 16x until the chapter-2 question shows,
// then stop touching the audio (a further play() would restart the chapter).
async function fastForwardToChoice(h) {
  const { page } = h;
  await playReady(page);
  await page.getByRole("button", { name: "Play" }).click();
  await page.evaluate(() => {
    const t = setInterval(() => {
      if ([...document.querySelectorAll("button")].some((b) => /Choose the sunlit path/.test(b.textContent))) {
        clearInterval(t);
        document.querySelector("audio")?.pause();
        return;
      }
      const a = document.querySelector("audio");
      if (a) { a.muted = true; a.playbackRate = 16; if (a.paused) a.play().catch(() => {}); }
    }, 30);
  });
  await page.getByRole("button", { name: /Choose the sunlit path/ }).waitFor({ state: "visible", timeout: 30000 });
}

// ---------------------------------------------------------------------------
// Continuous take (v4): ONE shot, the app navigated on camera.
//
// The v3 clips are re-joined in the order the site itself leads a visitor
// through them, so every transition is one or two real clicks:
//   landing (hero, listen, the sunlit-path demo)
//   --glide down past Tonight's tale--> library (filter, search)
//   --click The Enchanted Forest--> story page (branching-paths map)
//   --"Start listening"--> player (narration, word by word, ~3 s)
//   --scrub to the end of chapter 1, then of chapter 2--> the choice
//   --pick the sunlit path--> |CUT| (the app's own ~4 s "Capturing choice..." /
//   "Making choice..." wait) --> chapter 3 narration (~1.5 s)
//   --header "Voices"--> Voice Studio + the New Voice dialog (final beat).
// One cut; the first take covers ~82-84% of the video. Recorded with
// --target 35 (all features in: the real length, under the plan's 40 s).
// Same data set throughout: one fresh session, story 1, the sunlit path chosen
// on the landing page and in the player alike.
// ---------------------------------------------------------------------------

// Scroll lock with an off switch: the player re-lays out on resume and on a
// choice, which in v2 scrolled the lit line under the sticky header.
const lockScroll = (page, y = 0) =>
  page.evaluate((y) => {
    document.documentElement.style.scrollBehavior = "auto";
    window.__lockY = y;
    window.scrollTo(0, y);
    if (!window.__lockInstalled) {
      window.__lockInstalled = true;
      window.addEventListener("scroll", () => {
        if (window.__lockY != null && window.scrollY !== window.__lockY) window.scrollTo(0, window.__lockY);
      }, { passive: true });
    }
  }, y);
const unlockScroll = (page) => page.evaluate(() => { window.__lockY = null; });

const audioSrcHas = (page, part, minT = 0) =>
  page.waitForFunction(({ part, minT }) => {
    const a = document.querySelector("audio");
    return a && a.src.includes(part) && !a.paused && a.currentTime >= minT;
  }, { part, minT }, { timeout: 15000, polling: 30 });

/** On camera: one click near the end of the playback bar (a scrub). */
async function scrubToEnd(h, at = 0.985) {
  const { page } = h;
  const track = page.getByLabel("Playback position");
  await page.waitForFunction(() => document.querySelector('[aria-label="Playback position"]')?.getAttribute("aria-disabled") === "false", null, { timeout: 10000 });
  const b = await track.boundingBox();
  await h.moveTo(b.x + b.width * at, b.y + b.height / 2, 240);
  await page.mouse.down();
  await h.wait(50);
  await page.mouse.up();
}

// Where the player's Play button sits (measured on the warm-up visit), so the
// cursor can already be on it while the player loads on camera.
let playAt = { x: 700, y: 690 };

const take = {
  target: 40,
  // The hero's busy main thread delays the first glide by ~0.8 s, so the hero
  // still reads for ~2 s on screen with a shorter scripted hold.
  pacing: { settleMax: 1200, heroDwell: 400 },
  posterFrom: { feature: "marketing", at: 1 },
  async before(h) {
    const { page } = h;
    // The narration tracks come from GitLab Pages, which ignores Range
    // requests and is sometimes slow: once a track took ~12 s to become
    // playable on camera. Fetch them once and serve them from memory (with
    // Range support), so Play is ready the moment the player shows.
    const tracks = new Map();
    for (const n of ["start", "path-split", "sun-path", "shadow-path"]) {
      const r = await fetch(`${SITE}/samples/enchanted-forest-${n}.mp3`);
      if (r.ok) tracks.set(`/samples/enchanted-forest-${n}.mp3`, Buffer.from(await r.arrayBuffer()));
    }
    await page.route(/\/samples\/enchanted-forest-[^/]+\.mp3(\?.*)?$/, (route) => {
      const req = route.request();
      const body = tracks.get(new URL(req.url()).pathname);
      if (!body) return route.continue();
      const headers = { "content-type": "audio/mpeg", "accept-ranges": "bytes", "cache-control": "max-age=600" };
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers().range || "");
      if (!m) return route.fulfill({ status: 200, body, headers });
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Math.min(Number(m[2]), body.length - 1) : body.length - 1;
      return route.fulfill({ status: 206, body: body.subarray(start, end + 1), headers: { ...headers, "content-range": `bytes ${start}-${end}/${body.length}` } });
    });
    // Warm the HTTP cache for every page and narration track the take uses,
    // then wipe the storage the player wrote, so the landing's "Continue
    // listening" rail shows the same mock state as v3.
    for (const p of ["/voices/", "/story/1/"]) await page.goto(`${SITE}${p}`, { waitUntil: "networkidle" });
    // The player shows "Checking audio availability..." and then "Generating
    // speech..." until a HEAD request per track answers. The tracks are held
    // in memory above, so answer those HEADs in the page itself, at once: the
    // player then renders straight into "Ready to listen".
    await page.addInitScript(() => {
      const known = /\/samples\/enchanted-forest-(start|path-split|sun-path|shadow-path)\.mp3(\?|$)/;
      const orig = window.fetch;
      window.fetch = function (input, init) {
        const url = typeof input === "string" ? input : input?.url || String(input);
        const method = String(init?.method || (typeof input === "object" && input?.method) || "GET").toUpperCase();
        if (method === "HEAD" && known.test(url)) return Promise.resolve(new Response(null, { status: 200, headers: { "content-type": "audio/mpeg" } }));
        return orig.apply(this, arguments);
      };
    });
    // Belt and braces: the player's first render still paints one frame with
    // those loading overlays before the instant HEAD answer lands. Hide just
    // the spinner overlays and the "Generating..." badge for the recording.
    await page.addInitScript(() => {
      const css = [
        "div.absolute.inset-0:has(> p > .animate-spin)",
        "div.absolute.rounded-full:has(> .lucide-sparkles)",
        "div.flex.items-center.justify-center:has(> div > div.animate-spin.rounded-full)",
      ].join(",") + "{visibility:hidden!important}";
      const add = () => { const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); };
      if (document.head) add(); else document.addEventListener("DOMContentLoaded", add);
    });
    await page.goto(`${SITE}/player/1/`, { waitUntil: "networkidle" });
    await playReady(page);
    {
      const b = await page.getByRole("button", { name: "Play" }).boundingBox();
      if (b) playAt = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }
    await page.evaluate(async () => {
      const src = document.querySelector("audio")?.src || "";
      const base = src.replace(/enchanted-forest-[^/]*\.mp3.*$/, "");
      if (!base) return;
      await Promise.all(["start", "path-split", "sun-path", "shadow-path"].map((n) => fetch(`${base}enchanted-forest-${n}.mp3`).then((r) => r.arrayBuffer()).catch(() => {})));
    });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    // The player polls currentTime every 16 ms and stops the track as soon as
    // it reads >= duration. Chrome can report that a few ms before the track
    // has really ended, and then the choice question (shown only once
    // audio.ended) never renders; it happens about half the time, after a
    // scrub nearly always. Report currentTime a hair under the duration until
    // the track has truly ended, so the player's own end-of-chapter logic runs
    // once, at the real end. Nothing else about playback changes.
    await page.addInitScript(() => {
      const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "currentTime");
      Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
        configurable: true,
        get() {
          const t = d.get.call(this);
          const D = this.duration;
          return !this.ended && Number.isFinite(D) && t >= D ? D - 0.001 : t;
        },
        set(v) { d.set.call(this, v); },
      });
    });
    await page.goto(`${SITE}/`, { waitUntil: "networkidle" });
  },
  cutsBefore: ["chapter-3"],
  route: [
    {
      key: "marketing",
      kind: "marketing",
      title: "Landing page",
      priority: 0,
      async before(h) {
        const { page } = h;
        await page.evaluate(async () => {
          const root = document.documentElement;
          root.style.scrollBehavior = "auto";
          const max = root.scrollHeight - innerHeight;
          for (let y = 0; y <= max; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
          await new Promise((r) => setTimeout(r, 400));
          scrollTo(0, 0);
        });
        const cta = await page.getByRole("button", { name: /Browse the library/i }).first().boundingBox().catch(() => null);
        await h.moveTo(cta ? cta.x + cta.width + 60 : 900, cta ? cta.y + cta.height / 2 : 700, 50);
        await settled(h, 700);
      },
      async run(h) {
        const { page } = h;
        await h.glide(page.locator("#listen"), { offset: 70, ms: 420 });
        await h.beat(950);
        // One evaluate for the target (the hero's busy main thread makes every
        // page call slow), then a glide and a raw click, as in v3.
        const y = await page.evaluate(() => {
          const b = [...document.querySelectorAll("button")].find((e) => /Choose the sunlit path/.test(e.textContent));
          return window.scrollY + b.getBoundingClientRect().top - 400;
        });
        await h.glide(y, { ms: 380 });
        const box = await page.getByRole("button", { name: "Choose the sunlit path" }).first().boundingBox();
        await h.moveTo(box.x + box.width / 2, box.y + box.height / 2, 220);
        await page.mouse.down();
        await page.mouse.up();
        await page.getByText(/sunlit path welcomes you/i).first().waitFor({ state: "visible" });
        await h.beat(850);
        // Tonight's tale is crossed on the way down to the library (next feature).
      },
    },
    {
      key: "library",
      title: "Library: genre filter, search, open a story",
      priority: 4,
      async transitionIn(h) {
        const { page } = h;
        const label = page.getByText(/^The Library$/i).first();
        // The v3 framing: label under the header, search, chips and the grid's top row.
        // From the landing's branch demo this glide crosses Tonight's tale.
        await h.glide(label, { offset: 90, ms: 650 });
      },
      async run(h) {
        const { page } = h;
        await h.beat(400);
        await h.click(page.getByRole("button", { name: "Adventure", exact: true }), { pause: 0, settle: false });
        await h.wait(700);
        await h.click(page.getByRole("button", { name: "All Stories", exact: true }), { pause: 0, settle: false });
        await h.wait(250);
        await h.type(page.getByPlaceholder("Search stories..."), "forest", 40);
        // Bring the one result's title into frame as the grid filters down.
        await h.glide((await page.evaluate(() => window.scrollY)) + 280, { ms: 320 });
        await h.wait(450);
      },
    },
    {
      key: "story-detail",
      title: "Story page with the branching-paths map",
      priority: 5,
      async transitionIn(h) {
        const { page } = h;
        const card = page.locator('#library a[href$="/story/1/"]').filter({ hasText: "Pre-Recorded" }).first();
        const box = await card.boundingBox();
        await h.moveTo(box.x + box.width / 2, Math.min(box.y + 120, 740), 250);
        await h.wait(120);
        await page.mouse.down();
        await h.wait(60);
        await page.mouse.up();
        await page.waitForURL(/\/story\/1\/?$/, { timeout: 10000, waitUntil: "commit" });
        await h.arrived(page.getByRole("link", { name: /Start listening/i }));
        await h.waitForStill(600);
      },
      async run(h) {
        const { page } = h;
        await h.beat(800);
        await h.glide(page.getByText(/Branching Paths/i).first(), { offset: 90, ms: 400 });
        await h.waitForStill(300);
        await h.hover(page.getByText(/Deep within the realm/).last(), 180);
        await h.wait(300);
        await h.hover(page.getByText(/The forest path divides/).last(), 180);
        await h.wait(300);
        await h.hover(page.getByText(/The sunlit path welcomes you/).first(), 180);
        await h.beat(450);
      },
    },
    {
      key: "player",
      title: "Narrated player with word-by-word highlighting",
      priority: 1,
      async transitionIn(h) {
        const { page } = h;
        const start = page.getByRole("link", { name: /Start listening/i }).first();
        await h.glide(0, { ms: 380 });
        // A raw click: a locator click waits on the button's own animation.
        const sb = await start.boundingBox();
        await h.moveTo(sb.x + sb.width / 2, sb.y + sb.height / 2, 260);
        await page.mouse.down();
        await h.wait(40);
        await page.mouse.up();
        // While the player loads, the cursor heads straight for where Play appears.
        await h.moveTo(playAt.x, playAt.y, 160);
        await h.arrived([/\/player\/1\/?$/, playReady]);
        await lockScroll(page, 0);
        // Play is clickable and the cursor already on it: click at once.
      },
      async run(h) {
        const { page } = h;
        await clickPlay(h);
        // Off the text, onto the cover.
        await h.moveTo(270, 420, 200);
        // ~"Forest, a place": the word-by-word highlight has read by now.
        await audioAt(page, PLAYER_SCRUB_AT);
      },
    },
    {
      key: "choices",
      title: "In-player branching choice",
      priority: 2,
      async transitionIn(h) {
        const { page } = h;
        // Scrub to the end of chapter 1: chapter 2 starts on its own...
        await scrubToEnd(h);
        await audioSrcHas(page, "path-split", 0.8);
        await h.wait(200);
        // ...and to its end: the question appears.
        await scrubToEnd(h, 0.95);
        const sunlit = page.getByRole("button", { name: /Choose the sunlit path/ });
        await sunlit.waitFor({ state: "visible", timeout: 10000 });
        // Let the player collapse and the page reflow before centring.
        await h.wait(150);
        await h.waitForStill(400);
        await unlockScroll(page);
        const mid = await page.evaluate(() => {
          const q = [...document.querySelectorAll("h1,h2,h3,h4,p,span")].find((e) => /What should our hero do next/i.test(e.textContent) && e.childElementCount === 0);
          const b = [...document.querySelectorAll("button")].find((e) => /Choose the sunlit path/.test(e.textContent));
          const top = (q || b).getBoundingClientRect().top;
          const bot = b.getBoundingClientRect().bottom;
          return window.scrollY + (top + bot) / 2 - innerHeight / 2;
        });
        await h.glide(Math.max(0, mid), { ms: 380 });
        await lockScroll(page, Math.max(0, Math.round(await page.evaluate(() => window.scrollY))));
      },
      async run(h) {
        const { page } = h;
        // Straight from the centring glide onto the cards.
        await h.hover(page.getByRole("button", { name: /Take the shadowy path/ }), 350);
        await h.wait(450);
        // One glide onto the sunlit card and a raw click on landing (a locator
        // click re-aims the mouse while the card's hover animation runs).
        const sb = await page.getByRole("button", { name: /Choose the sunlit path/ }).first().boundingBox();
        await h.moveTo(sb.x + sb.width / 2, sb.y + sb.height / 2, 260);
        await page.mouse.down();
        await h.wait(50);
        await page.mouse.up();
        // The pick registers (card lit, the other dimmed, "Capturing choice...").
        await h.wait(800);
      },
    },
    {
      key: "chapter-3",
      title: "The chosen path: chapter 3 narration",
      priority: 3,
      // OFF CAMERA (the cut): the app's own ~4 s choice wait and the load of
      // chapter 3, which auto-plays; rewind it and pause through the UI.
      async before(h) {
        const { page } = h;
        await page.getByText(/Chapter 3 of 5/).first().waitFor({ state: "visible", timeout: 15000 });
        const pause = page.getByRole("button", { name: "Pause" });
        await pause.waitFor({ state: "visible", timeout: 8000 });
        await page.evaluate(() => {
          const a = document.querySelector("audio");
          a.muted = false; a.playbackRate = 1; a.currentTime = 0;
        });
        await page.waitForTimeout(80);
        await pause.click();
        await page.getByRole("button", { name: "Play" }).waitFor({ state: "visible", timeout: 8000 });
        await lockScroll(page, 0);
        const b = await page.getByRole("button", { name: "Play" }).boundingBox();
        await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 50);
        await settled(h, 0);
        // Take 2 opens ON the Play click: the app takes ~0.5 s from the click to
        // playing (Play idle on camera), so the click lands just inside the cut
        // and take 2 opens as the Pause state and the narration begin.
        await page.mouse.down();
        await h.wait(50);
        await page.mouse.up();
        await page.getByRole("button", { name: "Pause" }).waitFor({ state: "visible", timeout: 8000 });
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      },
      async run(h) {
        const { page } = h;
        await h.moveTo(270, 420, 200);
        // ~1.5 s of narration, then on to Voice Studio (the click lands at ~1.5 s).
        await audioAt(page, 1.2);
      },
    },
    {
      key: "voices",
      title: "Voice Studio: bring your own narrator",
      priority: 6,
      // Final beat: from the chapter-3 narration, the header's own Voices link.
      async transitionIn(h) {
        const { page } = h;
        await unlockScroll(page);
        await h.navLink(/^Voices$/, {
          within: "header",
          arrive: [/\/voices\/?$/, page.getByRole("button", { name: /New Voice/i })],
          hold: 0,
          move: 240,
          settleMax: 400,
        });
      },
      async run(h) {
        const { page } = h;
        await h.beat(450);
        await h.click(page.getByRole("button", { name: /New Voice/i }), { pause: 0, move: 260, settle: false });
        await page.getByText(/Create Voices/i).first().waitFor({ state: "visible" });
        await h.hover(page.getByText(/Click to add|drag and drop/i).first(), 220);
        await h.wait(350);
        await h.hover(page.getByText(/Go to Recorder/i).first(), 200);
        await h.beat(700);
      },
    },
  ],
};

export default {
  take,
  url: `${SITE}/`,
  target: 40,
  pacing: { settleMax: 1200 },
  posterFrom: { segment: "marketing", at: 1 },
  marketing: {
    async before(h) {
      const { page } = h;
      // Visit the whole page off camera so scroll-reveals are in their final
      // state, then return to the hero.
      await page.evaluate(async () => {
        const root = document.documentElement;
        root.style.scrollBehavior = "auto";
        const max = root.scrollHeight - innerHeight;
        for (let y = 0; y <= max; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
        await new Promise((r) => setTimeout(r, 400));
        scrollTo(0, 0);
      });
      // Park the cursor beside the CTAs, off the headline.
      const cta = await page.getByRole("button", { name: /Browse the library/i }).first().boundingBox().catch(() => null);
      await h.moveTo(cta ? cta.x + cta.width + 60 : 900, cta ? cta.y + cta.height / 2 : 700, 50);
      await settled(h, 700);
    },
    async run(h) {
      const { page } = h;
      // The hero's floating covers keep the main thread busy: every page call
      // costs ~350 ms there, so each slide is ONE evaluate (a cut to the
      // section), then a short hold. Returns the target's viewport rect.
      const cutTo = (find, offset) =>
        page.evaluate(({ find, offset }) => {
          const el = find.id
            ? document.getElementById(find.id)
            : [...document.querySelectorAll(find.tag)].find((e) => new RegExp(find.text).test(e.textContent));
          const root = document.documentElement;
          root.style.scrollBehavior = "auto";
          window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - offset);
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }, { find, offset });
      await cutTo({ id: "listen" }, 70);
      await h.beat(850);
      const btn = await cutTo({ tag: "button", text: "Choose the sunlit path" }, 420);
      await h.beat(250);
      await h.moveTo(btn.x, btn.y, 220);
      await page.mouse.down();
      await page.mouse.up();
      await page.getByText(/sunlit path welcomes you/i).first().waitFor({ state: "visible" });
      await h.beat(850);
      await cutTo({ tag: "section", text: "Tonight.s tale" }, 70);
      await h.beat(850);
      const v = await cutTo({ id: "voices" }, 80);
      await h.beat(250);
      // The marquee pauses on hover.
      await h.moveTo(640, Math.max(150, v.y - 120), 200);
      await h.beat(600);
    },
  },
  features: [
    {
      key: "player",
      title: "Narrated player with word-by-word highlighting",
      priority: 1,
      url: `${SITE}/player/1/`,
      async before(h) {
        const { page } = h;
        await playReady(page);
        await lockScrollTop(page);
        // Cursor already resting near Play: the click lands at once on camera.
        const b = await page.getByRole("button", { name: "Play" }).boundingBox();
        await h.moveTo(b.x + b.width / 2 + 90, b.y + b.height / 2 - 40, 50);
        await settled(h, 300);
      },
      async run(h) {
        const { page } = h;
        await clickPlay(h);
        // Off the text, onto the cover.
        await h.moveTo(270, 420, 200);
        await audioAt(page, NARRATION_END);
        await page.evaluate(() => document.querySelector("audio")?.pause());
        await h.beat(600);
      },
    },
    {
      key: "choices",
      title: "In-player branching choice",
      priority: 2,
      url: `${SITE}/player/1/`,
      async before(h) {
        const { page } = h;
        await fastForwardToChoice(h);
        // Centre the whole question block (heading + both cards), footer off-screen.
        await page.evaluate(() => {
          const q = [...document.querySelectorAll("h1,h2,h3,h4,p,span")].find((e) => /What should our hero do next/i.test(e.textContent) && e.childElementCount === 0);
          const b = [...document.querySelectorAll("button")].find((e) => /Choose the sunlit path/.test(e.textContent));
          const top = (q || b).getBoundingClientRect().top;
          const bot = b.getBoundingClientRect().bottom;
          const mid = (top + bot) / 2;
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollBy(0, mid - innerHeight / 2);
        });
        await h.moveTo(640, 640, 50);
        await settled(h, 300);
        // Picking a card re-lays out the page above it; hold this framing.
        await page.evaluate(() => {
          const y = window.scrollY;
          window.addEventListener("scroll", () => { if (window.scrollY !== y) window.scrollTo(0, y); }, { passive: true });
        });
      },
      async run(h) {
        const { page } = h;
        await h.beat(700);
        await h.hover(page.getByRole("button", { name: /Take the shadowy path/ }), 200);
        await h.wait(300);
        await h.click(page.getByRole("button", { name: /Choose the sunlit path/ }), { pause: 0, move: 220 });
        // The pick registers (card lit, the other dimmed); the next clip opens
        // on the chapter it leads to, so the loading state is never filmed.
        await h.wait(350);
      },
    },
    {
      key: "chapter-3",
      title: "The chosen path: chapter 3 narration",
      priority: 3,
      url: `${SITE}/player/1/`,
      async before(h) {
        const { page } = h;
        await fastForwardToChoice(h);
        // Off camera, real time: ~3.5 s of "capturing" the choice, then
        // chapter 3 loads and auto-plays about a second later.
        await page.getByRole("button", { name: /Choose the sunlit path/ }).click();
        await page.getByText(/Chapter 3 of 5/).first().waitFor({ state: "visible", timeout: 15000 });
        // Once it plays: unmute and rewind while playing, then pause through
        // the UI (seeking a paused track makes the app resume it).
        const pause = page.getByRole("button", { name: "Pause" });
        await pause.waitFor({ state: "visible", timeout: 8000 });
        await page.evaluate(() => {
          const a = document.querySelector("audio");
          a.muted = false; a.playbackRate = 1; a.currentTime = 0;
        });
        await page.waitForTimeout(80);
        await pause.click();
        await page.getByRole("button", { name: "Play" }).waitFor({ state: "visible", timeout: 8000 });
        await lockScrollTop(page);
        const b = await page.getByRole("button", { name: "Play" }).boundingBox();
        await h.moveTo(b.x + b.width / 2 + 90, b.y + b.height / 2 - 40, 50);
        await settled(h, 400);
      },
      async run(h) {
        const { page } = h;
        await clickPlay(h);
        await h.moveTo(270, 420, 200);
        await audioAt(page, SUNLIT_END);
        await page.evaluate(() => document.querySelector("audio")?.pause());
        await h.beat(600);
      },
    },
    {
      key: "library",
      title: "Library: genre filter, search, open a story",
      priority: 4,
      url: `${SITE}/#library`,
      async before(h) {
        const { page } = h;
        // "THE LIBRARY" label just under the header: heading, search, chips and
        // the top of the card grid all in frame.
        await h.jump(page.getByText(/^The Library$/i).first(), { offset: 90 });
        await h.moveTo(900, 470, 50);
        await settled(h, 1000);
      },
      async run(h) {
        const { page } = h;
        await h.beat(500);
        await h.click(page.getByRole("button", { name: "Adventure", exact: true }), { pause: 0 });
        await h.wait(700);
        await h.click(page.getByRole("button", { name: "All Stories", exact: true }), { pause: 0 });
        await h.wait(250);
        const search = page.getByPlaceholder("Search stories...");
        await h.type(search, "forest", 40);
        await h.wait(600);
        const card = page.locator('#library a[href$="/story/1/"]').filter({ hasText: "Pre-Recorded" }).first();
        const title = card.getByText(/The Enchanted Forest/).first();
        const box = await card.boundingBox();
        await h.moveTo(box.x + box.width / 2, Math.min(box.y + 120, 740), 250);
        await h.wait(200);
        // End on the click: the next clip opens on the loaded story page.
        await page.mouse.down();
        await h.wait(60);
        await page.mouse.up();
        await page.waitForURL(/\/story\/1\/?$/, { timeout: 10000, waitUntil: "commit" }).catch(() => {});
      },
    },
    {
      key: "story-detail",
      title: "Story page with the branching-paths map",
      priority: 5,
      url: `${SITE}/story/1/`,
      async before(h) {
        await h.moveTo(900, 600, 50);
        await settled(h, 300);
      },
      async run(h) {
        const { page } = h;
        await h.beat(900);
        const heading = page.getByText(/Branching Paths/i).first();
        await h.glide(heading, { offset: 90, ms: 400 });
        await h.waitForStill(700);
        await h.hover(page.getByText(/Deep within the realm/).last(), 200);
        await h.wait(250);
        await h.hover(page.getByText(/The forest path divides/).last(), 200);
        await h.wait(300);
        await h.hover(page.getByText(/You venture down the shadowy/).first(), 200);
        await h.wait(300);
        await h.hover(page.getByText(/The sunlit path welcomes you/).first(), 200);
        await h.wait(350);
        await h.hover(page.getByText(/Your choice has set in/).first(), 200);
        await h.beat(700);
      },
    },
    {
      key: "voices",
      title: "Voice Studio: bring your own narrator",
      priority: 6,
      url: `${SITE}/voices/`,
      async before(h) {
        await h.moveTo(1000, 560, 50);
        await settled(h, 300);
      },
      async run(h) {
        const { page } = h;
        await h.beat(800);
        // Down to "My narrators": the empty state and the New Voice button.
        await h.glide(page.getByText(/^API Settings$/).first(), { offset: 110, ms: 350 });
        await h.beat(700);
        await h.click(page.getByRole("button", { name: /New Voice/i }), { pause: 0 });
        await page.getByText(/Create Voices/i).first().waitFor({ state: "visible" });
        await h.waitForStill(500);
        await h.hover(page.getByText(/Click to add|drag and drop/i).first(), 220);
        await h.wait(400);
        await h.hover(page.getByText(/Go to Recorder/i).first(), 220);
        await h.beat(900);
      },
    },
  ],
};
