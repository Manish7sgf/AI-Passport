const fetch = require("node-fetch");

// Headers using the server-level GitHub token (for public repo reads)
function serverHeaders() {
  return {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json"
  };
}

// Headers using the user's own OAuth token (for their private data)
function userHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json"
  };
}

function checkRateLimit(response) {
  const remaining = response?.headers?.get("X-RateLimit-Remaining");
  if (remaining !== null && parseInt(remaining) === 0) {
    const err = new Error("GitHub API limit reached, try in 1 hour");
    err.statusCode = 429;
    err.code = "GITHUB_RATE_LIMIT";
    throw err;
  }
}

const GitHubService = {
  // ── Single repo fetch (for portfolio verify) ────────────────────────────────
  async fetchRepoData(owner, repo) {
    const headers = serverHeaders();

    const [repoRes, languagesRes, readmeRes] = await Promise.allSettled([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
    ]);

    const mainResponse = repoRes.status === "fulfilled" ? repoRes.value : null;
    if (mainResponse) checkRateLimit(mainResponse);

    if (repoRes.status === "fulfilled" && !repoRes.value.ok) {
      const status = repoRes.value.status;
      if (status === 404) {
        const err = new Error("Repository not accessible. Make sure it is public.");
        err.statusCode = 400;
        err.code = "REPO_NOT_FOUND";
        throw err;
      }
      if (status === 403) {
        const err = new Error("GitHub API limit reached, try in 1 hour");
        err.statusCode = 429;
        err.code = "GITHUB_RATE_LIMIT";
        throw err;
      }
    }

    if (repoRes.status === "rejected") {
      const err = new Error("Failed to fetch repository data");
      err.statusCode = 400;
      err.code = "GITHUB_FETCH_ERROR";
      throw err;
    }

    const repoData = await repoRes.value.json();
    const languages = languagesRes.status === "fulfilled" && languagesRes.value.ok
      ? await languagesRes.value.json()
      : {};

    let readme = "";
    if (readmeRes.status === "fulfilled" && readmeRes.value.ok) {
      try {
        const readmeJson = await readmeRes.value.json();
        readme = Buffer.from(readmeJson.content, "base64").toString("utf-8").slice(0, 2000);
      } catch {
        readme = "";
      }
    }

    return { repoData, languages, readme };
  },

  // ── Sync all public repos for a GitHub user ─────────────────────────────────
  // Uses user's OAuth token if available, falls back to server token
  async syncUserRepos(githubUsername, userToken = null) {
    const headers = userToken ? userHeaders(userToken) : serverHeaders();

    // Fetch up to 30 most recently pushed repos
    const res = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=pushed&per_page=30&type=public`,
      { headers }
    );

    checkRateLimit(res);

    if (!res.ok) {
      if (res.status === 404) return [];
      if (res.status === 403 || res.status === 429) {
        const err = new Error("GitHub API limit reached, try in 1 hour");
        err.statusCode = 429;
        err.code = "GITHUB_RATE_LIMIT";
        throw err;
      }
      return [];
    }

    const repos = await res.json();

    // Filter out forks, only keep repos with actual code
    const ownRepos = repos.filter(
      (r) => !r.fork && r.size > 0 && r.language
    );

    // Fetch languages for each repo in parallel (max 10 to stay within rate limits)
    const topRepos = ownRepos.slice(0, 10);

    const reposWithLanguages = await Promise.allSettled(
      topRepos.map(async (repo) => {
        try {
          const langRes = await fetch(repo.languages_url, { headers });
          const languages = langRes.ok ? await langRes.json() : {};
          return {
            repo_url:           `https://github.com/${githubUsername}/${repo.name}`,
            title:              repo.name,
            description:        repo.description || "",
            tech_stack:         Object.keys(languages).slice(0, 8),
            stars:              repo.stargazers_count,
            contribution_level: deriveContributionLevel(repo),
            source:             "github_sync",
            github_data: {
              full_name:   repo.full_name,
              language:    repo.language,
              languages,
              pushed_at:   repo.pushed_at,
              topics:      repo.topics || [],
              open_issues: repo.open_issues_count
            }
          };
        } catch {
          return null;
        }
      })
    );

    return reposWithLanguages
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);
  },

  // ── Extract unique skills from a list of synced repos ──────────────────────
  extractSkillsFromRepos(repos) {
    const langFreq = {};
    for (const repo of repos) {
      for (const lang of repo.tech_stack || []) {
        langFreq[lang] = (langFreq[lang] || 0) + 1;
      }
    }
    // Return languages used in at least 1 repo, sorted by frequency
    return Object.entries(langFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  }
};

// Heuristic contribution level based on repo metrics
function deriveContributionLevel(repo) {
  const score =
    (repo.stargazers_count >= 5 ? 2 : 0) +
    (repo.size >= 500 ? 2 : repo.size >= 100 ? 1 : 0) +
    (repo.open_issues_count >= 2 ? 1 : 0);
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

module.exports = GitHubService;
