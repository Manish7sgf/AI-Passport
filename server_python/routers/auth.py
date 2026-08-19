"""
Auth routes:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/github
  GET  /api/auth/github/callback
  GET  /api/auth/me
"""
import os
import json
from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
import httpx

from config.database import fetch_one, execute
from middleware.auth import verify_token

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _sign_token(user_id: str) -> str:
    secret = os.environ["JWT_SECRET"]
    payload = {"userId": str(user_id)}
    return jwt.encode(payload, secret, algorithm="HS256")


def _frontend_url() -> str:
    return os.getenv("CLIENT_URL", "http://localhost:5173")


# ── Schemas ──────────────────────────────────────────────────────────────────

class RegisterBody(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def _create_passport_if_missing(user_id: str) -> None:
    execute(
        "INSERT INTO passports (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
        (user_id,),
    )


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
def register(body: RegisterBody):
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    existing = fetch_one("SELECT id FROM users WHERE email = %s", (body.email,))
    if existing:
        raise HTTPException(409, "Email already registered")

    password_hash = pwd_ctx.hash(body.password)
    user = execute(
        "INSERT INTO users (email, name, password_hash) VALUES (%s, %s, %s) "
        "RETURNING id, email, name, avatar_url",
        (body.email, body.name, password_hash),
    )
    if not user:
        raise HTTPException(500, "Failed to create user")

    _create_passport_if_missing(str(user["id"]))
    token = _sign_token(str(user["id"]))

    return {
        "success": True,
        "data": {
            "token": token,
            "user": {"id": str(user["id"]), "email": user["email"], "name": user["name"]},
        },
    }


@router.post("/login")
def login(body: LoginBody):
    user = fetch_one("SELECT * FROM users WHERE email = %s", (body.email,))
    if not user or not user.get("password_hash"):
        raise HTTPException(401, "Invalid email or password")

    if not pwd_ctx.verify(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")

    token = _sign_token(str(user["id"]))
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "name": user["name"],
                "avatar_url": user.get("avatar_url"),
            },
        },
    }


@router.get("/github")
def github_redirect():
    client_id = os.environ["GITHUB_CLIENT_ID"]
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={client_id}&scope=read:user,user:email"
    )
    return RedirectResponse(url)


@router.get("/github/callback")
def github_callback(code: str | None = None):
    frontend = _frontend_url()

    if not code:
        return RedirectResponse(f"{frontend}/auth?error=github_denied")

    # Exchange code for access token
    with httpx.Client(timeout=15) as client:
        token_res = client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id":     os.environ["GITHUB_CLIENT_ID"],
                "client_secret": os.environ["GITHUB_CLIENT_SECRET"],
                "code":          code,
            },
            headers={"Accept": "application/json"},
        )

    token_data = token_res.json()
    access_token = token_data.get("access_token")
    if not access_token:
        return RedirectResponse(f"{frontend}/auth?error=github_token_failed")

    gh_headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github.v3+json",
    }

    # Fetch GitHub profile
    with httpx.Client(timeout=15) as client:
        profile = client.get("https://api.github.com/user", headers=gh_headers).json()

    email = profile.get("email")
    if not email:
        with httpx.Client(timeout=15) as client:
            emails = client.get("https://api.github.com/user/emails", headers=gh_headers).json()
        primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
        email = primary["email"] if primary else f"{profile['login']}@github.local"

    # Upsert user
    user = execute(
        """INSERT INTO users (email, name, github_username, github_token, avatar_url)
           VALUES (%s, %s, %s, %s, %s)
           ON CONFLICT (email) DO UPDATE SET
             github_username = EXCLUDED.github_username,
             github_token    = EXCLUDED.github_token,
             avatar_url      = EXCLUDED.avatar_url,
             name            = EXCLUDED.name
           RETURNING id, email, name, github_username, avatar_url""",
        (email, profile.get("name") or profile["login"], profile["login"], access_token, profile.get("avatar_url")),
    )
    if not user:
        return RedirectResponse(f"{frontend}/auth?error=db_error")

    _create_passport_if_missing(str(user["id"]))

    # Auto-sync repositories & skills on GitHub login
    try:
        from services import github_service
        from services.score_service import calculate_score

        synced_repos = github_service.sync_user_repos(profile["login"], access_token)
        for repo in synced_repos:
            execute(
                """INSERT INTO portfolio_items
                     (user_id, repo_url, title, description, tech_stack, ai_summary,
                      contribution_level, verified, source)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT DO NOTHING""",
                (
                    str(user["id"]),
                    repo["repo_url"],
                    repo["title"],
                    repo["description"],
                    json.dumps(repo["tech_stack"]),
                    json.dumps(repo["github_data"]),
                    repo["contribution_level"],
                    False,
                    "github_sync",
                ),
            )

        detected_skills = github_service.extract_skills_from_repos(synced_repos)
        if detected_skills:
            execute(
                "UPDATE passports SET skills = %s, last_updated = NOW() WHERE user_id = %s",
                (json.dumps(detected_skills), str(user["id"])),
            )

        calculate_score(str(user["id"]))
    except Exception as sync_err:
        print(f"GitHub OAuth auto-sync note: {sync_err}")

    token = _sign_token(str(user["id"]))
    return RedirectResponse(f"{frontend}/auth/callback?token={token}")


@router.get("/me")
def me(current_user: dict = Depends(verify_token)):
    user_data = {
        "id": str(current_user["id"]),
        "email": current_user.get("email"),
        "name": current_user.get("name") or "Student",
        "github_username": current_user.get("github_username"),
        "avatar_url": current_user.get("avatar_url"),
        "created_at": str(current_user.get("created_at") or ""),
    }
    return {"success": True, "data": {"user": user_data}}
