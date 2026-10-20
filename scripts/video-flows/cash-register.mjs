// Live: GitLab Pages static export in demo mode (data in localStorage).
// MIGRATED MECHANICALLY to the segment shape; the recorder for this project
// should re-check each feature's opening state and timing. No landing page:
// the app opens on the register, so there is no marketing segment.
// The demo admin (Ana L.) signs in during `setup`, off camera.
const URL = "https://cash-register-a85839.gitlab.io/";

const HISTORY = (page) => page.getByText(/hist[óo]rico de pedidos/i).first();
const product = (page, name) =>
  page.getByRole("button").filter({ has: page.getByText(name, { exact: true }) });

/** Off camera: put a few items in the cart (for features that start mid-order). */
async function fillCart(h) {
  const { page } = h;
  await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
  for (const n of ["Cerveja", "Cerveja", "Sidra"]) await product(page, n).first().click();
  await page.getByRole("button", { name: /comida/i }).click();
  for (const n of ["Bifanas", "Batata Fritas"]) await product(page, n).first().click();
  await h.wait(300);
}

/** Off camera: ring up one sale as the signed-in operator, back on the register. */
async function placeSale(h) {
  const { page } = h;
  await page.goto(URL, { waitUntil: "networkidle" });
  await fillCart(h);
  await page.getByRole("button", { name: /confirmar pedido/i }).click();
  await page.getByRole("button", { name: /^\+20€$/ }).click();
  await page.getByRole("button", { name: /confirmar pagamento/i }).click();
  await page.getByRole("button", { name: /novo pedido/i }).click();
  await h.wait(400);
}

