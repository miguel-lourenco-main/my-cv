function getGitlabTokenInfo(env = process.env) {
  if (env.CI_JOB_TOKEN) {
    return { token: env.CI_JOB_TOKEN, source: "CI_JOB_TOKEN" };
  }
  if (env.GITLAB_TOKEN) {
    return { token: env.GITLAB_TOKEN, source: "GITLAB_TOKEN" };
  }
  if (env.GITLAB_README_TOKEN) {
    return { token: env.GITLAB_README_TOKEN, source: "GITLAB_README_TOKEN" };
  }
  return { token: "", source: null };
}

function buildGitlabAuthHeaders(tokenInfo = getGitlabTokenInfo()) {
  if (!tokenInfo.token) return {};
  return tokenInfo.source === "CI_JOB_TOKEN"
    ? { "JOB-TOKEN": tokenInfo.token }
    : { "PRIVATE-TOKEN": tokenInfo.token };
}

function createGitlabHttpError({ res, url, mode, tokenSource, projectPath, branch }) {
  const base = `${mode} HTTP ${res.status} ${res.statusText} for ${url}`;
  if (res.status === 403 || res.status === 401) {
    const detail =
      mode === "API"
        ? `Check that the token can read project "${projectPath}" (job token allowlist / PAT scopes).`
        : "If this is running in CI, ensure the token has access to this project (job token allowlist or PAT with read_api/read_repository).";
    return new Error(`${base} – auth failed using ${tokenSource || "no token"}. ${detail}`);
  }
  if (res.status === 404) {
    const detail =
      mode === "API"
        ? `README.md not found in project "${projectPath}" on branch "${branch}".`
        : "README.md not found on this branch or is not accessible.";
    return new Error(`${base} – ${detail}`);
  }
  return new Error(base);
}

function assertMarkdownResponse(text, { allowJson = false } = {}) {
  const trimmed = text.trimStart().toLowerCase();
  if (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    (!allowJson && trimmed.startsWith("{"))
  ) {
    throw new Error("Received HTML/JSON response instead of markdown");
  }
}

async function fetchGitlabMarkdown(url, options = {}) {
  const tokenInfo = options.tokenInfo ?? getGitlabTokenInfo();
  const mode = options.mode ?? "Raw";
  const res = await fetch(url, {
    headers: buildGitlabAuthHeaders(tokenInfo),
  });

  if (!res.ok) {
    throw createGitlabHttpError({
      res,
      url,
      mode,
      tokenSource: tokenInfo.source,
      projectPath: options.projectPath,
      branch: options.branch,
    });
  }

  const text = await res.text();
  assertMarkdownResponse(text, { allowJson: mode === "Raw" });
  return text;
}

module.exports = {
  buildGitlabAuthHeaders,
  fetchGitlabMarkdown,
  getGitlabTokenInfo,
};
