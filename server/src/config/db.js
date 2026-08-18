const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
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
    `);
    // Migration: add source column if it doesn't exist (for existing DBs)
    await client.query(`
      ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';
    `);

    console.log("✅ PostgreSQL connected and tables ready");
  } finally {
    client.release();
  }
}

module.exports = { pool, initDb };