/** Off camera: set Sidra to 1.80 through the admin form (same state the products-admin clip leaves). */
async function editSidra(h) {
  const { page } = h;
  await page.goto(`${URL}products/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Editar Sidra", exact: true }).evaluate((el) => el.click());
  const price = page.getByLabel(/pre[çc]o/i).first();
  await price.waitFor({ state: "visible" });
  await price.click();
  await price.fill("");
  await price.pressSequentially("1.80", { delay: 20 });
  await h.wait(350);
  await page.getByRole("button", { name: /guardar/i }).evaluate((el) => el.click());
  await h.wait(500);
}

export default {
  url: URL,
  target: 40,
  posterFrom: { segment: "take-order", at: 2 },
  async setup(page) {
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.selectOption("select", "demo-op-ana");
    await page.getByRole("button", { name: /Admin/ }).click();
    await page.getByRole("button", { name: /iniciar turno/i }).click();
    await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
    await page.waitForLoadState("networkidle").catch(() => {});
  },
  async beforeEach(h) {
    const { page } = h;
    const tab = page.getByRole("button", { name: /comida/i });
    if (await tab.count()) {
      await tab.click();
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.getByRole("button", { name: /bebidas/i }).click();
      await h.wait(300);
    }
  },
  features: [
    {
      key: "take-order",
      title: "Taking an order: drinks, search, food, quantity",
      priority: 1,
      async run(h) {
        const { page } = h;
        const fast = { pause: 280, move: 260 };
        await h.click(product(page, "Cerveja"), fast);
        await h.click(product(page, "Cerveja"), fast);
        await h.click(product(page, "Sidra"), fast);
        await h.click(page.getByPlaceholder(/Procurar produto/), { pause: 0, move: 220 });
        await page.getByPlaceholder(/Procurar produto/).pressSequentially("gin", { delay: 30 });
        await h.wait(150);
        await h.click(product(page, "Gin tónico"), fast);
        await h.click(page.getByRole("button", { name: "Limpar pesquisa" }), fast);
        await h.click(page.getByRole("button", { name: /comida/i }), fast);
        await h.click(product(page, "Bifanas"), fast);
        await h.click(product(page, "Batata Fritas"), fast);
        await h.click(page.getByRole("button", { name: "Adicionar um Sidra" }), { pause: 500, move: 220 });
        await h.beat(700);
      },
    },
    {
      key: "payment",
      title: "Payment: cash, change due",
      priority: 2,
      before: fillCart,
      async run(h) {
        const { page } = h;
        await h.click(page.getByRole("button", { name: /confirmar pedido/i }), { pause: 0, move: 220 });
        const plus20 = page.getByRole("button", { name: /^\+20€$/ });
        await plus20.waitFor({ state: "visible" });
        await h.click(plus20, { pause: 950, move: 220 });
        await h.click(page.getByRole("button", { name: /confirmar pagamento/i }), { pause: 0, move: 220 });
      },
    },
    {
      // Starts on the fully drawn confirmation: the loading frames are cut off camera.
      key: "payment-done",
      title: "Payment: confirmation",
      priority: 2,
      async before(h) {
        const { page } = h;
        await fillCart(h);
        await page.getByRole("button", { name: /confirmar pedido/i }).click();
        await page.getByRole("button", { name: /^\+20€$/ }).click();
        await page.getByRole("button", { name: /confirmar pagamento/i }).click();
        await page.getByRole("button", { name: /novo pedido/i }).waitFor({ state: "visible" });
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
        const { page } = h;
        await placeSale(h);
        await page.goto(`${URL}orders/`, { waitUntil: "networkidle" });
        await page.getByText(/receita total/i).first().waitFor();
        await page.waitForFunction(() => [...document.querySelectorAll("main svg rect, main svg path")]
          .some((r) => r.getBoundingClientRect().width > 20), null, { timeout: 5000 }).catch(() => {});
        await h.moveTo(640, 400, 16);
      },
      async run(h) {
        const { page } = h;
        await h.beat(1700);
        await h.glide(page.locator("main").getByText("Bifanas", { exact: true }).first(), { offset: 250, ms: 550 });
        await h.beat(900);
        await h.glide(page.locator("main").getByText("Bebidas", { exact: true }).first(), { offset: 250, ms: 550 });
        await h.beat(900);
        await h.glide(HISTORY(page), { offset: 80, ms: 600 });
      },
    },
    {
      key: "order-details",
      title: "Order history -> details drawer",
      priority: 4,
      url: `${URL}orders/`,
      async before(h) {
        await placeSale(h);
        await h.page.goto(`${URL}orders/`, { waitUntil: "networkidle" });
        await h.page.getByText(/receita total/i).first().waitFor();
        await h.jump(HISTORY(h.page), { offset: 80 });
      },
      async run(h) {
        const { page } = h;
        await h.click(page.locator("main").getByRole("button").filter({ hasText: /€/ }).first(), { pause: 300, move: 220 });
        await h.moveTo(h.viewport.width - 250, h.viewport.height - 190, 250);
        await h.beat(1300);
        await page.keyboard.press("Escape");
        await h.wait(250);
      },
    },
    {
      key: "order-filters",
      title: "Filter and sort the order history",
      priority: 5,
      url: `${URL}orders/`,
      async before(h) {
        await h.page.getByText(/receita total/i).first().waitFor();
        await h.page.getByText("Filtrar por operador").scrollIntoViewIfNeeded();
        await h.glide(h.page.getByText("Filtrar por operador"), { offset: 120 }).catch(() => {});
        await h.jump(h.page.getByText("Filtrar por operador"), { offset: 120 });
      },
      async run(h) {
        const { page } = h;
        const sels = page.locator("main select");
        await h.hover(sels.nth(0), 250);
        await sels.nth(0).selectOption("demo-op-maria");
        await h.beat(600);
        await h.hover(sels.nth(2), 250);
        await sels.nth(2).selectOption("amount_desc");
        await h.beat(1500);
      },
    },
    {
      key: "products-admin",
      title: "Admin: edit a menu item",
      priority: 6,
      url: `${URL}products/`,
      async before(h) {
        await h.page.getByRole("button", { name: "Editar Cerveja", exact: true }).waitFor();
        await h.page.waitForLoadState("networkidle").catch(() => {});
      },
      async run(h) {
        const { page } = h;
        await h.beat(900);
        await h.click(page.getByRole("button", { name: "Editar Sidra", exact: true }), { pause: 0, move: 200 });
        const price = page.getByLabel(/pre[çc]o/i).first();
        await price.waitFor({ state: "visible" });
        await price.click();
        await price.fill("");
        await price.pressSequentially("1.80", { delay: 40 });
        await h.wait(350);
        const save = page.getByRole("button", { name: /guardar/i });
        await h.hover(save, 180);
        await save.evaluate((el) => el.click());
        await h.beat(900);
        await h.glide(page.getByRole("button", { name: "Editar Sidra", exact: true }), { offset: 300, ms: 300 }).catch(() => {});
        await h.hover(page.getByRole("button", { name: /encerrar turno/i }), 250);
      },
    },
    {
      key: "shift-summary",
      title: "End shift: shift summary",
      priority: 7,
      url: `${URL}products/`,
      async before(h) {
        // Off camera: same state products-admin leaves (Sidra 1.80) plus one sale.
        const { page } = h;
        await editSidra(h);
        await placeSale(h);
        await page.goto(`${URL}products/`, { waitUntil: "networkidle" });
        await page.getByRole("button", { name: /encerrar turno/i }).waitFor();
        await h.moveTo(h.viewport.width - 200, 40, 10);
      },
      async run(h) {
        const { page } = h;
        const end = page.getByRole("button", { name: /encerrar turno/i });
        await h.hover(end, 180);
        await end.evaluate((el) => el.click());
        await page.getByText(/receita do turno/i).first().waitFor();
        await h.beat(1700);
      },
    },
  ],
};
