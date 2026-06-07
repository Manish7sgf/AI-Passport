const { pool } = require("../config/db");

const UserModel = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT id, email, name, github_username, avatar_url, created_at FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },

  async create({ email, name, passwordHash }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, avatar_url, created_at`,
      [email, name, passwordHash]
    );
    return rows[0];
  },

  async upsertGithubUser({ email, name, githubUsername, githubToken, avatarUrl }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, github_username, github_token, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         github_username = EXCLUDED.github_username,
         github_token    = EXCLUDED.github_token,
         avatar_url      = EXCLUDED.avatar_url,
         name            = EXCLUDED.name
       RETURNING id, email, name, github_username, avatar_url, created_at`,
      [email, name, githubUsername, githubToken, avatarUrl]
    );
    return rows[0];
  }
};

module.exports = UserModel;
