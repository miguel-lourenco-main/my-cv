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
  await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 120);
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

export default {
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
