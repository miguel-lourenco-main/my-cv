// Live: GitLab Pages build of OFLAT (OCamlFlat via js_of_ocaml), no local repo.
// No landing page (the app opens on the editor), so there is no marketing segment;
// the first ~0.7 s of the first clip is the "hero" (editor + machine loaded).
// Fast cut: every feature is its own clip, composed by priority.
//   1 turing-machine  step-by-step: "aa" accepted, "aaa" rejected
//   2 dfa             "Testar palavra": one accepted and one rejected word, verdict held
//   3 regex           regular expression -> automaton (appears in a second box)
//   4 determinize     NFA -> DFA appears in a second box next to the first
//   5 state-analysis  useful states painted, then "Clean" removes the useless ones
//   6 generate-words  all accepted words up to length 3
//   7 dark-theme      theme switch on the same dfa_2 screen (first to go when over the band)
// determinize is not in the v2 plan's list; it is ranked after regex (p4) because it is
// a real computation beat, and the cosmetic beats stay last.
// The live build fails to register the dagre layout (its CDN request for
// cytoscape-dagre is blocked), which breaks every regex example. beforeEach loads
// the same plugin from a working CDN so the regex models lay out; nothing else changes.
// determinize, state-analysis and generate-words start single-pane: the second box
// opens on camera with its result. While the app computes and the boxes re-flow, the
// last frame is held (screenshot overlay), so no empty or half-laid-out pane is filmed.
// The recorder cursor is hidden during holds (rest()) so it never sits on the canvas
// looking like an extra graph node.
//
// Presentation-only tweaks, none changes what the app computes:
//  - The app lays graphs out randomly and squashed. The graph is hidden while an
//    example loads, its nodes are placed in a readable arrangement (a user could
//    drag them there too) and it fades in.
//  - Hover tooltips (CSS .tooltiptext) are hidden; they covered the controls.
//  - With two boxes open the app's row is wider than the window; the boxes are
//    made to share the width so both are visible.
//  - The tape readout (#regExp) is drawn larger so the head position reads at CV size;
//    its box grows to fit (the app gives it a fixed 6.5% height with scrollbars).
//  - The app's own step timers (word test, ~1 s per step) run 2.5x faster.
//  - Prompts (word, length) are answered by the dialog handler, since headless
//    recordings never show native prompts.
let answer = "aa";

let dagreSrc;
const getDagre = async () =>
  (dagreSrc ??= await (await fetch("https://cdn.jsdelivr.net/npm/cytoscape-dagre@2.5.0/cytoscape-dagre.js")).text());

const LAYOUTS = {
  dfa_1: { transparent: [-150, 0], START: [0, 0], A: [230, 0], B: [460, 0], C: [345, 190] },
  tm_even_as: { transparent: [-150, 0], Q0: [0, 0], Q1: [300, 0], ACC: [0, 210], REJ: [300, 210] },
  nfa_1: { transparent: [-120, 60], START: [0, 60], A: [220, 60], B: [110, -100] },
  dfa_2: { transparent: [-130, 0], START: [0, 0], 1: [320, 0], 2: [320, 200], 3: [0, 200] },
  nfa_2: { transparent: [-90, 100], START: [0, 100], A: [120, 100], AB: [240, 100], SUCCESS: [360, 100], UNREACHABLE: [360, -40], UNPRODUCTIVE: [360, 240] },
  nfa_1_det: { transparent: [-80, 50], START: [0, 50], A: [140, 50], B_START: [280, -50], START_A: [280, 150] },
};

