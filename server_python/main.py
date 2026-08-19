"""
AI Future Passport — Python/FastAPI backend
Replaces the Node.js/Express server with identical API surface.
"""
import os
from contextlib import asynccontextmanager
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config.database import init_db
from routers import auth, passport, timemachine, radar, portfolio, score, github_sync, public

# ── Lifespan (startup / shutdown) ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# ── App factory ───────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=["100/15minutes"])

app = FastAPI(
    title="AI Future Passport",
    version="2.0.0",
    description="Employability ecosystem for students — Python/FastAPI backend",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — mirrors the JS server behaviour + handles Vercel deployments
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173").rstrip("/")
allowed_origins = list({CLIENT_URL, f"{CLIENT_URL}/", "http://localhost:5173", "http://127.0.0.1:5173"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ─────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    # psycopg2 unique violation
    if hasattr(exc, "pgcode"):
        if exc.pgcode == "23505":
            return JSONResponse(
                status_code=409,
                content={"success": False, "error": "A record with this value already exists", "code": "DUPLICATE_ENTRY"},
            )
        return JSONResponse(
            status_code=503,
            content={"success": False, "error": "Database error, please try again", "code": "DB_ERROR"},
        )
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", str(exc)) or "Internal server error"
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": detail},
    )


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(passport.router)
app.include_router(timemachine.router)
app.include_router(radar.router)
app.include_router(portfolio.router)
app.include_router(score.router)
app.include_router(github_sync.router)
app.include_router(public.router)


# ── Utility endpoints ─────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"success": True, "data": {"status": "ok", "timestamp": datetime.utcnow().isoformat()}}


@app.get("/api/ping")
def ping():
    return "pong"


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    is_prod = os.getenv("NODE_ENV") == "production"
    base = "https://ai-passport.onrender.com" if is_prod else f"http://localhost:{port}"
    print(f"🚀 AI Future Passport (Python) running on {base}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=not is_prod)
