// MIGRATED MECHANICALLY to the segment shape; the recorder for this project
// should re-check timing and features. No landing page: no marketing segment.
// Edgen Chat is a browser-only chat UI for Ollama / OpenAI-compatible servers,
// deployed as a static export on GitLab Pages (https://edgenchat-d831b2.gitlab.io).
// It has no backend, and Chromium blocks the hosted page from calling a model on
// 127.0.0.1 (Local Network Access), so the recorder runs this same file with
// --serve on the flow's port: it serves the repo's static export (out/, the same
// build that is deployed) plus a tiny OpenAI-compatible mock on one origin:
// GET /v1/models and a streamed POST /v1/chat/completions.
// prepare() points the app's local settings at that origin, off camera.
// Walkthrough: empty state -> new chat -> ask a general question -> streamed
// list answer -> switch model -> context-dependent follow-up -> settings page.
// The public repo has no working document upload (the composer's paperclip has
// no handler), so the flow deliberately never touches it.
// Markdown bold/code is not rendered by the app (lists are), so the mock
// answers are plain text.
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(os.homedir(), "Desktop/workspace/personal/projects/edgenchat/out");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain" };
const MODELS = ["llama3.1:8b", "qwen2.5:7b", "mistral:7b"];

// Q1 is a neutral general-knowledge question (the "general chat" feature);
// Q2 is a follow-up that only makes sense with the conversation's context,
// asked after switching the model.
const QUESTIONS = [
  "Summarize the difference between TCP and UDP in 3 bullets",
  "Which one would you use for a video call, and why?",
];
const ANSWERS = [
  [
    "Here is the gist:\n\n",
    "- TCP is connection-oriented: it sets up a session and guarantees complete, ordered delivery\n",
    "- UDP is connectionless: it fires off independent datagrams with no delivery or ordering guarantees\n",
    "- TCP trades latency for reliability; UDP trades reliability for speed\n\n",
    "Use TCP for web pages, files and email, and UDP for games, voice and live video.",
  ].join(""),
  [
    "UDP, in most cases:\n\n",
    "1. A late video frame is useless, so retransmitting it (as TCP would) only adds lag\n",
    "2. Losing a few packets causes a brief glitch, which beats a frozen picture\n",
    "3. WebRTC runs over UDP and adds its own lightweight error correction\n\n",
    "TCP is kept as a fallback for networks that block UDP.",
  ].join(""),
];
// The app repaints the streamed answer only when the accumulated length hits a
// multiple of 32, so the first 32 characters go out as one chunk: the
// "Thinking" skeleton is replaced by text straight away instead of jumping.
const THINK_MS = [0, 0];

