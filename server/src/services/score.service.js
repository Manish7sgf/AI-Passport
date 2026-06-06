const db = require("../config/db");
const PassportModel = require("../models/passport.model");

const ScoreService = {
  calculateScore(userId) {
    const passport = db
      .prepare("SELECT * FROM passports WHERE user_id = ?")
      .get(userId);

    if (!passport) return { total: 0, breakdown: {} };

    const skills = JSON.parse(passport.skills || "[]");

    const portfolioCount = db
      .prepare("SELECT COUNT(*) as count FROM portfolio_items WHERE user_id = ? AND verified = 1")
      .get(userId).count;

    const projectsScore = Math.min(portfolioCount * 10, 30);
    const skillsScore = Math.min(skills.length * 2, 20);
    const hackathonsScore = Math.min((passport.hackathons || 0) * 5, 20);
    const openSourceScore = Math.min((passport.open_source_prs || 0) * 3, 15);
    const mentoringScore = Math.min((passport.mentoring_sessions || 0) * 5, 15);

    const total = Math.min(
      projectsScore + skillsScore + hackathonsScore + openSourceScore + mentoringScore,
      100
    );

    const breakdown = {
      projects: { score: projectsScore, max: 30, count: portfolioCount },
      skills: { score: skillsScore, max: 20, count: skills.length },
      hackathons: { score: hackathonsScore, max: 20, count: passport.hackathons || 0 },
      openSource: { score: openSourceScore, max: 15, count: passport.open_source_prs || 0 },
      mentoring: { score: mentoringScore, max: 15, count: passport.mentoring_sessions || 0 }
    };

    PassportModel.updateScore(userId, total, breakdown);

    return { total, breakdown };
  }
};

module.exports = ScoreService;