const STYLE = `
  .tooltiptext, .tooltiptext3 { display: none !important; }
  body.__rec_two #cy, body.__rec_two #cy2 { height: 420px !important; }
  /* Single pane: the finite-automaton toolbar wraps to two lines, which pushed the stats
     line under the graph past the bottom of the pane. A shorter graph box keeps it whole
     and above the caption pill. */
  body:not(.__rec_two) #cy { height: 405px !important; }
  #infoBox { height: auto !important; overflow: visible !important; }
  #buttonBox { gap: 4px !important; }
  body.__rec_two .test { width: 100% !important; min-width: 0 !important; }
  body.__rec_two .test > * { min-width: 0 !important; flex: 1 1 0 !important; }
  body.__rec_two #buttonBox button { padding: 4px 6px !important; font-size: 12px !important; min-height: 0 !important; }
  body.__rec_two #textarea { font-size: 26px !important; line-height: 1.7 !important; }
  #cy, #cy2 { transition: opacity .28s ease; }
  #regExp { font: 700 30px/1.4 ui-monospace, Menlo, Consolas, monospace !important; letter-spacing: .14em; color: #1e3a8a;
    height: auto !important; min-height: 48px; overflow: visible !important; padding: 4px 0 6px; margin-top: 4px; white-space: nowrap; }
  body.__rec_hidecy #cy, body.__rec_hidecy #cy2 { opacity: 0 !important; transition: opacity .15s ease; }
`;

const hideGraph = (page, hide) =>
  page.evaluate((hide) => document.body.classList.toggle("__rec_hidecy", hide), hide);

/** Place the nodes at once (graph hidden), fit, then fade the graph in. */
async function place(page, layout, padding, cyId = "cy", reveal = true) {
  await page.waitForFunction(
    ({ ids, cyId }) => {
      const cy = document.getElementById(cyId)?._cyreg?.cy;
      return cy && ids.every((id) => cy.getElementById(id).nonempty());
    },
    { ids: Object.keys(layout).filter((k) => k !== "transparent"), cyId },
    { timeout: 5000 }
  );
  await page.evaluate(
    ({ layout, padding, cyId }) => {
      const cy = document.getElementById(cyId)._cyreg.cy;
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
    { layout, padding, cyId }
  );
  if (!reveal) return;
  await page.waitForTimeout(100);
  await hideGraph(page, false);
  await page.waitForTimeout(250);
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
        "position:fixed;left:760px;bottom:60px;transform:translateX(-50%);padding:10px 20px;border-radius:999px;" +
        "background:rgba(15,23,42,.88);color:#fff;font:600 18px/1.3 system-ui,sans-serif;letter-spacing:.01em;" +
        "box-shadow:0 6px 24px rgba(0,0,0,.25);z-index:2147483646;pointer-events:none;transition:opacity .25s;opacity:0";
      document.body.appendChild(c);
    }
    c.textContent = text;
    c.style.opacity = text ? "1" : "0";
  }, text);

/** The examples list is a 115 px inner scroller: glide it so `name` is at its top. */
const scrollExamples = (page, name, ms) =>
  page.evaluate(({ name, ms }) =>
    new Promise((resolve) => {
      const s = document.querySelector("#examplesServer");
      const el = [...s.querySelectorAll("#exampleButton")].find((b) => b.textContent.trim() === name);
      const to = el.offsetTop - s.offsetTop - 6;
      const from = s.scrollTop;
      if (!ms) { s.scrollTop = to; return resolve(); }
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        s.scrollTop = from + (to - from) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    }), { name, ms });

const example = (page, name) => page.locator("#exampleButton", { hasText: new RegExp(`^${name}$`) });

/** Off camera (before()): open the example and lay it out, so the clip opens on a ready model. */
async function preload(h, name, layout, pad) {
  await scrollExamples(h.page, name, 0);
  await load(h, example(h.page, name), 0);
  await place(h.page, layout, pad);
  await h.moveTo(150, 300, 16);
}

/** Hide the recorder cursor for a hold (it reads as a grey node on the canvas). */
const rest = (h) => h.cursor(false);

const reveal = async (page) => {
  await page.waitForTimeout(100);
  await hideGraph(page, false);
  await page.waitForTimeout(250);
};

