const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
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

      // Save to career_simulations
      db.prepare(`
        INSERT INTO career_simulations (id, user_id, input_skills, predicted_jobs, readiness_score)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        req.user.id,
        JSON.stringify(skills),
        JSON.stringify(result.predicted_jobs),
        result.readiness_score
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

  history(req, res, next) {
    try {
      const rows = db
        .prepare("SELECT * FROM career_simulations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10")
        .all(req.user.id);

      const parsed = rows.map((r) => ({
        ...r,
        input_skills: JSON.parse(r.input_skills || "[]"),
        predicted_jobs: JSON.parse(r.predicted_jobs || "[]")
      }));

      res.json({ success: true, data: parsed });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TimeMachineController;
