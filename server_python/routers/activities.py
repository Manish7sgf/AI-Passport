"""
Verified Activities routes:
  GET    /api/activities/{user_id}
  POST   /api/activities
  DELETE /api/activities/{activity_id}
"""
import json
import re
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from config.database import fetch_all, fetch_one, execute
from middleware.auth import verify_token
from services.score_service import calculate_score

router = APIRouter(prefix="/api/activities", tags=["activities"])

GITHUB_PR_REGEX = re.compile(
    r"^https://github\.com/([\w\-]+)/([\w.\-]+)/pull/(\d+)/?$"
)


class ActivityCreateBody(BaseModel):
    activity_type: str  # "hackathon", "open_source_pr", "mentoring"
    title: str
    proof_url: Optional[str] = None
    role_or_award: Optional[str] = None  # e.g. "Winner", "Finalist", "Contributor", "Lead"
    organization: Optional[str] = None
    year_or_date: Optional[str] = None
    description: Optional[str] = None


@router.get("/{user_id}")
def get_user_activities(user_id: str, current_user: dict = Depends(verify_token)):
    if str(current_user["id"]) != user_id:
        raise HTTPException(403, "Forbidden")

    items = fetch_all(
        "SELECT * FROM verified_activities WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,),
    )
    return {"success": True, "data": items}


@router.post("", status_code=201)
@router.post("/", status_code=201)
def add_activity(body: ActivityCreateBody, current_user: dict = Depends(verify_token)):
    valid_types = {"hackathon", "open_source_pr", "mentoring"}
    if body.activity_type not in valid_types:
        raise HTTPException(400, f"Invalid activity_type. Must be one of: {', '.join(valid_types)}")

    if not body.title.strip():
        raise HTTPException(400, "Activity title / name is required.")

    # Validate proof URL for open source PRs if provided
    if body.activity_type == "open_source_pr" and body.proof_url:
        if not GITHUB_PR_REGEX.match(body.proof_url.strip()):
            raise HTTPException(400, "Must be a valid GitHub Pull Request URL (e.g. https://github.com/owner/repo/pull/123)")

    details = {
        "role_or_award": body.role_or_award or "",
        "organization":  body.organization or "",
        "year_or_date":  body.year_or_date or "",
        "description":   body.description or "",
    }

    user_id = str(current_user["id"])

    item = execute(
        """INSERT INTO verified_activities
             (user_id, activity_type, title, proof_url, details, verified)
           VALUES (%s, %s, %s, %s, %s, %s)
           RETURNING *""",
        (
            user_id,
            body.activity_type,
            body.title.strip(),
            body.proof_url.strip() if body.proof_url else "",
            json.dumps(details),
            True,
        ),
    )

    # Recalculate employability score automatically
    score_data = calculate_score(user_id)

    return {
        "success": True,
        "data": {
            **(item or {}),
            "score": score_data.get("total"),
            "breakdown": score_data.get("breakdown"),
        },
    }


@router.delete("/{activity_id}")
def delete_activity(activity_id: str, current_user: dict = Depends(verify_token)):
    user_id = str(current_user["id"])

    deleted = execute(
        "DELETE FROM verified_activities WHERE id = %s AND user_id = %s RETURNING id",
        (activity_id, user_id),
    )
    if not deleted:
        raise HTTPException(404, "Activity not found")

    score_data = calculate_score(user_id)

    return {
        "success": True,
        "data": {
            "message": "Activity removed",
            "score": score_data.get("total"),
            "breakdown": score_data.get("breakdown"),
        },
    }
