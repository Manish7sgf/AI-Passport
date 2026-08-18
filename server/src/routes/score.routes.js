const express = require("express");
const router = express.Router();
const ScoreController = require("../controllers/score.controller");
const authMiddleware = require("../middleware/auth");

router.get("/:userId", authMiddleware, ScoreController.getScore);
router.post("/recalculate", authMiddleware, ScoreController.recalculate);

module.exports = router;
