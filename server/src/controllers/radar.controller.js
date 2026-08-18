const { pool } = require("../config/db");
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

      await pool.query(
        `INSERT INTO skill_gaps (user_id, current_skills, future_skills, gap_percentage, recommendations)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user.id,
          JSON.stringify(result.current_skills),
          JSON.stringify(result.future_demanded_skills),
          result.gap_percentage,
          JSON.stringify(result.recommendations)
        ]
      );

      res.json({
        success: true,
        data: {
          current_skills:       result.current_skills,
          future_demanded_skills: result.future_demanded_skills,
          gap_percentage:       result.gap_percentage,
          missing_critical:     result.missing_critical,
          recommendations:      result.recommendations
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async latest(req, res, next) {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM skill_gaps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [req.user.id]
      );

      if (rows.length === 0) return res.json({ success: true, data: null });

      const row = rows[0];
      res.json({
        success: true,
        data: {
          ...row,
          current_skills:         row.current_skills,
          future_demanded_skills: row.future_skills,
          recommendations:        row.recommendations
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = RadarController;
