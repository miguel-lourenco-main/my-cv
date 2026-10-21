// Fast-paced virtual camera over the gallery screenshots (round 3).
// edgen-code (a company VS Code extension) has no deployment and no repo to run,
// so the video is a "virtual camera" over its gallery screenshots. Everything is
// ring + label beats (the extension is a screenshot, nothing is clickable) except
// the one real cause-and-effect: clicking "Add Docs" opens the dialog. A corner tag
// says "Screenshot walkthrough"; typed text is tagged "demo input".
//   marketing   listing-page hero, push onto the capability list, Chat + Edit ringed
//   chat-panel  the real chat sidebar (sibicode_chat): toolbar, model picker, @, typed @codebase prompt
//   codebase-config  settings page: @codebase index, @docs, help center, two shortcuts
//   add-docs    Add Docs click opens the dialog; suggestions, demo Title/URL, Add ringed (not clicked)
// Target is fixed at 30 s (27-33 s); compose must never run with another target.
// PRIVACY (round 1 priv): the screenshots carry the employer's real product name, publisher,
// tagline, logo, installation details and the real workspace's dependency list. Every one of
// those is painted over on camera by REDACT below with a generic demo brand ("Acme Copilot" by
// "Acme", fake identifier/version/date) and a generic demo dependency list.
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
  // Hero: the extension's listing page only (logo, title, tabs, first capability), no empty chat panel.
  hero: { x: 880, y: 30, w: 720 },
  // Capability list SIBICode..Actions.
  caps: { x: 880, y: 300, w: 800 - 4 },
  // Chat sidebar (sibicode_chat). The real panel is empty below the input, so these framings
  // are padded above the image with the panel's own colour (pad: y < 0 allowed) to keep the
  // toolbar + input strip near the middle instead of in a thin band at the top.
  chatLeft: { x: 0, y: -30, w: 440, pad: true }, // model picker, @, tools, the typed prompt
  chatWide: { x: 0, y: -110, w: 800, pad: true }, // whole input: typed prompt + Ctrl+Enter @codebase
  // take only: close-up on the chat toolbar (New chat, history, open in tab), readable rings
  chatTools: { x: 352, y: -44, w: 440, pad: true },
  configTop: { x: 6, y: 70, w: 780 },
  // Help center .. both shortcut rows fully in frame; bottom (930) is the panel's own edge.
  configBottom: { x: 14, y: 455, w: 760 },
  // Add-docs dialog (x 76-718, y 208-792). Everything right of the sidebar (x >= 788) is masked
  // with the panel's own background, so no extension-page pixels show after the marketing clip.
  addDoc: { x: 0, y: 196, w: 960 },
  addDocFields: { x: 60, y: 330, w: 720 },
};

const cam = function ({ x, y, w }) {
  const h = w / ASPECT;
  if (x < 0 || (y < 0 && !(arguments[0].pad && y >= -200)) || x + w > SRC_W || y + h > SRC_H) throw new Error(`edgen-code: shot out of bounds ${JSON.stringify({ x, y, w })}`);
  const s = VW / w;
  return `scale(${s.toFixed(5)}) translate(${-x}px, ${-y}px)`;
};

const FADE = 500;
const PUSH = 600;
let SHOT = SHOTS.hero; // framing currently on screen (cursor / labels are placed against it)

const url = (f) => pathToFileURL(path.join(DIR, f)).href;

// Demo brand + demo data painted over the real identifiers (source px, per image).
const BRAND = "Acme Copilot";
const DEMO_DEPS = [
  ["express", "https://expressjs.com"],
  ["lodash", "https://lodash.com/docs"],
  ["axios", "https://axios-http.com/docs"],
  ["zod", "https://zod.dev"],
  ["vitest", "https://vitest.dev"],
  ["prisma", "https://www.prisma.io/docs"],
];
const box = (x, y, w, h, bg, html, css = "") =>
  `<div class="ov" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg};${css}">${html}</div>`;
