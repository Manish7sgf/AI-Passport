"""
Career Time Machine routes:
  POST /api/timemachine/predict
  GET  /api/timemachine/history
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from config.database import fetch_all, execute
from middleware.auth import verify_token
from services import nvidia_service

router = APIRouter(prefix="/api/timemachine", tags=["timemachine"])


class PredictBody(BaseModel):
    skills:    list[str]
    interests: Optional[list[str]] = []


@router.post("/predict")
def predict(body: PredictBody, current_user: dict = Depends(verify_token)):
    if not body.skills:
        raise HTTPException(400, "Please add at least one skill")

    result = nvidia_service.predict_careers(body.skills, body.interests or [])

    # Persist simulation
    execute(
        "INSERT INTO career_simulations (user_id, input_skills, predicted_jobs, readiness_score) "
        "VALUES (%s, %s, %s, %s)",
        (
            str(current_user["id"]),
            json.dumps(body.skills),
            json.dumps(result.get("predicted_jobs", [])),
            result.get("readiness_score", 0),
        ),
    )

    return {
        "success": True,
        "data": {
            "jobs":               result.get("predicted_jobs", []),
            "readiness_score":    result.get("readiness_score", 0),
            "gap_summary":        result.get("gap_summary", ""),
            "top_recommendation": result.get("top_recommendation", ""),
        },
    }


@router.get("/history")
def history(current_user: dict = Depends(verify_token)):
    rows = fetch_all(
        "SELECT * FROM career_simulations WHERE user_id = %s "
        "ORDER BY created_at DESC LIMIT 10",
        (str(current_user["id"]),),
    )
    return {"success": True, "data": rows}
