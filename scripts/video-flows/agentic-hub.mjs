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
    // The header's wallet-balance pill fades in only once the page is scrolled,
    // so it would pop in and out between clips and suggest a connected wallet.
    // Hide it on every clip so the header looks the same across cuts.
    const st = document.createElement("style");
    st.textContent = "header div.rounded-full:has(> span.text-gold), header div.rounded-full:has(span.text-gold){display:none!important}";
    document.head.appendChild(st);
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
  target: 26,
  waitUntil: "domcontentloaded",
  pacing: { featureLead: 150, heroDwell: 1100 },
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
      await h.beat(150);
      await h.slides([
        {
          at: "#two-sided", offset: NAV_H + 10, hold: 150, cut: true, settle: 200,
          async interact() {
            const cards = page.locator("#two-sided h3");
            await h.hover(cards.first(), 100);
            await h.hover(cards.nth(1), 130);
          },
        },
        { at: "#categories", offset: NAV_H + 20, hold: 450 },
        { at: "#how-it-works", offset: NAV_H + 10, hold: 430 },
        // A cut, not a glide: gliding showed the builders card before its reveal.
        { at: "#list-agent", offset: NAV_H + 10, hold: 600, cut: true, settle: 250 },
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
        // The grid shrink animates scale/transform (renders stretched): disable it.
        await h.page.addStyleTag({ content: "main *{animation:none!important;transition-property:opacity,background-color,border-color,color!important;transform:none!important}" });
        // The 'Try agent' click is filmed but its navigation is cancelled (capture
        // phase, before the app's link handler): the clip ends on the click frame
        // and never records the unrendered agent route. Hire opens on that page.
        await h.page.evaluate(() => document.addEventListener("click", (e) => {
          if (e.target.closest && e.target.closest('a[href="/agents/1/"]')) { e.preventDefault(); e.stopPropagation(); }
        }, true));
        await h.moveTo(1250, 150, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(250);
        // One rating filter (9 -> 6 results), then sort the filtered set: no
        // redundant second filter and no clear-filters re-layout on camera.
        // Raw mouse click: Playwright's actionability checks on the chip held the
        // frame ~0.7 s. The list updates ~0.3 s later; point at the count meanwhile.
        const count = await page.getByText(/Found \d+ results/).first().boundingBox();
        await h.hover(page.getByText("4.5+", { exact: true }), 220);
        await page.mouse.down();
        await h.wait(60);
        await page.mouse.up();
        if (count) await h.moveTo(count.x + count.width * 0.6, count.y + count.height / 2, 380);
        await until(page, () => /Found 6 results/.test(document.body.innerText), undefined, 2000);
        await h.beat(650);
        const sort = page.locator("select").filter({ has: page.locator('option[value="rating"]') }).first();
        await h.hover(sort, 200);
        await sort.selectOption("rating");
        await h.beat(750);
        const tryAgent = page.locator('a[href="/agents/1/"]').filter({ hasText: "Try agent" });
        await h.hover(tryAgent, 260);
        await h.wait(80);
        await page.mouse.down();
        await h.wait(90);
        await page.mouse.up();
        // Navigation is cancelled in before(): end just after the press registers.
        await h.wait(100);
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
        // Landing beat on the agent header (name, price, rating, Hire/Invest).
        await h.beat(400);
        await h.click(page.getByRole("button", { name: "Hire agent" }), { pause: 0 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(450);
        const input = dialog.locator('input[type="number"]').first();
        await input.click({ clickCount: 3 });
        await input.pressSequentially("45", { delay: 30 });
        // Paying needs a wallet (the static demo spins forever), so the clip ends
        // on the computed result: the cursor points at the updated total and Pay label.
        await h.beat(250);
        // Park the cursor just right of the updated total (not over the text).
        const total = await dialog.getByText(/^0\.450000 SOL$/).first().boundingBox().catch(() => null);
        if (total) await h.moveTo(total.x + total.width + 24, total.y + total.height / 2, 200);
        await h.beat(800);
      },
    },
    {
      key: "invest",
      title: "Invest in an agent: two-step share purchase",
      priority: 3,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        // The dialog's step change fades the old step out to a blank panel, then
        // fades step 2 in: pin step contents to full opacity so no blank frame shows.
        await h.page.addStyleTag({ content: "[role=dialog] [style*=opacity]{opacity:1!important;transform:none!important}" });
        const b = await h.page.getByRole("button", { name: "Invest", exact: true }).boundingBox();
        await h.moveTo(b.x + b.width / 2 - 40, b.y + b.height / 2, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: "Invest", exact: true }), { pause: 0, move: 90 });
        const dialog = page.getByRole("dialog");
        await dialog.waitFor({ state: "visible" });
        await h.beat(650);
        // Raw click as soon as the cursor lands (Playwright's click held ~0.5 s).
        const cont = await dialog.getByRole("button", { name: /Continue to Investment/i }).boundingBox();
        await h.moveTo(cont.x + cont.width / 2, cont.y + cont.height / 2, 200);
        await page.mouse.click(cont.x + cont.width / 2, cont.y + cont.height / 2, { delay: 50 });
        const amount = page.getByLabel(/Investment Amount/i);
        // Head for where the amount field appears while step 1 hands over, then
        // click it as soon as it renders: raw click, no actionability hold.
        await Promise.all([
          page.waitForFunction(() => {
            const i = document.querySelector('[role=dialog] input[type=number]');
            return i && i.getBoundingClientRect().width > 0;
          }, undefined, { polling: "raf", timeout: 5000 }),
          h.moveTo(cont.x + 110, cont.y - 30, 260),
        ]);
        const ab = await amount.boundingBox();
        await h.moveTo(ab.x + Math.min(120, ab.width / 2), ab.y + ab.height / 2, 90);
        await page.mouse.click(ab.x + Math.min(120, ab.width / 2), ab.y + ab.height / 2);
        await amount.fill("");
        await amount.pressSequentially("250", { delay: 35 });
        // Investing needs a wallet; end on the computed "approximately 25.00 shares".
        const shares = await dialog.getByText(/approximately/i).first().boundingBox().catch(() => null);
        if (shares) await h.moveTo(shares.x + shares.width + 24, shares.y + shares.height / 2, 200);
        await h.beat(800);
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
        // Same tab state as the api clip: never show Agent Interface selected.
        await page.getByRole("tab", { name: "API Documentation" }).click();
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
        await h.beat(600);
        const tokenCard = page.locator("h3", { hasText: /^Agent Token$/ }).locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]");
        await h.glide(tokenCard, { offset: 200, ms: 350 });
        // Trace the price line (the chart has no tooltip), then point at the feed.
        const chart = tokenCard.locator('svg[viewBox="0 0 100 100"]').first();
        const svg = await chart.boundingBox();
        // Points of the price line, read from its path (x 0..100 in viewBox units).
        const pts = await chart.locator("path").first().evaluate((p) => {
          const xy = [...p.getAttribute("d").matchAll(/[ML]\s*([\d.]+),([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
          const line = xy.filter((q, i) => i === 0 || q[0] > xy[i - 1][0]);
          return line.filter((_, i) => i % 4 === 0 || i === line.length - 1);
        }).catch(() => null);
        if (svg && pts) {
          await h.moveTo(svg.x + 4, svg.y + (svg.height * pts[0][1]) / 100, 160);
          for (const [x, y] of pts.slice(1)) await h.moveTo(svg.x + (svg.width * x) / 100, svg.y + (svg.height * y) / 100, 55);
        }
        const feed = page.locator("h3", { hasText: /^Live Activity$/ });
        const fb = await feed.boundingBox();
        if (fb) {
          await h.moveTo(fb.x + 60, fb.y + 70, 220);
          await h.moveTo(fb.x + 60, fb.y + 260, 450);
        }
        await h.beat(250);
      },
    },
    {
      key: "api",
      title: "API docs and playground: send a request",
      priority: 5,
      url: `${BASE}/agents/1/`,
      async before(h) {
        await agentReady(h.page);
        // The playground fakes ~1.8 s of latency with a timer: shorten one-shot
        // timers of 0.8-3 s so the spinner is not filmed (intervals untouched).
        await h.page.evaluate(() => {
          const st = window.setTimeout;
          window.setTimeout = (fn, ms, ...a) => st(fn, ms >= 800 && ms <= 3000 ? 120 : ms, ...a);
        });
        // Tab panels slide/fade in (framer-motion inline opacity + translateX):
        // pin them to their final state so the playground appears at once.
        await h.page.addStyleTag({ content: "[role=tabpanel] > *{opacity:1!important;transform:none!important}" });
        await h.page.getByRole("tab", { name: "API Documentation" }).click();
        await h.jump(h.page.getByRole("tab", { name: "API Documentation" }), { offset: NAV_H + 12 });
        await h.waitForStill(800);
        await h.moveTo(1240, 300, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(650);
        const pg = await page.getByRole("tab", { name: "API Playground" }).boundingBox();
        await h.moveTo(pg.x + pg.width / 2, pg.y + pg.height / 2, 200);
        await page.mouse.click(pg.x + pg.width / 2, pg.y + pg.height / 2, { delay: 50 });
        await h.wait(60);
        const ta = page.locator("textarea").first();
        await h.click(ta, { pause: 0, move: 180 });
        await ta.fill("");
        await ta.pressSequentially('{"input":"refactor auth module"}', { delay: 14 });
        await h.click(page.getByRole("button", { name: /Send request/i }), { pause: 0 });
        await page.getByText(/taskId/).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
        await h.beat(1100);
      },
    },
  ],
};
