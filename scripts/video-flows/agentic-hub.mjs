// Fast-paced: short marketing slides, then invest / hire / browse / token-activity / api.
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

/** Wait until every element matched in `sel` (inside the page) is fully revealed. */
const revealed = (page, sel, min) =>
  until(page, ({ sel, min }) => {
    const els = [...document.querySelectorAll(sel)];
    return els.length >= min && els.every((r) => {
      for (let n = r; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (Number(s.opacity) < 0.99) return false;
      }
      return true;
    });
  }, { sel, min });

/**
 * A cross-dissolve curtain for route changes: the app morphs its header and
 * fades the new page in, and mid-morph frames read as a broken layout.
 */
async function installCurtain(h) {
  await h.page.evaluate(() => {
    const c = document.createElement("div");
    c.id = "__rec_curtain";
    c.style.cssText = "position:fixed;inset:0;background:#07070a;opacity:0;pointer-events:none;" +
      "z-index:2147483646;transition:opacity .2s ease";
    document.documentElement.appendChild(c);
  });
}
const curtain = async (h, on) => {
  await h.page.evaluate((on) => {
    const c = document.getElementById("__rec_curtain");
    if (c) c.style.opacity = on ? "1" : "0";
  }, on);
  await h.wait(220);
};
/** Click under the curtain (agent pages stream live activity: no networkidle). */
async function nav(h, locator, url, ready) {
  const { page } = h;
  await locator.first().waitFor({ state: "visible" });
  await h.wait(80);
  await page.mouse.down();
  await curtain(h, true);
  await page.mouse.up();
  await h.moveTo(1250, 150, 150);
  await page.waitForURL(url, { waitUntil: "commit" });
  await page.waitForLoadState("domcontentloaded");
  await ready();
  await h.wait(250);
  await curtain(h, false);
}
const agentReady = (page) =>
  page.getByRole("button", { name: "Invest", exact: true }).waitFor({ state: "visible" }).catch(() => {});

const hd = (page, name) => page.getByRole("heading", { name });

