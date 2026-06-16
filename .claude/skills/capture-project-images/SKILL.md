---
name: capture-project-images
description: >-
  Refreshes this CV's project gallery screenshots. It auto-discovers the user's
  GitLab web-app projects by merging cloud (glab API + Pages) with local repos and
  the CV catalog, lets the user pick which to update, then for each: re-derives
  routes/features from source, boots it locally (falling back to the live
  deployment), drives it with Playwright across pages and interactive states in
  light + dark themes, writes named PNGs into public/projects_images/<id>/,
  regenerates the images manifest, curates the imagesFirst ordering, adopts any
  not-yet-in-CV project into projects.data.ts, and commits to a new branch. Use
  when the user wants to "update project images / screenshots", "recapture",
  "refresh the gallery", or screenshot their GitLab projects for the CV. Exclusive
  to the my-cv repo.
---

# Capture project images

Repeatable workflow to refresh the CV's `public/projects_images/<id>/` screenshots,
then commit them to a new branch. The target list is **discovered**, never hardcoded.

The intelligence is split deliberately:
- **`discover-projects.mjs`** finds candidate projects (cloud+local+catalog merge).
- **This SOP** (Claude) does app-specific reasoning: re-deriving routes/features from
  each project's source so the shot list stays correct as projects evolve.
- **`capture.mjs`** (deterministic engine) executes the shot plan in a real browser.
  See `reference.md` for the step DSL and `projects.capture.json` for cached plans.

## Invocation

- `/capture-project-images` — discover all GitLab web-app projects, list them, and
  ask the user which to refresh.
- `/capture-project-images <names…>` — pre-select (e.g. `sonora cash-register`); still
  runs discovery to resolve each name to its sources. Unknown names fall back to the
  interactive picker.

## Progress checklist

Copy this and keep it updated:

```
- [ ] Step 0: Bootstrap (deps + secrets)
- [ ] Step 1: Discover GitLab projects → user selects
- [ ] Step 2: Per project — refresh route/feature recon → update shot plan
- [ ] Step 3: Per project — launch (local first, live fallback) → run engine → stop server
- [ ] Step 4: Adopt new (not-in-CV) projects into projects.data.ts
- [ ] Step 5: Regenerate images manifest
- [ ] Step 6: Curate imagesFirst
- [ ] Step 7: New branch + commit
- [ ] Step 8: Report (and offer a preview)
```

---

### Step 0 — Bootstrap

Run from the skill dir `.claude/skills/capture-project-images/`:

- Install the engine's deps once (kept out of the CV's package.json):
  ```bash
  cd .claude/skills/capture-project-images && [ -d node_modules ] || npm install
  ```
  The engine launches **system Chrome** (`channel: 'chrome'`) — no Playwright browser
  download needed. If Chrome is missing, run `npx playwright install chromium`.
- Ensure credentials exist: `[ -f secrets.json ] || cp secrets.example.json secrets.json`.
- Discovery needs `glab` authenticated (`glab auth status`). If it's not, discovery still
  works from local repos + the CV catalog (no cloud-only projects, possibly no live URLs).

### Step 1 — Discover & select

Run discovery and show the user the result:
```bash
cd .claude/skills/capture-project-images && node discover-projects.mjs
```
This merges three sources keyed by repo slug and prints a table of **web-app projects**
(name · namespace · local? · live? · inCV? · capturable?), plus a count of hidden
non-web repos (`--all` to include them; `--json` for machine output).

- Present the table to the user and ask **which projects to refresh** — accept names,
  numbers, `all`, or `all new`. (Do NOT use AskUserQuestion here; the list usually
  exceeds its 4-option limit. Ask in prose and parse the reply.)
- If the user gave names on invocation, map them to rows and confirm the selection.
- Drop any selected row where `capturable` is false (no local clone AND no live URL) —
  tell the user it was skipped and why (cloning is out of scope).
- Grab the `--json` entry for each selected project; you'll use `localDir`, `webDir`,
  `devCommand`, `liveUrl`, `imageDir`, `inCv`, `captureMode` downstream.
- If a selected project has a `login`/`_authNote` in `projects.capture.json` but
  `secrets.json` still holds placeholders, name the keys to fill (e.g. `cashRegister.pin`)
  and ask whether to proceed via the live deployment meanwhile. Never print secrets.

### Step 2 — Refresh route/feature recon (the important part)

For **each** selected project, re-derive the truth from source so the shot list reflects
the *current* app. Read from `webDir` (the web package — may be a monorepo subdir like
`atelier/frontend`):

1. **Routes** — enumerate `app/**/page.tsx` (app router) or `pages/**` (pages router).
   Resolve dynamic segments (`[id]`) to a value that exists (seeded id, first list item).
2. **Theme** — confirm provider/key/dark class and whether a light theme exists. Set the
   project's `theme` + `themes` in `projects.capture.json` (dark-only → `["D"]`).
3. **Interactive states** — modals, dialogs, drawers, multi-step forms, filters, search,
   filled-vs-empty. For each worth showing, find a reliable trigger (button text / stable
   selector / `data-testid`).
4. **Auth** — protected routes + login mechanism; map credentials to `secrets.json` keys.

