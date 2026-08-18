"""
Score routes:
  GET  /api/score/{user_id}
  POST /api/score/recalculate
"""
from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from services.score_service import calculate_score

router = APIRouter(prefix="/api/score", tags=["score"])


@router.get("/{user_id}")
def get_score(user_id: str, current_user: dict = Depends(verify_token)):
    if str(current_user["id"]) != user_id:
        raise HTTPException(403, "Forbidden")
    return {"success": True, "data": calculate_score(user_id)}


@router.post("/recalculate")
def recalculate(current_user: dict = Depends(verify_token)):
    return {"success": True, "data": calculate_score(str(current_user["id"]))}
