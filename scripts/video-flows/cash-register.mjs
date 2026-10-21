// Live: GitLab Pages static export in demo mode (data in localStorage).
// No landing page: the app opens on the register, so there is no marketing
// segment. The demo admin (Ana L.) signs in during `setup`, off camera.
//
// ONE demo data set for every clip (v3):
// - setup signs in Ana L. (one shift id for every clip) and opens /orders/ once
//   so the three seeded sample orders (demo-ord-001..003) get fixed timestamps.
// - THE filmed sale: Cerveja x2, Sidra, Gin tonico, Bifanas, Batata Fritas =
//   12.90 EUR, paid with +20 EUR, change 7.10 EUR, order id "demo-004"
//   (crypto.randomUUID is pinned so the confirmation, the history card, the
//   details drawer and the shift summary all show the same order).
// - take-order builds that cart on camera; payment starts from the exact same
//   cart (rebuilt off camera); every later clip places that same sale off
//   camera first, so the orders page shows 4 orders / 61.80 EUR and the shift
//   summary shows 1 order / 12.90 EUR.
// - products-admin edits Caipirao (not in the sale), so nothing it changes can
//   leak into another clip's numbers (each clip is its own browser context).
const URL = "https://cash-register-a85839.gitlab.io/";

const ORDER_ID = "demo-004";
const SALE_TOTAL = "12.90";
const SALE_CHANGE = "7.10";

const HISTORY = (page) => page.getByText(/hist[óo]rico de pedidos/i).first();
const product = (page, name) =>
  page.getByRole("button").filter({ has: page.getByText(name, { exact: true }) });

/** Off camera: make the next order id deterministic (needs a reload to apply). */
async function pinOrderId(h) {
  const { page } = h;
  await page.addInitScript((id) => {
    const real = crypto.randomUUID?.bind(crypto);
    let used = false;
    crypto.randomUUID = () => {
      if (!used) {
        used = true;
        return id;
      }
      return real ? real() : `${Date.now()}`;
    };
  }, ORDER_ID);
  await page.reload({ waitUntil: "networkidle" });
}

/** Off camera: exactly the cart take-order ends with (12.90 EUR). */
async function buildCart(h) {
  const { page } = h;
  await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
  await page.getByRole("button", { name: /bebidas/i }).click();
  for (const n of ["Cerveja", "Sidra", "Gin tónico"]) await product(page, n).first().click();
  await page.getByRole("button", { name: /comida/i }).click();
  await h.wait(350);
  for (const n of ["Bifanas", "Batata Fritas"]) await product(page, n).first().click();
  await page.getByRole("button", { name: "Adicionar um Cerveja" }).click();
  // Let the total's count-up and the fly-to-cart tags finish off camera.
  await h.wait(1200);
  await h.waitForStill(2000);
  const ok = await page.getByText(`${SALE_TOTAL}€`).first().isVisible().catch(() => false);
  if (!ok) throw new Error(`cart total is not ${SALE_TOTAL}€: the payment clip would not match take-order`);
}

/** Off camera: ring up THE sale (demo-004) as Ana and come back to the register. */
async function placeSale(h) {
  const { page } = h;
  await page.goto(URL, { waitUntil: "networkidle" });
  await pinOrderId(h);
  await buildCart(h);
  await page.getByRole("button", { name: /confirmar pedido/i }).click();
  await page.getByRole("button", { name: /^\+20€$/ }).click();
  await page.getByRole("button", { name: /confirmar pagamento/i }).click();
  await page.getByRole("button", { name: /novo pedido/i }).click();
  await h.wait(300);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("festa-demo-orders") || "[]"));
  const sale = stored.find((o) => o.id === "demo-004");
  if (!sale || sale.total.toFixed(2) !== "12.90" || stored.length !== 4) {
    throw new Error(`demo data drifted: ${stored.length} orders, demo-004 total ${sale?.total}`);
  }
}

/**
 * A fast on-camera tap for the register: a short 6-step cursor glide and a raw
 * mouse down/up at the element's centre. Fewer browser round trips than
 * h.click, so the take keeps its pace even when the machine is busy.
 */
