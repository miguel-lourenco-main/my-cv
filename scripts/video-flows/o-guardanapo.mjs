// Live: the public Vercel site (English via the en-US locale).
// marketing: hero -> today's menu -> reviews -> contact (quick slides).
// Features (priority): products filter, previous menus, dish page, EN/PT + dark mode, contests.
// The filter writes ?filters=... into the URL: click directly (not h.click) so the
// helper does not treat it as a navigation (networkidle idles ~10 s on this site).
const SITE = "https://www.o-guardanapo.site";

/** Move the cursor to the element and click it without waiting for navigation settling. */
/** The header renders twice (desktop + mobile): pick the instance that is inside the viewport. */
const inView = async (page, sel) => {
  const all = page.locator(sel);
  const n = await all.count();
  for (let i = 0; i < n; i++) {
    const b = await all.nth(i).boundingBox();
    if (b && b.x >= 0 && b.x + b.width <= 1280 && b.y >= 0 && b.y + b.height <= 800) return all.nth(i);
  }
  return all.first();
};
const tap = async (h, locator) => {
  const { page } = h;
  const el = locator.first();
  const t0 = Date.now(); const tl = (m) => process.env.VTIME && console.log("  tap", m, Date.now() - t0);
  await el.waitFor({ state: "visible" }); tl("visible");
  await h.hover(el, 220); tl("hover");
  const box = await el.boundingBox();
  if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await h.wait(40); await page.mouse.up(); }
  else await el.click({ delay: 40 });
  await h.wait(120);
};

const DISH = `${SITE}/products/a24a8fae-4081-41c5-bcdc-7c2230f0eff2`; // Veal Rolls with Bacon: real photo + ingredients + allergen chips, all in one viewport

/**
 * Off camera: open the "All" tab and apply `filters` (button names) in order,
 * waiting out each freeze, so the clip starts on a settled, filtered grid.
 * Every ?filters= response is cached on the way and replayed on camera.
 */
async function prepCatalogue(h, filters) {
  const { page } = h;
  await h.waitForStill(1500);
  await h.wait(1500);
  await page.getByRole("tab", { name: "All", exact: true }).click();
  await h.wait(2500);
  for (const name of filters) {
    const rsc = page.waitForResponse((r) => /filters=/.test(r.url()), { timeout: 25000 }).catch(() => {});
    await page.getByRole("button", { name, exact: true }).first().click();
    await rsc;
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await h.wait(7000);
  }
  await page.mouse.move(640, 400);
  await h.waitForStill(2500);
}

