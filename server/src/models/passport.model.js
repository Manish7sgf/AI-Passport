const { pool } = require("../config/db");

const PassportModel = {
  async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT p.*,
         (SELECT COUNT(*)::int FROM portfolio_items  WHERE user_id = $1) AS portfolio_count,
         (SELECT COUNT(*)::int FROM career_simulations WHERE user_id = $1) AS simulations_count
       FROM passports p
       WHERE p.user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  },

  async create(userId) {
    const { rows } = await pool.query(
      `INSERT INTO passports (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId]
    );
    // If row already existed DO NOTHING returns nothing — fetch it
    return rows[0] || (await this.findByUserId(userId));
  },

  async update(userId, { bio, skills, interests, hackathons, mentoring_sessions, open_source_prs }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (bio               !== undefined) { fields.push(`bio = $${idx++}`);               values.push(bio); }
    if (skills            !== undefined) { fields.push(`skills = $${idx++}`);            values.push(JSON.stringify(skills)); }
    if (interests         !== undefined) { fields.push(`interests = $${idx++}`);         values.push(JSON.stringify(interests)); }
    if (hackathons        !== undefined) { fields.push(`hackathons = $${idx++}`);        values.push(hackathons); }
    if (mentoring_sessions!== undefined) { fields.push(`mentoring_sessions = $${idx++}`);values.push(mentoring_sessions); }
    if (open_source_prs   !== undefined) { fields.push(`open_source_prs = $${idx++}`);  values.push(open_source_prs); }

    if (fields.length === 0) return this.findByUserId(userId);

    fields.push(`last_updated = NOW()`);
    values.push(userId);

    const { rows } = await pool.query(
      `UPDATE passports SET ${fields.join(", ")} WHERE user_id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async updateScore(userId, score, breakdown) {
    await pool.query(
      `UPDATE passports
       SET employability_score = $1, score_breakdown = $2, last_updated = NOW()
       WHERE user_id = $3`,
      [score, JSON.stringify(breakdown), userId]
    );
  }
};

module.exports = PassportModel;
