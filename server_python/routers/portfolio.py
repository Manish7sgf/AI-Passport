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

    # Fetch GitHub data — never call Nvidia if this fails
    gh = github_service.fetch_repo_data(owner, repo)

    # AI analysis
    analysis = nvidia_service.analyse_repo(
        gh["repo_data"], gh["languages"], gh["readme"]
    )

    ai_summary = json.dumps({
        "contribution_reason": analysis.get("contribution_reason"),
        "complexity_score":    analysis.get("complexity_score"),
        "skills_demonstrated": analysis.get("skills_demonstrated", []),
    })

    item = execute(
        """INSERT INTO portfolio_items
             (user_id, repo_url, title, description, tech_stack, ai_summary,
              contribution_level, verified, source)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
           RETURNING *""",
        (
            str(current_user["id"]),
            body.repo_url,
            analysis.get("title"),
            analysis.get("description"),
            json.dumps(analysis.get("tech_stack", [])),
            ai_summary,
            analysis.get("contribution_level"),
            True,
            "manual",
        ),
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
