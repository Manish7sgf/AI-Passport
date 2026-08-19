"""
Employability score calculator.
Formula (max 100):
  verified_projects × 10  (max 30)
  skills_count × 2        (max 20)
  hackathons × 5          (max 20)
  open_source_prs × 3     (max 15)
  mentoring_sessions × 5  (max 15)
"""
import json
from config.database import fetch_one, execute


def calculate_score(user_id: str) -> dict:
    passport = fetch_one("SELECT * FROM passports WHERE user_id = %s", (user_id,))
    if not passport:
        return {"total": 0, "breakdown": {}}

    # skills may arrive as list or JSON string depending on psycopg2 JSONB handling
    skills = passport.get("skills") or []
    if isinstance(skills, str):
        skills = json.loads(skills)

    portfolio_row = fetch_one(
        "SELECT COUNT(*)::int AS count FROM portfolio_items "
        "WHERE user_id = %s AND verified = true",
        (user_id,),
    )
    portfolio_count = portfolio_row["count"] if portfolio_row else 0

    # Count verified activities
    hack_row = fetch_one(
        "SELECT COUNT(*)::int AS count FROM verified_activities WHERE user_id = %s AND activity_type = 'hackathon'",
        (user_id,),
    )
    hack_count = (hack_row["count"] if hack_row else 0) + (passport.get("hackathons") or 0)

    pr_row = fetch_one(
        "SELECT COUNT(*)::int AS count FROM verified_activities WHERE user_id = %s AND activity_type = 'open_source_pr'",
        (user_id,),
    )
    pr_count = (pr_row["count"] if pr_row else 0) + (passport.get("open_source_prs") or 0)

    mentor_row = fetch_one(
        "SELECT COUNT(*)::int AS count FROM verified_activities WHERE user_id = %s AND activity_type = 'mentoring'",
        (user_id,),
    )
    mentor_count = (mentor_row["count"] if mentor_row else 0) + (passport.get("mentoring_sessions") or 0)

    projects_score    = min(portfolio_count * 10, 30)
    skills_score      = min(len(skills) * 2, 20)
    hackathons_score  = min(hack_count * 5, 20)
    open_source_score = min(pr_count * 5, 15)
    mentoring_score   = min(mentor_count * 5, 15)

    total = min(
        projects_score + skills_score + hackathons_score + open_source_score + mentoring_score,
        100,
    )

    breakdown = {
        "projects":   {"score": projects_score,    "max": 30, "count": portfolio_count},
        "skills":     {"score": skills_score,      "max": 20, "count": len(skills)},
        "hackathons": {"score": hackathons_score,  "max": 20, "count": hack_count},
        "openSource": {"score": open_source_score, "max": 15, "count": pr_count},
        "mentoring":  {"score": mentoring_score,   "max": 15, "count": mentor_count},
    }

    # Persist back to DB
    execute(
        "UPDATE passports SET employability_score = %s, score_breakdown = %s, "
        "hackathons = %s, open_source_prs = %s, mentoring_sessions = %s, "
        "last_updated = NOW() WHERE user_id = %s",
        (total, json.dumps(breakdown), hack_count, pr_count, mentor_count, user_id),
    )

    return {"total": total, "breakdown": breakdown}
