/**
 * Fallback flow for a project with no reachable app: a slow pan/zoom (Ken Burns)
 * over its gallery screenshots in public/projects_images/<id>/.
 *
 *   // scripts/video-flows/edgen-code.mjs
 *   import { slideshow } from "./_lib/slideshow.mjs";
 *   export default slideshow({
 *     id: "edgen-code",
 *     images: ["sibicode_chat_L.png", "sibicode_add_doc_L.png", "sibicode_config_L.png"],
 *     perSlide: 6000,             // ms each image is on screen (default 5500)
 *     background: "#0b0b0c",      // letterbox colour
 *     zoom: 1.06,                 // end scale of the slow zoom (1 = none)
 *   });
 *
 * Each image is shown whole (object-fit: contain) first, so it is readable, then
 * zooms gently; slides cross-fade. The recorder's heroDwell still applies to the
 * first image. Pass `focus: [{ x: 0.3, y: 0.2 }, ...]` (0..1, one per image) to
 * pan the zoom toward a region instead of the centre.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..", "..");

export function slideshow({ id, images, perSlide = 5500, background = "#0b0b0c", zoom = 1.06, focus = [], fade = 700, posterAt = 1 }) {
  const dir = path.join(ROOT, "public", "projects_images", id);
  const files = images.map((f) => {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) throw new Error(`slideshow(${id}): missing ${p}`);
    return pathToFileURL(p).href;
  });
  const slides = files
    .map((src, i) => {
      const f = focus[i] || { x: 0.5, y: 0.5 };
      return `<div class="s${i === 0 ? " on" : ""}" style="--ox:${f.x * 100}%;--oy:${f.y * 100}%"><img src="${src}"></div>`;
    })
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><title>${id}</title><style>
html,body{margin:0;height:100%;background:${background};overflow:hidden}
.s{position:fixed;inset:0;opacity:0;transition:opacity ${fade}ms ease;display:flex;align-items:center;justify-content:center}
.s.on{opacity:1}
.s img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:var(--ox) var(--oy);transform:scale(1)}
.s.zoom img{transform:scale(${zoom});transition:transform ${Math.max(1000, perSlide - 1500)}ms ease-in-out}
</style><body>${slides}</body>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `slides-${id}-`));
  const file = path.join(tmp, "index.html");
  fs.writeFileSync(file, html);

  return {
    url: pathToFileURL(file).href,
    posterAt,
    async run(h) {
      const { page } = h;
      await page.waitForFunction(() => [...document.images].every((i) => i.complete));
      for (let i = 0; i < files.length; i++) {
        if (i > 0) {
          await page.evaluate((i) => {
            const s = document.querySelectorAll(".s");
            s[i - 1].classList.remove("on");
            s[i].classList.add("on");
          }, i);
          await h.wait(fade + 1500); // whole image, still, before the zoom starts
        }
        await page.evaluate((i) => document.querySelectorAll(".s")[i].classList.add("zoom"), i);
        await h.wait(Math.max(1500, perSlide - (i > 0 ? fade + 1500 : 0)));
      }
    },
  };
}
