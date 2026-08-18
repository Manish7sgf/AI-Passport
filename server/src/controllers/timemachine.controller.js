const { pool } = require("../config/db");
const NvidiaService = require("../services/nvidia.service");

const TimeMachineController = {
  async predict(req, res, next) {
    try {
      const { skills, interests } = req.body;

      if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Please add at least one skill",
          code: "VALIDATION_ERROR"
        });
      }

      const interestList = Array.isArray(interests) ? interests : [];
      const result = await NvidiaService.predictCareers({ skills, interests: interestList });

      await pool.query(
        `INSERT INTO career_simulations (user_id, input_skills, predicted_jobs, readiness_score)
         VALUES ($1, $2, $3, $4)`,
        [req.user.id, JSON.stringify(skills), JSON.stringify(result.predicted_jobs), result.readiness_score]
      );

      res.json({
        success: true,
        data: {
          jobs: result.predicted_jobs,
          readiness_score: result.readiness_score,
          gap_summary: result.gap_summary,
          top_recommendation: result.top_recommendation
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async history(req, res, next) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM career_simulations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
        [req.user.id]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TimeMachineController;
