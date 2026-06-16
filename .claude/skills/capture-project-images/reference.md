# Capture engine reference

Two tools: `discover-projects.mjs` finds *what* to capture; `capture.mjs` *does* the
capture. All app-specific knowledge lives in `projects.capture.json`.

## discover-projects.mjs — what to capture

Merges three sources into one list of the user's GitLab **web-app** projects, keyed by
repo **slug** (last path segment, de-cased, `_`/`-` stripped) so namespace and id drift
reconcile (e.g. cv id `agentic-hub` ↔ repo `agentichub`; cv's wrong-namespace
`o-guardanapo`).

- **Cloud** — `glab api "projects?membership=true&simple=true&archived=false"` (paginated),
  plus `projects/<id>/pages` for the live URL (only counts if `deployments.length > 0`).
  Skips `*-deletion_scheduled-*` and the `my-cv` repo itself.
- **Local** — sibling repos under `../` with a `gitlab.com` origin; detects the web package
  (`webDir`, root or monorepo subdir like `frontend`/`apps/web`), `framework`, `devCommand`.
- **Catalog** — `app/components/projects/projects.data.ts` (regex, never executed) for
  `cvId`, `displayName`, `liveUrl`, `gitlabUrl` → marks `inCv`.

```bash
node discover-projects.mjs            # pretty table
node discover-projects.mjs --json     # {projects:[...], hiddenNonWeb:[...], total}
node discover-projects.mjs --all      # include non-web repos
node discover-projects.mjs --no-pages # skip Pages lookups (faster, no live URLs)
```

Per-entry JSON fields used by the skill: `key`, `displayName`, `gitlabPath`, `namespace`,
`localDir`, `webDir`, `devCommand`, `framework`, `liveUrl`, `inCv`, `cvId`, `imageDir`,
`isWebApp`, `captureMode` (`catalog`|`adopt`), `capturable` (has local or live source).

**Web-app filter**: `inCv || liveUrl || framework`. Non-web repos are hidden (shown with
`--all`). **Capturable**: has a `localDir` or a `liveUrl`; non-capturable rows are skipped.

## capture.mjs — CLI

```bash
node capture.mjs --project <id> --base <url> \
  [--config ./projects.capture.json] [--secrets ./secrets.json] \
  [--out <abs dir>] [--only scene1,scene2] [--headed] [--dry-run]
```

- `--base` — root URL to hit (e.g. `http://localhost:3000` or the live URL). Required (falls back to `liveUrl`).
- `--out` — output root; defaults to `<repo>/public/projects_images`. Files land in `<out>/<imageDir>/<shot>_<L|D>.png`.
- `--only` — comma list of scene names to run (fast iteration).
- `--headed` — show the browser (debug).
- `--dry-run` — log what would be captured, write nothing.

Exit codes: `0` success, `2` one or more scenes failed, `1` fatal (bad args/config).

## Per-project config fields

| Field | Meaning |
|-------|---------|
| `repoDir` | Absolute path to the project's source repo (for local dev + recon). |
| `devCommand` / `port` | How to boot locally and which port to poll. |
| `liveUrl` | Deployed URL, used as fallback when local boot fails. |
| `imageDir` | Folder under `public/projects_images/` (must match the CV project `id`/folder). |
| `start` | Path to load before login/scenes (default `/`). |
| `theme` | `{ strategy, key, darkClass }`. `strategy`: `next-themes` \| `localStorage+class` \| `class-only` \| `none`. `key` = localStorage key. `darkClass` = class toggled on `<html>`. |
| `themes` | Array of `"L"` / `"D"` to capture. Dark-only apps use `["D"]`. |
| `viewport` | Default viewport `{width,height}` (else 1440×900). |
| `login` | Step list run once per theme; session persists across scenes in that theme. |
| `scenes` | The shot list (see below). |

## Scene shape

```json
{ "name": "orders_list", "path": "/orders", "viewport": "mobile",
  "themes": ["D"], "settle": 800, "steps": [ ...steps ] }
```

- `path` — navigated to (relative to base) before steps. Omit to stay on current page.
- `themes` — restrict this scene to a subset of themes (optional).
- `settle` — ms to wait before the auto-shot.
- If `steps` contains **no** `shot`, the engine auto-captures one named `<name>`.
- `viewport` — `desktop` | `mobile` | any key in `viewports`.

## Step DSL (one key per object, executed in order)

| Step | Effect |
|------|--------|
| `{"goto":"/path"}` | Navigate (relative or absolute URL). |
| `{"wait":800}` | Pause ms. |
| `{"waitFor":"selector"}` | Wait until visible (supports Playwright `text=` / CSS). |
| `{"click":"selector"}` | Click first match. |
| `{"fill":["selector","value"]}` | Set input value. |
| `{"type":["selector","value"]}` | Type char-by-char (for search-as-you-type). |
| `{"press":"Enter"}` or `{"press":["selector","Enter"]}` | Keyboard. |
| `{"hover":"selector"}` | Hover (reveal hover UI). |
| `{"scroll":600}` \| `"bottom"` \| `"top"` | Scroll. |
| `{"eval":"window.foo()"}` | Run JS in page. |
| `{"shot":"name"}` or `{"shot":{"name":"x","fullPage":false,"clip":{...}}}` | Capture `name_<theme>.png`. |
| `{"optional":[ ...steps ]}` | Run nested steps, swallow errors (for flaky modals/selectors). |

Strings support secret interpolation: `"{{secret.cashRegister.pin}}"` reads from `secrets.json`.

## Adding a project or scene

1. Add an entry under `projects` with `repoDir`, `theme`, `themes`, `liveUrl`, `imageDir`.
2. Add scenes — prefer robust `path` + `settle` page scenes; wrap interactions in `optional` so a wrong selector never aborts the run.
3. Use existing filenames (see the CV's current `public/projects_images/<id>/`) as scene names so `imagesFirst` ordering stays meaningful.
