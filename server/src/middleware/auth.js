const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = db
      .prepare("SELECT id, email, name, github_username, avatar_url FROM users WHERE id = ?")
      .get(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

module.exports = authMiddleware;
