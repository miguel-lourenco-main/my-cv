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
// Support multiple token sources:
// - CI_JOB_TOKEN: automatically available in GitLab CI for same project/group
// - GITLAB_TOKEN or GITLAB_README_TOKEN: custom token for accessing other projects
const TOKEN_SOURCE = process.env.CI_JOB_TOKEN
  ? "CI_JOB_TOKEN"
  : process.env.GITLAB_TOKEN
  ? "GITLAB_TOKEN"
  : process.env.GITLAB_README_TOKEN
  ? "GITLAB_README_TOKEN"
  : null;

const GITLAB_TOKEN =
  process.env.CI_JOB_TOKEN ||
  process.env.GITLAB_TOKEN ||
  process.env.GITLAB_README_TOKEN ||
  "";

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

async function fetchReadmeRaw(url) {
  const headers = {};
  if (GITLAB_TOKEN) {
    // CI job tokens must use JOB-TOKEN; personal/project tokens use PRIVATE-TOKEN.
    if (TOKEN_SOURCE === "CI_JOB_TOKEN") {
      headers["JOB-TOKEN"] = GITLAB_TOKEN;
    } else {
      headers["PRIVATE-TOKEN"] = GITLAB_TOKEN;
    }
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const base = `Raw HTTP ${res.status} ${res.statusText} for ${url}`;
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `${base} – auth failed using ${
          TOKEN_SOURCE || "no token"
        }. If this is running in CI, ensure the token has access to this project (job token allowlist or PAT with read_api/read_repository).`
      );
    }
    if (res.status === 404) {
      throw new Error(
        `${base} – README.md not found on this branch or is not accessible.`
      );
    }
    throw new Error(base);
  }

  const text = await res.text();

  // Guard against HTML error pages (Cloudflare, GitLab 404, login pages, etc.).
  const trimmed = text.trimStart().toLowerCase();
  if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) {
    throw new Error("Received HTML page instead of markdown (likely an error page)");
  }

  return text;
}

async function fetchReadmeApi(projectPath, branch) {
  // Try GitLab API v4 as fallback for private repositories
  const encodedPath = encodeURIComponent(projectPath);
  const apiUrl = `https://gitlab.com/api/v4/projects/${encodedPath}/repository/files/README.md/raw?ref=${branch}`;

  const headers = {};
  if (GITLAB_TOKEN) {
    if (TOKEN_SOURCE === "CI_JOB_TOKEN") {
      headers["JOB-TOKEN"] = GITLAB_TOKEN;
    } else {
      headers["PRIVATE-TOKEN"] = GITLAB_TOKEN;
    }
  }

  const res = await fetch(apiUrl, { headers });

  if (!res.ok) {
    const base = `API HTTP ${res.status} ${res.statusText} for ${apiUrl}`;
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `${base} – auth failed using ${
          TOKEN_SOURCE || "no token"
        }. Check that the token can read project "${projectPath}" (job token allowlist / PAT scopes).`
      );
    }
    if (res.status === 404) {
      throw new Error(
        `${base} – README.md not found in project "${projectPath}" on branch "${branch}".`
      );
    }
    throw new Error(base);
  }

  const text = await res.text();

  // Guard against HTML/JSON error responses
  const trimmed = text.trimStart().toLowerCase();
  if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html") || trimmed.startsWith("{")) {
    throw new Error("Received HTML/JSON response instead of markdown");
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
  // Common branch names to try as fallbacks
  const branchesToTry = [DEFAULT_BRANCH, "master", "develop", "dev"];

  if (GITLAB_TOKEN) {
    console.log(
      `[readmes] Using GitLab authentication from ${TOKEN_SOURCE} for private repos`
    );
  } else {
    console.log(`[readmes] No authentication token provided - public repos only`);
  }

  for (const { id, gitlabUrl } of projects) {
    const targetPath = path.join(readmesDir, `${id}.md`);
    let newContent = null;
    let lastError = null;

    // Extract project path from GitLab URL (e.g., "public-work4/sonora" from "https://gitlab.com/public-work4/sonora")
    const urlMatch = gitlabUrl.match(/gitlab\.com\/(.+)$/);
    const projectPath = urlMatch ? urlMatch[1].replace(/\/+$/, "") : null;

    // Try raw URL first, then ALWAYS try API as fallback (when projectPath is known),
    // across multiple branches.
    for (const branch of branchesToTry) {
      const rawUrl = `${gitlabUrl.replace(/\/+$/, "")}/-/raw/${branch}/README.md`;

      try {
        console.log(`[readmes] Fetching ${id} from ${rawUrl}`);
        newContent = await fetchReadmeRaw(rawUrl);
        // Success! Break out of branch loop
        break;
      } catch (err) {
        lastError = err;
        // If raw URL fails and we have a project path, always try API as fallback
        if (projectPath) {
          try {
            console.log(`[readmes] Raw URL failed, trying API for ${id} (branch: ${branch})`);
            newContent = await fetchReadmeApi(projectPath, branch);
            // Success! Break out of branch loop
            break;
          } catch (apiErr) {
            lastError = apiErr;
            // Continue to next branch
            continue;
          }
        } else {
          // Continue to next branch
          continue;
        }
      }
    }

    if (newContent === null) {
      hadErrors = true;
      console.error(
        `[readmes] Failed to update README for ${id} (${gitlabUrl}): ${String(lastError?.message || lastError || "No branch contained a valid README.md")}`
      );
      continue;
    }

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