const header = (x) => box(x, 46, 140, 22, "#141414", "ACME COPILOT", "font-size:12.5px;font-weight:700;line-height:22px;color:#cccccc;letter-spacing:.02em");
const actIcon = (x) => box(x, 9, 27, 27, "#212121", "&#10022;", "font-size:19px;line-height:27px;text-align:center;color:#e6e6e6");
const installRow = (label, value, y, h = 26, lh = h) =>
  `<div style="position:absolute;left:4px;top:${y}px;width:68px;height:${h}px;line-height:${lh}px">${label}</div>` +
  `<div style="position:absolute;left:72px;top:${y}px;height:${h}px;font:12px/${lh}px ui-monospace,monospace">${value}</div>`;
const REDACT = [
  // 0: chat panel + the extension's listing page
  [
    header(2),
    actIcon(442),
    box(812, 8, 192, 30, "#181818", `<i>Extension: ${BRAND}</i>`, "font-size:16px;line-height:30px;color:#e6e6e6;padding-left:26px"),
    box(910, 60, 160, 170, "#181818",
      `<div style="position:absolute;left:12px;top:12px;width:132px;height:132px;border-radius:26px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font:700 54px/132px ui-monospace,monospace;text-align:center">&lt;/&gt;</div>`),
    box(1084, 66, 220, 42, "#181818", BRAND, "font-size:30px;font-weight:600;line-height:42px;color:#e7e7e7"),
    box(1084, 110, 120, 26, "#181818", "Acme", "font-size:16px;line-height:26px;color:#cccccc"),
    box(1084, 145, 260, 28, "#181818", "AI code copilot for your IDE", "font-size:16px;line-height:28px;color:#e0e0e0"),
    box(990, 316, 286, 48, "#181818", BRAND, "font-size:30px;line-height:48px;text-align:center;color:#e7e7e7"),
    box(915, 388, 436, 28, "#181818", `${BRAND} is an AI code copilot for your IDE`, "font-size:15.5px;font-weight:700;line-height:28px;text-align:center;color:#e7e7e7"),
    box(1402, 350, 196, 160, "#181818",
      installRow("Identifier", "acme.copilot", 2) + installRow("Version", "1.4.2", 28) +
      installRow("Last<br>Updated", "2025-06-01,<br>10:00:00", 54, 48, 24) + installRow("Source", "Marketplace", 104) + installRow("Size", "48.20MB", 130),
      "font-size:14.5px;color:#cccccc"),
  ],
  // 1: settings page
  [
    header(5),
    actIcon(445),
    box(14, 883, 290, 26, "#141414", "Code / Close Acme Sidebar If", "font-size:17px;line-height:26px;color:#cccccc;padding-left:4px"),
  ],
  // 2: Add documentation dialog: generic demo dependencies instead of the real workspace's
  [
    box(138, 362, 514, 182, "#141414",
      DEMO_DEPS.map(([n, u], k) =>
        `<div style="position:absolute;left:3px;top:${-6 + k * 31.6}px;line-height:28px">${n}</div>` +
        `<div style="position:absolute;left:248px;top:${-6 + k * 31.6}px;line-height:28px">${u}</div>`).join(""),
      "font-size:16px;color:#cccccc"),
  ],
];

