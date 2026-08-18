const { pool } = require("../config/db");

const PublicController = {
  async getPublicPassport(req, res, next) {
    try {
      const { username } = req.params;

      // Find user by github_username or email prefix
      const { rows: userRows } = await pool.query(
        "SELECT id, name, github_username, avatar_url FROM users WHERE github_username = $1",
        [username]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ success: false, error: "Passport not found" });
      }

      const user = userRows[0];

      const { rows: passportRows } = await pool.query(
        `SELECT bio, skills, interests, hackathons, mentoring_sessions, open_source_prs,
                employability_score, score_breakdown, last_updated
         FROM passports WHERE user_id = $1`,
        [user.id]
      );

      if (passportRows.length === 0) {
        return res.status(404).json({ success: false, error: "Passport not found" });
      }

      const { rows: portfolioRows } = await pool.query(
        `SELECT title, description, tech_stack, contribution_level, verified, repo_url, created_at
         FROM portfolio_items WHERE user_id = $1 AND verified = true
         ORDER BY created_at DESC LIMIT 6`,
        [user.id]
      );

      res.json({
        success: true,
        data: {
          user: {
            name:            user.name,
            github_username: user.github_username,
            avatar_url:      user.avatar_url
          },
          passport:  passportRows[0],
          portfolio: portfolioRows
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = PublicController;
