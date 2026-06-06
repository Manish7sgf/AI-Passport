const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const NvidiaService = require("../services/nvidia.service");

const RadarController = {
  async analyse(req, res, next) {
    try {
      const { skills } = req.body;

      if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Please add at least one skill",
          code: "VALIDATION_ERROR"
        });
      }

      const result = await NvidiaService.analyseSkillGap({ skills });

      db.prepare(`
        INSERT INTO skill_gaps (id, user_id, current_skills, future_skills, gap_percentage, recommendations)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        req.user.id,
        JSON.stringify(result.current_skills),
        JSON.stringify(result.future_demanded_skills),
        result.gap_percentage,
        JSON.stringify(result.recommendations)
      );

      res.json({
        success: true,
        data: {
          current_skills: result.current_skills,
          future_demanded_skills: result.future_demanded_skills,
          gap_percentage: result.gap_percentage,
          missing_critical: result.missing_critical,
          recommendations: result.recommendations
        }
      });
    } catch (err) {
      next(err);
    }
  },

  latest(req, res, next) {
    try {
      const row = db
        .prepare("SELECT * FROM skill_gaps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1")
        .get(req.user.id);

      if (!row) {
        return res.json({ success: true, data: null });
      }

      res.json({
        success: true,
        data: {
          ...row,
          current_skills: JSON.parse(row.current_skills || "[]"),
          future_demanded_skills: JSON.parse(row.future_skills || "[]"),
          recommendations: JSON.parse(row.recommendations || "[]")
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = RadarController;