async function tap(h, locator, { move = 150, pause = 140 } = {}) {
  const { page } = h;
  const el = locator.first();
  await el.waitFor({ state: "visible" });
  const box = await el.boundingBox();
  const from = h.mouse;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await page.waitForTimeout(move / steps);
  }
  await h.moveTo(x, y, 0); // keep h's cursor position in sync (no extra move)
  await page.mouse.down();
  await page.waitForTimeout(50);
  await page.mouse.up();
  if (pause) await page.waitForTimeout(pause);
}

async function openOrders(h) {
  const { page } = h;
  await page.goto(`${URL}orders/`, { waitUntil: "networkidle" });
  await page.getByText(/receita total/i).first().waitFor();
  await page.getByText(`#${ORDER_ID}`).first().waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll("main svg rect, main svg path")]
    .some((r) => r.getBoundingClientRect().width > 20), null, { timeout: 5000 }).catch(() => {});
  await h.wait(900); // count-ups and chart draw-in finish off camera
  await h.waitForStill(2000);
}

/**
 * Continuous take (v4): the same features and order as the v3 clips, joined by
 * using the app on camera. Zero cuts: the payment confirmation and the shift
 * summary both draw in well under half a second, so nothing needs trimming.
 *
 * register (take-order -> payment -> confirmation) --"Novo pedido" + sidebar
 * "Pedidos"--> orders (KPIs/charts -> glide to history -> details drawer ->
 * sort/filter) --sidebar "Produtos"--> products (edit Caipirao) --"Encerrar
 * turno"--> shift summary.
 */
