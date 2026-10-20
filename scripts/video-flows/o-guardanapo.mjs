// Live: the public Vercel site (English via the en-US locale). Demo data = the
// site's own public catalogue/menus; every clip opens a fresh context in the
// same EN/light state, except the last (contests), which continues the PT/dark
// state the i18n-theme clip just switched on.
//
// marketing: hero -> today's menu (nav click + previous-day arrow). No story/reviews/contact
// sections (owners' names, real reviewers, real contact details).
// Features (priority): products filter, previous menus, dish page, admin back office
// (gallery screenshots, login required), EN/PT + dark mode, contests.
//
// Catalogue note: on the "All" tab, the FIRST label filter applied to the full
// 230-card grid freezes the main thread for 3-5 s (site behaviour: one long
// click handler). Ticking the filter on the "For Order" tab first (few cards)
// and only then opening "All" avoids the freeze, so the whole catalogue story
// is one continuous take.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE = "https://www.o-guardanapo.site";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");

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

/** Move the cursor to the element and press it, without waiting for navigation settling. */
const tap = async (h, locator, moveMs = 220) => {
  const { page } = h;
  const el = locator.first();
  await el.waitFor({ state: "visible" });
  await h.hover(el, moveMs);
  const box = await el.boundingBox();
  if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await h.wait(40); await page.mouse.up(); }
  else await el.click({ delay: 40 });
  await h.wait(100);
};

/** Off camera: play every scroll-reveal once and pin the revealed state, then back to the top. */
async function revealAll(page) {
  await page.addStyleTag({ content: "[data-reveal],.reveal,[class*=reveal]{opacity:1!important;transform:none!important;transition:none!important}" }).catch(() => {});
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += 450) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
}

const DISH = `${SITE}/products/a24a8fae-4081-41c5-bcdc-7c2230f0eff2`; // Veal Rolls with Bacon: real photo + ingredients + allergen chips in one viewport

