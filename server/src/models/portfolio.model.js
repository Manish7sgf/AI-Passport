const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

function parseItem(item) {
  if (!item) return null;
  item.tech_stack = JSON.parse(item.tech_stack || "[]");
  item.verified = item.verified === 1 || item.verified === true;
  return item;
}

const PortfolioModel = {
  findByUserId(userId) {
    const rows = db
      .prepare("SELECT * FROM portfolio_items WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId);
    return rows.map(parseItem);
  },

  findById(id) {
    return parseItem(
      db.prepare("SELECT * FROM portfolio_items WHERE id = ?").get(id)
    );
  },

  create({ userId, repoUrl, title, description, techStack, aiSummary, contributionLevel, verified }) {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO portfolio_items
        (id, user_id, repo_url, title, description, tech_stack, ai_summary, contribution_level, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, repoUrl, title, description,
      JSON.stringify(techStack), aiSummary, contributionLevel,
      verified ? 1 : 0
    );
    return this.findById(id);
  },

  delete(id, userId) {
    const item = db
      .prepare("SELECT id FROM portfolio_items WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!item) return null;
    db.prepare("DELETE FROM portfolio_items WHERE id = ? AND user_id = ?").run(id, userId);
    return item;
  },

  countByUserId(userId) {
    return db
      .prepare("SELECT COUNT(*) as count FROM portfolio_items WHERE user_id = ? AND verified = 1")
      .get(userId).count;
  }
};

module.exports = PortfolioModel;