// Narrative order is encoded in priority (compose sorts by it): browse -> hire
// -> invest -> token-activity -> api. Lowest-priority (api) is dropped first.
export default {
  url: `${BASE}/`,
  target: 40,
  waitUntil: "domcontentloaded",
  pacing: { featureLead: 150 },
  posterFrom: { segment: "marketing", at: 1 },
  beforeEach: installCurtain,
  marketing: {
    async before(h) {
      // Trigger every scroll-reveal off camera so each slide is fully legible.
      const { page } = h;
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 500) {
        await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
        await h.wait(120);
      }
      await h.wait(700);
      await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "*{scroll-behavior:auto!important}";
        document.head.appendChild(st);
        scrollTo({ top: 0, behavior: "instant" });
      });
      await h.wait(400);
    },
    async run(h) {
      const { page } = h;
      // Hero is held by pacing.heroDwell; type the query the browse clip opens on.
      const box = page.getByLabel("Search agents");
      await box.focus();
      await box.pressSequentially("Development", { delay: 22 });
      await h.beat(250);
      await h.slides([
        {
          at: "#two-sided", offset: NAV_H + 10, hold: 150,
          async interact() {
            const cards = page.locator("#two-sided h3");
            await h.hover(cards.first(), 100);
            await h.hover(cards.nth(1), 160);
          },
        },
        { at: "#categories", offset: NAV_H + 20, hold: 700 },
        { at: "#how-it-works", offset: NAV_H + 10, hold: 650 },
        { at: "#list-agent", offset: NAV_H + 10, hold: 700 },
      ].map((x) => ({ ms: 260, ...x })), { settle: 150 });
    },
  },
  features: [
    {
      key: "browse",
      title: "Search results, rating filter, sort, open an agent",
      priority: 1,
      url: `${BASE}/agents/?query=Development`,
      async before(h) {
        await until(h.page, () => /Found 9 results/.test(document.body.innerText));
        await h.moveTo(1250, 150, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(300);
        // The grid shrink animates scale/transform (renders stretched): disable it.
        await page.addStyleTag({ content: "main *{animation:none!important;transition-property:opacity,background-color,border-color,color!important;transform:none!important}" });
        await h.click(page.getByText("4.7+", { exact: true }), { pause: 0 });
        await until(page, () => /Found 2 results/.test(document.body.innerText));
        await h.waitForStill(1200);
        await h.beat(900);
        await h.click(page.getByText(/clear filters/i), { pause: 0 });
        const sort = page.locator("select").filter({ has: page.locator('option[value="rating"]') }).first();
        await h.hover(sort, 220);
        await h.beat(250);
        await sort.selectOption("rating");
        await h.beat(800);
        const tryAgent = page.locator('a[href="/agents/1/"]').filter({ hasText: "Try agent" });
        await h.hover(tryAgent, 280);
        await h.wait(150);
        await page.mouse.down();
        await h.wait(90);
        await page.mouse.up();
        await h.wait(120); // clip ends on the click; the route change is never filmed
      },
    },
    {
      key: "hire",
      title: "Hire an agent: buy credits with a live total",
      priority: 2,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        const b = await h.page.getByRole("button", { name: "Hire agent" }).boundingBox();
        await h.moveTo(b.x + b.width + 120, b.y + b.height / 2, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: "Hire agent" }), { pause: 0 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(500);
        const input = dialog.locator('input[type="number"]').first();
        await input.click({ clickCount: 3 });
        await input.pressSequentially("45", { delay: 30 });
        await h.beat(700);
        await h.hover(dialog.getByRole("button", { name: /^Pay /i }), 220);
        await h.beat(350);
      },
    },
    {
      key: "invest",
      title: "Invest in an agent: two-step share purchase",
      priority: 3,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        const b = await h.page.getByRole("button", { name: "Invest", exact: true }).boundingBox();
        await h.moveTo(b.x + b.width / 2 - 40, b.y + b.height / 2, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: "Invest", exact: true }), { pause: 0, move: 120 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(650);
        await h.click(dialog.getByRole("button", { name: /Continue to Investment/i }), { pause: 100 });
        const amount = page.getByLabel(/Investment Amount/i);
        await amount.waitFor({ state: "visible" });
        await h.click(amount, { pause: 40 });
        await amount.fill("");
        await amount.pressSequentially("250", { delay: 35 });
        await h.hover(dialog.getByRole("button", { name: /Invest Now/i }), 220);
        await h.beat(400);
      },
    },
    {
      key: "token-activity",
      title: "Performance metrics, agent token chart, live activity",
      priority: 4,
      url: `${BASE}/agents/1/`,
      async before(h) {
        const { page } = h;
        await agentReady(page);
        await h.jump(hd(page, /Performance Metrics/i), { offset: NAV_H + 10 });
        await until(page, () => {
          const head = [...document.querySelectorAll("h3")].find((e) => e.textContent.trim() === "Live Activity");
          const li = [...(head?.closest(".rounded-lg")?.querySelectorAll("li") || [])];
          return li.length >= 8 && li.every((r) => Number(getComputedStyle(r).opacity) >= 0.99);
        }, undefined, 4000);
        await h.moveTo(1240, 420, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(450);
        const tokenCard = page.locator("h3", { hasText: /^Agent Token$/ }).locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
        await h.glide(tokenCard, { offset: 200, ms: 350 });
        await h.moveTo(500, 400, 200);
        await h.moveTo(700, 380, 250);
        await h.beat(700);
        await h.moveTo(1000, 420, 220);
        await h.beat(400);
      },
    },
    {
      key: "api",
      title: "API docs and playground: send a request",
      priority: 5,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        await h.page.getByRole("tab", { name: "API Documentation" }).click();
        await h.jump(h.page.getByRole("tab", { name: "API Documentation" }), { offset: 160 });
        await h.waitForStill(800);
        await h.moveTo(1240, 300, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(700);
        await h.click(page.getByRole("tab", { name: "API Playground" }), { pause: 60 });
        const ta = page.locator("textarea").first();
        await h.click(ta, { pause: 0 });
        await ta.fill("");
        await ta.pressSequentially('{"input":"refactor auth module"}', { delay: 18 });
        await h.click(page.getByRole("button", { name: /Send request/i }), { pause: 0 });
        await page.getByText(/taskId/).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
        await h.beat(1100);
      },
    },
  ],
};
