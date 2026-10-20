// Live: GitLab Pages static export in demo mode (data in localStorage).
// The demo operator signs in during `prepare`, off camera.
const URL = "https://cash-register-a85839.gitlab.io/";

export default {
  url: URL,
  posterAt: 2,
  async prepare(page) {
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.selectOption("select", "demo-op-carlos");
    await page.getByRole("button", { name: /Vendedores/ }).click();
    await page.getByRole("button", { name: /iniciar turno/i }).click();
    await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
    // Warm the orders route (client-side) so the on-camera visit does not
    // record a blank page while its chunk loads.
    await page.getByRole("link", { name: /pedidos/i }).first().click();
    await page.waitForURL(/\/orders\/?$/);
    await page.getByText(/receita total/i).first().waitFor();
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.getByRole("link", { name: /caixa/i }).first().click();
    await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();
    // Load the food images too, so the Comida tab does not pop in on camera.
    await page.getByRole("button", { name: /comida/i }).click();
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: /bebidas/i }).click();
    await page.waitForTimeout(400);
  },
  async run(h) {
    const { page } = h;
    const product = (name) =>
      page.getByRole("button").filter({ has: page.getByText(name, { exact: true }) });
    const fast = { pause: 280, move: 380 };
    await page.getByRole("button", { name: /confirmar pedido/i }).waitFor();

    // Drinks: ~1.1 s per click.
    await h.click(product("Cerveja"), fast);
    await h.click(product("Cerveja"), fast);
    await h.click(product("Sidra"), { pause: 400, move: 380 });

    // Search while Bebidas is still the active tab, so tab and results match.
    const search = page.getByPlaceholder(/Procurar produto/);
    await h.click(search, { pause: 0, move: 400 });
    const sb = await search.boundingBox();
    // Park the cursor on the grid, clear of the input, before typing.
    await h.moveTo(sb.x + sb.width * 0.35, sb.y + 170, 300);
    await search.pressSequentially("gin", { delay: 95 });
    await h.wait(350);
    await h.click(product("Gin tónico"), { pause: 400, move: 400 });
    // Clear the filter so the grid is full again.
    await h.click(page.getByRole("button", { name: "Limpar pesquisa" }), { pause: 250, move: 400 });

    // Food.
    await h.click(page.getByRole("button", { name: /comida/i }), { pause: 450, move: 400 });
    await h.click(product("Bifanas"), fast);
    await h.click(product("Batata Fritas"), { pause: 400, move: 380 });

    // Quantity stepper in the cart: one more Sidra, then back.
    await h.click(page.getByRole("button", { name: "Adicionar um Sidra" }), { pause: 550, move: 500 });
    await h.click(page.getByRole("button", { name: "Remover um Sidra" }), { pause: 550, move: 350 });

    // Payment.
    await h.click(page.getByRole("button", { name: /confirmar pedido/i }), { pause: 0, move: 450 });
    const plus20 = page.getByRole("button", { name: /^\+20€$/ });
    await plus20.waitFor({ state: "visible" });
    await h.click(plus20, { pause: 1500, move: 550 }); // hold the 7.10 EUR change
    await h.click(page.getByRole("button", { name: /confirmar pagamento/i }), { pause: 0, move: 400 });
    const novo = page.getByRole("button", { name: /novo pedido/i });
    await novo.waitFor({ state: "visible" });
    await h.wait(1700); // Pedido confirmado overlay
    await h.click(novo, { pause: 50, move: 350 });

    // Orders dashboard: wait for KPI cards and charts before the dwell.
    await h.click(page.getByRole("link", { name: /pedidos/i }).first(), { pause: 0, move: 350, navDwell: 0 });
    await page.waitForURL(/\/orders\/?$/);
    await page.getByText(/receita total/i).first().waitFor();
    await page
      .waitForFunction(() => {
        const rects = [...document.querySelectorAll("main svg rect, main svg path")];
        return rects.some((r) => r.getBoundingClientRect().width > 20);
      }, null, { timeout: 5000 })
      .catch(() => {});
    await h.wait(600);
    await h.moveTo(640, 760, 400); // cursor out of the way
    await h.dwell(2300);

    // Order history -> details drawer.
    await h.click(page.locator("main").getByRole("button").filter({ hasText: /€/ }).first(), { pause: 700, move: 450 });
    const vw = h.viewport;
    await h.moveTo(vw.width - 250, vw.height - 190, 500); // into the drawer, above TOTAL
    await h.dwell(3500);
  },
};
