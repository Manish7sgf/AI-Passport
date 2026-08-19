"""
Portfolio routes:
  POST   /api/portfolio/verify
  GET    /api/portfolio/{user_id}
  DELETE /api/portfolio/{item_id}
"""
import json
import re
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from config.database import fetch_all, fetch_one, execute
from middleware.auth import verify_token
from services import nvidia_service, github_service
from services.score_service import calculate_score

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

GITHUB_REPO_REGEX = re.compile(
    r"^https://github\.com/([\w\-]+)/([\w.\-]+)/?$"
)


class VerifyBody(BaseModel):
    repo_url: str


@router.post("/verify", status_code=201)
def verify(body: VerifyBody, current_user: dict = Depends(verify_token)):
    match = GITHUB_REPO_REGEX.match(body.repo_url.strip())
    if not match:
        raise HTTPException(
            400,
            "Must be a valid GitHub repo URL (https://github.com/owner/repo)",
        )

    owner, repo = match.group(1), match.group(2)

    # Fetch GitHub data with user token / public fallback
    user_gh_token = current_user.get("github_token")
    gh = github_service.fetch_repo_data(owner, repo, user_gh_token)

    # AI analysis
    analysis = nvidia_service.analyse_repo(
        gh["repo_data"], gh["languages"], gh["readme"]
    )

    ai_summary = json.dumps({
        "contribution_reason": analysis.get("contribution_reason"),
        "complexity_score":    analysis.get("complexity_score"),
        "skills_demonstrated": analysis.get("skills_demonstrated", []),
    })

    # Check if this portfolio item already exists for user
    clean_url = f"https://github.com/{owner}/{repo}"
    existing = fetch_one(
        "SELECT id FROM portfolio_items WHERE user_id = %s AND (repo_url ILIKE %s OR repo_url ILIKE %s)",
        (str(current_user["id"]), clean_url, body.repo_url.strip()),
    )

    if existing:
        item = execute(
            """UPDATE portfolio_items SET
                 title = %s,
                 description = %s,
                 tech_stack = %s,
                 ai_summary = %s,
                 contribution_level = %s,
                 verified = TRUE,
                 source = 'manual'
               WHERE id = %s
               RETURNING *""",
            (
                analysis.get("title"),
                analysis.get("description"),
                json.dumps(analysis.get("tech_stack", [])),
                ai_summary,
                analysis.get("contribution_level"),
                str(existing["id"]),
            ),
        )
    else:
        item = execute(
            """INSERT INTO portfolio_items
                 (user_id, repo_url, title, description, tech_stack, ai_summary,
                  contribution_level, verified, source)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING *""",
            (
                str(current_user["id"]),
                clean_url,
                analysis.get("title"),
                analysis.get("description"),
                json.dumps(analysis.get("tech_stack", [])),
                ai_summary,
                analysis.get("contribution_level"),
                True,
                "manual",
            ),
        )

    # Merge detected skills into passport
    skills_demonstrated = analysis.get("skills_demonstrated", [])
    if skills_demonstrated:
        existing_p = fetch_one("SELECT skills FROM passports WHERE user_id = %s", (str(current_user["id"]),))
        cur_skills = existing_p.get("skills") or [] if existing_p else []
        if isinstance(cur_skills, str):
            cur_skills = json.loads(cur_skills)
        merged = list(dict.fromkeys(cur_skills + [s for s in skills_demonstrated if s not in cur_skills]))
        execute(
            "UPDATE passports SET skills = %s, last_updated = NOW() WHERE user_id = %s",
            (json.dumps(merged), str(current_user["id"])),
        )

    # Recalculate score
    calculate_score(str(current_user["id"]))

    return {
        "success": True,
        "data": {
            **(item or {}),
            "complexity_score":    analysis.get("complexity_score"),
            "skills_demonstrated": analysis.get("skills_demonstrated", []),
            "contribution_reason": analysis.get("contribution_reason"),
        },
    }


@router.get("/{user_id}")
def get_by_user(user_id: str, current_user: dict = Depends(verify_token)):
    if str(current_user["id"]) != user_id:
        raise HTTPException(403, "Forbidden")

    items = fetch_all(
        "SELECT * FROM portfolio_items WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,),
    )
    return {"success": True, "data": items}


@router.delete("/{item_id}")
def remove(item_id: str, current_user: dict = Depends(verify_token)):
    deleted = execute(
        "DELETE FROM portfolio_items WHERE id = %s AND user_id = %s RETURNING id",
        (item_id, str(current_user["id"])),
    )
    if not deleted:
        raise HTTPException(404, "Portfolio item not found")

    calculate_score(str(current_user["id"]))
    return {"success": True, "data": {"message": "Portfolio item removed"}}
