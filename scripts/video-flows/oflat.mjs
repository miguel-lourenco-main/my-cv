// Live: GitLab Pages build of OFLAT (OCamlFlat via js_of_ocaml), no local repo.
// Short hero (editor + sidebar, cursor gliding down to the examples) -> a
// predefined DFA -> the Turing machine example this project added ->
// step-by-step acceptance of "aaaa" on the tape, ending on the green ACC state.
//
// Presentation-only tweaks, none changes what the app computes:
//  - The app lays graphs out randomly and squashed. The graph is hidden while an
//    example loads, its nodes are placed in a readable arrangement (a user could
//    drag them there too) and it fades in, so the squashed layout is never shown.
//  - The sidebar's hover tooltips (CSS .tooltiptext boxes) are hidden: they covered
//    the step controls while the cursor rested on a button.
//  - The algorithm toolbar's gaps are tightened so "Clean Automaton" no longer
//    presses against the card edge.
//  - "Start" asks for the word with a native prompt(), which headless recordings
//    never show; the flow answers it and the tape line the app draws shows the word.
const WORD = "aaaa";

const LAYOUTS = {
  dfa_1: { transparent: [-150, 0], START: [0, 0], A: [230, 0], B: [460, 0], C: [345, 190] },
  tm_even_as: { transparent: [-150, 0], Q0: [0, 0], Q1: [300, 0], ACC: [0, 210], REJ: [300, 210] },
};

const STYLE = `
  .tooltiptext { display: none !important; }
  #buttonBox { gap: 4px !important; }
  #cy { transition: opacity .28s ease; }
  body.__rec_hidecy #cy { opacity: 0 !important; transition: opacity .15s ease; }
`;

const hideGraph = (page, hide) =>
  page.evaluate((hide) => document.body.classList.toggle("__rec_hidecy", hide), hide);

/** Place the nodes at once (graph hidden), fit, then fade the graph in. */
async function place(page, layout, padding) {
  await page.waitForFunction(
    (ids) => {
      const cy = document.querySelector("#cy")?._cyreg?.cy;
      return cy && ids.every((id) => cy.getElementById(id).nonempty());
    },
    Object.keys(layout).filter((k) => k !== "transparent"),
    { timeout: 5000 }
  );
  await page.evaluate(
    ({ layout, padding }) => {
      const cy = document.querySelector("#cy")._cyreg.cy;
      const locked = cy.nodes().filter((n) => n.locked());
      locked.unlock();
      for (const [id, [x, y]] of Object.entries(layout)) {
        const n = cy.getElementById(id);
        if (n.nonempty()) n.position({ x, y });
      }
      locked.lock();
      cy.resize();
      cy.fit(cy.elements(), padding);
    },
    { layout, padding }
  );
  await page.waitForTimeout(120);
  await hideGraph(page, false);
  await page.waitForTimeout(300);
}

/** Cursor onto the control, then hide the graph and click: hidden only while it reloads. */
async function load(h, locator, move) {
  await h.hover(locator, move);
  await h.wait(120);
  await hideGraph(h.page, true);
  await h.page.waitForTimeout(150);
  await locator.first().click({ delay: 60 });
}

/** A caption pill over the bottom of the graph area (recorder narration, not app UI). */
const caption = (page, text) =>
  page.evaluate((text) => {
    let c = document.getElementById("__rec_caption");
    if (!c) {
      c = document.createElement("div");
      c.id = "__rec_caption";
      c.style.cssText =
        "position:fixed;left:760px;bottom:96px;transform:translateX(-50%);padding:10px 20px;border-radius:999px;" +
        "background:rgba(15,23,42,.88);color:#fff;font:600 18px/1.3 system-ui,sans-serif;letter-spacing:.01em;" +
        "box-shadow:0 6px 24px rgba(0,0,0,.25);z-index:2147483646;pointer-events:none;transition:opacity .25s;opacity:0";
      document.body.appendChild(c);
    }
    c.textContent = text;
    c.style.opacity = text ? "1" : "0";
  }, text);

export default {
  url: "https://oflat-ocamlflat-pages-d4fe77.gitlab.io/",
  // The opening is an empty editor: keep it short and move into the examples.
  pacing: { heroDwell: 1500 },
  posterAt: -1.5,
  async run(h) {
    const { page } = h;
    page.on("dialog", async (d) => {
      if (d.type() === "prompt") await d.accept(WORD);
      else await d.accept();
    });
    await page.addStyleTag({ content: STYLE });
    const example = (name) => page.locator("#exampleButton", { hasText: new RegExp(`^${name}$`) });

    // The cursor heads down the sidebar's tools to the predefined examples.
    await h.hover(page.locator("#testing"), 450);

    // A finite automaton from the predefined examples.
    await load(h, example("dfa_1"), 550);
    await place(page, LAYOUTS.dfa_1, 70);
    await h.moveTo(700, 640, 600);
    await h.dwell(2200);

    // The Turing machine support this project added.
    // The examples list is a 115 px inner scroller; paced steps there would crawl
    // for seconds, so glide it once.
    await h.hover(example("dfa_1"), 600);
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          const s = document.querySelector("#examplesServer");
          const el = [...s.querySelectorAll("#exampleButton")].find((b) => b.textContent.trim() === "tm_astar");
          const to = el.offsetTop - s.offsetTop - 6;
          const from = s.scrollTop;
          const t0 = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - t0) / 900);
            s.scrollTop = from + (to - from) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
            if (t < 1) requestAnimationFrame(step);
            else resolve();
          };
          requestAnimationFrame(step);
        })
    );
    await h.wait(400);
    await load(h, example("tm_even_as"), 350);
    await place(page, LAYOUTS.tm_even_as, 55);
    await h.moveTo(700, 660, 600);
    await h.dwell(2000);

    // Step through the acceptance on the tape. Start adds the tape line above the
    // graph and shrinks the canvas; the graph is re-fitted at nearly the same scale.
    await h.hover(page.locator("#start"), 550);
    await h.wait(120);
    // Click and re-fit in one task (the prompt is answered by the dialog handler
    // meanwhile), so no frame shows the graph clipped under the new tape line.
    await page.evaluate((padding) => {
      document.querySelector("#start").click();
      const cy = document.querySelector("#cy")._cyreg.cy;
      cy.resize();
      cy.fit(cy.elements(), padding);
    }, 30);
    await h.moveTo(340, 470, 350);
    await caption(page, `Step-by-step: "${WORD}"`);
    await h.wait(1100);
    for (let i = 0; i < WORD.length + 1; i++) {
      await h.click(page.locator("#forward"), { pause: 0, move: i ? 300 : 450 });
      await h.moveTo(340, 470, 300);
      await h.wait(950);
    }
    await caption(page, "");
    // End on the accepting state.
    const acc = await page.evaluate(() => {
      const cy = document.querySelector("#cy")?._cyreg?.cy;
      const n = cy?.getElementById("ACC");
      if (!n || n.empty()) return null;
      const r = document.querySelector("#cy").getBoundingClientRect();
      const p = n.renderedPosition();
      return { x: r.left + p.x + 60, y: r.top + p.y - 10 };
    });
    if (acc) await h.moveTo(acc.x, acc.y, 700);
    await h.wait(2200);
  },
};
