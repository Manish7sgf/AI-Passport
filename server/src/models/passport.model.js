const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const PassportModel = {
  findByUserId(userId) {
    const passport = db
      .prepare("SELECT * FROM passports WHERE user_id = ?")
      .get(userId);

    if (!passport) return null;

    // Parse JSON fields
    passport.skills = JSON.parse(passport.skills || "[]");
    passport.interests = JSON.parse(passport.interests || "[]");
    passport.score_breakdown = JSON.parse(passport.score_breakdown || "{}");

    // Attach counts
    passport.portfolio_count = db
      .prepare("SELECT COUNT(*) as count FROM portfolio_items WHERE user_id = ?")
      .get(userId).count;

    passport.simulations_count = db
      .prepare("SELECT COUNT(*) as count FROM career_simulations WHERE user_id = ?")
      .get(userId).count;

    return passport;
  },

  create(userId) {
    const existing = db
      .prepare("SELECT id FROM passports WHERE user_id = ?")
      .get(userId);
    if (existing) return this.findByUserId(userId);

    const id = uuidv4();
    db.prepare(
      "INSERT INTO passports (id, user_id) VALUES (?, ?)"
    ).run(id, userId);
    return this.findByUserId(userId);
  },

  update(userId, { bio, skills, interests, hackathons, mentoring_sessions, open_source_prs }) {
    const current = db.prepare("SELECT * FROM passports WHERE user_id = ?").get(userId);
    if (!current) return null;

    const updated = {
      bio: bio !== undefined ? bio : current.bio,
      skills: skills !== undefined ? JSON.stringify(skills) : current.skills,
      interests: interests !== undefined ? JSON.stringify(interests) : current.interests,
      hackathons: hackathons !== undefined ? hackathons : current.hackathons,
      mentoring_sessions: mentoring_sessions !== undefined ? mentoring_sessions : current.mentoring_sessions,
      open_source_prs: open_source_prs !== undefined ? open_source_prs : current.open_source_prs
    };

    db.prepare(`
      UPDATE passports SET
        bio = ?, skills = ?, interests = ?, hackathons = ?,
        mentoring_sessions = ?, open_source_prs = ?,
        last_updated = datetime('now')
      WHERE user_id = ?
    `).run(
      updated.bio, updated.skills, updated.interests,
      updated.hackathons, updated.mentoring_sessions, updated.open_source_prs,
      userId
    );

    return this.findByUserId(userId);
  },

  updateScore(userId, score, breakdown) {
    db.prepare(`
      UPDATE passports SET
        employability_score = ?, score_breakdown = ?, last_updated = datetime('now')
      WHERE user_id = ?
    `).run(score, JSON.stringify(breakdown), userId);
    return this.findByUserId(userId);
  }
};

module.exports = PassportModel;