function buildPage() {
  const imgs = IMAGES.map((f, i) => {
    const p = path.join(DIR, f);
    if (!fs.existsSync(p)) throw new Error(`edgen-code: missing ${p}`);
    return `<div class="pg${i === 0 ? " on" : ""}"><img src="${url(f)}">${REDACT[i].join("")}</div>`;
  }).join("");
  const html = `<!doctype html><meta charset="utf-8"><title>edgen-code</title><style>
html,body{margin:0;height:100%;background:#141414;overflow:hidden;cursor:none}
#__rec_cursor{display:none!important}
#cam{position:fixed;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px;transform-origin:0 0;
  transform:${cam(SHOTS.hero)};will-change:transform}
#cam .pg{position:absolute;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px;opacity:0;transition:opacity ${FADE}ms ease}
#cam .pg.on{opacity:1}
#cam .pg img{position:absolute;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px}
.ov{position:absolute;overflow:hidden;box-sizing:border-box;white-space:nowrap;font-family:"Noto Sans",system-ui,sans-serif}
/* panel-colour pad over the extension page, used whenever a sidebar framing is wider than the sidebar */
#mask{position:absolute;left:788px;top:0;right:0;bottom:0;background:#141414;opacity:0}
#mask.on{opacity:1}
#mask.dlg{background:#171717}
#ring{position:absolute;border:3px solid #38bdf8;border-radius:8px;box-shadow:0 0 18px 4px rgba(56,189,248,.55);opacity:0;pointer-events:none}
#ring.go{animation:pulse var(--d,850ms) ease-out forwards}
#lbl{position:absolute;white-space:nowrap;padding:.28em .7em;border-radius:999px;background:rgba(8,28,40,.94);border:1.5px solid #38bdf8;color:#e0f2fe;font:600 16px/1.25 system-ui,sans-serif;opacity:0;pointer-events:none}
#lbl.go{animation:fade var(--d,850ms) ease-out forwards}
@keyframes pulse{0%{opacity:0;transform:scale(1.25)}25%{opacity:1;transform:scale(1)}92%{opacity:1}100%{opacity:0}}
@keyframes fade{0%{opacity:0}20%{opacity:1}92%{opacity:1}100%{opacity:0}}
.tx{position:absolute;overflow:hidden;white-space:nowrap;color:#d4d4d4;font-family:"Noto Sans",system-ui,sans-serif}
.tx b{display:inline-block;width:2px;height:1.1em;background:#d4d4d4;vertical-align:-.15em;margin-left:1px;animation:bl 700ms steps(1) infinite}
@keyframes bl{50%{opacity:0}}
.demo{position:absolute;white-space:nowrap;padding:.2em .6em;border-radius:6px;background:#422006;border:1.5px solid #f59e0b;color:#fde68a;font:600 13px/1.2 system-ui,sans-serif;opacity:0;transition:opacity 200ms}
.demo.on{opacity:1}
#tag{position:fixed;right:14px;top:12px;z-index:40;padding:5px 11px;border-radius:999px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.25);color:#e5e7eb;font:600 13px/1.2 system-ui,sans-serif;letter-spacing:.02em}
#cur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:50;pointer-events:none;transform:translate(-100px,-100px);
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
#cur svg{display:block}
#cur i{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;border:3px solid #fbbf24;opacity:0}
#cur.click i{animation:clk 360ms ease-out}
@keyframes clk{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(2.2)}}
</style><body><div id="cam">${imgs}<div id="mask"></div><div id="ring"></div><div id="lbl"></div></div>
<div id="tag">Screenshot walkthrough</div>
<div id="cur"><i></i><svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.5 22.2 L10 14.5 L17 14.5 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg></div></body>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "slides-edgen-code-"));
  const file = path.join(tmp, "index.html");
  fs.writeFileSync(file, html);
  return pathToFileURL(file).href;
}

const ready = (page) => page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
/** Rings never linger or fade across a camera move (no double exposure). */
const ringOff = (page) => page.evaluate(() => ["ring", "lbl"].forEach((id) => document.getElementById(id).classList.remove("go")));
const move = async (page, shot, ms = PUSH) => {
  SHOT = shot;
  await ringOff(page);
  return page.evaluate(({ t, ms }) => {
    const c = document.getElementById("cam");
    c.style.transition = `transform ${ms}ms cubic-bezier(.45,0,.25,1)`;
    c.style.transform = t;
  }, { t: cam(shot), ms });
};

/** Ring (+ optional label) at a rect in source pixels; label below, above, or right of it. */
const ring = (page, r, label, pos = "below", dur = 850) =>
  page.evaluate(({ r, label, pos, s, left, right, dur }) => {
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
      if (pos === "left") {
        l.style.left = r.x - w - gap + "px";
        l.style.top = r.y + (r.h - h) / 2 + "px";
      } else if (pos === "right") {
        l.style.left = r.x + r.w + gap + "px";
        l.style.top = r.y + (r.h - h) / 2 + "px";
      } else {
        l.style.left = Math.max(left + 6 / s, Math.min(r.x, right - w - 6 / s)) + "px";
        l.style.top = (pos === "above" ? r.y - h - gap : r.y + r.h + gap) + "px";
      }
    }
    void e.offsetWidth;
    e.classList.add("go");
    if (label) l.classList.add("go");
  }, { r, label: label || "", pos, s: VW / SHOT.w, left: SHOT.x, right: Math.min(SHOT.x + SHOT.w, SHOT.x < 788 ? 788 : 1e9), dur });

/** A ring beat: ring + label, then hold so the whole thing reads. */
const beat = async (h, r, label, { pos, dur = 900, hold = dur + 40 } = {}) => {
  await ring(h.page, r, label, pos, dur);
  await h.wait(hold);
};

const toView = (p) => {
  const s = VW / SHOT.w;
  return { x: (p.x - SHOT.x) * s, y: (p.y - SHOT.y) * s };
};
const cursorTo = (page, p, ms = 300) =>
  page.evaluate(({ x, y, ms }) => {
    const c = document.getElementById("cur");
    c.style.transition = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
    c.style.transform = `translate(${x}px, ${y}px)`;
  }, { ...toView(p), ms });
const cursorHide = (page) => page.evaluate(() => {
  const c = document.getElementById("cur");
  c.style.transition = "none";
  c.style.transform = "translate(-100px,-100px)";
});
const pulse = (page) =>
  page.evaluate(() => {
    const c = document.getElementById("cur");
    c.classList.remove("click");
    void c.offsetWidth;
    c.classList.add("click");
  });

/** Small amber "demo input" tag (source px), so typed text on a screenshot is labelled as demo. */
const demoTag = (page, at, text = "demo input") =>
  page.evaluate(({ at, text, s }) => {
    const d = document.createElement("div");
    d.className = "demo";
    d.textContent = text;
    d.style.left = at.x + "px";
    d.style.top = at.y + "px";
    d.style.fontSize = (13 / s).toFixed(1) + "px";
    document.getElementById("cam").appendChild(d);
    void d.offsetWidth;
    d.classList.add("on");
  }, { at, text, s: VW / SHOT.w });

/** Demo typing overlay: cover a placeholder and type `text` over it, fast. */
async function typeInto(h, box, text, delay = 22, { caret = true } = {}) {
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
  if (!caret) await h.page.evaluate((id) => document.querySelector(`#${id} b`)?.remove(), box.id);
}

