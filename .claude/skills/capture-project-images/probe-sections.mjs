#!/usr/bin/env node
/**
 * probe-sections.mjs — recon helper. Loads a page and lists candidate section /
 * element selectors with their size and nearest heading, so the skill can build a
 * focused shot plan (section/element crops) instead of full-page screenshots.
 *
 * Usage:
 *   node probe-sections.mjs --base <url> [--path /] [--theme D] [--min-h 160]
 */
import { chromium } from 'playwright';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) { args[a.slice(2)] = process.argv[i + 1]?.startsWith('--') || process.argv[i + 1] == null ? true : process.argv[++i]; }
}
const base = (args.base || '').replace(/\/+$/, '');
const path = args.path || '/';
const minH = Number(args['min-h'] || 160);
if (!base) { console.error('need --base'); process.exit(1); }

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: args.theme === 'D' ? 'dark' : 'light' });
const page = await ctx.newPage();
const url = base + (path.startsWith('/') ? path : '/' + path);
try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
await page.waitForTimeout(1500);
// trigger lazy sections
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(500);

const sections = await page.evaluate((minH) => {
  const cssEscape = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : s);
  const seen = new Set();
  const out = [];
  const cands = [...document.querySelectorAll('section, [data-section], main > *, [id], header, footer, dialog, [role="dialog"]')];
  for (const el of cands) {
    const r = el.getBoundingClientRect();
    const h = r.height, w = r.width;
    if (h < minH || w < 200) continue;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
    // build a selector
    let sel = el.tagName.toLowerCase();
    if (el.id) sel = `#${cssEscape(el.id)}`;
    else if (el.getAttribute('data-section')) sel = `[data-section="${el.getAttribute('data-section')}"]`;
    else {
      const cls = (el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/) : []).filter((c) => !/^(css-|sc-)/.test(c)).slice(0, 2);
      if (cls.length) sel += '.' + cls.map(cssEscape).join('.');
    }
    if (seen.has(sel)) continue; seen.add(sel);
    const heading = el.querySelector('h1,h2,h3')?.textContent?.trim().slice(0, 50) || '';
    out.push({ sel, tag: el.tagName.toLowerCase(), y: Math.round(r.top + window.scrollY), w: Math.round(w), h: Math.round(h), heading });
  }
  return out.sort((a, b) => a.y - b.y);
}, minH);

console.log(`# ${url}  (${sections.length} candidates, viewport 1440x900)`);
for (const s of sections) {
  console.log(`y=${String(s.y).padStart(5)}  ${String(s.w)}x${String(s.h)}  ${s.sel.padEnd(36)}  ${s.heading}`);
}
await browser.close();
