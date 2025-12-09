#!/usr/bin/env node

/**
 * Downloads project README.md files from GitLab into `public/readmes`.
 *
 * - Discovers project IDs and GitLab URLs from `app/components/projects/projects.data.ts`
 *   to avoid keeping a separate hard-coded list.
 * - Fetches the raw README from the project's default branch (configurable via env).
 * - Skips HTML error pages (e.g. Cloudflare / GitLab 404 HTML).
 * - Only writes files when content actually changed, to keep diffs clean.
 *
 * Intended usage:
 *   - Run in CI before `pnpm build`, so static READMEs are always present for GitLab Pages.
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_BRANCH = process.env.README_BRANCH || "main";
const GITLAB_TOKEN = process.env.GITLAB_TOKEN || process.env.GITLAB_README_TOKEN || "";

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

/**
 * Very small, regex-based extractor that finds `{ id: "...", gitlabUrl: "..." }`
 * objects in `projects.data.ts`. This avoids a TypeScript build step.
 */
function extractProjectsFromTs(source) {
  const projects = [];
  const re = /id:\s*"([^"]+)"[\s\S]*?gitlabUrl:\s*"([^"]+)"/g;
  let match;

  while ((match = re.exec(source)) !== null) {
    const id = match[1];
    const gitlabUrl = match[2];
    projects.push({ id, gitlabUrl });
  }

  return projects;
}

async function fetchReadme(url) {
  const headers = {};
  if (GITLAB_TOKEN) {
    // Personal access token for private projects, if needed.
    headers["PRIVATE-TOKEN"] = GITLAB_TOKEN;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const text = await res.text();

  // Guard against HTML error pages (Cloudflare, GitLab 404, login pages, etc.).
  const trimmed = text.trimStart().toLowerCase();
  if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) {
    throw new Error("Received HTML page instead of markdown (likely an error page)");
  }

  return text;
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const projectsTsPath = path.join(
    repoRoot,
    "app",
    "components",
    "projects",
    "projects.data.ts"
  );

  const projectsSource = readFileSafe(projectsTsPath);
  if (!projectsSource) {
    console.error(`[readmes] Could not read ${projectsTsPath}`);
    process.exit(1);
  }

  const projects = extractProjectsFromTs(projectsSource);

  if (projects.length === 0) {
    console.error("[readmes] No projects with gitlabUrl found in projects.data.ts");
    process.exit(1);
  }

  const readmesDir = path.join(repoRoot, "public", "readmes");
  if (!fs.existsSync(readmesDir)) {
    fs.mkdirSync(readmesDir, { recursive: true });
  }

  console.log(
    `[readmes] Downloading READMEs for ${projects.length} projects to ${path.relative(
      repoRoot,
      readmesDir
    )} (branch=${DEFAULT_BRANCH})`
  );

  let hadErrors = false;

  for (const { id, gitlabUrl } of projects) {
    const rawUrl = `${gitlabUrl.replace(/\/+$/, "")}/-/raw/${DEFAULT_BRANCH}/README.md`;
    const targetPath = path.join(readmesDir, `${id}.md`);

    try {
      console.log(`[readmes] Fetching ${id} from ${rawUrl}`);
      const newContent = await fetchReadme(rawUrl);

      const existing = readFileSafe(targetPath);
      if (existing !== null && existing === newContent) {
        console.log(`[readmes] ${id}.md unchanged, skipping write.`);
        continue;
      }

      fs.writeFileSync(targetPath, newContent, "utf8");
      console.log(
        `[readmes] ${existing === null ? "Created" : "Updated"} ${path.relative(
          repoRoot,
          targetPath
        )}`
      );
    } catch (err) {
      hadErrors = true;
      console.error(
        `[readmes] Failed to update README for ${id} (${gitlabUrl}): ${String(err.message || err)}`
      );
    }
  }

  if (hadErrors) {
    // Non-fatal: we log errors, but do not fail the pipeline by default.
    // Uncomment the next line if you want failures to break CI:
    // process.exit(1);
  }
}

main().catch((err) => {
  console.error("[readmes] Unexpected error:", err);
  process.exit(1);
});