/** Off camera: set image + framing with transitions off, so the clip opens on it. */
const cutTo = (page, i, shot, { mask = false, cursor = null } = {}) => {
  SHOT = shot;
  return page.evaluate(({ i, t, mask, cursor }) => {
    const els = [document.getElementById("cam"), document.getElementById("cur"), ...document.querySelectorAll("#cam > .pg")];
    els.forEach((e) => (e.style.transition = "none"));
    document.querySelectorAll("#cam > .pg").forEach((im, k) => im.classList.toggle("on", k === i));
    document.querySelectorAll(".tx,.demo").forEach((e) => e.remove());
    const m = document.getElementById("mask");
    m.classList.toggle("on", mask);
    m.classList.toggle("dlg", i === 2);
    document.getElementById("ring").classList.remove("go");
    document.getElementById("lbl").classList.remove("go");
    const c = document.getElementById("cur");
    c.classList.remove("click");
    c.style.transform = cursor ? `translate(${cursor.x}px, ${cursor.y}px)` : "translate(-100px, -100px)";
    document.getElementById("cam").style.transform = t;
    document.body.offsetHeight; // flush
    els.forEach((e) => (e.style.transition = ""));
  }, { i, t: cam(shot), mask, cursor });
};

const FLOW = {
  url: buildPage(),
  target: PLAN_TARGET,
  colorScheme: "dark",
  pacing: { heroDwell: 1500 },
  // poster: the Add documentation dialog, a full frame of product UI
  posterFrom: { segment: "add-docs", at: 2.6 },
  async beforeEach(h) {
    await ready(h.page);
    await cutTo(h.page, 0, SHOTS.hero);
  },
  // The extension's own listing page: hero, one push onto the capability list, Chat and Edit ringed.
  marketing: {
    title: "Extension overview",
    async run(h) {
      const { page } = h;
      await beat(h, { x: 1080, y: 144, w: 220, h: 30 }, "", { dur: 800, hold: 760 }); // hero already held by the recorder
      await move(page, SHOTS.caps, 550);
      await h.wait(560);
      await cursorTo(page, { x: 1200, y: 470 }, 1);
      await cursorTo(page, { x: 1150, y: 455 }, 260);
      await beat(h, { x: 1085, y: 428, w: 100, h: 40 }, "", { dur: 800, hold: 760 });
      await cursorTo(page, { x: 1150, y: 665 }, 300);
      await beat(h, { x: 1090, y: 638, w: 90, h: 40 }, "", { dur: 800, hold: 760 });
      await cursorHide(page);
    },
  },
  features: [
    {
      key: "chat-panel",
      title: "Chat panel: model picker, @-context, @codebase send",
      priority: 1,
      before: (h) => cutTo(h.page, 0, SHOTS.chatWide),
      async run(h) {
        const { page } = h;
        await beat(h, { x: 642, y: 42, w: 60, h: 30 }, "New chat, history", { dur: 850 });
        await beat(h, { x: 702, y: 42, w: 28, h: 30 }, "Open chat in an editor tab", { dur: 800 });
        await move(page, SHOTS.chatLeft, 500);
        await h.wait(520);
        await beat(h, { x: 12, y: 123, w: 280, h: 28 }, "Model: Qwen2.5-Coder-32B", { dur: 950 });
        await beat(h, { x: 294, y: 123, w: 58, h: 28 }, "@ context, tools", { dur: 850 });
        await demoTag(page, { x: 380, y: 64 });
        await typeInto(h, { id: "tx1", x: 14, y: 88, w: 440, h: 30, fs: 17, pad: 6, bg: "#1c1c1c" }, "@codebase how is auth wired?");
        await h.wait(250);
        await move(page, SHOTS.chatWide, 550);
        await h.wait(560);
        await beat(h, { x: 574, y: 123, w: 134, h: 28 }, "Ctrl+Enter sends with @codebase", { dur: 1100 });
        await beat(h, { x: 615, y: 42, w: 28, h: 30 }, "Settings: index, docs, help", { dur: 850, hold: 820 });
      },
    },
    {
      key: "codebase-config",
      title: "@codebase index, @docs, help center, shortcuts",
      priority: 1,
      before: (h) => cutTo(h.page, 1, SHOTS.configTop),
      async run(h) {
        const { page } = h;
        await beat(h, { x: 12, y: 148, w: 300, h: 64 }, "Local embeddings of your code", { pos: "right", dur: 1000 });
        await beat(h, { x: 12, y: 224, w: 764, h: 78 }, "Indexing complete, click to re-index", { dur: 1100 });
        await beat(h, { x: 12, y: 350, w: 764, h: 112 }, "@docs indexes for documentation sites", { pos: "above", dur: 1150 });
        await move(page, SHOTS.configBottom, 550);
        await h.wait(560);
        await beat(h, { x: 14, y: 572, w: 756, h: 128 }, "Help center: token usage, quickstart", { pos: "above", dur: 1050 });
        await beat(h, { x: 398, y: 808, w: 376, h: 42 }, "Edit highlighted code (Ctrl+I)", { pos: "above", dur: 950 });
        await beat(h, { x: 14, y: 860, w: 362, h: 68 }, "New chat (Ctrl+L)", { pos: "above", dur: 950 });
      },
    },
    {
      key: "add-docs",
      title: "Add documentation dialog (@docs provider)",
      priority: 2,
      before: (h) => cutTo(h.page, 1, SHOTS.addDoc, { mask: true }),
      async run(h) {
        const { page } = h;
        await cursorTo(page, { x: 330, y: 640 }, 1);
        await cursorTo(page, { x: 68, y: 437 }, 380);
        await h.wait(400);
        await pulse(page);
        await ring(page, { x: 16, y: 418, w: 104, h: 38 }, "", "below", 400);
        await h.wait(220);
        // the click opens the dialog (the add_doc screenshot), quick cross-fade
        await page.evaluate(() => {
          const imgs = document.querySelectorAll("#cam > .pg");
          imgs.forEach((im) => (im.style.transition = "opacity 260ms ease"));
          imgs[1].classList.remove("on");
          imgs[2].classList.add("on");
          document.getElementById("mask").classList.add("dlg");
        });
        await ringOff(page);
        await h.wait(300);
        await cursorTo(page, { x: 300, y: 560 }, 280);
        await demoTag(page, { x: 560, y: 336 }, "demo data");
        await beat(h, { x: 92, y: 360, w: 600, h: 190 }, "Suggested from the project's dependencies", { pos: "above", dur: 1550 });
        await cursorTo(page, { x: 640, y: 402 }, 260);
        await beat(h, { x: 92, y: 388, w: 600, h: 30 }, "Each one: edit it, or open its docs", { pos: "above", dur: 1000 });
        await cursorHide(page);
        await move(page, SHOTS.addDocFields, 550);
        await h.wait(560);
        await demoTag(page, { x: 560, y: 568 });
        await typeInto(h, { id: "tx2", x: 98, y: 601, w: 140, h: 32, fs: 16, pad: 12, bg: "#141414" }, "React", 22, { caret: false });
        await typeInto(h, { id: "tx3", x: 257, y: 601, w: 438, h: 32, fs: 16, pad: 12, bg: "#141414" }, "https://react.dev", 22, { caret: false });
        await h.wait(450);
        await move(page, SHOTS.addDoc, 550);
        await h.wait(560);
        await beat(h, { x: 618, y: 652, w: 84, h: 38 }, "Add it to the @docs index", { pos: "left", dur: 1100, hold: 1100 });
      },
    },
  ],
};