const take = {
  target: 33,
  posterFrom: { feature: "take-order", at: -0.4 },
  async setup(page, ctx) {
    await flowSetup(page, ctx);
    // Unchanged save of Cerveja: puts the products grid in its after-save
    // (alphabetical) order, so the filmed save does not reshuffle the grid.
    await page.goto(`${URL}products/`, { waitUntil: "networkidle" });
    const edit = page.getByRole("button", { name: "Editar Cerveja", exact: true });
    await edit.evaluate((el) => el.click());
    const save = page.getByRole("button", { name: /guardar/i });
    await save.waitFor();
    await save.evaluate((el) => el.click());
    await save.waitFor({ state: "detached" });
    await page.waitForTimeout(500);
  },
  async before(h) {
    const { page } = h;
    // Warm the HTTP cache for every page the take visits (no image pop-in on camera).
    for (const p of ["products/", "orders/"]) {
      await page.goto(`${URL}${p}`, { waitUntil: "networkidle" });
    }
    await page.goto(URL, { waitUntil: "networkidle" });
    await pinOrderId(h); // the filmed sale is demo-004
    await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
    await warmRegister(h);
    await h.moveTo(640, 420, 16);
  },
  route: [
    {
      key: "take-order",
      title: "Taking an order: drinks, search, food, quantity",
      priority: 1,
      // Short hold on 12.90 EUR: payment's tap glides straight to Confirmar pedido.
      run: (h) => takeOrder(h, { beatAfter: 450 }),
    },
    {
      key: "payment",
      title: "Payment: cash, change due",
      priority: 2,
      async run(h) {
        const { page } = h;
        await tap(h, page.getByRole("button", { name: /confirmar pedido/i }), { move: 160, pause: 0 });
        await h.moveTo(680, 436, 150);
        const plus20 = page.getByRole("button", { name: /^\+20€$/ });
        await plus20.waitFor({ state: "visible" });
        await h.wait(80);
        await tap(h, plus20, { move: 60, pause: 0 });
        await page.getByText(`${SALE_CHANGE}€`).first().waitFor();
        await h.beat(900);
      },
    },
    {
      key: "payment-done",
      title: "Payment: confirmation",
      priority: 2,
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: /confirmar pagamento/i }), { pause: 0, move: 220, settle: false });
        await page.getByRole("button", { name: /novo pedido/i }).waitFor({ state: "visible" });
        await page.getByText(`#${ORDER_ID}`).first().waitFor();
        await h.beat(1150);
      },
    },
    {
      key: "orders-dashboard",
      title: "Orders dashboard: KPIs and charts",
      priority: 3,
      async transitionIn(h) {
        const { page } = h;
        await tap(h, page.getByRole("button", { name: /novo pedido/i }), { move: 160, pause: 250 });
        await h.navLink("Pedidos", {
          within: "aside, nav",
          arrive: page.getByText(/receita total/i),
          hold: 0,
          move: 260,
        });
        await page.getByText(`#${ORDER_ID}`).first().waitFor();
      },
      async run(h) {
        const { page } = h;
        await h.moveTo(700, 175, 220); // the KPI row: 61.80 EUR, 4 orders, 15.45 EUR
        await h.beat(700);
        const bar = page.locator("main .recharts-bar-rectangle").first();
        await h.hover(bar, 240);
        await h.beat(800);
        await h.moveTo(1264, 330, 120); // straight right, off the bars (no stray tooltip)
        await h.glide(page.getByText(/receita por categoria/i).first(), { offset: 110, ms: 550 });
        await h.moveTo(1000, 200, 200);
        await h.beat(750);
      },
    },
    {
      key: "order-details",
      title: "Order history: details drawer",
      priority: 4,
      async transitionIn(h) {
        await h.glide(HISTORY(h.page), { offset: 80, ms: 500 });
      },
      async run(h) {
        const { page } = h;
        const card = page.locator("main").getByRole("button").filter({ hasText: `#${ORDER_ID}` }).first();
        await h.click(card, { pause: 120, move: 220 });
        const drawer = page.getByText(/troco/i).last();
        await drawer.waitFor({ state: "visible" });
        await h.hover(page.getByText(/2x Cerveja/i).last(), 220).catch(() => {});
        await h.hover(drawer, 280);
        await h.beat(700);
        // Escape does not close this drawer: close it on camera (Fechar, right under the total).
        const close = page.getByRole("button", { name: /^fechar$/i }).last();
        await h.click(close, { pause: 0, move: 200 });
        await close.waitFor({ state: "hidden" });
        await page.locator(".fixed.inset-0.bg-black\\/50").first().waitFor({ state: "detached", timeout: 3000 }).catch(() => {});
      },
    },
    {
      key: "order-filters",
      title: "Sort and filter the order history",
      priority: 5,
      async transitionIn(h) {
        await h.glide(h.page.locator("main select").first(), { offset: 150, ms: 350 });
      },
      async run(h) {
        const { page } = h;
        const sels = page.locator("main select");
        await h.hover(sels.nth(2), 220);
        await sels.nth(2).selectOption("amount_desc");
        await h.beat(750);
        await h.hover(sels.nth(0), 240);
        await sels.nth(0).selectOption("demo-op-ana");
        await h.beat(450); // Ana's sale registers; the cursor then heads for Produtos
      },
    },
    {
      key: "products-admin",
      title: "Admin: edit a menu item",
      priority: 6,
      async transitionIn(h) {
        const { page } = h;
        await h.navLink("Produtos", {
          within: "aside, nav",
          arrive: page.getByRole("button", { name: "Editar Caipirão", exact: true }),
          hold: 0,
          move: 380,
        });
      },
      async run(h) {
        const { page } = h;
        const edit = page.getByRole("button", { name: "Editar Caipirão", exact: true });
        // Up through the header and down the right gutter: crossing no card means
        // no stray "Editar" hover overlay on the way.
        const box = await edit.boundingBox();
        await h.moveTo(h.mouse.x, 60, 90);
        await h.moveTo(1266, 60, 150);
        await h.moveTo(1266, box.y + box.height / 2, 120);
        await h.beat(250);
        await h.click(edit, { pause: 0, move: 200 });
        const price = page.getByLabel(/pre[çc]o/i).first();
        await price.waitFor({ state: "visible" });
        await h.wait(150);
        await h.click(price, { pause: 0, move: 180 });
        await price.fill("");
        await price.pressSequentially("3.80", { delay: 35 });
        await h.wait(200);
        const save = page.getByRole("button", { name: /guardar/i });
        await h.click(save, { pause: 0, move: 180 });
        const after = await edit.boundingBox();
        await h.moveTo(1266, after.y + after.height / 2, 160);
        await save.waitFor({ state: "detached" });
        await h.beat(650); // highlighted card: Caipirao 3.80 EUR, toast "Produto atualizado"
        await swipeAwayToast(h); // the shift summary must open with a clean heading
      },
    },
    {
      key: "shift-summary",
      title: "End shift: shift summary",
      priority: 7,
      async transitionIn(h) {
        const { page } = h;
        await h.nav(page.getByRole("button", { name: /encerrar turno/i }), {
          arrive: page.getByText(/receita do turno/i),
          hold: 300,
          move: 260,
        });
      },
      async run(h) {
        const { page } = h;
        await h.hover(page.getByText(/receita do turno/i).first(), 220);
        await h.beat(750);
        const rows = page.locator("li").filter({ hasText: /×\d/ });
        await h.hover(rows.last(), 380).catch(() => {});
        await h.beat(700);
      },
    },
  ],
};