const accNode = (page) =>
  page.evaluate(() => {
    const cy = document.querySelector("#cy")?._cyreg?.cy;
    const n = cy?.getElementById("ACC");
    if (!n || n.empty()) return null;
    const r = document.querySelector("#cy").getBoundingClientRect();
    const p = n.renderedPosition();
    return { x: r.left + p.x + 60, y: r.top + p.y - 10 };
  });

const unscroll = (page) =>
  page.evaluate(() => { for (const e of document.querySelectorAll("*")) if (e.scrollLeft) e.scrollLeft = 0; });

/** Open a second box (determinize / generate) and lay both out side by side. */
async function twoBoxes(page, layouts, settle = 150) {
  await page.evaluate(() => {
    document.body.classList.add("__rec_two");
    for (const e of document.querySelectorAll("#numberstates")) e.parentElement.style.fontSize = "13px";
  });
  await page.waitForTimeout(settle);
  await unscroll(page);
  for (const [cyId, layout, pad] of layouts) await place(page, layout, pad, cyId, false);
}

/** Waits for the word test to finish: a node turned a verdict colour (not grey, not the blue "current" one). */
const verdict = async (page) => {
  await page.waitForFunction(() => {
    const cy = document.querySelector("#cy")._cyreg.cy;
    return cy.nodes().some((n) => /rgb\((255,\s*0,\s*0|0,\s*128,\s*0)\)/.test(n.style("background-color")));
  }, null, { timeout: 6000 });
};
const testing = async (h, word, label, hold = 950) => {
  answer = word;
  await caption(h.page, `Test word "${word}"`);
  await h.click(h.page.locator("#testing"), { pause: 0, move: 200 });
  await verdict(h.page);
  await caption(h.page, `"${word}" ${label}`);
  await h.beat(hold);
};
const fwd = async (h, n, ms = 330) => {
  for (let i = 0; i < n; i++) {
    await h.click(h.page.locator("#forward"), { pause: 0, move: i ? 60 : 140 });
    await h.wait(ms);
  }
};
const startWord = async (h, word) => {
  answer = word;
  await h.hover(h.page.locator("#start"), 160);
  await h.wait(30);
  // Click and re-fit in one task (the prompt is answered by the dialog handler).
  await h.page.evaluate(() => {
    document.querySelector("#start").click();
    const cy = document.querySelector("#cy")._cyreg.cy;
    cy.resize();
    cy.fit(cy.elements(), 30);
  });
  await caption(h.page, `Step-by-step: "${word}"`);
  await h.wait(120);
};

const deterministicBtn = (page) =>
  page.locator("#buttonBox button", { hasText: /Make deterministic|Tornar determinista/ }).first();


/**
 * Hold the current frame (a screenshot overlay, clicks pass through) while the app
 * computes and the new box is laid out, so no half-built pane is ever filmed.
 */
async function freeze(page) {
  const png = (await page.screenshot({ type: "png" })).toString("base64");
  await page.evaluate((src) => {
    const img = document.createElement("img");
    img.id = "__rec_freeze";
    img.src = "data:image/png;base64," + src;
    img.style.cssText = "position:fixed;left:0;top:0;width:1280px;height:800px;z-index:2147483647;pointer-events:none";
    document.body.appendChild(img);
    return img.decode();
  }, png);
}
const unfreeze = (page) => page.evaluate(() => document.getElementById("__rec_freeze")?.remove());

