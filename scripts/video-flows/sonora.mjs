// Sonora (live GitLab Pages static export). Pre-Recorded story 1 only: the
// AI-Live stories need an ElevenLabs key. Target 40 s.
// Marketing: a few quick slides + the sunlit-path click. Features, by priority:
// narrated player, in-player choice, library, story page, Voice Studio, theme toggle (priority 6).

// "destiny." is lit 5.87-6.47 s in /samples/enchanted-forest-start.mp3. Pausing
// inside the last word of a sentence leaves the sentence fully highlighted.
const NARRATION_END = 6.3;

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

export default {
  url: `${SITE}/`,
  target: 30,
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
      await cutTo({ id: "voices" }, 80);
      await h.beat(800);
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
        await page.waitForFunction(() => {
          const b = document.querySelector('button[aria-label="Play"]');
          return b && !b.disabled;
        });
        // No scroll: the cover, narration card and player bar all stay in view.
        // Skip the opening silence: play to 2.8 s, then pause through the UI so
        // the clip's Play click resumes with the highlight already moving.
        await page.getByRole("button", { name: "Play" }).click();
        await page.waitForFunction(() => document.querySelector("audio").currentTime >= 2.8, null, { polling: 20 });
        await page.getByRole("button", { name: "Pause" }).click();
        await page.mouse.move(640, 760);
        await settled(h, 300);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: "Play" }), { pause: 0, move: 150 });
        await h.moveTo(270, 330, 150);
        // The lit word must be on screen and below the sticky header.
        await page.waitForFunction(() => {
          const w = [...document.querySelectorAll("span.font-medium")].find((e) => e.className.includes("text-on-surface"));
          if (!w) return false;
          const r = w.getBoundingClientRect();
          return r.top > 110 && r.bottom < innerHeight - 160 && r.left >= 0 && r.right <= innerWidth;
        }, null, { timeout: 1200, polling: 50 }).catch(() => {});
        await page.waitForFunction((end) => {
          const a = document.querySelector("audio");
          return a && a.currentTime >= end;
        }, NARRATION_END, { timeout: 30000, polling: 30 });
        await page.evaluate(() => document.querySelector("audio")?.pause());
        await h.beat(500);
      },
    },
    {
      key: "choices",
      title: "In-player branching choice",
      priority: 2,
      url: `${SITE}/player/1/`,
      async before(h) {
        const { page } = h;
        await page.waitForFunction(() => {
          const b = document.querySelector('button[aria-label="Play"]');
          return b && !b.disabled;
        });
        await page.getByRole("button", { name: "Play" }).click();
        const choice = page.getByRole("button", { name: /Choose the sunlit path/ });
        // Fast-forward muted; the in-page timer stops touching the audio the
        // moment the choice appears (a further play() would restart the chapter).
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
        await choice.waitFor({ state: "visible", timeout: 30000 });
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
        await settled(h, 300);
        // The app simulates ~4 s of "Capturing/Making choice"; fake timers let
        // the run() jump past it after a brief glimpse.
        await page.clock.install();
      },
      async run(h) {
        const { page } = h;
        await h.beat(400);
        await h.hover(page.getByRole("button", { name: /Take the shadowy path/ }), 200);
        await h.wait(150);
        await h.click(page.getByRole("button", { name: /Choose the sunlit path/ }), { pause: 100, move: 220 });
        await h.wait(300);
        for (let i = 0; i < 40; i++) {
          if (await page.getByText(/Chapter 3 of 5/).first().isVisible().catch(() => false)) break;
          await page.clock.fastForward(1500).catch(() => {});
          await h.wait(60);
        }
        await page.getByText(/Chapter 3 of 5/).first().waitFor({ state: "visible", timeout: 10000 });
        // Top of the new chapter: cover, title and first lines under the nav.
        await page.evaluate(() => {
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, 0);
        });
        await h.wait(250);
        await h.beat(1200);
      },
    },
    {
      key: "library",
      title: "Library: search, genre filter, open a story",
      priority: 3,
      url: `${SITE}/#library`,
      async before(h) {
        await h.jump(h.page.getByPlaceholder("Search stories..."), { offset: 170 });
        await settled(h, 1000);
      },
      async run(h) {
        const { page } = h;
        const search = page.getByPlaceholder("Search stories...");
        await h.type(search, "forest", 40);
        await h.wait(400);
        await search.fill("");
        await h.click(page.getByRole("button", { name: "Fairy Tale", exact: true }), { pause: 100 });
        await h.wait(500);
        const card = page.locator('#library a[href$="/story/1/"]').filter({ hasText: "Pre-Recorded" }).first();
        const title = card.getByText(/The Enchanted Forest/).first();
        await h.hover(title, 250);
        await h.wait(150);
        await title.click({ delay: 60 });
        await page.waitForURL(/\/story\/1\/?$/);
      },
    },
    {
      key: "story-detail",
      title: "Story page with the branching-paths map",
      priority: 4,
      url: `${SITE}/story/1/`,
      before: (h) => settled(h, 300),
      async run(h) {
        const { page } = h;
        await h.beat(400);
        const heading = page.getByText(/Branching Paths/i).first();
        await h.glide(heading, { offset: 90, ms: 400 });
        await h.waitForStill(700);
        await h.hover(page.getByText(/You venture down the shadowy/).first(), 200);
        await h.wait(250);
        await h.hover(page.getByText(/The sunlit path welcomes you/).first(), 200);
        await h.wait(350);
      },
    },
    {
      key: "voices",
      title: "Voice Studio: bring your own narrator",
      priority: 5,
      url: `${SITE}/voices/`,
      before: (h) => settled(h, 300),
      async run(h) {
        const { page } = h;
        await h.beat(300);
        await h.click(page.getByRole("button", { name: /New Voice/i }), { pause: 200 });
        await page.getByText(/Create Voices/i).first().waitFor({ state: "visible" });
        await h.waitForStill(500);
        await h.hover(page.getByText(/Go to Recorder/i).first(), 250);
        await h.beat(1100);
        await page.keyboard.press("Escape");
        await h.wait(200);
      },
    },
    {
      key: "dark-mode",
      title: "Light and dark theme",
      priority: 6,
      url: `${SITE}/voices/`,
      before: (h) => settled(h, 300),
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: /Toggle theme/i }), { pause: 0, move: 200 });
        await h.click(page.getByRole("menuitem", { name: /Dark/i }).or(page.getByText(/^Dark$/)).first(), { pause: 60, move: 150 });
        await h.beat(1500);
      },
    },
  ],
};
