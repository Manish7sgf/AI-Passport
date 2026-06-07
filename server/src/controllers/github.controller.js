const { pool } = require("../config/db");
const GitHubService = require("../services/github.service");
const PassportModel = require("../models/passport.model");
const ScoreService = require("../services/score.service");

const GitHubController = {
  async syncRepos(req, res, next) {
    try {
      const { github_username, github_token } = req.user;

      if (!github_username) {
        return res.status(400).json({
          success: false,
          error: "No GitHub account linked. Connect GitHub via OAuth to sync repos.",
          code: "NO_GITHUB_ACCOUNT"
        });
      }

      // Fetch public repos from GitHub
      const syncedRepos = await GitHubService.syncUserRepos(github_username, github_token);

      if (syncedRepos.length === 0) {
        return res.json({
          success: true,
          data: { synced: 0, skipped: 0, skills_added: [], message: "No public repos found" }
        });
      }

      // Get existing repo URLs to avoid duplicates
      const { rows: existing } = await pool.query(
        "SELECT repo_url FROM portfolio_items WHERE user_id = $1",
        [req.user.id]
      );
      const existingUrls = new Set(existing.map((r) => r.repo_url));

      // Only insert repos not already in portfolio
      const newRepos = syncedRepos.filter((r) => !existingUrls.has(r.repo_url));

      let synced = 0;
      for (const repo of newRepos) {
        await pool.query(
          `INSERT INTO portfolio_items
             (user_id, repo_url, title, description, tech_stack, ai_summary, contribution_level, verified, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT DO NOTHING`,
          [
            req.user.id,
            repo.repo_url,
            repo.title,
            repo.description,
            JSON.stringify(repo.tech_stack),
            JSON.stringify(repo.github_data),
            repo.contribution_level,
            false,              // not AI-verified yet — just synced
            "github_sync"
          ]
        );
        synced++;
      }

      // Extract skills from all synced repos and merge with passport skills
      const allRepos = [...syncedRepos, ...existing.map((r) => ({ tech_stack: [] }))];
      const detectedSkills = GitHubService.extractSkillsFromRepos(syncedRepos);

      // Merge new skills into passport (don't overwrite existing ones)
      const passport = await PassportModel.findByUserId(req.user.id);
      const existingSkills = Array.isArray(passport?.skills) ? passport.skills : [];
      const mergedSkills = [...new Set([...existingSkills, ...detectedSkills])];
      const skillsAdded = mergedSkills.filter((s) => !existingSkills.includes(s));

      if (skillsAdded.length > 0) {
        await PassportModel.update(req.user.id, { skills: mergedSkills });
      }

      // Recalculate score with updated projects + skills
      await ScoreService.calculateScore(req.user.id);

      res.json({
        success: true,
        data: {
          synced,
          skipped: syncedRepos.length - newRepos.length,
          total_repos: syncedRepos.length,
          skills_added: skillsAdded,
          message: `Synced ${synced} repo${synced !== 1 ? "s" : ""}${skillsAdded.length ? `, added ${skillsAdded.length} skill${skillsAdded.length !== 1 ? "s" : ""}` : ""}`
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getSyncStatus(req, res, next) {
    try {
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS synced_count, MAX(created_at) AS last_synced
         FROM portfolio_items
         WHERE user_id = $1 AND source = 'github_sync'`,
        [req.user.id]
      );
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = GitHubController;
