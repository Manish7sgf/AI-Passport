const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");

const dbPath = process.env.DB_PATH || "./data/passport.db";
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    github_username TEXT,
    github_token TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS passports (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    bio TEXT,
    skills TEXT DEFAULT '[]',
    interests TEXT DEFAULT '[]',
    hackathons INTEGER DEFAULT 0,
    mentoring_sessions INTEGER DEFAULT 0,
    open_source_prs INTEGER DEFAULT 0,
    employability_score INTEGER DEFAULT 0,
    score_breakdown TEXT DEFAULT '{}',
    last_updated TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id)
  );

  CREATE TABLE IF NOT EXISTS portfolio_items (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    repo_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tech_stack TEXT DEFAULT '[]',
    ai_summary TEXT,
    contribution_level TEXT,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS career_simulations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    input_skills TEXT NOT NULL,
    predicted_jobs TEXT NOT NULL,
    readiness_score INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skill_gaps (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    current_skills TEXT NOT NULL,
    future_skills TEXT NOT NULL,
    gap_percentage INTEGER,
    recommendations TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );
`;

let sqlInstance = null; // raw sql.js Database

function persist() {
  if (!sqlInstance) return;
  try {
    const data = sqlInstance.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (err) {
    console.error("DB persist error:", err.message);
  }
}

// Wrapper with prepare/run/get/all interface matching better-sqlite3
const dbWrapper = {
  prepare(sql) {
    return {
      run(...params) {
        sqlInstance.run(sql, params);
        persist();
        return this;
      },
      get(...params) {
        const stmt = sqlInstance.prepare(sql);
        stmt.bind(params);
        const row = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return row;
      },
      all(...params) {
        const results = [];
        const stmt = sqlInstance.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  },
  exec(sql) {
    sqlInstance.run(sql);
    persist();
  }
};

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlInstance = new SQL.Database(fileBuffer);
    console.log(`✅ SQLite (sql.js) loaded from ${dbPath}`);
  } else {
    sqlInstance = new SQL.Database();
    console.log(`✅ SQLite (sql.js) created new database at ${dbPath}`);
  }

  // Create tables
  sqlInstance.run(SCHEMA);
  persist();

  return dbWrapper;
}

// Proxy — all property access defers to dbWrapper once init'd
const dbProxy = new Proxy(
  { init: initDb },
  {
    get(target, prop) {
      if (prop === "init") return initDb;
      if (!sqlInstance) throw new Error("DB not ready — await db.init() in server/index.js");
      return dbWrapper[prop];
    }
  }
);

module.exports = dbProxy;
