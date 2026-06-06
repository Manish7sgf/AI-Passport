const PortfolioModel = require("../models/portfolio.model");
const GitHubService = require("../services/github.service");
const NvidiaService = require("../services/nvidia.service");
const ScoreService = require("../services/score.service");

const GITHUB_REPO_REGEX = /^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)\/?$/;

const PortfolioController = {
  async verify(req, res, next) {
    try {
      const { repo_url } = req.body;

      if (!repo_url) {
        return res.status(400).json({ success: false, error: "Repository URL is required" });
      }

      const match = repo_url.match(GITHUB_REPO_REGEX);
      if (!match) {
        return res.status(400).json({
          success: false,
          error: "Must be a valid GitHub repo URL (https://github.com/owner/repo)",
          code: "INVALID_URL"
        });
      }

      const [, owner, repo] = match;

      // Fetch GitHub data first — never call Nvidia if GitHub fails
      const { repoData, languages, readme } = await GitHubService.fetchRepoData(owner, repo);

      // Analyse with Nvidia NIM
      const analysis = await NvidiaService.analyseRepo({ repoData, languages, readme });

      // Save to portfolio
      const item = await PortfolioModel.create({
        userId: req.user.id,
        repoUrl: repo_url,
        title: analysis.title,
        description: analysis.description,
        techStack: analysis.tech_stack,
        aiSummary: JSON.stringify({
          contribution_reason: analysis.contribution_reason,
          complexity_score: analysis.complexity_score,
          skills_demonstrated: analysis.skills_demonstrated
        }),
        contributionLevel: analysis.contribution_level,
        verified: true
      });

      // Recalculate score
      await ScoreService.calculateScore(req.user.id);

      res.status(201).json({
        success: true,
        data: {
          ...item,
          complexity_score: analysis.complexity_score,
          skills_demonstrated: analysis.skills_demonstrated,
          contribution_reason: analysis.contribution_reason
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (req.user.id !== userId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const items = await PortfolioModel.findByUserId(userId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const deleted = await PortfolioModel.delete(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Portfolio item not found" });
      }

      // Recalculate score
      await ScoreService.calculateScore(req.user.id);

      res.json({ success: true, data: { message: "Portfolio item removed" } });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = PortfolioController;
