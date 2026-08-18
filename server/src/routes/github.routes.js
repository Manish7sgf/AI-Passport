const express = require("express");
const router = express.Router();
const GitHubController = require("../controllers/github.controller");
const authMiddleware = require("../middleware/auth");

router.post("/sync",   authMiddleware, GitHubController.syncRepos);
router.get("/status",  authMiddleware, GitHubController.getSyncStatus);

module.exports = router;
