// Live: the public Vercel site (English via the en-US locale). Header is not
// sticky, so page changes use h.goto() (held for navDwell) instead of scrolling
// back up to the nav. Hero -> today's menu -> products catalogue + filter -> a dish.
const SITE = "https://www.o-guardanapo.site";

export default {
  url: `${SITE}/`,
  posterAt: 2,
  async run(h) {
    const { page } = h;
    // Hero is held by the recorder (heroDwell); point at the "Today's Menu" card.
    await h.hover(page.locator('a[href="#todays-menu"]'), 700);
    await h.wait(500);
    await h.scrollTo(page.locator("#todays-menu h2"), { offset: 40, pause: 1200 });
    await h.scrollBy(620, { pause: 1600 });

    await h.goto(`${SITE}/products`);
    // The filter writes ?filters=… into the URL; click it directly so the recorder
    // does not treat it as a page change (its networkidle wait idles ~10 s here).
    const veg = page.getByRole("button", { name: "Vegetarian", exact: true }).first();
    await h.hover(veg, 600);
    await veg.click({ delay: 90 });
    await h.wait(2200);

    // A dish page: photo, ingredients, allergens.
    await h.goto(`${SITE}/products/a24a8fae-4081-41c5-bcdc-7c2230f0eff2`);
    await h.hover(page.getByRole("heading", { name: "Ingredients" }), 600);
    await h.wait(800);
  },
};
