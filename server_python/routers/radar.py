"""
Skill Gap Radar routes:
  POST /api/radar/analyse
  GET  /api/radar/latest
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from config.database import fetch_one, execute
from middleware.auth import verify_token
from services import nvidia_service

router = APIRouter(prefix="/api/radar", tags=["radar"])


class AnalyseBody(BaseModel):
    skills: list[str]


@router.post("/analyse")
def analyse(body: AnalyseBody, current_user: dict = Depends(verify_token)):
    if not body.skills:
        raise HTTPException(400, "Please add at least one skill")

    result = nvidia_service.analyse_skill_gap(body.skills)

    execute(
        "INSERT INTO skill_gaps (user_id, current_skills, future_skills, gap_percentage, recommendations) "
        "VALUES (%s, %s, %s, %s, %s)",
        (
            str(current_user["id"]),
            json.dumps(result.get("current_skills", [])),
            json.dumps(result.get("future_demanded_skills", [])),
            result.get("gap_percentage", 0),
            json.dumps(result.get("recommendations", [])),
        ),
    )

    return {
        "success": True,
        "data": {
            "current_skills":        result.get("current_skills", []),
            "future_demanded_skills": result.get("future_demanded_skills", []),
            "gap_percentage":        result.get("gap_percentage", 0),
            "missing_critical":      result.get("missing_critical", []),
            "recommendations":       result.get("recommendations", []),
        },
    }


@router.get("/latest")
def latest(current_user: dict = Depends(verify_token)):
    row = fetch_one(
        "SELECT * FROM skill_gaps WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
        (str(current_user["id"]),),
    )
    if not row:
        return {"success": True, "data": None}

    return {
        "success": True,
        "data": {
            **row,
            "future_demanded_skills": row.get("future_skills", []),
        },
    }
