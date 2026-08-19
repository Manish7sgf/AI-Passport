"""
PostgreSQL connection pool + schema auto-creation.
"""
import os
import psycopg2
from psycopg2 import pool as pg_pool
from psycopg2.extras import RealDictCursor

_pool: pg_pool.ThreadedConnectionPool | None = None

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT,
    github_username VARCHAR(255),
    github_token TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    skills JSONB DEFAULT '[]',
    interests JSONB DEFAULT '[]',
    hackathons INTEGER DEFAULT 0,
    mentoring_sessions INTEGER DEFAULT 0,
    open_source_prs INTEGER DEFAULT 0,
    employability_score INTEGER DEFAULT 0,
    score_breakdown JSONB DEFAULT '{}',
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    repo_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tech_stack JSONB DEFAULT '[]',
    ai_summary TEXT,
    contribution_level VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    input_skills JSONB NOT NULL,
    predicted_jobs JSONB NOT NULL,
    readiness_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_skills JSONB NOT NULL,
    future_skills JSONB NOT NULL,
    gap_percentage INTEGER,
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);
"""

MIGRATION_SQL = """
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';
"""


def init_db() -> None:
    """Initialize the connection pool and create tables."""
    global _pool
    dsn = os.environ["DATABASE_URL"]

    # If sslmode is already in DSN or NODE_ENV is production or it's a cloud DB, ensure ssl is handled cleanly
    if "sslmode=" in dsn:
        _pool = pg_pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=dsn)
    else:
        ssl_mode = "require" if (os.getenv("NODE_ENV") == "production" or "localhost" not in dsn) else "disable"
        _pool = pg_pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=dsn, sslmode=ssl_mode)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)
            cur.execute(MIGRATION_SQL)
        conn.commit()

    print("✅ PostgreSQL connected and tables ready")


class get_conn:
    """Context manager that borrows/returns a connection from the pool."""

    def __enter__(self):
        self.conn = _pool.getconn()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.conn.rollback()
        _pool.putconn(self.conn)
        return False


def fetch_one(sql: str, params: tuple = ()) -> dict | None:
    """Run a SELECT and return the first row as a dict, or None."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            return dict(row) if row else None


def fetch_all(sql: str, params: tuple = ()) -> list[dict]:
    """Run a SELECT and return all rows as a list of dicts."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            return [dict(r) for r in cur.fetchall()]


def execute(sql: str, params: tuple = ()) -> dict | None:
    """Run an INSERT/UPDATE/DELETE with RETURNING, commit, and return first row."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            conn.commit()
            try:
                row = cur.fetchone()
                return dict(row) if row else None
            except Exception:
                return None


def execute_many(sql: str, params_list: list[tuple]) -> None:
    """Run an INSERT/UPDATE for multiple rows and commit."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            for params in params_list:
                cur.execute(sql, params)
        conn.commit()
