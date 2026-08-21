"""
Public (no auth) routes:
  GET /api/public/passport/{username}
"""
from fastapi import APIRouter, HTTPException
from config.database import fetch_one, fetch_all

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/passport/{username}")
def public_passport(username: str):
    user = fetch_one(
        "SELECT id, name, github_username, avatar_url FROM users WHERE github_username = %s",
        (username,),
    )
    if not user:
        raise HTTPException(404, "Passport not found")

    passport = fetch_one(
        """SELECT bio, skills, interests, hackathons, mentoring_sessions, open_source_prs,
                  employability_score, score_breakdown, last_updated
           FROM passports WHERE user_id = %s""",
        (str(user["id"]),),
    )
    if not passport:
        raise HTTPException(404, "Passport not found")

    portfolio = fetch_all(
        """SELECT title, description, tech_stack, contribution_level,
                  verified, repo_url, created_at
           FROM portfolio_items
           WHERE user_id = %s AND verified = true
           ORDER BY created_at DESC""",
        (str(user["id"]),),
    )

    activities = fetch_all(
        """SELECT id, activity_type, title, proof_url, details, verified, created_at
           FROM verified_activities
           WHERE user_id = %s AND verified = true
           ORDER BY created_at DESC""",
        (str(user["id"]),),
    )

    return {
        "success": True,
        "data": {
            "user": {
                "name":            user["name"],
                "github_username": user["github_username"],
                "avatar_url":      user["avatar_url"],
            },
            "passport":   passport,
            "portfolio":  portfolio,
            "activities": activities,
        },
    }
