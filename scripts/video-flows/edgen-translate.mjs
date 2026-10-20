// Live: GitLab Pages static export of PolyDoc (EdgenTranslate). No backend: the
// landing page previews pre-translated sample PDFs, and its uploader hands the
// file to /app, which fakes a run that succeeds after a short timer.
// Flow: hero -> pick Spanish (the side-by-side preview swaps to the translated
// PDF, layout intact) -> upload a PDF, choose French -> Translate -> the run
// lands in the app's translations table, Translating, then Succeeded.
//
// Only the financial_report sample is shown: the demo data's other tabs do not
// match their labels (legal_contract.pdf is a marketing plan, source_code.pdf a
// Smallpdf flyer). The table's "view" action is not opened: the static demo's
// "translated" output is a copy of the input, so it would show English twice.
import os from "node:os";
import path from "node:path";

const SAMPLE = path.join(
  os.homedir(),
  "Desktop/workspace/personal/projects/edgentranslate/public/files/financial_report/financial_report.pdf"
);

// Presentation-only CSS. Everything it touches is below the fold or on /app,
// so injecting it after the hero hold changes nothing on screen.
const STYLE = `
  /* Larger, higher-contrast recorder cursor. */
  #__rec_cursor { width:24px!important; height:24px!important; margin:-12px 0 0 -12px!important;
    background:rgba(15,15,15,.78)!important; border:3px solid #fff!important;
    box-shadow:0 0 0 1px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.4)!important; }
  /* Landing uploader: 50rem tall -> 28rem, so language, file and button share one frame. */
  .h-\\[50rem\\] { height:28rem!important; }
  /* /app table: fit Filename..Actions in the 1280 px frame without sideways scroll. */
  table .w-\\[22rem\\] { width:9.5rem!important; }
  table div.w-12 { width:1.75rem!important; min-width:0!important; }
  table .min-w-\\[8rem\\] { min-width:6rem!important; }
  table .w-\\[12rem\\] { width:10rem!important; }
`;

export default {
  url: "https://edgentranslate-41c1b4.gitlab.io/",
  posterAt: 2,
  // The jump from the previews to the uploader only passes the bottom of the
  // PDFs already on screen: one step instead of a stop on the half-way frame.
  pacing: { scrollStep: 1.25 },
  async run(h) {
    const { page } = h;
    const option = (name) => page.locator("[role=option]:visible").filter({ hasText: name }).first();
    const neutral = (x = 70, y = 330, ms = 600) => h.moveTo(x, y, ms);
    const previewsReady = () =>
      page
        .waitForFunction(
          () => {
            const c = [...document.querySelectorAll(".react-pdf__Page__canvas")].filter((n) => n.width > 0);
            const loading = [...document.querySelectorAll("body *")].some(
              (n) => n.childElementCount === 0 && /Loading Document|Fetching Files/.test(n.textContent || "")
            );
            return c.length >= 2 && !loading;
          },
          null,
          { timeout: 15000, polling: 100 }
        )
        .catch(() => {});

    await page.addStyleTag({ content: STYLE });
    // Warm the HTTP cache for the Spanish sample so its preview swaps fast on camera.
    await page
      .evaluate(() => fetch("/files/financial_report/financial_report_translated_es.pdf").then((r) => r.arrayBuffer()))
      .catch(() => {});
    // Pickers keep a "Select target language" tooltip while focused.
    const blur = async () => {
      await page.waitForTimeout(250); // the combobox hands focus back after its close animation
      await page.evaluate(() => document.activeElement?.blur?.()).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
    };

    // 1. Target language in the hero: the preview re-renders in Spanish.
    const heroPicker = page.locator("button").filter({ hasText: "English" }).first();
    await h.click(heroPicker, { pause: 600 });
    await h.click(option(/Spanish/), { pause: 150 });
    await neutral(); // off the headline
    await blur();
    await page.locator("text=financial_report_translated_es.pdf").first().waitFor({ timeout: 15000 }).catch(() => {});
    await previewsReady();
    await h.dwell(500);

    // Frame the comparison: language picker as the top element, both PDFs below.
    await h.scrollTo(page.locator("button").filter({ hasText: "Spanish" }).first(), { offset: 20, pause: 400 });
    await previewsReady();
    // Point at the translated side, then get out of the way.
    await h.moveTo(960, 470, 900);
    await h.dwell(1700);
    await h.moveTo(1240, 470, 500);
    await h.dwell(700);

    // 2. Upload your own file. The shrunken uploader fits picker, dropzone and
    //    Translate button in one frame, so there is no more scrolling after this.
    const picker2 = page.locator("button").filter({ hasText: "English" }).first(); // hero now reads Spanish
    await h.scrollTo(picker2, { offset: 100, pause: 300 });
    const chooser = page.waitForEvent("filechooser");
    await h.click(page.getByText("Click to add").first(), { pause: 100, move: 500 });
    await (await chooser).setFiles(SAMPLE);
    const attachedAt = Date.now();
    await h.dwell(500);

    // 3. Target language for the upload (while the demo "uploads" the file).
    await h.click(picker2, { pause: 600, move: 600 });
    await h.click(option(/French/), { pause: 200 });
    await blur();
    await neutral(1210, 300, 500);
    // The demo "uploads" for 3 s; Translate before that only raises an error toast.
    const left = 3300 - (Date.now() - attachedAt);
    await h.dwell(Math.max(700, left));

    // 4. Translate. Keep the landing page (file + French + toast) on screen for
    //    ~1.8 s before /app by delaying the route's RSC payload, and let the
    //    mocked run show "Translating..." long enough to read (1.8 s -> 4.2 s).
    await page.route(/\/app\/.*\.txt/, async (route) => {
      await new Promise((r) => setTimeout(r, 1800));
      await route.continue().catch(() => {});
    });
    await page.evaluate(() => {
      const orig = window.setTimeout;
      window.setTimeout = function (fn, d, ...a) {
        return orig.call(window, fn, d === 1800 ? 3600 : d, ...a);
      };
    });
    await h.click(page.locator("button:visible").filter({ hasText: "Translate Files" }).last(), { pause: 0, navDwell: 0 });
    await page.waitForURL(/\/app\/?$/, { timeout: 20000 });
    // The landing toast already did its job: fade it out on /app.
    await page.addStyleTag({ content: "[data-sonner-toaster]{opacity:0!important;transition:opacity .4s ease!important}" });
    await page.locator("table td").filter({ hasText: "financial_report.pdf" }).first().waitFor({ timeout: 10000 });
    // Rest the cursor just under the Status cell so the eye goes there.
    const status = page.locator("table td").filter({ hasText: /Translating|Succeeded/ }).first();
    const sb = await status.boundingBox().catch(() => null);
    if (sb) await h.moveTo(sb.x + sb.width / 2, sb.y + sb.height + 40, 600);

    // 5. Translating... -> Succeeded.
    await page.locator("table td").filter({ hasText: /Succeeded/ }).first().waitFor({ timeout: 15000 });
    await h.dwell(700);
    await h.hover(page.locator("table td").filter({ hasText: /Succeeded/ }).first(), 500);
    await h.dwell(1300);
    if (sb) await h.moveTo(sb.x + sb.width / 2, sb.y + sb.height + 60, 500);
    await h.dwell(1800);
  },
};