export default FLOW;

// ---------------------------------------------------------------------------
// CONTINUOUS take (v4): the same beats in the same order, joined on camera.
// No cuts: every move between screenshots is a camera push plus, where the
// extension itself changes view, a cursor click and a short cross-fade.
// ---------------------------------------------------------------------------
const feat = (key) => FLOW.features.find((f) => f.key === key);
/** Cross-fade to screenshot i (on camera), optional mask fade, in parallel with a camera move. */
const fadeTo = (page, i, { mask, ms = 300 } = {}) =>
  page.evaluate(({ i, mask, ms }) => {
    document.querySelectorAll("#cam > .pg").forEach((im, k) => {
      im.style.transition = `opacity ${ms}ms ease`;
      im.classList.toggle("on", k === i);
    });
    document.querySelectorAll(".tx,.demo").forEach((e) => {
      e.style.transition = `opacity ${ms}ms ease`;
      e.style.opacity = "0";
      setTimeout(() => e.remove(), ms + 20);
    });
    const m = document.getElementById("mask");
    m.style.transition = `opacity ${ms}ms ease`;
    if (mask != null) m.classList.toggle("on", mask);
    m.classList.toggle("dlg", i === 2);
  }, { i, mask: mask ?? null, ms });

/** Settings-click swap: the outgoing view fades out fast, the incoming one fades in just after,
 *  so no frame shows both layouts at full legibility. */
