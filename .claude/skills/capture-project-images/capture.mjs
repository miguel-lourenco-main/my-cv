#!/usr/bin/env node
/**
 * capture.mjs — reusable screenshot engine for CV project images.
 *
 * Drives a project (local dev server or live URL) with Playwright + the system
 * Chrome, walking a declarative "shot plan" to capture a variety of pages and
 * interactive states, in light (_L) and dark (_D) themes, into
 * public/projects_images/<imageDir>/<shot>_<L|D>.png.
 *
 * It is intentionally dumb: all app-specific knowledge lives in the JSON shot
 * plan (projects.capture.json). The orchestrating skill refreshes that plan from
 * each project's source before invoking this engine, so new routes/features get
 * picked up automatically.
 *
 * Usage:
 *   node capture.mjs --project <id> --base <url> \
 *        [--config ./projects.capture.json] [--secrets ./secrets.json] \
 *        [--out <abs dir>] [--only scene1,scene2] [--headed] [--dry-run]
 *
 * Exit codes: 0 ok, 1 fatal (bad args/config), 2 some scenes failed.
 */

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const out = { flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out.flags[key] = true;
      } else {
        out.flags[key] = next;
        i++;
      }
    }
  }
  return out.flags;
}

const args = parseArgs(process.argv.slice(2));
const projectId = args.project;
if (!projectId) {
  console.error('FATAL: --project <id> is required');
  process.exit(1);
}

const configPath = resolve(args.config || join(__dirname, 'projects.capture.json'));
const secretsPath = resolve(args.secrets || join(__dirname, 'secrets.json'));
const headed = !!args.headed;
const dryRun = !!args['dry-run'];
const onlyScenes = args.only ? String(args.only).split(',').map((s) => s.trim()).filter(Boolean) : null;

if (!existsSync(configPath)) {
  console.error(`FATAL: config not found: ${configPath}`);
  process.exit(1);
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const project = config.projects?.[projectId];
if (!project) {
  console.error(`FATAL: project "${projectId}" not in config. Known: ${Object.keys(config.projects || {}).join(', ')}`);
  process.exit(1);
}

let secrets = {};
if (existsSync(secretsPath)) {
  try {
    secrets = JSON.parse(readFileSync(secretsPath, 'utf8'));
  } catch (e) {
    console.error(`WARN: could not parse secrets at ${secretsPath}: ${e.message}`);
  }
}

const base = (args.base || project.liveUrl || '').replace(/\/+$/, '');
if (!base) {
  console.error('FATAL: no --base and no liveUrl in config for this project');
  process.exit(1);
}

// out dir: <repoRoot>/public/projects_images by default (repo root = 4 levels up
// from .claude/skills/capture-project-images/)
const repoRoot = resolve(__dirname, '..', '..', '..');
const outRoot = resolve(args.out || join(repoRoot, 'public', 'projects_images'));
const imageDir = project.imageDir || projectId;
const outDir = join(outRoot, imageDir);

const themes = Array.isArray(project.themes) && project.themes.length ? project.themes : ['L', 'D'];
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
  ...(config.viewports || {}),
  ...(project.viewports || {}),
};
const defaultViewport = project.viewport || viewports.desktop;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const log = (...a) => console.log(`[capture:${projectId}]`, ...a);

function subst(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{\{\s*secret\.([\w.]+)\s*\}\}/g, (_, path) => {
    const v = path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), secrets);
    if (v == null) {
      log(`WARN: missing secret "${path}" (check secrets.json)`);
      return '';
    }
    return String(v);
  });
}

function themeMode(theme) {
  return theme === 'D' ? 'dark' : 'light';
}

/** Init script that pins the theme before app code runs (next-themes / custom localStorage / class). */
function themeInitScript(project, theme) {
  const mode = themeMode(theme);
  const t = project.theme || {};
  const key = t.key || 'theme';
  const darkClass = t.darkClass || 'dark';
  const strategy = t.strategy || 'next-themes';
  return `(() => {
    try {
      var mode = ${JSON.stringify(mode)};
      var key = ${JSON.stringify(key)};
      var darkClass = ${JSON.stringify(darkClass)};
      var strategy = ${JSON.stringify(strategy)};
      if (strategy !== 'class-only' && strategy !== 'none') {
        localStorage.setItem(key, mode);
      }
      var apply = function () {
        var el = document.documentElement;
        if (!el) return;
        if (mode === 'dark') el.classList.add(darkClass);
        else el.classList.remove(darkClass);
        el.style.colorScheme = mode;
      };
      apply();
      document.addEventListener('DOMContentLoaded', apply);
    } catch (e) {}
  })();`;
}

