const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const UserModel = {
  findByEmail(email) {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email) || null;
  },

  findById(id) {
    return (
      db
        .prepare("SELECT id, email, name, github_username, avatar_url, created_at FROM users WHERE id = ?")
        .get(id) || null
    );
  },

  findByGithubUsername(username) {
    return db.prepare("SELECT * FROM users WHERE github_username = ?").get(username) || null;
  },

  create({ email, name, passwordHash }) {
    const id = uuidv4();
    db.prepare(
      "INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
    ).run(id, email, name, passwordHash);
    return this.findById(id);
  },

  upsertGithubUser({ email, name, githubUsername, githubToken, avatarUrl }) {
    const existing = this.findByEmail(email);
    if (existing) {
      db.prepare(
        `UPDATE users SET github_username = ?, github_token = ?, avatar_url = ?, name = ? WHERE email = ?`
      ).run(githubUsername, githubToken, avatarUrl, name, email);
      return this.findById(existing.id);
    } else {
      const id = uuidv4();
      db.prepare(
        "INSERT INTO users (id, email, name, github_username, github_token, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(id, email, name, githubUsername, githubToken, avatarUrl);
      return this.findById(id);
    }
  }
};

module.exports = UserModel;