const swapTo = (page, i, { out = 150, inMs = 260, delay = 90 } = {}) =>
  page.evaluate(({ i, out, inMs, delay }) => {
    document.querySelectorAll("#cam > .pg").forEach((im, k) => {
      const on = k === i;
      im.style.transition = on ? `opacity ${inMs}ms ease ${delay}ms` : `opacity ${out}ms ease`;
      im.classList.toggle("on", on);
    });
    document.querySelectorAll(".tx,.demo").forEach((e) => {
      e.style.transition = `opacity ${out}ms ease`;
      e.style.opacity = "0";
      setTimeout(() => e.remove(), out + 20);
    });
  }, { i, out, inMs, delay });

/** The Add click: Add flashes, "Currently Indexing: None" becomes the demo entry, ringed. */
async function addClick(h) {
  const { page } = h;
  await cursorTo(page, { x: 560, y: 720 }, 1);
  await cursorTo(page, { x: 662, y: 672 }, 260);
  await h.wait(140);
  await pulse(page);
  await ring(page, { x: 618, y: 652, w: 84, h: 38 }, "", "below", 380);
  await h.wait(200);
  await page.evaluate(() => {
    const d = document.createElement("div");
    d.className = "tx";
    Object.assign(d.style, { left: "98px", top: "752px", width: "600px", height: "30px", background: "#141414", opacity: "0", transition: "opacity 180ms ease",
      font: '16px/30px "Noto Sans",system-ui,sans-serif', color: "#cccccc", paddingLeft: "3px", boxSizing: "border-box" });
    d.innerHTML = 'React <span style="color:#8a8a8a">&middot; https://react.dev</span>' +
      '<span style="display:inline-block;width:150px;height:4px;margin-left:16px;vertical-align:middle;border-radius:2px;background:#2a2a2a;overflow:hidden">' +
      '<span style="display:block;width:38%;height:100%;background:#38bdf8"></span></span>';
    document.getElementById("cam").appendChild(d);
    void d.offsetWidth;
    d.style.opacity = "1";
  });
  await cursorTo(page, { x: 748, y: 640 }, 240);
  await beat(h, { x: 92, y: 726, w: 610, h: 58 }, "Indexing React for @docs", { pos: "above", dur: 1000, hold: 1040 });
}