/**
 * On camera: flick the sonner toast (top-center, no close button) upward to
 * dismiss it, the app's own swipe gesture. Falls back to waiting it out.
 */
async function swipeAwayToast(h) {
  const { page } = h;
  const toast = page.locator("[data-sonner-toast]").first();
  if (!(await toast.isVisible().catch(() => false))) return;
  const box = await toast.boundingBox();
  if (box) {
    const x = box.x + box.width * 0.62;
    const y = box.y + box.height / 2;
    // Up the right gutter into the header first: crossing no card means no
    // stray "Editar" hover overlay on the way to the toast.
    await h.moveTo(h.mouse.x, y, 110);
    await h.moveTo(x, y, 200);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) {
      await page.mouse.move(x, y - i * 14);
      await page.waitForTimeout(22);
    }
    await page.mouse.up();
    await h.moveTo(x, Math.max(4, y - 84), 0);
  }
  await page.locator("[data-sonner-toast]").first()
    .waitFor({ state: "detached", timeout: 4500 }).catch(() => {});
}

async function flowSetup(page) {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.selectOption("select", "demo-op-ana");
  await page.getByRole("button", { name: /Admin/ }).click();
  await page.getByRole("button", { name: /iniciar turno/i }).click();
  await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
  // Seed the sample history once, so every clip shares the same timestamps.
  await page.goto(`${URL}orders/`, { waitUntil: "networkidle" });
  await page.getByText("#demo-ord-001").first().waitFor();
  await page.waitForLoadState("networkidle").catch(() => {});
}

/** Register: load both category grids' photos off camera, end on Bebidas. */
async function warmRegister(h) {
  const { page } = h;
  const tab = page.getByRole("button", { name: /comida/i });
  if (await tab.count()) {
    await tab.click();
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByRole("button", { name: /bebidas/i }).click();
    await h.wait(400);
  }
}

async function takeOrder(h, { beatAfter = 800 } = {}) {
  const { page } = h;
  await tap(h, product(page, "Cerveja"));
  await tap(h, product(page, "Sidra"));
  await tap(h, page.getByPlaceholder(/Procurar produto/), { pause: 0 });
  await page.keyboard.type("gin", { delay: 30 });
  await h.wait(350);
  await tap(h, product(page, "Gin tónico"), { pause: 250 });
  await tap(h, page.getByRole("button", { name: "Limpar pesquisa" }), { pause: 60 });
  // The tab cross-fade finishes before the next tap (no half-faded grid).
  await tap(h, page.getByRole("button", { name: /comida/i }), { pause: 350 });
  await tap(h, product(page, "Bifanas"));
  await tap(h, product(page, "Batata Fritas"));
  await tap(h, page.getByRole("button", { name: "Adicionar um Cerveja" }), { move: 200, pause: 60 });
  // Quantity both ways: Sidra + then - (net zero, the cart stays 12.90 EUR).
  await tap(h, page.getByRole("button", { name: "Adicionar um Sidra" }), { move: 140, pause: 200 });
  await tap(h, page.getByRole("button", { name: "Remover um Sidra" }), { move: 120, pause: 0 });
  await page.getByText(`${SALE_TOTAL}€`).first().waitFor({ timeout: 4000 }).catch(() => {});
  await h.beat(beatAfter); // the total settles on 12.90 EUR and holds (poster frame)
}

