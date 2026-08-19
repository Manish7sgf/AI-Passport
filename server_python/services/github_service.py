"""
GitHub API service.
- fetch_repo_data: single repo fetch for portfolio verify
- sync_user_repos: fetch all public repos for a user
- extract_skills_from_repos: derive skill list from language frequencies
"""
import os
import base64
from collections import Counter
import httpx
from fastapi import HTTPException


def _get_headers(user_token: str | None = None) -> dict:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "AI-Future-Passport",
    }
    token = user_token or os.environ.get("GITHUB_TOKEN")
    if token and token not in ("demo", "your_personal_github_token", ""):
        auth_type = "Bearer" if token.startswith("github_pat_") else "token"
        headers["Authorization"] = f"{auth_type} {token}"
    return headers


def _check_rate_limit(response: httpx.Response) -> None:
    remaining = response.headers.get("X-RateLimit-Remaining")
    if remaining is not None and int(remaining) == 0:
        raise HTTPException(status_code=429, detail="GitHub API limit reached, please try again later")


def _derive_contribution_level(repo: dict, languages: dict | None = None) -> str:
    """
    Derive realistic contribution level based on code size,
    polyglot tech stack depth, documentation, and maturity signals.
    """
    score = 0
    size = repo.get("size", 0)  # size in KB
    lang_count = len(languages) if languages else (1 if repo.get("language") else 0)

    # 1. Code volume & Project Size (KB)
    if size >= 800:        # > 800 KB
        score += 3
    elif size >= 200:      # > 200 KB
        score += 2
    elif size >= 30:       # > 30 KB
        score += 1

    # 2. Multi-language / Full-Stack Depth
    if lang_count >= 4:
        score += 3         # Full-stack (e.g. Python + JS + CSS + HTML)
    elif lang_count >= 2:
        score += 2         # Multi-tech (e.g. Backend + Frontend / App + Scripts)
    elif lang_count >= 1:
        score += 1

    # 3. Project Documentation & Metadata
    desc = repo.get("description") or ""
    if len(desc.strip()) >= 25:
        score += 1
    if repo.get("topics") and len(repo.get("topics", [])) >= 1:
        score += 1

    # 4. Community Traction
    if repo.get("stargazers_count", 0) >= 3:
        score += 2
    elif repo.get("stargazers_count", 0) >= 1:
        score += 1
    if repo.get("forks_count", 0) >= 1:
        score += 1

    # Thresholds:
    # High: Full-stack / rich multi-technology projects (score >= 5)
    # Medium: Solid multi-file projects with documentation (score >= 3)
    # Low: Minimal single-script or skeleton repositories (score < 3)
    if score >= 5:
        return "high"
    if score >= 3:
        return "medium"
    return "low"


def check_repository_ownership(
    owner: str, repo: str, github_username: str | None, user_token: str | None = None
) -> tuple[bool, str]:
    """
    Verify if the user is the owner or a contributor of the repository.
    Returns (is_valid, role_description):
      - (True, "owner") if user owns the repository
      - (True, "contributor") if user has verified commits in repository
      - (False, error_reason) if user neither owns nor contributed to the repository
    """
    if not github_username:
        return True, "unlinked"

    # 1. Direct owner check (case-insensitive)
    if owner.strip().lower() == github_username.strip().lower():
        return True, "owner"

    # 2. Check if user contributed commits to this repository
    headers = _get_headers(user_token)
    try:
        with httpx.Client(timeout=15, follow_redirects=True) as client:
            res = client.get(
                f"https://api.github.com/repos/{owner}/{repo}/commits",
                params={"author": github_username, "per_page": 1},
                headers=headers,
            )
            if res.status_code == 401 and "Authorization" in headers:
                headers_public = {"Accept": "application/vnd.github.v3+json", "User-Agent": "AI-Future-Passport"}
                res = client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/commits",
                    params={"author": github_username, "per_page": 1},
                    headers=headers_public,
                )

            if res.is_success:
                commits = res.json()
                if isinstance(commits, list) and len(commits) > 0:
                    return True, "contributor"
    except Exception as e:
        print(f"Contribution check note: {e}")

    return (
        False,
        f"Ownership verification failed: You (@{github_username}) are neither the owner nor a contributor of this repository ({owner}/{repo}). Please enter repositories you created or contributed to.",
    )