// --- Admin back office: honest fallback over the gallery screenshots ----------------
// The admin needs a login on the live site and there are no demo credentials, so
// it is shown as captioned screenshots (no customer names: campaigns/reviews shots
// are left out because they show real users).
// [file, caption, crop as fractions [x0, y0, x1, y1]] - each crop is 1280:716 so the UI fills the frame.
const ADMIN = [
  ["admin_menu_preview_L.png", "Daily menus: archive + preview", [0.21, 0.0, 0.81, 0.68]],
  ["create_menu_L.png", "Build a day's menu from the catalogue", [0.21, 0.0, 0.81, 0.68]],
  ["admin_product_list_L.png", "Product catalogue: labels, allergens, filters", [0.21, 0.0, 0.81, 0.68]],
  ["product_form_L.png", "Product editor: pricing, allergens, side dishes", [0.2, 0.04, 0.8, 0.72]],
];
const ADMIN_URL = (() => {
  const dir = path.join(ROOT, "public", "projects_images", "o-guardanapo");
  const slides = ADMIN.map(([f, cap, [x0, y0, x1, y1]], i) => {
    const src = pathToFileURL(path.join(dir, f)).href;
    const pc = (v) => `${(v * 100).toFixed(1)}%`;
    const box = `object-view-box:inset(${pc(y0)} ${pc(1 - x1)} ${pc(1 - y1)} ${pc(x0)})`;
    return `<div class="s${i === 0 ? " on" : ""}"><img src="${src}" style="${box}"><div class="cap">${cap}</div></div>`;
  }).join("");
  const html = `<!doctype html><meta charset="utf-8"><title>admin</title><style>
html,body{margin:0;height:100%;background:#f5efe3;overflow:hidden;font-family:system-ui,sans-serif}
.top{position:fixed;left:0;right:0;top:0;height:84px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;box-sizing:border-box;z-index:2}
.top b{font:700 28px/1 Georgia,serif;color:#1d3b2a}
.top span{font:600 14px/1 system-ui,sans-serif;color:#7a5a2e;background:#efe3cc;border:1px solid #e0cfae;border-radius:999px;padding:8px 14px}
.s{position:fixed;inset:0;opacity:0;transition:opacity 220ms ease}
.s.on{opacity:1}
.s img{position:absolute;left:0;top:84px;width:1280px;height:716px;object-fit:cover;transform-origin:50% 30%;transform:scale(1);transition:transform 1400ms ease-out;box-shadow:0 0 0 1px #e4d8c2}
.s.on img{transform:scale(1.035)}
.cap{position:absolute;left:50%;bottom:22px;box-shadow:0 6px 24px rgba(0,0,0,.25);transform:translateX(-50%);padding:10px 20px;border-radius:999px;background:#1d3b2a;color:#fff;font:600 18px/1.2 system-ui,sans-serif;white-space:nowrap}
</style><body><div class="top"><b>Admin back office</b><span>Screenshots &middot; sign-in required on the live site</span></div>${slides}</body>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "og-admin-"));
  const file = path.join(tmp, "index.html");
  fs.writeFileSync(file, html);
  return pathToFileURL(file).href;
})();

export default {
  url: `${SITE}/`,
  target: 32, // plan 35; lowered to the real total with every planned feature in (see compose notes)
  posterFrom: { segment: "marketing", at: 1 },
  pacing: { heroDwell: 1100, featureLead: 250 },

  marketing: {
    async before(h) {
      const { page } = h;
      await revealAll(page);
      // Off camera: step the menu date back and forth once so the on-camera
      // "previous menu" click is served from cache (no skeleton on camera).
      const prev = page.locator('#todays-menu button[aria-label="Previous menu"]').first();
      const next = page.locator('#todays-menu button[aria-label="Next menu"]').first();
      if (await prev.count()) {
        await prev.click(); await page.waitForTimeout(3000);
        await next.click(); await page.waitForTimeout(2500);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(600);
      // The nav anchor is pressed on camera, but the scroll is done by h.glide
      // (the anchor jump and the site's smooth-scroll library fought each other).
      await page.evaluate(() => document.addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest('a[href="#todays-menu"]');
        if (a) { e.preventDefault(); e.stopImmediatePropagation(); }
      }, true));
    },
    async run(h) {
      const { page } = h;
      // Nav anchor -> fast scroll to Today's Menu, dishes in view.
      const nav = page.locator('a[href="#todays-menu"]').first();
      await tap(h, nav, 240);
      await h.glide(page.locator("#todays-menu h2").first(), { offset: 30, ms: 500 });
      await h.wait(250);
      // Quick interaction: step to the previous menu date.
      const prev = page.locator('#todays-menu button[aria-label="Previous menu"]').first();
      if (await prev.count()) {
        await tap(h, prev, 200);
        await h.wait(200);
        await h.waitForStill(600);
      }
      // Privacy: the clip ends on the menu. The sections below it are left out:
      // "Our Story" names the owners, the reviews show real reviewers' names and
      // avatars, and Contact shows the restaurant's real phone/email/address.
      await h.dwell(700);
    },
  },

  features: [
    {
      key: "products-filter",
      title: "Catalogue: labels, Any/All matching, search",
      priority: 1,
      url: `${SITE}/products`,
      async before(h) {
        const { page } = h;
        await page.emulateMedia({ reducedMotion: "reduce" });
        // No layout/fade animation on the cards (they overlapped mid-transition on camera).
        await page.addStyleTag({ content: ".grid > div.h-full{content-visibility:auto;contain-intrinsic-size:auto 330px;transition:none!important;animation:none!important}.grid > div.h-full *{transition:none!important}" });
        // At the locked scrollY a page element sits behind the translucent backdrop-blur
        // header and showed through as a grey smudge: make the header opaque for this take.
        await page.addStyleTag({ content: "header{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:rgb(250,245,234)!important}" });
        await h.waitForStill(2500);
        await h.wait(1200);
        // Frame: the "Labels & filters" panel just under the header, so two rows of cards show.
        await page.evaluate(() => {
          const el = [...document.querySelectorAll("*")].find((e) => e.childElementCount === 0 && e.textContent.trim() === "Labels & filters" && e.getBoundingClientRect().width > 0);
          const box = el && el.closest("aside, div[class*=rounded]");
          const top = (box || el).getBoundingClientRect().top + window.scrollY;
          const y = Math.max(0, top - 96);
          window.scrollTo({ top: y, behavior: "instant" });
          // Every filter change makes the site jump back to the top (scroll reset on
          // the URL update): pin the framing for the rest of the take.
          window.__lockY = y;
          const orig = window.scrollTo.bind(window);
          const pin = () => orig({ top: window.__lockY, behavior: "instant" });
          window.scrollTo = window.scroll = function () { pin(); };
          Element.prototype.scrollIntoView = function () {};
          window.addEventListener("scroll", () => { if (Math.abs(window.scrollY - window.__lockY) > 2) pin(); }, true);
        });
        await h.wait(700);
        await page.mouse.move(700, 420);
      },
      async run(h) {
        const { page } = h;
        await h.beat(200); // For Order tab with today's menu
        await tap(h, page.getByRole("button", { name: "Vegetarian", exact: true }), 180);
        await h.beat(450);
        await tap(h, page.getByRole("tab", { name: "All", exact: true }), 180);
        await h.beat(350);
        await tap(h, page.getByRole("button", { name: "Gluten", exact: true }), 180);
        await h.beat(500);
        await tap(h, page.getByRole("button", { name: "All", exact: true }), 180);
        await h.wait(100); // the press returns once the site's freeze (~0.5 s) is over
        await h.beat(450);
        const search = page.getByPlaceholder("Search...").first();
        await h.hover(search, 200);
        await search.focus();
        await page.keyboard.type("cake", { delay: 35 });
        await h.wait(250);
        await h.beat(600);
      },
    },
    {
      key: "menus-history",
      title: "Previous menus: calendar + dish search",
      priority: 2,
      url: `${SITE}/menus`,
      async before(h) {
        await h.page.emulateMedia({ reducedMotion: "reduce" });
        await revealAll(h.page);
        await h.page.addStyleTag({ content: "main section, main [class*=opacity-0]{opacity:1!important;transform:none!important}" }).catch(() => {});
      },
      async run(h) {
        const { page } = h;
        await h.beat(200);
        // Calendar: the second-to-last served day before the selected one (no hardcoded
        // date), so the sardines search below then jumps to a different day.
        const day = await page.evaluate(() => {
          const btns = [...document.querySelectorAll("table button, [role=grid] button")].filter((b) => /^\d+$/.test(b.innerText.trim()));
          const sel = btns.findIndex((b) => b.getAttribute("aria-selected") === "true" || b.closest("[aria-selected=true]") || /bg-mkt-primary|selected/.test(b.className + (b.parentElement?.className || "")));
          const upto = sel > 0 ? btns.slice(0, sel) : btns;
          const ok = upto.filter((b) => !b.disabled);
          return ok.length ? ok[Math.max(0, ok.length - 2)].innerText.trim() : null;
        });
        if (day) await tap(h, page.locator("table button, [role=grid] button").filter({ hasText: new RegExp(`^${day}$`) }));
        await h.wait(150);
        await h.waitForStill(400);
        await h.beat(300);
        // Dish search: the archive answers with the dates that served it.
        const search = page.getByPlaceholder(/Search by dish/).first();
        await h.hover(search, 220);
        await search.click();
        await search.pressSequentially("sardines", { delay: 35 });
        await h.beat(450);
        await tap(h, page.locator("aside ul li button").first());
        await h.wait(150);
        await h.waitForStill(400);
        await h.beat(200);
        // Down through the day's sections to the found dish, cursor on it.
        const dish = page.locator("main").getByText(/Sardines/).filter({ hasNot: page.locator("input") }).last();
        if (await dish.count()) {
          await h.glide(dish, { offset: 330, ms: 450 });
          await h.hover(dish, 200);
        }
        await h.beat(650);
      },
    },
    {
      key: "dish",
      title: "Dish page: photo, ingredients, allergens",
      priority: 3,
      url: DISH,
      async before(h) {
        const { page } = h;
        // Off camera: let the photo and text settle, park the cursor on the photo so the
        // move to "Ingredients" is visible from the first frame (no static opening hold).
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        await h.waitForStill(2000);
        await page.mouse.move(420, 520);
      },
      async run(h) {
        const { page } = h;
        await h.beat(300);
        const ing = page.locator("h3", { hasText: "Ingredients" });
        if (await ing.count()) await h.hover(ing, 260);
        await h.beat(500);
        const chip = page.getByText("Beef", { exact: true }).first();
        if (await chip.count()) await h.hover(chip, 200);
        await h.beat(400);
        const chip2 = page.getByText("Pork", { exact: true }).first();
        if (await chip2.count()) await h.hover(chip2, 150);
        await h.beat(550);
      },
    },
    {
      key: "admin-backoffice",
      title: "Admin back office (screenshots, login required)",
      priority: 4,
      url: ADMIN_URL,
      async before(h) {
        await h.page.waitForFunction(() => [...document.images].every((i) => i.complete));
        await h.page.mouse.move(-50, -50);
        await h.cursor(false);
      },
      async run(h) {
        const { page } = h;
        await h.wait(1050);
        for (let i = 1; i < ADMIN.length; i++) {
          await page.evaluate((i) => {
            const s = document.querySelectorAll(".s");
            s[i - 1].classList.remove("on");
            s[i].classList.add("on");
          }, i);
          await h.wait(i === ADMIN.length - 1 ? 1350 : 1250);
        }
      },
    },
    {
      // Catalogue top (a fresh screen, not the dish page again), EN/light: straight to
      // the language menu (PT: translated catalogue labels), then dark mode.
      key: "i18n-theme",
      title: "EN/PT switch + dark mode",
      priority: 5,
      url: `${SITE}/products`,
      async before(h) {
        const { page } = h;
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        await h.waitForStill(2000);
        const lang = await inView(page, 'button[aria-label="Language"]');
        const b = await lang.boundingBox();
        if (b) await page.mouse.move(b.x - 40, b.y + 30);
      },
      async run(h) {
        const { page } = h;
        await tap(h, await inView(page, 'button[aria-label="Language"]'), 120);
        await tap(h, page.getByRole("menu").getByText(/Portugu/i), 160);
        await page.waitForLoadState("domcontentloaded").catch(() => {});
        await h.waitForStill(1000);
        await h.beat(500);
        await tap(h, await inView(page, "button.inline-grid.place-items-center"), 220);
        await h.wait(150);
        const dark = page.getByRole("menuitem", { name: /dark|escuro/i });
        if (await dark.count()) await tap(h, dark);
        await h.beat(800);
      },
    },
    {
      // Continues the PT + dark state set by the i18n-theme clip (cookie lang=pt, theme=dark).
      key: "contests",
      title: "Weekly photo contest",
      priority: 6,
      url: `${SITE}/contests`,
      async before(h) {
        const { page } = h;
        await page.context().addCookies([{ name: "lang", value: "pt", url: SITE }]);
        await page.evaluate(() => localStorage.setItem("theme", "dark"));
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
        await h.waitForStill(2500);
        await page.addStyleTag({ content: "[data-reveal],.reveal,[class*=reveal],[style*='opacity']{opacity:1!important;transform:none!important;transition:none!important}" }).catch(() => {});
        await revealAll(page);
        await page.mouse.move(900, 500);
      },
      async run(h) {
        const { page } = h;
        await h.beat(650);
        const agenda = page.locator("h2, h3", { hasText: /agenda/i }).first();
        // Stop with the agenda low in the frame: "This week's photos" (still empty) stays below the fold.
        await h.glide(agenda, { offset: 345, ms: 420 });
        await h.wait(150);
        // Hover a day tile that has photos (the "+N" badge).
        const tile = page.getByText(/^\+\d+$/).first();
        if (await tile.count()) await h.hover(tile, 240);
        await h.beat(650);
      },
    },
  ],
};
