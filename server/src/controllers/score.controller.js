const ScoreService = require("../services/score.service");

const ScoreController = {
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
  },

  async recalculate(req, res, next) {
    try {
      const scoreData = await ScoreService.calculateScore(req.user.id);
      res.json({ success: true, data: scoreData });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ScoreController;
