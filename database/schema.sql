-- AI Future Passport — Database Schema
-- Run: psql -U postgres -d aifuture -f database/schema.sql

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT,
  github_username VARCHAR(255),
  github_token TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Passport (one per user)
CREATE TABLE passports (
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

-- Portfolio projects
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  tech_stack JSONB DEFAULT '[]',
  ai_summary TEXT,
  contribution_level VARCHAR(50),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Career simulations (saved results)
CREATE TABLE career_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_skills JSONB NOT NULL,
  predicted_jobs JSONB NOT NULL,
  readiness_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skill gap snapshots
CREATE TABLE skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_skills JSONB NOT NULL,
  future_skills JSONB NOT NULL,
  gap_percentage INTEGER,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
