#!/usr/bin/env node
/**
 * discover-projects.mjs — discover the user's GitLab web-app projects by merging
 * three sources, so the capture skill never works from a hardcoded list:
 *
 *   1. Cloud   — `glab api` (projects you're a member of) + GitLab Pages deployments.
 *   2. Local   — sibling repos under PROJECTS_ROOT whose origin points at GitLab.
 *   3. Catalog — this CV's app/components/projects/projects.data.ts (enrichment:
 *                which projects already have a gallery, their live URL + cv id).
 *
 * Entries are merged by repo SLUG (last path segment, de-cased, _/- stripped) which
 * reconciles namespace drift (e.g. the CV lists o-guardanapo under the wrong group)
 * and id↔repo mismatches (cv id "agentic-hub" ↔ repo "agentichub").
 *
 * By default only WEB-APP projects are shown (have a Pages deployment, a local web
 * framework, or are already in the CV). Pass --all to include everything.
 *
 * Usage:
 *   node discover-projects.mjs            # pretty table
 *   node discover-projects.mjs --json     # machine-readable array
 *   node discover-projects.mjs --all      # include non-web repos
 *   node discover-projects.mjs --no-pages # skip Pages lookups (faster, no live URLs)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..', '..'); // my-cv repo root
const PROJECTS_ROOT = resolve(REPO_ROOT, '..');         // siblings live here
const CATALOG_PATH = join(REPO_ROOT, 'app', 'components', 'projects', 'projects.data.ts');

const flags = new Set(process.argv.slice(2));
const asJson = flags.has('--json');
const showAll = flags.has('--all');
const skipPages = flags.has('--no-pages');

const WEB_DEPS = ['next', 'react', 'react-dom', 'react-scripts', 'vite', '@remix-run/react', 'vue', '@angular/core', 'svelte', 'astro'];

const slugify = (s) => s.toLowerCase().replace(/[-_\s]/g, '');
const lastSeg = (path) => path.replace(/\.git$/, '').split('/').filter(Boolean).pop() || path;

// ---------------------------------------------------------------------------
// glab helpers
// ---------------------------------------------------------------------------
function glab(apiPath) {
  const out = execFileSync('glab', ['api', apiPath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(out);
}
function glabSafe(apiPath) {
  try { return glab(apiPath); } catch { return null; }
}

// ---------------------------------------------------------------------------
// 1. Cloud
// ---------------------------------------------------------------------------
function fetchCloud() {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    let batch;
    try {
      batch = glab(`projects?membership=true&simple=true&archived=false&per_page=100&page=${page}`);
    } catch (e) {
      if (page === 1) console.error(`[discover] WARN: glab cloud fetch failed: ${e.message.split('\n')[0]}`);
      break;
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  // Drop repos GitLab flagged for deletion, and the CV repo itself (the gallery host).
  return all.filter((p) => !/-deletion_scheduled-\d+$/.test(p.path_with_namespace) && !/\/my-cv$/.test(p.path_with_namespace));
}

function fetchPagesUrl(projectId) {
  if (skipPages) return null;
  const pages = glabSafe(`projects/${projectId}/pages`);
  if (pages && Array.isArray(pages.deployments) && pages.deployments.length > 0) {
    return (pages.url || pages.deployments[0].url || '').replace(/\/+$/, '') || null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. Local sibling repos with a GitLab remote
// ---------------------------------------------------------------------------
function gitlabPathFromRemote(url) {
  // git@gitlab.com[-alias]:group/sub/repo.git  OR  https://gitlab.com/group/repo(.git)
  let m = url.match(/gitlab\.com[^:]*:(.+?)(?:\.git)?$/);
  if (m) return m[1];
  m = url.match(/gitlab\.com\/(.+?)(?:\.git)?$/);
  return m ? m[1] : null;
}

// Web package may live at the repo root or in a monorepo subdir (e.g. atelier/frontend).
const WEB_SUBDIRS = ['', 'frontend', 'web', 'client', 'app', 'site', 'apps/web', 'apps/frontend', 'packages/web', 'packages/app'];

function frameworkOfPkg(dir) {
  const pkgPath = join(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const hit = WEB_DEPS.find((d) => deps[d]);
      if (hit) return hit.replace('/react', '').replace('@', '');
      const scripts = pkg.scripts || {};
      if (/(next|vite|craco|react-scripts|astro|ng )/.test(Object.values(scripts).join(' '))) return 'web';
    } catch { /* ignore */ }
  }
  if (existsSync(join(dir, 'app', 'page.tsx')) || existsSync(join(dir, 'pages')) || existsSync(join(dir, 'public', 'index.html'))) return 'web';
  return null;
}