function serve(port) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Private-Network": "true",
  };
  http
    .createServer((req, res) => {
      if (req.method === "OPTIONS") {
        res.writeHead(204, cors);
        return res.end();
      }
      if (req.url.startsWith("/v1/models")) {
        res.writeHead(200, { ...cors, "Content-Type": "application/json" });
        return res.end(JSON.stringify({ object: "list", data: MODELS.map((id) => ({ id, object: "model" })) }));
      }
      if (req.url.startsWith("/v1/chat/completions")) {
        // The answer depends on how many user turns the conversation has, not on a
        // server-wide counter, so every segment (its own browser context) and any
        // re-recording gets the same answer for the same question.
        let body = "";
        req.on("data", (b) => { body += b; });
        req.on("end", () => {
          let turn = 1;
          try { turn = JSON.parse(body).messages.filter((m) => m.role === "user").length; } catch {}
          const text = ANSWERS[Math.min(Math.max(turn, 1), ANSWERS.length) - 1];
          res.writeHead(200, { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
          // One character per chunk after the first 32 (see THINK_MS above).
          const chars = [...text];
          const chunks = [chars.slice(0, 32).join(""), ...chars.slice(32)];
          const think = THINK_MS[Math.min(Math.max(turn, 1), THINK_MS.length) - 1];
          let i = 0;
          const tick = () => {
            if (i >= chunks.length) {
              res.write("data: [DONE]\n\n");
              return res.end();
            }
            const delta = { choices: [{ index: 0, delta: { content: chunks[i++] } }] };
            res.write(`data: ${JSON.stringify(delta)}\n\n`);
            setTimeout(tick, 8);
          };
          setTimeout(tick, think); // a short "thinking" beat before the first token
        });
        return;
      }
      // Static export (trailingSlash: true -> dir/index.html).
      const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let file = path.join(OUT, path.normalize(rel));
      if (!file.startsWith(OUT)) file = OUT;
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      if (!fs.existsSync(file)) file = path.join(OUT, "404.html");
      res.writeHead(file.endsWith("404.html") && !rel.endsWith("404.html") ? 404 : 200,
        { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    })
    .listen(port, "127.0.0.1");
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === "--serve") {
  serve(Number(process.argv[3]));
}

/**
 * Runs in the page (now and on any later full load): a pointer that reads on
 * the app's black theme, a click ripple, and a zoomed, centred Settings page
 * (its form is a ~600px column pinned left, which leaves half of a 1280px frame
 * empty). The recorder's own cursor div does not survive here: the app's
 * hydration re-renders the document (settings come from localStorage, so the
 * static HTML never matches) and drops nodes injected before it. So this draws
 * its own pointer after hydration and re-attaches it if it is ever removed.
 */
const DECORATE = () => {
  const apply = () => {
    if (window.__flowDecorated) return;
    window.__flowDecorated = true;
    const arrow =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
          '<path d="M4 2 L4 23 L9.5 17.8 L13.2 25.5 L16.6 24 L13 16.5 L20.5 16.5 Z" ' +
          'fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>',
      );
    const st = document.createElement("style");
    st.id = "__flow_style";
    st.textContent = `
      #__rec_cursor { display: none !important; }
      #__flow_cursor { position: fixed; left: 0; top: 0; width: 28px; height: 28px; margin: -2px 0 0 -4px;
        background: url("${arrow}") no-repeat 0 0 / 28px 28px; pointer-events: none; z-index: 2147483647;
        transform-origin: 4px 2px; transition: scale .12s ease; filter: drop-shadow(0 1px 3px rgba(0,0,0,.9)); }
      .__flow_ripple { position: fixed; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%;
        border: 2px solid rgba(96,165,250,.95); background: rgba(96,165,250,.25); pointer-events: none;
        z-index: 2147483646; animation: __flow_ripple .5s ease-out forwards; }
      @keyframes __flow_ripple { from { transform: scale(.6); opacity: 1; } to { transform: scale(2.6); opacity: 0; } }
      html:has(a[href^="/chat"] > svg.lucide-arrow-left) body { zoom: 1.3; }
      html:has(a[href^="/chat"] > svg.lucide-arrow-left) .container { max-width: 740px !important; }
    `;
    const c = document.createElement("div");
    c.id = "__flow_cursor";
    c.style.transform = "translate(-100px,-100px)";
    const attach = () => {
      if (!st.isConnected) document.head.appendChild(st);
      if (!c.isConnected) document.documentElement.appendChild(c);
    };
    attach();
    setInterval(attach, 200);
    window.addEventListener("mousemove", (e) => { c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, true);
    window.addEventListener("mouseup", () => { c.style.scale = "1"; }, true);
    window.addEventListener("mousedown", (e) => {
      c.style.scale = "0.85";
      const r = document.createElement("div");
      r.className = "__flow_ripple";
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      document.documentElement.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
};

/** Send the composer's text and wait until the user bubble is on screen. */
const EXTRA_Q = ["Explain Docker volumes", "Write a haiku about Lisbon"];

/** Off camera: ask a question in a fresh chat and wait for the answer. */
async function ask(h, question) {
  const { page } = h;
  const composer = page.locator("textarea:visible").first();
  await page.getByRole("button", { name: "New Chat" }).last().click();
  await composer.waitFor({ state: "visible" });
  await composer.fill(question);
  await send(h, composer, question);
  await answered(page);
  // The full mock answer must be on screen before the clip starts (no half-streamed head frames).
  await page.getByText(/live video\./).last().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  await h.wait(500);
}

/** Off camera: the full two-exchange conversation on qwen2.5:7b, titled. Every clip after model-switch starts from this. */
async function seedConvo(h, title = "TCP vs UDP") {
  const { page } = h;
  await ask(h, QUESTIONS[0]);
  await page.getByRole("combobox").filter({ hasText: "llama3.1:8b" }).click();
  await page.getByRole("option", { name: "qwen2.5:7b" }).click();
  const composer = page.locator("textarea:visible").first();
  await composer.fill(QUESTIONS[1]);
  await send(h, composer, QUESTIONS[1]);
  await answered(page);
  await page.getByText(/block UDP\./).last().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  await h.wait(400);
  await rename(h, title);
  await pinBottom(page);
}

/** Off camera: give the newest "New chat" a real title (the app never auto-titles). */
async function rename(h, title) {
  const { page } = h;
  const item = page.locator("button.group", { hasText: "New chat" }).first();
  await item.hover();
  await item.locator("button").click({ force: true });
  page.once("dialog", (d) => d.accept(title));
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await page.locator("button.group", { hasText: title }).first().waitFor({ state: "visible" });
}

async function send(h, composer, question) {
  const { page } = h;
  await composer.press("Enter");
  await page.getByText(question, { exact: true }).last().waitFor({ state: "visible", timeout: 10000 });
  await h.wait(300); // let the bubble + "Thinking" layout settle
}

/** Wait for the streamed answer to finish (the composer shows "generating…" meanwhile). */
const answered = (page) =>
  page.waitForFunction(() => !/generating/i.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});

/** Pin the message list to the bottom so a new bubble and its answer grow in place. */
const pinBottom = (page) =>
  page.evaluate(() => {
    const s = [...document.querySelectorAll("div.overflow-y-auto")].find((e) => e.querySelector(".max-w-3xl"));
    if (s) s.scrollTop = s.scrollHeight;
  });

export default {
  url: ({ port }) => `http://127.0.0.1:${port}/chat/`,
  // Plan target 35 s (31.5-38.5 s): compose reads it from here, nothing else sets it.
  target: 35,
  pacing: { featureLead: 100, navDwell: 800 },
  colorScheme: "dark",
  posterFrom: { segment: "model-switch", at: -0.5 }, // both exchanges fully streamed, qwen2.5:7b selected
  server: ({ port }) => ({
    command: process.execPath,
    args: [fileURLToPath(import.meta.url), "--serve", String(port)],
    url: `http://127.0.0.1:${port}/chat/`,
    readyTimeoutMs: 10000,
  }),
  async setup(page, { url, port }) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate((base) => {
      localStorage.setItem(
        "edgen-chat:settings:v1",
        JSON.stringify({
          ai: { providerId: "openai_compatible", connectionMode: "proxy", model: "llama3.1:8b", proxyBaseUrl: base, baseUrl: "", apiKey: "demo-key" },
          voice: { autoSpeak: false },
        }),
      );
    }, `http://127.0.0.1:${port}`);
  },
  async beforeEach(h) {
    await h.page.addInitScript(DECORATE);
    await h.page.evaluate(DECORATE);
    await h.wait(250);
  },
  features: [
    {
      key: "chat",
      title: "New chat, streamed answer",
      priority: 1,
      async before(h) {
        await h.page.getByRole("button", { name: "New Chat" }).last().click();
        const composer = h.page.locator("textarea:visible").first();
        await composer.waitFor({ state: "visible" });
        await h.wait(400);
        const b = await composer.boundingBox();
        await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 16); // cursor already on the composer
      },
      async run(h) {
        const { page } = h;
        const composer = page.locator("textarea:visible").first();
        await h.click(composer, { pause: 0, move: 60 });
        await composer.pressSequentially(QUESTIONS[0], { delay: 12 });
        await composer.press("Enter");
        await page.getByText(QUESTIONS[0], { exact: true }).last().waitFor({ state: "visible", timeout: 10000 });
        await answered(page);
        await page.getByText(/live video\./).last().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
        await h.beat(800);
      },
    },
    {
      key: "model-switch",
      title: "Switch model mid-conversation, context-aware follow-up",
      priority: 2,
      async before(h) {
        await ask(h, QUESTIONS[0]);
        await pinBottom(h.page);
        await h.moveTo(640, 700, 16);
      },
      async run(h) {
        const { page } = h;
        const composer = page.locator("textarea:visible").first();
        await h.click(page.getByRole("combobox").filter({ hasText: "llama3.1:8b" }), { pause: 300, move: 200 });
        await h.click(page.getByRole("option", { name: "qwen2.5:7b" }), { pause: 60, move: 160 });
        await pinBottom(page);
        await composer.pressSequentially(QUESTIONS[1], { delay: 12 });
        await composer.press("Enter");
        await page.getByText(QUESTIONS[1], { exact: true }).last().waitFor({ state: "visible", timeout: 10000 });
        await answered(page);
        await page.getByText(/block UDP\./).last().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
        await pinBottom(page);
        await h.beat(700);
      },
    },
    {
      key: "settings",
      title: "Settings: provider status, proxy vs local, model and key",
      priority: 3,
      async before(h) {
        await seedConvo(h);
        await h.page.locator('button[aria-haspopup="menu"]:visible').evaluateAll((els) => {
          const top = els.filter((e) => e.getBoundingClientRect().top < 60).sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)[0];
          top?.setAttribute("data-rec", "more");
        });
        await h.moveTo(900, 200, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.locator('[data-rec="more"]'), { pause: 40, move: 160 });
        await h.click(page.getByRole("menuitem", { name: "Settings" }), { pause: 40, move: 140, navDwell: 100 });
        await page.getByText("Local (Ollama)").first().waitFor({ state: "visible" });
        await h.waitForStill(1200);
        await h.beat(900);
        await h.click(page.getByText("Local (Ollama)").first(), { pause: 0, move: 160 });
        await h.beat(900);
        await h.click(page.getByText(/Proxy \(recommended\)/).first(), { pause: 0, move: 160 });
        await h.click(page.getByText("Proxy options (click to learn more)"), { pause: 0, move: 140 });
        await h.beat(900);
        await h.glide(page.getByLabel("API Key").or(page.locator("#ai-model")).first(), { offset: 200, ms: 450 }).catch(() => {});
        await h.beat(800);
      },
    },
    {
      key: "history",
      title: "Local chat history and search",
      priority: 4,
      async before(h) {
        await ask(h, EXTRA_Q[0]);
        await rename(h, "Docker volumes");
        await ask(h, EXTRA_Q[1]);
        await rename(h, "Haiku about Lisbon");
        await seedConvo(h);
        await h.wait(300);
        await h.moveTo(160, 400, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.locator("button.group", { hasText: "Haiku about Lisbon" }).first(), { pause: 0, move: 200 });
        await h.beat(600);
        await h.click(page.getByPlaceholder("Search chats..."), { pause: 0, move: 160 });
        await page.getByPlaceholder("Search chats...").pressSequentially("tcp", { delay: 30 });
        await h.beat(500);
        await h.click(page.locator("button.group", { hasText: "TCP vs UDP" }).first(), { pause: 0, move: 160 });
        await h.beat(800);
      },
    },
    {
      key: "theme",
      title: "Light / dark theme toggle",
      priority: 5,
      async before(h) {
        await seedConvo(h);
        await h.moveTo(900, 400, 16);
      },
      async run(h) {
        const { page } = h;
        const toggle = page.getByRole("button", { name: "Theme" }).first();
        await h.click(toggle, { pause: 40, move: 160 });
        await h.click(page.getByRole("menuitemradio", { name: "Light" }), { pause: 0, move: 120 });
        await h.beat(900);
        await h.click(toggle, { pause: 40, move: 140 });
        await h.click(page.getByRole("menuitemradio", { name: "Dark" }), { pause: 0, move: 120 });
        await h.beat(300);
      },
    },
    {
      key: "command-center",
      title: "Command-center layout",
      priority: 6,
      async before(h) {
        await seedConvo(h);
        // Cut (off camera) into the command-center layout; its load shows an empty "No chats yet" flash, so it stays off camera.
        await h.page.goto(h.page.url().replace(/\/chat\/.*$/, "/chat/command-center/"), { waitUntil: "networkidle" });
        await h.page.locator("button.group", { hasText: "TCP vs UDP" }).first().click().catch(() => {});
        await h.wait(600);
        await h.moveTo(640, 400, 16);
      },
      async run(h) {
        const { page } = h;
        await h.hover(page.getByRole("link", { name: "Chat" }).first(), 160);
        await h.beat(350);
        await h.hover(page.getByRole("link", { name: "Admin" }).first(), 160);
        await h.beat(450);
      },
    },
  ],
};
