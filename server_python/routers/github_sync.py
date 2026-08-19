"""
GitHub sync routes:
  POST /api/github/sync
  GET  /api/github/status
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from config.database import fetch_one, fetch_all, execute, execute_many
from middleware.auth import verify_token
from services import github_service
from services.score_service import calculate_score

router = APIRouter(prefix="/api/github", tags=["github"])


@router.post("/sync")
def sync_repos(current_user: dict = Depends(verify_token)):
    github_username = current_user.get("github_username")
    if not github_username:
        raise HTTPException(
            400,
            "No GitHub account linked. Connect GitHub via OAuth to sync repos.",
        )

    synced_repos = github_service.sync_user_repos(
        github_username, current_user.get("github_token")
    )

    if not synced_repos:
        return {"success": True, "data": {"synced": 0, "skipped": 0, "skills_added": [], "message": "No public repos found"}}

    user_id = str(current_user["id"])

    # Existing repo map (normalized lowercase without trailing slash)
    existing_rows = fetch_all("SELECT id, repo_url, verified FROM portfolio_items WHERE user_id = %s", (user_id,))
    existing_map = {r["repo_url"].rstrip("/").lower(): r for r in existing_rows}

    synced_count = 0
    skipped = 0

    from services import nvidia_service

    all_demonstrated_skills = []

    for repo in synced_repos:
        clean_url = repo["repo_url"].rstrip("/")
        norm_key = clean_url.lower()

        # If repo is already verified, skip
        if norm_key in existing_map and existing_map[norm_key].get("verified"):
            skipped += 1
            continue

        # AI analysis & verification
        analysis = nvidia_service.analyse_repo(
            repo["github_data"],
            repo["github_data"].get("languages", {}),
            ""
        )
        ai_summary = json.dumps({
            "contribution_reason": analysis.get("contribution_reason") or "Analyzed and verified via AI Code Analysis.",
            "complexity_score":    analysis.get("complexity_score", 6),
            "skills_demonstrated": analysis.get("skills_demonstrated", repo["tech_stack"]),
        })

        skills_demonstrated = analysis.get("skills_demonstrated", [])
        all_demonstrated_skills.extend(skills_demonstrated)

        if norm_key in existing_map:
            # Upgrade existing unverified row to verified with AI analysis
            existing = existing_map[norm_key]
            execute(
                """UPDATE portfolio_items SET
                     title = %s,
                     description = COALESCE(NULLIF(%s, ''), description),
                     tech_stack = %s,
                     ai_summary = %s,
                     contribution_level = %s,
                     verified = TRUE
                   WHERE id = %s""",
                (
                    analysis.get("title") or repo["title"],
                    analysis.get("description") or repo["description"],
                    json.dumps(analysis.get("tech_stack") or repo["tech_stack"]),
                    ai_summary,
                    analysis.get("contribution_level") or repo["contribution_level"],
                    str(existing["id"]),
                ),
            )
            synced_count += 1
        else:
            result = execute(
                """INSERT INTO portfolio_items
                     (user_id, repo_url, title, description, tech_stack, ai_summary,
                      contribution_level, verified, source)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING id""",
                (
                    user_id,
                    clean_url,
                    analysis.get("title") or repo["title"],
                    analysis.get("description") or repo["description"],
                    json.dumps(analysis.get("tech_stack") or repo["tech_stack"]),
                    ai_summary,
                    analysis.get("contribution_level") or repo["contribution_level"],
                    True,
                    "github_sync",
                ),
            )
            if result:
                synced_count += 1
                existing_map[norm_key] = {"id": result.get("id"), "repo_url": clean_url, "verified": True}

    # Merge detected skills into passport
    detected_skills = github_service.extract_skills_from_repos(synced_repos)
    passport = fetch_one("SELECT skills FROM passports WHERE user_id = %s", (user_id,))

    existing_skills = []
    if passport:
        existing_skills = passport.get("skills") or []
        if isinstance(existing_skills, str):
            existing_skills = json.loads(existing_skills)

    merged = list(dict.fromkeys(existing_skills + detected_skills + all_demonstrated_skills))
    skills_added = [s for s in merged if s not in existing_skills]

    if skills_added:
        execute(
            "UPDATE passports SET skills = %s, last_updated = NOW() WHERE user_id = %s",
            (json.dumps(merged), user_id),
        )

    calculate_score(user_id)

    msg = f"Synced {synced_count} repo{'s' if synced_count != 1 else ''}"
    if skills_added:
        msg += f", added {len(skills_added)} skill{'s' if len(skills_added) != 1 else ''}"

    return {
        "success": True,
        "data": {
            "synced":       synced_count,
            "skipped":      skipped,
            "total_repos":  len(synced_repos),
            "skills_added": skills_added,
            "message":      msg,
        },
    }


@router.get("/status")
def sync_status(current_user: dict = Depends(verify_token)):
    row = fetch_one(
        "SELECT COUNT(*)::int AS synced_count, MAX(created_at) AS last_synced "
        "FROM portfolio_items WHERE user_id = %s AND source = 'github_sync'",
        (str(current_user["id"]),),
    )
    return {"success": True, "data": row}