def fetch_repo_data(owner: str, repo: str, user_token: str | None = None) -> dict:
    """Fetch repo metadata, languages, and README with automatic auth fallback."""
    headers = _get_headers(user_token)

    with httpx.Client(timeout=25, follow_redirects=True) as client:
        repo_res = client.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)

        # If token was invalid/expired (401), retry without auth header (public access)
        if repo_res.status_code == 401 and "Authorization" in headers:
            headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "AI-Future-Passport"}
            repo_res = client.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)

        lang_res = client.get(f"https://api.github.com/repos/{owner}/{repo}/languages", headers=headers)
        readme_res = client.get(f"https://api.github.com/repos/{owner}/{repo}/readme", headers=headers)

    _check_rate_limit(repo_res)

    if repo_res.status_code == 404:
        raise HTTPException(status_code=400, detail="Repository not found or private. Make sure it is public.")
    if repo_res.status_code in (403, 429):
        raise HTTPException(status_code=429, detail="GitHub API limit reached, please try again in a few minutes")
    if not repo_res.is_success:
        raise HTTPException(status_code=400, detail=f"Failed to fetch repository: {repo_res.status_code}")

    repo_data = repo_res.json()
    languages = lang_res.json() if lang_res.is_success else {}

    readme = ""
    if readme_res.is_success:
        try:
            content_b64 = readme_res.json().get("content", "")
            readme = base64.b64decode(content_b64).decode("utf-8", errors="replace")[:2000]
        except Exception:
            readme = ""

    return {"repo_data": repo_data, "languages": languages, "readme": readme}


def sync_user_repos(github_username: str, user_token: str | None = None) -> list[dict]:
    """Fetch up to 30 public repos, enrich with languages, return structured list."""
    headers = _get_headers(user_token)

    with httpx.Client(timeout=25) as client:
        res = client.get(
            f"https://api.github.com/users/{github_username}/repos",
            params={"sort": "pushed", "per_page": 30, "type": "public"},
            headers=headers,
        )
        if res.status_code == 401 and "Authorization" in headers:
            headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "AI-Future-Passport"}
            res = client.get(
                f"https://api.github.com/users/{github_username}/repos",
                params={"sort": "pushed", "per_page": 30, "type": "public"},
                headers=headers,
            )

    _check_rate_limit(res)

    if res.status_code == 404:
        return []
    if res.status_code in (403, 429):
        raise HTTPException(status_code=429, detail="GitHub API limit reached, please try again later")
    if not res.is_success:
        return []

    repos = res.json()
    own_repos = [r for r in repos if not r.get("fork") and r.get("size", 0) > 0 and r.get("language")]
    top_repos = own_repos[:25]

    result = []
    with httpx.Client(timeout=15) as client:
        for repo in top_repos:
            try:
                lang_res = client.get(repo["languages_url"], headers=headers)
                languages = lang_res.json() if lang_res.is_success else {}
            except Exception:
                languages = {}

            result.append({
                "repo_url":           f"https://github.com/{github_username}/{repo['name']}",
                "title":              repo["name"],
                "description":        repo.get("description") or "",
                "tech_stack":         list(languages.keys())[:8],
                "stars":              repo.get("stargazers_count", 0),
                "contribution_level": _derive_contribution_level(repo, languages),
                "source":             "github_sync",
                "github_data": {
                    "full_name":   repo.get("full_name"),
                    "language":    repo.get("language"),
                    "languages":   languages,
                    "pushed_at":   repo.get("pushed_at"),
                    "topics":      repo.get("topics", []),
                    "open_issues": repo.get("open_issues_count", 0),
                },
            })

    return result


def extract_skills_from_repos(repos: list[dict]) -> list[str]:
    """Return languages sorted by frequency across repos."""
    freq: Counter = Counter()
    for repo in repos:
        for lang in repo.get("tech_stack", []):
            freq[lang] += 1
    return [lang for lang, _ in freq.most_common()]
