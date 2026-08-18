const express = require("express");
const router = express.Router();
const RadarController = require("../controllers/radar.controller");
const authMiddleware = require("../middleware/auth");

router.post("/analyse", authMiddleware, RadarController.analyse);
router.get("/latest", authMiddleware, RadarController.latest);

module.exports = router;
