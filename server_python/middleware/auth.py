"""
JWT authentication middleware for FastAPI.
Injects current_user into route dependencies.
"""
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, ExpiredSignatureError, jwt

from config.database import fetch_one

security = HTTPBearer(auto_error=False)


def verify_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Dependency: verifies JWT, returns user dict from DB.
    Raises 401 on any failure.
    """
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    token = credentials.credentials
    secret = os.environ["JWT_SECRET"]

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id: str = payload.get("userId")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired",
            headers={"X-Error-Code": "TOKEN_EXPIRED"},
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = fetch_one(
        "SELECT id, email, name, github_username, github_token, avatar_url "
        "FROM users WHERE id = %s",
        (user_id,),
    )
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user


# Alias for use in route signatures
CurrentUser = Depends(verify_token)