// Injected into every page: hides framework dev chrome (Next.js dev indicator /
// error toasts, Vercel toolbar) so local-dev captures look like production. Uses a
// persistent <style> so it applies to elements mounted after load.
const HIDE_DEV_OVERLAYS = `(() => {
  try {
    var css = 'nextjs-portal,[data-nextjs-toast],[data-nextjs-dialog-overlay],#__next-build-watcher,' +
      '[data-nextjs-dev-tools-button],vercel-live-feedback,[data-vercel-toolbar]{display:none!important;visibility:hidden!important;}';
    var add = function () {
      if (!document.head) return;
      var s = document.createElement('style');
      s.setAttribute('data-capture-hide', '1');
      s.textContent = css;
      document.head.appendChild(s);
    };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  } catch (e) {}
})();`;

async function shoot(page, name, theme, opts = {}) {
  const file = join(outDir, `${name}_${theme}.png`);
  if (dryRun) {
    log(`DRY shot -> ${file}${opts.selector ? ` (el ${opts.selector})` : opts.fullPage ? ' (fullPage)' : ''}`);
    return;
  }
  // Element-focused shot: crop tightly to a section/element (the default style —
  // a CV gallery wants framed sections, not whole-page scrolls).
  if (opts.selector) {
    const loc = page.locator(opts.selector).first();
    await loc.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
    await loc.screenshot({ path: file, animations: 'disabled', ...(opts.padding != null ? {} : {}) });
    log(`shot -> ${imageDir}/${name}_${theme}.png  [el ${opts.selector}]`);
    return;
  }
  // Otherwise a viewport-framed shot (landscape). fullPage only when explicitly asked.
  await page.screenshot({
    path: file,
    fullPage: opts.fullPage === true,
    animations: 'disabled',
    ...(opts.clip ? { clip: opts.clip } : {}),
  });
  log(`shot -> ${imageDir}/${name}_${theme}.png${opts.fullPage ? '  [fullPage]' : ''}`);
}

