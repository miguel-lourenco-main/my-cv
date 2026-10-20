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
const THINK_MS = [450, 150];

function serve(port) {
  let turn = 0;
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
        req.resume();
        req.on("end", () => {
          const text = ANSWERS[Math.min(turn++, ANSWERS.length - 1)];
          res.writeHead(200, { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
          // One character per chunk after the first 32 (see THINK_MS above).
          const chars = [...text];
          const chunks = [chars.slice(0, 32).join(""), ...chars.slice(32)];
          const think = THINK_MS[Math.min(turn - 1, THINK_MS.length - 1)];
          let i = 0;
          const tick = () => {
            if (i >= chunks.length) {
              res.write("data: [DONE]\n\n");
              return res.end();
            }
            const delta = { choices: [{ index: 0, delta: { content: chunks[i++] } }] };
            res.write(`data: ${JSON.stringify(delta)}\n\n`);
            setTimeout(tick, 14);
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
async function send(h, composer, question) {
  const { page } = h;
  await composer.press("Enter");
  await page.getByText(question, { exact: true }).last().waitFor({ state: "visible", timeout: 10000 });
  await h.wait(300); // let the bubble + "Thinking" layout settle
}

/** Wait for the streamed answer to finish (the composer shows "generating…" meanwhile). */
const answered = (page) =>
  page.waitForFunction(() => !/generating/i.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});

export default {
  url: ({ port }) => `http://127.0.0.1:${port}/chat/`,
  posterAt: 16.5, // the finished first answer, pointer parked on the composer
  colorScheme: "dark",
  server: ({ port }) => ({
    command: process.execPath,
    args: [fileURLToPath(import.meta.url), "--serve", String(port)],
    url: `http://127.0.0.1:${port}/chat/`,
    readyTimeoutMs: 10000,
  }),
  async prepare(page, { url, port }) {
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
  async run(h) {
    const { page } = h;
    await page.addInitScript(DECORATE);
    await page.evaluate(DECORATE);
    const composer = page.locator("textarea:visible").first();

    // New chat, then start typing as soon as the composer is there.
    await h.click(page.getByRole("button", { name: "New Chat" }).last(), { pause: 100 });
    await composer.waitFor({ state: "visible" });
    await h.type(composer, QUESTIONS[0], 32);
    await h.wait(350);
    await send(h, composer, QUESTIONS[0]);
    await answered(page);
    // Park the pointer on the composer (no hover toolbar on the answer) and hold
    // the finished first answer: this is the poster frame.
    await h.hover(composer, 400);
    await h.wait(3000);

    // Switch the model from the header picker.
    await h.click(page.getByRole("combobox").filter({ hasText: "llama3.1:8b" }), { pause: 700 });
    await h.click(page.getByRole("option", { name: "qwen2.5:7b" }), { pause: 500 });

    // Follow-up: pin the message list to the bottom first so the new bubble and
    // the answer grow in place instead of jumping.
    await page.evaluate(() => {
      const s = [...document.querySelectorAll("div.overflow-y-auto")].find((e) => e.querySelector(".max-w-3xl"));
      if (s) s.scrollTop = s.scrollHeight;
    });
    await h.type(composer, QUESTIONS[1], 32);
    await h.wait(350);
    await send(h, composer, QUESTIONS[1]);
    await answered(page);
    await h.hover(composer, 400);
    await h.wait(1500);

    // Settings from the header's "more" menu (the top bar's menu trigger; the
    // sidebar has another). The page is zoomed and centred by DECORATE and is
    // held at its top: status, then the Proxy / Local choice.
    await page.locator('button[aria-haspopup="menu"]:visible').evaluateAll((els) => {
      const top = els.filter((e) => e.getBoundingClientRect().top < 60).sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)[0];
      top?.setAttribute("data-rec", "more");
    });
    await h.click(page.locator('[data-rec="more"]'), { pause: 600 });
    await h.click(page.getByRole("menuitem", { name: "Settings" }), { pause: 200, navDwell: 3200 });
  },
};
