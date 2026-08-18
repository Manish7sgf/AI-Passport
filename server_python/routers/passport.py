"""
Passport routes:
  GET  /api/passport/{user_id}
  PUT  /api/passport/{user_id}
  GET  /api/passport/{user_id}/score
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from config.database import fetch_one, execute
from middleware.auth import verify_token
from services.score_service import calculate_score

router = APIRouter(prefix="/api/passport", tags=["passport"])


class PassportUpdate(BaseModel):
    bio:               Optional[str]       = None
    skills:            Optional[list[str]] = None
    interests:         Optional[list[str]] = None
    hackathons:        Optional[int]       = None
    mentoring_sessions: Optional[int]      = None
    open_source_prs:   Optional[int]       = None


def _get_passport(user_id: str) -> dict:
    row = fetch_one(
        """SELECT p.*,
             (SELECT COUNT(*)::int FROM portfolio_items  WHERE user_id = %s) AS portfolio_count,
             (SELECT COUNT(*)::int FROM career_simulations WHERE user_id = %s) AS simulations_count
           FROM passports p WHERE p.user_id = %s""",
        (user_id, user_id, user_id),
    )
    return row


@router.get("/{user_id}")
def get_passport(user_id: str, current_user: dict = Depends(verify_token)):
    if str(current_user["id"]) != user_id:
        raise HTTPException(403, "Forbidden")

    passport = _get_passport(user_id)
    if not passport:
        raise HTTPException(404, "Passport not found")

    return {"success": True, "data": passport}


@router.put("/{user_id}")
def update_passport(user_id: str, body: PassportUpdate, current_user: dict = Depends(verify_token)):
    if str(current_user["id"]) != user_id:
        raise HTTPException(403, "Forbidden")

    fields, values = [], []

    if body.bio               is not None: fields.append("bio = %s");                values.append(body.bio)
    if body.skills            is not None: fields.append("skills = %s");             values.append(json.dumps(body.skills))
    if body.interests         is not None: fields.append("interests = %s");          values.append(json.dumps(body.interests))
    if body.hackathons        is not None: fields.append("hackathons = %s");         values.append(body.hackathons)
    if body.mentoring_sessions is not None: fields.append("mentoring_sessions = %s"); values.append(body.mentoring_sessions)
    if body.open_source_prs   is not None: fields.append("open_source_prs = %s");   values.append(body.open_source_prs)

    if fields:
        fields.append("last_updated = NOW()")
        values.append(user_id)
        execute(
            f"UPDATE passports SET {', '.join(fields)} WHERE user_id = %s",
            tuple(values),
        )

    # Always recalculate after any update
    score_data = calculate_score(user_id)
    updated = _get_passport(user_id)

    return {"success": True, "data": {**(updated or {}), "score": score_data}}


@router.get("/{user_id}/score")
def get_score(user_id: str, current_user: dict = Depends(verify_token)):
    if str(current_user["id"]) != user_id:
        raise HTTPException(403, "Forbidden")

    score_data = calculate_score(user_id)
    return {"success": True, "data": score_data}