/** Execute one declarative step against the page. */
async function runStep(page, step, ctx) {
  const [op, raw] = Object.entries(step)[0];
  const val = subst(raw);
  switch (op) {
    case 'goto': {
      const url = String(val).startsWith('http') ? String(val) : base + (String(val).startsWith('/') ? val : '/' + val);
      const nav = async (u) => {
        try { return await page.goto(u, { waitUntil: 'networkidle', timeout: 45000 }); }
        catch { return await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
      };
      let resp = await nav(url);
      // Static-export hosts (GitLab Pages) serve routes either as /path.html or
      // /path/ depending on config. When a clean slashless path 404s, retry those.
      const is404 = () => resp && resp.status() === 404;
      if (is404() && !/[/?#]$/.test(url) && !/\.[a-z0-9]+(\?|$)/i.test(url)) {
        const [p, q] = url.split('?');
        const qs = q ? '?' + q : '';
        resp = await nav(`${p}.html${qs}`);
        if (is404()) resp = await nav(`${p}/${qs}`);
      }
      break;
    }
    case 'wait':
      await page.waitForTimeout(Number(val) || 0);
      break;
    case 'waitFor':
      await page.locator(val).first().waitFor({ state: 'visible', timeout: 20000 });
      break;
    case 'click':
      await page.locator(val).first().click({ timeout: 15000 });
      break;
    case 'fill': {
      const [sel, text] = Array.isArray(raw) ? raw.map(subst) : [val, ''];
      await page.locator(sel).first().fill(String(text), { timeout: 15000 });
      break;
    }
    case 'type': {
      const [sel, text] = Array.isArray(raw) ? raw.map(subst) : [val, ''];
      await page.locator(sel).first().pressSequentially(String(text), { delay: 40, timeout: 15000 });
      break;
    }
    case 'press': {
      if (Array.isArray(raw)) await page.locator(subst(raw[0])).first().press(subst(raw[1]));
      else await page.keyboard.press(val);
      break;
    }
    case 'hover':
      await page.locator(val).first().hover({ timeout: 15000 });
      break;
    case 'select': {
      const [sel, want] = Array.isArray(raw) ? raw.map(subst) : [val, ''];
      const loc = page.locator(sel).first();
      await loc.waitFor({ state: 'attached', timeout: 15000 });
      let done = false;
      for (const arg of [{ label: want }, want]) {
        try { await loc.selectOption(arg, { timeout: 3000 }); done = true; break; } catch { /* try next */ }
      }
      if (!done) {
        // Fallback: pick the option whose text contains `want` (e.g. role "admin").
        await loc.evaluate((el, w) => {
          const opt = [...el.options].find((o) => o.textContent.toLowerCase().includes(String(w).toLowerCase()) && !o.disabled);
          if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); }
        }, want);
      }
      break;
    }
    case 'scroll':
      if (val === 'bottom') await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      else if (val === 'top') await page.evaluate(() => window.scrollTo(0, 0));
      else await page.evaluate((y) => window.scrollBy(0, y), Number(val) || 0);
      break;
    case 'reveal': {
      // Align a section to the top of the viewport so a following viewport shot frames it.
      const offset = Array.isArray(raw) ? Number(raw[1]) || 0 : 0;
      const sel = Array.isArray(raw) ? subst(raw[0]) : val;
      const loc = page.locator(sel).first();
      await loc.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
      await loc.evaluate((el, off) => {
        const y = el.getBoundingClientRect().top + window.scrollY - off;
        window.scrollTo({ top: Math.max(0, y), behavior: 'instant' in window ? 'instant' : 'auto' });
      }, offset);
      break;
    }
    case 'eval':
      await page.evaluate(val);
      break;
    case 'shot':
      if (typeof raw === 'object' && raw !== null) {
        await shoot(page, subst(raw.name), ctx.theme, raw);
      } else {
        await shoot(page, val, ctx.theme);
      }
      break;
    case 'optional':
      for (const s of raw) {
        try { await runStep(page, s, ctx); }
        catch (e) { log(`optional step skipped (${Object.keys(s)[0]}): ${e.message.split('\n')[0]}`); }
      }
      break;
    default:
      log(`WARN: unknown step "${op}" — skipped`);
  }
}

/**
 * Auto-capture every distinct section of a (marketing) page as its own viewport
 * shot. Enumerates real sections (dropping wrappers, header/nav/footer, and — by
 * default — the hero), frames each at the top of the viewport, and names it from
 * its id / heading. Configure via scene.autoSections (true or an options object).
 */
