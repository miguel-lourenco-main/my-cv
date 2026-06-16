#!/usr/bin/env node
/**
 * order-images.mjs — build a project's `imagesFirst` array ordered for MARKETING
 * impact, from the `marketingOrder` list in projects.capture.json.
 *
 * Marketing narrative: lead with the single most striking signature screen, then
 * tell a value story (signature -> core feature in its richest/used state ->
 * breadth -> supporting detail -> responsive/utility last). Each scene's themes are
 * kept adjacent (L then D); dark-only projects emit just _D. Any captured file not
 * named in marketingOrder is appended after (sorted) so nothing is dropped.
 *
 * Usage:
 *   node order-images.mjs --project cash-register          # prints the TS array
 *   node order-images.mjs --project cash-register --json   # prints a JSON array
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..');

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[i + 1]?.startsWith('--') || process.argv[i + 1] == null ? true : process.argv[++i];
}
const id = args.project;
if (!id) { console.error('need --project <id>'); process.exit(1); }

const config = JSON.parse(readFileSync(join(__dirname, 'projects.capture.json'), 'utf8'));
const project = config.projects?.[id];
if (!project) { console.error(`unknown project "${id}"`); process.exit(1); }

const imageDir = project.imageDir || id;
const dir = join(REPO_ROOT, 'public', 'projects_images', imageDir);
if (!existsSync(dir)) { console.error(`no image dir: ${dir}`); process.exit(1); }

const files = new Set(readdirSync(dir).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)));
const themes = Array.isArray(project.themes) && project.themes.length ? project.themes : ['L', 'D'];
const order = project.marketingOrder || [];
if (!order.length) console.error(`WARN: project "${id}" has no marketingOrder in projects.capture.json`);

const picked = [];
const seen = new Set();
const take = (f) => { if (files.has(f) && !seen.has(f)) { picked.push(f); seen.add(f); } };

// 1) marketingOrder: each scene's theme variants kept adjacent (L then D).
for (const base of order) {
  for (const t of themes) take(`${base}_${t}.png`);
  // also tolerate non-theme-suffixed or other ext names matching the base
  for (const f of files) if (!seen.has(f) && f.replace(/\.(png|jpe?g|webp|gif)$/i, '').replace(/_(L|D)$/, '') === base) take(f);
}
// 2) anything captured but not listed — appended so nothing is lost.
const remaining = [...files].filter((f) => !seen.has(f)).sort();
for (const f of remaining) take(f);

if (args.json) {
  process.stdout.write(JSON.stringify(picked, null, 2) + '\n');
} else {
  console.log(`// imagesFirst for ${id} (marketing order; ${picked.length} files)`);
  console.log('imagesFirst: [');
  for (const f of picked) console.log(`  "${f}",`);
  console.log('],');
  if (remaining.length) console.error(`\n[note] ${remaining.length} file(s) not in marketingOrder were appended: ${remaining.join(', ')}`);
}
