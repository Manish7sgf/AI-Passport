const { pool } = require("../config/db");

const PortfolioModel = {
  async findByUserId(userId) {
    const { rows } = await pool.query(
      "SELECT * FROM portfolio_items WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM portfolio_items WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },

  async create({ userId, repoUrl, title, description, techStack, aiSummary, contributionLevel, verified }) {
    const { rows } = await pool.query(
      `INSERT INTO portfolio_items
         (user_id, repo_url, title, description, tech_stack, ai_summary, contribution_level, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, repoUrl, title, description, JSON.stringify(techStack), aiSummary, contributionLevel, verified]
    );
    return rows[0];
  },

  async delete(id, userId) {
    const { rows } = await pool.query(
      "DELETE FROM portfolio_items WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );
    return rows[0] || null;
  },

  async countVerifiedByUserId(userId) {
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM portfolio_items WHERE user_id = $1 AND verified = true",
      [userId]
    );
    return rows[0].count;
  }
};

module.exports = PortfolioModel;
