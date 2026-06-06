const fetch = require("node-fetch");

const GitHubService = {
  async fetchRepoData(owner, repo) {
    const headers = {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    };

    const [repoRes, languagesRes, readmeRes] = await Promise.allSettled([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
    ]);

    // Check rate limit
    const mainResponse = repoRes.status === "fulfilled" ? repoRes.value : null;
    if (mainResponse) {
      const remaining = mainResponse.headers.get("X-RateLimit-Remaining");
      if (remaining !== null && parseInt(remaining) === 0) {
        const err = new Error("GitHub API limit reached, try in 1 hour");
        err.statusCode = 429;
        err.code = "GITHUB_RATE_LIMIT";
        throw err;
      }
    }

    // Handle repo not found or not accessible
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
  }
};

module.exports = GitHubService;
