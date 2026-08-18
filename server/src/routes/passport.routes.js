const express = require("express");
const router = express.Router();
const PassportController = require("../controllers/passport.controller");
const authMiddleware = require("../middleware/auth");

router.get("/:userId", authMiddleware, PassportController.getPassport);
router.put("/:userId", authMiddleware, PassportController.updatePassport);
router.get("/:userId/score", authMiddleware, PassportController.getScore);

module.exports = router;