export default {
  url: `${SITE}/`,
  target: 35,
  posterFrom: { segment: "marketing", at: 1 },
  pacing: { heroDwell: 1100 },

  marketing: {
    // Off camera: scroll the whole page once so every scroll-reveal has played
    // (otherwise each slide opens on half-faded content), then return to the top.
    async before(h) {
      const { page } = h;
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= H; y += 500) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
        await page.waitForTimeout(160);
      }
      await page.waitForTimeout(900);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(700);
    },
    async run(h) {
      const { page } = h;
      // Hero already held 1.1 s by the recorder; quick move + click on the nav anchor.
      const nav = page.locator('a[href="#todays-menu"]').first();
      await h.hover(nav, 260);
      await nav.click({ delay: 20 });
      await h.wait(500);
      // Hover one dish card to show price and description.
      const card = page.locator("#todays-menu a, #todays-menu [class*=card]").filter({ hasText: "Sardines" }).first();
      if (await card.count()) await h.hover(card, 150);
      await h.dwell(300);
      await h.slides([
        { at: page.locator("h2", { hasText: /what our customers say/i }), offset: 60, hold: 700, settle: 150, ms: 350 },
        { at: page.locator("h2", { hasText: /contact us/i }), offset: 60, hold: 600, settle: 150, ms: 350 },
      ]);
    },
  },

  features: [
    // The catalogue filters freeze the page's main thread for ~5 s after every change
    // (site behaviour), so the freezes are cut: clip 1 ticks Vegetarian, clip 2 starts
    // with Vegetarian + Gluten already ticked (prepared off camera), switches Any -> All
    // and searches. One 0.7 s result hold per join, no stacked holds.
    {
      key: "products-filter",
      title: "Catalogue: label filters (Vegetarian)",
      priority: 1,
      url: `${SITE}/products`,
      before: (h) => prepCatalogue(h, []),
      async run(h) {
        const { page } = h;
        await tap(h, page.getByRole("button", { name: "Vegetarian", exact: true }));
        await h.beat(1100);
      },
    },
    {
      key: "products-match-search",
      title: "Catalogue: label matching (Any -> All) + search",
      priority: 1,
      url: `${SITE}/products`,
      before: (h) => prepCatalogue(h, ["Vegetarian", "Gluten"]),
      async run(h) {
        const { page } = h;
        await tap(h, page.getByRole("button", { name: "All", exact: true }));
        await h.beat(600);
        const search = page.getByPlaceholder("Search...").first();
        await h.hover(search, 200);
        await search.focus();
        await page.keyboard.type("cake", { delay: 40 });
        await h.beat(1000);
      },
    },
    {
      key: "menus-history",
      title: "Previous menus: calendar + dish search",
      priority: 2,
      url: `${SITE}/menus`,
      async run(h) {
        const { page } = h;
        await h.beat(300);
        // Last enabled day button before the selected day (no hardcoded date).
        const day = await page.evaluate(() => {
          const btns = [...document.querySelectorAll("table button, [role=grid] button")].filter((b) => /^\d+$/.test(b.innerText.trim()));
          const sel = btns.findIndex((b) => b.getAttribute("aria-selected") === "true" || b.closest("[aria-selected=true]") || /bg-mkt-primary|selected/.test(b.className + (b.parentElement?.className || "")));
          const upto = sel > 0 ? btns.slice(0, sel) : btns;
          const ok = upto.filter((b) => !b.disabled);
          return ok.length ? ok[ok.length - 1].innerText.trim() : null;
        });
        if (day) await tap(h, page.locator("table button, [role=grid] button").filter({ hasText: new RegExp(`^${day}$`) }));
        await h.beat(1000);
        const search = page.getByPlaceholder(/Search by dish/).first();
        await h.hover(search, 220);
        await search.click();
        await search.pressSequentially("sardines", { delay: 40 });
        await h.beat(500);
        // Click the first matching date: the page jumps to the day that served the dish.
        await tap(h, page.locator("aside ul li button").first());
        await h.wait(300);
        const dish = page.getByText(/sardines/i).filter({ hasNot: page.locator("input") }).last();
        if (await dish.count()) await h.glide(dish, { offset: 260, ms: 400 });
        await h.beat(1100);
      },
    },
    {
      key: "dish",
      title: "Dish page: photo, ingredients, allergens",
      priority: 3,
      url: DISH,
      async run(h) {
        const { page } = h;
        await h.beat(300);
        const ing = page.locator("h3", { hasText: "Ingredients" });
        if (await ing.count()) await h.hover(ing, 220);
        await h.beat(500);
        const chip = page.getByText("Beef", { exact: true }).first();
        if (await chip.count()) await h.hover(chip, 240);
        await h.beat(500);
        // Fast scroll down to the reviews tab (no sign-in UI), then hold.
        const rv = page.getByText(/^Reviews? \(\d+\)/).first();
        if (await rv.count()) { await h.glide(rv, { offset: 640, ms: 450 }); await h.beat(1000); }
        else await h.beat(500);
      },
    },
    {
      // Continues straight from the dish clip (same page, full of content): PT, then dark.
      key: "i18n-theme",
      title: "EN/PT switch + dark mode",
      priority: 4,
      url: DISH,
      async run(h) {
        const { page } = h;
        await tap(h, await inView(page, 'button[aria-label="Language"]'));
        await tap(h, page.getByRole("menu").getByText(/Portugu/i));
        await page.waitForLoadState("domcontentloaded").catch(() => {});
        await h.waitForStill(1200);
        await h.beat(700);
        await tap(h, await inView(page, "button.inline-grid.place-items-center"));
        await h.wait(200);
        const dark = page.getByRole("menuitem", { name: /dark|escuro/i });
        if (await dark.count()) await tap(h, dark);
        await h.beat(1900);
      },
    },
    {
      key: "contests",
      title: "Weekly photo contest",
      priority: 5,
      url: `${SITE}/contests`,
      // Off camera: play every scroll-reveal once and force the revealed state, so no
      // frame shows a section half-faded; then return to the top.
      async before(h) {
        const { page } = h;
        await page.addStyleTag({ content: "[data-reveal],.reveal,[class*=reveal],[style*='opacity']{opacity:1!important;transform:none!important;transition:none!important}" }).catch(() => {});
        const H = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y <= H; y += 400) {
          await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
          await page.waitForTimeout(150);
        }
        await page.waitForTimeout(800);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(600);
      },
      async run(h) {
        const { page } = h;
        await h.beat(700);
        await h.glide(page.locator("h2, h3", { hasText: /weekly agenda/i }).first(), { offset: 120, ms: 450 });
        await h.beat(1000);
        const past = page.locator("h2, h3", { hasText: /past contests/i }).first();
        if (await past.count()) { await h.glide(past, { offset: 120, ms: 450 }); await h.beat(1700); }
      },
    },
  ],
};