export default {
  url: "https://oflat-ocamlflat-pages-d4fe77.gitlab.io/",
  target: 25.4, // plan said 30; every planned feature (plus determinize) totals ~25.4 s at this pace
  posterFrom: { segment: "turing-machine", at: -1 },
  async beforeEach(h) {
    h.page.on("dialog", async (d) => {
      if (d.type() === "prompt") await d.accept(answer);
      else await d.accept();
    });
    await h.page.addStyleTag({ content: STYLE });
    // Register the dagre layout (its CDN copy is blocked in the live build).
    await h.page.addScriptTag({ content: await getDagre() });
    await h.page.evaluate(() => {
      try { window.cytoscape.use(window.cytoscapeDagre); } catch {}
      const st = window.setTimeout.bind(window);
      window.setTimeout = (f, t, ...a) => st(f, t >= 400 ? t / 2.5 : t, ...a);
    });
  },
  features: [
    {
      key: "turing-machine",
      title: "Turing machine: step-by-step acceptance and rejection on the tape",
      priority: 1,
      async before(h) {
        await preload(h, "tm_even_as", LAYOUTS.tm_even_as, 55);
        await caption(h.page, "Turing machine: step through a word on the tape");
      },
      async run(h) {
        const { page } = h;
        await h.beat(800); // the full editor with the machine loaded: the hero
        await startWord(h, "aa");
        await fwd(h, 3, 200);
        await caption(page, 'Tape "aa": accepted');
        await h.beat(800);
        await startWord(h, "aaa"); // the cursor goes straight to Start
        await fwd(h, 4, 200);
        await caption(page, 'Tape "aaa": rejected');
        await h.beat(600);
      },
    },
    {
      key: "dfa",
      title: "Finite automaton: test a word, accepted and rejected",
      priority: 2,
      async before(h) {
        await preload(h, "dfa_1", LAYOUTS.dfa_1, 70);
      },
      async run(h) {
        await testing(h, "ab", "accepted");
        await testing(h, "aa", "rejected", 600);
      },
    },
    {
      key: "regex",
      title: "Regular expression converted into an automaton",
      priority: 3,
      async before(h) {
        const { page } = h;
        await scrollExamples(page, "re_abc", 0);
        await load(h, example(page, "re_abc"), 0);
        await page.waitForTimeout(500);
        await hideGraph(page, false);
        await page.waitForTimeout(300);
        await caption(page, "Regex to automaton");
        await h.moveTo(120, 420, 16);
      },
      async run(h) {
        const { page } = h;
        const sel = page.locator("select:has(#selectConv)");
        await h.hover(sel, 260);
        await h.wait(60);
        await freeze(page); // hold the regex frame while the automaton is built and laid out
        const value = await page.locator("#selectAutomaton").getAttribute("value");
        await sel.selectOption(value);
        await page.waitForFunction(() => document.getElementById("cy2")?._cyreg?.cy?.nodes().length >= 4, null, { timeout: 5000 });
        await page.evaluate(() => {
          document.body.classList.add("__rec_two");
          const cy = document.getElementById("cy2")._cyreg.cy;
          cy.resize();
          cy.layout({ name: "dagre", rankDir: "LR", nodeSep: 60, rankSep: 22 }).run();
          // dagre drops the initial-state arrow's invisible source below the start node;
          // put it straight to the left so the arrow reads as "start here".
          const t = cy.getElementById("transparent");
          const s0 = t.nonempty() && t.outgoers("node").first();
          if (s0 && s0.nonempty()) {
            const locked = t.locked(); t.unlock();
            t.position({ x: s0.position("x") - 60, y: s0.position("y") });
            if (locked) t.lock();
          }
          cy.fit(cy.elements(), 8);
        });
        await rest(h);
        await page.waitForTimeout(60);
        await unfreeze(page);
        await h.beat(1300);
      },
    },
    {
      key: "determinize",
      title: "Make a non-deterministic automaton deterministic",
      priority: 4,
      async before(h) {
        const { page } = h;
        // Single pane: the click on camera opens the second box with its result.
        await preload(h, "nfa_1", LAYOUTS.nfa_1, 50);
        await caption(page, "Make deterministic");
      },
      async run(h) {
        const { page } = h;
        const btn = deterministicBtn(page);
        await h.hover(btn, 220);
        await h.wait(80);
        await freeze(page);
        await btn.click({ delay: 40 });
        await page.waitForFunction(() => document.getElementById("cy2")?._cyreg?.cy?.nodes().length >= 4, null, { timeout: 5000 });
        await twoBoxes(page, [["cy", LAYOUTS.nfa_1, 25], ["cy2", LAYOUTS.nfa_1_det, 12]], 60);
        await caption(page, "NFA -> deterministic");
        await rest(h);
        await page.waitForTimeout(40);
        await unfreeze(page);
        await h.beat(1300);
      },
    },
    {
      key: "state-analysis",
      title: "Analysis: useful states painted, useless states removed",
      priority: 5,
      async before(h) {
        // Single box, unpainted nfa_2: the "Useful states" button is fully visible.
        await preload(h, "nfa_2", LAYOUTS.nfa_2, 40);
        await caption(h.page, "Analysis: which states are useful?");
        const b = await h.page.locator("#useful").boundingBox();
        await h.moveTo(b.x - 40, b.y + b.height + 50, 16); // start by the toolbar
      },
      async run(h) {
        const { page } = h;
        const kept = { transparent: [-90, 100], START: [0, 100], A: [120, 100], AB: [240, 100], SUCCESS: [360, 100] };
        await h.click(page.locator("#useful"), { pause: 0, move: 120 });
        await caption(page, "Useful states (purple): reachable and productive");
        await h.beat(650);
        // "Clean" paints the useless states and opens the cleaned automaton beside it.
        await h.hover(page.locator("#clean"), 160);
        await h.wait(30);
        await freeze(page); // hold the purple frame while the two-box layout paints
        await page.locator("#clean").click();
        await page.waitForFunction(() => document.getElementById("cy2")?._cyreg?.cy?.nodes().length >= 4, null, { timeout: 5000 });
        await twoBoxes(page, [["cy", LAYOUTS.nfa_2, 10], ["cy2", kept, 10]], 40);
        await caption(page, "Clean: useless (purple) states removed, right");
        await rest(h);
        await page.waitForTimeout(40);
        await unfreeze(page);
        await h.beat(1400);
      },
    },
    {
      key: "generate-words",
      title: "Generate every accepted word up to a length",
      priority: 6,
      async before(h) {
        answer = "3";
        await preload(h, "dfa_2", LAYOUTS.dfa_2, 60);
        await caption(h.page, "Generate accepted words up to length 3"); // from frame 0
      },
      async run(h) {
        const { page } = h;
        answer = "3";
        await h.hover(page.locator("#generate"), 200);
        await h.wait(80);
        await freeze(page);
        await page.locator("#generate").click();
        await page.waitForSelector("#generateWords", { timeout: 5000 });
        await twoBoxes(page, [["cy", LAYOUTS.dfa_2, 20]], 40);
        await rest(h);
        await page.waitForTimeout(40);
        await unfreeze(page);
        await h.beat(1300);
      },
    },
    {
      key: "dark-theme",
      title: "Dark theme",
      priority: 7,
      async before(h) {
        // The same screen generate-words ends on, so the cut is a continuation.
        const { page } = h;
        answer = "3";
        await preload(h, "dfa_2", LAYOUTS.dfa_2, 60);
        await page.locator("#generate").click();
        await page.waitForSelector("#generateWords", { timeout: 5000 });
        await twoBoxes(page, [["cy", LAYOUTS.dfa_2, 20]]);
        await page.waitForTimeout(200);
        await caption(page, "Dark theme");
        await h.moveTo(120, 640, 16);
      },
      async run(h) {
        const { page } = h;
        const sel = page.locator("#selectTheme");
        await h.glide(sel, { offset: 560, ms: 260 });
        await h.hover(sel, 150);
        await sel.selectOption("dark");
        await h.wait(250); // the theme transition
        await rest(h);
        await h.beat(900);
      },
    },
  ],
};
