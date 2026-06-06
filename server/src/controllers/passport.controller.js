const PassportModel = require("../models/passport.model");
const ScoreService = require("../services/score.service");

const PassportController = {
  async getPassport(req, res, next) {
    try {
      const { userId } = req.params;

      // Users can only access their own passport
      if (req.user.id !== userId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const passport = await PassportModel.findByUserId(userId);
      if (!passport) {
        return res.status(404).json({ success: false, error: "Passport not found" });
      }

      res.json({ success: true, data: passport });
    } catch (err) {
      next(err);
    }
  },

  async updatePassport(req, res, next) {
    try {
      const { userId } = req.params;

      if (req.user.id !== userId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const { bio, skills, interests, hackathons, mentoring_sessions, open_source_prs } = req.body;

      // Validate arrays
      if (skills !== undefined && !Array.isArray(skills)) {
        return res.status(400).json({ success: false, error: "Skills must be an array" });
      }
      if (interests !== undefined && !Array.isArray(interests)) {
        return res.status(400).json({ success: false, error: "Interests must be an array" });
      }

      const updated = await PassportModel.update(userId, {
        bio, skills, interests, hackathons, mentoring_sessions, open_source_prs
      });

      // Recalculate score
      const scoreData = await ScoreService.calculateScore(userId);

      res.json({
        success: true,
        data: { ...updated, score: scoreData }
      });
    } catch (err) {
      next(err);
    }
  },

  async getScore(req, res, next) {
    try {
      const { userId } = req.params;

      if (req.user.id !== userId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const scoreData = await ScoreService.calculateScore(userId);
      res.json({ success: true, data: scoreData });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = PassportController;
