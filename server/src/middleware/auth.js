const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      "SELECT id, email, name, github_username, github_token, avatar_url FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = authMiddleware;
