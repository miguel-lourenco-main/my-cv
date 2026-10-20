// edgen-code (SIBICode VS Code extension) has no deployment and no repo to run,
// so the video is a "virtual camera" over its three gallery screenshots.
//
// All three screenshots share one IDE layout, so they are stacked in a single
// layer and one camera transform frames them all: a cross-fade never changes
// scale (no snap-back), and every framing is a rect inside the screenshot with
// the viewport's 1.6 aspect, so there are no letterbox bands. Story:
//   hero  - chat panel + extension overview (the main surface), held still
//   config - @codebase index / @docs, framed on the left panel, then a pan down
//   add_doc - the "Add documentation" dialog, framed on the dialog
//   end   - back to the chat surface, held still
// The recorder's cursor overlay is hidden: nothing is clicked here.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const DIR = path.join(ROOT, "public", "projects_images", "edgen-code");
const IMAGES = ["sibicode_chat_D.png", "sibicode_config_D.png", "sibicode_add_doc_D.png"];
const SRC_W = 1676;
const SRC_H = 957;
const VW = 1280;
const ASPECT = 1.6; // 1280x800

// Camera framings in source pixels (x, y, width); height = width / 1.6.
const SHOTS = {
  // Whole chat panel + overview text: right edge after "Auto Update" (x 1377)
  // and before the gear / Installation box (x 1392+), bottom above the status bar.
  hero: { x: 0, y: 0, w: 1385 },
  // Left panel fills ~85% of the frame: @codebase index, @docs, Help center.
  configTop: { x: 0, y: 70, w: 900 },
  // Same scale, panned down to Help center / Keyboard shortcuts; bottom edge
  // (860) falls between two shortcut rows so no line is cut in half.
  configBottom: { x: 0, y: 298, w: 900 },
  // The Add documentation dialog (x 76-718, y 208-792) with a margin.
  addDoc: { x: 0, y: 204, w: 980 },
};

const cam = ({ x, y, w }) => {
  const h = w / ASPECT;
  if (x < 0 || y < 0 || x + w > SRC_W || y + h > SRC_H) throw new Error(`edgen-code: shot out of bounds ${JSON.stringify({ x, y, w })}`);
  const s = VW / w;
  return `scale(${s.toFixed(5)}) translate(${-x}px, ${-y}px)`;
};

const FADE = 900;
const MOVE = 1500;

function buildPage() {
  const imgs = IMAGES.map((f, i) => {
    const p = path.join(DIR, f);
    if (!fs.existsSync(p)) throw new Error(`edgen-code: missing ${p}`);
    return `<img class="${i === 0 ? "on" : ""}" src="${pathToFileURL(p).href}">`;
  }).join("");
  const html = `<!doctype html><meta charset="utf-8"><title>edgen-code</title><style>
html,body{margin:0;height:100%;background:#181818;overflow:hidden;cursor:none}
#__rec_cursor{display:none!important}
#cam{position:fixed;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px;transform-origin:0 0;
  transform:${cam(SHOTS.hero)};transition:transform ${MOVE}ms cubic-bezier(.45,0,.25,1);will-change:transform}
#cam img{position:absolute;left:0;top:0;width:${SRC_W}px;height:${SRC_H}px;opacity:0;transition:opacity ${FADE}ms ease}
#cam img.on{opacity:1}
/* right pane dimmed while the dialog is framed, so its cut-off text reads as backdrop */
#dim{position:absolute;left:800px;top:0;right:0;bottom:0;background:#000;opacity:0;transition:opacity ${FADE}ms ease}
#dim.on{opacity:.93}
/* the overview's floating scroll-to-top button would sit cut at the hero's bottom edge */
#patch{position:absolute;left:1300px;top:852px;width:62px;height:56px;background:#181818}
</style><body><div id="cam">${imgs}<div id="patch"></div><div id="dim"></div></div></body>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "slides-edgen-code-"));
  const file = path.join(tmp, "index.html");
  fs.writeFileSync(file, html);
  return pathToFileURL(file).href;
}

export default {
  url: buildPage(),
  posterAt: 2,
  colorScheme: "dark",
  async run(h) {
    const { page } = h;
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));

    const show = (i) =>
      page.evaluate((i) => document.querySelectorAll("#cam img").forEach((im, k) => im.classList.toggle("on", k === i)), i);
    const move = (t) => page.evaluate((t) => (document.getElementById("cam").style.transform = t), t);
    const dim = (on) => page.evaluate((on) => document.getElementById("dim").classList.toggle("on", on), on);

    // Hero: the recorder already held it 3.5 s; give the overview text more time.
    await h.wait(2500);

    // Settings: cross-fade and frame the left panel in the same motion.
    await show(1);
    await move(cam(SHOTS.configTop));
    await h.wait(MOVE + 2600);
    await move(cam(SHOTS.configBottom));
    await h.wait(MOVE + 2400);

    // Add documentation dialog.
    await show(2);
    await dim(true);
    await move(cam(SHOTS.addDoc));
    await h.wait(MOVE + 3800);

    // Close on the main surface: the chat panel and overview, held still.
    await dim(false);
    await show(0);
    await move(cam(SHOTS.hero));
    await h.wait(MOVE + 3800);
  },
};
