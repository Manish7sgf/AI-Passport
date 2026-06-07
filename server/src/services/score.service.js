const { pool } = require("../config/db");
const PassportModel = require("../models/passport.model");

const ScoreService = {
  async calculateScore(userId) {
    const { rows: pRows } = await pool.query(
      "SELECT * FROM passports WHERE user_id = $1",
      [userId]
    );
    if (pRows.length === 0) return { total: 0, breakdown: {} };

    const passport = pRows[0];
    const skills = Array.isArray(passport.skills) ? passport.skills : [];

    const { rows: cRows } = await pool.query(
      "SELECT COUNT(*)::int AS count FROM portfolio_items WHERE user_id = $1 AND verified = true",
      [userId]
    );
    const portfolioCount = cRows[0].count;

    const projectsScore  = Math.min(portfolioCount * 10, 30);
    const skillsScore    = Math.min(skills.length * 2,   20);
    const hackathonsScore= Math.min((passport.hackathons || 0) * 5, 20);
    const openSourceScore= Math.min((passport.open_source_prs || 0) * 3, 15);
    const mentoringScore = Math.min((passport.mentoring_sessions || 0) * 5, 15);

    const total = Math.min(
      projectsScore + skillsScore + hackathonsScore + openSourceScore + mentoringScore,
      100
    );

    const breakdown = {
      projects:   { score: projectsScore,   max: 30, count: portfolioCount },
      skills:     { score: skillsScore,     max: 20, count: skills.length },
      hackathons: { score: hackathonsScore, max: 20, count: passport.hackathons || 0 },
      openSource: { score: openSourceScore, max: 15, count: passport.open_source_prs || 0 },
      mentoring:  { score: mentoringScore,  max: 15, count: passport.mentoring_sessions || 0 }
    };

    await PassportModel.updateScore(userId, total, breakdown);
    return { total, breakdown };
  }
};

module.exports = ScoreService;
