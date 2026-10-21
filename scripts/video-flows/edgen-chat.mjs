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

// ONE demo data set, re-seeded off camera before every clip:
// - two older chats, "Docker volumes" and "Haiku about Lisbon", each with its own
//   matching answer (the mock answers by prompt, not by turn number);
// - the main conversation "TCP vs UDP": Q1 on llama3.1:8b, then the context-
//   dependent follow-up Q2 after switching to qwen2.5:7b.
const QUESTIONS = [
  "Summarize the difference between TCP and UDP in 3 bullets",
  "Which one would you use for a video call, and why?",
];
const EXTRA_Q = ["Explain Docker volumes", "Write a haiku about Lisbon"];
const ANSWERS = {
  [QUESTIONS[0]]: [
    "Here is the gist:\n\n",
    "- TCP is connection-oriented: it sets up a session and guarantees complete, ordered delivery\n",
    "- UDP is connectionless: it fires off independent datagrams with no delivery or ordering guarantees\n",
    "- TCP trades latency for reliability; UDP trades reliability for speed\n\n",
    "Use TCP for web pages, files and email, and UDP for games, voice and live video.",
  ].join(""),
  [QUESTIONS[1]]: [
    "UDP, in most cases:\n\n",
    "1. A late video frame is useless, so retransmitting it (as TCP would) only adds lag\n",
    "2. Losing a few packets causes a brief glitch, which beats a frozen picture\n",
    "3. WebRTC runs over UDP and adds its own lightweight error correction\n\n",
    "TCP is kept as a fallback for networks that block UDP.",
  ].join(""),
  [EXTRA_Q[0]]: [
    "A Docker volume is storage that lives outside a container's writable layer:\n\n",
    "- It survives when the container is removed or recreated\n",
    "- Several containers can mount the same volume to share data\n",
    "- Docker manages it under /var/lib/docker/volumes, unlike a bind mount\n\n",
    "Create one with docker volume create data and mount it with -v data:/app/data.",
  ].join(""),
  [EXTRA_Q[1]]: [
    "Here is one:\n\n",
    "Yellow tram climbs slow\n",
    "past tiled walls the river light\n",
    "fado in the dusk",
  ].join(""),
};
const tail = (q) => ANSWERS[q].slice(-14);

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
        // The answer depends only on the last user prompt, so every chat gets its
        // own matching answer in every segment and re-recording.
        let body = "";
        req.on("data", (b) => { body += b; });
        req.on("end", () => {
          let q = "";
          try { q = JSON.parse(body).messages.filter((m) => m.role === "user").pop().content; } catch {}
          if (typeof q !== "string") q = JSON.stringify(q);
          const text = ANSWERS[q.trim()] ?? ANSWERS[QUESTIONS[0]];
          res.writeHead(200, { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
          // One character per chunk after the first 32 (see THINK_MS above).
          const chars = [...text];
          const chunks = [chars.slice(0, 32).join(""), ...chars.slice(32)];
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
          setTimeout(tick, 0);
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
        z-index: 2147483646; animation: __flow_ripple .28s ease-out forwards; }
      @keyframes __flow_ripple { from { transform: scale(.6); opacity: 1; } to { transform: scale(2.6); opacity: 0; } }
      html:has(a[href^="/chat"] > svg.lucide-arrow-left) body { zoom: 1.3; }
      html:has(a[href^="/chat"] > svg.lucide-arrow-left) .container { max-width: 740px !important; }
      /* While the chat page remounts after Settings (~0.8 s window set by the take), hide the
         two loading artifacts of its first frames: the "No chats yet" state shown before
         IndexedDB answers, and the connection badge's "Checking..." spinner. */
      html[data-flow-hush] div.text-center.space-y-4.max-w-md,
      html[data-flow-hush] [data-testid="connection-badge"][data-status="checking"] { visibility: hidden !important; }
      #__flow_prompt { position: fixed; z-index: 2147483640; width: 300px; padding: 16px 16px 14px; border-radius: 10px;
        background: #26272b; color: #e8e8ea; border: 1px solid #3a3b40; box-shadow: 0 12px 40px rgba(0,0,0,.6);
        font: 13px/1.4 system-ui, sans-serif; animation: __flow_pop .12s ease-out; }
      #__flow_prompt label { display: block; margin-bottom: 8px; }
      #__flow_prompt input { width: 100%; box-sizing: border-box; padding: 6px 8px; border-radius: 6px; outline: none;
        background: #1a1b1e; color: #fff; border: 2px solid #60a5fa; font: inherit; }
      #__flow_prompt .b { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
      #__flow_prompt button { padding: 5px 14px; border-radius: 6px; font: inherit; border: 1px solid #3a3b40; background: #2f3035; color: #e8e8ea; }
      #__flow_prompt button.ok { background: #3b82f6; border-color: #3b82f6; color: #fff; }
      @keyframes __flow_pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
      #__flow_dip { position: fixed; inset: 0; background: #000; z-index: 2147483645; pointer-events: none; transition: opacity .15s linear; }
    `;
    // The sidebar's "Yesterday" / "Previous 7 Days" groups only hold a "coming next"
    // placeholder and the app does not persist their folded state: fold them again
    // whenever they mount expanded (before paint, so no expanded frame is ever shown).
    const fold = () => {
      for (const d of document.querySelectorAll("button + div.space-y-1.mt-1")) {
        const b = d.previousElementSibling;
        if (/^(Yesterday|Previous 7 Days)$/.test(b.textContent.trim()) && /Grouped history coming next/.test(d.textContent)) b.click();
      }
    };
    new MutationObserver(fold).observe(document.documentElement, { childList: true, subtree: true });
    fold();
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
      setTimeout(() => r.remove(), 300);
    }, true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
};

/** Wait for the streamed answer to `q` to finish and be fully on screen. */
async function waitAnswer(page, q) {
  await page.waitForFunction(() => !/generating/i.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await page.getByText(tail(q), { exact: false }).last().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
}

async function send(h, composer, question) {
  const { page } = h;
  await composer.press("Enter");
  await page.getByText(question, { exact: true }).last().waitFor({ state: "visible", timeout: 10000 });
  await h.wait(300);
}

/** Off camera: ask a question in a fresh chat and wait for the answer. */
async function ask(h, question) {
  const { page } = h;
  const composer = page.locator("textarea:visible").first();
  await page.getByRole("button", { name: "New Chat" }).last().click();
  await composer.waitFor({ state: "visible" });
  await h.wait(200);
  await composer.fill(question);
  await send(h, composer, question);
  await waitAnswer(page, question);
  await h.wait(400);
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

/** Off camera: collapse the sidebar's "Yesterday" group (it only holds a "coming next" placeholder). */
async function collapseYesterday(page) {
  const ph = page.getByText("Grouped history coming next").first();
  if (await ph.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Yesterday" }).first().click().catch(() => {});
    await ph.waitFor({ state: "hidden", timeout: 2000 }).catch(() => {});
  }
}

/** Off camera: the two older chats of the demo data set. Every clip starts with them. */
async function seedHistory(h) {
  await ask(h, EXTRA_Q[0]);
  await rename(h, "Docker volumes");
  await ask(h, EXTRA_Q[1]);
  await rename(h, "Haiku about Lisbon");
  await collapseYesterday(h.page);
}

/** Off camera: the full two-exchange "TCP vs UDP" conversation on qwen2.5:7b. */
async function seedConvo(h, title = "TCP vs UDP") {
  const { page } = h;
  await ask(h, QUESTIONS[0]);
  await page.getByRole("combobox").filter({ hasText: "llama3.1:8b" }).click();
  await page.getByRole("option", { name: "qwen2.5:7b" }).click();
  const composer = page.locator("textarea:visible").first();
  await composer.fill(QUESTIONS[1]);
  await send(h, composer, QUESTIONS[1]);
  await waitAnswer(page, QUESTIONS[1]);
  await h.wait(400);
  await rename(h, title);
  await collapseYesterday(page);
  await pinBottom(page);
}

/** Pin the message list to the bottom so a new bubble and its answer grow in place. */
const pinBottom = (page) =>
  page.evaluate(() => {
    const s = [...document.querySelectorAll("div.overflow-y-auto")].find((e) => e.querySelector(".max-w-3xl"));
    if (s) s.scrollTop = s.scrollHeight;
  });


/** Settings page, once it is on screen: local vs proxy, a discovered model, save. */
async function settingsBody(h, { tail = 700 } = {}) {
  const { page } = h;
  await h.click(page.getByText("Local (Ollama)").first(), { pause: 0, move: 300 });
  await h.beat(800); // Status now reads "Ollama via local"
  await h.click(page.getByText(/Proxy \(recommended\)/).first(), { pause: 0, move: 220 });
  await h.beat(700); // proxy options (LiteLLM, Helicone, OpenRouter, Cloudflare) are on screen
  // Choosing Proxy resets the model to the app's default, which this server does not
  // serve: pick one of the models discovered from /v1/models, then save.
  await h.glide(page.locator("#ai-model"), { offset: 150, ms: 450 });
  await h.click(page.locator("#ai-model"), { pause: 300, move: 200 });
  await h.click(page.getByRole("option", { name: "qwen2.5:7b", exact: true }), { pause: 100, move: 140 });
  await h.glide(page.getByRole("button", { name: "Save Changes" }), { offset: 520, ms: 450, pause: 120 });
  await h.click(page.getByRole("button", { name: "Save Changes" }), { pause: 0, move: 220 });
  await h.beat(tail); // the "Saved" toast
}

/** Tag the topbar's "more" menu button (the right-most menu trigger in the top 60 px). */
const tagMore = (page) =>
  page.locator('button[aria-haspopup="menu"]:visible').evaluateAll((els) => {
    const top = els.filter((e) => e.getBoundingClientRect().top < 60).sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)[0];
    top?.setAttribute("data-rec", "more");
  });

/**
 * Continuous take (v4): the v3 features in the v3 order, filmed as one session.
 * chat -> model-switch (same chat) --topbar menu > Settings--> settings --back
 * arrow--> history (rename the chat on camera, open another, search, back) ->
 * theme (same screen) |CUT| command-center (a separate route the app does not
 * link to, and its load flashes "No chats yet", so it is the one cut).
 */
const featureRun = (key, h) => flow.features.find((f) => f.key === key).run(h);

const BACK = 'a[href^="/chat"]:has(svg.lucide-arrow-left)';
const center = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
// Screen positions measured on camera earlier in the take (the chat item before
// Settings, the back arrow on Settings' arrival) so the cursor can head there early.
const spots = {};

/**
 * On-camera rename. The app asks for the new title with a native window.prompt,
 * which the recorder cannot film. So the prompt is drawn as a dialog next to the
 * item, the title is typed into it, and OK applies exactly what the app's own
 * renameChat() does (put the chat with the new title, then the refresh signal).
 */
async function renameOnCamera(h, item, title) {
  const { page } = h;
  await page.evaluate(() => {
    const orig = window.prompt;
    window.prompt = (msg, def) => {
      window.prompt = orig;
      const d = document.createElement("div");
      d.id = "__flow_prompt";
      d.innerHTML = `<label></label><input /><div class="b"><button class="cancel">Cancel</button><button class="ok">OK</button></div>`;
      d.querySelector("label").textContent = msg;
      document.documentElement.appendChild(d);
      return null;
    };
  });
  await h.click(item.locator("button"), { pause: 60, move: 120, settle: false });
  await h.click(page.getByRole("menuitem", { name: "Rename" }), { pause: 0, move: 120, settle: false });
  const box = await item.boundingBox();
  await page.evaluate(({ x, y, def }) => {
    const d = document.getElementById("__flow_prompt");
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    const i = d.querySelector("input");
    i.value = def;
    setTimeout(() => { i.focus(); i.select(); }, 0);
  }, { x: box.x + box.width + 14, y: Math.max(12, box.y - 30), def: "New chat" });
  await h.wait(250);
  const input = page.locator("#__flow_prompt input");
  await input.focus();
  await input.selectText();
  await input.pressSequentially(title, { delay: 45 });
  await h.click(page.locator("#__flow_prompt button.ok"), { pause: 0, move: 160, settle: false });
  await page.evaluate((title) => new Promise((resolve, reject) => {
    const r = indexedDB.open("edgen-chat");
    r.onerror = () => reject(r.error);
    r.onsuccess = () => {
      const db = r.result;
      const tx = db.transaction("chats", "readwrite");
      const st = tx.objectStore("chats");
      const g = st.getAll();
      g.onsuccess = () => {
        const c = g.result.filter((x) => x.title === "New chat").sort((a, b) => b.updatedAt - a.updatedAt)[0];
        if (c) st.put({ ...c, title, updatedAt: Date.now() });
      };
      tx.oncomplete = () => {
        db.close();
        document.getElementById("__flow_prompt")?.remove();
        localStorage.setItem("edgen-chat:refresh", String(Date.now()));
        window.dispatchEvent(new Event("edgen-chat:refresh"));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  }), title);
  await page.locator("button.group", { hasText: title }).first().waitFor({ state: "visible" });
}

/** A short dip through black (~0.15 s each way) so the one cut reads as a change of view. */
const dip = (page, opaque) =>
  page.evaluate((opaque) => {
    let d = document.getElementById("__flow_dip");
    if (!d) {
      d = document.createElement("div");
      d.id = "__flow_dip";
      d.style.opacity = opaque ? "0" : "1";
      document.documentElement.appendChild(d);
      void d.offsetWidth;
    }
    d.style.opacity = opaque ? "1" : "0";
  }, opaque);

const take = {
  target: 35,
  posterFrom: { feature: "chat", at: -0.3 },
  async before(h) {
    const { page } = h;
    await page.addInitScript(DECORATE);
    await page.evaluate(DECORATE);
    // Warm the routes the take visits, so no loading frame shows on camera.
    for (const u of ["/admin/", "/chat/command-center/"]) {
      await page.evaluate((x) => fetch(x).catch(() => {}), new URL(u, page.url()).href);
    }
    await seedHistory(h);
  },
  route: [
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
        await h.moveTo(b.x + b.width / 2, b.y + b.height / 2, 16);
      },
      run: (h) => featureRun("chat", h),
    },
    {
      key: "model-switch",
      title: "Switch model mid-conversation, context-aware follow-up",
      priority: 2,
      run: (h) => featureRun("model-switch", h),
    },
    {
      key: "settings",
      title: "Settings: provider status, proxy vs local, model and key",
      priority: 3,
      async transitionIn(h) {
        const { page } = h;
        spots.chatItem = center(await page.locator("button.group", { hasText: "New chat" }).first().boundingBox());
        await tagMore(page);
        await h.click(page.locator('[data-rec="more"]'), { pause: 40, move: 200, settle: false });
        await h.nav(page.getByRole("menuitem", { name: "Settings" }), { arrive: page.getByText("Local (Ollama)").first(), move: 140, hold: 80, settleMax: 0 });
      },
      async run(h) {
        spots.back = center(await h.page.locator(BACK).first().boundingBox());
        await settingsBody(h, { tail: 550 });
      },
    },
    {
      key: "history",
      title: "Local chat history: rename, open, search",
      priority: 4,
      async transitionIn(h) {
        const { page } = h;
        // The "Saved" toast leaves on its own while the page scrolls back up and the
        // cursor already heads for the back arrow (one overlapped move).
        await Promise.all([
          page.evaluate(() => document.querySelector("[toast-close]")?.click()),
          h.glide(0, { ms: 420 }),
          h.moveTo(spots.back.x, spots.back.y, 460),
        ]);
        // Hide the remount's loading frames ("No chats yet", "Checking...") for 0.8 s.
        await page.evaluate(() => {
          document.documentElement.setAttribute("data-flow-hush", "");
          setTimeout(() => document.documentElement.removeAttribute("data-flow-hush"), 800);
        });
        await h.click(page.locator(BACK).first(), { pause: 0, move: 40, settle: false });
        // The app does not remember the open chat: reopen it the moment the list renders
        // (the cursor heads for it while the page swaps, so the click lands at once).
        const item = page.locator("button.group", { hasText: "New chat" }).first();
        await Promise.all([h.moveTo(spots.chatItem.x, spots.chatItem.y, 110), item.waitFor({ state: "visible" })]);
        await item.click({ delay: 20 });
        await pinBottom(page);
      },
      async run(h) {
        const { page } = h;
        await h.wait(120);
        await pinBottom(page);
        // The app never auto-titles: name the conversation on camera.
        await renameOnCamera(h, page.locator("button.group", { hasText: "New chat" }).first(), "TCP vs UDP");
        await h.beat(500);
        await h.click(page.locator("button.group", { hasText: "Haiku about Lisbon" }).first(), { pause: 0, move: 180, settle: false });
        await h.beat(700);
        const search = page.getByPlaceholder("Search chats...");
        await h.click(search, { pause: 0, move: 160, settle: false });
        await search.pressSequentially("tcp", { delay: 30 });
        await h.beat(600);
        await h.click(page.locator("button.group", { hasText: "TCP vs UDP" }).first(), { pause: 0, move: 160, settle: false });
        await pinBottom(page);
        await h.beat(600);
        // Clear the search on camera, so the full list is back before the next view.
        await h.click(search, { pause: 0, move: 140, settle: false });
        for (let i = 0; i < 3; i++) await search.press("Backspace", { delay: 40 });
        await h.beat(300);
      },
    },
    {
      key: "theme",
      title: "Light / dark theme toggle",
      priority: 5,
      async run(h) {
        await featureRun("theme", h);
        await h.wait(150);
        await dip(h.page, true); // fade to black into the one cut
        await h.wait(170);
      },
    },
    {
      key: "command-center",
      title: "Command-center layout",
      priority: 6,
      async before(h) {
        const { page } = h;
        await page.goto(page.url().replace(/\/chat\/.*$/, "/chat/command-center/"), { waitUntil: "networkidle" });
        await dip(page, true);
        await page.locator("button.group", { hasText: "TCP vs UDP" }).first().click().catch(() => {});
        await collapseYesterday(page);
        await h.wait(600);
        await pinBottom(page);
        await h.moveTo(640, 400, 16);
      },
      async run(h) {
        await dip(h.page, false); // ...and out of black into the command-center layout
        await featureRun("command-center", h);
      },
    },
  ],
  cutsBefore: ["command-center"],
};


const flow = {
  take,
  url: ({ port }) => `http://127.0.0.1:${port}/chat/`,
  // Plan target 35 s (31.5-38.5 s): compose reads it from here, nothing else sets it.
  target: 35,
  pacing: { featureLead: 100, navDwell: 800 },
  colorScheme: "dark",
  // The end of the chat clip: the whole TCP/UDP answer on screen, cursor parked in the gutter.
  posterFrom: { segment: "chat", at: -0.3 },
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
        await seedHistory(h);
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
        await waitAnswer(page, QUESTIONS[0]);
        await h.moveTo(1180, 470, 220); // park the cursor in the gutter for the poster frame
        await h.beat(700);
      },
    },
    {
      key: "model-switch",
      title: "Switch model mid-conversation, context-aware follow-up",
      priority: 2,
      async before(h) {
        await seedHistory(h);
        await ask(h, QUESTIONS[0]);
        await pinBottom(h.page);
        await h.moveTo(640, 700, 16);
      },
      async run(h) {
        const { page } = h;
        const composer = page.locator("textarea:visible").first();
        await h.click(page.getByRole("combobox").filter({ hasText: "llama3.1:8b" }), { pause: 400, move: 200 });
        await h.click(page.getByRole("option", { name: "qwen2.5:7b" }), { pause: 60, move: 160 });
        await pinBottom(page);
        await composer.pressSequentially(QUESTIONS[1], { delay: 12 });
        await composer.press("Enter");
        await page.getByText(QUESTIONS[1], { exact: true }).last().waitFor({ state: "visible", timeout: 10000 });
        await waitAnswer(page, QUESTIONS[1]);
        await pinBottom(page);
        await h.beat(700);
      },
    },
    {
      key: "settings",
      title: "Settings: provider status, proxy vs local, model and key",
      priority: 3,
      async before(h) {
        const { page } = h;
        await seedHistory(h);
        await seedConvo(h);
        await page.locator('button[aria-haspopup="menu"]:visible').evaluateAll((els) => {
          const top = els.filter((e) => e.getBoundingClientRect().top < 60).sort((a, b) => b.getBoundingClientRect().left - a.getBoundingClientRect().left)[0];
          top?.setAttribute("data-rec", "more");
        });
        // Warm the /admin route off camera (Next prefetches the link once the menu shows it),
        // so the on-camera click lands on the page without a loading frame.
        await page.locator('[data-rec="more"]').click();
        await page.getByRole("menuitem", { name: "Settings" }).hover();
        await page.evaluate((u) => fetch(u).catch(() => {}), new URL("/admin/", page.url()).href);
        await h.wait(900);
        await page.keyboard.press("Escape");
        await h.wait(300);
        await h.moveTo(900, 200, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.locator('[data-rec="more"]'), { pause: 40, move: 160 });
        await h.click(page.getByRole("menuitem", { name: "Settings" }), { pause: 0, move: 140, navDwell: 0 });
        await page.getByText("Local (Ollama)").first().waitFor({ state: "visible" });
        await h.beat(500);
        await settingsBody(h);
      },
    },
    {
      key: "history",
      title: "Local chat history and search",
      priority: 4,
      async before(h) {
        await seedHistory(h);
        await seedConvo(h);
        await h.wait(300);
        await h.moveTo(160, 400, 16);
      },
      async run(h) {
        const { page } = h;
        await h.click(page.locator("button.group", { hasText: "Haiku about Lisbon" }).first(), { pause: 0, move: 200 });
        await h.beat(800);
        await h.click(page.getByPlaceholder("Search chats..."), { pause: 0, move: 160 });
        await page.getByPlaceholder("Search chats...").pressSequentially("tcp", { delay: 30 });
        await h.beat(600);
        await h.click(page.locator("button.group", { hasText: "TCP vs UDP" }).first(), { pause: 0, move: 160 });
        await pinBottom(page);
        await h.beat(800);
      },
    },
    {
      key: "theme",
      title: "Light / dark theme toggle",
      priority: 5,
      async before(h) {
        await seedHistory(h);
        await seedConvo(h);
        await h.moveTo(900, 400, 16);
      },
      async run(h) {
        const { page } = h;
        const toggle = page.getByRole("button", { name: "Theme" }).first();
        await h.click(toggle, { pause: 40, move: 160 });
        await h.click(page.getByRole("menuitemradio", { name: "Light" }), { pause: 0, move: 120 });
        await h.beat(1000);
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
        const { page } = h;
        await seedHistory(h);
        await seedConvo(h);
        // Cut (off camera) into the command-center layout; its load shows an empty "No chats yet" flash, so it stays off camera.
        await page.goto(page.url().replace(/\/chat\/.*$/, "/chat/command-center/"), { waitUntil: "networkidle" });
        await page.locator("button.group", { hasText: "TCP vs UDP" }).first().click().catch(() => {});
        await collapseYesterday(page);
        await h.wait(600);
        await pinBottom(page);
        await h.moveTo(640, 400, 16);
      },
      async run(h) {
        const { page } = h;
        // Same chat engine, second layout: open another stored chat here, then the rail.
        await h.click(page.locator("button.group", { hasText: "Docker volumes" }).first(), { pause: 0, move: 240 });
        await h.beat(900);
        await h.hover(page.getByRole("link", { name: "Admin" }).first(), 220);
        await h.beat(900);
      },
    },
  ],
};

export default flow;
