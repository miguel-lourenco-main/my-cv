// Live: GitLab Pages static export. Hero -> branching choice (sunlit path) ->
// Tonight's tale -> library (Fairy Tale filter) -> story page -> player, where
// the narration plays with word-by-word highlighting up to a sentence boundary.
//
// The story is The Enchanted Forest (Pre-Recorded). The AI-Live stories need an
// ElevenLabs key: on the deployed site /player/3/ shows "Audio Not Available",
// so they cannot be recorded.
//
// The hero's book covers float forever, so the settle wait is capped low: the
// headline itself is static and readable as soon as the page loads.

// Narration timings for /samples/enchanted-forest-start.mp3 (measured): "destiny."
// is lit 5.87-6.47 s and "stirring." 11.78-12.32 s. Pausing the audio inside the
// last word of a sentence leaves that sentence fully highlighted.
const NARRATION_END = 6.3;

export default {
  url: "https://sonora-d09e63.gitlab.io/",
  posterAt: 2,
  pacing: { settleMax: 2000 },
  async run(h) {
    const { page } = h;
    let mouse = { x: 640, y: 400 };
    const glide = async (x, y, ms = 450) => {
      await h.moveTo(x, y, ms);
      mouse = { x, y };
    };
    // One paced scroll with a temporarily larger step, so a short hop between two
    // framed sections is a single smooth move instead of two stops.
    const scrollOnce = async (locator, opts, step) => {
      const prev = h.pacing.scrollStep;
      h.pacing.scrollStep = step;
      try {
        await h.scrollTo(locator, opts);
      } finally {
        h.pacing.scrollStep = prev;
      }
    };
    // Click, then move the cursor off the element so it never hides the label.
    const clickAndClear = async (locator, { hoverMs = 120, dx = 90, dy = 70 } = {}) => {
      const el = locator.first();
      await el.waitFor({ state: "visible" });
      const box = await el.boundingBox();
      await glide(box.x + box.width / 2, box.y + box.height / 2);
      await h.wait(hoverMs);
      await el.click({ delay: 90 });
      await glide(Math.min(1250, box.x + box.width + dx), Math.min(780, box.y + box.height + dy), 300);
    };

    // 01 Listen: one glide from the hero to the three feature cards.
    await scrollOnce(page.getByRole("heading", { name: /The story hears you/ }), { offset: 110, pause: 1600 }, 1.25);

    // 02 Branch: one move to the final framing (quote, both choices, room for the
    // continuation text), so the section is never shown twice.
    const sunlit = page.getByRole("button", { name: "Choose the sunlit path" });
    await scrollOnce(sunlit, { offset: 420, pause: 1300 }, 1.4);
    await clickAndClear(sunlit);
    await page.getByText(/sunlit path welcomes you/i).first().waitFor({ state: "visible" });
    await h.waitForStill(800);
    await h.dwell(2700);

    // 03 Tonight's tale: let the card's reveal finish, then a short look.
    const featured = page.getByRole("heading", { name: /The Enchanted Forest/ }).first();
    await scrollOnce(featured, { offset: 330, pause: 400 }, 1.0);
    await h.waitForStill(900);
    await h.dwell(1000);

    // Library: straight past "Continue listening" to the search + genre filters.
    await scrollOnce(page.getByPlaceholder("Search stories..."), { offset: 140, pause: 500 }, 1.5);
    await clickAndClear(page.getByRole("button", { name: "Fairy Tale", exact: true }), { dx: 60, dy: 120 });
    await h.wait(600);

    // The card: hover its title so the hover state shows, then open it.
    const card = page.locator('#library a[href$="/story/1/"]').filter({ hasText: "Pre-Recorded" }).first();
    const title = card.getByText(/The Enchanted Forest/).first();
    const tb = await title.boundingBox();
    await glide(tb.x + Math.min(tb.width / 2, 90), tb.y + tb.height / 2, 550);
    await h.wait(450);
    await title.click({ delay: 90 });
    await page.waitForURL(/\/story\/1\/?$/);

    // Story page: count the hold only once the hero is fully in.
    const start = page.getByRole("link", { name: "Start listening" });
    await start.waitFor({ state: "visible" });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.locator("h1").first().evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {})))).catch(() => {});
    const sb = await start.boundingBox();
    await glide(sb.x + sb.width + 160, sb.y + 90, 400);
    await h.dwell(2300);

    // Player: no idle "Ready to listen" beat; frame the text above the sticky
    // player bar, press Play, park the cursor on the cover art.
    await clickAndClear(start);
    await page.waitForURL(/\/player\/1\/?$/);
    await page.waitForFunction(() => {
      const b = document.querySelector('button[aria-label="Play"]');
      return b && !b.disabled;
    });
    await h.scrollBy(150, { pause: 250 });
    const play = page.getByRole("button", { name: "Play" });
    const pb = await play.boundingBox();
    await glide(pb.x + pb.width / 2, pb.y + pb.height / 2, 450);
    await play.click({ delay: 90 });
    await glide(270, 330, 350);
    await page.waitForFunction(
      (end) => {
        const a = document.querySelector("audio");
        return a && a.currentTime >= end;
      },
      NARRATION_END,
      { timeout: 30000, polling: 30 }
    );
    await page.evaluate(() => document.querySelector("audio")?.pause());
    await h.dwell(1300);
  },
};