export default {
  take,
  url: URL,
  target: 33, // plan said 40; every planned feature is in and the real total is ~33 s
  pacing: { featureLead: 300 },
  posterFrom: { segment: "take-order", at: -0.4 }, // after the count-up: 12.90 EUR
  setup: flowSetup,
  beforeEach: warmRegister,
  features: [
    {
      key: "take-order",
      title: "Taking an order: drinks, search, food, quantity",
      priority: 1,
      run: (h) => takeOrder(h),
    },
    {
      key: "payment",
      title: "Payment: cash, change due",
      priority: 2,
      async before(h) {
        await pinOrderId(h);
        await buildCart(h);
        // Same view take-order ends on (Comida tab), cursor already near the button.
        await h.hover(h.page.getByRole("button", { name: /confirmar pedido/i }), 16);
      },
      async run(h) {
        const { page } = h;
        await tap(h, page.getByRole("button", { name: /confirmar pedido/i }), { move: 80, pause: 0 });
        // Head for the quick-amount row while the overlay slides in (+20 sits near 685,432).
        await h.moveTo(680, 436, 150);
        const plus20 = page.getByRole("button", { name: /^\+20€$/ });
        await plus20.waitFor({ state: "visible" });
        await h.wait(80);
        await tap(h, plus20, { move: 60, pause: 0 });
        await page.getByText(`${SALE_CHANGE}€`).first().waitFor();
        await h.beat(1000);
        await h.click(page.getByRole("button", { name: /confirmar pagamento/i }), { pause: 120, move: 220 });
      },
    },
    {
      // Starts on the fully drawn confirmation: the loading frames are cut off camera.
      key: "payment-done",
      title: "Payment: confirmation",
      priority: 2,
      async before(h) {
        const { page } = h;
        await pinOrderId(h);
        await buildCart(h);
        await page.getByRole("button", { name: /confirmar pedido/i }).click();
        await page.getByRole("button", { name: /^\+20€$/ }).click();
        const confirm = page.getByRole("button", { name: /confirmar pagamento/i });
        await h.hover(confirm, 16);
        await confirm.click();
        await page.getByRole("button", { name: /novo pedido/i }).waitFor({ state: "visible" });
        await page.getByText(`#${ORDER_ID}`).first().waitFor();
        await h.wait(900);
      },
      async run(h) {
        await h.beat(1100);
      },
    },
    {
      key: "orders-dashboard",
      title: "Orders dashboard: KPIs and charts",
      priority: 3,
      url: `${URL}orders/`,
      async before(h) {
        await placeSale(h);
        await openOrders(h);
        await h.moveTo(700, 175, 16); // on the KPI row, away from the charts' tooltips
      },
      async run(h) {
        const { page } = h;
        await h.beat(800); // KPI row: 61.80 EUR, 4 orders, 15.45 EUR
        // Tooltip on the top bar (Cerveja) of "Mais vendidos".
        const bar = page.locator("main .recharts-bar-rectangle").first();
        await h.hover(bar, 260);
        await h.beat(900);
        // One glide down: category split, revenue per operator, history header.
        await h.moveTo(1264, 330, 120); // straight right, off the bars (no stray tooltip)
        await h.glide(page.getByText(/receita por categoria/i).first(), { offset: 110, ms: 550 });
        await h.moveTo(1000, 200, 220);
        await h.beat(1000);
      },
    },
    {
      key: "order-details",
      title: "Order history: details drawer",
      priority: 4,
      url: `${URL}orders/`,
      async before(h) {
        await placeSale(h);
        await openOrders(h);
        await h.jump(HISTORY(h.page), { offset: 80 });
        await h.moveTo(640, 300, 16);
      },
      async run(h) {
        const { page } = h;
        const card = page.locator("main").getByRole("button").filter({ hasText: `#${ORDER_ID}` }).first();
        await h.click(card, { pause: 120, move: 220 });
        const drawer = page.getByText(/troco/i).last();
        await drawer.waitFor({ state: "visible" });
        // Sweep down the line items to the total and change.
        await h.hover(page.getByText(/2x Cerveja/i).last(), 220).catch(() => {});
        await h.hover(drawer, 280);
        await h.beat(700);
        await page.keyboard.press("Escape");
        await h.wait(120);
      },
    },
    {
      key: "order-filters",
      title: "Sort and filter the order history",
      priority: 5,
      url: `${URL}orders/`,
      async before(h) {
        await placeSale(h);
        await openOrders(h);
        await h.jump(h.page.locator("main select").first(), { offset: 150 });
        await h.moveTo(900, 320, 16);
      },
      async run(h) {
        const { page } = h;
        const sels = page.locator("main select");
        // Sort first, while all 4 orders are listed: the cards visibly reorder.
        await h.hover(sels.nth(2), 220);
        await sels.nth(2).selectOption("amount_desc");
        await h.beat(1000);
        // Then filter by operator: the list collapses to Ana's sale.
        await h.hover(sels.nth(0), 260);
        await sels.nth(0).selectOption("demo-op-ana");
        await h.beat(900);
      },
    },
    {
      key: "products-admin",
      title: "Admin: edit a menu item",
      priority: 6,
      url: `${URL}products/`,
      async before(h) {
        const { page } = h;
        await page.getByRole("button", { name: "Editar Cerveja", exact: true }).waitFor();
        await page.waitForLoadState("networkidle").catch(() => {});
        // Off camera: an unchanged save of Cerveja puts the grid in its after-save
        // (alphabetical) order, so the filmed save does not reshuffle the grid.
        await page.getByRole("button", { name: "Editar Cerveja", exact: true }).evaluate((el) => el.click());
        await page.getByRole("button", { name: /guardar/i }).waitFor();
        await page.getByRole("button", { name: /guardar/i }).evaluate((el) => el.click());
        await page.getByRole("button", { name: /guardar/i }).waitFor({ state: "detached" });
        await h.wait(1300); // saved highlight gone
        await page.waitForFunction(() => !document.querySelector("[data-sonner-toast]"), null, { timeout: 8000 }).catch(() => {});
        await h.waitForStill(2000);
        // Park the cursor in the right gutter at Caipirao's row, so the glide
        // to its card crosses no other card (no stray "Editar" hover).
        const box = await page.getByRole("button", { name: "Editar Caipirão", exact: true }).boundingBox();
        await h.moveTo(1266, box.y + box.height / 2, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(700);
        const edit = page.getByRole("button", { name: "Editar Caipirão", exact: true });
        await h.click(edit, { pause: 0, move: 200 });
        const price = page.getByLabel(/pre[çc]o/i).first();
        await price.waitFor({ state: "visible" });
        await h.wait(150);
        await h.click(price, { pause: 0, move: 180 });
        await price.fill("");
        await price.pressSequentially("3.80", { delay: 35 });
        await h.wait(200);
        const save = page.getByRole("button", { name: /guardar/i });
        await h.click(save, { pause: 0, move: 180 });
        // Out to the right gutter beside the edited card: hovering the card
        // itself would cover its new price with the "Editar" overlay.
        const box = await edit.boundingBox();
        await h.moveTo(1266, box.y + box.height / 2, 160);
        await save.waitFor({ state: "detached" });
        await h.beat(400); // highlighted card: Caipirao 3.80 EUR, toast "Produto atualizado"
        await h.hover(page.getByRole("button", { name: /encerrar turno/i }), 240);
        await h.wait(150);
      },
    },
    {
      // The Encerrar Turno click (and its spinner) is off camera: the clip opens
      // on the fully drawn summary. products-admin ends hovering that button.
      key: "shift-summary",
      title: "End shift: shift summary",
      priority: 7,
      url: `${URL}products/`,
      async before(h) {
        const { page } = h;
        await placeSale(h);
        await page.goto(`${URL}products/`, { waitUntil: "networkidle" });
        const end = page.getByRole("button", { name: /encerrar turno/i });
        await end.waitFor();
        await h.hover(end, 16);
        await end.click();
        await page.getByText(/receita do turno/i).first().waitFor();
        await h.wait(1200);
        await h.waitForStill(2500);
        const ok = await page.getByText(`${SALE_TOTAL}€`).first().isVisible().catch(() => false);
        if (!ok) throw new Error(`shift summary revenue is not ${SALE_TOTAL}€`);
      },
      async run(h) {
        const { page } = h;
        await h.hover(page.getByText(/receita do turno/i).first(), 220);
        await h.beat(750);
        // One glide down the top-items list, to its last row.
        const rows = page.locator("li").filter({ hasText: /×\d/ });
        await h.hover(rows.last(), 380).catch(() => {});
        await h.beat(650);
      },
    },
  ],
};