async function captureSections(page, theme, scene) {
  const cfg = scene.autoSections === true ? {} : (scene.autoSections || {});
  const minHeight = cfg.minHeight || 260;
  const headerOffset = cfg.headerOffset ?? 72;
  const skipFirst = cfg.skipFirst !== false; // hero is captured by its own scene
  const exclude = cfg.exclude || [];
  const max = cfg.max || 14;

  await page.waitForTimeout(scene.settle ?? 1000);
  // Trigger lazy/intersection-observed sections, then return to top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 110)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const sections = await page.evaluate(({ minHeight, exclude, skipFirst, max }) => {
    const slug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').split('_').filter(Boolean).slice(0, 4).join('_');
    const excluded = (el) => el.closest('footer,header,nav,[role="banner"],[role="navigation"]') || exclude.some((sx) => { try { return el.matches(sx) || el.closest(sx); } catch { return false; } });
    const cand = [...document.querySelectorAll('section,[data-section],[id],main > div')].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.height < minHeight || r.width < 300) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      return !excluded(el);
    });
    // Drop wrappers: any candidate that contains >= 2 other candidates.
    const leaves = cand.filter((el) => cand.filter((o) => o !== el && el.contains(o)).length < 2);
    // Greedy de-dup by vertical band (keeps outer over inner via height tiebreak).
    const withPos = leaves.map((el) => { const r = el.getBoundingClientRect(); return { el, top: r.top + window.scrollY, h: r.height }; })
      .sort((a, b) => a.top - b.top || b.h - a.h);
    const kept = [];
    for (const it of withPos) {
      const mid = it.top + it.h / 2;
      if (kept.some((k) => mid >= k.top && mid <= k.top + k.h)) continue;
      kept.push(it);
    }
    let chosen = skipFirst ? kept.slice(1) : kept;
    chosen = chosen.slice(0, max);
    const used = {};
    return chosen.map((it, i) => {
      const el = it.el;
      let name = el.id ? slug(el.id) : '';
      if (!name) { const hd = el.querySelector('h1,h2,h3'); name = hd ? slug(hd.textContent) : ''; }
      if (!name) name = `section_${i + 1}`;
      if (used[name]) { used[name]++; name = `${name}_${used[name]}`; } else used[name] = 1;
      el.setAttribute('data-cap-idx', String(i));
      return { idx: i, name, top: Math.round(it.top) };
    });
  }, { minHeight, exclude, skipFirst, max });

  log(`autoSections [${theme}]: ${sections.map((s) => s.name).join(', ') || '(none)'}`);
  let n = 0;
  for (const s of sections) {
    try {
      await runStep(page, { reveal: [`[data-cap-idx="${s.idx}"]`, headerOffset] }, { theme });
      await page.waitForTimeout(cfg.sectionSettle ?? 450);
      await shoot(page, s.name, theme, {});
      n++;
    } catch (e) { log(`section "${s.name}" failed: ${e.message.split('\n')[0]}`); }
  }
  return n;
}

async function runScene(context, scene, theme) {
  const vp = scene.viewport ? viewports[scene.viewport] || defaultViewport : defaultViewport;
  const page = await context.newPage();
  await page.setViewportSize(vp);
  let hadExplicitShot = false;
  try {
    if (scene.path != null) {
      await runStep(page, { goto: scene.path }, { theme });
    }
    if (scene.autoSections) {
      await captureSections(page, theme, scene);
      return true;
    }
    for (const step of scene.steps || []) {
      if (Object.keys(step)[0] === 'shot') hadExplicitShot = true;
      await runStep(page, step, { theme });
    }
    // Auto-capture if the scene declared no explicit shot.
    if (!hadExplicitShot) {
      await page.waitForTimeout(scene.settle ?? 400);
      await shoot(page, scene.name, theme, scene.shotOpts || {});
    }
    return true;
  } catch (e) {
    log(`SCENE FAILED "${scene.name}" [${theme}]: ${e.message.split('\n')[0]}`);
    return false;
  } finally {
    await page.close().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
(async () => {
  if (!dryRun) mkdirSync(outDir, { recursive: true });
  log(`base=${base}`);
  log(`out=${outDir}`);
  log(`themes=${themes.join(',')}  scenes=${(project.scenes || []).map((s) => s.name).join(', ')}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: !headed,
    args: ['--hide-scrollbars'],
  });

  let failures = 0;
  let captured = 0;
  try {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: defaultViewport,
        colorScheme: themeMode(theme),
        deviceScaleFactor: project.deviceScaleFactor || config.deviceScaleFactor || 2,
        reducedMotion: 'reduce',
      });
      await context.addInitScript(themeInitScript(project, theme));
      await context.addInitScript(HIDE_DEV_OVERLAYS);

      // Login / shared prelude — runs once per theme; session persists in context.
      if (project.login && project.login.length) {
        const lp = await context.newPage();
        try {
          await runStep(lp, { goto: project.start || '/' }, { theme });
          for (const step of project.login) await runStep(lp, step, { theme });
          log(`login ok [${theme}]`);
        } catch (e) {
          log(`LOGIN FAILED [${theme}]: ${e.message.split('\n')[0]} — protected scenes may be empty`);
          failures++;
        } finally {
          await lp.close().catch(() => {});
        }
      }

      for (const scene of project.scenes || []) {
        if (onlyScenes && !onlyScenes.includes(scene.name)) continue;
        if (scene.themes && !scene.themes.includes(theme)) continue;
        const ok = await runScene(context, scene, theme);
        if (ok) captured++; else failures++;
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  log(`done. scenes captured=${captured} failures=${failures}`);
  process.exit(failures > 0 ? 2 : 0);
})().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