export const take = {
  target: PLAN_TARGET,
  async before(h) {
    await ready(h.page);
    await cutTo(h.page, 0, SHOTS.hero);
  },
  route: [
    { key: "marketing", kind: "marketing", title: FLOW.marketing.title, priority: 0, run: (h) => FLOW.marketing.run(h) },
    {
      ...feat("chat-panel"),
      before: undefined,
      // the listing page sits right of the chat sidebar: one eased pan left that ends pushed in
      // on the chat toolbar, while the listing page fades under the panel-colour mask, so only
      // one surface is in frame as the camera moves
      async transitionIn(h) {
        await h.page.evaluate(() => {
          const m = document.getElementById("mask");
          m.style.transition = "opacity 300ms ease";
          m.classList.add("on");
        });
        // matrix target: the pan interpolates linearly in screen space, so the toolbar strip
        // enters frame early instead of the camera swinging through the empty panel area
        SHOT = SHOTS.chatTools;
        await ringOff(h.page);
        await h.page.evaluate(({ s, x, y }) => {
          const c = document.getElementById("cam");
          c.style.transition = "transform 700ms cubic-bezier(.45,0,.25,1)";
          c.style.transform = `matrix(${s},0,0,${s},${-s * x},${-s * y})`;
        }, { s: VW / SHOTS.chatTools.w, x: SHOTS.chatTools.x, y: SHOTS.chatTools.y });
        await h.wait(720);
      },
    },
    {
      ...feat("codebase-config"),
      before: undefined,
      // chat-panel ends with the Settings icon ringed: click it, the cursor stays on the icon while
      // the settings page comes in, and only then does the camera reframe
      async transitionIn(h) {
        const { page } = h;
        await cursorTo(page, { x: 640, y: 120 }, 1);
        await cursorTo(page, { x: 629, y: 57 }, 260);
        await h.wait(160);
        await pulse(page);
        await h.wait(120);
        await swapTo(page, 1);
        await h.wait(380);
        await cursorHide(page);
        await move(page, SHOTS.configTop, 500);
        await h.wait(520);
      },
    },
    {
      ...feat("add-docs"),
      before: undefined,
      // back up the settings page to the @docs section (Add Docs button), extension page masked
      async transitionIn(h) {
        const { page } = h;
        await fadeTo(page, 1, { mask: true, ms: 450 });
        await move(page, SHOTS.addDoc, 550);
        await h.wait(420);
      },
      async run(h, ctx) {
        await feat("add-docs").run(h, ctx);
        await addClick(h);
      },
    },
  ],
  // the final beat: full dialog, title + X in frame, React indexing ringed (camera settled)
  posterFrom: { feature: "add-docs", at: -0.45 },
};