/** Find the web package dir (root or a known subdir) and its framework. */
function detectWeb(repoDir) {
  for (const sub of WEB_SUBDIRS) {
    const dir = sub ? join(repoDir, sub) : repoDir;
    if (!existsSync(join(dir, 'package.json')) && !existsSync(join(dir, 'public', 'index.html'))) continue;
    const fw = frameworkOfPkg(dir);
    if (fw) return { framework: fw, webDir: dir };
  }
  return { framework: null, webDir: null };
}

function detectDevCommand(dir) {
  if (!dir) return null;
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const pm = existsSync(join(dir, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(dir, 'yarn.lock')) ? 'yarn' : 'npm';
    if (pkg.scripts?.dev) return pm === 'npm' ? 'npm run dev' : `${pm} dev`;
    if (pkg.scripts?.start) return pm === 'npm' ? 'npm start' : `${pm} start`;
  } catch { /* ignore */ }
  return null;
}

function scanLocal() {
  const out = {};
  let entries;
  try { entries = readdirSync(PROJECTS_ROOT, { withFileTypes: true }); } catch { return out; }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const dir = join(PROJECTS_ROOT, ent.name);
    if (dir === REPO_ROOT) continue; // never target the CV repo itself
    if (!existsSync(join(dir, '.git'))) continue;
    let remote;
    try {
      remote = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch { continue; }
    if (!/gitlab\.com/.test(remote)) continue;
    const gitlabPath = gitlabPathFromRemote(remote);
    if (!gitlabPath) continue;
    const { framework, webDir } = detectWeb(dir);
    out[slugify(lastSeg(gitlabPath))] = {
      localDir: dir,
      localName: ent.name,
      gitlabPath,
      framework,
      webDir,
      devCommand: detectDevCommand(webDir),
    };
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. CV catalog (regex extraction — never executes TS)
// ---------------------------------------------------------------------------
function parseCatalog() {
  const out = {};
  if (!existsSync(CATALOG_PATH)) return out;
  const src = readFileSync(CATALOG_PATH, 'utf8');
  const idRe = /\bid:\s*"([^"]+)"/g;
  const ids = [...src.matchAll(idRe)];
  for (let i = 0; i < ids.length; i++) {
    const start = ids[i].index;
    const end = i + 1 < ids.length ? ids[i + 1].index : src.length;
    const block = src.slice(start, end);
    const cvId = ids[i][1];
    const website = (block.match(/websiteUrl:\s*"([^"]+)"/) || [])[1] || null;
    const gitlab = (block.match(/gitlabUrl:\s*"([^"]+)"/) || [])[1] || null;
    const expName = (block.match(/experience:\s*\{[^}]*name:\s*"([^"]+)"/) || [])[1] || null;
    // Key by gitlab repo slug when present, else by the cv id slug.
    const key = gitlab && /gitlab\.com/.test(gitlab) ? slugify(lastSeg(gitlab)) : slugify(cvId);
    out[key] = {
      cvId,
      displayName: expName || cvId,
      liveUrl: website && website !== '#' ? website.replace(/\/+$/, '') : null,
      gitlabUrl: gitlab && gitlab !== '#' ? gitlab : null,
    };
  }
  return out;
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------
function merge() {
  const local = scanLocal();
  const catalog = parseCatalog();
  const cloud = fetchCloud();
  const byKey = new Map();

  const ensure = (key) => {
    if (!byKey.has(key)) {
      byKey.set(key, {
        key, name: null, gitlabPath: null, namespace: null,
        localDir: null, localName: null, webDir: null, devCommand: null, framework: null,
        liveUrl: null, inCv: false, cvId: null, imageDir: null,
        lastActivity: null, sources: [],
      });
    }
    return byKey.get(key);
  };

  // Cloud first (canonical names + activity + pages).
  for (const p of cloud) {
    const key = slugify(lastSeg(p.path_with_namespace));
    const e = ensure(key);
    e.name = p.name;
    e.gitlabPath = p.path_with_namespace;
    e.namespace = p.namespace?.full_path || p.path_with_namespace.split('/').slice(0, -1).join('/');
    e.lastActivity = p.last_activity_at || null;
    e.cloudId = p.id;
    e.sources.push('cloud');
  }

  // Local overlay.
  for (const [key, l] of Object.entries(local)) {
    const e = ensure(key);
    e.localDir = l.localDir;
    e.localName = l.localName;
    e.webDir = l.webDir;
    e.devCommand = l.devCommand;
    if (l.framework) e.framework = l.framework;
    if (!e.gitlabPath) e.gitlabPath = l.gitlabPath;
    if (!e.namespace) e.namespace = l.gitlabPath.split('/').slice(0, -1).join('/');
    e.sources.push('local');
  }

  // Catalog overlay (enrichment).
  for (const [key, c] of Object.entries(catalog)) {
    const e = ensure(key);
    e.inCv = true;
    e.cvId = c.cvId;
    e.imageDir = c.cvId; // CV folders are keyed by cv id
    if (c.displayName) e.displayName = c.displayName;
    if (c.liveUrl && !e.liveUrl) e.liveUrl = c.liveUrl;
    if (!e.gitlabPath && c.gitlabUrl) e.gitlabPath = c.gitlabUrl.replace(/^https?:\/\/gitlab\.com\//, '');
    e.sources.push('catalog');
  }

  // Pages lookups (live URLs) for cloud entries that don't already have one.
  for (const e of byKey.values()) {
    if (!e.liveUrl && e.cloudId) {
      e.liveUrl = fetchPagesUrl(e.cloudId);
    }
    if (!e.imageDir) e.imageDir = e.cvId || e.key;
    if (!e.displayName) e.displayName = e.name || e.localName || e.key;
    // Web-app classification.
    e.isWebApp = !!(e.inCv || e.liveUrl || e.framework);
    e.captureMode = e.inCv ? 'catalog' : 'adopt';
    // Can we actually capture it?
    e.capturable = !!(e.localDir || e.liveUrl);
  }

  return [...byKey.values()];
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function sortEntries(list) {
  return list.sort((a, b) => {
    if (a.inCv !== b.inCv) return a.inCv ? -1 : 1;
    return (b.lastActivity || '').localeCompare(a.lastActivity || '');
  });
}

const all = merge();
const web = sortEntries(all.filter((e) => e.isWebApp));
const hidden = all.filter((e) => !e.isWebApp);
const shown = showAll ? sortEntries(all) : web;

if (asJson) {
  process.stdout.write(JSON.stringify({ projects: shown, hiddenNonWeb: hidden.map((e) => e.name || e.key), total: all.length }, null, 2) + '\n');
} else {
  const yn = (v) => (v ? 'yes' : '—');
  const rows = shown.map((e, i) => ({
    '#': String(i + 1),
    name: e.displayName,
    namespace: e.namespace || '—',
    local: e.localDir ? 'yes' : '—',
    live: e.liveUrl ? 'yes' : '—',
    inCV: yn(e.inCv),
    capture: e.capturable ? '' : 'NO SRC',
  }));
  const cols = ['#', 'name', 'namespace', 'local', 'live', 'inCV', 'capture'];
  const w = Object.fromEntries(cols.map((c) => [c, Math.max(c.length, ...rows.map((r) => r[c].length))]));
  const line = (r) => cols.map((c) => r[c].padEnd(w[c])).join('  ');
  console.log(line(Object.fromEntries(cols.map((c) => [c, c]))));
  console.log(cols.map((c) => '-'.repeat(w[c])).join('  '));
  rows.forEach((r) => console.log(line(r)));
  if (!showAll && hidden.length) {
    console.log(`\n(+${hidden.length} non-web repos hidden: ${hidden.map((e) => e.name || e.key).join(', ')} — pass --all to include)`);
  }
  console.log('\nReply with names or numbers to capture (e.g. "sonora, 3, ui-components"), or "all" / "all new".');
}
