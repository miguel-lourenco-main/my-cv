// Fast-paced virtual camera over the gallery screenshots (round 3).
// edgen-code (SIBICode VS Code extension) has no deployment and no repo to run,
// so the video is a "virtual camera" over its gallery screenshots. Everything is
// ring + label beats (the extension is a screenshot, nothing is clickable) except
// the one real cause-and-effect: clicking "Add Docs" opens the dialog.
//   marketing   hero, push onto the capability list, ring sweep over the 4 headings
//   chat-panel  stacked scene: SIBICODE toolbar + input (top) over the settings page (bottom)
//   codebase-config  index status, help center, shortcuts, then the Add Docs click
//   add-docs    dialog opens on the same framing the click ended on
// Target is fixed at 30 s (27-33 s); compose must never run with another target.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PLAN_TARGET = 30;
// Guard: the plan's target is 30 s and the user's minimum is 30 s. Refuse to compose with anything else.
{
  const a = process.argv;
  const i = a.indexOf("--target");
  if (a.includes("compose") && i >= 0 && Number(a[i + 1]) !== PLAN_TARGET) {
    throw new Error(`edgen-code: compose --target ${a[i + 1]} differs from the plan's ${PLAN_TARGET} s (minimum 30 s). Refusing.`);
  }
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const DIR = path.join(ROOT, "public", "projects_images", "edgen-code");
const IMAGES = ["sibicode_chat_D.png", "sibicode_config_D.png", "sibicode_add_doc_D.png"];
const SRC_W = 1676;
const SRC_H = 957;
const VW = 1280;
const ASPECT = 1.6; // 1280x800

// Camera framings in source pixels (x, y, width); height = width / 1.6.
const SHOTS = {
  // Full IDE frame: SIBICode sidebar beside the extension page.
  hero: { x: 0, y: 30, w: 1385 },
  // Capability list Chat..Actions; right edge 1580 is past "edgenai.sibicode".
  caps: { x: 880, y: 413, w: 700 },
  // Stacked chat scene, in viewport px (scale 1).
  stack: { x: 0, y: 0, w: 1280 },
  configTop: { x: 6, y: 70, w: 780 },
  // Help center .. both shortcut rows fully in frame; bottom (930) is the panel's own edge.
  configBottom: { x: 14, y: 455, w: 760 },
  // Add-docs dialog (x 76-718, y 208-792) plus a sliver of the dimmed right pane.
  addDoc: { x: 0, y: 196, w: 960 },
  addDocFields: { x: 60, y: 330, w: 720 },
};

const cam = ({ x, y, w }) => {
  const h = w / ASPECT;
  if (x < 0 || y < 0 || x + w > SRC_W || y + h > SRC_H) throw new Error(`edgen-code: shot out of bounds ${JSON.stringify({ x, y, w })}`);
  const s = VW / w;
  return `scale(${s.toFixed(5)}) translate(${-x}px, ${-y}px)`;
};

const FADE = 500;
const PUSH = 600;
let SHOT = SHOTS.hero; // framing currently on screen (cursor / labels are placed against it)

const S = 1.6; // stacked scene scale
const url = (f) => pathToFileURL(path.join(DIR, f)).href;

function buildPage() {
  const imgs = IMAGES.map((f, i) => {
    const p = path.join(DIR, f);
    if (!fs.existsSync(p)) throw new Error(`edgen-code: missing ${p}`);
    return `<img class="${i === 0 ? "on" : ""}" src="${url(f)}">`;
  }).join("");
  // stacked chat scene: toolbar+input of the chat screenshot (top 256 px), settings page of the config screenshot (bottom 544 px)
  const stack = `<div id="stack">
<div class="half" style="top:0;height:256px"><img src="${url(IMAGES[0])}" style="margin-top:${-40 * S}px"></div>
<div class="half" style="top:258px;height:542px"><img src="${url(IMAGES[1])}" style="margin-top:${-78 * S}px"></div>
<div id="seam"></div></div>`;
  const html = `<!doctype html><meta charset="utf-8"><title>edgen-code</title><style>
html,body{margin:0;height:100%;background:#181818;overflow:hidden;cursor:none}
#__rec_cursor{display:none!important}
#cam{position:fixed;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px;transform-origin:0 0;
  transform:${cam(SHOTS.hero)};will-change:transform}
#cam img{position:absolute;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px;opacity:0;transition:opacity ${FADE}ms ease}
#cam img.on{opacity:1}
#stack{position:absolute;left:0;top:0;width:1280px;height:800px;background:#141414;display:none;overflow:hidden}
#stack .half{position:absolute;left:0;width:1280px;overflow:hidden}
#stack .half img{position:absolute;left:0;width:${SRC_W * S}px;height:${SRC_H * S}px;opacity:1;transition:none}
#seam{position:absolute;left:0;top:256px;width:1280px;height:2px;background:#2d2d2d}
/* right pane dimmed while the dialog is framed, so its cut-off text reads as backdrop */
#dim{position:absolute;left:800px;top:0;right:0;bottom:0;background:#000;opacity:0;transition:opacity ${FADE}ms ease}
#dim.on{opacity:.5}
#patch{position:absolute;left:1300px;top:852px;width:62px;height:56px;background:#181818}
#ring{position:absolute;border:3px solid #38bdf8;border-radius:8px;box-shadow:0 0 18px 4px rgba(56,189,248,.55);opacity:0;pointer-events:none}
#ring.go{animation:pulse var(--d,850ms) ease-out}
#lbl{position:absolute;white-space:nowrap;padding:.28em .7em;border-radius:999px;background:rgba(8,28,40,.94);border:1.5px solid #38bdf8;color:#e0f2fe;font:600 16px/1.25 system-ui,sans-serif;opacity:0;pointer-events:none}
#lbl.go{animation:fade var(--d,850ms) ease-out}
@keyframes pulse{0%{opacity:0;transform:scale(1.25)}30%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}}
@keyframes fade{0%{opacity:0}25%{opacity:1}85%{opacity:1}100%{opacity:0}}
.tx{position:absolute;overflow:hidden;white-space:nowrap;color:#d4d4d4;font-family:"Noto Sans",system-ui,sans-serif}
.tx b{display:inline-block;width:2px;height:1.1em;background:#d4d4d4;vertical-align:-.15em;margin-left:1px;animation:bl 700ms steps(1) infinite}
@keyframes bl{50%{opacity:0}}
#cur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:50;pointer-events:none;transform:translate(-100px,-100px);
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
#cur svg{display:block}
#cur i{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;border:3px solid #fbbf24;opacity:0}
#cur.click i{animation:clk 360ms ease-out}
@keyframes clk{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(2.2)}}
</style><body><div id="cam">${imgs}${stack}<div id="patch"></div><div id="dim"></div><div id="ring"></div><div id="lbl"></div></div>
<div id="cur"><i></i><svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.5 22.2 L10 14.5 L17 14.5 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg></div></body>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "slides-edgen-code-"));
  const file = path.join(tmp, "index.html");
  fs.writeFileSync(file, html);
  return pathToFileURL(file).href;
}

const ready = (page) => page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
const move = (page, shot, ms = PUSH) => {
  SHOT = shot;
  return page.evaluate(({ t, ms }) => {
    const c = document.getElementById("cam");
    c.style.transition = `transform ${ms}ms cubic-bezier(.45,0,.25,1)`;
    c.style.transform = t;
  }, { t: cam(shot), ms });
};
const dim = (page, on) => page.evaluate((on) => document.getElementById("dim").classList.toggle("on", on), on);

/** Ring (+ optional label) at a rect in the current scene's pixels; label below, or above with pos:"above". */
const ring = (page, r, label, pos = "below", dur = 850) =>
  page.evaluate(({ r, label, pos, s, right, dur }) => {
    const e = document.getElementById("ring");
    const l = document.getElementById("lbl");
    e.classList.remove("go");
    l.classList.remove("go");
    e.style.setProperty("--d", dur + "ms");
    l.style.setProperty("--d", dur + "ms");
    Object.assign(e.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
    if (label) {
      l.textContent = label;
      l.style.fontSize = Math.round(17 / s) + "px";
      l.style.left = "0px";
      l.style.top = "0px";
      const w = l.offsetWidth;
      const h = l.offsetHeight;
      const gap = 8 / s;
      l.style.left = Math.max(0, Math.min(r.x, right - w - 6 / s)) + "px";
      l.style.top = (pos === "above" ? r.y - h - gap : r.y + r.h + gap) + "px";
    }
    void e.offsetWidth;
    e.classList.add("go");
    if (label) l.classList.add("go");
  }, { r, label: label || "", pos, s: VW / SHOT.w, right: SHOT.x + SHOT.w, dur });

/** A ring beat: ring + label, then hold so the whole thing reads (default ~0.9 s). */
const beat = async (h, r, label, { pos, dur = 850, hold = dur + 50 } = {}) => {
  await ring(h.page, r, label, pos, dur);
  await h.wait(hold);
};

const cursorSet = (page, p) => {
  const s = VW / SHOT.w;
  return page.evaluate(({ x, y }) => {
    const c = document.getElementById("cur");
    c.style.transition = "none";
    c.style.transform = `translate(${x}px, ${y}px)`;
    void c.offsetWidth;
  }, { x: (p.x - SHOT.x) * s, y: (p.y - SHOT.y) * s });
};
const cursorTo = (page, p, ms = 300) => {
  const s = VW / SHOT.w;
  return page.evaluate(({ x, y, ms }) => {
    const c = document.getElementById("cur");
    c.style.transition = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
    c.style.transform = `translate(${x}px, ${y}px)`;
  }, { x: (p.x - SHOT.x) * s, y: (p.y - SHOT.y) * s, ms });
};
const pulse = (page) =>
  page.evaluate(() => {
    const c = document.getElementById("cur");
    c.classList.remove("click");
    void c.offsetWidth;
    c.classList.add("click");
  });

/** Demo typing overlay: cover a placeholder and type `text` over it, fast. */
async function typeInto(h, box, text, delay = 26) {
  await h.page.evaluate(({ box, id }) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.className = "tx";
      document.getElementById("cam").appendChild(el);
    }
    Object.assign(el.style, { left: box.x + "px", top: box.y + "px", width: box.w + "px", height: box.h + "px", background: box.bg, font: `${box.fs}px/${box.h}px "Noto Sans",system-ui,sans-serif`, paddingLeft: box.pad + "px", boxSizing: "border-box" });
    el.innerHTML = "<b></b>";
  }, { box, id: box.id });
  for (let i = 1; i <= text.length; i++) {
    await h.page.evaluate(({ id, t }) => { document.getElementById(id).innerHTML = t.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "<b></b>"; }, { id: box.id, t: text.slice(0, i) });
    await h.wait(delay);
  }
}

/** Off camera: set image/scene + framing with transitions off, so the clip opens on it. */
const cutTo = (page, i, shot, { dimmed = false, stack = false, cursor = null } = {}) => {
  SHOT = shot;
  return page.evaluate(({ i, t, dimmed, stack, cursor, s }) => {
    const els = [document.getElementById("cam"), document.getElementById("dim"), document.getElementById("cur"), ...document.querySelectorAll("#cam > img")];
    els.forEach((e) => (e.style.transition = "none"));
    document.querySelectorAll("#cam > img").forEach((im, k) => im.classList.toggle("on", !stack && k === i));
    document.getElementById("stack").style.display = stack ? "block" : "none";
    document.querySelectorAll(".tx").forEach((e) => e.remove());
    document.getElementById("dim").classList.toggle("on", dimmed);
    document.getElementById("ring").classList.remove("go");
    document.getElementById("lbl").classList.remove("go");
    const c = document.getElementById("cur");
    c.classList.remove("click");
    c.style.transform = cursor ? `translate(${cursor.x}px, ${cursor.y}px)` : "translate(-100px, -100px)";
    document.getElementById("cam").style.transform = t;
    document.body.offsetHeight; // flush
    els.forEach((e) => (e.style.transition = ""));
  }, { i, t: cam(shot), dimmed, stack, cursor, s: VW / shot.w });
};

// --- stacked scene rects (viewport px): chat source y is offset by 40, scale 1.6
const tb = (srcX) => ({ x: Math.round(srcX * S) - 22, y: 6, w: 44, h: 42 });

export default {
  url: buildPage(),
  target: PLAN_TARGET,
  colorScheme: "dark",
  pacing: { heroDwell: 1500 },
  posterFrom: { segment: "marketing", at: 1 },
  async beforeEach(h) {
    await ready(h.page);
    await cutTo(h.page, 0, SHOTS.hero);
  },
  // The extension's own listing page: hero, one push onto the capability list, a quick ring sweep.
  marketing: {
    title: "Extension overview",
    async run(h) {
      const { page } = h;
      await beat(h, { x: 915, y: 250, w: 175, h: 32 }, "Details and Features", { dur: 800, hold: 800 });
      await move(page, SHOTS.caps, 450); // hero already held by the recorder
      await h.wait(480);
      const sweep = [
        [{ x: 1040, y: 428, w: 190, h: 40 }, "Chat"],
        [{ x: 1030, y: 546, w: 210, h: 40 }, "Autocomplete"],
        [{ x: 1060, y: 638, w: 150, h: 40 }, "Edit"],
        [{ x: 1050, y: 756, w: 170, h: 40 }, "Actions"],
      ];
      for (const [r, label] of sweep) await beat(h, r, label, { dur: 420, hold: 300 });
      await h.wait(400);
    },
  },
  features: [
    {
      key: "chat-panel",
      title: "Chat panel: toolbar, model picker, @codebase, settings",
      priority: 1,
      before: (h) => cutTo(h.page, 0, SHOTS.stack, { stack: true }),
      async run(h) {
        const { page } = h;
        await beat(h, tb(658), "New chat");
        await beat(h, tb(687), "Chat history");
        await beat(h, tb(716), "Open in editor");
        await beat(h, tb(629), "Settings: index, docs, help");
        await beat(h, tb(774), "More actions", { dur: 700, hold: 750 });
        await beat(h, { x: 22, y: 131, w: 426, h: 48 }, "Pick the model");
        await beat(h, { x: 470, y: 131, w: 93, h: 48 }, "@ context and tools", { dur: 700, hold: 750 });
        await typeInto(h, { id: "tx1", x: 26, y: 82, w: 560, h: 36, fs: 26, pad: 6, bg: "#1c1c1c" }, "@codebase how is auth wired?");
        await h.wait(250);
        await beat(h, { x: 922, y: 131, w: 208, h: 48 }, "Ctrl+Enter sends with @codebase", { dur: 1000, hold: 1050 });
      },
    },
    {
      key: "codebase-config",
      title: "@codebase index, @docs, help center, shortcuts",
      priority: 2,
      before: (h) => cutTo(h.page, 1, SHOTS.configTop),
      async run(h) {
        const { page } = h;
        await beat(h, { x: 14, y: 224, w: 760, h: 78 }, "Indexing complete, click to re-index", { pos: "above" });
        await beat(h, { x: 14, y: 350, w: 760, h: 62 }, "@docs indexes", { dur: 700, hold: 750 });
        await move(page, SHOTS.configBottom, 650);
        await h.wait(650);
        await beat(h, { x: 14, y: 570, w: 756, h: 56 }, "Token usage", { dur: 700, hold: 750 });
        await beat(h, { x: 14, y: 642, w: 756, h: 56 }, "Quickstart", { dur: 700, hold: 750 });
        await beat(h, { x: 14, y: 806, w: 380, h: 44 }, "Toggle model (Ctrl+')", { pos: "above", dur: 700, hold: 750 });
        await beat(h, { x: 400, y: 806, w: 372, h: 44 }, "Edit capability (Ctrl+I)", { pos: "above" });
        await beat(h, { x: 14, y: 858, w: 380, h: 72 }, "New chat (Ctrl+L)", { pos: "above" });
        await beat(h, { x: 400, y: 874, w: 372, h: 44 }, "Cancel response", { pos: "above", dur: 700, hold: 750 });
        // last beat: push onto the dialog framing, click Add Docs, hard cut into the dialog
        await move(page, SHOTS.addDoc, 650);
        await cursorSet(page, { x: 330, y: 640 });
        await h.wait(650);
        await cursorTo(page, { x: 68, y: 437 }, 380);
        await h.wait(420);
        await pulse(page);
        await beat(h, { x: 14, y: 418, w: 106, h: 40 }, "Add Docs", { dur: 700, hold: 600 });
      },
    },
    {
      key: "add-docs",
      title: "Add documentation dialog (@docs provider)",
      priority: 3,
      // dialog opens on the framing the Add Docs click ended on; cursor still on the button
      before: (h) => cutTo(h.page, 2, SHOTS.addDoc, { dimmed: true, cursor: { x: 68 * (VW / SHOTS.addDoc.w), y: (437 - SHOTS.addDoc.y) * (VW / SHOTS.addDoc.w) } }),
      async run(h) {
        const { page } = h;
        await cursorTo(page, { x: 260, y: 450 }, 300);
        await h.wait(320);
        await beat(h, { x: 94, y: 362, w: 596, h: 190 }, "One-click doc sources", { dur: 1000, hold: 1050 });
        await cursorTo(page, { x: 640, y: 402 }, 260);
        await beat(h, { x: 94, y: 388, w: 596, h: 30 }, "Pick one: edit or open its docs", { dur: 900, hold: 950, pos: "above" });
        await page.evaluate(() => (document.getElementById("cur").style.transform = "translate(-100px,-100px)"));
        await move(page, SHOTS.addDocFields, 600);
        await h.wait(620);
        await ring(page, { x: 94, y: 592, w: 608, h: 50 }, "Name + start URL (demo input)", "below", 1700);
        await typeInto(h, { id: "tx2", x: 98, y: 601, w: 140, h: 32, fs: 16, pad: 12, bg: "#141414" }, "React");
        await typeInto(h, { id: "tx3", x: 257, y: 601, w: 438, h: 32, fs: 16, pad: 12, bg: "#141414" }, "https://react.dev");
        await h.wait(350);
        await beat(h, { x: 618, y: 652, w: 84, h: 38 }, "Add", { dur: 700, hold: 750 });
        await beat(h, { x: 94, y: 724, w: 200, h: 60 }, "Currently indexing", { pos: "above", dur: 1000, hold: 1000 });
      },
    },
  ],
};
