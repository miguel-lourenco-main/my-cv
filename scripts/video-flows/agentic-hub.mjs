// Live: GitLab Pages static export (no local repo). Hero -> "one agent, two
// sides" -> category floor -> Development results -> CodeAssist Pro's page:
// invest in it (share dialog), its agent token + live activity, the API docs
// tab and the API playground.
// The Agent Interface tab embeds a placeholder site (example.com), so its panel
// is never brought into view: API Documentation is selected while the panel is
// still below the fold.
// The hero is held for pacing.heroDwell before run() starts; scrolls are paced.

const BASE = "https://agentichub-64abdc.gitlab.io";
const NAV_H = 64; // sticky header height

/** Wait until `fn` (evaluated in the page) returns true, or give up after `ms`. */
const until = (page, fn, arg, ms = 6000) =>
  page.waitForFunction(fn, arg, { timeout: ms, polling: 150 }).catch(() => {});

/**
 * One continuous eased scroll of the window to `top` over `ms` (kept under
 * ~700 px/s). Used where the recorder's 0.75-viewport step cap would add an
 * intermediate stop on a frame that shows nothing new.
 */
const glide = (page, top, ms) =>
  page.evaluate(({ top, ms }) => new Promise((resolve) => {
    const s = document.scrollingElement;
    const top0 = s.scrollTop, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      s.scrollTo({ top: top0 + (top - top0) * e, behavior: "instant" });
      if (t < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  }), { top, ms });

/** Document Y that puts `locator`'s top `offset` px below the viewport top. */
const yFor = (locator, offset) =>
  locator.first().evaluate((el, off) => Math.round(el.getBoundingClientRect().top + scrollY - off), offset);

export default {
  url: `${BASE}/`,
  posterAt: 2,
  async run(h) {
    const { page } = h;

    // A cross-dissolve curtain for the route changes. The app morphs its header
    // and fades the new page in, and the mid-morph frames read as a broken
    // layout, so the swap happens under an opaque curtain in the page's colour.
    // It sits just under the recorder's cursor (which is at the max z-index).
    await page.evaluate(() => {
      const c = document.createElement("div");
      c.id = "__rec_curtain";
      c.style.cssText =
        "position:fixed;inset:0;background:#07070a;opacity:0;pointer-events:none;" +
        "z-index:2147483646;transition:opacity .28s ease";
      document.documentElement.appendChild(c);
    });
    const curtain = async (on) => {
      await page.evaluate((on) => {
        const c = document.getElementById("__rec_curtain");
        if (c) c.style.opacity = on ? "1" : "0";
      }, on);
      await h.wait(320);
    };

    // Agent pages stream a live-activity feed, so the network never goes idle:
    // navigate by hand (URL + DOM + a ready check), under the curtain.
    // The cursor is already on the target (h.hover). Press shows the click,
    // the curtain closes while the button is held, and the release (= the
    // click) fires behind it, so the app's exit morph is never on tape.
    const nav = async (locator, url, ready) => {
      await locator.first().waitFor({ state: "visible" });
      await h.wait(120);
      await page.mouse.down();
      await curtain(true);
      await page.mouse.up();
      // Park the cursor in the empty gutter while the new page builds, so it
      // never sits on top of whatever lands under the click point.
      await h.moveTo(1250, 150, 200);
      await page.waitForURL(url, { waitUntil: "commit" });
      await page.waitForLoadState("domcontentloaded");
      await ready();
      await h.wait(350);
      await curtain(false);
    };

    // 1) Straight from the hero to "One agent. Two sides.". The live stats
    // strip at the foot of the hero is skipped: its "SOL settled" counter is
    // always 0 on the demo data and read as a broken widget. One continuous,
    // gentle move (~650 px/s) carries the strip through without stopping on it.
    const twoSided = page.locator("#two-sided");
    await glide(page, await yFor(twoSided, NAV_H + 10), 1700);
    // The two cards reveal on view: hold only once both are fully in.
    await until(page, () => {
      const sec = document.getElementById("two-sided");
      const cards = [...sec.querySelectorAll("*")].filter((e) =>
        /Autonomous work, on demand|Tokenized, on-chain ownership/.test(e.textContent) && e.childElementCount === 0);
      if (cards.length < 2) return false;
      return cards.every((c) => {
        for (let n = c; n && n !== sec; n = n.parentElement) {
          const st = getComputedStyle(n);
          if (Number(st.opacity) < 0.99 || (st.transform !== "none" && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(st.transform))) return false;
        }
        return true;
      });
    });
    await h.dwell(3000);

    // 2) The category floor: land once with the heading ~80 px under the nav,
    // then let the row reveal finish before holding.
    const floorHeading = page.getByRole("heading", { name: "Browse the floor" });
    await glide(page, await yFor(floorHeading, NAV_H + 80), 1500);
    await until(page, () => {
      const rows = [...document.querySelectorAll('#categories a[href^="/agents/?query="]')];
      return rows.length >= 5 && rows.every((r) => {
        for (let n = r; n && n.id !== "categories"; n = n.parentElement) {
          const s = getComputedStyle(n);
          if (Number(s.opacity) < 0.99 || (s.transform !== "none" && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(s.transform))) return false;
        }
        return true;
      });
    });
    await h.dwell(800);

    // 3) Development -> results grid. The cursor waits in the right gutter
    // (where nav() parked it), then glides straight to "Try agent" and clicks
    // at once, so the card's hover market line is never held on camera.
    const dev = page.locator('a[href="/agents/?query=Development"]');
    await h.hover(dev, 500);
    await nav(dev, /query=Development/, () =>
      until(page, () => /Found \d+ results/.test(document.body.innerText)));
    await h.dwell(1000);
    const tryAgent = page.locator('a[href="/agents/1/"]').filter({ hasText: "Try agent" });
    await h.hover(tryAgent, 600);
    await nav(tryAgent, /\/agents\/1\/?$/, () =>
      page.getByRole("button", { name: "Invest", exact: true }).waitFor({ state: "visible" }).catch(() => {}));

    // 4) Agent hero, cursor parked in the right gutter above the metrics row.
    const invest = page.getByRole("button", { name: "Invest", exact: true });
    await h.moveTo(1240, 520, 500);
    await h.dwell(700);

    // 5) Invest: the share dialog (market cap, available shares, price).
    await h.click(invest, { pause: 0, move: 600 });
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });
    await h.wait(300);
    await h.moveTo(1240, 520, 400); // gutter, off the dialog and the metric cards
    await h.dwell(1800);
    const cont = dialog.getByRole("button", { name: /Continue to Investment/i });
    if (await cont.count()) await h.hover(cont, 500);
    await h.dwell(400);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" }).catch(() => {});
    await h.moveTo(1240, 420, 300);

    // 6) Agent token chart + live activity: one continuous move so the token
    // card sits ~200 px down with the metrics row above it and the tab bar in
    // view. The feed's rows stagger in on view; hold once all 8 are in.
    const tokenCard = page.locator("h3", { hasText: /^Agent Token$/ }).locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
    await glide(page, await yFor(tokenCard, 200), 1100);
    await until(page, () => {
      const head = [...document.querySelectorAll("h3")].find((e) => e.textContent.trim() === "Live Activity");
      const li = [...(head?.closest(".rounded-lg")?.querySelectorAll("li") || [])];
      return li.length >= 8 && li.every((r) => Number(getComputedStyle(r).opacity) >= 0.99);
    }, undefined, 1500);
    await h.dwell(2500);

    // 7) API docs: click, bring the panel up under the nav in one step, hold.
    const apiTab = page.getByRole("tab", { name: "API Documentation" });
    await h.click(apiTab, { pause: 200, move: 500 });
    await h.moveTo(1240, 300, 300);
    await glide(page, await yFor(apiTab, 160), 900);
    await h.dwell(1800);

    // 8) API Playground (agent-to-agent calls) closes the clip.
    const play = page.getByRole("tab", { name: "API Playground" });
    await h.click(play, { pause: 200, move: 500 });
    const pb = await play.boundingBox();
    if (pb) await h.moveTo(pb.x + pb.width / 2, pb.y + pb.height + 44, 300);
    await h.dwell(2700);
  },
};
