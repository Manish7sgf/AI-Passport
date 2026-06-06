const express = require("express");
const router = express.Router();
const TimeMachineController = require("../controllers/timemachine.controller");
const authMiddleware = require("../middleware/auth");

router.post("/predict", authMiddleware, TimeMachineController.predict);
router.get("/history", authMiddleware, TimeMachineController.history);

module.exports = router;