Then **upsert the project's entry in `projects.capture.json`** (key = `imageDir`):
- Set `repoDir` to `webDir`, `devCommand`, `liveUrl`, `imageDir`, `theme`, `themes`.
- Add/rename scenes to match current routes/features. Prefer robust page scenes
  (`path` + `settle`) per route in both themes; wrap interactions in `optional` so a stale
  selector never aborts a run.
- For **known projects**, preserve hand-tuned `login`, `theme`, and custom scene `steps`;
  only add newly-found routes. For **new projects**, generate a fresh entry.
- Reuse existing filenames as scene names (check `public/projects_images/<imageDir>/`) so
  `imagesFirst` keeps pointing at real files.

Use the Explore agent for breadth on large repos. Keep JSON edits surgical and valid.

### Step 3 — Launch + capture (per project, one at a time)

Most apps default to port 3000, so go sequentially. For each:

1. **Try local** (preferred — reflects just-updated code). Start the dev server in
   background with Bash `run_in_background`, from the project's `webDir`:
   ```bash
   ( cd "<webDir>" && <devCommand> ) > .claude/skills/capture-project-images/.serve-<imageDir>.log 2>&1 &
   ```
   Poll the port (read it from the log / default 3000) for up to ~90s:
   ```bash
   for i in $(seq 1 45); do curl -sf "http://localhost:<port>" >/dev/null && echo UP && break; sleep 2; done
   ```
   - If it never comes UP (e.g. cash-register needs local Supabase), **fall back to
     `liveUrl`**. Note the fallback in the report (live may lag un-deployed changes).
2. **Run the engine:**
   ```bash
   cd .claude/skills/capture-project-images && \
   node capture.mjs --project <imageDir> --base <http://localhost:port | liveUrl>
   ```
   - `--only sceneA,sceneB` while iterating; `--headed` to watch; `--dry-run` to validate.
   - Exit `2` = some scenes failed; inspect the log, fix selectors in
     `projects.capture.json`, re-run failed scenes with `--only`. Exit `0` = clean.
3. **Stop the dev server** (kill the background job) before the next project.
4. **Sanity-check**: list `public/projects_images/<imageDir>/` and spot-read a couple of
   PNGs to confirm they aren't blank/error pages and that L vs D differ.

### Step 4 — Adopt new projects into the CV catalog

For each captured project where `inCv` is false, add a new entry to
`app/components/projects/projects.data.ts`. Use **direct strings** (`title`, `description`,
direct `details.*`) — NOT i18n `*Key` fields — so no `public/locales/**` files are needed.

- Prompt the user for: `title`, `description`, `technologies` (name+icon), `type`
  (personal/professional/hybrid), `startDate` (+ optional `endDate`), and confirm
  `websiteUrl`/`gitlabUrl` (prefilled from discovery).
- Set `id` to the captured `imageDir`, and seed `imagesFirst` from the captured filenames
  (interleave `_L`/`_D`, hero/landing first). Match the shape of existing entries.
- If a tech icon doesn't exist under `public/logos/`, note it (the entry still renders).

### Step 5 — Regenerate the manifest

From the my-cv repo root: `pnpm generate-images`. Rewrites
`public/projects-images-manifest.json` and `app/lib/projects-images-manifest.ts` from disk.

### Step 6 — Curate imagesFirst

For each updated project in `projects.data.ts`, order `imagesFirst` so the strongest shots
lead, interleaving light/dark (`hero_L, hero_D, <feature>_L, <feature>_D, …`). Only
reference files that now exist (the manifest is the full list; `imagesFirst` just reorders).

### Step 7 — New branch + commit

End on a fresh branch (never commit straight to the working branch). From the my-cv root:
```bash
git checkout -b chore/update-project-images-<YYYYMMDD>
git add public/projects_images public/projects-images-manifest.json \
        app/lib/projects-images-manifest.ts app/components/projects/projects.data.ts \
        .claude/skills/capture-project-images/projects.capture.json
git commit
```
Conventional-Commit message ending with the trailer:
```
chore(images): refresh <projects> project screenshots

Recaptured <N> screens (light/dark) via capture-project-images.
Regenerated manifest; updated imagesFirst[; adopted <new projects>].

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```
Do **not** push unless the user asks.

### Step 8 — Report

Per project: capture source (local vs live fallback), scene count, new/changed files,
failed scenes, adopted-or-refreshed, secrets still needed. Offer to run `pnpm dev` to
preview the gallery, and to push / open an MR.

## Notes & gotchas

- **Discovery is the source of truth** — merges cloud (`glab`), local sibling repos, and
  the CV catalog by repo slug; reconciles namespace/id drift. Re-run it each session.
- **Determinism**: engine uses `reducedMotion`, `animations: 'disabled'`,
  `deviceScaleFactor: 2`. Bump per-scene `settle` for heavy WebGL pages.
- **Dark-only apps**: set `themes: ["D"]`; don't emit fake `_L` files.
- **Filenames are the API**: keep scene names stable so re-captures overwrite cleanly.
- **Secrets** live only in `secrets.json` (gitignored). Never commit or echo them.
- **Monorepos**: `webDir` (from discovery) is where the web app + dev script live; boot
  and recon from there, not the repo root.
